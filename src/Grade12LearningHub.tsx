import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Calculator, CheckCircle2, Clock3, Download, FileText, FlaskConical, RotateCcw, Search, ShieldCheck, Trophy } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import "./grade12-learning.css";

type Tier = "good" | "hard" | "hardest";
type Question = { id: string; prompt: string; options: string[]; answer: number; explanation: string };
type Section = { title: string; body: string; bullets?: string[]; formula?: string };
type LearningModule = {
  slug: string;
  name: string;
  track: string;
  title: string;
  introduction: string;
  outcomes: string[];
  sections: Section[];
  example: { title: string; prompt: string; steps: string[]; result: string };
  summary: string[];
  questions: Record<Tier, Question[]>;
  source: { title: string; url: string };
};

const tierDetails: Record<Tier, { label: string; subtitle: string; minutes: number }> = {
  good: { label: "جيد", subtitle: "استيعاب الفكرة والتطبيق المباشر", minutes: 10 },
  hard: { label: "صعب", subtitle: "تطبيق أكثر من قاعدة وربط المفاهيم", minutes: 15 },
  hardest: { label: "الأصعب", subtitle: "تحليل مسائل واستنتاجات مركّبة", minutes: 20 },
};

const modules: LearningModule[] = [
  {
    slug: "chemistry",
    name: "الكيمياء",
    track: "القسم العلمي",
    title: "الجدول الدوري وتصنيف العناصر",
    introduction: "ينظم الجدول الدوري العناصر بطريقة تكشف تكرار خواصها الكيميائية. فهم موقع العنصر يساعد على توقع بعض صفاته وسلوكه، بدلاً من حفظ أسماء العناصر منفصلة.",
    outcomes: [
      "تفسير ترتيب العناصر اعتماداً على العدد الذري",
      "التمييز بين الدورة والمجموعة",
      "التعرّف إلى الفلزات واللافلزات وأشباه الفلزات",
      "استخدام موقع العنصر لاستنتاج عائلة العنصر وبعض خواصه العامة",
    ],
    sections: [
      {
        title: "1. مبدأ ترتيب العناصر",
        body: "ترتّب العناصر في الجدول الدوري الحديث تصاعدياً بحسب العدد الذري، أي عدد البروتونات في نواة الذرة. وعندما ننتقل من عنصر إلى العنصر الذي يليه يزداد العدد الذري بمقدار واحد. يتكرر نمط من الخواص على امتداد الجدول، ولذلك سُمّي دورياً.",
        bullets: ["العدد الذري يحدد هوية العنصر.", "الكتلة الذرية ليست معيار ترتيب العناصر في الجدول الحديث.", "تكرار الخواص يرتبط بتكرار أنماط التوزيع الإلكتروني."],
      },
      {
        title: "2. الدورات والمجموعات",
        body: "الدورة صف أفقي، والمجموعة عمود رأسي. العناصر الموجودة في المجموعة الواحدة تتشابه غالباً في خواصها الكيميائية؛ لأن لها أنماطاً متقاربة في إلكترونات التكافؤ، وهي الإلكترونات التي تشارك عادة في الروابط والتفاعلات.",
        bullets: ["عدد الدورات في الجدول الحديث سبع.", "تُرقّم المجموعات من 1 إلى 18.", "عناصر المجموعة الواحدة ليست متطابقة، لكنها تُظهر أوجه تشابه دورية."],
      },
      {
        title: "3. التصنيف العام للعناصر",
        body: "تقع معظم الفلزات في يسار الجدول ووسطه، بينما تتركز اللافلزات في الجانب الأيمن. وتقع أشباه الفلزات قرب الخط المتعرج الفاصل بين المنطقتين، وتمتلك خواصاً وسطية في بعض السلوكيات.",
        bullets: ["الفلزات غالباً جيدة التوصيل وقابلة للطرق والسحب.", "اللافلزات غالباً أقل توصيلاً، وتتنوع حالاتها الفيزيائية.", "أشباه الفلزات، مثل السيليكون، مهمة في تطبيقات أشباه الموصلات."],
      },
      {
        title: "4. عائلات مهمة",
        body: "تُعرف بعض المجموعات بأسماء عائلية تساعد على تذكر خواصها العامة. المجموعة 1 هي الفلزات القلوية، والمجموعة 2 الفلزات القلوية الأرضية، والمجموعة 17 الهالوجينات، والمجموعة 18 الغازات النبيلة.",
        bullets: ["المجموعة 1 شديدة التفاعل عموماً، ولا تُوجد عناصرها الحرة عادة في الطبيعة.", "الهالوجينات تميل إلى اكتساب إلكترون في كثير من تفاعلاتها.", "الغازات النبيلة تتميز بانخفاض نشاطها الكيميائي النسبي."],
      },
      {
        title: "5. قراءة موقع عنصر",
        body: "يمكن الاستفادة من العدد الذري والتوزيع الإلكتروني المبسط لتحديد الدورة والمجموعة لعناصر المجموعات الرئيسة. فعدد مستويات الطاقة المشغولة يحدد الدورة، وعدد إلكترونات المستوى الخارجي يساعد في تحديد المجموعة الرئيسة.",
        bullets: ["الصوديوم عدده الذري 11 وتوزيعه على المستويات 2، 8، 1؛ لذلك يقع في الدورة الثالثة والمجموعة الأولى.", "الكلور عدده الذري 17 وتوزيعه 2، 8، 7؛ لذلك يقع في الدورة الثالثة والمجموعة 17."],
      },
    ],
    example: {
      title: "مثال محلول: تحديد موقع الصوديوم",
      prompt: "ذرة الصوديوم عددها الذري 11. حدّد عدد الإلكترونات في الذرة المتعادلة، ثم الدورة والمجموعة وفق التوزيع المبسط.",
      steps: [
        "في الذرة المتعادلة يساوي عدد الإلكترونات عدد البروتونات؛ إذن عدد الإلكترونات 11.",
        "نوزّع الإلكترونات على المستويات: 2، ثم 8، ثم 1.",
        "ثلاثة مستويات مشغولة تعني أن العنصر في الدورة الثالثة.",
        "إلكترون واحد في المستوى الخارجي يضعه ضمن المجموعة الأولى للعناصر الرئيسة.",
      ],
      result: "الصوديوم: الدورة الثالثة، المجموعة الأولى، وهو من الفلزات القلوية.",
    },
    summary: [
      "العدد الذري هو معيار ترتيب العناصر تصاعدياً في الجدول الدوري الحديث.",
      "الدورة صف أفقي، والمجموعة عمود رأسي.",
      "تتشابه عناصر المجموعة غالباً بسبب تقارب إلكترونات التكافؤ.",
      "توجد الفلزات غالباً يسار الجدول ووسطه، واللافلزات إلى اليمين، وأشباه الفلزات قرب الخط المتعرج.",
      "المجموعات 1 و2 و17 و18 تُعرف بالفلزات القلوية والقلوية الأرضية والهالوجينات والغازات النبيلة.",
      "عدد مستويات الطاقة المشغولة يساعد على تحديد رقم الدورة في التوزيع المبسط.",
    ],
    questions: {
      good: [
        { id: "chem-g1", prompt: "ما الخاصية التي يعتمد عليها ترتيب العناصر في الجدول الدوري الحديث؟", options: ["الكتلة الذرية فقط", "العدد الذري", "الكثافة", "درجة الانصهار"], answer: 1, explanation: "يرتّب الجدول الدوري الحديث العناصر تصاعدياً حسب العدد الذري، أي عدد البروتونات." },
        { id: "chem-g2", prompt: "ماذا نسمّي الصف الأفقي في الجدول الدوري؟", options: ["مجموعة", "عائلة", "دورة", "سلسلة تكافؤ"], answer: 2, explanation: "الصف الأفقي يسمى دورة، أما العمود الرأسي فيسمى مجموعة." },
        { id: "chem-g3", prompt: "أي مجموعة تمثل الغازات النبيلة؟", options: ["1", "2", "17", "18"], answer: 3, explanation: "تقع الغازات النبيلة في المجموعة 18 في أقصى يمين الجدول الدوري." },
      ],
      hard: [
        { id: "chem-h1", prompt: "لماذا تتشابه عناصر المجموعة الواحدة في كثير من خواصها الكيميائية؟", options: ["لأن كتلها الذرية متساوية", "لتقارب نمط إلكترونات التكافؤ", "لأنها في الدورة نفسها", "لأن عدد نيوتروناتها متساوٍ"], answer: 1, explanation: "التشابه في إلكترونات المستوى الخارجي يفسّر كثيراً من أوجه التشابه في التفاعلات والروابط." },
        { id: "chem-h2", prompt: "أي وصف أدق للسيليكون؟", options: ["فلز قلوي", "غاز نبيل", "شبه فلز", "هالوجين"], answer: 2, explanation: "السيليكون من أشباه الفلزات، ويقع قرب الخط المتعرج الفاصل بين الفلزات واللافلزات." },
        { id: "chem-h3", prompt: "إذا كان التوزيع الإلكتروني المبسط لعنصر هو 2، 8، 1، ففي أي دورة ومجموعة رئيسة يقع؟", options: ["الدورة 2 والمجموعة 1", "الدورة 3 والمجموعة 1", "الدورة 3 والمجموعة 8", "الدورة 1 والمجموعة 3"], answer: 1, explanation: "ثلاثة مستويات مشغولة تعني الدورة الثالثة، وإلكترون تكافؤ واحد يعني المجموعة الأولى للعناصر الرئيسة." },
      ],
      hardest: [
        { id: "chem-x1", prompt: "ما الاتجاه العام لنصف القطر الذري عند الانتقال عبر دورة واحدة من اليسار إلى اليمين؟", options: ["يزداد عموماً", "يقل عموماً", "يبقى ثابتاً تماماً", "يتضاعف عند كل عنصر"], answer: 1, explanation: "يقل نصف القطر الذري عموماً عبر الدورة بسبب ازدياد الشحنة النووية الفعالة مع إضافة الإلكترونات إلى المستوى الرئيس نفسه تقريباً." },
        { id: "chem-x2", prompt: "عنصر في المجموعة 17 من العناصر الرئيسة يمتلك عادة كم إلكترون تكافؤ؟", options: ["1", "2", "7", "8"], answer: 2, explanation: "عناصر المجموعة 17 تمتلك عادة سبعة إلكترونات تكافؤ، ولذلك تميل في كثير من التفاعلات إلى اكتساب إلكترون." },
        { id: "chem-x3", prompt: "توزيع عنصر متعادل هو 2، 8، 2. أي استنتاج صحيح في النموذج المبسط للعناصر الرئيسة؟", options: ["الدورة الثانية والمجموعة 2", "الدورة الثالثة والمجموعة 2", "الدورة الثالثة والمجموعة 18", "الدورة الثانية والمجموعة 12"], answer: 1, explanation: "ثلاثة مستويات مشغولة تعني الدورة الثالثة، وإلكترونا تكافؤ يعني المجموعة الثانية للعناصر الرئيسة." },
      ],
    },
    source: { title: "OpenStax Chemistry 2e — The Periodic Table", url: "https://openstax.org/books/chemistry-2e/pages/2-5-the-periodic-table" },
  },
  {
    slug: "biology",
    name: "الأحياء",
    track: "القسم العلمي",
    title: "انتقال المواد عبر الغشاء البلازمي",
    introduction: "تحافظ الخلية على بيئة داخلية مناسبة بفضل الغشاء البلازمي ذي النفاذية الاختيارية. يمر بعض المواد تلقائياً وفق تدرج التركيز، بينما يحتاج انتقال مواد أخرى إلى بروتينات ناقلة أو طاقة.",
    outcomes: [
      "وصف وظيفة الغشاء البلازمي ونفاذيته الاختيارية",
      "التمييز بين الانتشار والانتشار الميسّر والنقل النشط",
      "شرح الخاصية الأسموزية",
      "استنتاج أثر المحاليل المختلفة في حجم الخلية",
    ],
    sections: [
      {
        title: "1. الغشاء البلازمي",
        body: "يحيط الغشاء البلازمي بالخلية وينظم دخول المواد وخروجها. يتكون أساساً من طبقتين من الدهون الفسفورية تتخللهما بروتينات. تسمح طبيعة الغشاء بمرور بعض الجزيئات بسهولة أكبر من غيرها؛ لذلك يوصف بأنه ذو نفاذية اختيارية.",
        bullets: ["الرؤوس المحبة للماء تتجه نحو الوسط المائي داخل الخلية وخارجها.", "الذيول الكارهة للماء تتجه نحو داخل الطبقة الدهنية.", "تعمل بعض البروتينات قنوات أو نواقل لمواد محددة."],
      },
      {
        title: "2. الانتشار البسيط",
        body: "الانتشار حركة صافية للجزيئات من منطقة ذات تركيز أعلى إلى منطقة ذات تركيز أقل نتيجة الحركة العشوائية المستمرة. لا تستهلك الخلية ATP لإنجاز الانتشار، ويستمر تحرك الجزيئات في الاتجاهين حتى الوصول إلى اتزان ديناميكي، حيث تتساوى معدلات الحركة في الاتجاهين تقريباً.",
        bullets: ["يزداد معدل الانتشار غالباً بزيادة فرق التركيز ودرجة الحرارة.", "تنتشر جزيئات صغيرة غير مشحونة مثل الأكسجين وثاني أكسيد الكربون عبر الطبقة الدهنية بسهولة نسبية.", "الاتزان لا يعني توقف حركة الجزيئات، بل عدم وجود حركة صافية."],
      },
      {
        title: "3. الانتشار الميسّر",
        body: "بعض الجزيئات القطبية أو الأيونات لا تعبر الجزء الدهني للغشاء بسهولة. يساعدها الانتشار الميسّر على العبور من خلال بروتينات قنوات أو بروتينات حاملة. يظل الانتقال مع تدرج التركيز، ولذلك لا يحتاج إلى ATP.",
        bullets: ["القنوات توفر ممراً مناسباً لمواد محددة.", "البروتينات الحاملة ترتبط بالمادة ثم تغير شكلها لتساعدها على العبور.", "الانتشار الميسّر لا يساوي النقل النشط؛ فلا يضخ المادة عكس التدرج باستهلاك الطاقة."],
      },
      {
        title: "4. الخاصية الأسموزية",
        body: "الأسموزية هي انتقال الماء عبر غشاء شبه منفذ من جهة ذات تركيز أعلى للماء (تركيز مذاب أقل) إلى جهة ذات تركيز أقل للماء (تركيز مذاب أعلى)، حتى يقترب النظام من الاتزان. الذي يتحرك في الأسموزية هو الماء، وليس المذاب غير القادر على عبور الغشاء.",
      },
      {
        title: "5. المحاليل وتأثيرها في الخلية",
        body: "تقارن التوترية بين تركيز المذاب خارج الخلية وداخلها. في المحلول ناقص التوتر يكون تركيز المذاب خارج الخلية أقل، فيدخل الماء إلى الخلية. وفي المحلول مفرط التوتر يخرج الماء منها. أما المحلول متساوي التوتر فلا يحدث فيه انتقال صافٍ للماء.",
        bullets: ["ناقص التوتر: يدخل الماء إلى الخلية وقد تنتفخ.", "مفرط التوتر: يخرج الماء من الخلية وقد تنكمش.", "متساوي التوتر: لا توجد حركة صافية للماء، مع استمرار الحركة في الاتجاهين."],
      },
      {
        title: "6. النقل النشط",
        body: "قد تحتاج الخلية إلى نقل مادة عكس تدرج تركيزها، أي من تركيز أقل إلى تركيز أعلى. يتطلب ذلك طاقة غالباً من ATP، وتؤديه بروتينات نقل متخصصة. من أمثلته مضخة الصوديوم والبوتاسيوم في أغشية كثير من الخلايا الحيوانية.",
      },
    ],
    example: {
      title: "مثال محلول: خلية في محلول مفرط التوتر",
      prompt: "وضعت خلية حيوانية في محلول تركيز المذاب فيه أعلى من تركيزه داخل الخلية. حدّد اتجاه حركة الماء والنتيجة المتوقعة.",
      steps: [
        "المحلول الخارجي مفرط التوتر بالنسبة إلى سيتوبلازم الخلية.",
        "تركيز الماء الحر خارج الخلية أقل نسبياً من تركيزه داخلها.",
        "ينتقل الماء صافياً إلى الخارج عبر الغشاء شبه المنفذ.",
        "تفقد الخلية جزءاً من الماء وينخفض حجمها.",
      ],
      result: "يخرج الماء من الخلية، ولذلك تنكمش الخلية الحيوانية.",
    },
    summary: [
      "الغشاء البلازمي ينظم مرور المواد ويتميز بالنفاذية الاختيارية.",
      "الانتشار انتقال صافٍ من التركيز الأعلى إلى الأقل ولا يحتاج إلى ATP.",
      "الانتشار الميسّر يستخدم بروتينات غشائية، لكنه يظل مع تدرج التركيز ولا يحتاج إلى ATP.",
      "الأسموزية انتقال الماء عبر غشاء شبه منفذ نحو الجهة الأعلى في تركيز المذاب.",
      "في المحلول ناقص التوتر يدخل الماء، وفي مفرط التوتر يخرج، وفي متساوي التوتر لا توجد حركة صافية.",
      "النقل النشط يحتاج طاقة لنقل مواد عكس تدرج التركيز.",
    ],
    questions: {
      good: [
        { id: "bio-g1", prompt: "ما الاتجاه المعتاد للانتشار الصافي؟", options: ["من تركيز أقل إلى أعلى", "من تركيز أعلى إلى أقل", "لا يتحرك إلا باستخدام ATP", "يتحرك الماء فقط"], answer: 1, explanation: "الانتشار الصافي يكون مع تدرج التركيز: من التركيز الأعلى إلى التركيز الأقل." },
        { id: "bio-g2", prompt: "أي مادة تتحرك في الخاصية الأسموزية؟", options: ["الماء", "البروتين", "كل المذابات معاً", "الأيونات فقط"], answer: 0, explanation: "الأسموزية هي الانتقال الصافي لجزيئات الماء عبر غشاء شبه منفذ." },
        { id: "bio-g3", prompt: "ماذا يحدث لحركة الماء الصافية في محلول متساوي التوتر؟", options: ["يدخل الماء فقط", "يخرج الماء فقط", "لا توجد حركة صافية", "يتوقف كل تحرك للجزيئات"], answer: 2, explanation: "يتحرك الماء في الاتجاهين، لكن لا يكون هناك انتقال صافٍ لأن الظروف متساوية تقريباً." },
      ],
      hard: [
        { id: "bio-h1", prompt: "ما العبارة الصحيحة عن الانتشار الميسّر؟", options: ["يحتاج دائماً إلى ATP", "يستخدم بروتينات ويسير مع تدرج التركيز", "ينقل المواد دائماً عكس التدرج", "لا يحدث عبر الغشاء"], answer: 1, explanation: "تسهل البروتينات عبور مواد لا تمر بسهولة عبر الطبقة الدهنية، ويظل الانتقال مع تدرج التركيز دون استهلاك ATP." },
        { id: "bio-h2", prompt: "وضعت خلية في محلول مفرط التوتر. ما المتوقع؟", options: ["يدخل الماء وتنتفخ", "يخرج الماء وتنكمش", "لا يحدث انتقال للماء", "تتوقف حركة الجزيئات"], answer: 1, explanation: "تركيز المذاب خارج الخلية أعلى، ولذلك ينتقل الماء صافياً إلى الخارج وتنكمش الخلية." },
        { id: "bio-h3", prompt: "أي حالة تتطلب طاقة لنقل المادة عكس تدرج التركيز؟", options: ["الانتشار البسيط", "الأسموزية", "النقل النشط", "الانتشار الميسّر"], answer: 2, explanation: "النقل النشط ينقل المواد عكس تدرجها ويحتاج إلى مصدر طاقة مثل ATP." },
      ],
      hardest: [
        { id: "bio-x1", prompt: "عند الوصول إلى الاتزان الديناميكي في الانتشار، أي وصف أدق؟", options: ["تتوقف الجزيئات عن الحركة", "تستمر الحركة العشوائية دون انتقال صافٍ", "تصبح كل الجزيئات في موضع واحد", "يصبح تركيز كل المواد في الخلية متساوياً"], answer: 1, explanation: "تبقى الجزيئات في حركة عشوائية، لكن معدلات انتقالها في الاتجاهين تتعادل فلا توجد حركة صافية." },
        { id: "bio-x2", prompt: "أي تغير يزيد سرعة الانتشار غالباً إذا بقيت العوامل الأخرى ثابتة؟", options: ["تقليل فرق التركيز", "خفض درجة الحرارة", "زيادة فرق التركيز", "زيادة سمك الغشاء"], answer: 2, explanation: "زيادة فرق التركيز تزيد القوة الدافعة للانتشار غالباً، بينما السمك الأكبر يقلل معدل العبور." },
        { id: "bio-x3", prompt: "خلية تركيز المذاب داخلها 0.9% ووضعت في محلول تركيز مذابه 0.3%، مع عدم عبور المذاب للغشاء. ما الاتجاه الصافي للماء؟", options: ["إلى خارج الخلية", "إلى داخل الخلية", "لا توجد حركة صافية", "يتوقف الماء عن الحركة"], answer: 1, explanation: "المحلول الخارجي أقل تركيزاً بالمذاب (ناقص التوتر)، فيكون تركيز الماء الحر فيه أعلى، فيدخل الماء إلى الخلية." },
      ],
    },
    source: { title: "OpenStax Biology 2e — Passive Transport", url: "https://openstax.org/books/biology-2e/pages/5-2-passive-transport" },
  },
  {
    slug: "mathematics",
    name: "الرياضيات",
    track: "العلمي والأدبي",
    title: "الدوال: المجال والمدى",
    introduction: "تساعد الدوال على وصف العلاقات بين المدخلات والمخرجات. قبل التعويض أو رسم المنحنى، يجب معرفة القيم المسموح بها للمتغير المستقل، والقيم التي يمكن أن تنتج فعلاً.",
    outcomes: [
      "فهم معنى الدالة والمدخل والمخرج",
      "تحديد مجال الدالة ومدى الدالة",
      "اكتشاف القيود الناتجة عن المقام والجذر الزوجي",
      "استخدام الترميز بالفترات لكتابة المجال والمدى",
    ],
    sections: [
      {
        title: "1. ما الدالة؟",
        body: "الدالة قاعدة تربط كل قيمة إدخال من مجالها بقيمة إخراج واحدة فقط. نرمز عادة إلى الدالة بالرمز f، ونكتب f(x) للدلالة على الناتج الذي يقابل الإدخال x. قد تمثل الدالة علاقة جبرية أو جدولاً أو رسماً بيانياً.",
        bullets: ["المتغير المستقل هو الإدخال، وغالباً نرمز له بـ x.", "المتغير التابع هو الناتج، وغالباً نرمز له بـ y أو f(x).", "يجب أن يرتبط كل إدخال مسموح بناتج واحد فقط حتى تكون العلاقة دالة."],
      },
      {
        title: "2. المجال والمدى",
        body: "المجال هو مجموعة كل قيم الإدخال المسموح بها. أما المدى فهو مجموعة كل قيم الإخراج التي تنتج من إدخالات المجال. يمكن قراءة المجال والمدى من صيغة الدالة أو جدول القيم أو الرسم البياني.",
      },
      {
        title: "3. قيود المقام",
        body: "لا يجوز أن يساوي المقام صفراً؛ لأن القسمة على الصفر غير معرّفة. لذلك نحدد القيم التي تصفّر المقام ثم نستبعدها من المجال.",
        formula: "إذا كان f(x) = p(x) / q(x)، فيلزم q(x) ≠ 0.",
      },
      {
        title: "4. قيود الجذر الزوجي",
        body: "في مجموعة الأعداد الحقيقية، يجب ألا يكون ما تحت الجذر التربيعي سالباً. لذلك نضع المقدار داخل الجذر أكبر من أو يساوي صفراً ثم نحل المتباينة الناتجة.",
        formula: "√g(x) يتطلب g(x) ≥ 0.",
      },
      {
        title: "5. كتابة المجال والمدى بالفترات",
        body: "تستخدم الأقواس المربعة عندما تكون النهاية داخلة في المجموعة، وتستخدم الأقواس الدائرية عندما تكون النهاية غير داخلة. أما اللانهاية واللانهاية السالبة فتستخدمان دائماً مع الأقواس الدائرية.",
        bullets: ["[2, 5] تعني أن 2 و5 داخل المجال.", "(2, 5) تستبعد الطرفين.", "(-∞, 4] تشمل كل عدد حقيقي أقل من أو يساوي 4."],
      },
    ],
    example: {
      title: "مثال محلول: مجال دالة كسرية",
      prompt: "أوجد مجال الدالة f(x) = (x + 1) / (2 − x).",
      steps: [
        "نحدد المقام: 2 − x.",
        "نمنع المقام من أن يساوي صفراً: 2 − x ≠ 0.",
        "بحل المعادلة الحدية نحصل على x ≠ 2.",
        "إذن جميع الأعداد الحقيقية مسموحة باستثناء 2.",
      ],
      result: "المجال: (−∞, 2) ∪ (2, ∞).",
    },
    summary: [
      "الدالة تربط كل إدخال مسموح بقيمة إخراج واحدة فقط.",
      "المجال مجموعة المدخلات المسموح بها، والمدى مجموعة المخرجات الناتجة فعلاً.",
      "في الدالة الكسرية نستبعد كل قيمة تجعل المقام صفراً.",
      "في الجذر الزوجي نطلب أن يكون المقدار داخل الجذر أكبر من أو يساوي صفراً.",
      "الأقواس المربعة تشمل النهاية، والدائرية تستبعدها.",
      "لا تُكتب اللانهاية داخل قوس مربع لأنها ليست قيمة يمكن بلوغها.",
    ],
    questions: {
      good: [
        { id: "math-g1", prompt: "إذا كانت f(x) = x + 3، فما قيمة f(2)؟", options: ["2", "3", "5", "6"], answer: 2, explanation: "نعوّض x = 2: f(2) = 2 + 3 = 5." },
        { id: "math-g2", prompt: "ما المقصود بمجال الدالة؟", options: ["كل قيم الإخراج الممكنة", "كل قيم الإدخال المسموح بها", "قيمة الدالة عند الصفر فقط", "نقاط تقاطع المنحنى مع المحور الرأسي"], answer: 1, explanation: "المجال هو مجموعة قيم الإدخال التي يمكن وضعها في الدالة دون مخالفة شروط تعريفها." },
        { id: "math-g3", prompt: "ما مجال الدالة f(x) = x² على مجموعة الأعداد الحقيقية؟", options: ["x ≥ 0", "x ≠ 0", "كل الأعداد الحقيقية", "x ≤ 0"], answer: 2, explanation: "يمكن تربيع أي عدد حقيقي؛ لذلك المجال هو جميع الأعداد الحقيقية." },
      ],
      hard: [
        { id: "math-h1", prompt: "ما مجال f(x) = (x + 1) / (2 − x)؟", options: ["كل الأعداد الحقيقية", "كل الأعداد عدا 2", "كل الأعداد عدا −2", "x ≥ 2"], answer: 1, explanation: "المقام يساوي صفراً عند x = 2، فيجب استبعاد هذه القيمة فقط." },
        { id: "math-h2", prompt: "ما مجال f(x) = √(x − 3) على الأعداد الحقيقية؟", options: ["x ≤ 3", "x > 3", "x ≥ 3", "كل الأعداد الحقيقية"], answer: 2, explanation: "يجب أن يكون x − 3 ≥ 0، ومنه x ≥ 3." },
        { id: "math-h3", prompt: "ما مدى الدالة f(x) = x² على الأعداد الحقيقية؟", options: ["كل الأعداد الحقيقية", "y ≤ 0", "y ≥ 0", "y > 1"], answer: 2, explanation: "مربع أي عدد حقيقي غير سالب، وتتحقق القيمة صفر عند x = 0؛ لذا المدى [0, ∞)." },
      ],
      hardest: [
        { id: "math-x1", prompt: "ما مجال f(x) = √(5 − 2x)؟", options: ["x ≥ 2.5", "x ≤ 2.5", "x ≠ 2.5", "كل الأعداد الحقيقية"], answer: 1, explanation: "نطلب 5 − 2x ≥ 0، أي −2x ≥ −5. عند القسمة على −2 تنعكس إشارة المتباينة: x ≤ 2.5." },
        { id: "math-x2", prompt: "ما القيم المستبعدة من مجال f(x) = 1 / (x² − 9)؟", options: ["x = 0 فقط", "x = 3 فقط", "x = −3 وx = 3", "لا توجد قيم مستبعدة"], answer: 2, explanation: "نحل x² − 9 = 0، فنحصل على (x − 3)(x + 3) = 0، لذلك نستبعد −3 و3." },
        { id: "math-x3", prompt: "إذا كانت f(x) = x² − 4 ومجالها محصوراً في [−2, 2]، فما مداها؟", options: ["[−4, 0]", "[0, 4]", "[−4, 4]", "(−∞, 0]"], answer: 0, explanation: "أصغر قيمة هي −4 عند x = 0، وأكبر قيمة هي 0 عند الطرفين x = −2 وx = 2؛ وكلاهما داخل المجال." },
      ],
    },
    source: { title: "OpenStax Precalculus 2e — Domain and Range", url: "https://openstax.org/books/precalculus-2e/pages/1-2-domain-and-range" },
  },
];

const pendingSubjects = [
  "اللغة الإنجليزية", "التاريخ", "الجغرافيا", "القراءة", "النحو والصرف", "النصوص والأدب",
  "القرآن الكريم", "الإيمان", "الحديث والفقه", "السيرة النبوية", "الفلسفة", "المنطق",
  "علم النفس", "علم الخرائط",
];

function saveAttempt(slug: string, tier: Tier, score: number, total: number) {
  try {
    const key = "yemen-study-grade12-learning-attempts";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const rows = Array.isArray(existing) ? existing.slice(-49) : [];
    rows.push({ subject: slug, tier, score, total, date: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(rows));
  } catch {
    // Scoring works even when local browser storage is disabled.
  }
}

export default function Grade12LearningHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSlug = searchParams.get("subject") || "chemistry";
  const current = modules.find((module) => module.slug === requestedSlug) || modules[0];
  const [tier, setTier] = useState<Tier>("good");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [printAnswers, setPrintAnswers] = useState(false);
  const questions = useMemo(() => current.questions[tier], [current, tier]);
  const answered = questions.filter((question) => answers[question.id] !== undefined).length;
  const score = questions.filter((question) => answers[question.id] === question.answer).length;

  const chooseModule = (slug: string) => {
    setSearchParams({ subject: slug });
    setTier("good");
    setAnswers({});
    setRevealed([]);
    setSubmitted(false);
  };
  const chooseTier = (next: Tier) => {
    setTier(next);
    setAnswers({});
    setRevealed([]);
    setSubmitted(false);
  };
  const resetQuiz = () => {
    setAnswers({});
    setRevealed([]);
    setSubmitted(false);
  };
  const checkOne = (id: string) => setRevealed((old) => old.includes(id) ? old : [...old, id]);
  const submitQuiz = () => {
    if (submitted || answered !== questions.length) return;
    saveAttempt(current.slug, tier, score, questions.length);
    setSubmitted(true);
  };
  const printDocument = (kind: "summary" | "exam") => {
    document.body.dataset.g12LearningPrint = kind;
    const clean = () => {
      delete document.body.dataset.g12LearningPrint;
      window.removeEventListener("afterprint", clean);
    };
    window.addEventListener("afterprint", clean);
    window.print();
    // Some mobile browsers do not dispatch afterprint. The dataset only affects print media.
  };

  const lessonCards = [
    { slug: "physics", name: "الفيزياء", detail: "الكميات القياسية والمتجهة", status: "متاح", href: "/grade-12-study" },
    ...modules.map((module) => ({ slug: module.slug, name: module.name, detail: module.title, status: "متاح", href: "/grade-12-learning?subject=" + module.slug })),
  ];

  return <main className="container page g12-learning-page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><span>›</span><Link to="/grade/grade-12">الصف الثالث الثانوي</Link><span>›</span><b>الشرح والملخصات والاختبارات</b></div>
    <header className="g12-learning-header">
      <div><span className="eyebrow">مركز دراسة الصف الثالث الثانوي</span><h1>افهم الدرس، لخّصه، ثم اختبر نفسك.</h1><p>شروحات أصلية مكتوبة داخل المنصة، أمثلة محلولة، نقاط مراجعة وأسئلة متدرجة. اختر المادة من القائمة.</p></div>
      <div className="g12-learning-header-meta"><BookOpen size={20}/><span>الشرح والاختبار يعملان داخل الموقع</span></div>
    </header>

    <section className="g12-learning-notice"><ShieldCheck size={18}/><p>هذه حزمة تعليمية مساندة تم التحقق من مفاهيمها بمراجع أكاديمية. لم تُطابق بعد ترتيب الوحدات مع كتاب وزارة التربية لطبعة صنعاء أو عدن 1448هـ؛ لذلك لا نضع أرقام فصول وزارية غير مؤكدة.</p></section>

    <div className="g12-learning-layout">
      <aside className="g12-learning-nav">
        <h2>المواد ذات المحتوى المنشور</h2>
        {lessonCards.map((card) => <Link key={card.slug} to={card.href} className={card.slug === current.slug || (card.slug === "physics" && false) ? "g12-learning-nav-card active" : "g12-learning-nav-card"} onClick={(event) => { if (modules.some((module) => module.slug === card.slug)) { event.preventDefault(); chooseModule(card.slug); } }}>
          <span className="g12-learning-nav-icon">{card.slug === "chemistry" ? <FlaskConical size={18}/> : card.slug === "mathematics" ? <Calculator size={18}/> : <BookOpen size={18}/>}</span>
          <span><b>{card.name}</b><small>{card.detail}</small></span>
          <span className="g12-learning-nav-status">{card.status}</span>
        </Link>)}
        <div className="g12-learning-pending"><b>مواد أخرى قيد الإعداد</b><p>سيتم إدخال الدروس بعد مطابقة فهارس الكتب وصفحاتها مع النسخة المعتمدة.</p><div>{pendingSubjects.map((subject) => <span key={subject}>{subject}</span>)}</div></div>
      </aside>

      <div className="g12-learning-main">
        <section className="g12-learning-panel">
          <div className="g12-learning-course-head">
            <div><span className="eyebrow">{current.track} · الصف الثالث الثانوي</span><h2>{current.name}: {current.title}</h2><p>{current.introduction}</p></div>
            <span className="g12-learning-badge">شرح وملخص واختبار</span>
          </div>
          <div className="g12-learning-outcomes"><b>أهداف التعلم</b><ul>{current.outcomes.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div className="g12-learning-section-list">
            {current.sections.map((section, index) => <article key={section.title} className="g12-learning-section">
              <h3>{section.title}</h3><p>{section.body}</p>
              {section.formula && <div className="g12-learning-formula" dir="ltr">{section.formula}</div>}
              {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
            </article>)}
          </div>
          <div className="g12-learning-example">
            <span>تطبيق محلول</span><h3>{current.example.title}</h3><p>{current.example.prompt}</p>
            <ol>{current.example.steps.map((step) => <li key={step}>{step}</li>)}</ol>
            <b>{current.example.result}</b>
          </div>
          <div className="g12-learning-summary">
            <div className="g12-learning-summary-head"><div><span className="eyebrow">ورقة المراجعة</span><h3>ملخص الدرس</h3></div><button className="btn btn-outline g12-no-print" type="button" onClick={() => printDocument("summary")}><Download size={16}/> حفظ الملخص PDF</button></div>
            <ol>{current.summary.map((item) => <li key={item}>{item}</li>)}</ol>
          </div>
          <footer className="g12-learning-source"><ShieldCheck size={17}/><div><b>مرجع التحقق العلمي</b><a href={current.source.url} target="_blank" rel="noreferrer">{current.source.title}</a><small>النصوص والأمثلة والأسئلة هنا كُتبت بصياغة أصلية؛ المرجع للتحقق من المفاهيم وليس مصدراً لنسخ محتوى محمي.</small></div></footer>
        </section>

        <section className="g12-learning-panel g12-learning-quiz">
          <div className="g12-learning-panel-title"><span><FileText size={20}/></span><div><h2>اختبر فهمك</h2><p>ثلاث درجات من الصعوبة، مع التصحيح وتفسير الإجابات.</p></div></div>
          <div className="g12-learning-tier-switch">
            {(["good", "hard", "hardest"] as Tier[]).map((value) => <button key={value} type="button" onClick={() => chooseTier(value)} className={tier === value ? "active" : ""}><b>{tierDetails[value].label}</b><small>{tierDetails[value].subtitle}</small></button>)}
          </div>
          <div className="g12-learning-quiz-meta"><span><FileText size={14}/>{questions.length} أسئلة</span><span><Clock3 size={14}/>{tierDetails[tier].minutes} دقيقة</span><span>الدرجة {questions.length}</span></div>
          <div className="g12-learning-questions">
            {questions.map((question, index) => <article key={question.id} className="g12-learning-question">
              <div className="g12-learning-question-num">السؤال {index + 1}</div>
              <h3>{question.prompt}</h3>
              <div className="g12-learning-options">{question.options.map((option, optionIndex) => {
                const selected = answers[question.id] === optionIndex;
                const reveal = revealed.includes(question.id) || submitted;
                const right = question.answer === optionIndex;
                return <button key={optionIndex} type="button" disabled={submitted || revealed.includes(question.id)} onClick={() => setAnswers((old) => ({ ...old, [question.id]: optionIndex }))} className={reveal && right ? "correct" : reveal && selected && !right ? "wrong" : selected ? "selected" : ""}><i>{["أ", "ب", "ج", "د"][optionIndex]}</i><span>{option}</span></button>;
              })}</div>
              {revealed.includes(question.id) || submitted ? <div className="g12-learning-explanation"><b>{answers[question.id] === question.answer ? "إجابة صحيحة" : "الإجابة الصحيحة موضحة أدناه"}</b><p>{question.explanation}</p></div> : <button type="button" className="g12-learning-check" disabled={answers[question.id] === undefined} onClick={() => checkOne(question.id)}>تحقق من الإجابة</button>}
            </article>)}
          </div>
          <div className="g12-learning-quiz-footer g12-no-print"><span>أجبت عن {answered} من {questions.length}</span><div><button type="button" className="btn btn-outline" onClick={resetQuiz}><RotateCcw size={15}/> إعادة</button><button type="button" className="btn btn-outline" onClick={() => { setPrintAnswers(false); printDocument("exam"); }}><Download size={15}/> ورقة اختبار PDF</button><button type="button" className="btn btn-primary" disabled={submitted || answered !== questions.length} onClick={submitQuiz}>تصحيح الاختبار <CheckCircle2 size={15}/></button></div></div>
          {submitted && <div className="g12-learning-result"><Trophy size={24}/><div><b>نتيجتك {score} من {questions.length}</b><span>{Math.round(score / questions.length * 100)}% — راجع التفسيرات قبل الانتقال للمستوى التالي.</span></div></div>}
        </section>
      </div>
    </div>

    <section className="g12-learning-print-summary">
      <header><b>Yemen Study</b><span>الصف الثالث الثانوي · {current.name}</span><h1>{current.title}</h1><p>ورقة ملخص للمراجعة</p></header>
      <h2>أهداف التعلم</h2><ul>{current.outcomes.map((item) => <li key={item}>{item}</li>)}</ul>
      {current.sections.map((section) => <section key={section.title}><h3>{section.title}</h3><p>{section.body}</p>{section.formula && <p dir="ltr">{section.formula}</p>}{section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}</section>)}
      <section><h2>مثال محلول</h2><h3>{current.example.title}</h3><p>{current.example.prompt}</p><ol>{current.example.steps.map((step) => <li key={step}>{step}</li>)}</ol><b>{current.example.result}</b></section>
      <section><h2>خلاصة للحفظ</h2><ol>{current.summary.map((item) => <li key={item}>{item}</li>)}</ol></section>
      <footer>مرجع التحقق: {current.source.title}. هذه ورقة مساعدة أصلية وليست ملخصاً رسمياً صادراً عن الوزارة.</footer>
    </section>

    <section className="g12-learning-print-exam">
      <header><b>Yemen Study</b><span>الصف الثالث الثانوي · {current.name}</span><h1>اختبار: {current.title}</h1><p>المستوى: {tierDetails[tier].label} · الزمن المقترح: {tierDetails[tier].minutes} دقيقة</p></header>
      <div className="g12-learning-print-student"><span>اسم الطالب: ........................................</span><span>التاريخ: .... / .... / ........</span></div>
      {questions.map((question, index) => <article key={question.id}><b>{index + 1}. {question.prompt}</b><ol type="A">{question.options.map((option) => <li key={option}>{option}</li>)}</ol></article>)}
      <footer>اختبار تدريبي أصلي داخل Yemen Study، وليس امتحاناً وزارياً رسمياً.</footer>
    </section>

    <p className="g12-learning-final-note"><ShieldCheck size={15}/> المتاح حالياً: موضوع تدريبي واحد لكل من الكيمياء والأحياء والرياضيات، إضافة إلى موضوع الفيزياء الموجود في صفحة مستقلة. بقية الدروس ستضاف على دفعات بعد مطابقة الكتب الإقليمية؛ لا تُعد هذه الدفعة تغطية كاملة للمنهج.</p>
  </main>;
}
