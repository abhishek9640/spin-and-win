"use client";

import { useAccount } from "wagmi";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";

// Define interface for session user with role
interface SessionUser {
  id?: string;
  authToken?: string;
  role?: string;
  name?: string;
  email?: string;
  image?: string;
}

// Extended session type
interface ExtendedSession {
  user?: SessionUser;
  expires: string;
}

/**
 * Client component that automatically syncs wallet address to user profile
 * when both authentication and wallet connection are successful
 */
export const WalletAddressSync = () => {
  const { isConnected, address } = useAccount();
  const { data: session, status } = useSession() as { 
    data: ExtendedSession | null;
    status: "loading" | "authenticated" | "unauthenticated";
  };

  const [isSynced, setIsSynced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const syncAttempted = useRef(false);
  const currentAddress = useRef<string | undefined>(undefined);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const syncWalletAddress = async () => {
    if (isLoading || isSynced || !isConnected || !address || status !== "authenticated") return false;

    if (!session?.user?.authToken) {
      console.error("Auth token is missing. Skipping wallet sync.");
      return false;
    }

    if (!session?.user?.email) {
      console.error("User Email is missing in session. Skipping sync.");
      return false;
    }

    if (currentAddress.current === address) return false;

    syncAttempted.current = true;
    currentAddress.current = address;
    setSyncError(null);
    setIsLoading(true);

    try {
      console.log("Syncing wallet address:", address);

      const response = await fetch(`${API_BASE_URL}/api/v1/user/set-crypto-id`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user": JSON.stringify({
            id: session.user.id, // Correct key name
          }),
          Authorization: `${session.user.authToken}`, // Ensure proper format
        },
        body: JSON.stringify({ crypto_address: address }),
      });

      let data;
      try {
        const responseText = await response.text();
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        throw new Error("Failed to parse API response");
      }

      if (!response.ok) {
        console.error("API error response:", data);
        throw new Error(data.message || `API error: ${response.status}`);
      }

      console.log("Wallet address synced successfully");
      setIsSynced(true);
      return true;
    } catch (err) {
      console.error("Error syncing wallet address:", err);
      setSyncError(err instanceof Error ? err.message : "Unknown error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address && status === "authenticated" && !syncAttempted.current) {
      syncWalletAddress();
    }

    if (address !== currentAddress.current) {
      setIsSynced(false);
      syncAttempted.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, status, session?.user?.authToken]);

  useEffect(() => {
    if (syncError) console.error("Wallet sync error:", syncError);
  }, [syncError]);

  return null;
};

export default WalletAddressSync;
