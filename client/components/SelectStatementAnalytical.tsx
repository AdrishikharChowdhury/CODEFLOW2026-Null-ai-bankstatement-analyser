"use client";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Summary {
  id: string;
  created_at: string;
  slug: string | null;
  summary: {
    health_score: {
      health_label: string;
    };
  };
}

function formatLabel(s: Summary) {
  if (s.slug) return s.slug;
  const date = new Date(s.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const label = s.summary?.health_score?.health_label;
  return label ? `${date} (${label})` : date;
}

export function SelectStatementAnalytical({
  summaries,
}: {
  summaries: Summary[];
}) {
  const router = useRouter();
  return (
    <Select onValueChange={(id) => router.push(`/dashboard/analytics/${id}`)}>
      <SelectTrigger className="w-45">
        <SelectValue placeholder="Statements" />
      </SelectTrigger>
      <SelectContent>
        {summaries.map((s) => (
          <SelectGroup key={s.id}>
            <SelectItem value={s.id}>{formatLabel(s)}</SelectItem>
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
