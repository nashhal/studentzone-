import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, Brain, Check, CheckCircle2, ChevronLeft,
  RotateCcw, ShieldCheck, Sparkles, Target, Timer, Trophy, X
} from "lucide-react";
import { Link } from "react-router-dom";
import { demoLesson, type Question } from "./data/learning";

type AttemptAnswer = { questionId: string; correct: boolean; difficulty: Question["difficulty"] };
type Attempt = {
  id: string;
  createdAt: string;
  score: number;
  total: number;
  answers: AttemptAnswer[];
  source: "target-test" | "guided-practice" | "mock";
};

const ATTEMPTS_KEY = "yemen-study-attempts-v1";

function readAttempts(): Attempt[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || "[]");
    return Array.isArray(value) ? value as Attempt[] : [];
  } catch {
    return [];
  }
}

function storeAttempt(attempt: Attempt) {
  try {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify([...readAttempts(), attempt]));
  } catch {
    // Browser storage may be disabled or full.
  }
}

function saveAttempt(source: Attempt["source"], questions: Question[], answers: Record<string, number>) {
  const result: Attempt = {
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
    score: questions.filter((question) => answers[question.id] === question.correctIndex).length,
    total: questions.length,
    answers: questions.map((question) => ({
      questionId: question.id,
      correct: answers[question.id] === question.correctIndex,
      difficulty: question.difficulty,
    })),
    source,
  };
  storeAttempt(result);
  return result;
}

function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="tool-page-intro"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div></div>;
}

function ToolNotice({ children }: { children: ReactNode }) {
  return <div className="tool-notice"><ShieldCheck size={17}/><span>{children}</span></div>;
}

function QuestionCard({
  question, index, selected, disabled, onSelect, reveal
}: {
  question: Question;
  index: number;
  selected?: number;
  disabled?: boolean;
  onSelect: (value: number) => void;
  reveal?: boolean;
}) {
  return <article className="practice-question">
    <div className="question-top"><span>السؤال {index + 1}</span><span className="difficulty">{question.difficulty}</span></div>
    <h3>{question.prompt}</h3>
    <div className="answer-options">
      {question.options.map((option, optionIndex) => {
        const correct = reveal && optionIndex === question.correctIndex;
        const wrong = reveal && selected === optionIndex && optionIndex !== question.correctIndex;
        return <button
          type="button"
          key={option}
          disabled={disabled}
          className={correct ? "answer-option correct" : wrong ? "answer-option incorrect" : selected === optionIndex ? "answer-option chosen" : "answer-option"}
          onClick={() => onSelect(optionIndex)}
        >
          <span>{["أ", "ب", "ج", "د"][optionIndex]}</span>{option}
          {correct && <Check size={16}/>}
        </button>;
      })}
    </div>
    {reveal && <div className={selected === question.correctIndex ? "answer-explanation good" : "answer-explanation"}>
      <b>{selected === question.correctIndex ? "إجابة صحيحة" : "راجع هذه الفكرة"}</b>
      <p>{question.explanation}</p>
    </div>}
  </article>;
}

export function TargetTestPage() {
  const [difficulty, setDifficulty] = useState("all");
  const [questionLimit, setQuestionLimit] = useState("all");
  const [minutes, setMinutes] = useState(5);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [seconds, setSeconds] = useState(300);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Attempt | null>(null);

  const available = useMemo(() => demoLesson.questions.filter((q) => difficulty === "all" || q.difficulty === difficulty), [difficulty]);
  const questions = useMemo(() => questionLimit === "all" ? available : available.slice(0, Number(questionLimit)), [available, questionLimit]);
  const timeLabel = String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");

  useEffect(() => {
    if (!started || submitted || seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [started, submitted, seconds]);

  useEffect(() => {
    if (started && seconds === 0 && !submitted) {
      const saved = saveAttempt("target-test", questions, answers);
      setResult(saved);
      setSubmitted(true);
    }
  }, [seconds, started, submitted, questions, answers]);

  const start = () => {
    setAnswers({});
    setResult(null);
    setSeconds(minutes * 60);
    setSubmitted(false);
    setStarted(true);
  };
  const finish = () => {
    if (submitted) return;
    setResult(saveAttempt("target-test", questions, answers));
    setSubmitted(true);
  };

  return <main className="container page study-tool-page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><b>الاختبار المستهدف</b></div>
    <PageIntro eyebrow="تدريب مخصص لنقاطك" title="الاختبار المستهدف" description="اختر الموضوع ومستوى الصعوبة والوقت، ثم أكمل اختباراً قصيراً يكشف لك ما يحتاج إلى مراجعة."/>
    {!started && <section className="tool-workspace">
      <div className="tool-workspace-head"><span className="tool-icon"><Target size={24}/></span><div><h2>أنشئ اختبارك</h2><p>المحتوى التجريبي المتاح الآن: {demoLesson.title}</p></div></div>
      <div className="builder-grid">
        <label><span>الموضوع</span><select value="vectors" disabled><option value="vectors">{demoLesson.title}</option></select></label>
        <label><span>مستوى الصعوبة</span><select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}><option value="all">كل المستويات</option><option value="سهل">سهل</option><option value="متوسط">متوسط</option><option value="متقدم">متقدم</option></select></label>
        <label><span>عدد الأسئلة</span><select value={questionLimit} onChange={(e) => setQuestionLimit(e.target.value)}><option value="all">كل الأسئلة المتاحة</option><option value="1">سؤال واحد</option><option value="2">سؤالان</option><option value="3">ثلاثة أسئلة</option></select></label>
        <label><span>المدة</span><select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}><option value={5}>5 دقائق</option><option value={10}>10 دقائق</option><option value={15}>15 دقيقة</option><option value={20}>20 دقيقة</option></select></label>
      </div>
      <div className="test-ready-row"><div><b>{questions.length} أسئلة جاهزة</b><small>المتاح حالياً في هذا النموذج: {available.length} أسئلة</small></div><button className="btn btn-primary" disabled={!questions.length} onClick={start}>ابدأ الاختبار <ArrowLeft size={16}/></button></div>
      {!questions.length && <p className="form-hint">لا توجد أسئلة بهذا المستوى في النموذج الحالي. غيّر مستوى الصعوبة.</p>}
    </section>}
    {started && <section className="tool-workspace">
      <div className="mock-toolbar"><div><b>اختبار {demoLesson.title}</b><small>{questions.length} أسئلة · تدريب مخصص</small></div><div className={seconds < 60 ? "timer-pill warning" : "timer-pill"}><Timer size={17}/>{timeLabel}</div></div>
      {!submitted ? <>
        {questions.map((q, index) => <QuestionCard key={q.id} question={q} index={index} selected={answers[q.id]} onSelect={(value) => setAnswers((old) => ({ ...old, [q.id]: value }))}/>)}
        <div className="test-ready-row"><small>{Object.keys(answers).length} من {questions.length} تمت الإجابة عنها</small><button className="btn btn-primary" onClick={finish}>إنهاء الاختبار <CheckCircle2 size={16}/></button></div>
      </> : <ResultPanel result={result} onRestart={() => { setStarted(false); setSubmitted(false); setAnswers({}); }}/>}
    </section>}
    <ToolNotice>هذا إصدار تجريبي يعمل بأسئلة الدرس النموذجي فقط، ويحفظ النتائج في هذا المتصفح. لا توجد بعد قاعدة بيانات أو محتويات موثقة لجميع المواد.</ToolNotice>
  </main>;
}

function ResultPanel({ result, onRestart }: { result: Attempt | null; onRestart: () => void }) {
  if (!result) return null;
  const percentage = result.total ? Math.round(result.score / result.total * 100) : 0;
  return <div className="tool-result">
    <span className="tool-result-icon"><Trophy size={28}/></span>
    <span className="eyebrow">نتيجة محاولتك</span>
    <strong>{result.score} / {result.total}</strong>
    <div className="result-progress"><i style={{ width: percentage + "%" }}/></div>
    <p>{percentage >= 80 ? "أداء جيد. راجع النقاط التي أخطأت فيها ثم واصل." : "راجع ملاحظات الدرس، ثم أعد المحاولة لترسيخ المفاهيم."}</p>
    <div className="result-actions"><button className="btn btn-outline" onClick={onRestart}><RotateCcw size={15}/> اختبار جديد</button><Link className="btn btn-primary" to="/strengths-weaknesses">تحليل نقاط القوة والضعف <ArrowLeft size={15}/></Link></div>
  </div>;
}

export function StrengthsWeaknessesPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  useEffect(() => { setAttempts(readAttempts()); }, []);
  const totalAnswers = attempts.reduce((sum, attempt) => sum + attempt.answers.length, 0);
  const correctAnswers = attempts.reduce((sum, attempt) => sum + attempt.answers.filter((answer) => answer.correct).length, 0);
  const accuracy = totalAnswers ? Math.round(correctAnswers / totalAnswers * 100) : 0;
  const byQuestion = demoLesson.questions.map((question) => {
    const answers = attempts.flatMap((attempt) => attempt.answers).filter((answer) => answer.questionId === question.id);
    const right = answers.filter((answer) => answer.correct).length;
    return { question, count: answers.length, accuracy: answers.length ? Math.round(right / answers.length * 100) : null };
  });
  return <main className="container page study-tool-page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><b>نقاط القوة والضعف</b></div>
    <PageIntro eyebrow="اعرف ما يحتاج إلى مراجعة" title="نقاط القوة والضعف" description="ملخص أداء مبني على إجاباتك في الاختبارات المسجلة على هذا الجهاز."/>
    <div className="performance-summary"><article><span>دقة الإجابات</span><b>{totalAnswers ? accuracy + "%" : "—"}</b><small>{correctAnswers} إجابات صحيحة من {totalAnswers}</small></article><article><span>المحاولات</span><b>{attempts.length}</b><small>اختبارات محفوظة محلياً</small></article><article><span>الموضوعات المتتبعة</span><b>{totalAnswers ? 1 : 0}</b><small>من محتوى النموذج التجريبي</small></article></div>
    <section className="tool-workspace">
      <div className="panel-heading"><h2>تحليل الموضوع</h2><span className="content-status">الفيزياء · نموذج تجريبي</span></div>
      {totalAnswers ? <div className="topic-performance-list">{byQuestion.map(({ question, count, accuracy: value }) => <article key={question.id}><div><b>{question.prompt}</b><small>{count ? count + " محاولات مسجلة" : "لم تتم الإجابة بعد"}</small></div><div className="topic-meter"><span><i style={{ width: (value ?? 0) + "%" }}/></span><b>{value === null ? "—" : value + "%"}</b></div></article>)}</div> : <div className="dashboard-empty"><Brain/><b>لا توجد بيانات كافية بعد</b><p>أكمل اختباراً مستهدفاً حتى يظهر تحليل إجاباتك.</p><Link className="btn btn-primary" to="/target-test">إنشاء اختبار مستهدف <ArrowLeft size={15}/></Link></div>}
    </section>
    <div className="next-revision"><span className="tool-icon"><BookOpen size={22}/></span><div><b>خطوتك التالية</b><p>عد إلى ملاحظات الدرس وراجع الفكرة قبل المحاولة القادمة.</p></div><Link className="text-link" to="/lesson/scalars-and-vectors">مراجعة الدرس <ArrowLeft size={15}/></Link></div>
    <ToolNotice>هذا التحليل مبدئي ويعتمد على سجل هذا المتصفح فقط. التحليل الكامل عبر المواد والأجهزة يحتاج حفظ النتائج في قاعدة بيانات مرتبطة بحساب الطالب.</ToolNotice>
  </main>;
}

export function GuidedStudyPage() {
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState(false);
  const steps = useMemo(() => [
    { title: "أهداف التعلّم", body: "بعد هذه الجلسة، ينبغي أن تميّز بين الكميات القياسية والمتجهة، وتحدد المعلومات اللازمة لوصف كل منهما.", detail: demoLesson.objectives.join(" • ") },
    ...demoLesson.sections.map((section) => ({ title: section.heading, body: section.body, detail: section.bullets?.join(" • ") || "توقّف لحظة وحاول شرح الفكرة بكلماتك." })),
    { title: "تحقّق من فهمك", body: demoLesson.questions[0].prompt, detail: demoLesson.questions[0].explanation },
    { title: "مراجعة نهائية", body: "أكمل مراجعة الملخص والأمثلة، ثم انتقل إلى التدريب المستقل.", detail: demoLesson.recap.join(" • ") },
  ], []);
  const final = step === steps.length - 1;
  return <main className="container page study-tool-page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><b>الدراسة الموجّهة</b></div>
    <PageIntro eyebrow="تعلّم خطوة بخطوة" title="جلسة دراسة موجّهة" description="قسّم الموضوع إلى أجزاء قصيرة. اقرأ كل خطوة، استوعبها، ثم انتقل إلى التالية."/>
    <section className="guided-shell">
      <div className="guided-top"><div><span className="content-status">جلسة نموذجية</span><h2>{demoLesson.title}</h2></div><span>{step + 1} / {steps.length}</span></div>
      <div className="guided-progress">{steps.map((_, index) => <i key={index} className={index <= step ? "active" : ""}/>)}</div>
      <span className="eyebrow">الخطوة {step + 1}</span><h3>{steps[step].title}</h3><p className="guided-body">{steps[step].body}</p>
      {checked && <div className="guided-detail"><Sparkles size={17}/><p>{steps[step].detail}</p></div>}
      {final ? <div className="guided-complete"><CheckCircle2 size={24}/><b>أنهيت الجلسة الموجّهة</b><p>انتقل إلى أسئلة الموضوع حتى تختبر قدرتك على تطبيق ما تعلمته.</p><Link className="btn btn-primary" to="/subject/grade-12/scientific/physics">تدريب الموضوع <ArrowLeft size={15}/></Link></div> : <div className="guided-actions"><button className="btn btn-outline" disabled={step === 0} onClick={() => { setStep((value) => value - 1); setChecked(false); }}><ArrowRight size={15}/> السابق</button><button className="btn btn-outline" onClick={() => setChecked((value) => !value)}>{checked ? "إخفاء المساعدة" : "اشرح هذه الخطوة"}</button><button className="btn btn-primary" onClick={() => { setStep((value) => value + 1); setChecked(false); }}>التالي <ArrowLeft size={15}/></button></div>}
    </section>
    <ToolNotice>الجلسة الحالية مبنية على درس تجريبي واحد. التخصيص حسب مستوى الطالب وحفظ موضع التوقف سيُربطان بقاعدة البيانات لاحقاً.</ToolNotice>
  </main>;
}

export function GuidedPracticePage() {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | undefined>(undefined);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);
  const question = demoLesson.questions[index];
  const doneCount = Object.keys(answers).length;
  const finish = () => {
    const fullAnswers = { ...answers, [question.id]: choice as number };
    setAnswers(fullAnswers);
    saveAttempt("guided-practice", demoLesson.questions, fullAnswers);
    setFinished(true);
  };
  const next = () => {
    setAnswers((old) => ({ ...old, [question.id]: choice as number }));
    setChoice(undefined);
    setIndex((value) => value + 1);
  };
  return <main className="container page study-tool-page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><b>التدريب الموجّه</b></div>
    <PageIntro eyebrow="تدريب يتدرّج مع إجاباتك" title="التدريب الموجّه" description="أجب عن سؤال واحد في كل مرة، راجع تفسيره، ثم انتقل إلى السؤال التالي."/>
    <section className="tool-workspace">
      {!finished ? <>
        <div className="guided-top"><div><span className="content-status">سؤال {index + 1} من {demoLesson.questions.length}</span><h2>{demoLesson.title}</h2></div><span>{doneCount} إجابات</span></div>
        <div className="guided-progress">{demoLesson.questions.map((_, i) => <i key={i} className={i <= index ? "active" : ""}/>)}</div>
        <QuestionCard question={question} index={index} selected={choice} onSelect={setChoice}/>
        <div className="guided-actions">{index < demoLesson.questions.length - 1 ? <button className="btn btn-primary" disabled={choice === undefined} onClick={next}>السؤال التالي <ArrowLeft size={15}/></button> : <button className="btn btn-primary" disabled={choice === undefined} onClick={finish}>إنهاء التدريب <CheckCircle2 size={15}/></button>}</div>
      </> : <div className="tool-result"><span className="tool-result-icon"><CheckCircle2 size={28}/></span><h2>أكملت التدريب الموجّه</h2><p>تم حفظ المحاولة محلياً. راجع نتيجة أدائك قبل الانتقال لموضوع آخر.</p><Link className="btn btn-primary" to="/strengths-weaknesses">تحليل الأداء <ArrowLeft size={15}/></Link></div>}
    </section>
    <ToolNotice>يعمل هذا النموذج على بنك أسئلة الدرس التجريبي فقط، وتُحفظ المحاولات على الجهاز الحالي.</ToolNotice>
  </main>;
}

export function SmartMarkPage() {
  const [answer, setAnswer] = useState("");
  const [marked, setMarked] = useState(false);
  const criteria = [
    { label: "ذكر المقدار العددي", keys: ["مقدار", "رقم", "عددي"] },
    { label: "ذكر وحدة القياس", keys: ["وحدة", "متر", "كيلوجرام", "ثانية"] },
    { label: "توضيح الاتجاه عند الحاجة", keys: ["اتجاه", "شرق", "غرب", "شمال", "جنوب"] },
  ];
  const matched = criteria.filter((criterion) => criterion.keys.some((word) => answer.includes(word)));
  const score = matched.length;
  return <main className="container page study-tool-page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><b>مراجع الإجابة</b></div>
    <PageIntro eyebrow="مراجعة الإجابات" title="مراجع الإجابة" description="اكتب إجابتك، ثم راجع عناصر الإجابة الأساسية وما يمكن تحسينه."/>
    <section className="tool-workspace">
      <span className="content-status">نموذج تقييم بمعايير ثابتة</span>
      <h2>السؤال</h2><p className="mark-question">وضّح الفرق بين الكمية القياسية والكمية المتجهة، واذكر مثالاً لكل منهما.</p>
      <label className="answer-input"><span>إجابتك</span><textarea rows={6} value={answer} onChange={(e) => { setAnswer(e.target.value); setMarked(false); }} placeholder="اكتب إجابتك هنا..."/></label>
      <button className="btn btn-primary" disabled={answer.trim().length < 8} onClick={() => setMarked(true)}>راجع إجابتي <CheckCircle2 size={16}/></button>
      {marked && <div className="mark-feedback"><div className="mark-score"><b>{score} / 3</b><small>عناصر الإجابة التي ظهرت في النص</small></div><div className="mark-criteria">{criteria.map((criterion) => <div key={criterion.label} className={matched.includes(criterion) ? "criterion met" : "criterion"}><span>{matched.includes(criterion) ? <Check size={15}/> : <X size={15}/>}</span>{criterion.label}</div>)}</div><div className="answer-explanation"><b>نموذج إجابة للمقارنة</b><p>الكمية القياسية تُحدد بمقدار عددي ووحدة قياس فقط، مثل الكتلة والزمن. أما الكمية المتجهة فتحتاج إلى مقدار واتجاه معاً، مثل الإزاحة والقوة.</p></div></div>}
    </section>
    <ToolNotice>هذا فاحص تعليمي تجريبي يعتمد على كلمات ومعايير محددة، وليس نموذج ذكاء اصطناعي ولا تصحيحاً وزارياً. التصحيح الذكي الحقيقي يحتاج خدمة خادمية ومعايير إجابة موثقة.</ToolNotice>
  </main>;
}

export function TestBuilderPage({ role }: { role: string | null }) {
  const [selected, setSelected] = useState<string[]>(demoLesson.questions.map((q) => q.id));
  const allowed = role === "admin" || role === "editor";
  const chosen = demoLesson.questions.filter((q) => selected.includes(q.id));
  if (!allowed) return <main className="container page study-tool-page"><div className="paper-library-empty"><ShieldCheck/><h2>محرر الاختبارات للمعلمين</h2><p>يلزم تسجيل الدخول بصلاحية محرر أو مدير للوصول إلى هذه المساحة.</p><Link className="btn btn-primary" to="/login">تسجيل الدخول <ArrowLeft size={15}/></Link></div></main>;
  return <main className="container page study-tool-page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><b>محرر الاختبارات</b></div>
    <PageIntro eyebrow="أدوات المعلم" title="محرر الاختبارات" description="أنشئ ورقة تدريبية من بنك الأسئلة المتاح، واختر العناصر التي تريد تضمينها."/>
    <div className="builder-layout"><section className="tool-workspace"><div className="panel-heading"><h2>بنك الأسئلة</h2><span>{selected.length} محددة</span></div>{demoLesson.questions.map((q) => <label className="builder-question" key={q.id}><input type="checkbox" checked={selected.includes(q.id)} onChange={() => setSelected((old) => old.includes(q.id) ? old.filter((id) => id !== q.id) : [...old, q.id])}/><span><b>{q.prompt}</b><small>{q.difficulty} · {demoLesson.title}</small></span></label>)}<button className="btn btn-outline" onClick={() => window.print()} disabled={!chosen.length}><FileText size={15}/> طباعة / حفظ PDF</button></section><section className="tool-workspace paper-preview"><span className="content-status">معاينة الورقة</span><h2>اختبار تدريبي — Yemen Study</h2><p>المادة: الفيزياء · الموضوع: {demoLesson.title}</p>{chosen.map((q, index) => <article key={q.id}><b>{index + 1}. {q.prompt}</b><ol type="A">{q.options.map((option) => <li key={option}>{option}</li>)}</ol></article>)}{!chosen.length && <p>اختر سؤالاً واحداً على الأقل لعرض المعاينة.</p>}</section></div>
    <ToolNotice>هذه نسخة أولية لمحرر الأسئلة من المحتوى التجريبي. لا توجد بعد صلاحية معلم مستقلة أو قاعدة بيانات للأسئلة.</ToolNotice>
  </main>;
}
