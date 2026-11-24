import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, ChevronLeft, Clock3, Printer, RotateCcw, ShieldCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getGrade } from "./data/catalog";
import { getPrimaryModule, type PrimaryLesson, type PrimaryVisual } from "./data/primary-lessons";
import "./primary-learning.css";

const visualCopy: Record<PrimaryVisual, { title: string; caption: string }> = {
  patterns: { title: "نمط يتكرر", caption: "لاحظ الوحدة التي تعود مرة بعد مرة." },
  counting: { title: "العدد والكمية", caption: "كل مجموعة تمثل عدداً محدداً." },
  addition: { title: "الجمع والطرح", caption: "نضم المجموعات أو نزيل جزءاً منها." },
  shapes: { title: "أشكال هندسية", caption: "نلاحظ الأضلاع والرؤوس." },
  senses: { title: "الحواس الخمس", caption: "تساعدنا الحواس على فهم ما حولنا." },
  healthy: { title: "عادات صحية", caption: "خطوات يومية تحافظ على النظافة." },
  living: { title: "حي وغير حي", caption: "نقارن صفات الكائنات والأشياء." },
  plant: { title: "أجزاء النبات", caption: "الجذور والساق والأوراق تؤدي وظائف مختلفة." },
  seasons: { title: "الأرض والفصول", caption: "يتعاقب الليل والنهار وتتغير الفصول." },
  magnet: { title: "المغناطيس", caption: "يجذب المغناطيس مواد معينة." },
  "place-value": { title: "منازل الأعداد", caption: "تتغير قيمة الرقم بحسب مكانه." },
  multiplication: { title: "مجموعات متساوية", caption: "يمكن تمثيل الضرب في صفوف وأعمدة." },
  measurement: { title: "القياس والأشكال", caption: "نقيس ونصف الأشكال بخصائصها." },
  food: { title: "الغذاء المتنوع", caption: "تمدنا الأغذية بعناصر مختلفة." },
  animals: { title: "تنوع الكائنات", caption: "لكل كائن صفات تناسب بيئته." },
  ecosystem: { title: "علاقة غذائية", caption: "تنتقل الطاقة بين الكائنات في البيئة." },
  family: { title: "الأسرة والتعاون", caption: "يتشارك الأفراد في المسؤوليات." },
  community: { title: "الحي والمرافق", caption: "تخدم المرافق العامة أفراد المجتمع." },
  directions: { title: "الجهات الأربع", caption: "نستخدم الاتجاهات لوصف المواقع." },
};

function PrimaryIllustration({ visual, compact = false }: { visual: PrimaryVisual; compact?: boolean }) {
  const common = { stroke: "#244de2", strokeWidth: 4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const textStyle = { fill: "#344861", fontSize: compact ? 17 : 20, fontFamily: "Tahoma, Arial, sans-serif" };
  const panel = (x: number, label: string, color: string) => <g key={label}><rect x={x} y="70" width="130" height="110" rx="15" fill={color} stroke="#d9e3ef" strokeWidth="2"/><text x={x + 65} y="215" textAnchor="middle" style={textStyle}>{label}</text></g>;
  return <div className={compact ? "ys-primary-illustration is-compact" : "ys-primary-illustration"} role="img" aria-label={visualCopy[visual].title + " — " + visualCopy[visual].caption}>
    <svg viewBox="0 0 600 270" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="8" y="8" width="584" height="254" rx="18" fill="#f7f9ff"/>
      {visual === "patterns" && <>
        {[0,1,2,3].map((n) => <g key={n} transform={"translate(" + (65+n*125) + " 92)"}><circle cx="0" cy="0" r="34" fill={n%2?"#f3c96d":"#74c5bb"}/><text x="0" y="72" textAnchor="middle" style={textStyle}>{n%2?"مربع":"دائرة"}</text></g>)}
        <path d="M70 175 H530" stroke="#c8d6e8" strokeWidth="3" strokeDasharray="7 8"/>
        <text x="300" y="235" textAnchor="middle" style={textStyle}>ما الشكل الذي يأتي بعد ذلك؟</text>
      </>}
      {visual === "counting" && <>
        {Array.from({length:10},(_,i)=><circle key={i} cx={105+(i%5)*95} cy={95+Math.floor(i/5)*85} r="24" fill={i<5?"#70c5b7":"#f2c96c"} stroke="#fff" strokeWidth="4"/>)}
        <text x="300" y="235" textAnchor="middle" style={textStyle}>عدّ العناصر واحداً واحداً</text>
      </>}
      {visual === "addition" && <>
        <g fill="#74c5bb">{[0,1,2].map(i=><circle key={i} cx={105+i*48} cy="115" r="21"/>)}</g>
        <text x="245" y="125" textAnchor="middle" style={{...textStyle,fontSize:35}}>+</text>
        <g fill="#f3c96d">{[0,1].map(i=><circle key={i} cx={315+i*48} cy="115" r="21"/>)}</g>
        <path d="M430 115 H475" {...common}/><path d="m465 105 12 10-12 10" {...common}/>
        <circle cx="515" cy="115" r="25" fill="#8aa9ef"/>
        <text x="300" y="205" textAnchor="middle" style={textStyle}>3 + 2 = 5</text>
      </>}
      {visual === "shapes" && <>
        <circle cx="105" cy="125" r="48" fill="#70c5b7"/>
        <rect x="215" y="77" width="95" height="95" rx="3" fill="#f3c96d"/>
        <path d="M420 75 L475 175 H365 Z" fill="#8aa9ef"/>
        <text x="105" y="215" textAnchor="middle" style={textStyle}>دائرة</text><text x="262" y="215" textAnchor="middle" style={textStyle}>مربع</text><text x="420" y="215" textAnchor="middle" style={textStyle}>مثلث</text>
      </>}
      {visual === "senses" && <>
        {panel(48,"البصر","#e4edff")}{panel(236,"السمع","#e0f5f0")}{panel(424,"الشم","#fff1d8")}
        <circle cx="113" cy="120" r="20" fill="#8aa9ef"/><path d="M95 120 Q113 94 131 120 Q113 146 95 120" fill="none" stroke="#244de2" strokeWidth="4"/>
        <path d="M283 110 Q310 120 283 145 M300 95 Q340 120 300 160" fill="none" stroke="#244de2" strokeWidth="4"/>
        <path d="M469 145 Q455 120 476 100 Q497 120 483 145" fill="none" stroke="#244de2" strokeWidth="4"/>
      </>}
      {visual === "healthy" && <>
        <circle cx="125" cy="100" r="37" fill="#f2c96c"/><path d="M105 152 Q125 125 145 152 L160 210 H90 Z" fill="#70c5b7"/>
        <path d="M255 98 h90 v75 h-90z" fill="#e4edff" stroke="#244de2" strokeWidth="4"/><path d="M275 135 l15 16 35-40" fill="none" stroke="#2da992" strokeWidth="7"/>
        <rect x="430" y="75" width="70" height="105" rx="15" fill="#d5e9ff"/><path d="M465 92 v70 M440 127 h50" stroke="#244de2" strokeWidth="5"/>
        <text x="125" y="235" textAnchor="middle" style={textStyle}>نظافة الجسم</text><text x="300" y="235" textAnchor="middle" style={textStyle}>غسل اليدين</text><text x="465" y="235" textAnchor="middle" style={textStyle}>ماء نظيف</text>
      </>}
      {visual === "living" && <>
        {panel(75,"كائن حي","#e0f5f0")}{panel(395,"شيء غير حي","#e4edff")}
        <path d="M140 155 V112 M140 130 Q105 90 95 120 Q120 150 140 130 M140 130 Q177 85 190 120 Q165 150 140 130" fill="#70c5b7" stroke="#2e806f" strokeWidth="3"/>
        <rect x="435" y="102" width="55" height="52" rx="8" fill="#9aabc0"/><path d="M430 158 h68" stroke="#6c7d91" strokeWidth="6"/>
      </>}
      {visual === "plant" && <>
        <path d="M300 200 V95" stroke="#2d967e" strokeWidth="12" strokeLinecap="round"/>
        <path d="M300 130 Q235 63 200 100 Q220 155 300 143 Q365 60 407 98 Q385 152 300 143" fill="#73c7a2" stroke="#3a9476" strokeWidth="3"/>
        <path d="M300 198 Q270 220 250 242 M300 198 Q330 225 355 243 M300 198 V246" stroke="#b58b5e" strokeWidth="7" fill="none" strokeLinecap="round"/>
        <path d="M155 200 H445" stroke="#c9a77a" strokeWidth="9" strokeLinecap="round"/>
        <text x="300" y="55" textAnchor="middle" style={textStyle}>الأوراق</text><text x="470" y="210" textAnchor="middle" style={textStyle}>الجذور</text>
      </>}
      {visual === "seasons" && <>
        <circle cx="300" cy="130" r="66" fill="#f3c96d"/><path d="M300 25 V53 M300 207 V235 M190 130 H218 M382 130 H410 M222 52 L242 72 M358 188 L378 208 M378 52 L358 72 M242 188 L222 208" stroke="#dba947" strokeWidth="7" strokeLinecap="round"/>
        <path d="M120 200 Q150 145 180 200 M420 200 Q450 145 480 200" stroke="#70b98a" strokeWidth="10" fill="none"/>
        <text x="300" y="245" textAnchor="middle" style={textStyle}>الضوء والظل وتعاقب النهار والليل</text>
      </>}
      {visual === "magnet" && <>
        <path d="M170 85 V150 Q170 210 240 210 H360 Q430 210 430 150 V85" stroke="#d75c66" strokeWidth="45" fill="none" strokeLinecap="round"/>
        <path d="M170 85 V150 Q170 210 240 210 H360 Q430 210 430 150 V85" stroke="#8aa9ef" strokeWidth="34" fill="none" strokeLinecap="round" strokeDasharray="1 70" />
        <text x="170" y="62" textAnchor="middle" style={{...textStyle,fontSize:26}}>N</text><text x="430" y="62" textAnchor="middle" style={{...textStyle,fontSize:26}}>S</text>
        <path d="M275 100 l-18 35 M310 95 l0 40 M345 100 l18 35" stroke="#d5a64d" strokeWidth="5" strokeLinecap="round"/>
      </>}
      {visual === "place-value" && <>
        {[["آلاف","2"],["مئات","4"],["عشرات","1"],["آحاد","5"]].map((item,i)=><g key={item[0]}><rect x={45+i*132} y="70" width="110" height="115" rx="12" fill={["#e2ecff","#e2f5ee","#fff1d8","#f6e7ef"][i]}/><text x={100+i*132} y="135" textAnchor="middle" style={{...textStyle,fontSize:36,fontWeight:700 as const}}>{item[1]}</text><text x={100+i*132} y="215" textAnchor="middle" style={textStyle}>{item[0]}</text></g>)}
      </>}
      {visual === "multiplication" && <>
        {Array.from({length:12},(_,i)=><circle key={i} cx={210+(i%4)*58} cy={75+Math.floor(i/4)*58} r="19" fill={i%2?"#8aa9ef":"#70c5b7"}/>)}
        <text x="300" y="250" textAnchor="middle" style={textStyle}>3 صفوف × 4 أعمدة = 12</text>
      </>}
      {visual === "measurement" && <>
        <rect x="100" y="75" width="150" height="105" fill="#dce9ff" stroke="#244de2" strokeWidth="4"/>
        <path d="M330 80 H530 M330 70 V195 M350 80 V95 M380 80 V95 M410 80 V95 M440 80 V95 M470 80 V95 M500 80 V95" stroke="#244de2" strokeWidth="4"/>
        <text x="175" y="220" textAnchor="middle" style={textStyle}>مستطيل</text><text x="430" y="220" textAnchor="middle" style={textStyle}>مسطرة قياس</text>
      </>}
      {visual === "food" && <>
        <circle cx="300" cy="135" r="92" fill="#fff" stroke="#9eb4cb" strokeWidth="5"/>
        <path d="M300 43 V227 M208 135 H392" stroke="#d2ddea" strokeWidth="3"/>
        <path d="M300 135 L300 43 A92 92 0 0 1 392 135 Z" fill="#f1cf72"/>
        <path d="M300 135 L392 135 A92 92 0 0 1 300 227 Z" fill="#70c5b7"/>
        <path d="M300 135 L300 227 A92 92 0 0 1 208 135 Z" fill="#8aa9ef"/>
        <path d="M300 135 L208 135 A92 92 0 0 1 300 43 Z" fill="#e7a8bb"/>
        <text x="300" y="250" textAnchor="middle" style={textStyle}>وجبة متنوعة</text>
      </>}
      {visual === "animals" && <>
        <path d="M95 175 Q120 105 195 125 Q235 135 240 180 Z" fill="#d7a46e"/><circle cx="205" cy="116" r="28" fill="#d7a46e"/><path d="M183 93 l-15-30 30 12 M220 93 l12-28 11 35" fill="#d7a46e"/>
        <path d="M365 195 Q400 135 465 155 Q510 165 520 205 Z" fill="#70b7c6"/><path d="M460 160 Q500 105 540 130 Q520 180 480 180" fill="#70b7c6"/>
        <text x="175" y="230" textAnchor="middle" style={textStyle}>حيوان بري</text><text x="450" y="230" textAnchor="middle" style={textStyle}>حيوان مائي</text>
      </>}
      {visual === "ecosystem" && <>
        <rect x="52" y="90" width="120" height="70" rx="13" fill="#dff3e8"/><rect x="240" y="90" width="120" height="70" rx="13" fill="#fff1d8"/><rect x="428" y="90" width="120" height="70" rx="13" fill="#e4edff"/>
        <text x="112" y="132" textAnchor="middle" style={textStyle}>نبات</text><text x="300" y="132" textAnchor="middle" style={textStyle}>عاشب</text><text x="488" y="132" textAnchor="middle" style={textStyle}>لاحم</text>
        <path d="M175 125 H228 M216 115 L228 125 L216 135 M365 125 H416 M404 115 L416 125 L404 135" fill="none" stroke="#56799e" strokeWidth="4"/>
        <text x="300" y="220" textAnchor="middle" style={textStyle}>انتقال الغذاء والطاقة</text>
      </>}
      {visual === "family" && <>
        {[160,300,440].map((x,i)=><g key={x}><circle cx={x} cy="90" r="26" fill={i===1?"#e9b1c1":"#8aa9ef"}/><path d={"M"+(x-34)+" 185 Q"+x+" 120 "+(x+34)+" 185 Z"} fill={i===1?"#f2cf79":"#72c5b7"}/></g>)}
        <path d="M195 90 H265 M335 90 H405" stroke="#b7c6d8" strokeWidth="4"/>
        <text x="300" y="230" textAnchor="middle" style={textStyle}>تعاون واحترام</text>
      </>}
      {visual === "community" && <>
        <path d="M70 170 V105 L145 60 L220 105 V170 Z" fill="#dfeaff" stroke="#5174a6" strokeWidth="4"/>
        <path d="M260 170 V100 H350 V170 Z" fill="#e0f4ed" stroke="#438e7f" strokeWidth="4"/>
        <path d="M410 170 V95 H530 V170 Z" fill="#fff0d7" stroke="#c29248" strokeWidth="4"/>
        <text x="145" y="205" textAnchor="middle" style={textStyle}>مدرسة</text><text x="305" y="205" textAnchor="middle" style={textStyle}>مركز صحي</text><text x="470" y="205" textAnchor="middle" style={textStyle}>حديقة</text>
      </>}
      {visual === "directions" && <>
        <circle cx="300" cy="135" r="96" fill="#fff" stroke="#cbd8e8" strokeWidth="4"/>
        <path d="M300 45 V225 M210 135 H390" stroke="#9baec4" strokeWidth="4"/>
        <path d="M300 52 L282 130 L300 118 L318 130 Z" fill="#2f5bff"/>
        <path d="M300 218 L318 140 L300 152 L282 140 Z" fill="#7c98b9"/>
        <text x="300" y="32" textAnchor="middle" style={textStyle}>شمال</text><text x="300" y="255" textAnchor="middle" style={textStyle}>جنوب</text><text x="410" y="142" textAnchor="middle" style={textStyle}>شرق</text><text x="185" y="142" textAnchor="middle" style={textStyle}>غرب</text>
      </>}
    </svg>
    {!compact && <div className="ys-primary-illustration-caption"><b>{visualCopy[visual].title}</b><span>{visualCopy[visual].caption}</span></div>}
  </div>;
}

export default function PrimaryLearningHubPage() {
  const { gradeSlug = "", trackSlug = "general", subjectSlug = "" } = useParams();
  const grade = getGrade(gradeSlug);
  const module = getPrimaryModule(gradeSlug, trackSlug, subjectSlug);
  const [activeIndex, setActiveIndex] = useState(0);
  const [chosenAnswer, setChosenAnswer] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const lesson = module?.lessons[activeIndex];
  const printBooklet = () => {
    document.body.dataset.primaryLearningPrint = "booklet";
    const cleanup = () => {
      delete document.body.dataset.primaryLearningPrint;
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
  };

  useEffect(() => {
    setActiveIndex(0);
    setChosenAnswer(null);
    setChecked(false);
  }, [gradeSlug, trackSlug, subjectSlug]);

  useEffect(() => {
    setChosenAnswer(null);
    setChecked(false);
  }, [activeIndex]);

  if (!grade || !module || !lesson) {
    return <main className="container page ys-primary-learning-page">
      <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><Link to="/curriculum">المناهج</Link><ChevronLeft size={14}/><b>المادة قيد الإعداد</b></div>
      <section className="ys-primary-empty">
        <ShieldCheck size={28}/>
        <span className="eyebrow">خريطة المنهج قيد الاستكمال</span>
        <h1>{grade?.name || "المادة الدراسية"}</h1>
        <p>لم تُنشر لهذه المادة بعد دروس كاملة مطابقة لخطة 2026–2027. نُبقيها ضمن فهرس الصف، ونضيف الشرح والرسومات بعد مراجعة مصدر المنهج والطبعة المعتمدة.</p>
        <Link className="btn btn-primary" to={grade ? "/grade/" + grade.slug : "/curriculum"}>العودة إلى مواد الصف <ArrowRight size={16}/></Link>
      </section>
    </main>;
  }

  return <main className="container page ys-primary-learning-page">
    <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><Link to={"/grade/" + grade.slug}>{grade.name}</Link><ChevronLeft size={14}/><b>{module.subject}</b></div>
    <header className="ys-primary-course-header">
      <div><span className="eyebrow">Yemen Study · المنهج اليمني 2026–2027</span><h1>{grade.name} · {module.subject}</h1><p>{module.curriculumNote}</p></div>
      <div className="ys-primary-course-meta"><BookOpen size={20}/><span>{module.lessons.length} دروس في هذه الدفعة</span></div>
    </header>
    <div className="ys-primary-learning-layout">
      <aside className="ys-primary-outline">
        <div className="ys-primary-outline-title"><b>دروس المادة</b><span>{module.lessons.length} دروس</span></div>
        {module.lessons.map((item, index) => <button type="button" key={item.id} className={activeIndex === index ? "active" : ""} onClick={() => setActiveIndex(index)}>
          <i>{String(index + 1).padStart(2, "0")}</i><span><b>{item.title}</b><small>{item.unit}</small></span>
        </button>)}
        <div className="ys-primary-source-note"><ShieldCheck size={16}/><span>مصدر الخطة: وزارة التربية والتعليم · {module.sourcePages}</span></div>
      </aside>
      <article className="ys-primary-lesson">
        <div className="ys-primary-lesson-top"><div><span className="eyebrow">{lesson.unit} · الدرس {activeIndex + 1} من {module.lessons.length}</span><h2>{lesson.title}</h2></div><button className="btn btn-outline ys-primary-print-button" type="button" onClick={printBooklet}><Printer size={16}/> طباعة كراسة المادة</button></div>
        <section className="ys-primary-goals"><b>سنتعلم في هذا الدرس</b><ul>{lesson.objectives.map(item => <li key={item}>{item}</li>)}</ul></section>
        <PrimaryIllustration visual={lesson.visual}/>
        {lesson.sections.map((section, index) => <section className="ys-primary-explanation" key={section.heading}>
          <h3><span>{index + 1}</span>{section.heading}</h3><p>{section.body}</p>
          {section.bullets && <ul>{section.bullets.map(item => <li key={item}>{item}</li>)}</ul>}
        </section>)}
        <section className="ys-primary-vocabulary"><h3>كلمات مهمة</h3><div>{lesson.vocabulary.map(item => <article key={item.term}><b>{item.term}</b><p>{item.meaning}</p></article>)}</div></section>
        <section className="ys-primary-example"><span className="eyebrow">خطوة بخطوة</span><h3>مثال محلول</h3><p>{lesson.example.prompt}</p><ol>{lesson.example.steps.map(step => <li key={step}>{step}</li>)}</ol><b>{lesson.example.answer}</b></section>
        <section className="ys-primary-practice">
          <span className="eyebrow">تحقق من فهمك</span><h3>{lesson.practice.prompt}</h3>
          <div>{lesson.practice.options.map((option, index) => <button type="button" key={option} disabled={checked} className={checked && index === lesson.practice.answer ? "correct" : checked && chosenAnswer === index ? "wrong" : chosenAnswer === index ? "selected" : ""} onClick={() => setChosenAnswer(index)}><i>{["أ","ب","ج","د"][index]}</i>{option}</button>)}</div>
          {!checked ? <button className="btn btn-primary" type="button" disabled={chosenAnswer === null} onClick={() => setChecked(true)}>تحقق من الإجابة</button>
            : <div className="ys-primary-feedback"><b>{chosenAnswer === lesson.practice.answer ? "أحسنت، إجابة صحيحة" : "لنراجع الفكرة"}</b><p>{lesson.practice.explanation}</p><button type="button" onClick={() => {setChosenAnswer(null);setChecked(false);}}><RotateCcw size={14}/> أعد المحاولة</button></div>}
        </section>
        <section className="ys-primary-activities"><h3>أنشطة للتطبيق</h3><ol>{lesson.activities.map(item => <li key={item}>{item}</li>)}</ol></section>
        <nav className="ys-primary-pager"><button type="button" disabled={activeIndex===0} onClick={()=>setActiveIndex(i=>i-1)}>الدرس السابق</button><button type="button" disabled={activeIndex===module.lessons.length-1} onClick={()=>setActiveIndex(i=>i+1)}>الدرس التالي <ChevronLeft size={15}/></button></nav>
      </article>
    </div>
    <section className="ys-primary-print-booklet">
      <header><div className="ys-primary-print-brand"><img src={import.meta.env.BASE_URL + "yemen-study-mark.svg"} alt="Yemen Study"/><span><b>Yemen Study</b><small>منصة يمن ستدي التعليمية</small></span></div><span>كراسة دروس تعليمية · 2026–2027</span><h1>{grade.name} · {module.subject}</h1><p>{module.curriculumNote}</p></header>
      {module.lessons.map((item,index)=><article key={item.id} className="ys-primary-print-lesson">
        <h2>{index+1}. {item.title}</h2><p><b>أهداف التعلم:</b> {item.objectives.join(" · ")}</p><PrimaryIllustration visual={item.visual} compact/>
        {item.sections.map(section=><section key={section.heading}><h3>{section.heading}</h3><p>{section.body}</p>{section.bullets && <ul>{section.bullets.map(b=><li key={b}>{b}</li>)}</ul>}</section>)}
        <h3>مثال محلول</h3><p>{item.example.prompt}</p><ol>{item.example.steps.map(step=><li key={step}>{step}</li>)}</ol><b>{item.example.answer}</b>
        <h3>تدريب</h3><p>{item.practice.prompt}</p><ol type="A">{item.practice.options.map(o=><li key={o}>{o}</li>)}</ol>
      </article>)}
      <footer>Yemen Study · شرح تعليمي أصلي يستند إلى خطة المقرر المدرسي. طباعة داخلية للمراجعة والتعلّم.</footer>
    </section>
  </main>;
}
