import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function main() {
  // Delete existing records
  await prisma.product.deleteMany({});

  // Create sample products
  const products = [
    {
      name: "Classic T-Shirt",
      price: new Decimal(29.99),
      description: "Comfortable cotton t-shirt in various colors",
      images: [
        "https://example.com/tshirt-1.jpg",
        "https://example.com/tshirt-2.jpg",
      ],
    },
    {
      name: "Denim Jeans",
      price: new Decimal(79.99),
      description: "Classic fit denim jeans with five pockets",
      images: [
        "https://example.com/jeans-1.jpg",
        "https://example.com/jeans-2.jpg",
      ],
    },
    {
      name: "Running Shoes",
      price: new Decimal(119.99),
      description: "Lightweight running shoes with cushioned sole",
      images: [
        "https://example.com/shoes-1.jpg",
        "https://example.com/shoes-2.jpg",
      ],
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log("Database seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
