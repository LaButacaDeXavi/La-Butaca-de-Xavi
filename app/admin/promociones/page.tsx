import { getPromotions } from "./actions"
import PromotionsPage from "./promociones"

export default async function page() {
    const { promotions } = await getPromotions()
    return <PromotionsPage promotions={promotions} />
}


