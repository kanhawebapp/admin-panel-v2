"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import DataTable from "@/components/utils/DataTable";

import {
  GET_RUNNING_LIVE_STREAMS,
  ADMIN_DELETE_SCHEDULED_LIVE,
} from "@/app/graphQL/liveStream";

/* =========================================
   DATE HELPER
========================================= */

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
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

/* =========================================
   MAIN COMPONENT
========================================= */

export default function RunningLivesAdminPage() {
  /* =========================================
     SEARCH STATE
  ========================================= */

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  /* =========================================
     MESSAGE STATE
  ========================================= */

  const [successMessage, setSuccessMessage] = useState("");
  const [actionError, setActionError] = useState("");

  /* =========================================
     DEBOUNCED SEARCH
  ========================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim().toLowerCase());
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  /* =========================================
     GET RUNNING LIVE STREAMS
  ========================================= */

  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery(GET_RUNNING_LIVE_STREAMS, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  // Only running live streams should be displayed.
  const runningLives = useMemo(() => {
    const lives = data?.getRunningLiveStreams ?? [];

    return lives.filter((live) => live.status === "LIVE");
  }, [data]);

  /* =========================================
     DELETE MUTATION
  ========================================= */

  const [
    deleteLive,
    { loading: deleting },
  ] = useMutation(ADMIN_DELETE_SCHEDULED_LIVE);

  /* =========================================
     FILTER RUNNING LIVE STREAMS
  ========================================= */

  const filteredLives = useMemo(() => {
    if (!debouncedSearch) {
      return runningLives;
    }

    return runningLives.filter((live) => {
      const title = live.title?.toLowerCase() || "";

      const astrologerName =
        live.astrologer?.displayName?.toLowerCase() ||
        live.astrologer?.name?.toLowerCase() ||
        "";

      const astrologerId =
        live.astrologerId?.toLowerCase() || "";

      const channelName =
        live.channelName?.toLowerCase() || "";

      const streamId = live.id?.toLowerCase() || "";

      return (
        title.includes(debouncedSearch) ||
        astrologerName.includes(debouncedSearch) ||
        astrologerId.includes(debouncedSearch) ||
        channelName.includes(debouncedSearch) ||
        streamId.includes(debouncedSearch)
      );
    });
  }, [runningLives, debouncedSearch]);

  /* =========================================
     DELETE RUNNING LIVE STREAM
  ========================================= */

  const handleDelete = async (live) => {
    if (deleting) return;

    setActionError("");
    setSuccessMessage("");

    const astrologerName =
      live.astrologer?.displayName ||
      live.astrologer?.name ||
      "Unknown astrologer";

    const confirmed = window.confirm(
      `WARNING: This live stream is currently running.\n\n` +
        `Title: ${live.title || "Untitled"}\n` +
        `Astrologer: ${astrologerName}\n\n` +
        `Are you sure you want to delete this live stream?`
    );

    if (!confirmed) return;

    try {
      const result = await deleteLive({
        variables: {
          id: live.id,
        },
      });

      /*
       * This assumes your existing GraphQL mutation
       * returns adminDeleteScheduledLive as a Boolean.
       */

      const deleted =
        result.data?.adminDeleteScheduledLive;

      if (deleted !== true) {
        throw new Error(
          "The live stream could not be deleted."
        );
      }

      // Refresh the running live streams list.
      await refetch();

      setSuccessMessage(
        `Live stream "${live.title || "Untitled"}" deleted successfully.`
      );

      setSearch("");
      setDebouncedSearch("");
    } catch (err) {
      console.error("Delete running live stream error:", err);

      setActionError(
        err.message || "Failed to delete the live stream."
      );
    }
  };

  /* =========================================
     TABLE COLUMNS
  ========================================= */

  const columns = useMemo(
    () => [
      /* SERIAL NUMBER */

      {
        header: "S.No.",
        render: (row) =>
          filteredLives.findIndex(
            (live) => live.id === row.id
          ) + 1,
      },

      /* ASTROLOGER */

      {
        header: "Astrologer",

        render: (row) => {
          const name =
            row.astrologer?.displayName ||
            row.astrologer?.name ||
            "Unknown Astrologer";

          return (
            <div className="flex min-w-[200px] items-center gap-3">
              {row.astrologer?.profilePic ? (
                <img
                  src={row.astrologer.profilePic}
                  alt={name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-700">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <Link
                  href={`/Admindash/astrologer/astroprofile/${
                    row.astrologer?.id || row.astrologerId
                  }`}
                  className="font-semibold text-purple-600 hover:underline"
                >
                  {name}
                </Link>

                <p className="text-xs text-gray-500">
                  ID: {row.astrologerId?.slice(0, 8) || "N/A"}
                </p>

                {row.astrologer?.rating != null && (
                  <p className="text-xs text-amber-600">
                    Rating: {row.astrologer.rating}
                  </p>
                )}
              </div>
            </div>
          );
        },
      },

      /* LIVE TITLE AND CHANNEL */

      {
        header: "Live Stream",

        render: (row) => (
          <div className="min-w-[200px] max-w-[320px]">
            <p className="font-semibold text-gray-800">
              {row.title || "Untitled"}
            </p>

            <p className="mt-1 break-all text-xs text-gray-500">
              Channel: {row.channelName || "N/A"}
            </p>

            <p className="mt-1 break-all text-xs text-gray-400">
              Stream ID: {row.id}
            </p>
          </div>
        ),
      },

      /* START TIME */

      {
        header: "Started At",

        render: (row) => (
          <span className="whitespace-nowrap text-sm text-gray-700">
            {formatDate(row.startedAt)}
          </span>
        ),
      },

      /* CHAT ROOM */

      {
        header: "Chat Room",

        render: (row) => (
          <span className="break-all text-sm text-gray-700">
            {row.chatRoomId || "N/A"}
          </span>
        ),
      },

      /* STATUS */

      {
        header: "Status",

        render: (row) => (
          <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-600" />
            LIVE
          </span>
        ),
      },

      /* TOTAL VIEWS */

      {
        header: "Total Views",

        render: (row) => (
          <span className="font-bold text-blue-600">
            {(row.totalViews ?? 0).toLocaleString("en-IN")}
          </span>
        ),
      },

      /* CREATED AT */

      {
        header: "Created At",

        render: (row) => (
          <span className="whitespace-nowrap text-sm text-gray-600">
            {formatDate(row.createdAt)}
          </span>
        ),
      },

      /* ACTIONS */

      {
        header: "Actions",

        render: (row) => (
          <button
            type="button"
            onClick={() => handleDelete(row)}
            disabled={deleting}
            title="Delete running live stream"
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        ),
      },
    ],
    [filteredLives, deleting]
  );

  /* =========================================
     ERROR STATE
  ========================================= */

  if (error && !data) {
    return (
      <div className="space-y-4 p-6 md:p-10">
        <h1 className="text-2xl font-bold text-gray-900">
          Running Live Streams
        </h1>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-700">
            Failed to load running live streams.
          </p>

          <p className="mt-2 text-sm text-red-600">
            {error.message}
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* =========================================
     MAIN UI
  ========================================= */

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-6 md:p-10">
      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-600" />
            </span>

            <h1 className="text-2xl font-bold text-gray-900">
              Running Live Streams
            </h1>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Monitor currently running astrologer live sessions
            and delete streams when necessary.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={loading || deleting}
          className="w-fit rounded-lg bg-black px-5 py-2.5 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* SUCCESS MESSAGE */}

      {successMessage && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          <p className="text-sm font-medium">
            {successMessage}
          </p>

          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="font-bold"
            aria-label="Dismiss success message"
          >
            ×
          </button>
        </div>
      )}

      {/* ERROR MESSAGE */}

      {actionError && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="text-sm font-medium">
            {actionError}
          </p>

          <button
            type="button"
            onClick={() => setActionError("")}
            className="font-bold"
            aria-label="Dismiss error message"
          >
            ×
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {/* RUNNING STREAMS */}

        <div className="rounded-xl border border-green-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">
              Running Live Streams
            </p>

            <span className="rounded-lg bg-green-100 p-2 text-green-700">
              ●
            </span>
          </div>

          <h2 className="mt-3 text-3xl font-bold text-green-700">
            {runningLives.length}
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Currently marked LIVE
          </p>
        </div>

        {/* FILTERED RESULTS */}

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Filtered Results
          </p>

          <h2 className="mt-3 text-3xl font-bold text-purple-600">
            {filteredLives.length}
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Matching your search
          </p>
        </div>

        {/* TOTAL VIEWS */}

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total Views
          </p>

          <h2 className="mt-3 text-3xl font-bold text-blue-600">
            {runningLives
              .reduce(
                (total, live) =>
                  total + Number(live.totalViews ?? 0),
                0
              )
              .toLocaleString("en-IN")}
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Across running streams
          </p>
        </div>
      </div>

      {/* SEARCH */}

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <label
          htmlFor="running-live-search"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Search Running Live Streams
        </label>

        <input
          id="running-live-search"
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by astrologer, title, stream ID, or channel..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="mt-2 text-sm font-medium text-purple-600 hover:underline"
          >
            Clear search
          </button>
        )}
      </div>

      {/* LIVE STREAMS TABLE */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
        <div className="flex flex-col gap-2 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Active Live Sessions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Only streams with LIVE status are displayed.
            </p>
          </div>

          <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
            {filteredLives.length} streams
          </span>
        </div>

        {loading && !data ? (
          <div className="p-10 text-center text-gray-500">
            Loading running live streams...
          </div>
        ) : filteredLives.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
              📡
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-800">
              {runningLives.length === 0
                ? "No running live streams"
                : "No matching live streams"}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              {runningLives.length === 0
                ? "There are currently no streams marked as LIVE."
                : "Try searching with a different title, astrologer, or channel name."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-4 rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={filteredLives}
            />
          </div>
        )}

        {loading && data && (
          <div className="border-t bg-gray-50 px-5 py-3 text-sm text-gray-500">
            Refreshing live stream data...
          </div>
        )}
      </div>
    </div>
  );
}