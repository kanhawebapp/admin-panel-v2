"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import DataTable from "@/components/utils/DataTable";
import Link from "next/link";
import CustomToggle from "@/components/Custom/CustomToggle";
import {
  GET_USER_REVIEWS,
  TOGGLE_REVIEW_FLAG,
  UPDATE_REVIEW_COMMENT,
} from "@/app/graphQL/astroHiring";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import SessionMessagesModal from "../user/SessionModal";
import { usePermissions } from "@/context/PermissionContext";

export default function ReviewsPage() {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [searchName, setSearchName] = useState("");
  const [editedRating, setEditedRating] = useState(5);
  const [searchMobile, setSearchMobile] = useState("");

  const [searchAstrologerName, setSearchAstrologerName] = useState("");

  const [searchRating, setSearchRating] = useState("");

  const [searchSessionType, setSearchSessionType] = useState("");

  const [searchFilterType, setSearchFilterType] = useState("");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  // PAGINATION
  const [page, setPage] = useState(1);

  const limit = 10;

  // FILTERS
  const [filters, setFilters] = useState({
    query: "",
    mobile: "",
    astrologerName: "",
    rating: "",
    sessionType: "",

    filterType: "",
    startDate: "",
    endDate: "",
  });

  const { can, isSuperAdmin } = usePermissions();

  const canRead = isSuperAdmin || can("review", "read");
  const canUpdate = isSuperAdmin || can("review", "update");
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);

      setFilters({
        query: searchName,
        mobile: searchMobile,
        astrologerName: searchAstrologerName,
        rating: searchRating,
        sessionType: searchSessionType,

        filterType: searchFilterType,
        startDate,
        endDate,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [
    searchName,
    searchMobile,
    searchAstrologerName,
    searchRating,
    searchSessionType,

    searchFilterType,
    startDate,
    endDate,
  ]);

  const [updateReviewComment, { loading: updatingComment }] = useMutation(
    UPDATE_REVIEW_COMMENT,
  );

  const [toggleReviewFlag] = useMutation(TOGGLE_REVIEW_FLAG);
  const router = useRouter();
  // SEARCH INPUT
  const searchInput = {
    page,
    limit,
  };

  if (filters.query) {
    searchInput.query = filters.query;
  }

  if (filters.mobile) {
    searchInput.mobile = filters.mobile;
  }

  if (filters.astrologerName) {
    searchInput.astrologerName = filters.astrologerName;
  }

  if (filters.rating) {
    searchInput.rating = Number(filters.rating);
  }

  if (filters.sessionType) {
    searchInput.sessionType = filters.sessionType;
  }

  if (filters.filterType) {
    searchInput.filterType = filters.filterType;
  }

  if (filters.filterType === "CUSTOM" && filters.startDate && filters.endDate) {
    searchInput.startDate = filters.startDate;

    searchInput.endDate = filters.endDate;
  }

  const { data, loading, error, refetch } = useQuery(GET_USER_REVIEWS, {
    variables: {
      searchInput,
    },
    fetchPolicy: "network-only",
    skip: !canRead,
  });
  const reviews = data?.getUserReviews?.data || [];

  const totalCount = data?.getUserReviews?.totalCount || 0;

  const totalPages = data?.getUserReviews?.totalPages || 1;

  const averageRating = data?.getUserReviews?.averageRating || 0;

  // TABLE COLUMNS
  const columns = useMemo(
    () => [
      {
        header: "SessionID",
        render: (row) => (
          <div>
            <div className="  hover:underline">
              {row.sessionId?.slice(0, 8)}
            </div>
          </div>
        ),
      },
      {
        header: "User",
        render: (row) => (
          <div>
            <Link
              href={`/Admindash/user/userprofile/${row?.userId}`}
              className="font-semibold text-blue-600 hover:underline"
            >
              {row.userName}
            </Link>

            <p className="text-[10px] flex text-gray-500">
              UserID: <b>{row.userId?.slice(0, 8)}</b>
            </p>
          </div>
        ),
      },

      {
        header: "Astrologer",
        render: (row) => (
          <Link
            href={`/Admindash/astrologer/astroprofile/${row.astrologerId}`}
            className="font-semibold text-purple-600 hover:underline"
          >
            {row.displayName}
          </Link>
        ),
      },

      {
        header: "Session Type",
        render: (row) => (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              row.sessionType === "CALL"
                ? "bg-blue-100 text-blue-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {row.sessionType}
          </span>
        ),
      },

      {
        header: "Rating",
        render: (row) => (
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">⭐</span>

            <span className="font-semibold">{row.rating}</span>
          </div>
        ),
      },

      {
        header: "Comment",
        width: "300px",
        render: (row) => (
          <div className="group relative">
            <p
              title={row.comment}
              className="truncate text-sm text-gray-700 cursor-pointer"
            >
              {row.comment}
            </p>

            <div className="absolute left-0 top-full mt-2 hidden group-hover:block z-[9999]">
              <div className="max-w-80 rounded-lg bg-black p-3 text-sm text-white shadow-xl break-words whitespace-normal">
                {row.comment}
              </div>
            </div>
          </div>
        ),
      },

      {
        header: "Flag",
        render: (row) => (
          <CustomToggle
            checked={row.isFlagged}
            disabled={!canUpdate}
            onChange={async (val) => {
              if (!canUpdate) {
                toast.error("No permission");
                return;
              }

              try {
                await toggleReviewFlag({
                  variables: {
                    reviewId: row.reviewId,
                    isFlagged: val,
                  },
                });

                await refetch();
                toast.success("Review updated");
              } catch (err) {
                toast.error("Update failed");
              }
            }}
          />
        ),
      },
      {
        header: "Action",
        render: (row) =>
          row.sessionId ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setSelectedSession(row.sessionId);
                  setOpenModal(true);
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded-full hover:scale-104 cursor-pointer text-[10px]"
              >
                View
              </button>
              <button
                disabled={!canUpdate}
                onClick={() => {
                  if (!canUpdate) {
                    toast.error("No permission");
                    return;
                  }

                  setSelectedReviewId(row.reviewId);
                  setEditedComment(row.comment || "");
                  setEditedRating(row.rating);
                  setEditModalOpen(true);
                }}
                className={`px-3 py-1 bg-black/50 text-white rounded-full text-[10px] ${
                  !canUpdate
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-104 cursor-pointer"
                }`}
              >
                Edit
              </button>
            </div>
          ) : (
            <span className="text-gray-400">N/A</span>
          ),
      },

      {
        header: "Created At",
        render: (row) => (
          <div className="text-xs">
            <p>
              {new Date(row.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "Asia/Kolkata",
              })}
            </p>

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
    ],
    [toggleReviewFlag],
  );

  if (error) {
    return <p className="p-10 text-red-500">Error loading reviews</p>;
  }
if (!canRead) {
  return (
    <p className="p-10 text-red-500">
      No Access to Reviews. Contact to Admin.
    </p>
  );
}
  return (
    <div className="p-10 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-2xl font-bold">User Reviews</h1>

        <div className="flex flex-wrap gap-3">
          <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg text-sm font-semibold">
            Average Rating : {Number(averageRating).toFixed(1)}
          </div>

          <div className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold">
            Total Reviews : {totalCount}
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="grid grid-cols-1 md:grid-cols-8 gap-4 bg-white p-5 rounded-xl shadow border">
        {/* USER NAME */}
        <input
          type="text"
          placeholder="Search user"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="border rounded-lg px-4 py-2 outline-none"
        />

        {/* MOBILE */}
        <input
          type="text"
          placeholder="Search mobile"
          value={searchMobile}
          onChange={(e) => setSearchMobile(e.target.value)}
          className="border rounded-lg px-4 py-2 outline-none"
        />

        {/* ASTROLOGER */}
        <input
          type="text"
          placeholder="Search astrologer"
          value={searchAstrologerName}
          onChange={(e) => setSearchAstrologerName(e.target.value)}
          className="border rounded-lg px-4 py-2 outline-none"
        />

        {/* RATING */}
        <select
          value={searchRating}
          onChange={(e) => setSearchRating(e.target.value)}
          className="border rounded-lg px-4 py-2 outline-none"
        >
          <option value="">All Ratings</option>

          <option value="5">5 Star</option>

          <option value="4">4 Star</option>

          <option value="3">3 Star</option>

          <option value="2">2 Star</option>

          <option value="1">1 Star</option>
        </select>

        {/* SESSION TYPE */}
        <select
          value={searchSessionType}
          onChange={(e) => setSearchSessionType(e.target.value)}
          className="border rounded-lg px-4 py-2 outline-none"
        >
          <option value="">All Sessions</option>

          <option value="CHAT">CHAT</option>

          <option value="CALL">CALL</option>
        </select>

        {/* DATE FILTER */}
        <select
          value={searchFilterType}
          onChange={(e) => setSearchFilterType(e.target.value)}
          className="border rounded-lg px-4 py-2 outline-none"
        >
          <option value="">All Time</option>

          <option value="TODAY">Today</option>

          <option value="WEEK">Last Week</option>

          <option value="MONTH">Last Month</option>

          <option value="YEAR">Last Year</option>

          <option value="CUSTOM">Custom Date</option>
        </select>

        {/* START DATE */}
        {searchFilterType === "CUSTOM" && (
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-lg px-4 py-2 outline-none"
          />
        )}

        {/* END DATE */}
        {searchFilterType === "CUSTOM" && (
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-lg px-4 py-2 outline-none"
          />
        )}
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <div className="w-full bg-white shadow-md rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center">Loading Reviews...</div>
          ) : (
            <DataTable columns={columns} data={reviews} />
          )}
        </div>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className={`px-4 py-2 rounded-lg ${
            page === 1
              ? "bg-gray-200 cursor-not-allowed"
              : "bg-black text-white"
          }`}
        >
          Previous
        </button>

        <div className="font-medium">
          Page {page} of {totalPages || 1}
        </div>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className={`px-4 py-2 rounded-lg ${
            page >= totalPages
              ? "bg-gray-200 cursor-not-allowed"
              : "bg-black text-white"
          }`}
        >
          Next
        </button>
      </div>
      <SessionMessagesModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedSession(null);
        }}
        sessionId={selectedSession}
      />
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">Edit Review Comment</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Rating</label>

              <select
                value={editedRating}
                onChange={(e) => setEditedRating(Number(e.target.value))}
                className="w-full border rounded-lg p-3"
              >
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    {r} Star
                  </option>
                ))}
              </select>
            </div>
            <textarea
              rows={6}
              value={editedComment}
              onChange={(e) => setEditedComment(e.target.value)}
              className="w-full border rounded-lg p-3 outline-none"
              placeholder="Enter review comment..."
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedReviewId(null);
                  setEditedComment("");
                }}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                disabled={updatingComment}
               onClick={async () => {
  if (!canUpdate) {
    toast.error("No permission");
    return;
  }

  try {
    await updateReviewComment({
      variables: {
        reviewId: selectedReviewId,
        comment: editedComment,
        rating: editedRating,
      },
    });

    toast.success("Review updated");
    await refetch();

    setEditModalOpen(false);
    setSelectedReviewId(null);
    setEditedComment("");
  } catch (err) {
    toast.error("Failed to update review");
  }
}}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg"
              >
                {updatingComment ? "Updating..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
