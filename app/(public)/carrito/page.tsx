import CarritoPage from "./carrito";
import { getDataSession } from "./actions";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";


export default async function Page() {
    const data: any = await getDataSession();
    const cookiesStorage = await cookies();

    if (!data) {
        const eventId = cookiesStorage.get('eventId')
        if (!eventId) return redirect('/')

        return redirect(`/evento/${eventId.value}`)
    }
    return <CarritoPage data={data} />
}