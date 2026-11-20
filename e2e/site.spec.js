import { test, expect } from "@playwright/test";

test.describe("Yemen Study public learning journey", () => {
  test("home page clearly leads into the curriculum", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator(".hero-copy h1")).toContainText("لتستعد لامتحاناتك");

    const curriculumLink = page.getByRole("link", { name: /استكشف المواد/ });
    await expect(curriculumLink).toBeVisible();
    await curriculumLink.click();
    await expect(page.getByRole("heading", { level: 1, name: /اختر صفك الدراسي/ })).toBeVisible();
  });

  test("a dedicated in-site lesson action opens the lesson", async ({ page }) => {
    await page.goto("./#/subject/grade-12/scientific/physics");
    await expect(page.getByRole("heading", { level: 1, name: "الفيزياء" })).toBeVisible();

    const openLesson = page.getByRole("link", { name: /ابدأ الدرس/ }).first();
    await expect(openLesson).toBeVisible();
    await openLesson.click();

    await expect(page.getByRole("heading", { level: 1, name: "الكميات القياسية والمتجهة" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "أهداف التعلّم" })).toBeVisible();
  });

  test("the mobile menu opens and navigates to the curriculum", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("./");

    const menuButton = page.locator('button[aria-controls="primary-navigation"]');
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-label", "فتح القائمة");
    await menuButton.click();

    const navigation = page.locator("#primary-navigation");
    await expect(navigation).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await expect(menuButton).toHaveAttribute("aria-label", "إغلاق القائمة");
    await navigation.getByRole("link", { name: /ابدأ الدراسة/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: /اختر صفك الدراسي/ })).toBeVisible();
  });

  test("the home page does not overflow at common desktop and mobile widths", async ({ page }) => {
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 860 });
      await page.goto("./");
      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scrollWidth, "Unexpected horizontal overflow at " + width + "px")
        .toBeLessThanOrEqual(dimensions.clientWidth + 1);
    }
  });

  test("content remains visible when reduced motion is requested", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./");
    await expect(page.locator(".hero-copy h1")).toBeVisible();
    await expect(page.locator(".hero-visual")).toBeVisible();
  });
});
