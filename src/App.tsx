import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft, Award, Bookmark, BookOpen, BookOpenCheck,
  Brain, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft,
  CircleHelp, Clock3, FileText, GraduationCap, Layers3,
  LogOut, Menu, Play, RotateCcw, Search, ShieldCheck, Sparkles,
  Target, Timer, Trophy, X, Zap
} from "lucide-react";
import { Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./lib/auth";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import { countAllSubjectEntries, findSubjects, getGrade, getSubjectCount, grades, type GradeEntry } from "./data/catalog";
import { demoCourse, demoLesson, type Question } from "./data/learning";
import { GuidedPracticePage, GuidedStudyPage, SmartMarkPage, StrengthsWeaknessesPage, TargetTestPage, TestBuilderPage } from "./StudyTools";
import "./study-tools.css";

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

function Header() {
  const { user, role, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const navigate = useNavigate();
  const logout = async () => { await signOut(); navigate("/"); setMenuOpen(false); };
  return <>
    <div className="announcement"><span><Sparkles size={13}/> منصة مراجعة للمناهج اليمنية</span><span>ملاحظات · تدريب · اختبارات · تقدّمك في مكان واحد</span></div>
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="Yemen Study">
          <span className="brand-mark"><BookOpenCheck size={23}/></span>
          <span className="brand-copy"><b>Yemen Study</b><small>تعلّم. تدرّب. أتقن.</small></span>
        </Link>
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="القائمة">{menuOpen ? <X/> : <Menu/>}</button>
        <nav className={menuOpen ? "main-nav open" : "main-nav"}>
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>الرئيسية</NavLink>
          <NavLink to="/curriculum" onClick={() => setMenuOpen(false)}>المواد الدراسية</NavLink>
          <NavLink to="/past-papers" onClick={() => setMenuOpen(false)}>أوراق الامتحانات</NavLink>
          <NavLink to="/study-plan" onClick={() => setMenuOpen(false)}>خطة المذاكرة</NavLink>
          <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>مساحة الطالب</NavLink>
          {(role === "admin" || role === "editor") && <NavLink to="/admin" onClick={() => setMenuOpen(false)}>إدارة المحتوى</NavLink>}
          <div className={toolsOpen ? "nav-dropdown open" : "nav-dropdown"}>
            <button type="button" className="nav-dropdown-trigger" aria-expanded={toolsOpen} onClick={() => setToolsOpen((open) => !open)}>أدوات الدراسة <ChevronDown size={14}/></button>
            {toolsOpen && <div className="nav-dropdown-panel">
              <Link to="/target-test" onClick={() => { setToolsOpen(false); setMenuOpen(false); }}><Target size={15}/> الاختبار المستهدف</Link>
              <Link to="/strengths-weaknesses" onClick={() => { setToolsOpen(false); setMenuOpen(false); }}><Brain size={15}/> نقاط القوة والضعف</Link>
              <Link to="/guided-study" onClick={() => { setToolsOpen(false); setMenuOpen(false); }}><BookOpen size={15}/> الدراسة الموجّهة</Link>
              <Link to="/guided-practice" onClick={() => { setToolsOpen(false); setMenuOpen(false); }}><Target size={15}/> التدريب الموجّه</Link>
              <Link to="/smart-mark" onClick={() => { setToolsOpen(false); setMenuOpen(false); }}><Sparkles size={15}/> مراجع الإجابة</Link>
              <Link to="/teacher/test-builder" onClick={() => { setToolsOpen(false); setMenuOpen(false); }}><FileText size={15}/> محرر الاختبارات للمعلمين</Link>
            </div>}
          </div>
          {user ? <button className="nav-account" onClick={logout}><LogOut size={15}/> خروج</button> : <Link className="nav-account" to="/login" onClick={() => setMenuOpen(false)}>دخول / حساب جديد <ArrowLeft size={15}/></Link>}
        </nav>
      </div>
    </header>
  </>;
}

function SearchBox({ large = false }: { large?: boolean }) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => findSubjects(query).slice(0, 6), [query]);
  const navigate = useNavigate();
  return <div className={large ? "search-box search-box-large" : "search-box"}>
    <Search size={19}/>
    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن الصف أو المادة الدراسية..." aria-label="ابحث في المنهج"/>
    {query && <button className="search-clear" onClick={() => setQuery("")} aria-label="مسح"><X size={15}/></button>}
    <button className="search-action" onClick={() => navigate("/curriculum?q=" + encodeURIComponent(query))}>ابحث <ArrowLeft size={15}/></button>
    {matches.length > 0 && <div className="search-results">{matches.map(({ grade, track, subject }) =>
      <Link key={grade.slug + track.slug + subject.slug} to={"/subject/" + grade.slug + "/" + track.slug + "/" + subject.slug}>
        <span>{subject.name}</span><small>{grade.name} · {track.name}</small><ChevronLeft size={15}/>
      </Link>)}</div>}
  </div>;
}

function GradeCard({ grade }: { grade: GradeEntry }) {
  return <Link className="grade-card" to={"/grade/" + grade.slug}>
    <span className="grade-card-num">{String(grade.number).padStart(2, "0")}</span>
    <span className="grade-card-copy"><b>{grade.name}</b><small>{grade.stage === "basic" ? "التعليم الأساسي" : "التعليم الثانوي"} · {getSubjectCount(grade)} مواد/مسارات</small></span>
    <ChevronLeft className="grade-card-arrow" size={17}/>
  </Link>;
}

function ToolCard({ icon: Icon, title, description, to, tag }: { icon: typeof BookOpen; title: string; description: string; to: string; tag?: string }) {
  return <Link className="tool-card" to={to}>
    <span className="tool-icon"><Icon size={22}/></span>
    {tag && <small className="tool-tag">{tag}</small>}
    <h3>{title}</h3><p>{description}</p><span className="tool-link">ابدأ الآن <ArrowLeft size={15}/></span>
  </Link>;
}

function HomePage() {
  const demoGrade = getGrade("grade-12");
  const demoTrack = demoGrade?.tracks.find((item) => item.slug === "scientific");
  const demoPhysics = demoTrack?.subjects.find((item) => item.slug === "physics");
  return <main>
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-copy">
          <span className="hero-kicker"><span/> منصة المراجعة للمناهج اليمنية</span>
          <h1>كل ما تحتاجه<br/><em>لتستعد لامتحاناتك.</em></h1>
          <p>ملاحظات مراجعة مرتبة، أسئلة حسب الموضوع، بطاقات تعليمية واختبارات تدريبية. اختر صفك ومادتك وابدأ من حيث أنت.</p>
          <div className="hero-buttons"><Link className="btn btn-primary" to="/curriculum">استكشف المواد <ArrowLeft size={17}/></Link><Link className="btn btn-outline" to="/study-plan">أنشئ خطة مذاكرتك</Link></div>
          <div className="hero-trust"><ShieldCheck size={16}/> محتوى تعليمي أصلي، مرتبط بالمنهج ويُراجع قبل اعتماده.</div>
        </div>
        <div className="hero-visual" aria-label="أدوات المراجعة">
          <div className="hero-visual-top"><span>مساحة المراجعة</span><span className="live-dot"/> <small>ابدأ التعلّم</small></div>
          <div className="hero-visual-title">خطوة صغيرة<br/>كل يوم تصنع فرقاً.</div>
          <div className="hero-visual-list">
            <div><span className="visual-icon"><BookOpen size={18}/></span><span><b>ملاحظات منظمة</b><small>افهم الفكرة قبل حفظها</small></span><span className="visual-index">01</span></div>
            <div><span className="visual-icon"><Target size={18}/></span><span><b>تدريب حسب الموضوع</b><small>اختبر فهمك مباشرة</small></span><span className="visual-index">02</span></div>
            <div><span className="visual-icon"><Trophy size={18}/></span><span><b>تابع تقدّمك</b><small>اعرف ما أتقنته وما يحتاج مراجعة</small></span><span className="visual-index">03</span></div>
          </div>
          <div className="hero-visual-bottom"><span>YEMEN STUDY</span><span>LEARN · PRACTISE · MASTER</span></div>
        </div>
      </div>
    </section>
    <section className="container search-section">
      <div><span className="eyebrow">ابدأ المراجعة</span><h2>ماذا تدرس اليوم؟</h2><p>ابحث باسم صفك أو مادتك الدراسية.</p></div>
      <SearchBox large/>
    </section>
    <section className="container section">
      <div className="section-heading"><div><span className="eyebrow">أدوات التعلّم</span><h2>كل طريقة للمراجعة، في مكان واحد.</h2></div><p>انتقل بسلاسة من فهم الدرس إلى التدريب ثم قياس مستواك.</p></div>
      <div className="tools-grid">
        <ToolCard icon={BookOpen} title="ملاحظات المراجعة" description="شروحات منظمة، مفاهيم أساسية، قوانين ورسوم وأمثلة محلولة." to="/curriculum" tag="افهم"/>
        <ToolCard icon={Target} title="أسئلة حسب الموضوع" description="تدرّب على أسئلة متدرجة واكشف سبب صحة الإجابة." to="/curriculum" tag="تدرّب"/>
        <ToolCard icon={Brain} title="البطاقات التعليمية" description="اختبر تذكّرك للمفاهيم والتعاريف في جلسات قصيرة." to="/subject/grade-12/scientific/physics" tag="تذكّر"/>
        <ToolCard icon={Timer} title="الاختبارات التجريبية" description="حاكي أجواء الاختبار وتعرّف على نتيجتك ونقاط ضعفك." to="/mock-exam" tag="اختبر"/>
        <ToolCard icon={FileText} title="أوراق الامتحانات" description="مساحة للامتحانات السابقة ونماذج الإجابة المعتمدة." to="/past-papers" tag="استعد"/>
        <ToolCard icon={CalendarDays} title="خطة المذاكرة" description="قسّم وقتك إلى مهام يومية وتابع ما أنجزته." to="/study-plan" tag="نظّم"/>
        <ToolCard icon={Target} title="الاختبار المستهدف" description="اختر مستوى الصعوبة والوقت وركّز على موضوع محدد." to="/target-test" tag="ركّز"/>
        <ToolCard icon={Brain} title="نقاط القوة والضعف" description="اعرف الأسئلة التي تتقنها والتي تحتاج إلى مراجعة." to="/strengths-weaknesses" tag="حلّل"/>
        <ToolCard icon={BookOpen} title="الدراسة الموجّهة" description="تعلّم الموضوع خطوة بخطوة مع تلميحات توضيحية." to="/guided-study" tag="تعلّم"/>
        <ToolCard icon={Target} title="التدريب الموجّه" description="حل سؤالاً في كل مرة وتابع تفسير الإجابة." to="/guided-practice" tag="تدرّب"/>
        <ToolCard icon={Sparkles} title="مراجع الإجابة" description="راجع إجابتك وفق عناصر أساسية ونموذج للمقارنة." to="/smart-mark" tag="راجع"/>
      </div>
    </section>
    <section className="grade-band">
      <div className="container">
        <div className="section-heading"><div><span className="eyebrow">اختر مرحلتك وصفك</span><h2>ابدأ من المنهج الذي تدرسه.</h2></div><Link className="text-link" to="/curriculum">عرض جميع الصفوف <ArrowLeft size={16}/></Link></div>
        <div className="grades-grid">{grades.map((grade) => <GradeCard key={grade.slug} grade={grade}/>)}</div>
      </div>
    </section>
    <section className="container section featured-section">
      <div className="section-heading"><div><span className="eyebrow">جرّب تجربة المذاكرة</span><h2>ادخل إلى مساحة الدرس التفاعلية.</h2></div></div>
      <Link className="featured-course" to={demoGrade && demoTrack && demoPhysics ? "/subject/" + demoGrade.slug + "/" + demoTrack.slug + "/" + demoPhysics.slug : "/curriculum"}>
        <div className="featured-course-art"><span>PHYSICS</span><BookOpenCheck size={58}/><small>YEMEN STUDY · DEMO LESSON</small></div>
        <div className="featured-course-copy"><span className="course-status">نموذج تفاعلي للتجربة</span><h3>الفيزياء · الثالث الثانوي العلمي</h3><p>شاهد كيف ستعمل ملاحظات الدروس والأسئلة والبطاقات والاختبارات داخل المنصة.</p><span className="tool-link">افتح المادة التجريبية <ArrowLeft size={15}/></span></div>
      </Link>
    </section>
    <section className="bottom-cta"><div className="container bottom-cta-inner"><div><span className="eyebrow">خطوتك التالية</span><h2>ابدأ بمادة واحدة، وتقدّم بثبات.</h2><p>اختر صفك وابنِ عادة مراجعة تناسب وقتك.</p></div><Link className="btn btn-light" to="/curriculum">اختر المادة <ArrowLeft size={17}/></Link></div></section>
  </main>;
}

function CurriculumPage() {
  const [stage, setStage] = useState<"all" | "basic" | "secondary">("all");
  const [query, setQuery] = useState(new URLSearchParams(window.location.search).get("q") || "");
  const filtered = grades.filter((grade) => (stage === "all" || grade.stage === stage) &&
    (!query.trim() || grade.name.includes(query.trim()) || grade.tracks.some((track) => track.subjects.some((subject) => subject.name.includes(query.trim())))));
  return <main className="container page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><b>المواد الدراسية</b></div>
    <div className="page-title-row"><div><span className="eyebrow">فهرس المنهج</span><h1>اختر صفك الدراسي.</h1><p>تصفّح المواد حسب الصف والمسار، ثم افتح موارد كل مادة.</p></div><div className="catalog-count"><b>{countAllSubjectEntries()}</b><span>مادة/مسار في الفهرس الأولي</span></div></div>
    <div className="catalog-toolbar"><div className="filter-pills">
      <button className={stage === "all" ? "filter-pill active" : "filter-pill"} onClick={() => setStage("all")}>كل الصفوف</button>
      <button className={stage === "basic" ? "filter-pill active" : "filter-pill"} onClick={() => setStage("basic")}>التعليم الأساسي</button>
      <button className={stage === "secondary" ? "filter-pill active" : "filter-pill"} onClick={() => setStage("secondary")}>التعليم الثانوي</button>
    </div><label className="inline-search"><Search size={16}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن الصف أو المادة"/></label></div>
    <div className="grades-grid curriculum-grid">{filtered.map((grade) => <GradeCard key={grade.slug} grade={grade}/>)}</div>
    {filtered.length === 0 && <div className="empty-panel"><Search/><h3>لا توجد نتائج</h3><p>جرّب كلمة بحث أخرى.</p></div>}
    <p className="data-note"><ShieldCheck size={15}/> فهرس أولي للصفوف والمواد. يجب تأكيد المنطقة الدراسية والطبعة قبل نشر الدروس بوصفها معتمدة.</p>
  </main>;
}

function GradePage() {
  const { gradeSlug = "" } = useParams();
  const grade = getGrade(gradeSlug);
  const [trackSlug, setTrackSlug] = useState(grade?.tracks[0]?.slug || "general");
  if (!grade) return <NotFound/>;
  const track = grade.tracks.find((item) => item.slug === trackSlug) || grade.tracks[0];
  return <main className="container page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><Link to="/curriculum">المواد</Link><ChevronLeft size={14}/><b>{grade.name}</b></div>
    <div className="page-title-row"><div><span className="eyebrow">{grade.stage === "basic" ? "التعليم الأساسي" : "التعليم الثانوي"}</span><h1>{grade.name}</h1><p>{grade.description}</p></div><div className="catalog-count"><b>{getSubjectCount(grade)}</b><span>مادة / مسار</span></div></div>
    {grade.tracks.length > 1 && <div className="filter-pills track-pills">{grade.tracks.map((item) => <button key={item.slug} className={track.slug === item.slug ? "filter-pill active" : "filter-pill"} onClick={() => setTrackSlug(item.slug)}>{item.name}</button>)}</div>}
    <div className="subject-list-heading"><h2>المواد الدراسية</h2><span>{track.name}</span></div>
    <div className="subject-grid">{track.subjects.map((subject, index) => <Link className="subject-tile" key={subject.slug} to={"/subject/" + grade.slug + "/" + track.slug + "/" + subject.slug}>
      <span className="subject-number">{String(index + 1).padStart(2, "0")}</span><div><h3>{subject.name}</h3><p>ملاحظات مراجعة · أسئلة · بطاقات · اختبارات</p></div><ChevronLeft size={18}/>
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

function SubjectPage({ progress, toggleSaved }: { progress: Progress; toggleSaved: (id: string) => void }) {
  const { gradeSlug = "", trackSlug = "", subjectSlug = "" } = useParams();
  const grade = getGrade(gradeSlug);
  const track = grade?.tracks.find((item) => item.slug === trackSlug);
  const subject = track?.subjects.find((item) => item.slug === subjectSlug);
  const [activeTab, setActiveTab] = useState<StudyTab>("notes");
  const [expanded, setExpanded] = useState(true);
  const isDemo = gradeSlug === "grade-12" && trackSlug === "scientific" && subjectSlug === "physics";
  if (!grade || !track || !subject) return <NotFound/>;
  const lessonDone = progress.completed.includes(demoLesson.slug);
  return <main className="container page subject-page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><Link to={"/grade/" + grade.slug}>{grade.name}</Link><ChevronLeft size={14}/><b>{subject.name}</b></div>
    <div className="course-heading"><div><span className="eyebrow">{grade.name} · {track.name}</span><h1>{subject.name}</h1><p>موارد المراجعة والتدريب الخاصة بالمادة.</p></div><div className="course-progress"><span>تقدّمك في المادة</span><b>{isDemo && lessonDone ? "100%" : "0%"}</b><div className="progress-track"><i style={{ width: isDemo && lessonDone ? "100%" : "0%" }}/></div></div></div>
    <div className="course-shell">
      <aside className="course-sidebar">
        <div className="sidebar-title"><span>محتويات المادة</span><button onClick={() => setExpanded(!expanded)} aria-label="توسيع/طي"><ChevronDown className={expanded ? "" : "collapsed"} size={16}/></button></div>
        {expanded && <div className="sidebar-tree">
          <div className="tree-unit"><span className="tree-unit-dot"/> {isDemo ? demoCourse.unitTitle : "الوحدات والموضوعات"}</div>
          {isDemo ? <Link className="tree-lesson active" to="/lesson/scalars-and-vectors"><span className="tree-lesson-dot"/><span>{demoLesson.title}</span>{lessonDone && <Check size={14}/>}</Link> : <div className="tree-placeholder">تُضاف الموضوعات بعد توثيق فهرس الطبعة الدراسية المعتمدة.</div>}
        </div>}
        <div className="sidebar-tools">
          <Link to="/study-plan"><CalendarDays size={16}/> خطة المذاكرة</Link>
          <Link to="/dashboard"><Award size={16}/> تقدّم الطالب</Link>
        </div>
      </aside>
      <section className="course-main">
        <div className="course-tabs" role="tablist">{tabs.map(({ id, label, icon: Icon }) => <button key={id} role="tab" aria-selected={activeTab === id} className={activeTab === id ? "course-tab active" : "course-tab"} onClick={() => setActiveTab(id)}><Icon size={16}/><span>{label}</span></button>)}</div>
        {!isDemo ? <div className="content-coming">
          <span className="content-icon"><BookOpen size={26}/></span><span className="content-status">قيد إعداد المحتوى</span>
          <h2>مساحة {subject.name} جاهزة لاستقبال مواردها.</h2>
          <p>ستظهر هنا ملاحظات الدروس والأسئلة والبطاقات والاختبارات بعد توثيق وحدات الكتاب والطبعة المعتمدة. لم نضع دروساً عشوائية أو عناوين غير مؤكدة.</p>
          <div className="coming-feature-grid"><span><BookOpen/> ملاحظات المراجعة</span><span><Target/> الأسئلة والإجابات</span><span><Layers3/> البطاقات التعليمية</span><span><Timer/> الاختبارات التجريبية</span></div>
        </div> : <>
          {activeTab === "notes" && <div className="resource-list">
            <div className="resource-toolbar"><div><span className="content-status">نموذج تفاعلي</span><h2>ملاحظات المراجعة</h2><p>ملاحظات تعليمية منظمة مع أمثلة وتلخيص سريع.</p></div><button className={progress.saved.includes(demoLesson.slug) ? "save-button saved" : "save-button"} onClick={() => toggleSaved(demoLesson.slug)}><Bookmark size={16}/>{progress.saved.includes(demoLesson.slug) ? "محفوظ" : "احفظ الدرس"}</button></div>
            <Link className="lesson-row" to="/lesson/scalars-and-vectors"><span className="lesson-row-icon"><FileText size={19}/></span><span className="lesson-row-copy"><b>{demoLesson.title}</b><small>{demoLesson.duration} دقيقة · {demoLesson.sections.length} أقسام · مثال محلول</small></span><span className="lesson-row-state">{lessonDone ? <><CheckCircle2 size={15}/> مكتمل</> : "ابدأ الدرس"}</span><ChevronLeft size={17}/></Link>
            <div className="resource-disclaimer"><ShieldCheck size={16}/> هذا نموذج أولي لعرض تجربة المنصة، وليس محتوى وزارياً معتمداً بعد.</div>
          </div>}
          {activeTab === "questions" && <PracticePanel questions={demoLesson.questions}/>}
          {activeTab === "flashcards" && <FlashcardsPanel/>}
          {activeTab === "exams" && <div className="exam-card"><span className="exam-card-icon"><Timer size={24}/></span><div><span className="content-status">اختبار قصير · 5 دقائق</span><h2>اختبر فهمك للكميات القياسية والمتجهة</h2><p>3 أسئلة اختيار من متعدد مع تصحيح وتفسير لكل إجابة.</p><Link className="btn btn-primary" to="/mock-exam">ابدأ الاختبار <ArrowLeft size={16}/></Link></div></div>}
          {activeTab === "papers" && <div className="paper-empty"><FileText size={25}/><h2>أوراق الامتحانات</h2><p>لن نعرض أوراقاً غير موثقة. ستضاف نماذج الامتحانات السابقة مع سنة الامتحان ومصدرها ومفتاح الإجابة بعد مراجعة حقوق استخدامها.</p><Link to="/past-papers" className="text-link">عرض مكتبة الأوراق <ArrowLeft size={15}/></Link></div>}
        </>}
      </section>
    </div>
  </main>;
}

function PracticePanel({ questions }: { questions: Question[] }) {
  const [difficulty, setDifficulty] = useState("all");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState(false);
  const visibleQuestions = useMemo(
    () => questions.filter((question) => difficulty === "all" || question.difficulty === difficulty),
    [questions, difficulty],
  );
  const score = visibleQuestions.filter((question) => answers[question.id] === question.correctIndex).length;
  const answeredCount = visibleQuestions.filter((question) => answers[question.id] !== undefined).length;
  const recordPractice = () => {
    setChecked(true);
    try {
      const saved = JSON.parse(localStorage.getItem("yemen-study-attempts-v1") || "[]") as Array<Record<string, unknown>>;
      const attempt = {
        id: String(Date.now()), createdAt: new Date().toISOString(), score, total: visibleQuestions.length,
        answers: visibleQuestions.map((question) => ({
          questionId: question.id, correct: answers[question.id] === question.correctIndex,
          difficulty: question.difficulty,
        })),
        source: "mock",
      };
      localStorage.setItem("yemen-study-attempts-v1", JSON.stringify([...saved, attempt]));
    } catch { /* Local progress is best-effort when storage is unavailable. */ }
  };
  return <div className="practice-panel">
    <div className="resource-toolbar">
      <div><span className="content-status">تدريب حسب الموضوع</span><h2>اختبر فهمك</h2><p>{visibleQuestions.length} أسئلة · اختر مستوى الصعوبة ثم أجب وصحّح.</p></div>
      <label className="practice-filter"><span>مستوى الصعوبة</span><select value={difficulty} onChange={(event) => { setDifficulty(event.target.value); setChecked(false); setAnswers({}); }}><option value="all">كل المستويات</option><option value="سهل">سهل</option><option value="متوسط">متوسط</option><option value="متقدم">متقدم</option></select></label>
    </div>
    {visibleQuestions.length === 0 ? <div className="empty-panel"><Target/><h3>لا توجد أسئلة بهذا المستوى</h3><p>اختر مستوى آخر لعرض الأسئلة المتاحة.</p></div> : visibleQuestions.map((question, index) => <article className="practice-question" key={question.id}>
      <div className="question-top"><span>السؤال {index + 1} من {visibleQuestions.length}</span><span className="difficulty">{question.difficulty}</span></div>
      <h3>{question.prompt}</h3>
      <div className="answer-options">{question.options.map((option, optionIndex) => <button type="button" key={option} disabled={checked} className={checked && optionIndex === question.correctIndex ? "answer-option correct" : checked && answers[question.id] === optionIndex ? "answer-option incorrect" : answers[question.id] === optionIndex ? "answer-option chosen" : "answer-option"} onClick={() => setAnswers((old) => ({ ...old, [question.id]: optionIndex }))}><span>{["أ","ب","ج","د"][optionIndex]}</span>{option}{checked && optionIndex === question.correctIndex && <Check size={16}/>}</button>)}</div>
      {checked && <div className={answers[question.id] === question.correctIndex ? "answer-explanation good" : "answer-explanation"}><b>{answers[question.id] === question.correctIndex ? "إجابة صحيحة" : "راجع هذه الفكرة"}</b><p>{question.explanation}</p></div>}
    </article>)}
    {visibleQuestions.length > 0 && (!checked ? <div className="practice-footer"><span>{answeredCount} من {visibleQuestions.length} تمت الإجابة عنها</span><button className="btn btn-primary" disabled={answeredCount !== visibleQuestions.length} onClick={recordPractice}>صحّح إجاباتي <CheckCircle2 size={17}/></button></div> : <div className="practice-result"><Trophy size={22}/><div><b>نتيجتك: {score} من {visibleQuestions.length}</b><p>راجع تفسيرات الإجابات ثم أعد المحاولة لتعزيز فهمك.</p></div><button className="btn btn-outline" onClick={() => { setAnswers({}); setChecked(false); }}>إعادة المحاولة</button></div>)}
  </div>;
}

function FlashcardsPanel() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<string, "known" | "review">>(() => {
    try {
      const saved = localStorage.getItem("yemen-study-flashcard-ratings-v1");
      return saved ? JSON.parse(saved) as Record<string, "known" | "review"> : {};
    } catch { return {}; }
  });
  const card = demoLesson.flashcards[index];
  const knownCount = Object.values(ratings).filter((value) => value === "known").length;
  const reviewCount = Object.values(ratings).filter((value) => value === "review").length;
  useEffect(() => {
    try { localStorage.setItem("yemen-study-flashcard-ratings-v1", JSON.stringify(ratings)); } catch { /* storage may be unavailable */ }
  }, [ratings]);
  const move = (next: number) => {
    setIndex(next);
    setFlipped(false);
  };
  const rate = (value: "known" | "review") => {
    setRatings((old) => ({ ...old, [String(index)]: value }));
    if (index < demoLesson.flashcards.length - 1) move(index + 1);
  };
  return <div className="flashcards-panel">
    <div className="resource-toolbar"><div><span className="content-status">مراجعة نشطة</span><h2>البطاقات التعليمية</h2><p>حاول تذكّر الإجابة قبل قلب البطاقة، ثم صنّفها حسب مستوى إتقانك.</p></div><span className="flashcard-count">{index + 1} / {demoLesson.flashcards.length}</span></div>
    <div className="flashcard-progress"><span>أتقنتها: <b>{knownCount}</b></span><span>تحتاج مراجعة: <b>{reviewCount}</b></span><span>لم تصنّف: <b>{demoLesson.flashcards.length - knownCount - reviewCount}</b></span></div>
    <button type="button" className={flipped ? "flashcard flipped" : "flashcard"} onClick={() => setFlipped(!flipped)}><small>{flipped ? "الإجابة" : "السؤال"}</small><strong>{flipped ? card.back : card.front}</strong><span>{flipped ? "انقر لرؤية السؤال" : "انقر لقلب البطاقة"}</span></button>
    {flipped && <div className="flashcard-rating"><button type="button" className="flash-rating review" onClick={() => rate("review")}>أحتاج إلى مراجعتها</button><button type="button" className="flash-rating mastered" onClick={() => rate("known")}>أعرفها جيداً <Check size={15}/></button></div>}
    <div className="flashcard-controls"><button className="btn btn-outline" onClick={() => move((index - 1 + demoLesson.flashcards.length) % demoLesson.flashcards.length)}>السابق</button><div className="flashcard-dots">{demoLesson.flashcards.map((_, i) => <button key={i} aria-label={"البطاقة " + (i + 1)} className={i === index ? "active" : ""} onClick={() => move(i)}/>)}</div><button className="btn btn-primary" onClick={() => move((index + 1) % demoLesson.flashcards.length)}>التالي <ArrowLeft size={15}/></button></div>
  </div>;
}

function LessonPage({ progress, complete, toggleSaved }: { progress: Progress; complete: (id: string) => void; toggleSaved: (id: string) => void }) {
  const { lessonSlug = "" } = useParams();
  if (lessonSlug !== demoLesson.slug) return <NotFound/>;
  const done = progress.completed.includes(demoLesson.slug);
  const saved = progress.saved.includes(demoLesson.slug);
  return <main className="container page lesson-page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><Link to="/subject/grade-12/scientific/physics">الفيزياء</Link><ChevronLeft size={14}/><b>{demoLesson.title}</b></div>
    <div className="lesson-layout">
      <article className="lesson-main">
        <span className="content-status">ملاحظات المراجعة · نموذج تفاعلي</span>
        <h1>{demoLesson.title}</h1><p className="lesson-lead">{demoLesson.summary}</p>
        <div className="lesson-meta"><span><Clock3 size={15}/>{demoLesson.duration} دقيقة</span><span><FileText size={15}/>{demoLesson.sections.length} أقسام</span><span><Target size={15}/>3 أهداف تعلم</span></div>
        <div className="lesson-warning"><ShieldCheck size={16}/> هذا محتوى تجريبي لشرح طريقة عمل المنصة، ويحتاج مراجعة ومطابقة مع كتاب الوزارة قبل اعتماده للطلاب.</div>
        <section className="lesson-objectives"><h2><Target size={19}/> أهداف التعلّم</h2><ul>{demoLesson.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul></section>
        {demoLesson.sections.map((section, index) => <section className="note-section" id={"section-" + index} key={section.heading}><span className="note-section-number">{String(index + 1).padStart(2, "0")}</span><div><h2>{section.heading}</h2><p>{section.body}</p>{section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}</div></section>)}
        <section className="worked-example"><span className="eyebrow">مثال محلول</span><h2>{demoLesson.example.title}</h2><ol>{demoLesson.example.steps.map((step) => <li key={step}>{step}</li>)}</ol><div className="example-answer"><CheckCircle2 size={18}/><b>{demoLesson.example.answer}</b></div></section>
        <section className="lesson-recap"><h2><Zap size={19}/> ملخص سريع</h2><ul>{demoLesson.recap.map((line) => <li key={line}>{line}</li>)}</ul></section>
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
  return <main className="container page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><b>مساحة الطالب</b></div>
    <div className="page-title-row"><div><span className="eyebrow">مساحة الطالب</span><h1>تقدّمك الدراسي.</h1><p>مكان واحد لمتابعة الدروس المحفوظة والاختبارات والموضوعات التي تحتاج إلى مراجعة.</p></div><Link className="btn btn-primary" to="/curriculum">واصل التعلّم <ArrowLeft size={16}/></Link></div>
    <div className="dashboard-stats">
      <article><span className="dash-icon"><CheckCircle2/></span><span>دروس مكتملة</span><b>{progress.completed.length}</b><small>من الدروس التي درستها</small></article>
      <article><span className="dash-icon"><Bookmark/></span><span>دروس محفوظة</span><b>{progress.saved.length}</b><small>للعودة إليها لاحقاً</small></article>
      <article><span className="dash-icon"><Trophy/></span><span>اختبارات مكتملة</span><b>{attemptCount}</b><small>محاولات مسجلة على هذا الجهاز</small></article>
      <article><span className="dash-icon"><Award/></span><span>دقة الإجابات</span><b>{accuracy === undefined ? (latestScore === undefined ? "—" : latestScore + "/3") : accuracy + "%"}</b><small>{totalQuestions ? correctAnswers + " من " + totalQuestions + " إجابات صحيحة" : "تظهر بعد أول اختبار"}</small></article>
    </div>
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
type SourceChoice = { id: string; title: string; rights_status: string };

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
  const [lessonForm, setLessonForm] = useState({ unit_id: "", title: "", slug: "", summary: "", content_md: "", objectives: "", estimated_minutes: "15" });
  const [questionForm, setQuestionForm] = useState({ lesson_id: "", prompt: "", option1: "", option2: "", option3: "", option4: "", correct: "0", explanation: "", difficulty: "medium" });
  const [sourceForm, setSourceForm] = useState({ title: "", publisher: "وزارة التربية والتعليم اليمنية", publication_year: "", edition: "", source_url: "", rights_status: "needs_review", rights_notes: "" });

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
        supabase.from("content_sources").select("id,title,rights_status").order("created_at", { ascending: false }),
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
    setSaving(true); setHealth("");
    try {
      const slug = lessonForm.slug.trim() || makeSlug(lessonForm.title);
      const objectives = lessonForm.objectives.split("\\n").map((item) => item.trim()).filter(Boolean);
      const { error } = await supabase.from("lessons").insert({
        unit_id: lessonForm.unit_id, title: lessonForm.title.trim(), slug,
        summary: lessonForm.summary.trim(), content_md: lessonForm.content_md,
        objectives, estimated_minutes: Math.max(1, Number(lessonForm.estimated_minutes) || 15),
        sort_order: lessons.length + 1, status: "draft", access_level: "free",
      });
      if (error) throw error;
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
      {activePanel === "lessons" && <div className="admin-editor-grid"><form className="admin-form" onSubmit={addLesson}><div><span className="content-status">إضافة جديدة</span><h2>إنشاء درس</h2><p>اكتب شرحاً أصلياً منظماً بصيغة Markdown، وأضف أهداف الدرس.</p></div><label>الوحدة<select required value={lessonForm.unit_id} onChange={(e) => setLessonForm((old) => ({ ...old, unit_id: e.target.value }))}><option value="">اختر الوحدة</option>{units.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label>عنوان الدرس<input required value={lessonForm.title} onChange={(e) => setLessonForm((old) => ({ ...old, title: e.target.value, slug: old.slug || makeSlug(e.target.value) }))}/></label><label>المعرّف (Slug)<input value={lessonForm.slug} onChange={(e) => setLessonForm((old) => ({ ...old, slug: e.target.value }))}/></label><label>ملخص الدرس<textarea rows={2} value={lessonForm.summary} onChange={(e) => setLessonForm((old) => ({ ...old, summary: e.target.value }))}/></label><label>أهداف التعلّم (هدف في كل سطر)<textarea rows={3} value={lessonForm.objectives} onChange={(e) => setLessonForm((old) => ({ ...old, objectives: e.target.value }))}/></label><label>محتوى الدرس — Markdown<textarea required rows={9} value={lessonForm.content_md} onChange={(e) => setLessonForm((old) => ({ ...old, content_md: e.target.value }))} placeholder={"## الفكرة الأساسية\\n\\nشرح أصلي للمفهوم...\\n\\n## مثال محلول\\nخطوات الحل..."}/></label><label>وقت الدراسة بالدقائق<input type="number" min="1" max="240" value={lessonForm.estimated_minutes} onChange={(e) => setLessonForm((old) => ({ ...old, estimated_minutes: e.target.value }))}/></label><button className="btn btn-primary" disabled={saving || !units.length}>حفظ الدرس كمسودة</button></form><div className="admin-list"><h3>الدروس الحالية</h3>{lessons.length ? lessons.map((lesson) => <article key={lesson.id}><span><b>{lesson.title}</b><small>{units.find((item) => item.id === lesson.unit_id)?.title || "وحدة"} · {lesson.status}</small></span><select value={lesson.status} disabled={saving} onChange={(e) => void setStatus("lessons", lesson.id, e.target.value as "draft" | "review" | "published" | "archived")}><option value="draft">مسودة</option><option value="review">قيد المراجعة</option><option value="published">منشور</option><option value="archived">مؤرشف</option></select></article>) : <p>لا توجد دروس بعد.</p>}</div></div>}
      {activePanel === "questions" && <div className="admin-form admin-form-wide"><div><span className="content-status">بنك الأسئلة</span><h2>إضافة سؤال اختيار من متعدد</h2><p>مفتاح الإجابة يُحفظ في جدول خاص غير متاح للطلاب وفق سياسات RLS.</p></div><form onSubmit={addQuestion}><label>الدرس<select required value={questionForm.lesson_id} onChange={(e) => setQuestionForm((old) => ({ ...old, lesson_id: e.target.value }))}><option value="">اختر الدرس</option>{lessons.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label>نص السؤال<textarea required rows={3} value={questionForm.prompt} onChange={(e) => setQuestionForm((old) => ({ ...old, prompt: e.target.value }))}/></label><div className="admin-options-grid">{[1,2,3,4].map((number) => <label key={number}>الخيار {number}<input required value={questionForm[("option" + number) as "option1" | "option2" | "option3" | "option4"]} onChange={(e) => setQuestionForm((old) => ({ ...old, [("option" + number) as "option1" | "option2" | "option3" | "option4"]: e.target.value }))}/></label>)}</div><div className="admin-options-grid"><label>الإجابة الصحيحة<select value={questionForm.correct} onChange={(e) => setQuestionForm((old) => ({ ...old, correct: e.target.value }))}><option value="0">الخيار 1</option><option value="1">الخيار 2</option><option value="2">الخيار 3</option><option value="3">الخيار 4</option></select></label><label>الصعوبة<select value={questionForm.difficulty} onChange={(e) => setQuestionForm((old) => ({ ...old, difficulty: e.target.value }))}><option value="easy">سهل</option><option value="medium">متوسط</option><option value="hard">متقدم</option></select></label></div><label>تفسير الإجابة<textarea required rows={3} value={questionForm.explanation} onChange={(e) => setQuestionForm((old) => ({ ...old, explanation: e.target.value }))}/></label><button className="btn btn-primary" disabled={saving || !lessons.length}>حفظ السؤال ومفتاحه كمسودة</button></form></div>}
      {activePanel === "sources" && <div className="admin-editor-grid"><form className="admin-form" onSubmit={addSource}><div><span className="content-status">توثيق المصدر</span><h2>تسجيل مصدر المحتوى</h2><p>سجّل الطبعة والناشر وحالة الحقوق قبل اعتماد أي درس.</p></div><label>اسم المصدر<input required value={sourceForm.title} onChange={(e) => setSourceForm((old) => ({ ...old, title: e.target.value }))}/></label><label>الجهة الناشرة<input value={sourceForm.publisher} onChange={(e) => setSourceForm((old) => ({ ...old, publisher: e.target.value }))}/></label><div className="admin-options-grid"><label>العام الدراسي / سنة النشر<input value={sourceForm.publication_year} onChange={(e) => setSourceForm((old) => ({ ...old, publication_year: e.target.value }))}/></label><label>الطبعة<input value={sourceForm.edition} onChange={(e) => setSourceForm((old) => ({ ...old, edition: e.target.value }))}/></label></div><label>رابط المصدر (للتوثيق الداخلي)<input type="url" value={sourceForm.source_url} onChange={(e) => setSourceForm((old) => ({ ...old, source_url: e.target.value }))}/></label><label>حالة حقوق الاستخدام<select value={sourceForm.rights_status} onChange={(e) => setSourceForm((old) => ({ ...old, rights_status: e.target.value }))}><option value="needs_review">تحتاج مراجعة</option><option value="original">محتوى أصلي</option><option value="licensed">مرخّص</option><option value="public_domain">ملك عام</option><option value="link_only">رابط فقط</option><option value="permission_required">يتطلب إذناً</option></select></label><label>ملاحظات التحقق والحقوق<textarea rows={3} value={sourceForm.rights_notes} onChange={(e) => setSourceForm((old) => ({ ...old, rights_notes: e.target.value }))}/></label><button className="btn btn-primary" disabled={saving}>حفظ المصدر</button></form><div className="admin-list"><h3>المصادر المسجلة</h3>{sources.length ? sources.map((source) => <article key={source.id}><span><b>{source.title}</b><small>{source.rights_status}</small></span></article>) : <p>لم تُسجل مصادر بعد.</p>}</div></div>}
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
  if (loading) return <div className="app-loading"><BookOpenCheck/> Yemen Study</div>;
  return <div className="app-shell"><Header/><Routes>
    <Route path="/" element={<HomePage/>}/>
    <Route path="/curriculum" element={<CurriculumPage/>}/>
    <Route path="/grade/:gradeSlug" element={<GradePage/>}/>
    <Route path="/subject/:gradeSlug/:trackSlug/:subjectSlug" element={<SubjectPage progress={progress} toggleSaved={toggleSaved}/>}/>
    <Route path="/lesson/:lessonSlug" element={<LessonPage progress={progress} complete={complete} toggleSaved={toggleSaved}/>}/>
    <Route path="/mock-exam" element={<MockExamPage addScore={addScore}/>}/>
    <Route path="/target-test" element={<TargetTestPage/>}/>
    <Route path="/strengths-weaknesses" element={<StrengthsWeaknessesPage/>}/>
    <Route path="/guided-study" element={<GuidedStudyPage/>}/>
    <Route path="/guided-practice" element={<GuidedPracticePage/>}/>
    <Route path="/smart-mark" element={<SmartMarkPage/>}/>
    <Route path="/teacher/test-builder" element={<TestBuilderPage role={role}/>}/>
    <Route path="/past-papers" element={<PastPapersPage/>}/>
    <Route path="/study-plan" element={<StudyPlanPage/>}/>
    <Route path="/dashboard" element={<DashboardPage progress={progress}/>}/>
    <Route path="/admin" element={<AdminPage/>}/>
    <Route path="/login" element={<LoginPage/>}/>
    <Route path="*" element={<NotFound/>}/>
  </Routes><footer className="site-footer"><div className="container footer-inner"><Link to="/" className="footer-brand"><span className="brand-mark"><BookOpenCheck size={19}/></span><b>Yemen Study</b></Link><span>منصة مراجعة للمناهج اليمنية</span><div><Link to="/curriculum">المواد الدراسية</Link><Link to="/study-plan">خطة المذاكرة</Link><Link to="/dashboard">مساحة الطالب</Link></div><small>© {new Date().getFullYear()} Yemen Study</small></div></footer></div>;
}
