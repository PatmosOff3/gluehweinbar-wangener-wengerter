import { afterEach, expect, it, vi } from 'vitest'
import { speicherPruefen } from '../src/pwa/status'

afterEach(() => vi.unstubAllGlobals())
it('erkennt gewährten Speicher und Ablehnung sowie fehlende Unterstützung', async () => {
  for (const antwort of [true, false]) {
    const persist = vi.fn(async () => antwort)
    vi.stubGlobal('navigator', {
      storage: { persisted: async () => false, persist },
    })
    expect(await speicherPruefen(true)).toBe(antwort)
    expect(persist).toHaveBeenCalledOnce()
  }
  vi.stubGlobal('navigator', { storage: { persisted: async () => true } })
  expect(await speicherPruefen(false)).toBe(true)
  vi.stubGlobal('navigator', {})
  expect(await speicherPruefen(true)).toBe(false)
})
