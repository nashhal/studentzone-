import { lazy, Suspense, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity, ArrowLeft, Award, Bookmark, BookOpen, BookOpenCheck,
  CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft,
  CircleHelp, ClipboardCheck, ClipboardList, Clock3, FileCheck2, FileText,
  GraduationCap, Layers3, ListChecks, LogOut, Menu, Play, RotateCcw,
  Search, ShieldCheck, Sparkles, Target, Timer, Trophy, X, Zap
} from "lucide-react";
import { Link, NavLink, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "./lib/auth";
import { StudyToolLayout } from "./StudyToolLayout";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import { countAllSubjectEntries, findSubjects, getGrade, getSubjectCount, grades, type GradeEntry } from "./data/catalog";
import { demoLesson } from "./data/learning";
const TargetTestPage = lazy(() => import("./StudyTools").then(({ TargetTestPage }) => ({ default: TargetTestPage })));
const StrengthsWeaknessesPage = lazy(() => import("./StudyTools").then(({ StrengthsWeaknessesPage }) => ({ default: StrengthsWeaknessesPage })));
const GuidedStudyPage = lazy(() => import("./StudyTools").then(({ GuidedStudyPage }) => ({ default: GuidedStudyPage })));
const GuidedPracticePage = lazy(() => import("./StudyTools").then(({ GuidedPracticePage }) => ({ default: GuidedPracticePage })));
const SmartMarkPage = lazy(() => import("./StudyTools").then(({ SmartMarkPage }) => ({ default: SmartMarkPage })));
const TestBuilderPage = lazy(() => import("./StudyTools").then(({ TestBuilderPage }) => ({ default: TestBuilderPage })));
import "./study-tools.css";
import "./lesson-buttons.css";
const Grade12PhysicsStudyPage = lazy(() => import("./Grade12Study").then(({ default: Page }) => ({ default: Page })));
const Grade12BooksPage = lazy(() => import("./Grade12Books").then(({ default: Page }) => ({ default: Page })));
const Grade12LearningHubPage = lazy(() => import("./Grade12LearningHub").then(({ default: Page }) => ({ default: Page })));
const AcademyCouncilPage = lazy(() => import("./AcademyCouncil").then(({ default: Page }) => ({ default: Page })));

type Progress = { completed: string[]; saved: string[]; quizScores: number[] };
type AttemptSummary = { id?: string; createdAt?: string; score: number; total: number; source?: string };
const readAttemptSummaries = (): AttemptSummary[] => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem("yemen-study-attempts-v1") || "[]");
    if (!Array.isArray(value)) return [];
    return (value as AttemptSummary[]).filter((item) => Number.isFinite(item.score) && Number.isFinite(item.total) && item.total > 0);
  } catch { return []; }
};
const PROGRESS_KEY = "yemen-study-progress-v1";
const readProgress = (): Progress => {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { completed: [], saved: [], quizScores: [] };
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      saved: Array.isArray(parsed.saved) ? parsed.saved : [],
      quizScores: Array.isArray(parsed.quizScores) ? parsed.quizScores : [],
    };
  } catch {
    return { completed: [], saved: [], quizScores: [] };
  }
};

function useStudyProgress() {
  const [progress, setProgress] = useState<Progress>(readProgress);
  useEffect(() => {
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch { /* storage can be disabled */ }
  }, [progress]);
  const complete = (id: string) => setProgress((old) => ({
    ...old, completed: old.completed.includes(id) ? old.completed : [...old.completed, id],
  }));
  const toggleSaved = (id: string) => setProgress((old) => ({
    ...old, saved: old.saved.includes(id) ? old.saved.filter((item) => item !== id) : [...old.saved, id],
  }));
  const addScore = (score: number) => setProgress((old) => ({ ...old, quizScores: [...old.quizScores, score] }));
  return { progress, complete, toggleSaved, addScore };
}


function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? "brand-mark ys-brand-mark is-compact" : "brand-mark ys-brand-mark"} aria-hidden="true">
      <svg viewBox="0 0 48 48" focusable="false">
        <path d="M6.5 14.8c6.6-2.9 12.4-2.3 17.5 1.4v23.1c-5.1-3.4-10.9-4-17.5-1.5z" fill="#F8FBFF"/>
        <path d="M41.5 14.8C34.9 11.9 29.1 12.5 24 16.2v23.1c5.1-3.4 10.9-4 17.5-1.5z" fill="#D9E8F8"/>
        <path d="M24 16.3v22.8" fill="none" stroke="#6FD0C1" strokeWidth="1.7" strokeLinecap="round"/>
        <path d="M11.2 22.4c3.2-.9 6.1-.6 9.1.8M11.2 28.3c3.2-.9 6.1-.6 9.1.8M36.8 22.4c-3.2-.9-6.1-.6-9.1.8M36.8 28.3c-3.2-.9-6.1-.6-9.1.8" fill="none" stroke="#7899B6" strokeWidth="1.55" strokeLinecap="round"/>
        <path d="m25.7 31.5 5.1-5.2 4.1 2.1 6.2-8.1" fill="none" stroke="#2DAA98" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="m37.8 20.4 3.3-.3-.2 3.5" fill="none" stroke="#2DAA98" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="10.2" cy="11" r="2" fill="#DAB46A"/>
      </svg>
    </span>
  );
}

const studyBackgroundPhotos = [
  "https://images.pexels.com/photos/37816454/pexels-photo-37816454.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/6333739/pexels-photo-6333739.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/18471485/pexels-photo-18471485.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/18471523/pexels-photo-18471523.jpeg?auto=compress&cs=tinysrgb&w=1600",
];

function SitePhotoBackground() {
  const [activePhoto, setActivePhoto] = useState(0);
  const [previousPhoto, setPreviousPhoto] = useState<number | null>(null);
  const activePhotoRef = useRef(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const interval = window.setInterval(() => {
      const nextPhoto = (activePhotoRef.current + 1) % studyBackgroundPhotos.length;
      setPreviousPhoto(activePhotoRef.current);
      activePhotoRef.current = nextPhoto;
      setActivePhoto(nextPhoto);
    }, 9000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const nextPhoto = (activePhoto + 1) % studyBackgroundPhotos.length;
    const preload = new window.Image();
    preload.src = studyBackgroundPhotos[nextPhoto];
  }, [activePhoto]);

  return (
    <div className="ys-photo-background" aria-hidden="true">
      {previousPhoto !== null && (
        <div
          key={`previous-${previousPhoto}`}
          className="ys-photo-background-layer is-previous"
          style={{ backgroundImage: `url("${studyBackgroundPhotos[previousPhoto]}")` }}
        />
      )}
      <div
        key={`active-${activePhoto}`}
        className="ys-photo-background-layer is-active"
        style={{ backgroundImage: `url("${studyBackgroundPhotos[activePhoto]}")` }}
      />
      <div className="ys-photo-background-wash" />
    </div>
  );
}

function Header() {
  const { user, role, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const navigate = useNavigate();
  const logout = async () => { await signOut(); navigate("/"); setMenuOpen(false); };
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setToolsOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);
  return <header className="site-header ys-site-header sme-site-header">
    <div className="container header-inner">
      <div className="header-brand-group">
        <Link to="/" className="brand" aria-label="Yemen Study">
          <BrandMark/>
          <span className="brand-copy"><b>Yemen Study</b><small>تعلّم. تدرّب. أتقن.</small></span>
        </Link>
        <button className="mobile-menu" type="button" aria-controls="primary-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}>{menuOpen ? <X/> : <Menu/>}</button>
      </div>
      <nav id="primary-navigation" className={menuOpen ? "main-nav open" : "main-nav"}>
        <Link className="header-start-link" to="/curriculum" onClick={() => setMenuOpen(false)}>ابدأ الدراسة <ChevronDown size={17}/></Link>
        <div className={toolsOpen ? "nav-dropdown open" : "nav-dropdown"}>
          <button type="button" className="nav-dropdown-trigger" aria-expanded={toolsOpen} onClick={() => setToolsOpen((open) => !open)}>أدوات الدراسة <ChevronDown size={17}/></button>
          {toolsOpen && <div className="nav-dropdown-panel">
            <Link to="/target-test" onClick={() => { setToolsOpen(false); setMenuOpen(false); }}><ClipboardCheck size={17}/> الاختبار المستهدف</Link>
            <Link to="/strengths-weaknesses" onClick={() => { setToolsOpen(false); setMenuOpen(false); }}><Activity size={17}/> نقاط القوة والضعف</Link>
            <Link to="/guided-study" onClick={() => { setToolsOpen(false); setMenuOpen(false); }}><BookOpenCheck size={17}/> الدراسة الموجّهة</Link>
            <Link to="/guided-practice" onClick={() => { setToolsOpen(false); setMenuOpen(false); }}><ListChecks size={17}/> التدريب الموجّه</Link>
            <Link to="/smart-mark" onClick={() => { setToolsOpen(false); setMenuOpen(false); }}><FileCheck2 size={17}/> مراجع الإجابة</Link>
            <Link to="/teacher/test-builder" onClick={() => { setToolsOpen(false); setMenuOpen(false); }}><ClipboardList size={17}/> محرر الاختبارات للمعلمين</Link>
          </div>}
        </div>
        <NavLink to="/past-papers" onClick={() => setMenuOpen(false)}>أوراق الامتحانات</NavLink>
        <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>لوحة الطالب</NavLink>
        {(role === "admin" || role === "editor") && <NavLink to="/admin" onClick={() => setMenuOpen(false)}>إدارة المحتوى</NavLink>}
        {(!isSupabaseConfigured || role === "admin" || role === "editor") && <NavLink to="/academy-council" onClick={() => setMenuOpen(false)}>مجلس البوتات الأكاديمي</NavLink>}
      </nav>
      <div className="header-search-wrap"><SearchBox header/></div>
      <div className="header-actions">
        {user ? <button className="nav-account" onClick={logout}><LogOut size={16}/> خروج</button> : <Link className="header-dashboard" to="/login">تسجيل الدخول</Link>}
        <Link className="header-upgrade" to="/curriculum">اختَر صفك</Link>
      </div>
    </div>
  </header>;
}

function SearchBox({ large = false, header = false }: { large?: boolean; header?: boolean }) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => findSubjects(query).slice(0, 6), [query]);
  const navigate = useNavigate();
  return <div className={header ? "search-box header-search-box" : large ? "search-box search-box-large" : "search-box"}>
    <Search size={19}/>
    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={header ? "ابحث عن مادة أو درس" : "ابحث عن الصف أو المادة الدراسية..."} aria-label="ابحث في المنهج"/>
    {query && <button className="search-clear" onClick={() => setQuery("")} aria-label="مسح"><X size={15}/></button>}
    <button className="search-action" aria-label="ابحث" onClick={() => navigate("/curriculum?q=" + encodeURIComponent(query))}>{header ? <Search size={19}/> : <>ابحث <ArrowLeft size={15}/></>}</button>
    {query.trim().length > 0 && matches.length > 0 && <div className="search-results">{matches.map(({ grade, track, subject }) =>
      <Link key={grade.slug + track.slug + subject.slug} to={"/subject/" + grade.slug + "/" + track.slug + "/" + subject.slug}>
        <span>{subject.name}</span><small>{grade.name} · {track.name}</small><ChevronLeft size={15}/>
      </Link>)}</div>}
  </div>;
}


type EducationStageId = "primary" | "basic" | "secondary";
type EducationStageConfig = {
  id: EducationStageId;
  title: string;
  description: string;
  range: string;
  from: number;
  to: number;
  icon: typeof BookOpen;
};

const educationStages: EducationStageConfig[] = [
  {
    id: "primary",
    title: "المرحلة الابتدائية",
    description: "بناء مهارات القراءة والكتابة والحساب والمعرفة الأساسية.",
    range: "من الصف الأول إلى الصف السادس",
    from: 1,
    to: 6,
    icon: BookOpenCheck,
  },
  {
    id: "basic",
    title: "المرحلة الأساسية",
    description: "توسيع المعارف والمهارات والاستعداد للمرحلة الثانوية.",
    range: "من الصف السابع إلى الصف التاسع",
    from: 7,
    to: 9,
    icon: Layers3,
  },
  {
    id: "secondary",
    title: "المرحلة الثانوية",
    description: "المقررات الثانوية والمسارات العلمية والأدبية.",
    range: "من الأول الثانوي إلى الثالث الثانوي",
    from: 10,
    to: 12,
    icon: GraduationCap,
  },
];

function getEducationStage(grade: GradeEntry): EducationStageId {
  if (grade.number <= 6) return "primary";
  if (grade.number <= 9) return "basic";
  return "secondary";
}

function getEducationStageLabel(grade: GradeEntry): string {
  const stage = educationStages.find((item) => item.id === getEducationStage(grade));
  return stage?.title || "المرحلة الدراسية";
}

function EducationStageCard({ stage }: { stage: EducationStageConfig }) {
  const Icon = stage.icon;
  const gradeCount = grades.filter((grade) => grade.number >= stage.from && grade.number <= stage.to).length;
  return (
    <Link className="ys-stage-card" to={"/curriculum?stage=" + stage.id}>
      <span className="ys-stage-icon"><Icon size={25}/></span>
      <span className="ys-stage-index">{String(educationStages.findIndex((item) => item.id === stage.id) + 1).padStart(2, "0")}</span>
      <span className="ys-stage-card-copy">
        <b>{stage.title}</b>
        <small>{stage.description}</small>
        <span className="ys-stage-range">{stage.range} · {gradeCount} صفوف</span>
      </span>
      <span className="ys-stage-arrow"><ChevronLeft size={19}/></span>
    </Link>
  );
}

function GradeCard({ grade }: { grade: GradeEntry }) {
  return <Link className="grade-card" to={"/grade/" + grade.slug}>
    <span className="grade-card-num">{String(grade.number).padStart(2, "0")}</span>
    <span className="grade-card-copy"><b>{grade.name}</b><small>{getEducationStageLabel(grade)} · {getSubjectCount(grade)} مواد/مسارات</small></span>
    <ChevronLeft className="grade-card-arrow" size={17}/>
  </Link>;
}

function ToolCard({ icon: Icon, title, description, to, tag }: { icon: typeof BookOpen; title: string; description: string; to: string; tag?: string }) {
  return <Link className="tool-card ys-tool-card" to={to}>
    <span className="ys-tool-number" aria-hidden="true"/>
    <span className="tool-icon"><Icon size={21}/></span>
    <span className="ys-tool-copy">
      {tag && <small className="ys-tool-tag">{tag}</small>}
      <h3>{title}</h3>
      <p>{description}</p>
    </span>
    <span className="ys-tool-arrow" aria-hidden="true"><ArrowLeft size={17}/></span>
  </Link>;
}

function HomePage({ progress }: { progress: Progress }) {
  const registeredQuizCount = readAttemptSummaries().length + progress.quizScores.length;
  const demoGrade = getGrade("grade-12");
  const demoTrack = demoGrade?.tracks.find((item) => item.slug === "scientific");
  const demoPhysics = demoTrack?.subjects.find((item) => item.slug === "physics");

  return <main className="ys-home-page sme-home-page">
    <section className="ys-hero sme-hero">
      <div className="container ys-hero-grid sme-hero-inner">
        <div className="ys-hero-copy">
          <span className="ys-eyebrow"><span/> منصة المراجعة للمناهج اليمنية</span>
          <h1>كل ما تحتاجه للمراجعة،<br/><em>في مكان واحد.</em></h1>
          <p>ملاحظات دراسية منظمة، وشرح واضح، وأسئلة حسب الموضوع، واختبارات تساعدك على قياس فهمك. اختر مرحلتك وصفك لتبدأ المراجعة وفق منهجك.</p>
          <div className="sme-hero-search"><SearchBox large/></div>
          <div className="ys-hero-actions">
            <Link className="btn btn-primary" to="/curriculum">تصفّح المنهج <ArrowLeft size={17}/></Link>
            <Link className="btn btn-outline" to="/study-plan">خطة المذاكرة</Link>
          </div>
          <div className="ys-hero-assurance"><ShieldCheck size={16}/> موارد المراجعة والتنقل بين الدروس داخل المنصة.</div>
        </div>
      </div>
    </section>

    <section className="container ys-learning-overview" aria-labelledby="ys-learning-overview-title">
      <div className="ys-learning-overview-intro">
        <span className="eyebrow">مساحة تعلّمك</span>
        <h2 id="ys-learning-overview-title">خطوتك التالية تبدأ من هنا.</h2>
        <p>ملخص نشاطك المسجّل على هذا الجهاز، مع اختصارات مباشرة لمتابعة الدراسة.</p>
        <Link className="ys-overview-link" to="/dashboard">افتح لوحة الطالب <ArrowLeft size={16}/></Link>
      </div>
      <div className="ys-learning-overview-content">
        <div className="ys-learning-overview-stats">
          <article className="ys-learning-stat">
            <span className="ys-learning-stat-icon is-blue"><BookOpenCheck size={19}/></span>
            <b>{progress.completed.length}</b>
            <small>دروس مكتملة</small>
          </article>
          <article className="ys-learning-stat">
            <span className="ys-learning-stat-icon is-teal"><Bookmark size={19}/></span>
            <b>{progress.saved.length}</b>
            <small>دروس محفوظة</small>
          </article>
          <article className="ys-learning-stat">
            <span className="ys-learning-stat-icon is-amber"><Trophy size={19}/></span>
            <b>{registeredQuizCount}</b>
            <small>نتائج اختبارات</small>
          </article>
        </div>
        <div className="ys-learning-shortcuts" aria-label="اختصارات الدراسة">
          <Link to="/curriculum"><span className="ys-shortcut-number">01</span><span><b>اختر صفك</b><small>تصفّح المراحل والمواد</small></span><ChevronLeft size={17}/></Link>
          <Link to="/study-plan"><span className="ys-shortcut-number">02</span><span><b>نظّم مذاكرتك</b><small>افتح خطة الدراسة</small></span><ChevronLeft size={17}/></Link>
          <Link to="/target-test"><span className="ys-shortcut-number">03</span><span><b>اختبر فهمك</b><small>ابدأ اختباراً مستهدفاً</small></span><ChevronLeft size={17}/></Link>
        </div>
        <p className="ys-learning-local-note"><ShieldCheck size={14}/> هذه المؤشرات محلية على جهازك في النسخة الحالية.</p>
      </div>
    </section>

    <section className="container ys-grade-section sme-stage-section">
      <div className="ys-section-heading">
        <div><span className="eyebrow">دليل الدراسة</span><h2>اختر مرحلتك الدراسية.</h2><p>انتقل من المرحلة إلى الصف، ثم اختر المسار والمادة والوحدة التي تريد مراجعتها.</p></div>
        <Link to="/curriculum" className="ys-inline-link">جميع الصفوف <ArrowLeft size={16}/></Link>
      </div>
      <div className="ys-stage-grid">{educationStages.map((stage) => <EducationStageCard key={stage.id} stage={stage}/>)}</div>
    </section>

    <section className="container sme-method-section">
      <div className="ys-section-heading">
        <div><span className="eyebrow">طريقة المراجعة</span><h2>تعلّم، اختبر، ثم حسّن مستواك.</h2><p>تجربة واحدة تربط بين الشرح والتدريب ومعرفة ما يحتاج إلى مراجعة.</p></div>
      </div>
      <div className="sme-how-grid">
        <article className="sme-how-card">
          <span className="sme-how-card-number">01</span>
          <div><h3>افهم الدرس</h3><p>اقرأ الملاحظات والأمثلة والرسوم التوضيحية المرتبطة بموضوعك.</p></div>
        </article>
        <article className="sme-how-card">
          <span className="sme-how-card-number">02</span>
          <div><h3>اختبر نفسك</h3><p>حل الأسئلة حسب الموضوع ومستوى الصعوبة، ثم راجع التفسير.</p></div>
        </article>
        <article className="sme-how-card">
          <span className="sme-how-card-number">03</span>
          <div><h3>تابع تقدّمك</h3><p>احفظ الدروس وسجّل نتائجك وحدد الموضوعات التي تريد تقويتها.</p></div>
        </article>
      </div>
    </section>

    <section className="ys-tools-band">
      <div className="container ys-tools-layout">
        <div className="ys-tools-intro">
          <div><span className="eyebrow">أدوات الدراسة</span><h2>كل أدوات المراجعة في مكان واحد.</h2></div>
          <p>انتقل مباشرة إلى نوع المساعدة التي تحتاجها الآن، دون مغادرة المنصة.</p>
          <Link to="/curriculum" className="ys-inline-link">تصفّح جميع الصفوف <ArrowLeft size={16}/></Link>
          <div className="ys-tools-total"><b>11</b><span>أداة للدراسة<br/>والمراجعة</span></div>
        </div>
        <div className="ys-tool-list">
          <ToolCard icon={BookOpenCheck} title="ملاحظات المراجعة" description="شروحات منظمة، مفاهيم أساسية، قوانين وأمثلة محلولة." to="/curriculum" tag="افهم"/>
          <ToolCard icon={ClipboardList} title="أسئلة حسب الموضوع" description="تدرّب على أسئلة متدرجة وافهم سبب صحة الإجابة." to="/curriculum" tag="تدرّب"/>
          <ToolCard icon={Layers3} title="البطاقات التعليمية" description="راجع التعاريف والمفاهيم في جلسات قصيرة." to="/subject/grade-12/scientific/physics" tag="تذكّر"/>
          <ToolCard icon={ClipboardCheck} title="الاختبارات التجريبية" description="اختبر فهمك وتعرّف على الموضوعات التي تحتاج مراجعة." to="/mock-exam" tag="اختبر"/>
          <ToolCard icon={FileText} title="أوراق الامتحانات" description="نماذج وأوراق تدريبية ضمن مكتبة المنصة." to="/past-papers" tag="استعد"/>
          <ToolCard icon={CalendarDays} title="خطة المذاكرة" description="قسّم وقتك إلى مهام وتابع ما أنجزته." to="/study-plan" tag="نظّم"/>
          <ToolCard icon={Target} title="الاختبار المستهدف" description="اختر موضوعاً ومستوى صعوبة محدداً." to="/target-test" tag="ركّز"/>
          <ToolCard icon={Activity} title="نقاط القوة والضعف" description="راجع أداءك وحدد ما يحتاج إلى تدريب إضافي." to="/strengths-weaknesses" tag="حلّل"/>
          <ToolCard icon={BookOpenCheck} title="الدراسة الموجّهة" description="تعلّم الموضوع خطوة بخطوة مع تلميحات." to="/guided-study" tag="تعلّم"/>
          <ToolCard icon={ListChecks} title="التدريب الموجّه" description="حل سؤالاً في كل مرة وتابع تفسير الإجابة." to="/guided-practice" tag="طبّق"/>
          <ToolCard icon={FileCheck2} title="مراجع الإجابة" description="قارن إجابتك بعناصر التقييم الأساسية." to="/smart-mark" tag="راجع"/>
        </div>
      </div>
    </section>

    <section className="container ys-featured-section">
      <div className="ys-section-heading">
        <div><span className="eyebrow">نموذج من داخل المنصة</span><h2>استكشف تجربة المادة والدرس.</h2><p>تعرف على طريقة عرض فهرس المادة والملاحظات والأسئلة والبطاقات.</p></div>
      </div>
      <Link className="sme-featured-course" to={demoGrade && demoTrack && demoPhysics ? "/subject/" + demoGrade.slug + "/" + demoTrack.slug + "/" + demoPhysics.slug : "/curriculum"}>
        <span className="sme-featured-icon"><BookOpenCheck size={27}/></span>
        <span className="sme-featured-course-copy"><small>الثالث الثانوي العلمي · نموذج تفاعلي</small><b>الفيزياء — الكميات القياسية والمتجهة</b><p>افتح صفحة المادة لتجربة فهرس الوحدات والتنقل بين موارد المراجعة.</p></span>
        <span className="sme-featured-course-action">استكشف المادة <ArrowLeft size={16}/></span>
      </Link>
    </section>

    <section className="ys-bottom-cta">
      <div className="container"><span className="eyebrow">ابدأ من صفك</span><h2>اختر مادة واحدة، وابدأ بخطوة واضحة.</h2><p>المراجعة المنظمة تبدأ من مكان تعرف كيف تعود إليه.</p><Link className="btn btn-light" to="/curriculum">اختر صفك <ArrowLeft size={17}/></Link></div>
    </section>
  </main>;
}

function CurriculumPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedStage = searchParams.get("stage");
  const stage = educationStages.some((item) => item.id === requestedStage)
    ? requestedStage as EducationStageId
    : null;
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const activeStage = educationStages.find((item) => item.id === stage) || null;
  const filtered = grades.filter((grade) =>
    (!stage || getEducationStage(grade) === stage) &&
    (!query.trim() || grade.name.includes(query.trim()) || grade.tracks.some((track) => track.subjects.some((subject) => subject.name.includes(query.trim()))))
  );
  const showStageChooser = !stage && !query.trim();
  const returnToStages = () => setSearchParams(query.trim() ? { q: query.trim() } : {});

  return <main className="container page ys-curriculum-page sme-catalog-page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><b>المواد الدراسية</b></div>
    <div className="page-title-row">
      <div>
        <span className="eyebrow">فهرس المنهج</span>
        <h1>{activeStage ? activeStage.title : query.trim() ? "نتائج البحث في المنهج" : "اختر مرحلتك الدراسية."}</h1>
        <p>{activeStage ? activeStage.description + " اختر الصف للوصول إلى مواده ودروسه." : query.trim() ? "نتائج البحث في جميع المراحل الدراسية." : "اختر المرحلة أولاً، ثم تصفح الصفوف والمواد التابعة لها."}</p>
      </div>
      <div className="catalog-count"><b>{activeStage ? filtered.length : countAllSubjectEntries()}</b><span>{activeStage ? "صفوف في هذه المرحلة" : "مادة/مسار في الفهرس الأولي"}</span></div>
    </div>

    <div className="catalog-toolbar">
      <div className="ys-stage-toolbar">
        {stage ? <button className="filter-pill active" onClick={returnToStages}>المراحل الدراسية</button> : <span className="ys-stage-hint">التصنيف حسب المرحلة</span>}
        {activeStage && <span className="ys-stage-current">{activeStage.range}</span>}
      </div>
      <label className="inline-search"><Search size={16}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن الصف أو المادة"/></label>
    </div>

    {showStageChooser ? (
      <section className="ys-stage-grid ys-stage-grid-page" aria-label="المراحل الدراسية">
        {educationStages.map((item) => <EducationStageCard key={item.id} stage={item}/>)}
      </section>
    ) : (
      <>
        {!stage && query.trim() && <div className="ys-search-results-note">يتم البحث في الصفوف والمواد عبر المراحل الثلاث.</div>}
        <div className="grades-grid curriculum-grid">{filtered.map((grade) => <GradeCard key={grade.slug} grade={grade}/>)}</div>
        {filtered.length === 0 && <div className="empty-panel"><Search/><h3>لا توجد نتائج</h3><p>جرّب كلمة بحث أخرى.</p></div>}
      </>
    )}
    <p className="data-note"><ShieldCheck size={15}/> فهرس أولي للصفوف والمواد. يجب تأكيد المنطقة الدراسية والطبعة قبل نشر الدروس بوصفها معتمدة.</p>
  </main>;
}
function GradePage() {
  const { gradeSlug = "" } = useParams();
  const grade = getGrade(gradeSlug);
  const [trackSlug, setTrackSlug] = useState(grade?.tracks[0]?.slug || "general");
  if (!grade) return <NotFound/>;
  const track = grade.tracks.find((item) => item.slug === trackSlug) || grade.tracks[0];
  return <main className="container page ys-grade-page sme-grade-page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><Link to="/curriculum">المواد</Link><ChevronLeft size={14}/><b>{grade.name}</b></div>
    <div className="page-title-row"><div><span className="eyebrow">{getEducationStageLabel(grade)}</span><h1>{grade.name}</h1><p>{grade.description}</p></div><div className="catalog-count"><b>{getSubjectCount(grade)}</b><span>مادة / مسار</span></div></div>
    {grade.slug === "grade-12" && <div className="subject-list-heading"><span>مكتبة الكتب ومركز الشرح والاختبارات — منهج عدن</span><div className="g12-grade-actions"><Link className="btn btn-outline" to="/grade-12-books"><BookOpen size={16}/> مكتبة الكتب</Link><Link className="btn btn-primary" to="/grade-12-learning"><BookOpenCheck size={16}/> الشرح والاختبارات <ArrowLeft size={15}/></Link></div></div>}
    {grade.tracks.length > 1 && <div className="filter-pills track-pills">{grade.tracks.map((item) => <button key={item.slug} className={track.slug === item.slug ? "filter-pill active" : "filter-pill"} onClick={() => setTrackSlug(item.slug)}>{item.name}</button>)}</div>}
    <div className="subject-list-heading"><h2>المواد الدراسية</h2><span>{track.name}</span></div>
    <div className="subject-grid">{track.subjects.map((subject, index) => <Link className="subject-tile" key={subject.slug} to={"/subject/" + grade.slug + "/" + track.slug + "/" + subject.slug}>
      <span className="subject-number">{String(index + 1).padStart(2, "0")}</span><div><h3>{subject.name}</h3><p className="subject-tile-status">{grade.slug === "grade-12" && track.slug === "scientific" && subject.slug === "physics" ? "شرح تجريبي لموضوع واحد متاح" : "صفحة المادة متاحة · إعداد الدروس مستمر"}</p></div><ChevronLeft size={18}/>
    </Link>)}</div>
  </main>;
}

type StudyTab = "notes" | "questions" | "flashcards" | "exams" | "papers";
const tabs: { id: StudyTab; label: string; icon: typeof BookOpen }[] = [
  { id: "notes", label: "ملاحظات المراجعة", icon: BookOpen },
  { id: "questions", label: "أسئلة حسب الموضوع", icon: Target },
  { id: "flashcards", label: "بطاقات تعليمية", icon: Layers3 },
  { id: "exams", label: "اختبارات تجريبية", icon: Timer },
  { id: "papers", label: "أوراق الامتحانات", icon: FileText },
];

type PublishedLessonSummary = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  estimated_minutes: number;
  unit_id: string;
};
type PublishedUnit = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  lessons: PublishedLessonSummary[];
};

const grade12LearningSubjectMap: Record<string, string> = {
  biology: "biology",
  english: "english",
  faith: "faith",
  history: "history",
  geography: "geography",
  "hadith-fiqh": "hadith-fiqh",
  "mathematics-scientific": "mathematics",
  "mathematics-literary": "mathematics-literary-statistics",
  "prophetic-biography": "seerah",
  quran: "quran",
  physics: "physics",
  chemistry: "chemistry",
  reading: "reading",
  grammar: "grammar",
  texts: "literature",
  philosophy: "philosophy",
  logic: "logic",
  psychology: "psychology",
  "map-science": "map-science",
};

function SubjectPage({ progress }: { progress: Progress }) {
  const { gradeSlug = "", trackSlug = "", subjectSlug = "" } = useParams();
  const grade = getGrade(gradeSlug);
  const track = grade?.tracks.find((item) => item.slug === trackSlug);
  const subject = track?.subjects.find((item) => item.slug === subjectSlug);
  const [activeTab, setActiveTab] = useState<StudyTab>("notes");
  const [expanded, setExpanded] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [publishedUnits, setPublishedUnits] = useState<PublishedUnit[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState("");
  const isGrade12 = gradeSlug === "grade-12";
  const grade12LearningModuleSlug = grade12LearningSubjectMap[subjectSlug];
  const grade12LearningHref = grade12LearningModuleSlug
    ? `/grade-12-learning?subject=${encodeURIComponent(grade12LearningModuleSlug)}`
    : "/grade-12-learning";

  useEffect(() => {
    let active = true;
    const loadPublishedContent = async () => {
      if (isGrade12) {
        // Grade 12 lessons are maintained in the in-site learning hub, not in the optional Supabase library.
        setPublishedUnits([]);
        setContentError("");
        setContentLoading(false);
        return;
      }
      if (!supabase) {
        setPublishedUnits([]);
        setContentError("لم تُنشر دروس هذه المادة بعد. ستظهر الشروحات والأمثلة والأسئلة والأنشطة كاملة داخل الموقع بعد التحقق منها، ولن نعتمد على روابط خارجية بديلاً عن الدرس.");
        setContentLoading(false);
        return;
      }
      setContentLoading(true);
      setContentError("");
      try {
        const [subjectResult, gradeResult, trackResult] = await Promise.all([
          supabase.from("subjects").select("id").eq("slug", subjectSlug).maybeSingle(),
          supabase.from("grades").select("id").eq("slug", gradeSlug).maybeSingle(),
          supabase.from("tracks").select("id").eq("slug", trackSlug).maybeSingle(),
        ]);
        const firstError = [subjectResult, gradeResult, trackResult].find((item) => item.error);
        if (firstError?.error) throw firstError.error;
        if (!subjectResult.data || !gradeResult.data || !trackResult.data) {
          if (active) setPublishedUnits([]);
          return;
        }
        const gradeTrackResult = await supabase.from("grade_tracks").select("id")
          .eq("grade_id", gradeResult.data.id).eq("track_id", trackResult.data.id).maybeSingle();
        if (gradeTrackResult.error) throw gradeTrackResult.error;
        if (!gradeTrackResult.data) {
          if (active) setPublishedUnits([]);
          return;
        }
        const curriculumResult = await supabase.from("curriculum_subjects").select("id")
          .eq("grade_track_id", gradeTrackResult.data.id)
          .eq("subject_id", subjectResult.data.id).eq("is_active", true).maybeSingle();
        if (curriculumResult.error) throw curriculumResult.error;
        if (!curriculumResult.data) {
          if (active) setPublishedUnits([]);
          return;
        }
        const unitsResult = await supabase.from("units")
          .select("id,title,slug,description")
          .eq("curriculum_subject_id", curriculumResult.data.id)
          .eq("status", "published").order("sort_order");
        if (unitsResult.error) throw unitsResult.error;
        const unitRows = unitsResult.data ?? [];
        const lessonRows = unitRows.length
          ? await supabase.from("lessons")
              .select("id,title,slug,summary,estimated_minutes,unit_id")
              .in("unit_id", unitRows.map((unit) => unit.id))
              .eq("status", "published").order("sort_order")
          : { data: [], error: null };
        if (lessonRows.error) throw lessonRows.error;
        const lessonsByUnit = new Map<string, PublishedLessonSummary[]>();
        for (const lesson of lessonRows.data ?? []) {
          const current = lessonsByUnit.get(lesson.unit_id) ?? [];
          current.push(lesson as PublishedLessonSummary);
          lessonsByUnit.set(lesson.unit_id, current);
        }
        const mapped = unitRows
          .map((unit) => ({ ...unit, lessons: lessonsByUnit.get(unit.id) ?? [] }))
          .filter((unit) => unit.lessons.length > 0) as PublishedUnit[];
        if (active) setPublishedUnits(mapped);
      } catch (error) {
        if (active) setContentError(error instanceof Error ? error.message : "تعذّر تحميل الدروس المنشورة.");
      } finally {
        if (active) setContentLoading(false);
      }
    };
    void loadPublishedContent();
    return () => { active = false; };
  }, [gradeSlug, trackSlug, subjectSlug, isGrade12]);

  if (!grade || !track || !subject) return <NotFound/>;
  const allPublishedLessons = publishedUnits.flatMap((unit) => unit.lessons);
  const completedPublishedCount = allPublishedLessons.filter((lesson) => progress.completed.includes(lesson.id)).length;
  const publishedProgress = allPublishedLessons.length ? Math.round(completedPublishedCount / allPublishedLessons.length * 100) : 0;

  return <main className="page subject-page ys-subject-page sme-subject-page">
    <div className={sidebarOpen ? "subject-layout" : "subject-layout sidebar-collapsed"}>
      {sidebarOpen && <aside className="course-sidebar">
        <div className="sidebar-hide-row">
          <button type="button" onClick={() => setSidebarOpen(false)}><ChevronLeft size={19}/> إخفاء القائمة</button>
        </div>
        <span className="sidebar-section-label">المقرر</span>
        <Link className="sidebar-course-picker" to={`/grade/${grade.slug}`}>
          <BookOpen size={21}/>
          <span><small>{grade.name} · {track.name}</small><b>{subject.name}</b></span>
          <ChevronDown size={17}/>
        </Link>
        <div className="sidebar-section-label">موارد المقرر</div>
        <button type="button" className={activeTab === "notes" ? "course-nav-item active" : "course-nav-item"} onClick={() => setActiveTab("notes")}><BookOpenCheck size={20}/><span>موارد المادة</span></button>
        <Link className="course-nav-item" to="/strengths-weaknesses"><Activity size={20}/><span>نقاط القوة والضعف</span></Link>
        <div className="sidebar-section-label">المراجعة</div>
        <button type="button" className={activeTab === "notes" ? "course-nav-item active" : "course-nav-item"} onClick={() => setActiveTab("notes")}><Bookmark size={20}/><span>ملاحظات المراجعة</span></button>
        <button type="button" className={activeTab === "flashcards" ? "course-nav-item active" : "course-nav-item"} onClick={() => setActiveTab("flashcards")}><Layers3 size={20}/><span>البطاقات التعليمية</span></button>
        <div className="sidebar-section-label">الاختبارات والتدريب</div>
        <button type="button" className={activeTab === "questions" ? "course-nav-item active" : "course-nav-item"} onClick={() => setActiveTab("questions")}><ClipboardList size={20}/><span>أسئلة الامتحان</span></button>
        <Link className="course-nav-item" to="/target-test"><Target size={20}/><span>الاختبار المستهدف</span></Link>
        <button type="button" className={activeTab === "papers" ? "course-nav-item active" : "course-nav-item"} onClick={() => setActiveTab("papers")}><FileText size={20}/><span>أوراق الامتحانات</span></button>
        <Link className="course-nav-item" to="/mock-exam"><Timer size={20}/><span>الاختبارات التجريبية</span></Link>
        <div className="sidebar-course-outline">
          <div className="sidebar-title"><span>فهرس المادة</span><button onClick={() => setExpanded(!expanded)} aria-label="توسيع أو طي فهرس المادة"><ChevronDown className={expanded ? "" : "collapsed"} size={17}/></button></div>
          {expanded && <div className="sidebar-tree">
            {isGrade12 ? <>
              <div className="tree-unit"><span className="tree-unit-dot"/> مركز شرح ومراجعة الصف الثالث الثانوي</div>
              {grade12LearningModuleSlug ? <Link className="tree-lesson active" to={grade12LearningHref}><span className="tree-lesson-dot"/><span>شرح {subject.name} والاختبارات</span><span className="tree-lesson-open">فتح</span></Link> : <div className="tree-placeholder">هذا المقرر لم يُربط بمحور تعليمي بعد.</div>}
            </> : contentLoading ? <div className="tree-placeholder">جارٍ تحميل الوحدات...</div> : publishedUnits.length ? publishedUnits.map((unit) => <div key={unit.id}>
              <div className="tree-unit"><span className="tree-unit-dot"/> {unit.title}</div>
              {unit.lessons.map((lesson) => <Link className="tree-lesson" key={lesson.id} to={`/library-lesson/${lesson.id}`}><span className="tree-lesson-dot"/><span>{lesson.title}</span><span className="tree-lesson-open">فتح</span></Link>)}
            </div>) : <div className="tree-placeholder">لا توجد وحدات منشورة لهذه المادة بعد.</div>}
          </div>}
        </div>
      </aside>}
      <div className="subject-main-column">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><Link to={`/grade/${grade.slug}`}>{grade.name}</Link><ChevronLeft size={14}/><b>{subject.name}</b></div>
    <div className="course-heading"><div><span className="eyebrow">{grade.name} · {track.name}</span><h1>{subject.name}</h1><p>موارد المراجعة والتدريب الخاصة بالمادة، داخل Yemen Study.</p></div>{isGrade12 ? <Link className="btn btn-primary g12-subject-cta" to={grade12LearningHref}>افتح شرح المادة والاختبارات <ArrowLeft size={15}/></Link> : <div className="course-progress"><span>تقدّمك في المادة</span><b>{publishedProgress + "%"}</b><div className="progress-track"><i style={{ width: publishedProgress + "%" }}/></div></div>}</div>


        {isGrade12 ? <section className="sme-course-overview" aria-label="مركز شرح المادة">
          <div className="sme-course-overview-copy">
            <small>منهج عدن 2026 · {grade.name} · {track.name}</small>
            <h2>مركز شرح ومراجعة {subject.name}</h2>
            <p>تنتقل من هنا إلى شرح الموضوعات المرتبطة بالمادة، مع شرح الموضوع وأمثلته وتدريباته وأسئلته المتدرجة داخل الموقع.</p>
          </div>
          <div className="sme-course-stats">
            <div className="sme-course-stat"><b>71</b><small>محوراً تعليمياً في المركز</small></div>
            <div className="sme-course-stat"><b>3</b><small>مستويات لصعوبة الأسئلة</small></div>
            <div className="sme-course-stat"><b>PDF</b><small>كراسات دروس كاملة واختبارات قابلة للطباعة</small></div>
          </div>
        </section> : <section className="sme-course-overview" aria-label="نظرة عامة على المقرر">
          <div className="sme-course-overview-copy">
            <small>المقرر الدراسي · {grade.name} · {track.name}</small>
            <h2>مسار المراجعة للمقرر</h2>
            <p>استخدم فهرس المادة للتنقل بين الوحدات، ثم افتح الملاحظات أو التدريب المرتبط بكل موضوع.</p>
          </div>
          <div className="sme-course-stats">
            <div className="sme-course-stat"><b>{publishedUnits.length}</b><small>وحدات منشورة</small></div>
            <div className="sme-course-stat"><b>{allPublishedLessons.length}</b><small>دروس متاحة</small></div>
            <div className="sme-course-stat"><b>{publishedProgress + "%"}</b><small>تقدمك</small></div>
          </div>
        </section>}

        <div className="course-shell">
      <section className="course-main">
        {!sidebarOpen && <button type="button" className="sidebar-show-button" onClick={() => setSidebarOpen(true)}><Menu size={17}/> إظهار القائمة</button>}
        <div className="course-tabs" role="tablist">{tabs.map(({ id, label, icon: Icon }) => <button key={id} role="tab" aria-selected={activeTab === id} className={activeTab === id ? "course-tab active" : "course-tab"} onClick={() => setActiveTab(id)}><Icon size={16}/><span>{label}</span></button>)}</div>
        {isGrade12 ? <>
          {activeTab === "notes" && <div className="content-coming">
            <span className="content-icon"><BookOpen size={26}/></span>
            <span className="content-status">مركز الشرح والمراجعة</span>
            <h2>ابدأ شرح مادة {subject.name}</h2>
            <p>افتح المحور المطابق لمادتك لقراءة الدرس مقسماً إلى موضوعات قصيرة، مع أهداف التعلم والقوانين أو المفاهيم المهمة، ومثال محلول وتدريبات واختبار داخل الموقع.</p>
            {grade12LearningModuleSlug ? <Link className="btn btn-primary" to={grade12LearningHref}>افتح شرح المادة <ArrowLeft size={16}/></Link> : <p>لم يُربط هذا المقرر بمحور مستقل بعد؛ افتح المركز وابحث عن موضوع قريب.</p>}
          </div>}
          {activeTab === "questions" && <div className="content-coming">
            <span className="content-status">بنك الأسئلة</span><h2>تدرّب على أسئلة {subject.name}</h2>
            <p>الأسئلة مقسمة إلى مستويات جيد وصعب والأصعب، مع تفسير للإجابة وخطوات الحل.</p>
            <Link className="btn btn-primary" to={grade12LearningHref}>افتح اختبارات المادة <ArrowLeft size={16}/></Link>
          </div>}
          {activeTab === "flashcards" && <div className="content-coming">
            <span className="content-status">المراجعة النشطة</span><h2>مفاهيم وبطاقات {subject.name}</h2>
            <p>راجع المصطلحات والقواعد الأساسية، ثم اختبر استدعاء المعلومات قبل الاطلاع على الحل.</p>
            <Link className="btn btn-primary" to={grade12LearningHref}>افتح دروس المادة <ArrowLeft size={16}/></Link>
          </div>}
          {activeTab === "exams" && <div className="content-coming">
            <span className="content-status">اختبارات داخل الموقع</span><h2>اختبارات متدرجة في {subject.name}</h2>
            <p>اختر مستوى الصعوبة، أجب عن الأسئلة، ثم راجع تفسير الإجابات والأخطاء التي تحتاج إلى تثبيت.</p>
            <Link className="btn btn-primary" to={grade12LearningHref}>ابدأ الاختبار <ArrowLeft size={16}/></Link>
          </div>}
          {activeTab === "papers" && <div className="paper-empty"><FileText size={25}/><h2>أوراق الامتحانات</h2><p>ستُعرض أوراق الامتحانات التي يسمح باستخدامها داخل المكتبة، أو تُبنى اختبارات تدريبية أصلية داخل الموقع.</p><Link to="/past-papers" className="text-link">عرض مكتبة الأوراق <ArrowLeft size={15}/></Link></div>}
        </> : <>
          {activeTab === "notes" && <div className="resource-list">
            <div className="resource-toolbar"><div><span className="content-status">مكتبة المادة</span><h2>الدروس والمراجعة</h2><p>تظهر هنا الدروس المنشورة بعد مراجعتها. افتح الدرس واقرأ الشرح وحل أمثلته داخل الموقع.</p></div></div>
            {contentLoading ? <div className="content-loading" role="status">جارٍ تحميل الدروس المنشورة...</div> : contentError ? <div className="content-coming"><span className="content-status">المكتبة الداخلية</span><h2>محتوى المادة داخل Yemen Study</h2><p>{contentError}</p></div> : publishedUnits.length ? publishedUnits.map((unit) => <section className="published-unit" key={unit.id}>
              <div className="published-unit-heading"><span className="eyebrow">وحدة دراسية</span><h3>{unit.title}</h3>{unit.description && <p>{unit.description}</p>}</div>
              {unit.lessons.map((lesson) => <Link className="lesson-row" key={lesson.id} to={`/library-lesson/${lesson.id}`}>
                <span className="lesson-row-icon"><FileText size={19}/></span>
                <span className="lesson-row-copy"><b>{lesson.title}</b><small>{lesson.estimated_minutes} دقيقة{lesson.summary ? " · " + lesson.summary : ""}</small></span>
                <span className={progress.completed.includes(lesson.id) ? "lesson-row-cta is-complete" : "lesson-row-cta"}>{progress.completed.includes(lesson.id) ? <><CheckCircle2 size={14}/> مراجعة الدرس</> : <>افتح الشرح <ArrowLeft size={14}/></>}</span><ChevronLeft size={17}/>
              </Link>)}
            </section>) : <div className="content-coming"><span className="content-icon"><BookOpen size={26}/></span><span className="content-status">لا توجد دروس منشورة بعد</span><h2>ستجد شروحات المادة هنا.</h2><p>سيظهر كل شرح وأمثلة ومسائل وتدريبات داخل هذه الصفحة. لا نعتمد على روابط خارجية كبديل عن الدرس.</p><div className="coming-feature-grid"><span><BookOpen/> شرح كامل</span><span><Target/> مسائل محلولة</span><span><Layers3/> بطاقات مراجعة</span><span><Timer/> اختبارات داخلية</span></div></div>}
          </div>}
          {activeTab === "questions" && <div className="content-coming"><span className="content-status">تدريب داخل الموقع</span><h2>أسئلة الموضوع</h2><p>ستظهر الأسئلة المرتبطة بالدروس المنشورة هنا بعد تفعيل التصحيح الآمن. لن نرسل إجابات الطالب إلى موقع خارجي.</p></div>}
          {activeTab === "flashcards" && <div className="content-coming"><span className="content-status">مراجعة داخل الموقع</span><h2>بطاقات المادة</h2><p>ستُنشأ البطاقات من مفاهيم الدروس المنشورة وتظهر داخل هذه الصفحة.</p></div>}
          {activeTab === "exams" && <div className="content-coming"><span className="content-status">اختبارات داخل الموقع</span><h2>اختبارات المادة</h2><p>سيُبنى الاختبار من بنك الأسئلة المعتمد، وتظهر النتيجة والتفسيرات داخل Yemen Study.</p></div>}
          {activeTab === "papers" && <div className="paper-empty"><FileText size={25}/><h2>أوراق الامتحانات</h2><p>ستُعرض أوراق الامتحانات التي يسمح باستخدامها داخل المكتبة، أو تُبنى اختبارات تدريبية أصلية داخل الموقع.</p></div>}
        </>}
      </section>
        </div>
      </div>
    </div>
  </main>;
}


type PublishedLessonRecord = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content_md: string;
  objectives: string[];
  estimated_minutes: number;
  unit_id: string;
};
type LessonReferenceRecord = {
  reference_role: string;
  source_locator: string | null;
  content_sources: { title: string; publisher: string | null } | null;
};

function InlineLessonText({ value }: { value: string }) {
  const parts = value.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return <>{parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;
    return part;
  })}</>;
}

function LessonMarkdown({ content }: { content: string }) {
  const lines = content.replace(/\r/g, "").split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let listType: "ul" | "ol" | null = null;
  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(<p key={"p-" + blocks.length}><InlineLessonText value={paragraph.join(" ")}/></p>);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length && listType) {
      const ListTag = listType;
      blocks.push(<ListTag key={"list-" + blocks.length}>{list.map((item, index) => <li key={index}><InlineLessonText value={item}/></li>)}</ListTag>);
    }
    list = [];
    listType = null;
  };
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) { flushParagraph(); flushList(); continue; }
    if (line === "$$" || (line.startsWith("$$") && line.endsWith("$$") && line.length > 4)) {
      flushParagraph(); flushList();
      if (line.length > 4) {
        blocks.push(<div className="lesson-formula" dir="ltr" key={"math-" + blocks.length}>{line.slice(2, -2).trim()}</div>);
      } else {
        const mathLines: string[] = [];
        while (index + 1 < lines.length && lines[index + 1].trim() !== "$$") {
          index += 1;
          mathLines.push(lines[index].trim());
        }
        if (index + 1 < lines.length) index += 1;
        blocks.push(<div className="lesson-formula" dir="ltr" key={"math-" + blocks.length}>{mathLines.join(" ")}</div>);
      }
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph(); flushList();
      const level = heading[1].length;
      const text = <InlineLessonText value={heading[2]}/>;
      if (level === 1) blocks.push(<h2 key={"h-" + blocks.length}>{text}</h2>);
      else if (level === 2) blocks.push(<h3 key={"h-" + blocks.length}>{text}</h3>);
      else blocks.push(<h4 key={"h-" + blocks.length}>{text}</h4>);
      continue;
    }
    if (line.startsWith(">")) {
      flushParagraph(); flushList();
      blocks.push(<blockquote key={"q-" + blocks.length}><InlineLessonText value={line.slice(1).trim()}/></blockquote>);
      continue;
    }
    if (/^[-*]\s+/.test(line) || /^\d+[.)]\s+/.test(line)) {
      flushParagraph();
      const nextType = /^\d+[.)]\s+/.test(line) ? "ol" : "ul";
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      list.push(line.replace(/^([-*]|\d+[.)])\s+/, ""));
      continue;
    }
    if (/^---+$/.test(line)) {
      flushParagraph(); flushList();
      blocks.push(<hr key={"hr-" + blocks.length}/>);
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph(); flushList();
  return <div className="lesson-markdown">{blocks}</div>;
}

function PublishedLessonPage({ progress, complete, toggleSaved }: { progress: Progress; complete: (id: string) => void; toggleSaved: (id: string) => void }) {
  const { lessonId = "" } = useParams();
  const [lesson, setLesson] = useState<PublishedLessonRecord | null>(null);
  const [unitTitle, setUnitTitle] = useState("");
  const [references, setReferences] = useState<LessonReferenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!supabase) {
        setError("مكتبة الدروس تحتاج إلى ربط قاعدة البيانات. سيبقى محتوى الدروس داخل Yemen Study عند تفعيلها.");
        setLoading(false);
        return;
      }
      setLoading(true); setError("");
      try {
        const result = await supabase.from("lessons")
          .select("id,title,slug,summary,content_md,objectives,estimated_minutes,unit_id")
          .eq("id", lessonId).eq("status", "published").maybeSingle();
        if (result.error) throw result.error;
        if (!result.data) {
          if (active) { setLesson(null); setError("هذا الدرس غير موجود أو لم يُنشر بعد."); }
          return;
        }
        const [unitResult, sourceResult] = await Promise.all([
          supabase.from("units").select("id,title").eq("id", result.data.unit_id).maybeSingle(),
          supabase.from("lesson_sources")
            .select("reference_role,source_locator,content_sources(title,publisher)")
            .eq("lesson_id", lessonId),
        ]);
        if (unitResult.error) throw unitResult.error;
        if (sourceResult.error) throw sourceResult.error;
        if (active) {
          setLesson(result.data as PublishedLessonRecord);
          setUnitTitle(unitResult.data?.title ?? "");
          setReferences((sourceResult.data ?? []) as unknown as LessonReferenceRecord[]);
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "تعذّر تحميل الدرس.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [lessonId]);

  if (loading) return <main className="container page"><div className="content-loading" role="status">جارٍ فتح الدرس داخل الموقع...</div></main>;
  if (!lesson) return <main className="container page"><div className="content-coming"><span className="content-status">مكتبة Yemen Study</span><h1>تعذّر فتح الدرس</h1><p>{error || "الدرس غير متاح حالياً."}</p><Link className="btn btn-primary" to="/curriculum">العودة إلى المواد الدراسية</Link></div></main>;

  return <main className="container page lesson-page published-lesson-page sme-lesson-page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><Link to="/curriculum">المواد الدراسية</Link><ChevronLeft size={14}/>{unitTitle && <><span>{unitTitle}</span><ChevronLeft size={14}/></>}<b>{lesson.title}</b></div>
    <article className="lesson-main published-lesson-main">
      <span className="content-status">درس منشور داخل Yemen Study</span>
      <h1>{lesson.title}</h1>
      {lesson.summary && <p className="lesson-lead">{lesson.summary}</p>}
      <div className="lesson-meta"><span><Clock3 size={15}/>{lesson.estimated_minutes} دقيقة</span><span><BookOpen size={15}/>شرح ومراجعة</span></div>
      <div className="sme-lesson-actions"><button className="btn btn-outline" type="button" onClick={() => window.print()}><FileText size={15}/> حفظ الدرس PDF / طباعة</button><Link className="btn btn-primary" to="/curriculum">تصفّح بقية المنهج <ArrowLeft size={15}/></Link></div>
      {lesson.objectives?.length > 0 && <section className="lesson-objectives"><h2><Target size={19}/> أهداف التعلّم</h2><ul>{lesson.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul></section>}
      <LessonMarkdown content={lesson.content_md}/>
      {references.length > 0 && <section className="lesson-sources"><h2><FileText size={18}/> توثيق المحتوى</h2><p>هذه المراجع استُخدمت للتحقق من المنهج والمعلومات. الشرح المعروض والأسئلة والأنشطة التعليمية متاحة داخل Yemen Study.</p><div>{references.map((reference, index) => <article key={index}><div><b>{reference.content_sources?.title ?? "مرجع موثق"}</b><small>{reference.content_sources?.publisher ?? "جهة النشر غير محددة"}{reference.source_locator ? " · " + reference.source_locator : ""}</small><p>{reference.reference_role === "curriculum_alignment" ? "مرجع مطابقة المنهج" : reference.reference_role === "fact_check" ? "مرجع للتحقق العلمي" : "مرجع إضافي"}</p></div></article>)}</div></section>}
      <div className="published-lesson-actions"><button className={progress.completed.includes(lesson.id) ? "btn btn-outline" : "btn btn-primary"} onClick={() => complete(lesson.id)}>{progress.completed.includes(lesson.id) ? "تم تسجيل إكمال الدرس" : "علّم الدرس كمكتمل"} <Check size={16}/></button><button className={progress.saved.includes(lesson.id) ? "save-button saved" : "save-button"} onClick={() => toggleSaved(lesson.id)}><Bookmark size={16}/>{progress.saved.includes(lesson.id) ? "إزالة من المحفوظات" : "احفظ للرجوع لاحقاً"}</button></div>
      <div className="lesson-next"><div><span className="eyebrow">انتهيت من القراءة؟</span><h2>راجع الأفكار وحل التدريب.</h2><p>تظهر الأنشطة المرتبطة بهذا الدرس ضمن مكتبة المادة.</p></div><Link className="btn btn-primary" to="/curriculum">العودة إلى المواد <ArrowLeft size={16}/></Link></div>
    </article>
  </main>;
}

function LessonPage({ progress, complete, toggleSaved }: { progress: Progress; complete: (id: string) => void; toggleSaved: (id: string) => void }) {
  const { lessonSlug = "" } = useParams();
  if (lessonSlug !== demoLesson.slug) return <NotFound/>;
  const done = progress.completed.includes(demoLesson.slug);
  const saved = progress.saved.includes(demoLesson.slug);
  return <main className="container page lesson-page sme-lesson-page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><Link to="/subject/grade-12/scientific/physics">الفيزياء</Link><ChevronLeft size={14}/><b>{demoLesson.title}</b></div>
    <div className="lesson-layout">
      <article className="lesson-main">
        <span className="content-status">ملاحظات المراجعة · نموذج تفاعلي</span>
        <h1>{demoLesson.title}</h1><p className="lesson-lead">{demoLesson.summary}</p>
        <div className="lesson-meta"><span><Clock3 size={15}/>{demoLesson.duration} دقيقة</span><span><FileText size={15}/>{demoLesson.sections.length} أقسام</span><span><Target size={15}/>3 أهداف تعلم</span></div>
        <div className="sme-lesson-actions"><button className="btn btn-outline" type="button" onClick={() => window.print()}><FileText size={15}/> حفظ الدرس PDF / طباعة</button><Link className="btn btn-primary" to="/subject/grade-12/scientific/physics">العودة إلى المادة <ArrowLeft size={15}/></Link></div>
        <div className="lesson-warning"><ShieldCheck size={16}/> هذا محتوى تجريبي لشرح طريقة عمل المنصة، ويحتاج مراجعة ومطابقة مع كتاب الوزارة قبل اعتماده للطلاب.</div>
        <section className="lesson-objectives"><h2><Target size={19}/> أهداف التعلّم</h2><ul>{demoLesson.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul></section>
        {demoLesson.sections.map((section, index) => <section className="note-section" id={"section-" + index} key={section.heading}><span className="note-section-number">{String(index + 1).padStart(2, "0")}</span><div><h2>{section.heading}</h2><p>{section.body}</p>{section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}</div></section>)}
        <section className="worked-example"><span className="eyebrow">مثال محلول</span><h2>{demoLesson.example.title}</h2><ol>{demoLesson.example.steps.map((step) => <li key={step}>{step}</li>)}</ol><div className="example-answer"><CheckCircle2 size={18}/><b>{demoLesson.example.answer}</b></div></section>
        <section className="lesson-recap"><h2><Zap size={19}/> مفاهيم أساسية</h2><ul>{demoLesson.recap.map((line) => <li key={line}>{line}</li>)}</ul></section>
        {demoLesson.sources?.length ? <section className="lesson-sources"><h2><FileText size={18}/> توثيق المحتوى</h2><p>تمت مراجعة المفاهيم والمصطلحات بالاستناد إلى مراجع علمية موثوقة. جميع الشروحات والأمثلة والأسئلة المعروضة هنا مكتوبة داخل Yemen Study، ولا تحتاج إلى مغادرة الموقع لمتابعة الدرس.</p><div>{demoLesson.sources.map((source) => <article key={source.id}><div><b>{source.title}</b><small>{source.publisher} · {source.locator}</small><p>{source.role}</p><em>{source.note}</em></div></article>)}</div></section> : null}
        <section className="lesson-next"><div><span className="eyebrow">الخطوة التالية</span><h2>هل فهمت الموضوع؟ اختبر نفسك.</h2><p>انتقل إلى الأسئلة لتطبيق ما تعلمته.</p></div><Link className="btn btn-primary" to="/subject/grade-12/scientific/physics">افتح أسئلة الموضوع <ArrowLeft size={16}/></Link></section>
      </article>
      <aside className="lesson-aside"><div className="aside-sticky"><div className="aside-card"><span className="aside-card-title">تقدّمك في الدرس</span><div className="lesson-check-state">{done ? <CheckCircle2/> : <BookOpen/>}<b>{done ? "أكملت هذا الدرس" : "لم تكمل الدرس بعد"}</b></div><button className={done ? "btn btn-outline full" : "btn btn-primary full"} onClick={() => complete(demoLesson.slug)}>{done ? "تم تسجيل الإكمال" : "علّم الدرس كمكتمل"} <Check size={16}/></button><button className={saved ? "save-button saved full" : "save-button full"} onClick={() => toggleSaved(demoLesson.slug)}><Bookmark size={16}/>{saved ? "إزالة من المحفوظات" : "احفظ للرجوع لاحقاً"}</button></div><div className="aside-card"><b>في هذا الدرس</b><div className="aside-toc">{demoLesson.sections.map((section, i) => <a key={section.heading} href={"#section-" + i}>{section.heading}</a>)}</div></div></div></aside>
    </div>
  </main>;
}

function MockExamPage({ addScore }: { addScore: (score: number) => void }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [seconds, setSeconds] = useState(300);
  const [started, setStarted] = useState(false);
  const score = demoLesson.questions.filter((question) => answers[question.id] === question.correctIndex).length;
  const finish = () => { if (submitted) return; setSubmitted(true); addScore(score); };
  useEffect(() => {
    if (!started || submitted) return;
    if (seconds <= 0) { finish(); return; }
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [started, submitted, seconds, score]);
  const formattedTime = String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");
  return <main className="container page mock-page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><Link to="/subject/grade-12/scientific/physics">الفيزياء</Link><ChevronLeft size={14}/><b>اختبار تجريبي</b></div>
    <div className="mock-intro"><span className="eyebrow">اختبر نفسك</span><h1>اختبار الكميات القياسية والمتجهة</h1><p>اختبار تجريبي قصير يعرض نتيجتك وتفسير كل إجابة.</p><div className="mock-meta"><span><CircleHelp size={15}/> 3 أسئلة</span><span><Clock3 size={15}/> 5 دقائق</span><span><Target size={15}/> اختيار من متعدد</span></div></div>
    <div className="mock-workspace">
      <div className="mock-toolbar"><div><b>اختبار قصير</b><small>الفيزياء · نموذج تفاعلي</small></div><div className={seconds < 60 ? "timer-pill warning" : "timer-pill"}><Timer size={17}/>{formattedTime}</div></div>
      {!started && <div className="mock-start"><span className="tool-icon"><Timer size={24}/></span><h2>جاهز لبدء الاختبار؟</h2><p>اقرأ كل سؤال واختر الإجابة الصحيحة. ستظهر النتيجة والتفسيرات بعد التسليم.</p><button className="btn btn-primary" onClick={() => setStarted(true)}>ابدأ الاختبار <Play size={16}/></button></div>}
      {started && <div className="mock-questions">{demoLesson.questions.map((question, index) => <article className="practice-question" key={question.id}><div className="question-top"><span>السؤال {index + 1} من {demoLesson.questions.length}</span><span className="difficulty">{question.difficulty}</span></div><h3>{question.prompt}</h3><div className="answer-options">{question.options.map((option, optionIndex) => <button key={option} disabled={submitted} className={submitted && optionIndex === question.correctIndex ? "answer-option correct" : submitted && answers[question.id] === optionIndex ? "answer-option incorrect" : answers[question.id] === optionIndex ? "answer-option chosen" : "answer-option"} onClick={() => setAnswers((old) => ({ ...old, [question.id]: optionIndex }))}><span>{["أ","ب","ج","د"][optionIndex]}</span>{option}</button>)}</div>{submitted && <div className="answer-explanation"><b>{answers[question.id] === question.correctIndex ? "إجابة صحيحة" : "الإجابة الصحيحة موضحة أدناه"}</b><p>{question.explanation}</p></div>}</article>)}
        {!submitted ? <button className="btn btn-primary" disabled={Object.keys(answers).length !== demoLesson.questions.length} onClick={finish}>تسليم الاختبار <CheckCircle2 size={16}/></button> : <div className="mock-result"><Trophy size={28}/><div><span>النتيجة النهائية</span><strong>{score} / {demoLesson.questions.length}</strong><p>{Math.round(score / demoLesson.questions.length * 100)}% من الإجابات صحيحة</p></div><Link className="btn btn-outline" to="/dashboard">عرض تقدّمي</Link></div>}
      </div>}
    </div>
    <div className="lesson-warning"><ShieldCheck size={16}/> نتيجة هذا الاختبار التجريبي تُحفظ محلياً على هذا الجهاز فقط حتى يتم ربط قاعدة البيانات.</div>
  </main>;
}

function DashboardPage({ progress }: { progress: Progress }) {
  const [attempts, setAttempts] = useState<AttemptSummary[]>(readAttemptSummaries);
  const latestScore = progress.quizScores.length ? progress.quizScores[progress.quizScores.length - 1] : undefined;
  useEffect(() => {
    const refresh = () => setAttempts(readAttemptSummaries());
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);
  const totalQuestions = attempts.reduce((sum, attempt) => sum + attempt.total, 0);
  const correctAnswers = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
  const accuracy = totalQuestions ? Math.round(correctAnswers / totalQuestions * 100) : undefined;
  const attemptCount = attempts.length + progress.quizScores.length;
  return <main className="container page ys-dashboard-page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><b>مساحة الطالب</b></div>
    <div className="page-title-row"><div><span className="eyebrow">مساحة الطالب</span><h1>تقدّمك الدراسي.</h1><p>مكان واحد لمتابعة الدروس المحفوظة والاختبارات والموضوعات التي تحتاج إلى مراجعة.</p></div><Link className="btn btn-primary" to="/curriculum">واصل التعلّم <ArrowLeft size={16}/></Link></div>
    <div className="dashboard-stats">
      <article><span className="dash-icon"><CheckCircle2/></span><span>دروس مكتملة</span><b>{progress.completed.length}</b><small>من الدروس التي درستها</small></article>
      <article><span className="dash-icon"><Bookmark/></span><span>دروس محفوظة</span><b>{progress.saved.length}</b><small>للعودة إليها لاحقاً</small></article>
      <article><span className="dash-icon"><Trophy/></span><span>اختبارات مكتملة</span><b>{attemptCount}</b><small>محاولات مسجلة على هذا الجهاز</small></article>
      <article><span className="dash-icon"><Award/></span><span>دقة الإجابات</span><b>{accuracy === undefined ? (latestScore === undefined ? "—" : latestScore + "/3") : accuracy + "%"}</b><small>{totalQuestions ? correctAnswers + " من " + totalQuestions + " إجابات صحيحة" : "تظهر بعد أول اختبار"}</small></article>
    </div>
    <section className="ys-performance-panel" aria-labelledby="ys-performance-title">
      <div className="ys-performance-heading">
        <div><span className="eyebrow">مقاييس التعلّم</span><h2 id="ys-performance-title">مؤشرات أدائك المسجّلة.</h2><p>تُحدّث هذه المؤشرات من الدروس والاختبارات المحفوظة على هذا الجهاز.</p></div>
        <span className="ys-performance-mark"><Award size={18}/> متابعة شخصية</span>
      </div>
      <div className="ys-performance-grid">
        <div className="ys-performance-item"><span>الدروس المكتملة</span><b>{progress.completed.length}</b><small>دروس تم تسجيل إكمالها</small></div>
        <div className="ys-performance-item"><span>المحاولات المسجلة</span><b>{attemptCount}</b><small>اختبارات وتدريبات محفوظة</small></div>
        <div className="ys-performance-item ys-performance-accuracy">
          <span>دقة الإجابات</span>
          <b>{accuracy === undefined ? "—" : accuracy + "%"}</b>
          <div className="ys-accuracy-track" role="progressbar" aria-label="دقة الإجابات المسجلة" aria-valuemin={0} aria-valuemax={100} aria-valuenow={accuracy ?? 0}><i style={{ width: (accuracy ?? 0) + "%" }}/></div>
          <small>{totalQuestions ? correctAnswers + " إجابة صحيحة من " + totalQuestions : "تظهر النسبة بعد أول اختبار مسجل"}</small>
        </div>
        <div className="ys-performance-item"><span>الدروس المحفوظة</span><b>{progress.saved.length}</b><small>موارد أضفتها إلى محفوظاتك</small></div>
      </div>
      <div className="ys-mastery-guide">
        <div><span className="ys-mastery-index">01</span><span><b>تعرّف</b><small>اقرأ الشرح وحدد المفاهيم الأساسية.</small></span></div>
        <div><span className="ys-mastery-index">02</span><span><b>تدرّب</b><small>حل الأسئلة وراجع خطوات الحل.</small></span></div>
        <div><span className="ys-mastery-index">03</span><span><b>أتقن</b><small>تحقق من فهمك عبر اختبار جديد.</small></span></div>
      </div>
      <p className="ys-metric-note">ملاحظة: دقة الإجابات مؤشر إجمالي للمحاولات المحفوظة، وليست درجة إتقان مستقلة لكل مهارة أو مادة.</p>
    </section>
    <div className="dashboard-columns">
      <section className="dashboard-panel"><div className="panel-heading"><h2>متابعة المراجعة</h2><span>آخر نشاط</span></div>{progress.completed.length ? <Link className="dashboard-row" to="/lesson/scalars-and-vectors"><CheckCircle2/><span><b>{demoLesson.title}</b><small>الفيزياء · الثالث الثانوي العلمي</small></span><span className="done-label">مكتمل</span></Link> : <div className="dashboard-empty"><BookOpen/><b>ابدأ أول درس لك</b><p>ستظهر هنا الدروس التي أكملتها وتقدّمك فيها.</p><Link to="/subject/grade-12/scientific/physics" className="text-link">افتح الدرس التجريبي <ArrowLeft size={15}/></Link></div>}</section>
      <section className="dashboard-panel"><div className="panel-heading"><h2>المحفوظات</h2><span>{progress.saved.length} عناصر</span></div>{progress.saved.length ? <Link className="dashboard-row" to="/lesson/scalars-and-vectors"><Bookmark/><span><b>{demoLesson.title}</b><small>الفيزياء · ملاحظات المراجعة</small></span><ChevronLeft/></Link> : <div className="dashboard-empty"><Bookmark/><b>لم تحفظ أي درس بعد</b><p>استخدم زر الحفظ في صفحة الدرس للرجوع إلى ملاحظاتك.</p></div>}</section>
    </div>
    {attempts.length > 0 && <section className="dashboard-panel dashboard-attempts"><div className="panel-heading"><h2>آخر محاولاتك</h2><span>{attempts.length} اختبارات</span></div>{attempts.slice(-5).reverse().map((attempt, index) => <div className="dashboard-row" key={attempt.id || attempt.createdAt || index}><Trophy/><span><b>{attempt.source === "guided-practice" ? "التدريب الموجّه" : attempt.source === "target-test" ? "الاختبار المستهدف" : "اختبار تدريبي"}</b><small>{attempt.createdAt ? new Date(attempt.createdAt).toLocaleString("ar") : "محاولة محفوظة على هذا الجهاز"}</small></span><span className="done-label">{attempt.score}/{attempt.total}</span></div>)}</section>}
    <div className="data-note"><ShieldCheck size={15}/> بيانات هذه النسخة التجريبية تُخزّن محلياً في المتصفح. مزامنة الحسابات بين الأجهزة تتطلب إعداد قاعدة البيانات.</div>
  </main>;
}

function StudyPlanPage() {
  const tasks = ["مراجعة ملاحظات الدرس", "حل أسئلة الموضوع", "مراجعة البطاقات التعليمية", "إعادة اختبار قصير"];
  const [done, setDone] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("ys-plan-v1") || "[]") as string[]; } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem("ys-plan-v1", JSON.stringify(done)); } catch { /* storage can be disabled */ } }, [done]);
  return <main className="container page plan-page"><div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><b>خطة المذاكرة</b></div><div className="page-title-row"><div><span className="eyebrow">خطتك اليومية</span><h1>خطوة واضحة كل يوم.</h1><p>نموذج بسيط لتقسيم جلسة المراجعة إلى مهام قصيرة.</p></div><span className="plan-date"><CalendarDays size={17}/> خطتي الحالية</span></div>
    <div className="plan-layout"><section className="plan-card"><div className="panel-heading"><div><span className="content-status">جلسة مراجعة تجريبية</span><h2>الفيزياء · الكميات القياسية والمتجهة</h2></div><span className="plan-progress">{done.length}/{tasks.length}</span></div><div className="progress-track large"><i style={{ width: (done.length / tasks.length * 100) + "%" }}/></div><div className="plan-tasks">{tasks.map((task, index) => <label key={task} className={done.includes(task) ? "plan-task complete" : "plan-task"}><input type="checkbox" checked={done.includes(task)} onChange={() => setDone((old) => old.includes(task) ? old.filter((item) => item !== task) : [...old, task])}/><span className="task-check"><Check size={14}/></span><span><b>{task}</b><small>{[10,15,5,5][index]} دقائق مقترحة</small></span></label>)}</div><button className="btn btn-outline" onClick={() => setDone([])}>إعادة ضبط الخطة</button></section><aside className="plan-side"><span className="tool-icon"><Sparkles size={23}/></span><h3>نصيحة للمراجعة</h3><p>ابدأ بفهم الملاحظات، ثم أغلقها وحاول تذكر النقاط الرئيسية، وبعدها انتقل إلى الأسئلة. لا تجعل وقت المراجعة قراءة فقط.</p><Link className="text-link" to="/subject/grade-12/scientific/physics">اذهب إلى المادة <ArrowLeft size={15}/></Link></aside></div>
  </main>;
}

function PastPapersPage() {
  return <main className="container page"><div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><b>أوراق الامتحانات</b></div><div className="page-title-row"><div><span className="eyebrow">تدرّب على نمط الاختبار</span><h1>أوراق الامتحانات والنماذج.</h1><p>مكتبة منظمة بحسب الصف والمادة والسنة الدراسية، مع بيانات المصدر ومفاتيح الإجابة حين تكون متاحة للنشر.</p></div></div><div className="paper-library-empty"><span className="tool-icon"><FileText size={24}/></span><h2>المكتبة قيد التوثيق</h2><p>لن نعرض روابط متفرقة أو ملفات مجهولة المصدر. ستضاف هنا الأوراق التي نتحقق من سنة صدورها ومادتها وحقوق إعادة استخدامها، مع إمكانية حل النماذج داخل المنصة حيثما أمكن.</p><Link className="btn btn-primary" to="/mock-exam">جرّب اختباراً تدريبياً <ArrowLeft size={16}/></Link></div></main>;
}

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setMessage("");
    if (!supabase) { setMessage("الحسابات غير مفعّلة بعد. يمكن تجربة مواد المنصة دون تسجيل الدخول."); return; }
    setBusy(true);
    try {
      const result = mode === "login" ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password });
      if (result.error) throw result.error;
      setMessage(mode === "signup" && !result.data.session ? "تم إنشاء الحساب. راجع بريدك الإلكتروني لتأكيده." : "تم تسجيل الدخول بنجاح.");
      if (result.data.session) navigate("/dashboard");
    } catch (error) { setMessage(error instanceof Error ? error.message : "حدث خطأ غير متوقع."); }
    finally { setBusy(false); }
  };
  return <main className="container page login-wrap"><section className="login-card"><span className="tool-icon"><GraduationCap size={26}/></span><span className="eyebrow">حساب Yemen Study</span><h1>{mode === "login" ? "مرحباً بعودتك." : "أنشئ حسابك."}</h1><p>احفظ تقدّمك وتابع مراجعتك من أي جهاز بعد تفعيل الحسابات.</p><form onSubmit={submit}><label htmlFor="email">البريد الإلكتروني</label><input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required/><label htmlFor="password">كلمة المرور</label><input id="password" type="password" minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} required/>{!isSupabaseConfigured && <div className="form-hint">تسجيل الدخول يتطلب إعداد Supabase. تجربة الدروس متاحة دون حساب.</div>}{message && <div className="form-message" role="status">{message}</div>}<button className="btn btn-primary full" disabled={busy}>{busy ? "جارٍ التنفيذ..." : mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"} <ArrowLeft size={16}/></button></form><button className="switch-mode" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>{mode === "login" ? "ليس لديك حساب؟ أنشئ حساباً" : "لديك حساب؟ سجّل الدخول"}</button></section></main>;
}

type CurriculumChoice = { id: string; label: string };
type UnitChoice = { id: string; title: string; status: string };
type LessonChoice = { id: string; title: string; unit_id: string; status: string };
type SourceChoice = { id: string; title: string; rights_status: string; source_type: string; reuse_policy: string };

const makeSlug = (value: string) => value.trim().toLocaleLowerCase("ar")
  .replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");

function AdminPage() {
  const { role } = useAuth();
  const [health, setHealth] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activePanel, setActivePanel] = useState<"units" | "lessons" | "questions" | "sources">("units");
  const [curriculumChoices, setCurriculumChoices] = useState<CurriculumChoice[]>([]);
  const [units, setUnits] = useState<UnitChoice[]>([]);
  const [lessons, setLessons] = useState<LessonChoice[]>([]);
  const [sources, setSources] = useState<SourceChoice[]>([]);
  const [unitForm, setUnitForm] = useState({ curriculum_subject_id: "", title: "", slug: "", description: "" });
  const [lessonForm, setLessonForm] = useState({ unit_id: "", title: "", slug: "", summary: "", content_md: "", objectives: "", estimated_minutes: "15", syllabus_source_id: "", syllabus_locator: "", reference_source_id: "", reference_locator: "" });
  const [questionForm, setQuestionForm] = useState({ lesson_id: "", prompt: "", option1: "", option2: "", option3: "", option4: "", correct: "0", explanation: "", difficulty: "medium" });
  const [sourceForm, setSourceForm] = useState({ title: "", publisher: "وزارة التربية والتعليم اليمنية", publication_year: "", edition: "", source_url: "", source_type: "educational_reference", licence_name: "", licence_url: "", reuse_policy: "reference_only", rights_status: "needs_review", rights_notes: "" });

  const loadContent = async () => {
    if (!supabase) { setHealth("قاعدة البيانات غير مهيّأة. أضف متغيرات Supabase ثم طبّق ملف migration."); return; }
    setLoadingData(true);
    setHealth("");
    try {
      const [curriculumRes, subjectsRes, gradeTracksRes, gradesRes, tracksRes, unitsRes, lessonsRes, sourcesRes] = await Promise.all([
        supabase.from("curriculum_subjects").select("id,subject_id,grade_track_id").eq("is_active", true),
        supabase.from("subjects").select("id,name"),
        supabase.from("grade_tracks").select("id,grade_id,track_id"),
        supabase.from("grades").select("id,name,grade_number"),
        supabase.from("tracks").select("id,name"),
        supabase.from("units").select("id,title,curriculum_subject_id,status").order("sort_order"),
        supabase.from("lessons").select("id,title,unit_id,status").order("sort_order"),
        supabase.from("content_sources").select("id,title,rights_status,source_type,reuse_policy").order("created_at", { ascending: false }),
      ]);
      const firstError = [curriculumRes,subjectsRes,gradeTracksRes,gradesRes,tracksRes,unitsRes,lessonsRes,sourcesRes].find((item) => item.error);
      if (firstError?.error) throw firstError.error;
      const subjects = subjectsRes.data ?? [];
      const gradeTracks = gradeTracksRes.data ?? [];
      const gradeRows = gradesRes.data ?? [];
      const trackRows = tracksRes.data ?? [];
      const choices = (curriculumRes.data ?? []).map((entry) => {
        const subject = subjects.find((item) => item.id === entry.subject_id);
        const gradeTrack = gradeTracks.find((item) => item.id === entry.grade_track_id);
        const grade = gradeRows.find((item) => item.id === gradeTrack?.grade_id);
        const track = trackRows.find((item) => item.id === gradeTrack?.track_id);
        return { id: entry.id, label: [grade?.name, track?.name, subject?.name].filter(Boolean).join(" / ") || "مقرر غير مسمى" };
      });
      setCurriculumChoices(choices);
      setUnits((unitsRes.data ?? []) as UnitChoice[]);
      setLessons((lessonsRes.data ?? []) as LessonChoice[]);
      setSources((sourcesRes.data ?? []) as SourceChoice[]);
      setHealth("تم تحميل بيانات المحتوى والصلاحيات بنجاح.");
      if (!unitForm.curriculum_subject_id && choices[0]) setUnitForm((old) => ({ ...old, curriculum_subject_id: choices[0].id }));
      if (!lessonForm.unit_id && unitsRes.data?.[0]) setLessonForm((old) => ({ ...old, unit_id: unitsRes.data[0].id }));
      if (!questionForm.lesson_id && lessonsRes.data?.[0]) setQuestionForm((old) => ({ ...old, lesson_id: lessonsRes.data[0].id }));
    } catch (error) {
      setHealth(error instanceof Error ? "تعذّر تحميل المحتوى: " + error.message : "تعذّر تحميل بيانات المحتوى.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (role === "admin" || role === "editor") void loadContent();
  }, [role]);

  const notifyError = (message: string) => setHealth(message);
  const addUnit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || !unitForm.curriculum_subject_id || !unitForm.title.trim()) return;
    setSaving(true); setHealth("");
    try {
      const slug = unitForm.slug.trim() || makeSlug(unitForm.title);
      const { error } = await supabase.from("units").insert({
        curriculum_subject_id: unitForm.curriculum_subject_id,
        title: unitForm.title.trim(), slug, description: unitForm.description.trim(),
        sort_order: units.length + 1, status: "draft",
      });
      if (error) throw error;
      setUnitForm((old) => ({ ...old, title: "", slug: "", description: "" }));
      await loadContent();
      setHealth("أُضيفت الوحدة كمسودة. راجعها قبل نشرها.");
    } catch (error) { notifyError(error instanceof Error ? error.message : "فشل حفظ الوحدة."); }
    finally { setSaving(false); }
  };

  const addLesson = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || !lessonForm.unit_id || !lessonForm.title.trim() || !lessonForm.content_md.trim()) return;
    if (!lessonForm.syllabus_source_id) { setHealth("اختر مصدر المنهج اليمني المعتمد وسجّل موضعه قبل حفظ الدرس."); return; }
    setSaving(true); setHealth("");
    try {
      const slug = lessonForm.slug.trim() || makeSlug(lessonForm.title);
      const objectives = lessonForm.objectives.split("\\n").map((item) => item.trim()).filter(Boolean);
      const { data: insertedLesson, error } = await supabase.from("lessons").insert({
        unit_id: lessonForm.unit_id, title: lessonForm.title.trim(), slug,
        summary: lessonForm.summary.trim(), content_md: lessonForm.content_md,
        objectives, estimated_minutes: Math.max(1, Number(lessonForm.estimated_minutes) || 15),
        sort_order: lessons.length + 1, status: "draft", access_level: "free",
      }).select("id").single();
      if (error) throw error;
      const lessonReferences = [
        {
          lesson_id: insertedLesson.id,
          source_id: lessonForm.syllabus_source_id,
          reference_role: "curriculum_alignment",
          source_locator: lessonForm.syllabus_locator.trim() || null,
        },
        ...(lessonForm.reference_source_id ? [{
          lesson_id: insertedLesson.id,
          source_id: lessonForm.reference_source_id,
          reference_role: "fact_check",
          source_locator: lessonForm.reference_locator.trim() || null,
        }] : []),
      ];
      const { error: referenceError } = await supabase.from("lesson_sources").insert(lessonReferences);
      if (referenceError) {
        await supabase.from("lessons").delete().eq("id", insertedLesson.id);
        throw referenceError;
      }
      setLessonForm((old) => ({ ...old, title: "", slug: "", summary: "", content_md: "", objectives: "" }));
      await loadContent();
      setHealth("أُضيف الدرس كمسودة. لم يظهر للطلاب بعد.");
    } catch (error) { notifyError(error instanceof Error ? error.message : "فشل حفظ الدرس."); }
    finally { setSaving(false); }
  };

  const addQuestion = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || !questionForm.lesson_id || !questionForm.prompt.trim()) return;
    const optionTexts = [questionForm.option1,questionForm.option2,questionForm.option3,questionForm.option4].map((item) => item.trim());
    if (optionTexts.some((item) => !item) || !questionForm.explanation.trim()) {
      setHealth("أكمل الاختيارات الأربعة وتفسير الإجابة قبل الحفظ.");
      return;
    }
    setSaving(true); setHealth("");
    let questionId: string | undefined;
    try {
      const { data, error } = await supabase.from("questions").insert({
        lesson_id: questionForm.lesson_id, question_type: "multiple_choice",
        difficulty: questionForm.difficulty, body_md: questionForm.prompt.trim(),
        explanation_md: questionForm.explanation.trim(), points: 1, status: "draft",
      }).select("id").single();
      if (error) throw error;
      questionId = data.id;
      const { data: options, error: optionsError } = await supabase.from("question_options").insert(
        optionTexts.map((option_text, index) => ({ question_id: questionId, option_label: ["أ","ب","ج","د"][index], option_text, sort_order: index })),
      ).select("id,sort_order");
      if (optionsError) throw optionsError;
      const correct = options?.find((item) => item.sort_order === Number(questionForm.correct));
      if (!correct) throw new Error("تعذّر تحديد الاختيار الصحيح.");
      const { error: keyError } = await supabase.from("question_answer_keys").insert({
        question_id: questionId, correct_option_id: correct.id,
        explanation_private: questionForm.explanation.trim(),
      });
      if (keyError) throw keyError;
      setQuestionForm((old) => ({ ...old, prompt: "", option1: "", option2: "", option3: "", option4: "", explanation: "" }));
      setHealth("أُضيف السؤال مع خياراته ومفتاح الإجابة الخاص كمسودة.");
    } catch (error) {
      if (questionId) await supabase.from("questions").delete().eq("id", questionId);
      notifyError(error instanceof Error ? error.message : "فشل حفظ السؤال.");
    } finally { setSaving(false); }
  };

  const addSource = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || !sourceForm.title.trim()) return;
    setSaving(true); setHealth("");
    try {
      const { error } = await supabase.from("content_sources").insert({
        title: sourceForm.title.trim(), publisher: sourceForm.publisher.trim(),
        publication_year: sourceForm.publication_year.trim(), edition: sourceForm.edition.trim(),
        source_url: sourceForm.source_url.trim() || null,
        source_type: sourceForm.source_type, licence_name: sourceForm.licence_name.trim() || null,
        licence_url: sourceForm.licence_url.trim() || null, reuse_policy: sourceForm.reuse_policy,
        rights_status: sourceForm.rights_status, rights_notes: sourceForm.rights_notes.trim(),
      });
      if (error) throw error;
      setSourceForm((old) => ({ ...old, title: "", publication_year: "", edition: "", source_url: "", rights_notes: "" }));
      await loadContent();
      setHealth("تم تسجيل المصدر وحالة حقوق الاستخدام.");
    } catch (error) { notifyError(error instanceof Error ? error.message : "فشل تسجيل المصدر."); }
    finally { setSaving(false); }
  };

  const setStatus = async (table: "units" | "lessons", id: string, status: "draft" | "review" | "published" | "archived") => {
    if (!supabase) return;
    setSaving(true);
    try {
      const { error } = await supabase.from(table).update({ status }).eq("id", id);
      if (error) throw error;
      await loadContent();
      setHealth(status === "published" ? "تم نشر العنصر." : "تم تحديث حالة العنصر.");
    } catch (error) { notifyError(error instanceof Error ? error.message : "فشل تحديث الحالة."); }
    finally { setSaving(false); }
  };

  if (role !== "admin" && role !== "editor") return <main className="container page"><div className="paper-library-empty"><ShieldCheck/><h2>مساحة المحرر</h2><p>تحتاج صلاحية محرر أو مدير لإدارة المحتوى.</p></div></main>;

  return <main className="container page admin-page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><b>إدارة المحتوى</b></div>
    <div className="admin-page-heading"><div><span className="eyebrow">غرفة إعداد المنهج</span><h1>إدارة المحتوى التعليمي</h1><p>أنشئ المصادر والوحدات والدروس والأسئلة، ثم راجعها قبل إتاحتها للطلاب.</p></div><button className="btn btn-outline" onClick={() => void loadContent()} disabled={loadingData}><RotateCcw size={15}/> {loadingData ? "جارٍ التحديث..." : "تحديث البيانات"}</button></div>
    <div className="admin-overview">
      <article><span>الوحدات</span><b>{units.length}</b><small>بما فيها المسودات</small></article>
      <article><span>الدروس</span><b>{lessons.length}</b><small>محتوى محفوظ</small></article>
      <article><span>المصادر المسجلة</span><b>{sources.length}</b><small>بحالات حقوق مختلفة</small></article>
      <article><span>المقررات المتاحة للتحرير</span><b>{curriculumChoices.length}</b><small>حسب ربط المنهج بقاعدة البيانات</small></article>
    </div>
    <div className="admin-tabs" role="tablist">
      <button className={activePanel === "units" ? "active" : ""} onClick={() => setActivePanel("units")}>الوحدات</button>
      <button className={activePanel === "lessons" ? "active" : ""} onClick={() => setActivePanel("lessons")}>الدروس</button>
      <button className={activePanel === "questions" ? "active" : ""} onClick={() => setActivePanel("questions")}>الأسئلة</button>
      <button className={activePanel === "sources" ? "active" : ""} onClick={() => setActivePanel("sources")}>المصادر والحقوق</button>
    </div>
    {!isSupabaseConfigured && <div className="admin-setup-warning"><ShieldCheck/><div><b>قاعدة البيانات غير مهيّأة بعد</b><p>واجهة التحرير جاهزة، لكن الحفظ يتطلب إنشاء مشروع Supabase، تطبيق migration، ثم إضافة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في إعدادات GitHub Actions.</p></div></div>}
    {isSupabaseConfigured && <section className="admin-editor">
      {activePanel === "units" && <div className="admin-editor-grid"><form className="admin-form" onSubmit={addUnit}><div><span className="content-status">إضافة جديدة</span><h2>إنشاء وحدة دراسية</h2><p>اربط الوحدة بصف ومسار ومادة موجودة في الفهرس.</p></div><label>المقرر الدراسي<select required value={unitForm.curriculum_subject_id} onChange={(e) => setUnitForm((old) => ({ ...old, curriculum_subject_id: e.target.value }))}><option value="">اختر المقرر</option>{curriculumChoices.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label>اسم الوحدة<input required value={unitForm.title} onChange={(e) => setUnitForm((old) => ({ ...old, title: e.target.value, slug: old.slug || makeSlug(e.target.value) }))} placeholder="مثال: كمية التحرك والمقذوفات"/></label><label>المعرّف (Slug)<input value={unitForm.slug} onChange={(e) => setUnitForm((old) => ({ ...old, slug: e.target.value }))} placeholder="يُنشأ تلقائياً من العنوان"/></label><label>وصف موجز<textarea rows={3} value={unitForm.description} onChange={(e) => setUnitForm((old) => ({ ...old, description: e.target.value }))}/></label><button className="btn btn-primary" disabled={saving || !curriculumChoices.length}>حفظ الوحدة كمسودة</button></form><div className="admin-list"><h3>الوحدات الحالية</h3>{units.length ? units.map((unit) => <article key={unit.id}><span><b>{unit.title}</b><small>{unit.status}</small></span><select value={unit.status} disabled={saving} onChange={(e) => void setStatus("units", unit.id, e.target.value as "draft" | "review" | "published" | "archived")}><option value="draft">مسودة</option><option value="review">قيد المراجعة</option><option value="published">منشورة</option><option value="archived">مؤرشفة</option></select></article>) : <p>لا توجد وحدات بعد.</p>}</div></div>}
      {activePanel === "lessons" && <div className="admin-editor-grid"><form className="admin-form" onSubmit={addLesson}><div><span className="content-status">إضافة جديدة</span><h2>إنشاء درس</h2><p>اكتب شرحاً أصلياً واربطه بمصدر المنهج، ثم أضف مرجعاً علمياً دولياً عند الحاجة.</p></div><label>الوحدة<select required value={lessonForm.unit_id} onChange={(e) => setLessonForm((old) => ({ ...old, unit_id: e.target.value }))}><option value="">اختر الوحدة</option>{units.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label>عنوان الدرس<input required value={lessonForm.title} onChange={(e) => setLessonForm((old) => ({ ...old, title: e.target.value, slug: old.slug || makeSlug(e.target.value) }))}/></label><label>المعرّف (Slug)<input value={lessonForm.slug} onChange={(e) => setLessonForm((old) => ({ ...old, slug: e.target.value }))}/></label><label>نبذة تعريفية عن الدرس<textarea rows={2} value={lessonForm.summary} onChange={(e) => setLessonForm((old) => ({ ...old, summary: e.target.value }))}/></label><label>أهداف التعلّم (هدف في كل سطر)<textarea rows={3} value={lessonForm.objectives} onChange={(e) => setLessonForm((old) => ({ ...old, objectives: e.target.value }))}/></label><div className="admin-options-grid"><label>مصدر المنهج اليمني (مطلوب)<select required value={lessonForm.syllabus_source_id} onChange={(e) => setLessonForm((old) => ({ ...old, syllabus_source_id: e.target.value }))}><option value="">اختر مصدر المنهج والطبعة</option>{sources.filter((item) => item.source_type === "curriculum_authority" || item.source_type === "textbook").map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label>موضع المصدر (الصفحات / الفهرس)<input value={lessonForm.syllabus_locator} onChange={(e) => setLessonForm((old) => ({ ...old, syllabus_locator: e.target.value }))} placeholder="مثال: فهرس الوحدة، ص 12–18"/></label></div><div className="admin-options-grid"><label>مرجع دولي للتحقق (اختياري)<select value={lessonForm.reference_source_id} onChange={(e) => setLessonForm((old) => ({ ...old, reference_source_id: e.target.value }))}><option value="">لا يوجد</option>{sources.filter((item) => item.source_type !== "curriculum_authority" && item.source_type !== "textbook").map((item) => <option key={item.id} value={item.id}>{item.title} · {item.reuse_policy}</option>)}</select></label><label>موضع المرجع الدولي<input value={lessonForm.reference_locator} onChange={(e) => setLessonForm((old) => ({ ...old, reference_locator: e.target.value }))} placeholder="الفصل / القسم / الصفحة"/></label></div><label>محتوى الدرس — Markdown<textarea required rows={9} value={lessonForm.content_md} onChange={(e) => setLessonForm((old) => ({ ...old, content_md: e.target.value }))} placeholder={"## الفكرة الأساسية\\n\\nشرح أصلي للمفهوم...\\n\\n## مثال محلول\\nخطوات الحل..."}/></label><label>وقت الدراسة بالدقائق<input type="number" min="1" max="240" value={lessonForm.estimated_minutes} onChange={(e) => setLessonForm((old) => ({ ...old, estimated_minutes: e.target.value }))}/></label><button className="btn btn-primary" disabled={saving || !units.length}>حفظ الدرس كمسودة</button></form><div className="admin-list"><h3>الدروس الحالية</h3>{lessons.length ? lessons.map((lesson) => <article key={lesson.id}><span><b>{lesson.title}</b><small>{units.find((item) => item.id === lesson.unit_id)?.title || "وحدة"} · {lesson.status}</small></span><select value={lesson.status} disabled={saving} onChange={(e) => void setStatus("lessons", lesson.id, e.target.value as "draft" | "review" | "published" | "archived")}><option value="draft">مسودة</option><option value="review">قيد المراجعة</option><option value="published">منشور</option><option value="archived">مؤرشف</option></select></article>) : <p>لا توجد دروس بعد.</p>}</div></div>}
      {activePanel === "questions" && <div className="admin-form admin-form-wide"><div><span className="content-status">بنك الأسئلة</span><h2>إضافة سؤال اختيار من متعدد</h2><p>مفتاح الإجابة يُحفظ في جدول خاص غير متاح للطلاب وفق سياسات RLS.</p></div><form onSubmit={addQuestion}><label>الدرس<select required value={questionForm.lesson_id} onChange={(e) => setQuestionForm((old) => ({ ...old, lesson_id: e.target.value }))}><option value="">اختر الدرس</option>{lessons.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label>نص السؤال<textarea required rows={3} value={questionForm.prompt} onChange={(e) => setQuestionForm((old) => ({ ...old, prompt: e.target.value }))}/></label><div className="admin-options-grid">{[1,2,3,4].map((number) => <label key={number}>الخيار {number}<input required value={questionForm[("option" + number) as "option1" | "option2" | "option3" | "option4"]} onChange={(e) => setQuestionForm((old) => ({ ...old, [("option" + number) as "option1" | "option2" | "option3" | "option4"]: e.target.value }))}/></label>)}</div><div className="admin-options-grid"><label>الإجابة الصحيحة<select value={questionForm.correct} onChange={(e) => setQuestionForm((old) => ({ ...old, correct: e.target.value }))}><option value="0">الخيار 1</option><option value="1">الخيار 2</option><option value="2">الخيار 3</option><option value="3">الخيار 4</option></select></label><label>الصعوبة<select value={questionForm.difficulty} onChange={(e) => setQuestionForm((old) => ({ ...old, difficulty: e.target.value }))}><option value="easy">سهل</option><option value="medium">متوسط</option><option value="hard">متقدم</option></select></label></div><label>تفسير الإجابة<textarea required rows={3} value={questionForm.explanation} onChange={(e) => setQuestionForm((old) => ({ ...old, explanation: e.target.value }))}/></label><button className="btn btn-primary" disabled={saving || !lessons.length}>حفظ السؤال ومفتاحه كمسودة</button></form></div>}
      {activePanel === "sources" && <div className="admin-editor-grid"><form className="admin-form" onSubmit={addSource}><div><span className="content-status">توثيق المصدر</span><h2>تسجيل مصدر المحتوى</h2><p>سجّل الطبعة والناشر وحالة الحقوق قبل اعتماد أي درس.</p></div><label>اسم المصدر<input required value={sourceForm.title} onChange={(e) => setSourceForm((old) => ({ ...old, title: e.target.value }))}/></label><label>الجهة الناشرة<input value={sourceForm.publisher} onChange={(e) => setSourceForm((old) => ({ ...old, publisher: e.target.value }))}/></label><div className="admin-options-grid"><label>العام الدراسي / سنة النشر<input value={sourceForm.publication_year} onChange={(e) => setSourceForm((old) => ({ ...old, publication_year: e.target.value }))}/></label><label>الطبعة<input value={sourceForm.edition} onChange={(e) => setSourceForm((old) => ({ ...old, edition: e.target.value }))}/></label></div><label>رابط المصدر (للتوثيق الداخلي)<input type="url" value={sourceForm.source_url} onChange={(e) => setSourceForm((old) => ({ ...old, source_url: e.target.value }))}/></label><label>نوع المصدر<select value={sourceForm.source_type} onChange={(e) => setSourceForm((old) => ({ ...old, source_type: e.target.value }))}><option value="curriculum_authority">جهة اعتماد المنهج</option><option value="textbook">كتاب دراسي</option><option value="open_educational_resource">مورد تعليمي مفتوح</option><option value="scientific_reference">مرجع علمي</option><option value="primary_source">مصدر أولي</option><option value="interactive_tool">أداة تفاعلية</option><option value="dataset">مجموعة بيانات</option><option value="educational_reference">مرجع تعليمي</option></select></label><div className="admin-options-grid"><label>اسم الرخصة (إن وجدت)<input value={sourceForm.licence_name} onChange={(e) => setSourceForm((old) => ({ ...old, licence_name: e.target.value }))} placeholder="مثال: CC BY-NC-SA 4.0"/></label><label>رابط نص الرخصة<input type="url" value={sourceForm.licence_url} onChange={(e) => setSourceForm((old) => ({ ...old, licence_url: e.target.value }))}/></label></div><label>سياسة إعادة الاستخدام<select value={sourceForm.reuse_policy} onChange={(e) => setSourceForm((old) => ({ ...old, reuse_policy: e.target.value }))}><option value="link_only">رابط خارجي فقط</option><option value="reference_only">للاستناد والتحقق فقط</option><option value="reuse_allowed">إعادة الاستخدام مسموحة حسب الرخصة</option><option value="reuse_allowed_noncommercial">غير تجاري فقط</option><option value="public_domain_verified">ملك عام تم التحقق منه</option><option value="permission_required">يتطلب إذناً</option></select></label><label>حالة حقوق الاستخدام<select value={sourceForm.rights_status} onChange={(e) => setSourceForm((old) => ({ ...old, rights_status: e.target.value }))}><option value="needs_review">تحتاج مراجعة</option><option value="original">محتوى أصلي</option><option value="licensed">مرخّص</option><option value="public_domain">ملك عام</option><option value="link_only">رابط فقط</option><option value="permission_required">يتطلب إذناً</option></select></label><label>ملاحظات التحقق والحقوق<textarea rows={3} value={sourceForm.rights_notes} onChange={(e) => setSourceForm((old) => ({ ...old, rights_notes: e.target.value }))}/></label><button className="btn btn-primary" disabled={saving}>حفظ المصدر</button></form><div className="admin-list"><h3>المصادر المسجلة</h3>{sources.length ? sources.map((source) => <article key={source.id}><span><b>{source.title}</b><small>{source.rights_status} · {source.reuse_policy}</small></span></article>) : <p>لم تُسجل مصادر بعد.</p>}</div></div>}
    </section>}
    <div className="admin-status" role="status">{health}</div>
    <p className="admin-footnote"><ShieldCheck size={15}/> جميع العناصر الجديدة تُحفظ كمسودات. انشر فقط بعد مطابقة الطبعة، مراجعة الدرس والأسئلة، والتحقق من حقوق الاستخدام. لا تُعرض مفاتيح الإجابة للطلاب مباشرة.</p>
  </main>;
}

function NotFound() {
  return <main className="container page not-found"><span className="eyebrow">404</span><h1>الصفحة غير موجودة.</h1><Link className="btn btn-primary" to="/">العودة للرئيسية <ArrowLeft size={16}/></Link></main>;
}

export default function App() {
  const { loading, role } = useAuth();
  const { progress, complete, toggleSaved, addScore } = useStudyProgress();
  if (loading) return <div className="app-loading"><BrandMark/> Yemen Study</div>;
  return <div className="app-shell"><SitePhotoBackground/><Header/><Suspense fallback={<div className="route-loading" role="status" aria-live="polite"><span/>جارٍ فتح الصفحة...</div>}><Routes>
    <Route path="/" element={<HomePage progress={progress}/>}/>
    <Route path="/curriculum" element={<CurriculumPage/>}/>
    <Route path="/grade/:gradeSlug" element={<GradePage/>}/>
    <Route path="/subject/:gradeSlug/:trackSlug/:subjectSlug" element={<SubjectPage progress={progress}/>}/>
    <Route path="/library-lesson/:lessonId" element={<PublishedLessonPage progress={progress} complete={complete} toggleSaved={toggleSaved}/>}/>
    <Route path="/lesson/:lessonSlug" element={<LessonPage progress={progress} complete={complete} toggleSaved={toggleSaved}/>}/>
    <Route path="/grade-12-study" element={<Grade12PhysicsStudyPage/>}/>
    <Route path="/grade-12-books" element={<Grade12BooksPage/>}/>
    <Route path="/grade-12-learning" element={<Grade12LearningHubPage/>}/>
    <Route path="/mock-exam" element={<StudyToolLayout><MockExamPage addScore={addScore}/></StudyToolLayout>}/>
    <Route path="/target-test" element={<StudyToolLayout><TargetTestPage/></StudyToolLayout>}/>
    <Route path="/strengths-weaknesses" element={<StudyToolLayout><StrengthsWeaknessesPage/></StudyToolLayout>}/>
    <Route path="/guided-study" element={<StudyToolLayout><GuidedStudyPage/></StudyToolLayout>}/>
    <Route path="/guided-practice" element={<StudyToolLayout><GuidedPracticePage/></StudyToolLayout>}/>
    <Route path="/smart-mark" element={<StudyToolLayout><SmartMarkPage/></StudyToolLayout>}/>
    <Route path="/teacher/test-builder" element={<TestBuilderPage role={role}/>}/>
    <Route path="/past-papers" element={<StudyToolLayout><PastPapersPage/></StudyToolLayout>}/>
    <Route path="/study-plan" element={<StudyToolLayout><StudyPlanPage/></StudyToolLayout>}/>
    <Route path="/dashboard" element={<StudyToolLayout><DashboardPage progress={progress}/></StudyToolLayout>}/>
    <Route path="/admin" element={<AdminPage/>}/>
    <Route path="/academy-council" element={<AcademyCouncilPage/>}/>
    <Route path="/login" element={<LoginPage/>}/>
    <Route path="*" element={<NotFound/>}/>
  </Routes></Suspense><footer className="site-footer"><div className="container footer-inner"><Link to="/" className="footer-brand"><BrandMark compact/><b>Yemen Study</b></Link><span>منصة مراجعة للمناهج اليمنية</span><div><Link to="/curriculum">المواد الدراسية</Link><Link to="/study-plan">خطة المذاكرة</Link><Link to="/dashboard">مساحة الطالب</Link></div><small>© {new Date().getFullYear()} Yemen Study</small></div></footer></div>;
}
