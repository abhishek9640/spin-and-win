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

// Storage key constant for wallet address - must match the one in connect-wallet.tsx
const STORED_WALLET_KEY = 'tronlink_wallet_address';

/**
 * Client component that automatically syncs wallet address to user profile
 * when both authentication and wallet connection are successful
 */
export const WalletAddressSync = () => {
  const { isConnected: isWagmiConnected, address: wagmiAddress } = useAccount();
  const { data: session, status } = useSession() as { 
    data: ExtendedSession | null;
    status: "loading" | "authenticated" | "unauthenticated";
  };

  const [isSynced, setIsSynced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState<string | null>(null);

  const syncAttempted = useRef(false);
  const currentAddress = useRef<string | undefined>(undefined);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Get effective address (either from wagmi or localStorage)
  const address = wagmiAddress || manualAddress;
  const isConnected = isWagmiConnected || !!manualAddress;

  // Check for manually entered address in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAddress = localStorage.getItem(STORED_WALLET_KEY);
      if (storedAddress) {
        setManualAddress(storedAddress);
        console.log('Found stored TronLink address for sync:', storedAddress);
      }
    }

    // Listen for storage changes to detect address updates
    const handleStorageChange = () => {
      const storedAddress = localStorage.getItem(STORED_WALLET_KEY);
      if (storedAddress && storedAddress !== manualAddress) {
        setManualAddress(storedAddress);
        setIsSynced(false);
        syncAttempted.current = false;
        console.log('TronLink address changed, will re-sync:', storedAddress);
      } else if (!storedAddress && manualAddress) {
        setManualAddress(null);
        console.log('TronLink address removed from storage');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [manualAddress]);

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

  // Check if we need to sync on manual address change
  useEffect(() => {
    if (manualAddress && status === "authenticated" && !isSynced) {
      syncWalletAddress();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualAddress, status]);

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

  // Periodically check localStorage for updates (handles cases where storage event might not fire)
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (typeof window !== 'undefined') {
        const storedAddress = localStorage.getItem(STORED_WALLET_KEY);
        if (storedAddress && storedAddress !== manualAddress) {
          setManualAddress(storedAddress);
          setIsSynced(false);
          syncAttempted.current = false;
        } else if (!storedAddress && manualAddress) {
          setManualAddress(null);
        }
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(intervalId);
  }, [manualAddress]);

  return null;
};

export default WalletAddressSync;
