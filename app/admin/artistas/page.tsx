import ArtistasPage from "./artistas";
import { getArtists } from "./actions";

export const dynamic = "force-dynamic";

export default async function Page() {
  let artist:any;
  const data = await getArtists();
  
  if (data) artist = data.artists || [];

  return <ArtistasPage artists={artist} />
}