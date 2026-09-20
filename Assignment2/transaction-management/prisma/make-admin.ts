import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    throw new Error("Usage: npm run db:make-admin -- user@example.com");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!existingUser) {
    throw new Error(`No account exists for ${email}. Register at /signup first, then run this command again.`);
  }

  const user = await prisma.user.update({
    where: { id: existingUser.id },
    data: { role: UserRole.ADMIN },
    select: { email: true, role: true },
  });

  console.log(`Admin access granted to ${user.email} (${user.role})`);
}

main()
  .catch((error) => {
    console.error("Failed to grant admin access:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
