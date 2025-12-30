import TeatrosPage from "./teatros";
import { getTheaters } from "./actions";


export default async function page() {
  let theaters = [];
  const data = await getTheaters();

  if (data) theaters = data.theaters || [];

  return <TeatrosPage theaters={theaters} />
}