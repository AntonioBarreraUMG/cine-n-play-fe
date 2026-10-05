import { useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Film,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Gamepad2,
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { Alert } from "../components/UI";

export default function Login() {

  const { user, login, notice } = useAuth();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (user) return <Navigate to="/chat" replace />;

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await login(correo.trim(), password);
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-story">
        <div className="brand">
          <span className="brand-mark">
            <Film size={22} />
          </span>
          Cine<span className="brand-amp">&</span>Play
        </div>
        <div className="story-content">
          <span className="pill">
            <Sparkles size={14} /> UN CATÁLOGO. MUCHAS HISTORIAS.
          </span>
          <h1>
            Tu próxima
            <br />
            gran historia
            <br />
            <em>empieza aquí.</em>
          </h1>
          <p>
            Explora películas y videojuegos con un asistente que conoce tu
            catálogo.
          </p>
          <div className="story-cards">
            <div>
              <Film />
              <span>Para cinéfilos</span>
              <strong>
                Luces, cámara,
                <br />
                descubrimiento.
              </strong>
            </div>
            <div>
              <Gamepad2 />
              <span>Para jugadores</span>
              <strong>
                Tu siguiente
                <br />
                aventura te espera.
              </strong>
            </div>
          </div>
        </div>
        <small>Películas + videojuegos + un poco de curiosidad.</small>
      </section>
      <section className="login-panel">
        <div className="login-form">
          <p className="eyebrow">BIENVENIDO DE NUEVO</p>
          <h2>Entra a tu espacio.</h2>
          <p className="muted">Inicia sesión para conversar y descubrir.</p>
          <Alert>{notice}</Alert>
          <Alert>{error}</Alert>
          <form onSubmit={submit}>
            <label>
              Correo electrónico
              <input
                type="email"
                autoComplete="username"
                required
                maxLength={254}
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="tu@correo.com"
                disabled={busy}
              />
            </label>
            <label>
              Contraseña
              <div className="password-field">
                <input
                  type={visible ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  maxLength={128}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  disabled={busy}
                />
                <button
                  type="button"
                  aria-label={
                    visible ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            <button className="primary full" disabled={busy}>
              {busy ? "Iniciando sesión…" : "Iniciar sesión"}
              <ArrowRight size={18} />
            </button>
          </form>
          <p className="login-note">
            ¿Necesitas una cuenta? Solicítala al administrador.
          </p>
        </div>
        <small className="login-footer">
          Cine & Play · Tu catálogo, en conversación
        </small>
      </section>
    </main>
  );
}
