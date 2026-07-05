import { Navigate, Route, Routes } from "react-router-dom";

import { Shell } from "./shell/Shell";
import { MovementsPage } from "./pages/movements/MovementsPage";
import { MovementRecordPage } from "./pages/movements/MovementRecordPage";
import { NotificationsPage } from "./pages/notifications/NotificationsPage";
import { ReportsPage } from "./pages/reports/ReportsPage";
import { BookingsPage } from "./pages/bookings/BookingsPage";
import { BroadcastsPage } from "./pages/broadcasts/BroadcastsPage";
import { CalendarPage } from "./pages/calendar/CalendarPage";
import { CheckinPage } from "./pages/checkin/CheckinPage";
import { DutiesPage } from "./pages/duties/DutiesPage";
import { GuestsPage } from "./pages/guests/GuestsPage";
import { LeavePage } from "./pages/leave/LeavePage";
import { PrintPage } from "./pages/print/PrintPage";
import { RoomsPage } from "./pages/rooms/RoomsPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { StaffPage } from "./pages/staff/StaffPage";

export const App = () => (
  <Routes>
    <Route element={<Shell />}>
      <Route path="/" element={<Navigate to="/today" replace />} />
      <Route path="/board" element={<Navigate to="/today" replace />} />
      <Route path="/today" element={<MovementsPage variant="today" />} />
      <Route path="/movements/:id" element={<MovementRecordPage />} />
      <Route path="/arrivals" element={<MovementsPage variant="arrivals" />} />
      <Route path="/departures" element={<MovementsPage variant="departures" />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/bookings" element={<BookingsPage />} />
      <Route path="/guests" element={<GuestsPage />} />
      <Route path="/rooms" element={<RoomsPage />} />
      <Route path="/checkin" element={<CheckinPage />} />
      <Route path="/duties" element={<DutiesPage />} />
      <Route path="/staff" element={<StaffPage />} />
      <Route path="/leave" element={<LeavePage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/broadcasts" element={<BroadcastsPage />} />
      <Route path="/print" element={<PrintPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Route>
  </Routes>
);
