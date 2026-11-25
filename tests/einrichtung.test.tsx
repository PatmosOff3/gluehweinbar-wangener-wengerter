// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, it } from 'vitest'
import { Einrichtung } from '../src/ui/Einrichtung'
import { db } from '../src/storage/db'

it('verlangt einen gültigen Veranstaltungsnamen, eine PIN, Pfand und ein bestätigtes Sortiment', async () => {
  render(<Einrichtung />)
  expect((screen.getByLabelText('Pfand pro Gefäß (€)') as HTMLInputElement).value).toBe('5,00')
  const knopf = screen.getByRole('button', { name: 'Kasse einrichten' })
  const form = knopf.closest('form')!
  fireEvent.click(knopf)
  expect(form.checkValidity()).toBe(false)
  expect(await db.events.count()).toBe(0)
  fireEvent.change(screen.getByLabelText('Veranstaltungsname'), {
    target: { value: 'Probe' },
  })
  fireEvent.change(screen.getByLabelText('Admin-PIN'), {
    target: { value: '123' },
  })
  expect(form.checkValidity()).toBe(false)
  fireEvent.change(screen.getByLabelText('Admin-PIN'), {
    target: { value: '1234' },
  })
  expect(form.checkValidity()).toBe(false)
  fireEvent.click(screen.getByLabelText('Standardsortiment übernehmen'))
  fireEvent.change(screen.getByLabelText('Pfand pro Gefäß (€)'), {
    target: { value: '-1' },
  })
  fireEvent.click(knopf)
  await waitFor(() =>
    expect(screen.getByRole('alert').textContent).toContain('Betrag'),
  )
  expect(await db.events.count()).toBe(0)
  await db.delete()
})
