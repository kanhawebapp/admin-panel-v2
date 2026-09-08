"use client";

import { useMemo, useState } from "react";
import { gql } from "@apollo/client";
import { useApolloClient, useQuery } from "@apollo/client/react";

import CustomButton from "@/components/Custom/CustomButtom";
import CustomInput from "@/components/Custom/CustomInput";
import {
  GET_ASTROLOGER_CALL_HISTORY,
  GET_ASTROLOGER_CHAT_HISTORY,
  GET_ASTROLOGER_DASHBOARD_STATS,
  GET_ASTROLOGER_FOLLOWERS,
  GET_ASTROLOGER_WALLET_TRANSACTIONS,
  GET_CALL_RECORDING,
} from "@/app/graphQL/astroHiring";
import DataTable from "@/components/utils/DataTable";
import SessionMessagesModal from "../user/SessionModal";
import Link from "next/link";
import dayjs from "dayjs";
import SessionRemedyModal from "../user/SessionRemedyModal";
import Pagination from "../Pagination";

export default function AstrologerActivities({ astrologerId }) {
  const [activeTab, setActiveTab] = useState("earnings");
  const [openModal, setOpenModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [openRemedyModal, setOpenRemedyModal] = useState(false);
  const [search, setSearch] = useState("");
  const client = useApolloClient();
  const LIMIT = 10;

  const [chatPage, setChatPage] = useState(1);
  const [callPage, setCallPage] = useState(1);
  const [walletPage, setWalletPage] = useState(1);
  const [followersPage, setFollowersPage] = useState(1);
  const { data: statsData } = useQuery(GET_ASTROLOGER_DASHBOARD_STATS, {
    variables: { astrologerId },
    skip: !astrologerId,
  });

  const stats = statsData?.getAstrologerDashboardStats;
  const { data: chatData, loading: chatLoading } = useQuery(
    GET_ASTROLOGER_CHAT_HISTORY,
    {
      variables: {
        astrologerId,
        page: chatPage,
        limit: LIMIT,
      },
      skip: !astrologerId || activeTab !== "chat",
    },
  );
  const { data: callData, loading: callLoading } = useQuery(
    GET_ASTROLOGER_CALL_HISTORY,
    {
      variables: {
        astrologerId,
        page: callPage,
        limit: LIMIT,
      },
      skip: !astrologerId || activeTab !== "call",
    },
  );
  const { data: walletData, loading: walletLoading } = useQuery(
    GET_ASTROLOGER_WALLET_TRANSACTIONS,
    {
      variables: {
        astrologerId,
        page: walletPage,
        limit: LIMIT,
      },
      skip: !astrologerId || activeTab !== "wallet",
    },
  );
  const { data: followersData, loading: followersLoading } = useQuery(
    GET_ASTROLOGER_FOLLOWERS,
    {
      variables: {
        astrologerId,
        page: followersPage,
        limit: LIMIT,
      },
      skip: !astrologerId || activeTab !== "followers",
    },
  );

  const chatPagination = chatData?.getAstrologerChatHistory;
  const callPagination = callData?.getAstrologerCallHistory;
  const walletPagination = walletData?.getAstrologerWalletTransactions;
  const followersPagination = followersData?.getAstrologerFollowers;
  const wallet = walletData?.getAstrologerWalletTransactions?.data || [];
  const chats = chatData?.getAstrologerChatHistory?.data || [];

  const calls = callData?.getAstrologerCallHistory?.data || [];
  const handleDownloadRecording = async (sessionId) => {
    try {
      const { data } = await client.query({
        query: GET_CALL_RECORDING,
        variables: { sessionId },
        fetchPolicy: "network-only",
      });

      const recording = data?.getCallRecording;

      if (!recording?.fileUrl) {
        alert("Recording not found");
        return;
      }

      const link = document.createElement("a");
      link.href = recording.fileUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = recording.fileName || "call-recording.webm";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Unable to download recording");
    }
  };

  // const handleDownloadRecording = async (sessionId) => {
  //   try {
  //     const { data } = await client.query({
  //       query: GET_CALL_RECORDING,
  //       variables: { sessionId },
  //       fetchPolicy: "network-only",
  //     });

  //     const recording = data?.getCallRecording;

  //     if (!recording?.fileUrl) {
  //       alert("Recording not found");
  //       return;
  //     }

  //     window.open(recording.fileUrl, "_blank");

  //   } catch (err) {
  //     console.error(err);
  //   }
  // };
  const historyColumns = useMemo(
    () => [
      {
        header: "Session ID",
        render: (row) =>
           <div className="flex flex-col gap-1">
            <span
              className={`px-2 py- rounded-full text-xs font-semibold`}
            >
              {row.sessionId?.slice(0, 8)}
            </span>
          </div>
           
      },
      {
        header: "User",
        render: (row) => (
          <div>
              <Link
              href={`/Admindash/user/userprofile/${row.userId}`}
              className="font-semibold text-violet-600 hover:underline"
            >
              {row.userName || "N/A"}
            </Link>
           
            <p className="text-[10px] text-gray-500">{row.userId?.slice(0, 8)}</p>
          </div>
        ),
      },
      {
        header: "Rate / Min",
        render: (row) => `₹${row.ratePerMin || 0}`,
      },
      {
        header: "Astrologer Earned",
        render: (row) => `₹ ${row.astrologerCommission ?? 0}`,
      },
      {
        header: "Dhwani Earned",
        render: (row) => `₹ ${row.dhwaniCommission ?? 0}`,
      },
      {
        header: " Deducted",
        render: (row) => `₹ ${row.coinsDeducted ?? 0}`,
      },
      {
        header: "Duration",
        render: (row) => {
          const sec = Number(row.durationSec || 0);

          if (sec < 60) return `${sec} sec`;

          const min = Math.floor(sec / 60);
          const rem = sec % 60;

          return `${min}.${String(rem).padStart(2, "0")} min`;
        },
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
                className={`px-1 py- rounded-full text-xs ${
                  statusStyles[status] || "bg-gray-100 text-gray-700"
                }`}
              >
                {formattedStatus}
              </span>

              {(status === "CANCELLED" || status === "REJECTED") && row.by && (
                <span className="text-[10px] mt-1 text-red-500 ">{row.by}</span>
              )}
            </div>
          );
        },
      },
      {
        header: "Date",
        render: (row) => dayjs(row.createdAt).format("DD MMM YYYY hh:mm A"),
      },
      {
        header: "Action",
        render: (row) => (
          <div className="flex items-center justify-center gap-2">
            {activeTab === "chat" ? (
              <button
                title="View Chat"
                onClick={() => {
                  setSelectedSession(row.sessionId);
                  setOpenModal(true);
                }}
                className="flex cursor-pointer hover:scale-104 items-center justify-center text-blue-600 hover:text-blue-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height={20}
                  width={20}
                  viewBox="0 0 640 640"
                >
                  {" "}
                  <path d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z" />{" "}
                </svg>
              </button>
            ) : (
              <button
                title="Call Details"
                onClick={() => handleDownloadRecording(row.sessionId)}
                className="flex cursor-pointer hover:scale-104 items-center justify-center text-orange-600 hover:text-orange-800"
              >
                <svg height={18} width={18} viewBox="0 0 640 640">
                  <path d="M352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 306.7L246.6 265.3C234.1 252.8 213.8 252.8 201.3 265.3C188.8 277.8 188.8 298.1 201.3 310.6L297.3 406.6C309.8 419.1 330.1 419.1 342.6 406.6L438.6 310.6C451.1 298.1 451.1 277.8 438.6 265.3C426.1 252.8 405.8 252.8 393.3 265.3L352 306.7L352 96zM160 384C124.7 384 96 412.7 96 448L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 448C544 412.7 515.3 384 480 384L433.1 384L376.5 440.6C345.3 471.8 294.6 471.8 263.4 440.6L206.9 384L160 384zM464 440C477.3 440 488 450.7 488 464C488 477.3 477.3 488 464 488C450.7 488 440 477.3 440 464C440 450.7 450.7 440 464 440z" />
                </svg>
              </button>
            )}
      

            {row.hasRemedy && (
              <button
                title="View Remedy"
                onClick={() => {
                  setSelectedSession(row.sessionId);
                  setOpenRemedyModal(true);
                }}
                className="flex hover:scale-104 cursor-pointer items-center justify-center text-green-600 hover:text-green-800"
              >
                <svg height={20} width={20} viewBox="0 0 640 640">
                  <path d="M311.6 95C297.5 75.5 274.9 64 250.9 64C209.5 64 176 97.5 176 138.9L176 141.3C176 205.7 258 274.7 298.2 304.6C311.2 314.3 328.7 314.3 341.7 304.6C381.9 274.6 463.9 205.7 463.9 141.3L463.9 138.9C463.9 97.5 430.4 64 389 64C365 64 342.4 75.5 328.3 95L320 106.7L311.6 95zM141.3 405.5L98.7 448L64 448C46.3 448 32 462.3 32 480L32 544C32 561.7 46.3 576 64 576L384.5 576C413.5 576 441.8 566.7 465.2 549.5L591.8 456.2C609.6 443.1 613.4 418.1 600.3 400.3C587.2 382.5 562.2 378.7 544.4 391.8L424.6 480L312 480C298.7 480 288 469.3 288 456C288 442.7 298.7 432 312 432L384 432C401.7 432 416 417.7 416 400C416 382.3 401.7 368 384 368L231.8 368C197.9 368 165.3 381.5 141.3 405.5z" />
                </svg>
              </button>
            )}
          </div>
        ),
      },
    ],
    [activeTab],
  );

  const followers = followersData?.getAstrologerFollowers?.data || [];
  const followerColumns = useMemo(
    () => [
      {
        header: "User",
        render: (row) => (
          <div className="flex flex-col">
            <Link
              href={`/Admindash/user/userprofile/${row.user.id}`}
              className="font-semibold text-violet-600 hover:underline"
            >
              {row.user.name || "N/A"}
            </Link>

            <span className="text-xs text-gray-500">
              {row.user.id.slice(0, 8)}
            </span>
          </div>
        ),
      },

      {
        header: "Mobile",
        render: (row) => row.user.mobile || "-",
      },

      {
        header: "Followed On",
        render: (row) => (
          <div className="text-xs">
            {dayjs(row.createdAt).format("DD MMM YYYY")}
            <p className="text-gray-500">
              {dayjs(row.createdAt).format("hh:mm A")}
            </p>
          </div>
        ),
      },

      {
        header: "Action",
        render: (row) => (
          <Link
            href={`/Admindash/user/userprofile/${row.user.id}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs"
          >
            View User
          </Link>
        ),
      },
    ],
    [],
  );
  const walletColumns = useMemo(
    () => [
      {
        header: " ID",
        render: (row) => (
          <div className="flex flex-col gap-1">
            <span
              className={`px-2 py- rounded-full text-xs font-semibold ${
                row.type === "CREDIT" ? " text-green-700" : " text-red-700"
              }`}
            >
              {row.sessionId?.trim()
                ? `Session : ${row.sessionId.slice(0, 8)}`
                : `TXN : ${row.id?.slice(0, 8)}`}
            </span>
          </div>
        ),
      },
      {
        header: "Type",
        render: (row) => (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              row.type === "CREDIT" ? " text-green-700" : " text-red-700"
            }`}
          >
            {row.type}
          </span>
        ),
      },
      {
        header: "Amount",
        render: (row) => `₹ ${row.amount ?? 0}`,
      },
      // {
      //   header: "Wallet Balance",
      //   render: (row) => `₹ ${row.updatedBalance ?? 0}`,
      // },

          {
        header: "Wallet",
        render: (row) => row.updatedBalance != null ? `₹${row.updatedBalance}` : "-",
      },
      
   
      {
        header: "Created At",
        render: (row) => dayjs(row.createdAt).format("DD MMM YYYY hh:mm A"),
      },   {
        header: "Description",
        render: (row) => row.description || "-",
      },
    ],
    [],
  );

  return (
    <div className="p-4 rounded-2xl flex flex-col gap-3 shadow-xl bg-white w-full">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <h2 className="font-semibold text-sm">Astrologer Activities</h2>

        <div className="flex gap-2">
          <CustomButton variant={"black"} className="text-xs px-4 py-2">
            Export
          </CustomButton>

          <CustomInput
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-2 py-1 placeholder:text-xs"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab("earnings")}
          className={`px-4 py-2 rounded-full text-sm ${
            activeTab === "earnings"
              ? "bg-purple-500 text-white"
              : "bg-gray-100"
          }`}
        >
          Insights
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2 rounded-full text-sm ${
            activeTab === "chat" ? "bg-purple-500 text-white" : "bg-gray-100"
          }`}
        >
          Chat
        </button>

        <button
          onClick={() => setActiveTab("call")}
          className={`px-4 py-2 rounded-full text-sm ${
            activeTab === "call" ? "bg-purple-500 text-white" : "bg-gray-100"
          }`}
        >
          Call
        </button>
        <button
          onClick={() => setActiveTab("followers")}
          className={`px-4 py-2 rounded-full text-sm ${
            activeTab === "followers"
              ? "bg-purple-500 text-white"
              : "bg-gray-100"
          }`}
        >
          Followers
        </button>
        <button
          onClick={() => setActiveTab("wallet")}
          className={`px-4 py-2 rounded-full text-sm ${
            activeTab === "wallet" ? "bg-purple-500 text-white" : "bg-gray-100"
          }`}
        >
          Wallet
        </button>
      </div>

      {activeTab === "earnings" && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-purple-100 p-4 rounded-xl">
            <p className="text-xs">Wallet Balance</p>

            <h3 className="text-xl font-bold">₹ {stats?.walletBalance || 0}</h3>
          </div>

          <div className="bg-green-100 p-4 rounded-xl">
            <p className="text-xs">Total Earned</p>

            <h3 className="text-xl font-bold">₹ {stats?.totalEarned || 0}</h3>
          </div>


          <div className="bg-blue-100 p-4 rounded-xl">
            <p className="text-xs">Total Chats</p>

            <h3 className="text-xl font-bold">{stats?.totalChats || 0}</h3>
          </div>

          <div className="bg-yellow-100 p-4 rounded-xl">
            <p className="text-xs">Total Calls</p>

            <h3 className="text-xl font-bold">{stats?.totalCalls || 0}</h3>
          </div>

          <div className="bg-pink-100 p-4 rounded-xl">
            <p className="text-xs">Rating</p>
            <h3 className="text-xl font-bold">
              {Number(stats?.averageRating || 0).toFixed(1)}
            </h3>
          </div>
        </div>
      )}

      {activeTab === "chat" &&
        (chatLoading ? (
          <p>Loading chat history...</p>
        ) : (
          <>
            <DataTable
              columns={historyColumns}
              data={chats}
              startIndex={(chatPage - 1) * LIMIT}
            />

            <Pagination
              page={chatPage}
              totalPages={chatPagination?.totalPages || 1}
              onPrevious={() => setChatPage((p) => p - 1)}
              onNext={() => setChatPage((p) => p + 1)}
            />
          </>
        ))}

      {activeTab === "call" &&
        (callLoading ? (
          <p>Loading call history...</p>
        ) : (
          <>
            <DataTable
              columns={historyColumns}
              data={calls}
              startIndex={(callPage - 1) * LIMIT}
            />

            <Pagination
              page={callPage}
              totalPages={callPagination?.totalPages || 1}
              onPrevious={() => setCallPage((p) => p - 1)}
              onNext={() => setCallPage((p) => p + 1)}
            />
          </>
        ))}

      {activeTab === "followers" &&
        (followersLoading ? (
          <p>Loading followers...</p>
        ) : (
          <>
            <DataTable
              columns={followerColumns}
              data={followers}
              startIndex={(followersPage - 1) * LIMIT}
            />

            <Pagination
              page={followersPage}
              totalPages={followersPagination?.totalPages || 1}
              onPrevious={() => setFollowersPage((p) => p - 1)}
              onNext={() => setFollowersPage((p) => p + 1)}
            />
          </>
        ))}
      {activeTab === "wallet" &&
        (walletLoading ? (
          <p>Loading Astrologer Wallet...</p>
        ) : (
          <>
            <DataTable
              columns={walletColumns}
              data={wallet}
              startIndex={(walletPage - 1) * LIMIT}
            />

            <Pagination
              page={walletPage}
              totalPages={walletPagination?.totalPages || 1}
              onPrevious={() => setWalletPage((p) => p - 1)}
              onNext={() => setWalletPage((p) => p + 1)}
            />
          </>
        ))}

      <SessionMessagesModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        sessionId={selectedSession}
      />
      <SessionRemedyModal
        open={openRemedyModal}
        onClose={() => setOpenRemedyModal(false)}
        sessionId={selectedSession}
      />
    </div>
  );
}
