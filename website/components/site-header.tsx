import Link from "next/link"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          <span className="text-balance">Edify Data Science</span>
        </Link>

        <nav aria-label="Main" className="hidden gap-6 text-sm md:flex">
          <a href="#services" className="hover:text-primary">
            Services
          </a>
          <a href="#about" className="hover:text-primary">
            About
          </a>
          <a href="#contact" className="hover:text-primary">
            Contact
          </a>
        </nav>

        <a
          href="#contact"
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Get in touch
        </a>
      </div>
    </header>
  )
}
