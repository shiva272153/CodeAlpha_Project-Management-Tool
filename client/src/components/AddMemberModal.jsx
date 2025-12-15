import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AddMemberModal = ({ onClose, projectId }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { token } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const res = await fetch(`/api/projects/${projectId}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Member added successfully!');
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setError(data.message || 'Failed to add member');
            }
        } catch (error) {
            console.error(error);
            setError('Server error');
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
            <div className="card glass-card" style={{ width: '100%', maxWidth: '400px', animation: 'slideUp 0.3s ease-out' }}>
                <h3 className="title-gradient" style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Add Team Member</h3>
                <form onSubmit={handleSubmit}>

                    {message && <div style={{ marginBottom: '1rem', color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>{message}</div>}
                    {error && <div style={{ marginBottom: '1rem', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>{error}</div>}

                    <div className="input-group">
                        <label className="input-label">User Email</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="colleague@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button type="button" className="btn-secondary" onClick={onClose} style={{ padding: '0.6rem 1.25rem' }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.6rem 2rem' }}>
                            Add
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMemberModal;
