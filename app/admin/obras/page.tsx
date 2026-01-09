import PlaysPage from "./obras";
import { getPlays } from "./actions";
import { getArtists } from "../artistas/actions";

export const dynamic = "force-dynamic";


export default async function Page() {
  try {
    const [{ plays }, { artists }] = await Promise.all([
      getPlays(),
      getArtists()
    ])

    return <PlaysPage plays={plays} artists={artists} />
  } catch (error) {
    return <PlaysPage plays={[]} artists={[]} />

  }


}