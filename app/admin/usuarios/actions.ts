"use server"

import { requireAdmin } from "@/lib/supabase/middlewareRole";
import { createClient } from "@/lib/supabase/server"
import { AdminUser } from "@/types/admin";
import { createClientAdmin } from "@/lib/supabase/serverAdmin";

export async function createUser(user: Omit<AdminUser, "id">) {

    try {
        await requireAdmin();
        const supabase = await createClient();

        if (!user.name?.trim() || !user.role?.trim() || !user.email?.trim() || !user.password?.trim()) return { success: false, message: "El Nombre, Email Contrasena y Rol son requeridos" }

        if (!user.role.includes('admin') && !user.role.includes('scanner')) {
            return { success: false, message: "Rol invalido" }
        }
        if (user.password.trim().length < 8) return { success: false, message: "La contraseña debe tener al menos 8 caraceres" }

        const { data, error } = await supabase
            .auth
            .signUp({
                email: user.email,
                password: user.password ?? user.email + 123
            })
        console.log(error)
        if (error) return { success: false, message: error.message.includes('invalid') ? "Email invalido" : "Error al crear usuario" }

        const { error: errorUser } = await supabase
            .from('profiles')
            .insert({
                id: data.user?.id,
                email: user.email,
                full_name: user.name,
                role: user.role
            })

        if (errorUser) {
            await supabase.auth.admin.deleteUser(data.user?.id ?? "")
            return { success: false, message: "Error al crear usuario" }
        }


        return {
            success: true,
            message: "Creado Correctamente",
            userId: data.user?.id ?? ""
        }

    } catch (error) {
        console.error("Error al crear usuario:", error)
        return {
            success: false,
            message: "Error en el servidor al Crear usuario"
        }
    }

}


export async function updateUser(user: Partial<AdminUser>) {
    try {
        await requireAdmin();
        const supabase = await createClientAdmin();

        if (!user.id?.trim()) return { success: false, message: "El Id es requeridos" }


        if (user.role && !user.role.includes('admin') && !user.role.includes('scanner')) {
            return { success: false, message: "Rol invalido" }
        }

        if (user.password?.trim()) {
            const { error } = await supabase
                .auth
                .admin
                .updateUserById(user.id, {
                    password: user.password
                })

            if (error) return { success: false, message: "Error al Editar contrasena" }
        }

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: user.name,
                role: user.role
            })
            .eq('id', user.id)

        if (error) return { success: false, message: "Error al Editar Usuario" }

        return {
            success: true,
            message: "Usuario Editado Correctamente"
        }

    } catch (error) {
        console.error("Error al editar:", error)
        return {
            success: false,
            message: "Error en el Servidor al Editar"
        }
    }

}


export async function deleteUser(idUser: string) {
    try {
        await requireAdmin();
        const supabase = await createClient();
        if (!idUser) return { success: false, message: "El Id es requerido" }

        const { error } = await supabase
            .auth
            .admin
            .deleteUser(idUser)

        if (error) return { success: false, message: "Error al Borrar Usuario" }

        return {
            success: true,
            message: "Usuario eliminado Correctamente"
        }

    } catch (error) {
        console.error("Error al Borrar", error)
        return {
            success: false,
            message: "Error al Borrar"
        }
    }

}

export async function getUsers() {
    try {
        await requireAdmin();
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('profiles')
            .select(`
                id,
                full_name,
                role,
                email
                `)

        const users = data
            ?.filter(u => u.id !== "98957659-f7f5-453d-9861-695f872b1ec0")
            .map(({ full_name, ...u }) => ({
                ...u,
                name: full_name
            }))

        return { users }
    } catch (error) {
        return {
            users: []
        }
    }

}
