export interface User {
    name: string,
    email: string
    role: string
}

export interface UserDB {
    name: string,
    email: string
    passwordHash: string
    role: string
}