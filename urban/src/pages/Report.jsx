import Navbar from '../components/Navbar';
import MaintenanceForm from '../components/MaintenanceForm';

export default function Report() {
    return (
        <div className="app-layout">
            <Navbar />
            <div className="app-body">
                <MaintenanceForm prefill={true} />
            </div>
        </div>
    );
}
