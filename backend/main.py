from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List
import os

app = FastAPI()

# 🔗 Use the connection string from your Atlas 'Connect' panel
# Replace <db_password> with your actual password!
MONGO_URL = "mongodb+srv://ellynr216_db_user:MongoDB@winghacks2026.3f8cee8.mongodb.net/"
client = AsyncIOMotorClient(MONGO_URL)
db = client.gatorfamily_db

@app.get("/clinics")
async def get_clinics():
    clinics = []
    # 🔎 Fetch all clinics from the 'clinics' collection
    async for clinic in db.clinics.find():
        clinic["_id"] = str(clinic["_id"])  # Convert MongoDB ID to string for JSON
        clinics.append(clinic)
    return clinics

@app.get("/products")
async def get_products():
    products = []
    # 🛒 Fetch affordable essentials like formula and vitamins
    async for product in db.products.find():
        product["_id"] = str(product["_id"])
        products.append(product)
    return products