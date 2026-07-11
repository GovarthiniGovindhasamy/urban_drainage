import { Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyRequests from './pages/MyRequests';
import Notification from './pages/Notification';
import ContactUs from './pages/ContactUs';
import AdminDashboard from './pages/AdminDashboard';
import WorkerDashboard from './pages/WorkerDashboard';

function App() {
  return (
    <Routes>
      {/* User Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/requests" element={<MyRequests />} />
      <Route path="/notification" element={<Notification />} />
      <Route path="/contact" element={<ContactUs />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      {/* Worker Routes */}
      <Route path="/worker/dashboard" element={<WorkerDashboard />} />
    </Routes>
  );
}

export default App;
