import TeatrosPage from "./teatros";
import { getTheaters } from "./actions";

export const dynamic = "force-dynamic";


export default async function page() {
  let theaters:any;

  try {

    const data = await getTheaters();

    if (data) theaters = data.theaters || [];
  } catch (error) {

  }

  return <TeatrosPage theaters={theaters} />
}