import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Job, Shift, ShiftTemplate, Expense, UserSettings, ActiveShift, AppUser } from '@/types';
import { getCurrencySymbol } from '@/types';

interface AppState {
  user: AppUser | null;
  jobs: Job[];
  shifts: Shift[];
  templates: ShiftTemplate[];
  expenses: Expense[];
  settings: UserSettings;
  activeShift: ActiveShift | null;
}

interface AppContextType extends AppState {
  currencySymbol: string;
  login: (usernameOrEmail: string, password: string) => string | null;
  signup: (username: string, email: string, password: string) => string | null;
  logout: () => void;
  addJob: (job: Omit<Job, 'id'>) => void;
  updateJob: (job: Job) => void;
  deleteJob: (id: string) => void;
  addShift: (shift: Omit<Shift, 'id'>) => void;
  updateShift: (shift: Shift) => void;
  deleteShift: (id: string) => void;
  addTemplate: (t: Omit<ShiftTemplate, 'id'>) => void;
  deleteTemplate: (id: string) => void;
  addExpense: (e: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  updateSettings: (s: Partial<UserSettings>) => void;
  startLiveShift: (jobId: string) => void;
  stopLiveShift: () => void;
  getJobById: (id: string) => Job | undefined;
}

const defaultSettings: UserSettings = {
  name: '',
  country: 'US',
  taxRate: 0,
  insuranceRate: 0,
  otherDeductions: 0,
};

const AppContext = createContext<AppContextType | null>(null);

const uid = () => crypto.randomUUID();

const load = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(() => load('st_user', null));
  const [jobs, setJobs] = useState<Job[]>(() => load('st_jobs', []));
  const [shifts, setShifts] = useState<Shift[]>(() => load('st_shifts', []));
  const [templates, setTemplates] = useState<ShiftTemplate[]>(() => load('st_templates', []));
  const [expenses, setExpenses] = useState<Expense[]>(() => load('st_expenses', []));
  const [settings, setSettings] = useState<UserSettings>(() => load('st_settings', defaultSettings));
  const [activeShift, setActiveShift] = useState<ActiveShift | null>(() => load('st_active', null));

  useEffect(() => { localStorage.setItem('st_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('st_jobs', JSON.stringify(jobs)); }, [jobs]);
  useEffect(() => { localStorage.setItem('st_shifts', JSON.stringify(shifts)); }, [shifts]);
  useEffect(() => { localStorage.setItem('st_templates', JSON.stringify(templates)); }, [templates]);
  useEffect(() => { localStorage.setItem('st_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('st_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('st_active', JSON.stringify(activeShift)); }, [activeShift]);

  const currencySymbol = getCurrencySymbol(settings.country);

  const login = (usernameOrEmail: string, password: string): string | null => {
    const users: AppUser[] = load('st_users', []);
    const found = users.find(u => (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password);
    if (!found) return 'Invalid credentials';
    setUser(found);
    setSettings(prev => ({ ...prev, name: found.username }));
    return null;
  };

  const signup = (username: string, email: string, password: string): string | null => {
    const users: AppUser[] = load('st_users', []);
    if (users.find(u => u.username === username)) return 'Username already taken';
    if (users.find(u => u.email === email)) return 'Email already registered';
    const newUser: AppUser = { id: uid(), username, email, password };
    localStorage.setItem('st_users', JSON.stringify([...users, newUser]));
    setUser(newUser);
    setSettings(prev => ({ ...prev, name: username }));
    return null;
  };

  const logout = () => { setUser(null); };

  const addJob = (j: Omit<Job, 'id'>) => setJobs(p => [...p, { ...j, id: uid() }]);
  const updateJob = (j: Job) => setJobs(p => p.map(x => x.id === j.id ? j : x));
  const deleteJob = (id: string) => setJobs(p => p.filter(x => x.id !== id));

  const addShift = (s: Omit<Shift, 'id'>) => setShifts(p => [...p, { ...s, id: uid() }]);
  const updateShift = (s: Shift) => setShifts(p => p.map(x => x.id === s.id ? s : x));
  const deleteShift = (id: string) => setShifts(p => p.filter(x => x.id !== id));

  const addTemplate = (t: Omit<ShiftTemplate, 'id'>) => setTemplates(p => [...p, { ...t, id: uid() }]);
  const deleteTemplate = (id: string) => setTemplates(p => p.filter(x => x.id !== id));

  const addExpense = (e: Omit<Expense, 'id'>) => setExpenses(p => [...p, { ...e, id: uid() }]);
  const deleteExpense = (id: string) => setExpenses(p => p.filter(x => x.id !== id));

  const updateSettings = (s: Partial<UserSettings>) => setSettings(p => ({ ...p, ...s }));

  const startLiveShift = (jobId: string) => setActiveShift({ shiftId: uid(), jobId, startedAt: Date.now() });
  const stopLiveShift = () => setActiveShift(null);

  const getJobById = useCallback((id: string) => jobs.find(j => j.id === id), [jobs]);

  return (
    <AppContext.Provider value={{
      user, jobs, shifts, templates, expenses, settings, activeShift, currencySymbol,
      login, signup, logout,
      addJob, updateJob, deleteJob,
      addShift, updateShift, deleteShift,
      addTemplate, deleteTemplate,
      addExpense, deleteExpense,
      updateSettings,
      startLiveShift, stopLiveShift,
      getJobById,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
