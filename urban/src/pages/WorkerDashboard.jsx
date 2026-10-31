import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase,
    LayoutDashboard,
    UserCheck,
    Clock,
    CheckCircle,
    LogOut,
    MapPin,
    Camera,
    Search
} from 'lucide-react';
import { DUMMY_COMPLAINTS } from '../dummyData';

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

export default function WorkerDashboard() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [uploading, setUploading] = useState(false);

    const workerName = localStorage.getItem('workerName');
    const workerPhone = localStorage.getItem('workerPhone');

    useEffect(() => {
        if (!workerName || !workerPhone) { navigate('/login'); return; }
        fetchTasks();
    }, [navigate, workerName, workerPhone]);

    const fetchTasks = () => {
        setLoading(true);
        // Load dummy tasks — show all non-pending complaints as worker tasks
        const workerTasks = DUMMY_COMPLAINTS.filter(c =>
            ['Assigned', 'In Progress', 'Worker Resolved', 'Resolved'].includes(c.status)
        );
        setTimeout(() => {
            setTasks(workerTasks);
            setLoading(false);
        }, 400);
    };

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };

    const handleStartWork = (id) => {
        // Update local state only — no backend
        setTasks(prev => prev.map(t =>
            t.complaint_id === id ? { ...t, status: 'In Progress' } : t
        ));
        alert('Work started! Status moved to In Progress.');
        setSelectedComplaint(prev => prev ? { ...prev, status: 'In Progress' } : null);
    };

    const handleResolve = async (id, fileInput) => {
        const file = fileInput.files?.[0];
        if (!file) { alert('Please select a photo proof first.'); return; }
        setUploading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            // Update local state only — no backend
            setTasks(prev => prev.map(t =>
                t.complaint_id === id ? { ...t, status: 'Worker Resolved', proof_photo: reader.result } : t
            ));
            alert('Task marked as resolved with proof!');
            setSelectedComplaint(prev => prev ? { ...prev, status: 'Worker Resolved', proof_photo: reader.result } : null);
            setUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const filteredTasks = tasks.filter(t =>
        t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.complaint_id.toString().includes(searchTerm) ||
        t.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStats = () => ({
        total: tasks.length,
        assigned: tasks.filter(t => t.status === 'Assigned').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        resolved: tasks.filter(t => t.status === 'Resolved' || t.status === 'Worker Resolved').length,
    });

    const stats = getStats();

    const renderBadge = (config) => (
        <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: config.bg, color: config.color }}>
            {config.label || config.value}
        </span>
    );

    const closeModal = () => setSelectedComplaint(null);

    const renderModal = () => {
        if (!selectedComplaint) return null;
        const c = selectedComplaint;
        return (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="modal-box" style={{ background: 'white', padding: '28px 24px', borderRadius: '12px', maxWidth: '600px', width: '92vw', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                    <button onClick={closeModal} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#1f2937', paddingRight: '32px' }}>#{c.complaint_id} — {c.title || c.category || 'Task'}</h3>
                    <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {renderBadge({ ...STATUS_COLORS[c.status] || STATUS_COLORS['Pending'], value: c.status })}
                        {renderBadge({ ...PRIORITY_COLORS[c.priority] || PRIORITY_COLORS.medium, value: c.priority })}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                        <div><p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>Assigned Date</p><p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{new Date(c.created_at).toLocaleDateString()}</p></div>
                        <div><p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>Category</p><p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{c.category || '—'}</p></div>
                        <div><p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>Deadline</p><p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{c.expected_to_date ? new Date(c.expected_to_date).toLocaleDateString() : 'N/A'}</p></div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '8px' }}>Description</p>
                        <p style={{ color: '#4b5563', lineHeight: 1.6, background: '#f9fafb', padding: '14px', borderRadius: '8px', fontSize: '0.88rem' }}>{c.description}</p>
                    </div>

                    <div style={{ background: '#f9fafb', padding: '14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.88rem' }}>
                        <p><strong>Area:</strong> {c.area || '—'}</p>
                        <p><strong>Ward:</strong> {c.ward || '—'}</p>
                        <p><strong>Address:</strong> {c.location || '—'}</p>
                        {(c.latitude || c.longitude) && (
                            <p style={{ marginTop: '6px', color: '#2563eb', fontSize: '0.85rem' }}>
                                <MapPin size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                                {c.latitude}, {c.longitude}
                            </p>
                        )}
                    </div>

                    {c.status === 'Assigned' && (
                        <div style={{ padding: '18px', backgroundColor: '#fdf4ff', border: '1px solid #fbcfe8', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#831843' }}>Ready to Start?</h4>
                                <p style={{ margin: 0, fontSize: '0.82rem', color: '#9d174d' }}>Acknowledge this assignment and begin working.</p>
                            </div>
                            <button className="btn btn-primary" onClick={() => handleStartWork(c.complaint_id)} style={{ backgroundColor: '#c026d3', border: 'none', minHeight: '42px' }}>
                                Start Work
                            </button>
                        </div>
                    )}

                    {c.status === 'In Progress' && (
                        <div style={{ padding: '18px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#1f2937' }}>Upload Proof of Work</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    id={`proof-${c.complaint_id}`}
                                    style={{ flex: '1 1 180px', padding: '8px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                />
                                <button
                                    className="btn btn-primary"
                                    disabled={uploading}
                                    onClick={(e) => { e.preventDefault(); handleResolve(c.complaint_id, document.getElementById(`proof-${c.complaint_id}`)); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#10b981', border: 'none', minHeight: '42px' }}
                                >
                                    <Camera size={16} />
                                    {uploading ? 'Uploading...' : 'Submit Resolution'}
                                </button>
                            </div>
                        </div>
                    )}

                    {(c.status === 'Resolved' || c.status === 'Worker Resolved') && c.proof_photo && (
                        <div style={{ padding: '18px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                            <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 600, color: '#065f46' }}>
                                <CheckCircle size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                                Task Completed Successfully
                            </p>
                            <img src={c.proof_photo} alt="Work Proof" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderTaskList = (statusFilter) => {
        const list = filteredTasks.filter(c => statusFilter.includes(c.status));
        if (list.length === 0) return <p style={{ color: '#6b7280', padding: '20px' }}>No tasks found in this section.</p>;
        return (
            <div className="form-section">
                {/* Desktop Table */}
                <table className="desktop-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                            <th className="th-style">ID</th>
                            <th className="th-style">Category</th>
                            <th className="th-style">Area</th>
                            <th className="th-style">Date</th>
                            <th className="th-style">Status</th>
                            <th className="th-style" style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map(req => (
                            <tr key={req.complaint_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td className="td-style">#{req.complaint_id}</td>
                                <td className="td-style">{req.category || '—'}</td>
                                <td className="td-style">{req.area || '—'}</td>
                                <td className="td-style">{new Date(req.created_at).toLocaleDateString()}</td>
                                <td className="td-style">{renderBadge({ ...STATUS_COLORS[req.status] || STATUS_COLORS['Pending'], value: req.status })}</td>
                                <td className="td-style" style={{ textAlign: 'right' }}>
                                    <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#10b981', border: 'none' }} onClick={() => setSelectedComplaint(req)}>View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Mobile Cards */}
                <div className="mobile-card-list">
                    {list.map(req => (
                        <div key={req.complaint_id} className="mobile-card">
                            <div className="mobile-card-header">
                                <span className="mobile-card-id">#{req.complaint_id}</span>
                                {renderBadge({ ...STATUS_COLORS[req.status] || STATUS_COLORS['Pending'], value: req.status })}
                            </div>
                            <div className="mobile-card-title">{req.category || '—'}</div>
                            <div className="mobile-card-row">
                                <span>📍 {req.area || '—'}</span>
                                <span>🗓 {new Date(req.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="mobile-card-actions">
                                <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem', backgroundColor: '#10b981', border: 'none' }} onClick={() => setSelectedComplaint(req)}>View Details</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const tabs = [
        { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
        { id: 'assigned', label: 'Assigned', icon: <UserCheck size={20} />, badge: stats.assigned },
        { id: 'in-progress', label: 'Progress', icon: <Clock size={20} />, badge: stats.inProgress },
        { id: 'resolved', label: 'Resolved', icon: <CheckCircle size={20} /> },
    ];

    return (
        <div className="app-layout has-mobile-tab-bar">
            {/* Worker Navbar */}
            <nav className="navbar" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
                <div className="navbar-brand">
                    <div className="navbar-brand-icon" style={{ background: 'rgba(255,255,255,0.1)', color: '#10b981' }}>
                        <Briefcase size={20} />
                    </div>
                    <div className="navbar-brand-text">
                        <h1>Worker Portal</h1>
                        <span>Urban Drainage Network</span>
                    </div>
                </div>

                <div className="navbar-links navbar-search-inline" style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={16} color="#9ca3af" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', width: '200px', outline: 'none' }}
                    />
                </div>

                <div className="navbar-user">
                    <div className="navbar-user-info navbar-user-info--desktop">
                        <div className="name">{workerName}</div>
                        <div className="role">Field Worker</div>
                    </div>
                    <div className="navbar-avatar" style={{ border: '2px solid #10b981', color: '#10b981' }}>{workerName?.charAt(0)}</div>
                    <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '8px', color: '#9ca3af' }}>
                        <LogOut size={18} />
                    </button>
                </div>
            </nav>

            <div className="app-body">
                {/* Desktop Sidebar */}
                <aside className="sidebar">
                    <div className="sidebar-section-label" style={{ marginTop: '10px' }}>TASKS</div>
                    {tabs.map(t => (
                        <SidebarItem key={t.id} icon={t.icon} label={t.label} count={t.badge} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} />
                    ))}
                </aside>

                <main className="main-content" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                    {/* Mobile search */}
                    <div style={{ position: 'relative', marginBottom: '16px', display: 'none' }} className="mobile-search-field">
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.85rem', outline: 'none' }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <h2 className="page-title">
                            {activeTab === 'dashboard' && 'Worker Dashboard'}
                            {activeTab === 'assigned' && 'Assigned Tasks'}
                            {activeTab === 'in-progress' && 'In Progress Tasks'}
                            {activeTab === 'resolved' && 'Completed Tasks'}
                        </h2>
                        <p className="page-subtitle" style={{ marginBottom: 0 }}>
                            {activeTab === 'dashboard' ? 'Overview of your assigned drainage issues.' : 'Manage your tasks and submit proof of resolution.'}
                        </p>
                    </div>

                    {loading ? (
                        <p style={{ color: '#6b7280' }}>Loading your tasks...</p>
                    ) : (
                        <>
                            {activeTab === 'dashboard' && (
                                <div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                                        <StatCard title="Total" value={stats.total} icon={<LayoutDashboard size={22} />} color="#38bdf8" bg="#f0f9ff" />
                                        <StatCard title="Assigned" value={stats.assigned} icon={<UserCheck size={22} />} color="#c026d3" bg="#fdf4ff" />
                                        <StatCard title="In Progress" value={stats.inProgress} icon={<Clock size={22} />} color="#ea580c" bg="#fff7ed" />
                                        <StatCard title="Resolved" value={stats.resolved} icon={<CheckCircle size={22} />} color="#16a34a" bg="#f0fdf4" />
                                    </div>
                                    <h3 style={{ marginBottom: '14px', fontSize: '1.05rem' }}>All Active Tasks</h3>
                                    {renderTaskList(['Assigned', 'In Progress'])}
                                </div>
                            )}
                            {activeTab === 'assigned' && renderTaskList(['Assigned'])}
                            {activeTab === 'in-progress' && renderTaskList(['In Progress'])}
                            {activeTab === 'resolved' && renderTaskList(['Worker Resolved', 'Resolved'])}
                        </>
                    )}
                </main>
            </div>

            {/* Mobile Bottom Tab Bar */}
            <div className="mobile-tab-bar">
                <div className="mobile-tab-bar-inner">
                    {tabs.map(t => (
                        <button key={t.id} className={`mobile-tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                            {t.badge > 0 && <span className="mobile-tab-badge">{t.badge}</span>}
                            {t.icon}
                            <span>{t.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {renderModal()}

            <style>{`
                .th-style { padding: 12px 16px; color: #4b5563; font-size: 0.8rem; text-transform: uppercase; }
                .td-style { padding: 14px 16px; color: #4b5563; font-size: 0.85rem; }
                @media (max-width: 768px) {
                    .mobile-search-field { display: block !important; }
                }
            `}</style>
        </div>
    );
}

function StatCard({ title, value, icon, color, bg }) {
    return (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1f2937', lineHeight: 1.2 }}>{value}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', marginTop: '2px' }}>{title}</div>
            </div>
        </div>
    );
}

function SidebarItem({ icon, label, count, active, onClick }) {
    return (
        <div className={`sidebar-item ${active ? 'active' : ''}`} onClick={onClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '12px 16px', borderRadius: '8px', margin: '4px 8px' }}>
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
