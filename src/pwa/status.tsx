import { useEffect, useState } from 'react'

export async function speicherPruefen(anfordern: boolean) {
  try {
    if (await navigator.storage?.persisted?.()) return true
    return anfordern && !!(await navigator.storage?.persist?.())
  } catch {
    return false
  }
}
export function Fensterwarnung() {
  const [weiteres, setzen] = useState(false)
  useEffect(() => {
    if (!('BroadcastChannel' in window)) return
    const kanal = new BroadcastChannel('gluehweinbar-fenster')
    const id = crypto.randomUUID()
    kanal.onmessage = (e) => {
      if (e.data?.frage) kanal.postMessage({ antwort: e.data.frage })
      if (e.data?.antwort === id) setzen(true)
    }
    kanal.postMessage({ frage: id })
    return () => kanal.close()
  }, [])
  return weiteres ? (
    <p role="status">
      Die Kasse ist in einem weiteren Fenster geöffnet. Bitte nur ein Fenster
      bedienen.
    </p>
  ) : null
}
export function PwaStatus({ offen }: { offen: boolean }) {
  const [bereit, setzen] = useState(false)
  const [wartend, update] = useState<ServiceWorkerRegistration>()
  const [installiert, installation] = useState(false)
  useEffect(() => {
    const modus = window.matchMedia?.('(display-mode: standalone)')
    const pruefen = () =>
      installation(
        !!modus?.matches ||
          !!(navigator as Navigator & { standalone?: boolean }).standalone,
      )
    pruefen()
    modus?.addEventListener('change', pruefen)
    const installiertMelden = () => installation(true)
    window.addEventListener('appinstalled', installiertMelden)
    let aktiv = true
    let registration: ServiceWorkerRegistration | undefined
    let worker: ServiceWorker | null = null
    const status = () => {
      if (aktiv && registration?.waiting && navigator.serviceWorker.controller)
        update(registration)
    }
    const gefunden = () => {
      worker?.removeEventListener('statechange', status)
      worker = registration?.installing ?? null
      worker?.addEventListener('statechange', status)
      status()
    }
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register(import.meta.env.BASE_URL + 'sw.js')
        .then((r) => {
          if (!aktiv) return
          registration = r
          r.addEventListener('updatefound', gefunden)
          gefunden()
          return navigator.serviceWorker.ready.then(() => {
            if (aktiv) setzen(true)
          })
        })
        .catch(() => {
          if (aktiv) setzen(false)
        })
    }
    return () => {
      aktiv = false
      modus?.removeEventListener('change', pruefen)
      window.removeEventListener('appinstalled', installiertMelden)
      registration?.removeEventListener('updatefound', gefunden)
      worker?.removeEventListener('statechange', status)
    }
  }, [])
  const uebernehmen = () => {
    const sw = wartend?.waiting
    if (!sw || offen) return
    sw.addEventListener('statechange', () => {
      if (sw.state === 'activated') window.location.reload()
    })
    sw.postMessage({ type: 'SKIP_WAITING' })
  }
  return (
    <footer>
      <span>
        {bereit ? 'Offline bereit' : 'Offline-Bereitschaft ausstehend'}
      </span>{' '}
      · {installiert ? 'Installiert' : 'Im Browser'}
      {wartend && (
        <p>
          Neue Version verfügbar.{' '}
          <button disabled={offen} onClick={uebernehmen}>
            Update übernehmen
          </button>
        </p>
      )}
    </footer>
  )
}
