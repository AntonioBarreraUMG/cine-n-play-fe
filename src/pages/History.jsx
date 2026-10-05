import { useEffect, useState } from "react";
import { History as HistoryIcon, RefreshCw } from "lucide-react";
import { api } from "../api";
import {
  Alert,
  Heading,
  Loading,
  Pagination,
  formatDate,
} from "../components/UI";

export default function History() {

  const [rows, setRows] = useState([]);
  const [offset, setOffset] = useState(0);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    setError("");
    api(`/historial?offset=${offset}&limit=10`, { signal: controller.signal })
      .then(setRows)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, [offset, reload]);

  return (
    <div className="page">
      <Heading
        eyebrow="TU ESPACIO"
        title="Tus descubrimientos, guardados."
        description="Vuelve a las preguntas y respuestas de tu catálogo."
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
      <section className="card">
        {busy ? (
          <Loading />
        ) : error ? (
          <div className="empty-state">
            No pudimos cargar tu historial. Intenta actualizar.
          </div>
        ) : rows.length ? (
          <div className="table-scroll">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Pregunta</th>
                  <th>Respuesta</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id_conversacion}>
                    <td className="date-cell">{formatDate(row.fecha)}</td>
                    <td>{row.pregunta}</td>
                    <td className="history-answer">{row.respuesta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <HistoryIcon size={35} />
            <h2>Tu historia empieza con una pregunta.</h2>
            <p>Tus consultas aparecerán aquí después de conversar.</p>
          </div>
        )}
        <Pagination
          offset={offset}
          limit={10}
          count={rows.length}
          busy={busy || !!error}
          onChange={setOffset}
        />
      </section>
    </div>
  );
}
