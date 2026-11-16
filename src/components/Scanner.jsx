import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { sb } from '../supabase'
import Msg from './Msg'

export default function Scanner({ grupo, setGrupo }) {
  const camara = useRef(null)
  const ultimo = useRef({ txt: '', t: 0 })
  const grupoRef = useRef(grupo)
  const [manual, setManual] = useState('')
  const [m, setM] = useState(null)

  useEffect(() => { grupoRef.current = grupo }, [grupo])


  useEffect(() => () => detener(), [])

  function detener() {
    if (camara.current) {
      camara.current.stop().catch(() => {})
      camara.current = null
    }
  }

  async function registrar(txt) {
    const ahora = Date.now()
    if (txt === ultimo.current.txt && ahora - ultimo.current.t < 4000) return
    ultimo.current = { txt, t: ahora }

    const g = grupoRef.current.trim()
    if (!g) return setM({ t: 'Escribe primero la materia o grupo', k: 'err' })

    const { data, error } = await sb.rpc('registrar_asistencia', { p_uid: txt, p_grupo: g })
    if (error) {
      return setM({ t: error.message.includes('uuid') ? 'QR no válido' : error.message, k: 'err' })
    }
    if (data.tipo === 'COMPLETO') {
      setM({ t: `${data.nombre} ya tiene entrada y salida hoy`, k: 'err' })
    } else {
      setM({ t: `✔ ${data.tipo}: ${data.nombre} · ${data.hora}`, k: 'ok' })
    }
  }

  async function abrirCamara() {
    try {
      const s = new Html5Qrcode('reader')
      camara.current = s
      await s.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 230, height: 230 } },
        registrar
      )
    } catch {
      setM({ t: 'No se pudo abrir la cámara. Usa el campo manual.', k: 'err' })
    }
  }

  return (
    <div className="card">
      <h2>Escanear alumno</h2>

      <label>Materia / grupo</label>
      <input value={grupo} onChange={e => setGrupo(e.target.value)} placeholder="Ej. Física 1 · Gpo 003" />

      <div className="row"><button onClick={abrirCamara}>Abrir cámara</button></div>
      <div id="reader"></div>
      <Msg m={m} />

      <label>¿Sin cámara? Pega el código del QR</label>
      <div className="row" style={{ marginTop: 0 }}>
        <input value={manual} onChange={e => setManual(e.target.value)} />
        <button className="sec" onClick={() => registrar(manual.trim())}>Registrar</button>
      </div>
    </div>
  )
}
