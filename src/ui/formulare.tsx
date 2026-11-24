import { useRef, useState } from 'react'

export function useAktion() {
  const sperre = useRef(false)
  const [fehler, melden] = useState('')
  const [beschaeftigt, sperren] = useState(false)
  async function ausfuehren(aktion: () => Promise<void>) {
    if (sperre.current) return
    sperre.current = true
    sperren(true)
    melden('')
    try {
      await aktion()
    } catch (e) {
      melden(e instanceof Error ? e.message : 'Die Aktion ist fehlgeschlagen.')
    } finally {
      sperre.current = false
      sperren(false)
    }
  }
  return { ausfuehren, beschaeftigt, fehler }
}
export function Fehler({ text }: { text: string }) {
  return text ? (
    <p role="alert" className="fehler">
      {text}
    </p>
  ) : null
}
