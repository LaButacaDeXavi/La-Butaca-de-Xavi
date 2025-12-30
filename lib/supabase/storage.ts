import { requireAdmin } from "./middlewareRole"
import { createClient } from "./client"
import imageCompression from "browser-image-compression"

const MAX_SIZE_MB = 1
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

const BUCKET = "la-butaca-xavi"

const PUBLIC_PATH_PREFIX = `/storage/v1/object/public/${BUCKET}/`

const STRIP_QUERY = (value: string) => value.split("?")[0]

function extractStoragePath(urlOrPath: string): string | null {
    if (!urlOrPath) return null

    const cleanPath = STRIP_QUERY(urlOrPath.trim())

    if (cleanPath.startsWith("/")) {
        const normalized = cleanPath.replace(/^\/+/, "")
        if (normalized.startsWith(PUBLIC_PATH_PREFIX.replace(/^\//, ""))) {
            return normalized.replace(PUBLIC_PATH_PREFIX.replace(/^\//, ""), "")
        }
        return normalized
    }

    if (cleanPath.includes(PUBLIC_PATH_PREFIX)) {
        return cleanPath.split(PUBLIC_PATH_PREFIX)[1] ?? null
    }

    if (cleanPath.startsWith(`${BUCKET}/`)) {
        return cleanPath.replace(`${BUCKET}/`, "")
    }

    return cleanPath
}

export async function deleteFromStorage(urls: string[]) {
    if (!urls?.length) return { success: true }

    try {
        await requireAdmin()
        const supabase = createClient()

        const paths = Array.from(
            new Set(
                urls
                    .map(extractStoragePath)
                    .filter((path): path is string => Boolean(path))
            )
        )

        if (!paths.length) {
            return { success: true }
        }

        const { error } = await supabase.storage
            .from(BUCKET)
            .remove(paths)

        if (error) {
            console.error("deleteFromStorage error", error)
            return { success: false, message: "No se pudieron eliminar las imágenes" }
        }

        return { success: true }
    } catch (error) {
        console.error("deleteFromStorage catch", error)
        return { success: false, message: "Error al eliminar imágenes" }
    }
}




export async function compressAndUploadImage(
    file: File,
    pathPrefix: string
): Promise<string> {
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error("Formato de imagen no permitido")
    }
    try {
        await requireAdmin();

        const compressed = await imageCompression(file, {
            maxSizeMB: MAX_SIZE_MB,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: "image/webp"
        })

        const supabase = createClient()

        const fileName = `${crypto.randomUUID()}.webp`
        const filePath = `${pathPrefix}/${fileName}`

        const {error } = await supabase.storage
            .from("la-butaca-xavi")
            .upload(filePath, compressed, {
                upsert: false,
                contentType: "image/webp"
            })
        console.log(error)
        if (error) {
            throw new Error("Error al subir imagen")
        }

        const { data } = supabase.storage
            .from("la-butaca-xavi")
            .getPublicUrl(filePath)

        return data.publicUrl
    } catch (error) {
        return "";
    }


}
