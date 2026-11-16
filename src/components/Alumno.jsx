import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { sb } from '../supabase'
import Msg from './Msg'

const CARRERAS = ['IMTC', 'IAS', 'IEA', 'IMA', 'IMT', 'LMT', 'IFI', 'IBT', 'ITS', 'IA']

export default function Alumno({ me, setMe }) {
  const [matricula, setMatricula] = useState(me.matricula ?? '')
  const [nombre, setNombre] = useState(me.nombre ?? '')
  const [carrera, setCarrera] = useState(me.carrera ?? CARRERAS[0])
  const [m, setM] = useState(null)

  async function guardar() {
    const mat = matricula.trim()
    const nom = nombre.trim()
    if (!mat || !nom) return setM({ t: 'Completa matrícula y nombre', k: 'err' })

    const { error } = await sb.from('profiles')
      .update({ matricula: mat, nombre: nom, carrera })
      .eq('id', me.id)
    if (error) return setM({ t: error.message, k: 'err' })

    setMe({ ...me, matricula: mat, nombre: nom, carrera })
    setM({ t: 'Datos guardados', k: 'ok' })
  }

  return (
    <div className="card">
      <h2>Mis datos</h2>

      <label>Matrícula</label>
      <input value={matricula} onChange={e => setMatricula(e.target.value)} inputMode="numeric" />

      <label>Nombre completo</label>
      <input value={nombre} onChange={e => setNombre(e.target.value)} />

      <label>Carrera</label>
      <select value={carrera} onChange={e => setCarrera(e.target.value)}>
        {CARRERAS.map(c => <option key={c}>{c}</option>)}
      </select>

      <div className="row"><button onClick={guardar}>Generar mi QR</button></div>
      <Msg m={m} />

      {me.matricula && (
        <>
          <div className="qr"><QRCodeSVG value={me.id} size={240} level="M" /></div>
          <p className="mut" style={{ textAlign: 'center' }}>
            Muestra este QR al maestro al entrar y al salir.
          </p>
        </>
      )}
    </div>
  )
}