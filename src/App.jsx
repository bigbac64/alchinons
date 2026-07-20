import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Carte from "./pages/Carte.jsx";
import Exploitation from "./pages/Exploitation.jsx";
import {MapProvider} from "./providers/map/MapProvider.jsx";
import {PlayerProvider} from "./providers/map/PlayerProvider.jsx";

function App() {
  return (
    <MapProvider>
      <PlayerProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/carte" element={<Carte />} />
            <Route path="/exploit" element={<Exploitation />} />
          </Route>
        </Routes>
      </PlayerProvider>
    </MapProvider>
  );
}

export default App;