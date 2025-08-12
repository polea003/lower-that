import { test, expect } from '@playwright/test'

test('home renders UI and controls', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /lower that/i })).toBeVisible()
  await expect(page.getByRole('textbox', { name: /preferred content description/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /start/i })).toBeVisible()
})
