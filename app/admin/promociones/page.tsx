import { getPromotions } from "./actions"
import PromotionsPage from "./promociones"

export default async function page() {
    try {

        const { promotions } = await getPromotions()
        return <PromotionsPage promotions={promotions} />
    } catch (error) {
        return (
            <div>no autorizado</div>
        )

    }
}


