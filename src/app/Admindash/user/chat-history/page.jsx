"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import DataTable from "@/components/utils/DataTable";
import SessionMessagesModal from "../SessionModal";
import {
  GET_REFUND_REQUESTS,
  GET_USERS_CHAT_HISTORY,
} from "@/app/graphQL/astroHiring";
import Link from "next/link";
import SessionRemedyModal from "../SessionRemedyModal";
import ExportMenu from "@/components/Custom/ExportMenu";
import { exportExcel } from "@/components/utils/export/exportExcel";
import { exportPDF } from "@/components/utils/export/exportPDF";
import SessionDurationModal from "../SessionDurationModal";
export default function UserChatHistoryPage() {
  const [openModal, setOpenModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [searchMobile, setSearchMobile] = useState("");
  const [searchAstrologerName, setSearchAstrologerName] = useState("");
  const [openRemedyModal, setOpenRemedyModal] = useState(false);
  const [searchType, setSearchType] = useState("");
  const [openDurationModal, setOpenDurationModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [searchStatus, setSearchStatus] = useState("");

  const [searchFilterType, setSearchFilterType] = useState("");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  // PAGINATION
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);

  // FILTERS
  const [filters, setFilters] = useState({
    query: "",
    mobile: "",
    astrologerName: "",
    status: "",
    filterType: "",
    startDate: "",
    endDate: "",
  });
  const { data: refundData, refetch: refetchRefunds } = useQuery(
    GET_REFUND_REQUESTS,
    {
      variables: {
        searchInput: {
          page: 1,
          limit: 1000,
        },
      },
      fetchPolicy: "network-only",
      pollInterval: 50000,
    },
  );
  const refundStatusMap = useMemo(() => {
    const map = new Map();

    const refunds = refundData?.getRefundRequests?.data || [];

    refunds.forEach((refund) => {
      map.set(refund.sessionId, refund.status);
    });

    return map;
  }, [refundData]);
  // DEBOUNCE SEARCH
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);

      setFilters({
        query: searchName,
        mobile: searchMobile,
        astrologerName: searchAstrologerName,
        status: searchStatus,
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
    searchStatus,
    searchFilterType,
    startDate,
    endDate,
  ]);

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

  if (filters.status) {
    searchInput.status = filters.status;
  }

  if (filters.filterType) {
    searchInput.filterType = filters.filterType;
  }

  if (filters.filterType === "CUSTOM" && filters.startDate && filters.endDate) {
    searchInput.startDate = filters.startDate;

    searchInput.endDate = filters.endDate;
  }

  // API CALL
  const { data, loading, error } = useQuery(GET_USERS_CHAT_HISTORY, {
    variables: {
      searchInput,
    },
    fetchPolicy: "network-only",
  });
  const handleDurationSubmit = async (payload) => {
    console.log("Refund successfully created:", payload);

    setShowSuccessToast(true);

    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);

    await refetchRefunds();
  };
  const history = data?.getUsersChatHistory?.data || [];

  const totalCount = data?.getUsersChatHistory?.totalCount || 0;

  const totalPages = data?.getUsersChatHistory?.totalPages || 1;

  const totalCoinsDeducted = data?.getUsersChatHistory?.totalCoinsDeducted || 0;

  const totalCoinsEarned = data?.getUsersChatHistory?.totalCoinsEarned || 0;

  const totalCommission = data?.getUsersChatHistory?.totalCommission || 0;
  const exportData = history.map((row) => ({
    SessionID: row.sessionId,
    UserID: row.userId,
    UserName: row.userName,
    Mobile: row.mobile,
    Astrologer: row.astrologerName,
    AstrologerID: row.astrologerId,
    Source: row.source,
    Status: row.status,
    RatePerMin: row.ratePerMin,
    CoinsDeducted: row.coinsDeducted,
    CoinsEarned: row.coinsEarned,
    Commission: row.commission,
    By: row.by,
    DurationSec: row.durationSec,
    HasRemedy: row.hasRemedy ? "Yes" : "No",
    CreatedAt: row.createdAt
      ? new Date(row.createdAt).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        })
      : "",
  }));
  const handleExcelExport = () => {
    if (!exportData.length) {
      alert("No data available to export");
      return;
    }

    exportExcel(exportData, "Users Chat History", "UsersChatHistory.xlsx");
  };

  const handlePDFExport = () => {
    if (!exportData.length) {
      alert("No data available to export");
      return;
    }

    exportPDF(exportData, "Users Chat History", "UsersChatHistory.pdf");
  };
  // TABLE COLUMNS
  const columns = useMemo(
    () => [
      {
        header: "SessionID",
        render: (row) => (
          <span className="font-semibold text-blue-600">
            {row.sessionId?.slice(0, 8)}
          </span>
        ),
      },
      {
        header: "User",
        render: (row) => (
          <div>
            <Link
              href={`/Admindash/user/userprofile/${row.userId}`}
              className="font-semibold text-violet-600 hover:underline"
            >
              {row.userName}
            </Link>

            <p className="text-xs text-gray-500">{row.userId?.slice(0, 8)}</p>
            <p className="text-[10px] font-bold text-purple-600">
              {row.source}
            </p>
          </div>
        ),
      },

      {
        header: "Astrologer",
        render: (row) => (
          <div>
            <Link
              href={`/Admindash/astrologer/astroprofile/${row.astrologerId}`}
              className="font-semibold text-violet-600 hover:underline"
            >
              {row.astrologerName}
            </Link>

            <p className="text-xs text-gray-500">
              {row.astrologerId?.slice(0, 8)}
            </p>
          </div>
        ),
      },

      {
        header: "Rate / Min",
        render: (row) => (
          <span className="font-semibold text-blue-600">
            ₹ {row.ratePerMin}
          </span>
        ),
      },

      {
        header: "Amount Deducted",
        render: (row) => (
          <span className="font-semibold text-red-500">
            {row.coinsDeducted}
          </span>
        ),
      },
      {
        header: "Status",
        render: (row) => {
          const status = row.status || "";

          const statusStyles = {
            REQUESTED: "bg-orange-100 text-orange-700",
            ACCEPTED: "bg-blue-100 text-blue-700",
            ONGOING: "bg-purple-100 text-purple-700",
            COMPLETED: "bg-green-100 text-green-700",
            CANCELLED: "bg-red-100 text-red-700",
            FAILED: "bg-gray-200 text-gray-700",
          };

          const formattedStatus = status
            .toLowerCase()
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

          return (
            <div className="flex flex-col">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  statusStyles[status] || "bg-gray-100 text-gray-700"
                }`}
              >
                {formattedStatus}
              </span>

              {(status === "CANCELLED" || status === "REJECTED") && row.by && (
                <span className="text-[10px] mt-1 text-red-500 font-medium">
                  {row.by}
                </span>
              )}
            </div>
          );
        },
      },

      {
        header: "Duration",
        render: (row) => {
          const sec = Number(row.durationSec || 0);

          if (sec < 60) {
            return <span>{sec} sec</span>;
          }

          const minutes = Math.floor(sec / 60);
          const seconds = sec % 60;

          return (
            <span>
              {minutes}.{String(seconds).padStart(2, "0")} min
            </span>
          );
        },
      },

      {
        header: "Created Date",
        render: (row) => (
          <div className="text-xs">
            {new Date(row.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "Asia/Kolkata",
            })}
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
      {
        header: "Actions",
        render: (row) => {
          const refundStatus = refundStatusMap
            .get(row.sessionId)
            ?.toUpperCase();

          return (
          <div className="flex items-center gap-3">
  {row.status === "COMPLETED" && (
    <>
      <button
        type="button"
        title="View Chat"
        onClick={() => {
          setSelectedSession(row.sessionId);
          setOpenModal(true);
        }}
        className="text-black hover:text-purple-600 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
        </svg>
      </button>

      {refundStatus === "PENDING" && (
        <button
          type="button"
          disabled
          title="Refund request pending"
          className="cursor-not-allowed opacity-70"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            width="18"
            height="18"
          >
            <path
              fill="rgb(30, 48, 80)"
              d="M160 64C142.3 64 128 78.3 128 96C128 113.7 142.3 128 160 128L160 139C160 181.4 176.9 222.1 206.9 252.1L274.8 320L206.9 387.9C176.9 417.9 160 458.6 160 501L160 512C142.3 512 128 526.3 128 544C128 561.7 142.3 576 160 576L480 576C497.7 576 512 561.7 512 544C512 526.3 497.7 512 480 512L480 501C480 458.6 463.1 417.9 433.1 387.9L365.2 320L433.1 252.1C463.1 222.1 480 181.4 480 139L480 128C497.7 128 512 113.7 512 96C512 78.3 497.7 64 480 64L160 64zM224 139L224 128L416 128L416 139C416 158 410.4 176.4 400 192L240 192C229.7 176.4 224 158 224 139zM240 448C243.5 442.7 247.6 437.7 252.1 448L400 448C392.5 437.7 387.9 433.1 387.9 448L320 365.2L252.1 433.1C247.6 437.7 243.5 442.1 240 448z"
            />
          </svg>
        </button>
      )}

      {refundStatus === "APPROVED" && (
        <button
          type="button"
          disabled
          title="Refund approved"
          className="cursor-not-allowed opacity-80"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="9" fill="#22c55e" />
            <path
              d="M8 12.5L10.5 15L16 9.5"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {refundStatus === "REJECTED" && (
        <button
          type="button"
          title="Refund rejected - request again"
          onClick={() => {
            setSelectedSession(row);
            setOpenDurationModal(true);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="9" fill="#ef4444" />
            <path
              d="M9 9L15 15M15 9L9 15"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}

      {!refundStatus && (
        <button
          type="button"
          title="Request refund"
          onClick={() => {
            setSelectedSession(row);
            setOpenDurationModal(true);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 3a9 9 0 1 0 8.49 12H18.3a7 7 0 1 1-1.95-7.05L14 10.3h7V3.3l-2.25 2.25A8.96 8.96 0 0 0 12 3Z" />
          </svg>
        </button>
      )}
    </>
  )}
</div>
          );
        },
      },
    ],
    [refundStatusMap],
  );

  if (error) {
    return <p className="p-10 text-red-500">Error loading chat history</p>;
  }

  return (
    <div className="p-10 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-2xl font-bold">Users Chat History</h1>

        <div className="flex flex-wrap gap-3">
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold">
            Coins Deducted : {totalCoinsDeducted}
          </div>

          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
            Coins Earned : {totalCoinsEarned?.toFixed(2)}
          </div>

          <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">
            Commission : {totalCommission}
          </div>

          <div className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold">
            Total Records : {totalCount}
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 bg-white p-5 rounded-2xl border-purple-100 shadow-mdshadow border">
        {/* USER NAME */}
        <input
          type="text"
          placeholder="Search by user name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="rounded-full text-xs border border-gray-200 px-4 py-2 outline-none"
        />

        {/* MOBILE */}
        <input
          type="text"
          placeholder="Search by mobile"
          value={searchMobile}
          onChange={(e) => setSearchMobile(e.target.value)}
          className="rounded-full text-xs border border-purple-200 px-4 py-2 outline-none"
        />

        {/* ASTROLOGER */}
        <input
          type="text"
          placeholder="Search astrologer"
          value={searchAstrologerName}
          onChange={(e) => setSearchAstrologerName(e.target.value)}
          className="rounded-full text-xs border border-gray-200 px-4 py-2 outline-none"
        />

        {/* STATUS */}
        <select
          value={searchStatus}
          onChange={(e) => setSearchStatus(e.target.value)}
          className="rounded-full text-xs border border-violet-200 px-4 py-2 outline-none"
        >
          <option value="">All Status</option>

          <option value="REQUESTED">REQUESTED</option>

          <option value="ACCEPTED">ACCEPTED</option>

          <option value="ONGOING">ONGOING</option>

          <option value="COMPLETED">COMPLETED</option>

          <option value="CANCELLED">CANCELLED</option>

          <option value="FAILED">FAILED</option>
        </select>

        {/* DATE FILTER */}
        <select
          value={searchFilterType}
          onChange={(e) => setSearchFilterType(e.target.value)}
          className="rounded-full text-xs border border-purple-200 px-4 py-2 outline-none"
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
            className="border rounded-full border-purple-200 px-4 py-2 outline-none"
          />
        )}

        {/* END DATE */}
        {searchFilterType === "CUSTOM" && (
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-full border-purple-200 px-4 py-2 outline-none"
          />
        )}

        <ExportMenu
          onExcel={handleExcelExport}
          onPDF={handlePDFExport}
          onCSV={() => {}}
          onPrint={() => {}}
          onExportCurrent={handleExcelExport}
          onExportAll={() => {}}
        />
      </div>

      <SessionMessagesModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        sessionId={selectedSession}
      />
      <SessionDurationModal
        open={openDurationModal}
        onClose={() => {
          setOpenDurationModal(false);
          setSelectedSession(null);
        }}
        session={selectedSession}
        onSubmit={handleDurationSubmit}
      />
      <SessionRemedyModal
        open={openRemedyModal}
        onClose={() => setOpenRemedyModal(false)}
        sessionId={selectedSession}
      />

      {/* TABLE */}
      <div className="overflow-x-auto">
        <div className="w-full bg-white shadow-md rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center">Loading Chat History...</div>
          ) : (
            <DataTable columns={columns} data={history} />
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Show</span>

          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none bg-white"
          >
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={80}>80</option>
            <option value={100}>100</option>
          </select>

          <span className="text-sm font-medium text-gray-600">per page</span>
        </div>

        {/* PREVIOUS */}
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

        {/* PAGE INFO */}
        <div className="font-medium">
          Page {page} of {totalPages || 1}
        </div>

        {/* NEXT */}
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
    </div>
  );
}
