"use client";

import { useLogin, useRegister } from "@/hooks/useAuth";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";

export default function AuthPage() {
  const {
    form: loginForm,
    onSubmit: onLoginSubmit,
    isLoading: isLoggingIn,
    error: loginError,
  } = useLogin();

  const {
    form: registerForm,
    onSubmit: onRegisterSubmit,
    isLoading: isRegistering,
    error: registerError,
  } = useRegister();

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-gray-500">
            Sign in to your account or create a new one
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            {loginError && (
              <Alert variant="destructive">
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}

            <Form {...loginForm}>
              <form onSubmit={onLoginSubmit} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field, fieldState: { error } }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                        />
                      </FormControl>
                      {error && <FormMessage>{error.message}</FormMessage>}
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field, fieldState: { error } }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                        />
                      </FormControl>
                      {error && <FormMessage>{error.message}</FormMessage>}
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            {registerError && (
              <Alert variant="destructive">
                <AlertDescription>{registerError}</AlertDescription>
              </Alert>
            )}

            <Form {...registerForm}>
              <form onSubmit={onRegisterSubmit} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field, fieldState: { error } }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" {...field} />
                      </FormControl>
                      {error && <FormMessage>{error.message}</FormMessage>}
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field, fieldState: { error } }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                        />
                      </FormControl>
                      {error && <FormMessage>{error.message}</FormMessage>}
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field, fieldState: { error } }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Create a password"
                          {...field}
                        />
                      </FormControl>
                      {error && <FormMessage>{error.message}</FormMessage>}
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field, fieldState: { error } }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm your password"
                          {...field}
                        />
                      </FormControl>
                      {error && <FormMessage>{error.message}</FormMessage>}
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isRegistering}
                >
                  {isRegistering ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
