import { useMemo, useState } from "react";
import {
  BookOpen, Bookmark, CheckCircle2, ChevronDown, ChevronLeft, CircleHelp,
  Download, FileText, GraduationCap, Layers3, Menu, Printer, RefreshCw,
  ShieldCheck, Target, Timer, X,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  getGrade12Subject, getGrade12SourceState,
  type Grade12Difficulty, type Grade12Edition,
} from "./data/grade12-curriculum";
import "./grade12-curriculum.css";

type Tab = "lessons" | "tests" | "sources";
const difficulties: Grade12Difficulty[] = ["سهل", "جيد", "صعب", "الأصعب"];

export default function Grade12SubjectPage() {
  const { trackSlug = "", subjectSlug = "" } = useParams();
  const [edition, setEdition] = useState<Grade12Edition>("sanaa");
  const [tab, setTab] = useState<Tab>("lessons");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [difficulty, setDifficulty] = useState<Grade12Difficulty>("سهل");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const subject = getGrade12Subject(trackSlug, subjectSlug, edition);
  const units = subject?.units ?? [];
  const selectedUnit = units.find((item) => item.id === selectedUnitId) ?? units[0];
  const testQuestions = useMemo(
    () => (subject?.questions ?? []).filter((item) => item.difficulty === difficulty),
    [subject, difficulty],
  );
  const score = testQuestions.filter((item) => answers[item.id] === item.answer).length;

  const changeDifficulty = (value: Grade12Difficulty) => {
    setDifficulty(value);
    setAnswers({});
    setSubmitted(false);
  };

  const resetTest = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const exportPdf = (mode: "exam" | "answers") => {
    if (!testQuestions.length) return;
    document.body.dataset.grade12Print = mode;
    window.print();
    window.setTimeout(() => {
      delete document.body.dataset.grade12Print;
    }, 600);
  };

  if (!subject) {
    return <main className="grade12-page">
      <div className="grade12-unavailable">
        <span className="grade12-kicker">ثالث ثانوي · اختلاف الطبعات</span>
        <h1>هذه المادة غير مفهرسة بعد في طبعة {edition === "sanaa" ? "صنعاء" : "عدن"}</h1>
        <p>لا أريد أن أعرض شرحاً من نسخة مختلفة عن كتابك. اختر الطبعة الأخرى أو ارجع إلى فهرس الصف حتى تتم مراجعة فهرس هذه المادة.</p>
        <div className="grade12-edition-switch" role="group" aria-label="اختر الطبعة">
          <button className={edition === "sanaa" ? "active" : ""} onClick={() => setEdition("sanaa")}>صنعاء 2026</button>
          <button className={edition === "aden" ? "active" : ""} onClick={() => setEdition("aden")}>عدن 2026</button>
        </div>
        <Link className="grade12-secondary-button" to="/grade/grade-12">العودة إلى مواد الصف الثالث الثانوي</Link>
      </div>
    </main>;
  }

  const sourceStatus = getGrade12SourceState(subject.sourceStatus);
  const editionName = subject.edition === "common-2026"
    ? "فهرس 2026 المتاح"
    : subject.edition === "sanaa" ? "صنعاء 2026" : "عدن 2026";

  return <main className="grade12-page">
    <div className="grade12-layout">
      {sidebarOpen && <aside className="grade12-sidebar">
        <div className="grade12-sidebar-top">
          <button type="button" onClick={() => setSidebarOpen(false)}><ChevronLeft size={17}/> إخفاء الفهرس</button>
        </div>
        <div className="grade12-sidebar-heading">
          <span>المقرر</span>
          <b>{subject.name}</b>
          <small>الصف الثالث الثانوي · {trackSlug === "scientific" ? "علمي" : "أدبي"}</small>
        </div>
        <div className="grade12-sidebar-label">الوحدات والدروس</div>
        {units.length ? <nav className="grade12-unit-nav" aria-label="فهرس الوحدات">
          {units.map((item, index) => <button
            type="button"
            key={item.id}
            className={selectedUnit?.id === item.id ? "active" : ""}
            onClick={() => { setSelectedUnitId(item.id); setTab("lessons"); }}
          >
            <span className="grade12-unit-index">{index + 1}</span>
            <span>{item.title}</span>
          </button>)}
        </nav> : <p className="grade12-sidebar-empty">فهرس الدروس التفصيلي قيد التحقق.</p>}
        <div className="grade12-sidebar-bottom">
          <Link to="/grade/grade-12"><GraduationCap size={17}/> مواد الصف</Link>
          <Link to="/study-plan"><Timer size={17}/> خطة المذاكرة</Link>
        </div>
      </aside>}

      <section className="grade12-main">
        <div className="grade12-topline">
          <div className="grade12-breadcrumbs">
            <Link to="/">الرئيسية</Link><ChevronLeft size={14}/>
            <Link to="/grade/grade-12">الصف الثالث الثانوي</Link><ChevronLeft size={14}/>
            <b>{subject.name}</b>
          </div>
          <div className="grade12-header-actions">
            {!sidebarOpen && <button className="grade12-icon-button" onClick={() => setSidebarOpen(true)} aria-label="إظهار الفهرس"><Menu size={18}/></button>}
            <Link to="/grade/grade-12" className="grade12-secondary-button">كل المواد</Link>
          </div>
        </div>

        <header className="grade12-subject-header">
          <div>
            <span className="grade12-kicker">ثالث ثانوي · {trackSlug === "scientific" ? "القسم العلمي" : "القسم الأدبي"}</span>
            <h1>{subject.name}</h1>
            <p>{subject.sourceTitle}</p>
          </div>
          <div className="grade12-edition-control">
            <label htmlFor="grade12-edition">نسخة المنهج</label>
            <select id="grade12-edition" value={edition} onChange={(event) => { setEdition(event.target.value as Grade12Edition); setSelectedUnitId(""); resetTest(); }}>
              <option value="sanaa">صنعاء 2026</option>
              <option value="aden">عدن 2026</option>
            </select>
          </div>
        </header>

        <div className="grade12-meta-row">
          <span className="grade12-status"><ShieldCheck size={15}/> {sourceStatus}</span>
          <span className="grade12-meta-separator"/>
          <span>النسخة المستخدمة: {editionName}</span>
          <span className="grade12-meta-separator"/>
          <span>{units.length} وحدات مفهرسة</span>
        </div>

        <nav className="grade12-tabs" aria-label="أقسام المادة">
          <button className={tab === "lessons" ? "active" : ""} onClick={() => setTab("lessons")}><BookOpen size={17}/> الشرح والملخصات</button>
          <button className={tab === "tests" ? "active" : ""} onClick={() => setTab("tests")}><Target size={17}/> الاختبارات المتدرجة</button>
          <button className={tab === "sources" ? "active" : ""} onClick={() => setTab("sources")}><FileText size={17}/> الكتاب والمراجع</button>
        </nav>

        {tab === "lessons" && <div className="grade12-content-grid">
          <div className="grade12-content-main">
            {selectedUnit ? <>
              <div className="grade12-unit-heading">
                <span className="grade12-label">الوحدة الدراسية</span>
                <h2>{selectedUnit.title}</h2>
                <p>{selectedUnit.summary}</p>
              </div>
              <div className="grade12-topics">
                <h3>موضوعات الوحدة في الفهرس</h3>
                <ul>{selectedUnit.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
              </div>
              {selectedUnit.lessons.map((lesson) => <article className="grade12-lesson-card" key={lesson.id}>
                <div className="grade12-lesson-title">
                  <span className="grade12-label">شرح ومراجعة أصلية</span>
                  <h3>{lesson.title}</h3>
                  <p>{lesson.summary}</p>
                </div>
                <section className="grade12-explanation">
                  <h4>الشرح المبسط</h4>
                  <p>{lesson.explanation}</p>
                </section>
                <section className="grade12-objectives">
                  <h4>ما ينبغي إتقانه</h4>
                  <ul>{lesson.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
                </section>
                <section className="grade12-key-points">
                  <h4>خلاصة سريعة</h4>
                  <ul>{lesson.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul>
                </section>
                {lesson.workedExample && <section className="grade12-worked-example">
                  <h4>مثال محلول</h4>
                  <p className="grade12-example-question">{lesson.workedExample.question}</p>
                  <ol>{lesson.workedExample.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                  <div className="grade12-example-answer"><b>الإجابة:</b> {lesson.workedExample.answer}</div>
                </section>}
              </article>)}
              <div className="grade12-unit-actions">
                <button className="grade12-primary-button" onClick={() => setTab("tests")}><Target size={17}/> اختبر هذه الوحدة</button>
                <button className="grade12-secondary-button" onClick={() => window.print()}><Printer size={16}/> طباعة الملخص</button>
              </div>
            </> : <div className="grade12-empty-content">
              <BookOpen size={28}/>
              <h2>فهرس المادة قيد المراجعة</h2>
              <p>{subject.sourceNote}</p>
            </div>}
          </div>
          <aside className="grade12-content-aside">
            <div className="grade12-aside-card">
              <span className="grade12-label">مراجعة ذكية</span>
              <h3>كيف تذاكر هذه الوحدة؟</h3>
              <ol>
                <li>اقرأ الشرح مرة للفهم.</li>
                <li>استرجع النقاط الأساسية دون النظر.</li>
                <li>حل أسئلة المستوى الجيد أولاً.</li>
                <li>انتقل إلى المستوى الأصعب بعد مراجعة أخطائك.</li>
              </ol>
              <button className="grade12-text-button" onClick={() => setTab("tests")}>انتقل للاختبار <ChevronLeft size={16}/></button>
            </div>
            <div className="grade12-aside-card grade12-note-card">
              <ShieldCheck size={19}/>
              <p>الشرح هنا صياغة تعليمية أصلية للمراجعة، وليس نسخاً حرفياً من الكتاب المدرسي.</p>
            </div>
          </aside>
        </div>}

        {tab === "tests" && <div className="grade12-test-area">
          <div className="grade12-test-intro">
            <div>
              <span className="grade12-label">تدريب حسب مستوى الصعوبة</span>
              <h2>اختبر فهمك في {subject.name}</h2>
              <p>اختر المستوى. تظهر الأسئلة والتصحيح والتفسير داخل الموقع، ويمكن طباعة ورقة الأسئلة ومفتاح الإجابة كلٌ على حدة.</p>
            </div>
            <div className="grade12-level-pills" role="group" aria-label="مستوى الاختبار">
              {difficulties.map((level) => <button
                key={level}
                className={difficulty === level ? "active" : ""}
                onClick={() => changeDifficulty(level)}
              >{level}</button>)}
            </div>
          </div>

          {testQuestions.length ? <>
            <div className="grade12-test-toolbar">
              <span><CircleHelp size={16}/> {testQuestions.length} أسئلة في مستوى {difficulty}</span>
              <div className="grade12-test-actions">
                <button className="grade12-secondary-button" onClick={() => exportPdf("exam")}><Download size={16}/> تنزيل الاختبار PDF</button>
                <button className="grade12-secondary-button" onClick={() => exportPdf("answers")}><FileText size={16}/> تنزيل نموذج الإجابة PDF</button>
              </div>
            </div>
            <div className="grade12-question-list">
              {testQuestions.map((question, index) => <article className="grade12-question-card" key={question.id}>
                <div className="grade12-question-heading">
                  <span>السؤال {index + 1}</span>
                  <small>{question.difficulty}</small>
                </div>
                <h3>{question.prompt}</h3>
                <div className="grade12-options">
                  {question.options.map((option, optionIndex) => {
                    const selected = answers[question.id] === optionIndex;
                    const correct = submitted && optionIndex === question.answer;
                    const wrong = submitted && selected && optionIndex !== question.answer;
                    return <button type="button" disabled={submitted} key={option} onClick={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
                      className={["grade12-option", selected ? "selected" : "", correct ? "correct" : "", wrong ? "wrong" : ""].filter(Boolean).join(" ")}>
                      <span className="grade12-option-letter">{String.fromCharCode(65 + optionIndex)}</span>
                      <span>{option}</span>
                      {correct && <CheckCircle2 size={17}/>}
                      {wrong && <X size={17}/>}
                    </button>;
                  })}
                </div>
                {submitted && <div className="grade12-question-explanation"><b>التفسير:</b> {question.explanation}</div>}
              </article>)}
            </div>
            <div className="grade12-test-footer">
              {submitted ? <div className="grade12-score"><b>نتيجتك: {score} / {testQuestions.length}</b><span>{score === testQuestions.length ? "أحسنت، إجاباتك كلها صحيحة." : "راجع التفسيرات ثم أعد المحاولة."}</span></div> : <span>أجب عن جميع الأسئلة ثم اضغط على التصحيح.</span>}
              <div>
                {!submitted ? <button className="grade12-primary-button" disabled={Object.keys(answers).length !== testQuestions.length} onClick={() => setSubmitted(true)}>صحح إجاباتي</button>
                  : <button className="grade12-primary-button" onClick={resetTest}><RefreshCw size={16}/> إعادة الاختبار</button>}
              </div>
            </div>
          </> : <div className="grade12-empty-content">
            <Target size={28}/>
            <h2>بنك أسئلة هذه المادة قيد التوسعة</h2>
            <p>لم أنشئ أسئلة تخمينية لهذه المادة. تتوفر الاختبارات للمواد التي أُعد لها بنك أسئلة أصلي ومراجع في هذه الدفعة.</p>
            <button className="grade12-secondary-button" onClick={() => setTab("lessons")}>العودة إلى الشرح</button>
          </div>}
        </div>}

        {tab === "sources" && <div className="grade12-sources-grid">
          <article className="grade12-source-card">
            <span className="grade12-label">سجل الكتاب</span>
            <h2>{subject.sourceTitle}</h2>
            <p>{subject.sourceNote}</p>
            <div className="grade12-source-meta">
              <span>حالة الفهرس: {sourceStatus}</span>
              <span>النسخة: {editionName}</span>
            </div>
            <a className="grade12-primary-button" href={subject.sourceUrl} target="_blank" rel="noreferrer">فتح سجل الكتاب الأصلي <ChevronLeft size={16}/></a>
          </article>
          <article className="grade12-source-card">
            <span className="grade12-label">المصدر الحكومي</span>
            <h2>مكتبة المناهج التابعة لوزارة التربية والتعليم</h2>
            <p>استخدم بوابة الوزارة للتحقق من الطبعة المعتمدة في مدرستك قبل الاعتماد النهائي على أي فهرس خارجي.</p>
            <a className="grade12-secondary-button" href="https://e-learning-moe.edu.ye/book.php" target="_blank" rel="noreferrer">بوابة الكتب الرسمية</a>
          </article>
        </div>}
      </section>
    </div>

    <section className="grade12-print-zone" aria-hidden="true">
      <header>
        <div className="grade12-print-brand">Yemen Study</div>
        <h1>{subject.name} — اختبار الصف الثالث الثانوي</h1>
        <p>المسار: {trackSlug === "scientific" ? "علمي" : "أدبي"} · النسخة: {editionName} · المستوى: {difficulty}</p>
        <hr/>
      </header>
      <div className="grade12-print-questions">
        {testQuestions.map((question, index) => <article key={question.id}>
          <h3>{index + 1}. {question.prompt}</h3>
          <ol type="A">{question.options.map((option) => <li key={option}>{option}</li>)}</ol>
          <div className="grade12-print-answer"><b>الإجابة:</b> {question.options[question.answer]} — {question.explanation}</div>
        </article>)}
      </div>
      <footer>Yemen Study · ورقة تدريبية أصلية للمراجعة</footer>
    </section>
  </main>;
}
