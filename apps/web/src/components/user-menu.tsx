import { Loader2, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

export default function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  if (isPending) {
    return <Loader2 className="h-8 w-8 animate-spin" />;
  }

  if (!session?.user) {
    return null;
  }

  const displayName = session.user.name || session.user.email || address;
  const maskedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : session.user.email;

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
        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 font-medium text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        data-testid="user-menu"
      >
        <User className="mr-2 h-4 w-4" />
        {maskedAddress || "User"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="font-medium text-sm leading-none">{displayName}</p>
            <p className="text-muted-foreground text-xs leading-none">
              {session.user.email}
            </p>
            <p className="mt-1 text-muted-foreground text-xs leading-none">
              Role: {session.user.role || "user"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem data-testid="sign-out" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
