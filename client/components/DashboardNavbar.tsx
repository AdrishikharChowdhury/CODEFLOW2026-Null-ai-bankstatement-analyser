import { dashboardLinks } from "@/lib/constants";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const DashboardNavbar = () => {
  return (
    <nav className="relative z-10 bg-green-pea-1800 mx-6 my-4 rounded-2xl px-10 py-6 flex justify-between items-center text-lg border-2 border-green-pea-300">
      <Link className="flex items-center justify-center gap-4" href="/dashboard">
        <Image
          src="/logo.svg"
          width={60}
          height={60}
          className="object-cover rounded-full"
          alt="logo"
        />
        <p className="text-2xl font-semibold" >Financialo</p>
      </Link>
      <ul className="hidden md:flex items-center gap-6  text-green-pea-300">
        {dashboardLinks.map((link) => (
          <Link
            key={link.name}
            href={link.link}
            className="transition-colors hover:text-green-pea-100"
          >
            {link.name}
          </Link>
        ))}
      </ul>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "h-12 w-12",
              userButtonTrigger: "scale-160",
            },
          }}
        />
      </div>
    </nav>
  );
};

export default DashboardNavbar;
