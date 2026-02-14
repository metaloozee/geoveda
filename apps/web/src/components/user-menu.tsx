import { convexQuery } from "@convex-dev/react-query";
import { api } from "@geoveda/backend/convex/_generated/api";
import { useQuery } from "@tanstack/react-query";
import { Copy, Loader2, LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAccount, useDisconnect } from "wagmi";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

function truncateWalletAddress(walletAddress: string | undefined): string {
  if (!walletAddress) {
    return "Not available";
  }

  if (walletAddress.length <= 12) {
    return walletAddress;
  }

  return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
}

export default function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { address } = useAccount();
  const { data: appUser } = useQuery(convexQuery(api.users.getCurrent, {}));
  const { disconnect } = useDisconnect();

  if (isPending) {
    return <Loader2 className="h-8 w-8 animate-spin" />;
  }

  if (!session?.user) {
    return null;
  }

  const displayName =
    appUser?.name?.trim() || session.user.name || session.user.email || "User";
  const walletAddress = appUser?.walletAddress ?? address;
  const truncatedWalletAddress = truncateWalletAddress(walletAddress);

  const handleOpenSettings = () => {
    router.push("/settings" as never);
  };

  const handleCopyWalletAddress = async () => {
    if (!walletAddress) {
      return;
    }

    try {
      await navigator.clipboard.writeText(walletAddress);
      toast.success("Wallet address copied");
    } catch {
      toast.error("Failed to copy wallet address");
    }
  };

  const handleSignOut = async () => {
    disconnect(); // Disconnect Wagmi
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/dashboard");
        },
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 font-medium text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        data-testid="user-menu"
      >
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="max-w-[8rem] truncate">{displayName}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px]">
              {truncatedWalletAddress}
            </span>
            <Button
              aria-label="Copy wallet address"
              className="h-4 w-4 p-0"
              disabled={!walletAddress}
              onClick={handleCopyWalletAddress}
              size="icon-xs"
              type="button"
              variant="ghost"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          data-testid="profile-settings"
          onClick={handleOpenSettings}
        >
          <Settings className="h-4 w-4" />
          <span>Profile & Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem data-testid="sign-out" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
