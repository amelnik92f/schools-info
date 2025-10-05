import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "",
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schoolName, schoolType, address, website, bezirk, stats } = body;

    // Validate required fields
    if (!schoolName) {
      return NextResponse.json(
        { error: "School name is required" },
        { status: 400 },
      );
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 },
      );
    }

    // Build the prompt with school information
    const prompt = `You are an educational consultant analyzing Berlin schools. Please provide a comprehensive summary of the following school:

School Name: ${schoolName}
School Type: ${schoolType || "N/A"}
Address: ${address || "N/A"}
District: ${bezirk || "N/A"}
Website: ${website || "N/A"}
${stats ? `
Student Statistics:
- Total Students: ${stats.schuelerGesamt}
- Female Students: ${stats.schuelerWeiblich}
- Male Students: ${stats.schuelerMaennlich}
- Total Teachers: ${stats.lehrkraefteGesamt}
- Student-Teacher Ratio: ${(stats.schuelerGesamt / stats.lehrkraefteGesamt).toFixed(1)}:1
` : ""}

Please analyze this school and provide a concise summary covering:
• School Profile & Uniqueness
• Educational Focus & Specializations
• Languages Offered
• Special Programs & Activities
• Notable Facilities

${website ? `If possible, visit the school's website (${website}) to gather accurate information. If you cannot access the website, provide general information based on the school type and statistics.` : "Based on the school type and available information, provide a general overview."}

IMPORTANT FORMATTING RULES:
- Keep the response under 150 words
- Use short bullet points (•) instead of numbered lists
- Use **bold** for section headers
- Keep sentences concise and to the point
- Avoid repetition
- Focus on the most important and unique aspects`;

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