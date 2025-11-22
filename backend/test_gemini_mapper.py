"""
Test/Example file to demonstrate Gemini JSON mapping to HelpRequestCreate

Run this to see how different Gemini responses map to your request model.
NO GEMINI REQUIRED - just tests the mapping function!
"""

import sys
import os

# Add parent directory to path to import from backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import Union
from backend.models.requests import HelpRequestCreate


def map_gemini_to_help_request(
    gemini_data: Union[dict, list],
    user_id: int,
    phone_number: str,
) -> HelpRequestCreate:
    """
    Maps Gemini's JSON response to HelpRequestCreate model.

    Handles both formats:
    - Single dict: {"titel": "...", "name": "...", ...}
    - List of dicts: [{"titel": "...", "name": "...", ...}]
    """
    # Handle list format - take the first item
    if isinstance(gemini_data, list):
        if not gemini_data:
            raise ValueError("Gemini returned empty list")
        gemini_data = gemini_data[0]

    # Extract and map fields from Gemini format to our model
    title = gemini_data.get("titel") or "Hilfeanfrage"

    # Build detailed description from all available info
    details_parts = []

    if gemini_data.get("notes"):
        details_parts.append(gemini_data["notes"])

    if gemini_data.get("name"):
        details_parts.append(f"Name: {gemini_data['name']}")

    if gemini_data.get("help_type"):
        details_parts.append(f"Art der Hilfe: {gemini_data['help_type']}")

    if gemini_data.get("requested_time"):
        details_parts.append(f"Gewünschte Zeit: {gemini_data['requested_time']}")

    if gemini_data.get("urgency"):
        urgency_map = {"low": "Niedrig", "medium": "Mittel", "high": "Hoch"}
        urgency_text = urgency_map.get(
            gemini_data["urgency"],
            gemini_data["urgency"]
        )
        details_parts.append(f"Dringlichkeit: {urgency_text}")

    details = " | ".join(details_parts) if details_parts else "Keine Details verfügbar"

    # Extract address, use fallback if not provided
    address = gemini_data.get("address") or "Adresse nicht angegeben"

    # Create the HelpRequestCreate instance
    return HelpRequestCreate(
        user_id=user_id,
        title=title,
        details=details,
        address=address,
        current_contact_number=phone_number,
    )


def test_mapping():
    """Test the mapping with both Gemini response formats"""

    # Example 1: List format with "Unklar"
    gemini_response_1 = [
        {
            "titel": "Unklar",
            "name": None,
            "help_type": None,
            "address": None,
            "requested_time": None,
            "urgency": "low",
            "notes": "Anruf von Senior, Anliegen unklar",
        }
    ]

    # Example 2: Dict format with complete info
    gemini_response_2 = {
        "titel": "Hilfe beim Einkauf",
        "name": "Rudolf Müller",
        "help_type": "Einkaufen",
        "address": "Wahlheimerstraße 118",
        "requested_time": "Morgen",
        "urgency": "medium",
        "notes": "Herr Müller ist blind und benötigt Hilfe beim morgigen Einkauf.",
    }

    # Example 3: Dict with partial info
    gemini_response_3 = {
        "titel": "Technik Problem",
        "name": "Frau Schmidt",
        "help_type": "Technik",
        "address": None,
        "requested_time": "Heute Nachmittag",
        "urgency": "high",
        "notes": "Computer funktioniert nicht mehr",
    }

    print("=" * 80)
    print("Testing Gemini JSON Mapping")
    print("=" * 80)

    # Test Example 1
    print("\n[Example 1] List format - Unclear request:")
    print(f"Input: {gemini_response_1}")
    result_1 = map_gemini_to_help_request(
        gemini_data=gemini_response_1,
        user_id=1,
        phone_number="+49123456789",
    )
    print(f"\nMapped to HelpRequestCreate:")
    print(f"  title: {result_1.title}")
    print(f"  details: {result_1.details}")
    print(f"  address: {result_1.address}")
    print(f"  user_id: {result_1.user_id}")
    print(f"  current_contact_number: {result_1.current_contact_number}")

    # Test Example 2
    print("\n" + "-" * 80)
    print("\n[Example 2] Dict format - Complete shopping help:")
    print(f"Input: {gemini_response_2}")
    result_2 = map_gemini_to_help_request(
        gemini_data=gemini_response_2,
        user_id=2,
        phone_number="+49987654321",
    )
    print(f"\nMapped to HelpRequestCreate:")
    print(f"  title: {result_2.title}")
    print(f"  details: {result_2.details}")
    print(f"  address: {result_2.address}")
    print(f"  user_id: {result_2.user_id}")
    print(f"  current_contact_number: {result_2.current_contact_number}")

    # Test Example 3
    print("\n" + "-" * 80)
    print("\n[Example 3] Dict format - Partial info with high urgency:")
    print(f"Input: {gemini_response_3}")
    result_3 = map_gemini_to_help_request(
        gemini_data=gemini_response_3,
        user_id=3,
        phone_number="@telegram_user",
    )
    print(f"\nMapped to HelpRequestCreate:")
    print(f"  title: {result_3.title}")
    print(f"  details: {result_3.details}")
    print(f"  address: {result_3.address}")
    print(f"  user_id: {result_3.user_id}")
    print(f"  current_contact_number: {result_3.current_contact_number}")

    print("\n" + "=" * 80)
    print("✓ All mappings successful!")
    print("=" * 80)


if __name__ == "__main__":
    test_mapping()
