from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, constr, validator
from pymongo import MongoClient
import re

app = FastAPI()
# Initialize MongoDB client
client = MongoClient("mongodb://localhost:27017/")
db = client["mydb"]
users_collection = db["users"]

# Add CORS middleware to allow requests from all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from any origin
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


# Define the User data model with validation
from pydantic import BaseModel, EmailStr

class User(BaseModel):
    username: str
    password: str
    email: EmailStr
    phoneNumber: str
    confirmPassword: str


    @validator("confirmPassword")
    def passwords_match(cls, v, values, **kwargs):
        if "password" in values and v != values["password"]:
            raise ValueError("Passwords do not match")
        return v

# Function to save a user to the MongoDB collection
def save_user(user: User):
    user_dict = user.dict()
    del user_dict["confirmPassword"]  # Remove confirmPassword field before saving
    users_collection.insert_one(user_dict)

# Function to check if a username is unique
def is_username_unique(username: str):
    return users_collection.count_documents({"username": username}) == 0

# Function to check if an email is unique
def is_email_unique(email: str):
    return users_collection.count_documents({"email": email}) == 0

# Function to check if a phone number is unique
def is_phone_number_unique(phone_number: str):
    return users_collection.count_documents({"phoneNumber": phone_number}) == 0

# POST endpoint to register a new user
@app.post("/register/")
async def register_user(user: User):
    # Check if user credentials are unique
    username_unique = is_username_unique(user.username)
    email_unique = is_email_unique(user.email)
    phone_unique = is_phone_number_unique(user.phoneNumber)

    # If any credential is not unique, raise HTTPException with appropriate detail
    if not (username_unique and email_unique and phone_unique):
        error_messages = []
        if not username_unique:
            error_messages.append("Username is already taken.")
        if not email_unique:
            error_messages.append("Email is already registered.")
        if not phone_unique:
            error_messages.append("Phone number is already associated with an account.")
        raise HTTPException(status_code=400, detail=" ".join(error_messages))

    # If all credentials are unique, save user and return success message
    save_user(user)
    return {"message": "User registered successfully. Welcome!"}

