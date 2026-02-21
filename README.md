# winghacks2026

Backend Getting Started Guide
Follow these steps to set up the backend on your local machine.

1. Clone and Navigate
First, ensure you have the latest code from the repository.

git pull origin main
cd backend

2. Create Your Virtual Environment
Because we ignore the venv/ folder to keep the repo light, you need to create your own local instance.

Windows: python -m venv venv

Mac/Linux: python3 -m venv venv

3. Activate the Environment
This ensures the libraries you install don't mess with your global Python settings.

Windows: .\venv\Scripts\activate

Mac/Linux: source venv/bin/activate

4. Install Dependencies
We use a requirements.txt file to manage our tech stack (FastAPI, Uvicorn, etc.).

PowerShell
pip install -r requirements.txt

5. Launch the Server
Run the FastAPI application with auto-reload enabled so the server refreshes whenever you save a change.

PowerShell
uvicorn main:app --host 0.0.0.0 --port 8000 --reload