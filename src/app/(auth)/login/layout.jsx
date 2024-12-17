"use client";
import React, { use, useEffect, useState } from "react";
import useAuth from "@/hooks/use-auth";
import { redirect } from "next/navigation";
import { LayoutDefault } from "@/layouts";
import { set } from "zod";
import LoadingSpinner from "@/components/loading";

const LoginLayout = ({ children }) => {
  const { checkIsLoggedIn, user, ensureTokenValidity } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (checkIsLoggedIn() && ensureTokenValidity()) {
      setIsLoggedIn(false);
    }
    setIsLoading(false);
  }, [checkIsLoggedIn, ensureTokenValidity, user]);

  if (isLoading)
    return (
      <LayoutDefault>
        <LoadingSpinner />
      </LayoutDefault>
    );

  if (isLoggedIn) {
    redirect("/profile");
    return;
  }

  return <LayoutDefault>{children}</LayoutDefault>;
};

export default LoginLayout;
