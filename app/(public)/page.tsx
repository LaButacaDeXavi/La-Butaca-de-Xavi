import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroCarousel } from "@/components/home/hero-carousel"
import { EventGrid } from "@/components/home/event-carousel"
import { SearchBar } from "@/components/home/search-bar"
import { createClient } from "@/lib/supabase/client"

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { events, mainEvents }: any = await getPerformances();


  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Carousel */}
      {mainEvents.length > 0 && (

        <HeroCarousel events={mainEvents} />
      )}
      <div className="mt-5"></div>
      {/* Search Section */}
      <section className="container mx-auto px-4 py-8">
        <SearchBar title="Filtrar" />
      </section>
      {/* Event Cards Carousel */}
      <section className="container mx-auto px-4 py-8">
        <EventGrid title="" events={events} />
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}



async function getPerformances() {
  const supabase = createClient()

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from("performances")
    .select(`
        id,
        date,
        time,
        isMain,
        play:plays (
          title,
          subtitle,
          category,
          main_image_url
        ),
        theater:theaters (
          name
        ),
        performances_discounts (
          discount_types (
            id,
            name,
            type,
            value,
            valid_from,
            valid_until,
            is_active
          )
        )
      `)
    .neq('status', 'desactivate')
    .gte('date', today)
    .order('date', { ascending: true })
    .returns<PerformanceRow[]>()

  const events = data?.map(performance => {
    const discount =
      performance.performances_discounts?.[0]?.discount_types ?? null

    return {
      id: performance.id,
      date: performance.date,
      time: performance.time,
      isMain: performance.isMain,
      play: {
        title: performance.play?.title,
        subtitle: performance.play?.subtitle,
        category: performance.play?.category,
        image: performance.play?.main_image_url
      },

      theater: {
        name: performance.theater?.name,
      },

      promotion: discount
        ? {
          id: discount.id,
          name: discount.name,
          type: discount.type,
          value: discount.value,
          validFrom: discount.valid_from,
          validUntil: discount.valid_until
            ? discount.valid_until
            : null,
          isActive: discount.is_active
        }
        : undefined
    }
  })
  const mainEvents = events?.filter(p => p.isMain)


  return { events: events ?? [], mainEvents: mainEvents ?? [] }
}


type PerformanceRow = {
  id: string
  date: string
  time: string
  isMain: boolean | null

  play: {
    title: string
    subtitle: string | null
    category: string | null
    main_image_url: string
  } | null

  theater: {
    name: string
  } | null

  performances_discounts: {
    discount_types: {
      id: string
      name: string
      type: "percentage" | "fixed" | "2x1" | "3x2"
      value: number | null
      valid_from: string | null
      valid_until: string | null
      is_active: boolean
    } | null
  }[] | null
}
