import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Layout } from './components/common/Layout';
import RoleBasedLoginPage from './pages/RoleBasedLoginPage';
import SignupPage from './pages/SignupPage';
import PoliceDashboard from './pages/PoliceDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DriverDashboard from './pages/DriverDashboard';
import IssueFineForm from './pages/IssueFineForm';
import PayFinePage from './pages/PayFinePage';
import FinesListPage from './pages/FinesListPage';
import PaymentsListPage from './pages/PaymentsListPage';
import AdminUsersPage from './pages/AdminUsersPage';
import ProfilePage from './pages/ProfilePage';
import MyVehiclesPage from './pages/MyVehiclesPage';
import NotificationsPage from './pages/NotificationsPage';
import EditFinePage from './pages/EditFinePage';
import AuditLogsPage from './pages/AuditLogsPage';

function DashboardRedirect() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role === 'admin') navigate('/admin', { replace: true });
  else if (user.role === 'driver') navigate('/driver', { replace: true });
  else navigate('/police', { replace: true });
  return null;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<RoleBasedLoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardRedirect />} />
        <Route path="police" element={<ProtectedRoute allowedRoles={['officer', 'admin']}><PoliceDashboard /></ProtectedRoute>} />
        <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
        <Route path="driver" element={<ProtectedRoute allowedRoles={['driver']}><DriverDashboard /></ProtectedRoute>} />
        <Route path="my-vehicles" element={<ProtectedRoute allowedRoles={['driver']}><MyVehiclesPage /></ProtectedRoute>} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="issue-fine" element={<ProtectedRoute allowedRoles={['officer', 'admin']}><IssueFineForm /></ProtectedRoute>} />
        <Route path="fines" element={<FinesListPage />} />
        <Route path="fines/:id/edit" element={<ProtectedRoute allowedRoles={['officer', 'admin']}><EditFinePage /></ProtectedRoute>} />
        <Route path="fines/:id/pay" element={<ProtectedRoute allowedRoles={['driver', 'admin']}><PayFinePage /></ProtectedRoute>} />
        <Route path="payments" element={<ProtectedRoute allowedRoles={['admin', 'driver']}><PaymentsListPage /></ProtectedRoute>} />
        <Route path="audit-logs" element={<ProtectedRoute allowedRoles={['admin']}><AuditLogsPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
