import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LogOut,
  Store,
  UtensilsCrossed,
  CheckCircle2,
  Lock,
} from "lucide-react";

export function RestaurantDashboardPlaceholder() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <UtensilsCrossed className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight text-foreground">
              Chowly Restaurant Portal
            </span>
            <span className="text-xs text-muted-foreground">
              Kitchen Display & Menu Management
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-xs">
              {user?.name?.slice(0, 2).toUpperCase() ?? "RO"}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-medium text-foreground leading-tight">
                {user?.name}
              </span>
              <span className="text-xs text-muted-foreground">{user?.email}</span>
            </div>
            <Badge variant="outline" className="capitalize text-xs font-semibold">
              <Store className="size-3 text-primary mr-1" />
              {user?.role}
            </Badge>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void logout()}
            className="gap-1.5"
          >
            <LogOut className="size-3.5" data-icon="inline-start" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6 max-w-6xl flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome, {user?.name}!
          </h1>
          <p className="text-muted-foreground">
            You are authenticated as a Restaurant Partner. Route guards are active.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Partner Session
                </CardTitle>
                <CheckCircle2 className="size-4 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">Authenticated</div>
              <p className="text-xs text-muted-foreground mt-1">
                Connected to Chowly Restaurant Partner API.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Assigned Role
                </CardTitle>
                <Lock className="size-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground capitalize">
                {user?.role}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Protected kitchen order stream & menu edit permissions.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Kitchen Display & Incoming Orders</CardTitle>
            <CardDescription>
              Real-time incoming orders with Socket.IO will be integrated in Phase 6.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    </div>
  );
}
