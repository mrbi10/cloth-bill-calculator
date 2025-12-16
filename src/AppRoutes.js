import { Routes, Route } from "react-router-dom";
import App from "./App";
import History from "./History";
import FabricMaster from "./FabricMaster";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/history" element={<History />} />
      <Route path="/fabric" element={<FabricMaster />} />
    </Routes>
  );
}
