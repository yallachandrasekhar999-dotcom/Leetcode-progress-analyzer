from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from .. import models, schemas
from ..database import get_db
from ..recommender import identify_weak_topics, get_recommendations, get_all_recommendations_by_company

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.get("/{username}", response_model=List[schemas.ProblemOut])
def get_user_recommendations(
    username: str,
    company: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    limit: int = Query(20, le=50),
    db: Session = Depends(get_db),
):
    """Get personalized problem recommendations based on weak topics."""
    # Get user's topic stats
    db_user = db.query(models.User).filter(models.User.username == username).first()
    if not db_user:
        # Return company-based recommendations if no user data
        if company:
            return get_all_recommendations_by_company(db, company, limit)
        return db.query(models.Problem).limit(limit).all()

    topic_stats = (
        db.query(models.TopicStats)
        .filter(models.TopicStats.user_id == db_user.id)
        .all()
    )

    topic_dicts = [
        {
            "topic_slug": ts.topic_slug,
            "solved_count": ts.solved_count,
            "total_count": ts.total_count,
        }
        for ts in topic_stats
    ]

    weak_topics = identify_weak_topics(topic_dicts)

    return get_recommendations(db, weak_topics, company, difficulty, limit)


@router.get("/company/{company}", response_model=List[schemas.ProblemOut])
def get_company_problems(
    company: str,
    difficulty: Optional[str] = Query(None),
    limit: int = Query(20, le=50),
    db: Session = Depends(get_db),
):
    """Get all problems tagged with a specific company."""
    all_probs = db.query(models.Problem).all()
    filtered = [p for p in all_probs if company in (p.companies or [])]
    if difficulty:
        filtered = [p for p in filtered if p.difficulty == difficulty]
    return filtered[:limit]
