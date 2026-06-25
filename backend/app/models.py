from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    real_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    ranking = Column(Integer, nullable=True)
    reputation = Column(Integer, default=0)
    contest_rating = Column(Float, nullable=True)
    contest_global_ranking = Column(Integer, nullable=True)
    streak = Column(Integer, default=0)
    total_solved = Column(Integer, default=0)
    easy_solved = Column(Integer, default=0)
    medium_solved = Column(Integer, default=0)
    hard_solved = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    acceptance_rate = Column(Float, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow)

    daily_stats = relationship("DailyStats", back_populates="user")
    topic_stats = relationship("TopicStats", back_populates="user")
    study_plans = relationship("StudyPlan", back_populates="user")


class DailyStats(Base):
    __tablename__ = "daily_stats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(String, nullable=False)
    easy_solved = Column(Integer, default=0)
    medium_solved = Column(Integer, default=0)
    hard_solved = Column(Integer, default=0)
    total_solved = Column(Integer, default=0)

    user = relationship("User", back_populates="daily_stats")


class TopicStats(Base):
    __tablename__ = "topic_stats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    topic_slug = Column(String, nullable=False)
    topic_name = Column(String, nullable=False)
    solved_count = Column(Integer, default=0)
    total_count = Column(Integer, default=0)

    user = relationship("User", back_populates="topic_stats")


class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    title_slug = Column(String, nullable=False, unique=True)
    difficulty = Column(String, nullable=False)  # Easy, Medium, Hard
    topic = Column(String, nullable=False)
    companies = Column(JSON, default=[])
    acceptance_rate = Column(Float, nullable=True)
    leetcode_url = Column(String, nullable=False)
    description = Column(Text, nullable=True)


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_name = Column(String, nullable=False)
    duration_days = Column(Integer, default=30)
    current_day = Column(Integer, default=1)
    daily_target_count = Column(Integer, default=3)
    target_company = Column(String, nullable=True)
    roadmap_json = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="study_plans")
