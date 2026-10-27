import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorBox from '../components/ErrorBox.jsx';
import TaskCard from '../components/TaskCard.jsx';

const COLUMNS = [
  ['todo', 'To Do'],
  ['in_progress', 'In Progress'],
  ['review', 'Review'],
  ['done', 'Done'],
];
const EMPTY_FORM = { projectId: '', title: '', description: '', priority: 'medium', assigneeId: '', dueDate: '' };

export default function Board() {
  const { user } = useAuth();
  const isManager = user.role === 'manager';

  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [p, t, m] = await Promise.all([
        api.listProjects(),
        api.listTasks(filter),
        isManager ? api.listMembers() : Promise.resolve({ users: [] }),
      ]);
      setProjects(p.projects);
      setTasks(t.data);
      setMembers(m.users);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter, isManager]);

  useEffect(() => {
    load();
  }, [load]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.projectId) return setFormError('Choose a project.');
    if (form.title.trim().length < 3) return setFormError('Task title must be at least 3 characters.');
    setSubmitting(true);
    try {
      const data = await api.createTask({
        projectId: form.projectId,
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        assigneeId: form.assigneeId || undefined,
        dueDate: form.dueDate || undefined,
      });
      if (!filter || filter === form.projectId) setTasks([data.task, ...tasks]);
      setForm({ ...EMPTY_FORM, projectId: form.projectId });
      setShowForm(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const onMove = async (task, status) => {
    setActionError('');
    setBusyId(task._id);
    try {
      const data = await api.updateTask(task._id, { status });
      setTasks((list) => list.map((t) => (t._id === task._id ? data.task : t)));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (task) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    setActionError('');
    setBusyId(task._id);
    try {
      await api.deleteTask(task._id);
      setTasks((list) => list.filter((t) => t._id !== task._id));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section>
      <div className="page-head">
        <h1>Board</h1>
        <div className="controls">
          <label htmlFor="filter" className="sr-only">Filter by project</label>
          <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>
          {isManager && (
            <button className="btn" type="button" onClick={() => setShowForm(!showForm)} aria-expanded={showForm}>
              {showForm ? 'Close' : '+ Create Task'}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form className="card" onSubmit={onCreate} noValidate>
          <h2>New task</h2>
          <ErrorBox message={formError} />
          <label htmlFor="projectId">Project</label>
          <select id="projectId" name="projectId" value={form.projectId} onChange={onChange} required>
            <option value="">Select a project</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>
          {projects.length === 0 && (
            <p className="muted">You need a project first. <Link to="/projects">Create one</Link>.</p>
          )}
          <label htmlFor="title">Title</label>
          <input id="title" name="title" value={form.title} onChange={onChange} maxLength={120} required />
          <label htmlFor="description">Description (optional)</label>
          <textarea id="description" name="description" rows={2} value={form.description} onChange={onChange} maxLength={1000} />
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority" value={form.priority} onChange={onChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <label htmlFor="assigneeId">Assign to (optional)</label>
          <select id="assigneeId" name="assigneeId" value={form.assigneeId} onChange={onChange}>
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
            ))}
          </select>
          <label htmlFor="dueDate">Due date (optional)</label>
          <input id="dueDate" name="dueDate" type="date" value={form.dueDate} onChange={onChange} />
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create task'}
          </button>
        </form>
      )}

      <ErrorBox message={actionError} />

      {loading && <Spinner label="Loading board" />}
      {!loading && loadError && <ErrorBox message={loadError} onRetry={load} />}
      {!loading && !loadError && tasks.length === 0 && (
        <div className="empty">
          <p>
            {isManager
              ? projects.length === 0
                ? 'No tasks yet. Start by creating a project, then add tasks to it.'
                : 'No tasks yet. Use "+ Create Task" to add your first one.'
              : 'Nothing assigned to you yet. Tasks assigned to you by a manager will appear here.'}
          </p>
          {isManager && projects.length === 0 && <Link className="btn" to="/projects">Go to Projects</Link>}
        </div>
      )}
      {!loading && !loadError && tasks.length > 0 && (
        <div className="columns">
          {COLUMNS.map(([status, label]) => {
            const items = tasks.filter((t) => t.status === status);
            return (
              <section key={status} className="column" aria-label={label}>
                <h2>
                  {label} <span className="count">{items.length}</span>
                </h2>
                {items.length === 0 && <p className="muted">Nothing here.</p>}
                {items.map((t) => (
                  <TaskCard
                    key={t._id}
                    task={t}
                    busy={busyId === t._id}
                    canDelete={isManager}
                    onMove={onMove}
                    onDelete={onDelete}
                  />
                ))}
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
