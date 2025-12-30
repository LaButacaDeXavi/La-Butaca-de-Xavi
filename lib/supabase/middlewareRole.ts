'use server'

import { createClient } from './server'

export async function requireAdmin() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('No autenticado')
    }
    
    const {data:profile ,error}=await supabase
    .from('profiles')
    .select('role')
    .eq('id',user.id)
    .single();

    if(error || !profile) throw new Error('No autenticado')

    if (profile && profile.role !== 'admin') {
        throw new Error('No autorizado')
    }

    return user
}
