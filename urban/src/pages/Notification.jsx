import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import { CheckCircle, Bell, MapPin, Calendar, Tag } from 'lucide-react';
import { DUMMY_COMPLAINTS } from '../dummyData';

export default function Notification() {
    const [resolved, setResolved] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewImg, setPreviewImg] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            // Filter only resolved complaints from dummy data
            setResolved(DUMMY_COMPLAINTS.filter(c => c.status === 'Resolved'));
            setLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, []);

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <div className="app-layout">
            <Navbar />
            <div className="app-body">
                <main className="main-content" style={{ maxWidth: '860px', margin: '0 auto' }}>
                    <h2 className="page-title">Notifications</h2>
                    <p className="page-subtitle">Resolved complaints — your issues have been fixed!</p>

                    {loading ? (
                        <div className="form-section" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                            Loading notifications...
                        </div>
                    ) : resolved.length === 0 ? (
                        <div className="form-section" style={{ padding: '56px', textAlign: 'center' }}>
                            <Bell size={44} style={{ margin: '0 auto 16px', display: 'block', color: '#d1d5db' }} />
                            <p style={{ fontWeight: 600, color: '#374151', fontSize: '1.05rem' }}>No resolved complaints yet</p>
                            <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: '6px' }}>
                                Once your complaints are resolved by the admin, they will appear here.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            {resolved.map(c => (
                                <div
                                    key={c.complaint_id}
                                    className="form-section"
                                    style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', borderLeft: '4px solid #16a34a', padding: '16px 18px' }}
                                >
                                    {/* Green check icon */}
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        backgroundColor: '#f0fdf4', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                    }}>
                                        <CheckCircle size={20} color="#16a34a" />
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px' }}>
                                            <div>
                                                <span style={{
                                                    display: 'inline-block', padding: '2px 10px', borderRadius: '999px',
                                                    fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#f0fdf4',
                                                    color: '#16a34a', marginBottom: '6px'
                                                }}>
                                                    ✓ RESOLVED
                                                </span>
                                                <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#111827', fontWeight: 600 }}>
                                                    #{c.complaint_id} — {c.title || c.category || 'Complaint'}
                                                </h4>
                                            </div>
                                            <span style={{ fontSize: '0.8rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                                                <Calendar size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                                                {formatDate(c.created_at)}
                                            </span>
                                        </div>

                                        <p style={{ margin: '8px 0 10px', fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.55 }}>
                                            {c.description || 'No description provided.'}
                                        </p>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem', color: '#6b7280' }}>
                                            {(c.area || c.location) && (
                                                <span>
                                                    <MapPin size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom', color: '#60a5fa' }} />
                                                    {c.area || c.location}
                                                </span>
                                            )}
                                            {c.category && (
                                                <span>
                                                    <Tag size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom', color: '#a78bfa' }} />
                                                    {c.category}
                                                </span>
                                            )}
                                            {c.priority && (
                                                <span style={{ textTransform: 'capitalize' }}>
                                                    Priority: <strong>{c.priority}</strong>
                                                </span>
                                            )}
                                        </div>

                                        {/* Proof photo thumbnail */}
                                        {c.proof_photo && (
                                            <div style={{ marginTop: '12px' }}>
                                                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                                                    📷 Proof of Resolution:
                                                </p>
                                                <img
                                                    src={c.proof_photo}
                                                    alt="Proof of resolution"
                                                    onClick={() => setPreviewImg(c.proof_photo)}
                                                    style={{
                                                        width: '80px', height: '60px', objectFit: 'cover',
                                                        borderRadius: '6px', border: '1px solid #d1d5db',
                                                        cursor: 'pointer', transition: 'opacity 0.2s'
                                                    }}
                                                    title="Click to view full image"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Lightbox preview modal */}
            {previewImg && (
                <div
                    onClick={() => setPreviewImg(null)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', zIndex: 2000, cursor: 'zoom-out'
                    }}
                >
                    <img
                        src={previewImg}
                        alt="Proof fullscreen"
                        style={{ maxWidth: '92vw', maxHeight: '88vh', borderRadius: '10px', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}
                        onClick={e => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setPreviewImg(null)}
                        style={{
                            position: 'absolute', top: '20px', right: '24px',
                            background: 'rgba(255,255,255,0.15)', border: 'none',
                            color: '#fff', fontSize: '26px', lineHeight: 1,
                            borderRadius: '50%', width: '40px', height: '40px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >×</button>
                </div>
            )}
        </div>
    );
}
