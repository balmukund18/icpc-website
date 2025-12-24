import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log("Usage: npx ts-node scripts/approveUser.ts <email>");
    process.exit(1);
  }

  const email = args[0];

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { approved: true },
    });
    console.log(`Successfully approved user ${email}`);
  } catch (error) {
    console.error(`Error approving user: ${error}`);
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
