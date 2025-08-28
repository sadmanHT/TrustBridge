import { disconnect } from "wagmi/actions";
import { config } from "./wagmi";

/**
 * Attaches wallet event listeners to handle account changes
 * If user disconnects in MetaMask UI, reflects it in the app
 */
export function attachWalletListeners(ethereum?: { on?: (event: string, callback: (accounts: string[]) => void) => void; removeAllListeners?: (event: string) => void }) {
  if (!ethereum?.on) return;
  
  ethereum.removeAllListeners?.("accountsChanged");
  ethereum.on("accountsChanged", (accounts: string[]) => {
    // if user disconnects in MetaMask UI, reflect it in app
    if (!accounts || accounts.length === 0) {
      // optionally call disconnect() to keep wagmi in sync
      disconnect(config).catch(() => {});
    }
  });
}

/**
 * Initialize wallet listeners on app load
 */
export function initializeWalletListeners() {
  if (typeof window !== "undefined" && window.ethereum) {
    attachWalletListeners(window.ethereum);
  }
}