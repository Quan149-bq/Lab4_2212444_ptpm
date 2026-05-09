"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
}

export function ImageUpload({ onUploadSuccess }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Bạn phải chọn một hình ảnh để upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file lên bucket 'blog-images'
      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Lấy URL công khai của ảnh
      const { data } = supabase.storage
        .from("blog-images")
        .getPublicUrl(filePath);

      onUploadSuccess(data.publicUrl);
      alert("Upload ảnh thành công!");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-md">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {uploading ? "Đang tải lên..." : "Thêm ảnh minh họa vào bài viết"}
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
    </div>
  );
}
