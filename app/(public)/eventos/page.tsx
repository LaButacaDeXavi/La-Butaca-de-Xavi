import { createClient } from "@/lib/supabase/client"
import EventosPage from "./eventos"

interface SearchParams {
    searchParams: {
        q?: string
        startDate?: string
        endDate?: string
    }
}

export default async function getPerformances({ searchParams }: SearchParams) {
    const { q, endDate, startDate } = await searchParams;

    const supabase = createClient()

    // Construir la query base
    let query = supabase
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
        .eq('status', 'active')

    // Aplicar filtro de fecha si existe
    if (startDate && endDate) {
        query = query.gte('date', startDate).lte('date', endDate)
    } else if (startDate) {
        query = query.gte('date', startDate)
    } else if (endDate) {
        query = query.lte('date', endDate)
    } else {
        query = query.lte('date', new Date().toLocaleDateString())
    }

    // Aplicar filtro de búsqueda por título de obra si existe
    if (q && q.trim()) {
        query = query.ilike('plays.title', `%${q.trim()}%`)
    }

    // Ordenar por fecha
    query = query.order('date', { ascending: true })
    
    const { data, error } = await query.returns<PerformanceRow[]>()

    if (error) {
        console.log('Error fetching performances:', error)
    }

    const events: any = data?.map(performance => {
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

    return <EventosPage events={events ?? []} searchParams={{ q, startDate, endDate }} />
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