import { signOut } from "next-auth/react";
import { getAccount, disconnect } from "wagmi/actions";
import { config } from "./wagmi";

/**
 * Unified sign-out function that handles both NextAuth logout and wallet disconnection
 * Clears all wallet sessions and caches to prevent auto-reconnect
 */
export async function signOutAndDisconnect() {
  try {
    // 1) Disconnect wagmi connector if connected
    const account = getAccount(config);
    if (account?.isConnected) {
      await disconnect(config); // disconnects current connector (e.g., injected/MetaMask, WalletConnect)
    }

    // 2) Proactively clear WalletConnect & wagmi caches to avoid auto-reconnect
    try {
      // Common WalletConnect v2 cache keys
      localStorage.removeItem("wagmi.store");
      localStorage.removeItem("wc@2:client:0.3//session"); // sometimes used
      Object.keys(localStorage).forEach(k => {
        if (
          k.startsWith("wc@2") ||      // walletconnect v2
          k.startsWith("walletconnect") ||
          k.startsWith("wagmi.") ||    // older wagmi keys
          k === "wagmi.store"
        ) localStorage.removeItem(k);
      });
    } catch {
      /* ignore storage errors */
    }

    // 3) Sign out of NextAuth and redirect home
    await signOut({ redirect: true, callbackUrl: "/" });
  } catch {
    // Fallback: at least try to sign out
    await signOut({ redirect: true, callbackUrl: "/" });
  }
}