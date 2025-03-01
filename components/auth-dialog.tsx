"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

export function LoginButton() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // const [otpSent, setOtpSent] = useState(false);

  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Handle Login using NextAuth
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) throw new Error(result.error);

      setSuccessMessage("Login successful!");
      setOpen(false);
      router.refresh(); // Refresh to update session state
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const userData = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup failed");

      setSuccessMessage("Signup successful! Please log in.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={session ? handleSignOut : () => setOpen(true)}>
          {session ? "Sign Out" : "Sign In"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to Crypto Spin</DialogTitle>
          <DialogDescription>
            {session ? `You are signed in.` : "Sign in or create an account"}
          </DialogDescription>
        </DialogHeader>

        {!session ? (
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* LOGIN FORM */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <InputField id="signin-email" name="email" label="Email" type="email" />
                <InputField id="signin-password" name="password" label="Password" type="password" />
                <SubmitButton loading={loading}>Sign In</SubmitButton>
              </form>
            </TabsContent>

            {/* SIGNUP FORM */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <InputField id="signup-username" name="username" label="Username" type="text" />
                <InputField id="signup-email" name="email" label="Email" type="email" />
                <InputField id="signup-password" name="password" label="Password" type="password" />
                <InputField id="signup-confirm-password" name="confirm_password" label="Confirm Password" type="password" />
                <SubmitButton loading={loading}>Sign Up</SubmitButton>
              </form>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <p>You are logged in.</p>
            <Button onClick={handleSignOut} className="w-full">
              Sign Out
            </Button>
          </div>
        )}

        {errorMessage && <Alert variant="destructive"><AlertDescription>{errorMessage}</AlertDescription></Alert>}
        {successMessage && <Alert><AlertDescription>{successMessage}</AlertDescription></Alert>}
      </DialogContent>
    </Dialog>
  );
}

// Helper Components
function InputField({ id, name, label, type }: { id: string; name: string; label: string; type: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} type={type} required />
    </div>
  );
}

function SubmitButton({ children, loading }: { children: React.ReactNode; loading: boolean }) {
  return <Button type="submit" className="w-full" disabled={loading}>{loading ? "Loading..." : children}</Button>;
}
