// prisma/seed.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CRM database...");

  /* ======================================================
     1️⃣  CLEAN EXISTING DATA (Safe for dev/test)
  ====================================================== */
  await prisma.notification.deleteMany();
  await prisma.task.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.lead_histories.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.leads.deleteMany();
  await prisma.system_history.deleteMany();
  await prisma.user.deleteMany();

  /* ======================================================
     2️⃣  USERS
  ====================================================== */
  const users = await prisma.user.createMany({
    data: [
      {
        name: "Alice Johnson",
        email: "alice@crm.com",
        password: "hashed-password-123",
        role: "SALES",
      },
      {
        name: "Bob Miller",
        email: "bob@crm.com",
        password: "hashed-password-123",
        role: "SALES",
      },
      {
        name: "Carol White",
        email: "carol@crm.com",
        password: "hashed-password-123",
        role: "MANAGER",
      },
      {
        name: "Admin User",
        email: "admin@crm.com",
        password: "hashed-password-123",
        role: "ADMIN",
      },
    ],
  });
  console.log("✅ Users created");

  const [alice, bob, carol, admin] = await prisma.user.findMany();

  /* ======================================================
     3️⃣  LEADS
  ====================================================== */
  const leadsData = [
    {
      name: "ACME Corp",
      stage: "Prospecting",
      ownerId: alice.id,
      email: "ceo@acme.com",
      phone: "555-1111",
    },
    {
      name: "Zenith Ltd",
      stage: "Qualified",
      ownerId: alice.id,
      email: "sales@zenith.com",
      phone: "555-2222",
    },
    {
      name: "NovaTech",
      stage: "Negotiation",
      ownerId: bob.id,
      email: "info@novatech.com",
      phone: "555-3333",
    },
    {
      name: "Globex",
      stage: "Closed Won",
      ownerId: alice.id,
      email: "hello@globex.com",
      phone: "555-4444",
    },
    {
      name: "SkyNet",
      stage: "Prospecting",
      ownerId: bob.id,
      email: "admin@skynet.com",
      phone: "555-5555",
    },
    {
      name: "StarLink",
      stage: "Lost",
      ownerId: carol.id,
      email: "support@starlink.com",
      phone: "555-6666",
    },
  ];

  await prisma.leads.createMany({ data: leadsData });
  console.log("✅ Leads created");

  const leads = await prisma.leads.findMany();

  /* ======================================================
     4️⃣  LEAD HISTORIES
  ====================================================== */
  const leadHistoryData = leads.slice(0, 3).map((lead) => ({
    leadId: lead.id,
    changedBy: alice.id,
    field: "stage",
    oldValue: "Prospecting",
    newValue: "Qualified",
  }));

  await prisma.lead_histories.createMany({ data: leadHistoryData });
  console.log("✅ Lead histories created");

  /* ======================================================
     5️⃣  ACTIVITIES
  ====================================================== */
  await prisma.activity.createMany({
    data: [
      {
        leadId: leads[0].id,
        userId: alice.id,
        details: "Initial discovery call with ACME Corp",
        type: "Call",
      },
      {
        leadId: leads[1].id,
        userId: bob.id,
        details: "Sent proposal document to Zenith Ltd",
        type: "Email",
      },
      {
        leadId: leads[2].id,
        userId: carol.id,
        details: "Meeting scheduled for product demo",
        type: "Meeting",
      },
    ],
  });
  console.log("✅ Activities created");

  /* ======================================================
     6️⃣  CONTACTS
  ====================================================== */
  await prisma.contact.createMany({
    data: [
      {
        name: "John Doe",
        email: "john@acme.com",
        phone: "555-1010",
        company: "ACME Corp",
        position: "CEO",
        ownerid: alice.id,
      },
      {
        name: "Sara Lee",
        email: "sara@zenith.com",
        phone: "555-2020",
        company: "Zenith Ltd",
        position: "Sales Director",
        ownerid: bob.id,
      },
      {
        name: "Michael Brown",
        email: "mike@novatech.com",
        phone: "555-3030",
        company: "NovaTech",
        position: "CTO",
        ownerid: carol.id,
      },
    ],
  });
  console.log("✅ Contacts created");

  const contacts = await prisma.contact.findMany();

  /* ======================================================
     7️⃣  DEALS
  ====================================================== */
  await prisma.deal.createMany({
    data: [
      {
        title: "ACME Annual Contract",
        value: 10000,
        stage: "Qualified",
        contactid: contacts[0].id,
        ownerid: alice.id,
        description: "Enterprise annual contract renewal",
      },
      {
        title: "Zenith Pilot Deal",
        value: 5000,
        stage: "Proposal",
        contactid: contacts[1].id,
        ownerid: bob.id,
        description: "Pilot test deal for new product line",
      },
    ],
  });
  console.log("✅ Deals created");

  const deals = await prisma.deal.findMany();

  /* ======================================================
     8️⃣  TASKS
  ====================================================== */
  await prisma.task.createMany({
    data: [
      {
        title: "Follow-up with ACME",
        description: "Call ACME CEO about next steps",
        priority: "High",
        status: "To_Do",
        ownerid: alice.id,
        dealid: deals[0].id,
      },
      {
        title: "Prepare proposal for Zenith",
        description: "Send updated proposal with revised pricing",
        priority: "Medium",
        status: "In_Progress",
        ownerid: bob.id,
        dealid: deals[1].id,
      },
      {
        title: "Demo with NovaTech",
        description: "Prepare slides for tomorrow’s demo",
        priority: "High",
        status: "Completed",
        ownerid: carol.id,
      },
    ],
  });
  console.log("✅ Tasks created");

  /* ======================================================
     9️⃣  NOTIFICATIONS
  ====================================================== */
  await prisma.notification.createMany({
    data: [
      {
        userId: alice.id,
        type: "Task Reminder",
        message: "Follow up with ACME Corp today",
      },
      {
        userId: bob.id,
        type: "New Lead",
        message: "A new lead has been assigned: Zenith Ltd",
      },
    ],
  });
  console.log("✅ Notifications created");

  /* ======================================================
     🔟  SYSTEM HISTORY
  ====================================================== */
  await prisma.system_history.createMany({
    data: [
      {
        userid: admin.id,
        action: "Seed Database",
        entitytype: "System",
        description: "Initial CRM database seed executed.",
        ipaddress: "127.0.0.1",
        useragent: "seed-script",
      },
    ],
  });
  console.log("✅ System history created");

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
