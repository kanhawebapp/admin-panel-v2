"use client";

import {
  GET_ALL_WAITING_QUEUES,
  GET_ASTROLOGER_WAITING_USERS,
} from "@/app/graphQL/astroHiring";
import ConfirmModal from "@/components/Custom/ConfirmModal";
import SocketContext from "@/context/socketContext";
import { useQuery } from "@apollo/client/react";
import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { BsPersonCircle } from "react-icons/bs";
import { FiClock } from "react-icons/fi";
import { MdChat } from "react-icons/md";

export default function WaitingQueue({ astrologerId }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const { data, loading, error, refetch } = useQuery(GET_ALL_WAITING_QUEUES, {
    fetchPolicy: "network-only",
  });
  const chatEndedRef = useRef(false);
  const queues = data?.getAllWaitingQueues || [];

  const hasWaitingUsers = queues.some(
    (astro) => astro.waitingUsers?.length > 0,
  );
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
  }, [socket]);
  const handleEndClick = (item) => {
    setSelectedItem(item);
    setShowConfirmModal(true);
  };
  const handleEndSession = async () => {
    if (!selectedItem) return;

    const item = selectedItem;


    if (chatEndedRef.current) {
      console.log("Session already ended");
      return;
    }

    if (!socket) {
      toast.error("Socket connection not available");
      return;
    }

    const payload = {
      room_id: item.roomId,
      astroid: item.astrologerId,
      user_id: item.userId,
      type: item.type,
    };

    const eventName =
      item.type === "chat" || item.type === "call"
        ? "cancel_chat_request_by_admin"
        : null;

    if (!eventName) {
      console.error("Invalid session type:", item.type);
      return;
    }


    socket.emit(eventName, payload);


    // Close modal
    setShowConfirmModal(false);
    setSelectedItem(null);

    // Refresh queue data
    await refetch();

    toast.success(`${item.type} request successfully removed`);
  };

  return (
    <div className="space-y-6">
      {!hasWaitingUsers ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16">
          <BsPersonCircle className="mb-4 text-6xl text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-700">
            No Waiting Requests
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            There are currently no users waiting to connect with an astrologer.
          </p>
        </div>
      ) : (
        queues.map((astro) => (
          <div
            key={astro.astrologerId}
            className="rounded-xl border border-gray-300 bg-white shadow"
          >
            <div className="flex items-center justify-between border-b p-3">
              <div className="flex items-center gap-4">
                <img
                  src={`https://dhwaniastro.com${astro.astrologerProfilePic}`}
                  className="h-10 w-10 rounded-full"
                  alt={astro.astrologerName}
                />

                <div>
                  <h2 className="font-semibold text-sm">
                    {astro.astrologerName}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Waiting : {astro.waitingCount}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    astro.isOnline
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {astro.isOnline ? "Online" : "Offline"}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    astro.isBusy
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {astro.isBusy ? "Busy" : "Free"}
                </span>
              </div>
            </div>

            <div className="divide-y">
              {astro.waitingUsers.map((user, index) => (
                <div
                  key={user.roomId}
                  className="flex items-center justify-between p-2"
                >
                  <div>
                    <div className="font-medium text-xs">
                      #{index} {user.name} (UserId: {user.userId})
                    </div>
                  </div>

                  <div className="flex items-center text-xs gap-6">
                    <div>{user.type}</div>
                    <div>{user.maximumTime} Min</div>
                    <button
                      // disabled={index === 0}
                      className={`px-4 py-1 rounded-full text-xs text-white ${
                        index === 0
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                      onClick={() =>
                        handleEndClick({
                          ...user,
                          astrologerId: astro.astrologerId,
                        })
                      }
                    >
                      End
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
      <ConfirmModal
        open={showConfirmModal}
        onCancel={() => {
          setShowConfirmModal(false);
          setSelectedItem(null);
        }}
        onConfirm={handleEndSession}
      />
    </div>
  );
}
