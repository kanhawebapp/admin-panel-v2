"use client";

import { useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import DataTable from "@/components/utils/DataTable";

import { GET_LIVE_GIFT_TRANSACTIONS } from "@/app/graphQL/liveStream";

/* =====================================================
   CONSTANTS
===================================================== */

const DEFAULT_LIMIT = 20;

const EMPTY_FILTERS = {
  senderId: "",
  astrologerId: "",
  streamId: "",
  giftId: "",
  status: "",
  startDate: "",
  endDate: "",
};

/* =====================================================
   DATE HELPERS
===================================================== */

function formatDate(dateValue) {
  if (!dateValue) return "N/A";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/* =====================================================
   NUMBER FORMATTER
===================================================== */

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(
    Number(value) || 0
  );
}

/* =====================================================
   SHORTEN UUID
===================================================== */

function shortenId(value, length = 12) {
  if (!value) return "N/A";

  if (value.length <= length) {
    return value;
  }

  return `${value.slice(0, length)}...`;
}

/* =====================================================
   STATUS BADGE
===================================================== */

function getStatusClass(status) {
  switch (status?.toUpperCase()) {
    case "SUCCESS":
      return "bg-green-100 text-green-700";

    case "FAILED":
      return "bg-red-100 text-red-700";

    case "PENDING":
      return "bg-yellow-100 text-yellow-700";

    case "PROCESSING":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function LiveGiftTransactionsAdminPage() {
  /* =====================================================
     FILTER FORM STATE
  ===================================================== */

  const [filterForm, setFilterForm] = useState({
    ...EMPTY_FILTERS,
  });

  const [activeFilters, setActiveFilters] = useState({});

  const [page, setPage] = useState(1);

  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const [filterError, setFilterError] = useState("");

  /* =====================================================
     QUERY VARIABLES
  ===================================================== */

  const queryFilters = useMemo(() => {
    const filters = {};

    Object.entries(activeFilters).forEach(([key, value]) => {
      if (typeof value === "string" && value.trim()) {
        filters[key] = value.trim();
      }
    });

    return filters;
  }, [activeFilters]);

  /* =====================================================
     GET LIVE GIFT TRANSACTIONS
  ===================================================== */

  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery(GET_LIVE_GIFT_TRANSACTIONS, {
    variables: {
      page,
      limit,
      filters: queryFilters,
    },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const result = data?.getLiveGiftTransactions;

  const transactions = result?.transactions ?? [];

  const totalRecords = result?.totalRecords ?? 0;

  const totalPages = result?.totalPages ?? 0;

  const currentPage = result?.currentPage ?? page;

  const totalCoins = result?.totalCoins ?? 0;

  /* =====================================================
     RESET PAGE WHEN FILTERS CHANGE
  ===================================================== */

  useEffect(() => {
    setPage(1);
  }, [activeFilters, limit]);

  /* =====================================================
     HANDLE FILTER INPUT
  ===================================================== */

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilterForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =====================================================
     APPLY FILTERS
  ===================================================== */

  const handleApplyFilters = (event) => {
    event.preventDefault();

    setFilterError("");

    if (
      filterForm.startDate &&
      filterForm.endDate &&
      filterForm.startDate > filterForm.endDate
    ) {
      setFilterError(
        "Start date must be before or equal to end date."
      );

      return;
    }

    const filters = {};

    Object.entries(filterForm).forEach(([key, value]) => {
      if (value.trim()) {
        filters[key] = value.trim();
      }
    });

    setPage(1);
    setActiveFilters(filters);
  };

  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

  const handleClearFilters = () => {
    setFilterError("");

    setFilterForm({
      ...EMPTY_FILTERS,
    });

    setActiveFilters({});
    setPage(1);
  };

  /* =====================================================
     REFRESH TRANSACTIONS
  ===================================================== */

  const handleRefresh = async () => {
    try {
      await refetch({
        page,
        limit,
        filters: queryFilters,
      });
    } catch (refreshError) {
      console.error(
        "Failed to refresh gift transactions:",
        refreshError
      );
    }
  };

  /* =====================================================
     CHANGE PAGE SIZE
  ===================================================== */

  const handleLimitChange = (event) => {
    const newLimit = Number(event.target.value);

    setLimit(newLimit);
    setPage(1);
  };

  /* =====================================================
     PAGINATION
  ===================================================== */

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setPage(currentPage + 1);
    }
  };

  /* =====================================================
     TABLE COLUMNS
  ===================================================== */

  const columns = useMemo(
    () => [
      {
        header: "S.No.",

        render: (row) => {
          const index = transactions.findIndex(
            (transaction) => transaction.id === row.id
          );

          return (currentPage - 1) * limit + index + 1;
        },
      },

      {
        header: "Transaction ID",

        render: (row) => (
          <div className="min-w-[150px]">
            <p
              className="font-medium text-gray-800"
              title={row.id}
            >
              {shortenId(row.id, 14)}
            </p>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard
                  .writeText(row.id)
                  .catch((copyError) => {
                    console.error(
                      "Could not copy transaction ID:",
                      copyError
                    );
                  });
              }}
              className="mt-1 text-xs text-purple-600 hover:underline"
            >
              Copy ID
            </button>
          </div>
        ),
      },

      {
        header: "Sender ID",

        render: (row) => (
          <span
            className="font-medium text-gray-700"
            title={row.senderId}
          >
            {shortenId(row.senderId)}
          </span>
        ),
      },

      {
        header: "Astrologer ID",

        render: (row) => (
          <span
            className="font-medium text-gray-700"
            title={row.astrologerId}
          >
            {shortenId(row.astrologerId)}
          </span>
        ),
      },

      {
        header: "Stream ID",

        render: (row) => (
          <span
            className="text-gray-600"
            title={row.streamId}
          >
            {shortenId(row.streamId)}
          </span>
        ),
      },

      {
        header: "Gift ID",

        render: (row) => (
          <span
            className="text-gray-600"
            title={row.giftId}
          >
            {shortenId(row.giftId)}
          </span>
        ),
      },

      {
        header: "Quantity",

        render: (row) => (
          <span className="font-semibold text-gray-800">
            {row.quantity ?? 0}
          </span>
        ),
      },

      {
        header: "Total Coins",

        render: (row) => (
          <span className="whitespace-nowrap font-bold text-purple-700">
            {formatNumber(row.totalCoins)}
          </span>
        ),
      },

      {
        header: "Status",

        render: (row) => (
          <span
            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
              row.status
            )}`}
          >
            {row.status || "UNKNOWN"}
          </span>
        ),
      },

      {
        header: "Transaction Date",

        render: (row) => (
          <span className="whitespace-nowrap text-gray-600">
            {formatDate(row.createdAt)}
          </span>
        ),
      },
    ],
    [transactions, currentPage, limit]
  );

  /* =====================================================
     ERROR STATE
  ===================================================== */

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-10">
        <div className="rounded-xl border border-red-200 bg-white p-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Live Gift Transaction History
          </h1>

          <p className="mt-4 text-red-600">
            Failed to load gift transactions.
          </p>

          <p className="mt-2 break-words text-sm text-gray-600">
            {error.message}
          </p>

          <button
            type="button"
            onClick={handleRefresh}
            className="mt-5 rounded-lg bg-purple-600 px-5 py-2.5 font-semibold text-white hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-4 md:p-8">
      {/* ===============================================
          HEADER
      =============================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Live Gift Transaction History
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Monitor gifts sent by users during astrologer live
            sessions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="w-fit rounded-lg bg-gray-900 px-5 py-2.5 font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ===============================================
          QUERY ERROR
      =============================================== */}

      {error && data && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not refresh the transaction list: {error.message}
        </div>
      )}

      {/* ===============================================
          SUMMARY CARDS
      =============================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* TOTAL RECORDS */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Matching Transactions
              </p>

              <h2 className="mt-3 text-3xl font-bold text-gray-900">
                {formatNumber(totalRecords)}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl">
              📋
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Total records matching the selected filters
          </p>
        </div>

        {/* SUCCESSFUL COINS */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Successful Gift Coins
              </p>

              <h2 className="mt-3 text-3xl font-bold text-purple-700">
                {formatNumber(totalCoins)}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-xl">
              🎁
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Coins from successful transactions matching the filters
          </p>
        </div>

        {/* CURRENT PAGE */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Current Page
              </p>

              <h2 className="mt-3 text-3xl font-bold text-blue-700">
                {currentPage}
                <span className="text-lg font-medium text-gray-400">
                  {" "}
                  / {totalPages}
                </span>
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-xl">
              📄
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            {transactions.length} transactions on this page
          </p>
        </div>
      </div>

      {/* ===============================================
          FILTER SECTION
      =============================================== */}

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            Filter Gift Transactions
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Search using transaction identifiers, status, or date
            range.
          </p>
        </div>

        <form onSubmit={handleApplyFilters}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {/* SENDER ID */}

            <div>
              <label
                htmlFor="senderId"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Sender ID
              </label>

              <input
                id="senderId"
                name="senderId"
                type="text"
                value={filterForm.senderId}
                onChange={handleFilterChange}
                placeholder="Enter sender UUID"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            {/* ASTROLOGER ID */}

            <div>
              <label
                htmlFor="astrologerId"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Astrologer ID
              </label>

              <input
                id="astrologerId"
                name="astrologerId"
                type="text"
                value={filterForm.astrologerId}
                onChange={handleFilterChange}
                placeholder="Enter astrologer UUID"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            {/* STREAM ID */}

            <div>
              <label
                htmlFor="streamId"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Stream ID
              </label>

              <input
                id="streamId"
                name="streamId"
                type="text"
                value={filterForm.streamId}
                onChange={handleFilterChange}
                placeholder="Enter stream UUID"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            {/* GIFT ID */}

            <div>
              <label
                htmlFor="giftId"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Gift ID
              </label>

              <input
                id="giftId"
                name="giftId"
                type="text"
                value={filterForm.giftId}
                onChange={handleFilterChange}
                placeholder="Enter gift UUID"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            {/* STATUS */}

            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Transaction Status
              </label>

              <select
                id="status"
                name="status"
                value={filterForm.status}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="">All Statuses</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
              </select>
            </div>

            {/* START DATE */}

            <div>
              <label
                htmlFor="startDate"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Start Date
              </label>

              <input
                id="startDate"
                name="startDate"
                type="date"
                value={filterForm.startDate}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            {/* END DATE */}

            <div>
              <label
                htmlFor="endDate"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                End Date
              </label>

              <input
                id="endDate"
                name="endDate"
                type="date"
                value={filterForm.endDate}
                min={filterForm.startDate || undefined}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>

          {/* FILTER VALIDATION ERROR */}

          {filterError && (
            <p className="mt-4 text-sm text-red-600">
              {filterError}
            </p>
          )}

          {/* FILTER BUTTONS */}

          <div className="mt-6 flex flex-wrap gap-3 border-t pt-5">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply Filters
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100"
            >
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      {/* ===============================================
          TRANSACTION TABLE HEADER
      =============================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Gift Transactions
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Showing {transactions.length} records on this page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor="pageLimit"
            className="whitespace-nowrap text-sm font-medium text-gray-600"
          >
            Rows per page
          </label>

          <select
            id="pageLimit"
            value={limit}
            onChange={handleLimitChange}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-purple-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* ===============================================
          TABLE
      =============================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading && !data ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-purple-600" />

            <p className="mt-4 text-sm text-gray-500">
              Loading gift transactions...
            </p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl">🎁</div>

            <h3 className="mt-4 text-lg font-bold text-gray-800">
              No gift transactions found
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Try changing the filters or selecting another date
              range.
            </p>
          </div>
        ) : (
          <>
            {loading && (
              <div className="border-b bg-purple-50 px-5 py-2 text-sm text-purple-700">
                Updating transactions...
              </div>
            )}

            <div className="overflow-x-auto">
              <DataTable
                columns={columns}
                data={transactions}
              />
            </div>
          </>
        )}
      </div>

      {/* ===============================================
          PAGINATION
      =============================================== */}

      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* PAGINATION INFO */}

        <div className="text-sm text-gray-600">
          {totalRecords > 0 ? (
            <>
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {(currentPage - 1) * limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-900">
                {Math.min(currentPage * limit, totalRecords)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {formatNumber(totalRecords)}
              </span>{" "}
              transactions
            </>
          ) : (
            "No transactions to display"
          )}
        </div>

        {/* PAGINATION BUTTONS */}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePreviousPage}
            disabled={loading || currentPage <= 1}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="min-w-[100px] text-center text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={
              loading ||
              totalPages === 0 ||
              currentPage >= totalPages
            }
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}