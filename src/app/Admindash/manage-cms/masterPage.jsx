"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useMutation, useQuery } from "@apollo/client/react";
import toast from "react-hot-toast";
import DeleteModal from "./DeleteModal";

export default function MasterManager({
  title,
  GET_ITEMS,
  CREATE_ITEM,
  UPDATE_ITEM,
  DELETE_ITEM,
  UPDATE_STATUS,
  Drawer,
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);

  const limit = 10;

  const { data, loading, refetch } = useQuery(GET_ITEMS);

  const [deleteItem] = useMutation(DELETE_ITEM);

  const [updateStatus] = useMutation(UPDATE_STATUS);

  const items = data?.getSkills || data?.getProblems || [];

  const filtered = useMemo(() => {
    return items.filter((x) =>
      x.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [items, search]);

  const totalPages = Math.ceil(filtered.length / limit);

  const current = filtered.slice((page - 1) * limit, page * limit);

  async function remove(id) {
    await deleteItem({
      variables: {
        id,
      },
    });

    refetch();
  }

  async function toggle(item) {
    await updateStatus({
      variables: {
        id: item.id,
        status: !item.isActive,
      },
    });

    refetch();
  }

  return (
    <div className="p-8">
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>

          <p className="text-gray-500">
            Create, update and manage {title.toLowerCase()}
          </p>
        </div>

        <button
          onClick={() => {
            setSelected(null);
            setOpenDrawer(true);
          }}
          className="flex items-center  cursor-pointer gap-2 rounded-full bg-violet-600 px-5 py-3 text-white"
        >
          <Plus size={18} />
          Create {title.slice(0, -1)}
        </button>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <div className="relative w-96">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />

          <input
            placeholder={`Search ${title}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border-gray-300 border py-3 pl-10 pr-4"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-400 bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Name</th>

              <th>Slug</th>

              <th>Order</th>

              <th>Status</th>

              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td className="p-4">
                        <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                      </td>

                      <td>
                        <div className="mx-auto h-5 w-24 animate-pulse rounded bg-gray-200" />
                      </td>

                      <td>
                        <div className="mx-auto h-5 w-10 animate-pulse rounded bg-gray-200" />
                      </td>

                      <td>
                        <div className="mx-auto h-7 w-20 animate-pulse rounded-full bg-gray-200" />
                      </td>

                      <td>
                        <div className="mx-auto h-5 w-16 animate-pulse rounded bg-gray-200" />
                      </td>
                    </tr>
                  ))}
                </td>
              </tr>
            )}

            {!loading &&
              current.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-gray-300 hover:bg-gray-50"
                >
                  <td className="p-4 font-medium">{item.name}</td>

                  <td>{item.slug}</td>

                  <td className="text-center">{item.sortOrder}</td>

                  <td className="text-center">
                    <button
                      onClick={() => toggle(item)}
                      className={`rounded-full px-4 py-1 text-sm text-white ${
                        item.isActive ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>

                  <td>
                    <div className="flex justify-center gap-3">
                      <button
                        className="cursor-pointer"
                        onClick={() => {
                          setSelected(item);
                          setOpenDrawer(true);
                        }}
                      >
                        <Pencil size={18} className="text-blue-600" />
                      </button>

                      <button
                        className="cursor-pointer"
                        onClick={() => setDeleteId(item.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        <button
          disabled={page == 1}
          onClick={() => setPage(page - 1)}
          className="rounded-full  px-2  py-2"
        >
      <svg width={18} height={18} viewBox="0 0 640 640"><path fill="rgb(30, 48, 80)" d="M169.4 297.4C156.9 309.9 156.9 330.2 169.4 342.7L361.4 534.7C373.9 547.2 394.2 547.2 406.7 534.7C419.2 522.2 419.2 501.9 406.7 489.4L237.3 320L406.6 150.6C419.1 138.1 419.1 117.8 406.6 105.3C394.1 92.8 373.8 92.8 361.3 105.3L169.3 297.3z"/></svg>
        </button>

        <span className="rounded-lg bg-violet-100 px-4 py-2">
          {page} / {totalPages || 1}
        </span>

        <button
          disabled={page == totalPages}
          onClick={() => setPage(page + 1)}
          className="rounded-full  px-2 py-2"
        >
          <svg width={18} height={18} viewBox="0 0 640 640"><path fill="rgb(30, 48, 80)" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z"/></svg>
        </button>
      </div>

      <Drawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        selected={selected}
        refetch={refetch}
        CREATE_ITEM={CREATE_ITEM}
        UPDATE_ITEM={UPDATE_ITEM}
      />
      <DeleteModal
        open={!!deleteId}
        title={title.slice(0, -1)}
        onClose={() => setDeleteId(null)}
        onDelete={async () => {
          await deleteItem({
            variables: {
              id: deleteId,
            },
          });

          toast.success(`${title.slice(0, -1)} deleted`);

          setDeleteId(null);

          refetch();
        }}
      />
    </div>
  );
}
