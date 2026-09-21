"use client";

import { useState, useEffect } from "react";

import { usePermissions } from "@/context/PermissionContext";
import ProtectedActionButton from "@/components/Custom/ActionButton";
import ConfirmModal from "@/components/Custom/ConfirmModal";
import { useActionHandler } from "@/hooks/useActionHandler";
import toast from "react-hot-toast";

import {
  CREATE_TESTIMONIAL,
  DELETE_TESTIMONIAL,
  GET_TESTIMONIALS,
  UPDATE_TESTIMONIAL,
} from "@/app/graphQL/homeGql";

import { useMutation, useQuery } from "@apollo/client/react";

export default function TestimonialPage() {
  const { can, isSuperAdmin } = usePermissions();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [fileError, setFileError] = useState("");
  const { confirmState, setConfirmState, executeAction, handleConfirm } =
    useActionHandler();

  const { data, refetch } = useQuery(GET_TESTIMONIALS);

  const [createTestimonial] = useMutation(CREATE_TESTIMONIAL);
  const [updateTestimonial] = useMutation(UPDATE_TESTIMONIAL);
  const [deleteTestimonial] = useMutation(DELETE_TESTIMONIAL);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    address: "",
    content: "",
    image: "",
    rating: 5,
  });

  // 🔐 PERMISSIONS
  const canCreate = isSuperAdmin || can("testimonials", "create");
  const canUpdate = isSuperAdmin || can("testimonials", "update");
  const canDelete = isSuperAdmin || can("testimonials", "delete");

  // 🔁 sync form for edit
  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        address: editing.address,
        content: editing.content,
        image: editing.image,
        rating: editing.rating,
      });

      setPreview(
        editing.image?.startsWith("http")
          ? editing.image
          : `${process.env.NEXT_PUBLIC_API_BASE_URL}${editing.image}`,
      );
    } else {
      setForm({
        name: "",
        address: "",
        content: "",
        image: "",
        rating: 5,
      });
    }
  }, [editing]);

  const handleSubmit = async () => {
    let imageUrl = form.image;
    if (file) {
      const formData = new FormData();

      formData.append("image", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/adminAuth/api/upload-testimonials`,
        {
          method: "POST",
          body: formData,
        },
      );

      const uploadData = await res.json();

      if (!uploadData.url) {
        throw new Error("Image upload failed");
      }

      imageUrl = uploadData.url;
    }
    try {
      const allowed = isSuperAdmin || (editing ? canUpdate : canCreate);

      if (!allowed) return;

      if (editing) {
        await updateTestimonial({
          variables: {
            id: editing.id,
            input: {
              ...form,
              image: imageUrl,
            },
          },
        });
        toast.success("Updated");
      } else {
        await createTestimonial({
          variables: {
            input: {
              ...form,
              image: imageUrl,
            },
          },
        });
        toast.success("Created");
      }

      setOpen(false);
      setEditing(null);
      refetch();
      setForm({
        name: "",
        address: "",
        content: "",
        image: "",
        rating: 5,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 helper (clean af)
  const getPermissionClass = (allowed) =>
    allowed ? "cursor-pointer" : "cursor-not-allowed opacity-70";

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Testimonials</h1>

        <button
          onClick={() => {
            if (!canCreate) return;
            setEditing(null);
            setOpen(true);
          }}
          className={`px-4 py-2 rounded-full shadow-xl bg-blue-600 text-white ${getPermissionClass(
            canCreate,
          )}`}
        >
          + Create Testimonial
        </button>
      </div>

      {/* CONFIRM */}
      <ConfirmModal
        open={!!confirmState}
        onCancel={() => setConfirmState(null)}
        onConfirm={handleConfirm}
      />

      {/* LIST */}
      <div className="grid grid-cols-3 gap-4">
        {data?.testimonials?.map((t) => (
          <div
            key={t.id}
            className="border border-gray-300  p-4 rounded-2xl shadow-2xl"
          >
            <img
              src={
                t.image?.startsWith("http")
                  ? t.image
                  : `${process.env.NEXT_PUBLIC_API_BASE_URL}${t.image}`
              }
              className="h-32 w-full rounded-xl object-cover"
            />

            <h2 className="font-bold mt-1">{t.name}</h2>
            <div className="flex gap-1">
              <p className="text-xs text-gray-500">{t.address}</p>

              {Array.from({ length: t.rating }).map((_, i) => (
                <span key={i}>⭐</span>
              ))}
            </div>

            <p className="mt-2">{t.content}</p>

            <div className="flex gap-2 mt-3">
              {/* EDIT */}
              <button
                onClick={() => {
                  if (!canUpdate) return;
                  setEditing(t);
                  setOpen(true);
                }}
                className={`px-3 py-1 text-xs rounded-full shadow-xl bg-blue-500 text-white ${getPermissionClass(
                  canUpdate,
                )}`}
              >
                Edit
              </button>

              {/* DELETE */}
              <ProtectedActionButton
                module="testimonials"
                action="delete"
                executeAction={executeAction}
                mutationFn={deleteTestimonial}
                variables={{ id: t.id }}
                onSuccess={() => {
                  // toast.success("Deleted");
                  refetch();
                }}
                className={`px-3 py-1 text-xs bg-red-500 shadow-xl text-white rounded-full ${getPermissionClass(
                  canDelete,
                )}`}
              >
                Delete
              </ProtectedActionButton>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[400px]">
            <h2 className="text-xl font-semibold text-center mb-4">
              {editing ? "Edit Testimonial" : "Create Testimonial"}
            </h2>

            <input
              placeholder="Name"
              className="w-full border rounded-full border-gray-300 shadow-xl p-2 mb-2"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              placeholder="Address"
              className="w-full border rounded-full border-gray-300 shadow-xl p-2 mb-2"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />

            <textarea
              placeholder="Review"
              className="w-full border rounded-2xl border-gray-300 shadow-xl p-2 mb-2"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
            {preview && (
              <img
                src={preview}
                alt="preview"
                className="w-24 h-24 object-cover rounded-2xl mb-3"
              />
            )}
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="w-full border rounded-2xl border-gray-300 shadow-xl p-2 mb-1"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];

                if (!selectedFile) return;

                const allowedTypes = [
                  "image/jpeg",
                  "image/png",
                  "application/pdf",
                ];

                if (!allowedTypes.includes(selectedFile.type)) {
                  setFile(null);
                  setFileError("Only JPG, PNG or PDF files are allowed.");
                  e.target.value = "";
                  return;
                }

                setFileError("");
                setFile(selectedFile);
                setPreview(URL.createObjectURL(selectedFile));
              }}
            />

            {fileError && (
              <p className="text-[10px] text-red-500 mt-1 mb-2">{fileError}</p>
            )}

            <select
              className="w-full border rounded-2xl border-gray-300 shadow-xl p-2 mb-2"
              value={form.rating}
              onChange={(e) =>
                setForm({ ...form, rating: Number(e.target.value) })
              }
            >
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r} Star
                </option>
              ))}
            </select>

            <div className="flex text-xs justify-center gap-5">
              <button
                className=" px-4 py-2 text-white cursor-pointer rounded-full bg-gray-400 "
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className={`px-4 py-2 rounded-full cursor-pointer bg-green-600 text-white ${getPermissionClass(
                  editing ? canUpdate : canCreate,
                )}`}
              >
                {editing ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
