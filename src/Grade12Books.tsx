import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, ExternalLink, FileText, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import "./grade12-books.css";

type Track = "scientific" | "literary";
type Filter = "all" | Track | "shared";
type Grade12Book = {
  id: string;
  title: string;
  subject: string;
  subjectSlug: string;
  kind: "كتاب مدرسي" | "كتاب أنشطة" | "كتاب تمارين";
  tracks: Track[];
  sourceUrl: string;
};

const sourceBase = "https://drive.google.com/file/d/";
const drive = (id: string) => sourceBase + id + "/view?usp=drivesdk";

// Links below were taken from the Grade 12 section of the Hadramout Education Office catalogue.
// The catalogue is regional and does not state an edition year for every file.
const books: Grade12Book[] = [
  { id: "biology-text", title: "الأحياء — الكتاب المدرسي", subject: "الأحياء", subjectSlug: "biology", kind: "كتاب مدرسي", tracks: ["scientific"], sourceUrl: drive("1cepZh1qgFrP-rznAolw3MZY7Gm0WhsT0") },
  { id: "biology-activities", title: "الأحياء — كتاب الأنشطة", subject: "الأحياء", subjectSlug: "biology", kind: "كتاب أنشطة", tracks: ["scientific"], sourceUrl: drive("15qng8UIiGiaissw81qCdISN6kJkB6ZXM") },
  { id: "faith", title: "الإيمان", subject: "الإيمان", subjectSlug: "faith", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], sourceUrl: drive("1oO5x2ojyiyAn8-K-gW6oTt7--NxJvnYR") },
  { id: "english-course", title: "اللغة الإنجليزية — كتاب الدروس", subject: "اللغة الإنجليزية", subjectSlug: "english", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], sourceUrl: drive("1AmLdjzla_l5z3NR6aitntb9PGvmMR2EK") },
  { id: "english-workbook", title: "اللغة الإنجليزية — كتاب التمارين", subject: "اللغة الإنجليزية", subjectSlug: "english", kind: "كتاب تمارين", tracks: ["scientific", "literary"], sourceUrl: drive("1m4o1HVP7PC0a0Wz_Xp2m5vY0m2JeYOBR") },
  { id: "history", title: "التاريخ", subject: "التاريخ", subjectSlug: "history", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], sourceUrl: drive("139EXpEr5zouCCJNPM_jp7hZJOiAAcQh6") },
  { id: "geography", title: "الجغرافيا", subject: "الجغرافيا", subjectSlug: "geography", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], sourceUrl: drive("1qbiBkOPtYrMMIW21HCIbQZqQobKOX2gO") },
  { id: "hadith-fiqh", title: "الحديث والفقه", subject: "الحديث والفقه", subjectSlug: "hadith-fiqh", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], sourceUrl: drive("1XgLUzd_s8sniKTnNblE074C3mTHY0WVQ") },
  { id: "math-scientific", title: "الرياضيات — القسم العلمي", subject: "الرياضيات", subjectSlug: "mathematics-scientific", kind: "كتاب مدرسي", tracks: ["scientific"], sourceUrl: drive("18HbXPe3TERHKEVBXe-Zv9o6_wlJ2HhEU") },
  { id: "math-literary-exercises", title: "الرياضيات — تمارين القسم الأدبي", subject: "الرياضيات", subjectSlug: "mathematics-literary", kind: "كتاب تمارين", tracks: ["literary"], sourceUrl: drive("1s5ow5Eyhitl9vswb2FLrChPu0dzDEOTl") },
  { id: "math-literary", title: "الرياضيات — القسم الأدبي", subject: "الرياضيات", subjectSlug: "mathematics-literary", kind: "كتاب مدرسي", tracks: ["literary"], sourceUrl: drive("1TNeSlavWfkma-5yxNvwf5rQUOxxNXaJ8") },
  { id: "math-scientific-exercises", title: "الرياضيات — تمارين القسم العلمي", subject: "الرياضيات", subjectSlug: "mathematics-scientific", kind: "كتاب تمارين", tracks: ["scientific"], sourceUrl: drive("1mpRJmrXPJ_SzjEkExDG14Z8fPb8LSyYB") },
  { id: "seerah", title: "السيرة النبوية", subject: "السيرة النبوية", subjectSlug: "prophetic-biography", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], sourceUrl: drive("1QuLl9znAxY3C1RpBrxnstP5Nqqn-F2h4") },
  { id: "philosophy", title: "الفلسفة", subject: "الفلسفة", subjectSlug: "philosophy", kind: "كتاب مدرسي", tracks: ["literary"], sourceUrl: drive("1OCCmc4ia-XgBceo8m0tJvAqidsrFKq6r") },
  { id: "quran", title: "القرآن الكريم وعلومه", subject: "القرآن الكريم", subjectSlug: "quran", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], sourceUrl: drive("1GFZwX6Oynn7jTbKjFLQJVHr2NgNYe3gF") },
  { id: "physics-activities", title: "الفيزياء — الأنشطة والتجارب", subject: "الفيزياء", subjectSlug: "physics", kind: "كتاب أنشطة", tracks: ["scientific"], sourceUrl: drive("1pktvollQ8GP4JDjAM07G5JRBCwMKj68A") },
  { id: "physics-text", title: "الفيزياء — الكتاب المدرسي", subject: "الفيزياء", subjectSlug: "physics", kind: "كتاب مدرسي", tracks: ["scientific"], sourceUrl: drive("1qFQXBy4KyMCt9Si1P27Wt7y_y7oMywBw") },
  { id: "reading", title: "القراءة", subject: "القراءة", subjectSlug: "reading", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], sourceUrl: drive("1GsLhF-zCqWG5b8ZMrPy-QItDwm1SGUZd") },
  { id: "chemistry-text", title: "الكيمياء — الكتاب المدرسي", subject: "الكيمياء", subjectSlug: "chemistry", kind: "كتاب مدرسي", tracks: ["scientific"], sourceUrl: drive("1KrBQDHT91MPE4hYFJK_2MRRHNR7MibpC") },
  { id: "chemistry-activities", title: "الكيمياء — كتاب الأنشطة", subject: "الكيمياء", subjectSlug: "chemistry", kind: "كتاب أنشطة", tracks: ["scientific"], sourceUrl: drive("1-MOt8pnldVJv1eGygKTzJ24ar0lv43Ya") },
  { id: "logic", title: "المنطق ومناهج البحث العلمي", subject: "المنطق", subjectSlug: "logic", kind: "كتاب مدرسي", tracks: ["literary"], sourceUrl: drive("18biuX__3FF3pNVU719lUsVplgcskp-IU") },
  { id: "grammar", title: "النحو والصرف", subject: "النحو والصرف", subjectSlug: "grammar", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], sourceUrl: drive("1HecBwTaleC-FiPcsPkJoMrBlJAGuf3zL") },
  { id: "texts", title: "النصوص والأدب", subject: "النصوص", subjectSlug: "texts", kind: "كتاب مدرسي", tracks: ["scientific", "literary"], sourceUrl: drive("1pFFx_n8vXw4cHB-Pm37zUMKw2T0FkIOf") },
  { id: "psychology", title: "علم النفس", subject: "علم النفس", subjectSlug: "psychology", kind: "كتاب مدرسي", tracks: ["literary"], sourceUrl: drive("1ulmiyyrlH54-wyr6kOjoRoBGJYDzEJZz") },
  { id: "map-science", title: "مبادئ علم الخرائط", subject: "علم الخرائط", subjectSlug: "map-science", kind: "كتاب مدرسي", tracks: ["literary"], sourceUrl: drive("18zqIDpX1hN6MdjfaL6gpeGM3Hw-bzsRT") },
];

const trackNames: Record<Track, string> = {
  scientific: "القسم العلمي",
  literary: "القسم الأدبي",
};

export default function Grade12BooksPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const visibleBooks = useMemo(() => books.filter((book) => {
    const matchesTrack =
      filter === "all" ||
      (filter === "shared" ? book.tracks.length === 2 : book.tracks.includes(filter));
    const searchText = (book.title + " " + book.subject + " " + book.kind).toLocaleLowerCase("ar");
    return matchesTrack && (!query.trim() || searchText.includes(query.trim().toLocaleLowerCase("ar")));
  }), [filter, query]);

  const filterOptions: { value: Filter; label: string; count: number }[] = [
    { value: "all", label: "كل الكتب", count: books.length },
    { value: "scientific", label: "العلمي", count: books.filter((book) => book.tracks.includes("scientific")).length },
    { value: "literary", label: "الأدبي", count: books.filter((book) => book.tracks.includes("literary")).length },
    { value: "shared", label: "المواد المشتركة", count: books.filter((book) => book.tracks.length === 2).length },
  ];

  return <main className="container page g12-books-page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><span>›</span><Link to="/grade/grade-12">الصف الثالث الثانوي</Link><span>›</span><b>مكتبة الكتب</b></div>
    <header className="g12-books-heading">
      <div><span className="eyebrow">مكتبة الصف الثالث الثانوي</span><h1>كتب العلمي والأدبي في مكان واحد.</h1><p>فهرس 25 ملفاً للكتب المدرسية والأنشطة والتمارين، منظّم حسب المسار والمادة، مع الانتقال إلى صفحة الدراسة داخل Yemen Study.</p></div>
      <div className="g12-books-total"><b>{books.length}</b><span>ملفاً مفهرساً</span></div>
    </header>

    <section className="g12-books-notice">
      <ShieldCheck size={19}/>
      <div><b>تنبيه بشأن الطبعة</b><p>روابط الملفات مأخوذة من فهرس مكتب وزارة التربية والتعليم بمحافظة حضرموت. الفهرس إقليمي ولا يذكر سنة طبعة كل ملف؛ لذلك لا نعرض هذه الروابط على أنها تأكيد لطبعة 1448هـ أو أنها مطابقة لكل مناطق اليمن. اختر نسخة مدرستك بعد التحقق من الغلاف والجهة التعليمية.</p></div>
    </section>

    <section className="g12-books-sourcebar">
      <div><b>النسخة الوزارية الأحدث</b><span>تحقق من فهرس الوزارة للعام 1448هـ / 2026–2027م عند توفر ملفات الصف الثالث الثانوي.</span></div>
      <a href="https://e-learning-moe.edu.ye/book.php" target="_blank" rel="noreferrer">بوابة الكتب الوزارية <ExternalLink size={15}/></a>
      <a href="https://tg.me/books_yemen_new/1316" target="_blank" rel="noreferrer">إعلان 1448هـ <ExternalLink size={15}/></a>
    </section>

    <div className="g12-books-toolbar">
      <div className="g12-books-filters" role="group" aria-label="تصفية الكتب حسب المسار">
        {filterOptions.map((option) => <button type="button" key={option.value} className={filter === option.value ? "active" : ""} onClick={() => setFilter(option.value)}>{option.label}<small>{option.count}</small></button>)}
      </div>
      <label className="g12-books-search"><Search size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث باسم الكتاب أو المادة" aria-label="ابحث في كتب الصف الثالث الثانوي"/></label>
    </div>

    <div className="g12-books-grid">
      {visibleBooks.map((book) => {
        const routeTrack: Track = filter === "literary" && book.tracks.includes("literary") ? "literary" : book.tracks.includes("scientific") ? "scientific" : "literary";
        const subjectPath = "/subject/grade-12/" + routeTrack + "/" + book.subjectSlug;
        return <article className="g12-book-card" key={book.id}>
          <div className="g12-book-card-top"><span className="g12-book-kind">{book.kind}</span><span className="g12-book-track">{book.tracks.length === 2 ? "مشترك" : trackNames[book.tracks[0]]}</span></div>
          <div className="g12-book-icon"><BookOpen size={21}/></div>
          <h2>{book.title}</h2>
          <p>{book.subject} · {book.tracks.map((track) => trackNames[track]).join(" / ")}</p>
          <div className="g12-book-card-actions">
            <Link to={subjectPath}>صفحة المادة داخل الموقع <ArrowLeft size={15}/></Link>
            <a href={book.sourceUrl} target="_blank" rel="noreferrer">فتح ملف الكتاب لدى المصدر <ExternalLink size={15}/></a>
          </div>
        </article>;
      })}
      {visibleBooks.length === 0 && <div className="g12-books-empty"><Search size={23}/><b>لا توجد نتائج مطابقة</b><span>غيّر عبارة البحث أو اختر مساراً آخر.</span></div>}
    </div>

    <section className="g12-books-bottom">
      <div><span className="eyebrow">محتوى الدراسة</span><h2>الكتاب مرجع، والتعلّم هنا.</h2><p>تُكتب شروحات الدروس والملخصات والأسئلة داخل Yemen Study بصياغة أصلية بعد فحص الكتاب المعتمد. فهرسة الملف لا تعني أن جميع دروسه قد تحولت بعد إلى وحدات تفاعلية.</p></div>
      <Link className="btn btn-primary" to="/curriculum">عرض مواد الصفوف <ArrowLeft size={16}/></Link>
    </section>

    <footer className="g12-books-provenance">
      <b>مصادر الفهرسة</b>
      <a href="https://meoh.gov.ye/services/subjects/" target="_blank" rel="noreferrer">مكتب وزارة التربية والتعليم بمحافظة حضرموت — فهرس المقررات <ExternalLink size={13}/></a>
      <a href="https://e-najah.net/CuLrTHS/" target="_blank" rel="noreferrer">مكتبة نجاح التعليمية — فهرس مساعد للصف الثالث الثانوي <ExternalLink size={13}/></a>
      <a href="https://yembooks.com/books/stage-secondary/sec-3" target="_blank" rel="noreferrer">بوابة المنهج اليمني المدرسي — فهرس 2026 المستقل <ExternalLink size={13}/></a>
      <small>لا تستضيف Yemen Study ملفات PDF المدرسية على مستودعها؛ تظل الملفات عند الجهة التي نشرتها، احتراماً لحقوق أصحابها.</small>
    </footer>
  </main>;
}
