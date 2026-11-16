export default function Msg({ m }) {
  if (!m) return null
  return <div className={`msg ${m.k}`}>{m.t}</div>
}