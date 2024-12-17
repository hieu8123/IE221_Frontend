"use client";
import React, { useState, useEffect, use, useRef } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useDropzone } from "react-dropzone"; // Sử dụng react-dropzone để hỗ trợ drag and drop

import { storage } from "@/utils/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Image from "next/legacy/image";
import { SERVER_URL } from "@/contains";
import dynamic from "next/dynamic";
import { set, z } from "zod";
import notify from "../notifications";

const Editor = dynamic(() => import("@/components/editor/editor"), {
  ssr: false,
});

const productSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm không được để trống"), // Ensure product name is not empty
  price: z.number().min(1, "Giá không được để trống và phải là số dương"), // Ensure price is a positive number
  oldprice: z.number().min(1, "Giá cũ không được để trống và phải là số dương"), // Ensure old price is a positive number
  quantity: z
    .number()
    .min(0, "Số lượng không được để trống và phải là số dương"), // Ensure quantity is a positive number
  category_id: z.number().min(1, "Danh mục không được để trống"), // Thêm kiểm tra chuỗi trống
  brand_id: z.number().min(1, "Thương hiệu không được để trống"), // Ensure brand is selected
  description: z.string().min(1, "Mô tả sản phẩm không được để trống"), // Ensure description is not empty
  specification: z.string().min(1, "Thông số kỹ thuật không được để trống"), // Ensure specification is not empty
});

const initialProduct = {
  id: "",
  name: "",
  category_id: "",
  category: { name: "" },
  brand_id: "",
  brand: { name: "" },
  price: 0,
  oldprice: 0,
  images: [],
  description: "",
  specification: "",
  buyturn: 0,
  quantity: 0,
  created_at: "",
  updated_at: "",
};

const ProductModal = ({ open, onClose, productId, categories, brands }) => {
  const [loading, setLoading] = useState(false);
  const [localProduct, setLocalProduct] = useState(initialProduct);
  const [files, setFiles] = useState([]);
  const [error, setErrors] = useState(null);
  const [defaultDescription, setDefaultDescription] = useState(
    localProduct?.description
  );
  const [defaultSpecification, setDefaultSpecification] = useState(
    localProduct?.specification
  );
  const descriptionRef = useRef(null);
  const specificationRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/product/${productId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        setLocalProduct(data);
        setDefaultDescription(data.description);
        setDefaultSpecification(data.specification);
      } catch (error) {
        console.error("Failed to fetch product", error);
      }
    };
    if (productId) {
      fetchProduct();
    } else {
      setLocalProduct(initialProduct);
    }
    setErrors(null);
  }, [productId]);

  // Xử lý thay đổi giá trị trong form
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "price" || name === "oldprice" || name === "quantity") {
      setLocalProduct((prev) => ({
        ...prev,
        [name]: parseInt(value),
      }));
      return;
    }
    setLocalProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý thay đổi hình ảnh (drag-and-drop)
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => setFiles(acceptedFiles),
    multiple: true,
    accept: "image/*",
  });

  const handleFileDelete = (fileToDelete) => {
    setFiles(files.filter((file) => file !== fileToDelete));
  };

  const handleBase64Images = async (description) => {
    const imgRegex = /<img.*?src="(data:image\/[a-zA-Z]*;base64[^"]*)".*?>/g;
    let match;
    const base64Images = [];

    while ((match = imgRegex.exec(description)) !== null) {
      base64Images.push(match[1]); // Lấy base64 string
    }

    const uploadedImageURLs = await Promise.all(
      base64Images.map(async (base64) => {
        const imageBlob = await fetch(base64).then((res) => res.blob());
        const imageFile = new File([imageBlob], `image-${Date.now()}.png`, {
          type: "image/png",
        });
        return upLoadFileToFirebase(imageFile);
      })
    );

    let updatedDescription = description;
    uploadedImageURLs.forEach((url, index) => {
      updatedDescription = updatedDescription.replace(base64Images[index], url);
    });

    return updatedDescription;
  };

  const createdProduct = async (data) => {
    try {
      const response = await fetch(`${SERVER_URL}/product/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const result = await response.json();
      if (response.ok) {
        notify("success", "Thêm sản phẩm thành công");
        return result;
      }
      notify("error", "Thêm sản phẩm thất bại");
      throw new Error(result.message);
    } catch (error) {
      notify("error", "Thêm sản phẩm thất bại");
      console.error("Failed to create product", error);
      throw error;
    }
  };

  const updatedProduct = async (data) => {
    try {
      const response = await fetch(
        `${SERVER_URL}/product/update/${productId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        }
      );
      const result = await response.json();
      if (response.ok) {
        notify("success", "Cập nhật sản phẩm thành công");
        return result;
      }
      notify("error", "Cập nhật sản phẩm thất bại");
      throw new Error(result.message);
    } catch (error) {
      notify("error", "Cập nhật sản phẩm thất bại");
      console.error("Failed to update product", error);
      throw error;
    }
  };

  // Gửi thông tin sản phẩm (thêm mới hoặc cập nhật)
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const validationResult = productSchema.safeParse(localProduct);

      // Nếu localProduct là null hoặc không hợp lệ theo schema
      if (!validationResult.success || !localProduct) {
        const errorMessages = {};

        if (!localProduct) {
          errorMessages["product"] = "Sản phẩm không hợp lệ";
        }

        // Thêm lỗi từ validation schema
        validationResult.error.errors.forEach((err) => {
          errorMessages[err.path[0]] = err.message;
        });

        // Kiểm tra nếu không có ảnh nào được chọn
        if ((localProduct?.images?.length ?? 0) + files.length === 0) {
          errorMessages["images"] = "Vui lòng chọn ít nhất một ảnh sản phẩm";
        }

        setErrors(errorMessages); // Lưu các lỗi validation
        setLoading(false);
        return;
      }
      const localUploadImages = await Promise.all(
        files.map((file) => upLoadFileToFirebase(file))
      );
      const updatedDescription = await handleBase64Images(
        localProduct.description
      );
      const newData = {
        ...localProduct,
        description: updatedDescription,
        images: [...(localProduct.images ?? []), ...localUploadImages],
      };
      if (productId) {
        await updatedProduct(newData);
      } else {
        await createdProduct(newData);
      }

      console.log("newData", newData);
      setLoading(false);
      setFiles([]);
      setErrors(null);
      onClose(); // Đóng modal khi gửi thành công
    } catch (error) {
      setLoading(false);
      console.error("Error submitting product", error);
    }
  };

  const upLoadFileToFirebase = async (file) => {
    const storageRef = ref(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => {
          console.error("Error uploading file", error);
          reject(error); // Reject the promise on error
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("File available at", downloadURL);
            resolve(downloadURL); // Resolve the promise with the download URL
          } catch (error) {
            reject(error); // Reject the promise if there's an error in getting the URL
          }
        }
      );
    });
  };

  const handleDescriptionChange = (newContent) => {
    setLocalProduct((prev) => ({
      ...prev,
      description: newContent,
    }));
  };

  const handleSpecificationChange = (newContent) => {
    setLocalProduct((prev) => ({
      ...prev,
      specification: newContent,
    }));
  };

  useEffect(() => {
    console.log("localProduct", localProduct);
  }, [localProduct]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="flex items-center justify-center"
    >
      <Box className="h-[100vh] w-[80vw] bg-white p-4 rounded-lg overflow-y-auto">
        <Typography variant="h6" component="h2" mb={2}>
          {productId ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
        </Typography>
        {error?.name && <p className="text-red-500">{error.name}</p>}
        <TextField
          label="Tên sản phẩm"
          name="name"
          value={localProduct?.name || ""}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
        />
        {error?.price && <p className="text-red-500">{error.price}</p>}
        <TextField
          label="Giá"
          name="price"
          value={localProduct?.price || ""}
          onChange={handleChange}
          variant="outlined"
          type="number"
          fullWidth
          sx={{ mb: 2 }}
        />

        {error?.oldprice && <p className="text-red-500">{error.oldprice}</p>}
        <TextField
          label="Giá cũ"
          name="oldprice"
          value={localProduct?.oldprice || ""}
          onChange={handleChange}
          variant="outlined"
          type="number"
          fullWidth
          sx={{ mb: 2 }}
        />

        {/* Kéo và thả ảnh */}
        {error?.images && <p className="text-red-500">{error.images}</p>}
        <div
          {...getRootProps()}
          style={{
            border: "2px dashed #ccc",
            padding: "20px",
            marginBottom: "16px",
          }}
          className="w-[50%] h-[200px] flex justify-center items-center mx-auto "
        >
          <input {...getInputProps()} />
          <Typography>Kéo và thả ảnh vào đây hoặc click để chọn ảnh</Typography>
        </div>

        {/* Hiển thị ảnh đã chọn */}
        {
          <Box>
            <Box
              sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}
              className="justify-center"
            >
              {localProduct &&
                localProduct?.images &&
                localProduct?.images.map((image, index) => (
                  <Box key={index} sx={{ position: "relative" }}>
                    <Image
                      src={image}
                      alt={`image-${index}`}
                      width={100}
                      height={100}
                    />
                    <button
                      className="absolute top-1 right-1 transform translate-x-1/2 -translate-y-1/2 bg-gray-400 text-white rounded-full w-6 "
                      onClick={() =>
                        setLocalProduct((prev) => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      X
                    </button>
                  </Box>
                ))}
              {files.length > 0 &&
                files.map((file, index) => (
                  <Box key={index} sx={{ position: "relative" }}>
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`image-${index}`}
                      width={100}
                      height={100}
                    />
                    <button
                      className="absolute top-1 right-1 transform translate-x-1/2 -translate-y-1/2 bg-gray-400 text-white rounded-full w-6 "
                      onClick={() => handleFileDelete(file)}
                    >
                      X
                    </button>
                  </Box>
                ))}
            </Box>
          </Box>
        }

        <Box className="">
          <Typography variant="body1" sx={{ mt: 2 }}>
            Mô tả sản phẩm
          </Typography>
          {error?.description && (
            <p className="text-red-500">{error.description}</p>
          )}
          <Editor
            ref={descriptionRef}
            defaultValue={defaultDescription}
            onTextChange={handleDescriptionChange}
          />
        </Box>
        <Box className="">
          {error?.specification && (
            <p className="text-red-500">{error.specification}</p>
          )}
          <Typography variant="body1" sx={{ mt: 2 }}>
            Thông số kỹ thuật
          </Typography>
          <Editor
            ref={specificationRef}
            defaultValue={defaultSpecification}
            onTextChange={handleSpecificationChange}
          />
        </Box>

        {error?.quantity && <p className="text-red-500">{error.quantity}</p>}
        <TextField
          label="Số lượng"
          name="quantity"
          value={localProduct?.quantity || 0}
          onChange={handleChange}
          variant="outlined"
          type="number"
          fullWidth
          sx={{ mb: 2 }}
        />

        {error?.category_id && (
          <p className="text-red-500">{error.category_id}</p>
        )}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Danh mục</InputLabel>
          <Select
            label="Danh mục"
            name="category_id"
            value={localProduct?.category_id || ""}
            onChange={handleChange}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {error?.brand_id && <p className="text-red-500">{error.brand_id}</p>}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Thương hiệu</InputLabel>
          <Select
            label="Thương hiệu"
            name="brand_id"
            value={localProduct?.brand_id || ""}
            onChange={handleChange}
          >
            {brands.map((brand) => (
              <MenuItem key={brand.id} value={brand.id}>
                {brand.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="outlined"
            onClick={() => {
              onClose();
              setFiles([]);
              setLocalProduct(initialProduct);
            }}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : productId ? (
              "Cập nhật sản phẩm"
            ) : (
              "Thêm sản phẩm"
            )}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ProductModal;
