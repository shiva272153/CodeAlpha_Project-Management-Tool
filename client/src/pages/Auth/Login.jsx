import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-card">
                <h2 className="text-center title-gradient" style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Welcome Back</h2>
                <p className="text-center" style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Enter your credentials to access your workspace
                </p>

                {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary">Sign In</button>
                </form>
                <p className="mt-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                    Don't have an account? <Link to="/register" className="text-accent">Create account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
