"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client/react";

import DataTable from "@/components/utils/DataTable";
import { usePermissions } from "@/context/PermissionContext";
import { useActionHandler } from "@/hooks/useActionHandler";
import ConfirmModal from "@/components/Custom/ConfirmModal";
import ProtectedActionButton from "@/components/Custom/ActionButton";
import toast from "react-hot-toast";

import {
  CREATE_GIFT,
  DELETE_GIFT,
  GET_GIFTS,
  UPDATE_GIFT,
} from "@/app/graphQL/homeGql";
import { UPDATE_GIFT_STATUS } from "@/app/graphQL/astroHiring";
import CustomToggle from "@/components/Custom/CustomToggle";

export default function GiftManager() {
  const { can, isSuperAdmin } = usePermissions();

  const { confirmState, setConfirmState, executeAction, handleConfirm } =
    useActionHandler();

  const { data, loading, error, refetch } = useQuery(GET_GIFTS);
  const gifts = data?.getGifts?.data || data?.getGifts || [];
  const [updateGiftStatus] = useMutation(UPDATE_GIFT_STATUS);

  const [createGift] = useMutation(CREATE_GIFT);
  const [updateGift] = useMutation(UPDATE_GIFT);
  const [deleteGift] = useMutation(DELETE_GIFT);

  const [openModal, setOpenModal] = useState(false);
  const [editingGift, setEditingGift] = useState(null);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("active");
  const [submitting, setSubmitting] = useState(false);

  const canCreate = isSuperAdmin || can("gifts", "create");
  const canUpdate = isSuperAdmin || can("gifts", "update");

  useEffect(() => {
    if (editingGift) {
      setName(editingGift.name);
      setAmount(editingGift.amount);
      setStatus(editingGift.status);
      setPreview(`http://localhost:4001${editingGift.image}`);
      setFile(null);
    } else {
      resetForm();
    }
  }, [editingGift]);

  const resetForm = () => {
    setName("");
    setAmount("");
    setFile(null);
    setPreview(null);
    setStatus("active");
    setEditingGift(null);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }

    if (selected.size > 2 * 1024 * 1024) {
      toast.error("Max file size is 2MB");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };


  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      let imageUrl = editingGift?.image || "";
      if (file) {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch(
           `${process.env.NEXT_PUBLIC_API_BASE_URL}/adminAuth/api/upload-gifts`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();

        if (!data.url) throw new Error("Invalid upload response");

        imageUrl = data.url;
      }

      if (editingGift) {
        await updateGift({
          variables: {
            id: editingGift.id,
            input: {
              name,
              amount: Number(amount),
              image: imageUrl,
              status,
            },
          },
        });

        toast.success("Gift updated");
      } else {
        await createGift({
          variables: {
            input: {
              name,
              amount: Number(amount),
              image: imageUrl,
              status,
            },
          },
        });

        toast.success("Gift created");
      }

      setOpenModal(false);
      resetForm();
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const giftColumns = [
    { header: "Name", accessor: "name" },
    { header: "Amount", accessor: "amount" },
    {
      header: "Image",
      render: (row) => (
        <img
          src={
            row.image
             ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${row.image}`
              : "/placeholder.png"
          }
          alt={row.name}
          className="h-10 w-10 object-cover mx-auto rounded"
          onError={(e) => {
            console.log("Image failed:", e.target.src);
          }}
        />
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <CustomToggle
          checked={row.status === "active"}
          onChange={async (val) => {
            try {
              await updateGiftStatus({
                variables: {
                  id: row.id,
                  status: val ? "active" : "inactive",
                },
              });

              toast.success("Status updated");
              refetch();
            } catch (error) {
              toast.error("Failed to update status");
            }
          }}
        />
      ),
    },
    {
      header: "Created Date",
      render: (row) => (
        <div className="text-xs">
          {new Date(row.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Kolkata",
          })}
               <p className="text-xs text-gray-500">
              {new Date(row.createdAt).toLocaleTimeString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
        </div>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex justify-center gap-3">
          {canUpdate && (
            <button
              onClick={() => {
                setEditingGift(row);
                setOpenModal(true);
              }}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded-full"
            >
              Edit
            </button>
          )}

          <ProtectedActionButton
            module="gifts"
            action="delete"
            executeAction={executeAction}
            mutationFn={deleteGift}
            variables={{ id: row.id }}
            onSuccess={refetch}
            className="px-3 py-1 text-xs bg-red-500 text-white rounded-full"
          >
            Delete
          </ProtectedActionButton>
        </div>
      ),
    },
  ];

  if (loading) return <p className="p-10">Loading...</p>;
  if (error) return <p className="p-10 text-red-500">{error.message}</p>;

  return (
    <div className="p-10 space-y-5">
      <button
        disabled={!canCreate}
        onClick={() => {
          resetForm();
          setOpenModal(true);
        }}
        className={`px-5 py-2 rounded-full ${
          canCreate
            ? "bg-yellow-500 text-black"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Add Gift
      </button>

      <ConfirmModal
        open={!!confirmState}
        onCancel={() => setConfirmState(null)}
        onConfirm={handleConfirm}
      />

      <DataTable columns={giftColumns} data={gifts} />

      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[400px] space-y-4">
            <h2 className="text-lg font-semibold">
              {editingGift ? "Edit Gift" : "Create Gift"}
            </h2>

            <input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-purple-200 p-2 rounded-full"
            />

            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-purple-200 p-2 rounded-full"
            />

            {preview && (
              <img
                src={preview}
                className="h-20 mx-auto object-cover rounded"
              />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border border-purple-200 p-2 rounded-full"
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-purple-200 p-2 rounded-full"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 border border-gray-300 shadow-lg rounded-full"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-black  text-white rounded-full shadow-lg"
              >
                {submitting
                  ? "Processing..."
                  : editingGift
                    ? "Update"
                    : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
