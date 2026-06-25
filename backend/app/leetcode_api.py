import httpx
import asyncio
import time
from typing import Optional, Dict, Any

LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"

HEADERS = {
    "Content-Type": "application/json",
    "Referer": "https://leetcode.com",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
}

# --------------------------------------------------------------------------- #
#  In-memory TTL cache  (avoids hammering LeetCode on every page visit)        #
#  TTL: 5 minutes.  Max 200 entries – enough for any realistic usage.          #
# --------------------------------------------------------------------------- #
_CACHE: Dict[str, tuple] = {}   # key -> (value, expires_at)
_CACHE_TTL = 300                # seconds


def _cache_get(key: str):
    entry = _CACHE.get(key)
    if entry and entry[1] > time.monotonic():
        return entry[0]
    _CACHE.pop(key, None)
    return None


def _cache_set(key: str, value):
    # Evict oldest 50 entries if cache is getting large
    if len(_CACHE) > 200:
        oldest = sorted(_CACHE.items(), key=lambda x: x[1][1])[:50]
        for k, _ in oldest:
            _CACHE.pop(k, None)
    _CACHE[key] = (value, time.monotonic() + _CACHE_TTL)


def _cache_invalidate(prefix: str):
    """Remove all cache entries that start with `prefix`."""
    for key in list(_CACHE.keys()):
        if key.startswith(prefix):
            _CACHE.pop(key, None)


# --------------------------------------------------------------------------- #
#  GraphQL queries                                                              #
# --------------------------------------------------------------------------- #
PROFILE_QUERY = """
query getUserProfile($username: String!) {
  allQuestionsCount {
    difficulty
    count
  }
  matchedUser(username: $username) {
    username
    profile {
      realName
      userAvatar
      ranking
      reputation
    }
    submitStats: submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
        submissions
      }
      totalSubmissionNum {
        difficulty
        count
        submissions
      }
    }
  }
  userContestRanking(username: $username) {
    rating
    globalRanking
    attendedContestsCount
  }
}
"""

TAG_STATS_QUERY = """
query userSessionProgress($username: String!) {
  matchedUser(username: $username) {
    tagProblemCounts {
      advanced {
        tagName
        tagSlug
        problemsSolved
      }
      intermediate {
        tagName
        tagSlug
        problemsSolved
      }
      fundamental {
        tagName
        tagSlug
        problemsSolved
      }
    }
  }
}
"""

CALENDAR_QUERY = """
query userProfileCalendar($username: String!, $year: Int) {
  matchedUser(username: $username) {
    userCalendar(year: $year) {
      activeYears
      streak
      totalActiveDays
      submissionCalendar
    }
  }
}
"""

RECENT_SUBMISSIONS_QUERY = """
query recentAcSubmissions($username: String!, $limit: Int!) {
  recentAcSubmissionList(username: $username, limit: $limit) {
    id
    title
    titleSlug
    timestamp
  }
}
"""


# --------------------------------------------------------------------------- #
#  Shared HTTP client – reuse across requests for connection pooling            #
# --------------------------------------------------------------------------- #
async def _post_graphql(client: httpx.AsyncClient, query: str, variables: dict):
    """Helper: POST to LeetCode GraphQL, return data dict or None."""
    try:
        response = await client.post(
            LEETCODE_GRAPHQL_URL,
            json={"query": query, "variables": variables},
            headers=HEADERS,
        )
        if response.status_code != 200:
            return None
        data = response.json()
        if "errors" in data:
            return None
        return data.get("data")
    except Exception:
        return None


# --------------------------------------------------------------------------- #
#  Public fetch functions                                                       #
# --------------------------------------------------------------------------- #
async def fetch_user_profile(username: str) -> Optional[Dict[str, Any]]:
    """Fetch user profile and submission stats from LeetCode GraphQL API."""
    cache_key = f"profile:{username}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached
    async with httpx.AsyncClient(timeout=12.0) as client:
        result = await _post_graphql(client, PROFILE_QUERY, {"username": username})
    if result is not None:
        _cache_set(cache_key, result)
    return result


async def fetch_tag_stats(username: str) -> Optional[Dict[str, Any]]:
    """Fetch tag/topic-wise solved stats from LeetCode."""
    cache_key = f"tags:{username}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached
    async with httpx.AsyncClient(timeout=12.0) as client:
        result = await _post_graphql(client, TAG_STATS_QUERY, {"username": username})
    if result is not None:
        _cache_set(cache_key, result)
    return result


async def fetch_calendar(username: str, year: Optional[int] = None) -> Optional[Dict[str, Any]]:
    """Fetch user submission calendar/heatmap."""
    cache_key = f"calendar:{username}:{year}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached
    async with httpx.AsyncClient(timeout=12.0) as client:
        result = await _post_graphql(
            client, CALENDAR_QUERY, {"username": username, "year": year}
        )
    if result is not None:
        _cache_set(cache_key, result)
    return result


async def fetch_recent_submissions(
    username: str, limit: int = 10
) -> Optional[Dict[str, Any]]:
    """Fetch recent accepted submissions."""
    cache_key = f"recent:{username}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached
    async with httpx.AsyncClient(timeout=12.0) as client:
        result = await _post_graphql(
            client,
            RECENT_SUBMISSIONS_QUERY,
            {"username": username, "limit": limit},
        )
    if result is not None:
        _cache_set(cache_key, result)
    return result


async def fetch_all_parallel(
    username: str, year: Optional[int] = None
) -> tuple:
    """
    Fire profile, tag-stats, and calendar requests IN PARALLEL.
    Returns (profile_data, tag_data, cal_data) — each may be None on failure.
    Total wall-clock time ≈ slowest single request (~1–3 s) instead of sum (~5–9 s).
    """
    profile_data, tag_data, cal_data = await asyncio.gather(
        fetch_user_profile(username),
        fetch_tag_stats(username),
        fetch_calendar(username, year),
        return_exceptions=False,
    )
    return profile_data, tag_data, cal_data


# --------------------------------------------------------------------------- #
#  Parsers (unchanged logic, just consolidated here)                            #
# --------------------------------------------------------------------------- #
def parse_profile(data: Dict[str, Any]) -> Optional[Dict]:
    """Parse raw GraphQL response into a structured profile dict."""
    try:
        user = data.get("matchedUser")
        if not user:
            return None

        profile = user.get("profile", {})
        submit_stats = user.get("submitStats", {}).get("acSubmissionNum", [])
        contest = data.get("userContestRanking") or {}

        counts = {"Easy": 0, "Medium": 0, "Hard": 0, "All": 0}
        for stat in submit_stats:
            diff = stat.get("difficulty", "")
            if diff in counts:
                counts[diff] = stat.get("count", 0)

        total = counts["Easy"] + counts["Medium"] + counts["Hard"]

        all_questions_list = data.get("allQuestionsCount", [])
        total_questions = 0
        for item in all_questions_list:
            if item.get("difficulty") == "All":
                total_questions = item.get("count", 0)
                break

        total_submit_stats = user.get("submitStats", {}).get("totalSubmissionNum", [])
        ac_all_submissions = 0
        total_all_submissions = 0

        for stat in submit_stats:
            if stat.get("difficulty") == "All":
                ac_all_submissions = stat.get("submissions", 0)
                break

        for stat in total_submit_stats:
            if stat.get("difficulty") == "All":
                total_all_submissions = stat.get("submissions", 0)
                break

        acceptance_rate = 0.0
        if total_all_submissions > 0:
            acceptance_rate = round(
                (ac_all_submissions / total_all_submissions) * 100, 1
            )

        return {
            "username": user.get("username", ""),
            "real_name": profile.get("realName", ""),
            "avatar_url": profile.get("userAvatar", ""),
            "ranking": profile.get("ranking"),
            "reputation": profile.get("reputation", 0),
            "contest_rating": round(contest.get("rating", 0), 1) if contest else None,
            "contest_global_ranking": contest.get("globalRanking"),
            "total_solved": total,
            "easy_solved": counts["Easy"],
            "medium_solved": counts["Medium"],
            "hard_solved": counts["Hard"],
            "total_questions": total_questions,
            "acceptance_rate": acceptance_rate,
        }
    except Exception:
        return None


def parse_tag_stats(data: Dict[str, Any]) -> list:
    """Parse tag stats into flat list."""
    try:
        user = data.get("matchedUser")
        if not user:
            return []
        tag_counts = user.get("tagProblemCounts", {})
        result = []
        seen = set()
        for category in ["fundamental", "intermediate", "advanced"]:
            for tag in tag_counts.get(category, []):
                slug = tag.get("tagSlug", "")
                if slug not in seen:
                    seen.add(slug)
                    result.append(
                        {
                            "topic_slug": slug,
                            "topic_name": tag.get("tagName", slug),
                            "solved_count": tag.get("problemsSolved", 0),
                            "total_count": 0,
                        }
                    )
        return result
    except Exception:
        return []


def parse_calendar(data: Dict[str, Any]) -> tuple:
    """Return (streak, heatmap_list, active_years) from calendar data."""
    try:
        user = data.get("matchedUser")
        if not user:
            return 0, [], []
        cal = user.get("userCalendar", {})
        streak = cal.get("streak", 0)
        active_years = cal.get("activeYears", [])
        raw_cal = cal.get("submissionCalendar", "{}")
        import json
        calendar_dict = json.loads(raw_cal)

        from datetime import datetime, timezone
        heatmap = []
        for ts_str, count in calendar_dict.items():
            dt = datetime.fromtimestamp(int(ts_str), timezone.utc)
            heatmap.append({"date": dt.strftime("%Y-%m-%d"), "count": count})

        return streak, heatmap, active_years
    except Exception:
        return 0, [], []


# --------------------------------------------------------------------------- #
#  Mock / fallback helpers                                                      #
# --------------------------------------------------------------------------- #
def get_mock_profile(username: str) -> Dict:
    """Return mock profile data for testing/fallback."""
    import random
    easy = random.randint(50, 200)
    medium = random.randint(30, 150)
    hard = random.randint(5, 50)
    return {
        "username": username,
        "real_name": username.title(),
        "avatar_url": f"https://api.dicebear.com/7.x/initials/svg?seed={username}",
        "ranking": random.randint(10000, 500000),
        "reputation": random.randint(0, 5000),
        "contest_rating": round(random.uniform(1400, 2200), 1),
        "contest_global_ranking": random.randint(5000, 100000),
        "streak": random.randint(0, 60),
        "total_solved": easy + medium + hard,
        "easy_solved": easy,
        "medium_solved": medium,
        "hard_solved": hard,
        "total_questions": 3000,
        "acceptance_rate": round(random.uniform(40, 75), 1),
    }


def get_mock_topic_stats(username: str) -> list:
    """Return mock topic stats."""
    import random
    topics = [
        ("array", "Array"), ("string", "String"), ("linked-list", "Linked List"),
        ("tree", "Tree"), ("graph", "Graph"), ("dynamic-programming", "Dynamic Programming"),
        ("greedy", "Greedy"), ("backtracking", "Backtracking"), ("heap-priority-queue", "Heap"),
        ("stack", "Stack"), ("queue", "Queue"), ("binary-search", "Binary Search"),
        ("two-pointers", "Two Pointers"), ("sliding-window", "Sliding Window"),
        ("depth-first-search", "DFS"), ("breadth-first-search", "BFS"),
        ("hash-table", "Hash Table"), ("sorting", "Sorting"),
        ("math", "Math"), ("bit-manipulation", "Bit Manipulation"),
    ]
    result = []
    for slug, name in topics:
        solved = random.randint(2, 80)
        total = solved + random.randint(10, 100)
        result.append({
            "topic_slug": slug,
            "topic_name": name,
            "solved_count": solved,
            "total_count": total,
        })
    return result


def get_mock_heatmap() -> list:
    """Return mock heatmap data for the past year."""
    import random
    from datetime import date, timedelta

    result = []
    today = date.today()
    for i in range(365):
        d = today - timedelta(days=i)
        if random.random() > 0.45:
            count = random.choices([1, 2, 3, 4, 5, 8], weights=[30, 25, 20, 15, 7, 3])[0]
            result.append({"date": d.isoformat(), "count": count})
        else:
            result.append({"date": d.isoformat(), "count": 0})
    return result
