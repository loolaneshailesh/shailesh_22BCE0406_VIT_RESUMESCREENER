import { GoogleGenAI, Type } from "@google/genai";
import type { Candidate, Resume, ConsultantMessage, ResumeBuilderData } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const buildPrompt = (jobDescription: string, resumes: Resume[]): string => {
  const resumeTexts = resumes.map(r => 
    `--- RESUME START ---\nID: ${r.id}\nFILENAME: ${r.fileName}\n\n${r.text}\n--- RESUME END ---`
  ).join('\n\n');

  return `
    You are an expert technical recruiter and hiring manager with decades of experience. Your task is to analyze the provided resumes against the given job description.

    JOB DESCRIPTION:
    ${jobDescription}

    RESUMES:
    ${resumeTexts}

    INSTRUCTIONS:
    For each resume provided, perform the following actions:
    1.  Carefully read the resume and compare its content against the job description.
    2.  Extract the candidate's full name. If it's not available, use the resume's FILENAME as the name.
    3.  Assign a "matchScore" from 1 (poor fit) to 10 (perfect fit).
    4.  Write a concise "justification" (2-3 sentences) explaining the score, highlighting strengths and weaknesses.
    5.  Extract a list of key "extractedSkills" relevant to the job description.
    6.  Provide a brief "extractedExperienceSummary" of the candidate's professional history.

    You MUST provide the output in a valid JSON array format, adhering strictly to the provided schema. Each object in the array should represent one resume analysis. Do not include any text or markdown formatting before or after the JSON array.
  `;
};

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: {
        type: Type.STRING,
        description: "The unique ID of the resume being analyzed.",
      },
      name: {
        type: Type.STRING,
        description: "The candidate's full name, extracted from the resume.",
      },
      matchScore: {
        type: Type.NUMBER,
        description: "A score from 1 to 10 indicating the match with the job description.",
      },
      justification: {
        type: Type.STRING,
        description: "A brief explanation for the assigned match score.",
      },
      extractedSkills: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description: "A list of relevant skills found in the resume."
      },
      extractedExperienceSummary: {
        type: Type.STRING,
        description: "A short summary of the candidate's work experience."
      },
    },
    required: ["id", "name", "matchScore", "justification", "extractedSkills", "extractedExperienceSummary"],
  },
};


export const analyzeResumes = async (jobDescription: string, resumes: Resume[]): Promise<Candidate[]> => {
  const prompt = buildPrompt(jobDescription, resumes);
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
    },
  });

  const jsonText = response.text.trim();
  
  try {
    const parsedData: Candidate[] = JSON.parse(jsonText);
    return parsedData;
  } catch (error) {
    console.error("Failed to parse JSON response:", jsonText);
    throw new Error("Could not parse the analysis from the AI model.");
  }
};


export const askQuestionAboutResume = async (
  resumeText: string, 
  question: string, 
  jobDescription: string
): Promise<string> => {
  const prompt = `
    You are an expert career coach and hiring manager. Your task is to answer a specific question about a candidate's resume, providing insightful advice and analysis. 
    Use the context of both the resume and the job description to formulate your answer.
    You can answer questions literally based on the resume, or you can provide advice, suggest improvements, or identify gaps. Be helpful, insightful, and constructive.

    CONTEXT:

    --- JOB DESCRIPTION START ---
    ${jobDescription || 'No job description provided.'}
    --- JOB DESCRIPTION END ---

    --- RESUME TEXT START ---
    ${resumeText}
    --- RESUME TEXT END ---

    USER'S QUESTION:
    ${question}

    YOUR INSIGHTFUL ANSWER:
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error asking question about resume:", error);
    throw new Error("The AI assistant could not process your question at this time.");
  }
};


export const askConsultant = async (
  jobDescription: string,
  resumes: Resume[],
  messages: ConsultantMessage[]
): Promise<string> => {
  const resumeFileNames = resumes.map(r => r.fileName).join(', ') || 'None';
  
  const conversationHistory = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');

  const prompt = `
    You are an AI-powered Career and Recruitment Consultant. Your goal is to provide actionable advice to users to help them improve their job descriptions or resumes. Use the provided context of the current job description and uploaded resumes to give specific, helpful feedback. Be encouraging and professional.

    CONTEXT:
    - Current Job Description: ${jobDescription || 'Not provided yet.'}
    - Loaded Resumes: ${resumeFileNames}

    CONVERSATION HISTORY:
    ${conversationHistory}

    Based on all the context and the conversation history, provide a helpful and concise answer to the user's last message.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error with AI Consultant:", error);
    throw new Error("The AI consultant is unavailable at this moment.");
  }
};

export const generateResumeFromDetails = async (data: ResumeBuilderData): Promise<string> => {
  const prompt = `
    You are a professional resume writer. Your task is to generate a clean, professional, and effective resume in plain text format based on the structured data provided by the user.
    Use strong action verbs and maintain a professional tone. Format the output logically with clear sections. For work experience, list responsibilities as bullet points.

    USER-PROVIDED DATA:
    - Full Name: ${data.fullName}
    - Contact: ${data.email} | ${data.phoneNumber} | ${data.address}
    
    --- PROFESSIONAL SUMMARY ---
    ${data.summary}

    --- WORK EXPERIENCE ---
    ${data.workExperience.map(exp => `
    - Company: ${exp.company}
    - Job Title: ${exp.jobTitle}
    - Dates: ${exp.startDate} to ${exp.endDate}
    - Responsibilities:
      ${exp.responsibilities.split('\n').map(line => `  - ${line}`).join('\n')}
    `).join('\n')}

    --- EDUCATION ---
    ${data.education.map(edu => `
    - Institution: ${edu.school}
    - Degree: ${edu.degree}
    - Dates: ${edu.startDate} to ${edu.endDate}
    `).join('\n')}

    --- SKILLS ---
    ${data.skills}

    INSTRUCTIONS:
    Generate the complete resume text based on the data above. Ensure the formatting is clean and easy to read.
    Start with the candidate's name and contact information.
    Follow with the sections: Professional Summary, Work Experience, Education, and Skills.
    Do not include any introductory text like "Here is your resume". Just provide the resume content itself.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating resume:", error);
    throw new Error("The AI assistant could not generate the resume at this time.");
  }
};