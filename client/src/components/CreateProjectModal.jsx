import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const CreateProjectModal = ({ onClose, onProjectCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const { token } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, description })
            });

            if (res.ok) {
                const project = await res.json();
                onProjectCreated(project);
                onClose();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '560px', // Slightly wider
                animation: 'slideUp 0.3s ease-out',
                backgroundColor: '#131b2c',
                border: '1px solid var(--border-color)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
                padding: '2.5rem' // More breathing room
            }}>
                <h3 className="title-gradient" style={{ marginBottom: '2rem', fontSize: '2rem' }}>New Project</h3>
                <form onSubmit={handleSubmit}>
                    <div className="input-group" style={{ marginBottom: '2rem' }}>
                        <label className="input-label" style={{ marginBottom: '0.75rem', fontSize: '1rem', color: '#94a3b8' }}>Project Title</label>
                        <input
                            className="input-field"
                            placeholder="e.g. Website Redesign"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            style={{ padding: '1rem 1.25rem', fontSize: '1.1rem' }}
                        />
                    </div>
                    <div className="input-group" style={{ marginBottom: '2.5rem' }}>
                        <label className="input-label" style={{ marginBottom: '0.75rem', fontSize: '1rem', color: '#94a3b8' }}>Description</label>
                        <textarea
                            className="input-field"
                            placeholder="Briefly describe your project goals..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="4"
                            style={{ resize: 'vertical', padding: '1rem 1.25rem', fontSize: '1.1rem', lineHeight: '1.6' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
                        <button type="button" className="btn-secondary" onClick={onClose} style={{ padding: '1rem 2rem', borderRadius: '0.75rem', fontSize: '1rem' }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: '600' }}>
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectModal;
