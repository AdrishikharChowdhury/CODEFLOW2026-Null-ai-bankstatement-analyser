"use client";
import { useRouter } from "next/navigation";
import {
  Select, SelectContent, SelectGroup,
  SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
interface Summary {
  id: string;
  created_at: string;
}
export function SelectStatement({ summaries }: { summaries: Summary[] }) {
  const router = useRouter();
  return (
    <Select onValueChange={(id) => router.push(`/dashboard/${id}`)}>
      <SelectTrigger className="w-45">
        <SelectValue placeholder="Statements" />
      </SelectTrigger>
      <SelectContent>
        {summaries.map((s, i) => (
          <SelectGroup key={s.id}>
            <SelectItem value={s.id}>Statement {i + 1}</SelectItem>
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}