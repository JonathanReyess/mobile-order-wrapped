# Mobile Order Wrapped

A full-stack web application with 5,200+ views and over 1,700 unique users that transforms Duke University mobile order receipts into a personalized Spotify Wrapped-style slideshow.

## Tech Stack

- **Frontend:** React (Vite), TypeScript, Tailwind CSS, Framer Motion, GSAP, React Router.
- **Backend:** Python (Flask), BeautifulSoup, Extract-msg.
- **AI:** Google Gemini 2.5 Flash.

---

## Getting Started

### 1. Clone

```bash
git clone https://github.com/JonathanReyess/mobile-order-wrapped.git
cd mobile-order-wrapped

```

### 2. Backend Setup

```bash
cd backend
# Create the environment with Python 3.9+
conda create --name mow python=3.11 -y
# Activate the environment
conda activate mobile-wrapped
# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder:

```text
GOOGLE_API_KEY=your_gemini_api_key
```

Run the server: `python app.py` (Defaults to `http://localhost:5000`)

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` folder:

```text
VITE_BACKEND_URL=http://localhost:5000
```

Run the app: `npm run dev`

---

## Project Structure

```text
├── backend/
│   ├── routes/                 # API Endpoints (Upload & Gemini Vibe logic)
│   ├── services/               # Logic for Receipt parsing & stats calculation
│   ├── utils/                  # Helper functions for time and data formatting
│   ├── app.py                  # Flask entry point
│   ├── extensions.py           # Shared logic (CORS, etc.)
│   ├── render.yaml             # Deployment config
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── public/                 # Static assets (textures, background images)
│   ├── src/
│   │   ├── pages/              # Main screens (Intro, Upload, Slides)
│   │   ├── components/         # Slides, layouts, and reusable UI
│   │   ├── hooks/              # API logic (useFileUpload, useVibe)
│   │   ├── styles/             # Global CSS and Tailwind styles
│   │   ├── utils/              # Helper functions for time and data formatting
│   │   ├── App.tsx             # Main Router
│   │   └── main.tsx            # App entry point
│   ├── tailwind.config.js      # Theme and custom animations
│   └── vercel.json             # Vercel deployment config
└── README.md                   # You are here!

```

## API Endpoints

- `POST /upload_emls`: Parses raw files and returns calculated statistics.
- `POST /api/generate-vibe`: Takes stats and returns an AI-generated roast.

---

## Privacy

This project is designed with a privacy-first approach for Duke students. We prioritize transparency regarding how your data is handled:

- All receipt parsing (.eml, .msg, .zip) occurs in volatile memory (RAM). Raw files are never written to a permanent disk or database.
- Aggregate statistics are sent to the Google Gemini API to generate your personalized roast. We do not extract or send personal names and this data is not used to train models.
- Diagnostic logs are maintained by our hosting provider (Render) for troubleshooting and are automatically deleted within 7 days.
