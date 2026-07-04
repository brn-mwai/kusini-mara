import { Navigate, Route, Routes } from "react-router-dom";

import { Shell } from "./shell/Shell";
import { BoardPage } from "./pages/board/BoardPage";
import { DutiesPage } from "./pages/duties/DutiesPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";

export const App = () => (
  <Routes>
    <Route element={<Shell />}>
      <Route path="/" element={<Navigate to="/board" replace />} />
      <Route path="/board" element={<BoardPage />} />
      <Route path="/bookings" element={<PlaceholderPage title="Bookings" />} />
      <Route path="/guests" element={<PlaceholderPage title="Guests" />} />
      <Route path="/rooms" element={<PlaceholderPage title="Rooms" />} />
      <Route path="/checkin" element={<PlaceholderPage title="Check-in" />} />
      <Route path="/duties" element={<DutiesPage />} />
      <Route path="/staff" element={<PlaceholderPage title="Staff" />} />
      <Route path="/leave" element={<PlaceholderPage title="Leave" />} />
      <Route path="/calendar" element={<PlaceholderPage title="Calendar" />} />
      <Route path="/broadcasts" element={<PlaceholderPage title="Broadcasts" />} />
      <Route path="/print" element={<PlaceholderPage title="Print" />} />
      <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
    </Route>
  </Routes>
);
