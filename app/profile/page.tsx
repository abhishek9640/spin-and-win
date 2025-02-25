"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

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

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await fetch(
        "https://13c3-2409-4055-9e-c3c0-b281-6081-74f7-17.ngrok-free.app/api/v1/user/details",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to fetch profile");

      setProfile(result.data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

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
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await fetch(
        "https://13c3-2409-4055-9e-c3c0-b281-6081-74f7-17.ngrok-free.app/api/v1/user/update",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(updatedProfile),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Update failed");

      setSuccessMessage("Profile updated successfully");
      fetchProfile(); // Refresh profile data
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
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="flex items-center space-x-4">
            <Image
              src={profile.profile_pic?.Location}
              alt="Profile"
              className="w-16 h-16 rounded-full border"
            />
            <div>
              <p className="text-lg font-medium">{profile.username}</p>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" type="text" defaultValue={profile.username} />
          </div>

          <div>
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              name="phone_number"
              type="tel"
              defaultValue={profile.phone_number}
            />
          </div>

          <div>
            <Label htmlFor="gender">Gender</Label>
            <select id="gender" name="gender" defaultValue={profile.gender} className="border rounded p-2 w-full">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      ) : (
        <p className="text-center">Fetching profile data...</p>
      )}
    </div>
  );
}
