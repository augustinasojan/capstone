import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorBox from '../components/ErrorBox.jsx';

const EMPTY = { title: '', description: '', targetDate: '' };

export default function Projects() {
  const { user } = useAuth();
  const isManager = user.role === 'manager';
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await api.listProjects();
      setProjects(data.projects);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (form.title.trim().length < 3) return setFormError('Title must be at least 3 characters.');
    setSubmitting(true);
    try {
      const data = await api.createProject({
        title: form.title.trim(),
        description: form.description.trim(),
        targetDate: form.targetDate || undefined,
      });
      setProjects([data.project, ...projects]);
      setForm(EMPTY);
      setShowForm(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (project) => {
    if (!window.confirm(`Delete "${project.title}" and all of its tasks?`)) return;
    try {
      await api.deleteProject(project._id);
      setProjects(projects.filter((p) => p._id !== project._id));
    } catch (err) {
      setLoadError(err.message);
    }
  };

  return (
    <section>
      <div className="page-head">
        <h1>Projects</h1>
        {isManager && (
          <button className="btn" type="button" onClick={() => setShowForm(!showForm)} aria-expanded={showForm}>
            {showForm ? 'Close' : '+ New Project'}
          </button>
        )}
      </div>

      {showForm && (
        <form className="card" onSubmit={onSubmit} noValidate>
          <h2>New project</h2>
          <ErrorBox message={formError} />
          <label htmlFor="title">Title</label>
          <input id="title" name="title" value={form.title} onChange={onChange} maxLength={100} required />
          <label htmlFor="description">Description (optional)</label>
          <textarea id="description" name="description" rows={3} value={form.description} onChange={onChange} maxLength={500} />
          <label htmlFor="targetDate">Target date (optional)</label>
          <input id="targetDate" name="targetDate" type="date" value={form.targetDate} onChange={onChange} />
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create project'}
          </button>
        </form>
      )}

      {loading && <Spinner label="Loading projects" />}
      {!loading && loadError && <ErrorBox message={loadError} onRetry={load} />}
      {!loading && !loadError && projects.length === 0 && (
        <div className="empty">
          <p>{isManager ? 'You have no projects yet. Create your first one to start adding tasks.' : 'No projects yet. You will see projects here once a manager assigns you a task.'}</p>
        </div>
      )}
      {!loading && !loadError && projects.length > 0 && (
        <ul className="list">
          {projects.map((p) => (
            <li key={p._id} className="card">
              <h2>{p.title}</h2>
              {p.description && <p>{p.description}</p>}
              {p.targetDate && <p className="muted">Target: {new Date(p.targetDate).toLocaleDateString()}</p>}
              {isManager && (
                <button type="button" className="btn btn-small btn-danger" onClick={() => onDelete(p)}>
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
