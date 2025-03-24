import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function main() {
  // Delete existing records
  await prisma.product.deleteMany({});

  // Generate 1000 dummy products
  const products = [];
  for (let i = 0; i < 1000; i++) {
    products.push({
      name: `Product ${i + 1}`,
      price: new Decimal((Math.random() * 100).toFixed(2)),
      description: `This is a dummy description for product number ${
        i + 1
      }. It's a great product!`,
      images: [
        `https://example.com/product-${i + 1}-1.jpg`,
        `https://example.com/product-${i + 1}-2.jpg`,
      ],
    });
  }

  // Insert products into the database in batches of 500 to avoid performance issues
  const BATCH_SIZE = 500;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    await prisma.product.createMany({ data: batch });
  }

  console.log("Database seeded with 1000 products!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
