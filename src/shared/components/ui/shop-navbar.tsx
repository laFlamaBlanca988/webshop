"use client";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { SVGProps } from "react";

export default function ShopNavbar() {
  const { data: session } = useSession();

  return (
    <header className="flex h-20 w-full items-center justify-between px-4 md:px-6 bg-white dark:bg-gray-950 border-b shadow-sm">
      {/* Mobile Menu (Hamburger) */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetTitle>Menu</SheetTitle>
          <nav className="grid gap-4 py-6 text-lg font-semibold">
            <Link href="/" className="py-2">
              Home
            </Link>
            <Link href="/products" className="py-2">
              Products
            </Link>
            {session?.user.role === "ADMIN" && (
              <Link href="/admin" className="py-2">
                Admin
              </Link>
            )}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <MountainIcon className="h-6 w-6" />
        <span className="sr-only">Acme Inc</span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-6">
        <NavItem href="/" label="Home" />
        <NavItem href="/products" label="Products" />
        {session?.user.role === "ADMIN" && (
          <NavItem href="/admin" label="Admin" />
        )}
      </nav>

      {/* User Section */}
      <div className="flex items-center gap-4">
        {session ? (
          <>
            <span className="text-sm font-medium">
              {session.user.name || session.user.email}
            </span>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/auth" })}
            >
              Logout
            </Button>
          </>
        ) : (
          <Link href="/auth">
            <Button variant="outline">Login</Button>
          </Link>
        )}
      </div>
    </header>
  );
}

/** Reusable Navigation Item */
const NavItem = ({ href, label }: { href: string; label: string }) => (
  <Link
    href={href}
    className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-800"
  >
    {label}
  </Link>
);

function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function MountainIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}
