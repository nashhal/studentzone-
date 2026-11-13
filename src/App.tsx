import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft, ArrowUpLeft, BookOpen, BookOpenCheck, Bookmark, CheckCircle2,
  ChevronLeft, Clock3, FileText, GraduationCap, Layers3, Menu, Search,
  ShieldCheck, Sparkles, Target, X
} from "lucide-react";
import { Link, NavLink, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "./lib/auth";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import { countAllSubjectEntries, curriculumSource, findSubjects, getGrade, getSubjectCount, grades, type GradeEntry } from "./data/catalog";

function Header() {
  const { user, role, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const logout = async () => { try { await signOut(); navigate("/"); } catch (error) { console.error(error); } };
  return <header className="site-header"><div className="container header-inner">
    <Link to="/" className="brand" aria-label="Yemen Study — الرئيسية">
      <span className="brand-mark"><BookOpenCheck size={22} strokeWidth={1.8}/></span>
      <span className="brand-copy"><b>Yemen Study</b><small>منهجك. خطوتك القادمة.</small></span>
    </Link>
    <button className="mobile-menu" aria-label={open ? "إغلاق القائمة" : "فتح القائمة"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
    <nav className={open ? "main-nav open" : "main-nav"}>
      <NavLink to="/" end onClick={() => setOpen(false)}>الرئيسية</NavLink>
      <NavLink to="/curriculum" onClick={() => setOpen(false)}>المراحل والصفوف</NavLink>
      {user && <NavLink to="/dashboard" onClick={() => setOpen(false)}>مساحة الطالب</NavLink>}
      {user && (role === "admin" || role === "editor") && <NavLink to="/admin" onClick={() => setOpen(false)}>إدارة المحتوى</NavLink>}
      {user ? <button className="nav-login" onClick={logout}>تسجيل الخروج</button> : <Link className="nav-login" to="/login" onClick={() => setOpen(false)}>دخول الحساب <ArrowUpLeft size={15}/></Link>}
    </nav>
  </div></header>;
}

function GradeCard({ grade }: { grade: GradeEntry }) {
  return <Link className="grade-card" to={"/grade/" + grade.slug}>
    <span className="grade-number">{String(grade.number).padStart(2, "0")}</span>
    <span className="grade-card-copy"><b>{grade.name}</b><small>{grade.stage === "basic" ? "التعليم الأساسي" : "التعليم الثانوي"} · {getSubjectCount(grade)} مقررات/مسارات</small></span>
    <span className="grade-card-arrow"><ChevronLeft size={18}/></span>
  </Link>;
}

function HomePage() {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => findSubjects(query), [query]);
  const navigate = useNavigate();
  return <>
    <section className="hero"><div className="container hero-grid">
      <div className="hero-copy">
        <span className="eyebrow"><i/> تعلّم وفق المقررات اليمنية</span>
        <h1>كل درس له طريق.<br/><em>ابدأ بخطوة واضحة.</em></h1>
        <p>منهجك الدراسي في مكان واحد: دروس مرتبة، ملاحظات للمراجعة، أسئلة حسب الموضوع، واختبارات تساعدك تعرف ما أتقنته وما يحتاج تركيزاً أكثر.</p>
        <div className="hero-actions"><Link className="button primary" to="/curriculum">استكشف الصفوف <ArrowLeft size={17}/></Link><a className="button quiet" href="#learning-method">كيف تتعلّم هنا؟</a></div>
        <div className="hero-footnote"><ShieldCheck size={16}/> لا ننشر درساً قبل مراجعته وربطه بمصدره.</div>
      </div>
      <div className="hero-side">
        <div className="hero-paper">
          <div className="paper-top"><span>خريطة التعلّم</span><span className="paper-dot">●</span></div>
          <div className="paper-title">من المنهج إلى الفهم.</div>
          <div className="paper-steps">
            <div><span className="paper-step-icon"><FileText size={18}/></span><span><b>افهم الفكرة</b><small>شرح مختصر ومنظم</small></span><b className="step-index">01</b></div>
            <div><span className="paper-step-icon"><Target size={18}/></span><span><b>اختبر فهمك</b><small>أسئلة حسب الموضوع</small></span><b className="step-index">02</b></div>
            <div><span className="paper-step-icon"><BookOpenCheck size={18}/></span><span><b>راجع تقدّمك</b><small>نتائج ومراجعة ذكية</small></span><b className="step-index">03</b></div>
          </div>
          <div className="paper-bottom"><span>YEMEN STUDY</span><span>01 — 12</span></div>
        </div>
        <div className="hero-note"><Sparkles size={15}/> تعلّم منظم. خطوة بخطوة.</div>
      </div>
    </div></section>
    <section className="quick-search container">
      <div><span className="kicker">ابدأ من هنا</span><h2>ماذا تدرس اليوم؟</h2><p>ابحث عن صفك أو المادة مباشرة.</p></div>
      <div className="quick-search-field">
        <Search size={18}/>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="مثلاً: الصف الثالث الثانوي، الفيزياء..." aria-label="ابحث عن مادة"/>
        {query && <button className="clear-search" onClick={() => setQuery("")} aria-label="مسح البحث"><X size={16}/></button>}
        <button className="search-submit" onClick={() => navigate("/curriculum?q=" + encodeURIComponent(query))}>استكشف <ArrowLeft size={16}/></button>
        {matches.length > 0 && <div className="search-suggestions">{matches.map((match, index) =>
          <Link key={match.grade.slug + match.track.slug + match.subject.slug + index} to={"/subject/" + match.grade.slug + "/" + match.track.slug + "/" + match.subject.slug}>
            <span>{match.subject.name}</span><small>{match.grade.name} · {match.track.name}</small><ChevronLeft size={15}/>
          </Link>)}</div>}
      </div>
    </section>
    <section className="section container" id="learning-method">
      <div className="section-head"><div><span className="kicker">طريقة المذاكرة</span><h2>من الفهم إلى الاستعداد للاختبار.</h2></div><p>هيكل بسيط يربط كل درس بالمراجعة والتدريب، لتعرف أين تبدأ وماذا تفعل بعد ذلك.</p></div>
      <div className="feature-grid">
        <article className="feature-card"><span className="feature-number">01</span><FileText/><h3>ملاحظات مراجعة واضحة</h3><p>شرح مقسّم إلى أفكار صغيرة، مع تعريفات وقوانين وأمثلة ورسوم عند الحاجة.</p></article>
        <article className="feature-card"><span className="feature-number">02</span><Target/><h3>أسئلة حسب الموضوع</h3><p>تدريب متدرج مع إجابات تفسيرية، وتصنيف بحسب مستوى الصعوبة ونوع السؤال.</p></article>
        <article className="feature-card"><span className="feature-number">03</span><Clock3/><h3>اختبارات ومتابعة</h3><p>اختبارات موقّتة وسجل للمحاولات ومراجعة للموضوعات التي تحتاج إلى مزيد من العمل.</p></article>
      </div>
    </section>
    <section className="grade-preview"><div className="container">
      <div className="section-head"><div><span className="kicker">جميع المراحل</span><h2>اختر صفك الدراسي.</h2></div><Link className="text-link" to="/curriculum">عرض الصفوف الاثني عشر <ArrowLeft size={16}/></Link></div>
      <div className="grade-grid">{grades.slice(0, 6).map((grade) => <GradeCard key={grade.slug} grade={grade}/>)}</div>
      <div className="grade-grid secondary-grade-grid">{grades.slice(6).map((grade) => <GradeCard key={grade.slug} grade={grade}/>)}</div>
    </div></section>
    <section className="source-strip"><div className="container source-strip-inner">
      <div><span className="kicker">المصدر والمنهج</span><h2>المحتوى يبدأ من كتابك الدراسي.</h2><p>نستخدم فهارس المقررات للتحقق من أسماء الكتب والمواد، ونكتب ملاحظات تعليمية أصلية بعد مراجعة محتوى كل طبعة.</p></div>
      <a className="button light-button" href={curriculumSource.url} target="_blank" rel="noreferrer">فتح فهرس المقررات <ArrowUpLeft size={16}/></a>
    </div></section>
  </>;
}

function CurriculumPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stage, setStage] = useState<"all" | "basic" | "secondary">("all");
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const filtered = grades.filter((grade) => (stage === "all" || grade.stage === stage) &&
    (!query.trim() || grade.name.includes(query.trim()) || grade.tracks.some((track) => track.subjects.some((subject) => subject.name.includes(query.trim())))));
  const totalSubjects = countAllSubjectEntries();
  const updateQuery = (value: string) => { setQuery(value); setSearchParams(value ? { q: value } : {}); };
  return <main className="page container">
    <div className="page-intro"><span className="kicker">فهرس المنهج</span><h1>اختر صفك، ثم مادتك.</h1><p>تصفّح المقررات بحسب المرحلة والصف والمسار. ستجد داخل كل مادة مكاناً لفهرس الدروس وملاحظات المراجعة والتدريب.</p></div>
    <div className="catalog-summary"><div><b>12</b><span>صفاً دراسياً</span></div><div><b>2</b><span>مرحلتان تعليميتان</span></div><div><b>{totalSubjects}</b><span>مدخل مادة/مسار مفهرس أولياً</span></div></div>
    <div className="catalog-controls">
      <div className="stage-filters" role="group" aria-label="تصفية المرحلة">
        <button className={stage === "all" ? "filter-chip active" : "filter-chip"} onClick={() => setStage("all")}>كل الصفوف</button>
        <button className={stage === "basic" ? "filter-chip active" : "filter-chip"} onClick={() => setStage("basic")}>التعليم الأساسي</button>
        <button className={stage === "secondary" ? "filter-chip active" : "filter-chip"} onClick={() => setStage("secondary")}>التعليم الثانوي</button>
      </div>
      <label className="catalog-search"><Search size={17}/><input value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="ابحث عن الصف أو المادة..."/><span>{filtered.length} صفوف</span></label>
    </div>
    {filtered.length === 0 ? <div className="empty-state"><Search size={26}/><h3>لم نعثر على نتيجة</h3><p>جرّب اسماً آخر للصف أو المادة.</p></div> : <div className="catalog-grid">{filtered.map((grade) => <GradeCard key={grade.slug} grade={grade}/>)}</div>}
    <div className="source-note"><ShieldCheck size={18}/><p>قائمة الصفوف والمواد مستخرجة مبدئياً من فهرس تعليمي حكومي متاح بمحافظة حضرموت. تختلف الطبعات وقوائم المواد المحتملة بين المناطق والتحديثات؛ راجع النسخة المعتمدة قبل الدراسة.</p><a href={curriculumSource.url} target="_blank" rel="noreferrer">المصدر <ArrowUpLeft size={14}/></a></div>
  </main>;
}

function GradePage() {
  const { gradeSlug = "" } = useParams();
  const grade = getGrade(gradeSlug);
  const [trackSlug, setTrackSlug] = useState(grade?.tracks[0]?.slug || "general");
  if (!grade) return <NotFound/>;
  const selectedTrack = grade.tracks.find((item) => item.slug === trackSlug) || grade.tracks[0];
  return <main className="page container">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><Link to="/curriculum">المراحل والصفوف</Link><ChevronLeft size={14}/><b>{grade.name}</b></div>
    <div className="grade-heading"><div><span className="kicker">{grade.stage === "basic" ? "التعليم الأساسي" : "التعليم الثانوي"}</span><h1>{grade.name}</h1><p>{grade.description}</p></div><div className="grade-heading-meta"><span>{grade.tracks.length} مسارات</span><span>{getSubjectCount(grade)} مواد/مسارات</span></div></div>
    {grade.tracks.length > 1 && <div className="track-tabs" role="tablist" aria-label="المسار الدراسي">{grade.tracks.map((item) =>
      <button key={item.slug} role="tab" aria-selected={selectedTrack.slug === item.slug} className={selectedTrack.slug === item.slug ? "track-tab active" : "track-tab"} onClick={() => setTrackSlug(item.slug)}>{item.name}</button>)}</div>}
    <div className="section-head compact"><div><span className="kicker">المواد الدراسية</span><h2>{selectedTrack.name}</h2></div><span className="subtle-label">فهرس أولي · راجع الطبعة المعتمدة</span></div>
    <div className="subject-grid">{selectedTrack.subjects.map((subject, index) =>
      <Link className="subject-card" key={subject.slug} to={"/subject/" + grade.slug + "/" + selectedTrack.slug + "/" + subject.slug}>
        <div className="subject-card-top"><span className="subject-symbol">{String(index + 1).padStart(2, "0")}</span><span className="subject-state">افتح المادة <ChevronLeft size={14}/></span></div>
        <h3>{subject.name}</h3><p>فهرس الدروس، ملاحظات المراجعة، أسئلة حسب الموضوع واختبارات.</p>
        <div className="subject-foot"><span>محتوى قيد الإعداد والمراجعة</span><ArrowLeft size={15}/></div>
      </Link>)}</div>
    <div className="source-note"><ShieldCheck size={18}/><p>هذه قائمة أولية للأسماء الواردة في الفهرس المتاح، وليست إثباتاً بأن جميع مقررات هذه الطبعة أو هذه المنطقة متماثلة.</p><a href={curriculumSource.url} target="_blank" rel="noreferrer">مصدر الفهرس <ArrowUpLeft size={14}/></a></div>
  </main>;
}

function SubjectPage() {
  const { gradeSlug = "", trackSlug = "", subjectSlug = "" } = useParams();
  const grade = getGrade(gradeSlug);
  const track = grade?.tracks.find((item) => item.slug === trackSlug);
  const subject = track?.subjects.find((item) => item.slug === subjectSlug);
  const [active, setActive] = useState("outline");
  if (!grade || !track || !subject) return <NotFound/>;
  const tabs = [
    ["outline", "فهرس الدروس"],
    ["notes", "ملاحظات المراجعة"],
    ["practice", "أسئلة وتدريب"],
    ["exams", "اختبارات"],
  ];
  return <main className="page container subject-page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><Link to={"/grade/" + grade.slug}>{grade.name}</Link><ChevronLeft size={14}/><b>{subject.name}</b></div>
    <section className="subject-hero"><span className="kicker">{grade.name} · {track.name}</span><h1>{subject.name}</h1><p>مساحة منظمة لتعلّم المادة ومراجعتها والاستعداد لاختباراتها.</p>
      <div className="subject-meta"><span><Layers3 size={15}/> وحدات ودروس</span><span><FileText size={15}/> ملخصات ومفاهيم</span><span><Target size={15}/> أسئلة حسب الموضوع</span></div>
    </section>
    <div className="subject-tabs" role="tablist" aria-label="موارد المادة">{tabs.map(([id, label]) =>
      <button key={id} role="tab" aria-selected={active === id} className={active === id ? "subject-tab active" : "subject-tab"} onClick={() => setActive(id)}>{label}</button>)}</div>
    <section className="subject-content-panel">
      {active === "outline" && <div className="empty-learning"><span className="empty-icon"><BookOpen size={23}/></span><h2>فهرس الوحدات والدروس قيد التوثيق.</h2><p>سنضيف عناوين الوحدات والدروس بعد قراءة فهرس الكتاب المعتمد لهذه المادة، ثم مراجعة ترتيب الموضوعات. لم نضع عناوين تخمينية حتى لا يذاكر الطالب محتوى غير مطابق لكتابه.</p><a className="button secondary" href={curriculumSource.url} target="_blank" rel="noreferrer">فتح مرجع المقررات <ArrowUpLeft size={15}/></a></div>}
      {active === "notes" && <ResourceEmpty icon="notes" title="ملاحظات المراجعة" text="سيحتوي كل درس على شرح أصلي موجز، وأهداف تعلّم، وتعريفات وقوانين، وأمثلة ورسوم، وملخص سريع. يتم تأليف الملاحظات ومراجعتها قبل النشر."/>}
      {active === "practice" && <ResourceEmpty icon="practice" title="التدريب حسب الموضوع" text="سيُبنى بنك أسئلة أصلي ومتدرج: اختيار من متعدد، وصواب وخطأ، وإجابة قصيرة، ومسائل رقمية. تظهر الإجابة التفسيرية بعد إرسال المحاولة."/>}
      {active === "exams" && <ResourceEmpty icon="exams" title="الاختبارات التجريبية" text="اختبارات قصيرة وموقّتة واختبارات شاملة، مع سجل المحاولات وتقرير يوضح الموضوعات التي تحتاج إلى مراجعة إضافية."/>}
    </section>
    <aside className="lesson-format"><span className="kicker">قالب الدرس المعتمد</span><div className="lesson-format-grid"><span>أهداف التعلّم</span><span>شرح مركز</span><span>مصطلحات وقوانين</span><span>أمثلة محلولة</span><span>ملخص سريع</span><span>اختبر فهمك</span></div></aside>
    <div className="source-note"><ShieldCheck size={18}/><p>فهرس المقررات مصدر للأسماء والكتب فقط. لا تُرفع ملفات أو تُنسخ ملاحظات محمية دون التحقق من حقوقها؛ سنفضّل كتابة شرح أصلي وربط الطالب بالمصدر عند الحاجة.</p><a href={curriculumSource.videoUrl} target="_blank" rel="noreferrer">الدروس التعليمية الرسمية <ArrowUpLeft size={14}/></a></div>
  </main>;
}

function ResourceEmpty({ icon, title, text }: { icon: string; title: string; text: string }) {
  const Icon = icon === "practice" ? Target : icon === "exams" ? Clock3 : FileText;
  return <div className="resource-empty"><span className="resource-icon"><Icon size={22}/></span><div><h2>{title}</h2><p>{text}</p><span className="draft-chip">سيُنشر بعد المراجعة العلمية</span></div></div>;
}

function DashboardPage() {
  const { user } = useAuth();
  return <main className="page container narrow">
    <div className="page-intro"><span className="kicker">مساحة الطالب</span><h1>أهلاً بك في مساحة التعلّم.</h1><p>{user?.email || "تابع دراستك من مكان واحد."}</p></div>
    <div className="stats">
      <article><BookOpen/><span>الدروس المكتملة</span><b>—</b><small>تظهر بعد نشر الدروس وبدء الدراسة</small></article>
      <article><CheckCircle2/><span>نتائج الاختبارات</span><b>—</b><small>ستُحفظ نتائج محاولاتك هنا</small></article>
      <article><Bookmark/><span>المحفوظات</span><b>—</b><small>احفظ الدروس للرجوع إليها</small></article>
    </div>
    <div className="next-step"><div><span className="kicker">خطوتك التالية</span><h2>اختر المادة التي تريد البدء بها.</h2><p>استكشف الفهرس وابحث عن صفك ومادتك.</p></div><Link className="button primary" to="/curriculum">استكشف المنهج <ArrowLeft size={17}/></Link></div>
  </main>;
}

function AdminPage() {
  const { role } = useAuth();
  const [health, setHealth] = useState("");
  const check = async () => {
    if (!supabase) { setHealth("لم يتم ربط Supabase بعد. يلزم إعداد المشروع وتطبيق ملفات migrations."); return; }
    const { error } = await supabase.from("education_stages").select("id", { count: "exact", head: true });
    setHealth(error ? "تعذّر الاتصال: " + error.message : "الاتصال بقاعدة البيانات يعمل.");
  };
  if (role !== "admin" && role !== "editor") return <main className="page container"><div className="notice"><ShieldCheck/><p>هذه الصفحة للمحررين والمديرين فقط.</p></div></main>;
  const sections = [
    ["01", "المراحل والصفوف", "تثبيت الصفوف والمسارات وربطها بالطبعة."],
    ["02", "المواد والوحدات", "إدخال فهرس كل كتاب بعد التحقق منه."],
    ["03", "الدروس والملاحظات", "كتابة الشرح والأهداف والمفاهيم والأمثلة."],
    ["04", "الأسئلة والاختبارات", "إنشاء بنك أسئلة ومراجعة مفاتيح الإجابات."],
    ["05", "مصادر وحقوق المحتوى", "توثيق المصدر ورخصة الاستخدام قبل النشر."],
    ["06", "المراجعة والنشر", "مسار مسودة ثم مراجعة علمية ثم نشر."],
  ];
  return <main className="page container"><div className="page-intro"><span className="kicker">مساحة الإدارة</span><h1>إدارة المحتوى.</h1><p>هيكل تحريري لمنصة تعليمية مبنية على المنهج اليمني.</p></div>
    <div className="admin-grid">{sections.map((item) => <article key={item[0]}><small>{item[0]}</small><h3>{item[1]}</h3><p>{item[2]}</p></article>)}</div>
    <div className="next-step"><div><h2>حالة قاعدة البيانات</h2><p>افحص اتصال Supabase بعد إعداد مفاتيح البيئة وتطبيق قاعدة البيانات.</p>{health && <small className="health">{health}</small>}</div><button className="button primary" onClick={check}>فحص الاتصال</button></div>
  </main>;
}

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    if (!supabase) { setMessage("تسجيل الدخول غير متاح بعد. يلزم ربط مشروع Supabase أولاً."); return; }
    setBusy(true);
    try {
      const result = mode === "login" ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password });
      if (result.error) throw result.error;
      setMessage(mode === "signup" && !result.data.session ? "تم إنشاء الحساب. راجع بريدك الإلكتروني لتأكيده." : "تم تسجيل الدخول بنجاح.");
      if (result.data.session) navigate("/dashboard");
    } catch (error) { setMessage(error instanceof Error ? error.message : "حدث خطأ غير متوقع."); }
    finally { setBusy(false); }
  };
  return <main className="page container login-wrap"><section className="login-card">
    <span className="login-icon"><GraduationCap/></span><span className="kicker">حساب Yemen Study</span><h1>{mode === "login" ? "مرحباً بعودتك." : "أنشئ حسابك."}</h1><p>احفظ تقدّمك وتابع دراستك من مكان واحد.</p>
    <form onSubmit={submit}><label htmlFor="email">البريد الإلكتروني</label><input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="name@example.com"/>
      <label htmlFor="password">كلمة المرور</label><input id="password" type="password" minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="8 أحرف على الأقل"/>
      {!isSupabaseConfigured && <div className="hint">هذه النسخة تحتاج إلى إعداد Supabase قبل تفعيل الحسابات.</div>}
      {message && <div className="message" role="status">{message}</div>}
      <button className="button primary submit" disabled={busy}>{busy ? "جارٍ التنفيذ..." : mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"} <ArrowLeft size={17}/></button>
    </form>
    <button className="switch" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>{mode === "login" ? "ليس لديك حساب؟ أنشئ حساباً" : "لديك حساب بالفعل؟ سجّل الدخول"}</button>
  </section></main>;
}

function NotFound() {
  return <main className="page container not-found"><span className="kicker">404</span><h1>هذه الصفحة غير موجودة.</h1><p>قد يكون الرابط غير صحيح أو أن المحتوى لم يُنشر بعد.</p><Link to="/curriculum" className="button primary">العودة إلى فهرس الصفوف</Link></main>;
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <div className="loading"><BookOpenCheck size={25}/> Yemen Study</div>;
  return <div className="app-shell"><Header/><Routes>
    <Route path="/" element={<HomePage/>}/>
    <Route path="/curriculum" element={<CurriculumPage/>}/>
    <Route path="/grade/:gradeSlug" element={<GradePage/>}/>
    <Route path="/subject/:gradeSlug/:trackSlug/:subjectSlug" element={<SubjectPage/>}/>
    <Route path="/dashboard" element={<DashboardPage/>}/>
    <Route path="/admin" element={<AdminPage/>}/>
    <Route path="/login" element={<LoginPage/>}/>
    <Route path="*" element={<NotFound/>}/>
  </Routes>
  <footer className="footer"><div className="container footer-inner">
    <Link to="/" className="footer-brand"><span className="footer-mark">YS</span><b>Yemen Study</b></Link>
    <span>مساحة تعلّم منظمة للمناهج اليمنية</span>
    <a href={curriculumSource.url} target="_blank" rel="noreferrer">مرجع فهرس المقررات</a>
    <span>© {new Date().getFullYear()} Yemen Study</span>
  </div></footer></div>;
}
