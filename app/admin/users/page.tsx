"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Users Type
interface Users {
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

export default function UsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<Users[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<Users | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      if (!session?.user?.authToken) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/list`, {
        method: "GET",
        headers: {
          Authorization: `${session?.user?.authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users data. Please try again.");
      }

      const data = await response.json();
      setUsers(data.data.list);
    } catch (error) {
      console.error("🔴 Fetch Users Error:", error);
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, session]);

  // Update User Status
  const setStatus = useCallback(async () => {
    if (!selectedUser) return;
    setLoading(true);
    setIsModalOpen(false);

    try {
      if (!session?.user?.authToken) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/set-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${session?.user?.authToken}`,
        },
        body: JSON.stringify({ status: !selectedUser.is_active, user_id: selectedUser._id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update status");

      // Update users state after status change
      setUsers((prevUsers) =>
        prevUsers
          ? prevUsers.map((user) =>
              user._id === selectedUser._id ? { ...user, is_active: !user.is_active } : user
            )
          : []
      );
    } catch (error) {
      console.error("🔴 Status Update Error:", error);
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
      setSelectedUser(null);
    }
  }, [API_BASE_URL, session, selectedUser]);

  useEffect(() => {
    if (session?.user?.authToken && status === "authenticated") {
      fetchUsers();
    }
  }, [session, status, fetchUsers]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Users List</h1>

      {loading && <p className="text-blue-500">Loading users...</p>}
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      {!loading && users && users.length > 0 && (
        <table className="w-full border-collapse border border-gray-300 mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-black">Username</th>
              <th className="border p-2 text-black">Email</th>
              <th className="border p-2 text-black">Phone</th>
              <th className="border p-2 text-black">Status</th>
              <th className="border p-2 text-black">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="text-center">
                <td className="border p-2">{user.username}</td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">{user.phone_number}</td>
                <td className="border p-2">
                  {user.is_active ? (
                    <span className="text-green-600 font-semibold">Active</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Inactive</span>
                  )}
                </td>
                <td className="border p-2">
                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className={`px-3 py-1 rounded text-white ${
                          user.is_active ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                        }`}
                        onClick={() => {
                          setSelectedUser(user);
                          setIsModalOpen(true);
                        }}
                        disabled={loading}
                      >
                        {user.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Action</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to {user.is_active ? "deactivate" : "activate"} this user?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={setStatus} disabled={loading}>
                          {loading ? "Processing..." : "Confirm"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
