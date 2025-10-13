import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { createEnrichedSchoolPrompt } from "@/app/api/summarize-school/prompts";
import { EnrichedSchool } from "@/types";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8080";
const API_VERSION = "v1";

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { schoolId } = body;

    // Validate required fields
    if (!schoolId) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 },
      );
    }

    // Fetch complete school data from backend API
    const schoolUrl = `${API_BASE_URL}/api/${API_VERSION}/schools/${schoolId}`;
    const schoolResponse = await fetch(schoolUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!schoolResponse.ok) {
      throw new Error(
        `Failed to fetch school data: ${schoolResponse.status} ${schoolResponse.statusText}`,
      );
    }

    const enrichedSchool: EnrichedSchool = await schoolResponse.json();

    // Build the prompt with complete school information
    const prompt = createEnrichedSchoolPrompt(enrichedSchool);

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;
    const summary = response.text();

    return NextResponse.json({
      success: true,
      summary,
      schoolName: enrichedSchool.school.name,
    });
  } catch (error: any) {
    console.error("Error generating school summary:", error);
    return NextResponse.json(
      {
        error: "Failed to generate summary",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
