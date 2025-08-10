
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "admin" | "staff" | null;
export type User = {
  email: string;
  name: string;
  role: UserRole;
}

export function useAuth(requiredRole: UserRole) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    const user: User | null = userString ? JSON.parse(userString) : null;
    if (user?.role !== requiredRole) {
      router.push("/");
    } else {
      setIsAuthorized(true);
    }
  }, [requiredRole, router]);

  return isAuthorized;
}

export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        const userString = localStorage.getItem("user");
        if (userString) {
            setUser(JSON.parse(userString));
        }
    }, []);
    return user;
}
