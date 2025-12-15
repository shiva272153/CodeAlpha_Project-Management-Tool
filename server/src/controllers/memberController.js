const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addMember = async (req, res) => {
    try {
        const { id } = req.params; // Project ID
        const { email } = req.body;

        const project = await prisma.project.findUnique({ where: { id } });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Check if requester is owner
        if (project.ownerId !== req.user.userId) {
            return res.status(403).json({ message: 'Only owner can add members' });
        }

        const userToAdd = await prisma.user.findUnique({ where: { email } });
        if (!userToAdd) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!project.memberIds) {
            try {
                // Initialize memberIds if missing in MongoDB document
                await prisma.$runCommandRaw({
                    update: "Project",
                    updates: [
                        {
                            q: { _id: { "$oid": project.id } },
                            u: { $set: { memberIds: [] } }
                        }
                    ]
                });
            } catch (e) {
                console.error("Failed to init memberIds", e);
            }
        }

        const memberIds = project.memberIds || [];
        if (memberIds.includes(userToAdd.id) || project.ownerId === userToAdd.id) {
            return res.status(400).json({ message: 'User is already a member' });
        }

        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                members: {
                    connect: { id: userToAdd.id }
                }
            },
            include: {
                members: { select: { id: true, name: true, email: true } }
            }
        });

        res.json(updatedProject);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const removeMember = async (req, res) => {
    try {
        const { id, userId } = req.params; // Project ID, Member User ID

        const project = await prisma.project.findUnique({ where: { id } });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Check if requester is owner
        if (project.ownerId !== req.user.userId) {
            return res.status(403).json({ message: 'Only owner can remove members' });
        }

        // Check if user is actually a member
        const memberIds = project.memberIds || [];
        if (!memberIds.includes(userId)) {
            return res.status(400).json({ message: 'User is not a member' });
        }

        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                members: {
                    disconnect: { id: userId }
                }
            },
            include: {
                members: { select: { id: true, name: true, email: true } }
            }
        });

        res.json(updatedProject);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { addMember, removeMember };
