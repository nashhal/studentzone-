import { test, expect } from "@playwright/test";

test.describe("Yemen Study public learning journey", () => {
  test("home page clearly leads into the curriculum", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator(".ys-hero-copy h1")).toContainText("تعلّم بتركيز");

    const curriculumLink = page.getByRole("link", { name: /استكشف المنهج/ });
    await expect(curriculumLink).toBeVisible();
    await curriculumLink.click();
    await expect(page.getByRole("heading", { level: 1, name: /اختر مرحلتك الدراسية/ })).toBeVisible();
  });

  test("curriculum opens with three stages and reveals only the selected grades", async ({ page }) => {
    await page.goto("./#/curriculum");
    await expect(page.getByRole("heading", { level: 1, name: /اختر مرحلتك الدراسية/ })).toBeVisible();
    await expect(page.locator(".ys-stage-grid-page .ys-stage-card")).toHaveCount(3);
    await expect(page.locator(".curriculum-grid .grade-card")).toHaveCount(0);

    await page.getByRole("link", { name: /المرحلة الابتدائية/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "المرحلة الابتدائية" })).toBeVisible();
    await expect(page.locator(".curriculum-grid .grade-card")).toHaveCount(6);
    await expect(page.locator(".curriculum-grid")).toContainText("الصف السادس الأساسي");
    await expect(page.locator(".curriculum-grid")).not.toContainText("الصف السابع الأساسي");

    await page.getByRole("button", { name: "المراحل الدراسية" }).click();
    await page.getByRole("link", { name: /المرحلة الأساسية/ }).click();
    await expect(page.locator(".curriculum-grid .grade-card")).toHaveCount(3);
    await expect(page.locator(".curriculum-grid")).toContainText("الصف السابع الأساسي");
    await expect(page.locator(".curriculum-grid")).not.toContainText("الصف السادس الأساسي");

    await page.getByRole("button", { name: "المراحل الدراسية" }).click();
    await page.getByRole("link", { name: /المرحلة الثانوية/ }).click();
    await expect(page.locator(".curriculum-grid .grade-card")).toHaveCount(3);
    await expect(page.locator(".curriculum-grid")).toContainText("الصف الثالث الثانوي");
    await expect(page.locator(".curriculum-grid")).not.toContainText("الصف التاسع الأساسي");
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
    await expect(page.getByRole("heading", { level: 1, name: /اختر مرحلتك الدراسية/ })).toBeVisible();
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


  test("homepage photography and learning-skill pathways render", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator(".ys-hero-image")).toBeVisible();
    await expect(page.locator(".ys-skill-card")).toHaveCount(3);
    await expect(page.locator(".ys-tool-list .ys-tool-card")).toHaveCount(11);
    const images = await page.locator(".ys-hero-image, .ys-skill-image img").evaluateAll((nodes) =>
      nodes.map((node) => ({ alt: node.getAttribute("alt"), src: node.getAttribute("src") }))
    );
    expect(images.every((item) => item.alt && item.src?.includes("images.pexels.com"))).toBeTruthy();
  });


  test("home tool icons use distinct Lucide symbols and consistent icon wells", async ({ page }) => {
    await page.goto("./");
    const iconAudit = await page.locator(".ys-tool-list .ys-tool-card .tool-icon").evaluateAll((nodes) =>
      nodes.map((node) => {
        const icon = node.querySelector("svg.lucide");
        const rect = node.getBoundingClientRect();
        return {
          iconClass: icon?.getAttribute("class") || "",
          width: rect.width,
          height: rect.height,
          strokeWidth: icon ? getComputedStyle(icon).strokeWidth : "",
        };
      })
    );
    expect(iconAudit).toHaveLength(11);
    expect(iconAudit.every((item) => item.iconClass.includes("lucide-"))).toBeTruthy();
    expect(new Set(iconAudit.map((item) => item.iconClass)).size).toBeGreaterThanOrEqual(9);
    expect(iconAudit.every((item) => item.width >= 40 && item.height >= 40)).toBeTruthy();
    expect(iconAudit.every((item) => Number.parseFloat(item.strokeWidth) <= 2)).toBeTruthy();
  });

  test("student dashboard exposes metrics derived from recorded activity", async ({ page }) => {
    await page.goto("./#/dashboard");
    await expect(page.locator(".ys-performance-panel")).toBeVisible();
    await expect(page.getByRole("heading", { name: "مؤشرات أدائك المسجّلة." })).toBeVisible();
    await expect(page.locator(".ys-accuracy-track[role='progressbar']")).toBeVisible();
  });

  test("subject overview includes a course photo and learning sequence", async ({ page }) => {
    await page.goto("./#/subject/grade-12/scientific/physics");
    await expect(page.locator(".ys-subject-feature")).toBeVisible();
    await expect(page.locator(".ys-subject-skill-tags")).toContainText("01 الفهم");
  });

  test("content remains visible when reduced motion is requested", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./");
    await expect(page.locator(".ys-hero-copy h1")).toBeVisible();
    await expect(page.locator(".ys-hero-image")).toBeVisible();
  });
});
