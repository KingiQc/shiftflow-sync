import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useApp } from '@/contexts/AppContext';

const JOB_COLORS = ['#FF5A3C', '#4ECDC4', '#FFD700', '#9B59B6', '#3498DB', '#2ECC71', '#E74C3C', '#F39C12'];

const Jobs: React.FC = () => {
  const { jobs, addJob, updateJob, deleteJob, currencySymbol } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [rate, setRate] = useState(0);
  const [color, setColor] = useState(JOB_COLORS[0]);

  const handleAdd = () => {
    if (!name) return;
    addJob({ name, hourlyRate: rate, colorTag: color });
    setShowAdd(false);
    reset();
  };

  const handleEdit = () => {
    if (!editId || !name) return;
    updateJob({ id: editId, name, hourlyRate: rate, colorTag: color });
    setEditId(null);
    reset();
  };

  const startEdit = (j: typeof jobs[0]) => {
    setEditId(j.id); setName(j.name); setRate(j.hourlyRate); setColor(j.colorTag);
  };

  const reset = () => { setName(''); setRate(0); setColor(JOB_COLORS[0]); };

  const isEditing = editId !== null;
  const showForm = showAdd || isEditing;

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon icon="mdi:briefcase" width={24} className="text-foreground" />
          <h1 className="text-xl font-semibold text-foreground">Jobs</h1>
        </div>
        <button onClick={() => { setShowAdd(true); reset(); }} className="accent-badge cursor-pointer">+ Add Job</button>
      </div>

      {jobs.length === 0 && !showForm ? (
        <div className="glass-card p-8 text-center">
          <Icon icon="mdi:briefcase-plus" width={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No jobs yet. Add your first job to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(j => (
            <div key={j.id} className="glass-card-glow p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: j.colorTag }} />
                <div>
                  <div className="font-semibold text-foreground">{j.name}</div>
                  <div className="text-sm text-muted-foreground">{currencySymbol}{j.hourlyRate.toFixed(2)}/h</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(j)} className="p-2 rounded-lg hover:bg-secondary/60 transition-colors">
                  <Icon icon="mdi:pencil" width={18} className="text-foreground" />
                </button>
                <button onClick={() => deleteJob(j.id)} className="p-2 rounded-lg hover:bg-destructive/20 transition-colors">
                  <Icon icon="mdi:delete" width={18} className="text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="glass-card p-5 space-y-4 animate-fade-in-up">
          <h2 className="font-semibold text-foreground">{isEditing ? 'Edit Job' : 'Add Job'}</h2>
          <div>
            <label className="text-sm text-muted-foreground">Job Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Restaurant"
              className="w-full mt-1 p-3 rounded-xl bg-secondary/60 text-foreground border border-border/50 outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Hourly Rate ({currencySymbol})</label>
            <input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} min={0} step={0.5}
              className="w-full mt-1 p-3 rounded-xl bg-secondary/60 text-foreground border border-border/50 outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Color Tag</label>
            <div className="flex gap-2 mt-2">
              {JOB_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-foreground' : ''}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setShowAdd(false); setEditId(null); reset(); }}
              className="flex-1 p-3 rounded-xl bg-secondary/60 text-foreground font-medium">Cancel</button>
            <button onClick={isEditing ? handleEdit : handleAdd}
              className="flex-1 p-3 rounded-xl bg-primary text-primary-foreground font-medium">{isEditing ? 'Save' : 'Add'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
