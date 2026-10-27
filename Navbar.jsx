import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <span className="brand">TaskFlow</span>
        {user ? (
          <nav aria-label="Main">
            <NavLink to="/board">Board</NavLink>
            <NavLink to="/projects">Projects</NavLink>
            <span className="who">
              {user.name} <em>({user.role === 'manager' ? 'Project Manager' : 'Team Member'})</em>
            </span>
            <button type="button" className="btn btn-small btn-ghost" onClick={handleLogout}>
              Sign out
            </button>
          </nav>
        ) : (
          <nav aria-label="Main">
            <NavLink to="/login">Sign in</NavLink>
            <NavLink to="/register">Create account</NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}
