
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import toast from "react-hot-toast";
import {
  CREATE_PUJA_SERVICE,
  UPDATE_PUJA_SERVICE,
  GET_PUJA_SERVICES,
} from "../../../graphQL/homeGql";

const LIST_ROUTE = "/Admindash/dhwani-services/puja-services";

const initialForm = {
  title: "",
  slug: "",
  image: "",
  category: "",
  shortDescription: "",
  description: "",
  benefits: "",
  howToPerform: "",
  packaging: "",
  price: "",
  mrp: "",
  discount: "",
  customersCount: 0,
  rating: 5,
  mantraOptions: [
    {
      name: "",
      originalPrice: "",
      offerPrice: "",
      sortOrder: 1,
    },
  ],
  faqs: [{ question: "", answer: "" }],
};

const inputClass =
  "w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100";

const textareaClass =
  "w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 resize-y";

const labelClass =
  "block text-sm font-medium text-gray-700 mb-2";

const sectionClass =
  "bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm";

const generateSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const mapPujaToForm = (puja) => ({
  title: puja.title ?? "",
  slug: puja.slug ?? "",
  image: puja.image ?? "",
  category: puja.category ?? "",
  shortDescription: puja.shortDescription ?? "",
  description: puja.description ?? "",
  benefits: puja.benefits ?? "",
  howToPerform: puja.howToPerform ?? "",
  packaging: puja.packaging ?? "",
  price: puja.price ?? "",
  mrp: puja.mrp ?? "",
  discount: puja.discount ?? "",
  customersCount: puja.customersCount ?? 0,
  rating: puja.rating ?? 5,

  mantraOptions: puja.mantraOptions?.length
    ? [...puja.mantraOptions]
        .sort(
          (a, b) =>
            (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
        )
        .map((item, index) => ({
          name: item.name ?? "",
          originalPrice:
            item.originalPrice ??
            (index === 0 ? puja.mrp ?? "" : ""),
          offerPrice:
            item.offerPrice ??
            (index === 0 ? puja.price ?? "" : ""),
          sortOrder: item.sortOrder ?? index + 1,
        }))
    : [
        {
          name: "",
          originalPrice: puja.mrp ?? "",
          offerPrice: puja.price ?? "",
          sortOrder: 1,
        },
      ],

  faqs: puja.faqs?.length
    ? puja.faqs.map((faq) => ({
        question: faq.question ?? "",
        answer: faq.answer ?? "",
      }))
    : [{ question: "", answer: "" }],
});

const getImageUrl = (path) => {
  if (!path) return "";

  if (/^(https?:|blob:|data:)/i.test(path)) {
    return path;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiUrl) return path;

  try {
    const origin = new URL(apiUrl).origin;
    return new URL(path, origin).href;
  } catch {
    return path;
  }
};

export default function PujaServiceForm({
  mode = "create",
  pujaId,
  onSuccess,
}) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [form, setForm] = useState(() => ({
    ...initialForm,
    mantraOptions: initialForm.mantraOptions.map(
      (item) => ({ ...item })
    ),
    faqs: initialForm.faqs.map((item) => ({ ...item })),
  }));

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUploading, setImageUploading] =
    useState(false);
  const [loadedPujaId, setLoadedPujaId] = useState(null);

  // Fetch existing services only in edit mode
  const {
    data,
    loading: queryLoading,
    error: queryError,
  } = useQuery(GET_PUJA_SERVICES, {
    skip: !isEdit || !pujaId,
    fetchPolicy: "cache-and-network",
  });

  const [createPuja, { loading: createLoading }] =
    useMutation(CREATE_PUJA_SERVICE, {
      refetchQueries: [GET_PUJA_SERVICES],
      awaitRefetchQueries: true,
    });

  const [updatePuja, { loading: updateLoading }] =
    useMutation(UPDATE_PUJA_SERVICE, {
      refetchQueries: [GET_PUJA_SERVICES],
      awaitRefetchQueries: true,
    });

  const isSaving =
    createLoading || updateLoading || imageUploading;

  const existingPuja = isEdit
    ? data?.pujaServices?.find(
        (item) => String(item.id) === String(pujaId)
      )
    : null;

  // Prefill form when editing
  useEffect(() => {
    if (!isEdit || !existingPuja) return;

    if (String(loadedPujaId) === String(pujaId)) {
      return;
    }

    setForm(mapPujaToForm(existingPuja));
    setImageFile(null);
    setImagePreview("");
    setLoadedPujaId(pujaId);
  }, [isEdit, existingPuja, pujaId, loadedPujaId]);

  // Generate and clean up local image preview
  useEffect(() => {
    if (!imageFile) return;

    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  // General input handler
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Automatically generate slug when creating
  const handleTitleChange = (e) => {
    const title = e.target.value;

    setForm((prev) => ({
      ...prev,
      title,
      slug: isEdit ? prev.slug : generateSlug(title),
    }));
  };

  // Image selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a PNG, JPG or WebP image");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5 MB");
      e.target.value = "";
      return;
    }

    setImageFile(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setForm((prev) => ({
      ...prev,
      image: "",
    }));
  };

  // Upload image to existing backend endpoint
  const uploadImage = async (file) => {
    const graphqlUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!graphqlUrl) {
      throw new Error("API base URL is not configured");
    }

    const backendUrl = new URL(graphqlUrl).origin;

    const uploadData = new FormData();
    uploadData.append("image", file);

    const response = await fetch(
      `${backendUrl}/adminAuth/api/puja-image`,
      {
        method: "POST",
        body: uploadData,
      }
    );

    const result = await response.json();

    if (!response.ok || !result.url) {
      throw new Error(
        result.error || "Image upload failed"
      );
    }

    return result.url;
  };

  // ----------------------------
  // Mantra Options
  // ----------------------------

  const addMantra = () => {
    setForm((prev) => ({
      ...prev,
      mantraOptions: [
        ...prev.mantraOptions,
        {
          name: "",
          originalPrice: "",
          offerPrice: "",
          sortOrder: prev.mantraOptions.length + 1,
        },
      ],
    }));
  };

  const updateMantra = (index, field, value) => {
    setForm((prev) => {
      const updated = prev.mantraOptions.map(
        (item, i) =>
          i === index
            ? { ...item, [field]: value }
            : item
      );

      return {
        ...prev,
        mantraOptions: updated,
        ...(index === 0 && field === "offerPrice"
          ? { price: value }
          : {}),
        ...(index === 0 && field === "originalPrice"
          ? { mrp: value }
          : {}),
      };
    });
  };

  const removeMantra = (index) => {
    setForm((prev) => {
      const updated = prev.mantraOptions
        .filter((_, i) => i !== index)
        .map((item, i) => ({
          ...item,
          sortOrder: i + 1,
        }));

      const mantraOptions = updated.length
        ? updated
        : [
            {
              name: "",
              originalPrice: "",
              offerPrice: "",
              sortOrder: 1,
            },
          ];

      return {
        ...prev,
        mantraOptions,
        price: mantraOptions[0].offerPrice,
        mrp: mantraOptions[0].originalPrice,
      };
    });
  };

  // ----------------------------
  // FAQs
  // ----------------------------

  const addFAQ = () => {
    setForm((prev) => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        { question: "", answer: "" },
      ],
    }));
  };

  const updateFAQ = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) =>
        i === index
          ? { ...faq, [field]: value }
          : faq
      ),
    }));
  };

  const removeFAQ = (index) => {
    setForm((prev) => {
      const updated = prev.faqs.filter(
        (_, i) => i !== index
      );

      return {
        ...prev,
        faqs: updated.length
          ? updated
          : [{ question: "", answer: "" }],
      };
    });
  };

  // ----------------------------
  // Create / Update
  // ----------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSaving) return;

    try {
      let imageUrl = form.image;

      if (imageFile) {
        setImageUploading(true);

        try {
          imageUrl = await uploadImage(imageFile);
        } finally {
          setImageUploading(false);
        }
      }

      if (!imageUrl) {
        throw new Error("Please upload a Puja image");
      }

      if (!form.title.trim() || !form.slug.trim()) {
        throw new Error("Title and slug are required");
      }

      if (
        form.price === "" ||
        !Number.isFinite(Number(form.price)) ||
        Number(form.price) < 0
      ) {
        throw new Error("Please enter a valid price");
      }

      const mantraOptions = form.mantraOptions
        .filter((item) => item.name.trim() !== "")
        .map((item, index) => {
          if (
            item.originalPrice === "" ||
            item.offerPrice === "" ||
            !Number.isFinite(Number(item.originalPrice)) ||
            !Number.isFinite(Number(item.offerPrice)) ||
            Number(item.originalPrice) < 0 ||
            Number(item.offerPrice) < 0
          ) {
            throw new Error(
              `Enter valid prices for mantra option ${index + 1}`
            );
          }

          return {
            name: item.name.trim(),
            originalPrice: Number(item.originalPrice),
            offerPrice: Number(item.offerPrice),
            sortOrder: Number(item.sortOrder) || index + 1,
          };
        });

      const faqs = form.faqs
        .filter(
          (faq) =>
            faq.question.trim() !== "" &&
            faq.answer.trim() !== ""
        )
        .map((faq) => ({
          question: faq.question.trim(),
          answer: faq.answer.trim(),
        }));

      const variables = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        image: imageUrl,
        category: form.category,
        shortDescription: form.shortDescription,
        description: form.description,
        benefits: form.benefits,
        howToPerform: form.howToPerform,
        packaging: form.packaging,

        price: Number(form.price),
        mrp:
          form.mrp === ""
            ? null
            : Number(form.mrp),
        discount:
          form.discount === ""
            ? null
            : Number(form.discount),

        customersCount:
          Number(form.customersCount) || 0,
        rating: Number(form.rating) || 0,

        mantraOptions,
        faqs,
      };

      if (isEdit) {
        await updatePuja({
          variables: {
            id: pujaId,
            ...variables,
          },
        });

        toast.success("Puja updated successfully");
      } else {
        await createPuja({
          variables,
        });

        toast.success("Puja created successfully");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(LIST_ROUTE);
      }
    } catch (error) {
      console.error("Puja save error:", error);

      toast.error(
        error?.message || "Something went wrong"
      );
    }
  };

  // ----------------------------
  // Loading / Error states
  // ----------------------------

  if (isEdit && !pujaId) {
    return (
      <div className="p-6 text-red-500">
        Invalid Puja Service ID.
      </div>
    );
  }

  if (
    isEdit &&
    (queryLoading ||
      (existingPuja &&
        String(loadedPujaId) !== String(pujaId)))
  ) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading Puja Service details...
      </div>
    );
  }

  if (isEdit && queryError) {
    return (
      <div className="p-6 text-red-500">
        Error: {queryError.message}
      </div>
    );
  }

  if (isEdit && !existingPuja) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-semibold">
          Puja Service Not Found
        </h2>

        <button
          type="button"
          onClick={() => router.push(LIST_ROUTE)}
          className="mt-4 text-purple-600"
        >
          Back to Puja Services
        </button>
      </div>
    );
  }

  // ----------------------------
  // Form UI
  // ----------------------------

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* BASIC INFORMATION */}
      <section className={sectionClass}>
        <h2 className="text-xl font-semibold mb-6">
          Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label className={labelClass}>
              Puja Name *
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="Enter Puja Name"
              value={form.title}
              onChange={handleTitleChange}
              required
            />
          </div>

          <div>
            <label className={labelClass}>
              Slug *
            </label>
            <input
              type="text"
              name="slug"
              className={inputClass}
              placeholder="puja-service-slug"
              value={form.slug}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className={labelClass}>
              Category
            </label>
            <input
              type="text"
              name="category"
              className={inputClass}
              placeholder="Enter category"
              value={form.category}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className={labelClass}>
              Puja Service Image *
            </label>

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className={inputClass}
              onChange={handleImageChange}
              required={!form.image && !imageFile}
            />

            <p className="text-xs text-gray-500 mt-2">
              PNG, JPG or WebP. Maximum 5 MB.
            </p>
          </div>
        </div>

        {(imagePreview || form.image) && (
          <div className="mt-6">
            <p className={labelClass}>
              Image Preview
            </p>

            <div className="relative w-fit">
              <img
                src={
                  imagePreview ||
                  getImageUrl(form.image)
                }
                alt="Puja preview"
                className="w-52 h-36 object-cover rounded-xl border"
              />

              <button
                type="button"
                onClick={removeImage}
                className="mt-3 text-sm text-red-600 hover:underline"
              >
                Remove Image
              </button>
            </div>
          </div>
        )}
      </section>

      {/* PRICING */}
      <section className={sectionClass}>
        <h2 className="text-xl font-semibold mb-6">
          Pricing
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">

          <div>
            <label className={labelClass}>
              Price (₹) *
            </label>
            <input
              type="number"
              min="0"
              step="any"
              name="price"
              className={inputClass}
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className={labelClass}>
              MRP (₹)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              name="mrp"
              className={inputClass}
              value={form.mrp}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className={labelClass}>
              Discount %
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="any"
              name="discount"
              className={inputClass}
              value={form.discount}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className={labelClass}>
              Customers Count
            </label>
            <input
              type="number"
              min="0"
              name="customersCount"
              className={inputClass}
              value={form.customersCount}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className={labelClass}>
              Rating
            </label>
            <select
              name="rating"
              className={inputClass}
              value={form.rating}
              onChange={handleChange}
            >
              {[1, 2, 3, 4, 5].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} Star
                </option>
              ))}
            </select>
          </div>

        </div>
      </section>

      {/* SHORT DESCRIPTION */}
      <section className={sectionClass}>
        <h2 className="text-xl font-semibold mb-5">
          Short Description
        </h2>

        <textarea
          name="shortDescription"
          className={textareaClass}
          rows={3}
          placeholder="Short description shown near Puja title"
          value={form.shortDescription}
          onChange={handleChange}
        />
      </section>

      {/* MANTRA OPTIONS */}
      <section className={sectionClass}>
        <div className="flex justify-between items-center gap-3 mb-6">
          <h2 className="text-xl font-semibold">
            Mantra Jaap Options
          </h2>

          <button
            type="button"
            onClick={addMantra}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            + Add Mantra
          </button>
        </div>

        <div className="space-y-4">
          {form.mantraOptions.map((mantra, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl p-5"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">
                  Mantra Option {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() => removeMantra(index)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                <div>
                  <label className={labelClass}>
                    Mantra Jaap Name
                  </label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="108 Mala Mantra Ahuti"
                    value={mantra.name}
                    onChange={(e) =>
                      updateMantra(
                        index,
                        "name",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className={inputClass}
                    value={mantra.originalPrice}
                    onChange={(e) =>
                      updateMantra(
                        index,
                        "originalPrice",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Offer Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className={inputClass}
                    value={mantra.offerPrice}
                    onChange={(e) =>
                      updateMantra(
                        index,
                        "offerPrice",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Sort Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    className={inputClass}
                    value={mantra.sortOrder}
                    onChange={(e) =>
                      updateMantra(
                        index,
                        "sortOrder",
                        e.target.value
                      )
                    }
                  />
                </div>

              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PUJA CONTENT */}
      <section className={sectionClass}>
        <h2 className="text-xl font-semibold mb-6">
          Puja Content
        </h2>

        <div className="space-y-5">

          <div>
            <label className={labelClass}>
              Benefits
            </label>
            <textarea
              name="benefits"
              className={textareaClass}
              rows={5}
              placeholder="Benefits of performing this Puja"
              value={form.benefits}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className={labelClass}>
              Detailed Description
            </label>
            <textarea
              name="description"
              className={textareaClass}
              rows={7}
              placeholder="Enter detailed Puja description"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className={labelClass}>
              How to Perform / How It Works
            </label>
            <textarea
              name="howToPerform"
              className={textareaClass}
              rows={5}
              placeholder="Explain the Puja process"
              value={form.howToPerform}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className={labelClass}>
              Packaging Details
            </label>
            <textarea
              name="packaging"
              className={textareaClass}
              rows={4}
              placeholder="Enter packaging details"
              value={form.packaging}
              onChange={handleChange}
            />
          </div>

        </div>
      </section>

      {/* FAQ SECTION */}
      <section className={sectionClass}>
        <div className="flex justify-between items-center gap-3 mb-6">
          <h2 className="text-xl font-semibold">
            Frequently Asked Questions
          </h2>

          <button
            type="button"
            onClick={addFAQ}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            + Add FAQ
          </button>
        </div>

        <div className="space-y-5">
          {form.faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl p-5"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">
                  FAQ {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() => removeFAQ(index)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remove FAQ
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>
                    Question
                  </label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Enter FAQ question"
                    value={faq.question}
                    onChange={(e) =>
                      updateFAQ(
                        index,
                        "question",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Answer
                  </label>
                  <textarea
                    className={textareaClass}
                    rows={4}
                    placeholder="Enter FAQ answer"
                    value={faq.answer}
                    onChange={(e) =>
                      updateFAQ(
                        index,
                        "answer",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-4 pb-10">

        <button
          type="button"
          onClick={() => router.push(LIST_ROUTE)}
          disabled={isSaving}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {imageUploading
            ? "Uploading Image..."
            : createLoading || updateLoading
              ? "Saving..."
              : isEdit
                ? "Update Puja"
                : "Create Puja"}
        </button>

      </div>

    </form>
  );
}
