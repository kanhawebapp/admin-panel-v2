"use client";

import { useEffect, useState } from "react";

import { Controller, useFieldArray, useForm } from "react-hook-form";

import TapEditor from "@/components/Custom/TapEditor";
import { useMutation, useQuery } from "@apollo/client/react";
import { GET_ABOUT_PAGE, UPSERT_ABOUT_PAGE } from "@/app/graphQL/managecms";

export default function AboutPageAdmin() {
  const [isEditing, setIsEditing] = useState(false);

  const { register, control, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      heroTitle: "",

      heroDescription: "",

      mentors: [],

      founders: [],

      metaTitle: "",

      metaDescription: "",

      keywords: [],

      status: "DRAFT",
    },
  });

  // =========================
  // GET API
  // =========================

  const { data, loading: getLoading } = useQuery(GET_ABOUT_PAGE);

  // =========================
  // UPSERT API
  // =========================

  const [upsertAboutPage, { loading: updateLoading }] =
    useMutation(UPSERT_ABOUT_PAGE);

  // =========================
  // MENTORS
  // =========================

  const {
    fields: mentorFields,
    append: addMentor,
    remove: removeMentor,
  } = useFieldArray({
    control,
    name: "mentors",
  });

  // =========================
  // FOUNDERS
  // =========================

  const {
    fields: founderFields,
    append: addFounder,
    remove: removeFounder,
  } = useFieldArray({
    control,
    name: "founders",
  });

  // =========================
  // SET EXISTING DATA
  // =========================

  useEffect(() => {
    if (data?.getAboutPage) {
      reset({
        heroTitle: data.getAboutPage.heroTitle || "",
        heroDescription: data.getAboutPage.heroDescription || "",
        mentors: data.getAboutPage.mentors || [],
        founders: data.getAboutPage.founders || [],
        metaTitle: data.getAboutPage.metaTitle || "",
        metaDescription: data.getAboutPage.metaDescription || "",
        keywords: data.getAboutPage.keywords || [],
        status: data.getAboutPage.status || "DRAFT",
      });

      setIsEditing(false);
    } else {
      setIsEditing(true); // new page create mode
    }
  }, [data, reset]);

  // =========================
  // SUBMIT
  // =========================
  const onSubmit = async (values) => {
    try {
      // =========================
      // MENTORS IMAGE UPLOAD
      // =========================

      const updatedMentors = await Promise.all(
        values.mentors.map(async (mentor, index) => {
          let imageUrl = mentor.image;

          // NEW FILE
          if (mentor.image instanceof File) {
            const fd = new FormData();

            fd.append("mentorImage", mentor.image);

            const uploadRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/adminAuth/api/upload-documents`,
              {
                method: "POST",
                body: fd,
              },
            );

            const uploaded = await uploadRes.json();

            imageUrl = uploaded.mentorImage;
          }

          return {
            ...mentor,
            image: imageUrl,
          };
        }),
      );

      // =========================
      // FOUNDERS IMAGE UPLOAD
      // =========================

      const updatedFounders = await Promise.all(
        values.founders.map(async (founder, index) => {
          let imageUrl = founder.image;

          if (founder.image instanceof File) {
            const fd = new FormData();

            fd.append("founderImage", founder.image);

            const uploadRes = await fetch(
                          `${process.env.NEXT_PUBLIC_API_BASE_URL}/adminAuth/api/upload-documents`,
              {
                method: "POST",
                body: fd,
              },
            );

            const uploaded = await uploadRes.json();

            imageUrl = uploaded.founderImage;
          }

          return {
            ...founder,
            image: imageUrl,
          };
        }),
      );

      // =========================
      // FINAL PAYLOAD
      // =========================

      const payload = {
        ...values,

        mentors: updatedMentors,

        founders: updatedFounders,
      };

      // =========================
      // SAVE GRAPHQL
      // =========================

      const response = await upsertAboutPage({
        variables: {
          input: payload,
        },
      });

      console.log(response);

      alert("About Page Updated");
    } catch (error) {
      console.log(error);

      alert("Something went wrong");
    }
  };

  if (getLoading) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="p-10 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">About Page CMS</h1>

          {data?.getAboutPage && !isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg"
            >
              Edit About Page
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
          {/* ================= HERO ================= */}

          <div className="border border-gray-300 rounded-2xl p-6 space-y-6">
            <h2 className="text-2xl font-semibold">Hero Section</h2>

            <input
              {...register("heroTitle")}
              disabled={!isEditing}
              placeholder="Hero Title"
              className="border p-4 border-gray-300 rounded-xl w-full"
            />

            <TapEditor
              value={watch("heroDescription")}
              onChange={(value) => setValue("heroDescription", value)}
              placeholder="Hero Description"
            />
          </div>

          {/* ================= MENTORS ================= */}

          <div className="border border-gray-300 rounded-2xl p-6 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Mentors</h2>

              <button
                type="button"
                onClick={() =>
                  addMentor({
                    name: "",
                    designation: "",
                    image: "",
                    description: "",
                  })
                }
                className="bg-black text-white px-5 py-2 rounded-lg"
              >
                Add Mentor
              </button>
            </div>

            {mentorFields.map((item, index) => (
              <div key={item.id} className="border border-gray-300 rounded-xl p-5 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <input
                    {...register(`mentors.${index}.name`)}
                    placeholder="Name"
                    disabled={!isEditing}
                    className="border border-gray-300 p-4 rounded-xl"
                  />

                  <input
                    {...register(`mentors.${index}.designation`)}
                    placeholder="Designation"
                    disabled={!isEditing}
                    className="border border-gray-300 p-4 rounded-xl"
                  />
                </div>

                <Controller
                  name={`mentors.${index}.image`}
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-3">
                      {/* EXISTING IMAGE */}

                      {field.value && typeof field.value === "string" && (
                        <img
                          src={field.value}
                          className="w-28 h-28 rounded-xl object-cover"
                        />
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                      />
                    </div>
                  )}
                />

                <TapEditor
                  editable={isEditing}
                  value={watch(`mentors.${index}.description`)}
                  onChange={(value) =>
                    setValue(`mentors.${index}.description`, value)
                  }
                  placeholder="Description"
                />

                <button
                  type="button"
                  onClick={() => removeMentor(index)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* ================= FOUNDERS ================= */}

          <div className="border  border-gray-300 rounded-2xl p-6 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Founders</h2>

              <button
                type="button"
                onClick={() =>
                  addFounder({
                    name: "",
                    designation: "",
                    image: "",
                    description: "",
                  })
                }
                className="bg-black text-white px-5 py-2 rounded-lg"
              >
                Add Founder
              </button>
            </div>

            {founderFields.map((item, index) => (
              <div key={item.id} className="border border-gray-300 rounded-xl p-5 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <input
                    {...register(`founders.${index}.name`)}
                    placeholder="Name"
                    disabled={!isEditing}
                    className="border border-gray-300 p-4 rounded-xl"
                  />

                  <input
                    {...register(`founders.${index}.designation`)}
                    placeholder="Designation"
                    disabled={!isEditing}
                    className="border border-gray-300 p-4 rounded-xl"
                  />
                </div>

                <Controller
                  name={`founders.${index}.image`}
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-3">
                      {field.value && typeof field.value === "string" && (
                        <img
                          src={field.value}
                          className="w-28 h-28 rounded-xl object-cover"
                        />
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                      />
                    </div>
                  )}
                />

                <TapEditor
                  editable={isEditing}
                  value={watch(`founders.${index}.description`)}
                  onChange={(value) =>
                    setValue(`founders.${index}.description`, value)
                  }
                  placeholder="Description"
                />

                <button
                  type="button"
                  onClick={() => removeFounder(index)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* ================= SEO ================= */}

          <div className="border border-gray-300 rounded-2xl p-6 space-y-6">
            <h2 className="text-2xl font-semibold">SEO</h2>

            <input
              {...register("metaTitle")}
              placeholder="Meta Title"
              disabled={!isEditing}
              className="border border-gray-300 p-4 rounded-xl w-full"
            />

            <textarea
              {...register("metaDescription")}
              placeholder="Meta Description"
              disabled={!isEditing}
              className="border border-gray-300 p-4 rounded-xl w-full h-40"
            />

            <input
              {...register("keywords")}
              disabled={!isEditing}
              placeholder="keyword1, keyword2"
              className="border border-gray-300 p-4 rounded-xl w-full"
            />

            <select
              {...register("status")}
              className="border border-gray-300 p-4 rounded-xl w-full"
            >
              <option value="DRAFT">Draft</option>

              <option value="PUBLISHED">Published</option>
            </select>
          </div>

          {/* ================= SUBMIT ================= */}

          {isEditing && (
            <button
              type="submit"
              disabled={updateLoading}
              className="bg-purple-600 text-white px-10 py-4 rounded-xl"
            >
              {updateLoading
                ? "Saving..."
                : data?.getAboutPage
                  ? "Update About Page"
                  : "Create About Page"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
