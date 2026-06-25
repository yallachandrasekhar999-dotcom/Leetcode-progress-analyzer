from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..planner import generate_study_plan
from ..leetcode_api import get_mock_topic_stats

router = APIRouter(prefix="/api/planner", tags=["Planner"])


@router.post("/generate", response_model=schemas.StudyPlanOut)
def create_study_plan(body: schemas.StudyPlanRequest, db: Session = Depends(get_db)):
    """Generate a personalized study plan."""
    db_user = db.query(models.User).filter(models.User.username == body.username).first()

    if db_user:
        topic_stats = (
            db.query(models.TopicStats)
            .filter(models.TopicStats.user_id == db_user.id)
            .all()
        )
        topic_list = [
            {"topic_slug": ts.topic_slug, "solved_count": ts.solved_count, "total_count": ts.total_count}
            for ts in topic_stats
        ]
    else:
        topic_list = get_mock_topic_stats(body.username)

    plan_data = generate_study_plan(
        username=body.username,
        topic_stats=topic_list,
        duration_days=body.duration_days,
        daily_target=body.daily_target,
        target_company=body.target_company,
        focus_topics=body.focus_topics,
        db=db,
    )

    # Save plan to DB
    if db_user:
        plan = models.StudyPlan(
            user_id=db_user.id,
            plan_name=f"{body.username}'s {body.duration_days}-Day Plan",
            duration_days=body.duration_days,
            daily_target_count=body.daily_target,
            target_company=body.target_company,
            roadmap_json=plan_data,
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)

    return schemas.StudyPlanOut(
        plan_name=f"{body.username}'s {body.duration_days}-Day Study Plan",
        duration_days=body.duration_days,
        daily_target_count=body.daily_target,
        target_company=body.target_company,
        roadmap_json=plan_data,
    )
