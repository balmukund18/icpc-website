import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      id: true,
    },
  });

  if (users.length === 0) {
    console.log("No users found in the database.");
  } else {
    console.log("Existing users:");
    console.table(users);
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
