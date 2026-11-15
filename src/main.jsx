import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDownToLine, ArrowRight, Award, BookOpen, Check, ChevronDown, CircleHelp, RotateCcw, Sparkles } from 'lucide-react';
import './styles.css';

const semesters = [
  { label: 'Year 3 · Semester 1', modules: [
    ['NB5000CEM', 'Agile', 20], ['NB5001CEM', 'User Experience Designing', 20], ['NB5002CEM', 'Programming, Data Structures and Algorithms-2', 20],
  ]},
  { label: 'Year 3 · Semester 2', modules: [
    ['NB5003CEM', 'Technology and Its Social, Legal and Ethical Context', 10], ['NB5004CEM', 'Cyber Security', 20], ['NB5005CEM', 'Data Science', 20], ['NB5006CEM', 'Effective Communication Skills', 10],
  ]},
  { label: 'Year 4 · Semester 1', modules: [
    ['NB6007CEM', 'Web API Development', 20], ['NB6008CEM', 'Project Discovery', 20], ['NB6009CEM', 'IOS Development', 20],
  ]},
  { label: 'Year 4 · Semester 2', modules: [
    ['NB6010CEM', 'Computer Vision', 20], ['NB6011CEM', 'Artificial Intelligence', 10], ['NB6012OCEM', 'Dissertation and Project Artefact', 30],
  ]},
];
const totalCredits = semesters.flatMap(s => s.modules).reduce((n, m) => n + m[2], 0);

function classification(avg) {
  if (avg === null) return { name: 'Add your marks', short: '—', color: 'neutral', next: 70 };
  if (avg >= 70) return { name: 'First Class', short: '1st', color: 'first', next: null };
  if (avg >= 60) return { name: 'Upper Second Class', short: '2:1', color: 'upper', next: 70 };
  if (avg >= 50) return { name: 'Lower Second Class', short: '2:2', color: 'lower', next: 60 };
  if (avg >= 40) return { name: 'Third Class', short: '3rd', color: 'third', next: 50 };
  return { name: 'Below classification threshold', short: '—', color: 'below', next: 40 };
}

function App() {
  const [marks, setMarks] = useState({});
  const [activeYear, setActiveYear] = useState('All years');
  const [showHelp, setShowHelp] = useState(false);
  const modules = useMemo(() => semesters.flatMap((s, si) => s.modules.map(([code, title, credits], mi) => ({ key: `${si}-${mi}`, code, title, credits, semester: s.label, year: si < 2 ? 3 : 4 }))), []);
  const entered = modules.filter(m => marks[m.key] !== undefined && marks[m.key] !== '');
  const earnedCredits = entered.reduce((sum, m) => sum + m.credits, 0);
  const weighted = entered.reduce((sum, m) => sum + m.credits * Number(marks[m.key]), 0);
  const average = earnedCredits ? weighted / earnedCredits : null;
  const result = classification(average);
  const visibleSemesters = semesters.map((s, i) => ({ ...s, index: i })).filter(s => activeYear === 'All years' || (activeYear === 'Year 3' ? s.index < 2 : s.index > 1));
  const progress = earnedCredits / totalCredits * 100;

  const updateMark = (key, value) => {
    if (value === '') return setMarks(prev => ({ ...prev, [key]: '' }));
    const parsed = Number(value);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 100) setMarks(prev => ({ ...prev, [key]: value }));
  };
  const reset = () => setMarks({});
  const download = () => {
    const lines = [['Module code', 'Module', 'Credits', 'Mark'], ...modules.map(m => [m.code, m.title, m.credits, marks[m.key] ?? ''])];
    const csv = lines.map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'nibm-degree-calculation.csv'; link.click(); URL.revokeObjectURL(url);
  };

  return <main className="app-shell">
    <header className="topbar"><a className="brand" href="#top" aria-label="NIBM Degree Calculator home"><span className="brand-mark"><BookOpen size={19} strokeWidth={2.5}/></span><span>NIBM<span className="brand-light"> / CALCULATOR</span></span></a><div className="topbar-right"><span className="local-badge"><span/> In-browser calculator</span><button className="help-button" onClick={() => setShowHelp(v => !v)}><CircleHelp size={16}/> How it works</button></div></header>

    <section className="hero" id="top"><div className="hero-copy"><div className="eyebrow"><Sparkles size={13}/> YOUR DEGREE, AT A GLANCE</div><h1>Know where you<br className="desktop-break"/> <span>stand.</span></h1><p>Enter your module marks and see your estimated degree classification. Your average is weighted by each module’s credit value.</p><div className="hero-facts"><span><i className="fact-dot"/> {modules.length} modules</span><span><i className="fact-dot mint"/> {totalCredits} total credits</span><span><i className="fact-dot gold"/> Year 3 &amp; 4</span></div></div>
      <div className={`result-card ${result.color}`}><div className="result-top"><span className="result-label">ESTIMATED CLASSIFICATION</span><span className="result-icon"><Award size={19}/></span></div><div className="result-main"><div><div className="result-name">{result.name}</div><div className="result-sub">{average === null ? 'Your result will appear here' : `${entered.length} of ${modules.length} modules entered`}</div></div><div className="grade-pill">{result.short}</div></div><div className="average-row"><span>Weighted average</span><strong>{average === null ? '—' : `${average.toFixed(1)}%`}</strong></div><div className="progress-track"><span style={{ width: `${Math.min(100, progress)}%` }}/></div><div className="progress-caption"><span>{earnedCredits} of {totalCredits} credits entered</span><span>{Math.round(progress)}%</span></div></div>
    </section>

    {showHelp && <aside className="help-panel"><button aria-label="Close" onClick={() => setShowHelp(false)}>×</button><strong>How your estimate is calculated</strong><p>We multiply each mark by its module credit value, then divide by the credits you’ve entered. Only modules with a mark count toward the live average.</p><div className="thresholds"><span>1st <b>70%+</b></span><span>2:1 <b>60–69%</b></span><span>2:2 <b>50–59%</b></span><span>3rd <b>40–49%</b></span></div><small>Based on the boundaries shown in your NIBM programme guide. Confirm with your academic office for official results.</small></aside>}

    <section className="calculator-section"><div className="section-heading"><div><div className="eyebrow dark">THE CALCULATOR</div><h2>Your module marks</h2><p>Enter a mark from 0 to 100 for each module. You can update these any time.</p></div><div className="heading-actions"><button className="action-button" onClick={download} disabled={!entered.length}><ArrowDownToLine size={15}/> Export</button><button className="action-button reset-button" onClick={reset} disabled={!entered.length}><RotateCcw size={15}/> Reset</button></div></div>
      <div className="toolbar"><div className="filter-tabs" role="tablist" aria-label="Filter by year">{['All years', 'Year 3', 'Year 4'].map(y => <button key={y} role="tab" aria-selected={activeYear === y} className={activeYear === y ? 'selected' : ''} onClick={() => setActiveYear(y)}>{y}</button>)}</div><span className="mark-hint"><span className="keyboard-icon">↵</span> Marks out of 100</span></div>
      <div className="semester-list">{visibleSemesters.map((semester, idx) => { const termModules = semester.modules.map(([code, title, credits], mi) => ({ ...modules.find(m => m.key === `${semester.index}-${mi}`) })); const termEntered = termModules.filter(m => marks[m.key] !== undefined && marks[m.key] !== '').length; return <article className="semester-card" key={semester.label}><div className="semester-header"><div className="semester-title"><span className="semester-marker">0{semester.index + 1}</span><h3>{semester.label}</h3></div><span className="term-count">{termEntered} / {termModules.length} complete <ChevronDown size={14}/></span></div><div className="module-head"><span>MODULE</span><span>MODULE TITLE</span><span className="credits-head">CREDITS</span><span className="mark-head">YOUR MARK <small>/ 100</small></span><span className="class-head">CLASS</span></div>{termModules.map(module => { const raw = marks[module.key]; const mark = raw === '' || raw === undefined ? null : Number(raw); const status = classification(mark); return <div className="module-row" key={module.key}><div className="module-code">{module.code}</div><div className="module-title">{module.title}</div><div className="module-credits"><span className="mobile-label">Credits</span>{module.credits}<small>cr</small></div><div className="mark-cell"><input aria-label={`Mark for ${module.title}`} type="number" min="0" max="100" step="0.1" placeholder="—" value={raw ?? ''} onChange={e => updateMark(module.key, e.target.value)} onBlur={e => { if(e.target.value !== '') updateMark(module.key, Number(e.target.value).toString()); }} /><span>%</span></div><div className={`module-class ${mark === null ? 'ungraded' : status.color}`}>{mark === null ? <span className="not-entered">Not entered</span> : <><Check size={13}/>{status.short}</>}</div></div>})}</article>})}</div>
      <div className="formula-note"><span className="formula-icon">ƒx</span><div><strong>Credit-weighted average</strong><span>Each module contributes according to its credit value.</span></div><div className="formula">(Credit value × mark) <i>÷</i> total credits entered <ArrowRight size={15}/> average</div></div>
      <footer><span>Made for NIBM students <span className="heart">✳</span></span><span>For guidance only · Always check with your academic office</span></footer>
    </section>
  </main>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
