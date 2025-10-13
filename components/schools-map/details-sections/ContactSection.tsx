"use client";

import { Link } from "@heroui/link";
import { EnrichedSchool, ConstructionProject } from "@/types";

function createGoogleEarthLink(latitude: number, longitude: number): string {
  const fixedUrlEnd =
    ",65.01509008a,464.25589089d,35y,264.46221151h,60t,0r/data=CgRCAggBKAJCAggASg0I____________ARAA";
  const fullUrl = `https://earth.google.com/web/@${latitude},${longitude}${fixedUrlEnd}`;
  return fullUrl;
}

interface ContactSectionProps {
  item: EnrichedSchool | ConstructionProject;
}

export function ContactSection({ item }: ContactSectionProps) {
  const isSchool = "school" in item;
  const isStandaloneProject = !isSchool;

  const enrichedSchool = isSchool ? (item as EnrichedSchool) : null;
  const standaloneProject = isStandaloneProject ? (item as ConstructionProject) : null;

  const school = enrichedSchool?.school || null;

  const street = school?.street || standaloneProject?.street || "";
  const houseNumber = school?.house_number || "";
  const postalCode = school?.postal_code || standaloneProject?.postal_code || "";
  const latitude = school?.latitude || standaloneProject?.latitude || 0;
  const longitude = school?.longitude || standaloneProject?.longitude || 0;
  const website = school?.website || "";
  const phone = school?.phone || "";
  const email = school?.email || "";
  const district = school?.district || standaloneProject?.district || "";
  const city = standaloneProject?.city || "Berlin";
  const schoolType = school?.school_category || standaloneProject?.school_type || "";

  // For standalone projects, show construction details
  if (isStandaloneProject && standaloneProject) {
    return (
      <div className="space-y-3 text-sm text-default-700">
        <div>
          <span className="font-semibold text-foreground">📍 Location:</span>
          <p className="mt-1">
            {street}
            <br />
            {postalCode} {city}, {district}
          </p>
        </div>

        <div>
          <span className="font-semibold text-foreground">🏫 School Type:</span>
          <p className="mt-1">{schoolType}</p>
        </div>

        <div>
          <span className="font-semibold text-foreground">🔨 Construction Type:</span>
          <p className="mt-1">{standaloneProject.construction_measure}</p>
        </div>

        <div>
          <span className="font-semibold text-foreground">📝 Description:</span>
          <p className="mt-1 leading-relaxed">{standaloneProject.description}</p>
        </div>

        {standaloneProject.handover_date && (
          <div>
            <span className="font-semibold text-foreground">📅 Expected Completion:</span>
            <p className="mt-1">{standaloneProject.handover_date}</p>
          </div>
        )}

        {standaloneProject.total_costs && (
          <div>
            <span className="font-semibold text-foreground">💰 Total Cost:</span>
            <p className="mt-1">{standaloneProject.total_costs}</p>
          </div>
        )}

        <div>
          <span className="font-semibold text-foreground">🌍 Location:</span>
          <div className="mt-1">
            <Link
              href={createGoogleEarthLink(latitude, longitude)}
              isExternal
              size="sm"
              className="text-primary"
            >
              View on Google Earth
            </Link>
          </div>
        </div>

        {(standaloneProject.places_after_construction !== "k.A." ||
          standaloneProject.class_tracks_after_construction !== "k.A.") && (
          <div>
            <span className="font-semibold text-foreground">
              📊 Capacity After Construction:
            </span>
            {standaloneProject.places_after_construction !== "k.A." && (
              <p className="mt-1">Places: {standaloneProject.places_after_construction}</p>
            )}
            {standaloneProject.class_tracks_after_construction !== "k.A." && (
              <p className="mt-1">
                Tracks: {standaloneProject.class_tracks_after_construction}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // For schools, show contact information
  return (
    <div className="space-y-2 text-sm text-default-700">
      <div className="flex items-start gap-2">
        <span className="text-base">📍</span>
        <span>
          {street} {houseNumber}
          <br />
          {postalCode} Berlin, {district}
        </span>
      </div>

      {phone && (
        <div className="flex items-center gap-2">
          <span className="text-base">📞</span>
          <span>{phone}</span>
        </div>
      )}

      {email && (
        <div className="flex items-center gap-2">
          <span className="text-base">✉️</span>
          <Link href={`mailto:${email}`} size="sm" className="text-primary">
            {email}
          </Link>
        </div>
      )}

      {website && (
        <div className="flex items-center gap-2">
          <span className="text-base">🌐</span>
          <Link href={website} isExternal size="sm" className="text-primary break-all">
            {website}
          </Link>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-base">🌍</span>
        <Link
          href={createGoogleEarthLink(latitude, longitude)}
          isExternal
          size="sm"
          className="text-primary"
        >
          View on Google Earth
        </Link>
      </div>
    </div>
  );
}

