import { useState, lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import Layout from "./components/Layout";
import { Alert, Loading } from "./components/UI";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import History from "./pages/History";

const Consumption = lazy(() => import("./pages/Consumption"));

import Admin from "./pages/Admin";

function Protected() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function AdminOnly() {
  const { user } = useAuth();
  return user?.rol === "admin" ? <Outlet /> : <Navigate to="/chat" replace />;
}

function AppRoutes() {

  const { loading, bootError, restore, user } = useAuth();
  const [messages, setMessages] = useState([]);

  if (loading)
    return (
      <div className="boot-screen">
        <Loading text="Preparando tu espacio…" />
      </div>
    );

  if (bootError)
    return (
      <div className="boot-screen">
        <div>
          <Alert>{bootError}</Alert>
          <button className="primary" onClick={restore}>
            Volver a intentar
          </button>
        </div>
      </div>
    );

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected />}>
        <Route element={<Layout />}>
          <Route
            path="/chat"
            element={<Chat messages={messages} setMessages={setMessages} />}
          />
          <Route path="/historial" element={<History />} />
          <Route
            path="/consumo"
            element={
              <Suspense fallback={<Loading />}>
                <Consumption />
              </Suspense>
            }
          />
          <Route element={<AdminOnly />}>
            {["usuarios", "peliculas", "videojuegos"].map((resource) => (
              <Route
                key={resource}
                path={`/admin/${resource}`}
                element={<Admin key={resource} resource={resource} />}
              />
            ))}
          </Route>
        </Route>
      </Route>
      <Route
        path="*"
        element={<Navigate to={user ? "/chat" : "/login"} replace />}
      />
    </Routes>
  );
}

function SessionRoutes() {
  const { user } = useAuth();
  return <AppRoutes key={user?.id_usuario ?? "guest"} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SessionRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
