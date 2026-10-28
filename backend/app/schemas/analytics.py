from pydantic import BaseModel, ConfigDict
from typing import List
from pydantic.alias_generators import to_camel

class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, alias_generator=to_camel)

class CategoryCount(BaseSchema):
    category: str
    count: int

class PriorityCount(BaseSchema):
    priority: str
    count: int

class MonthlyTrend(BaseSchema):
    month: str
    submitted: int
    resolved: int

class ResolutionPerformance(BaseSchema):
    department: str
    resolved: int
    overdue: int

class AnalyticsResponse(BaseSchema):
    total_complaints: int
    pending: int
    in_progress: int
    resolved: int
    overdue: int
    sla_compliance: float
    avg_resolution_hours: float
    by_category: List[CategoryCount]
    by_priority: List[PriorityCount]
    monthly_trend: List[MonthlyTrend]
    resolution_performance: List[ResolutionPerformance]

class SystemStatsResponse(BaseSchema):
    total_citizens: int
    total_officers: int
    total_departments: int
    total_complaints: int
    resolution_rate: float
    sla_compliance: float
    critical_complaints: int
    duplicate_complaints: int

class OfficerResponse(BaseSchema):
    id: str
    full_name: str
    email: str
    department_id: str
    department_name: str
    active_complaints: int
    resolved_complaints: int
    avg_resolution_hours: float
    is_active: bool
