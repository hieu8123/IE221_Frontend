"use client";
import React from "react";
import useAuth from "@/hooks/use-auth";
import { redirect } from "next/navigation";
import { LayoutDefault } from "@/layouts";

const SigninLayout = ({ children }) => {
  const { checkIsLoggedIn } = useAuth();

  if (checkIsLoggedIn()) {
    redirect("/");
  }
  return <LayoutDefault>{children}</LayoutDefault>;
};

export default SigninLayout;
