
"use client";
import { useQuery } from "@apollo/client/react";
import { useState } from "react";

import { GET_LIVE_INTERACTION_HISTORY } from "@/app/graphQL/homeGql";
import DataTable from "@/components/utils/DataTable";

const formatDate = (date) => {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCoins = (value) =>
  Number(value || 0).toLocaleString("en-IN");

const formatDuration = (seconds) => {
  if (seconds == null) return "-";

  const minutes = Math.floor(Number(seconds) / 60);
  const remainingSeconds = Number(seconds) % 60;

  return `${minutes}m ${remainingSeconds}s`;
};

const StatusBadge = ({ status }) => {
  const styles = {
    COMPLETED: "bg-green-100 text-green-700",
    ENDED: "bg-green-100 text-green-700",
    ACCEPTED: "bg-blue-100 text-blue-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    REJECTED: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-600",
    FAILED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status || "-"}
    </span>
  );
};

const SummaryCard = ({ title, value, subtitle }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-medium text-gray-500">{title}</p>
    <h3 className="mt-2 text-2xl font-bold text-gray-900">
      {value}
    </h3>
    {subtitle && (
      <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
    )}
  </div>
);

export default function LiveInteractionHistory() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [interactionFilter, setInteractionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery(GET_LIVE_INTERACTION_HISTORY, {
    variables: {
      searchInput: {
        page,
        limit,
      },
    },
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  const response = data?.getLiveInteractionHistory;
  const history = response?.data || [];

  const filteredHistory = history.filter((item) => {
    const matchesInteraction =
      interactionFilter === "ALL" ||
      item.interactionType === interactionFilter;

    const matchesStatus =
      statusFilter === "ALL" ||
      item.status === statusFilter;

    const searchValue = search.toLowerCase();

    const matchesSearch =
      !searchValue ||
      [
        item.userName,
        item.mobile,
        item.astrologerName,
        item.sessionId,
      ].some((value) =>
        String(value || "").toLowerCase().includes(searchValue)
      );

    return matchesInteraction && matchesStatus && matchesSearch;
  });

  const columns = [
    {
      header: "Session ID",
      accessor: "sessionId",
      width: "170px",
           render: (row) => (
        <div className="text-center">
        

          <p className="text-[10px] text-gray-400">
            ID: {row.sessionId.slice(0,8) || "-"}
          </p>
        </div>
      ),
      
    },
    {
      header: "User",
      accessor: "userName",
      width: "160px",
      render: (row) => (
        <div className="text-center">
          <p className="font-semibold text-gray-800">
            {row.userName || "-"}
          </p>

          <p className="text-[10px] text-gray-400">
            ID: {row.userId.slice(0,8) || "-"}
          </p>
        </div>
      ),
    },
    {
      header: "Astrologer",
      accessor: "astrologerName",
      width: "160px",
      render: (row) => (
        <div className="text-center">
          <p className="font-semibold text-gray-800">
            {row.astrologerName || "-"}
          </p>
          <p className="text-[10px] text-gray-400">
           {row.astrologerId.slice(0,8) || "-"}
          </p>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: "interactionType",
      width: "100px",
      render: (row) => (
        <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${
          row.interactionType === "VIDEO"
            ? "bg-purple-100 text-purple-700"
            : "bg-blue-100 text-blue-700"
        }`}>
          {row.interactionType || "-"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      width: "120px",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Rate / Min",
      accessor: "ratePerMin",
      width: "100px",
      render: (row) => `${formatCoins(row.ratePerMin)} coins`,
    },
    {
      header: "Charged Coins",
      accessor: "chargedCoins",
      width: "120px",
      render: (row) => (
        <span className="font-semibold text-red-600">
          {formatCoins(row.chargedCoins)}
        </span>
      ),
    },
    {
      header: "Dhwani Earned",
      accessor: "dhwaniEarned",
      width: "120px",
      render: (row) => (
        <span className="font-semibold text-green-700">
          {formatCoins(row.dhwaniEarned)}
        </span>
      ),
    },
    {
      header: "Astrologer Earned",
      accessor: "astrologerEarned",
      width: "140px",
      render: (row) => formatCoins(row.astrologerEarned),
    },
    {
      header: "Duration",
      accessor: "durationSeconds",
      width: "110px",
      render: (row) => formatDuration(row.durationSeconds),
    },
    {
      header: "Billable Min",
      accessor: "billableMinutes",
      width: "100px",
    },
    {
      header: "Requested At",
      accessor: "requestedAt",
      width: "170px",
      render: (row) => formatDate(row.requestedAt),
    },
    {
      header: "Accepted At",
      accessor: "acceptedAt",
      width: "170px",
      render: (row) => formatDate(row.acceptedAt),
    },
    {
      header: "Started At",
      accessor: "startedAt",
      width: "170px",
      render: (row) => formatDate(row.startedAt),
    },
    {
      header: "Ended At",
      accessor: "endedAt",
      width: "170px",
      render: (row) => formatDate(row.endedAt),
    },
    {
      header: "Created At",
      accessor: "createdAt",
      width: "170px",
      render: (row) => formatDate(row.createdAt),
    },
    {
      header: "Live Stream ID",
      accessor: "liveStreamId",
      width: "160px",
    },
    {
      header: "Agora UID",
      accessor: "agoraUid",
      width: "100px",
    },
  ];

  if (loading && !data) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
          <p className="mt-3 text-sm text-gray-500">
            Loading interaction history...
          </p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm font-semibold text-red-700">
          Failed to load interaction history.
        </p>
        <p className="mt-1 text-xs text-red-500">
          {error.message}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Live Interaction History
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Monitor audio and video consultations, transactions and earnings.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={loading}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Interactions"
          value={formatCoins(response?.totalCount)}
          subtitle="Total recorded sessions"
        />
        <SummaryCard
          title="Audio Calls"
          value={formatCoins(response?.totalAudioCalls)}
          subtitle="Total audio interactions"
        />
        <SummaryCard
          title="Video Calls"
          value={formatCoins(response?.totalVideoCalls)}
          subtitle="Total video interactions"
        />
        <SummaryCard
          title="Coins Deducted"
          value={formatCoins(response?.totalCoinsDeducted)}
          subtitle="Total user coins consumed"
        />
      </div>

      {/* EARNINGS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <p className="text-sm font-medium text-green-700">
            Total Dhwani Earnings
          </p>
          <h3 className="mt-2 text-2xl font-bold text-green-800">
            {formatCoins(response?.totalDhwaniEarned)} coins
          </h3>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-sm font-medium text-blue-700">
            Total Astrologer Earnings
          </p>
          <h3 className="mt-2 text-2xl font-bold text-blue-800">
            {formatCoins(response?.totalAstrologerEarned)} coins
          </h3>
        </div>
      </div>

      {/* FILTERS */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <input
            type="text"
            placeholder="Search user, mobile, astrologer, session..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-violet-400 lg:flex-1"
          />

          <select
            value={interactionFilter}
            onChange={(e) => setInteractionFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
          >
            <option value="ALL">All Interaction Types</option>
            <option value="AUDIO">Audio</option>
            <option value="VIDEO">Video</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="COMPLETED">Completed</option>
            <option value="ENDED">Ended</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold text-gray-800">
            Interaction Records
          </h3>
          <span className="text-xs text-gray-500">
            Showing {filteredHistory.length} of {formatCoins(response?.totalCount)} records
          </span>
        </div>

        {filteredHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="min-w-[1900px]">
              <DataTable
                columns={columns}
                data={filteredHistory}
                startIndex={(page - 1) * limit}
              />
            </div>
          </div>
        ) : (
          <div className="flex min-h-[180px] items-center justify-center text-center">
            <div>
              <p className="text-3xl">📞</p>
              <p className="mt-3 font-semibold text-gray-700">
                No interaction records found
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Try changing your filters or search keyword.
              </p>
            </div>
          </div>
        )}

        {/* PAGINATION */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">
            Page {response?.currentPage || 1} of {response?.totalPages || 1}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading || page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={loading || page >= (response?.totalPages || 1)}
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
