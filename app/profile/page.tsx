"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { Header } from "@/components/header";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Profile Type
interface Profile {
  _id: string;
  username: string;
  profile_pic: { Location: string };
  gender: string;
  email: string;
  phone_number: string;
  role: string;
  is_active: boolean;
  is_deleted: boolean;
  is_email_verified: boolean;
}

// Extend NextAuth Session to include authToken
declare module "next-auth" {
  interface Session {
    user: {
      authToken?: string;
    };
  }
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
  
    console.log("🔹 Fetching profile data...");
    console.log("🔹 Session Data:", session);
    console.log("🔹 Auth Token:", session?.user?.authToken);
  
    try {
      if (!session?.user?.authToken) {
        throw new Error("Authentication token not found. Please log in.");
      }
  
      const response = await fetch(`${API_BASE_URL}/api/v1/user/details`, {
        method: "GET",
        headers: { 
          "Authorization":  `${session.user.authToken}`,
          "Content-Type": "application/json"
        },
      });
  
      console.log("🔹 API Response Status:", response.status);
  
      const result = await response.json();
      console.log("🔹 API Response Data:", result);
  
      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch profile");
      }
  
      setProfile(result.data); // ✅ Store user profile data
    } catch (error) {
      console.error("❌ Fetch Profile Error:", error);
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [session, API_BASE_URL]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);
  

  // Fetch user profile when session is available
  useEffect(() => {
    console.log("Session:", session);
    console.log("Status:", status);
    if (session?.user?.authToken && status === "authenticated") {
      fetchProfile();
    }
  }, [session, status, fetchProfile]);

  // Profile Picture Update
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!file) {
      setErrorMessage("Please select an image file.");
      setLoading(false);
      return;
    }

    try {
      if (!session?.user?.authToken) throw new Error("Authentication token not found. Please log in.");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/api/v1/user/upload-pic`, {
        method: "POST",
        headers: { Authorization: `${session.user.authToken}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Upload failed");

      setSuccessMessage("Profile picture updated successfully");
      setOpen(false);
      fetchProfile(); // Refresh profile
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Update Profile Function
  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);
    const updatedProfile = {
      username: formData.get("username"),
      phone_number: formData.get("phone_number"),
      gender: formData.get("gender"),
    };

    try {
      if (!session?.user?.authToken) throw new Error("Authentication token not found. Please log in.");

      const response = await fetch(`${API_BASE_URL}/api/v1/user/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `${session.user.authToken}` },
        body: JSON.stringify(updatedProfile),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Update failed");

      setSuccessMessage("Profile updated successfully");
      fetchProfile();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

    // Change Password Handler
    const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
  
      const formData = new FormData(e.currentTarget);
      const passwordData = {
        old_password: formData.get("old_password"),
        new_password: formData.get("new_password"),
        confirm_password: formData.get("confirm_password"),
      };
  
      try {
        if (!session?.user?.authToken) throw new Error("Authentication token not found. Please log in.");
  
        const response = await fetch(`${API_BASE_URL}/api/v1/user/change-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `${session.user.authToken}` },
          body: JSON.stringify(passwordData),
        });
  
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Password change failed");
  
        setSuccessMessage("Password updated successfully");
        setPasswordOpen(false);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

  const [passwordOpen, setPasswordOpen] = useState(false);

  if (status === "loading") return <p>Loading session...</p>;
  if (!session) return <p>Please log in to view your profile.</p>;
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />
      <div className="container py-10 max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <h2 className="text-3xl font-bold text-center mb-6">Profile</h2>
  
          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert variant="default">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
  
          {profile ? (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              {/* Profile Picture & Info */}
              <div className="flex items-center space-x-6">
                <Image
                  src={profile?.profile_pic?.Location || "/default-avatar.png"}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="rounded-full border-2 border-gray-300 dark:border-gray-600 shadow-lg"
                />
                <div>
                  <p className="text-xl font-semibold">{profile.username}</p>
                  <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
                </div>
              </div>
  
              {/* Buttons for Actions */}
              <div className="flex justify-between">
                {/* Change Profile Picture */}
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-1/2">
                      Change Picture
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Profile Picture</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpload} className="space-y-4">
                      <Input type="file" accept="image/*" onChange={handleFileChange} />
                      <Button type="submit" disabled={loading}>
                        {loading ? "Uploading..." : "Upload"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
  
                {/* Change Password */}
                <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-1/2">
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <Label htmlFor="old_password">Old Password</Label>
                      <Input id="old_password" name="old_password" type="password" required />
  
                      <Label htmlFor="new_password">New Password</Label>
                      <Input id="new_password" name="new_password" type="password" required />
  
                      <Label htmlFor="confirm_password">Confirm Password</Label>
                      <Input id="confirm_password" name="confirm_password" type="password" required />
  
                      <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Updating..." : "Update Password"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
  
              {/* Profile Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    defaultValue={profile.username}
                    required
                    className="border-gray-300 focus:border-gray-500 dark:focus:border-gray-400"
                  />
                </div>
  
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    defaultValue={profile.phone_number}
                    required
                    className="border-gray-300 focus:border-gray-500 dark:focus:border-gray-400"
                  />
                </div>
              </div>
  
              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md shadow-md"
              >
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">Fetching profile data...</p>
          )}
        </div>
      </div>
    </div>
  );
  
}

