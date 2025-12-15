import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import CreateProjectModal from '../components/CreateProjectModal';

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const { token, logout, user } = useAuth();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <header style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem',
                paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)'
            }}>
                <div>
                    <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Workspace</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user?.name}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <span style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>+</span> New Project
                    </button>
                    <button className="btn btn-secondary" onClick={logout}>Sign Out</button>
                </div>
            </header>

            <div className="projects-grid">
                {projects.map((project, index) => (
                    <Link
                        key={project.id}
                        to={`/project/${project.id}`}
                        style={{ display: 'block', animation: `slideUp 0.5s ease-out ${index * 0.1}s backwards` }}
                    >
                        <div className="card glass-card project-card">
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{project.title}</h3>
                                    <span className="badge" style={{ color: 'var(--accent-secondary)', background: 'rgba(139, 92, 246, 0.1)' }}>Active</span>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                                    {project.description || 'No description provided.'}
                                </p>
                            </div>
                            <div style={{
                                marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)'
                            }}>
                                <span>Last updated</span>
                                <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {projects.length === 0 && (
                <div className="text-center" style={{ marginTop: '5rem', padding: '3rem', border: '1px dashed var(--border-color)', borderRadius: '1rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>No projects found</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Get started by creating your first project workspace.</p>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create Project</button>
                </div>
            )}

            {showModal && (
                <CreateProjectModal
                    onClose={() => setShowModal(false)}
                    onProjectCreated={(newProject) => {
                        setProjects([newProject, ...projects]);
                    }}
                />
            )}
        </div>
    );
};

export default Dashboard;
