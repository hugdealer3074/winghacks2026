from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

clinics = [
    # Hospitals & Clinics
    {
        "id": 1, "name": "UF Health Women's Center", 
        "lat": 29.6394, "lng": -82.3433, "type": "medical",
        "description": "Family restrooms & changing stations on 1st floor."
    },
    # Diaper Banks & Community Support (The "WiNG" Factor)
    {
        "id": 4, "name": "Library Partnership Diaper Bank", 
        "lat": 29.6672, "lng": -82.3125, "type": "community",
        "description": "Free diapers, parenting classes, and financial planning."
    },
    {
        "id": 5, "name": "SWAG Family Resource Center", 
        "lat": 29.6231, "lng": -82.4115, "type": "community",
        "description": "Diaper bank, medical services, and food pantry."
    },
    {
        "id": 6, "name": "The Oaks Mall Family Restrooms", 
        "lat": 29.6644, "lng": -82.4116, "type": "amenity",
        "description": "Gender-neutral family bathrooms near the food court."
    }
]

products = [
    {"id": 1, "name": "Parent's Choice Formula", "price": 22.47, "store": "Walmart", "brand": "Budget"},
    {"id": 2, "name": "Prenatal Vitamins", "price": 4.73, "store": "Walmart", "brand": "Spring Valley"},
    {"id": 3, "name": "Diapers (Free Distribution)", "price": 0.00, "store": "Cone Park Library", "brand": "Community"}
]

@app.get("/clinics")
def get_clinics(): return clinics

@app.get("/products")
def get_products(): return products