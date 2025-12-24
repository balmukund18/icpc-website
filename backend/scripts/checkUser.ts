import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const email = args[0];

  if (!email) {
    console.log("Please provide an email");
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log("User not found");
  } else {
    console.log("User details:", {
      id: user.id,
      email: user.email,
      role: user.role,
      approved: user.approved,
      passwordHash: user.password.substring(0, 10) + "...", // Don't show full hash
    });
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
