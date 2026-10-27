import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ErrorBox from '../components/ErrorBox.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'manager' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.name.trim().length < 2) return setError('Name must be at least 2 characters.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setError('Enter a valid email address.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    setSubmitting(true);
    try {
      await register({ ...form, name: form.name.trim(), email: form.email.trim() });
      navigate('/board');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card narrow">
      <h1>Create account</h1>
      <form onSubmit={onSubmit} noValidate>
        <ErrorBox message={error} />
        <label htmlFor="name">Full name</label>
        <input id="name" name="name" autoComplete="name" value={form.name} onChange={onChange} required />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} required />
        <label htmlFor="password">Password (8+ characters)</label>
        <input id="password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={onChange} required />
        <label htmlFor="role">Workspace role</label>
        <select id="role" name="role" value={form.role} onChange={onChange}>
          <option value="manager">Project Manager - create projects and tasks</option>
          <option value="member">Team Member - work on assigned tasks</option>
        </select>
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p>
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </section>
  );
}
