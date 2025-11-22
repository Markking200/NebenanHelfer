"""
SIMPLE ALTERNATIVE - Just the core logic you need!

This is the absolute minimal version if you think the other solution is too complex.
"""

from typing import Union
from models.requests import HelpRequestCreate


def simple_gemini_mapper(gemini_data: Union[dict, list], user_id: int, phone: str):
    """Dead simple mapper - just maps the fields directly"""

    # If list, take first item
    data = gemini_data[0] if isinstance(gemini_data, list) else gemini_data

    # Map directly - that's it!
    return HelpRequestCreate(
        user_id=user_id,
        title=data.get("titel") or "Hilfeanfrage",
        details=data.get("notes") or "Keine Details",
        address=data.get("address") or "Nicht angegeben",
        current_contact_number=phone,
    )


# ========== HOW TO USE IN gemini_tg.py ==========

"""
Replace lines 172-178 in gemini_tg.py with:

    help_request = simple_gemini_mapper(
        gemini_data=gemini_data,
        user_id=1,  # FIXME: lookup user
        phone=phone_number,
    )
"""


# ========== TEST IT ==========

if __name__ == "__main__":
    # Test both formats
    test1 = [{"titel": "Unklar", "notes": "Senior unclear", "address": None}]
    test2 = {"titel": "Shopping", "notes": "Need help", "address": "Street 123"}

    result1 = simple_gemini_mapper(test1, 1, "+49123")
    result2 = simple_gemini_mapper(test2, 2, "+49456")

    print("Test 1:", result1.model_dump())
    print("Test 2:", result2.model_dump())
    print("\nWorks!")
