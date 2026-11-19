import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, ExternalLink, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import "./grade12-books.css";

type Track = "scientific" | "literary";
type TrackFilter = "all" | Track | "shared";
type SourceFilter = "all" | "2026" | "hadramout";
type RegionFilter = "all" | "صنعاء" | "عدن" | "صنعاء وعدن" | "حضرموت";
type BookKind = "كتاب مدرسي" | "كتاب أنشطة" | "كتاب تمارين";
type Grade12Book = {
  id: string;
  title: string;
  subject: string;
  subjectSlug: string;
  kind: BookKind;
  tracks: Track[];
  region: RegionFilter extends infer R ? Exclude<R, "all"> : never;
  source: SourceFilter extends infer S ? Exclude<S, "all"> : never;
  sourceUrl: string;
};

const drive = (id: string) => "https://drive.google.com/file/d/" + id + "/view?usp=drivesdk";

// The 2026 records below link to item pages in an independent Yemeni curriculum index.
// They are catalogue references, not proof of Ministry approval or proof that the PDF may be re-hosted.
const books2026: Grade12Book[] = [
  { id: "2026-logic-lit", title: "المنطق ومناهج البحث العلمي — أدبي", subject: "المنطق", subjectSlug: "logic", kind: "كتاب مدرسي", tracks: ["literary"], region: "صنعاء وعدن", source: "2026", sourceUrl: "https://yembooks.com/item/logic-research-methods-literary-grade-12" },
  { id: "2026-english-activities", title: "اللغة الإنجليزية — كتاب الأنشطة", subject: "اللغة الإنجليزية", subjectSlug: "english", kind: "كتاب أنشطة", tracks: ["scientific", "literary"], region: "صنعاء وعدن", source: "2026", sourceUrl: "https://yembooks.com/item/english-activities-grade-12" },
  { id: "2026-english-course", title: "اللغة الإنجليزية — كتاب الدروس", subject: "اللغة الإنجليزية", subjectSlug: "english", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "صنعاء وعدن", source: "2026", sourceUrl: "https://yembooks.com/item/english-grade-12" },
  { id: "2026-cartography", title: "مبادئ علم الخرائط — أدبي", subject: "علم الخرائط", subjectSlug: "map-science", kind: "كتاب مدرسي", tracks: ["literary"], region: "صنعاء وعدن", source: "2026", sourceUrl: "https://yembooks.com/item/cartography-principles-literary-grade-12" },
  { id: "2026-history", title: "التاريخ", subject: "التاريخ", subjectSlug: "history", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "صنعاء وعدن", source: "2026", sourceUrl: "https://yembooks.com/item/history-grade-12" },
  { id: "2026-geography", title: "الجغرافيا", subject: "الجغرافيا", subjectSlug: "geography", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "صنعاء وعدن", source: "2026", sourceUrl: "https://yembooks.com/item/geography-grade-12" },
  { id: "2026-psychology", title: "علم النفس — أدبي", subject: "علم النفس", subjectSlug: "psychology", kind: "كتاب مدرسي", tracks: ["literary"], region: "صنعاء وعدن", source: "2026", sourceUrl: "https://yembooks.com/item/psychology-literary-grade-12" },
  { id: "2026-philosophy", title: "مبادئ الفلسفة — أدبي", subject: "الفلسفة", subjectSlug: "philosophy", kind: "كتاب مدرسي", tracks: ["literary"], region: "صنعاء وعدن", source: "2026", sourceUrl: "https://yembooks.com/item/philosophy-principles-literary-grade-12" },
  { id: "2026-biology-activities", title: "الأحياء — كتاب الأنشطة", subject: "الأحياء", subjectSlug: "biology", kind: "كتاب أنشطة", tracks: ["scientific"], region: "صنعاء وعدن", source: "2026", sourceUrl: "https://yembooks.com/item/biology-activities-grade-12" },
  { id: "2026-biology", title: "الأحياء — الكتاب المدرسي", subject: "الأحياء", subjectSlug: "biology", kind: "كتاب مدرسي", tracks: ["scientific"], region: "صنعاء وعدن", source: "2026", sourceUrl: "https://yembooks.com/item/biology-grade-12" },
  { id: "2026-chemistry-activities", title: "الكيمياء — كتاب الأنشطة", subject: "الكيمياء", subjectSlug: "chemistry", kind: "كتاب أنشطة", tracks: ["scientific"], region: "صنعاء وعدن", source: "2026", sourceUrl: "https://yembooks.com/item/activities-chemistry-grade-12" },
  { id: "2026-chemistry", title: "الكيمياء — الكتاب المدرسي", subject: "الكيمياء", subjectSlug: "chemistry", kind: "كتاب مدرسي", tracks: ["scientific"], region: "صنعاء وعدن", source: "2026", sourceUrl: "https://yembooks.com/item/chemistry-grade-12" },
  { id: "2026-physics-activities", title: "الفيزياء — الأنشطة والتجارب", subject: "الفيزياء", subjectSlug: "physics", kind: "كتاب أنشطة", tracks: ["scientific"], region: "صنعاء وعدن", source: "2026", sourceUrl: "https://yembooks.com/item/physics-activities-experiments-grade-12" },
  { id: "2026-physics", title: "الفيزياء — الكتاب المدرسي", subject: "الفيزياء", subjectSlug: "physics", kind: "كتاب مدرسي", tracks: ["scientific"], region: "صنعاء وعدن", source: "2026", sourceUrl: "https://yembooks.com/item/physics-grade-12" },
  { id: "2026-math-literary-exercises", title: "الرياضيات — تمارين القسم الأدبي", subject: "الرياضيات", subjectSlug: "mathematics-literary", kind: "كتاب تمارين", tracks: ["literary"], region: "صنعاء وعدن", source: "2026", sourceUrl: "https://yembooks.com/item/math-exercises-literary-grade-12" },
  { id: "2026-math-literary", title: "الرياضيات — القسم الأدبي", subject: "الرياضيات", subjectSlug: "mathematics-literary", kind: "كتاب مدرسي", tracks: ["literary"], region: "صنعاء وعدن", source: "2026", sourceUrl: "https://yembooks.com/item/math-literary-grade-12" },
  { id: "2026-math-scientific-exercises", title: "الرياضيات — تمارين القسم العلمي", subject: "الرياضيات", subjectSlug: "mathematics-scientific", kind: "كتاب تمارين", tracks: ["scientific"], region: "صنعاء وعدن", source: "2026", sourceUrl: "https://yembooks.com/item/math-exercises-scientific-grade-12" },
  { id: "2026-math-scientific", title: "الرياضيات — القسم العلمي", subject: "الرياضيات", subjectSlug: "mathematics-scientific", kind: "كتاب مدرسي", tracks: ["scientific"], region: "صنعاء وعدن", source: "2026", sourceUrl: "https://yembooks.com/item/math-scientific-grade-12" },
  { id: "2026-literature-aden", title: "الأدب والنصوص والنقد — عدن", subject: "الأدب والنصوص", subjectSlug: "texts", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "عدن", source: "2026", sourceUrl: "https://yembooks.com/item/literature-grade-12-aden" },
  { id: "2026-literature-sanaa", title: "الأدب والنصوص — صنعاء", subject: "الأدب والنصوص", subjectSlug: "texts", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "صنعاء", source: "2026", sourceUrl: "https://yembooks.com/item/literature-grade-12-sanaa" },
  { id: "2026-grammar-aden", title: "النحو والصرف — عدن", subject: "النحو والصرف", subjectSlug: "grammar", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "عدن", source: "2026", sourceUrl: "https://yembooks.com/item/grammar-grade-12-aden" },
  { id: "2026-grammar-sanaa", title: "النحو والصرف — صنعاء", subject: "النحو والصرف", subjectSlug: "grammar", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "صنعاء", source: "2026", sourceUrl: "https://yembooks.com/item/grammar-grade-12-sanaa" },
  { id: "2026-reading-aden", title: "القراءة — عدن", subject: "القراءة", subjectSlug: "reading", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "عدن", source: "2026", sourceUrl: "https://yembooks.com/item/reading-grade-12-aden" },
  { id: "2026-reading-sanaa", title: "القراءة — صنعاء", subject: "القراءة", subjectSlug: "reading", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "صنعاء", source: "2026", sourceUrl: "https://yembooks.com/item/reading-grade-12-sanaa" },
  { id: "2026-seerah-aden", title: "السيرة النبوية — عدن", subject: "السيرة النبوية", subjectSlug: "prophetic-biography", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "عدن", source: "2026", sourceUrl: "https://yembooks.com/item/seerah-grade-12-aden" },
  { id: "2026-hadith-fiqh-aden", title: "الحديث والفقه — عدن", subject: "الحديث والفقه", subjectSlug: "hadith-fiqh", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "عدن", source: "2026", sourceUrl: "https://yembooks.com/item/hadith-fiqh-grade-12-aden" },
  { id: "2026-seerah-sanaa", title: "السيرة النبوية — صنعاء", subject: "السيرة النبوية", subjectSlug: "prophetic-biography", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "صنعاء", source: "2026", sourceUrl: "https://yembooks.com/item/seerah-grade-12-sanaa" },
  { id: "2026-fiqh-sanaa", title: "الفقه — صنعاء", subject: "الفقه", subjectSlug: "hadith-fiqh", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "صنعاء", source: "2026", sourceUrl: "https://yembooks.com/item/fiqh-grade-12-sanaa" },
  { id: "2026-hadith-sanaa", title: "الحديث والتهذيب — صنعاء", subject: "الحديث والتهذيب", subjectSlug: "hadith-fiqh", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "صنعاء", source: "2026", sourceUrl: "https://yembooks.com/item/hadith-tahdheeb-grade-12-sanaa" },
  { id: "2026-faith-sanaa", title: "الإيمان — صنعاء", subject: "الإيمان", subjectSlug: "faith", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "صنعاء", source: "2026", sourceUrl: "https://yembooks.com/item/iman-grade-12-sanaa" },
  { id: "2026-faith-aden", title: "الإيمان — عدن", subject: "الإيمان", subjectSlug: "faith", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "عدن", source: "2026", sourceUrl: "https://yembooks.com/item/iman-grade-12-aden" },
  { id: "2026-quran-aden", title: "القرآن الكريم — عدن", subject: "القرآن الكريم", subjectSlug: "quran", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "عدن", source: "2026", sourceUrl: "https://yembooks.com/item/quran-grade-12-aden" },
  { id: "2026-quran-sanaa", title: "القرآن الكريم — صنعاء", subject: "القرآن الكريم", subjectSlug: "quran", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "صنعاء", source: "2026", sourceUrl: "https://yembooks.com/item/quran-grade-12-sanaa" },
];

// This second set is the 25-file regional index of the Hadramout Education Office.
// Its catalogue does not state an edition year for every file.
const hadramoutBooks: Grade12Book[] = [
  { id: "had-biology-text", title: "الأحياء — الكتاب المدرسي", subject: "الأحياء", subjectSlug: "biology", kind: "كتاب مدرسي", tracks: ["scientific"], region: "حضرموت", source: "hadramout", sourceUrl: drive("1cepZh1qgFrP-rznAolw3MZY7Gm0WhsT0") },
  { id: "had-biology-activities", title: "الأحياء — كتاب الأنشطة", subject: "الأحياء", subjectSlug: "biology", kind: "كتاب أنشطة", tracks: ["scientific"], region: "حضرموت", source: "hadramout", sourceUrl: drive("15qng8UIiGiaissw81qCdISN6kJkB6ZXM") },
  { id: "had-faith", title: "الإيمان", subject: "الإيمان", subjectSlug: "faith", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "حضرموت", source: "hadramout", sourceUrl: drive("1oO5x2ojyiyAn8-K-gW6oTt7--NxJvnYR") },
  { id: "had-english-course", title: "اللغة الإنجليزية — كتاب الدروس", subject: "اللغة الإنجليزية", subjectSlug: "english", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "حضرموت", source: "hadramout", sourceUrl: drive("1AmLdjzla_l5z3NR6aitntb9PGvmMR2EK") },
  { id: "had-english-workbook", title: "اللغة الإنجليزية — كتاب التمارين", subject: "اللغة الإنجليزية", subjectSlug: "english", kind: "كتاب تمارين", tracks: ["scientific", "literary"], region: "حضرموت", source: "hadramout", sourceUrl: drive("1m4o1HVP7PC0a0Wz_Xp2m5vY0m2JeYOBR") },
  { id: "had-history", title: "التاريخ", subject: "التاريخ", subjectSlug: "history", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "حضرموت", source: "hadramout", sourceUrl: drive("139EXpEr5zouCCJNPM_jp7hZJOiAAcQh6") },
  { id: "had-geography", title: "الجغرافيا", subject: "الجغرافيا", subjectSlug: "geography", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "حضرموت", source: "hadramout", sourceUrl: drive("1qbiBkOPtYrMMIW21HCIbQZqQobKOX2gO") },
  { id: "had-hadith-fiqh", title: "الحديث والفقه", subject: "الحديث والفقه", subjectSlug: "hadith-fiqh", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "حضرموت", source: "hadramout", sourceUrl: drive("1XgLUzd_s8sniKTnNblE074C3mTHY0WVQ") },
  { id: "had-math-scientific", title: "الرياضيات — القسم العلمي", subject: "الرياضيات", subjectSlug: "mathematics-scientific", kind: "كتاب مدرسي", tracks: ["scientific"], region: "حضرموت", source: "hadramout", sourceUrl: drive("18HbXPe3TERHKEVBXe-Zv9o6_wlJ2HhEU") },
  { id: "had-math-literary-exercises", title: "الرياضيات — تمارين القسم الأدبي", subject: "الرياضيات", subjectSlug: "mathematics-literary", kind: "كتاب تمارين", tracks: ["literary"], region: "حضرموت", source: "hadramout", sourceUrl: drive("1s5ow5Eyhitl9vswb2FLrChPu0dzDEOTl") },
  { id: "had-math-literary", title: "الرياضيات — القسم الأدبي", subject: "الرياضيات", subjectSlug: "mathematics-literary", kind: "كتاب مدرسي", tracks: ["literary"], region: "حضرموت", source: "hadramout", sourceUrl: drive("1TNeSlavWfkma-5yxNvwf5rQUOxxNXaJ8") },
  { id: "had-math-scientific-exercises", title: "الرياضيات — تمارين القسم العلمي", subject: "الرياضيات", subjectSlug: "mathematics-scientific", kind: "كتاب تمارين", tracks: ["scientific"], region: "حضرموت", source: "hadramout", sourceUrl: drive("1mpRJmrXPJ_SzjEkExDG14Z8fPb8LSyYB") },
  { id: "had-seerah", title: "السيرة النبوية", subject: "السيرة النبوية", subjectSlug: "prophetic-biography", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "حضرموت", source: "hadramout", sourceUrl: drive("1QuLl9znAxY3C1RpBrxnstP5Nqqn-F2h4") },
  { id: "had-philosophy", title: "الفلسفة", subject: "الفلسفة", subjectSlug: "philosophy", kind: "كتاب مدرسي", tracks: ["literary"], region: "حضرموت", source: "hadramout", sourceUrl: drive("1OCCmc4ia-XgBceo8m0tJvAqidsrFKq6r") },
  { id: "had-quran", title: "القرآن الكريم وعلومه", subject: "القرآن الكريم", subjectSlug: "quran", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "حضرموت", source: "hadramout", sourceUrl: drive("1GFZwX6Oynn7jTbKjFLQJVHr2NgNYe3gF") },
  { id: "had-physics-activities", title: "الفيزياء — الأنشطة والتجارب", subject: "الفيزياء", subjectSlug: "physics", kind: "كتاب أنشطة", tracks: ["scientific"], region: "حضرموت", source: "hadramout", sourceUrl: drive("1pktvollQ8GP4JDjAM07G5JRBCwMKj68A") },
  { id: "had-physics-text", title: "الفيزياء — الكتاب المدرسي", subject: "الفيزياء", subjectSlug: "physics", kind: "كتاب مدرسي", tracks: ["scientific"], region: "حضرموت", source: "hadramout", sourceUrl: drive("1qFQXBy4KyMCt9Si1P27Wt7y_y7oMywBw") },
  { id: "had-reading", title: "القراءة", subject: "القراءة", subjectSlug: "reading", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "حضرموت", source: "hadramout", sourceUrl: drive("1GsLhF-zCqWG5b8ZMrPy-QItDwm1SGUZd") },
  { id: "had-chemistry-text", title: "الكيمياء — الكتاب المدرسي", subject: "الكيمياء", subjectSlug: "chemistry", kind: "كتاب مدرسي", tracks: ["scientific"], region: "حضرموت", source: "hadramout", sourceUrl: drive("1KrBQDHT91MPE4hYFJK_2MRRHNR7MibpC") },
  { id: "had-chemistry-activities", title: "الكيمياء — كتاب الأنشطة", subject: "الكيمياء", subjectSlug: "chemistry", kind: "كتاب أنشطة", tracks: ["scientific"], region: "حضرموت", source: "hadramout", sourceUrl: drive("1-MOt8pnldVJv1eGygKTzJ24ar0lv43Ya") },
  { id: "had-logic", title: "المنطق ومناهج البحث العلمي", subject: "المنطق", subjectSlug: "logic", kind: "كتاب مدرسي", tracks: ["literary"], region: "حضرموت", source: "hadramout", sourceUrl: drive("18biuX__3FF3pNVU719lUsVplgcskp-IU") },
  { id: "had-grammar", title: "النحو والصرف", subject: "النحو والصرف", subjectSlug: "grammar", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "حضرموت", source: "hadramout", sourceUrl: drive("1HecBwTaleC-FiPcsPkJoMrBlJAGuf3zL") },
  { id: "had-texts", title: "النصوص والأدب", subject: "النصوص", subjectSlug: "texts", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], region: "حضرموت", source: "hadramout", sourceUrl: drive("1pFFx_n8vXw4cHB-Pm37zUMKw2T0FkIOf") },
  { id: "had-psychology", title: "علم النفس", subject: "علم النفس", subjectSlug: "psychology", kind: "كتاب مدرسي", tracks: ["literary"], region: "حضرموت", source: "hadramout", sourceUrl: drive("1ulmiyyrlH54-wyr6kOjoRoBGJYDzEJZz") },
  { id: "had-map-science", title: "مبادئ علم الخرائط", subject: "علم الخرائط", subjectSlug: "map-science", kind: "كتاب مدرسي", tracks: ["literary"], region: "حضرموت", source: "hadramout", sourceUrl: drive("18zqIDpX1hN6MdjfaL6gpeGM3Hw-bzsRT") },
];

const allBooks = [...books2026, ...hadramoutBooks];
const trackNames: Record<Track, string> = { scientific: "القسم العلمي", literary: "القسم الأدبي" };

export default function Grade12BooksPage() {
  const [trackFilter, setTrackFilter] = useState<TrackFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("all");
  const [query, setQuery] = useState("");

  const visibleBooks = useMemo(() => allBooks.filter((book) => {
    const matchesTrack = trackFilter === "all" ||
      (trackFilter === "shared" ? book.tracks.length === 2 : book.tracks.includes(trackFilter));
    const matchesSource = sourceFilter === "all" || book.source === sourceFilter;
    const matchesRegion = regionFilter === "all" ||
      (regionFilter === "صنعاء وعدن" ? book.region === "صنعاء وعدن" : book.region === regionFilter);
    const searchText = (book.title + " " + book.subject + " " + book.kind + " " + book.region).toLocaleLowerCase("ar");
    return matchesTrack && matchesSource && matchesRegion &&
      (!query.trim() || searchText.includes(query.trim().toLocaleLowerCase("ar")));
  }), [trackFilter, sourceFilter, regionFilter, query]);

  const trackOptions: { value: TrackFilter; label: string; count: number }[] = [
    { value: "all", label: "كل المسارات", count: allBooks.length },
    { value: "scientific", label: "العلمي", count: allBooks.filter((book) => book.tracks.includes("scientific")).length },
    { value: "literary", label: "الأدبي", count: allBooks.filter((book) => book.tracks.includes("literary")).length },
    { value: "shared", label: "المواد المشتركة", count: allBooks.filter((book) => book.tracks.length === 2).length },
  ];

  const sourceCount2026 = books2026.length;
  const hadramoutCount = hadramoutBooks.length;

  return <main className="container page g12-books-page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><span>›</span><Link to="/grade/grade-12">الصف الثالث الثانوي</Link><span>›</span><b>مكتبة الكتب</b></div>
    <header className="g12-books-heading">
      <div><span className="eyebrow">مكتبة الصف الثالث الثانوي</span><h1>كتب العلمي والأدبي حسب النسخة والمنطقة.</h1><p>قاعدة فهرسة تجمع نسخ 2026 المنشورة في فهرس مستقل، وملفات مكتب وزارة التربية والتعليم بحضرموت. استخدم فلاتر المنطقة والمسار لتحديد الكتاب الأقرب لمدرستك.</p></div>
      <div className="g12-books-total"><b>{allBooks.length}</b><span>سجلاً مفهرساً</span><small>{sourceCount2026} نسخة 2026 · {hadramoutCount} ملفاً إقليمياً</small></div>
    </header>

    <section className="g12-books-notice">
      <ShieldCheck size={19}/>
      <div><b>تحقق من الطبعة قبل الدراسة</b><p>إعلان وزارة التربية يوجّه إلى بوابة المناهج الرسمية للعام 1448هـ، لكن تعذّر تحميل فهرس الصف الثالث منها أثناء إعداد هذه النسخة. لذلك تُوسم سجلات YemBooks بأنها فهرس مستقل لعام 2026 وليست اعتماداً وزارياً، بينما فهرس حضرموت حكومي إقليمي ولا يذكر سنة طبعة كل ملف. لا تخلط نسخة صنعاء بعدن.</p></div>
    </section>

    <section className="g12-books-sourcebar">
      <div><b>المصدر الوزاري للطبعة 1448هـ</b><span>تحقق من الإصدارات التي تعتمدها مدرستك من بوابة الوزارة. روابط الكتب المفهرسة أدناه تُعرض مع مصدر كل ملف وحالته.</span></div>
      <a href="https://e-learning-moe.edu.ye/index.php" target="_blank" rel="noreferrer">بوابة التعليم الإلكتروني <ExternalLink size={15}/></a>
      <a href="https://tg.me/books_yemen_new/1316" target="_blank" rel="noreferrer">إعلان الوزارة 1448هـ <ExternalLink size={15}/></a>
    </section>

    <div className="g12-books-filters-row">
      <div className="g12-books-filters" role="group" aria-label="تصفية الكتب حسب المسار">
        {trackOptions.map((option) => <button type="button" key={option.value} className={trackFilter === option.value ? "active" : ""} onClick={() => setTrackFilter(option.value)}>{option.label}<small>{option.count}</small></button>)}
      </div>
      <div className="g12-books-selects">
        <label><span>الطبعة / المصدر</span><select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as SourceFilter)}><option value="all">كل المصادر</option><option value="2026">فهرس 2026 المستقل</option><option value="hadramout">فهرس حضرموت</option></select></label>
        <label><span>المنطقة</span><select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value as RegionFilter)}><option value="all">كل المناطق</option><option value="صنعاء">صنعاء</option><option value="عدن">عدن</option><option value="صنعاء وعدن">صنعاء وعدن — كما ورد في الفهرس</option><option value="حضرموت">حضرموت — سنة غير محددة</option></select></label>
      </div>
      <label className="g12-books-search"><Search size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث باسم الكتاب أو المادة" aria-label="ابحث في كتب الصف الثالث الثانوي"/></label>
    </div>

    <div className="g12-books-results"><span>عرض {visibleBooks.length} من {allBooks.length} سجلاً</span><button type="button" onClick={() => { setTrackFilter("all"); setSourceFilter("all"); setRegionFilter("all"); setQuery(""); }}>إعادة ضبط الفلاتر</button></div>

    <div className="g12-books-grid">
      {visibleBooks.map((book) => {
        const routeTrack: Track = trackFilter === "literary" && book.tracks.includes("literary")
          ? "literary"
          : book.tracks.includes("scientific") ? "scientific" : "literary";
        const subjectPath = "/subject/grade-12/" + routeTrack + "/" + book.subjectSlug;
        const isPhysicsStudy = book.subjectSlug === "physics" && routeTrack === "scientific";
        return <article className="g12-book-card" key={book.id}>
          <div className="g12-book-card-top"><span className="g12-book-kind">{book.kind}</span><span className="g12-book-track">{book.tracks.length === 2 ? "مشترك" : trackNames[book.tracks[0]]}</span></div>
          <h2>{book.title}</h2>
          <p className="g12-book-meta">{book.subject} · {book.region}</p>
          <div className="g12-book-source-label"><span className={book.source === "2026" ? "source-2026" : "source-regional"}>{book.source === "2026" ? "فهرس مستقل · 2026" : "مكتب حضرموت · الطبعة غير محددة"}</span></div>
          <div className="g12-book-card-actions">
            <Link to={isPhysicsStudy ? "/grade-12-study" : subjectPath}>{isPhysicsStudy ? "فتح الشرح والاختبار التجريبي" : "فتح صفحة المادة داخل الموقع"} <ArrowLeft size={15}/></Link>
            <a href={book.sourceUrl} target="_blank" rel="noreferrer">{book.source === "2026" ? "عرض بيانات الكتاب لدى الفهرس" : "فتح ملف الكتاب لدى المصدر"} <ExternalLink size={15}/></a>
          </div>
        </article>;
      })}
      {visibleBooks.length === 0 && <div className="g12-books-empty"><Search size={23}/><b>لا توجد نتائج مطابقة</b><span>غيّر عبارة البحث أو اختر منطقة أو مساراً آخر.</span></div>}
    </div>

    <section className="g12-books-bottom">
      <div><span className="eyebrow">حالة المحتوى التعليمي</span><h2>فهرس الكتب لا يعني أن الدروس اكتملت.</h2><p>الشرح التفاعلي المنشور حالياً هو نموذج في الفيزياء عن الكميات القياسية والمتجهة مع أسئلة متدرجة. بقية المواد ظاهرة في فهرس الصفحات، لكنها تحتاج إعداد الدروس والملخصات والاختبارات ومطابقتها مع كتب المنطقة قبل اعتبارها جاهزة.</p></div>
      <Link className="btn btn-primary" to="/grade-12-study">افتح المحتوى التدريبي المتاح <ArrowLeft size={16}/></Link>
    </section>

    <footer className="g12-books-provenance">
      <b>مصادر الفهرسة</b>
      <a href="https://e-learning-moe.edu.ye/index.php" target="_blank" rel="noreferrer">وزارة التربية والتعليم — البوابة الرسمية للكتب <ExternalLink size={13}/></a>
      <a href="https://tg.me/books_yemen_new/1316" target="_blank" rel="noreferrer">قناة الكتب الدراسية — إعلان مناهج 1448هـ <ExternalLink size={13}/></a>
      <a href="https://meoh.gov.ye/services/subjects/" target="_blank" rel="noreferrer">مكتب وزارة التربية والتعليم بمحافظة حضرموت — فهرس المقررات <ExternalLink size={13}/></a>
      <a href="https://yembooks.com/explorer/stage-secondary/sec-3" target="_blank" rel="noreferrer">بوابة المنهج اليمني المدرسي — فهرس 2026 المستقل <ExternalLink size={13}/></a>
      <small>لا تستضيف Yemen Study ملفات PDF المدرسية على مستودعها. الروابط تقود إلى الجهة التي تفهرس أو تستضيف الملف، بينما الشرح الذي يُعد داخل Yemen Study يجب أن يكون بصياغة أصلية ومراجع موثوقة.</small>
    </footer>
  </main>;
}
