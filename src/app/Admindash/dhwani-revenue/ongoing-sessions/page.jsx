"use client";

import { useQuery } from "@apollo/client/react";
import dayjs from "dayjs";
import { GET_SESSION_ANALYTICS } from "@/app/graphQL/astroHiring";
import SocketContext from "@/context/socketContext";
import { useContext, useEffect, useRef, useState } from "react";
import ConfirmModal from "@/components/Custom/ConfirmModal";

export default function OngoingSessions() {
  const chatEndedRef = useRef(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const { data, loading, error } = useQuery(GET_SESSION_ANALYTICS, {
    variables: {
      status: "ONGOING",
      filter: "MONTH",
    },
    fetchPolicy: "network-only",
  });

  const { socket, connectSocket } = useContext(SocketContext);

  useEffect(() => {
    if (!socket) {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found");
        return;
      }

      connectSocket({ token });
    }
  }, [socket, connectSocket]);

  // End button click -> only open modal
  const handleEndClick = (item) => {
    setSelectedSession(item);
    setShowConfirmModal(true);
  };

  // Confirm button -> actually end session
  const handleEndSession = () => {
    if (!selectedSession) return;

    const item = selectedSession;


    if (chatEndedRef.current) {
      return;
    }

    if (!socket) {
      console.log("Socket not available");
      return;
    }

    const payload = {
      room_id: item.roomId,
      astroId: item.astrologerId,
      userId: item.userId,
      sessionId: item.sessionId,
      type: item.type,
    };

    const eventName =
      item.type === "CHAT"
        ? "chatCompletedByAdmin"
        : item.type === "CALL"
          ? "callCompletedByAdmin"
          : null;

    if (!eventName) {
      console.error("Invalid session type:", item.type);
      return;
    }


    socket.emit(eventName, payload);


    // Prevent duplicate end
    chatEndedRef.current = true;

    // Close modal
    setShowConfirmModal(false);
    setSelectedSession(null);

    // Refresh page
    window.location.reload();
  };

  const sessions = data?.getSessionAnalytics?.recentSessions || [];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow">
        Loading ongoing sessions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 rounded-2xl p-5">
        {error.message}
      </div>
    );
  }
const formatStartedAt = (startedAt) => {
  if (!startedAt) return "-";

  return dayjs(startedAt).format("D MMMM, YYYY, hh:mm A");
};
  const getDuration = (startedAt) => {
    if (!startedAt) return "-";

    const diff = dayjs().diff(dayjs(startedAt), "second");

    const hrs = Math.floor(diff / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    const secs = diff % 60;

    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }

    return `${mins}m ${secs}s`;
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-[#2c0a4d]">
            Ongoing Sessions
          </h2>

          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
            {sessions.length} Active
          </span>
        </div>

        {sessions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No ongoing sessions found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-purple-50 text-[#2c0a4d]">
                  <th className="text-left p-3">User</th>
                                   


                  <th>Type</th>
                  <th className="text-left p-3">Session</th>
                  <th className="text-left p-3">Rate/Min</th>
                  <th className="text-left p-3">Info</th>
                  <th className="text-left p-3">Duration</th>
                  <th className="text-left p-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {sessions.map((item) => (
                  <tr
                    key={item.sessionId}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-3 font-medium">{item.userName || "-"}</td>

                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.type === "CHAT"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>

                    <td className="p-3 text-xs">
                      {item.roomId?.slice(0, 8) || "-"}
                    </td>

                    <td className="p-3">₹{item.ratePerMin || 0}/min</td>

                  <td className="p-3">
  <div className="text-xs text-gray-800">
    {item.astroName || "-"}
  </div>

  <div className="text-[10px] text-gray-500 mt-1">
    {formatStartedAt(item.startedAt)}
  </div>
</td>

                    <td className="p-3 font-medium text-orange-600">
                      {getDuration(item.startedAt)}
                    </td>

                    <td className="p-3">
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                        onClick={() => handleEndClick(item)}
                      >
                        End
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        open={showConfirmModal}
        onCancel={() => {
          setShowConfirmModal(false);
          setSelectedSession(null);
        }}
        onConfirm={handleEndSession}
      />
    </>
  );
}
