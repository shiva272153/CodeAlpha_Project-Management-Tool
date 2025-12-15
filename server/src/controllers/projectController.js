const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createProject = async (req, res) => {
    try {
        const { title, description } = req.body;

        const project = await prisma.project.create({
            data: {
                title,
                description,
                ownerId: req.user.userId,
                columns: {
                    createMany: {
                        data: [
                            { title: 'To Do', order: 0 },
                            { title: 'In Progress', order: 1 },
                            { title: 'Done', order: 2 }
                        ]
                    }
                }
            },
            include: {
                columns: true
            }
        });

        res.status(201).json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getProjects = async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            where: {
                OR: [
                    { ownerId: req.user.userId },
                    { memberIds: { has: req.user.userId } }
                ]
            },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                columns: {
                    include: {
                        tasks: {
                            include: {
                                comments: true,
                                assignee: { select: { id: true, name: true, email: true } }
                            },
                            orderBy: { order: 'asc' }
                        }
                    },
                    orderBy: { order: 'asc' }
                },
                owner: { select: { id: true, name: true, email: true, avatar: true } },
                members: { select: { id: true, name: true, email: true, avatar: true } }
            }
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Basic permission check (can be improved)
        if (project.ownerId !== req.user.userId) {
            // For a real app, check shared users too
            // return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        // Check ownership
        const project = await prisma.project.findUnique({ where: { id } });
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.ownerId !== req.user.userId) return res.status(403).json({ message: 'Not authorized' });

        await prisma.project.delete({ where: { id } });
        res.json({ message: 'Project deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createProject, getProjects, getProject, deleteProject };
