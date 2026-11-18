"use client";

import {
  CREATE_NOTICE,
  DELETE_NOTICE,
  GET_ASTRO_LIST,
  GET_NOTICES,
  UPDATE_NOTICE,
} from "@/app/graphQL/astroHiring";
import CustomButton from "@/components/Custom/CustomButtom";
import CustomToggle from "@/components/Custom/CustomToggle";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";
import { toast } from "react-toastify";
import { usePermissions } from "@/context/PermissionContext";
export default function CreateNotice() {
  const [errors, setErrors] = useState({});
  const { can, isSuperAdmin } = usePermissions();

const canRead = isSuperAdmin || can("notice", "read");
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    targetType: "ALL",
    astrologers: [],
    isActive: true,
  });
 const { data: astroData } = useQuery(GET_ASTRO_LIST, {
  variables: {
    searchInput: {},
  },
  skip: !canRead,
});
  const validateForm = () => {
    const err = {};

    if (!formData.title.trim()) {
      err.title = "Notice title is required";
    } else if (formData.title.trim().length > 100) {
      err.title = "Maximum 100 characters allowed";
    }

    if (!formData.description.trim()) {
      err.description = "Description is required";
    } else if (formData.description.trim().length > 1000) {
      err.description = "Maximum 1000 characters allowed";
    }

    if (
      formData.targetType === "SELECTED" &&
      formData.astrologers.length === 0
    ) {
      err.astrologers = "Please select at least one astrologer";
    }

    setErrors(err);

    return Object.keys(err).length === 0;
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: "",
    }));
  };
  const astrologers = astroData?.getAstrologerListBySearch?.data || [];

  const [createNotice] = useMutation(CREATE_NOTICE);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    const isEditMode = !!formData.id;

    try {
      if (isEditMode) {
        await updateNotice({
          variables: {
            id: formData.id,

            input: {
              title: formData.title,
              description: formData.description,
              targetType: formData.targetType,

              astrologers:
                formData.targetType === "SELECTED" ? formData.astrologers : [],

              isActive: formData.isActive,
            },
          },

          refetchQueries: [GET_NOTICES],
        });

        toast.success("Notice Updated");
        setErrors({});
      } else {
        await createNotice({
          variables: {
            input: {
              title: formData.title,
              description: formData.description,

              targetType: formData.targetType,

              astrologers:
                formData.targetType === "SELECTED" ? formData.astrologers : [],

              isActive: formData.isActive,

              startDate: formData.startDate || null,

              endDate: formData.endDate || null,
            },
          },

          refetchQueries: [GET_NOTICES],
        });
        setErrors({});
        toast.success("Notice Created");
      }

      // reset form
      setFormData({
        id: null,
        title: "",
        description: "",
        targetType: "ALL",
        astrologers: [],
        isActive: true,
      });
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    }
  };
  const [deleteNotice] = useMutation(DELETE_NOTICE);

  const handleDelete = async (id) => {
    try {
      await deleteNotice({
        variables: { id },

        refetchQueries: [GET_NOTICES],
      });

      toast.success("Notice deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };
  const [updateNotice] = useMutation(UPDATE_NOTICE);

  const handleToggle = async (notice) => {
    try {
      await updateNotice({
        variables: {
          id: notice.id,

          input: {
            isActive: !notice.isActive,
          },
        },

        refetchQueries: [GET_NOTICES],
      });

      toast.success("Notice updated");
    } catch (err) {
      toast.error(err.message);
    }
  };

const { data: noticeData, loading: noticeLoading } = useQuery(GET_NOTICES, {
  skip: !canRead,
});
  const notices = noticeData?.getNotices || [];
if (!canRead) {
  return (
    <p className="p-10 text-red-500">
      No Access to Notice Board. Conatct to Admin.
    </p>
  );
}
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-5">Create Notice</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}

        <div>
          <label className="block mb-2">Notice Title</label>

          <input
            type="text"
            className="border border-gray-300  rounded-full w-full p-3"
            value={formData.title}
            maxLength={100}
            onChange={(e) => handleChange("title", e.target.value)}
          />
          {errors.title && (
            <p className="text-xs text-red-500 mt-1">{errors.title}</p>
          )}
        </div>

        {/* Description */}

        <div>
          <label className="block mb-2">Description</label>

          <textarea
            rows={6}
            className="border border-gray-300  rounded-2xl w-full p-3"
            value={formData.description}
            maxLength={1000}
            onChange={(e) => handleChange("description", e.target.value)}
          />
          <div className="flex justify-between mt-1">
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description}</p>
            )}

            <p className="text-xs text-gray-400 ml-auto">
              {formData.description.length}/1000
            </p>
          </div>
        </div>

        {/* Audience */}

        <div>
          <label className="block mb-2">Audience</label>

          <select
            className="border border-gray-300  rounded-2xl w-full p-3"
            value={formData.targetType}
            onChange={(e) => handleChange("targetType", e.target.value)}
          >
            <option value="ALL">All Astrologers</option>

            <option value="SELECTED">Selected Astrologers</option>
          </select>
          {errors.astrologers && (
            <p className="text-xs text-red-500 mt-2">{errors.astrologers}</p>
          )}
        </div>

        {/* Multi Select */}

        {formData.targetType === "SELECTED" && (
          <div>
            <label className="block mb-2 font-medium">Select Astrologers</label>

            <div className="border-gray-300  rounded-2xl   max-h-64 overflow-y-auto p-3 space-y-3">
              {astrologers.map((astro) => (
                <label
                  key={astro.id}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.astrologers.includes(astro.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          astrologers: [...formData.astrologers, astro.id],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          astrologers: formData.astrologers.filter(
                            (id) => id !== astro.id,
                          ),
                        });
                      }
                    }}
                  />

                  <span>{astro.displayName || astro.name}</span>
                </label>
              ))}
            </div>

            {formData.astrologers.length > 0 && (
              <p className="mt-2 text-sm text-gray-500">
                Selected: {formData.astrologers.length}
              </p>
            )}
          </div>
        )}

        {/* Pin */}

        {/* Active */}

        <div className="flex items-center justify-between border-gray-300  rounded-full  p-3">
          <span className="font-medium">Active Notice</span>

          <CustomToggle
            id="activeNotice"
            checked={formData.isActive}
            onChange={(val) => handleChange("isActive", val)}
          />
        </div>

        <CustomButton
          type="submit"
          className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg"
        >
          {formData.id ? "Update Notice" : "Create Notice"}
        </CustomButton>
      </form>


      <hr/>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Notices</h2>

        <div className="grid gap-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="border-gray-300  rounded-2xl  p-5 bg-white shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{notice.title}</h3>

                  <p className="text-gray-600 mt-2">{notice.description}</p>

                  <p className="text-[10px] text-gray-600">
                    {new Date(Number(notice.createdAt)).toLocaleString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                        timeZone: "Asia/Kolkata",
                      },
                    )}
                  </p>
                </div>

                <div className="flex gap-2">
                  <CustomButton
                  className="px-2 py-1 text-xs"
                    variant="black"
                    onClick={() => {
                      setFormData({
                        id: notice.id,

                        title: notice.title,

                        description: notice.description,

                        targetType: notice.targetType,

                        astrologers: notice.astrologers?.map((a) => a.id) || [],

                        isActive: notice.isActive,
                      });
                    }}
                  >
                    Edit
                  </CustomButton>

                  <CustomButton
                    variant="red"
                                      className="px-2 py-1 text-xs"

                    onClick={() => handleDelete(notice.id)}
                  >
                    Delete
                  </CustomButton>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Audience:
                    <span className="font-semibold ml-2">
                      {notice.targetType}
                    </span>
                  </p>

                  {notice.targetType === "SELECTED" && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {notice.astrologers?.map((item) => (
                        <span
                          key={item.id}
                          className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full"
                        >
                          {item.displayName || item.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <CustomToggle
                  id={`notice-${notice.id}`}
                  checked={notice.isActive}
                  onChange={() => handleToggle(notice)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
