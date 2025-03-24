"use client";

import { useProducts } from "@/hooks/useProducts";
import { useSession } from "next-auth/react";
import { Product as PrismaProduct } from "@prisma/client";
import {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
} from "@/shared/components/ui/card"; // Import ShadCN Card components

// Convert Prisma Decimal to number for the API
export type Product = Omit<PrismaProduct, "price"> & {
  price: number; // Convert Decimal to number type here
};

export default function HomePage() {
  const { data: session } = useSession();
  const { products } = useProducts();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-6">Welcome to Webshop</h1>
      {session ? (
        <div className="space-y-4">
          <p className="text-lg">
            Welcome back, {session.user.name || session.user.email}!
          </p>
          {session.user.role === "ADMIN" && (
            <p className="text-sm text-gray-600">
              You have admin privileges. Visit the{" "}
              <a
                href="/admin/dashboard"
                className="text-blue-600 hover:underline"
              >
                admin dashboard
              </a>{" "}
              to manage the shop.
            </p>
          )}
        </div>
      ) : (
        <p className="text-lg">
          Please{" "}
          <a href="/auth" className="text-blue-600 hover:underline">
            sign in
          </a>{" "}
          to access your account.
        </p>
      )}

      {/* Products Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {products?.map((product) => (
          <Card
            key={product.id}
            className="max-w-sm mx-auto shadow-lg border rounded-lg"
          >
            <CardHeader>
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-64 object-cover rounded-t-lg"
              />
            </CardHeader>
            <CardContent>
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p className="text-sm text-gray-600">
                {product.description || "No description available."}
              </p>
              <p className="mt-2 text-lg font-bold text-gray-900">
                ${product.price.toFixed(2)}{" "}
                {/* Convert price to number before formatting */}
              </p>
            </CardContent>
            <CardFooter>
              <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">
                Add to Cart
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
