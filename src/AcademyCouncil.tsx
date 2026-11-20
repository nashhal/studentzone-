import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Activity, Archive, ArrowLeft, BookOpenCheck, Bot, Check, CheckCircle2,
  ClipboardList, FileCheck2, FlaskConical, Gauge, ListChecks, Plus,
  ShieldAlert, ShieldCheck, Trash2, Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "./lib/auth";
import "./academy-council.css";

type AgentId = "director" | "curriculum" | "content" | "assessment" | "review" | "experience" | "quality" | "release";
type TaskStatus = "new" | "active" | "review" | "done";
type Priority = "high" | "normal" | "low";
type CouncilTask = {
  id: string;
  title: string;
  details: string;
  agent: AgentId;
  status: TaskStatus;
  priority: Priority;
  createdAt: string;
};

const TASKS_KEY = "yemen-study-academic-council-tasks-v1";
const NOTES_KEY = "yemen-study-academic-council-notes-v1";

const agents: {
  id: AgentId; name: string; role: string; remit: string; output: string; icon: typeof Bot;
}[] = [
  { id: "director", name: "رئيس المجلس", role: "مدير المشروع", remit: "ترتيب الأولويات، تقسيم مراحل التطوير، متابعة الاعتماد والقرارات.", output: "خارطة طريق وقرارات تنفيذية", icon: Gauge },
  { id: "curriculum", name: "باحث المنهج", role: "مطابقة المقررات", remit: "مراجعة الفهارس والطبعات، ربط كل درس بمصدره، وتحديد فجوات التغطية.", output: "مصفوفة تغطية مع أرقام الصفحات", icon: BookOpenCheck },
  { id: "content", name: "كاتب المحتوى", role: "التأليف التعليمي", remit: "إعداد الشروحات والأمثلة والملخصات بلغة أكاديمية تناسب المرحلة.", output: "مسودة درس وأهداف تعلم", icon: BookOpenCheck },
  { id: "assessment", name: "مصمم الاختبارات", role: "بناء بنك الأسئلة", remit: "توزيع الأسئلة على نواتج التعلم والمهارات ومستويات الصعوبة وأنواعها.", output: "مخطط اختبار وبنك أسئلة", icon: ClipboardList },
  { id: "review", name: "المدقق العلمي", role: "التحقق من الدقة", remit: "فحص المصطلحات والقوانين والحسابات ومفاتيح الإجابة والتفسيرات.", output: "تقرير ملاحظات وتصحيحات", icon: FlaskConical },
  { id: "experience", name: "مصمم تجربة الطالب", role: "تجربة الاستخدام", remit: "تحسين وضوح الدروس والاختبارات، سهولة التنقل، ودعم الجوال وإمكانية الوصول.", output: "ملاحظات UX وقائمة تحسينات", icon: Users },
  { id: "quality", name: "مهندس الجودة", role: "اختبار المنصة", remit: "اختبار الروابط والتفاعل والأخطاء والبناء، ومراجعة عدم كسر الوظائف القائمة.", output: "تقرير QA ونتائج الاختبارات", icon: CheckCircle2 },
  { id: "release", name: "مسؤول الإصدارات", role: "النشر والتوثيق", remit: "تجهيز سجل التغييرات، التحقق من نجاح CI، ومتابعة نشر النسخة المعتمدة.", output: "مذكرة إصدار ورابط النشر", icon: Archive },
];

const seedTasks: CouncilTask[] = [
  { id: "seed-01", title: "مطابقة فهرس الفيزياء مع الملخص المرفق", details: "التحقق من ترتيب الوحدات والدروس وحدود الصفحات، وتسجيل أي موضوع غير مغطى.", agent: "curriculum", status: "review", priority: "high", createdAt: "2026-11-20T00:00:00.000Z" },
  { id: "seed-02", title: "تدقيق مفاتيح إجابات بنك الفيزياء الموسع", details: "إعادة حل المسائل رقمياً ومقارنة الإجابة المختارة مع الشرح قبل اعتماد البنك.", agent: "review", status: "active", priority: "high", createdAt: "2026-11-20T00:01:00.000Z" },
  { id: "seed-03", title: "تطوير الاختبار التراكمي للفيزياء", details: "مراجعة التوازن بين الوحدات وأنواع الأسئلة وأزمنة الاختبار ومستويات الصعوبة.", agent: "assessment", status: "active", priority: "high", createdAt: "2026-11-20T00:02:00.000Z" },
  { id: "seed-04", title: "مراجعة استقلالية صفحات الدروس", details: "اختبار روابط الدرس السابق والتالي، وقائمة الدروس والطباعة على شاشة صغيرة.", agent: "experience", status: "new", priority: "normal", createdAt: "2026-11-20T00:03:00.000Z" },
  { id: "seed-05", title: "فحص البناء والنشر بعد تحديث الاختبارات", details: "تشغيل typecheck وbuild والتأكد من نشر GitHub Pages دون أخطاء.", agent: "quality", status: "new", priority: "high", createdAt: "2026-11-20T00:04:00.000Z" },
  { id: "seed-06", title: "إعداد خارطة تطوير مواد الصف الثالث", details: "تحديد المواد والوحدات الناقصة وترتيب التنفيذ بحسب أولوية المنهج العدني.", agent: "director", status: "new", priority: "normal", createdAt: "2026-11-20T00:05:00.000Z" },
  { id: "seed-07", title: "مراجعة حقوق المصادر والمحتوى", details: "التأكد من ذكر المراجع وعدم نسخ مواد محمية حرفياً وتوثيق الصفحات المستخدمة.", agent: "content", status: "new", priority: "normal", createdAt: "2026-11-20T00:06:00.000Z" },
  { id: "seed-08", title: "إعداد قائمة تحقق قبل كل إصدار", details: "وضع معايير قبول للدرس والاختبار وتجربة الطالب وسلامة النشر.", agent: "release", status: "new", priority: "normal", createdAt: "2026-11-20T00:07:00.000Z" },
];

const statusLabels: Record<TaskStatus, string> = {
  new: "جديدة",
  active: "قيد العمل",
  review: "بانتظار المراجعة",
  done: "مكتملة",
};
const priorityLabels: Record<Priority, string> = { high: "عالية", normal: "عادية", low: "منخفضة" };

function readTasks(): CouncilTask[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return seedTasks;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedTasks;
    return (parsed as CouncilTask[]).filter((item) =>
      item && typeof item.id === "string" && typeof item.title === "string" &&
      agents.some((agent) => agent.id === item.agent) &&
      ["new", "active", "review", "done"].includes(item.status),
    );
  } catch {
    return seedTasks;
  }
}

function readNotes(): string {
  try { return localStorage.getItem(NOTES_KEY) || ""; } catch { return ""; }
}

export default function AcademyCouncilPage() {
  const { role } = useAuth();
  const [tasks, setTasks] = useState<CouncilTask[]>(readTasks);
  const [notes, setNotes] = useState(readNotes);
  const [draftNotes, setDraftNotes] = useState(readNotes);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [agent, setAgent] = useState<AgentId>("director");
  const [priority, setPriority] = useState<Priority>("normal");
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); } catch { /* storage may be disabled */ }
  }, [tasks]);

  const stats = useMemo(() => ({
    all: tasks.length,
    new: tasks.filter((task) => task.status === "new").length,
    active: tasks.filter((task) => task.status === "active").length,
    review: tasks.filter((task) => task.status === "review").length,
    done: tasks.filter((task) => task.status === "done").length,
  }), [tasks]);

  const visibleTasks = useMemo(
    () => tasks.filter((task) => filter === "all" || task.status === filter)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [tasks, filter],
  );

  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;
    const task: CouncilTask = {
      id: "task-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7),
      title: title.trim(),
      details: details.trim(),
      agent,
      priority,
      status: "new",
      createdAt: new Date().toISOString(),
    };
    setTasks((old) => [task, ...old]);
    setTitle("");
    setDetails("");
    setPriority("normal");
    setFilter("all");
    setNotice("أُضيفت المهمة إلى قائمة المجلس. عيّن حالتها بعد تنفيذ المراجعة فعلياً.");
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks((old) => old.map((task) => task.id === id ? { ...task, status } : task));
    setNotice("تم تحديث حالة المهمة في لوحة المتابعة.");
  };

  const deleteTask = (id: string) => {
    setTasks((old) => old.filter((task) => task.id !== id));
    setNotice("حُذفت المهمة من لوحة هذا المتصفح.");
  };

  const saveNotes = () => {
    try {
      localStorage.setItem(NOTES_KEY, draftNotes);
      setNotes(draftNotes);
      setNotice("تم حفظ محضر المجلس على هذا المتصفح.");
    } catch {
      setNotice("تعذّر حفظ المحضر في مساحة التخزين المحلية.");
    }
  };

  const restoreSeedTasks = () => {
    setTasks(seedTasks);
    setFilter("all");
    setNotice("أُعيدت قائمة المهام الابتدائية.");
  };

  if (role !== "admin" && role !== "editor") {
    return <main className="container page council-page"><div className="council-denied"><ShieldAlert size={25}/><h1>مجلس تطوير المنصة</h1><p>هذه المساحة مخصصة للمدير والمحررين المعتمدين. سجّل الدخول بحساب لديه صلاحية إدارة المحتوى.</p><Link className="btn btn-primary" to="/login">تسجيل الدخول <ArrowLeft size={16}/></Link></div></main>;
  }

  return <main className="container page council-page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><span>›</span><Link to="/admin">إدارة المحتوى</Link><span>›</span><b>مجلس البوتات الأكاديمي</b></div>

    <header className="council-hero">
      <div>
        <span className="eyebrow"><Bot size={14}/> غرفة التطوير الأكاديمي</span>
        <h1>مجلس البوتات الأكاديمي</h1>
        <p>فريق تخصصي لتنظيم تطوير Yemen Study: من تدقيق المنهج وبناء الأسئلة إلى تجربة الطالب وضمان الجودة واعتماد الإصدار.</p>
      </div>
      <div className="council-hero-mark"><Bot size={34}/><span>YEMEN STUDY</span><small>ACADEMIC COUNCIL</small></div>
    </header>

    <div className="council-status-note"><ShieldCheck size={17}/><p><b>وضع التشغيل الحالي:</b> المجلس يوفّر أدواراً متخصصة ولوحة مهام ومحاضر قرارات محفوظة محلياً. لم يتم ربط وكلاء ذكاء اصطناعي ينفذون العمل تلقائياً بعد؛ ذلك يحتاج خدمة خلفية آمنة وربط نماذج ومخزناً مشتركاً.</p></div>

    <section className="council-stats">
      <article><span>إجمالي المهام</span><b>{stats.all}</b><small>في مساحة هذا المتصفح</small></article>
      <article><span>جديدة</span><b>{stats.new}</b><small>بانتظار التكليف والتنفيذ</small></article>
      <article><span>قيد العمل</span><b>{stats.active}</b><small>يجب تحديثها بعد التنفيذ</small></article>
      <article><span>بانتظار المراجعة</span><b>{stats.review}</b><small>قبل الاعتماد</small></article>
      <article><span>مكتملة</span><b>{stats.done}</b><small>وفق تحديث المشرف</small></article>
    </section>

    <section className="council-section">
      <div className="council-section-heading"><div><span className="eyebrow">01 · أعضاء المجلس</span><h2>وكلاء متخصصون</h2><p>لكل وكيل نطاق واضح ومخرج مطلوب حتى لا تتداخل المسؤوليات.</p></div><span className="council-count">{agents.length} أدوار</span></div>
      <div className="council-agents">
        {agents.map((member) => {
          const Icon = member.icon;
          const assigned = tasks.filter((task) => task.agent === member.id);
          const active = assigned.filter((task) => task.status === "active").length;
          return <article key={member.id} className="council-agent">
            <div className="council-agent-top"><span className="council-agent-icon"><Icon size={19}/></span><span className="council-agent-load">{assigned.length} مهام</span></div>
            <h3>{member.name}</h3><small>{member.role}</small><p>{member.remit}</p>
            <div className="council-agent-output"><b>المخرج المتوقع</b><span>{member.output}</span></div>
            <div className="council-agent-footer"><span>{active} قيد العمل</span><button type="button" onClick={() => { setAgent(member.id); document.getElementById("council-task-form")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>تكليف هذا الوكيل <ArrowLeft size={13}/></button></div>
          </article>;
        })}
      </div>
    </section>

    <section className="council-work-grid">
      <div className="council-section council-create-task">
        <div className="council-section-heading"><div><span className="eyebrow">02 · إدارة العمل</span><h2>تكليف جديد</h2><p>اكتب المهمة وحدد الوكيل والأولوية المطلوبة.</p></div><Plus size={20}/></div>
        <form id="council-task-form" className="council-form" onSubmit={addTask}>
          <label>عنوان المهمة<input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="مثال: تدقيق أسئلة الوحدة الثانية"/></label>
          <label>وصف المهمة والمطلوب<textarea rows={4} value={details} onChange={(event) => setDetails(event.target.value)} placeholder="حدّد الصفحات أو الدروس والنتيجة التي يجب تسليمها."/></label>
          <div className="council-form-row">
            <label>الوكيل المسؤول<select value={agent} onChange={(event) => setAgent(event.target.value as AgentId)}>{agents.map((member) => <option key={member.id} value={member.id}>{member.name} — {member.role}</option>)}</select></label>
            <label>الأولوية<select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}><option value="high">عالية</option><option value="normal">عادية</option><option value="low">منخفضة</option></select></label>
          </div>
          <button className="btn btn-primary" type="submit" disabled={!title.trim()}>إضافة إلى المجلس <Plus size={15}/></button>
        </form>
      </div>

      <div className="council-section council-process">
        <div className="council-section-heading"><div><span className="eyebrow">03 · بروتوكول الاعتماد</span><h2>كيف تمر المهمة؟</h2><p>لا تنتقل المهمة إلى النشر قبل اجتياز المراجعات الأساسية.</p></div><ListChecks size={20}/></div>
        <ol className="council-pipeline">
          <li><span>1</span><div><b>تحديد النطاق</b><small>رئيس المجلس وباحث المنهج يحددان المصدر والهدف.</small></div></li>
          <li><span>2</span><div><b>الإنتاج</b><small>كاتب المحتوى أو مصمم الاختبارات يجهز المسودة.</small></div></li>
          <li><span>3</span><div><b>التحقق الأكاديمي</b><small>المدقق العلمي يراجع الدقة ومفاتيح الإجابة.</small></div></li>
          <li><span>4</span><div><b>اختبار الجودة</b><small>مهندس الجودة يختبر التفاعل والبناء والجوال.</small></div></li>
          <li><span>5</span><div><b>الاعتماد والنشر</b><small>المشرف يعتمد، ومسؤول الإصدار يوثق النتيجة.</small></div></li>
        </ol>
        <div className="council-rule"><ShieldCheck size={16}/><span>لا يملك أي وكيل صلاحية نشر المحتوى أو تغيير المنهج دون اعتماد بشري.</span></div>
      </div>
    </section>

    <section className="council-section council-task-board">
      <div className="council-section-heading"><div><span className="eyebrow">04 · لوحة المتابعة</span><h2>مهام المشروع</h2><p>حدّث الحالة بعد إنجاز العمل ومراجعته، ولا تعتبر مجرد التكليف إنجازاً.</p></div><div className="council-board-actions"><button type="button" onClick={restoreSeedTasks}><Activity size={14}/> إعادة القائمة الابتدائية</button></div></div>
      <div className="council-filters" role="group" aria-label="تصفية المهام">
        {(["all", "new", "active", "review", "done"] as const).map((value) => <button key={value} type="button" className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value === "all" ? "كل المهام" : statusLabels[value]}</button>)}
      </div>
      <div className="council-task-list">
        {visibleTasks.map((task) => {
          const member = agents.find((item) => item.id === task.agent)!;
          return <article className="council-task" key={task.id}>
            <div className="council-task-main">
              <div className="council-task-title-row"><h3>{task.title}</h3><span className={"council-priority " + task.priority}>{priorityLabels[task.priority]}</span></div>
              {task.details && <p>{task.details}</p>}
              <div className="council-task-meta"><span>{member.name}</span><span>{new Date(task.createdAt).toLocaleDateString("ar")}</span><span className={"council-task-status " + task.status}>{statusLabels[task.status]}</span></div>
            </div>
            <div className="council-task-controls">
              <label><span>حالة المهمة</span><select value={task.status} onChange={(event) => updateTaskStatus(task.id, event.target.value as TaskStatus)}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              {!task.id.startsWith("seed-") && <button type="button" className="council-delete-task" onClick={() => deleteTask(task.id)} aria-label="حذف المهمة"><Trash2 size={15}/></button>}
            </div>
          </article>;
        })}
        {visibleTasks.length === 0 && <div className="council-empty"><ClipboardList size={24}/><b>لا توجد مهام في هذا التصنيف.</b><span>أضف مهمة جديدة أو غيّر مرشح الحالة.</span></div>}
      </div>
    </section>

    <section className="council-section council-meeting">
      <div className="council-section-heading"><div><span className="eyebrow">05 · سجل القرارات</span><h2>محضر اجتماع المجلس</h2><p>احفظ الأولويات والقرارات التي اتفق عليها فريق التطوير.</p></div><FileCheck2 size={20}/></div>
      <label className="council-notes-label">ملاحظات وقرارات الاجتماع<textarea rows={6} value={draftNotes} onChange={(event) => setDraftNotes(event.target.value)} placeholder="مثال: لا يعتمد اختبار أي وحدة قبل فحص مفتاح الإجابة ومطابقة الدرس مع صفحات المصدر."/></label>
      <div className="council-notes-actions"><small>{notes ? "يوجد محضر محفوظ على هذا المتصفح." : "لم يتم حفظ محضر بعد."}</small><button className="btn btn-outline" type="button" onClick={saveNotes}>حفظ المحضر <Check size={15}/></button></div>
    </section>

    {notice && <div className="council-live-notice" role="status" aria-live="polite">{notice}</div>}
    <div className="council-footer-note"><ShieldAlert size={16}/><p>هذه النسخة هي لوحة إدارة وتوزيع ومراجعة مهام. لا تتصل حالياً بموديلات ذكاء اصطناعي ولا تنفذ كود GitHub أو تنشره من تلقاء نفسها. لتحويل الأدوار إلى بوتات مستقلة فعلياً، يلزم إعداد خدمة خلفية آمنة، وربط كل وكيل بأدوات محددة، وإضافة سجل تدقيق وموافقة قبل الدمج والنشر.</p></div>
  </main>;
}
