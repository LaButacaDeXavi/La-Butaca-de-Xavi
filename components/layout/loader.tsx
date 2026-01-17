"use client"

interface FullScreenLoaderProps {
  isLoading?: boolean
}

export function FullScreenLoader({ isLoading = true }: FullScreenLoaderProps) {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex items-center justify-center rounded-lg bg-card p-8 shadow-lg">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    </div>
  )
}
