import { NextAuthOptions, DefaultSession } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma/client";
import { compare } from "bcryptjs";
import { Role } from "@prisma/client";

export const authConfig = {
  adminRole: Role.ADMIN,
  publicRole: Role.USER,
  sessionMaxAge: 30 * 24 * 60 * 60, // 30 days
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: authConfig.sessionMaxAge,
  },
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }

      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Create a cart for new users
      await prisma.cart.create({
        data: {
          userId: user.id,
        },
      });
    },
  },
};

// Type augmentation for next-auth
declare module "next-auth" {
  interface User {
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    id: string;
  }
}
