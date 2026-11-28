"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useApolloClient } from "@apollo/client/react";
import Image from "next/image";
import toast from "react-hot-toast";

import { usePermissions } from "@/context/PermissionContext";
import { useActionHandler } from "@/hooks/useActionHandler";
import ConfirmModal from "@/components/Custom/ConfirmModal";
import ProtectedActionButton from "@/components/Custom/ActionButton";
import { gql } from "@apollo/client";
import {
  DELETE_CATEGORY,
  // GET_ASTRO_LIST,
  GET_CATEGORIES,
} from "@/app/graphQL/astroHiring";

const GET_SERVICES = gql`
  query GetServices {
    getServices {
      id
      name
      slug
      image
      description
      longText
      price
      isActive
      category {
        id
        name
        slug
      }
   
    }
  }
`;

const CREATE_CATEGORY = gql`
  mutation ($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
    }
  }
`;

const CREATE_SERVICE = gql`
  mutation CreateService($input: CreateServiceInput!) {
    createService(input: $input) {
      id
    }
  }
`;

const UPDATE_SERVICE = gql`
  mutation UpdateService($id: ID!, $input: UpdateServiceInput!) {
    updateService(id: $id, input: $input) {
      id
    }
  }
`;
const UPDATE_SERVICE_STATUS = gql`
  mutation UpdateServiceStatus($id: ID!, $isActive: Boolean!) {
    updateServiceStatus(id: $id, isActive: $isActive)
  }
`;

const DELETE_SERVICE = gql`
  mutation ($id: ID!) {
    deleteService(id: $id)
  }
`;
// const GET_SERVICE_ASTROLOGERS = gql`
//   query ($serviceId: ID!) {
//     getServiceAstrologers(serviceId: $serviceId) {
//       id
//       price

//       astrologer {
//         id
//         displayName
//       }
//     }
//   }
// `;
// const SAVE_SERVICE_ASTROLOGERS = gql`
//   mutation ($serviceId: ID!, $astrologers: [ServiceAstrologerInput!]!) {
//     saveServiceAstrologers(serviceId: $serviceId, astrologers: $astrologers)
//   }
// `;

/* ------------------ COMPONENT ------------------ */

export default function DhwaniServicesAdmin() {
  const initialServiceForm = {
    name: "",
    slug: "",
    categoryId: "",
    description: "",
    longText: "",
    details: "",
    price: "",

    highlights: [""],

    benefits: [
      {
        title: "",
        description: "",
      },
    ],

    duration: "",
    mode: "",
    bestFor: "",
    practitioner: "",

    howItWorks: [""],

    faqs: [
      {
        question: "",
        answer: "",
      },
    ],

    testimonials: [
      {
        content: "",
        clientName: "",
      },
    ],

    seoTitle: "",
    metaDescription: "",
    primaryKeyword: "",
    supportingKeywords: "",
  };
  const client = useApolloClient();
  const { data: catData, refetch: refetchCategories } =
    useQuery(GET_CATEGORIES);
  const [deleteCategory] = useMutation(DELETE_CATEGORY);
  const { can, isSuperAdmin } = usePermissions();
  const { confirmState, setConfirmState, executeAction, handleConfirm } =
    useActionHandler();

  const canRead = isSuperAdmin || can("services", "read");
  const canCreate = isSuperAdmin || can("services", "create");
  const canUpdate = isSuperAdmin || can("services", "update");

  const { data, refetch } = useQuery(GET_SERVICES);

  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [createService] = useMutation(CREATE_SERVICE);
  const [updateService] = useMutation(UPDATE_SERVICE);
  const [updateServiceStatus] = useMutation(UPDATE_SERVICE_STATUS);

  const [deleteService] = useMutation(DELETE_SERVICE);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState(initialServiceForm);
  const [file, setFile] = useState(null);

  const [preview, setPreview] = useState("");
  const [modalType, setModalType] = useState("service");

  // const [mappingOpen, setMappingOpen] = useState(false);

  // const [selectedService, setSelectedService] = useState(null);

  // const [mappedAstrologers, setMappedAstrologers] = useState([]);
  // const { data: astroData } = useQuery(GET_ASTRO_LIST, {
  //   variables: {
  //     searchInput: {
  //       page: 1,
  //       limit: 50,
  //     },
  //   },
  // });
  // const [saveMappings] = useMutation(SAVE_SERVICE_ASTROLOGERS);

  // const openMappingModal = async (service) => {
  //   setSelectedService(service);

  //   const res = await client.query({
  //     query: GET_SERVICE_ASTROLOGERS,
  //     variables: {
  //       serviceId: service.id,
  //     },
  //     fetchPolicy: "network-only",
  //   });

  //   setMappedAstrologers(
  //     res.data.getServiceAstrologers.map((a) => ({
  //       astrologerId: a.astrologer.id,
  //       displayName: a.astrologer.displayName,
  //       price: a.price,
  //     })),
  //   );

  //   setMappingOpen(true);
  // };

  useEffect(() => {
    if (!editing || modalType !== "service") return;

    setForm({
      ...initialServiceForm,

      name: editing.name || "",
      slug: editing.slug || "",
      categoryId: editing.category?.id || "",

      description: editing.description || "",
      longText: editing.longText || "",
      details: editing.details || "",

      price: editing.price ?? "",

      highlights: editing.highlights?.length ? editing.highlights : [""],

      benefits: editing.benefits?.length
        ? editing.benefits
        : [{ title: "", description: "" }],

      duration: editing.duration || "",
      mode: editing.mode || "",
      bestFor: editing.bestFor || "",
      practitioner: editing.practitioner || "",

      howItWorks: editing.howItWorks?.length ? editing.howItWorks : [""],

      faqs: editing.faqs?.length
        ? editing.faqs
        : [{ question: "", answer: "" }],

      testimonials: editing.testimonials?.length
        ? editing.testimonials
        : [{ content: "", clientName: "" }],

      seoTitle: editing.seoTitle || "",
      metaDescription: editing.metaDescription || "",
      primaryKeyword: editing.primaryKeyword || "",
      supportingKeywords: editing.supportingKeywords || "",
    });

    setPreview(editing.image || "");
    setFile(null);
  }, [editing, modalType]);

  const resetForm = () => {
    setForm({ ...initialServiceForm });

    setPreview("");
    setFile(null);
    setEditing(null);
  };
  const handleServiceStatusToggle = async (item) => {
    if (!canUpdate || !item?.id) return;

    try {
      await updateServiceStatus({
        variables: {
          id: item.id,
          isActive: !item.isActive,
        },
      });

      refetch();
    } catch (error) {
      console.error("Service status update failed:", error);
    }
  };
  /* ------------------ IMAGE ------------------ */

  // const handleSaveMappings = async () => {
  //   const invalid = mappedAstrologers.find((a) => !a.price);

  //   if (invalid) {
  //     toast.error("Please enter price for all selected astrologers");
  //     return;
  //   }

  //   await saveMappings({
  //     variables: {
  //       serviceId: selectedService.id,

  //       astrologers: mappedAstrologers.map((a) => ({
  //         astrologerId: a.astrologerId,
  //         price: Number(a.price),
  //       })),
  //     },
  //   });

  //   toast.success("Mapping Saved");

  //   setMappingOpen(false);
  // };

  // const handleCancelMappings = () => {
  //   setMappingOpen(false);
  // };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  /* ------------------ SUBMIT ------------------ */
  const handleDeleteCategory = (id) => {
    executeAction({
      mutationFn: deleteCategory,
      variables: { id },
      refetch,
    });
  };
  // ---------------------------------------------
  // ARRAY FIELD HELPERS
  // ---------------------------------------------

  // Add new item in array
  const addArrayItem = (field, initialValue) => {
    setForm((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), initialValue],
    }));
  };

  // Remove item from array
  const removeArrayItem = (field, index) => {
    setForm((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }));
  };

  // Update simple string array
  // Example: highlights, howItWorks
  const updateArrayField = (field, index, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: (prev[field] || []).map((item, i) =>
        i === index ? value : item,
      ),
    }));
  };

  // Update object array
  // Example: benefits, faqs, testimonials
  const updateNestedArrayField = (field, index, key, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: (prev[field] || []).map((item, i) =>
        i === index
          ? {
              ...item,
              [key]: value,
            }
          : item,
      ),
    }));
  };
  const handleServiceSubmit = async () => {
    try {
      let imageUrl = editing?.image || null;

      if (file) {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/adminAuth/api/upload-services`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!res.ok) {
          throw new Error("Image upload failed");
        }

        const uploadData = await res.json();

        if (!uploadData.url) {
          throw new Error("Invalid upload response");
        }

        imageUrl = uploadData.url;
      }

      const input = {
        name: form.name.trim(),
        slug: form.slug.trim(),

        image: imageUrl,
        description: form.description || null,
        longText: form.longText || null,
        details: form.details || null,

        price: form.price !== "" ? Number(form.price) : null,
        categoryId: form.categoryId || null,

        highlights: form.highlights.filter((item) => item.trim()),

        benefits: form.benefits.filter(
          (item) => item.title.trim() && item.description.trim(),
        ),

        duration: form.duration || null,
        mode: form.mode || null,
        bestFor: form.bestFor || null,
        practitioner: form.practitioner || null,

        howItWorks: form.howItWorks.filter((item) => item.trim()),

        faqs: form.faqs.filter(
          (item) => item.question.trim() && item.answer.trim(),
        ),

        testimonials: form.testimonials.filter((item) => item.content.trim()),

        seoTitle: form.seoTitle || null,
        metaDescription: form.metaDescription || null,
        primaryKeyword: form.primaryKeyword || null,
        supportingKeywords: form.supportingKeywords.trim() || null,
      };

      if (editing) {
        await updateService({
          variables: {
            id: editing.id,
            input,
          },
        });

        toast.success("Service Updated Successfully");
      } else {
        await createService({
          variables: {
            input,
          },
        });

        toast.success("Service Created Successfully");
      }

      await refetch();
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Service submission failed:", error);
      toast.error(error.message || "Something went wrong");
    }
  };

  /* ------------------ DELETE ------------------ */

  const handleDelete = (id) => {
    executeAction({
      mutationFn: deleteService,
      variables: { id },
      onSuccess: refetch,
    });
  };

  const handleCategorySubmit = async () => {
    let imageUrl = "";

    if (file) {
      const formData = new FormData();

      formData.append("image", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/adminAuth/api/upload-services`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!res.ok) {
        throw new Error("Image upload failed");
      }

      const data = await res.json();

      if (!data.url) {
        throw new Error("Invalid upload response");
      }

      imageUrl = data.url;
    }

    await createCategory({
      variables: {
        input: {
          name: form.name,
          slug: form.slug,
          image: imageUrl,
        },
      },
    });

    toast.success("Category Created");

    refetchCategories();
    resetForm();
    setOpen(false);
  };

  function clickClose() {
    setOpen(false);
  }
  const generateSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  ? new URL(process.env.NEXT_PUBLIC_API_BASE_URL).origin
  : "";
  return (
    <div className="p-6">
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => {
            resetForm();
            setModalType("category");
            setOpen(true);
          }}
          className="bg-green-600 cursor-pointer text-white px-4 py-2 rounded-full"
        >
          + Add Category
        </button>

        <button
          onClick={() => {
            resetForm();
            setModalType("service");
            setOpen(true);
          }}
          className="bg-purple-600 cursor-pointer text-white px-4 py-2 rounded-full"
        >
          + Add Service
        </button>
      </div>

      <ConfirmModal
        open={!!confirmState}
        onCancel={() => setConfirmState(null)}
        onConfirm={handleConfirm}
      />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 shadow-xl  rounded-2xl border border-gray-200 px-4 py-3">
          <h2 className="text-2xl font-bold mb-4">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {catData?.getCategories?.map((cat) => (
              <div
                key={cat.id}
                className="bg-white flex items-center justify-evenly shadow rounded-xl p-2 overflow-hidden"
              >
               {cat.image && (
  <Image
    src={
      cat.image.startsWith("http")
        ? cat.image
        : `${backendUrl}${cat.image}`
    }
    alt={cat.name || "Category image"}
    width={250}
    height={150}
    unoptimized
    className="w-20 h-20 rounded-full object-cover"
  />
)}

                <div className="p-3">
                  <h3 className="font-semibold">{cat.name}</h3>

                  <p className="text-xs text-gray-500 mb-3">{cat.slug}</p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setModalType("category");
                        setEditing(cat);
                        setOpen(true);
                      }}
                      className="bg-blue-500 text-white cursor-pointer px-3 py-1 rounded-full text-xs"
                    >
                      Edit
                    </button>

                    <ProtectedActionButton
                      module="services"
                      action="delete"
                      executeAction={executeAction}
                      mutationFn={deleteCategory}
                      variables={{ id: cat.id }}
                      onSuccess={refetch}
                      className="bg-red-500 text-white cursor-pointer px-3 py-1 rounded-full text-xs"
                    >
                      Delete
                    </ProtectedActionButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LIST */}
        <div className="flex flex-col gap-2 shadow-xl border border-gray-200 rounded-2xl px-4 py-3">
          <h2 className="text-2xl font-bold mb-4">Services</h2>
          <div className="grid grid-cols-3 gap-4">
            {data?.getServices?.map((item) => {
              const isInactive = item.isActive === false;

              return (
                <div
                  key={item.id}
                  className={`p-4 flex items-start justify-between shadow rounded-xl transition-all ${
                    isInactive ? "bg-gray-100 opacity-70" : "bg-white"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <h3 className="font-semibold">{item.name}</h3>

                           {item.image && (
  <Image
    src={
      item.image.startsWith("http")
        ? item.image
        : `${backendUrl}${item.image}`
    }
    alt={item.name || "Service image"}
    width={250}
    height={150}
    unoptimized
    className="w-20 h-20 rounded-full object-cover"
  />
)}

                    <p className="text-sm">
                      Category: {item.category?.name || "None"}
                    </p>

                    <span
                      className={`text-xs mt-1 font-medium ${
                        isInactive ? "text-red-500" : "text-green-600"
                      }`}
                    >
                      {isInactive ? "Inactive" : "Active"}
                    </span>
                  </div>

                  <div className="p-2">
                    <div className="mt-2 overflow-y-auto h-16 text-xs">
                      {item.astrologerMappings?.map((m) => (
                        <p key={m.astrologer.displayName}>
                          {m.astrologer.displayName} - ₹{m.price}
                        </p>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      {/* Edit */}
                      <button
                        disabled={!canUpdate || isInactive}
                        onClick={() => {
                          if (!canUpdate || isInactive) return;
                          setEditing(item);
                          setOpen(true);
                        }}
                        className={`rounded-full text-white px-3 py-1.5 text-xs transition-all ${
                          !canUpdate || isInactive
                            ? "bg-gray-400 opacity-50 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                        }`}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={!canUpdate}
                        onClick={() => handleServiceStatusToggle(item)}
                        title={
                          isInactive ? "Activate Service" : "Deactivate Service"
                        }
                        className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                          !canUpdate
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        } ${isInactive ? "bg-gray-400" : "bg-green-500"}`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                            isInactive ? "translate-x-0" : "translate-x-5"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    {open && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[9999]">
    <div
      className={`bg-white p-6 rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-300 ${
        modalType === "category"
          ? "w-[40%]"
          : "w-[70%]"
      }`}
    >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold mb-4">
                {modalType === "category"
                  ? editing
                    ? "Edit Category"
                    : "Add Category"
                  : editing
                    ? "Edit Service"
                    : "Add Service"}
              </h2>
              <button onClick={() => clickClose()}>X</button>
            </div>

            {modalType === "category" && (
              <>
                <input
                  placeholder="Category Name"
                  className="border border-gray-200 rounded-full p-2 w-full mb-3"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;

                    setForm((prev) => ({
                      ...prev,
                      name,
                      slug: generateSlug(name),
                    }));
                  }}
                />

                <input
                  placeholder="Category Slug"
                  className="border border-gray-200 rounded-full p-2 w-full mb-3"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      slug: generateSlug(e.target.value),
                    }))
                  }
                />

                <input
                  type="file"
                  className="border border-gray-200 rounded-full p-2 w-full mb-3"
                  onChange={handleImageChange}
                />

                {preview && (
                  <Image
                    src={preview}
                    alt=""
                    width={300}
                    height={200}
                    className="w-full h-30 object-cover rounded-xl mb-2"
                  />
                )}

                <button
                  onClick={handleCategorySubmit}
                  className="bg-green-600 text-white w-full p-2 rounded-full"
                >
                  Save Category
                </button>
              </>
            )}

            {modalType === "service" && (
              <div className="flex flex-col max-h-[78vh]">
                {/* FORM CONTENT */}
                <div className="overflow-y-auto pr-2 space-y-5 pb-4">
                  {/* BASIC DETAILS */}
                  <section className="bg-white/60 backdrop-blur-xl border border-gray-200/80 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          Basic Details
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Basic information about your service
                        </p>
                      </div>
                      <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                        General
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        placeholder="Service Name"
                        className="form-input"
                        value={form.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          setForm((prev) => ({
                            ...prev,
                            name,
                            slug: generateSlug(name),
                          }));
                        }}
                      />

                      <input
                        placeholder="Service Slug"
                        className="form-input"
                        value={form.slug}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            slug: generateSlug(e.target.value),
                          }))
                        }
                      />

                      <select
                        className="form-input"
                        value={form.categoryId}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            categoryId: e.target.value,
                          }))
                        }
                      >
                        <option value="">Direct Service</option>
                        {catData?.getCategories?.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="0"
                        placeholder="Service Price (₹)"
                        className="form-input"
                        value={form.price}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                      />

                      <textarea
                        placeholder="Short Description"
                        className="form-input md:col-span-2"
                        rows={3}
                        value={form.description}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />

                      <textarea
                        placeholder="Detailed Description"
                        className="form-input md:col-span-2"
                        rows={5}
                        value={form.details}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            details: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </section>

                  {/* HIGHLIGHTS + BENEFITS */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* HIGHLIGHTS */}
                    <section className="bg-white/60 backdrop-blur-xl border border-gray-200/80 rounded-2xl p-5 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        Key Highlights
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">
                        Add important service features
                      </p>

                      <div className="space-y-3">
                        {form.highlights?.map((highlight, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              placeholder={`Highlight ${index + 1}`}
                              className="form-input flex-1"
                              value={highlight}
                              onChange={(e) =>
                                updateArrayField(
                                  "highlights",
                                  index,
                                  e.target.value,
                                )
                              }
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeArrayItem("highlights", index)
                              }
                              className="rounded-xl px-3 bg-red-50 text-red-500 hover:bg-red-100 transition"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => addArrayItem("highlights", "")}
                        className="mt-4 text-sm font-semibold text-purple-600 hover:text-purple-800"
                      >
                        + Add Highlight
                      </button>
                    </section>

                    {/* BENEFITS */}
                    <section className="bg-white/60 backdrop-blur-xl border border-gray-200/80 rounded-2xl p-5 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        Benefits
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">
                        Explain the benefits of this service
                      </p>

                      <div className="space-y-3">
                        {form.benefits?.map((benefit, index) => (
                          <div
                            key={index}
                            className="bg-white/70 border border-gray-200 rounded-xl p-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-gray-500">
                                Benefit {index + 1}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  removeArrayItem("benefits", index)
                                }
                                className="text-xs text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>

                            <input
                              placeholder="Benefit Title"
                              className="form-input mb-2"
                              value={benefit.title}
                              onChange={(e) =>
                                updateNestedArrayField(
                                  "benefits",
                                  index,
                                  "title",
                                  e.target.value,
                                )
                              }
                            />

                            <textarea
                              placeholder="Benefit Description"
                              className="form-input"
                              rows={2}
                              value={benefit.description}
                              onChange={(e) =>
                                updateNestedArrayField(
                                  "benefits",
                                  index,
                                  "description",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          addArrayItem("benefits", {
                            title: "",
                            description: "",
                          })
                        }
                        className="mt-4 text-sm font-semibold text-purple-600 hover:text-purple-800"
                      >
                        + Add Benefit
                      </button>
                    </section>
                  </div>

                  {/* DURATION AND PROCESS */}
                  <section className="bg-white/60 backdrop-blur-xl border border-gray-200/80 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      Duration and Process
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Session information and practitioner details
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        placeholder="Duration (e.g. 30–45 minutes)"
                        className="form-input"
                        value={form.duration}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            duration: e.target.value,
                          }))
                        }
                      />

                      <input
                        placeholder="Mode (e.g. Online / Distance Healing)"
                        className="form-input"
                        value={form.mode}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            mode: e.target.value,
                          }))
                        }
                      />

                      <textarea
                        placeholder="Best For"
                        className="form-input"
                        rows={3}
                        value={form.bestFor}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            bestFor: e.target.value,
                          }))
                        }
                      />

                      <textarea
                        placeholder="Practitioner Information"
                        className="form-input"
                        rows={3}
                        value={form.practitioner}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            practitioner: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </section>

                  {/* HOW IT WORKS */}
                  <section className="bg-white/60 backdrop-blur-xl border border-gray-200/80 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      How It Works
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Add the process step by step
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {form.howItWorks?.map((step, index) => (
                        <div key={index} className="flex gap-2 items-start">
                          <div className="flex-1">
                            <label className="text-xs text-gray-500 mb-1 block">
                              Step {index + 1}
                            </label>

                            <textarea
                              placeholder={`Describe step ${index + 1}`}
                              className="form-input"
                              rows={3}
                              value={step}
                              onChange={(e) =>
                                updateArrayField(
                                  "howItWorks",
                                  index,
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => removeArrayItem("howItWorks", index)}
                            className="mt-5 rounded-xl px-3 py-2 bg-red-50 text-red-500 hover:bg-red-100"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => addArrayItem("howItWorks", "")}
                      className="mt-4 text-sm font-semibold text-purple-600 hover:text-purple-800"
                    >
                      + Add Step
                    </button>
                  </section>

                  {/* FAQ + TESTIMONIALS */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* FAQS */}
                    <section className="bg-white/60 backdrop-blur-xl border border-gray-200/80 rounded-2xl p-5 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        Frequently Asked Questions
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">
                        Common questions and answers
                      </p>

                      <div className="space-y-3">
                        {form.faqs?.map((faq, index) => (
                          <div
                            key={index}
                            className="bg-white/70 border border-gray-200 rounded-xl p-3"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-semibold text-gray-500">
                                FAQ {index + 1}
                              </span>

                              <button
                                type="button"
                                onClick={() => removeArrayItem("faqs", index)}
                                className="text-xs text-red-500"
                              >
                                Remove
                              </button>
                            </div>

                            <input
                              placeholder="Question"
                              className="form-input mb-2"
                              value={faq.question}
                              onChange={(e) =>
                                updateNestedArrayField(
                                  "faqs",
                                  index,
                                  "question",
                                  e.target.value,
                                )
                              }
                            />

                            <textarea
                              placeholder="Answer"
                              className="form-input"
                              rows={3}
                              value={faq.answer}
                              onChange={(e) =>
                                updateNestedArrayField(
                                  "faqs",
                                  index,
                                  "answer",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          addArrayItem("faqs", {
                            question: "",
                            answer: "",
                          })
                        }
                        className="mt-4 text-sm font-semibold text-purple-600"
                      >
                        + Add FAQ
                      </button>
                    </section>

                    {/* TESTIMONIALS */}
                    <section className="bg-white/60 backdrop-blur-xl border border-gray-200/80 rounded-2xl p-5 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        Testimonials
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">
                        Client feedback and experiences
                      </p>

                      <div className="space-y-3">
                        {form.testimonials?.map((testimonial, index) => (
                          <div
                            key={index}
                            className="bg-white/70 border border-gray-200 rounded-xl p-3"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-semibold text-gray-500">
                                Testimonial {index + 1}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  removeArrayItem("testimonials", index)
                                }
                                className="text-xs text-red-500"
                              >
                                Remove
                              </button>
                            </div>

                            <textarea
                              placeholder="Client Experience"
                              className="form-input mb-2"
                              rows={3}
                              value={testimonial.content}
                              onChange={(e) =>
                                updateNestedArrayField(
                                  "testimonials",
                                  index,
                                  "content",
                                  e.target.value,
                                )
                              }
                            />

                            <input
                              placeholder="Client Name or Initials"
                              className="form-input"
                              value={testimonial.clientName}
                              onChange={(e) =>
                                updateNestedArrayField(
                                  "testimonials",
                                  index,
                                  "clientName",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          addArrayItem("testimonials", {
                            content: "",
                            clientName: "",
                          })
                        }
                        className="mt-4 text-sm font-semibold text-purple-600"
                      >
                        + Add Testimonial
                      </button>
                    </section>
                  </div>

                  {/* SEO */}
                  <section className="bg-white/60 backdrop-blur-xl border border-gray-200/80 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      SEO Details
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Search engine optimization information
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        placeholder="SEO Title"
                        className="form-input"
                        value={form.seoTitle}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            seoTitle: e.target.value,
                          }))
                        }
                      />

                      <input
                        placeholder="Primary Keyword"
                        className="form-input"
                        value={form.primaryKeyword}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            primaryKeyword: e.target.value,
                          }))
                        }
                      />

                      <textarea
                        placeholder="Meta Description"
                        className="form-input md:col-span-2"
                        rows={3}
                        value={form.metaDescription}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            metaDescription: e.target.value,
                          }))
                        }
                      />

                      <input
                        placeholder="Supporting Keywords (comma separated)"
                        className="form-input md:col-span-2"
                        value={form.supportingKeywords}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            supportingKeywords: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </section>

                  {/* IMAGE */}
                  <section className="bg-white/60 backdrop-blur-xl border border-gray-200/80 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      Service Image
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Upload a cover image for this service
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      <input
                        type="file"
                        accept="image/*"
                        className="form-input"
                        onChange={handleImageChange}
                      />

                      {preview && (
                        <Image
                          src={preview}
                          alt="Service preview"
                          width={500}
                          height={250}
                          className="w-full h-40 object-cover rounded-xl border border-gray-200"
                        />
                      )}
                    </div>
                  </section>
                </div>

                {/* STICKY FOOTER */}
                <div className="pt-4 mt-2 border-t border-gray-200 bg-white/80 backdrop-blur-xl">
                  <button
                    type="button"
                    onClick={handleServiceSubmit}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white w-full p-3.5 rounded-2xl font-semibold shadow-lg shadow-purple-200 transition-all duration-200"
                  >
                    {editing ? "Update Service" : "Save Service"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* {mappingOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[700px] rounded-lg p-5">
            <h2 className="text-xl font-semibold mb-4">Map Astrologers</h2>

            <p className="mb-4 font-medium">{selectedService?.name}</p>

            <div className="max-h-[450px] grid grid-cols-2 gap-5 overflow-y-auto">
              {astroData?.getAstrologerListBySearch?.data?.map((astro) => {
                const selected = mappedAstrologers.find(
                  (a) => a.astrologerId === astro.id,
                );

                return (
                  <div
                    key={astro.id}
                    className="flex items-center rounded bg-gray-100 px-3 py-1  gap-4  "
                  >
                    <input
                      type="checkbox"
                      checked={!!selected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setMappedAstrologers((prev) => [
                            ...prev,
                            {
                              astrologerId: astro.id,
                              displayName: astro.displayName,
                              price: "",
                            },
                          ]);
                        } else {
                          setMappedAstrologers((prev) =>
                            prev.filter((x) => x.astrologerId !== astro.id),
                          );
                        }
                      }}
                    />

                    <span className="w-52">{astro.displayName}</span>

                    {selected && (
                      <input
                        type="number"
                        placeholder="Price"
                        value={selected.price}
                        onChange={(e) =>
                          setMappedAstrologers((prev) =>
                            prev.map((x) =>
                              x.astrologerId === astro.id
                                ? {
                                    ...x,
                                    price: e.target.value,
                                  }
                                : x,
                            ),
                          )
                        }
                        className="border border-gray-200 bg-white rounded-xl p-2 w-20"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex  gap-5 items-center justify-center">
              <button
                onClick={handleSaveMappings}
                className="bg-green-600 text-white px-4 py-1 rounded-xl mt-4"
              >
                Save Mapping
              </button>
              <button
                onClick={handleCancelMappings}
                className="bg-gray-400 text-white px-4 py-1 rounded-xl mt-4"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
