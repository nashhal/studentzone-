import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft, Award, Bookmark, BookOpen, BookOpenCheck,
  Brain, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft,
  CircleHelp, Clock3, FileText, GraduationCap, Layers3,
  LogOut, Menu, Play, Search, ShieldCheck, Sparkles,
  Target, Timer, Trophy, X, Zap
} from "lucide-react";
import { Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./lib/auth";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import { countAllSubjectEntries, findSubjects, getGrade, getSubjectCount, grades, type GradeEntry } from "./data/catalog";
import { demoCourse, demoLesson, type Question } from "./data/learning";

type Progress = { completed: string[]; saved: string[]; quizScores: number[] };
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
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
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
    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن المادة أو الموضوع أو الصف..." aria-label="ابحث في المنهج"/>
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
      <div><span className="eyebrow">ابدأ المراجعة</span><h2>ماذا تدرس اليوم؟</h2><p>ابحث باسم صفك أو مادتك أو موضوعك.</p></div>
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
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState(false);
  const score = questions.filter((question) => answers[question.id] === question.correctIndex).length;
  return <div className="practice-panel">
    <div className="resource-toolbar"><div><span className="content-status">تدريب حسب الموضوع</span><h2>اختبر فهمك</h2><p>{questions.length} أسئلة · اختر إجابة لكل سؤال ثم صحّح إجاباتك.</p></div><span className="difficulty-key">سهل ← متقدم</span></div>
    {questions.map((question, index) => <article className="practice-question" key={question.id}>
      <div className="question-top"><span>السؤال {index + 1}</span><span className="difficulty">{question.difficulty}</span></div>
      <h3>{question.prompt}</h3>
      <div className="answer-options">{question.options.map((option, optionIndex) => <button key={option} disabled={checked} className={checked && optionIndex === question.correctIndex ? "answer-option correct" : checked && answers[question.id] === optionIndex ? "answer-option incorrect" : answers[question.id] === optionIndex ? "answer-option chosen" : "answer-option"} onClick={() => setAnswers((old) => ({ ...old, [question.id]: optionIndex }))}><span>{["أ","ب","ج","د"][optionIndex]}</span>{option}{checked && optionIndex === question.correctIndex && <Check size={16}/>}</button>)}</div>
      {checked && <div className={answers[question.id] === question.correctIndex ? "answer-explanation good" : "answer-explanation"}><b>{answers[question.id] === question.correctIndex ? "إجابة صحيحة" : "راجع هذه الفكرة"}</b><p>{question.explanation}</p></div>}
    </article>)}
    {!checked ? <button className="btn btn-primary" disabled={Object.keys(answers).length !== questions.length} onClick={() => setChecked(true)}>صحّح إجاباتي <CheckCircle2 size={17}/></button> : <div className="practice-result"><Trophy size={22}/><div><b>نتيجتك: {score} من {questions.length}</b><p>راجع تفسيرات الإجابات ثم أعد المحاولة لتعزيز فهمك.</p></div><button className="btn btn-outline" onClick={() => { setAnswers({}); setChecked(false); }}>إعادة المحاولة</button></div>}
  </div>;
}

function FlashcardsPanel() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = demoLesson.flashcards[index];
  return <div className="flashcards-panel">
    <div className="resource-toolbar"><div><span className="content-status">مراجعة نشطة</span><h2>البطاقات التعليمية</h2><p>حاول تذكّر الإجابة قبل قلب البطاقة.</p></div><span className="flashcard-count">{index + 1} / {demoLesson.flashcards.length}</span></div>
    <button className={flipped ? "flashcard flipped" : "flashcard"} onClick={() => setFlipped(!flipped)}><small>{flipped ? "الإجابة" : "السؤال"}</small><strong>{flipped ? card.back : card.front}</strong><span>{flipped ? "انقر لرؤية السؤال" : "انقر لقلب البطاقة"}</span></button>
    <div className="flashcard-controls"><button className="btn btn-outline" onClick={() => { setIndex((index - 1 + demoLesson.flashcards.length) % demoLesson.flashcards.length); setFlipped(false); }}>السابق</button><div className="flashcard-dots">{demoLesson.flashcards.map((_, i) => <button key={i} aria-label={"البطاقة " + (i + 1)} className={i === index ? "active" : ""} onClick={() => { setIndex(i); setFlipped(false); }}/>)}</div><button className="btn btn-primary" onClick={() => { setIndex((index + 1) % demoLesson.flashcards.length); setFlipped(false); }}>التالي <ArrowLeft size={15}/></button></div>
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
  useEffect(() => {
    if (!started || submitted || seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [started, submitted, seconds]);
  const score = demoLesson.questions.filter((question) => answers[question.id] === question.correctIndex).length;
  const finish = () => { if (submitted) return; setSubmitted(true); addScore(score); };
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
  const latestScore = progress.quizScores.length ? progress.quizScores[progress.quizScores.length - 1] : undefined;
  return <main className="container page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><b>مساحة الطالب</b></div>
    <div className="page-title-row"><div><span className="eyebrow">مساحة الطالب</span><h1>تقدّمك الدراسي.</h1><p>مكان واحد لمتابعة الدروس المحفوظة والمكتملة ونتائج الاختبارات.</p></div><Link className="btn btn-primary" to="/curriculum">واصل التعلّم <ArrowLeft size={16}/></Link></div>
    <div className="dashboard-stats"><article><span className="dash-icon"><CheckCircle2/></span><span>دروس مكتملة</span><b>{progress.completed.length}</b><small>من الدروس التي درستها</small></article><article><span className="dash-icon"><Bookmark/></span><span>دروس محفوظة</span><b>{progress.saved.length}</b><small>للعودة إليها لاحقاً</small></article><article><span className="dash-icon"><Trophy/></span><span>اختبارات مكتملة</span><b>{progress.quizScores.length}</b><small>محاولات مسجلة</small></article><article><span className="dash-icon"><Award/></span><span>آخر نتيجة</span><b>{latestScore === undefined ? "—" : latestScore + "/3"}</b><small>في آخر اختبار تجريبي</small></article></div>
    <div className="dashboard-columns"><section className="dashboard-panel"><div className="panel-heading"><h2>متابعة المراجعة</h2><span>آخر نشاط</span></div>{progress.completed.length ? <Link className="dashboard-row" to="/lesson/scalars-and-vectors"><CheckCircle2/><span><b>{demoLesson.title}</b><small>الفيزياء · الثالث الثانوي العلمي</small></span><span className="done-label">مكتمل</span></Link> : <div className="dashboard-empty"><BookOpen/><b>ابدأ أول درس لك</b><p>ستظهر هنا الدروس التي أكملتها وتقدّمك فيها.</p><Link to="/subject/grade-12/scientific/physics" className="text-link">افتح الدرس التجريبي <ArrowLeft size={15}/></Link></div>}</section><section className="dashboard-panel"><div className="panel-heading"><h2>المحفوظات</h2><span>{progress.saved.length} عناصر</span></div>{progress.saved.length ? <Link className="dashboard-row" to="/lesson/scalars-and-vectors"><Bookmark/><span><b>{demoLesson.title}</b><small>الفيزياء · ملاحظات المراجعة</small></span><ChevronLeft/></Link> : <div className="dashboard-empty"><Bookmark/><b>لم تحفظ أي درس بعد</b><p>استخدم زر الحفظ في صفحة الدرس للرجوع إلى ملاحظاتك.</p></div>}</section></div>
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

function AdminPage() {
  const { role } = useAuth();
  const [health, setHealth] = useState("");
  if (role !== "admin" && role !== "editor") return <main className="container page"><div className="paper-library-empty"><ShieldCheck/><h2>مساحة المحرر</h2><p>تحتاج صلاحية محرر أو مدير لإدارة المحتوى.</p></div></main>;
  const check = async () => {
    if (!supabase) { setHealth("Supabase غير مهيّأ بعد."); return; }
    const { error } = await supabase.from("education_stages").select("id", { count: "exact", head: true });
    setHealth(error ? "تعذر الاتصال: " + error.message : "الاتصال بقاعدة البيانات يعمل.");
  };
  return <main className="container page"><span className="eyebrow">لوحة الإدارة</span><h1>إدارة المحتوى التعليمي.</h1><div className="admin-actions"><article><BookOpen/><h3>المواد والدروس</h3><p>إضافة فهرس الوحدات والدروس والملاحظات.</p></article><article><Target/><h3>الأسئلة والاختبارات</h3><p>تحرير الأسئلة ومستويات الصعوبة والإجابات.</p></article><article><ShieldCheck/><h3>المراجعة والنشر</h3><p>تدقيق المحتوى قبل إتاحته للطلاب.</p></article></div><div className="plan-card"><h2>حالة قاعدة البيانات</h2><p>{health || "افحص الاتصال بعد إعداد متغيرات Supabase."}</p><button className="btn btn-primary" onClick={check}>فحص الاتصال</button></div></main>;
}

function NotFound() {
  return <main className="container page not-found"><span className="eyebrow">404</span><h1>الصفحة غير موجودة.</h1><Link className="btn btn-primary" to="/">العودة للرئيسية <ArrowLeft size={16}/></Link></main>;
}

export default function App() {
  const { loading } = useAuth();
  const { progress, complete, toggleSaved, addScore } = useStudyProgress();
  if (loading) return <div className="app-loading"><BookOpenCheck/> Yemen Study</div>;
  return <div className="app-shell"><Header/><Routes>
    <Route path="/" element={<HomePage/>}/>
    <Route path="/curriculum" element={<CurriculumPage/>}/>
    <Route path="/grade/:gradeSlug" element={<GradePage/>}/>
    <Route path="/subject/:gradeSlug/:trackSlug/:subjectSlug" element={<SubjectPage progress={progress} toggleSaved={toggleSaved}/>}/>
    <Route path="/lesson/:lessonSlug" element={<LessonPage progress={progress} complete={complete} toggleSaved={toggleSaved}/>}/>
    <Route path="/mock-exam" element={<MockExamPage addScore={addScore}/>}/>
    <Route path="/past-papers" element={<PastPapersPage/>}/>
    <Route path="/study-plan" element={<StudyPlanPage/>}/>
    <Route path="/dashboard" element={<DashboardPage progress={progress}/>}/>
    <Route path="/admin" element={<AdminPage/>}/>
    <Route path="/login" element={<LoginPage/>}/>
    <Route path="*" element={<NotFound/>}/>
  </Routes><footer className="site-footer"><div className="container footer-inner"><Link to="/" className="footer-brand"><span className="brand-mark"><BookOpenCheck size={19}/></span><b>Yemen Study</b></Link><span>منصة مراجعة للمناهج اليمنية</span><div><Link to="/curriculum">المواد الدراسية</Link><Link to="/study-plan">خطة المذاكرة</Link><Link to="/dashboard">مساحة الطالب</Link></div><small>© {new Date().getFullYear()} Yemen Study</small></div></footer></div>;
}
