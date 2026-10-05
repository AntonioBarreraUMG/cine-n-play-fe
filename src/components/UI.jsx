import { useEffect, useRef } from 'react';
import { LoaderCircle, X, ArrowLeft, ArrowRight } from 'lucide-react';
export const formatNumber = value => Number(value || 0).toLocaleString('es-GT');
export const formatDate = value => value ? new Date(value).toLocaleString('es-GT') : '—';
export function Alert({ children, success = false }) { return children ? <div role={success ? 'status' : 'alert'} className={`alert ${success ? 'success' : ''}`}>{children}</div> : null; }
export function Loading({ text = 'Cargando…' }) { return <div className="loading" role="status"><LoaderCircle className="spin" size={20}/>{text}</div>; }
export function Heading({ eyebrow, title, description, children }) { return <header className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p className="muted">{description}</p>}</div>{children}</header>; }
export function Pagination({ offset, limit, count, busy, onChange }) { return <div className="pagination"><span>{count ? `${offset + 1}–${offset + count}` : 'Sin resultados'} · {limit} por página</span><div><button className="icon-button" aria-label="Página anterior" disabled={busy || offset === 0} onClick={() => onChange(Math.max(0, offset - limit))}><ArrowLeft size={18}/></button><button className="icon-button" aria-label="Página siguiente" disabled={busy || count < limit} onClick={() => onChange(offset + limit)}><ArrowRight size={18}/></button></div></div>; }
export function Modal({ title, children, onClose, busy }) {
  const ref = useRef(null);
  useEffect(() => { const dialog = ref.current; dialog.showModal(); return () => dialog.close(); }, []);
  return <dialog ref={ref} className="modal" onCancel={e => { e.preventDefault(); if (!busy) onClose(); }} aria-labelledby="modal-title"><div className="modal-heading"><h2 id="modal-title">{title}</h2><button className="icon-button" type="button" aria-label="Cerrar ventana" disabled={busy} onClick={onClose}><X size={20}/></button></div>{children}</dialog>;
}
