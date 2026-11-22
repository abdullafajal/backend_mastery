from dataclasses import dataclass


@dataclass(frozen=True)
class Coupon:
    code: str
    discount_paise: int


diwali = Coupon("DIWALI150", 15000)
diwali.discount_paise = 99900          # someone tries to make the coupon bigger
