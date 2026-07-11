import Navbar from '../components/Navbar';

export default function ContactUs() {
    return (
        <div className="app-layout">
            <Navbar />
            <div className="app-body">
                <main className="main-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 className="page-title">Contact Us</h2>
                    <p className="page-subtitle">Get in touch with support</p>
                    <div className="form-section">
                        <p>If you have any issues, please reach out to our support team at support@urbandrainage.gov.in.</p>
                    </div>
                </main>
            </div>
        </div>
    );
}
