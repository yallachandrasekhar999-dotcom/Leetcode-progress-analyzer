from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..leetcode_api import (
    fetch_user_profile, fetch_tag_stats, parse_profile,
    parse_tag_stats, get_mock_profile, get_mock_topic_stats,
)

router = APIRouter(prefix="/api/compare", tags=["Compare"])


@router.post("/", response_model=schemas.CompareResult)
async def compare_users(body: schemas.CompareRequest, db: Session = Depends(get_db)):
    """Compare two LeetCode users side by side."""

    async def get_user_data(username: str):
        profile_data = await fetch_user_profile(username)
        parsed = parse_profile(profile_data) if profile_data else None
        if not parsed:
            parsed = get_mock_profile(username)

        tag_data = await fetch_tag_stats(username)
        topic_stats = parse_tag_stats(tag_data) if tag_data else get_mock_topic_stats(username)

        # Store in DB
        db_user = db.query(models.User).filter(models.User.username == username).first()
        if not db_user:
            db_user = models.User(username=username)
            db.add(db_user)
        for key, value in parsed.items():
            if hasattr(db_user, key):
                setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)

        return db_user, topic_stats

    user1, topics1 = await get_user_data(body.username1)
    user2, topics2 = await get_user_data(body.username2)

    return schemas.CompareResult(
        user1=schemas.UserProfile.model_validate(user1),
        user2=schemas.UserProfile.model_validate(user2),
        user1_topics=[schemas.TopicStat(**t) for t in topics1],
        user2_topics=[schemas.TopicStat(**t) for t in topics2],
    )
