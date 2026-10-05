import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Film, Gamepad2, ChartColumn, RefreshCw } from "lucide-react";
import { api } from "../api";
import { Alert, Heading, Loading, formatNumber } from "../components/UI";

export default function Consumption() {

  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    setError("");
    api("/consumo", { signal: controller.signal })
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, [reload]);

  const chart = data
    ? [
        { nombre: "Películas", tokens: data.peliculas },
        { nombre: "Videojuegos", tokens: data.videojuegos },
      ]
    : [];

  return (
    <div className="page">
      <Heading
        eyebrow="TU ACTIVIDAD"
        title="Cada pregunta cuenta."
        description="Consulta el consumo acumulado de tus conversaciones."
      >
        <button
          className="secondary"
          disabled={busy}
          onClick={() => setReload((v) => v + 1)}
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </Heading>
      <Alert>{error}</Alert>
      {busy ? (
        <Loading />
      ) : (
        data &&
        !error && (
          <>
            <div className="stat-grid">
              {[
                [Film, "Películas", data.peliculas],
                [Gamepad2, "Videojuegos", data.videojuegos],
                [ChartColumn, "Total utilizado", data.total],
              ].map(([Icon, label, value]) => (
                <div className="stat-card" key={label}>
                  <div className="stat-icon">
                    <Icon size={21} />
                  </div>
                  <span>{label}</span>
                  <strong>{formatNumber(value)}</strong>
                  <small>tokens del proyecto</small>
                </div>
              ))}
            </div>
            <section className="card chart-card">
              <h2>Consumo por categoría</h2>
              <p className="muted">
                Películas y videojuegos · acumulado de tu cuenta
              </p>
              <div
                className="chart"
                role="img"
                aria-label={`Películas: ${data.peliculas} tokens. Videojuegos: ${data.videojuegos} tokens.`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chart}
                    margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e6eae7"
                    />
                    <XAxis
                      dataKey="nombre"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#687a73" }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#687a73" }}
                      tickFormatter={(n) => formatNumber(n)}
                    />
                    <Tooltip
                      formatter={(value) => [formatNumber(value), "Tokens"]}
                      cursor={{ fill: "#f3f6f3" }}
                    />
                    <Bar
                      dataKey="tokens"
                      radius={[9, 9, 0, 0]}
                      maxBarSize={100}
                    >
                      {chart.map((item, i) => (
                        <Cell
                          key={item.nombre}
                          fill={i === 0 ? "#286b59" : "#b5c994"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {!data.total && (
                <p className="muted">
                  Aún no tienes consumo. Empieza con una pregunta en el chat.
                </p>
              )}
            </section>
            <p className="footnote">
              Para este proyecto, cada palabra procesada equivale a un token.
              Este conteo incluye el contexto y la respuesta; no representa el
              costo de la API.
            </p>
          </>
        )
      )}
    </div>
  );
}
