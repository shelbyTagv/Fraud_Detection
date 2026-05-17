# Deployment Guide: Forensic Analytics Prototype

This guide explains how to deploy your Forensic Analytics Prototype to the internet so your customers/professors can access it via a public URL.

Since this is a prototype, the easiest and most cost-effective way to deploy is using **Render** (for the Python backend) and **Vercel** or **Netlify** (for the React frontend). Both offer generous free tiers perfect for demonstrations.

---

## Step 1: Prepare the Code for Production

Before deploying, you need to make two small code changes so the frontend and backend can talk to each other over the internet.

### 1. Update Frontend API URL (`frontend/src/api.js`)
Currently, the frontend expects the backend to be on `localhost`. Change the `BASE_URL` to use an environment variable:

```javascript
// Change this line (around line 4):
const BASE_URL = "http://localhost:8000";

// To this:
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
```

### 2. Update Backend CORS Policy (`backend/main.py`)
Currently, the backend only accepts requests from `localhost:3000`. You need to allow all origins (or specifically your frontend URL) so the deployed frontend can connect.

```python
# Change this section (around line 34):
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# To this (allows all origins for easy testing):
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Or put your Vercel URL here like ["https://my-app.vercel.app"]
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Push to GitHub
Create a GitHub repository and push your entire project folder (`Fraud_Detection`) to it. Both Render and Vercel will pull your code directly from GitHub.

---

## Step 2: Deploy the Backend (Render)

Render is great for Python FastAPI applications.

1. Create a free account on [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your repository.
4. Fill in the deployment details:
   - **Name:** `forensic-api` (or similar)
   - **Root Directory:** `backend` (Important: tells Render where the Python app is)
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Select the **Free** instance type.
6. Click **Create Web Service**.

Wait a few minutes for the build to finish. Once live, Render will give you a URL like `https://forensic-api-xyz.onrender.com`. 
**Copy this URL** — you will need it for the frontend.

> **Note on SQLite:** Render's free tier uses ephemeral storage. This means every time the server restarts (which happens on free tiers after inactivity), your SQLite database (`forensic.db`) will be wiped. For a prototype demonstration, this is usually fine, but users will need to re-register. If you need permanent data, consider using Render's PostgreSQL database instead.

---

## Step 3: Deploy the Frontend (Vercel)

Vercel is the industry standard for deploying React apps.

1. Create a free account on [Vercel](https://vercel.com/).
2. Click **Add New... -> Project**.
3. Import your GitHub repository.
4. **Vercel will now automatically detect your frontend!** (I have added a `vercel.json` file to the root of the project which handles the build configuration for you).
5. In the Vercel configuration screen, just add one thing:
   - **Environment Variables:**
     - Key: `REACT_APP_API_URL`
     - Value: `https://forensic-api-xyz.onrender.com` *(Paste the URL Render gave you in Step 2. Do not put a trailing slash `/` at the end).*
6. Click **Deploy**.

Vercel build times are usually 1-2 minutes. Once finished, you will get a live URL (e.g., `https://forensic-frontend.vercel.app`).

---

## Step 4: Test the Live App

1. Open your new Vercel URL in your browser.
2. Register a new user account.
3. Log in.
4. Upload the `sample_data.csv` file. 
   *(You can send this CSV file to your customer so they can test it themselves).*
5. Verify that the analysis runs and the PDF exports correctly.

You can now share the Vercel link and the sample CSV with your customer!
