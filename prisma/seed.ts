import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seed() {
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('passWord!123', 12);

  const numUsers = 10;

  console.log('seeding...');

  for (let i = 1; i < numUsers; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: hashedPassword,
      },
    });

    for (let i = 1; i < Math.ceil(Math.random() * 10); i++) {
      const post = await prisma.post.create({
        data: {
          title: faker.lorem.sentence({ min: 3, max: 8 }),
          content: faker.lorem.paragraphs({ min: 3, max: 10 }),
          full_content: faker.lorem.paragraphs({ min: 3, max: 10 }),
          image: faker.image.urlPicsumPhotos(),
          author: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      for (let i = 1; i < Math.ceil(Math.random() * 5); i++) {
        await prisma.comment.create({
          data: {
            comment: faker.lorem.sentence({ min: 3, max: 12 }),
            post_id: post.id,
          },
        });
      }
    }

    // const post = await prisma.post.create({
    //   data: {
    //     user_id: user.id,
    //     title: faker.lorem.sentence({ min: 3, max: 8 }),
    //     content: faker.lorem.paragraph(),
    //     // content: faker.lorem.paragraphs(3, "<br/>\n"),
    //   },
    // });

    // for (let i = 1; i < Math.ceil(Math.random() * 5); i++) {
    //   await prisma.comment.create({
    //     data: {
    //       comment: faker.lorem.sentence({ min: 3, max: 12 }),
    //       post_id: post.id,
    //     },
    //   });
    // }

    console.log(`Database seeded with user ${i} and their posts.`);
  }

  console.log(`Database seeded with  users and their posts.`);
}

seed()
  .catch((e) => {
    console.error('Seeding failed!', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
