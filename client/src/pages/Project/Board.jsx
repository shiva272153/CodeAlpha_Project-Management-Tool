import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import CreateTaskModal from '../../components/CreateTaskModal';
import AddMemberModal from '../../components/AddMemberModal';

const Board = () => {
    const { id } = useParams();
    const { token, user } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [activeColumnId, setActiveColumnId] = useState(null);

    // For optimistic UI updates
    const [columns, setColumns] = useState({});
    const [columnOrder, setColumnOrder] = useState([]);

    useEffect(() => {
        fetchProject();
    }, [id]);

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/projects/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProject(data);

                const cols = {};
                const order = [];

                data.columns.forEach(col => {
                    cols[col.id] = { ...col, taskIds: col.tasks.map(t => t.id) };
                    order.push(col.id);
                });

                setColumns(cols);
                setColumnOrder(order);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const start = columns[source.droppableId];
        const finish = columns[destination.droppableId];

        // Moving within same column
        if (start === finish) {
            const newTasks = Array.from(start.tasks);
            const movedTask = newTasks[source.index];
            newTasks.splice(source.index, 1);
            newTasks.splice(destination.index, 0, movedTask);

            const newColumn = {
                ...start,
                tasks: newTasks,
            };

            setColumns({
                ...columns,
                [newColumn.id]: newColumn,
            });

            return;
        }

        // Moving from one column to another
        const startTasks = Array.from(start.tasks);
        const movedTask = startTasks[source.index];
        startTasks.splice(source.index, 1);

        const newStart = {
            ...start,
            tasks: startTasks,
        };

        const finishTasks = Array.from(finish.tasks);
        finishTasks.splice(destination.index, 0, movedTask);

        const newFinish = {
            ...finish,
            tasks: finishTasks,
        };

        setColumns({
            ...columns,
            [newStart.id]: newStart,
            [newFinish.id]: newFinish,
        });

        try {
            await fetch(`/api/tasks/${draggableId}/move`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    destinationColumnId: finish.id,
                    newOrder: destination.index
                })
            });
        } catch (error) {
            console.error("Failed to move task", error);
        }
    };

    const handleAddTaskClick = (columnId) => {
        setActiveColumnId(columnId);
        setShowTaskModal(true);
    };

    const handleTaskCreated = (newTask) => {
        const columnId = newTask.columnId;
        const column = columns[columnId];

        const newColumn = {
            ...column,
            tasks: [...column.tasks, newTask]
        };

        setColumns({
            ...columns,
            [columnId]: newColumn
        });
    };

    const handleManualMoveTask = async (task, sourceColumnId, destColumnId) => {
        if (sourceColumnId === destColumnId) return;

        // Optimistic Update
        const startColumn = columns[sourceColumnId];
        const finishColumn = columns[destColumnId];

        // Remove from start
        const startTasks = startColumn.tasks.filter(t => t.id !== task.id);
        const newStart = { ...startColumn, tasks: startTasks };

        // Add to finish (at end)
        const finishTasks = [...finishColumn.tasks, { ...task, columnId: destColumnId }];
        const newFinish = { ...finishColumn, tasks: finishTasks };

        setColumns({
            ...columns,
            [sourceColumnId]: newStart,
            [destColumnId]: newFinish
        });

        // API Call
        try {
            await fetch(`/api/tasks/${task.id}/move`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    destinationColumnId: destColumnId,
                    newOrder: finishTasks.length - 1 // Append to end
                })
            });
        } catch (error) {
            console.error("Failed to move task manually", error);
            // Revert on error would go here in a robust app
        }
    };

    const handleRemoveMember = async (memberUserId) => {
        if (!confirm('Are you sure you want to remove this member?')) return;
        try {
            const res = await fetch(`/api/projects/${id}/members/${memberUserId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                // Manually remove member from local state to preserve other project data (like columns/tasks)
                setProject(prev => ({
                    ...prev,
                    members: prev.members.filter(m => m.id !== memberUserId)
                }));
            } else {
                alert('Failed to remove member');
            }
        } catch (error) {
            console.error(error);
            alert('Server error');
        }
    };

    if (loading) return <div className="text-center" style={{ marginTop: '5rem' }}>Loading Workspace...</div>;
    if (!project) return <div className="text-center">Project not found</div>;

    const isOwner = project.owner.id === user?.id;

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header (Simplified) */}
            <header style={{
                padding: '1rem 2rem',
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to="/dashboard" className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
                        ←
                    </Link>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{project.title}</h2>
                </div>
            </header>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* Left Side: Kanban Board */}
                <div style={{ flex: 1, overflowX: 'auto', padding: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                    <DragDropContext onDragEnd={onDragEnd}>
                        {columnOrder.map(columnId => {
                            const column = columns[columnId];
                            return (
                                <div key={column.id} style={{ minWidth: '300px', maxWidth: '300px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{ padding: '0.5rem 0.25rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4 style={{ fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                                            {column.title} <span style={{ marginLeft: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{column.tasks.length}</span>
                                        </h4>
                                    </div>

                                    <Droppable droppableId={column.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                style={{
                                                    background: snapshot.isDraggingOver ? 'rgba(30, 41, 59, 0.6)' : 'rgba(30, 41, 59, 0.3)',
                                                    padding: '0.75rem',
                                                    borderRadius: '1rem',
                                                    flex: 1,
                                                    transition: 'background 0.2s',
                                                    border: '1px solid var(--border-glass)'
                                                }}
                                            >
                                                {column.tasks.map((task, index) => (
                                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="glass-card"
                                                                style={{
                                                                    padding: '1rem',
                                                                    marginBottom: '0.75rem',
                                                                    backgroundColor: snapshot.isDragging ? 'rgba(79, 70, 229, 0.1)' : 'rgba(30, 41, 59, 0.8)',
                                                                    border: snapshot.isDragging ? '1px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                                                                    boxShadow: snapshot.isDragging ? '0 10px 20px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
                                                                    ...provided.draggableProps.style
                                                                }}
                                                            >
                                                                <div style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                                                                    {task.title}
                                                                </div>
                                                                {task.dueDate && (
                                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                                        <span>📅</span>
                                                                        {new Date(task.dueDate).toLocaleDateString()}
                                                                    </div>
                                                                )}
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                                                    {task.priority && (
                                                                        <span style={{
                                                                            fontSize: '0.7rem', padding: '0.1rem 0.5rem', borderRadius: '4px',
                                                                            background: task.priority === 'high' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                                                            color: task.priority === 'high' ? '#fca5a5' : '#86efac',
                                                                            textTransform: 'capitalize'
                                                                        }}>
                                                                            {task.priority}
                                                                        </span>
                                                                    )}

                                                                    {/* Status Dropdown */}
                                                                    <select
                                                                        value={column.id}
                                                                        onChange={(e) => handleManualMoveTask(task, column.id, e.target.value)}
                                                                        onClick={(e) => e.stopPropagation()} // Prevent drag conflict
                                                                        style={{
                                                                            background: 'rgba(255, 255, 255, 0.05)',
                                                                            border: '1px solid var(--border-glass)',
                                                                            color: 'var(--text-secondary)',
                                                                            fontSize: '0.75rem',
                                                                            padding: '0.1rem 0.4rem',
                                                                            borderRadius: '4px',
                                                                            cursor: 'pointer',
                                                                            outline: 'none',
                                                                            maxWidth: '100px'
                                                                        }}
                                                                    >
                                                                        {columnOrder.map(colId => {
                                                                            const col = columns[colId];
                                                                            return (
                                                                                <option
                                                                                    key={colId}
                                                                                    value={colId}
                                                                                    style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}
                                                                                >
                                                                                    {col.title}
                                                                                </option>
                                                                            );
                                                                        })}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                                <button
                                                    onClick={() => handleAddTaskClick(column.id)}
                                                    style={{
                                                        width: '100%', marginTop: '0.5rem', padding: '0.5rem',
                                                        border: '1px dashed var(--border-color)', borderRadius: '0.5rem',
                                                        background: 'transparent', color: 'var(--text-secondary)',
                                                        fontSize: '0.9rem', cursor: 'pointer'
                                                    }}
                                                >
                                                    + Add Task
                                                </button>
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            );
                        })}
                    </DragDropContext>
                </div>

                {/* Right Side: Members Sidebar */}
                <div style={{
                    width: '300px',
                    background: 'var(--bg-secondary)',
                    borderLeft: '1px solid var(--border-color)',
                    padding: '1.5rem',
                    display: 'flex', flexDirection: 'column',
                    overflowY: 'auto'
                }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        👥 Team Members
                    </h3>

                    {/* Owner */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                            Project Owner
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
                            {project.owner.avatar ? (
                                <img src={project.owner.avatar} alt={project.owner.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 600 }}>
                                    {project.owner.name.charAt(0)}
                                </div>
                            )}
                            <div style={{ overflow: 'hidden' }}>
                                <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.owner.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.owner.email}</div>
                            </div>
                        </div>
                    </div>

                    {/* Members */}
                    <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                            Members ({project.members ? project.members.length : 0})
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {project.members && project.members.map(member => (
                                <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                                        {member.avatar ? (
                                            <img src={member.avatar} alt={member.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                        ) : (
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>
                                                {member.name.charAt(0)}
                                            </div>
                                        )}
                                        <div style={{ overflow: 'hidden' }}>
                                            <div style={{ fontSize: '0.95rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.email}</div>
                                        </div>
                                    </div>
                                    {isOwner && (
                                        <button
                                            onClick={() => handleRemoveMember(member.id)}
                                            style={{
                                                background: 'transparent', border: 'none', color: '#ef4444',
                                                cursor: 'pointer', padding: '0.25rem', opacity: 0.7
                                            }}
                                            title="Remove Member"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            {(!project.members || project.members.length === 0) && (
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                    No members yet.
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowMemberModal(true)}
                            className="btn-primary"
                            style={{ width: '100%', marginTop: '1.5rem', fontSize: '0.9rem', padding: '0.6rem' }}
                        >
                            + Add New Member
                        </button>
                    </div>
                </div>

            </div>

            {showTaskModal && (
                <CreateTaskModal
                    columnId={activeColumnId}
                    projectId={id}
                    onClose={() => setShowTaskModal(false)}
                    onTaskCreated={handleTaskCreated}
                />
            )}

            {showMemberModal && (
                <AddMemberModal
                    projectId={id}
                    onClose={() => setShowMemberModal(false)}
                />
            )}
        </div>
    );
};

export default Board;
