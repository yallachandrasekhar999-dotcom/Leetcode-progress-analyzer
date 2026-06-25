from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from . import models
from .recommender import identify_weak_topics, CORE_TOPICS
import random

COMPANY_FOCUS_TOPICS = {
    "Google": ["array", "dynamic-programming", "graph", "string", "tree"],
    "Amazon": ["tree", "array", "linked-list", "dynamic-programming", "design"],
    "Microsoft": ["tree", "graph", "dynamic-programming", "string", "array"],
    "Meta": ["array", "dynamic-programming", "two-pointers", "sliding-window", "graph"],
}

DIFFICULTY_SCHEDULE = {
    7:  {"Easy": 0.5, "Medium": 0.4, "Hard": 0.1},
    14: {"Easy": 0.4, "Medium": 0.45, "Hard": 0.15},
    30: {"Easy": 0.3, "Medium": 0.5, "Hard": 0.2},
}

# Real LeetCode problems per topic and difficulty
PROBLEM_BANK: Dict[str, Dict[str, List[Dict]]] = {
    "array": {
        "Easy": [
            {"title": "Two Sum", "link": "https://leetcode.com/problems/two-sum/"},
            {"title": "Best Time to Buy and Sell Stock", "link": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/"},
            {"title": "Contains Duplicate", "link": "https://leetcode.com/problems/contains-duplicate/"},
            {"title": "Move Zeroes", "link": "https://leetcode.com/problems/move-zeroes/"},
            {"title": "Running Sum of 1d Array", "link": "https://leetcode.com/problems/running-sum-of-1d-array/"},
            {"title": "Majority Element", "link": "https://leetcode.com/problems/majority-element/"},
        ],
        "Medium": [
            {"title": "3Sum", "link": "https://leetcode.com/problems/3sum/"},
            {"title": "Product of Array Except Self", "link": "https://leetcode.com/problems/product-of-array-except-self/"},
            {"title": "Maximum Subarray", "link": "https://leetcode.com/problems/maximum-subarray/"},
            {"title": "Rotate Array", "link": "https://leetcode.com/problems/rotate-array/"},
            {"title": "Subarray Sum Equals K", "link": "https://leetcode.com/problems/subarray-sum-equals-k/"},
            {"title": "Jump Game", "link": "https://leetcode.com/problems/jump-game/"},
        ],
        "Hard": [
            {"title": "Trapping Rain Water", "link": "https://leetcode.com/problems/trapping-rain-water/"},
            {"title": "First Missing Positive", "link": "https://leetcode.com/problems/first-missing-positive/"},
            {"title": "Median of Two Sorted Arrays", "link": "https://leetcode.com/problems/median-of-two-sorted-arrays/"},
        ],
    },
    "string": {
        "Easy": [
            {"title": "Valid Anagram", "link": "https://leetcode.com/problems/valid-anagram/"},
            {"title": "Valid Palindrome", "link": "https://leetcode.com/problems/valid-palindrome/"},
            {"title": "Longest Common Prefix", "link": "https://leetcode.com/problems/longest-common-prefix/"},
            {"title": "Reverse String", "link": "https://leetcode.com/problems/reverse-string/"},
            {"title": "First Unique Character in a String", "link": "https://leetcode.com/problems/first-unique-character-in-a-string/"},
        ],
        "Medium": [
            {"title": "Longest Substring Without Repeating Characters", "link": "https://leetcode.com/problems/longest-substring-without-repeating-characters/"},
            {"title": "Group Anagrams", "link": "https://leetcode.com/problems/group-anagrams/"},
            {"title": "Longest Palindromic Substring", "link": "https://leetcode.com/problems/longest-palindromic-substring/"},
            {"title": "String to Integer (atoi)", "link": "https://leetcode.com/problems/string-to-integer-atoi/"},
            {"title": "Decode Ways", "link": "https://leetcode.com/problems/decode-ways/"},
        ],
        "Hard": [
            {"title": "Minimum Window Substring", "link": "https://leetcode.com/problems/minimum-window-substring/"},
            {"title": "Regular Expression Matching", "link": "https://leetcode.com/problems/regular-expression-matching/"},
            {"title": "Wildcard Matching", "link": "https://leetcode.com/problems/wildcard-matching/"},
        ],
    },
    "linked-list": {
        "Easy": [
            {"title": "Reverse Linked List", "link": "https://leetcode.com/problems/reverse-linked-list/"},
            {"title": "Merge Two Sorted Lists", "link": "https://leetcode.com/problems/merge-two-sorted-lists/"},
            {"title": "Linked List Cycle", "link": "https://leetcode.com/problems/linked-list-cycle/"},
            {"title": "Palindrome Linked List", "link": "https://leetcode.com/problems/palindrome-linked-list/"},
            {"title": "Remove Duplicates from Sorted List", "link": "https://leetcode.com/problems/remove-duplicates-from-sorted-list/"},
        ],
        "Medium": [
            {"title": "Add Two Numbers", "link": "https://leetcode.com/problems/add-two-numbers/"},
            {"title": "Remove Nth Node From End of List", "link": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/"},
            {"title": "Reorder List", "link": "https://leetcode.com/problems/reorder-list/"},
            {"title": "LRU Cache", "link": "https://leetcode.com/problems/lru-cache/"},
            {"title": "Sort List", "link": "https://leetcode.com/problems/sort-list/"},
        ],
        "Hard": [
            {"title": "Merge K Sorted Lists", "link": "https://leetcode.com/problems/merge-k-sorted-lists/"},
            {"title": "Reverse Nodes in K-Group", "link": "https://leetcode.com/problems/reverse-nodes-in-k-group/"},
        ],
    },
    "tree": {
        "Easy": [
            {"title": "Maximum Depth of Binary Tree", "link": "https://leetcode.com/problems/maximum-depth-of-binary-tree/"},
            {"title": "Same Tree", "link": "https://leetcode.com/problems/same-tree/"},
            {"title": "Invert Binary Tree", "link": "https://leetcode.com/problems/invert-binary-tree/"},
            {"title": "Symmetric Tree", "link": "https://leetcode.com/problems/symmetric-tree/"},
            {"title": "Path Sum", "link": "https://leetcode.com/problems/path-sum/"},
        ],
        "Medium": [
            {"title": "Binary Tree Level Order Traversal", "link": "https://leetcode.com/problems/binary-tree-level-order-traversal/"},
            {"title": "Validate Binary Search Tree", "link": "https://leetcode.com/problems/validate-binary-search-tree/"},
            {"title": "Lowest Common Ancestor of BST", "link": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/"},
            {"title": "Binary Tree Right Side View", "link": "https://leetcode.com/problems/binary-tree-right-side-view/"},
            {"title": "Construct Binary Tree from Preorder and Inorder", "link": "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/"},
        ],
        "Hard": [
            {"title": "Binary Tree Maximum Path Sum", "link": "https://leetcode.com/problems/binary-tree-maximum-path-sum/"},
            {"title": "Serialize and Deserialize Binary Tree", "link": "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/"},
        ],
    },
    "graph": {
        "Easy": [
            {"title": "Find if Path Exists in Graph", "link": "https://leetcode.com/problems/find-if-path-exists-in-graph/"},
            {"title": "Flood Fill", "link": "https://leetcode.com/problems/flood-fill/"},
        ],
        "Medium": [
            {"title": "Number of Islands", "link": "https://leetcode.com/problems/number-of-islands/"},
            {"title": "Clone Graph", "link": "https://leetcode.com/problems/clone-graph/"},
            {"title": "Course Schedule", "link": "https://leetcode.com/problems/course-schedule/"},
            {"title": "Pacific Atlantic Water Flow", "link": "https://leetcode.com/problems/pacific-atlantic-water-flow/"},
            {"title": "Rotting Oranges", "link": "https://leetcode.com/problems/rotting-oranges/"},
            {"title": "Graph Valid Tree", "link": "https://leetcode.com/problems/graph-valid-tree/"},
        ],
        "Hard": [
            {"title": "Word Ladder", "link": "https://leetcode.com/problems/word-ladder/"},
            {"title": "Alien Dictionary", "link": "https://leetcode.com/problems/alien-dictionary/"},
            {"title": "Dijkstra's Shortest Path", "link": "https://leetcode.com/problems/network-delay-time/"},
        ],
    },
    "dynamic-programming": {
        "Easy": [
            {"title": "Climbing Stairs", "link": "https://leetcode.com/problems/climbing-stairs/"},
            {"title": "House Robber", "link": "https://leetcode.com/problems/house-robber/"},
            {"title": "Pascal's Triangle", "link": "https://leetcode.com/problems/pascals-triangle/"},
            {"title": "Min Cost Climbing Stairs", "link": "https://leetcode.com/problems/min-cost-climbing-stairs/"},
        ],
        "Medium": [
            {"title": "Coin Change", "link": "https://leetcode.com/problems/coin-change/"},
            {"title": "Longest Increasing Subsequence", "link": "https://leetcode.com/problems/longest-increasing-subsequence/"},
            {"title": "0-1 Knapsack / Partition Equal Subset Sum", "link": "https://leetcode.com/problems/partition-equal-subset-sum/"},
            {"title": "Unique Paths", "link": "https://leetcode.com/problems/unique-paths/"},
            {"title": "Word Break", "link": "https://leetcode.com/problems/word-break/"},
            {"title": "House Robber II", "link": "https://leetcode.com/problems/house-robber-ii/"},
        ],
        "Hard": [
            {"title": "Edit Distance", "link": "https://leetcode.com/problems/edit-distance/"},
            {"title": "Burst Balloons", "link": "https://leetcode.com/problems/burst-balloons/"},
            {"title": "Longest Common Subsequence (Hard variant)", "link": "https://leetcode.com/problems/longest-common-subsequence/"},
        ],
    },
    "binary-search": {
        "Easy": [
            {"title": "Binary Search", "link": "https://leetcode.com/problems/binary-search/"},
            {"title": "Search Insert Position", "link": "https://leetcode.com/problems/search-insert-position/"},
            {"title": "First Bad Version", "link": "https://leetcode.com/problems/first-bad-version/"},
        ],
        "Medium": [
            {"title": "Search in Rotated Sorted Array", "link": "https://leetcode.com/problems/search-in-rotated-sorted-array/"},
            {"title": "Find Minimum in Rotated Sorted Array", "link": "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/"},
            {"title": "Time-Based Key-Value Store", "link": "https://leetcode.com/problems/time-based-key-value-store/"},
            {"title": "Koko Eating Bananas", "link": "https://leetcode.com/problems/koko-eating-bananas/"},
        ],
        "Hard": [
            {"title": "Median of Two Sorted Arrays", "link": "https://leetcode.com/problems/median-of-two-sorted-arrays/"},
        ],
    },
    "two-pointers": {
        "Easy": [
            {"title": "Valid Palindrome", "link": "https://leetcode.com/problems/valid-palindrome/"},
            {"title": "Squares of a Sorted Array", "link": "https://leetcode.com/problems/squares-of-a-sorted-array/"},
        ],
        "Medium": [
            {"title": "3Sum", "link": "https://leetcode.com/problems/3sum/"},
            {"title": "Container With Most Water", "link": "https://leetcode.com/problems/container-with-most-water/"},
            {"title": "Remove Duplicates from Sorted Array II", "link": "https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/"},
            {"title": "Sort Colors", "link": "https://leetcode.com/problems/sort-colors/"},
        ],
        "Hard": [
            {"title": "Trapping Rain Water", "link": "https://leetcode.com/problems/trapping-rain-water/"},
        ],
    },
    "sliding-window": {
        "Easy": [
            {"title": "Maximum Average Subarray I", "link": "https://leetcode.com/problems/maximum-average-subarray-i/"},
        ],
        "Medium": [
            {"title": "Longest Substring Without Repeating Characters", "link": "https://leetcode.com/problems/longest-substring-without-repeating-characters/"},
            {"title": "Permutation in String", "link": "https://leetcode.com/problems/permutation-in-string/"},
            {"title": "Longest Repeating Character Replacement", "link": "https://leetcode.com/problems/longest-repeating-character-replacement/"},
            {"title": "Fruit Into Baskets", "link": "https://leetcode.com/problems/fruit-into-baskets/"},
        ],
        "Hard": [
            {"title": "Minimum Window Substring", "link": "https://leetcode.com/problems/minimum-window-substring/"},
            {"title": "Sliding Window Maximum", "link": "https://leetcode.com/problems/sliding-window-maximum/"},
        ],
    },
    "stack": {
        "Easy": [
            {"title": "Valid Parentheses", "link": "https://leetcode.com/problems/valid-parentheses/"},
            {"title": "Min Stack", "link": "https://leetcode.com/problems/min-stack/"},
        ],
        "Medium": [
            {"title": "Daily Temperatures", "link": "https://leetcode.com/problems/daily-temperatures/"},
            {"title": "Evaluate Reverse Polish Notation", "link": "https://leetcode.com/problems/evaluate-reverse-polish-notation/"},
            {"title": "Car Fleet", "link": "https://leetcode.com/problems/car-fleet/"},
            {"title": "Largest Rectangle in Histogram", "link": "https://leetcode.com/problems/largest-rectangle-in-histogram/"},
        ],
        "Hard": [
            {"title": "Largest Rectangle in Histogram", "link": "https://leetcode.com/problems/largest-rectangle-in-histogram/"},
        ],
    },
    "heap-priority-queue": {
        "Easy": [
            {"title": "Last Stone Weight", "link": "https://leetcode.com/problems/last-stone-weight/"},
            {"title": "Kth Largest Element in a Stream", "link": "https://leetcode.com/problems/kth-largest-element-in-a-stream/"},
        ],
        "Medium": [
            {"title": "Kth Largest Element in an Array", "link": "https://leetcode.com/problems/kth-largest-element-in-an-array/"},
            {"title": "Task Scheduler", "link": "https://leetcode.com/problems/task-scheduler/"},
            {"title": "K Closest Points to Origin", "link": "https://leetcode.com/problems/k-closest-points-to-origin/"},
            {"title": "Top K Frequent Elements", "link": "https://leetcode.com/problems/top-k-frequent-elements/"},
        ],
        "Hard": [
            {"title": "Find Median from Data Stream", "link": "https://leetcode.com/problems/find-median-from-data-stream/"},
        ],
    },
    "backtracking": {
        "Easy": [
            {"title": "Letter Case Permutation", "link": "https://leetcode.com/problems/letter-case-permutation/"},
        ],
        "Medium": [
            {"title": "Subsets", "link": "https://leetcode.com/problems/subsets/"},
            {"title": "Permutations", "link": "https://leetcode.com/problems/permutations/"},
            {"title": "Combination Sum", "link": "https://leetcode.com/problems/combination-sum/"},
            {"title": "Word Search", "link": "https://leetcode.com/problems/word-search/"},
        ],
        "Hard": [
            {"title": "N-Queens", "link": "https://leetcode.com/problems/n-queens/"},
            {"title": "Sudoku Solver", "link": "https://leetcode.com/problems/sudoku-solver/"},
        ],
    },
    "hash-table": {
        "Easy": [
            {"title": "Two Sum", "link": "https://leetcode.com/problems/two-sum/"},
            {"title": "Valid Anagram", "link": "https://leetcode.com/problems/valid-anagram/"},
            {"title": "Ransom Note", "link": "https://leetcode.com/problems/ransom-note/"},
        ],
        "Medium": [
            {"title": "Group Anagrams", "link": "https://leetcode.com/problems/group-anagrams/"},
            {"title": "Top K Frequent Elements", "link": "https://leetcode.com/problems/top-k-frequent-elements/"},
            {"title": "Longest Consecutive Sequence", "link": "https://leetcode.com/problems/longest-consecutive-sequence/"},
        ],
        "Hard": [
            {"title": "Subarrays with K Different Integers", "link": "https://leetcode.com/problems/subarrays-with-k-different-integers/"},
        ],
    },
    "greedy": {
        "Easy": [
            {"title": "Assign Cookies", "link": "https://leetcode.com/problems/assign-cookies/"},
            {"title": "Lemonade Change", "link": "https://leetcode.com/problems/lemonade-change/"},
        ],
        "Medium": [
            {"title": "Jump Game", "link": "https://leetcode.com/problems/jump-game/"},
            {"title": "Jump Game II", "link": "https://leetcode.com/problems/jump-game-ii/"},
            {"title": "Gas Station", "link": "https://leetcode.com/problems/gas-station/"},
            {"title": "Hand of Straights", "link": "https://leetcode.com/problems/hand-of-straights/"},
        ],
        "Hard": [
            {"title": "Candy", "link": "https://leetcode.com/problems/candy/"},
        ],
    },
    "sorting": {
        "Easy": [
            {"title": "Merge Sorted Array", "link": "https://leetcode.com/problems/merge-sorted-array/"},
            {"title": "Sort Array By Parity", "link": "https://leetcode.com/problems/sort-array-by-parity/"},
        ],
        "Medium": [
            {"title": "Sort Colors", "link": "https://leetcode.com/problems/sort-colors/"},
            {"title": "Merge Intervals", "link": "https://leetcode.com/problems/merge-intervals/"},
            {"title": "Largest Number", "link": "https://leetcode.com/problems/largest-number/"},
        ],
        "Hard": [
            {"title": "Count of Smaller Numbers After Self", "link": "https://leetcode.com/problems/count-of-smaller-numbers-after-self/"},
        ],
    },
    "math": {
        "Easy": [
            {"title": "Palindrome Number", "link": "https://leetcode.com/problems/palindrome-number/"},
            {"title": "Reverse Integer", "link": "https://leetcode.com/problems/reverse-integer/"},
            {"title": "Power of Two", "link": "https://leetcode.com/problems/power-of-two/"},
        ],
        "Medium": [
            {"title": "Pow(x, n)", "link": "https://leetcode.com/problems/powx-n/"},
            {"title": "Happy Number", "link": "https://leetcode.com/problems/happy-number/"},
            {"title": "Missing Number", "link": "https://leetcode.com/problems/missing-number/"},
        ],
        "Hard": [
            {"title": "Integer to English Words", "link": "https://leetcode.com/problems/integer-to-english-words/"},
        ],
    },
    "depth-first-search": {
        "Easy": [
            {"title": "Flood Fill", "link": "https://leetcode.com/problems/flood-fill/"},
            {"title": "Path Sum", "link": "https://leetcode.com/problems/path-sum/"},
        ],
        "Medium": [
            {"title": "Number of Islands", "link": "https://leetcode.com/problems/number-of-islands/"},
            {"title": "Clone Graph", "link": "https://leetcode.com/problems/clone-graph/"},
            {"title": "Max Area of Island", "link": "https://leetcode.com/problems/max-area-of-island/"},
            {"title": "Path Sum II", "link": "https://leetcode.com/problems/path-sum-ii/"},
        ],
        "Hard": [
            {"title": "Word Search II", "link": "https://leetcode.com/problems/word-search-ii/"},
        ],
    },
    "breadth-first-search": {
        "Easy": [
            {"title": "Binary Tree Level Order Traversal", "link": "https://leetcode.com/problems/binary-tree-level-order-traversal/"},
            {"title": "Maximum Depth of Binary Tree", "link": "https://leetcode.com/problems/maximum-depth-of-binary-tree/"},
        ],
        "Medium": [
            {"title": "Rotting Oranges", "link": "https://leetcode.com/problems/rotting-oranges/"},
            {"title": "01 Matrix", "link": "https://leetcode.com/problems/01-matrix/"},
            {"title": "Walls and Gates", "link": "https://leetcode.com/problems/walls-and-gates/"},
            {"title": "Word Ladder", "link": "https://leetcode.com/problems/word-ladder/"},
        ],
        "Hard": [
            {"title": "Word Ladder II", "link": "https://leetcode.com/problems/word-ladder-ii/"},
        ],
    },
    "design": {
        "Easy": [
            {"title": "Design Parking System", "link": "https://leetcode.com/problems/design-parking-system/"},
        ],
        "Medium": [
            {"title": "LRU Cache", "link": "https://leetcode.com/problems/lru-cache/"},
            {"title": "Design Add and Search Words Data Structure", "link": "https://leetcode.com/problems/design-add-and-search-words-data-structure/"},
            {"title": "Implement Trie", "link": "https://leetcode.com/problems/implement-trie-prefix-tree/"},
            {"title": "Time-Based Key-Value Store", "link": "https://leetcode.com/problems/time-based-key-value-store/"},
        ],
        "Hard": [
            {"title": "Design Search Autocomplete System", "link": "https://leetcode.com/problems/design-search-autocomplete-system/"},
        ],
    },
}

_USED_PROBLEMS: Dict[str, set] = {}


def _pick_problem(topic: str, difficulty: str, session_key: str) -> Dict:
    """Pick a unique problem for a given topic and difficulty within the plan session."""
    pool = PROBLEM_BANK.get(topic, {}).get(difficulty, [])
    fallback_pool = [
        {"title": f"{topic.replace('-', ' ').title()} – {difficulty} Practice",
         "link": f"https://leetcode.com/tag/{topic}/"}
    ]
    if not pool:
        pool = fallback_pool

    key = f"{session_key}:{topic}:{difficulty}"
    used = _USED_PROBLEMS.setdefault(key, set())
    available = [p for p in pool if p["title"] not in used]
    if not available:
        used.clear()
        available = pool
    chosen = random.choice(available)
    used.add(chosen["title"])
    return {**chosen, "difficulty": difficulty, "topic": topic}


def generate_study_plan(
    username: str,
    topic_stats: list,
    duration_days: int = 30,
    daily_target: int = 3,
    target_company: Optional[str] = None,
    focus_topics: Optional[List[str]] = None,
    db: Optional[Session] = None,
) -> Dict[str, Any]:
    """
    Generate a personalized study plan with daily tasks using real LeetCode problems.
    Returns a roadmap dict with daily schedules.
    """
    weak_topics = identify_weak_topics(topic_stats)

    # Prioritize company topics if specified
    priority_topics = []
    if target_company and target_company in COMPANY_FOCUS_TOPICS:
        priority_topics = COMPANY_FOCUS_TOPICS[target_company]

    if focus_topics:
        priority_topics = list(dict.fromkeys(focus_topics + priority_topics))

    if not priority_topics:
        priority_topics = weak_topics if weak_topics else CORE_TOPICS[:8]

    # Difficulty ratios
    diff_ratio = DIFFICULTY_SCHEDULE.get(duration_days, DIFFICULTY_SCHEDULE[30])

    # Unique session key so repeated generates within same process don't collide
    import time
    session_key = f"{username}:{int(time.time())}"

    roadmap = {}
    topic_cycle = priority_topics * (duration_days // len(priority_topics) + 1)

    for day in range(1, duration_days + 1):
        day_topic = topic_cycle[day - 1]
        easy_count = max(1, round(daily_target * diff_ratio["Easy"]))
        medium_count = max(1, round(daily_target * diff_ratio["Medium"]))
        hard_count = max(0, daily_target - easy_count - medium_count)

        problems_today = []
        for _ in range(easy_count):
            problems_today.append(_pick_problem(day_topic, "Easy", session_key))
        for _ in range(medium_count):
            problems_today.append(_pick_problem(day_topic, "Medium", session_key))
        for _ in range(hard_count):
            problems_today.append(_pick_problem(day_topic, "Hard", session_key))

        problems_today = problems_today[:daily_target]

        phase = "Foundation" if day <= duration_days // 3 else (
            "Intermediate" if day <= 2 * duration_days // 3 else "Advanced"
        )

        roadmap[f"day_{day}"] = {
            "day": day,
            "phase": phase,
            "topic": day_topic,
            "topic_display": day_topic.replace("-", " ").title(),
            "problems": problems_today,
            "goal": _goal_for_topic(day_topic, phase),
            "tip": get_daily_tip(day_topic),
            "completed": False,
        }

    return {
        "username": username,
        "duration_days": duration_days,
        "daily_target": daily_target,
        "target_company": target_company,
        "weak_topics": weak_topics[:5],
        "priority_topics": priority_topics[:8],
        "roadmap": roadmap,
        "interview_tips": get_interview_tips(target_company),
    }


def _goal_for_topic(topic: str, phase: str) -> str:
    goals = {
        "Foundation": {
            "array": "Understand basic array traversal and two-pointer patterns",
            "string": "Practice string manipulation and character frequency maps",
            "linked-list": "Master pointer manipulation and edge-case handling",
            "tree": "Build confidence with DFS (in/pre/post-order) traversals",
            "graph": "Understand adjacency lists and basic BFS/DFS traversals",
            "dynamic-programming": "Identify overlapping subproblems using recursion + memoization",
            "binary-search": "Recognize sorted search spaces and write correct loop invariants",
            "two-pointers": "Use left/right pointers to reduce nested loops",
            "sliding-window": "Identify fixed vs variable window problems",
            "stack": "Understand LIFO behaviour and monotonic stack patterns",
            "heap-priority-queue": "Use heaps to find top-K elements efficiently",
            "backtracking": "Build the decision tree and apply early pruning",
            "hash-table": "Trade space for O(1) average-case lookups",
            "greedy": "Prove local optima lead to global optima",
            "sorting": "Know built-in sorts and custom comparators",
            "math": "Apply modular arithmetic and number theory basics",
            "depth-first-search": "Explore all paths using recursive DFS",
            "breadth-first-search": "Explore shortest paths layer by layer with a queue",
            "design": "Design clean APIs and think about time/space trade-offs",
        },
        "Intermediate": {
            "array": "Solve prefix-sum, sliding-window, and interval problems",
            "string": "Tackle anagram grouping and palindrome edge cases",
            "linked-list": "Practice slow/fast pointer and multi-list merging",
            "tree": "Solve BST validation, LCA, and right-side-view problems",
            "graph": "Implement topological sort and cycle detection",
            "dynamic-programming": "Convert memoization to bottom-up DP tables",
            "binary-search": "Apply binary search on the answer (not just arrays)",
            "two-pointers": "Solve 3Sum variants and partition problems",
            "sliding-window": "Handle variable-length windows with hash maps",
            "stack": "Implement monotonic stacks for next-greater-element problems",
            "heap-priority-queue": "Solve merge K lists and median-stream problems",
            "backtracking": "Solve subset, permutation and combination problems",
            "hash-table": "Group and count patterns using hash maps",
            "greedy": "Solve interval scheduling and jump game variants",
            "sorting": "Implement merge sort and solve custom-sort problems",
            "math": "Solve power, GCD/LCM, and prime factorisation problems",
            "depth-first-search": "Track visited state and handle disconnected components",
            "breadth-first-search": "Use multi-source BFS for distance problems",
            "design": "Implement LRU cache and trie data structures",
        },
        "Advanced": {
            "array": "Master hard variants: median of two arrays, maximum rectangle",
            "string": "Implement KMP, Rabin-Karp, or regex-matching algorithms",
            "linked-list": "Tackle hard problems: merge K lists, reverse in K-groups",
            "tree": "Serialize trees and find maximum path sums",
            "graph": "Implement Dijkstra's / Bellman-Ford / Union-Find algorithms",
            "dynamic-programming": "Solve hard DP: edit distance, burst balloons, regex matching",
            "binary-search": "Solve advanced problems requiring binary search on answers",
            "two-pointers": "Solve trapping rain water and advanced partition problems",
            "sliding-window": "Solve minimum window substring and hard window variants",
            "stack": "Solve the largest rectangle in histogram type problems",
            "heap-priority-queue": "Find median from data stream and solve scheduling problems",
            "backtracking": "Solve N-Queens, Sudoku Solver, and hard combination problems",
            "hash-table": "Solve hard problems with O(n) hash-based optimizations",
            "greedy": "Solve candy distribution and hard scheduling problems",
            "sorting": "Implement counting sort and solve hard custom-sort problems",
            "math": "Solve combinatorics, big-integer arithmetic problems",
            "depth-first-search": "Solve hard word search and graph coloring problems",
            "breadth-first-search": "Solve hard BFS problems: word ladder, shortest transformation",
            "design": "Design autocomplete systems and complex distributed data structures",
        },
    }
    return goals.get(phase, {}).get(topic, f"Master {topic.replace('-', ' ').title()} at {phase} level")


def get_daily_tip(topic: str) -> str:
    tips = {
        "array": "Practice two-pointer and sliding window patterns first.",
        "string": "Focus on pattern matching, anagram, and palindrome problems.",
        "linked-list": "Always handle edge cases: empty list, single node, and cycles.",
        "tree": "Master DFS (in/pre/post order) and BFS traversals.",
        "graph": "Understand adjacency list vs matrix. Practice BFS/DFS/Dijkstra.",
        "dynamic-programming": "Start with memoization, then convert to tabulation.",
        "greedy": "Prove why greedy works — sort and scan patterns are key.",
        "backtracking": "Draw the recursion tree. Prune early for efficiency.",
        "heap-priority-queue": "Use heapq in Python. Top-K problems are very common.",
        "stack": "Monotonic stack is a powerful pattern — learn it well.",
        "queue": "BFS naturally uses queues — practice level-order traversals.",
        "binary-search": "Think about what invariant you're maintaining at each step.",
        "two-pointers": "Identify if array is sorted — then consider two pointers.",
        "sliding-window": "Fixed vs variable window — decide before coding.",
        "depth-first-search": "Recursion is your friend. Track visited states carefully.",
        "breadth-first-search": "Perfect for shortest path in unweighted graphs.",
        "hash-table": "Trade space for time — O(1) lookups can simplify solutions.",
        "sorting": "Know when to use custom comparators and stable sorts.",
        "math": "Modular arithmetic and prime factorization are interview favorites.",
        "design": "Define the API contract first, then choose the data structure.",
    }
    return tips.get(topic, "Focus on understanding the pattern, not memorizing solutions.")


def get_interview_tips(company: Optional[str]) -> List[str]:
    base_tips = [
        "Always clarify the problem before coding.",
        "Talk through your approach before writing code.",
        "Write clean, modular code with meaningful variable names.",
        "Analyze time and space complexity for every solution.",
        "Test your solution with edge cases (empty input, single element, max constraints).",
    ]
    company_tips = {
        "Google": [
            "Google loves scalable solutions — always discuss trade-offs.",
            "Expect graph, DP, and system design questions.",
            "Focus on code correctness and clean abstractions.",
        ],
        "Amazon": [
            "Amazon focuses on Leadership Principles — prepare behavioral stories.",
            "Tree and array problems are very common.",
            "Optimize for real-world scalability.",
        ],
        "Microsoft": [
            "Microsoft values problem decomposition and communication.",
            "Expect medium-hard level questions on trees and graphs.",
            "Collaborative mindset is highly valued.",
        ],
        "Meta": [
            "Meta interviews focus on coding speed and correctness.",
            "Practice array, DP, and two-pointer extensively.",
            "Prepare for back-to-back coding rounds.",
        ],
    }
    if company and company in company_tips:
        return base_tips + company_tips[company]
    return base_tips
