import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const CreateTaskModal = ({ onClose, onTaskCreated, columnId, projectId }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [priority, setPriority] = useState('medium');
    const [dueDate, setDueDate] = useState('');
    const { token } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    content,
                    priority,
                    dueDate,
                    columnId,
                    projectId
                })
            });

            if (res.ok) {
                const task = await res.json();
                onTaskCreated(task);
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
                maxWidth: '560px',
                animation: 'slideUp 0.3s ease-out',
                backgroundColor: '#131b2c',
                border: '1px solid var(--border-color)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
                padding: '2.5rem'
            }}>
                <h3 className="title-gradient" style={{ marginBottom: '2rem', fontSize: '2rem' }}>Add New Task</h3>
                <form onSubmit={handleSubmit}>
                    <div className="input-group" style={{ marginBottom: '2rem' }}>
                        <label className="input-label" style={{ marginBottom: '0.75rem', fontSize: '1rem', color: '#94a3b8' }}>Task Title</label>
                        <input
                            className="input-field"
                            placeholder="What needs to be done?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            autoFocus
                            style={{ padding: '1rem 1.25rem', fontSize: '1.1rem' }}
                        />
                    </div>

                    <div className="input-group" style={{ marginBottom: '2rem' }}>
                        <label className="input-label" style={{ marginBottom: '0.75rem', fontSize: '1rem', color: '#94a3b8' }}>Description</label>
                        <textarea
                            className="input-field"
                            placeholder="Add details..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows="3"
                            style={{ resize: 'vertical', padding: '1rem 1.25rem', fontSize: '1.1rem', lineHeight: '1.6' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label" style={{ marginBottom: '0.75rem', fontSize: '1rem', color: '#94a3b8' }}>Priority</label>
                            <select
                                className="input-field"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                style={{ padding: '1rem 1.25rem', fontSize: '1.1rem', cursor: 'pointer' }}
                            >
                                <option value="low" style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}>Low</option>
                                <option value="medium" style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}>Medium</option>
                                <option value="high" style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}>High</option>
                            </select>
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label" style={{ marginBottom: '0.75rem', fontSize: '1rem', color: '#94a3b8' }}>Due Date</label>
                            <input
                                type="date"
                                className="input-field"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                style={{ padding: '1rem 1.25rem', fontSize: '1.1rem', cursor: 'pointer' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
                        <button type="button" className="btn-secondary" onClick={onClose} style={{ padding: '1rem 2rem', borderRadius: '0.75rem', fontSize: '1rem' }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: '600' }}>
                            Add Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;
