import { test, expect } from '@playwright/test'

test('home renders heading and button', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /vite \+ react/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /home/i })).toBeVisible()
})

