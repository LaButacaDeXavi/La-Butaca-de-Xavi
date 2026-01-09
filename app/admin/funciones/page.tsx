import FuncionesPage from "./funciones";
import { getPlays } from "../obras/actions";
import { getTheaters } from "../teatros/actions";
import { getPromotions } from "../promociones/actions";
import { getPerformances } from "./actions";

export default async function Page() {

  try {
    const [{ performances: performancesData }, { plays }, { theaters: theatersData }, { promotions }] = await Promise.all([
      getPerformances(),
      getPlays(),
      getTheaters(),
      getPromotions(),
    ])

    const theaters = theatersData ?? []
    const performances: any = performancesData ?? []

    return (
      <FuncionesPage
        perfomances={performances}
        plays={plays}
        promotions={promotions}
        theaters={theaters}
      />
    )
  } catch (error) {
    return (
      <div>
        No autorizado
      </div>
    )
  }

}
