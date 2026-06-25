from typing import List, Optional
from sqlalchemy.orm import Session
from . import models

CORE_TOPICS = [
    "array", "string", "linked-list", "tree", "graph",
    "dynamic-programming", "greedy", "backtracking",
    "heap-priority-queue", "stack", "queue", "binary-search",
    "two-pointers", "sliding-window", "depth-first-search",
    "breadth-first-search", "hash-table", "sorting",
]

TOPIC_TOTAL_ESTIMATES = {
    "array": 500, "string": 300, "linked-list": 100, "tree": 180,
    "graph": 150, "dynamic-programming": 350, "greedy": 200,
    "backtracking": 80, "heap-priority-queue": 90, "stack": 100,
    "queue": 60, "binary-search": 150, "two-pointers": 120,
    "sliding-window": 80, "depth-first-search": 160,
    "breadth-first-search": 100, "hash-table": 220, "sorting": 140,
}


def identify_weak_topics(topic_stats: list, threshold_pct: float = 25.0) -> List[str]:
    """
    Identify weak topics where the user's solved percentage is below threshold.
    Returns slugs of weak topics sorted by urgency (lowest % first).
    """
    weak = []
    for t in topic_stats:
        slug = t.get("topic_slug") or (t.topic_slug if hasattr(t, "topic_slug") else "")
        solved = t.get("solved_count") if isinstance(t, dict) else t.solved_count
        total = TOPIC_TOTAL_ESTIMATES.get(slug, 100)
        pct = (solved / total) * 100 if total > 0 else 0
        if pct < threshold_pct and slug in CORE_TOPICS:
            weak.append((slug, pct))

    # sort weakest first
    weak.sort(key=lambda x: x[1])
    return [slug for slug, _ in weak]


def get_recommendations(
    db: Session,
    weak_topics: List[str],
    company: Optional[str] = None,
    difficulty: Optional[str] = None,
    limit: int = 20,
) -> List[models.Problem]:
    """
    Recommend problems from DB filtered by weak topics, company, and difficulty.
    """
    query = db.query(models.Problem)

    if weak_topics:
        query = query.filter(models.Problem.topic.in_(weak_topics))

    if difficulty:
        query = query.filter(models.Problem.difficulty == difficulty)

    if company:
        all_problems = query.all()
        filtered = [p for p in all_problems if company in (p.companies or [])]
        return filtered[:limit]

    return query.limit(limit).all()


def get_all_recommendations_by_company(
    db: Session,
    company: str,
    limit: int = 30,
) -> List[models.Problem]:
    """Get all problems tagged with a specific company."""
    all_probs = db.query(models.Problem).all()
    filtered = [p for p in all_probs if company in (p.companies or [])]
    return filtered[:limit]
