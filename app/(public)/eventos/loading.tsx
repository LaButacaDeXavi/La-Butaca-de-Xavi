import { SkeletonEventCard } from "@/components/home/skeleton-even-card";
import { SearchBar } from "@/components/home/search-bar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

const skeletonItems = Array.from({ length: 8 });

export default function LoadingEventos() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mt-5" />
      <section className="container mx-auto px-4 py-8">
        <SearchBar title="Filtrar" />
      </section>
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {skeletonItems.map((_, index) => (
            <SkeletonEventCard key={index} />
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}

