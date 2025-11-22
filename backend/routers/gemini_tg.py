import json
import os
from typing import Union

import requests
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Request
from google import genai
from google.genai import types

from backend.database import database, requests_table
from backend.models.requests import HelpRequestCreate

router = APIRouter()
load_dotenv()
TOKEN = os.getenv("TELEGRAM")

if not TOKEN:
    raise RuntimeError("Missing env vars! Check your .env file.")


client = genai.Client(
    api_key=os.environ["GEMINI_API_KEY"],
    vertexai=False,
)

print("Starting Telegram webhook server...")


def gemini_transcribe_and_extract(audio_bytes: bytes):
    prompt = """
    Transkribiere die folgende Sprachnachricht (Deutsch). Es geht darum, dass du eine Hilfeanfrage von einem Senioren entgegennimmst, der Hilfe bei alltäglichen Aufgaben benötigt. Wir wollen die wichtigsten Informationen extrahieren, um die Anfrage zu kategorisieren und zu priorisieren. Wenn unklar ist was gefragt ist oder was die Person gesagt hat , gib beim Titel Unklar an und sonst Null.
    Extrahiere danach ein JSON:

    {
        "titel": "<kurzer Titel der Hilfeanfrage>",
        "name": "<Name der hilfesuchenden Person oder null>",
        "help_type": "<Einkaufen | Haushalt | Begleitung | Transport | Technik | Ärztlicher Notfall | verfollständige nach Kontext>",
        "address":"full address or null",
        "requested_time": "<Zeit oder null>",
        "urgency": "<low | medium | high>",
        "notes": "<kurze Zusammenfassung>"
    }

    Gib NUR gültige JSONs zurück.
    """

    resp = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            prompt,
            types.Part.from_bytes(data=audio_bytes, mime_type="audio/ogg"),
        ],
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )

    return json.loads(resp.text)


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

    Args:
        gemini_data: The JSON response from Gemini
        user_id: The ID of the senior user making the request
        phone_number: The contact number from Telegram

    Returns:
        HelpRequestCreate instance ready for database insertion
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


@router.post("/telegram-webhook")
async def telegram_webhook(req: Request):
    update = await req.json()
    msg = update.get("message") or {}
    file_obj = msg.get("voice") or msg.get("audio") or msg.get("document")
    if not file_obj:
        return {"ok": True}

    file_id = file_obj["file_id"]

    print("Received file_id:", file_id)

    r = requests.get(
        f"https://api.telegram.org/bot{TOKEN}/getFile",
        params={"file_id": file_id},
        timeout=10,
    )
    file_path = r.json()["result"]["file_path"]

    audio_url = f"https://api.telegram.org/file/bot{TOKEN}/{file_path}"
    audio_bytes = requests.get(audio_url, timeout=10).content

    print("Downloaded audio, size:", len(audio_bytes))

    # Extract data from Gemini
    gemini_data = gemini_transcribe_and_extract(audio_bytes)
    print("EXTRACTED:", gemini_data)

    # Get chat info to extract phone number and user identification
    chat = msg.get("chat", {})
    from_user = msg.get("from", {})

    # Use Telegram username or chat_id as phone number fallback
    phone_number = (
        from_user.get("phone_number")
        or from_user.get("username")
        or str(from_user.get("id", "unknown"))
    )

    # TODO: In production, you need to:
    # 1. Look up or create the user based on Telegram chat_id
    # 2. Link the Telegram user to a user_id in your database
    # For now, using a placeholder user_id (you'll need to handle this properly)
    user_id = 1  # FIXME: Replace with actual user lookup/creation logic

    try:
        # Map Gemini response to HelpRequestCreate model
        help_request = map_gemini_to_help_request(
            gemini_data=gemini_data,
            user_id=user_id,
            phone_number=phone_number,
        )

        # Insert into database
        data = help_request.model_dump()
        query = requests_table.insert().values(data)
        request_id = await database.execute(query)

        print(f"✓ Created help request with ID: {request_id}")

        # Optional: Send confirmation message back to Telegram
        telegram_message = (
            f"✓ Anfrage erfasst!\n\n"
            f"Titel: {help_request.title}\n"
            f"Details: {help_request.details}\n"
            f"Adresse: {help_request.address}"
        )

        requests.post(
            f"https://api.telegram.org/bot{TOKEN}/sendMessage",
            json={"chat_id": chat.get("id"), "text": telegram_message},
            timeout=10,
        )

        return {"ok": True, "request_id": request_id}

    except ValueError as e:
        print(f"✗ Error mapping Gemini data: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid Gemini data: {str(e)}")
    except Exception as e:
        print(f"✗ Error creating request: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create request: {str(e)}")
