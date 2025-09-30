export function Services() {
  const items = [
    {
      title: "Analytics & BI",
      desc: "Modernize your analytics stack, define metrics, and ship self-serve dashboards.",
    },
    {
      title: "ML Engineering",
      desc: "Model development, experiment tracking, and production-grade inference pipelines.",
    },
    {
      title: "AI Copilots",
      desc: "Task-focused assistants powered by your data with secure retrieval and guardrails.",
    },
    {
      title: "Data Platforms",
      desc: "Warehouses, lakes, orchestration, and governance—built for reliability and scale.",
    },
  ]

  return (
    <section id="services" aria-labelledby="services-title" className="border-t bg-card py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 id="services-title" className="text-2xl font-semibold md:text-3xl">
          Services
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Practical solutions that align with your roadmap and deliver business value.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.title} className="rounded-lg border bg-card p-5 transition-colors hover:bg-muted">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
