"use client";

import { LineChart } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type EmptyTradeCtaProps = {
  title: string;
  description: string;
};

export function EmptyTradeCta({ title, description }: EmptyTradeCtaProps) {
  return (
    <Card className="bg-zinc-900/50 ring-zinc-800">
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
          <LineChart className="size-5" aria-hidden />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pb-6">
        <Button render={<Link href="/market" />} nativeButton={false}>
          Make your first trade
        </Button>
      </CardContent>
    </Card>
  );
}
