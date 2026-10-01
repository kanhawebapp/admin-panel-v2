"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_ADMIN_SERVICE_BOOKING_REPORT } from "@/app/graphQL/astroHiring";

const PAGE_LIMIT = 20;

const STATUS_OPTIONS = [
  {
    label: "All",
    value: null,
  },
  {
    label: "Pending",
    value: "PENDING",
  },
  {
    label: "Assigned",
    value: "ASSIGNED",
  },

];

const getStatusStyle = (status) => {
  switch (status) {
    case "ASSIGNED":
      return "bg-blue-100 text-blue-700";

    case "PENDING":
      return "bg-yellow-100 text-yellow-700";

    case "COMPLETED":
      return "bg-green-100 text-green-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

const formatStatus = (status) => {
  if (!status) return "-";

  return status
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
};

const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function ServiceBookingReport() {
  const [currentPage, setCurrentPage] = useState(1);
const [selectedStatus, setSelectedStatus] = useState(null);

  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery(
    GET_ADMIN_SERVICE_BOOKING_REPORT,
    {
      variables: {
        page: currentPage,
        limit: PAGE_LIMIT,
        bookingStatus: selectedStatus,
      },
      fetchPolicy: "network-only",
    }
  );

  const report =
    data?.getAdminServiceBookingReport;

  const bookings = report?.data || [];

  const total = report?.total || 0;

  const totalPages = report?.totalPages || 1;

  // ==========================================
  // STATUS FILTER
  // ==========================================

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = () => {
    refetch({
      page: currentPage,
      limit: PAGE_LIMIT,
      bookingStatus: selectedStatus,
    });
  };

  // ==========================================
  // PREVIOUS PAGE
  // ==========================================

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // ==========================================
  // NEXT PAGE
  // ==========================================

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <section className="w-full rounded-2xl bg-white p-4 shadow-sm sm:p-6">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Service Bookings
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor service bookings
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ==========================================
          STATUS FILTERS
      ========================================== */}

      <div className="mb-6 flex flex-wrap gap-2">

        {STATUS_OPTIONS.map((option) => {
          const isActive =
            selectedStatus === option.value;

          return (
            <button
              key={option.label}
              type="button"
              onClick={() =>
                handleStatusChange(option.value)
              }
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "border-purple-600 bg-purple-600 text-white"
                  : "border-gray-300 bg-white text-gray-600 hover:border-purple-400 hover:text-purple-600"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* ==========================================
          SUMMARY
      ========================================== */}

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

        <p className="text-sm text-gray-500">
          Total bookings:{" "}
          <span className="font-semibold text-gray-800">
            {total}
          </span>
        </p>

        <p className="text-sm text-gray-500">
          Filter:{" "}
          <span className="font-semibold text-gray-800">
            {selectedStatus
              ? formatStatus(selectedStatus)
              : "All Statuses"}
          </span>
        </p>
      </div>

      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">

          <p>
            Unable to load service bookings.
          </p>

          <p className="mt-1 text-xs text-red-500">
            {error.message}
          </p>

          <button
            type="button"
            onClick={handleRefresh}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>

        </div>
      )}

      {/* ==========================================
          LOADING
      ========================================== */}

      {loading && (
        <div className="overflow-hidden rounded-xl border border-gray-200">

          <div className="animate-pulse">

            {[1, 2, 3, 4, 5].map(
              (item) => (
                <div
                  key={item}
                  className="grid grid-cols-7 gap-4 border-b border-gray-100 p-4"
                >

                  {Array.from({
                    length: 7,
                  }).map((_, index) => (
                    <div
                      key={index}
                      className="h-5 rounded bg-gray-200"
                    />
                  ))}

                </div>
              )
            )}

          </div>
        </div>
      )}

      {/* ==========================================
          DESKTOP TABLE
      ========================================== */}

      {!loading &&
        !error &&
        bookings.length > 0 && (
          <div className="hidden overflow-x-auto rounded-xl border border-gray-200 md:block">

            <table className="w-full min-w-[1000px] text-left">

              <thead className="bg-gray-50">

                <tr>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">
                    #
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">
                    User
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">
                    Mobile
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">
                    Service
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">
                    Status
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">
                    Booking Date
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">
                    Assigned To
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {bookings.map(
                  (booking, index) => (
                    <tr
                      key={booking.id}
                      className="transition hover:bg-gray-50"
                    >

                      {/* NUMBER */}

                      <td className="px-4 py-4 text-sm text-gray-500">
                        {(currentPage - 1) *
                          PAGE_LIMIT +
                          index +
                          1}
                      </td>

                      {/* USER */}

                      <td className="px-4 py-4">

                        <div className="font-medium text-gray-800">
                          {booking.userName ||
                            "-"}
                        </div>

                      </td>

                      {/* MOBILE */}

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {booking.userMobile ||
                          "-"}
                      </td>

                      {/* SERVICE */}

                      <td className="px-4 py-4">

                        <div className="font-medium text-gray-800">
                          {booking.serviceName ||
                            "-"}
                        </div>

                      </td>

                      {/* STATUS */}

                      <td className="px-4 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            booking.bookingStatus
                          )}`}
                        >
                          {formatStatus(
                            booking.bookingStatus
                          )}
                        </span>

                      </td>

                      {/* BOOKING DATE */}

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {formatDate(
                          booking.bookingDate
                        )}
                      </td>

                      {/* ASSIGNED TO */}

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {booking.assignedTo ||
                          "-"}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      {/* ==========================================
          MOBILE CARDS
      ========================================== */}

      {!loading &&
        !error &&
        bookings.length > 0 && (
          <div className="space-y-3 md:hidden">

            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-xl border border-gray-200 p-4"
              >

                {/* SERVICE + STATUS */}

                <div className="mb-3 flex items-start justify-between gap-3">

                  <div>

                    <h3 className="font-semibold text-gray-800">
                      {booking.serviceName ||
                        "-"}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {booking.userName ||
                        "-"}
                    </p>

                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                      booking.bookingStatus
                    )}`}
                  >
                    {formatStatus(
                      booking.bookingStatus
                    )}
                  </span>

                </div>

                {/* DETAILS */}

                <div className="grid grid-cols-2 gap-3 text-sm">

                  {/* MOBILE */}

                  <div>

                    <p className="text-xs text-gray-400">
                      Mobile
                    </p>

                    <p className="mt-1 text-gray-700">
                      {booking.userMobile ||
                        "-"}
                    </p>

                  </div>

                  {/* ASSIGNED */}

                  <div>

                    <p className="text-xs text-gray-400">
                      Assigned To
                    </p>

                    <p className="mt-1 text-gray-700">
                      {booking.assignedTo ||
                        "-"}
                    </p>

                  </div>

                  {/* DATE */}

                  <div className="col-span-2">

                    <p className="text-xs text-gray-400">
                      Booking Date
                    </p>

                    <p className="mt-1 text-gray-700">
                      {formatDate(
                        booking.bookingDate
                      )}
                    </p>

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      {/* ==========================================
          EMPTY
      ========================================== */}

      {!loading &&
        !error &&
        bookings.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center">

            <p className="text-sm font-medium text-gray-600">
              No service bookings found
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Try changing the booking status
              filter.
            </p>

          </div>
        )}

      {/* ==========================================
          PAGINATION
      ========================================== */}

      {!loading &&
        !error &&
        totalPages > 0 && (
          <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm text-gray-500">

              Page{" "}

              <span className="font-semibold text-gray-800">
                {currentPage}
              </span>

              {" "}of{" "}

              <span className="font-semibold text-gray-800">
                {totalPages}
              </span>

            </p>

            <div className="flex gap-2">

              {/* PREVIOUS */}

              <button
                type="button"
                onClick={handlePrevious}
                disabled={
                  currentPage === 1 ||
                  loading
                }
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {/* NEXT */}

              <button
                type="button"
                onClick={handleNext}
                disabled={
                  currentPage >=
                    totalPages ||
                  loading
                }
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>

            </div>

          </div>
        )}

    </section>
  );
}