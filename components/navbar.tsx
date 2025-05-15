"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavbarProps {
  orientation?: "horizontal" | "vertical"
}

export function Navbar({ orientation = "horizontal" }: NavbarProps) {
  const pathname = usePathname()

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "All Events", href: "/events" },
  ]

  return (
    <nav
      className={cn("flex", orientation === "horizontal" ? "flex-row items-center space-x-6" : "flex-col space-y-4")}
    >
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href ? "text-primary font-semibold" : "text-muted-foreground",
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  )
}