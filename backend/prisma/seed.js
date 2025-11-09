import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const passwordHash = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@crm.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@crm.com",
      password: passwordHash,
      role: "ADMIN",
    },
  });

  const sales = await prisma.user.upsert({
    where: { email: "sales@crm.com" },
    update: {},
    create: {
      name: "Sales Agent",
      email: "sales@crm.com",
      password: passwordHash,
      role: "SALES",
    },
  });

  await prisma.lead.create({
    data: {
      name: "John Doe",
      email: "john@example.com",
      phone: "9876543210",
      stage: "new",
      ownerId: sales.id,
    },
  });

  await prisma.notification.create({
    data: {
      userId: admin.id,
      type: "INFO",
      message: "CRM initialized successfully with seed data.",
    },
  });

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
