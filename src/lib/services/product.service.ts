import { prisma } from "@/lib/prisma/client";
import { Prisma } from "@prisma/client";
import {
  Product,
  ProductCreateInput,
  ProductQueryParams,
  ProductService,
  PaginatedResponse,
  ProductUpdateInput,
} from "@/types";

class ProductServiceImpl implements ProductService {
  // Convert Prisma Product to API Product
  private toProduct(product: Prisma.ProductGetPayload<{}>): Product {
    return {
      ...product,
      price: Number(product.price),
    };
  }

  async findMany(
    params: ProductQueryParams
  ): Promise<PaginatedResponse<Product>> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = params.search
      ? {
          OR: [
            {
              name: {
                contains: params.search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              description: {
                contains: params.search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products.map(this.toProduct),
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit,
      },
    };
  }

  async findById(id: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    return product ? this.toProduct(product) : null;
  }

  async create(data: ProductCreateInput): Promise<Product> {
    const product = await prisma.product.create({
      data: {
        ...data,
        price: new Prisma.Decimal(data.price),
      },
    });

    return this.toProduct(product);
  }

  async update(id: string, data: ProductUpdateInput): Promise<Product> {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(data.price !== undefined && {
          price: new Prisma.Decimal(data.price),
        }),
      },
    });

    return this.toProduct(product);
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({
      where: { id },
    });
  }
}

// Export singleton instance
export const productService = new ProductServiceImpl();
