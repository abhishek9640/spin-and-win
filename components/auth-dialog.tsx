"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn, useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginButton() {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // Prevent NextAuth from redirecting
    });

    if (result?.error) {
      setErrorMessage(result.error);
    } else {
      setOpen(false);
      // Refresh the page to reflect the updated session state (or route back to the current page)
      router.refresh()  
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{session ? "Sign Out" : "Sign In"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-lg dark:bg-neutral-950/95">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Welcome to Crypto Spin
          </DialogTitle>
          <DialogDescription className="text-neutral-500 dark:text-neutral-400">
            {session
              ? `Signed in as ${session.user?.email}`
              : "Sign in or create an account to start playing"}
          </DialogDescription>
        </DialogHeader>
        
        {!session ? (
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    required
                    className="bg-white/50 dark:bg-neutral-950/50"
                    aria-describedby="signin-email-description"
                  />
                  <p id="signin-email-description" className="text-sm text-neutral-500 dark:text-neutral-400">
                    Enter your registered email address
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    required
                    className="bg-white/50 dark:bg-neutral-950/50"
                    aria-describedby="signin-password-description"
                  />
                  <p id="signin-password-description" className="text-sm text-neutral-500 dark:text-neutral-400">
                    Enter your password
                  </p>
                </div>
                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
                <SubmitButton>Sign In</SubmitButton>
              </form>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => signIn("google")}
              >
                Sign In with Google
              </Button>
            </TabsContent>
            <TabsContent value="signup">
              <p className="text-neutral-500 dark:text-neutral-400">
                Signup is currently disabled. Use Google authentication instead.
              </p>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => signIn("google")}
              >
                Sign Up with Google
              </Button>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-center text-neutral-500 dark:text-neutral-400">
              Signed in as <strong>{session.user?.email}</strong>
            </p>
            <Button onClick={() => signOut()} className="w-full">
              Sign Out
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="submit"
      className="w-full bg-neutral-900 hover:bg-neutral-900/90 dark:bg-neutral-50 dark:hover:bg-neutral-50/90"
      disabled={loading}
      onClick={() => setLoading(true)}
    >
      {loading ? "Loading..." : children}
    </Button>
  );
}
