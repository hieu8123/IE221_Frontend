"use client";
import Image from "next/legacy/image";
import React, { useEffect, useState } from "react";
import { storage, ref, uploadBytes, getDownloadURL } from "@/utils/firebase";
import notify from "@/components/notifications";
import SubmitButton from "@/components/buttons/submit-button";
import LoadingSpinner from "@/components/loading";
import { SERVER_URL } from "@/contains";

const ProfileComponent = ({ profile, setProfile }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(profile?.avatar || "");
  const [isChangedAvatar, setIsChangedAvatar] = useState(false);
  const [userName, setUserName] = useState(profile?.name || "");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      notify("error", "Dung lượng file vượt quá 1 MB!");
      return;
    }
    setSelectedFile(file);
    setIsChangedAvatar(true);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleFileUpload = async () => {
    const file = selectedFile;
    if (!isChangedAvatar) return profile.avatar;
    if (!file) return profile.avatar;

    try {
      setUploading(true);

      // Tạo reference cho file trong Firebase Storage
      const fileRef = ref(storage, `avatars/${file.name}`);

      // Upload file
      await uploadBytes(fileRef, file);

      // Lấy URL tải về của file sau khi upload
      const url = await getDownloadURL(fileRef);

      console.log("URL:", url);

      // Cập nhật profile với URL ảnh mới
      setProfile({ ...profile, avatar: url });
      setIsChangedAvatar(false);
      return url;
    } catch (error) {
      console.error("Lỗi khi tải lên file:", error);
      notify("error", "Lỗi khi tải lên file");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setUploading(true);
      if (userName == null || userName.trim() === "") {
        notify("error", "Họ và tên không được để trống");
        setUploading(false);
        return;
      }
      await setProfile({ ...profile, name: userName });
      const url = await handleFileUpload();
      const updatedProfile = { ...profile, avatar: url, name: userName };

      if (JSON.stringify(updatedProfile) === JSON.stringify(profile)) {
        setUploading(false);
        return;
      }
      console.log("profile", updatedProfile);
      const response = await fetch(`${SERVER_URL}/user/update/${profile.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedProfile),
      });
      if (!response.ok) {
        console.error("Error updating profile:", response.statusText);
        setUploading(false);
        notify("error", "Đã xảy ra lỗi khi cập nhật thông tin cá nhân");
        return;
      }
      const data = await response.json();
      setProfile(data);
      notify("success", "Cập nhật thông tin cá nhân thành công");
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin cá nhân:", error);
      notify("error", "Lỗi khi cập nhật thông tin cá nhân");
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Thông tin cá nhân</h1>
        <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
      </div>
      <div className="w-full h-[2px] bg-orange-500 rounded-sm"></div>
      <div className="flex flex-col-reverse md:flex-row w-full h-full gap-5">
        <div className="w-full md:w-[60%]">
          <label className="block text-sm text-gray-500 mb-1">Họ và tên</label>
          <input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <label className="block text-sm text-gray-500 mt-3 mb-1">Email</label>
          <input
            value={profile.email}
            disabled={true}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
          />

          <label className="block text-sm text-gray-500 mt-3 mb-1">
            Số điện thoại
          </label>
          <input
            disabled={true}
            value={profile.phone || ""}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <SubmitButton
            onClick={handleUpdateProfile}
            isLoading={uploading}
            className="mt-5"
          >
            Cập nhật thông tin
          </SubmitButton>
        </div>
        <div className="h-[1px] w-full  md:h-[300px] md:w-[1px] justify-self-center bg-slate-400"></div>
        <div className="w-full flex flex-col items-center md:w-[40%]">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <div className="flex flex-col items-center space-y-4">
              {/* Profile Picture Placeholder */}
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <Image
                  src={previewUrl || "/icons/user.png"}
                  alt="Profile Picture"
                  width={96}
                  height={96}
                  className="rounded-full object-cover"
                />
              </div>

              {/* Upload Button */}
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500"
              >
                Chọn Ảnh
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/jpeg, image/png"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* File Information */}
              <p className="text-sm text-gray-500 text-center">
                Dung lượng file tối đa 1 MB
                <br />
                Định dạng: .JPEG, .PNG
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ProfileComponent };
