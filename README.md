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



## Tech Stack
- **Frontend:** React Native (Expo) + `react-native-maps`
- **Backend:** FastAPI (Python)
- **Database:** MongoDB Atlas (Cloud NoSQL)
- **Deployment:** Git/GitHub

---

## Getting Started

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (LTS)
* [Python 3.10+](https://www.python.org/)
* [Expo Go](https://expo.dev/client) app on your mobile device

### 2. Backend Setup
Navigate to the `/backend` folder:
bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Install dependencies
pip install fastapi uvicorn motor dnspython
# Start the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
3. Frontend Setup
Navigate to the root (or frontend) folder:

Bash
npm install
npx expo install expo-location react-native-maps
# Start the Expo server
npx expo start
Scan the QR code with Expo Go (Android) or your Camera app (iOS).

5. Launch the Server
Run the FastAPI application with auto-reload enabled so the server refreshes whenever you save a change.

PowerShell
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
