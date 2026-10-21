"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  GET_ALL_SCHEDULED_LIVES,
  ADMIN_UPDATE_SCHEDULED_LIVE,
  ADMIN_DELETE_SCHEDULED_LIVE,
} from "@/app/graphQL/liveStream";

/* ============================================
   CONSTANTS
============================================ */

const DEFAULT_PAGE_SIZE = 10;

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

/* ============================================
   DATE HELPERS
============================================ */

/**
 * Format a date in Indian Standard Time.
 */
function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Convert an API date into the value expected by
 * an HTML datetime-local input.
 *
 * The input displays the browser's local time.
 */
function toDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (number) => String(number).padStart(2, "0");

  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
  ].join("");
}

/**
 * Convert a datetime-local value into an ISO string.
 */
function toISOString(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

/* ============================================
   REUSABLE MESSAGE
============================================ */

function AlertMessage({ type = "error", children }) {
  if (!children) return null;

  const className =
    type === "success"
      ? "border-green-200 bg-green-50 text-green-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`mb-4 rounded-lg border px-4 py-3 text-sm ${className}`}
    >
      {children}
    </div>
  );
}

/* ============================================
   PAGINATION BUTTON
============================================ */

function PaginationButton({
  children,
  onClick,
  disabled = false,
  active = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={active ? "page" : undefined}
      className={[
        "min-w-9 rounded-lg border px-3 py-2 text-sm font-medium",
        "transition disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/* ============================================
   MAIN COMPONENT
============================================ */

export default function ScheduledLivesAdminPage() {
  /* ============================================
     PAGINATION STATE
  ============================================ */

  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  /* ============================================
     SEARCH STATE
  ============================================ */

  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  /* ============================================
     EDIT STATE
  ============================================ */

  const [selectedLive, setSelectedLive] = useState(null);

  const [editTitle, setEditTitle] = useState("");

  const [editScheduledAt, setEditScheduledAt] = useState("");

  const [editScheduledEndAt, setEditScheduledEndAt] = useState("");

  /* ============================================
     UI STATE
  ============================================ */

  const [successMessage, setSuccessMessage] = useState("");

  const [actionError, setActionError] = useState("");

  const [deletingLiveId, setDeletingLiveId] = useState(null);

  /* ============================================
     DEBOUNCE SEARCH
  ============================================ */

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  /* ============================================
     RESET PAGE WHEN SEARCH CHANGES
  ============================================ */

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, pageSize]);

  /* ============================================
     GET SCHEDULED LIVES
  ============================================ */

  const {
    data,
    loading,
    error,
    refetch,
    networkStatus,
  } = useQuery(GET_ALL_SCHEDULED_LIVES, {
    variables: {
      page: currentPage,
      limit: pageSize,
      search: debouncedSearch || null,
    },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  /* ============================================
     EXTRACT PAGINATION RESPONSE
  ============================================ */

  const paginationData = data?.getAllScheduledLives;

  const scheduledLives = paginationData?.lives ?? [];

  const totalRecords = paginationData?.totalRecords ?? 0;

  const totalPages = paginationData?.totalPages ?? 0;

  /*
   * Use the requested page for pagination actions.
   * The server may clamp the page if records have
   * been deleted or search results have changed.
   */
  const serverCurrentPage =
    paginationData?.currentPage ?? currentPage;

  const isRefreshing = loading && !data;

  /* ============================================
     CORRECT PAGE IF IT NO LONGER EXISTS
  ============================================ */

  useEffect(() => {
    if (!paginationData) return;

    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
      return;
    }

    if (totalRecords === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [paginationData, currentPage, totalPages, totalRecords]);

  /* ============================================
     UPDATE MUTATION
  ============================================ */

  const [updateScheduledLive, { loading: updating }] = useMutation(
    ADMIN_UPDATE_SCHEDULED_LIVE,
    {
      onError: (mutationError) => {
        setActionError(
          mutationError.message || "Failed to update scheduled live."
        );
      },
    }
  );

  /* ============================================
     DELETE MUTATION
  ============================================ */

  const [deleteScheduledLive, { loading: deleting }] = useMutation(
    ADMIN_DELETE_SCHEDULED_LIVE,
    {
      onError: (mutationError) => {
        setActionError(
          mutationError.message || "Failed to delete scheduled live."
        );
      },
    }
  );

  /* ============================================
     PAGINATION HANDLERS
  ============================================ */

  const handlePageChange = useCallback(
    (page) => {
      const maxPage = Math.max(totalPages, 1);

      if (page < 1 || page > maxPage) {
        return;
      }

      setCurrentPage(page);
      setSuccessMessage("");
      setActionError("");
    },
    [totalPages]
  );

  const handlePageSizeChange = (event) => {
    const newPageSize = Number(event.target.value);

    if (!PAGE_SIZE_OPTIONS.includes(newPageSize)) {
      return;
    }

    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  /* ============================================
     PAGE NUMBER GENERATION
  ============================================ */

  const pageNumbers = useMemo(() => {
    if (totalPages <= 0) {
      return [];
    }

    const visiblePages = 5;

    let startPage = Math.max(
      1,
      currentPage - Math.floor(visiblePages / 2)
    );

    let endPage = Math.min(
      totalPages,
      startPage + visiblePages - 1
    );

    startPage = Math.max(1, endPage - visiblePages + 1);

    const pages = [];

    for (let page = startPage; page <= endPage; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [currentPage, totalPages]);

  /* ============================================
     EDIT HANDLER
  ============================================ */

  const handleEdit = (live) => {
    setSelectedLive(live);

    setEditTitle(live.title || "");

    setEditScheduledAt(toDateTimeLocal(live.scheduledAt));

    setEditScheduledEndAt(toDateTimeLocal(live.scheduledEndAt));

    setSuccessMessage("");

    setActionError("");
  };

  /* ============================================
     CLOSE EDIT MODAL
  ============================================ */

  const closeEditModal = () => {
    if (updating) return;

    setSelectedLive(null);

    setEditTitle("");

    setEditScheduledAt("");

    setEditScheduledEndAt("");
  };

  /* ============================================
     UPDATE HANDLER
  ============================================ */

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!selectedLive) return;

    setSuccessMessage("");

    setActionError("");

    const title = editTitle.trim();

    if (!title) {
      setActionError("Please enter the live session title.");
      return;
    }

    if (!editScheduledAt) {
      setActionError("Please select the scheduled start date and time.");
      return;
    }

    if (!editScheduledEndAt) {
      setActionError("Please select the scheduled end date and time.");
      return;
    }

    const scheduledAt = toISOString(editScheduledAt);

    const scheduledEndAt = toISOString(editScheduledEndAt);

    if (!scheduledAt || !scheduledEndAt) {
      setActionError("Please enter valid start and end dates.");
      return;
    }

    const startDate = new Date(scheduledAt);

    const endDate = new Date(scheduledEndAt);

    if (endDate <= startDate) {
      setActionError(
        "The scheduled end date and time must be after the start date and time."
      );
      return;
    }

    try {
      const result = await updateScheduledLive({
        variables: {
          id: selectedLive.id,
          title,
          scheduledAt,
          scheduledEndAt,
        },
      });

      const updatedLive = result.data?.adminUpdateScheduledLive;

      if (!updatedLive) {
        throw new Error("The scheduled live could not be updated.");
      }

      setSelectedLive(null);

      setEditTitle("");

      setEditScheduledAt("");

      setEditScheduledEndAt("");

      setSuccessMessage("Scheduled live updated successfully.");

      await refetch({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch || null,
      });
    } catch (mutationError) {
      setActionError(
        mutationError.message || "Failed to update scheduled live."
      );
    }
  };

  /* ============================================
     DELETE HANDLER
  ============================================ */

  const handleDelete = async (live) => {
    if (!live?.id) {
      setActionError("Invalid live session.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${live.title || "this live session"}"?`
    );

    if (!confirmed) return;

    setSuccessMessage("");

    setActionError("");

    setDeletingLiveId(live.id);

    try {
      const result = await deleteScheduledLive({
        variables: {
          id: live.id,
        },
      });

      if (result.data?.adminDeleteScheduledLive !== true) {
        throw new Error("The scheduled live could not be deleted.");
      }

      setSuccessMessage("Scheduled live deleted successfully.");

      /*
       * If the last row on the current page is deleted,
       * move to the previous page where appropriate.
       *
       * Example:
       * Page 3 contains one record. After deleting it,
       * navigate to page 2 instead of showing an empty page.
       */
      if (scheduledLives.length === 1 && currentPage > 1) {
        setCurrentPage((previousPage) => previousPage - 1);
      } else {
        await refetch({
          page: currentPage,
          limit: pageSize,
          search: debouncedSearch || null,
        });
      }

      if (selectedLive?.id === live.id) {
        closeEditModal();
      }
    } catch (mutationError) {
      setActionError(
        mutationError.message || "Failed to delete scheduled live."
      );
    } finally {
      setDeletingLiveId(null);
    }
  };

  /* ============================================
     SUMMARY
  ============================================ */

  const firstRecord =
    totalRecords === 0
      ? 0
      : (serverCurrentPage - 1) * pageSize + 1;

  const lastRecord = Math.min(
    serverCurrentPage * pageSize,
    totalRecords
  );

  const pageViews = scheduledLives.reduce(
    (sum, live) => sum + (Number(live.totalViews) || 0),
    0
  );

  /* ============================================
     RENDER
  ============================================ */

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* ========================================
            PAGE HEADER
        ======================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Scheduled Live Streams
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage scheduled astrologer live sessions.
            </p>
          </div>

          <Link
            href="/admin/live-streams"
            className="inline-flex w-fit items-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            View Running Lives
          </Link>
        </div>

        {/* ========================================
            ALERT MESSAGES
        ======================================== */}

        <AlertMessage type="success">
          {successMessage}
        </AlertMessage>

        <AlertMessage type="error">
          {actionError || error?.message}
        </AlertMessage>

        {/* ========================================
            SUMMARY CARDS
        ======================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* TOTAL RECORDS */}

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Scheduled Lives
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {totalRecords}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Records matching the current search
            </p>
          </div>

          {/* CURRENT PAGE */}

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Current Page
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {totalPages > 0 ? serverCurrentPage : 0}
              <span className="text-lg font-medium text-gray-400">
                {" "}
                / {totalPages}
              </span>
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {pageSize} records per page
            </p>
          </div>

          {/* CURRENT PAGE VIEWS */}

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Views on This Page
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {pageViews.toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Sum of views for the displayed records
            </p>
          </div>
        </div>

        {/* ========================================
            SEARCH AND PAGE SIZE
        ======================================== */}

        <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

            {/* SEARCH */}

            <div className="w-full md:max-w-xl">
              <label
                htmlFor="scheduled-live-search"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Search scheduled lives
              </label>

              <div className="relative">
                <input
                  id="scheduled-live-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search title, channel, astrologer..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setCurrentPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 hover:text-gray-900"
                    aria-label="Clear search"
                  >
                    Clear
                  </button>
                )}
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Search is performed on the server.
              </p>
            </div>

            {/* PAGE SIZE */}

            <div className="w-full md:w-48">
              <label
                htmlFor="scheduled-live-page-size"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Records per page
              </label>

              <select
                id="scheduled-live-page-size"
                value={pageSize}
                onChange={handlePageSizeChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} records
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ========================================
            TABLE
        ======================================== */}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          {/* TABLE HEADER */}

          <div className="flex flex-col gap-2 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Scheduled Sessions
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {totalRecords === 0
                  ? "No matching records"
                  : `Showing ${firstRecord}–${lastRecord} of ${totalRecords} records`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSuccessMessage("");
                setActionError("");

                refetch({
                  page: currentPage,
                  limit: pageSize,
                  search: debouncedSearch || null,
                });
              }}
              disabled={loading}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* LOADING */}

          {loading && !data && (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

              <p className="mt-4 text-sm text-gray-500">
                Loading scheduled live streams...
              </p>
            </div>
          )}

          {/* TABLE CONTENT */}

          {(!loading || data) && (
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full border-collapse text-left text-sm">

                {/* TABLE HEAD */}

                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="whitespace-nowrap px-5 py-4">
                      S.No.
                    </th>

                    <th className="whitespace-nowrap px-5 py-4">
                      Astrologer
                    </th>

                    <th className="whitespace-nowrap px-5 py-4">
                      Live Details
                    </th>

                    <th className="whitespace-nowrap px-5 py-4">
                      Scheduled Start
                    </th>

                    <th className="whitespace-nowrap px-5 py-4">
                      Scheduled End
                    </th>

                    <th className="whitespace-nowrap px-5 py-4">
                      Status
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-right">
                      Views
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                {/* TABLE BODY */}

                <tbody className="divide-y divide-gray-100">

                  {/* EMPTY STATE */}

                  {scheduledLives.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-16 text-center"
                      >
                        <div className="mx-auto max-w-md">
                          <h3 className="text-base font-semibold text-gray-800">
                            No scheduled lives found
                          </h3>

                          <p className="mt-2 text-sm text-gray-500">
                            {debouncedSearch
                              ? "Try another search term."
                              : "There are currently no scheduled live sessions to display."}
                          </p>

                          {debouncedSearch && (
                            <button
                              type="button"
                              onClick={() => setSearch("")}
                              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                              Clear Search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* LIVE ROWS */}

                  {scheduledLives.map((live, index) => {
                    const astrologerName =
                      live.astrologer?.displayName ||
                      live.astrologer?.name ||
                      "Unknown Astrologer";

                    const serialNumber =
                      (serverCurrentPage - 1) * pageSize + index + 1;

                    const isDeleting = deletingLiveId === live.id;

                    return (
                      <tr
                        key={live.id}
                        className="transition hover:bg-gray-50"
                      >
                        {/* SERIAL NUMBER */}

                        <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                          {serialNumber}
                        </td>

                        {/* ASTROLOGER */}

                        <td className="px-5 py-4">
                          <div className="flex min-w-[190px] items-center gap-3">
                            {live.astrologer?.profilePic ? (
                              <img
                                src={live.astrologer.profilePic}
                                alt={astrologerName}
                                className="h-11 w-11 shrink-0 rounded-full border border-gray-200 object-cover"
                              />
                            ) : (
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                                {astrologerName
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-gray-900">
                                {astrologerName}
                              </p>

                              {live.astrologer?.id && (
                                <Link
                                  href={`/admin/astrologers/${live.astrologer.id}`}
                                  className="mt-1 block truncate text-xs text-blue-600 hover:underline"
                                >
                                  View Astrologer
                                </Link>
                              )}

                              <p className="mt-1 max-w-[180px] break-all text-xs text-gray-400">
                                ID: {live.astrologerId || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* LIVE DETAILS */}

                        <td className="px-5 py-4">
                          <div className="max-w-[250px]">
                            <p className="break-words font-semibold text-gray-900">
                              {live.title || "Untitled Live"}
                            </p>

                            <p className="mt-1 break-all text-xs text-gray-500">
                              Channel: {live.channelName || "—"}
                            </p>

                            <p className="mt-1 break-all text-xs text-gray-400">
                              ID: {live.id}
                            </p>
                          </div>
                        </td>

                        {/* START DATE */}

                        <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                          {formatDateTime(live.scheduledAt)}
                        </td>

                        {/* END DATE */}

                        <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                          {formatDateTime(live.scheduledEndAt)}
                        </td>

                        {/* STATUS */}

                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            {live.status || "SCHEDULED"}
                          </span>
                        </td>

                        {/* TOTAL VIEWS */}

                        <td className="whitespace-nowrap px-5 py-4 text-right font-medium text-gray-800">
                          {(Number(live.totalViews) || 0).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">

                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={() => handleEdit(live)}
                              disabled={isDeleting || updating}
                              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Edit
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              onClick={() => handleDelete(live)}
                              disabled={isDeleting || deleting || updating}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================
              PAGINATION FOOTER
          ======================================== */}

          <div className="flex flex-col gap-4 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            {/* RECORD SUMMARY */}

            <p className="text-sm text-gray-500">
              {totalRecords > 0 ? (
                <>
                  Showing{" "}
                  <span className="font-semibold text-gray-800">
                    {firstRecord}–{lastRecord}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-800">
                    {totalRecords}
                  </span>{" "}
                  scheduled lives
                </>
              ) : (
                "No records to display"
              )}
            </p>

            {/* PAGINATION CONTROLS */}

            <div className="flex flex-wrap items-center gap-2">

              {/* FIRST PAGE */}

              <PaginationButton
                onClick={() => handlePageChange(1)}
                disabled={currentPage <= 1 || loading || totalPages === 0}
              >
                First
              </PaginationButton>

              {/* PREVIOUS */}

              <PaginationButton
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || loading || totalPages === 0}
              >
                Previous
              </PaginationButton>

              {/* PAGE NUMBERS */}

              {pageNumbers.map((page) => (
                <PaginationButton
                  key={page}
                  onClick={() => handlePageChange(page)}
                  active={page === currentPage}
                  disabled={loading}
                >
                  {page}
                </PaginationButton>
              ))}

              {/* NEXT */}

              <PaginationButton
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={
                  currentPage >= totalPages ||
                  loading ||
                  totalPages === 0
                }
              >
                Next
              </PaginationButton>

              {/* LAST PAGE */}

              <PaginationButton
                onClick={() => handlePageChange(totalPages)}
                disabled={
                  currentPage >= totalPages ||
                  loading ||
                  totalPages === 0
                }
              >
                Last
              </PaginationButton>
            </div>
          </div>
        </div>

        {/* ========================================
            EDIT MODAL
        ======================================== */}

        {selectedLive && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget &&
                !updating
              ) {
                closeEditModal();
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-live-title"
              className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-2xl"
            >

              {/* MODAL HEADER */}

              <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
                <div>
                  <h2
                    id="edit-live-title"
                    className="text-xl font-bold text-gray-900"
                  >
                    Edit Scheduled Live
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Update the title and scheduled start/end times.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={updating}
                  aria-label="Close edit dialog"
                  className="rounded-lg px-2 py-1 text-2xl leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                >
                  ×
                </button>
              </div>

              {/* MODAL FORM */}

              <form onSubmit={handleUpdate}>

                <div className="space-y-5 px-6 py-6">

                  {/* TITLE */}

                  <div>
                    <label
                      htmlFor="edit-live-title-input"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Live Title <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="edit-live-title-input"
                      type="text"
                      value={editTitle}
                      onChange={(event) =>
                        setEditTitle(event.target.value)
                      }
                      placeholder="Enter live session title"
                      maxLength={200}
                      required
                      disabled={updating}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                    />
                  </div>

                  {/* CHANNEL NAME */}

                  <div>
                    <label
                      htmlFor="edit-live-channel"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Channel Name
                    </label>

                    <input
                      id="edit-live-channel"
                      type="text"
                      value={selectedLive.channelName || ""}
                      readOnly
                      className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500"
                    />

                    <p className="mt-1 text-xs text-gray-400">
                      The channel name cannot be changed here.
                    </p>
                  </div>

                  {/* START DATE */}

                  <div>
                    <label
                      htmlFor="edit-live-start"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Scheduled Start{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="edit-live-start"
                      type="datetime-local"
                      value={editScheduledAt}
                      onChange={(event) =>
                        setEditScheduledAt(event.target.value)
                      }
                      required
                      disabled={updating}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                    />
                  </div>

                  {/* END DATE */}

                  <div>
                    <label
                      htmlFor="edit-live-end"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Scheduled End{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="edit-live-end"
                      type="datetime-local"
                      value={editScheduledEndAt}
                      onChange={(event) =>
                        setEditScheduledEndAt(event.target.value)
                      }
                      required
                      disabled={updating}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                    />
                  </div>

                  {/* ASTROLOGER INFO */}

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Astrologer
                    </p>

                    <p className="mt-1 font-semibold text-gray-800">
                      {selectedLive.astrologer?.displayName ||
                        selectedLive.astrologer?.name ||
                        "Unknown Astrologer"}
                    </p>
                  </div>
                </div>

                {/* MODAL FOOTER */}

                <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={closeEditModal}
                    disabled={updating}
                    className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={updating}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updating ? "Saving Changes..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================
            BACKGROUND REFRESH INDICATOR
        ======================================== */}

        {loading && data && (
          <p className="mt-3 text-right text-xs text-gray-400">
            Updating results...
          </p>
        )}
      </div>
    </div>
  );
}