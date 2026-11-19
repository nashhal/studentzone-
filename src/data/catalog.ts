export type SubjectEntry = { slug: string; name: string };
export type TrackEntry = { slug: string; name: string; subjects: SubjectEntry[] };
export type GradeEntry = {
  slug: string;
  number: number;
  name: string;
  stage: "basic" | "secondary";
  description: string;
  tracks: TrackEntry[];
};

const makeTrack = (slug: string, name: string, subjects: [string, string][]): TrackEntry => ({
  slug,
  name,
  subjects: subjects.map(([subjectSlug, subjectName]) => ({ slug: subjectSlug, name: subjectName })),
});

const basicCore: [string, string][] = [
  ["arabic", "اللغة العربية"],
  ["mathematics", "الرياضيات"],
  ["science", "العلوم"],
  ["quran-islamic", "القرآن الكريم والتربية الإسلامية"],
];
const basicSocial: [string, string][] = [
  ["history", "التاريخ"],
  ["geography", "الجغرافيا"],
  ["national-education", "التربية الوطنية"],
  ["islamic-education", "التربية الإسلامية"],
  ["quran", "القرآن الكريم"],
];
const primaryWithSocial = [
  ...basicCore,
  ["social-studies", "الاجتماعيات"],
] as [string, string][];
const grade5And6 = [
  ["arabic", "اللغة العربية"],
  ["mathematics", "الرياضيات"],
  ["science", "العلوم"],
  ...basicSocial,
] as [string, string][];
const middleSchool = [
  ...grade5And6,
  ["english", "اللغة الإنجليزية"],
] as [string, string][];
const secondaryCommon: [string, string][] = [
  ["biology", "الأحياء"],
  ["english", "اللغة الإنجليزية"],
  ["faith", "الإيمان"],
  ["history", "التاريخ"],
  ["geography", "الجغرافيا"],
  ["computer", "الحاسوب"],
  ["hadith-fiqh", "الحديث والفقه"],
  ["prophetic-biography", "السيرة النبوية"],
  ["physics", "الفيزياء"],
  ["quran", "القرآن الكريم"],
  ["chemistry", "الكيمياء"],
  ["reading", "القراءة"],
  ["grammar", "النحو والصرف"],
  ["texts", "النصوص"],
];

export const curriculumSource = {
  label: "البوابة الإلكترونية لمكتب وزارة التربية والتعليم بمحافظة حضرموت",
  url: "https://meoh.gov.ye/services/subjects/",
  videoUrl: "https://meoh.gov.ye/self-education/edu-programs/",
  note: "مرجع حكومي تعليمي متاح لفهرسة ملفات مقررات الصفوف من الأول الأساسي إلى الثالث الثانوي. يلزم تأكيد الطبعة وانطباقها على المنطقة الدراسية قبل اعتماد الفهرس نهائياً.",
};

export const grades: GradeEntry[] = [
  { slug: "grade-1", number: 1, name: "الصف الأول الأساسي", stage: "basic", description: "بداية التعليم الأساسي وبناء مهارات القراءة والكتابة والحساب والمعرفة الأولية.", tracks: [makeTrack("general", "التعليم الأساسي", basicCore)] },
  { slug: "grade-2", number: 2, name: "الصف الثاني الأساسي", stage: "basic", description: "ترسيخ مهارات اللغة والرياضيات والعلوم والتربية الإسلامية.", tracks: [makeTrack("general", "التعليم الأساسي", basicCore)] },
  { slug: "grade-3", number: 3, name: "الصف الثالث الأساسي", stage: "basic", description: "مواد التعليم الأساسي مع ظهور مقرر الاجتماعيات في الفهرس المتاح.", tracks: [makeTrack("general", "التعليم الأساسي", primaryWithSocial)] },
  { slug: "grade-4", number: 4, name: "الصف الرابع الأساسي", stage: "basic", description: "مقررات اللغة والرياضيات والعلوم والاجتماعيات والتربية الإسلامية.", tracks: [makeTrack("general", "التعليم الأساسي", [
    ["arabic", "اللغة العربية"], ["mathematics", "الرياضيات"], ["science", "العلوم"],
    ["social-studies", "الاجتماعيات"], ["islamic-education", "التربية الإسلامية"], ["quran", "القرآن الكريم"],
  ])] },
  { slug: "grade-5", number: 5, name: "الصف الخامس الأساسي", stage: "basic", description: "تتضمن قائمة المقررات المتاحة مواد اللغة والرياضيات والعلوم والتاريخ والجغرافيا والوطنية والقرآن والإسلامية.", tracks: [makeTrack("general", "التعليم الأساسي", grade5And6)] },
  { slug: "grade-6", number: 6, name: "الصف السادس الأساسي", stage: "basic", description: "استكمال مقررات المرحلة الأساسية في اللغة والرياضيات والعلوم والاجتماعيات.", tracks: [makeTrack("general", "التعليم الأساسي", grade5And6)] },
  { slug: "grade-7", number: 7, name: "الصف السابع الأساسي", stage: "basic", description: "مقررات التعليم الأساسي مع اللغة الإنجليزية والتوسع في الدراسات الاجتماعية.", tracks: [makeTrack("general", "التعليم الأساسي", middleSchool)] },
  { slug: "grade-8", number: 8, name: "الصف الثامن الأساسي", stage: "basic", description: "مقررات اللغة والرياضيات والعلوم والإنجليزية والتاريخ والجغرافيا والوطنية والإسلامية.", tracks: [makeTrack("general", "التعليم الأساسي", middleSchool)] },
  { slug: "grade-9", number: 9, name: "الصف التاسع الأساسي", stage: "basic", description: "الصف الختامي من التعليم الأساسي والاستعداد للانتقال إلى المرحلة الثانوية.", tracks: [makeTrack("general", "التعليم الأساسي", middleSchool)] },
  { slug: "grade-10", number: 10, name: "الصف الأول الثانوي", stage: "secondary", description: "مقررات الصف الأول الثانوي كما تظهر في فهرس الكتب المتاح، وتحتاج مطابقة طبعة كل مقرر.", tracks: [makeTrack("general", "المقررات العامة", [
    ...secondaryCommon,
    ["yemeni-society", "المجتمع اليمني"],
  ])] },
  { slug: "grade-11", number: 11, name: "الصف الثاني الثانوي", stage: "secondary", description: "تظهر في فهرس الكتب مقررات مشتركة مع كتب رياضيات منفصلة للقسمين العلمي والأدبي.", tracks: [
    makeTrack("scientific", "القسم العلمي", [...secondaryCommon, ["mathematics-scientific", "الرياضيات — علمي"]]),
    makeTrack("literary", "القسم الأدبي", [...secondaryCommon.filter(([id]) => !["physics", "chemistry", "biology"].includes(id)), ["mathematics-literary", "الرياضيات — أدبي"], ["economics", "الاقتصاد"], ["sociology", "علم الاجتماع"]]),
  ] },
  { slug: "grade-12", number: 12, name: "الصف الثالث الثانوي", stage: "secondary", description: "الصف المستهدف للنسخة التجريبية الأولى، مع فهرسة مستقلة للقسم العلمي والقسم الأدبي.", tracks: [
    makeTrack("scientific", "القسم العلمي", [
      ["biology", "الأحياء"], ["english", "اللغة الإنجليزية"], ["faith", "الإيمان"],
      ["history", "التاريخ"], ["geography", "الجغرافيا"], ["hadith-fiqh", "الحديث والفقه"],
      ["mathematics-scientific", "الرياضيات — علمي"], ["prophetic-biography", "السيرة النبوية"],
      ["quran", "القرآن الكريم"], ["physics", "الفيزياء"], ["chemistry", "الكيمياء"],
      ["reading", "القراءة"], ["grammar", "النحو والصرف"], ["texts", "النصوص"],
    ]),
    makeTrack("literary", "القسم الأدبي", [
      ["biology", "الأحياء"], ["english", "اللغة الإنجليزية"], ["faith", "الإيمان"],
      ["history", "التاريخ"], ["geography", "الجغرافيا"], ["hadith-fiqh", "الحديث والفقه"],
      ["mathematics-literary", "الرياضيات — أدبي"], ["prophetic-biography", "السيرة النبوية"],
      ["philosophy", "الفلسفة"], ["quran", "القرآن الكريم"], ["logic", "المنطق"],
      ["reading", "القراءة"], ["grammar", "النحو والصرف"], ["texts", "النصوص"],
      ["psychology", "علم النفس"], ["map-science", "علم الخرائط"],
    ]),
  ] },
];

export function getGrade(slug: string): GradeEntry | undefined {
  return grades.find((item) => item.slug === slug);
}

export function getSubjectCount(grade: GradeEntry): number {
  return grade.tracks.reduce((sum, item) => sum + item.subjects.length, 0);
}

export function countAllSubjectEntries(): number {
  return grades.reduce((sum, grade) => sum + getSubjectCount(grade), 0);
}

export function findSubjects(query: string) {
  const value = query.trim().toLocaleLowerCase("ar");
  if (!value) return [];
  return grades.flatMap((grade) => grade.tracks.flatMap((track) =>
    track.subjects.filter((subject) => subject.name.toLocaleLowerCase("ar").includes(value) || grade.name.includes(value))
      .map((subject) => ({ grade, track, subject })),
  )).slice(0, 8);
}
