"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getSummaries, deleteStatement } from "@/lib/actions/statements.action";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { formatTimestamp } from "@/utils/format";

interface Statement {
  id: string;
  created_at: string;
  slug: string | null;
  summary: {
    health_score: {
      health_label: string;
    };
  };
}

export default function ManageStatements() {
  const { user } = useUser();
  const router = useRouter();
  const [statements, setStatements] = React.useState<Statement[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    getSummaries(user.id).then(setStatements).finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this statement? This cannot be undone.");
    if (!confirmed) return;

    try {
      await deleteStatement(id);
      toast("Statement deleted");
      setStatements((prev) => prev.filter((s) => s.id !== id));
    } catch {
      toast("Failed to delete statement");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Manage Statements</CardTitle>
        <CardDescription>
          View and delete your uploaded bank statements.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading statements...</p>
        ) : statements.length === 0 ? (
          <p className="text-muted-foreground text-sm">No statements uploaded yet.</p>
        ) : (
          <div className="space-y-1">
            {statements.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <span className="text-sm">
                  {formatTimestamp(s.created_at)}
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(s.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
