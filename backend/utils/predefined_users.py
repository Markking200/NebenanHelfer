# Create predefined users for testing purposes

from backend.database import database, requests_table, user_table
from backend.models.user import UserType

# Predefined users data
PREDEFINED_USERS = [
    {
        "email": "anna.mueller@example.com",
        "phone": "+49 123 456789",
        "address": "Musterstraße 1, 80331 München",
        "full_name": "Anna Müller",
        "user_type": UserType.SENIOR,
        "password": "password123",
    },
    {
        "email": "hans.schmidt@example.com",
        "phone": "+49 987 654321",
        "address": "Hauptstraße 5, 80331 München",
        "full_name": "Hans Schmidt",
        "user_type": UserType.SENIOR,
        "password": "password123",
    },
    {
        "email": "marie.wagner@example.com",
        "phone": "+49 555 123456",
        "address": "Bahnhofstraße 10, 80331 München",
        "full_name": "Marie Wagner",
        "user_type": UserType.SENIOR,
        "password": "password123",
    },
    {
        "email": "max.student@example.com",
        "phone": "+49 111 222333",
        "address": "Universitätsstraße 15, 80331 München",
        "full_name": "Max Student",
        "user_type": UserType.STUDENT,
        "password": "password123",
    },
    {
        "email": "lisa.student@example.com",
        "phone": "+49 444 555666",
        "address": "Studentenweg 20, 80331 München",
        "full_name": "Lisa Student",
        "user_type": UserType.STUDENT,
        "password": "password123",
    },
    {
        "email": "tom.student@example.com",
        "phone": "+49 777 888999",
        "address": "Campusallee 25, 80331 München",
        "full_name": "Tom Student",
        "user_type": UserType.STUDENT,
        "password": "password123",
    },
]

# Predefined requests data (will be populated with user IDs after seeding users)
PREDEFINED_REQUESTS = [
    {
        "title": "Need help with grocery shopping",
        "details": "I need someone to help me buy groceries this week. I have a list ready and can provide the money.",
        "address": "Musterstraße 1, 80331 München",
        "current_contact_number": "+49 123 456789",
        "status": "open",
        "user_id": None,  # Will be set to Anna's ID
        "student_id": None,
    },
    {
        "title": "Help with medication pickup",
        "details": "I need assistance picking up my prescription from the pharmacy. The pharmacy is about 2km from my home.",
        "address": "Hauptstraße 5, 80331 München",
        "current_contact_number": "+49 987 654321",
        "status": "in_progress",
        "user_id": None,  # Will be set to Hans's ID
        "student_id": None,  # Will be set to Max's ID
    },
    {
        "title": "Need help with laundry",
        "details": "I have accumulated laundry that needs to be washed and folded. The laundromat is nearby.",
        "address": "Bahnhofstraße 10, 80331 München",
        "current_contact_number": "+49 555 123456",
        "status": "completed",
        "user_id": None,  # Will be set to Marie's ID
        "student_id": None,  # Will be set to Lisa's ID
    },
    {
        "title": "Assistance with house cleaning",
        "details": "My apartment needs general cleaning - vacuuming, dusting, and bathroom cleaning.",
        "address": "Musterstraße 1, 80331 München",
        "current_contact_number": "+49 123 456789",
        "status": "open",
        "user_id": None,  # Will be set to Anna's ID
        "student_id": None,
    },
]


async def seed_predefined_users():
    """Seed the database with predefined users if they don't already exist."""
    for user_data in PREDEFINED_USERS:
        # Check if user already exists
        query = user_table.select().where(user_table.c.email == user_data["email"])
        existing_user = await database.fetch_one(query)
        if not existing_user:
            # Insert the user
            insert_query = user_table.insert().values(**user_data)
            await database.execute(insert_query)
            print(f"Seeded user: {user_data['full_name']} ({user_data['email']})")
        else:
            print(
                f"User already exists: {user_data['full_name']} ({user_data['email']})"
            )


async def seed_predefined_requests():
    """Seed the database with predefined requests if they don't already exist."""
    # Get user IDs for the predefined users
    user_ids = {}
    for user_data in PREDEFINED_USERS:
        query = user_table.select().where(user_table.c.email == user_data["email"])
        user = await database.fetch_one(query)
        if user:
            user_ids[user_data["email"]] = user["id"]

    # Update request data with actual user IDs
    requests_data = [
        {
            "title": "Need help with grocery shopping",
            "details": "I need someone to help me buy groceries this week. I have a list ready and can provide the money.",
            "address": "Musterstraße 1, 80331 München",
            "current_contact_number": "+49 123 456789",
            "status": "open",
            "user_id": user_ids.get("anna.mueller@example.com"),
            "student_id": None,
        },
        {
            "title": "Help with medication pickup",
            "details": "I need assistance picking up my prescription from the pharmacy. The pharmacy is about 2km from my home.",
            "address": "Hauptstraße 5, 80331 München",
            "current_contact_number": "+49 987 654321",
            "status": "in_progress",
            "user_id": user_ids.get("hans.schmidt@example.com"),
            "student_id": user_ids.get("max.student@example.com"),
        },
        {
            "title": "Need help with laundry",
            "details": "I have accumulated laundry that needs to be washed and folded. The laundromat is nearby.",
            "address": "Bahnhofstraße 10, 80331 München",
            "current_contact_number": "+49 555 123456",
            "status": "completed",
            "user_id": user_ids.get("marie.wagner@example.com"),
            "student_id": user_ids.get("lisa.student@example.com"),
        },
        {
            "title": "Assistance with house cleaning",
            "details": "My apartment needs general cleaning - vacuuming, dusting, and bathroom cleaning.",
            "address": "Musterstraße 1, 80331 München",
            "current_contact_number": "+49 123 456789",
            "status": "open",
            "user_id": user_ids.get("anna.mueller@example.com"),
            "student_id": None,
        },
    ]

    for request_data in requests_data:
        if request_data["user_id"] is None:
            continue  # Skip if user doesn't exist

        # Check if request already exists (by title and user_id)
        query = requests_table.select().where(
            (requests_table.c.title == request_data["title"])
            & (requests_table.c.user_id == request_data["user_id"])
        )
        existing_request = await database.fetch_one(query)
        if not existing_request:
            # Insert the request
            insert_query = requests_table.insert().values(**request_data)
            await database.execute(insert_query)
            print(
                f"Seeded request: {request_data['title']} for user ID {request_data['user_id']}"
            )
        else:
            print(
                f"Request already exists: {request_data['title']} for user ID {request_data['user_id']}"
            )
