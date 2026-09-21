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
  GET_ASTRO_LIST,
  GET_CATEGORIES,
} from "@/app/graphQL/astroHiring";

/* ------------------ GRAPHQL ------------------ */

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

      category {
        id
        name
        slug
      }
      astrologerMappings {
        price

        astrologer {
          displayName
        }
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
  mutation ($input: CreateServiceInput!) {
    createService(input: $input) {
      id
    }
  }
`;

const UPDATE_SERVICE = gql`
  mutation ($id: ID!, $input: CreateServiceInput!) {
    updateService(id: $id, input: $input) {
      id
    }
  }
`;

const DELETE_SERVICE = gql`
  mutation ($id: ID!) {
    deleteService(id: $id)
  }
`;
const GET_SERVICE_ASTROLOGERS = gql`
  query ($serviceId: ID!) {
    getServiceAstrologers(serviceId: $serviceId) {
      id
      price

      astrologer {
        id
        displayName
      }
    }
  }
`;
const SAVE_SERVICE_ASTROLOGERS = gql`
  mutation ($serviceId: ID!, $astrologers: [ServiceAstrologerInput!]!) {
    saveServiceAstrologers(serviceId: $serviceId, astrologers: $astrologers)
  }
`;

/* ------------------ COMPONENT ------------------ */

export default function DhwaniServicesAdmin() {
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
  const [deleteService] = useMutation(DELETE_SERVICE);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    type: "DIRECT_SERVICE",
    price: "",
    description: "",
    longText: "",
    categoryId: "",
  });
  const [file, setFile] = useState(null);

  const [preview, setPreview] = useState("");
  const [modalType, setModalType] = useState("service");

  const [mappingOpen, setMappingOpen] = useState(false);

  const [selectedService, setSelectedService] = useState(null);

  const [mappedAstrologers, setMappedAstrologers] = useState([]);
  const { data: astroData } = useQuery(GET_ASTRO_LIST, {
    variables: {
      searchInput: {
        page: 1,
        limit: 50,
      },
    },
  });
  const [saveMappings] = useMutation(SAVE_SERVICE_ASTROLOGERS);

  const openMappingModal = async (service) => {
    setSelectedService(service);

    const res = await client.query({
      query: GET_SERVICE_ASTROLOGERS,
      variables: {
        serviceId: service.id,
      },
      fetchPolicy: "network-only",
    });

    setMappedAstrologers(
      res.data.getServiceAstrologers.map((a) => ({
        astrologerId: a.astrologer.id,
        displayName: a.astrologer.displayName,
        price: a.price,
      })),
    );

    setMappingOpen(true);
  };
  /* ------------------ EDIT PREFILL ------------------ */

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        slug: editing.slug,
        type: editing.type,
        price: editing.price || "",
        description: editing.description || "",
        longText: editing.longText || "",
        categoryId: editing.category?.id || "",
      });

      setPreview(editing.image || "");
    }
  }, [editing]);

  /* ------------------ RESET ------------------ */

  const resetForm = () => {
    setForm({
      name: "",
      slug: "",
      type: "DIRECT_SERVICE",

      description: "",
      longText: "",
      categoryId: "",
    });

    setPreview("");
    setFile(null);
    setEditing(null);
 
  };

  /* ------------------ IMAGE ------------------ */

  const handleSaveMappings = async () => {
    const invalid = mappedAstrologers.find((a) => !a.price);

    if (invalid) {
      toast.error("Please enter price for all selected astrologers");
      return;
    }

    await saveMappings({
      variables: {
        serviceId: selectedService.id,

        astrologers: mappedAstrologers.map((a) => ({
          astrologerId: a.astrologerId,
          price: Number(a.price),
        })),
      },
    });

    toast.success("Mapping Saved");

    setMappingOpen(false);
  };

  const handleCancelMappings = () => {
    setMappingOpen(false);
  };

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

  const handleServiceSubmit = async () => {
    let imageUrl = editing?.image || "";

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

    const input = {
      name: form.name,
      slug: form.slug,
      image: imageUrl || editing?.image,
      description: form.description,
      longText: form.longText,
      categoryId: form.categoryId || null,
    };

    if (editing) {
      await updateService({
        variables: {
          id: editing.id,
          input,
        },
      });

      toast.success("Service Updated");
    } else {
      await createService({
        variables: {
          input,
        },
      });

      toast.success("Service Created");
    }

    await refetch();
    resetForm();
    setOpen(false);

    toast.success("Service Created");

    refetch();
    resetForm();
    setOpen(false);
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
        "https://dhwaniastro.com/adminAuth/api/upload-services",
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
                    src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${cat.image}`}
                    alt={cat.name}
                    width={250}
                    height={150}
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
            {data?.getServices?.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-start justify-between bg-white shadow rounded-xl"
              >
                <div className="flex flex-col items-center">
                  <h3 className="font-semibold">{item.name}</h3>

                  {item.image && (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${item.image}`}
                      alt=""
                      width={300}
                      height={150}
                      className="h-32 w-full object-cover rounded mb-2"
                    />
                  )}
                </div>

                <div className="p-2">
                  <p>{item.description}</p>

                  <p>Category: {item.category?.name || "None"}</p>
                  <div className="mt-2 overflow-y-auto h-16 text-xs">
                    {item.astrologerMappings?.map((m) => (
                      <p key={m.astrologer.displayName}>
                        {m.astrologer.displayName}
                        {" - "}₹{m.price}
                      </p>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      disabled={!canUpdate}
                      onClick={() => {
                        if (!canUpdate) return;
                        setEditing(item);
                        setOpen(true);
                      }}
                      className="bg-blue-500 cursor-pointer rounded-full text-white px-2 py-1 text-xs"
                    >
                      Edit
                    </button>

                    <ProtectedActionButton
                      module="services"
                      action="delete"
                      executeAction={executeAction}
                      mutationFn={deleteService}
                      variables={{ id: item.id }}
                      onSuccess={refetch}
                      className="bg-red-500 text-white cursor-pointer rounded-full px-2 py-1 text-xs"
                    >
                      Delete
                    </ProtectedActionButton>
                  </div>
                  <button
                    onClick={() => openMappingModal(item)}
                    className="bg-green-600 cursor-pointer text-white px-2 mt-2 py-1 text-xs rounded"
                  >
                    Map Astrologers
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px] max-h-[90vh] overflow-y-auto">
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
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />

                <input
                  placeholder="Category Slug"
                  className="border border-gray-200 rounded-full p-2 w-full mb-3"
                  value={form.slug}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      slug: e.target.value,
                    })
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
              <>
                <input
                  placeholder="Service Name"
                  className="border border-gray-200 rounded-full p-2 w-full mb-3"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />

                <input
                  placeholder="Service Slug"
                  className="border border-gray-200 rounded-full p-2 w-full mb-3"
                  value={form.slug}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      slug: e.target.value,
                    })
                  }
                />

                <select
                  className="border border-gray-200 rounded-full p-2 w-full mb-3"
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      categoryId: e.target.value,
                    })
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
                  placeholder="Short Description"
                  className="border border-gray-200 rounded-2xl p-2 w-full mb-3"
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                />

                <textarea
                  placeholder="Long Description"
                  className="border border-gray-200 rounded-2xl p-2 w-full mb-3"
                  rows={5}
                  value={form.longText}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      longText: e.target.value,
                    })
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
                    className="w-full h-30 object-cover rounded-xl mb-3"
                  />
                )}

                <button
                  onClick={handleServiceSubmit}
                  className="bg-purple-600 text-white w-full p-2 rounded-full"
                >
                  Save Service
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {mappingOpen && (
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
      )}
    </div>
  );
}
