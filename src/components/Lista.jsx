import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { sb } from '../supabase'
import Msg from './Msg'

export default function Lista({ esAdmin }) {
  const [rows, setRows] = useState([])
  const [fecha, setFecha] = useState('')
  const [confirmar, setConfirmar] = useState(null)
  const [m, setM] = useState(null)

  useEffect(() => { cargar() }, [fecha])

  async function cargar() {
    let q = sb.from('asistencias').select('*')
      .order('fecha', { ascending: false })
      .order('entrada', { ascending: false })
      .limit(1000)
    if (fecha) q = q.eq('fecha', fecha)

    const { data, error } = await q
    if (error) setM({ t: error.message, k: 'err' })
    setRows(data || [])
  }

  async function actualizar(id, campo, valor) {
    const v = valor.length === 5 ? valor + ':00' : valor
    const { error } = await sb.from('asistencias').update({ [campo]: v || null }).eq('id', id)
    if (error) return setM({ t: error.message, k: 'err' })
    setRows(rs => rs.map(r => (r.id === id ? { ...r, [campo]: v || null } : r)))
  }

  async function borrar(id) {
    if (confirmar !== id) return setConfirmar(id)
    await sb.from('asistencias').delete().eq('id', id)
    setConfirmar(null)
    cargar()
  }

  function descargarExcel() {
    const datos = rows.map(r => ({
      Fecha: r.fecha, Grupo: r.grupo, Matrícula: r.matricula,
      Nombre: r.nombre, Carrera: r.carrera, Entrada: r.entrada, Salida: r.salida,
    }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(datos), 'Asistencia')
    XLSX.writeFile(wb, 'asistencia' + (fecha ? '_' + fecha : '') + '.xlsx')
  }

  return (
    <div className="card">
      <h2>Asistencias</h2>

      <div className="row" style={{ marginTop: 0 }}>
        <div>
          <label>Fecha</label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
        </div>
        <button onClick={descargarExcel}>⬇ Descargar Excel</button>
      </div>

      <Msg m={m} />

      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th>Fecha</th><th>Grupo</th><th>Matrícula</th><th>Nombre</th>
              <th>Carrera</th><th>Entrada</th><th>Salida</th>{esAdmin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan="8" className="mut">Sin registros</td></tr>
            )}
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.fecha}</td>
                <td>{r.grupo}</td>
                <td>{r.matricula}</td>
                <td>{r.nombre}</td>
                <td>{r.carrera}</td>
                {esAdmin ? (
                  <>
                    <td>
                      <input type="time" step="1" defaultValue={r.entrada ?? ''}
                        onChange={e => actualizar(r.id, 'entrada', e.target.value)} />
                    </td>
                    <td>
                      <input type="time" step="1" defaultValue={r.salida ?? ''}
                        onChange={e => actualizar(r.id, 'salida', e.target.value)} />
                    </td>
                    <td>
                      <button className="del" onClick={() => borrar(r.id)}>
                        {confirmar === r.id ? '¿Seguro?' : '✕'}
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{r.entrada ?? '—'}</td>
                    <td>{r.salida ?? '—'}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}