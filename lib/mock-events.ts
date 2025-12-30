import type { Event } from "@/types/event"

export const featuredEvents: Event[] = [
  {
    id: "1",
    title: "HAMLET",
    subtitle: "Teatro Nacional",
    date: "2025-01-15",
    time: "20:00",
    venue: "Teatro Gran Rex",
    location: "Buenos Aires",
    price: 15000,
    image: "https://okozqwpejvdyflvvwnsr.supabase.co/storage/v1/object/public/la-butaca-xavi/plays/main/45e153e8-6863-4c84-8a80-e8dce0c48626.webp",
    gallery: [
      "/hamlet-theater-stage-dramatic-lighting.jpg",
      "/hamlet-theater-stage-dramatic-lighting.jpg",
      "/hamlet-theater-stage-dramatic-lighting.jpg",
    ],
    featured: true,
    sections: [
      { id: "1", name: "General", price: 10000 },
      { id: "2", name: "Platea", price: 13000 }
    ],
    artist: [],
    promotion: {
      id: "1",
      name: "Promocion 2 x 1",
      description: "Al comprar 2 entradas pagas solo 1 (valido 1 sola vez)",
      value: undefined,
      maxUsesPerOrder: 1,
      minTickets: 2,
      type: "2x1"
    },
    category: "teatro",
    description: "La obra maestra de Shakespeare llega al Gran Rex con un elenco espectacular.",
  },
  {
    id: "2",
    title: "LA CASA DE BERNARDA ALBA",
    subtitle: "Clásico de Lorca",
    date: "2025-01-20",
    time: "21:00",
    venue: "Teatro Colón",
    location: "Buenos Aires",
    price: 18000,
    image: "/spanish-theater-dramatic-stage.jpg",
    gallery: ["/spanish-theater-dramatic-stage.jpg", "/theater-black-dress-performers.jpg"],
    featured: true,
    sections: [
      { id: "1", name: "General", price: 10000 },
      { id: "2", name: "Platea", price: 13000 }
    ],
    artist: [],
    promotion: {
      id: "1",
      name: "Promocion 2 x1",
      value: undefined,
      maxUsesPerOrder: 1,
      minTickets: 2,
      type: "2x1"
    },
    category: "teatro",
    description: "Una interpretación moderna del clásico de Federico García Lorca.",
  },
  {
    id: "3",
    title: "EL PRINCIPITO",
    subtitle: "Musical Familiar",
    date: "2025-01-25",
    time: "17:00",
    venue: "Teatro Metropolitan",
    location: "Buenos Aires",
    price: 12000,
    image: "/little-prince-musical-theater-stars.jpg",
    gallery: ["/little-prince-musical-theater-stars.jpg", "/family-musical-colorful-stage.jpg"],
    featured: true,
    sections: [
      { id: "1", name: "General", price: 10000 },
      { id: "2", name: "Platea", price: 13000 }
    ],
    artist: [],
    promotion: {
      id: "1",
      name: "Promocion 2 x1",
      value: undefined,
      maxUsesPerOrder: 1,
      minTickets: 2,
      type: "2x1"
    },
    category: "teatro",
    description: "El musical para toda la familia basado en el clásico de Saint-Exupéry.",
  },
]

export const upcomingEvents: Event[] = [
  {
    id: "4",
    title: "ESPERANDO A GODOT",
    subtitle: "Samuel Beckett",
    date: "2025-02-01",
    time: "20:30",
    venue: "Teatro San Martín",
    location: "Buenos Aires",
    price: 14000,
    image: "/waiting-for-godot-minimalist-stage.jpg",
    sections: [
      { id: "1", name: "General", price: 10000 },
      { id: "2", name: "Platea", price: 13000 }
    ],
    artist: [],
    promotion: {
      id: "1",
      name: "Promocion 2 x1",
      value: undefined,
      maxUsesPerOrder: 1,
      minTickets: 2,
      type: "2x1"
    },
    category: "teatro",
    description: "La obra existencialista más importante del siglo XX.",
  },
  {
    id: "5",
    title: "LA NONA",
    subtitle: "Roberto Cossa",
    date: "2025-02-05",
    time: "21:00",
    venue: "Teatro Presidente Alvear",
    location: "Buenos Aires",
    price: 13000,
    image: "/argentine-theater-comedy-family.jpg",
    sections: [
      { id: "1", name: "General", price: 10000 },
      { id: "2", name: "Platea", price: 13000 }
    ],
    artist: [],
    promotion: {
      id: "1",
      name: "Promocion 2 x 1",
      description: "Al comprar 2 entradas pagas solo 1 (valido 1 sola vez)",
      value: undefined,
      maxUsesPerOrder: 1,
      minTickets: 2,
      type: "2x1"
    },
    category: "teatro",
    description: "Comedia dramática argentina sobre una familia y su peculiar abuela.",
  },
  {
    id: "6",
    title: "CHICAGO",
    subtitle: "El Musical",
    date: "2025-02-10",
    time: "20:00",
    venue: "Teatro Lola Membrives",
    location: "Buenos Aires",
    price: 20000,
    image: "/chicago-musical-jazz-dancers.jpg",
    sections: [
      { id: "1", name: "General", price: 10000 },
      { id: "2", name: "Platea", price: 13000 }
    ],
    artist: [],
    promotion: {
      id: "1",
      name: "Promocion 2 x1",
      value: undefined,
      maxUsesPerOrder: 1,
      minTickets: 2,
      type: "2x1"
    },
    category: "musica",
    description: "El icónico musical de Broadway llega a Buenos Aires.",
  },
  {
    id: "7",
    title: "ROMEO Y JULIETA",
    subtitle: "Ballet Clásico",
    date: "2025-02-15",
    time: "19:00",
    venue: "Teatro Colón",
    location: "Buenos Aires",
    price: 16000,
    image: "/ballet-romeo-juliet-dancers.jpg",
    sections: [
      { id: "1", name: "General", price: 10000 },
      { id: "2", name: "Platea", price: 13000 }
    ],
    artist: [],
    promotion: {
      id: "1",
      name: "Promocion 2 x1",
      value: undefined,
      maxUsesPerOrder: 1,
      minTickets: 2,
      type: "2x1"
    },
    category: "danza",
    description: "Ballet clásico con música de Prokofiev.",
  },
  {
    id: "8",
    title: "STAND UP NACIONAL",
    subtitle: "Los mejores comediantes",
    date: "2025-02-20",
    time: "21:30",
    venue: "Teatro Vorterix",
    location: "Buenos Aires",
    price: 11000,
    image: "/stand-up-comedy-microphone-spotlight.jpg",
    sections: [
      { id: "1", name: "General", price: 10000 },
      { id: "2", name: "Platea", price: 13000 }
    ],
    artist: [],
    promotion: {
      id: "1",
      name: "Promocion 2 x1",
      value: undefined,
      maxUsesPerOrder: 1,
      minTickets: 2,
      type: "2x1"
    },
    category: "comedia",
    description: "Una noche llena de risas con los mejores comediantes argentinos.",
  },
]


export const provinces = [
  { id: "1", name: "Santiago del Estero" },
  { id: "2", name: "Tucumán" },
  { id: "3", name: "Salta" },
  { id: "4", name: "Jujuy" },
]

export const localitiesByProvince: Record<string, Array<{ id: string; name: string }>> = {
  "1": [
    { id: "1-1", name: "Santiago del Estero Capital" },
    { id: "1-2", name: "La Banda" },
    { id: "1-3", name: "Termas de Río Hondo" },
    { id: "1-4", name: "Frías" },
  ],
  "2": [
    { id: "2-1", name: "San Miguel de Tucumán" },
    { id: "2-2", name: "Yerba Buena" },
    { id: "2-3", name: "Tafí Viejo" },
    { id: "2-4", name: "Concepción" },
  ],
  "3": [
    { id: "3-1", name: "Salta Capital" },
    { id: "3-2", name: "Orán" },
    { id: "3-3", name: "Tartagal" },
    { id: "3-4", name: "Cafayate" },
  ],
  "4": [
    { id: "4-1", name: "San Salvador de Jujuy" },
    { id: "4-2", name: "San Pedro de Jujuy" },
    { id: "4-3", name: "Libertador General San Martín" },
    { id: "4-4", name: "Palpalá" },
  ],
}

export const categories = [
  { name: "Comedia" },
  { name: "Suspenso" },
  { name: "Terror" }
]