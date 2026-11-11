"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { useBalance } from "@/lib/api/hooks";
import { formatCurrency } from "@/lib/formatCurrency";
import { destroySession } from "@/lib/session/client";
import { useSessionStore } from "@/lib/stores/session";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

function titleFromPath(pathname: string): string {
  if (pathname.startsWith("/history")) {
    return "History";
  }
  if (pathname.startsWith("/portfolio")) {
    return "Portfolio";
  }
  return "TradePulse";
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const userId = useSessionStore((s) => s.userId);
  const username = useSessionStore((s) => s.username);
  const clearSession = useSessionStore((s) => s.clearSession);
  const balanceQuery = useBalance(userId);

  const initials = (username ?? "TP").slice(0, 2).toUpperCase();

  async function handleLogout() {
    try {
      await destroySession();
      clearSession();
      toast.success("Signed out");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Could not sign out");
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-zinc-800 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{titleFromPath(pathname)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-xs text-muted-foreground">Cash</p>
          {balanceQuery.isLoading ? (
            <Skeleton className="ml-auto h-4 w-20" />
          ) : balanceQuery.data ? (
            <p className="text-sm font-medium tabular-nums text-foreground">
              {formatCurrency(balanceQuery.data.walletBalance)}
            </p>
          ) : (
            <p className="text-sm tabular-nums text-muted-foreground">—</p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="Open account menu"
              />
            }
          >
            <Avatar size="sm">
              <AvatarFallback className="bg-zinc-800 text-zinc-100">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-48">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-foreground">
                  {username ?? "Account"}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {userId != null ? `User #${userId}` : "Session loading…"}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
