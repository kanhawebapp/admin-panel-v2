"use client";

import { MdDelete, MdCancel } from "react-icons/md";
import { FaEdit } from "react-icons/fa";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import CustomButton from "@/components/Custom/CustomButtom";
import CustomInput from "@/components/Custom/CustomInput";
import CustomToggle from "@/components/Custom/CustomToggle";

import {
  GET_COUPONS,
  CREATE_COUPON,
  DELETE_COUPON,
  UPDATE_COUPON_STATUS,
  UPDATE_COUPON,
} from "../../../../app/graphQL/coupon";

import { usePermissions } from "@/context/PermissionContext";
import ProtectedActionButton from "@/components/Custom/ActionButton";
import { useMutation, useQuery } from "@apollo/client/react";
import CustomDropdown from "@/components/Custom/CustomDropdown";
import { useActionHandler } from "@/hooks/useActionHandler";
import ConfirmModal from "@/components/Custom/ConfirmModal";
import DataTable from "@/components/utils/DataTable";
const INITIAL_COUPON = {
  code: "",
  description: "",
  applicable: "recharge",
  type: "CASHBACK",
  status: "ACTIVE",
  visibility: "VISIBLE",
  couponCount: 0,
  minOrderAmount: 0,

  percentage: 0,
  maxDiscount: 0,
  redeemLimit: 0,
  startDate: "",
  endDate: "",
};
export default function CouponMain() {
  const { confirmState, setConfirmState, executeAction, handleConfirm } =
    useActionHandler();
  const [errors, setErrors] = useState({});
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [isCoupOpen, setCoupOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [coupon, setCoupon] = useState(INITIAL_COUPON);

  const { can, isSuperAdmin } = usePermissions();
  const canRead = isSuperAdmin || can("coupon", "read");
  const canCreate = isSuperAdmin || can("coupon", "create");
  const canUpdate = isSuperAdmin || can("coupon", "update");

  const { data, loading, refetch } = useQuery(GET_COUPONS, {
    skip: !canRead,
  });
  const [updateCoupon] = useMutation(UPDATE_COUPON);
  const [createCoupon] = useMutation(CREATE_COUPON);
  const [deleteCoupon] = useMutation(DELETE_COUPON);
  const [updateStatus] = useMutation(UPDATE_COUPON_STATUS);

  const coupons = data?.getCoupons || [];

  // 🔥 HANDLERS
  const handleChange = (key, value) => {
    setCoupon((prev) => ({
      ...prev,
      [key]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: "",
    }));
  };
  const buildPayload = () => ({
    code: coupon.code.trim(),
    description: coupon.description.trim(),
    applicable: coupon.applicable,

    type: coupon.type,
    status: coupon.status,
    visibility: coupon.visibility,

    couponCount: Number(coupon.couponCount) || 0,
    percentage: Number(coupon.percentage) || 0,
    minOrderAmount: Number(coupon.minOrderAmount) || 0,

    maxDiscount: Number(coupon.maxDiscount) || 0,
    redeemLimit: Number(coupon.redeemLimit) || 0,

    startDate: coupon.startDate,
    endDate: coupon.endDate,
  });
  const validateCoupon = () => {
    const err = {};

  if (!/^[A-Za-z0-9_-]{1,15}$/.test(coupon.code.trim())) {
  err.code =
    "Coupon code can contain only letters, numbers, _ and -, with a maximum of 15 characters";
}

    if (!coupon.description.trim()) {
      err.description = "Description is required";
    }

    if (Number(coupon.percentage) > 100) {
      err.percentage = "Percentage cannot exceed 100";
    }

    if (Number(coupon.maxDiscount) > 1000000) {
      err.maxDiscount = "Invalid amount";
    }

    if (!coupon.minOrderAmount || Number(coupon.minOrderAmount) < 0) {
      err.minOrderAmount = "Enter minimum order amount";
    }

    if (!coupon.redeemLimit || Number(coupon.redeemLimit) <= 0) {
      err.redeemLimit = "Redeem limit is required";
    }

    if (!Number.isInteger(Number(coupon.couponCount))) {
      err.couponCount = "Enter valid count";
    }

    if (!coupon.startDate) {
      err.startDate = "Start date is required";
    }

    if (!coupon.endDate) {
      err.endDate = "End date is required";
    }

    if (
      coupon.startDate &&
      coupon.endDate &&
      new Date(coupon.startDate) > new Date(coupon.endDate)
    ) {
      err.endDate = "End date must be after start date";
    }

    setErrors(err);

    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateCoupon()) return;
    if (!(isSuperAdmin || can("coupon", "create"))) {
      toast.error("No permission");
      return;
    }

    try {
      if (!coupon.code.trim()) {
        return toast.error("Coupon code is required");
      }

      if (!coupon.startDate || !coupon.endDate) {
        return toast.error("Please select start and end dates");
      }

      if (new Date(coupon.startDate) > new Date(coupon.endDate)) {
        return toast.error("End date must be after start date");
      }
      if (editingCouponId) {
        await updateCoupon({
          variables: {
            id: editingCouponId,
            input: buildPayload(),
          },
          refetchQueries: [{ query: GET_COUPONS }],
          awaitRefetchQueries: true,
        });

        toast.success("Coupon Updated Successfully");
      } else {
        await createCoupon({
          variables: {
            input: buildPayload(),
          },
          refetchQueries: [{ query: GET_COUPONS }],
          awaitRefetchQueries: true,
        });

        toast.success("Coupon Added Successfully");
      }
      setCoupon(INITIAL_COUPON);

      setEditingCouponId(null);

      setCoupOpen(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!(isSuperAdmin || can("coupon", "delete"))) {
      toast.error("No permission");
      return;
    }

    if (!confirm("Are you sure to delete this coupon?")) return;

    try {
      await deleteCoupon({ variables: { id } });
      toast.success("Coupon Deleted Successfully");
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleStatusToggle = async (id, value) => {
    if (!(isSuperAdmin || can("coupon", "update"))) {
      toast.error("No permission");
      return;
    }

    try {
      await updateStatus({
        variables: {
          id,
          status: value ? "ACTIVE" : "INACTIVE",
        },
      });

      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Code",
        accessor: "code",
      },

      // {
      //   header: "Description",
      //   accessor: "description",
      // },

      {
        header: "Type",
        render: (row) => <span className="font-medium">{row.type}</span>,
      },
         {
        header: "Applicable",
        render: (row) => <span className="font-medium">{row.applicable}</span>,
      },
            {
        header: "Redem Limit",
        render: (row) => <span className="font-medium">{row.redeemLimit}</span>,
      },
     

      {
        header: "Discount %",
        render: (row) => row.percentage ?? 0,
      },

      {
        header: "Count",
        render: (row) => row.couponCount ?? 0,
      },

    
      {
        header: "Start Date",
        render: (row) =>
          row.startDate
            ? new Date(Number(row.startDate)).toLocaleDateString("en-IN")
            : "-",
      },

      {
        header: "End Date",
        render: (row) =>
          row.endDate
            ? new Date(Number(row.endDate)).toLocaleDateString("en-IN")
            : "-",
      },

      {
        header: "Status",
        render: (row) => (
          <CustomToggle
            checked={row.status}
            onChange={(val) => handleStatusToggle(row.id, val)}
          />
        ),
      },

      {
        header: "Actions",
        render: (row) => (
          <div className="flex gap-2 justify-center ">
            <button
              className="bg-gray-300 text-gray-500 rounded-full p-2  cursor-pointer"
              disabled={!canUpdate}
              onClick={() => {
                setEditingCouponId(row.id);

                setCoupon({
                  code: row.code || "",
                  description: row.description || "",
                  applicable: row.applicable || "recharge",

                  type: row.type || "CASHBACK",

                  status: row.status ? "ACTIVE" : "INACTIVE",
                  minOrderAmount: row.minOrderAmount || 0,
                  visibility: row.visibility || "VISIBLE",

                  couponCount: row.couponCount || 0,
                  percentage: row.percentage || 0,

                  maxDiscount: row.maxDiscount || 0,
                  redeemLimit: row.redeemLimit || 0,

                  startDate: row.startDate
                    ? new Date(Number(row.startDate))
                        .toISOString()
                        .split("T")[0]
                    : "",

                  endDate: row.endDate
                    ? new Date(Number(row.endDate)).toISOString().split("T")[0]
                    : "",
                });
                setErrors({});
                setCoupOpen(true);
              }}
            >
              <FaEdit />
            </button>

            <ProtectedActionButton
              module="coupon"
              action="delete"
              executeAction={executeAction}
              mutationFn={deleteCoupon}
              variables={{ id: row.id }}
              onSuccess={refetch}
              className="px-2 py-1 bg-red-400 text-white rounded-full cursor-pointer"
            >
              <MdDelete />
            </ProtectedActionButton>
          </div>
        ),
      },
    ],
    [canUpdate, deleteCoupon, executeAction, refetch],
  );
  const filteredCoupons = coupons.filter((c) =>
    (c.code || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!canRead) {
    return <p className="p-10 text-red-500">No Access to Coupons</p>;
  }

  if (loading) return <p>Loading coupons...</p>;

  return (
    <div className="ml-0 bg-[#928f8f34] p-6 rounded-lg">
      {isCoupOpen && (
        <div className="fixed inset-0 z-500 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-[0_25px_80px_rgba(0,0,0,0.20)] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between bg-violet-400 px-8 py-3">
              <div className="flex items-center gap-4">
             

                <div>
                  <h2 className="text-xl font-bold text-black">
                    {editingCouponId ? "Edit Coupon" : "Create Coupon"}
                  </h2>

                  <p className="text-violet-100 text-sm mt-1">
                    Configure discount coupons for recharge & services.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCoupOpen(false)}
                className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 transition flex items-center justify-center"
              >
                <MdCancel className="text-white text-2xl" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-2">
                <div className="space-y-1">
                  <CustomInput
                  className="w-[80%]"
                    label="Coupon Code"
                    value={coupon.code}
                    onChange={(e) => handleChange("code", e.target.value)}
                  />

                  {errors.code && (
                    <p className="text-xs text-red-500">{errors.code}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <CustomInput
                                    className="w-[80%]"

                    label="Description"
                    value={coupon.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                  />{" "}
                  {errors.description && (
                    <p className="text-xs text-red-500">{errors.description}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <CustomDropdown
                                    className="w-[80%]"

                    label="Applicable On"
                    value={coupon.applicable}
                    onChange={(e) => handleChange("applicable", e.target.value)}
                  >
                    <option value="recharge">Recharge</option>
                    <option value="services">Services</option>
                  </CustomDropdown>
                  {errors.applicable && (
                    <p className="text-xs text-red-500">{errors.applicable}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <CustomDropdown                   className="w-[80%]"

                    label="Coupon Type"
                    value={coupon.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                  >
                    <option value="CASHBACK">Cashback</option>
                    <option value="DISCOUNT">Discount</option>
                  </CustomDropdown>
                  {errors.type && (
                    <p className="text-xs text-red-500">{errors.type}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <CustomInput                   className="w-[80%]"

                    label="Percentage"
                    type="number"
                    value={coupon.percentage}
                    onChange={(e) => handleChange("percentage", e.target.value)}
                  />{" "}
                  {errors.percentage && (
                    <p className="text-xs text-red-500">{errors.percentage}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <CustomInput                   className="w-[80%]"

                    label="Max Discount"
                    type="number"
                    value={coupon.maxDiscount}
                    onChange={(e) =>
                      handleChange("maxDiscount", e.target.value)
                    }
                  />{" "}
                  {errors.maxDiscount && (
                    <p className="text-xs text-red-500">{errors.maxDiscount}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <CustomInput                   className="w-[80%]"

                    label="Min Order Amount"
                    type="number"
                    value={coupon.minOrderAmount}
                    onChange={(e) =>
                      handleChange("minOrderAmount", e.target.value)
                    }
                  />{" "}
                  {errors.minOrderAmount && (
                    <p className="text-xs text-red-500">
                      {errors.minOrderAmount}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <CustomInput                   className="w-[80%]"

                    label="Redeem Limit"
                    type="number"
                    value={coupon.redeemLimit}
                    onChange={(e) =>
                      handleChange("redeemLimit", e.target.value)
                    }
                  />{" "}
                  {errors.redeemLimit && (
                    <p className="text-xs text-red-500">{errors.redeemLimit}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <CustomInput                   className="w-[80%]"

                    label="Coupon Count"
                    type="number"
                    value={coupon.couponCount}
                    onChange={(e) =>
                      handleChange("couponCount", e.target.value)
                    }
                  />{" "}
                  {errors.couponCount && (
                    <p className="text-xs text-red-500">{errors.couponCount}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <CustomInput                   className="w-[80%]"

                    label="Start Date"
                    type="date"
                    value={coupon.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                  />{" "}
                  {errors.startDate && (
                    <p className="text-xs text-red-500">{errors.startDate}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <CustomInput                   className="w-[80%]"

                    label="End Date"
                    type="date"
                    value={coupon.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                  />
                  {errors.endDate && (
                    <p className="text-xs text-red-500">{errors.endDate}</p>
                  )}
                </div>

                <div className="rounded-2xl w-[80%] border border-violet-100 bg-violet-50 p-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">Coupon Status</h4>

                      <p className="text-sm text-gray-500">
                        Enable or disable this coupon.
                      </p>
                    </div>

                    <CustomToggle
                      checked={coupon.status === "ACTIVE"}
                      onChange={(val) =>
                        handleChange("status", val ? "ACTIVE" : "INACTIVE")
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">
                    Visibility
                  </label>

                  <CustomToggle
                    checked={coupon.visibility === "VISIBLE"}
                    onChange={(val) =>
                      handleChange("visibility", val ? "VISIBLE" : "HIDDEN")
                    }
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 bg-gray-50 px-8 py-5 flex justify-center gap-3">
              <CustomButton
                variant="gray"
                className="rounded-full px-6 py-2"
                onClick={() => {
                  setErrors({});
                  setCoupon(INITIAL_COUPON);
                  setEditingCouponId(null);
                  setCoupOpen(false);
                }}
              >
                Cancel
              </CustomButton>

              <CustomButton
                variant="green"
                className="rounded-full px-6 py-2 shadow-lg shadow-violet-300/40"
                onClick={handleSubmit}
              >
                {editingCouponId ? "Update Coupon" : "Create Coupon"}
              </CustomButton>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        open={!!confirmState}
        onCancel={() => setConfirmState(null)}
        onConfirm={handleConfirm}
      />

      <div className="bg-white shadow-md rounded-xl p-6">
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-semibold">Manage Coupons</h3>

          <CustomButton
            variant="green"
            onClick={() => {
              if (!canCreate) return;
              setCoupOpen(true);
            }}
            className={
              !canCreate ? "opacity-50  cursor-not-allowed" : "px-2 py-1"
            }
          >
            Add New Coupon
          </CustomButton>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <div className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold">
            Total Coupons : {coupons.length}
          </div>

          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold">
            Active : {coupons.filter((c) => c.status).length}
          </div>

          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold">
            Hidden : {coupons.filter((c) => c.visibility === "HIDDEN").length}
          </div>
        </div>

        <input
          type="text"
          placeholder="Search coupons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border rounded-full p-2 mb-4"
        />

        <div className="overflow-x-auto">
          <div className="bg-white rounded-xl shadow border">
            <DataTable columns={columns} data={filteredCoupons} />
          </div>
        </div>
      </div>
    </div>
  );
}
