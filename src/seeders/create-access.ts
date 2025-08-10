import { prisma } from 'connection/prisma';
async function createAccessRoles() {
  try {
    const roles = ["advisor", "viewer"];

    for (const roleName of roles) {
      const existingRole = await prisma.access.findUnique({
        where: { name: roleName },
      });

      if (existingRole) {
        console.warn(`Access role '${roleName}' already exists.`);
      } else {
        await prisma.access.create({
          data: { name: roleName },
        });
        console.warn(`Access role '${roleName}' created successfully!`);
      }
    }
  } catch (error) {
    console.error('Error creating access roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

void createAccessRoles();
