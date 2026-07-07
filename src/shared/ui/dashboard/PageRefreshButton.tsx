"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { DataRefreshButton } from "@/shared/ui/dashboard/DataRefreshButton";


export function PageRefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <DataRefreshButton
      onClick={handleRefresh}
      isRefreshing={isPending}
      ariaLabel="Reload this section from the server"
    />
  );
}