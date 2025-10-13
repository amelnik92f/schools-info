import { EnrichedSchool } from "@/types";

type SchoolSummaryParams = {
  schoolName: string;
  schoolType?: string;
  address?: string;
  bezirk?: string;
  website?: string;
  stats?: {
    total_students: number;
    total_teachers: number;
    female_students?: number;
    male_students?: number;
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
- Total Students: ${stats.total_students}${stats.female_students && stats.male_students ? ` (${stats.female_students} female, ${stats.male_students} male)` : ""}
- Total Teachers: ${stats.total_teachers}
- Student-Teacher Ratio: ${(stats.total_students / stats.total_teachers).toFixed(1)}:1
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
    ? `- Total Students: ${stats.total_students}${stats.female_students && stats.male_students ? ` (${stats.female_students} female, ${stats.male_students} male)` : ""}
- Student-Teacher Ratio: ${(stats.total_students / stats.total_teachers).toFixed(1)}:1
${stats.total_classes ? `- Total Classes: ${stats.total_classes}` : ""}
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

export function createEnrichedSchoolPrompt(data: EnrichedSchool): string {
  const { school, details, statistics, language_stat, citizenship_stats, residence_stats, absence_stat } = data;
  const stats = statistics && statistics.length > 0 ? statistics[0] : null;

  let prompt = `You are an expert educational consultant creating brief, informative profiles of Berlin schools for international parents. Your tone should be professional yet accessible, clear, and direct.

**School Basic Information:**
- Name: ${school.name}
- Type: ${school.school_category}
- Operator: ${school.operator}
- Address: ${school.street} ${school.house_number}, ${school.postal_code} Berlin
- District: ${school.district}, ${school.neighborhood}
- Website: ${school.website || "N/A"}
- Phone: ${school.phone || "N/A"}
- Email: ${school.email || "N/A"}
`;

  // Add statistics if available
  if (stats) {
    prompt += `
**Student & Teacher Statistics (${stats.school_year}):**
- Total Students: ${stats.students} (${stats.students_female} female, ${stats.students_male} male)
- Total Teachers: ${stats.teachers} (${stats.teachers_female} female, ${stats.teachers_male} male)
- Total Classes: ${stats.classes}
- Student-Teacher Ratio: ${(Number(stats.students) / Number(stats.teachers)).toFixed(1)}:1
`;
  }

  // Add language/heritage statistics
  if (language_stat) {
    prompt += `
**Language & Heritage Statistics:**
- Total Students: ${language_stat.total_students}
- Students with Non-German Heritage: ${language_stat.ndh_total} (${language_stat.ndh_percentage.toFixed(1)}%)
  - Female: ${language_stat.ndh_female_students}, Male: ${language_stat.ndh_male_students}
`;
  }

  // Add citizenship statistics
  if (citizenship_stats && citizenship_stats.length > 0) {
    const totalRow = citizenship_stats.find(s => s.citizenship.toLowerCase() === 'insgesamt');
    if (totalRow) {
      prompt += `
**Citizenship Statistics:**
- Students with Non-German Citizenship: ${totalRow.total} (${totalRow.female_students} female, ${totalRow.male_students} male)
- Regional Distribution: ${citizenship_stats.filter(s => s.citizenship.toLowerCase() !== 'insgesamt').map(s => `${s.citizenship}: ${s.total}`).join(', ')}
`;
    }
  }

  // Add residence statistics
  if (residence_stats && residence_stats.length > 0) {
    const topDistricts = residence_stats
      .sort((a, b) => b.student_count - a.student_count)
      .slice(0, 5)
      .map(s => `${s.district} (${s.student_count})`)
      .join(', ');
    prompt += `
**Student Residence Distribution:**
- Top districts where students live: ${topDistricts}
`;
  }

  // Add absence statistics
  if (absence_stat) {
    prompt += `
**Absence Statistics:**
- School Absence Rate: ${absence_stat.school_absence_rate.toFixed(1)}% (Unexcused: ${absence_stat.school_unexcused_rate.toFixed(1)}%)
- School Type Average: ${absence_stat.school_type_absence_rate.toFixed(1)}% (Unexcused: ${absence_stat.school_type_unexcused_rate.toFixed(1)}%)
- Berlin Average: ${absence_stat.berlin_absence_rate.toFixed(1)}% (Unexcused: ${absence_stat.berlin_unexcused_rate.toFixed(1)}%)
`;
  }

  // Add detailed school information
  if (details) {
    if (details.languages) {
      prompt += `
**Languages Offered:**
${details.languages}
`;
    }

    if (details.courses) {
      prompt += `
**Advanced Courses (Leistungskurse):**
${details.courses}
`;
    }

    if (details.offerings) {
      prompt += `
**Programs & Special Offerings:**
${details.offerings}
`;
    }

    if (details.equipment) {
      prompt += `
**Equipment & Facilities:**
${details.equipment}
`;
    }

    if (details.working_groups) {
      prompt += `
**Working Groups & Extracurricular Activities:**
${details.working_groups}
`;
    }

    if (details.partners) {
      prompt += `
**External Partners:**
${details.partners}
`;
    }

    if (details.differentiation) {
      prompt += `
**Differentiation & Teaching Methods:**
${details.differentiation}
`;
    }

    if (details.lunch_info) {
      prompt += `
**Lunch & Meal Services:**
${details.lunch_info}
`;
    }

    if (details.dual_learning) {
      prompt += `
**Dual Learning Programs:**
${details.dual_learning}
`;
    }

    if (details.additional_info) {
      prompt += `
**Additional Information:**
${details.additional_info}
`;
    }

    if (details.available_after_4th_grade !== undefined) {
      prompt += `
**Enrollment:** Accepts students after 4th grade: ${details.available_after_4th_grade ? "Yes" : "No"}
`;
    }
  }

  prompt += `
**Task:**
Synthesize all the data above into a concise, informative school profile.

1. **Prioritize the official website** (${school.website || "N/A"}) for additional qualitative information if needed.
2. **Use all the provided data** to create an accurate, comprehensive summary.
3. **Focus on unique characteristics** that distinguish this school.

**Output Requirements:**
- **Total Length:** Must be under 300 words (given the rich data available, be comprehensive but concise).
- **Structure:** Use the following **bold** headers:
    - **Profile:**
    - **Academics & Languages:**
    - **Diversity & Student Body:**
    - **Extracurriculars & Facilities:**
- **Formatting:** Use short, concise bullet points (•).
- **Style:** Be factual and specific. Use actual numbers and statistics from the data. Avoid generic statements and conversational filler. Focus on concrete details that help parents make informed decisions.
`;

  return prompt;
}
