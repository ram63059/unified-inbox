import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();


async function main() {

    //create demo user  
    const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u', // "password123"
      name: 'Demo User',
      role: 'ADMIN',
    },
  });
    
  // create sample contact

  const contact=await prisma.contact.upsert({
    where:{email:'customer@example.com'},
    update:{},
    create:{
        name:'john customer',
        phone:'+1234567890',
        email:'customer@example.com',
        whatsapp:'+1234567890'
    },
  });

   // Create sample messages
  await prisma.message.create({
    data: {
      channel: 'SMS',
      direction: 'INBOUND',
      body: 'Hello, I need help with my order',
      status: 'DELIVERED',
      contactId: contact.id,
      sentAt: new Date(),
    },
  });

   await prisma.message.create({
    data: {
      channel: 'SMS',
      direction: 'OUTBOUND',
      body: 'Hi! I would be happy to help. What is your order number?',
      status: 'SENT',
      contactId: contact.id,
      userId: user.id,
      sentAt: new Date(),
    },
  });


  console.log(' Database seeded successfully!');
  console.log(` User: demo@example.com / password123`);
  console.log(`Contact: ${contact.name}`);

}

main()
    .catch((e)=>{
        console.error(e);
        process.exit(1);
    })
    .finally(async () =>{
        await prisma.$disconnect();
    });