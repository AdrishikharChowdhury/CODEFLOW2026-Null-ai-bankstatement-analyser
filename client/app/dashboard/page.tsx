import { getSummaries } from "@/lib/actions/statements.action";
import { formatTimestamp } from "@/utils/format";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

const page = async () => {
  const user = await currentUser();
  if (!user) throw new Error("Not Authorized");
  const firstName = user.firstName;
  const lastName = user.lastName;
  const statements = await getSummaries(user.id);
  return (
    <main className="w-full flex flex-col gap-8 h-full">
      <p className="w-full text-left">
        Hello,{" "}
        <span className="text-2xl text-green-pea-200 font-extrabold">
          {firstName} {lastName}
        </span>
      </p>
      <div className="flex gap-6 flex-col w-full">
        {statements.length > 0 ? (
          <>
            <h1>Your Statements({statements.length}) </h1>
            <div className="flex gap-4 w-full">
              {statements.map((statement, idx) => (
                <Link key={idx} href={`/dashboard/${statement.id}`}>
                  <div className="bg-green-pea-1700 p-5 h-50 w-100 rounded-2xl flex flex-col justify-between">
                    <p className="text-2xl font-semibold">
                      Statement {idx + 1}
                    </p>
                    <p className="text-xl">
                      <span className="font-bold">Health Label:</span>{" "}
                      {statement.summary.health_score.health_label}
                    </p>
                    <div className="flex flex-col gap-4">
                      <p className="text-lg">
                        <span className="font-bold">Created At:</span>{" "}
                        {formatTimestamp(statement.created_at)}
                      </p>
                      <p className="underline self-end text-xs mr-4">
                        View Details
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <p className="text-4xl font-extralight text-center text-green-pea-400/70" >No Statements Generated</p>
        )}
      </div>
    </main>
  );
};

export default page;
