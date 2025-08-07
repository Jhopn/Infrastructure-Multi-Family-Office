import { prisma } from "../connection/prisma";

async function createAccessRoles() {
  try {
    const roles = ["Admin", "User"];

    for (const roleName of roles) {
      const existingRole = await prisma.access.findUnique({
        where: { name: roleName },
      });

      if (existingRole) {
        console.log(`🔁 Access role '${roleName}' already exists.`);
      } else {
        await prisma.access.create({
          data: { name: roleName },
        });
        console.log(`✅ Access role '${roleName}' created successfully!`);
      }
    }
  } catch (error) {
    console.error("❌ Error creating access roles:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAccessRoles();
