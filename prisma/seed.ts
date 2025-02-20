import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.product.deleteMany();

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Sample Product 1",
        price: 29.99,
        description: "This is a sample product description",
        images: ["sample1.jpg"],
      },
    }),
    prisma.product.create({
      data: {
        name: "Sample Product 2",
        price: 39.99,
        description: "Another sample product description",
        images: ["sample2.jpg"],
      },
    }),
  ]);

  console.log("Seeded:", products);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
