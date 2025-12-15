import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Navigation */}
            <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="title-gradient" style={{ fontSize: '1.5rem' }}>CodeAlpha PM</h1>
                <div>
                    <Link to="/login" className="btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '2rem' }}>
                        Login to Workspace
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 1rem' }}>
                <div style={{ maxWidth: '800px', animation: 'slideUp 0.8s ease-out' }}>
                    <h1 className="title-gradient" style={{ fontSize: '4rem', lineHeight: '1.1', marginBottom: '1.5rem' }}>
                        Manage Projects with <br />
                        <span style={{ color: 'var(--text-primary)', WebkitTextFillColor: 'initial', background: 'none' }}>Unmatched Style.</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                        The collaborative tool that appreciates your workflow. Organize tasks, collaborate in real-time, and experience a premium interface designed for modern teams.
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                        <Link to="/register" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                            Get Started for Free
                        </Link>
                        <Link to="/login" className="btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '0.75rem' }}>
                            Existing User
                        </Link>
                    </div>
                </div>

                {/* Feature Teaser (Glass Cards) */}
                <div className="projects-grid" style={{ marginTop: '5rem', width: '100%', maxWidth: '1000px', animation: 'slideUp 0.8s ease-out 0.2s backwards' }}>
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚀</div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Fast & Fluid</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Drag and drop interfaces that feel smooth and responsive.</p>
                    </div>
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✨</div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Premium Design</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Glassmorphism styling that makes work a visual pleasure.</p>
                    </div>
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤝</div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Collaborative</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Work together with your team in real-time sync.</p>
                    </div>
                </div>
            </main>

            <footer style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                &copy; {new Date().getFullYear()} CodeAlpha Project Management. Crafted with precision.
            </footer>
        </div>
    );
};

export default Home;
