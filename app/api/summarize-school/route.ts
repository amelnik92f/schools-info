import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { schoolSummaryV2 } from "@/app/api/summarize-school/prompts";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
    const { schoolName } = body;

    // Validate required fields
    if (!schoolName) {
      return NextResponse.json(
        { error: "School name is required" },
        { status: 400 },
      );
    }

    // Build the prompt with school information
    const prompt = schoolSummaryV2(body);

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;
    const summary = response.text();

    return NextResponse.json({
      success: true,
      summary,
      schoolName,
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
