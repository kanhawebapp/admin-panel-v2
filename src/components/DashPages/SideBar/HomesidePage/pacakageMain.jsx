"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { MdDelete, MdCancel } from "react-icons/md";
import { TbEdit } from "react-icons/tb";

import CustomButton from "@/components/Custom/CustomButtom";
import CustomInput from "@/components/Custom/CustomInput";
import CustomToggle from "@/components/Custom/CustomToggle";
import AlertLoading from "@/app/common/AlertLoading";
import ConfirmModal from "@/components/Custom/ConfirmModal";

import {
  GET_RECHARGE_PACKS,
  CREATE_RECHARGE_PACK,
  UPDATE_RECHARGE_PACK,
  DELETE_RECHARGE_PACK,
} from "@/app/graphQL/rechargePack";

import { usePermissions } from "@/context/PermissionContext";
import ProtectedActionButton from "@/components/Custom/ActionButton";
import { useMutation, useQuery } from "@apollo/client/react";
import { useActionHandler } from "@/hooks/useActionHandler";
import DataTable from "@/components/utils/DataTable";

export default function PackageMain() {
  const [open, setOpen] = useState(false);
  const [editPack, setEditPack] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    coins: "",
    talktime: "",
    validityDays: "",
    isActive: true,
    hideAfterFirstRecharge: false,
     isFirstTimeOffer: false,
  });

  const { can, isSuperAdmin } = usePermissions();
  const canRead = isSuperAdmin || can("walletpackages", "read");
  const canCreate = isSuperAdmin || can("walletpackages", "create");
  const canUpdate = isSuperAdmin || can("walletpackages", "update");

  const { confirmState, setConfirmState, executeAction, handleConfirm } =
    useActionHandler();

  const { data, loading, refetch } = useQuery(GET_RECHARGE_PACKS, {
    skip: !canRead,
  });

  const [createPack] = useMutation(CREATE_RECHARGE_PACK);
  const [updatePack] = useMutation(UPDATE_RECHARGE_PACK);
  const [deletePack] = useMutation(DELETE_RECHARGE_PACK);

  const packs = data?.getRechargePacks || [];

  if (!canRead) {
    return <p className="p-10 text-red-500">No Access</p>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      coins: "",
      talktime: "",
      validityDays: "",
      isActive: true,
      hideAfterFirstRecharge: false,
      isFirstTimeOffer: false,
    });
    setErrors({});
    setEditPack(null);
  };
  const handleSubmit = async () => {
    if (!validateForm()) return;
    const canSubmit =
      isSuperAdmin ||
      (editPack
        ? can("walletpackages", "update")
        : can("walletpackages", "create"));

    if (!canSubmit) {
      toast.error("No permission");
      return;
    }

    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        coins: parseInt(form.coins),
        talktime: parseInt(form.talktime),
        validityDays: parseInt(form.validityDays),
        isActive: form.isActive,
        hideAfterFirstRecharge: form.hideAfterFirstRecharge, 
        isFirstTimeOffer: form.isFirstTimeOffer,
      };

      if (editPack) {
        await updatePack({
          variables: {
            id: editPack.id,
            input: payload,
          },
        });
        toast.success("Package updated");
      } else {
        await createPack({
          variables: { input: payload },
        });
        toast.success("Package created");
      }

      setOpen(false);
      resetForm();
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };
  const validateForm = () => {
    const err = {};

    if (!form.name.trim()) {
      err.name = "Package name is required";
    }

    if (!form.description.trim()) {
      err.description = "Description is required";
    }

    if (!form.price) {
      err.price = "Price is required";
    } else if (Number(form.price) <= 0) {
      err.price = "Price must be greater than 0";
    }

    if (!form.coins) {
      err.coins = "Coins are required";
    } else if (Number(form.coins) <= 0) {
      err.coins = "Coins must be greater than 0";
    }

    if (!form.talktime) {
      err.talktime = "Talktime is required";
    } else if (Number(form.talktime) <= 0) {
      err.talktime = "Talktime must be greater than 0";
    }

    if (!form.validityDays) {
      err.validityDays = "Validity is required";
    } else if (Number(form.validityDays) <= 0) {
      err.validityDays = "Validity must be greater than 0";
    }

    setErrors(err);

    return Object.keys(err).length === 0;
  };

  const handleToggle = async (pkg) => {
    if (!(isSuperAdmin || can("walletpackages", "update"))) {
      toast.error("No permission");
      return;
    }

    try {
      await updatePack({
        variables: {
          id: pkg.id,
          input: {
            name: pkg.name,
            description: pkg.description,
            price: pkg.price,
            coins: pkg.coins,
            talktime: pkg.talktime,
            validityDays: pkg.validityDays,
            hideAfterFirstRecharge: pkg.hideAfterFirstRecharge,
            isFirstTimeOffer: pkg.isFirstTimeOffer,            
            isActive: !pkg.isActive,
          },
        },
      });

      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };
  const columns = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Price",
      render: (row) => `₹${row.price}`,
    },
    {
      header: "Talktime",
      accessor: "talktime",
    },
    {
      header: "Coins",
      accessor: "coins",
    },
    {
      header: "Validity",
      render: (row) => `${row.validityDays} Days`,
    },
    {
      header: "Status",
      render: (row) => (
        <CustomToggle
          checked={row.isActive}
          onChange={() => handleToggle(row)}
        />
      ),
    },
    {
      header: "Hide After First Recharge",
      render: (row) => (row.hideAfterFirstRecharge ? "Yes" : "No"),
    },
      {
      header: "First Time Offer",
      render: (row) => (row.isFirstTimeOffer ? "Yes" : "No"),
    },
    
    {
      header: "Created At",
      render: (row) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-",
    },
    {
      header: "Action",
      width: "140px",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <button
            disabled={!canUpdate}
            onClick={() => {
              setEditPack(row);
              setForm({
                ...row,
                price: String(row.price),
                coins: String(row.coins),
                talktime: String(row.talktime),
                validityDays: String(row.validityDays),
                hideAfterFirstRecharge: row.hideAfterFirstRecharge,
              });
              setOpen(true);
            }}
            className={`p-2 rounded-full cursor-pointer ${
              !canUpdate
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-200"
            }`}
          >
            <TbEdit />
          </button>

          <ProtectedActionButton
            module="walletpackages"
            action="delete"
            executeAction={executeAction}
            mutationFn={deletePack}
            variables={{ id: row.id }}
            onSuccess={() => {
              toast.success("Deleted");
              refetch();
            }}
            className="p-2 cursor-pointer bg-red-500 text-white rounded-full"
          >
            <MdDelete />
          </ProtectedActionButton>
        </div>
      ),
    },
  ];

  return (
    <div className="ml-0 bg-[#928f8f34] p-6 rounded-lg">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h3 className="text-xl font-semibold">Manage Wallet Packages</h3>

          <CustomButton
            variant="green"
            onClick={() => {
              if (!canCreate) return;
              resetForm();
              setOpen(true);
            }}
            className={
              !canCreate ? "opacity-50 cursor-not-allowed" : "px-2 py-1"
            }
          >
            Create Package
          </CustomButton>
        </div>

        {/* CONFIRM MODAL */}
        <ConfirmModal
          open={!!confirmState}
          onCancel={() => setConfirmState(null)}
          onConfirm={handleConfirm}
        />

        {/* MODAL */}
        {open && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-7 py-2 bg-violet-400">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {editPack ? "Edit Wallet Package" : "Create Wallet Package"}
                  </h2>

                  <p className="text-sm text-violet-100 mt-1">
                    Configure recharge package details for users.
                  </p>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center"
                >
                  <MdCancel className="text-2xl text-white" />
                </button>
              </div>

              <div className="p-7 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Package Name
                    </label>
                    <CustomInput
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Package Name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Price
                    </label>
                    <CustomInput
                      name="price"
                      type="number"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="Price"
                    />
                    {errors.price && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.price}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    {" "}
                    <label className="text-sm font-semibold text-gray-700">
                      Talktime
                    </label>
                    <CustomInput
                      name="talktime"
                      type="number"
                      value={form.talktime}
                      onChange={handleChange}
                      placeholder="Talktime"
                    />
                    {errors.talktime && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.talktime}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    {" "}
                    <label className="text-sm font-semibold text-gray-700">
                      Coins
                    </label>
                    <CustomInput
                      name="coins"
                      type="number"
                      value={form.coins}
                      onChange={handleChange}
                      placeholder="Coins"
                    />
                    {errors.coins && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.coins}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    {" "}
                    <label className="text-sm font-semibold text-gray-700">
                      Validity Days
                    </label>
                    <CustomInput
                      name="validityDays"
                      type="number"
                      value={form.validityDays}
                      onChange={handleChange}
                      placeholder="Validity Days"
                    />
                    {errors.validityDays && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.validityDays}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    {" "}
                    <label className="text-sm font-semibold text-gray-700">
                      Description
                    </label>
                    <CustomInput
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Description"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-violet-100 bg-violet-50 px-5 py-4">
                <div>
                  <p className="font-semibold text-gray-800">Package Status</p>

                  <p className="text-sm text-gray-500">
                    Enable or disable this wallet package.
                  </p>
                </div>

                <CustomToggle
                  checked={form.isActive}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      isActive: val,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border p-4">
                <div>
                  <p className="font-medium">Hide After First Recharge</p>

                  <p className="text-sm text-gray-500">
                    If enabled, this package will no longer be visible after the
                    user's first successful recharge.
                  </p>
                </div>

                <CustomToggle
                  checked={form.hideAfterFirstRecharge}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      hideAfterFirstRecharge: val,
                    }))
                  }
                />
              </div>
                   <div className="flex items-center justify-between rounded-xl border p-4">
                <div>
                  <p className="font-medium">First Time Offer</p>

                  {/* <p className="text-sm text-gray-500">
                    If enabled, this package will no longer be visible after the
                    user's first successful recharge.
                  </p> */}
                </div>

                <CustomToggle
                  checked={form.isFirstTimeOffer}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      isFirstTimeOffer: val,
                    }))
                  }
                />
              </div>

              <div className="flex justify-center gap-3 border-t border-gray-100 py-5">
                <CustomButton
                  variant="gray"
                  className="px-5 py-2 rounded-full"
                  onClick={() => {
                    resetForm();
                    setOpen(false);
                  }}
                >
                  Cancel
                </CustomButton>

                <CustomButton
                  variant="green"
                  className="px-6 py-2 rounded-full shadow-lg shadow-violet-300/40"
                  onClick={handleSubmit}
                >
                  {editPack ? "Update Package" : "Create Package"}
                </CustomButton>
              </div>
            </div>
          </div>
        )}

        <AlertLoading show={loading} title="Loading..." />

        <DataTable
          columns={columns}
          data={packs}
          pagination
          highlightOnHover
          responsive
        />
      </div>
    </div>
  );
}
