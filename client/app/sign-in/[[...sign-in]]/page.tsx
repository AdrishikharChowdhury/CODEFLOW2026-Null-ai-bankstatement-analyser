import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center dark:bg-indigo-950">
      <SignIn />
    </div>
  );
}
