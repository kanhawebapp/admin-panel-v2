"use client";

import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";

import TapEditor from "@/components/Custom/TapEditor";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  GET_DISCLAIMER_PAGE,
  UPSERT_DISCLAIMER_PAGE,
} from "@/app/graphQL/managecms";
import toast from "react-hot-toast";

export default function DisclaimerAdminPage() {
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      title: "",

      content: "",

      metaTitle: "",

      metaDescription: "",

      keywords: [],

      status: "DRAFT",
    },
  });

  // =========================
  // GET PAGE
  // =========================

const { data, loading, refetch } = useQuery(GET_DISCLAIMER_PAGE);

  // =========================
  // UPSERT
  // =========================

  const [upsertDisclaimerPage, { loading: updateLoading }] = useMutation(
    UPSERT_DISCLAIMER_PAGE,
  );

  // =========================
  // RESET DATA
  // =========================

  useEffect(() => {
    if (data?.getDisclaimerPage) {
      reset({
        title: data.getDisclaimerPage.title || "",
        content: data.getDisclaimerPage.content || "",
        metaTitle: data.getDisclaimerPage.metaTitle || "",
        metaDescription: data.getDisclaimerPage.metaDescription || "",
        keywords: data.getDisclaimerPage.keywords || [],
        status: data.getDisclaimerPage.status || "DRAFT",
      });

      setIsEditing(false);
    } else {
      // First time create
      setIsEditing(true);
    }
  }, [data, reset]);

  // =========================
  // SUBMIT
  // =========================

  const onSubmit = async (values) => {
    try {
      const payload = {
        ...values,

        keywords:
          typeof values.keywords === "string"
            ? values.keywords.split(",").map((item) => item.trim())
            : values.keywords,
      };

     await upsertDisclaimerPage({
  variables: {
    input: payload,
  },
});

await refetch();

setIsEditing(false);

toast.success("Updated Successfully");
    } catch (error) {
      console.log(error);

      alert("Something went wrong");
    }
  };

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="p-10 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Disclaimer CMS</h1>

         {data?.getDisclaimerPage && (
  <button
    type="button"
    onClick={() => setIsEditing(!isEditing)}
    className={`px-5 py-2 text-white rounded-lg ${
      isEditing ? "bg-gray-500" : "bg-blue-600"
    }`}
  >
    {isEditing ? "Cancel Edit" : "Edit Disclaimer"}
  </button>
)}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* ================= TITLE ================= */}

          <div className="space-y-4">
            <label className="font-semibold">Page Title</label>

            <input
              {...register("title")}
              disabled={!isEditing}
              placeholder="Disclaimer"
              className="border  border-gray-300 p-4 rounded-xl w-full"
            />
          </div>

          {/* ================= CONTENT ================= */}

          <div className="space-y-4">
            <label className="font-semibold">Disclaimer Content</label>

            <TapEditor
              value={watch("content")}
            editable={isEditing}
              onChange={(value) => setValue("content", value)}
              placeholder="Disclaimer content"
            />
          </div>

          {/* ================= SEO ================= */}

          <div className="border border-gray-300 rounded-2xl p-6 space-y-6">
            <h2 className="text-2xl font-semibold">SEO</h2>

            <input
              {...register("metaTitle")}
              disabled={!isEditing}
              placeholder="Meta Title"
              className="border border-gray-300 p-4 rounded-xl w-full"
            />

            <textarea
              {...register("metaDescription")}
              disabled={!isEditing}
              placeholder="Meta Description"
              className="border border-gray-300 p-4 rounded-xl w-full h-40"
            />

            <input
              disabled={!isEditing}
              {...register("keywords")}
              placeholder="keyword1, keyword2"
              className="border border-gray-300 p-4 rounded-xl w-full"
            />

            <select
              {...register("status")}
              disabled={!isEditing}
              className="border border-gray-300 p-4 rounded-xl w-full"
            >
              <option value="DRAFT">Draft</option>

              <option value="PUBLISHED">Published</option>
            </select>
          </div>

          {/* ================= SUBMIT ================= */}

          {isEditing && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);

                  reset({
                    title: data?.getDisclaimerPage?.title || "",
                    content: data?.getDisclaimerPage?.content || "",
                    metaTitle: data?.getDisclaimerPage?.metaTitle || "",
                    metaDescription:
                      data?.getDisclaimerPage?.metaDescription || "",
                    keywords: data?.getDisclaimerPage?.keywords || [],
                    status: data?.getDisclaimerPage?.status || "DRAFT",
                  });
                }}
               className=" border border-gray-300 rounded-full  text-black px-5 text-sm cursor-pointer  py-2"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={updateLoading}
               className="bg-purple-600 rounded-full  text-white px-5 text-sm cursor-pointer  py-2"
              >
                {updateLoading
                  ? "Saving..."
                  : data?.getDisclaimerPage
                    ? "Update Disclaimer"
                    : "Create Disclaimer"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
