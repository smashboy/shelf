import { GamesListStoreProvider } from "@/storage/GamesListStore";
import Loader from "./Loader";

export default function GamesList() {
  return (
    <GamesListStoreProvider>
      <Loader />
    </GamesListStoreProvider>
  );
}
