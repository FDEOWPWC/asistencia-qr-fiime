import { useEffect, useState } from 'react'
import { sb } from './supabase'
import Login from './components/Login'
import Alumno from './components/Alumno'
import Scanner from './components/Scanner'
import Lista from './components/Lista'
import Usuarios from './components/Usuarios'

const PESTANAS = {
  alumno: [],
  maestro: [['scan', 'Escanear'], ['lista', 'Asistencia']],
  admin: [['lista', 'Asistencias'], ['scan', 'Escanear'], ['usuarios', 'Usuarios']],
}
const INICIAL = { alumno: 'alumno', maestro: 'scan', admin: 'lista' }

export default function App() {
  const [me, setMe] = useState(null)
  const [tab, setTab] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [grupo, setGrupo] = useState('')

  async function cargarPerfil() {
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return
    const { data, error } = await sb.from('profiles').select('*').eq('id', user.id).single()
    if (error) {
      await sb.auth.signOut()
      setError('No se pudo cargar tu perfil')
      return
    }
    setError('')
    setMe(data)
    setTab(INICIAL[data.role])
  }

  useEffect(() => {
    sb.auth.getSession().then(async ({ data }) => {
      if (data.session) await cargarPerfil()
      setCargando(false)
    })
  }, [])

  async function salir() {
    await sb.auth.signOut()
    setMe(null)
    setTab('')
  }

  if (cargando) return <main><p className="mut">Cargando…</p></main>

  return (
    <>
      <header>
  <b>Asistencia QR · FIME</b>
  <div className="header-der">
    {me && (
      <>
        <span className="mut">{me.usuario} · {me.role}</span>
        <button className="sec" onClick={salir}>Salir</button>
      </>
    )}
    <img src="/logo-fime.png" alt="Logo FIME" className="logo" />
  </div>
</header>

      <main>
        {!me && <Login onEntrar={cargarPerfil} error={error} />}

        {me && (
          <>
            {PESTANAS[me.role].length > 0 && (
              <div className="tabs">
                {PESTANAS[me.role].map(([clave, texto]) => (
                  <button key={clave} className={clave === tab ? '' : 'sec'} onClick={() => setTab(clave)}>
                    {texto}
                  </button>
                ))}
              </div>
            )}

            {tab === 'alumno' && <Alumno me={me} setMe={setMe} />}
            {tab === 'scan' && <Scanner grupo={grupo} setGrupo={setGrupo} />}
            {tab === 'lista' && <Lista esAdmin={me.role === 'admin'} />}
            {tab === 'usuarios' && <Usuarios me={me} />}
          </>
        )}
      </main>
    </>
  )
}
