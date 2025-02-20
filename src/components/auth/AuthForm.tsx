import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import { UserService } from "@/lib/services/user.service";
import { handleApiError } from "@/lib/api/axios";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useToast } from "@/shared/components/ui/use-toast";

type AuthMode = "signin" | "register";

export function AuthForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>("signin");

  const userService = UserService.getInstance();

  // Registration mutation
