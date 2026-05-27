"use client";
import { useRouter } from "next/navigation";
import {
  Select, SelectContent, SelectGroup,
  SelectItem, SelectTrigger, SelectValue,
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
  const d = new Date(s.created_at);
  const date = d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const label = s.summary?.health_score?.health_label;
  return label ? `${date} (${label})` : date;
}

export function SelectStatement({ summaries,url }: { summaries: Summary[],url:string }) {
  const router = useRouter();
  return (
    <Select onValueChange={(id) => router.push(`${url}/${id}`)}>
      <SelectTrigger className="size-50 text-xl p-6">
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
