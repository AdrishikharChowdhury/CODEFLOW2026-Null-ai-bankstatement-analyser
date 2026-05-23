import { UserButton } from '@clerk/nextjs'
import Image from "next/image"
import Link from "next/link"

const dashboardLinks = [
  { name: "Dashboard", link: "/dashboard" },
  { name: "Analytics", link: "/dashboard/analytics" },
  { name: "Statements", link: "/dashboard/statements" },
  { name: "Settings", link: "/dashboard/settings" },
]

const DashboardNavbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-green-pea-800 bg-green-pea-1900/80 backdrop-blur-md px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/dashboard">
          <Image src="/logo.png" width={120} height={60} className="object-cover" alt="logo" />
        </Link>

        <ul className="hidden md:flex items-center gap-6 text-sm text-green-pea-300">
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
                userButtonAvatarBox: "h-9 w-9",
              },
            }}
          />
        </div>
      </div>
    </nav>
  )
}

export default DashboardNavbar
