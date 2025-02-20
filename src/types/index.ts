export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  role: "ADMIN" | "USER";
}

export interface Order {
  id: string;
  userId: string;
  products: Product[];
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  createdAt: Date;
}
