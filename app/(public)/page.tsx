import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroCarousel } from "@/components/home/hero-carousel"
import { EventCarousel } from "@/components/home/event-carousel"
import { SearchBar } from "@/components/home/search-bar"
import { featuredEvents, upcomingEvents, provinces, localitiesByProvince } from "@/lib/mock-events"


export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Carousel */}
      <HeroCarousel events={featuredEvents} />
    <div className="mt-5"></div>
      {/* Search Section */}
      <section className="container mx-auto px-4 py-8">
        <SearchBar title="Filtrar" provinces={provinces} localitiesByProvince={localitiesByProvince}/>
      </section>
      {/* Event Cards Carousel */}
      <section className="container mx-auto px-4 py-8">
        <EventCarousel title="Próximos Estrenos" events={upcomingEvents} />
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
