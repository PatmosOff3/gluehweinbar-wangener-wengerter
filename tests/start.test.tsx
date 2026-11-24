// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { App } from '../src/ui/App'

it('öffnet die Glühweinbar', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: 'Glühweinbar' })).toBeTruthy()
})
