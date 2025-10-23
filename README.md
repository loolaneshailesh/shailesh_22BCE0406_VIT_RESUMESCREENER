# Smart Resume Screener

## 🌐 Live Demo

You can try the live application here: **[shailesh-22-bce-0406-vit-resumescre.vercel.app](https://shailesh-22-bce-0406-vit-resumescre.vercel.app/)**

An intelligent tool to parse resumes, extract key information, and score candidates against a job description using the Google Gemini API. This project features a resume screener, a resume builder, and an AI-powered recruitment consultant, all wrapped in a sleek, futuristic UI.

## ✨ Key Features

*   **AI-Powered Resume Analysis:** Extracts skills, experience, and education from resumes and calculates a match score against a job description.
*   **Structured Data Extraction:** Uses the Gemini API's JSON mode for reliable and consistent data parsing.
*   **Side-by-Side Comparison:** Displays shortlisted candidates with a clear justification for their match score.
*   **AI Resume Builder:** Generate a professional, well-formatted resume from your personal details, experience, and skills.
*   **Interactive AI Consultant:** Chat with an AI assistant that has context on the job description and resumes to get recruitment advice.
*   **Local History:** Your screening sessions are saved in your browser's local storage for easy access.
*   **File Parsing:** Accepts both `.pdf` and `.txt` resume files, or direct text paste.
*   **Modern Tech Stack:** Built with React, TypeScript, and Vite for a fast and modern development experience.
*   **Dynamic UI:** A futuristic, space-themed interface with dynamic backgrounds and glowing effects.

---

## 🚀 How to Run This Project Locally

This project is set up to run locally using **Vite**, a modern frontend build tool. Follow these simple steps to get the application running on your machine.

### Step 1: Create the Environment File

This file securely stores your secret API key.

1.  In the root directory of the project, create a new file named **`.env`**.
2.  Open the `.env` file and add your Google Gemini API key in the following format. You can get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey).

    ```
    VITE_API_KEY=your_gemini_api_key_goes_here
    ```
    **Important:** The variable name **must** start with `VITE_` for the application to be able to access it.

### Step 2: Install Dependencies

This command will download all the necessary libraries (like React) that the project needs to run.

1.  Open your terminal in the project's root folder.
2.  Run the following command:
    ```bash
    npm install
    ```

### Step 3: Start the Development Server

This command will launch the application.

1.  In the same terminal, run:
    ```bash
    npm run dev
    ```
2.  Your terminal will display a local URL, usually **`http://localhost:5173`**. Open this URL in your web browser to see the application live!

---

## ⚙️ How It Works: A Technical Deep-Dive

This project uses a modern frontend architecture to deliver a seamless user experience while securely interacting with the powerful Google Gemini API.

### 1. Frontend: React & Vite
The user interface is a **Single-Page Application (SPA)** built with **React** and **TypeScript**. This provides a fast, responsive, and type-safe foundation. The entire local development environment is powered by **Vite**, which offers a lightning-fast development server and an optimized build process.

### 2. Backend Communication: The Vite Proxy
A critical aspect of this application is securely handling the Gemini API key. The key is **never exposed to the browser for API calls**. This is achieved using Vite's built-in development server proxy, configured in `vite.config.ts`.

- When the frontend makes an API call to a local path like `/api/proxy-pro`, the Vite server intercepts it.
- It then forwards this request to the actual Google Generative AI endpoint (`https://generativelanguage.googleapis.com/...`).
- During this forwarding process, it securely attaches the `VITE_API_KEY` from your local `.env` file to the request.
- This means the browser only ever communicates with your local server, and the secret key remains safe on the server-side for all API transactions.

### 3. Gemini API Integration (`services/geminiService.ts`)
This file is the brain of the AI integration, orchestrating all calls to the Gemini API. To simplify the architecture and **allow the project to be run with a free-tier API key without a billing account**, it now uses the versatile `gemini-2.5-flash` model for all tasks.

-   **`analyzeResumes` (Non-Streaming):** For the complex resume analysis, the app makes a standard request and receives a complete, structured JSON object. This is enabled by Gemini's JSON mode, which ensures reliable data parsing.
-   **Conversational Features (Streaming):** For interactive features like the AI Consultant, the app uses streaming to deliver the AI's response word-by-word, creating a real-time "typing" effect in the UI.

### 4. End-to-End Data Flow (Resume Screening)

1.  **User Input:** The user provides a job description and uploads resume files (`.pdf` or `.txt`).
2.  **Client-Side Parsing:** The browser uses the `pdf.js` library (in `services/fileParsers.ts`) to read the files and extract raw text content. No data has been sent to a server yet.
3.  **API Call:** The user clicks "Engage Hyperdrive". The `App.tsx` component calls the `analyzeResumes` function.
4.  **Prompt & Proxy:** `geminiService.ts` constructs a detailed prompt containing the job description, all resume texts, and the strict JSON schema. It sends this entire payload to the local `/api/proxy-pro` endpoint.
5.  **Secure Forwarding:** The Vite server proxies the request, attaching the API key and sending it to the Google Gemini API.
6.  **AI Processing:** Gemini processes the prompt, performs the analysis, and generates a JSON object that perfectly matches the requested schema.
7.  **Response:** The JSON response is sent back to the Vite proxy, which forwards it to the frontend application.
8.  **UI Update:** The frontend receives the structured data, parses it, and updates the state, causing React to render the `CandidateCard` components with the analysis results.

---

## troubleshooting

### API Key Connection Failed

If you see a red banner at the top of the application indicating an API key failure, this is the most common setup issue. The banner will show you a masked version of the key it's trying to use (e.g., `VITE...W8I`).

-   **If the masked key appears correctly:** This means your `.env` file is being read! The problem is with the key itself or your Google Cloud Project.
    1.  **Create a New Key:** The fastest solution is to go to [Google AI Studio](https://aistudio.google.com/app/apikey), delete your current key, and **create a brand new one**.
    2.  **Enable the API:** Make sure the **"Generative Language API"** is enabled in your Google Cloud Project. You can do so here: [Enable the API](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com).
    3.  **Check Billing:** For full model access, a billing account must be linked to your Google Cloud Project.
    4.  **Restart the Server:** After pasting the new key into your `.env` file, you **must** stop (`Ctrl+C`) and restart (`npm run dev`) your Vite server.

-   **If the banner says "VITE_API_KEY not found":** This means there is a problem with your `.env` file itself.
    1.  Ensure the file is in the **root** of your project.
    2.  Ensure it is named exactly `.env`.
    3.  Ensure the variable inside is named `VITE_API_KEY`.

---

## 🛠️ Detailed Local Setup Guide

If you are setting up the project for the first time, you may need to install some prerequisite tools.

### Prerequisites

1.  **Node.js:** This is the runtime environment for JavaScript. Installing it will also install `npm`, the package manager. You can download it from the official [Node.js website](https://nodejs.org/). We recommend the LTS (Long-Term Support) version.
2.  **A Code Editor:** We recommend using [Visual Studio Code](https://code.visualstudio.com/), which is free and has excellent support for web development.
3.  **A Terminal/Command Line:**
    *   **Windows:** You can use PowerShell or the built-in Command Prompt.
    *   **macOS/Linux:** You can use the built-in Terminal.

### Step-by-Step Instructions

1.  **Download or Clone the Project:** Get all the project files onto your computer.

2.  **Open the Project in Your Code Editor:** Launch VS Code (or your editor of choice) and open the project folder.

3.  **Create the `.env` File:**
    *   In your editor's file explorer, create a new file in the root directory and name it `.env`.
    *   Add the line `VITE_API_KEY=your_gemini_api_key_goes_here`, replacing the placeholder with your actual key.
    *   **Tip for Terminal Users:**
        *   Navigate to the project folder in your terminal.
        *   On Windows (PowerShell), run: `echo "VITE_API_KEY=your_key_here" > .env`
        *   On macOS/Linux, run: `echo "VITE_API_KEY=your_key_here" > .env`
        *   Then, open the file in a text editor to paste your actual key.

4.  **Install Dependencies:**
    *   Open a terminal directly within your code editor (in VS Code, go to `Terminal` -> `New Terminal`).
    *   Run the command: `npm install`
    *   This will create a `node_modules` folder in your project, which contains all the required packages.

5.  **Run the Application:**
    *   In the same terminal, run the command: `npm run dev`
    *   The server will start, and you can now access the application in your browser at the provided `localhost` address.