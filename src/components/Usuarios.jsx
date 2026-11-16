import { useEffect, useState } from 'react'
import { sb } from '../supabase'
import Msg from './Msg'

export default function Usuarios({ me }) {
  const [users, setUsers] = useState([])
  const [m, setM] = useState(null)

  useEffect(() => {
    sb.from('profiles').select('*')
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data, error }) => {
        if (error) setM({ t: error.message, k: 'err' })
        else setUsers(data)
      })
  }, [])

  async function cambiarRol(id, role) {
    const { error } = await sb.from('profiles').update({ role }).eq('id', id)
    if (error) return setM({ t: error.message, k: 'err' })
    setUsers(us => us.map(u => (u.id === id ? { ...u, role } : u)))
  }

  return (
    <div className="card">
      <h2>Usuarios</h2>
      <p className="mut">Los alumnos se registran solos; aquí cambias su rol (por ejemplo, a maestro).</p>
      <Msg m={m} />

      <div className="scroll">
        <table>
          <thead>
            <tr><th>Usuario</th><th>Rol</th><th>Alumno</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.usuario}</td>
                <td>
                  <select value={u.role} disabled={u.id === me.id}
                    onChange={e => cambiarRol(u.id, e.target.value)}>
                    <option>alumno</option>
                    <option>maestro</option>
                    <option>admin</option>
                  </select>
                </td>
                <td>{u.nombre ? `${u.nombre} · ${u.matricula}` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}