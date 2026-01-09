import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function AuthGuardAdmin({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase
        .auth
        .getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (error || profile?.role !== "admin") {
        redirect("/admin/unauthorized");
    }

    return <>{children}</>;
}
