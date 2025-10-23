# Smart Resume Screener

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
    API_KEY=your_gemini_api_key_goes_here
    ```

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
    *   Add the line `API_KEY=your_gemini_api_key_goes_here`, replacing the placeholder with your actual key.
    *   **Tip for Terminal Users:**
        *   Navigate to the project folder in your terminal.
        *   On Windows (PowerShell), run: `echo "API_KEY=your_key_here" > .env`
        *   On macOS/Linux, run: `echo "API_KEY=your_key_here" > .env`
        *   Then, open the file in a text editor to paste your actual key.

4.  **Install Dependencies:**
    *   Open a terminal directly within your code editor (in VS Code, go to `Terminal` -> `New Terminal`).
    *   Run the command: `npm install`
    *   This will create a `node_modules` folder in your project, which contains all the required packages.

5.  **Run the Application:**
    *   In the same terminal, run the command: `npm run dev`
    *   The server will start, and you can now access the application in your browser at the provided `localhost` address.
