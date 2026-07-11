import Navbar from '../components/Navbar';
import MaintenanceForm from '../components/MaintenanceForm';

export default function Dashboard() {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="app-body">
        <MaintenanceForm />
      </div>
    </div>
  );
}
