import { useState } from 'react'
import { sb, emailDe, validUser } from '../supabase'
import Msg from './Msg'

export default function Login({ onEntrar, error }) {
  const [registro, setRegistro] = useState(false)
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [m, setM] = useState(null)

  async function entrar() {
    if (!u || !p) return
    const { error } = await sb.auth.signInWithPassword({ email: emailDe(u), password: p })
    if (error) return setM({ t: 'Usuario o contraseña incorrectos', k: 'err' })
    onEntrar()
  }

  async function registrar() {
    const usuario = u.trim().toLowerCase()
    if (!validUser(usuario) || p.length < 6) {
      return setM({ t: 'Usuario de 3 a 30 caracteres (letras/números) y contraseña de 6+', k: 'err' })
    }
    const { error } = await sb.auth.signUp({
      email: emailDe(usuario),
      password: p,
      options: { data: { usuario } },
    })
    if (error) return setM({ t: error.message, k: 'err' })

    const { error: e2 } = await sb.auth.signInWithPassword({ email: emailDe(usuario), password: p })
    if (e2) return setM({ t: 'Cuenta creada. Desactiva "Confirm email" en Supabase para entrar directo.', k: 'err' })
    onEntrar()
  }

  return (
   <div className="login-pantalla">
  <div className="card centro">
    <h2>{registro ? 'Crear cuenta de alumno' : 'Iniciar sesión'}</h2>

    <label>Usuario</label>
    <input value={u} onChange={e => setU(e.target.value)} autoComplete="username" />

    <label>Contraseña{registro ? ' (mín. 6)' : ''}</label>
    <input type="password" value={p} onChange={e => setP(e.target.value)} autoComplete={registro ? 'new-password' : 'current-password'} />

    <div className="row">
      <button onClick={registro ? registrar : entrar}>{registro ? 'Crear' : 'Entrar'}</button>
      <button className="sec" onClick={() => { setRegistro(!registro); setM(null) }}>
        {registro ? 'Volver' : 'Darme de alta'}
      </button>
    </div>

    <Msg m={m || (error ? { t: error, k: 'err' } : null)} />
  </div>
</div>
  )
}
