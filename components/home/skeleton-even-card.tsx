import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonEventCard() {
  return (
    <Card className="overflow-hidden bg-card border-border h-full pt-0 pb-0">
      <div className="flex md:flex-col">
        {/* Image section */}
        <div className="relative w-32 md:w-full md:aspect-3/4 shrink-0 overflow-hidden">
          <Skeleton className="h-full w-full" />
          {/* Badge placeholder */}
          <Skeleton className="absolute top-2 right-2 h-6 w-12 rounded-md md:top-3 md:right-3" />
        </div>

        {/* Content section */}
        <div className="p-3 md:p-4 flex-1 flex flex-col justify-between">
          {/* Theater name */}
          <div className="flex items-center gap-1.5 mb-2">
            <Skeleton className="h-3.5 w-3.5 md:h-4 md:w-4 rounded-full" />
            <Skeleton className="h-3 md:h-4 w-24 md:w-32" />
          </div>

          {/* Event title and subtitle */}
          <div className="mb-3">
            <Skeleton className="h-4 md:h-5 w-full mb-2" />
            <Skeleton className="h-4 md:h-5 w-3/4 mb-1.5" />
            <Skeleton className="h-3 md:h-4 w-1/2 mt-0.5" />
          </div>

          {/* Date and time - large display */}
          <div className="flex items-end gap-3 md:gap-4">
            {/* Day */}
            <div className="flex flex-col gap-1">
              <Skeleton className="h-9 w-12 md:h-10 md:w-14" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
            </div>

            {/* Separator */}
            <div className="h-8 w-px bg-border self-center" />

            {/* Time */}
            <div className="flex flex-col gap-1">
              <Skeleton className="h-9 w-12 md:h-10 md:w-14" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}