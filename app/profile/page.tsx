"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

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
  

  // Fetch user profile when session is available
  useEffect(() => {
    console.log("Session:", session);
    console.log("Status:", status);
    if (session?.user?.authToken && status === "authenticated") {
      fetchProfile();
    }
  }, [session, status, fetchProfile]);

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

  if (status === "loading") return <p>Loading session...</p>;
  if (!session) return <p>Please log in to view your profile.</p>;

  return (
    <div className="container py-8 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>

      {errorMessage && <Alert variant="destructive"><AlertDescription>{errorMessage}</AlertDescription></Alert>}
      {successMessage && <Alert variant="default"><AlertDescription>{successMessage}</AlertDescription></Alert>}

      {profile ? (
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="flex items-center space-x-4">
            <Image src={profile?.profile_pic?.Location || "/default-avatar.png"} alt="Profile" width={64} height={64} className="rounded-full border" />
            <div>
              <p className="text-lg font-medium">{profile.username}</p>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>
          </div>

          <Label htmlFor="username">Username</Label>
          <Input id="username" name="username" type="text" defaultValue={profile.username} required />

          <Label htmlFor="phone_number">Phone Number</Label>
          <Input id="phone_number" name="phone_number" type="tel" defaultValue={profile.phone_number} required />

          <Button type="submit" disabled={loading}>{loading ? "Updating..." : "Update Profile"}</Button>
        </form>
      ) : (
        <p className="text-center">Fetching profile data...</p>
      )}
    </div>
  );
}

