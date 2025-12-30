import PlaysPage from "./obras";
import { getPlays } from "./actions";
import { getArtists } from "../artistas/actions";


export default async function Page() {

  const [{ plays }, { artists }] = await Promise.all([
    getPlays(),
    getArtists()
  ])


  return <PlaysPage plays={plays} artists={artists} />
}