import { Skeleton } from "@/components/ui/skeleton";

export default function PortfolioLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="h-4 w-72 max-w-full rounded-lg" />
      </div>

      <section className="space-y-3">
        <Skeleton className="h-4 w-20 rounded-lg" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </section>

      <section className="space-y-3">
        <Skeleton className="h-4 w-20 rounded-lg" />
        <Skeleton className="h-64 rounded-xl" />
      </section>

      <section className="space-y-3">
        <Skeleton className="h-4 w-36 rounded-lg" />
        <Skeleton className="h-72 rounded-xl" />
      </section>
    </div>
  );
}
