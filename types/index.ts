import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// School Statistics Types
export interface SchoolStats {
  schuljahr: string; // School year (e.g., "2024/25")
  bsn: string; // School number (BSN)
  name: string; // School name
  schuelerGesamt: number; // Total students (m/w/d)
  schuelerWeiblich: number; // Female students
  schuelerMaennlich: number; // Male students
  lehrkraefteGesamt: number; // Total teachers (m/w/d)
  lehrkraefteWeiblich: number; // Female teachers
  lehrkraefteMaennlich: number; // Male teachers
}

// Berlin Schools WFS API Types
export interface SchoolProperties {
  bsn: string; // School number (e.g., "01B01")
  schulname: string; // School name
  schulart: string; // School type (e.g., "Oberstufenzentrum", "Grundschule")
  traeger: string; // Operator (e.g., "öffentlich", "privat")
  schultyp: string; // School category (e.g., "Berufsschule", "Grundschule")
  bezirk: string; // District (e.g., "Mitte", "Charlottenburg-Wilmersdorf")
  ortsteil: string; // Neighborhood
  plz: string; // Postal code
  strasse: string; // Street name
  hausnr: string; // House number
  telefon: string; // Phone number
  fax: string; // Fax number
  email: string; // Email address
  internet: string; // Website URL
  schuljahr: string; // School year (e.g., "2025/26")
  constructionHistory?: ConstructionProject[]; // Associated construction projects
  isConstructionProject?: boolean; // Flag indicating this is a standalone construction project
  constructionData?: ConstructionProject; // Original construction project data for standalone projects
  stats?: SchoolStats; // School statistics (students, teachers)
  acceptsAfter4thGrade?: boolean; // Whether the school accepts students after 4th grade
}

export interface SchoolFeature {
  type: "Feature";
  id: string; // Feature ID (e.g., "schulen.01B01")
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  geometry_name: string; // Geometry field name (e.g., "geom")
  properties: SchoolProperties;
  bbox: [number, number, number, number]; // Bounding box
}

export interface SchoolsGeoJSON {
  type: "FeatureCollection";
  features: SchoolFeature[];
  totalFeatures: number; // Total number of features available
  numberMatched: number; // Number of features matching the query
  numberReturned: number; // Number of features in this response
  timeStamp: string; // ISO timestamp
  links?: Array<{
    // Pagination links
    title: string;
    type: string;
    rel: string;
    href: string;
  }>;
  crs: {
    // Coordinate reference system
    type: "name";
    properties: {
      name: string; // e.g., "urn:ogc:def:crs:EPSG::4326"
    };
  };
  bbox: [number, number, number, number]; // Overall bounding box
}

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

// Construction Projects API Types
export interface ConstructionProject {
  id: number;
  schulnummer: string; // School number (BSN)
  schulname: string; // School name
  bezirk: string; // District
  schulart: string; // School type
  baumassnahme: string; // Construction measure (e.g., "Sanierung; Erweiterung")
  beschreibung: string; // Description of the construction
  gebaute_schulplaetze: string; // Built school places
  schulplaetze_nach_baumassnahme: string; // School places after construction
  zuegigkeit_nach_baumassnahme: string; // Class tracks after construction
  nutzungsuebergabe: string; // Handover date (e.g., "2027/2028")
  gesamtkosten: string; // Total costs
  strasse: string; // Street
  plz: string; // Postal code
  ort: string; // City
}

export interface ConstructionProjectsResponse {
  messages: {
    messages: string[];
    success: boolean;
  };
  results: {
    count: number;
    items_per_page: number;
  };
  index: ConstructionProject[];
}

// Helper type for project status
export type ProjectStatus = "completed" | "ongoing" | "future" | "unknown";

export interface ProjectStatusInfo {
  status: ProjectStatus;
  completionYear?: number;
  isCompleted: boolean;
}
