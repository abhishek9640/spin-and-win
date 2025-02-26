"use client";

import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LoginButton() {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Check if user is logged in (token exists in localStorage)
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    setToken(storedToken);
    console.log("token",storedToken);
  }, []);

  // Handle Login
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const parsedResponse = await response.json();     
      const data = parsedResponse.data;
      if (!response.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("authToken", data.token);
      console.log("token",data.token);
      setToken(data.token);
      setOpen(false);
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error instanceof Error) {
          if (error instanceof Error) {
            setErrorMessage((error as Error).message);
          } else {
            setErrorMessage("An unknown error occurred");
          }
        } else {
          setErrorMessage("An unknown error occurred");
        }
      } else {
        setErrorMessage("An unknown error occurred");
      }
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
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const phone_number = formData.get("phone_number") as string;
    const otp = formData.get("otp") as string;
    const password = formData.get("password") as string;
    const confirm_password = formData.get("confirm_password") as string;
    const gender = formData.get("gender") as string;
    const role = formData.get("role") as string;

    if (password !== confirm_password) {
      setErrorMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, phone_number, otp, password, confirm_password, gender, role }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup failed");

      setSuccessMessage("Signup successful! You can now log in.");
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };


  // Handle OTP Request
  const handleSendOtp = async (email: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send OTP");

      setOtpSent(true);
      setSuccessMessage("OTP sent successfully. Check your email.");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={token ? handleSignOut : () => setOpen(true)}>
          {token ? "Sign Out" : "Sign In"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-lg dark:bg-neutral-950/95">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Welcome to Crypto Spin
          </DialogTitle>
          <DialogDescription className="text-neutral-500 dark:text-neutral-400">
            {token
              ? `You are signed in.`
              : "Sign in or create an account to start playing"}
          </DialogDescription>
        </DialogHeader>

        {!token ? (
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
              <div className="max-h-[80vh] overflow-y-auto p-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <InputField id="signup-username" name="username" label="Username" type="text" />
                  <InputField id="signup-email" name="email" label="Email" type="email" />
                  <InputField id="signup-phone" name="phone_number" label="Phone Number" type="tel" />

                  <Button type="button" className="w-full mt-2"
                    onClick={() => handleSendOtp((document.getElementById("signup-email") as HTMLInputElement)?.value)}>
                    Send OTP
                  </Button>

                  {otpSent && <InputField id="signup-otp" name="otp" label="OTP" type="text" />}

                  <InputField id="signup-password" name="password" label="Password" type="password" />
                  <InputField id="signup-confirm-password" name="confirm_password" label="Confirm Password" type="password" />

                  <div className="flex flex-col">
                    <label htmlFor="signup-gender">Gender</label>
                    <select id="signup-gender" name="gender" className="border rounded p-2">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="signup-role">Role</label>
                    <select id="signup-role" name="role" className="border rounded p-2">
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <SubmitButton loading={loading}>Sign Up</SubmitButton>
                </form>
              </div>
            </TabsContent>


          </Tabs>
        ) : (
          <div className="flex flex-col items-center space-y-4">
  <p className="text-center text-neutral-500 dark:text-neutral-400">
    You are logged in.
  </p>

  {/* Go to Profile Button */}
  <Link href="/profile" className="w-full">
    <Button variant="outline" className="w-full">Go to Profile</Button>
  </Link>

  {/* Sign Out Button */}
  <Button onClick={handleSignOut} className="w-full">
    Sign Out
  </Button>
</div>

        )}

        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        {successMessage && (
          <Alert variant="default">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
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
