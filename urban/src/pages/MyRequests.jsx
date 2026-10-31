import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { DUMMY_COMPLAINTS } from '../dummyData';

const PRIORITY_COLORS = {
    low: { bg: '#f0fdf4', color: '#16a34a', label: 'Low' },
    medium: { bg: '#fefce8', color: '#ca8a04', label: 'Medium' },
    high: { bg: '#fff7ed', color: '#ea580c', label: 'High' },
    emergency: { bg: '#fef2f2', color: '#dc2626', label: '🚨 Emergency' },
};

const STATUS_COLORS = {
    'Pending': { bg: '#eff6ff', color: '#2563eb' },
    'In Progress': { bg: '#fff7ed', color: '#ea580c' },
    'Resolved': { bg: '#f0fdf4', color: '#16a34a' },
};

export default function MyRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate a brief loading delay, then load from dummy data
        const timer = setTimeout(() => {
            // Show all dummy complaints (demo mode — no user filter)
            setRequests(DUMMY_COMPLAINTS);
            setLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="app-layout">
            <Navbar />
            <div className="app-body">
                <main className="main-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 className="page-title">My Requests</h2>
                    <p className="page-subtitle">Track and manage your submitted drainage issues</p>

                    <div className="form-section">
                        {loading ? (
                            <p style={{ padding: '24px', color: '#6b7280' }}>Loading...</p>
                        ) : requests.length === 0 ? (
                            <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                                <FileText size={40} style={{ margin: '0 auto 12px', display: 'block' }} />
                                <p style={{ fontWeight: 500 }}>No complaints submitted yet.</p>
                                <p style={{ fontSize: '0.85rem' }}>Go to Dashboard and submit your first complaint.</p>
                            </div>
                        ) : (
                            <>
                                {/* ── Desktop Table ── */}
                                <table className="desktop-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                                            <th style={{ padding: '12px 16px', color: '#4b5563', fontSize: '0.8rem', textTransform: 'uppercase' }}>ID</th>
                                            <th style={{ padding: '12px 16px', color: '#4b5563', fontSize: '0.8rem', textTransform: 'uppercase' }}>Title</th>
                                            <th style={{ padding: '12px 16px', color: '#4b5563', fontSize: '0.8rem', textTransform: 'uppercase' }}>Category</th>
                                            <th style={{ padding: '12px 16px', color: '#4b5563', fontSize: '0.8rem', textTransform: 'uppercase' }}>Priority</th>
                                            <th style={{ padding: '12px 16px', color: '#4b5563', fontSize: '0.8rem', textTransform: 'uppercase' }}>Location</th>
                                            <th style={{ padding: '12px 16px', color: '#4b5563', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
                                            <th style={{ padding: '12px 16px', color: '#4b5563', fontSize: '0.8rem', textTransform: 'uppercase' }}>Date</th>
                                            <th style={{ padding: '12px 16px', color: '#4b5563', fontSize: '0.8rem', textTransform: 'uppercase' }}>Proof</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map((req) => {
                                            const priority = PRIORITY_COLORS[req.priority] || PRIORITY_COLORS.medium;
                                            const status = STATUS_COLORS[req.status] || STATUS_COLORS['Pending'];
                                            return (
                                                <tr key={req.complaint_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#6b7280' }}>#{req.complaint_id}</td>
                                                    <td style={{ padding: '14px 16px', fontWeight: '500', maxWidth: '180px' }}>
                                                        <span title={req.title} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {req.title || '—'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: '0.85rem' }}>{req.category || '—'}</td>
                                                    <td style={{ padding: '14px 16px' }}>
                                                        <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, backgroundColor: priority.bg, color: priority.color }}>
                                                            {priority.label}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: '0.85rem' }}>{req.area || req.location || '—'}</td>
                                                    <td style={{ padding: '14px 16px' }}>
                                                        <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, backgroundColor: status.bg, color: status.color }}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: '0.85rem' }}>
                                                        {new Date(req.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td style={{ padding: '14px 16px' }}>
                                                        {req.status === 'Resolved' && req.proof_photo ? (
                                                            <img
                                                                src={req.proof_photo}
                                                                alt="Resolution Proof"
                                                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: '1px solid #d1d5db' }}
                                                                title="Click to view full image"
                                                                onClick={() => { const w = window.open(""); w.document.write(`<img src="${req.proof_photo}" style="max-width: 100%;">`); }}
                                                            />
                                                        ) : (
                                                            <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {/* ── Mobile Card List ── */}
                                <div className="mobile-card-list">
                                    {requests.map((req) => {
                                        const priority = PRIORITY_COLORS[req.priority] || PRIORITY_COLORS.medium;
                                        const status = STATUS_COLORS[req.status] || STATUS_COLORS['Pending'];
                                        return (
                                            <div key={req.complaint_id} className="mobile-card">
                                                <div className="mobile-card-header">
                                                    <span className="mobile-card-id">#{req.complaint_id}</span>
                                                    <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: status.bg, color: status.color }}>
                                                        {req.status}
                                                    </span>
                                                </div>
                                                <div className="mobile-card-title">{req.title || '—'}</div>
                                                <div className="mobile-card-row">
                                                    <span>📁 {req.category || 'No category'}</span>
                                                    <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600, backgroundColor: priority.bg, color: priority.color }}>
                                                        {priority.label}
                                                    </span>
                                                </div>
                                                <div className="mobile-card-row">
                                                    <span>📍 {req.area || req.location || '—'}</span>
                                                    <span>🗓 {new Date(req.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                                {req.status === 'Resolved' && req.proof_photo && (
                                                    <div style={{ marginTop: '10px' }}>
                                                        <img
                                                            src={req.proof_photo}
                                                            alt="Proof"
                                                            style={{ width: '60px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer' }}
                                                            onClick={() => { const w = window.open(""); w.document.write(`<img src="${req.proof_photo}" style="max-width: 100%;">`); }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
