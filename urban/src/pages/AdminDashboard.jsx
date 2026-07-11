import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield,
    LayoutDashboard,
    AlertCircle,
    UserCheck,
    Clock,
    CheckCircle,
    LogOut,
    MapPin,
    Camera,
    Search
} from 'lucide-react';

const PRIORITY_COLORS = {
    low: { bg: '#f0fdf4', color: '#16a34a' },
    medium: { bg: '#fefce8', color: '#ca8a04' },
    high: { bg: '#fff7ed', color: '#ea580c' },
    emergency: { bg: '#fef2f2', color: '#dc2626' },
};

const STATUS_COLORS = {
    'Pending': { bg: '#eff6ff', color: '#2563eb' },
    'Assigned': { bg: '#fdf4ff', color: '#c026d3' },
    'In Progress': { bg: '#fff7ed', color: '#ea580c' },
    'Worker Resolved': { bg: '#e0e7ff', color: '#4338ca' },
    'Resolved': { bg: '#f0fdf4', color: '#16a34a' },
    'Rejected': { bg: '#fef2f2', color: '#dc2626' },
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    // workers: { exact: [], others: [] } — grouped by location match to selected complaint
    const [workers, setWorkers] = useState({ exact: [], others: [] });
    const [assignData, setAssignData] = useState(null);
    const [selectedWorker, setSelectedWorker] = useState(null);

    useEffect(() => {
        // Verify admin
        if (localStorage.getItem('isAdmin') !== 'true') {
            navigate('/admin');
            return;
        }
        fetchComplaints();
    }, [navigate]);

    // Fetch workers grouped by location match for a given complaint
    const fetchWorkersByLocation = async (complaint) => {
        try {
            const area = encodeURIComponent(complaint.area || complaint.location || '');
            const res = await fetch(`http://localhost:5000/api/workers/by-location?area=${area}`);
            if (res.ok) {
                const data = await res.json();
                setWorkers(data); // { exact: [...], others: [...] }
            }
        } catch (err) {
            console.error('Failed to fetch workers by location', err);
            setWorkers({ exact: [], others: [] });
        }
    };

    const fetchComplaints = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/complaints');
            if (res.ok) {
                const data = await res.json();
                setComplaints(data);
            }
        } catch (err) {
            console.error('Failed to fetch admin complaints', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus, workerData = null) => {
        try {
            const body = { status: newStatus };
            if (workerData) {
                body.worker_name = workerData.name;
                body.worker_phone = workerData.phone;
                body.from_date = workerData.fromDate;
                body.to_date = workerData.toDate;
            }

            const res = await fetch(`http://localhost:5000/api/admin/complaints/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                setComplaints(prev => prev.map(c =>
                    c.complaint_id === id ? { ...c, status: newStatus, worker_name: workerData?.name || c.worker_name } : c
                ));
            }
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const deleteComplaint = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/complaints/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setComplaints(prev => prev.filter(c => c.complaint_id !== id));
            }
        } catch (err) {
            console.error('Failed to delete complaint', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminEmail');
        navigate('/login');
    };

    const filteredComplaints = complaints.filter(c =>
        c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.complaint_id.toString().includes(searchTerm) ||
        c.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStats = () => {
        return {
            total: complaints.length,
            new: complaints.filter(c => c.status === 'Pending').length,
            assigned: complaints.filter(c => c.status === 'Assigned').length,
            inProgress: complaints.filter(c => c.status === 'In Progress' || c.status === 'Worker Resolved').length,
            resolved: complaints.filter(c => c.status === 'Resolved').length,
        };
    };

    const stats = getStats();

    const renderBadge = (config) => (
        <span style={{
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: config.bg,
            color: config.color
        }}>
            {config.label || config.value}
        </span>
    );

    const closeModal = () => setSelectedComplaint(null);

    const renderModal = () => {
        if (!selectedComplaint) return null;
        const c = selectedComplaint;
        return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div style={{ background: 'white', padding: '32px', borderRadius: '12px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                    <button onClick={closeModal} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }}>&times;</button>

                    <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#1f2937' }}>#{c.complaint_id} — {c.title}</h3>
                    <div style={{ marginBottom: '24px' }}>
                        {renderBadge({ ...STATUS_COLORS[c.status] || STATUS_COLORS['Pending'], value: c.status })}
                        <span style={{ marginLeft: '12px' }}>{renderBadge({ ...PRIORITY_COLORS[c.priority] || PRIORITY_COLORS.medium, value: c.priority })}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <div>
                            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px' }}>User Details</p>
                            <p style={{ fontWeight: 500 }}>{c.username}</p>
                            <p style={{ fontSize: '0.9rem', color: '#4b5563' }}>{c.email}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px' }}>Reported On</p>
                            <p style={{ fontWeight: 500 }}>{new Date(c.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px' }}>Category</p>
                            <p style={{ fontWeight: 500 }}>{c.category || '—'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px' }}>Assigned Worker</p>
                            <p style={{ fontWeight: 500 }}>{c.worker_name || 'None'}</p>
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '8px' }}>Description</p>
                        <p style={{ color: '#4b5563', lineHeight: 1.6, background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                            {c.description}
                        </p>
                    </div>

                    <div>
                        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '8px' }}>Location Details</p>
                        <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                            <p><strong>Area:</strong> {c.area || '—'}</p>
                            <p><strong>Ward:</strong> {c.ward || '—'}</p>
                            <p><strong>Landmark:</strong> {c.landmark || '—'}</p>
                            <p><strong>Address:</strong> {c.location || '—'}</p>
                            <p><strong>Pincode:</strong> {c.pincode || '—'}</p>
                            {(c.latitude || c.longitude) && (
                                <p style={{ marginTop: '8px', fontSize: '0.85rem', color: '#2563eb' }}>
                                    <MapPin size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                                    Coordinates: {c.latitude}, {c.longitude}
                                </p>
                            )}
                        </div>
                    </div>

                    {c.proof_photo && (
                        <div>
                            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '8px' }}>Proof of Work</p>
                            <div style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px', background: '#f9fafb' }}>
                                <img src={c.proof_photo} alt="Work Proof" style={{ maxWidth: '100%', maxHeight: '300px', display: 'block', margin: '0 auto', borderRadius: '4px' }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderAssignModal = () => {
        if (!assignData) return null;

        const allWorkers = [...(workers.exact || []), ...(workers.others || [])];
        const complaintCity = assignData.area || assignData.location || '';

        const onSubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            if (!selectedWorker) return alert('Please select a worker');

            updateStatus(assignData.complaint_id, 'Assigned', {
                name: selectedWorker.name,
                phone: selectedWorker.phone,
                fromDate: formData.get('from_date'),
                toDate: formData.get('to_date')
            });
            setAssignData(null);
            setSelectedWorker(null);
        };

        const WorkerCard = ({ w, isLocal }) => {
            const isSelected = selectedWorker?.worker_id === w.worker_id;
            return (
                <div
                    onClick={() => setSelectedWorker(w)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                        marginBottom: '8px', transition: 'all 0.15s',
                        border: isSelected
                            ? (isLocal ? '2px solid #16a34a' : '2px solid #2563eb')
                            : '2px solid #e5e7eb',
                        background: isSelected
                            ? (isLocal ? '#f0fdf4' : '#eff6ff')
                            : '#fff',
                        boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                    }}
                >
                    {/* Avatar */}
                    <div style={{
                        width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.95rem', letterSpacing: 0.5,
                        background: isLocal ? '#dcfce7' : '#dbeafe',
                        color: isLocal ? '#15803d' : '#1d4ed8',
                    }}>
                        {w.name.trim().split(' ').map(p => p[0]).slice(0,2).join('')}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {w.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' }}>
                            📍 {w.location} &nbsp;·&nbsp; {w.phone}
                        </div>
                    </div>
                    {/* Badge */}
                    {isLocal && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: '#bbf7d0', color: '#15803d', whiteSpace: 'nowrap' }}>Local</span>
                    )}
                    {isSelected && (
                        <span style={{ fontSize: '1rem' }}>{isLocal ? '✅' : '🔵'}</span>
                    )}
                </div>
            );
        };

        return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div style={{ background: 'white', padding: '32px', borderRadius: '14px', width: '480px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                    <button onClick={() => { setAssignData(null); setSelectedWorker(null); }} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
                    <h3 style={{ marginBottom: '2px', color: '#1f2937' }}>Assign Worker</h3>
                    <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '16px' }}>Complaint #{assignData.complaint_id}</p>

                    {/* Location match banner */}
                    {(workers.exact || []).length > 0 ? (
                        <div style={{ padding: '10px 14px', marginBottom: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '0.82rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1rem' }}>📍</span>
                            <span><strong>{(workers.exact || []).length} local worker{(workers.exact || []).length > 1 ? 's' : ''}</strong> found in <strong>{complaintCity || 'this area'}</strong></span>
                        </div>
                    ) : (
                        <div style={{ padding: '10px 14px', marginBottom: '16px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '0.82rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1rem' }}>⚠️</span>
                            <span>No local workers found for <strong>{complaintCity || 'this area'}</strong>. Showing all available workers.</span>
                        </div>
                    )}

                    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* Worker List */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 600 }}>Select Worker</label>

                            {/* Local Workers Section */}
                            {(workers.exact || []).length > 0 && (
                                <div style={{ marginBottom: '14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <div style={{ height: '2px', flex: 1, background: 'linear-gradient(90deg, #16a34a, transparent)' }} />
                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#15803d', whiteSpace: 'nowrap' }}>✅ Local Workers — {complaintCity || 'Matching Area'}</span>
                                        <div style={{ height: '2px', flex: 1, background: 'linear-gradient(90deg, transparent, #16a34a)' }} />
                                    </div>
                                    {(workers.exact || []).map(w => <WorkerCard key={w.worker_id} w={w} isLocal={true} />)}
                                </div>
                            )}

                            {/* Other Workers Section */}
                            {(workers.others || []).length > 0 && (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <div style={{ height: '2px', flex: 1, background: 'linear-gradient(90deg, #2563eb, transparent)' }} />
                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1d4ed8', whiteSpace: 'nowrap' }}>🔍 Other Workers — Different City</span>
                                        <div style={{ height: '2px', flex: 1, background: 'linear-gradient(90deg, transparent, #2563eb)' }} />
                                    </div>
                                    {(workers.others || []).map(w => <WorkerCard key={w.worker_id} w={w} isLocal={false} />)}
                                </div>
                            )}

                            {allWorkers.length === 0 && (
                                <p style={{ color: '#6b7280', fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>No workers available.</p>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>From Date</label>
                                <input type="date" name="from_date" required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>To Date</label>
                                <input type="date" name="to_date" required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                            </div>
                        </div>

                        {selectedWorker && (
                            <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#374151' }}>
                                <strong>Selected:</strong> {selectedWorker.name} — {selectedWorker.location} — {selectedWorker.phone}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '4px' }}>Confirm Assignment</button>
                    </form>
                </div>
            </div>
        );
    };

    const renderDashboard = () => (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <StatCard title="Total Complaints" value={stats.total} icon={<LayoutDashboard size={24} />} color="#38bdf8" bg="#f0f9ff" />
                <StatCard title="New Complaints" value={stats.new} icon={<AlertCircle size={24} />} color="#dc2626" bg="#fef2f2" />
                <StatCard title="Assigned Components" value={stats.assigned} icon={<UserCheck size={24} />} color="#c026d3" bg="#fdf4ff" />
                <StatCard title="In Progress" value={stats.inProgress} icon={<Clock size={24} />} color="#ea580c" bg="#fff7ed" />
                <StatCard title="Resolved" value={stats.resolved} icon={<CheckCircle size={24} />} color="#16a34a" bg="#f0fdf4" />
            </div>

            <div className="form-section">
                <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Recent Complaints</h3>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                            <th className="th-style">ID</th>
                            <th className="th-style">User Name</th>
                            <th className="th-style">Category</th>
                            <th className="th-style">Date</th>
                            <th className="th-style">Status</th>
                            <th className="th-style" style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredComplaints.slice(0, 8).map(req => (
                            <tr key={req.complaint_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td className="td-style font-medium">#{req.complaint_id}</td>
                                <td className="td-style">{req.username}</td>
                                <td className="td-style">{req.category || '—'}</td>
                                <td className="td-style">{new Date(req.created_at).toLocaleDateString()}</td>
                                <td className="td-style">
                                    {renderBadge({ ...STATUS_COLORS[req.status] || STATUS_COLORS['Pending'], value: req.status })}
                                </td>
                                <td className="td-style" style={{ textAlign: 'right' }}>
                                    <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setSelectedComplaint(req)}>View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderComplaintList = (statusFilter, actions) => {
        const list = filteredComplaints.filter(c => statusFilter.includes(c.status));

        if (list.length === 0) return <p style={{ color: '#6b7280', padding: '20px' }}>No complaints found.</p>;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {list.map(c => (
                    <div key={c.complaint_id} className="form-section" style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '20px', right: '24px' }}>
                            {renderBadge({ ...STATUS_COLORS[c.status] || STATUS_COLORS['Pending'], value: c.status })}
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '1.2rem', marginBottom: '4px', color: '#1f2937' }}>#{c.complaint_id} — {c.title}</h4>
                            <p style={{ fontSize: '0.85rem', color: '#6b7280', display: 'flex', gap: '15px' }}>
                                <span>User: <strong>{c.username}</strong></span>
                                <span>Category: <strong>{c.category || '—'}</strong></span>
                                <span>Priority: {renderBadge({ ...PRIORITY_COLORS[c.priority] || PRIORITY_COLORS.medium, value: c.priority })}</span>
                            </p>
                        </div>

                        <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '16px', lineHeight: 1.5 }}>
                            {c.description}
                        </p>

                        <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: '#4b5563', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <MapPin size={16} color="#60a5fa" />
                                <span>{c.area || c.location || 'Location not provided'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Camera size={16} color="#60a5fa" />
                                <span style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}>View Spot Photos</span>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            {actions(c)}
                            <button className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => setSelectedComplaint(c)}>View Details</button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="app-layout">
            {/* Admin Navbar */}
            <nav className="navbar" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
                <div className="navbar-brand">
                    <div className="navbar-brand-icon" style={{ background: 'rgba(255,255,255,0.1)', color: '#38bdf8' }}>
                        <Shield size={20} />
                    </div>
                    <div className="navbar-brand-text">
                        <h1>Urban Drainage Admin</h1>
                        <span>City Command Center</span>
                    </div>
                </div>

                <div className="navbar-links" style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={16} color="#9ca3af" />
                    <input
                        type="text"
                        placeholder="Search complaints..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', width: '200px', outline: 'none' }}
                    />
                </div>

                <div className="navbar-user">
                    <div className="navbar-user-info">
                        <div className="name">System Admin</div>
                        <div className="role">Central Office</div>
                    </div>
                    <div className="navbar-avatar" style={{ border: '2px solid #38bdf8', color: '#38bdf8' }}>SA</div>
                    <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '8px', color: '#9ca3af' }}>
                        <LogOut size={18} />
                    </button>
                </div>
            </nav>

            <div className="app-body">
                {/* Admin Sidebar */}
                <aside className="sidebar">
                    <div className="sidebar-section-label" style={{ marginTop: '10px' }}>MANAGEMENT</div>
                    <SidebarItem icon={<LayoutDashboard size={18} />} label="Overview Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <SidebarItem icon={<AlertCircle size={18} />} label="New Complaints" count={stats.new} active={activeTab === 'new'} onClick={() => setActiveTab('new')} />
                    <SidebarItem icon={<UserCheck size={18} />} label="Assigned Tasks" count={stats.assigned} active={activeTab === 'assigned'} onClick={() => setActiveTab('assigned')} />
                    <SidebarItem icon={<Clock size={18} />} label="In Progress" count={stats.inProgress} active={activeTab === 'in-progress'} onClick={() => setActiveTab('in-progress')} />
                    <SidebarItem icon={<CheckCircle size={18} />} label="Resolved" active={activeTab === 'resolved'} onClick={() => setActiveTab('resolved')} />
                </aside>

                <main className="main-content" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                    <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 className="page-title">
                                {activeTab === 'dashboard' && 'Admin Dashboard'}
                                {activeTab === 'new' && 'New Complaints'}
                                {activeTab === 'assigned' && 'Assigned Tasks'}
                                {activeTab === 'in-progress' && 'In Progress Tasks'}
                                {activeTab === 'resolved' && 'Resolved Complaints'}
                            </h2>
                            <p className="page-subtitle" style={{ marginBottom: 0 }}>
                                {activeTab === 'dashboard' && 'Overview of all city drainage issues.'}
                                {activeTab !== 'dashboard' && 'Manage and update complaint statuses.'}
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <p style={{ color: '#6b7280' }}>Loading system data...</p>
                    ) : (
                        <>
                            {activeTab === 'dashboard' && renderDashboard()}

                            {activeTab === 'new' && renderComplaintList(['Pending'], (c) => (
                                <>
                                    <button className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '0.8rem', color: '#dc2626' }} onClick={() => {
                                        if (window.confirm('Are you sure you want to reject and delete this complaint?')) {
                                            deleteComplaint(c.complaint_id);
                                        }
                                    }}>Reject</button>
                                    <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => { setAssignData(c); fetchWorkersByLocation(c); }}>Assign to Worker</button>
                                </>
                            ))}

                            {activeTab === 'assigned' && renderComplaintList(['Assigned'], (c) => (
                                <span style={{ padding: '8px 16px', fontSize: '0.8rem', color: '#6b7280' }}>Waiting for Worker</span>
                            ))}

                            {activeTab === 'in-progress' && renderComplaintList(['In Progress', 'Worker Resolved'], (c) => (
                                c.status === 'Worker Resolved' ? (
                                    <>
                                        <button className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '0.8rem', color: '#dc2626' }} onClick={() => updateStatus(c.complaint_id, 'In Progress')}>Reject Proof</button>
                                        <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem', backgroundColor: '#16a34a' }} onClick={() => updateStatus(c.complaint_id, 'Resolved')}>Approve & Mark as Resolved</button>
                                    </>
                                ) : (
                                    <span style={{ padding: '8px 16px', fontSize: '0.8rem', color: '#6b7280' }}>Worker is currently working</span>
                                )
                            ))}

                            {activeTab === 'resolved' && renderComplaintList(['Resolved'], (c) => (
                                <></> // Just view details button from parent
                            ))}
                        </>
                    )}

                </main>
            </div>

            {renderModal()}
            {renderAssignModal()}

            <style>{`
        .th-style { padding: 12px 16px; color: #4b5563; font-size: 0.8rem; text-transform: uppercase; }
        .td-style { padding: 14px 16px; color: #4b5563; font-size: 0.85rem; }
      `}</style>
        </div>
    );
}

function StatCard({ title, value, icon, color, bg }) {
    return (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', lineHeight: 1.2 }}>{value}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', marginTop: '2px' }}>{title}</div>
            </div>
        </div>
    );
}

function SidebarItem({ icon, label, count, active, onClick }) {
    return (
        <div className={`sidebar-item ${active ? 'active' : ''}`} onClick={onClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: active ? '#2563eb' : '#4b5563', fontWeight: active ? 600 : 500, fontSize: '0.85rem' }}>
                {icon}
                {label}
            </div>
            {count !== undefined && count > 0 && (
                <span style={{ background: active ? '#bfdbfe' : '#e5e7eb', color: active ? '#1d4ed8' : '#4b5563', padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600 }}>
                    {count}
                </span>
            )}
        </div>
    );
}
