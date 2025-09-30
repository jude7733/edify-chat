import { Hero } from "@/components/hero"
import { Services } from "@/components/services"
import { SiteFooter } from "@/components/site-footer"

export default function HomePage() {
  return (
    <main className="flex flex-col">
      <Hero />
      <Services />
      <SiteFooter />
    </main>
  )
}
