"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PiChatTeardropTextFill } from "react-icons/pi";
import { IoNotifications } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { logout } from "../../app/redux/slices/loginSlice";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import CustomButton from "../Custom/CustomButtom";
import cookieHelper from "@/app/helper/cookieHelper";

export default function Header() {
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const [isNotifMenuOpen, setNotifMenuOpen] = useState(false);
  const [isPricingOpen, setPricing] = useState(false);
const [user, setUser] = useState(null);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = () => {
    cookieHelper.remove();
  localStorage.removeItem("user");

    dispatch(logout());

    router.push("/");
  };
useEffect(() => {
  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    try {
      setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error("Invalid user data in localStorage", error);
    }
  }
}, []);
  

  return (
    <header className="fixed top-0 z-100 w-full left-0 flex h-14 items-center justify-between px-6 py-1 bg-[#2f1254] shadow-md">
      <div className="flex items-center gap-2">
        <Link href="/Admindash">
          <div className="flex items-center gap-2">
            <Image
              src="/admin-img/adlogo.png"
              alt="logo"
              width={140}
              height={140}
            />
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2 border rounded-full px-3 py-2 w-100 shadow-lg bg-gray-100">
        <input
          type="search"
          placeholder="Enter something to search..."
          className="bg-transparent outline-none flex-1 text-sm placeholder:text-gray-400  text-gray-800"
        />
        <Image
          src="/admin-img/search.png"
          alt="search"
          width={18}
          height={18}
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 relative rounded-full bg-[#ffffff1d] px-3 py-2 border border-[#ffffff36]">
          <button onClick={() => setNotifMenuOpen(!isNotifMenuOpen)}>
            <PiChatTeardropTextFill className="text-2xl text-white" />
          </button>
          <button onClick={() => setPricing(!isPricingOpen)}>
            <IoNotifications className="text-2xl text-white" />
          </button>

          {isNotifMenuOpen && (
            <div className="absolute right-0 top-8 w-48 bg-white border rounded-lg shadow-md">
              <p className="px-4 py-2 text-sm text-gray-600">No new messages</p>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center cursor-pointer gap-2"
          >
            <div className="text-right text-white">
              <h4 className="text-sm font-semibold">USER</h4>
              <span className="text-xs ">{user?.name}</span>
            </div>
            <Image
              src="/admin-img/man.png"
              alt="Admin"
              width={35}
              height={35}
              className="rounded-full"
            />
          </button>
          {isUserMenuOpen && (
            <div className="absolute text-black right-0 mt-2 w-30 bg-purple-200 border border-gray-200  overflow-hidden rounded-xl shadow-md">
              <Link
                href="/Admindash/astroprofile"
                className="block px-4 text-center py-2 text-sm hover:bg-purple-500 hover:text-yellow-400"
              >
                Profile
              </Link>
              <Link
                href="#"
                className="block px-4 py-2  text-center text-sm hover:bg-purple-500 hover:text-yellow-400"
              >
                Settings
              </Link>
              <CustomButton
                onClick={handleLogout}
                className="block w-full bg-purple-800 text-yellow-400 text-center rounded-t-xl  px-4 py-2 text-sm hover:bg-yellow-400 hover:text-purple-800"
              >
                Logout
              </CustomButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
