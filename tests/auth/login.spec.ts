import 'dotenv/config';
import { test, expect, type Page } from '@playwright/test';

// --------------------------------------------------------------

const STEP_DELAY_MS = Number(process.env.PW_STEP_DELAY_MS ?? 500);

function getEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Thiếu biến môi trường: ${name}`);
  }

  return value;
}

const LOGIN_USERNAME = getEnv('PW_LOGIN_USERNAME');
const LOGIN_USERNAME_PASSWORD = getEnv('PW_LOGIN_USERNAME_PASSWORD');
const LOGIN_EMAIL = getEnv('PW_LOGIN_EMAIL');
const LOGIN_EMAIL_PASSWORD = getEnv('PW_LOGIN_EMAIL_PASSWORD');
const INVALID_LOGIN_USERNAME =
  process.env.PW_INVALID_LOGIN_USERNAME?.trim() || 'vytrandev';
const INVALID_LOGIN_PASSWORD =
  process.env.PW_INVALID_LOGIN_PASSWORD?.trim() || 'wrong-password';

async function waitStep(page: Page, timeout = STEP_DELAY_MS) {
  await page.waitForTimeout(timeout);
}

async function gotoLogin(page: Page) {
  await page.goto('/dang-nhap');
  // await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('input-username-login')).toBeVisible();
  await waitStep(page, 300);
}

async function fillLoginForm(page: Page, username: string, password: string) {
  const usernameInput = page.getByTestId('input-username-login');
  const passwordInput = page.getByTestId('input-password-login');
  const loginButton = page.locator('#button-submit-login');

  await expect(usernameInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  await expect(loginButton).toBeVisible();

  await usernameInput.click({ delay: 150 });
  await waitStep(page, 300);
  await usernameInput.pressSequentially(username, { delay: 120 });
  await waitStep(page);

  await passwordInput.click({ delay: 150 });
  await waitStep(page, 300);
  await passwordInput.pressSequentially(password, { delay: 120 });
  await waitStep(page);
}

async function submitLogin(page: Page) {
  const loginButton = page.locator('#button-submit-login');

  await expect(loginButton).toBeEnabled();
  await waitStep(page);
  await loginButton.click({ delay: 150 });
  await waitStep(page, 800);
}

test.describe('Login', () => {
  test('Đăng nhập thành công với username', async ({ page }) => {
    await gotoLogin(page);
    await fillLoginForm(page, LOGIN_USERNAME, LOGIN_USERNAME_PASSWORD);
    await submitLogin(page);

    await expect(page).toHaveURL(/\/tong-quan\?tab=du-an/);
    await expect(page.locator('#button-submit-login')).not.toBeVisible();
  });

  // test('Đăng nhập thành công với email', async ({ page }) => {
  //   await gotoLogin(page);
  //   await fillLoginForm(page, LOGIN_EMAIL, LOGIN_EMAIL_PASSWORD);
  //   await submitLogin(page);

  //   await expect(page).toHaveURL(/\/tong-quan\?tab=du-an/);
  //   await expect(page.locator('#button-submit-login')).not.toBeVisible();
  // });

  test('Trường bắt buộc hiển thị khi để trống', async ({ page }) => {
    await gotoLogin(page);
    await submitLogin(page);

    await expect(page.getByText('Vui lòng nhập tên đăng nhập')).toBeVisible();
    await expect(page.getByText('Vui lòng nhập mật khẩu')).toBeVisible();
  });

  test('Chỉ nhập dấu cách vào trường sẽ hiển thị thông báo lỗi', async ({
    page,
  }) => {
    await gotoLogin(page);
    await fillLoginForm(page, '   ', '   ');
    await submitLogin(page);

    await expect(page.getByText('Vui lòng nhập tên đăng nhập')).toBeVisible();
    await expect(page.getByText('Vui lòng nhập mật khẩu')).toBeVisible();
  });

  test('Sai tài khoản hoặc mật khẩu hiện thông báo lỗi', async ({ page }) => {
    await gotoLogin(page);
    await fillLoginForm(page, INVALID_LOGIN_USERNAME, INVALID_LOGIN_PASSWORD);
    await submitLogin(page);

    await expect(
      page.getByText('Tên đăng nhập hoặc mật khẩu không hợp lệ'),
    ).toBeVisible();
  });
});
