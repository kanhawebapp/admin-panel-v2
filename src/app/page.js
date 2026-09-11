"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import client, { authTokenVar } from "@/components/utils/apolloClient";
import SocketContext from "@/context/socketContext";

const LOGIN_STAFF = gql`
  mutation LoginStaff($email: String!, $password: String!) {
    loginStaff(email: $email, password: $password) {
      accessToken
      refreshToken
      user {
        id
        name
        email
        role {
          name
        }
      }
    }
  }
`;

export default function StaffLogin() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const { connectSocket } = useContext(SocketContext);
  const [loginStaff, { loading }] = useMutation(LOGIN_STAFF, {
    onCompleted: async (data) => {
      console.log("Login Response:", data);

      const { accessToken, refreshToken, user } = data.loginStaff;

      console.log("Access Token:", accessToken);
      console.log("Refresh Token:", refreshToken);
      console.log("User:", user);

      authTokenVar(accessToken);

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("LocalStorage Token:", localStorage.getItem("token"));
  document.cookie = `token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      connectSocket({
        adminId: user.id,
        token: accessToken,
      });

      toast.success(`Welcome ${user.name}`);
     const tokentoekn = localStorage.getItem("token");
      await client.resetStore();
      if(tokentoekn ){
        console.log("qwertyuiokjhgfdsdcvbhjgfdsasdfghjhgfd");
        
        router.push("/Admindash")
      }
      
    },
    onError: (err) => {
      toast.error(err.message || "Login failed");
    },
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    const { email, password } = form;

    if (!email) return toast.error("Email is required");
    if (!password) return toast.error("Password is required");

    await loginStaff({
      variables: { email, password },
    });
  };
  // onCompleted: async (data) => {
  //   const { accessToken, user } = data.loginStaff;

  //   authTokenVar(accessToken);

  //   localStorage.setItem("token", accessToken);
  //   localStorage.setItem("user", JSON.stringify(user));

  //   connectSocket({
  //     adminId: user.id,
  //     token: accessToken,
  //   });

  //   toast.success(`Welcome ${user.name}`);

  //   await client.resetStore();

  //   router.push("/Admindash");
  // };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0b0f] relative overflow-hidden">
      <div className="absolute w-[800px] h-[800px] bg-purple-600 opacity-20 blur-3xl rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[500px] h-[500px] bg-blue-500 opacity-20 blur-3xl rounded-full bottom-[-100px] right-[-100px]" />

      <div
        className="relative z-10 w-full max-w-md p-8 rounded-3xl 
        bg-black/5 backdrop-blur-xl border border-white/20
        shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]
      "
      >
        <Image
          src="/admin-img/adlogo.png"
          alt="logo"
          width={120}
          height={120}
          className="mx-auto mb-4 drop-shadow-lg"
        />

        <h2 className="text-2xl font-bold text-center text-white mb-6 tracking-wide">
          Admin Login
        </h2>

        <div className="space-y-5 flex flex-col items-center w-full">
          <div className="w-full">
            <label className="text-sm text-gray-300">Email</label>
            <input
              name="email"
              type="email"
              placeholder="admin@dhwaniastro.com"
              value={form.email}
              onChange={handleChange}
              className="mt-2 w-full px-4 py-3 rounded-full
              bg-white/10 text-white placeholder-gray-400
              border border-white/20 
              focus:outline-none focus:ring-2 focus:ring-purple-500
              shadow-inner"
            />
          </div>

          <div className="relative w-full">
            <label className="text-sm text-gray-300">Password</label>

            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              className="mt-2 w-full px-4 py-3 rounded-full 
              bg-white/10 text-white placeholder-gray-400
              border border-white/20 
              focus:outline-none focus:ring-2 focus:ring-purple-500
              shadow-inner"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-[50px] text-xs text-purple-500 hover:text-purple-400"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-[60%] py-3 rounded-full font-semibold text-white cursor-pointer
            bg-linear-to-r from-purple-600 to-blue-500
            hover:scale-[1.02] transition-all duration-200
            shadow-[0_0_20px_rgba(168,85,247,0.6)]
            active:scale-[0.98]
            disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login In"}
          </button>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          Secure Admin Access • Dhwani Astro
        </p>
      </div>
    </div>
  );
}
