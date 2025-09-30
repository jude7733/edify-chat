export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="text-lg font-semibold">Edify Data Science</div>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              We help teams turn data into decisions with robust platforms and responsible AI.
            </p>
          </div>
          <div>
            <div className="text-sm font-medium">Company</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#services" className="hover:text-foreground">
                  Services
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-foreground">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-foreground">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-medium">Contact</div>
            <p className="mt-3 text-sm text-muted-foreground">hello@edifydatascience.com</p>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Edify Data Science. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

