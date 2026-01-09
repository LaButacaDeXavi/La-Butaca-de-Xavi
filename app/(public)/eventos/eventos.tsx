

"use client"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { EventGrid } from "@/components/home/event-carousel"
import { SearchBar } from "@/components/home/search-bar"
import { Event } from "@/types/event"

interface eventosPageProps{
    events:Event[]
    searchParams:{
        q?:string
        startDate?:string
        endDate?:string
    }
}

export default function eventosPage({events,searchParams}:eventosPageProps) {


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mt-5"></div>
      <section className="container mx-auto px-4 py-8">
        <SearchBar title="Filtrar" q={searchParams.q} startDate={searchParams.startDate} endDate={searchParams.endDate}/>
      </section>
      <section className="container mx-auto px-4 py-8">
        <EventGrid title="" events={events} />
      </section>
      <Footer />
    </div>
  )
}


