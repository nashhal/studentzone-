export type Subject = {
  id: string; name: string; status: "pilot" | "planned";
};

export const pilotGrade = {
  stage: "التعليم الثانوي",
  name: "الثالث الثانوي",
  track: "القسم العلمي",
  note: "نقطة الانطلاق للنسخة الأولى. تثبّت قائمة المواد والوحدات بعد مطابقتها مع طبعة المنهج اليمني المعتمدة.",
};

export const subjects: Subject[] = [
  { id: "math", name: "الرياضيات", status: "pilot" },
  { id: "physics", name: "الفيزياء", status: "planned" },
  { id: "chemistry", name: "الكيمياء", status: "planned" },
  { id: "biology", name: "الأحياء", status: "planned" },
  { id: "arabic", name: "اللغة العربية", status: "planned" },
  { id: "english", name: "اللغة الإنجليزية", status: "planned" },
];

export const learningSteps = [
  { n: "01", title: "افهم الدرس", text: "شرح مرتب وأهداف واضحة ومفاهيم أساسية." },
  { n: "02", title: "تدرّب بذكاء", text: "أسئلة حسب الموضوع ومستوى الصعوبة." },
  { n: "03", title: "تابع تقدّمك", text: "نتائج ومحفوظات ومراجعة للنقاط التي تحتاجها." },
];
