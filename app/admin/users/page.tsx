"use client"

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

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


// Extend NextAuth Session to include authToken
declare module "next-auth" {
  interface Session {
    user: {
      authToken?: string;
    };
  }
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<Users[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
  
    console.log("🔹 Fetching users data...");
    console.log("🔹 Session Data:", session);
    console.log("🔹 Auth Token:", session?.user?.authToken);
  
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
      console.log("🔹 Users Data:", data.data);
      setUsers(data.data.list);
    } catch (error) {
      console.error("🔴 Fetch Users Error:", error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, session]);

  // Fetch user profile when session is available
  useEffect(() => {
    console.log("Session:", session);
    console.log("Status:", status);
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
              {/* <th className="border p-2 text-black">Role</th> */}
              <th className="border p-2 text-black">Status</th>
              {/* <th className="border p-2 text-black">Action</th> */}
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
                
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}