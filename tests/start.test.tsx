// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { App } from '../src/ui/App'
import { db } from '../src/storage/db'

afterEach(async () => {
  cleanup()
  await db.delete()
})

it('öffnet die Glühweinbar nach Vorbereitung der Preisliste', async () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: 'Glühweinbar' })).toBeTruthy()
  expect(await screen.findByRole('button', { name: 'Kasse einrichten' })).toBeTruthy()
  expect(screen.queryByRole('alert')).toBeNull()
})
