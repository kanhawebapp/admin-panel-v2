"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

const GET_PUJA_SERVICES = gql`
  query GetPujaServices {
    pujaServices {
      id
      title
      slug
      image
      category

      shortDescription
      description
      benefits
      howToPerform
      packaging

      price
      mrp
      discount
      customersCount
      rating

      mantraOptions {
        id
        name
      }

      faqs {
        id
        question
        answer
      }

      reviews {
        id
        userName
        rating
        comment
        createdAt
      }
    }
  }
`;

const CREATE_PUJA_SERVICE = gql`
  mutation CreatePujaService(
    $title: String!
    $slug: String!
    $image: String!
    $category: String
    $shortDescription: String
    $description: String
    $benefits: String
    $howToPerform: String
    $packaging: String
    $price: Float!
    $mrp: Float
    $discount: Float
    $customersCount: Int
    $rating: Float
    $mantraOptions: [String!]
    $faqs: [PujaFAQInput!]
  ) {
    createPujaService(
      title: $title
      slug: $slug
      image: $image
      category: $category

      shortDescription: $shortDescription
      description: $description
      benefits: $benefits
      howToPerform: $howToPerform
      packaging: $packaging

      price: $price
      mrp: $mrp
      discount: $discount
      customersCount: $customersCount
      rating: $rating

      mantraOptions: $mantraOptions
      faqs: $faqs
    ) {
      id
      title
    }
  }
`;

const UPDATE_PUJA_SERVICE = gql`
  mutation UpdatePujaService(
    $id: ID!
    $title: String!
    $slug: String!
    $image: String!
    $category: String
    $shortDescription: String
    $description: String
    $benefits: String
    $howToPerform: String
    $packaging: String
    $price: Float!
    $mrp: Float
    $discount: Float
    $customersCount: Int
    $rating: Float
    $mantraOptions: [String!]
    $faqs: [PujaFAQInput!]
  ) {
    updatePujaService(
      id: $id

      title: $title
      slug: $slug
      image: $image
      category: $category

      shortDescription: $shortDescription
      description: $description
      benefits: $benefits
      howToPerform: $howToPerform
      packaging: $packaging

      price: $price
      mrp: $mrp
      discount: $discount
      customersCount: $customersCount
      rating: $rating

      mantraOptions: $mantraOptions
      faqs: $faqs
    ) {
      id
      title
    }
  }
`;

const DELETE_PUJA_SERVICE = gql`
  mutation DeletePujaService($id: ID!) {
    deletePujaService(id: $id)
  }
`;

const DELETE_PUJA_REVIEW = gql`
  mutation DeletePujaReview($id: ID!) {
    deletePujaReview(id: $id)
  }
`;

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
  rating: 0,

  mantraOptions: [""],

  faqs: [
    {
      question: "",
      answer: "",
    },
  ],
};

export default function PujaServicesAdmin() {
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [showReviews, setShowReviews] = useState(null);

  const { data, loading: queryLoading, error } = useQuery(GET_PUJA_SERVICES);

  const [createPuja, { loading: createLoading }] = useMutation(
    CREATE_PUJA_SERVICE,
    {
      refetchQueries: [GET_PUJA_SERVICES],
    },
  );

  const [updatePuja, { loading: updateLoading }] = useMutation(
    UPDATE_PUJA_SERVICE,
    {
      refetchQueries: [GET_PUJA_SERVICES],
    },
  );

  const [deletePuja] = useMutation(DELETE_PUJA_SERVICE, {
    refetchQueries: [GET_PUJA_SERVICES],
  });

  const [deleteReview] = useMutation(DELETE_PUJA_REVIEW, {
    refetchQueries: [GET_PUJA_SERVICES],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;

    setForm((prev) => ({
      ...prev,
      title,
      slug: editingId ? prev.slug : generateSlug(title),
    }));
  };

  const addMantra = () => {
    setForm((prev) => ({
      ...prev,
      mantraOptions: [...prev.mantraOptions, ""],
    }));
  };

  const updateMantra = (index, value) => {
    const updated = [...form.mantraOptions];

    updated[index] = value;

    setForm((prev) => ({
      ...prev,
      mantraOptions: updated,
    }));
  };

  const removeMantra = (index) => {
    const updated = form.mantraOptions.filter((_, i) => i !== index);

    setForm((prev) => ({
      ...prev,
      mantraOptions: updated.length > 0 ? updated : [""],
    }));
  };

  const addFAQ = () => {
    setForm((prev) => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        {
          question: "",
          answer: "",
        },
      ],
    }));
  };

  const updateFAQ = (index, field, value) => {
    const updated = [...form.faqs];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setForm((prev) => ({
      ...prev,
      faqs: updated,
    }));
  };

  const removeFAQ = (index) => {
    const updated = form.faqs.filter((_, i) => i !== index);

    setForm((prev) => ({
      ...prev,
      faqs:
        updated.length > 0
          ? updated
          : [
              {
                question: "",
                answer: "",
              },
            ],
    }));
  };

  const resetForm = () => {
    setImageFile(null);
    setImagePreview("");
    setForm(initialForm);
    setEditingId(null);
  };

  const handleEdit = (puja) => {
    setEditingId(puja.id);

    setForm({
      title: puja.title || "",
      slug: puja.slug || "",
      image: puja.image || "",
      category: puja.category || "",

      shortDescription: puja.shortDescription || "",

      description: puja.description || "",

      benefits: puja.benefits || "",

      howToPerform: puja.howToPerform || "",

      packaging: puja.packaging || "",

      price: puja.price || "",
      mrp: puja.mrp || "",
      discount: puja.discount || "",
      customersCount: puja.customersCount || 0,

      rating: puja.rating || 0,

      mantraOptions: puja.mantraOptions?.length
        ? puja.mantraOptions.map((item) => item.name)
        : [""],

      faqs: puja.faqs?.length
        ? puja.faqs.map((faq) => ({
            question: faq.question,
            answer: faq.answer,
          }))
        : [
            {
              question: "",
              answer: "",
            },
          ],
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = form.image;

      if (imageFile) {
        setImageUploading(true);

        try {
          const uploadData = new FormData();
          uploadData.append("image", imageFile);

          const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;
          const backendUrl = new URL(graphqlUrl).origin;

          const response = await fetch(`${backendUrl}/api/puja-image`, {
            method: "POST",
            body: uploadData,
          });

          const result = await response.json();

          if (!response.ok || !result.url) {
            throw new Error(result.error || "Image upload failed");
          }

          imageUrl = result.url;
        } finally {
          setImageUploading(false);
        }
      }

      if (!imageUrl) {
        throw new Error("Please upload a Puja image");
      }

      const variables = {
        title: form.title,
        slug: form.slug,
        image: imageUrl,
        category: form.category,
        shortDescription: form.shortDescription,
        description: form.description,
        benefits: form.benefits,
        howToPerform: form.howToPerform,
        packaging: form.packaging,
        price: Number(form.price),
        mrp: form.mrp === "" ? null : Number(form.mrp),
        discount: form.discount === "" ? null : Number(form.discount),
        customersCount: Number(form.customersCount) || 0,
        rating: Number(form.rating) || 0,
        mantraOptions: form.mantraOptions.filter((item) => item.trim() !== ""),
        faqs: form.faqs.filter(
          (faq) => faq.question.trim() !== "" && faq.answer.trim() !== "",
        ),
      };

      if (editingId) {
        await updatePuja({
          variables: {
            id: editingId,
            ...variables,
          },
        });
      } else {
        await createPuja({
          variables,
        });
      }

      resetForm();
    } catch (error) {
      console.error("Puja save error:", error);
      alert(error?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this Puja?")) {
      return;
    }

    try {
      await deletePuja({
        variables: {
          id,
        },
      });
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!confirm("Delete this customer review?")) {
      return;
    }

    try {
      await deleteReview({
        variables: {
          id,
        },
      });
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  if (queryLoading) {
    return <div className="p-10">Loading Puja Services...</div>;
  }

  if (error) {
    return <div className="p-10 text-red-500">Error: {error.message}</div>;
  }
  const backendUrl = new URL(process.env.NEXT_PUBLIC_GRAPHQL_URL).origin;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="border border-gray-300 shadow-xl rounded-xl p-6 mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {editingId ? "Edit Puja Service" : "Add Puja Service"}
          </h2>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2 border rounded-lg"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">Basic Information</h3>

            <div className="grid grid-cols-2 gap-5">
              <input
                className="input"
                placeholder="Puja Name"
                value={form.title}
                onChange={handleTitleChange}
                required
              />

              <input
                className="input"
                placeholder="Slug"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                required
              />


              <div className="flex ">
                <label className="block font-medium mb-2">
                  Puja Service Image
                </label>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="input"
                  required={!editingId && !form.image}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    if (!file.type.startsWith("image/")) {
                      alert("Please select a valid image.");
                      e.target.value = "";
                      return;
                    }

                    if (file.size > 5 * 1024 * 1024) {
                      alert("Image size must be less than 5 MB.");
                      e.target.value = "";
                      return;
                    }

                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                  }}
                />

                {(imagePreview || form.image) && (
                  <div className="mt-4">
                    <img
                      src={imagePreview || form.image}
                      alt="Puja preview"
                      className="w-44 h-30 object-cover rounded-xl border"
                    />

                    <button
                      type="button"
                      className="mt-2 text-[10px] text-red-600"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                        setForm((prev) => ({ ...prev, image: "" }));
                      }}
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>

              <input
                className="input"
                placeholder="Category"
                name="category"
                value={form.category}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Pricing</h3>

            <div className="grid grid-cols-4 gap-5">
              <input
                type="number"
                className="input"
                placeholder="Price"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
              />

              <input
                type="number"
                className="input"
                placeholder="MRP"
                name="mrp"
                value={form.mrp}
                onChange={handleChange}
              />

              <input
                type="number"
                className="input"
                placeholder="Discount %"
                name="discount"
                value={form.discount}
                onChange={handleChange}
              />

              <input
                type="number"
                className="input"
                placeholder="Customers Count"
                name="customersCount"
                value={form.customersCount}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Short Description</h3>

            <textarea
              className="textarea"
              name="shortDescription"
              placeholder="Short description shown near product title"
              value={form.shortDescription}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div>
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold text-lg">Mantra Jaap Options</h3>

              <button
                type="button"
                onClick={addMantra}
                className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full"
              >
                + Add Mantra
              </button>
            </div>

            <div className="space-y-3">
              {form.mantraOptions.map((mantra, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    className="input flex-1"
                    placeholder="Example: 108 Mala Mantra Ahuti"
                    value={mantra}
                    onChange={(e) => updateMantra(index, e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => removeMantra(index)}
                    className="bg-red-500 text-white text-xs px-3 py-1 rounded-full"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Puja Content</h3>

            <div className="space-y-5">
              <textarea
                className="textarea"
                name="benefits"
                placeholder="Benefits"
                value={form.benefits}
                onChange={handleChange}
                rows={5}
              />

              <textarea
                className="textarea"
                name="description"
                placeholder="Detailed Description"
                value={form.description}
                onChange={handleChange}
                rows={7}
              />

              <textarea
                className="textarea"
                name="howToPerform"
                placeholder="How to perform / How it works"
                value={form.howToPerform}
                onChange={handleChange}
                rows={5}
              />

              <textarea
                className="textarea"
                name="packaging"
                placeholder="Packaging details"
                value={form.packaging}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold text-lg">FAQs</h3>

              <button
                type="button"
                onClick={addFAQ}
                className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full"
              >
                + Add FAQ
              </button>
            </div>

            <div className="space-y-5">
              {form.faqs.map((faq, index) => (
                <div key={index} className="border rounded-xl p-4">
                  <input
                    className="input mb-3"
                    placeholder="Question"
                    value={faq.question}
                    onChange={(e) =>
                      updateFAQ(index, "question", e.target.value)
                    }
                  />

                  <textarea
                    className="textarea mb-3"
                    placeholder="Answer"
                    value={faq.answer}
                    onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                    rows={4}
                  />

                  <button
                    type="button"
                    onClick={() => removeFAQ(index)}
                    className="bg-red-500 text-white text-xs px-3 py-1 rounded-full"
                  >
                    Remove FAQ
                  </button>
                </div>
              ))}
            </div>
          </div>
                    <button
            type="submit"
            disabled={createLoading || updateLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full font-semibold"
          >
            {imageUploading
              ? "Uploading Image..."
              : createLoading || updateLoading
                ? "Saving..."
                : editingId
                  ? "Update Puja"
                  : "Create Puja"}
          </button>
        </form>
      </div>

      <div className="border border-gray-300 shadow-xl rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6">Puja Services</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-purple-100">
                <th className="text-left p-3">Puja</th>

                <th className="text-left p-3">Price</th>

                <th className="text-left p-3">Rating</th>

                <th className="text-left p-3">Reviews</th>

                <th className="text-left p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {data?.pujaServices?.map((puja) => (
                <tr key={puja.id} className="border-b">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={`${backendUrl}${puja.image.replace("/adminAuth/uploads/", "/uploads/")}`}
                        alt={puja.title}
                        className="w-16 h-12 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/placeholder.png";
                        }}
                      />

                      <div>
                        <p className="font-semibold">{puja.title}</p>

                        <p className="text-xs text-gray-500">{puja.slug}</p>
                      </div>
                    </div>
                  </td>

                  <td>₹{puja.price}</td>

                  <td>⭐ {puja.rating || 0}</td>

                  <td>
                    <button
                      onClick={() =>
                        setShowReviews(showReviews === puja.id ? null : puja.id)
                      }
                      className="text-purple-600 font-medium"
                    >
                      {puja.reviews?.length || 0} Reviews
                    </button>
                  </td>

                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(puja)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-full"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(puja.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-full"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data?.pujaServices
          ?.filter((puja) => puja.id === showReviews)
          .map((puja) => (
            <div key={puja.id} className="mt-8 border-t pt-6">
              <h3 className="text-xl font-bold mb-5">
                Reviews for {puja.title}
              </h3>

              {puja.reviews?.length === 0 ? (
                <p className="text-gray-500">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {puja.reviews.map((review) => (
                    <div key={review.id} className="border rounded-xl p-5">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-semibold">{review.userName}</p>

                          <p>{"⭐".repeat(review.rating)}</p>
                        </div>

                        <p className="text-sm text-gray-500">
                          {review.createdAt}
                        </p>
                      </div>

                      <p className="mt-3">{review.comment}</p>

                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="mt-4 text-red-500 text-sm"
                      >
                        Delete Review
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #555;
          border-radius: 10px;
          padding: 10px;
          outline: none;
        }

        .input:focus {
          border-color: #9333ea;
          box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.1);
        }

        .textarea {
          width: 100%;
          border: 1px solid #555;
          border-radius: 10px;
          padding: 10px;
          outline: none;
          resize: vertical;
        }

        .textarea:focus {
          border-color: #9333ea;
          box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.1);
        }
      `}</style>
    </div>
  );
}