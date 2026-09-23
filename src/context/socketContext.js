"use client";

import { createContext, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  const connectSocket = ({ token }) => {
    if (socket?.connected) return socket;

    const socketUrl = process.env.NEXT_PUBLIC_WEB_SOCKET_URL;

    const socketInstance = io(socketUrl, {
      path: "/user-socket-service-v2/socket.io",
      transports: ["websocket", "polling"],
      withCredentials: true,

      auth: {
        token,
      },
    });

    socketInstance.on("connect", () => {
      console.log("Socket Connected:", socketInstance.id);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    setSocket(socketInstance);

    return socketInstance;
  };

  const disconnectSocket = () => {
    socket?.disconnect();
    setSocket(null);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connectSocket,
        disconnectSocket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;