import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Questions from './pages/Questions';
import QuestionDetail from './pages/QuestionDetail';
import NewQuestion from './pages/NewQuestion';
import Themes from './pages/Themes';
import ThemeDetail from './pages/ThemeDetail';
import UserProfile from './pages/UserProfile';

// 認証が必要なルートを保護するコンポーネント
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/questions/:id" element={<QuestionDetail />} />
        <Route
          path="/questions/new"
          element={
            <ProtectedRoute>
              <NewQuestion />
            </ProtectedRoute>
          }
        />
        <Route path="/themes" element={<Themes />} />
        <Route path="/themes/:id" element={<ThemeDetail />} />
        <Route path="/users/:id" element={<UserProfile />} />
        {/* 他のルートをここに追加 */}
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
