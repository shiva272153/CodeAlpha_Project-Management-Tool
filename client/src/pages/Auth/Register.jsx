import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        avatar: ''
    });
    const [error, setError] = useState(''); // Keep error state
    const { register } = useAuth();
    const navigate = useNavigate();

    const { name, email, password, avatar } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Predefined Avatars (DiceBear)
    const avatars = [
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Zack",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Midnight",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Lily"
    ];

    const onSubmit = async e => {
        e.preventDefault();

        // Default avatar if none selected (pick random or first)
        const finalAvatar = avatar || avatars[0];

        try {
            await register({ name, email, password, avatar: finalAvatar });
            navigate('/dashboard');
        } catch (err) {
            // Use setError for displaying to the user
            setError(err.message || 'Registration failed');
            console.error(err); // Keep console.error for debugging
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
            <div className="auth-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem', fontWeight: 700 }}>
                    Create Account
                </h2>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit}>
                    <div className="input-field" style={{ marginBottom: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Full Name"
                            name="name"
                            value={name}
                            onChange={onChange}
                            required
                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', outline: 'none' }}
                        />
                    </div>
                    <div className="input-field" style={{ marginBottom: '1rem' }}>
                        <input
                            type="email"
                            placeholder="Email Address"
                            name="email"
                            value={email}
                            onChange={onChange}
                            required
                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', outline: 'none' }}
                        />
                    </div>
                    <div className="input-field" style={{ marginBottom: '1.5rem' }}>
                        <input
                            type="password"
                            placeholder="Password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            required
                            minLength="6"
                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', outline: 'none' }}
                        />
                    </div>

                    {/* Avatar Selection */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Choose an Avatar:</label>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                            {avatars.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt="Avatar"
                                    onClick={() => setFormData({ ...formData, avatar: img })}
                                    style={{
                                        width: '45px',
                                        height: '45px',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        border: avatar === img ? '3px solid var(--accent-primary)' : '3px solid transparent',
                                        background: '#1e293b',
                                        transition: 'all 0.2s'
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }}>
                        Sign Up
                    </button>
                </form>
                <p className="mt-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" className="text-accent">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
