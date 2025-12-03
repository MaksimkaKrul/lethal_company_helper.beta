# 🚀 Lethal Company Speedrun Helper

![Build Status](https://img.shields.io/github/actions/workflow/status/MaksimkaKrul/lethal_company_helper.beta/django_tests.yml?label=Tests&logo=github)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.0-092E20?logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![WebSockets](https://img.shields.io/badge/Real--Time-WebSockets-red)

> *"Welcome to the Company. Your quota is 130 credits."*

**Lethal Company Speedrun Helper** is a powerful single-page web application (SPA) designed for the Lethal Company speedrunning community.  
It replaces outdated Excel sheets with a modern, real-time interactive dashboard that synchronizes data instantly for all players in the lobby.

No more refreshing the page. No more asking teammates what they collected.  
**All updates appear immediately for everyone.**

---

## Key Features

### Lobby System
* **Real-time synchronization:** Changes in quotas, weather, and collected loot update instantly for all lobby members (WebSockets).
* **Smart Quota Calculator:**
  * Automatic computation of “Rolls” (luck coefficient).
  * Next-quota prediction: Min / Avg / Max.
  * Overtime bonus calculation and Ship Loot total price.
* **Museum Tracker:** Interactive grid of all 72 in-game items to track collection progress.
* **Save System:** Export and import lobby progress via JSON.

### Comms Terminal (Forum)
* Built-in forum for strategies, discussions, and coordination.
* Thread creation and live communication.
* UI styled like the in-game terminal.

### Employee Profile
* Personal profile with emoji avatar selection (🧑‍🚀, 👹, 🐛).
* Editable biography and user information.

---

## Tech Stack

| Area | Technologies |
| :--- | :--- |
| **Backend** | Python, Django, Django REST Framework |
| **Real-time** | Django Channels, Daphne, Redis / InMemory Channel Layer |
| **Frontend** | React.js, Vite, React Router v6 |
| **Database** | SQLite (Dev), PostgreSQL (Prod Ready) |
| **DevOps** | GitHub Actions (CI/CD), Git |

---

## Screenshots

| Main Menu | Lobby (Quotas) |
| :---: | :---: |
|<img width="400" height="400" alt="chrome_Hji9UoMNQE" src="https://github.com/user-attachments/assets/98b1528e-0403-4f16-90c4-95fc6a6eb651" /> |<img width="400" height="953" alt="chrome_U0LrugPag6" src="https://github.com/user-attachments/assets/c41e6da1-584c-4f17-871b-a5790fde2751" /> |

| Museum Tracker | Forum |
| :---: | :---: |
|<img width="400" height="953" alt="chrome_ylEchFDk0Q" src="https://github.com/user-attachments/assets/d4f08deb-8710-4ef5-8edb-4d23845c3331" /> | <img width="400" height="953" alt="chrome_OE0VAjMaFt" src="https://github.com/user-attachments/assets/8969bdbb-d2bd-457c-ab89-0c7ad420b193" /> |

*(Note: Screenshots are demonstrational)*

---

## 🚀 Installation & Setup

You will need **Python 3.10+** and **Node.js 18+**.

---

## 1. Clone the repository
git clone https://github.com/MaksimkaKrul/lethal_company_helper.beta.git
cd lethal-company-helper


## 2. Backend Setup (Terminal 1)
cd backend

### Create virtual environment
python -m venv venv

### Activate (Windows)
.\venv\Scripts\activate
### Activate (Mac/Linux)
source venv/bin/activate

### Install dependencies
pip install -r requirements.txt

### Apply migrations
python manage.py migrate

### Run server
python manage.py runserver

Backend URL:
http://127.0.0.1:8000

## 3. Frontend Setup (Terminal 2)
cd frontend

### Install dependencies
npm install

### Run development server
npm run dev

Frontend URL:
http://localhost:5173

## Testing
The project includes Unit and Integration tests.
GitHub Actions automatically runs CI on each push.

Local test execution:
cd backend
python manage.py test

## Author
Maksim Krulevskiy (IM-34)
National Technical University of Ukraine
“Igor Sikorsky Kyiv Polytechnic Institute”

Project created for the course:
“Software Development Lifecycle”
License: MIT.

