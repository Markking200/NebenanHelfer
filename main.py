import json
import os
import random
import subprocess
from contextlib import asynccontextmanager

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from google import genai
from google.genai import types
from google.maps.addressvalidation_v1 import AddressValidationClient
from google.maps.addressvalidation_v1.types import ValidateAddressRequest
from google.type.postal_address_pb2 import PostalAddress
from gtts import gTTS

# Import backend components for database access
from backend.database import database, requests_table, user_table

load_dotenv()


# Manage database connection lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect()
    print("Database connected for Telegram webhook server")
    yield
    await database.disconnect()
    print("Database disconnected")


app = FastAPI(lifespan=lifespan)
TOKEN = os.getenv("TELEGRAM")
GOOGLE_ADDRESS_VALIDATION_API_KEY = os.getenv("GOVAL")

addr_client = AddressValidationClient(
    client_options={"api_key": GOOGLE_ADDRESS_VALIDATION_API_KEY}
)

if not TOKEN:
    raise RuntimeError("Missing env vars! Check your .env file.")


client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY"),
    vertexai=False,
)

print("Starting Telegram webhook server...")


def tts_to_mp3(text, mp3_path="reply.mp3"):
    gTTS(text=text, lang="de").save(mp3_path)
    return mp3_path


def mp3_to_ogg_opus(mp3_path="reply.mp3", ogg_path="reply.ogg"):
    """Convert MP3 to OGG Opus. Falls back to MP3 if ffmpeg not installed."""
    try:
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                mp3_path,
                "-c:a",
                "libopus",
                "-b:a",
                "32k",
                ogg_path,
            ],
            check=True,
            capture_output=True,
        )
        return ogg_path
    except FileNotFoundError:
        print("WARNING: ffmpeg not found, using MP3")
        return mp3_path


def send_voice(chat_id: int, ogg_path: str, token: str):
    url = f"https://api.telegram.org/bot{token}/sendVoice"
    with open(ogg_path, "rb") as f:
        requests.post(url, data={"chat_id": chat_id}, files={"voice": f})


def gemini_transcribe_and_extract(audio_bytes: bytes):
    prompt = """
    Wenn nur ja gesagt wurde soll der titel ja sein. Wenn nein gesagt wurde soll der titel nein sein. Ansonsten fahre mit dem prompt fort.
    Transkribiere die folgende Sprachnachricht (Deutsch). Es geht darum, dass du eine Hilfeanfrage von einem Senioren entgegennimmst, der Hilfe bei alltäglichen Aufgaben benötigt. Wir wollen die wichtigsten Informationen extrahieren, um die Anfrage zu kategorisieren und zu priorisieren. Wenn unklar ist was gefragt ist oder was die Person gesagt hat , gib beim Titel Unklar an und sonst Null. Es gibt auch ein Feld mit habe alle informationen. Falls an sich die meisten informationen da sind, aber die Nachricht jetzt nicht unklar war, kannst du das feld auf false setzten und danach kann nochmal gezielt auf die Felder eingegangen werden die fehlen. Wenn die Felder titel, name, help_type, address, requested time, duration ausgefüllt sind setzt auf true sonst auf false. Aber wie gesagt, falls alles fehlt, setzt dus auch auf false. Ganz wichtig: Falls du dir bei einem Feld unsicher bist, setze es auf null oder Unklar. Keine Informationen erfinden!


    Extrahiere danach ein JSON:

    {
        "titel": "<kurzer Titel der Hilfeanfrage>",
        "name": "<Name der hilfesuchenden Person oder null>",
        "help_type": "<Einkaufen | Haushalt | Begleitung | Transport | Technik | Ärztlicher Notfall | verfollständige nach Kontext>",
        "address":"full address with Postleitzahl or null < this format: Straße Hausnummer, PLZ Ort>",
        "contact_preferences": "Telefon | Klingeln bei ... | oder auffüllen nach Kontext",
        "requested_time": "<Zeit oder null>",
        "duration": "<Dauer oder null>",
        "benötigte_fähigkeiten": "<z.B. Auto fahren, Heben von Gegenständen, Technische Kenntnisse | oder null>",
        "risiko_faktoren": "<z.B. COVID-19, Allergien | oder null>",
        "urgency": "<low | medium | high>",
        "notes": "<kurze Zusammenfassung>",
        "habe_alle_informationen": true,
        "notfall": false,
        "zusammenfassung": "<eine kurze zusammenfassung der anfrage mit allen wichtigen informationen für den output später>"
    }

    Gib NUR eine gültige JSONs Liste zurück.
    """

    resp = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            prompt,
            types.Part.from_bytes(data=audio_bytes, mime_type="audio/ogg"),
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )

    data = json.loads(resp.text)
    if isinstance(data, list):
        data = data[0]

    # Normalize boolean fields (Gemini sometimes returns strings)
    for bool_field in ["habe_alle_informationen", "notfall"]:
        if isinstance(data.get(bool_field), str):
            data[bool_field] = data[bool_field].lower() == "true"

    return data


def address_exists(address_line: str, region="DE") -> bool:
    """Validate address. Returns False if None/empty or invalid."""
    if not address_line:
        return False
    try:
        req = ValidateAddressRequest(
            address=PostalAddress(region_code=region, address_lines=[address_line])
        )
        resp = addr_client.validate_address(request=req)
        verdict = resp.result.verdict
        good_granularity = verdict.validation_granularity in ("PREMISE", "SUB_PREMISE")
        return (
            verdict.address_complete
            and good_granularity
            and verdict.possible_next_action == "ACCEPT"
        )
    except Exception as e:
        print(f"Address validation error: {e}")
        return False


# Simple global state (original logic)
confirming = [False]
stored_data = [{}]


@app.post("/telegram-webhook")
async def telegram_webhook(req: Request):
    update = await req.json()
    msg = update.get("message") or {}
    chat = msg.get("chat") or {}
    chat_id = chat.get("id")
    file_obj = msg.get("voice") or msg.get("audio") or msg.get("document")

    text = msg.get("text")
    if text:
        text_lower = text.strip().lower()
        if text_lower == "/start" or text_lower == "start":
            print("Received /start command from chat_id:", chat_id)
            greeting = (
                "Hallo! Schön dass Sie anrufen. "
                "Sprechen Sie einfach ein, wobei Sie Hilfe brauchen."
                " Ich kümmere mich dann darum. Bitte beachten Sie nur ein Anliegen pro Anruf anzusprechen."
                "Erwähnen Sie Ihren Namen, womit Sie hilfe brauchen, ihre volle Addresse mit Postleitzahl und Stadt, wann und wie lange es dauern wird! Falls Sie einen bestimmten Helfer präferieren, können Sie diesen gerne erwähnen. Vielen Dank! Sprechen Sie jetzt!"
            )
            ogg_path = tts_to_mp3(greeting)
            send_voice(chat_id, ogg_path, TOKEN)
            return {"ok": True}

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

    data = gemini_transcribe_and_extract(audio_bytes)
    print("Gemini response data type:", type(data))
    print("Gemini response data:", data)

    if isinstance(data, list):
        print("printing whole data:", data)
        data = data[0]

    print("Extracted data:", data)

    chat_id = update["message"]["chat"]["id"]

    print(f"🔍 Current state: confirming={confirming[0]}, has_stored_data={bool(stored_data[0])}")

    if confirming[0] == False:
        if data.get("notfall", False):
            print("EMERGENCY DETECTED!")
            mp3 = tts_to_mp3(
                "Achtung! Es wurde ein Notfall gemeldet. Bitte kontaktieren Sie umgehend 112!. Ich wiederhole, es wurde ein Notfall gemeldet. Bitte kontaktieren Sie umgehend 112!"
            )
            ogg = mp3_to_ogg_opus(mp3)
            send_voice(chat_id, ogg, TOKEN)
            return {"ok": True}

        print("--------------")
        print(data.get("habe_alle_informationen"))
        print("Does the address exist?")
        if data.get("address"):
            print(address_exists(data.get("address", "")))

        if not data.get("habe_alle_informationen"):
            print("Not all information extracted.")
            missing = "Fehlende Informationen: "
            if data.get("titel", "Unklar") == "Unklar":
                missing += "Titel, "
            if data.get("name") is None:
                missing += "Name, "
            if data.get("help_type") is None:
                missing += "Aktivität mit der Hilfe benötigt wird, "
            if data.get("address") is None:
                missing += "Addresse, "
            if data.get("requested_time") is None:
                missing += "An welchem Tag, "
            if data.get("duration") is None:
                missing += "ungefähre Dauer, "

            mp3 = tts_to_mp3(
                f"Wiederhole bitte deine Anfrage. Ich habe nicht alle Informationen verstanden.{missing}. Dieses mal etwas deutlicher und langsamer! Danke!"
            )
            ogg = mp3_to_ogg_opus(mp3)
            send_voice(chat_id, ogg, TOKEN)
            return {"ok": True}

        print("Storing help request in memory...")
        stored_data[0] = data  # ← STORE DATA FOR CONFIRMATION

        anliegen = data.get("zusammenfassung", "Keine Zusammenfassung erhalten.")
        confirmation_text = f"Alles klar! Ich habe deine Anfrage verstanden und werde mich darum kümmern. Ich wiederhole jetzt ihr anliegen:{anliegen} Stimmt das anliegen so?"
        print(f"Sending confirmation message: {confirmation_text[:100]}...")
        mp3 = tts_to_mp3(confirmation_text)
        ogg = mp3_to_ogg_opus(mp3)
        send_voice(chat_id, ogg, TOKEN)
        confirming[0] = True
        print(f"✅ Confirmation sent. Waiting for 'ja' response. confirming={confirming[0]}")
        return {"ok": True}
    else:
        print("📝 Processing confirmation response...")
        answer = data.get("titel", "").strip().lower()
        print(f"User answered: '{answer}'")
        if answer == "ja":
            # ← CREATE USER AND REQUEST IN DATABASE
            print("✅ User confirmed! Creating user and request in database...")

            # Check if user already exists by email
            email = f"telegram_{chat_id}@nebenanhelfer.de"
            query = user_table.select().where(user_table.c.email == email)
            existing_user = await database.fetch_one(query)

            if existing_user:
                user_id = existing_user["id"]
                print(f"✅ User already exists with ID: {user_id}")
            else:
                user_data = {
                    "full_name": stored_data[0].get("name", "Telegram User"),
                    "phone": f"telegram_{chat_id}",
                    "email": email,
                    "password": f"telegram_{chat_id}",
                    "user_type": "senior",
                    "address": stored_data[0].get("address", ""),
                }
                query = user_table.insert().values(**user_data)
                user_id = await database.execute(query)
                print(f"✅ Created new user ID: {user_id}")

            request_data = {
                "title": stored_data[0].get("titel", "Hilfe benötigt"),
                "details": stored_data[0].get("zusammenfassung", "Keine Details"),
                "address": stored_data[0].get("address", ""),
                "current_contact_number": f"telegram_{chat_id}",
                "target_date": stored_data[0].get("requested_time"),
                "user_id": user_id,
                "status": "open",
            }
            query = requests_table.insert().values(**request_data)
            request_id = await database.execute(query)
            print(f"✅ Created request ID: {request_id}")

            sicherheitscode = random.randint(1000, 9999)
            mp3 = tts_to_mp3(
                f"Super! Ich werde mich sofort um deine Anfrage kümmern. Ihr Sicherheitscode lautet {sicherheitscode}. Ich wiederhole den Code jetzt noch einmal {sicherheitscode}. Noch ein letztes mal {sicherheitscode}. Vielen Dank für deinen Anruf und einen schönen Tag noch!"
            )
            ogg = mp3_to_ogg_opus(mp3)
            send_voice(chat_id, ogg, TOKEN)
        else:
            mp3 = tts_to_mp3(
                "Oh, das tut mir leid. Bitte rufe erneut an und schildere dein Anliegen noch einmal. Danke!"
            )
            ogg = mp3_to_ogg_opus(mp3)
            send_voice(chat_id, ogg, TOKEN)

        # ← CLEAR STATE
        confirming[0] = False
        stored_data[0] = {}
        return {"ok": True}
