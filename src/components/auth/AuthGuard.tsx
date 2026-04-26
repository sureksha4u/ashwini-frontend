"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const publicPaths = ["/", "/onboard"];
    const token = localStorage.getItem("ashwini_token");

    if (!token && !publicPaths.includes(pathname)) {
      setIsAuthorized(false);
      router.push("/");
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  if (isAuthorized === null) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-page">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  // Mandatory lockdown: Never render children if unauthorized on a non-public path
  if (!isAuthorized && !["/", "/onboard"].includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}
