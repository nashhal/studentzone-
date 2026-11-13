export type BookSource = {
  id: string;
  title: string;
  publisher: string;
  description: string;
  url: string;
  kind: "official-library" | "regional-catalogue" | "third-party" | "direct-pdf" | "legacy-reference";
  grade?: number;
  subject?: string;
  edition?: string;
  rightsNote: string;
};

export const ministryBookPortal: BookSource = {
  id: "ministry-general",
  title: "المكتبة الرسمية للمناهج اليمنية",
  publisher: "الإدارة العامة للتعليم الإلكتروني — وزارة التربية والتعليم والبحث العلمي",
  description: "بوابة الوزارة التي تعلن إتاحة الكتب الدراسية PDF للصف الأول الأساسي حتى الثالث الثانوي للتصفح والتنزيل.",
  url: "https://e-learning-moe.edu.ye/book.php",
  kind: "official-library",
  rightsNote: "افتح ملف الكتاب من المصدر الأصلي. لا نعيد استضافة الملفات في مستودع Yemen Study.",
};

export const hadramoutCatalogue: BookSource = {
  id: "hadramout-catalogue",
  title: "فهرس المقررات الدراسية",
  publisher: "مكتب وزارة التربية والتعليم بمحافظة حضرموت",
  description: "قائمة ملفات المقررات للصفوف 1–12، مع ملفات منفصلة لبعض المواد والأنشطة والتمارين.",
  url: "https://meoh.gov.ye/services/subjects/",
  kind: "regional-catalogue",
  rightsNote: "فهرس إقليمي؛ تحقق من انطباق الطبعة على مدرستك ومحافظتك قبل الدراسة.",
};

export const thirdSecondaryCatalogue: BookSource = {
  id: "enajah-grade12",
  title: "مكتبة كتب الصف الثالث الثانوي",
  publisher: "منصة نجاح التعليمية",
  description: "صفحة غير حكومية تفهرس كتب الصف الثالث الثانوي بقسميه العلمي والأدبي، وتذكر إمكان تحميل الكتب والتمارين.",
  url: "https://e-najah.net/CuLrTHS/",
  kind: "third-party",
  grade: 12,
  rightsNote: "مصدر مساعد غير حكومي. راجع سنة الطبعة وهوية الكتاب وحقوق التنزيل قبل اعتماد الملف.",
};

export const directPdfLinks: BookSource[] = [
  {
    id: "grade6-arabic-part2",
    title: "لغتي العربية — الجزء الثاني — الصف السادس",
    publisher: "الإدارة العامة للمناهج / وزارة التربية والتعليم",
    description: "رابط PDF مباشر منشور على نطاق الإدارة العامة للتعليم الإلكتروني.",
    url: "https://e-learning-moe.edu.ye/adel/android_1/book_6/arabic_part2_6th.pdf",
    kind: "direct-pdf",
    grade: 6,
    subject: "اللغة العربية",
    edition: "1447هـ / 2026م",
    rightsNote: "حقوق الطبع محفوظة للوزارة بحسب بيانات الملف. رابط خارجي للقراءة والتنزيل من المصدر، وليس إذناً بإعادة الرفع.",
  },
  {
    id: "grade6-national-education",
    title: "التربية الوطنية — الصف السادس الأساسي",
    publisher: "الإدارة العامة للمناهج / وزارة التربية والتعليم",
    description: "ملف PDF مباشر مفهرس على نطاق الإدارة العامة للتعليم الإلكتروني.",
    url: "https://e-learning-moe.edu.ye/adel/android_1/book_6/national_education_6th.pdf",
    kind: "direct-pdf",
    grade: 6,
    subject: "التربية الوطنية",
    rightsNote: "رابط خارجي إلى ملف المصدر. تحقق من سنة الإصدار الظاهرة داخل الكتاب.",
  },
];

export const legacyReferences: BookSource[] = [
  {
    id: "legacy-g12-physics",
    title: "كتاب الفيزياء — الثالث الثانوي",
    publisher: "يمنبيديا — المناهج اليمنية التفاعلية",
    description: "فهرس تفاعلي يصف نسخة 1435هـ / 2014م: 218 صفحة، 9 وحدات، 65 درساً.",
    url: "https://yemenpedia.com/y/g12-phy-1/",
    kind: "legacy-reference",
    grade: 12,
    subject: "الفيزياء — علمي",
    edition: "1435هـ / 2014م",
    rightsNote: "مرجع تاريخي فقط. لا يُعتمد للعام الدراسي الحالي قبل مقارنة فهرسه بكتاب الوزارة الحالي.",
  },
  {
    id: "legacy-g12-chemistry",
    title: "كتاب الكيمياء — الثالث الثانوي",
    publisher: "يمنبيديا — المناهج اليمنية التفاعلية",
    description: "فهرس تفاعلي يصف نسخة 1435هـ / 2014م: 186 صفحة، 9 وحدات، 58 درساً.",
    url: "https://yemenpedia.com/y/g12-chem-1/",
    kind: "legacy-reference",
    grade: 12,
    subject: "الكيمياء — علمي",
    edition: "1435هـ / 2014م",
    rightsNote: "مرجع تاريخي فقط. لا يُعتمد للعام الدراسي الحالي قبل مقارنة فهرسه بكتاب الوزارة الحالي.",
  },
];

export const lessonSummaryFormat = [
  { number: "01", title: "أهداف الدرس", description: "ما الذي ينبغي أن تفهمه بعد إنهاء الدرس؟" },
  { number: "02", title: "شرح مركز", description: "تقسيم الفكرة إلى نقاط قصيرة بلغة أصلية واضحة." },
  { number: "03", title: "مصطلحات وقوانين", description: "تعريفات، وحدات، رموز، قواعد أو معادلات أساسية." },
  { number: "04", title: "مثال محلول", description: "خطوات الحل مع توضيح سبب كل خطوة." },
  { number: "05", title: "ملخص سريع", description: "صفحة مراجعة مركزة وأخطاء شائعة يجب تجنبها." },
  { number: "06", title: "تدريب موضوعي", description: "أسئلة متدرجة مع تفسير الإجابة بعد التسليم." },
];

export const bookLibraryNotes = [
  "المكتبة الرسمية للوزارة هي نقطة البداية للبحث عن الكتب لكل الصفوف.",
  "فهرس حضرموت مفيد للتحقق من أسماء الملفات والأنشطة، لكنه إقليمي وقد تختلف الطبعات.",
  "الروابط المباشرة للصف السادس أُدرجت لأنها ظهرت كملفات PDF منشورة على نطاق الإدارة العامة للتعليم الإلكتروني.",
  "كتب الثالث الثانوي في بعض المصادر غير الحكومية تتضمن طبعات أقدم؛ لا تُستخدم لبناء ملخص مقرر حالي قبل مطابقتها مع كتاب الوزارة.",
  "لن نرفع نسخ PDF محمية إلى مستودع الموقع. نربط بالمصدر الأصلي، وننشئ ملاحظات تعليمية أصلية بعد التحقق من الطبعة.",
];
