"use client";

interface DetailFieldSectionProps {
  icon: string;
  title: string;
  content: string;
}

export function DetailFieldSection({ icon, title, content }: DetailFieldSectionProps) {
  if (!content || !content.trim()) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-foreground">
          {icon} {title}
        </span>
      </div>
      <div className="p-3 rounded-lg bg-content2">
        <p className="text-xs text-default-700 leading-relaxed whitespace-pre-line">
          {content}
        </p>
      </div>
    </div>
  );
}

