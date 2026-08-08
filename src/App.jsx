import {Routes, Route, Navigate} from "react-router-dom";
import MainLayout from "./components/navigation/MainLayout.jsx";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Carte from "./pages/Carte.jsx";
import Exploitation from "./pages/Exploitation.jsx";
import {AppProviders} from "./providers/AppProviders.jsx";
import CampLayout from "./components/navigation/CampLayout.jsx";
import NotFound from "./pages/NotFound.jsx";
import Craft from "./pages/Craft.jsx";
import Oven from "./pages/Oven.jsx";
import Quest from "./pages/Quest.jsx";

function App() {
  return (
    <AppProviders>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="camp" replace />} />
          <Route path="camp" element={<CampLayout />}>
            <Route index element={<Home />} />
            <Route path="craft" element={<Craft />} />
            <Route path="quest" element={<Quest />} />
            <Route path="oven" element={<Oven />} />
          </Route>
          <Route path="settings" element={<Settings />} />
          <Route path="carte" element={<Carte />} />
          <Route path="exploit" element={<Exploitation />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppProviders>
  );
}

export default App;