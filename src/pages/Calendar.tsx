import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { useApp } from '@/contexts/AppContext';
import { calculateShiftEarnings, calculateShiftHours } from '@/types';
import { useSearchParams } from 'react-router-dom';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const getWeekDates = (ref: Date) => {
  const d = new Date(ref);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(d);
    dd.setDate(dd.getDate() + i);
    return dd;
  });
};

const Calendar: React.FC = () => {
  const { jobs, shifts, templates, currencySymbol, getJobById, addShift, addTemplate, deleteTemplate, deleteShift, startLiveShift } = useApp();
  const [searchParams] = useSearchParams();
  const [weekRef, setWeekRef] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddShift, setShowAddShift] = useState(searchParams.get('add') === 'true');
  const [showAddTemplate, setShowAddTemplate] = useState(false);

  // Swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const swiping = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    swiping.current = true;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (!swiping.current) return;
    swiping.current = false;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 60) {
      setWeekRef(prev => {
        const d = new Date(prev);
        d.setDate(d.getDate() + (diff > 0 ? 7 : -7));
        return d;
      });
    }
  };

  const weekDates = useMemo(() => getWeekDates(weekRef), [weekRef]);
  const selStr = selectedDate.toISOString().split('T')[0];
  const dayShifts = shifts.filter(s => s.date === selStr);

  // Shift form state
  const [formJob, setFormJob] = useState('');
  const [formStart, setFormStart] = useState('09:00');
  const [formEnd, setFormEnd] = useState('17:00');
  const [formBreak, setFormBreak] = useState(30);
  const [formTips, setFormTips] = useState(0);
  const [formPremiums, setFormPremiums] = useState(0);

  // Template form
  const [tplName, setTplName] = useState('');
  const [tplJob, setTplJob] = useState('');
  const [tplStart, setTplStart] = useState('09:00');
  const [tplEnd, setTplEnd] = useState('17:00');
  const [tplBreak, setTplBreak] = useState(30);

  const handleAddShift = () => {
    if (!formJob) return;
    addShift({ jobId: formJob, date: selStr, startTime: formStart, endTime: formEnd, breakMinutes: formBreak, tips: formTips, premiums: formPremiums });
    setShowAddShift(false);
    resetForm();
  };

  const handleApplyTemplate = (t: typeof templates[0]) => {
    addShift({ jobId: t.jobId, date: selStr, startTime: t.startTime, endTime: t.endTime, breakMinutes: t.breakMinutes, tips: 0, premiums: 0 });
  };

  const handleAddTemplate = () => {
    if (!tplName || !tplJob) return;
    addTemplate({ name: tplName, jobId: tplJob, startTime: tplStart, endTime: tplEnd, breakMinutes: tplBreak });
    setShowAddTemplate(false);
    setTplName(''); setTplJob(''); setTplStart('09:00'); setTplEnd('17:00'); setTplBreak(30);
  };

  const resetForm = () => {
    setFormJob(''); setFormStart('09:00'); setFormEnd('17:00'); setFormBreak(30); setFormTips(0); setFormPremiums(0);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const monthShifts = shifts.filter(s => {
    const d = new Date(s.date);
    return d.getMonth() === selectedDate.getMonth();
  });
  const totalHours = monthShifts.reduce((s, sh) => s + calculateShiftHours(sh), 0);

  const formatCurrency = (n: number) => `${currencySymbol}${n.toFixed(2)}`;

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg bg-secondary/40" onClick={() => navigate(-1)}>
              <Icon icon="mdi:view-grid" width={20} className="text-foreground" />
            </button>
            <div>
              <div className="font-semibold text-foreground">
                {selectedDate.toLocaleDateString('en-US', { month: 'long' })}
              </div>
              <div className="text-xs text-primary">
                {monthShifts.length} Shifts · {totalHours.toFixed(1)} hrs
              </div>
            </div>
          </div>
          <button className="p-2 rounded-lg bg-secondary/40" onClick={() => setShowAddShift(true)}>
            <Icon icon="mdi:calendar-plus" width={22} className="text-foreground" />
          </button>
        </div>

        {/* Week Scroller */}
        <div
          className="flex gap-1 overflow-hidden select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {weekDates.map((d, i) => {
            const ds = d.toISOString().split('T')[0];
            const isSelected = ds === selStr;
            const isToday = ds === todayStr;
            const hasShift = shifts.some(s => s.date === ds);
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(d)}
                className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all duration-200 ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary/40'
                }`}
              >
                <span className="text-[11px] text-muted-foreground">{DAYS[i]}</span>
                <span className={`text-lg font-semibold ${isSelected ? 'text-primary-foreground' : ''}`}>{d.getDate()}</span>
                {hasShift && <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-primary-foreground' : 'bg-primary'}`} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Shifts */}
      {dayShifts.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Icon icon="mdi:calendar-blank" width={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No shifts on this day</p>
          <button onClick={() => setShowAddShift(true)} className="mt-3 accent-badge cursor-pointer text-sm">
            + Add Shift
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {dayShifts.map(s => {
            const job = getJobById(s.jobId);
            const hours = calculateShiftHours(s);
            const earnings = calculateShiftEarnings(s, job);
            return (
              <div key={s.id} className="glass-card-glow p-4 relative">
                {/* Timeline indicator */}
                <div className="absolute left-0 top-4 bottom-4 w-1 bg-primary rounded-r" />

                <div className="pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {job && <div className="w-2.5 h-2.5 rounded-full" style={{ background: job.colorTag }} />}
                      <span className="text-xs text-primary">{job?.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startLiveShift(s.jobId)} className="accent-badge cursor-pointer text-[11px]">
                        <Icon icon="mdi:play" width={12} className="text-primary" /> Start
                      </button>
                      <button onClick={() => deleteShift(s.id)} className="text-muted-foreground hover:text-destructive">
                        <Icon icon="mdi:delete" width={16} />
                      </button>
                    </div>
                  </div>

                  <div className="font-semibold text-lg text-foreground">{s.startTime} - {s.endTime}</div>

                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon icon="mdi:clock-outline" width={16} className="text-primary" /> {hours.toFixed(1)} hrs
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon icon="mdi:coffee" width={16} className="text-primary" /> {s.breakMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon icon="mdi:chart-line" width={16} className="text-primary" /> {formatCurrency(job?.hourlyRate || 0)}/h
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="text-xs text-muted-foreground">TOTAL</span>
                      <div className="text-xl font-bold text-foreground">{formatCurrency(earnings)}</div>
                    </div>
                    <span className="accent-badge">WAGE {formatCurrency(hours * (job?.hourlyRate || 0))}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Templates */}
      {templates.length > 0 && (
        <div className="animate-fade-in-up stagger-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:bookmark" width={20} className="text-primary" />
              <span className="font-semibold text-foreground">Add from Template</span>
            </div>
            <button onClick={() => setShowAddTemplate(true)} className="text-primary text-sm font-medium">All ›</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {templates.map(t => {
              const job = getJobById(t.jobId);
              const hours = (() => {
                const [sh, sm] = t.startTime.split(':').map(Number);
                const [eh, em] = t.endTime.split(':').map(Number);
                let m = (eh * 60 + em) - (sh * 60 + sm);
                if (m < 0) m += 1440;
                return ((m - t.breakMinutes) / 60).toFixed(1);
              })();
              return (
                <button
                  key={t.id}
                  onClick={() => handleApplyTemplate(t)}
                  className="glass-card-glow p-4 min-w-[160px] text-left flex-shrink-0"
                >
                  <div className="flex items-center gap-1 mb-1">
                    <Icon icon="mdi:clock-outline" width={16} className="text-primary" />
                    <span className="text-sm text-foreground">{t.startTime}</span>
                  </div>
                  <div className="font-semibold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">⏱ {hours} h</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Template Button */}
      <button
        onClick={() => setShowAddTemplate(true)}
        className="glass-card p-3 w-full text-center text-muted-foreground hover:text-foreground transition-colors"
      >
        + Create Shift Template
      </button>

      {/* Add Shift Modal */}
      {showAddShift && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAddShift(false)}>
          <div className="glass-card p-6 w-full max-w-md mx-4 mb-4 md:mb-0 animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-foreground mb-4">Add Shift</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">Job</label>
                <select value={formJob} onChange={e => setFormJob(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl bg-secondary/60 text-foreground border border-border/50 outline-none focus:border-primary/50">
                  <option value="">Select job</option>
                  {jobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground">Start</label>
                  <input type="time" value={formStart} onChange={e => setFormStart(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl bg-secondary/60 text-foreground border border-border/50 outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">End</label>
                  <input type="time" value={formEnd} onChange={e => setFormEnd(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl bg-secondary/60 text-foreground border border-border/50 outline-none focus:border-primary/50" />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Break (min)</label>
                <input type="number" value={formBreak} onChange={e => setFormBreak(Number(e.target.value))}
                  className="w-full mt-1 p-3 rounded-xl bg-secondary/60 text-foreground border border-border/50 outline-none focus:border-primary/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground">Tips ({currencySymbol})</label>
                  <input type="number" value={formTips} onChange={e => setFormTips(Number(e.target.value))}
                    className="w-full mt-1 p-3 rounded-xl bg-secondary/60 text-foreground border border-border/50 outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Premiums ({currencySymbol})</label>
                  <input type="number" value={formPremiums} onChange={e => setFormPremiums(Number(e.target.value))}
                    className="w-full mt-1 p-3 rounded-xl bg-secondary/60 text-foreground border border-border/50 outline-none focus:border-primary/50" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddShift(false)} className="flex-1 p-3 rounded-xl bg-secondary/60 text-foreground font-medium">Cancel</button>
                <button onClick={handleAddShift} className="flex-1 p-3 rounded-xl bg-primary text-primary-foreground font-medium">Add Shift</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Template Modal */}
      {showAddTemplate && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAddTemplate(false)}>
          <div className="glass-card p-6 w-full max-w-md mx-4 mb-4 md:mb-0 animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-foreground mb-4">Create Template</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">Template Name</label>
                <input type="text" value={tplName} onChange={e => setTplName(e.target.value)} placeholder="e.g. Morning Shift"
                  className="w-full mt-1 p-3 rounded-xl bg-secondary/60 text-foreground border border-border/50 outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Job</label>
                <select value={tplJob} onChange={e => setTplJob(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl bg-secondary/60 text-foreground border border-border/50 outline-none focus:border-primary/50">
                  <option value="">Select job</option>
                  {jobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground">Start</label>
                  <input type="time" value={tplStart} onChange={e => setTplStart(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl bg-secondary/60 text-foreground border border-border/50 outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">End</label>
                  <input type="time" value={tplEnd} onChange={e => setTplEnd(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl bg-secondary/60 text-foreground border border-border/50 outline-none focus:border-primary/50" />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Break (min)</label>
                <input type="number" value={tplBreak} onChange={e => setTplBreak(Number(e.target.value))}
                  className="w-full mt-1 p-3 rounded-xl bg-secondary/60 text-foreground border border-border/50 outline-none focus:border-primary/50" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddTemplate(false)} className="flex-1 p-3 rounded-xl bg-secondary/60 text-foreground font-medium">Cancel</button>
                <button onClick={handleAddTemplate} className="flex-1 p-3 rounded-xl bg-primary text-primary-foreground font-medium">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FABs */}
      <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-30">
        <button className="fab" onClick={() => setShowAddShift(true)}>
          <Icon icon="mdi:plus" width={28} className="text-foreground" />
        </button>
      </div>
    </div>
  );
};

export default Calendar;

function navigate(arg0: number): void {
  // This is handled by router, kept as fallback
}
