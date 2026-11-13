import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowUpLeft, BookOpen, Bookmark, CheckCircle2, ChevronLeft, GraduationCap, Menu, ShieldCheck, Sparkles, X } from "lucide-react";
import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "./lib/auth";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import { learningSteps, pilotGrade, subjects } from "./data/catalog";

function Header() {
  const { user, role, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const logout = async () => { try { await signOut(); navigate("/"); } catch (e) { console.error(e); } };
  return <header className="site-header"><div className="container header-inner">
    <Link to="/" className="brand"><span className="brand-mark"><GraduationCap size={22}/></span><span className="brand-copy"><b>Yemen Study</b><small>مساحة تعلّمك</small></span></Link>
    <button className="mobile-menu" aria-label="القائمة" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
    <nav className={open ? "main-nav open" : "main-nav"}>
      <NavLink to="/" end onClick={() => setOpen(false)}>الرئيسية</NavLink>
      <NavLink to="/curriculum" onClick={() => setOpen(false)}>استكشف المنهج</NavLink>
      {user && <NavLink to="/dashboard" onClick={() => setOpen(false)}>لوحة الطالب</NavLink>}
      {user && (role === "admin" || role === "editor") && <NavLink to="/admin" onClick={() => setOpen(false)}>إدارة المحتوى</NavLink>}
      {user ? <button className="nav-login" onClick={logout}>تسجيل الخروج</button> : <Link className="nav-login" to="/login" onClick={() => setOpen(false)}>دخول الحساب <ArrowUpLeft size={15}/></Link>}
    </nav>
  </div></header>;
}

function HomePage() {
  return <>
    <section className="hero"><div className="container hero-grid">
      <div className="hero-copy"><span className="eyebrow"><i/> تعلّم وفق المنهج اليمني</span>
        <h1>دراستك تصير<br/><em>أوضح وأسهل.</em></h1>
        <p>مكان واحد يجمع الشرح المنظم، والتدريب، والاختبارات، ومتابعة التقدّم — خطوة بخطوة.</p>
        <div className="hero-actions"><Link className="button primary" to="/curriculum">ابدأ من المنهج <ArrowLeft size={18}/></Link><a className="button quiet" href="#how">كيف تعمل المنصة؟</a></div>
        <div className="trust"><ShieldCheck size={16}/> المحتوى يُراجع قبل نشره</div>
      </div>
      <div className="preview-panel"><div className="preview-top"><i/> مساحة مذاكرتك</div><div className="preview-heading">مسارك الدراسي <span>النسخة الأولى</span></div>
        <div className="grade-row"><div className="grade-icon"><BookOpen size={23}/></div><div><b>{pilotGrade.name}</b><small>{pilotGrade.track}</small></div><ChevronLeft className="grade-chevron" size={19}/></div>
        <div className="progress-label"><span>خريطة التعلّم</span><span>قيد الإعداد</span></div><div className="skeleton"><i/><i/><i/></div>
        <div className="preview-bottom"><div><b>شرح</b><small>دروس مرتبة</small></div><div><b>تدريب</b><small>أسئلة متنوعة</small></div><div><b>تقدّم</b><small>متابعة مستمرة</small></div></div>
        <span className="floating-note"><Sparkles size={14}/> تعلّم بتركيز</span>
      </div>
    </div></section>
    <section className="section container" id="how"><div className="section-head"><div><span className="kicker">طريقة التعلّم</span><h2>من أول فكرة إلى الاستعداد للاختبار.</h2></div><p>بدون تشتيت. كل شيء مرتب حول المنهج والدرس الذي تذاكره الآن.</p></div>
      <div className="steps">{learningSteps.map((s) => <article className="step" key={s.n}><span>{s.n}</span><h3>{s.title}</h3><p>{s.text}</p><i/></article>)}</div>
    </section>
    <section className="dark-strip"><div className="container strip-inner"><div><span className="kicker light">نقطة البداية</span><h2>نبدأ بالثالث الثانوي العلمي.</h2><p>نبني النسخة الأولى بعناية، ثم نوسّعها لبقية الصفوف والمراحل.</p></div><Link className="button light-button" to="/curriculum">تصفّح المنهج <ArrowLeft size={18}/></Link></div></section>
  </>;
}

function CurriculumPage() {
  return <main className="page container"><div className="page-intro"><span className="kicker">المكتبة التعليمية</span><h1>اختر مسارك الدراسي.</h1><p>نرتّب المحتوى حسب المرحلة والصف والمسار والمادة والوحدة والدرس.</p></div>
    <div className="curriculum-layout"><aside className="grade-aside"><small>المرحلة الحالية</small><h2>{pilotGrade.stage}</h2><hr/><small>الصف</small><b>{pilotGrade.name}</b><span className="track-pill">{pilotGrade.track}</span><p>{pilotGrade.note}</p></aside>
      <div className="subject-area"><div className="subject-title"><div><span className="kicker">مواد المسار</span><h2>المواد الدراسية</h2></div><small>تجهيز ومراجعة المحتوى</small></div>
        <div className="subject-grid">{subjects.map((s) => <article className="subject-card" key={s.id}><div className="subject-top"><BookOpen size={19}/><span className={s.status === "pilot" ? "tag pilot" : "tag"}>{s.status === "pilot" ? "أولوية النسخة الأولى" : "قريباً"}</span></div><h3>{s.name}</h3><p>{s.status === "pilot" ? "يجري إعداد هيكل الدروس والموارد لهذه المادة." : "ستُضاف بعد تثبيت قائمة المنهج ومراجعة مصادرها."}</p><div className="subject-foot"><span>الوحدات والدروس</span><b>—</b></div></article>)}</div>
      </div></div>
    <div className="notice"><ShieldCheck size={19}/><p>قائمة المواد والوحدات ليست اعتماداً نهائياً للمنهج؛ ستتم مطابقتها مع النسخة الرسمية قبل نشر أي درس أو سؤال.</p></div>
  </main>;
}

function DashboardPage() {
  const { user, role } = useAuth();
  return <main className="page container narrow"><div className="page-intro"><span className="kicker">مساحتك الشخصية</span><h1>أهلاً بك في مساحة التعلّم.</h1><p>{user?.email}</p></div>
    <div className="stats"><article><BookOpen/><span>الدروس المكتملة</span><b>—</b><small>تظهر بعد بدء الدراسة</small></article><article><CheckCircle2/><span>نتائج الاختبارات</span><b>—</b><small>لا توجد محاولات بعد</small></article><article><Bookmark/><span>المحفوظات</span><b>—</b><small>احفظ الدروس للمراجعة</small></article></div>
    <div className="next-step"><div><span className="kicker">خطوتك التالية</span><h2>اختر المادة التي تريد البدء بها.</h2><p>ستظهر هنا خطتك وتقدّمك ومواضيع المراجعة عند نشر المحتوى.</p></div><Link className="button primary" to="/curriculum">استكشف المنهج <ArrowLeft size={17}/></Link></div>
    {role === "admin" && <Link className="admin-link" to="/admin">الانتقال إلى لوحة الإدارة <ArrowLeft size={16}/></Link>}
  </main>;
}

function AdminPage() {
  const { role } = useAuth();
  const [health, setHealth] = useState("");
  const check = async () => {
    if (!supabase) { setHealth("لم يتم ربط Supabase بعد."); return; }
    const { error } = await supabase.from("education_stages").select("id", { count: "exact", head: true });
    setHealth(error ? "تعذّر الاتصال: " + error.message : "الاتصال بقاعدة البيانات يعمل.");
  };
  if (role !== "admin" && role !== "editor") return <main className="page container"><div className="notice"><ShieldCheck/><p>هذه الصفحة للمحررين والمديرين فقط. تحقّق من صلاحية حسابك.</p></div></main>;
  const sections = ["المراحل والصفوف", "المسارات والمواد", "الوحدات والدروس", "الأسئلة والاختبارات", "مصادر المحتوى", "المستخدمون والصلاحيات"];
  return <main className="page container"><div className="page-intro"><span className="kicker">مساحة الإدارة</span><h1>إدارة المحتوى.</h1><p>الهيكل الأولي لإدارة المنهج والنشر ومراجعة المصادر.</p></div>
    <div className="admin-grid">{sections.map((s,i) => <article key={s}><small>0{i+1}</small><h3>{s}</h3><p>تُفعّل عمليات الإضافة والتعديل بعد إكمال ربط قاعدة البيانات.</p></article>)}</div>
    <div className="next-step"><div><h2>حالة الربط</h2><p>افحص اتصال المنصة بقاعدة بيانات Supabase.</p>{health && <small className="health">{health}</small>}</div><button className="button primary" onClick={check}>فحص الاتصال</button></div>
  </main>;
}

function LoginPage() {
  const [email,setEmail] = useState(""); const [password,setPassword] = useState("");
  const [mode,setMode] = useState<"login"|"signup">("login"); const [message,setMessage] = useState(""); const [busy,setBusy] = useState(false);
  const navigate = useNavigate();
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setMessage("");
    if (!supabase) { setMessage("تسجيل الدخول غير متاح بعد. يلزم ربط مشروع Supabase أولاً."); return; }
    setBusy(true);
    try {
      const result = mode === "login" ? await supabase.auth.signInWithPassword({email,password}) : await supabase.auth.signUp({email,password});
      if (result.error) throw result.error;
      setMessage(mode === "signup" && !result.data.session ? "تم إنشاء الحساب. راجع بريدك الإلكتروني لتأكيده." : "تم تسجيل الدخول بنجاح.");
      if (result.data.session) navigate("/dashboard");
    } catch (err) { setMessage(err instanceof Error ? err.message : "حدث خطأ غير متوقع."); }
    finally { setBusy(false); }
  };
  return <main className="page container login-wrap"><section className="login-card"><span className="login-icon"><GraduationCap/></span><span className="kicker">حساب Yemen Study</span><h1>{mode === "login" ? "مرحباً بعودتك." : "أنشئ حسابك."}</h1><p>احفظ تقدّمك وتابع دراستك من مكان واحد.</p>
    <form onSubmit={submit}><label htmlFor="email">البريد الإلكتروني</label><input id="email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="name@example.com"/><label htmlFor="password">كلمة المرور</label><input id="password" type="password" minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={e=>setPassword(e.target.value)} required placeholder="8 أحرف على الأقل"/>
      {!isSupabaseConfigured && <div className="hint">هذه نسخة أولية حتى يتم إعداد متغيرات Supabase.</div>}{message && <div className="message" role="status">{message}</div>}
      <button className="button primary submit" disabled={busy}>{busy ? "جارٍ التنفيذ..." : mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"} <ArrowLeft size={17}/></button>
    </form><button className="switch" onClick={()=>{setMode(mode === "login" ? "signup" : "login");setMessage("");}}>{mode === "login" ? "ليس لديك حساب؟ أنشئ حساباً" : "لديك حساب بالفعل؟ سجّل الدخول"}</button>
  </section></main>;
}

function NotFound() { return <main className="page container"><h1>الصفحة غير موجودة</h1><Link to="/" className="button primary">العودة للرئيسية</Link></main>; }

export default function App() {
  const { loading } = useAuth();
  if (loading) return <div className="loading">Yemen Study</div>;
  return <div className="app-shell"><Header/><Routes><Route path="/" element={<HomePage/>}/><Route path="/curriculum" element={<CurriculumPage/>}/><Route path="/dashboard" element={<DashboardPage/>}/><Route path="/admin" element={<AdminPage/>}/><Route path="/login" element={<LoginPage/>}/><Route path="*" element={<NotFound/>}/></Routes>
    <footer className="footer"><div className="container footer-inner"><b>Yemen Study</b><span>منصة تعليمية للمناهج اليمنية</span><span>© {new Date().getFullYear()} Yemen Study</span></div></footer>
  </div>;
}
