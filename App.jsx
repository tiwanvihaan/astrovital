import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import AppShell from '@/components/layout/AppShell';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Overview from '@/pages/Overview';
import AstroPoints from '@/pages/AstroPoints';
import Movement from '@/pages/Movement';
import Mobility from '@/pages/Mobility';
import Team from '@/pages/Team';
import TeamWorkspace from '@/pages/TeamWorkspace';
import Settings from '@/pages/Settings';
import AstroAI from '@/pages/AstroAI';
import Health from '@/pages/Health';
import Alerts from '@/pages/Alerts';
import Recovery from '@/pages/Recovery';
import Reminders from '@/pages/Reminders';


const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Overview />} />
          <Route path="/astropoints" element={<AstroPoints />} />
          <Route path="/movement" element={<Movement />} />
          <Route path="/mobility" element={<Mobility />} />
          <Route path="/crew" element={<Team />} />
          <Route path="/crew/:teamId" element={<TeamWorkspace />} />
          <Route path="/team" element={<Navigate to="/crew" replace />} />
          <Route path="/team/:teamId" element={<TeamWorkspace />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/stretch" element={<Navigate to="/reminders" replace />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/astroai" element={<AstroAI />} />
          <Route path="/health" element={<Health />} />
          <Route path="/alerts" element={<Alerts />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App