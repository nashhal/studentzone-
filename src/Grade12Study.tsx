import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, Clock3, Download, FileText, RotateCcw, ShieldCheck, Target, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import "./grade12-study.css";

type Tier = "good" | "hard" | "hardest";
type StudyQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

const tierDetails: Record<Tier, { label: string; subtitle: string; duration: string }> = {
  good: { label: "جيد", subtitle: "تثبيت المفاهيم والتطبيق المباشر", duration: "10 دقائق" },
  hard: { label: "صعب", subtitle: "تطبيق القواعد وربط أكثر من خطوة", duration: "15 دقيقة" },
  hardest: { label: "الأصعب", subtitle: "تحليل متجهات ومسائل مركّبة", duration: "20 دقيقة" },
};

const questionBank: Record<Tier, StudyQuestion[]> = {
  good: [
    { id: "g1", prompt: "أيّ الكميات الآتية كمية قياسية؟", options: ["القوة", "الإزاحة", "الكتلة", "السرعة المتجهة"], answer: 2, explanation: "الكتلة تُحدَّد بمقدار ووحدة فقط، ولا يلزم تحديد اتجاه لها." },
    { id: "g2", prompt: "أيّ وصف يكتمل به تحديد كمية متجهة؟", options: ["المقدار فقط", "الاتجاه فقط", "المقدار ووحدة القياس دون اتجاه", "المقدار والاتجاه"], answer: 3, explanation: "الكمية المتجهة تحتاج إلى مقدار واتجاه معاً، مثل الإزاحة والقوة." },
    { id: "g3", prompt: "تحرك جسم 5 m شرقاً ثم 5 m غرباً. ما إزاحته؟", options: ["10 m شرقاً", "5 m غرباً", "صفر", "10 m غرباً"], answer: 2, explanation: "عاد الجسم إلى موضع البداية، لذلك كان التغير في موضعه صفراً، مع أن المسافة المقطوعة 10 m." },
    { id: "g4", prompt: "قطع طالب 5 m شرقاً ثم 2 m غرباً. ما المسافة الكلية؟", options: ["3 m", "7 m", "5 m", "2 m"], answer: 1, explanation: "المسافة هي طول المسار كله: 5 + 2 = 7 m." },
    { id: "g5", prompt: "في الرسم المتجهي، ما الذي يمثله طول السهم؟", options: ["اتجاه المتجه", "مقدار المتجه", "وحدة القياس", "زمن الحركة"], answer: 1, explanation: "يمثل طول السهم مقدار المتجه، بينما يشير رأس السهم إلى اتجاهه." },
  ],
  hard: [
    { id: "h1", prompt: "تحرك جسم 10 m شرقاً، ثم 4 m غرباً، ثم 3 m غرباً. ما المسافة والإزاحة؟", options: ["المسافة 17 m والإزاحة 3 m شرقاً", "المسافة 3 m والإزاحة 17 m شرقاً", "المسافة 17 m والإزاحة 3 m غرباً", "المسافة 11 m والإزاحة 3 m شرقاً"], answer: 0, explanation: "المسافة = 10 + 4 + 3 = 17 m. وباعتبار الشرق موجباً: الإزاحة = 10 − 4 − 3 = 3 m شرقاً." },
    { id: "h2", prompt: "إزاحة مقدارها 6 m شرقاً تلتها إزاحة 8 m شمالاً. ما مقدار المحصلة؟", options: ["2 m", "14 m", "10 m", "48 m"], answer: 2, explanation: "المتجهان متعامدان؛ لذلك R = √(6² + 8²) = √100 = 10 m." },
    { id: "h3", prompt: "متجه مقداره 12 m يصنع زاوية 60° أعلى اتجاه الشرق. ما مركبته الأفقية؟", options: ["12 m", "10.4 m", "6 m", "3 m"], answer: 2, explanation: "المركبة الأفقية Aₓ = A cos θ = 12 × cos 60° = 12 × 0.5 = 6 m شرقاً." },
    { id: "h4", prompt: "أيّ الكميات الآتية متجهة؟", options: ["الطاقة", "الزمن", "الوزن", "درجة الحرارة"], answer: 2, explanation: "الوزن قوة جاذبية؛ لذلك له مقدار واتجاه نحو مركز الجاذبية، وهو كمية متجهة." },
    { id: "h5", prompt: "متجه مركبتاه Aₓ = −3 m و Aᵧ = 4 m. ما مقدار المتجه؟", options: ["1 m", "5 m", "7 m", "12 m"], answer: 1, explanation: "المقدار = √(Aₓ² + Aᵧ²) = √(9 + 16) = 5 m." },
  ],
  hardest: [
    { id: "x1", prompt: "تحرك جسم 8 m شرقاً و6 m شمالاً، ثم 3 m غرباً و2 m جنوباً. ما مقدار إزاحته المحصلة تقريباً؟", options: ["19 m", "6.4 m", "5 m", "9.2 m"], answer: 1, explanation: "المركبة الأفقية = 8 − 3 = 5 m شرقاً، والرأسية = 6 − 2 = 4 m شمالاً. المقدار = √(5² + 4²) = √41 ≈ 6.4 m." },
    { id: "x2", prompt: "قوة مقدارها 20 N تميل بزاوية 37° أعلى الأفقي. استخدم cos 37° ≈ 0.8 و sin 37° ≈ 0.6. ما مركبتاها؟", options: ["16 N أفقياً و12 N رأسياً", "12 N أفقياً و16 N رأسياً", "20 N أفقياً وصفر رأسياً", "10 N أفقياً و10 N رأسياً"], answer: 0, explanation: "Fₓ = 20 × 0.8 = 16 N، وFᵧ = 20 × 0.6 = 12 N. المركبتان موجبتان لأن الاتجاه أعلى الأفقي وإلى الأمام." },
    { id: "x3", prompt: "تؤثر ثلاثة متجهات في نقطة: 15 m شرقاً و9 m غرباً و8 m شمالاً. ما مقدار المحصلة؟", options: ["8 m", "10 m", "14 m", "32 m"], answer: 1, explanation: "المحصلة الأفقية = 15 − 9 = 6 m شرقاً، والرأسية = 8 m شمالاً. R = √(6² + 8²) = 10 m." },
    { id: "x4", prompt: "متجه مركبتاه (−12, 5) بوحدتي المتر على المحورين السيني والصادي. ما وصف اتجاهه الصحيح؟", options: ["22.6° شمال الشرق", "22.6° شمال الغرب", "67.4° جنوب الغرب", "اتجاه الشرق تماماً"], answer: 1, explanation: "المركبة السينية سالبة (غرباً) والصادية موجبة (شمالاً)، لذا يقع في الربع الثاني. زاويته مع الغرب = tan⁻¹(5/12) ≈ 22.6° شمال الغرب." },
    { id: "x5", prompt: "متجه مقداره 13 m، ومركبته الأفقية 5 m شرقاً. إذا كان في الربع الأول، فما مركبته الرأسية؟", options: ["8 m", "12 m شمالاً", "18 m شمالاً", "√194 m جنوباً"], answer: 1, explanation: "Aᵧ = √(A² − Aₓ²) = √(169 − 25) = √144 = 12 m. وبما أن المتجه في الربع الأول فالمركبة الرأسية نحو الشمال." },
  ],
};

function saveLocalResult(tier: Tier, score: number, total: number) {
  try {
    const key = "yemen-study-grade12-practice-v1";
    const current = JSON.parse(localStorage.getItem(key) || "[]");
    const safeCurrent = Array.isArray(current) ? current.slice(-29) : [];
    safeCurrent.push({ tier, score, total, date: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(safeCurrent));
  } catch {
    // The exercise remains usable if browser storage is unavailable.
  }
}

export default function Grade12PhysicsStudyPage() {
  const [tier, setTier] = useState<Tier>("good");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [includeAnswerKey, setIncludeAnswerKey] = useState(false);
  const questions = useMemo(() => questionBank[tier], [tier]);
  const answeredCount = questions.filter((question) => answers[question.id] !== undefined).length;
  const score = questions.filter((question) => answers[question.id] === question.answer).length;

  const chooseTier = (next: Tier) => {
    setTier(next);
    setAnswers({});
    setRevealed([]);
    setSubmitted(false);
  };
  const checkQuestion = (id: string) => {
    setRevealed((current) => current.includes(id) ? current : [...current, id]);
  };
  const submit = () => {
    if (answeredCount !== questions.length || submitted) return;
    saveLocalResult(tier, score, questions.length);
    setSubmitted(true);
  };
  const reset = () => {
    setAnswers({});
    setRevealed([]);
    setSubmitted(false);
  };
  const downloadPdf = () => window.print();

  return <main className="container page g12-study-page">
    <div className="breadcrumbs g12-no-print"><Link to="/">الرئيسية</Link><span>›</span><Link to="/grade/grade-12">الصف الثالث الثانوي</Link><span>›</span><Link to="/subject/grade-12/scientific/physics">الفيزياء</Link><span>›</span><b>ملخص واختبارات</b></div>
    <header className="g12-study-heading g12-no-print">
      <div><span className="eyebrow">الصف الثالث الثانوي · القسم العلمي · الفيزياء</span><h1>الكميات القياسية والمتجهة</h1><p>شرح منظم، ملخص للمراجعة، ومسائل متدرجة مع تفسير الإجابات. المحتوى هنا مكتوب داخل المنصة.</p></div>
      <span className="g12-demo-status"><ShieldCheck size={16}/> محتوى تدريبي توضيحي</span>
    </header>

    <section className="g12-study-layout">
      <div className="g12-study-main">
        <section className="g12-panel g12-no-print">
          <div className="g12-panel-title"><span><BookOpen size={19}/></span><div><h2>الشرح والملخص</h2><p>اقرأ الفكرة ثم راجع المثال المحلول.</p></div></div>
          <div className="g12-lesson-content">
            <section><h3>1. الكمية الفيزيائية</h3><p>هي خاصية يمكن قياسها والتعبير عنها بمقدار ووحدة قياس. وتنقسم الكميات من حيث الحاجة إلى الاتجاه إلى كميات قياسية وكميات متجهة.</p></section>
            <section><h3>2. الكميات القياسية</h3><p>تُحدَّد بمقدار عددي ووحدة قياس فقط، ولا يلزم ذكر اتجاه لها.</p><div className="g12-example-grid"><div><b>الكتلة</b><span>5 kg</span></div><div><b>الزمن</b><span>12 s</span></div><div><b>درجة الحرارة</b><span>25 °C</span></div><div><b>المسافة</b><span>3 m</span></div><div><b>الطاقة</b><span>40 J</span></div><div><b>الحجم</b><span>2 L</span></div></div></section>
            <section><h3>3. الكميات المتجهة</h3><p>تحتاج إلى مقدار واتجاه معاً؛ فقولنا «إزاحة مقدارها 4 m» لا يحدد المتجه كاملاً ما لم نذكر الاتجاه.</p><ul><li>الإزاحة: 4 m شرقاً.</li><li>القوة: 20 N إلى أعلى.</li><li>السرعة المتجهة: 10 m/s شمالاً.</li><li>التسارع: 2 m/s² غرباً.</li></ul><p className="g12-callout">في تمثيل المتجه بسهم: طول السهم يتناسب مع المقدار، ورأس السهم يوضح الاتجاه.</p></section>
            <section><h3>4. المسافة والإزاحة</h3><p>المسافة طول المسار الفعلي الذي قطعه الجسم، وهي كمية قياسية. أما الإزاحة فهي التغير من موضع البداية إلى موضع النهاية مع تحديد الاتجاه، وهي كمية متجهة. قد تكون الإزاحة صفراً رغم أن الجسم تحرك مسافة غير صفرية إذا عاد إلى نقطة البداية.</p></section>
            <section><h3>5. جمع المتجهات على خط مستقيم</h3><p>اختر اتجاهاً موجباً وثبّت الإشارات: المتجه مع الاتجاه الموجب يأخذ إشارة موجبة، والمتجه المعاكس يأخذ إشارة سالبة. المحصلة الجبرية هي مجموع المركبات الموقعة.</p><div className="g12-formula" dir="ltr">R = A + B</div><p>مثال: 6 m شرقاً ثم 2 m غرباً. إذا اعتبرنا الشرق موجباً، فإن الإزاحة = +6 − 2 = +4 m؛ أي 4 m شرقاً. أما المسافة = 6 + 2 = 8 m.</p></section>
            <section><h3>6. المتجهات في بعدين ومركباتها</h3><p>يمكن تحليل المتجه المائل إلى مركبتين متعامدتين: أفقية ورأسية. إذا كانت الزاوية θ مقاسة من المحور الأفقي الموجب:</p><div className="g12-formula" dir="ltr">Aₓ = A cos θ　　Aᵧ = A sin θ</div><p>إذا كانت المركبتان متعامدتين، فإن مقدار المحصلة يحسب باستخدام نظرية فيثاغورس:</p><div className="g12-formula" dir="ltr">R = √(Rₓ² + Rᵧ²)</div><p>أما زاوية الاتجاه فتُستخرج من نسبة المركبتين، مع الانتباه إلى الربع الذي تقع فيه المحصلة:</p><div className="g12-formula" dir="ltr">tan θ = Rᵧ / Rₓ</div></section>
          </div>
          <div className="g12-worked-example"><span>مثال محلول شامل</span><h3>إزاحتان متعامدتان</h3><p>تحرك جسم 3 m شرقاً ثم 4 m شمالاً. أوجد مقدار الإزاحة المحصلة.</p><ol><li>المركبة الأفقية Rₓ = 3 m شرقاً.</li><li>المركبة الرأسية Rᵧ = 4 m شمالاً.</li><li>R = √(3² + 4²) = √25 = 5 m.</li><li>الاتجاه شمال الشرق؛ وزاويته θ = tan⁻¹(4/3) ≈ 53.1° أعلى الشرق.</li></ol><b>النتيجة: 5 m بزاوية 53.1° شمال الشرق.</b></div>
          <div className="g12-summary-box"><h3>خلاصة للحفظ</h3><ul><li>القياسية: مقدار ووحدة فقط.</li><li>المتجهة: مقدار واتجاه.</li><li>المسافة قياسية، والإزاحة متجهة.</li><li>في خط مستقيم نجمع المقادير مع مراعاة الإشارات.</li><li>في بعدين نحلل المتجه إلى مركبتين متعامدتين.</li><li>مقدار المتجه لا يكون سالباً، أما المركبة فقد تكون موجبة أو سالبة بحسب الاتجاه المختار.</li></ul></div>
          <div className="g12-reference-note"><ShieldCheck size={16}/><p>مرجع التحقق العلمي: OpenStax University Physics, Volume 1، القسم 2.1 «Scalars and Vectors». كُتب هذا الشرح والأمثلة والأسئلة بصياغة أصلية داخل Yemen Study. لم يُتحقق بعد من مطابقة ترتيب هذا الموضوع لكتاب وزارة التربية للطبعة والمنطقة المقصودتين.</p></div>
        </section>

        <section className="g12-panel">
          <div className="g12-panel-title"><span><Target size={19}/></span><div><h2>اختبارات بثلاثة مستويات</h2><p>اختر المستوى الذي يناسب استعدادك. لكل مستوى خمسة أسئلة مع تصحيح وتفسير.</p></div></div>
          <div className="g12-tier-switch" role="group" aria-label="مستوى الاختبار">
            {(["good", "hard", "hardest"] as Tier[]).map((value) => <button type="button" key={value} className={tier === value ? "active" : ""} onClick={() => chooseTier(value)}><b>{tierDetails[value].label}</b><small>{tierDetails[value].subtitle}</small></button>)}
          </div>
          <div className="g12-exam-meta"><span><FileText size={15}/>{questions.length} أسئلة</span><span><Clock3 size={15}/>{tierDetails[tier].duration}</span><span>الدرجة: {questions.length} درجات</span></div>
          <div className="g12-quiz-list">
            {questions.map((question, index) => <article className="g12-question" key={question.id}>
              <div className="g12-question-label"><span>السؤال {index + 1}</span><small>{tierDetails[tier].label}</small></div>
              <h3>{question.prompt}</h3>
              <div className="g12-options">{question.options.map((option, optionIndex) => {
                const isChosen = answers[question.id] === optionIndex;
                const show = revealed.includes(question.id) || submitted;
                const isCorrect = question.answer === optionIndex;
                return <button type="button" key={optionIndex} disabled={submitted || revealed.includes(question.id)} className={show && isCorrect ? "correct" : show && isChosen && !isCorrect ? "wrong" : isChosen ? "selected" : ""} onClick={() => setAnswers((old) => ({ ...old, [question.id]: optionIndex }))}><i>{["أ", "ب", "ج", "د"][optionIndex]}</i><span>{option}</span></button>;
              })}</div>
              {revealed.includes(question.id) || submitted ? <div className="g12-answer-explanation"><b>{answers[question.id] === question.answer ? "إجابة صحيحة" : "راجع طريقة الحل"}</b><p>{question.explanation}</p></div> : <button type="button" className="g12-reveal-answer" disabled={answers[question.id] === undefined} onClick={() => checkQuestion(question.id)}>تحقّق من إجابتي</button>}
            </article>)}
          </div>
          <div className="g12-quiz-footer g12-no-print"><span>أجبت عن {answeredCount} من {questions.length} أسئلة</span><div><button type="button" className="btn btn-outline" onClick={reset}><RotateCcw size={15}/> إعادة الاختبار</button><button type="button" className="btn btn-primary" disabled={submitted || answeredCount !== questions.length} onClick={submit}>تسليم الاختبار <CheckCircle2 size={15}/></button></div></div>
          {submitted && <div className="g12-result"><Trophy size={25}/><div><b>نتيجتك: {score} من {questions.length}</b><span>{Math.round(score / questions.length * 100)}% — {score === questions.length ? "إتقان ممتاز لهذا المستوى." : "راجع التفسيرات ثم جرّب مرة أخرى."}</span></div><button type="button" className="btn btn-outline" onClick={reset}>محاولة جديدة</button></div>}
        </section>
      </div>

      <aside className="g12-study-aside g12-no-print">
        <div className="g12-side-card"><span className="g12-side-kicker">خطة هذه المراجعة</span><h3>تعلّم ثم طبّق</h3><ul><li>اقرأ الشرح بالترتيب.</li><li>راجع القوانين والمثال المحلول.</li><li>ابدأ بالمستوى «جيد» ثم تدرّج.</li></ul><Link to="/lesson/scalars-and-vectors" className="g12-side-link">فتح الدرس التفاعلي القديم <ArrowLeft size={15}/></Link></div>
        <div className="g12-side-card"><span className="g12-side-kicker">ورقة اختبار PDF</span><h3>اطبع المستوى المحدد</h3><p>تُنشأ ورقة الأسئلة من المحتوى الحالي داخل الموقع، ويمكن حفظها PDF من نافذة الطباعة.</p><label className="g12-answer-toggle"><input type="checkbox" checked={includeAnswerKey} onChange={(event) => setIncludeAnswerKey(event.target.checked)}/> تضمين مفتاح الإجابة والتفسير</label><button type="button" className="btn btn-primary full" onClick={downloadPdf}><Download size={16}/> تنزيل الاختبار PDF</button><small className="g12-print-hint">اختر «حفظ كملف PDF» في نافذة الطباعة.</small></div>
        <div className="g12-side-card g12-source-card"><ShieldCheck size={20}/><b>حالة المحتوى</b><p>شرح تدريبي أصلي تم التحقق من مفاهيمه علمياً، وليس بعدُ درساً معتمداً لطبعة يمنية محددة.</p></div>
      </aside>
    </section>

    <section className="g12-print-sheet">
      <header><b>Yemen Study</b><span>الصف الثالث الثانوي · القسم العلمي · الفيزياء</span><h1>اختبار: الكميات القياسية والمتجهة</h1><p>المستوى: {tierDetails[tier].label}　|　الزمن المقترح: {tierDetails[tier].duration}　|　الدرجة: {questions.length}</p></header>
      <div className="g12-print-student"><span>اسم الطالب: ....................................................</span><span>التاريخ: .... / .... / ........</span></div>
      {questions.map((question, index) => <article key={question.id}><b>{index + 1}. {question.prompt}</b><ol type="A">{question.options.map((option) => <li key={option}>{option}</li>)}</ol></article>)}
      {includeAnswerKey && <section className="g12-print-key"><h2>مفتاح الإجابة والتفسير</h2>{questions.map((question, index) => <p key={question.id}><b>{index + 1}. {["أ", "ب", "ج", "د"][question.answer]}</b> — {question.explanation}</p>)}</section>}
      <footer>أُعدّت هذه الورقة للتدريب والمراجعة داخل Yemen Study. ليست ورقة امتحان وزارية رسمية.</footer>
    </section>
    <p className="g12-final-note g12-no-print"><ShieldCheck size={15}/> هذا إصدار تدريبي أول لموضوع واحد في الفيزياء. بقية مواد ودروس الصف الثالث الثانوي ستُضاف بعد الحصول على فهارس وكتب الطبعة المعتمدة والتحقق منها؛ لا تُعدّ هذه الصفحة تغطية كاملة للمنهج.</p>
  </main>;
}
