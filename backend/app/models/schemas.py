from pydantic import BaseModel, Field, field_validator
from typing import Literal, Optional


FTComponent = Literal["magnitude", "phase", "real", "imaginary"]
ResizePolicy = Literal["smallest", "largest", "fixed"]
MixMode = Literal["magnitude_phase", "real_imaginary"]


class ImageUploadResponse(BaseModel):
    image_id: str
    width: int
    height: int
    spatial_b64: str


class FTComponentRequest(BaseModel):
    image_id: str
    component: FTComponent
    brightness: float = Field(default=1.0, ge=0.1, le=5.0)
    contrast: float = Field(default=1.0, ge=0.1, le=5.0)


class FTComponentResponse(BaseModel):
    image_id: str
    component: FTComponent
    data_b64: str


class MixRequest(BaseModel):
    image_ids: list[str] = Field(..., min_length=1, max_length=4)
    weights: list[float] = Field(..., min_length=1, max_length=4)

    # Per-image component roles: what each image contributes to the mix.
    # In magnitude_phase mode each role must be "magnitude" or "phase".
    # In real_imaginary mode each role must be "real" or "imaginary".
    # Same length as image_ids.
    image_roles: list[FTComponent] = Field(..., min_length=1, max_length=4)

    mix_mode: MixMode = "magnitude_phase"
    resize_policy: ResizePolicy = "smallest"
    fixed_height: int = Field(default=512, ge=64, le=2048)
    fixed_width: int = Field(default=512, ge=64, le=2048)
    keep_aspect: bool = False
    region_fraction: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    region_type: Literal["inner", "outer"] = "inner"
    simulate_delay: bool = False

    @field_validator("weights")
    @classmethod
    def weights_non_negative(cls, v):
        if any(w < 0 for w in v):
            raise ValueError("Weights must be non-negative")
        return v


class MixResponse(BaseModel):
    result_b64: str
    output_shape: tuple[int, int]


class ResizeRequest(BaseModel):
    image_ids: list[str]
    policy: ResizePolicy = "smallest"
    fixed_height: int = 512
    fixed_width: int = 512
    keep_aspect: bool = False


class ResizeResponse(BaseModel):
    results: dict[str, str]
    unified_shape: tuple[int, int]
