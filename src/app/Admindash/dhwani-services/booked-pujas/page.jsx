
"use client";

import { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const PAGE_LIMIT = 20;

const GET_ADMIN_PUJA_BOOKING_REPORT = gql`
query GetAdminPujaBookingReport($page: Int!, $limit: Int!) {
  getAdminPujaBookingReport(page: $page, limit: $limit) {
    success
    total
    currentPage
    totalPages
    limit
    data {
      id
      userId
      userName
      userMobile
      pujaId
      pujaName
      mantraOptionName
      quantity
      unitPrice
      totalAmount
      paymentStatus
      bookingStatus
      bookingDate
    }
  }
}
`;

const formatStatus = (status) =>
  status
    ? status
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "-";

const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
};

const formatAmount = (amount) =>
  `₹${Number(amount ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getPaymentStatusStyle = (status) => {
  switch (status) {
    case "PAID":
    case "SUCCESS":
    case "COMPLETED":
      return "bg-green-100 text-green-700";

    case "PENDING":
      return "bg-yellow-100 text-yellow-700";

    case "FAILED":
    case "CANCELLED":
      return "bg-red-100 text-red-700";

    case "REFUNDED":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getBookingStatusStyle = (status) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-700";

    case "PENDING":
      return "bg-yellow-100 text-yellow-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

function StatusBadge({ status, type = "payment" }) {
  const style =
    type === "payment"
      ? getPaymentStatusStyle(status)
      : getBookingStatusStyle(status);

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${style}`}
    >
      {formatStatus(status)}
    </span>
  );
}

export default function PujaBookingReport() {
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const { data, loading, error, refetch } = useQuery(
    GET_ADMIN_PUJA_BOOKING_REPORT,
    {
      variables: {
        page: currentPage,
        limit: PAGE_LIMIT,
      },
      fetchPolicy: "network-only",
    },
  );

  const report = data?.getAdminPujaBookingReport;
  const bookings = report?.data ?? [];
  const total = report?.total ?? 0;
  const totalPages = Math.max(report?.totalPages ?? 1, 1);

  const handleRefresh = async () => {
    if (refreshing) return;

    try {
      setRefreshing(true);
      await refetch({
        page: currentPage,
        limit: PAGE_LIMIT,
      });
    } catch (err) {
      console.error("Failed to refresh puja bookings:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const isLoading = loading || refreshing;

  return (
    <section className="w-full rounded-2xl bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Puja Bookings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View puja bookings, payment status and booking details.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="mb-4 text-sm text-gray-500">
        Total bookings:{" "}
        <span className="font-semibold text-gray-800">{total}</span>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <p>Unable to load puja bookings.</p>
          <p className="mt-1 text-xs">{error.message}</p>
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-16 animate-pulse rounded-xl bg-gray-100"
            />
          ))}
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-gray-200 md:block">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "#",
                    "Customer",
                    "Puja",
                    "Mantra Option",
                    "Qty",
                    "Total Amount",
                    "Payment Status",
                    "Booking Status",
                    "Booking Date",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-xs font-semibold uppercase text-gray-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking, index) => (
                  <tr
                    key={booking.id}
                    className="text-sm transition hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 text-gray-500">
                      {(currentPage - 1) * PAGE_LIMIT + index + 1}
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-800">
                        {booking.userName || "-"}
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        ID: {booking.userId.slice(0,8)}
                      </div>
                    </td>

                    <td className="px-4 py-4 font-medium text-gray-800">
                      {booking.pujaName || "-"}
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {booking.mantraOptionName || "-"}
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {booking.quantity}
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-800">
                        {formatAmount(booking.totalAmount)}
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        {formatAmount(booking.unitPrice)} / unit
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={booking.paymentStatus} />
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge
                        status={booking.bookingStatus}
                        type="booking"
                      />
                    </td>

                    <td className="px-4 py-4 text-xs text-gray-600">
                      {formatDate(booking.bookingDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-xl border border-gray-200 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {booking.puja?.title || "Puja"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {booking.user?.name || "Customer"}
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-gray-800">
                    {formatAmount(booking.totalAmount)}
                  </span>
                </div>

                <div className="mb-3 space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="text-gray-400">Mantra:</span>{" "}
                    {booking.mantraOptionName || "-"}
                  </p>
                  <p>
                    <span className="text-gray-400">Quantity:</span>{" "}
                    {booking.quantity}
                  </p>
                  <p>
                    <span className="text-gray-400">Unit price:</span>{" "}
                    {formatAmount(booking.unitPrice)}
                  </p>
                  <p>
                    <span className="text-gray-400">Date:</span>{" "}
                    {formatDate(booking.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                  <StatusBadge status={booking.paymentStatus} />
                  <StatusBadge
                    status={booking.bookingStatus}
                    type="booking"
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center">
          <p className="text-sm font-medium text-gray-600">
            No puja bookings found
          </p>
        </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Page <span className="font-semibold">{currentPage}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => page - 1)}
              disabled={currentPage === 1 || isLoading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage((page) => page + 1)}
              disabled={currentPage >= totalPages || isLoading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
