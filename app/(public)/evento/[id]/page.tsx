import EventoPage from "./evento"
import { createClient } from "@/lib/supabase/client";
import { Event } from "@/types/event";
import { notFound } from "next/navigation";

export default async function page({ params }: { params: { id: string } }) {
  const { id } = await params;
  const performance = await getEventById(id);


  if (!performance) return notFound();

  return <EventoPage event={performance} />
}


export async function getEventById(id: string) {
  if (!id?.trim()) return null

  const supabase = createClient()

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from("performances")
    .select(`
      id,
      date,
      time,
      status,

      play:plays (
        title,
        subtitle,
        category,
        description,
        duration_minutes,
        main_image_url,
        play_images (
          image_url
        ),
        play_artists (
          artists (
            name,
            instagram_url,
            twitter_url,
            facebook_url,
            avatar_url
          )
        )
      ),

      theater:theaters (
        name,
        address,
        map_url
      ),

      sections:performances_sections (
        id,
        name,
        price
      ),

      performances_discounts (
        discount_types (
          id,
          name,
          description,
          type,
          value,
          min_tickets,
          max_uses_per_order,
          valid_from,
          valid_until,
          is_active
        )
      )
    `)
    .eq("id", id)
    .eq('status', 'active')
    .gte('date', today)
    .single()

  if (error || !data) {
    console.error(error)
    return null
  }

  /* ======================
     MAPEADO FINAL
     ====================== */

  const event: Event = {
    id: data.id,
    date: data.date,
    time: data.time,

    play: {
      title: data.play.title,
      subtitle: data.play.subtitle,
      category: data.play.category,
      description: data.play.description,
      durationMinutes: data.play.duration_minutes,
      image: data.play.main_image_url,
      galerry: data.play.play_images.map(
        (img: any) => img.image_url
      )
    },

    theater: {
      name: data.theater.name,
      address: data.theater.address,
      mapUrl: data.theater.map_url
    },

    sections: data.sections.map((s: any) => ({
      id: s.id,
      name: s.name,
      price: s.price
    })),

    artist: data.play.play_artists.map(
      (pa: any) => ({
        name: pa.artists.name,
        instagram: pa.artists.instagram_url,
        facebook: pa.artists.facebook_url,
        x: pa.artists.twitter_url,
        image: pa.artists.avatar_url
      })
    ),

    promotion:
      data.performances_discounts?.[0]?.discount_types
        ? {
          id: data.performances_discounts[0].discount_types.id,
          name: data.performances_discounts[0].discount_types.name,
          description:
            data.performances_discounts[0].discount_types.description,
          type: data.performances_discounts[0].discount_types.type,
          value: data.performances_discounts[0].discount_types.value,
          minTickets:
            data.performances_discounts[0].discount_types.min_tickets,
          maxUsesPerOrder:
            data.performances_discounts[0].discount_types.max_uses_per_order,
          validFrom:
            data.performances_discounts[0].discount_types.valid_from,
          validUntil:
            data.performances_discounts[0].discount_types.valid_until,
          isActive:
            data.performances_discounts[0].discount_types.is_active
        }
        : undefined
  }

  return event ?? []
}
