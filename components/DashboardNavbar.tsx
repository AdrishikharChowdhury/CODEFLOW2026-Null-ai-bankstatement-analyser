import { dashboardLinks } from "@/lib/constants";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";



const DashboardNavbar = () => {
  return (
    <nav className="relative z-10 bg-green-pea-1600 mx-6 my-4 rounded-2xl px-10 py-6 flex justify-between items-center text-lg border-2 border-green-pea-300">
      <Link href="/dashboard">
        <Image
          src="/logo.png"
          width={180}
          height={90}
          className="object-cover"
          alt="logo"
        />
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
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "h-12 w-12", // avatar size
              userButtonTrigger: "scale-160", // or scale the whole trigger
            },
          }}
        />
      </div>
    </nav>
  );
};

export default DashboardNavbar;
