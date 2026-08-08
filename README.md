# EcoStay Explorer 🌿 — Full-Stack Sustainable Hospitality Platform

> **TBI-GEU Full-Stack Web Development Internship Capstone Project**  
> **Intern ID:** `TBI-26101102`

**LINKEDIN URL : https://www.linkedin.com/in/akshay-dudhe-02498a364?utm_source=share_via&utm_content=profile&utm_medium=member_android **

---

## 📌 Project Overview

**EcoStay Explorer** is a full-stack web application built for discovering, booking, and managing sustainable, eco-friendly accommodation stays. Powered by a modern **Next.js 16** frontend and a high-performance **FastAPI (Python)** backend, the platform integrates AI sustainability analytics using Google Gemini, secure JWT authentication, interactive booking management, and real-time MongoDB Atlas data persistence.

---

## 🔗 Live Links & Deliverables

- **🌐 Live Web App:** [https://ecostay-exporer-ci9jynoai-devchamp.vercel.app](https://ecostay-exporer-ci9jynoai-devchamp.vercel.app)

- **⚡ Live Backend Health Check:** [https://ecostay-backend.onrender.com/api/health](https://ecostay-backend.onrender.com/api/health)

---

## 📁 Repository Structure

```text
ECOSTAY-EXPORER/
├── frontend/           # Next.js 16 frontend (App Router, React 19, Tailwind CSS 4)
├── backend/            # FastAPI Python backend
│   └── app/            # Application routes, models, config, and database engines
├── .env.example        # Environment variable template
└── README.md           # Project documentation







✨ Key Features🔐 User Authentication: Secure registration and login flow utilizing JWT tokens, Passlib password hashing, and rate limiting (slowapi).


🏨 Eco-Stay Listings: Search, filter, and view detailed eco-friendly property accommodations stored in MongoDB Atlas.

📅 Booking Engine: Interactive reservation system with real-time asynchronous database CRUD operations.

🤖 Gemini AI Sustainability Engine: Integrated AI analysis evaluating accommodation eco-ratings and carbon footprint metrics via Google Gemini API.

📱 Fully Responsive UI: Fast, mobile-first design built with Next.js 16, Turbopack, and Tailwind CSS 4.

🛠️ Tech StackFrontend: Next.js 16, React 19, Tailwind CSS 4, TypeScript, TurbopackBackend: FastAPI, Python 3.10+, Motor (Async MongoDB Driver), Pydantic, Passlib, PyJWT, SlowapiDatabase & AI: MongoDB Atlas, Google Gemini APIDeployment & Hosting:Frontend: VercelBackend: RenderVersion Control: Git & GitHub📡

 API Endpoints MethodEndpoin tDescription GET/api/healthBackend and Database connection health checkPOST/api/auth/loginUser login & JWT issuancePOST/api/auth/registerNew user registrationGET/api/staysRetrieve all eco-stay listingsGET/api/reservationsRetrieve upcoming user bookingsGET/api/ai-metricsRetrieve default sustainability metricsPOST/api/ai-metrics/analyzeTrigger Gemini AI sustainability analysis🖼️




2. User Authentication & Login Flow(Replace with relative path ./screenshots/login.png or hosted image link)3. Booking Details & Reservation Management(Replace with relative path ./screenshots/booking.png or hosted image link)4. Vercel & Render Production Dashboards(Replace with relative path ./screenshots/deployment.png or hosted image link)🚀

  Local Development SetupPrerequisitesNode.js: v18+ and npmPython: v3.10+Database: MongoDB Atlas Cluster (or local instance)1.


  Clone RepositoryBashgit clone [https://github.com/akshaydudhe2005-arch/Ecostay-Exporer.git](https://github.com/akshaydudhe2005-arch/Ecostay-Exporer.git)


cd Ecostay-Exporer
2. Backend SetupBashcd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
Backend will run locally at http://localhost:8000.3. Frontend SetupBashcd ../frontend
npm install


npm run dev

Frontend will run locally at http://localhost:3000.🔑

Environment Variables SetupCreate .env files using .env.example as a baseline.Frontend Environment (frontend/.env.local)Code snippetNEXT_PUBLIC_API_URL=[https://ecostay-backend.onrender.com](https://ecostay-backend.onrender.com)

Backend Environment (backend/.env or root .env)Code snippetMONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key_here
GEMINI_API_KEY=your_google_gemini_api_key

CORS_ORIGINS=[https://ecostay-exporer-ci9jynoai-devchamp.vercel.app](https://ecostay-exporer-ci9jynoai-devchamp.vercel.app),http://localhost:3000


⚠️ Known Limitations (Free Tier Hosting)Render Cold Starts: The free backend instance on Render automatically goes to sleep after 15 minutes of inactivity. The initial HTTP request after an idle period may take 30 to 60 seconds to wake up the server.



👤 Author & Internship CreditsDeveloper: Akshay DudheIntern ID: TBI-26101102Program: TBI-GEU Full-Stack Web Development Internship Capstone
```
