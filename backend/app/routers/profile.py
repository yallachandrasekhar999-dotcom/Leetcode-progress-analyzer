from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from typing import Optional
from .. import models, schemas
from ..database import get_db
from ..leetcode_api import (
    fetch_user_profile, fetch_tag_stats, fetch_calendar,
    fetch_all_parallel,
    parse_profile, parse_tag_stats, parse_calendar,
    get_mock_profile, get_mock_topic_stats, get_mock_heatmap,
    fetch_recent_submissions,
)
from ..recommender import identify_weak_topics

router = APIRouter(prefix="/api/profile", tags=["Profile"])


@router.get("/{username}/calendar")
async def get_profile_calendar(username: str, year: Optional[int] = None):
    """Fetch calendar data only for a specific year (much faster)."""
    cal_data = await fetch_calendar(username, year)
    if cal_data:
        _, heatmap, active_years = parse_calendar(cal_data)
        active_years = sorted(active_years, reverse=True)
        return {"heatmap": heatmap, "active_years": active_years}
    else:
        return {
            "heatmap": get_mock_heatmap(),
            "active_years": [2026, 2025, 2024],
        }


@router.get("/{username}", response_model=schemas.AnalyticsResponse)
async def get_profile(username: str, year: Optional[int] = None, tz_offset: int = None, db: Session = Depends(get_db)):
    """Fetch and return full analytics for a LeetCode user."""
    # Fetch profile, tag stats, and calendar ALL IN PARALLEL — ~3× faster
    profile_data, tag_data, cal_data = await fetch_all_parallel(username, year)
    parsed = parse_profile(profile_data) if profile_data else None

    if not parsed:
        # Fallback to mock data
        parsed = get_mock_profile(username)
        mock_mode = True
        tag_data = None
        cal_data = None
    else:
        mock_mode = False

    # Parse tag stats
    if tag_data:
        topic_stats_raw = parse_tag_stats(tag_data)
    else:
        topic_stats_raw = get_mock_topic_stats(username)

    # Parse calendar
    active_years = []
    if cal_data:
        streak, heatmap, active_years = parse_calendar(cal_data)
        parsed["streak"] = streak
        
        # Calculate timezone-aware streak using recent submissions
        if tz_offset is not None:
            try:
                recent_subs_data = await fetch_recent_submissions(username, limit=50)
                if recent_subs_data:
                    subs = recent_subs_data.get("recentAcSubmissionList", [])
                    # tz_offset in JS is in minutes, e.g. -330 for UTC+5:30
                    offset_minutes = -tz_offset
                    local_tz = timezone(timedelta(minutes=offset_minutes))
                    
                    local_dates = set()
                    for sub in subs:
                        ts = int(sub["timestamp"])
                        dt = datetime.fromtimestamp(ts, local_tz)
                        local_dates.add(dt.date())
                        
                    today = datetime.now(local_tz).date()
                    yesterday = today - timedelta(days=1)
                    
                    local_streak = 0
                    if today in local_dates or yesterday in local_dates:
                        check_date = today if today in local_dates else yesterday
                        while check_date in local_dates:
                            local_streak += 1
                            check_date -= timedelta(days=1)
                            
                    parsed["streak"] = local_streak
            except Exception:
                pass
    else:
        heatmap = get_mock_heatmap()
        active_years = [2026, 2025, 2024]
        if "streak" not in parsed:
            parsed["streak"] = 0
            
    active_years = sorted(active_years, reverse=True)

    # Upsert user in DB
    db_user = db.query(models.User).filter(models.User.username == username).first()
    if not db_user:
        db_user = models.User(username=username)
        db.add(db_user)

    for key, value in parsed.items():
        if hasattr(db_user, key):
            setattr(db_user, key, value)
    db_user.last_updated = datetime.utcnow()
    db.commit()
    db.refresh(db_user)

    # Upsert topic stats
    for ts in topic_stats_raw:
        existing = (
            db.query(models.TopicStats)
            .filter(
                models.TopicStats.user_id == db_user.id,
                models.TopicStats.topic_slug == ts["topic_slug"],
            )
            .first()
        )
        if existing:
            existing.solved_count = ts["solved_count"]
        else:
            db.add(models.TopicStats(user_id=db_user.id, **ts))
    db.commit()

    # Record daily snapshot
    today = datetime.utcnow().strftime("%Y-%m-%d")
    existing_daily = (
        db.query(models.DailyStats)
        .filter(
            models.DailyStats.user_id == db_user.id,
            models.DailyStats.date == today,
        )
        .first()
    )
    if not existing_daily:
        db.add(
            models.DailyStats(
                user_id=db_user.id,
                date=today,
                easy_solved=db_user.easy_solved,
                medium_solved=db_user.medium_solved,
                hard_solved=db_user.hard_solved,
                total_solved=db_user.total_solved,
            )
        )
        db.commit()

    # Identify weak topics
    weak_topics = identify_weak_topics(topic_stats_raw)

    # Build daily stats history
    history = (
        db.query(models.DailyStats)
        .filter(models.DailyStats.user_id == db_user.id)
        .order_by(models.DailyStats.date)
        .all()
    )

    return schemas.AnalyticsResponse(
        profile=schemas.UserProfile.model_validate(db_user),
        topic_stats=[schemas.TopicStat(**t) for t in topic_stats_raw],
        weak_topics=weak_topics,
        heatmap=[schemas.HeatmapData(**h) for h in heatmap],
        daily_stats=[
            schemas.DailyStat(
                date=d.date,
                easy_solved=d.easy_solved,
                medium_solved=d.medium_solved,
                hard_solved=d.hard_solved,
                total_solved=d.total_solved,
            )
            for d in history
        ],
        active_years=active_years,
    )
