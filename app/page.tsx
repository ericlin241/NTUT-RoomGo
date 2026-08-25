'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Building2, CalendarDays, Check, ChevronDown, Clock3, Info, MapPin, Monitor, Moon, RefreshCw, Search, Sun, Users, X } from 'lucide-react';
import scheduleData from './data/schedule.json';

type Course = { id: string; name: string; room: string; roomName: string; teacher: string; className: string; day: number; start: number; end: number; color: string };
type ThemeMode = 'auto' | 'dark' | 'light';
const periods = [
  { id: 1, start: '08:10', end: '09:00' }, { id: 2, start: '09:10', end: '10:00' },
  { id: 3, start: '10:10', end: '11:00' }, { id: 4, start: '11:10', end: '12:00' },
  { id: 5, start: '13:10', end: '14:00' }, { id: 6, start: '14:10', end: '15:00' },
  { id: 7, start: '15:10', end: '16:00' }, { id: 8, start: '16:10', end: '17:00' },
  { id: 9, start: '17:10', end: '18:00' },
];
const weekdays = ['週一', '週二', '週三', '週四', '週五'];
const fullWeekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const allCourses = scheduleData.courses as Course[];
const toMinutes = (value: string) => { const [hour, minute] = value.split(':').map(Number); return hour * 60 + minute; };
const getDateLabel = (day: number) => { const now = new Date(); const date = new Date(now); date.setDate(now.getDate() - ((now.getDay() + 6) % 7) + day - 1); return `${date.getMonth() + 1}/${date.getDate()}`; };
const getTodayLabel = (date: Date) => `${date.getMonth() + 1}月${date.getDate()}日 ${fullWeekdays[date.getDay()]}`;

export default function Home() {
  const [selectedClass, setSelectedClass] = useState(scheduleData.classes[0]);
  const [classPickerOpen, setClassPickerOpen] = useState(false);
  const [classConfirmed, setClassConfirmed] = useState(false);
  const [classQuery, setClassQuery] = useState('');
  const [detail, setDetail] = useState<Course | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const hydration = window.setTimeout(() => {
      const savedClass = localStorage.getItem('roomgo-class') ?? '';
      const savedTheme = localStorage.getItem('roomgo-theme-mode');
      if (savedTheme === 'auto' || savedTheme === 'dark' || savedTheme === 'light') setThemeMode(savedTheme);
      if (savedClass && scheduleData.classes.includes(savedClass)) { setSelectedClass(savedClass); setClassConfirmed(true); }
      else setClassPickerOpen(true);
    }, 0);
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => { window.clearTimeout(hydration); window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (themeMode === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.dataset.theme = themeMode;
  }, [themeMode]);

  const courses = useMemo(
    () => (classConfirmed ? allCourses.filter((course) => course.className === selectedClass) : []),
    [classConfirmed, selectedClass],
  );
  const filteredClasses = useMemo(() => scheduleData.classes.filter((name) => name.toLowerCase().includes(classQuery.trim().toLowerCase())), [classQuery]);
  const live = useMemo(() => {
    const day = now.getDay(), minute = now.getHours() * 60 + now.getMinutes();
    const currentPeriod = periods.find((period) => minute >= toMinutes(period.start) && minute < toMinutes(period.end));
    const current = currentPeriod ? courses.find((course) => course.day === day && currentPeriod.id >= course.start && currentPeriod.id <= course.end) : undefined;
    const future = courses.map((course) => { let daysAhead = course.day - day; if (daysAhead < 0 || (daysAhead === 0 && toMinutes(periods[course.start - 1].start) <= minute)) daysAhead += 7; return { course, daysAhead }; }).sort((a, b) => a.daysAhead - b.daysAhead || a.course.start - b.course.start)[0];
    return { current, currentPeriod, remaining: currentPeriod ? toMinutes(currentPeriod.end) - minute : 0, next: future };
  }, [courses, now]);

  const chooseClass = (className: string) => {
    setSelectedClass(className);
    setClassConfirmed(true);
    localStorage.setItem('roomgo-class', className);
    setClassPickerOpen(false);
    setClassQuery('');
  };

  const cycleTheme = () => {
    const nextMode: ThemeMode = themeMode === 'auto' ? 'dark' : themeMode === 'dark' ? 'light' : 'auto';
    setThemeMode(nextMode);
    localStorage.setItem('roomgo-theme-mode', nextMode);
  };
  const themeLabel = themeMode === 'auto' ? '自動' : themeMode === 'dark' ? '深色' : '淺色';
  const themeIcon = themeMode === 'auto' ? <Monitor size={19} /> : themeMode === 'dark' ? <Moon size={19} /> : <Sun size={19} />;

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#top" aria-label="北科課室通首頁"><span className="brand-mark"><Building2 size={20} /></span><span><strong>北科課室通</strong><small>NTUT ROOMGO</small></span></a><div className="top-actions"><button className="class-switcher" onClick={() => setClassPickerOpen(true)}><span><small>目前班級</small>{classConfirmed ? selectedClass : '選擇班級'}</span><ChevronDown size={17} /></button><button className="icon-button theme-button" onClick={cycleTheme} aria-label={`目前主題：${themeLabel}，點擊切換`} title={`主題：${themeLabel}`}>{themeIcon}</button></div></header>

    <main id="top">
      <section className="hero-row"><div><span className="eyebrow">115 學年度 · 第 1 學期</span><h1 className="greeting-wordmark" aria-label="嗨，今天也準時抵達。"><span className="greeting-hello" aria-hidden="true">嗨</span><span className="greeting-comma" aria-hidden="true">，</span><span aria-hidden="true">今天也</span><span className="greeting-arrival" aria-hidden="true">準時抵達<span className="greeting-stop">。</span></span></h1><p suppressHydrationWarning>{getTodayLabel(now)} · {classConfirmed ? `${selectedClass} 的班級課表` : '請先選擇班級'}</p></div><div className="sync-pill"><span className="live-dot" />靜態資料庫 <RefreshCw size={14} /> {scheduleData.courses.length} 筆課程</div></section>

      <section className="status-grid" id="status"><article className="status-card current-card"><div className="status-label"><span><Clock3 size={16} /> 當下課程</span><span className="now-badge">NOW</span></div>{live.current ? <><h2>{live.current.name}</h2><div className="room-line"><MapPin size={18} /> {live.current.room} · {live.current.className}</div><div className="progress-track"><span style={{ width: `${Math.max(8, 100 - live.remaining * 2)}%` }} /></div><p className="status-note">距離下課還有 <strong>{live.remaining} 分鐘</strong></p></> : <div className="empty-current"><span>☕</span><div><h2>目前無課程</h2><p>休息一下，下一堂課資訊在右側。</p></div></div>}</article><article className="status-card next-card"><div className="status-label"><span><CalendarDays size={16} /> 下一節課</span></div>{live.next ? <><div className="next-time"><strong>{live.next.daysAhead === 0 ? '今天' : weekdays[live.next.course.day - 1]}</strong><span>{periods[live.next.course.start - 1].start}</span></div><h2>{live.next.course.name}</h2><div className="room-line"><MapPin size={18} /> {live.next.course.room} · {live.next.course.className}</div></> : <h2>本週沒有更多課程</h2>}</article></section>

      <section className="schedule-section" id="schedule"><div className="section-heading"><div><span className="eyebrow">WEEKLY SCHEDULE</span><h2>本週課表</h2></div><div className="legend"><span><i className="legend-dot mint" />班級課程</span><span>共 {courses.length} 筆課程</span></div></div><div className="schedule-scroll"><div className="schedule-grid"><div className="grid-corner">時間</div>{weekdays.map((day, index) => <div className={`day-head ${now.getDay() === index + 1 ? 'today' : ''}`} key={day}><span>{day}</span><small>{getDateLabel(index + 1)}</small></div>)}{periods.map((period) => <div className="grid-row" key={period.id}><div className="time-cell"><strong>{period.id}</strong><span>{period.start}<br />{period.end}</span></div>{weekdays.map((_, dayIndex) => { const course = courses.find((item) => item.day === dayIndex + 1 && item.start === period.id); return <div className="slot" key={dayIndex}>{course && <button className={`course-card ${course.color}`} style={{ height: `calc(${course.end - course.start + 1} * var(--row-height) - 8px)` }} onClick={() => setDetail(course)}><strong>{course.name}</strong><span><MapPin size={13} /> {course.room}</span><em>{course.className}</em></button>}</div>; })}</div>)}</div></div><p className="data-note"><Info size={14} /> 此為 115-1 靜態班級課表，不包含個人跨系選修、通識及加退選結果。</p></section>
    </main>

    <nav className="mobile-nav" aria-label="主要導覽"><a href="#schedule" className="active"><BookOpen size={20} /><span>課表</span></a><a href="#status"><Clock3 size={20} /><span>即時</span></a><button onClick={() => setClassPickerOpen(true)}><Users size={20} /><span>班級</span></button><button onClick={cycleTheme} aria-label={`目前主題：${themeLabel}，點擊切換`}>{themeIcon}<span>{themeLabel}</span></button></nav>

    {classPickerOpen && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="class-title"><div className="modal class-modal"><div className="modal-icon"><Users size={23} /></div>{classConfirmed && <button className="modal-close" onClick={() => setClassPickerOpen(false)} aria-label="關閉"><X size={20} /></button>}<span className="eyebrow">STATIC SCHEDULE</span><h2 id="class-title">選擇你的班級</h2><p>搜尋系所、年級或班別；選好後會保存在這台裝置，下次自動載入。</p><label className="search-box"><Search size={18} /><input autoFocus value={classQuery} onChange={(event) => setClassQuery(event.target.value)} placeholder="搜尋班級，例如：電機三" /></label><div className="class-list">{filteredClasses.map((name) => <button key={name} onClick={() => chooseClass(name)} className={classConfirmed && name === selectedClass ? 'selected' : ''}><span><strong>{name}</strong><small>115-1 靜態班級課表</small></span>{classConfirmed && name === selectedClass && <Check size={18} />}</button>)}{!filteredClasses.length && <div className="no-result">找不到符合的班級，請嘗試其他關鍵字</div>}</div></div></div>}

    {detail && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="course-detail-title"><div className="modal detail-modal"><button className="modal-close" onClick={() => setDetail(null)} aria-label="關閉"><X size={20} /></button><span className={`course-swatch ${detail.color}`} /><span className="eyebrow">COURSE DETAIL</span><h2 id="course-detail-title">{detail.name}</h2><div className="detail-list"><div><BookOpen size={18} /><span><small>課號</small>{detail.id.split(':')[0]}</span></div><div><CalendarDays size={18} /><span><small>上課時間</small>{weekdays[detail.day - 1]} {periods[detail.start - 1].start}–{periods[detail.end - 1].end}</span></div><div><MapPin size={18} /><span><small>上課教室</small>{detail.room}</span></div><div><Users size={18} /><span><small>開課班級</small>{detail.className}</span></div><div><Users size={18} /><span><small>資料來源</small>{detail.teacher}</span></div></div><button className="primary-button" onClick={() => setDetail(null)}>知道了</button></div></div>}
  </div>;
}
