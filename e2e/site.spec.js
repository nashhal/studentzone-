import { test, expect } from "@playwright/test";

test.describe("Yemen Study public learning journey", () => {
  test("home page clearly leads into the curriculum", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator(".ys-hero-copy h1")).toContainText("كل ما تحتاجه للمراجعة");

    const curriculumLink = page.getByRole("link", { name: /تصفّح المنهج/ });
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

  test("the physics subject CTA opens its complete in-site learning module", async ({ page }) => {
    await page.goto("./#/subject/grade-12/scientific/physics");
    await expect(page.getByRole("heading", { level: 1, name: "الفيزياء" })).toBeVisible();

    const openLesson = page.getByRole("link", { name: "افتح شرح المادة والاختبارات" });
    await expect(openLesson).toBeVisible();
    await openLesson.click();

    await expect(page.getByRole("heading", { level: 2, name: "الفيزياء: كمية التحرك والمقذوفات" })).toBeVisible();
    await expect(page.getByText("أهداف التعلم", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /طباعة الوحدة كاملة/ })).toBeVisible();
  });

  test("primary curriculum lessons open with original diagrams, examples and answer feedback", async ({ page }) => {
    await page.goto("./#/subject/grade-1/general/mathematics");
    await expect(page.getByRole("heading", { level: 1, name: "الرياضيات" })).toBeVisible();
    await page.getByRole("link", { name: /ابدأ الدروس المصوّرة/ }).click();

    await expect(page.getByRole("heading", { level: 1, name: "الصف الأول الأساسي · الرياضيات" })).toBeVisible();
    await expect(page.locator(".ys-primary-outline > button")).toHaveCount(3);
    await expect(page.locator(".ys-primary-illustration svg").first()).toBeVisible();
    await expect(page.locator(".ys-primary-example")).toContainText("مثال محلول");
    await expect(page.locator(".ys-primary-practice")).toBeVisible();

    const choices = page.locator(".ys-primary-practice > div:first-of-type button");
    await choices.nth(0).click();
    const check = page.getByRole("button", { name: "تحقق من الإجابة" });
    await expect(check).toBeEnabled();
    await check.click();
    await expect(page.locator(".ys-primary-feedback")).toBeVisible();

    await page.locator(".ys-primary-outline > button").nth(1).click();
    await expect(page.getByRole("heading", { level: 2, name: "الأعداد من 0 إلى 10" })).toBeVisible();
    await expect(page.locator(".ys-primary-illustration").first()).toHaveAttribute("aria-label", /العدد والكمية/);
    await expect(page.getByRole("button", { name: "طباعة كراسة المادة" })).toBeVisible();
  });

  test("published primary social-studies lessons open from the Grade 3 subject page", async ({ page }) => {
    await page.goto("./#/subject/grade-3/general/social-studies");
    await page.getByRole("link", { name: /ابدأ الدروس المصوّرة/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "الصف الثالث الأساسي · الاجتماعيات" })).toBeVisible();
    await expect(page.locator(".ys-primary-outline > button")).toHaveCount(3);
  });

  test("primary lesson layouts remain usable on narrow screens", async ({ page }) => {
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 850 });
      await page.goto("./#/primary-learning/grade-2/general/science");
      await expect(page.getByRole("heading", { level: 1, name: "الصف الثاني الأساسي · العلوم" })).toBeVisible();
      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
    }
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
      const dimensions = await page.evaluate(() => {
        const viewportWidth = document.documentElement.clientWidth;
        const offenders = Array.from(document.querySelectorAll("body *"))
          .map((element) => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return {
              tag: element.tagName.toLowerCase(),
              id: element.id || "",
              className: typeof element.className === "string" ? element.className : "",
              left: Math.round(rect.left * 10) / 10,
              right: Math.round(rect.right * 10) / 10,
              width: Math.round(rect.width * 10) / 10,
              position: style.position,
              display: style.display,
              minWidth: style.minWidth,
              flexBasis: style.flexBasis,
              html: element.outerHTML.slice(0, 220),
            };
          })
          .filter((element) => element.width > 0 && (element.right > viewportWidth + 1 || element.left < -1))
          .sort((a, b) => b.right - a.right)
          .slice(0, 18);
        return {
          clientWidth: viewportWidth,
          scrollWidth: document.documentElement.scrollWidth,
          offenders,
        };
      });
      expect(
        dimensions.scrollWidth,
        "Unexpected horizontal overflow at " + width + "px. Offenders: " + JSON.stringify(dimensions.offenders)
      ).toBeLessThanOrEqual(dimensions.clientWidth + 1);
    }
  });


  test("homepage presents a revision-first learning journey", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator(".sme-hero-search input")).toBeVisible();
    await expect(page.locator(".sme-how-card")).toHaveCount(3);
    await expect(page.locator(".ys-stage-grid .ys-stage-card")).toHaveCount(3);
    await expect(page.locator(".ys-tool-list .ys-tool-card")).toHaveCount(11);
    await expect(page.locator(".sme-featured-course")).toBeVisible();
  });

  test("home tool cards keep all four elements in a readable grid", async ({ page }) => {
    for (const width of [1440, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: 860 });
      await page.goto("./");
      const sectionSpacing = await page.evaluate(() => {
        const intro = document.querySelector(".ys-tools-intro").getBoundingClientRect();
        const list = document.querySelector(".ys-tool-list").getBoundingClientRect();
        return { introBottom: intro.bottom, listTop: list.top };
      });
      expect(
        sectionSpacing.listTop,
        "Tool cards overlap the section heading at " + width + "px"
      ).toBeGreaterThanOrEqual(sectionSpacing.introBottom);

      const audit = await page.locator(".ys-tool-list .ys-tool-card").evaluateAll((cards) =>
        cards.map((card) => {
          const copy = card.querySelector(".ys-tool-copy");
          const arrow = card.querySelector(".ys-tool-arrow");
          const rect = (element) => {
            const box = element.getBoundingClientRect();
            return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width };
          };
          return {
            columns: getComputedStyle(card).gridTemplateColumns.split(" ").length,
            card: rect(card),
            number: rect(card.querySelector(".ys-tool-number")),
            icon: rect(card.querySelector(".tool-icon")),
            copy: rect(copy),
            arrow: rect(arrow),
          };
        })
      );
      expect(audit).toHaveLength(11);
      for (const card of audit) {
        expect(card.columns, "Expected four grid tracks at " + width + "px").toBe(4);
        expect(card.copy.width, "Tool copy is too narrow at " + width + "px: " + JSON.stringify(card)).toBeGreaterThan(100);
        for (const item of [card.number, card.icon, card.copy, card.arrow]) {
          expect(item.left, "Card child extends beyond left edge at " + width + "px").toBeGreaterThanOrEqual(card.card.left - 1);
          expect(item.right, "Card child extends beyond right edge at " + width + "px").toBeLessThanOrEqual(card.card.right + 1);
        }
      }
    }
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


  test("brand identity and personalised learning snapshot render", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator(".ys-site-header .ys-brand-mark")).toBeVisible();
    await expect(page.getByRole("heading", { name: "خطوتك التالية تبدأ من هنا." })).toBeVisible();
    await expect(page.locator(".ys-learning-stat")).toHaveCount(3);
    await expect(page.locator(".ys-learning-shortcuts a")).toHaveCount(3);
    const logo = await page.locator(".ys-site-header .ys-brand-mark svg").getAttribute("viewBox");
    expect(logo).toBe("0 0 48 48");
  });

  test("student dashboard exposes metrics derived from recorded activity", async ({ page }) => {
    await page.goto("./#/dashboard");
    await expect(page.locator(".ys-performance-panel")).toBeVisible();
    await expect(page.getByRole("heading", { name: "مؤشرات أدائك المسجّلة." })).toBeVisible();
    await expect(page.locator(".ys-accuracy-track[role='progressbar']")).toBeVisible();
  });

  test("grade 12 subject pages open the matching in-site learning module", async ({ page }) => {
    const cases = [
      {
        path: "./#/subject/grade-12/scientific/physics",
        subject: "الفيزياء",
        moduleHeading: "الفيزياء: كمية التحرك والمقذوفات",
      },
      {
        path: "./#/subject/grade-12/scientific/chemistry",
        subject: "الكيمياء",
        moduleHeading: "الكيمياء: العناصر الانتقالية",
      },
      {
        path: "./#/subject/grade-12/literary/mathematics-literary",
        subject: "الرياضيات — أدبي",
        moduleHeading: "الرياضيات: الإحصاء: الارتباط والانحدار",
      },
    ];

    for (const item of cases) {
      await page.goto(item.path);
      await expect(page.getByRole("heading", { level: 1, name: item.subject })).toBeVisible();
      const openHub = page.getByRole("link", { name: "افتح شرح المادة والاختبارات" });
      await expect(openHub).toBeVisible();
      await openHub.click();
      await expect(page.getByRole("heading", { level: 2, name: item.moduleHeading })).toBeVisible();
    }
  });

  test("all missing Grade 12 units are available as independent explained modules", async ({ page }) => {
    const modules = [
      { slug: "physics-nuclear", heading: "الفيزياء: الفيزياء النووية" },
      { slug: "physics-solar", heading: "الفيزياء: الطاقة الشمسية" },
      { slug: "physics-cosmology", heading: "الفيزياء: الفيزياء الكونية" },
      { slug: "biology-human-nutrition", heading: "الأحياء: التغذية في الإنسان" },
      { slug: "chemistry-environment", heading: "الكيمياء: الكيمياء والبيئة" },
    ];

    for (const item of modules) {
      await page.goto("./#/grade-12-learning?subject=" + item.slug);
      await expect(page.getByRole("heading", { level: 2, name: item.heading })).toBeVisible();
      await expect(page.locator(".g12-learning-lesson-picker button").first()).toBeVisible();
      await expect(page.locator(".g12-learning-lesson-practice")).toBeVisible();
      await expect(page.locator(".g12-learning-lesson-practice h4")).toBeVisible();
    }
  });

  test("unit printing contains all lesson content and Yemen Study identity", async ({ page }) => {
    await page.goto("./#/grade-12-learning?subject=physics-nuclear");

    const lessonNavigation = page.locator(".g12-learning-lesson-picker");
    await expect(lessonNavigation.locator("button")).toHaveCount(6);
    await expect(lessonNavigation).not.toContainText("OpenStax");
    await expect(lessonNavigation).not.toContainText("مثال محلول");

    const booklet = page.locator(".g12-learning-print-lesson");
    await expect(booklet).toContainText("Yemen Study");
    await expect(booklet).toContainText("منصة يمن ستدي التعليمية");
    await expect(booklet).toContainText("الدروس المشروحة في هذه الوحدة");
    await expect(booklet.locator(".g12-print-lesson-entry")).toHaveCount(6);
    await expect(booklet).toContainText("مثال محلول من الوحدة");
    await expect(booklet).toContainText("مصطلحات وقواعد مساندة");
    await expect(page.getByRole("button", { name: "طباعة الوحدة كاملة" })).toBeVisible();

    await page.evaluate(() => { window.print = () => {}; });
    await page.getByRole("button", { name: "طباعة الوحدة كاملة" }).click();
    await expect(page.locator("body")).toHaveAttribute("data-g12-learning-print", "lesson");
  });

  test("each selected lesson offers an answerable comprehension check with feedback", async ({ page }) => {
    await page.goto("./#/grade-12-learning?subject=physics-solar");
    const quickCheck = page.locator(".g12-learning-lesson-practice");
    await expect(quickCheck).toBeVisible();
    const firstOption = quickCheck.locator(".g12-learning-options button").first();
    await firstOption.click();
    const checkButton = quickCheck.getByRole("button", { name: "تحقق من الإجابة" });
    await expect(checkButton).toBeEnabled();
    await checkButton.click();
    await expect(quickCheck.locator(".g12-learning-explanation")).toBeVisible();
    await expect(quickCheck.getByRole("button", { name: "أعد المحاولة" })).toBeVisible();
  });

  test("the learning hub catalogue reflects the expanded 71-module curriculum", async ({ page }) => {
    await page.goto("./#/grade-12-learning?subject=physics-nuclear");
    await expect(page.locator(".g12-learning-header-meta")).toContainText("71 محوراً");
    await expect(page.locator(".g12-learning-nav-count")).toContainText("71");
  });

  test("grade 12 learning hub avoids horizontal overflow on desktop, tablet and mobile", async ({ page }) => {
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("./#/grade-12-learning?subject=chemistry");
      await expect(page.getByRole("heading", { level: 2, name: "الكيمياء: العناصر الانتقالية" })).toBeVisible();
      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(
        dimensions.scrollWidth,
        "Learning hub horizontal overflow at " + width + "px"
      ).toBeLessThanOrEqual(dimensions.clientWidth + 1);
    }
  });

  test("subject overview includes a course photo and learning sequence", async ({ page }) => {
    await page.goto("./#/subject/grade-12/scientific/physics");
    await expect(page.locator(".sme-course-overview")).toBeVisible();
    await expect(page.locator(".sme-course-stat")).toHaveCount(3);
    await expect(page.locator(".sme-course-overview-copy h2")).toContainText("مركز شرح ومراجعة");
  });

  test("revision hero remains usable when reduced motion is requested", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./");
    await expect(page.locator(".ys-hero-copy h1")).toBeVisible();
    await expect(page.locator(".sme-hero-search input")).toBeVisible();
    await expect(page.getByRole("link", { name: /تصفّح المنهج/ })).toBeVisible();
  });
});
