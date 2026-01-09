import { redirect } from "next/navigation"
import type React from "react"
import { AdminNav } from "@/components/admin/admin-nav"
import { createClient } from "@/lib/supabase/server"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (error || profile?.role !== "admin") {
    redirect("/unauthorized")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNav role={profile.role} />
      <main className="flex-1 overflow-auto pt-14 lg:pt-0">
        <div className="container mx-auto p-4 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
