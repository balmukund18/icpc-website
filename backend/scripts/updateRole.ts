import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log("Usage: npx ts-node scripts/updateRole.ts <email> <role>");
    console.log("Available roles: STUDENT, ADMIN, ALUMNI");
    process.exit(1);
  }

  const email = args[0];
  const roleStr = args[1].toUpperCase();

  if (!Object.values(Role).includes(roleStr as Role)) {
    console.error(
      `Invalid role: ${roleStr}. Must be one of: ${Object.values(Role).join(
        ", "
      )}`
    );
    process.exit(1);
  }

  const role = roleStr as Role;

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role },
    });
    console.log(`Successfully updated user ${email} to role ${role}`);
  } catch (error) {
    console.error(`Error updating user: ${error}`);
    console.log("Make sure the user exists.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
