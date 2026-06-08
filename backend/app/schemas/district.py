# FILE NAME: d:\Omkar\Water\FDA\backend\app\schemas\district.py

from pydantic import BaseModel

class TalukaResponse(BaseModel):
    id: int
    district_id: int
    name: str

    class Config:
        from_attributes = True

class DistrictResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True
