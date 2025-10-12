import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// User-defined tags for schools
export interface SchoolTag {
  id: string; // Unique tag ID
  name: string; // Tag name (e.g., "Favorite", "Visited", "Interested")
  color: string; // Tag color for visual distinction
}

export interface SchoolTags {
  [schoolId: string]: string[]; // Map of school ID to array of tag IDs
}

// Custom location markers (Home, Work, etc.)
export type LocationType = "home" | "work";

export interface CustomLocation {
  type: LocationType;
  coordinates: [number, number]; // [longitude, latitude]
  label?: string; // Optional custom label
}

// Helper type for project status
export type ProjectStatus = "completed" | "ongoing" | "future" | "unknown";

export interface ProjectStatusInfo {
  status: ProjectStatus;
  completionYear?: number;
  isCompleted: boolean;
}

// Base School model
export interface School {
  id: number;
  school_number: string; // BSN - School number (e.g., "01B01")
  name: string; // School name
  school_type: string; // School type (e.g., "Gymnasium", "Grundschule")
  operator: string; // Operator (e.g., "öffentlich", "privat")
  school_category: string; // School category
  district: string; // District (Bezirk)
  neighborhood: string; // Neighborhood (Ortsteil)
  postal_code: string; // Postal code
  street: string; // Street name
  house_number: string; // House number
  phone: string; // Phone number
  fax: string; // Fax number
  email: string; // Email address
  website: string; // Website URL
  school_year: string; // School year (e.g., "2025/26")
  latitude: number; // Geographic coordinate
  longitude: number; // Geographic coordinate
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// School Detail model
export interface SchoolDetail {
  id: number;
  school_number: string; // BSN - Link to schools table
  school_name: string; // Name of the school
  languages: string; // Languages offered
  courses: string; // Advanced courses (Leistungskurse)
  offerings: string; // Programs and offerings
  available_after_4th_grade: boolean; // Accepts students after 4th grade
  additional_info: string; // Additional information
  equipment: string; // Equipment and facilities
  working_groups: string; // Working groups/extracurricular activities
  partners: string; // External partners
  differentiation: string; // Differentiation methods
  lunch_info: string; // Lunch information
  dual_learning: string; // Dual learning programs
  citizenship_data: string; // JSON string
  language_data: string; // JSON string
  residence_data: string; // JSON string
  absence_data: string; // JSON string
  scraped_at: string; // ISO timestamp
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// Citizenship statistics
export interface SchoolCitizenshipStat {
  id: number;
  school_number: string;
  citizenship: string; // e.g., "Europa (ohne Deutschland)", "Afrika"
  female_students: number;
  male_students: number;
  total: number;
  scraped_at: string; // ISO timestamp
  created_at: string; // ISO timestamp
}

// Language statistics
export interface SchoolLanguageStat {
  id: number;
  school_number: string;
  total_students: number;
  ndh_female_students: number; // Non-German heritage female
  ndh_male_students: number; // Non-German heritage male
  ndh_total: number; // Non-German heritage total
  ndh_percentage: number; // Percentage
  scraped_at: string; // ISO timestamp
  created_at: string; // ISO timestamp
}

// Residence statistics
export interface SchoolResidenceStat {
  id: number;
  school_number: string;
  district: string; // District where students live
  student_count: number;
  scraped_at: string; // ISO timestamp
  created_at: string; // ISO timestamp
}

// Absence statistics
export interface SchoolAbsenceStat {
  id: number;
  school_number: string;
  school_absence_rate: number;
  school_unexcused_rate: number;
  school_type_absence_rate: number;
  school_type_unexcused_rate: number;
  region_absence_rate: number;
  region_unexcused_rate: number;
  berlin_absence_rate: number;
  berlin_unexcused_rate: number;
  scraped_at: string; // ISO timestamp
  created_at: string; // ISO timestamp
}

// School statistics (students, teachers, classes by year)
export interface SchoolStatistic {
  id: number;
  school_number: string;
  school_name: string;
  district: string;
  school_type: string;
  school_year: string; // e.g., "2023/24"
  students: string; // Total number of students (m/w/d)
  students_male: string; // Number of male students
  students_female: string; // Number of female students
  teachers: string; // Total number of teachers (m,w,d)
  teachers_male: string; // Number of male teachers
  teachers_female: string; // Number of female teachers
  classes: string; // Number of classes
  metadata: string; // JSON string with additional metadata
  scraped_at: string; // ISO timestamp
  created_at: string; // ISO timestamp
}

// Construction Project model
export interface ConstructionProject {
  id: number;
  project_id: number;
  school_number: string;
  school_name: string;
  district: string;
  school_type: string;
  construction_measure: string;
  description: string;
  built_school_places: string;
  places_after_construction: string;
  class_tracks_after_construction: string;
  handover_date: string;
  total_costs: string;
  street: string;
  postal_code: string;
  city: string;
  latitude: number;
  longitude: number;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// Enriched School model (combines all data)
export interface EnrichedSchool {
  school: School;
  details?: SchoolDetail | null;
  citizenship_stats?: SchoolCitizenshipStat[];
  language_stat?: SchoolLanguageStat | null;
  residence_stats?: SchoolResidenceStat[];
  absence_stat?: SchoolAbsenceStat | null;
  statistics?: SchoolStatistic[];
  construction_projects?: ConstructionProject[];
}
