type SchoolSummaryParams = {
  schoolName: string;
  schoolType?: string;
  address?: string;
  bezirk?: string;
  website?: string;
  stats?: {
    schuelerGesamt: number;
    lehrkraefteGesamt: number;
    schuelerWeiblich: number;
    schuelerMaennlich: number;
  };
};

export const schoolSummaryV1 = ({
  schoolName,
  schoolType,
  address,
  bezirk,
  website,
  stats,
}: SchoolSummaryParams) => `You are an educational consultant analyzing Berlin schools. Please provide a comprehensive summary of the following school:

School Name: ${schoolName}
School Type: ${schoolType || "N/A"}
Address: ${address || "N/A"}
District: ${bezirk || "N/A"}
Website: ${website || "N/A"}
${
  stats
    ? `
Student Statistics:
- Total Students: ${stats.schuelerGesamt}
- Female Students: ${stats.schuelerWeiblich}
- Male Students: ${stats.schuelerMaennlich}
- Total Teachers: ${stats.lehrkraefteGesamt}
- Student-Teacher Ratio: ${(stats.schuelerGesamt / stats.lehrkraefteGesamt).toFixed(1)}:1
`
    : ""
}

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

export const schoolSummaryV2 = ({
  schoolName,
  schoolType,
  address,
  bezirk,
  website,
  stats,
}: any) => `You are an expert educational consultant creating brief, informative profiles of Berlin schools for international parents. Your tone should be professional yet accessible, clear, and direct.

**School Data:**
- Name: ${schoolName}
- Type: ${schoolType || "N/A"}
- Address: ${address || "N/A"}
- District: ${bezirk || "N/A"}
- Website: ${website || "N/A"}
${
  stats
    ? `- Total Students: ${stats.schuelerGesamt}
- Student-Teacher Ratio: ${(stats.schuelerGesamt / stats.lehrkraefteGesamt).toFixed(1)}:1
`
    : ""
}

**Task:**
Synthesize the data above into a concise school profile.

1.  **Prioritize the official website** (${website}) for qualitative information (educational focus, programs, facilities).
2.  **Use the provided statistics** for quantitative data points.
3.  **If the website is inaccessible**, generate a general profile based on the school's type (e.g., 'Gymnasium,' 'Grundschule') and location.

**Output Requirements:**
- **Total Length:** Must be under 150 words.
- **Structure:** Use the following **bold** headers:
    - **Profile:**
    - **Academics & Languages:**
    - **Extracurriculars & Facilities:**
- **Formatting:** Use short, concise bullet points (•).
- **Style:** Focus on the most important and unique aspects. Avoid jargon and conversational filler (e.g., "This school seems to offer...").`;
