"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { LayoutDefault } from "@/layouts";
import useAuth from "@/hooks/use-auth";
import { SERVER_URL } from "@/contains";
import LoadingSpinner from "@/components/loading";
import notify from "@/components/notifications";
import profileTab from "./profile-tabs";
import { redirect, useSearchParams } from "next/navigation";
import { ProfileComponent } from "./profile-component";
import AddressComponent from "./address-component";
import OrderComponent from "./order-component";

const ProfilePageContent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState(profileTab[0]);
  const [profile, setProfile] = useState({
    id: "",
    email: "",
    name: "",
    role: "",
    avatar: "",
    phone: "",
    created_at: "",
    updated_at: "",
  });

  const { checkIsLoggedIn, user } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  useEffect(() => {
    if (tabParam) setActiveTab(tabParam);
  }, [tabParam]);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      if (checkIsLoggedIn()) {
        const response = await fetch(`${SERVER_URL}/user/detail/${user.id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!response.ok) {
          notify("error", "Đã xảy ra lỗi khi tải thông tin cá nhân");
          setIsLoggedIn(false);
          setIsLoading(false);
          return;
        }
        const data = await response.json();
        setProfile((prev) => ({ ...prev, ...data }));
        setIsLoggedIn(true);
      }
      setIsLoading(false);
    };
    loadProfile();
  }, [user]);

  if (isLoading) {
    return (
      <LayoutDefault>
        <LoadingSpinner />
      </LayoutDefault>
    );
  }

  if (!isLoggedIn) {
    return (
      <LayoutDefault>
        <div className="flex flex-col justify-center w-full h-[60vh] p-10 text-center gap-4">
          <h1 className="text-2xl font-bold">Bạn chưa đăng nhập</h1>
          <Link href="/login" className="text-blue-500">
            Đăng nhập ngay
          </Link>
        </div>
      </LayoutDefault>
    );
  }

  return (
    <LayoutDefault>
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-5 p-5">
        <div className="md:col-span-1 lg:col-span-1">
          <div className="bg-white p-5 rounded-lg shadow-md">
            <div className="flex w-full items-center gap-5">
              <div className="relative w-16 h-16 md:hidden lg:block">
                <Image
                  src={profile.avatar || "/icons/user.png"}
                  alt="Avatar"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full border border-gray-200 overflow-hidden"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold">{profile.name}</h2>
                <p className="text-gray-800">{profile.email}</p>
              </div>
            </div>
            <div className="flex md:flex-col mt-5">
              {profileTab.map((tab, index) => (
                <div
                  key={index}
                  className={`p-2 cursor-pointer ${
                    activeTab === tab ? "text-blue-500 font-bold" : "text-black"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="md:col-span-3 lg:col-span-3 shadow-md min-h-5 p-5">
          {activeTab === "Hồ sơ" && (
            <ProfileComponent profile={profile} setProfile={setProfile} />
          )}
          {activeTab === "Địa chỉ" && <AddressComponent />}
          {activeTab === "Đơn hàng" && <OrderComponent />}
          {!["Hồ sơ", "Địa chỉ", "Đơn hàng"].includes(activeTab) &&
            redirect("/404")}
        </div>
      </div>
    </LayoutDefault>
  );
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProfilePageContent />
    </Suspense>
  );
}
