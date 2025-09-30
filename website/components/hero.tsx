import Image from "next/image"

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative mx-auto w-full max-w-6xl px-4 py-20 md:py-28">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Edify Data Science</p>
          <h1 id="hero-title" className="text-pretty text-4xl font-semibold leading-tight md:text-5xl">
            Data platforms and AI solutions that drive measurable outcomes
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            We build analytics systems, ML pipelines, and AI copilots for modern teams. From data strategy to production
            deployment—secure, scalable, and fast.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a href="#contact" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Contact Sales
            </a>
            <a href="#services" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
              Explore Services
            </a>
          </div>
        </div>

        <div className="relative order-first h-64 overflow-hidden rounded-xl border md:order-none md:h-80">
          <Image
            src="https://plus.unsplash.com/premium_photo-1676998931123-75789162f170?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Abstract data visualization dashboard"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  )
}
