// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { Kasse } from '../src/ui/Kasse'
import { db } from '../src/storage/db'
import { einrichten } from '../src/application/kasse'
import type { Pin } from '../src/application/pin'

const testPin: Pin = {
  version: 1,
  verfahren: 'PBKDF2-SHA-256',
  iterationen: 600000,
  salt: '00'.repeat(16),
  pruefwert: '00'.repeat(32),
}
afterEach(async () => {
  cleanup()
  await db.delete()
  vi.unstubAllGlobals()
})
it.each([320, 1100])(
  'zeigt Artikel, Bestellung und Summe bei %i Pixeln',
  async (breite) => {
    vi.stubGlobal('innerWidth', breite)
    await db.open()
    const id = await einrichten(db, 'Testfest', 200, testPin)
    render(<Kasse eventId={id} offenMelden={() => {}} />)
    const rot = await screen.findByRole('button', { name: /Glühwein rot 4/ })
    fireEvent.click(rot)
    expect(
      screen.getByRole('heading', { name: 'Offene Bestellung' }),
    ).toBeTruthy()
    expect(screen.getAllByText('6,00 € kassieren')).toHaveLength(2)
  },
)
