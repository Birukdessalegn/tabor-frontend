import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import FrontDeskLayout from "./layouts/FrontDeskLayout";
import FrontDeskPage from "./modules/frontdesk/pages/FrontDeskPage";
import ReservationsListPage from "./modules/frontdesk/pages/ReservationsListPage";
import ReservationHistoryPage from "./modules/frontdesk/pages/ReservationHistoryPage";
import RoomManagementPage from "./modules/frontdesk/pages/RoomManagementPage";
import FrontDeskReportsPage from "./modules/frontdesk/pages/FrontDeskReportsPage";
import UserManagementPage from "./modules/frontdesk/pages/UserManagementPage";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm">
        Loading...
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.role !== "admin" && user?.role !== "manager") {
    return <Navigate to="/frontdesk" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route
            path="/frontdesk"
            element={
              <PrivateRoute>
                <FrontDeskLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<FrontDeskPage />} />
            <Route path="reservations" element={<ReservationsListPage />} />
            <Route path="history" element={<ReservationHistoryPage />} />
            <Route
              path="rooms"
              element={
                <AdminRoute>
                  <RoomManagementPage />
                </AdminRoute>
              }
            />
            <Route path="reports" element={<FrontDeskReportsPage />} />
            <Route
              path="users"
              element={
                <AdminRoute>
                  <UserManagementPage />
                </AdminRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/frontdesk" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
