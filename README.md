# ✨ Smart Resume Screener ✨

An intelligent tool to parse resumes, extract key information, and score candidates against a job description using the Google Gemini API. This project features a resume screener, a resume builder, and an AI-powered recruitment consultant, all wrapped in a sleek, futuristic UI.

## 🌐 Live Demo

You can try the live application here: **[shailesh-22-bce-0406-vit-resumescre.vercel.app](https://shailesh-22-bce-0406-vit-resumescre.vercel.app/)**

---

## 🚀 Key Features

*   **AI-Powered Resume Analysis:** Extracts skills, experience, and education from resumes and calculates a match score against a job description.
*   **Structured Data Extraction:** Uses the Gemini API's JSON mode for reliable and consistent data parsing, ensuring the UI always receives predictable data.
*   **Side-by-Side Comparison:** Displays shortlisted candidates in a clean interface with a clear justification for their match score and extracted details.
*   **AI Resume Builder:** Fill out a simple form with your personal details, experience, and skills, and let the AI generate a professional, well-formatted resume for you.
*   **Interactive AI Consultant:** Chat with an AI assistant that has context on the job description and uploaded resumes to get strategic recruitment advice.
*   **Local History:** Your screening sessions are automatically saved in your browser's local storage for easy access and review later.
*   **Flexible File Parsing:** Accepts both `.pdf` and `.txt` resume files, or you can paste resume text directly.
*   **Modern Tech Stack:** Built with React, TypeScript, and Vite for a fast, modern, and type-safe development experience.
*   **Dynamic UI:** A futuristic, space-themed interface with animated backgrounds, glowing effects, and a responsive design that works on all screen sizes.

---

## ⚙️ How to Run This Project Locally

To try the app without installing Node.js or running any commands, you can use the self-contained HTML file.

### Step 1: Open the File
Simply open the `run_local_no_server.html` file in a modern web browser like Chrome, Firefox, or Edge.

### Step 2: Provide Your API Key
The application will prompt you to enter your Google Gemini API key. Get your key from **[Google AI Studio](https://aistudio.google.com/app/apikey)** and paste it into the input field to start using the app.

*   **Convenience:** The key will be saved in your browser's local storage, so you won't need to enter it again on the same machine.
*   **Security Note:** This method is provided for convenience. It is less secure because your API key is stored and handled directly in the browser.

---

## 🛠️ How It Works: A Technical Deep-Dive

This project runs entirely in your browser as a single, self-contained HTML file. It uses modern web technologies to deliver a full application experience without needing a server or installation steps.

### 1. Frontend: React in the Browser
The user interface is a **Single-Page Application (SPA)** built with **React**. Instead of a build step, the JSX code is compiled directly in the browser using the Babel Standalone library. This allows for a rich, component-based UI inside a single HTML file.

### 2. Gemini API Integration
This file is the brain of the AI integration, orchestrating all calls to the Gemini API directly from the browser. It uses the official `@google/genai` JavaScript SDK.

-   **API Key Handling:** When you first open the application, it prompts for your Google Gemini API key. This key is saved securely in your browser's **local storage**, so you don't have to enter it every time you visit. The key is only sent directly to Google's servers for API calls and is not stored anywhere else.
-   **`analyzeResumes` (JSON Mode):** For the complex resume analysis, the app makes a standard request and uses Gemini's JSON mode. By providing a strict schema, we ensure that the API's response is always a well-formed JSON object, which prevents runtime errors and makes the data easy to work with.
-   **Conversational Features (Streaming):** For interactive features like the AI Consultant and Resume Builder, the app uses streaming. This delivers the AI's response word-by-word, creating a real-time "typing" effect in the UI and providing a much more engaging user experience.

### 3. End-to-End Data Flow (Resume Screening Example)

1.  **User Input:** The user provides a job description and uploads resume files (`.pdf` or `.txt`).
2.  **Client-Side Parsing:** The browser uses the `pdf.js` library to read the files and extract raw text content. All parsing happens on your machine.
3.  **API Call:** The user clicks "Engage Hyperdrive". The application constructs a detailed prompt containing the job description, all resume texts, and a strict JSON schema.
4.  **Direct API Request:** The `@google/genai` SDK sends this prompt directly to the Google Gemini API, including your API key in the request headers.
5.  **AI Processing:** Gemini processes the prompt, performs the analysis, and generates a JSON object that perfectly matches the requested schema.
6.  **Response:** The JSON response is sent back directly to the browser.
7.  **UI Update:** The frontend receives the structured data, parses it, and updates the state, causing React to render the `CandidateCard` components with the analysis results.

---

## 🔧 Troubleshooting

If you encounter issues, please check the following:

### "API key is not valid" Error
-   **Check the Key and Project Settings:**
    1.  The issue might be with the key itself. Go to [Google AI Studio](https://aistudio.google.com/app/apikey), delete your current key, and **create a brand new one**.
    2.  Try pasting the new key into the application. You might need to refresh the page.
    3.  Make sure the **"Generative Language API"** is enabled in your Google Cloud Project: [Enable the API](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com).

### App doesn't load or is stuck
- **Use a Modern Browser:** Ensure you are using an up-to-date version of Google Chrome, Firefox, or Microsoft Edge.
- **Check your Internet Connection:** The application needs an internet connection to load libraries and communicate with the Gemini API.
- **Clear Browser Cache:** Sometimes old data can cause issues. Try clearing your browser's cache for this page.
