import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Board from './pages/Board.jsx';
import Projects from './pages/Projects.jsx';
import { useAuth } from './context/AuthContext.jsx';

export default function App() {
  const { user } = useAuth();
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar />
      <main id="main" className="container">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/board" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/board" replace /> : <Register />} />
          <Route path="/board" element={<ProtectedRoute><Board /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/board" replace />} />
        </Routes>
      </main>
    </>
  );
}
