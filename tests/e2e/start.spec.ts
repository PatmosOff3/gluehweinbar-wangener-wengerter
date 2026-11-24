import { expect, test } from '@playwright/test'

test('öffnet die Kasse im Produktions-Build', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Glühweinbar' })).toBeVisible()
})
