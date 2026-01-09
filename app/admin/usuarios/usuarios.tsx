"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { AdminUser } from "@/types/admin"
import { createUser, deleteUser, updateUser } from "./actions"
import { toast } from "sonner"

interface UsersPageProps {
    users: AdminUser[]
}

export default function UsersPage({ users: data }: UsersPageProps) {
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState<AdminUser[]>(data)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        password: "",
        role: "" as "admin" | "scanner",
    })


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingUser) {
                const updateUserData = {
                    ...formData,
                    id: editingUser.id
                }
                const data = await updateUser(updateUserData)
                if (!data.success) return toast.error(data.message)
                toast.success(data.message);
                setUsers(users.map((user) => (user.id === editingUser.id ? { ...user, ...formData } : user)))
            } else {
                if(!formData.email || !formData.name || !formData.password || !formData.role) return toast.error('Complete todos los campos.')

                if(formData.password.trim().length < 8) return toast.error('La contraseña debe tener al menos 8 caraceres')
                
                const newUser = {
                    ...formData,
                }
                const data = await createUser(newUser)
                if (!data.success) return toast.error(data.message)
                toast.success(data.message);
                setUsers([...users, { ...newUser, id: data.userId ?? "" }])
            }

            resetForm()
        } catch (error) {

        } finally {
            setLoading(false);
        }

    }

    const handleEdit = (user: AdminUser) => {
        setEditingUser(user)
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: ""
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm("¿Estás seguro de eliminar este usuario?")) {
            const data = await deleteUser(id)
            if (!data.success) return toast.error(data.message)
            toast.success(data.message)
            setUsers(users.filter((u) => u.id !== id))
        }
    }

    const resetForm = () => {
        setFormData({ name: "", email: "", role: "scanner", password: "" })
        setEditingUser(null)
        setIsModalOpen(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Usuarios</h1>
                    <p className="text-muted-foreground mt-1">Gestiona los usuarios plataforma</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nuevo Usuario
                </Button>
            </div>
            {users.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 py-12">
                    <p className="max-w-xs text-center text-muted-foreground">
                        Aún no tienes usuarios creados. Agrega tu primer usuario.
                    </p>
                    <Button onClick={() => setIsModalOpen(true)} className="mt-4">
                        Crear usuario
                    </Button>
                </div>
            )}


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.length > 0 && users.map((user) => (
                    <div key={user.id} className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-semibold text-foreground">{user.email}</h3>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(user.id)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <p className="text-muted-foreground">
                                <span className="font-medium">Nombre:</span> {user.name}
                            </p>
                            <p className="text-muted-foreground">
                                <span className="font-medium">Rol:</span> {user.role}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-card border border-border rounded-lg w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-foreground mb-4">
                            {editingUser ? "Editar Teatro" : "Nuevo Teatro"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="ejemplo@gmail.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Nombre</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="ejemplo"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">Password</Label>
                                <Input
                                    id="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="promotionId">Estado</Label>
                                <select
                                    id="role"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as "admin" | "scanner" })}
                                    className="w-full px-3 py-2 bg-background border border-input rounded-md"
                                >
                                    <option key="scanner" value="scanner">
                                        Scanner
                                    </option>
                                    <option key="admin" value="admin">
                                        Admin
                                    </option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetForm}
                                    className="flex-1 bg-transparent"
                                    disabled={loading}
                                >

                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={loading}
                                >
                                    {editingUser ? "Guardar" : "Crear"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
