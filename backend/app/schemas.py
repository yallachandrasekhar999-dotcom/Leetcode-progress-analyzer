from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


class UserProfile(BaseModel):
    username: str
    real_name: Optional[str] = None
    avatar_url: Optional[str] = None
    ranking: Optional[int] = None
    reputation: int = 0
    contest_rating: Optional[float] = None
    contest_global_ranking: Optional[int] = None
    streak: int = 0
    total_solved: int = 0
    easy_solved: int = 0
    medium_solved: int = 0
    hard_solved: int = 0
    total_questions: int = 0
    acceptance_rate: Optional[float] = None
    last_updated: Optional[datetime] = None

    class Config:
        from_attributes = True


class TopicStat(BaseModel):
    topic_slug: str
    topic_name: str
    solved_count: int
    total_count: int

    class Config:
        from_attributes = True


class DailyStat(BaseModel):
    date: str
    easy_solved: int
    medium_solved: int
    hard_solved: int
    total_solved: int

    class Config:
        from_attributes = True


class ProblemOut(BaseModel):
    id: int
    title: str
    title_slug: str
    difficulty: str
    topic: str
    companies: List[str]
    acceptance_rate: Optional[float] = None
    leetcode_url: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class RecommendationRequest(BaseModel):
    username: str
    company: Optional[str] = None
    difficulty: Optional[str] = None
    limit: int = 20


class StudyPlanRequest(BaseModel):
    username: str
    duration_days: int = 30
    daily_target: int = 3
    target_company: Optional[str] = None
    focus_topics: Optional[List[str]] = None


class StudyPlanOut(BaseModel):
    plan_name: str
    duration_days: int
    daily_target_count: int
    target_company: Optional[str] = None
    roadmap_json: Dict[str, Any]
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CompareRequest(BaseModel):
    username1: str
    username2: str


class CompareResult(BaseModel):
    user1: UserProfile
    user2: UserProfile
    user1_topics: List[TopicStat]
    user2_topics: List[TopicStat]


class HeatmapData(BaseModel):
    date: str
    count: int


class AnalyticsResponse(BaseModel):
    profile: UserProfile
    topic_stats: List[TopicStat]
    weak_topics: List[str]
    heatmap: List[HeatmapData]
    daily_stats: List[DailyStat]
    active_years: List[int] = []
