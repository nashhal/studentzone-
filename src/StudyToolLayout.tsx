import { useState, type ReactNode } from "react";
import {
  Activity, Award, BookOpen, BookOpenCheck, Bookmark, CalendarDays,
  ChevronDown, ChevronLeft, ClipboardCheck, ClipboardList, FileText,
  Layers3, Menu, Timer,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";

export function StudyToolLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return <div className={sidebarOpen ? "study-tool-layout" : "study-tool-layout sidebar-collapsed"}>
    {sidebarOpen && <aside className="course-sidebar study-tool-sidebar">
      <div className="sidebar-hide-row">
        <button type="button" onClick={() => setSidebarOpen(false)}><ChevronLeft size={19}/> إخفاء القائمة</button>
      </div>
      <span className="sidebar-section-label">المقرر</span>
      <Link className="sidebar-course-picker" to="/curriculum">
        <BookOpen size={21}/>
        <span><small>المناهج اليمنية</small><b>اختر الصف والمادة</b></span>
        <ChevronDown size={17}/>
      </Link>
      <div className="sidebar-section-label">موارد المقرر</div>
      <NavLink to="/curriculum" className={({isActive}) => isActive ? "course-nav-item active" : "course-nav-item"}><BookOpenCheck size={20}/><span>موارد المواد</span></NavLink>
      <NavLink to="/strengths-weaknesses" className={({isActive}) => isActive ? "course-nav-item active" : "course-nav-item"}><Activity size={20}/><span>نقاط القوة والضعف</span></NavLink>
      <div className="sidebar-section-label">المراجعة</div>
      <NavLink to="/curriculum" className="course-nav-item"><Bookmark size={20}/><span>ملاحظات المراجعة</span></NavLink>
      <NavLink to="/curriculum" className="course-nav-item"><Layers3 size={20}/><span>البطاقات التعليمية</span></NavLink>
      <div className="sidebar-section-label">الاختبارات والتدريب</div>
      <NavLink to="/curriculum" className="course-nav-item"><ClipboardList size={20}/><span>أسئلة الامتحان</span></NavLink>
      <NavLink to="/target-test" className={({isActive}) => isActive ? "course-nav-item active" : "course-nav-item"}><ClipboardCheck size={20}/><span>الاختبار المستهدف</span></NavLink>
      <NavLink to="/past-papers" className={({isActive}) => isActive ? "course-nav-item active" : "course-nav-item"}><FileText size={20}/><span>أوراق الامتحانات</span></NavLink>
      <NavLink to="/mock-exam" className={({isActive}) => isActive ? "course-nav-item active" : "course-nav-item"}><Timer size={20}/><span>الاختبارات التجريبية</span></NavLink>
      <div className="sidebar-section-label">مساحة الطالب</div>
      <NavLink to="/study-plan" className={({isActive}) => isActive ? "course-nav-item active" : "course-nav-item"}><CalendarDays size={20}/><span>خطة المذاكرة</span></NavLink>
      <NavLink to="/dashboard" className={({isActive}) => isActive ? "course-nav-item active" : "course-nav-item"}><Award size={20}/><span>لوحة التقدّم</span></NavLink>
    </aside>}
    <div className="study-tool-layout-main">
      {!sidebarOpen && <div className="study-sidebar-reveal"><button type="button" className="sidebar-show-button" onClick={() => setSidebarOpen(true)}><Menu size={17}/> إظهار القائمة</button></div>}
      {children}
    </div>
  </div>;
}
