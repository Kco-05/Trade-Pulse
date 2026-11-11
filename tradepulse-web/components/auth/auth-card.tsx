"use client";

import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { BorderBeam } from "@/components/ui/border-beam";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AuthTab = "login" | "signup";

type AuthCardProps = {
  defaultTab?: AuthTab;
};

export function AuthCard({ defaultTab = "login" }: AuthCardProps) {
  return (
    <Card className="relative overflow-hidden border-zinc-800 bg-zinc-900/50 shadow-none">
      <BorderBeam
        size={80}
        duration={8}
        colorFrom="#34d399"
        colorTo="#71717a"
        borderWidth={1.5}
      />
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Welcome to TradePulse</CardTitle>
        <CardDescription>
          Simulated market trading with virtual funds. Auth is simplified for
          this lab — no JWT.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="mt-4">
            <LoginForm />
          </TabsContent>
          <TabsContent value="signup" className="mt-4">
            <SignupForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
