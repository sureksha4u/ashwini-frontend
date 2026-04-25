import { test, expect } from '@playwright/test';

test.describe('Ashwini HMS E2E Verification', () => {

  test('Admin Role: Login and UI Verification', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.fill('input[type="email"]', 'admin@ashwini.hms');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Sign In")');

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h3:has-text("Organization Management")')).toBeVisible();

    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('[object Object]');
  });

  test('Pharmacist Role: Login and Restricted UI Verification', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.fill('input[type="email"]', 'pharmacist@ashwini.hms');
    await page.fill('input[type="password"]', 'pharmacy123');
    await page.click('button:has-text("Sign In")');

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h3:has-text("Organization Management")')).toBeHidden();

    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('[object Object]');
  });

  test('Pharmacy Integration: Inventory & Search', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.fill('input[type="email"]', 'pharmacist@ashwini.hms');
    await page.fill('input[type="password"]', 'pharmacy123');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/.*dashboard/);

    // Test Global Search in Dashboard
    await page.fill('input[placeholder*="Search by Name"]', 'Rahul');
    const result = page.locator('button:has-text("Rahul")').first();
    await expect(result).toBeVisible();

    // Go to Pharmacy Inventory
    await page.click('button:has-text("Pharmacy")');
    await expect(page).toHaveURL(/.*pharmacy/);
    await expect(page.locator('h1:has-text("Pharmacy Inventory")')).toBeVisible();

    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('[object Object]');
  });
});
