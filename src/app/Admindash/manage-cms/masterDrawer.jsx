"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useMutation } from "@apollo/client/react";

export default function MasterDrawer({
  open,
  onClose,
  selected,
  refetch,
  CREATE_ITEM,
  UPDATE_ITEM,
  title = "Skill",
}) {
  const [createItem, { loading: creating }] = useMutation(CREATE_ITEM);

  const [updateItem, { loading: updating }] = useMutation(UPDATE_ITEM);
  const initialForm = { name: "", slug: "", sortOrder: 1, isActive: true };
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (selected) {
      setForm({
        name: selected.name,
        slug: selected.slug,
        sortOrder: selected.sortOrder,
        isActive: selected.isActive,
      });
    } else {
      setForm({
        name: "",
        slug: "",
        sortOrder: 1,
        isActive: true,
      });
    }
  }, [selected]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit() {
    const input = {
      ...form,
      slug: form.slug || form.name.trim().toLowerCase().replace(/\s+/g, "-"),
      sortOrder: Number(form.sortOrder),
    };
    try {
      if (selected) {
        await updateItem({ variables: { id: selected.id, input } });
      } else {
        await createItem({ variables: { input } });
      }
      refetch();
      setForm(initialForm);
      onClose();
    } catch (err) {
      console.log(err);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-500 flex rounded-2xl justify-end bg-black/30">
      <div className="h-full w-[460px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <h2 className="text-xl font-bold">
              {selected ? `Edit ${title}` : `Create ${title}`}
            </h2>

            <p className="text-sm text-gray-500">
              Manage {title.toLowerCase()}
            </p>
          </div>

            <button className="cursor-pointer" onClick={onClose}>
         <svg width={22} height={22} viewBox="0 0 640 640"><path fill="rgb(30, 48, 80)" d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM231 231C240.4 221.6 255.6 221.6 264.9 231L319.9 286L374.9 231C384.3 221.6 399.5 221.6 408.8 231C418.1 240.4 418.2 255.6 408.8 264.9L353.8 319.9L408.8 374.9C418.2 384.3 418.2 399.5 408.8 408.8C399.4 418.1 384.2 418.2 374.9 408.8L319.9 353.8L264.9 408.8C255.5 418.2 240.3 418.2 231 408.8C221.7 399.4 221.6 384.2 231 374.9L286 319.9L231 264.9C221.6 255.5 221.6 240.3 231 231z"/></svg>
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium">Name</label>

            <input
              name="name"
              value={form.name}
              onChange={(e) => {
                handleChange(e);

                if (!selected) {
                  setForm((prev) => ({
                    ...prev,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  }));
                }
              }}
              className="w-full rounded-full border-gray-300 border p-3 outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Slug</label>

            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="w-full rounded-full border-gray-300 border p-3 outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Sort Order</label>

            <input
              type="number"
              name="sortOrder"
              value={form.sortOrder}
              onChange={handleChange}
              className="w-full rounded-full border-gray-300 border p-3 outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex items-center justify-between rounded-full border-gray-400 border  p-4">
            <div>
              <p className="text-sm text-gray-500">Show on website</p>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="peer sr-only"
              />

              <div className="peer h-7 w-12 rounded-full bg-gray-300 transition peer-checked:bg-violet-600">
                <div
                  className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white transition-all ${
                    form.isActive ? "translate-x-5" : ""
                  }`}
                />
              </div>
            </label>
          </div>

          <div className="rounded-xl bg-violet-50 p-4">
            <p className="mb-2 text-sm font-semibold">Preview</p>

            <span className="rounded-full bg-violet-600 px-5 py-1 text-xs text-white">
              {form.name || title}
            </span>
          </div>
        </div>

        <div className="absolute bottom-0 flex w-[460px] justify-end gap-3 border-t bg-white p-5">
          <button
            onClick={onClose}
            className="rounded-full cursor-pointer text-xs border px-5 py-2"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={creating || updating}
             className="rounded-full text-xs bg-green-600 px-6 py-2 cursor-pointer text-white"
          >
            {creating || updating
              ? "Saving..."
              : selected
                ? "Update"
                : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
