export type BookSource = {
  id: string;
  title: string;
  publisher: string;
  description: string;
  url: string;
  kind: "official-library" | "regional-catalogue" | "third-party" | "direct-pdf" | "legacy-reference" | "telegram-attachment";
  grade?: number;
  subject?: string;
  edition?: string;
  rightsNote: string;
};

export const ministryBookPortal: BookSource = {
  id: "ministry-general",
  title: "المكتبة الرسمية للمناهج اليمنية — طبعة 1448هـ",
  publisher: "الإدارة العامة للتعليم الإلكتروني — وزارة التربية والتعليم والبحث العلمي",
  description: "المصدر الرسمي الذي أعلنت قناة الكتب الدراسية التابعة للوزارة إتاحة مناهج العام الدراسي 1448هـ / 2026–2027م من خلاله، ويضم بوابة الكتب الدراسية للصفوف والمراحل.",
  url: "https://e-learning-moe.edu.ye/book.php",
  kind: "official-library",
  edition: "1448هـ / 2026–2027م",
  rightsNote: "رابط إلى الناشر الأصلي. تُحمّل الكتب من البوابة الرسمية ولا نعيد استضافتها في مستودع Yemen Study.",
};

export const ministryBooksChannel: BookSource = {
  id: "ministry-books-channel",
  title: "قناة الكتب الدراسية اليمنية",
  publisher: "وزارة التربية والتعليم والبحث العلمي",
  description: "القناة الرسمية المعلنة لنشر روابط الكتب الدراسية وتحديثات المناهج.",
  url: "https://t.me/Books_Yemen_new",
  kind: "official-library",
  edition: "1448هـ / 2026–2027م",
  rightsNote: "استخدم المنشورات للعثور على مرفقات الكتب، وتأكد من السنة والصف قبل تنزيل أي ملف.",
};

export const ministry1448Announcement: BookSource = {
  id: "ministry-1448-announcement",
  title: "إعلان توفر مناهج 1448هـ",
  publisher: "قناة الكتب الدراسية اليمنية — وزارة التربية والتعليم والبحث العلمي",
  description: "إعلان رسمي يشير إلى توفر المناهج الدراسية للعام 1448هـ على موقع الإدارة العامة للتعليم الإلكتروني.",
  url: "https://tg.me/books_yemen_new/1326",
  kind: "official-library",
  edition: "1448هـ / 2026–2027م",
  rightsNote: "منشور إعلان يوجه إلى موقع الوزارة؛ بعض المواد قد تُضاف تدريجياً.",
};

export const hadramoutCatalogue: BookSource = {
  id: "hadramout-catalogue",
  title: "فهرس المقررات الدراسية — حضرموت",
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

export const official1448Updates: BookSource[] = [
  { id: "g11-reading-1448", title: "القراءة — الصف الثاني الثانوي", publisher: "الإدارة العامة للتوجيه التربوي — الوزارة", description: "كتاب محدث للعام الدراسي 1448هـ.", url: "https://t.me/yeducation2/8784", kind: "telegram-attachment", grade: 11, subject: "القراءة", edition: "1448هـ / 2026–2027م", rightsNote: "افتح منشور الوزارة للوصول إلى مرفق الكتاب." },
  { id: "g10-reading-1448", title: "القراءة — الصف الأول الثانوي", publisher: "الإدارة العامة للتوجيه التربوي — الوزارة", description: "كتاب محدث للعام الدراسي 1448هـ.", url: "https://t.me/yeducation2/8785", kind: "telegram-attachment", grade: 10, subject: "القراءة", edition: "1448هـ / 2026–2027م", rightsNote: "افتح منشور الوزارة للوصول إلى مرفق الكتاب." },
  { id: "g8-history-1448", title: "التاريخ — الصف الثامن الأساسي", publisher: "الإدارة العامة للتوجيه التربوي — الوزارة", description: "كتاب محدث للعام الدراسي 1448هـ.", url: "https://t.me/yeducation2/8786", kind: "telegram-attachment", grade: 8, subject: "التاريخ", edition: "1448هـ / 2026–2027م", rightsNote: "افتح منشور الوزارة للوصول إلى مرفق الكتاب." },
  { id: "g7-history-1448", title: "التاريخ — الصف السابع الأساسي", publisher: "الإدارة العامة للتوجيه التربوي — الوزارة", description: "كتاب محدث للعام الدراسي 1448هـ.", url: "https://t.me/yeducation2/8787", kind: "telegram-attachment", grade: 7, subject: "التاريخ", edition: "1448هـ / 2026–2027م", rightsNote: "افتح منشور الوزارة للوصول إلى مرفق الكتاب." },
  { id: "g1-arabic-1448", title: "لغتي العربية — الصف الأول الأساسي", publisher: "الإدارة العامة للتوجيه التربوي — الوزارة", description: "كتاب محدث للعام الدراسي 1448هـ.", url: "https://t.me/yeducation2/8788", kind: "telegram-attachment", grade: 1, subject: "اللغة العربية", edition: "1448هـ / 2026–2027م", rightsNote: "افتح منشور الوزارة للوصول إلى مرفق الكتاب." },
  { id: "g9-arabic-1448", title: "لغتي العربية — الصف التاسع الأساسي", publisher: "الإدارة العامة للتوجيه التربوي — الوزارة", description: "كتاب محدث للعام الدراسي 1448هـ.", url: "https://t.me/yeducation2/8789", kind: "telegram-attachment", grade: 9, subject: "اللغة العربية", edition: "1448هـ / 2026–2027م", rightsNote: "افتح منشور الوزارة للوصول إلى مرفق الكتاب." },
  { id: "g9-quran-1448", title: "القرآن الكريم وعلومه — الصف التاسع الأساسي", publisher: "الإدارة العامة للتوجيه التربوي — الوزارة", description: "كتاب محدث للعام الدراسي 1448هـ.", url: "https://t.me/yeducation2/8790", kind: "telegram-attachment", grade: 9, subject: "القرآن الكريم وعلومه", edition: "1448هـ / 2026–2027م", rightsNote: "افتح منشور الوزارة للوصول إلى مرفق الكتاب." },
  { id: "g7-arabic-1448", title: "لغتي العربية — الصف السابع الأساسي", publisher: "الإدارة العامة للتوجيه التربوي — الوزارة", description: "كتاب محدث للعام الدراسي 1448هـ.", url: "https://t.me/yeducation2/8791", kind: "telegram-attachment", grade: 7, subject: "اللغة العربية", edition: "1448هـ / 2026–2027م", rightsNote: "افتح منشور الوزارة للوصول إلى مرفق الكتاب." },
  { id: "g8-islamic-1448", title: "الإسلامية — الصف الثامن الأساسي", publisher: "قناة التعليمية اليمنية — روابط الوزارة ومكاتبها", description: "رابط كتاب منشور ضمن تحديثات مناهج 1448هـ.", url: "https://t.me/yemeneducation2/44140", kind: "telegram-attachment", grade: 8, subject: "التربية الإسلامية", edition: "1448هـ / 2026–2027م", rightsNote: "افتح منشور القناة التعليمية للوصول إلى المرفق." },
  { id: "g9-islamic-1448", title: "الإسلامية — الصف التاسع الأساسي، الجزء الأول", publisher: "قناة التعليمية اليمنية — روابط الوزارة ومكاتبها", description: "رابط كتاب منشور ضمن تحديثات مناهج 1448هـ.", url: "https://t.me/yemeneducation2/44141", kind: "telegram-attachment", grade: 9, subject: "التربية الإسلامية", edition: "1448هـ / 2026–2027م", rightsNote: "افتح منشور القناة التعليمية للوصول إلى المرفق." },
  { id: "g7-social-history-1448", title: "الاجتماعيات — تاريخ — الصف السابع", publisher: "قناة التعليمية اليمنية — روابط الوزارة ومكاتبها", description: "رابط كتاب منشور ضمن تحديثات مناهج 1448هـ.", url: "https://t.me/yemeneducation2/44142", kind: "telegram-attachment", grade: 7, subject: "التاريخ / الاجتماعيات", edition: "1448هـ / 2026–2027م", rightsNote: "افتح منشور القناة التعليمية للوصول إلى المرفق." },
];

export const grade12Archive1447: BookSource[] = [
  { id: "g12-biology-1447", title: "الأحياء — الثالث الثانوي العلمي", publisher: "فيديوهات القناة التعليمية الرسمية", description: "ملف PDF باسم biology_12th.pdf، حجم منشور يقارب 250.1 MB.", url: "https://t.me/YemenEducationTV2025/851", kind: "telegram-attachment", grade: 12, subject: "الأحياء — علمي", edition: "1447هـ / 2025–2026م", rightsNote: "أرشيف طبعة سابقة. افتح المنشور الأصلي على Telegram وتحقق من الغلاف قبل استخدامها." },
  { id: "g12-chemistry-1447", title: "الكيمياء — الثالث الثانوي العلمي", publisher: "فيديوهات القناة التعليمية الرسمية", description: "ملف PDF باسم chemistry_12th.pdf، حجم منشور يقارب 72 MB.", url: "https://t.me/YemenEducationTV2025/852", kind: "telegram-attachment", grade: 12, subject: "الكيمياء — علمي", edition: "1447هـ / 2025–2026م", rightsNote: "أرشيف طبعة سابقة. افتح المنشور الأصلي على Telegram وتحقق من الغلاف قبل استخدامها." },
  { id: "g12-english-1447", title: "اللغة الإنجليزية — Course — الثالث الثانوي", publisher: "فيديوهات القناة التعليمية الرسمية", description: "ملف PDF باسم english_pubils_12th.pdf، حجم منشور يقارب 13.7 MB.", url: "https://t.me/YemenEducationTV2025/853", kind: "telegram-attachment", grade: 12, subject: "اللغة الإنجليزية", edition: "1447هـ / 2025–2026م", rightsNote: "أرشيف طبعة سابقة. افتح المنشور الأصلي على Telegram وتحقق من الغلاف قبل استخدامها." },
  { id: "g12-physics-1447", title: "الفيزياء — الثالث الثانوي العلمي", publisher: "فيديوهات القناة التعليمية الرسمية", description: "ملف PDF باسم physical_12th.pdf، حجم منشور يقارب 130.2 MB.", url: "https://t.me/YemenEducationTV2025/854", kind: "telegram-attachment", grade: 12, subject: "الفيزياء — علمي", edition: "1447هـ / 2025–2026م", rightsNote: "أرشيف طبعة سابقة. افتح المنشور الأصلي على Telegram وتحقق من الغلاف قبل استخدامها." },
  { id: "g12-fiqh-1447", title: "الفقه — الثالث الثانوي", publisher: "الإدارة العامة للإعلام التربوي والقناة التعليمية — الوزارة", description: "منشور PDF باسم الفقه12.pdf، بحجم يقارب 5.5 MB.", url: "https://t.me/yemeneducation2/42291", kind: "telegram-attachment", grade: 12, subject: "الفقه", edition: "1447هـ / 2025–2026م", rightsNote: "أرشيف طبعة سابقة. افتح المنشور الأصلي على Telegram وتحقق من الغلاف قبل استخدامها." },
  { id: "g12-seerah-1447", title: "السيرة النبوية — الثالث الثانوي", publisher: "الإدارة العامة للإعلام التربوي والقناة التعليمية — الوزارة", description: "منشور PDF باسم al_sira_12th.pdf، بحجم يقارب 53.8 MB.", url: "https://t.me/yemeneducation2/42292", kind: "telegram-attachment", grade: 12, subject: "السيرة النبوية", edition: "1447هـ / 2025–2026م", rightsNote: "أرشيف طبعة سابقة. افتح المنشور الأصلي على Telegram وتحقق من الغلاف قبل استخدامها." },
  { id: "g12-literature-1447", title: "الأدب والنصوص والنقد — الثالث الثانوي", publisher: "الإدارة العامة للإعلام التربوي والقناة التعليمية — الوزارة", description: "منشور كتاب للصف الثالث الثانوي.", url: "https://t.me/yemeneducation2/42442", kind: "telegram-attachment", grade: 12, subject: "الأدب والنصوص والنقد", edition: "1447هـ / 2025–2026م", rightsNote: "أرشيف طبعة سابقة. افتح المنشور الأصلي على Telegram وتحقق من الغلاف قبل استخدامها." },
  { id: "g12-reading-1447", title: "القراءة — الثالث الثانوي", publisher: "الإدارة العامة للإعلام التربوي والقناة التعليمية — الوزارة", description: "منشور كتاب القراءة للصف الثالث الثانوي.", url: "https://t.me/yemeneducation2/42448", kind: "telegram-attachment", grade: 12, subject: "القراءة", edition: "1447هـ / 2025–2026م", rightsNote: "أرشيف طبعة سابقة. افتح المنشور الأصلي على Telegram وتحقق من الغلاف قبل استخدامها." },
  { id: "g12-math-1447", title: "الرياضيات — الثالث الثانوي", publisher: "الإدارة العامة للإعلام التربوي والقناة التعليمية — الوزارة", description: "منشور كتاب الرياضيات للصف الثالث الثانوي.", url: "https://t.me/yemeneducation2/42281", kind: "telegram-attachment", grade: 12, subject: "الرياضيات", edition: "1447هـ / 2025–2026م", rightsNote: "أرشيف طبعة سابقة. افتح المنشور الأصلي على Telegram وتحقق من القسم العلمي / الأدبي قبل استخدامها." },
];

export const officialPhysicsPractice: BookSource[] = [
  { id: "physics-question-bank", title: "بنك أسئلة الفيزياء مع الإجابات — الثالث الثانوي", publisher: "قناة التعليمية اليمنية — روابط الوزارة ومكاتبها", description: "منشور يحوي ملف بنك أسئلة في الفيزياء للثالث الثانوي.", url: "https://t.me/yemeneducation2/26100", kind: "telegram-attachment", grade: 12, subject: "الفيزياء — علمي", rightsNote: "مورد خارجي منشور في القناة؛ تأكد من تاريخ الملف والطبعة وطابقه مع المنهج الحالي." },
  { id: "physics-laws-summary", title: "ملخص قوانين الفيزياء — الثالث الثانوي", publisher: "قناة التعليمية اليمنية — روابط الوزارة ومكاتبها", description: "منشور PDF بعنوان ملخص جميع قوانين الفيزياء للثالث الثانوي.", url: "https://t.me/yemeneducation2/26102", kind: "telegram-attachment", grade: 12, subject: "الفيزياء — علمي", rightsNote: "مورد خارجي للمراجعة؛ قد ينتمي إلى طبعة أقدم، ويجب التحقق من مطابقته قبل الاعتماد." },
  { id: "physics-worked-revision", title: "ملخص وأسئلة وزارية محلولة في الفيزياء — الثالث الثانوي", publisher: "قناة التعليمية اليمنية — روابط الوزارة ومكاتبها", description: "منشور يتضمن ملخصاً وأسئلة وزارية محلولة.", url: "https://t.me/yemeneducation2/26104", kind: "telegram-attachment", grade: 12, subject: "الفيزياء — علمي", rightsNote: "مورد خارجي للمراجعة؛ تحقق من سنة الملف ومطابقته للطبعة الحالية." },
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
  "طبعة 1448هـ / 2026–2027م هي مرجع البحث الأول؛ بوابة الوزارة هي المصدر الذي تنشر منه الكتب، وتُضاف الروابط الفردية تدريجياً.",
  "قناة الإدارة العامة للتوجيه التربوي نشرت قائمة ببعض الكتب المحدثة 1448؛ هذه قائمة جزئية وليست فهرساً كاملاً لكل الصفوف.",
  "فهرس حضرموت مفيد للتحقق من أسماء الملفات والأنشطة، لكنه إقليمي وقد تختلف الطبعات.",
  "ملفات الثالث الثانوي 1447هـ المرفقة هنا أرشيف للمقارنة فقط إلى أن يظهر رابط الطبعة 1448 للصف نفسه.",
  "لن نرفع نسخ PDF محمية إلى مستودع Yemen Study. نربط بالمصدر الأصلي، وننشئ ملخصات تعليمية أصلية بعد التحقق من الطبعة والحقوق.",
];
