"use client";
import useAuth from "@/hooks/use-auth";
import AdminHeader from "./header";
import Sidebar from "./sidebar";
import LoadingSpinner from "@/components/loading";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }) {
  const { user, checkIsAdmin, ensureTokenValidity } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (checkIsAdmin() && ensureTokenValidity()) {
      setIsLoading(false);
      setIsAdmin(true);
    }
  }, [user]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    router.push("/");
    return <LoadingSpinner />;
  }

  return (
    <div className="grid grid-cols-6 gap-4">
      <Sidebar />
      <div className="col-span-5">
        <AdminHeader />
        <main>{children}</main>
      </div>
    </div>
  );
}
