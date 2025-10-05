import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

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
