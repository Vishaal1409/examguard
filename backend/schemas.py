from typing import List, Optional
from pydantic import BaseModel, Field


class Credentials(BaseModel):
    email: str = Field(min_length=5, max_length=120)
    password: str = Field(min_length=8, max_length=64)   # bcrypt only uses the first 72 bytes


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---- video ----
class TimelinePoint(BaseModel):
    t: int
    label: str
    confidence: float


class VideoEvent(BaseModel):
    id: int
    label: str
    start_s: float
    end_s: float
    confidence: float
    risk: str


class VideoSummary(BaseModel):
    normal_pct: float
    n_events: int


class VideoAnalysisOut(BaseModel):
    session_id: int
    duration_s: float
    frames_analyzed: int
    timeline: List[TimelinePoint]
    events: List[VideoEvent]
    summary: VideoSummary


# ---- text ----
class Submission(BaseModel):
    student_id: str = Field(min_length=1, max_length=50)
    answer: str = Field(max_length=3000)


class TextRequest(BaseModel):
    title: Optional[str] = Field(default=None, max_length=120)
    submissions: List[Submission] = Field(min_length=2, max_length=200)


class SentenceMatch(BaseModel):
    a_sentence: str
    b_sentence: str
    score: float


class TextPair(BaseModel):
    student_a: str
    student_b: str
    similarity: float
    risk: str
    matches: List[SentenceMatch]


class TextAnalysisOut(BaseModel):
    session_id: int
    pairs: List[TextPair]
    skipped: List[str]
