"use client";

import AlertLoading from "@/app/common/AlertLoading";
import Skenton from "@/app/common/Skenton";
import {
  GET_ASTROLOGER_BY_ID,
  GET_ASTROLOGER_DASHBOARD_STATS,
  GET_ASTROLOGER_FOLLOWERS,
  GET_ASTROLOGER_GIFT_HISTORY,
  GET_ASTROLOGER_REVIEWS,
  MANAGE_ASTROLOGER_WALLET,
  UPDATE_AVAILABILITY,
} from "@/app/graphQL/astroHiring";
import { formatDate } from "@/app/helper/helper";
import CustomButton from "@/components/Custom/CustomButtom";
import CustomInput from "@/components/Custom/CustomInput";
import CustomToggle from "@/components/Custom/CustomToggle";
import { useMutation, useQuery } from "@apollo/client/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { FaStar } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import AstrologerActivities from "../../AstrologerActivities";
import Link from "next/link";
import SessionMessagesModal from "@/app/Admindash/user/SessionModal";
import dayjs from "dayjs";
import { usePermissions } from "@/context/PermissionContext";
export default function Page() {
  const { can, isSuperAdmin } = usePermissions();

const canViewProfile =
  isSuperAdmin || can("astroprofile", "view");
  const [activeTab, setActiveTab] = useState("call");
  const [openPopup, setOpenPopUp] = useState(false);
  const dispatch = useDispatch();
  const params = useParams();
  const astrologerId = params?.id;
  const [previewImage, setPreviewImage] = useState(null);
  const [price, setPrice] = useState("");
  const [remarks, setRemarks] = useState("");
  const { data, loading, error } = useQuery(GET_ASTROLOGER_BY_ID, {
    variables: {
      id: astrologerId,
    },
    skip: !astrologerId,
  });
  const [openModal, setOpenModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const openWallet = () => {
    setOpenPopUp(true);
  };

  const astrologerprofile = useMemo(() => {
    return data?.getAstrologerById;
  }, [data]);

  const address = astrologerprofile?.addresses?.[0];

  const callPricing = astrologerprofile?.pricing?.find(
    (item) => item.type === "CALL",
  );

  const chatPricing = astrologerprofile?.pricing?.find(
    (item) => item.type === "CHAT",
  );
    const giftPricing = astrologerprofile?.pricing?.find(
    (item) => item.type === "GIFT_COMMISSION",
  );
  const {
    data: reviewData,
    loading: reviewLoading,
    refetch: refetchReviews,
  } = useQuery(GET_ASTROLOGER_REVIEWS, {
    variables: {
      astrologerId,
    },
    skip: !astrologerId,
  });
  const reviews = reviewData?.getAstrologerReviews || [];

  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
  } = useQuery(GET_ASTROLOGER_DASHBOARD_STATS, {
    variables: {
      astrologerId,
    },
    skip: !astrologerId,
  });
  const dashboardStats = statsData?.getAstrologerDashboardStats;
  useEffect(() => {
    console.log("Dashboard Stats", dashboardStats);
  }, [dashboardStats]);
  const [availability, setAvailability] = useState({
    call: false,
    chat: false,
    live: false,
    online: false,
    promotional: false,
  });

  const [manageWallet, { loading: walletLoading }] = useMutation(
    MANAGE_ASTROLOGER_WALLET,
    {
      refetchQueries: [
        {
          query: GET_ASTROLOGER_DASHBOARD_STATS,
          variables: { astrologerId },
        },
      ],
      awaitRefetchQueries: true,
    },
  );

  const Manageprice = async (action) => {
    if (!price || Number(price) <= 0) {
      return toast.error("Enter valid amount");
    }

    try {
      const { data } = await manageWallet({
        variables: {
          astrologerId,
          amount: Number(price),
          remarks,
          type: action === "add" ? "CREDIT" : "DEBIT",
        },
      });

      toast.success(data.manageAstrologerWallet.message);

      setOpenPopUp(false);
      setPrice("");
      setRemarks("");
    } catch (err) {
      toast.error(err.message);
    }
  };
  const { data: giftData, loading: giftLoading } = useQuery(
    GET_ASTROLOGER_GIFT_HISTORY,
    {
      variables: {
        astrologerId,
        page: 1,
        limit: 50,
      },
      skip: !astrologerId,
    },
  );

  const gifts = giftData?.getSendGiftHistory?.data || [];

  const [updateAvailability, { loading: availabilityLoading }] =
    useMutation(UPDATE_AVAILABILITY);
  useEffect(() => {
    if (!astrologerprofile) return;

    setAvailability({
      call: astrologerprofile.isCallActive ?? false,

      chat: astrologerprofile.isChatActive ?? false,

      live: astrologerprofile.isLiveActive ?? false,

      online: astrologerprofile.isOnline ?? false,

      promotional: astrologerprofile.isPromotional ?? false,
    });
  }, [astrologerprofile]);

  const handleAvailabilityChange = async (field, value) => {
    try {
      setAvailability((prev) => ({
        ...prev,
        [field]: value,
      }));

      const variables = {
        astrologerId,
        ...(field === "chat" && {
          isChatActive: value,
        }),

        ...(field === "call" && {
          isCallActive: value,
        }),

        ...(field === "live" && {
          isLiveActive: value,
        }),
        ...(field === "promotional" && {
          isPromotional: value,
        }),
      };

      await updateAvailability({
        variables,
      });

      toast.success("Updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed");
    }
  };

  if (error) {
    return (
      <div className="p-5 text-red-500">Failed to load astrologer profile</div>
    );
  }

  const review = [
    { id: 1, name: "Call", rate: "4.21", num: "106" },
    { id: 2, name: "Chat", rate: "4.50", num: "156" },
    { id: 3, name: "Video", rate: "3.10", num: "200" },
  ];

  const stats = [
    {
      id: 1,
      label: "Wallet Balance",
      amount: dashboardStats?.walletBalance || 0,
      prefix: "₹",
    },

    {
      id: 2,
      label: "Total Earnings",
      amount: dashboardStats?.totalEarned || 0,
      prefix: "₹",
    },

    {
      id: 3,
      label: "Total Calls",
      amount: dashboardStats?.totalCalls || 0,
      prefix: "",
    },

    {
      id: 4,
      label: "Total Chats",
      amount: dashboardStats?.totalChats || 0,
      prefix: "",
    },

    {
      id: 5,
      label: "Followers",
      amount: dashboardStats?.totalFollowers || 0,
      prefix: "",
    },

    {
      id: 6,
      label: "Rating",
      amount: dashboardStats?.averageRating || 0,
      prefix: "",
    },
  ];
  if (loading || statsLoading) {
    return <Skenton />;
  }
  if (!canViewProfile) {
  return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-bold">
        Access Denied
      </h2>
      <p className="text-gray-500">
        You don't have permission to view this profile.
      </p>
    </div>
  );
}
  return (
    <div className="min-h-screen w-full  flex flex-col gap-2">
      <div className="shadow-md rounded-xl p-3 bg-purple-200 mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-purple-900">
          Astrologer Profile
        </h2>
        <CustomButton
          variant={"gray"}
          className="px-3 py-1"
          onClick={openWallet}
        >
          Manage Wallet
        </CustomButton>
      </div>
      {/* <AlertLoading show={accountloading} title="Please Wait..." /> */}
      {openPopup && (
        <div className="fixed inset-0 bg-[#00000062] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold mb-4 text-purple-700">
                Manage Wallet
              </h3>

              <button
                onClick={() => setOpenPopUp(false)}
                className=" text-lg justify-start self-start text-gray-500 hover:text-gray-700 "
              >
                <MdCancel />
              </button>
            </div>
            <div className="flex flex-col gap-3 mb-5">
              <CustomInput
                type="text"
                placeholder="Enter Amount"
                className="  px-3 py-2 text-sm w-full"
                onChange={(e) => setPrice(e.target.value)}
              />

              <textarea
                className="px-3 w-full border border-gray-300 rounded-xl"
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Remarks"
              ></textarea>
            </div>

            <div className="flex justify-center gap-3">
              <CustomButton
                variant="green"
                className="px-3 py-1"
                loading={walletLoading}
                onClick={() => Manageprice("add")}
              >
                Add Gems
              </CustomButton>
              <CustomButton
                variant="red"
                className="px-3 py-1"
                loading={walletLoading}
                onClick={() => Manageprice("deduct")}
              >
                Deduct Gems
              </CustomButton>
            </div>
          </div>
        </div>
      )}

      <div className="grid w-full grid-cols-8 gap-4">
        <div className="col-span-2 min-w-0  bg-white rounded-lg p-4 flex flex-col gap-2">
          <div className="flex justify-between items-center bg-purple-200 p-2 rounded-full shadow px-4">
            <h5 className="text-sm font-bold">Astrologers Details</h5>
            <Link
              href={`/Admindash/astrologer/edit-astrologer/${astrologerprofile?.id}`}
              variant={"black"}
              className="text-xs bg-black rounded-full px-3 py-1 text-white"
            >
              Edit
            </Link>
          </div>

          <div className="flex w-full flex-col py-2 px-4">
            <div className="flex items-center gap-4">
              <div className="">
                <Image
                  src={`https://dhwaniastro.com${astrologerprofile?.profilePic}`}
                  alt="Profile"
                  width={150}
                  height={150}
                  unoptimized
                  className="rounded-full object-cover"
                />
              </div>

              <div className="flex flex-col ml-5 gap-1">
                <span className="font-bold text-gray-800">
                  {astrologerprofile?.displayName || astrologerprofile?.name}
                </span>
                <small className="font-semibold text-gray-600  break-words">
                  Astrologer ID : {astrologerprofile?.id?.slice(0,8)}
                </small>
              </div>
            </div>

            <div className="flex flex-col gap-2  py-3">
              <div className="flex justify-between items-center">
                <div className="font-semibold text-sm">Email:</div>
                <div className="text-sm">{astrologerprofile?.email}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="font-semibold text-sm">Ranking:</div>
                <div className="text-sm">{astrologerprofile?.tags}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="font-semibold text-sm">Mobile:</div>
                <div className="text-sm">{astrologerprofile?.contactNo}</div>
              </div>
         <div className="flex justify-between items-start">
  <div className="font-semibold text-sm">Address:</div>

  <div className="text-sm text-right max-w-[220px] break-all">
    {[address?.street, address?.city, address?.state, address?.country]
      .filter(Boolean)
      .join(", ")}
  </div>
</div>
              <div className="flex justify-between items-center">
                <div className="font-semibold text-sm">Experience:</div>

                <div className="text-sm">
                  {astrologerprofile?.experience} Years
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="font-semibold text-sm">Gender:</div>

                <div className="text-sm">{astrologerprofile?.gender}</div>
              </div>
         <div className="flex justify-between items-start">
  <div className="font-semibold text-sm">Languages:</div>

  <div className="text-sm text-right max-w-[220px] break-words">
    {Array.isArray(astrologerprofile?.languages)
      ? astrologerprofile.languages.join(", ")
      : astrologerprofile?.languages}
  </div>
</div>
          <div className="flex justify-between items-start">
  <div className="font-semibold text-sm">Skills:</div>

  <div className="text-sm text-right max-w-[220px] break-words">
    {Array.isArray(astrologerprofile?.skills)
      ? astrologerprofile.skills.join(", ")
      : astrologerprofile?.skills}
  </div>
</div>
              <div className="mt-4">
                <h6 className="font-semibold mb-2">About</h6>

                <div
                  className=" text-xs max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{
                    __html: astrologerprofile?.about || "",
                  }}
                />
              </div>
              <div className="flex text-xs justify-between items-center">
                <div className="font-semibold text-sm  ">Joined From:</div>
                <p>
                  {dayjs(astrologerprofile.createdAt).format(
                    "DD MMM YYYY hh:mm A",
                  )}
                </p>
              </div>
            </div>
            <hr className="text-gray-300" />

            <div className="flex flex-col gap-2 py-3">
              <div className="flex items-center justify-between">
                <h6 className="text-sm font-semibold">Online Availability:</h6>
                <div className="flex items-center gap-3">
                  {/* <CustomButton
                    variant={"black"}
                    onClick={() => alert("Edit clicked")}
                    className="px-2 py-[2px] text-[10px] transition"
                  >
                    Edit
                  </CustomButton> */}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Call
                </label>
                <div className="flex items-center gap-5">
                  <label className="text-sm font-semibold text-gray-700">
                    ₹ {callPricing?.price || callPricing?.price || 0}
                  </label>
                  <CustomToggle
                    id="call"
                    checked={availability.call}
                    disabled={!astrologerprofile?.isEligibleCall}
                    onChange={(val) => handleAvailabilityChange("call", val)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Chat
                </label>
                <div className="flex items-center gap-5">
                  <label className="text-sm font-semibold text-gray-700">
                    ₹ {chatPricing?.price || chatPricing?.price || 0}
                  </label>
                  <CustomToggle
                    id="chat"
                    checked={availability.chat}
                    disabled={!astrologerprofile?.isEligibleChat}
                    onChange={(val) => handleAvailabilityChange("chat", val)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Live
                </label>

                <CustomToggle
                  id="live"
                  checked={availability.live}
                  onChange={(val) => handleAvailabilityChange("live", val)}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Promotional
                </label>

                <CustomToggle
                  id="promotional"
                  checked={availability.promotional}
                  onChange={(val) =>
                    handleAvailabilityChange("promotional", val)
                  }
                />
              </div>
              <div>
                <h3>Commission Percentage</h3>
           
              <div className="grid grid-cols-2 gap-3 text-xs ">
                <div className="flex items-center gap-2">
                  <h2>Chat : </h2>
                  <span> {chatPricing?.commissionPercent  || 0} %</span>
                </div>
                   <div className="flex items-center gap-2">
                  <h2>Call :</h2>
                  <span> {callPricing?.commissionPercent  || 0} %</span>
                </div>
                 <div className="flex items-center gap-2">
                  <h2>Gift : </h2>
                  <span> {giftPricing?.commissionPercent  || 0} %</span>
                </div>
              </div>
                 </div>
            </div>

            <hr className="text-gray-300" />

            <div className="flex flex-col gap-3 py-3">
              <h6 className="text-sm font-semibold">Astrologer Documents:</h6>

              <div className="flex flex-wrap gap-4">
                {[
                  {
                    label: "Aadhaar",
                    image: astrologerprofile?.kycDetail?.aadhaarImage,
                  },
                  {
                    label: "PAN Card",
                    image: astrologerprofile?.kycDetail?.panImage,
                  },
                  {
                    label: "Passbook",
                    image: astrologerprofile?.kycDetail?.passbookImage,
                  },
                ].map((doc) =>
                  doc.image ? (
                    <div
                      key={doc.label}
                      className="group relative overflow-hidden rounded-lg border border-purple-100 shadow-xl"
                    >
                      <Image
                        height={100}
                        width={100}
                        src={`https://dhwaniastro.com${doc.image}`}
                        alt={doc.label}
                        unoptimized
                        className="h-24 w-24 object-cover rounded-md"
                      />

                      {/* Overlay */}
                      <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center bg-black/60 py-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <button
                          onClick={() =>
                            setPreviewImage(
                              `https://dhwaniastro.com${doc.image}`,
                            )
                          }
                          className="rounded-full bg-gray-800 text-white  px-3 py-0 text-xs"
                        >
                          View
                        </button>
                      </div>

                      <p className="py-1 text-center text-xs">{doc.label}</p>
                    </div>
                  ) : null,
                )}
              </div>
            </div>

            {previewImage && (
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
                onClick={() => setPreviewImage(null)}
              >
                <div className="relative max-h-[90vh] max-w-[90vw]">
                  <button
                    onClick={() => setPreviewImage(null)}
                    className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black"
                  >
                    ✕
                  </button>

                  <Image
                    height={100}
                    width={100}
                    src={previewImage}
                    alt="Preview"
                    className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
                  />
                </div>
              </div>
            )}

            <hr className="text-gray-300" />

            <div className="flex flex-col gap-2 py-3">
              <h6 className="text-sm font-semibold">Astrologer Reviews :</h6>
              <div className="space-y-3">
                {review.map((item) => {
                  const rateValue = parseFloat(item.rate);
                  const color =
                    rateValue < 3.5 ? "text-red-500" : "text-green-500";

                  return (
                    <div
                      key={item.id}
                      className="flex px-4 items-center gap-3 justify-between p-2 border border-gray-50  rounded-full shadow hover:bg-gray-50 transition"
                    >
                      <span className="font-medium text-sm">{item.name}</span>
                      <div className="flex text-sm items-center gap-2">
                        <span className={`font-semibold ${color}`}>
                          {item.rate}
                        </span>
                        <FaStar className={`${color}`} />
                        <span className="text-gray-500 text-sm">
                          ({item.num})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div
          className="w-full bg-white rounded-lg p-4 flex flex-col gap-5"
          style={{ gridColumn: "span 6 / span 6" }}
        >
          <AstrologerActivities astrologerId={astrologerId} />

          <div
            className=" rounded-xl border border-purple-100  shadow-2xl mt-6 p-5 flex flex-col"
            style={{ maxHeight: "500px" }}
          >
            <h2 className="text-lg font-semibold mb-5 flex-shrink-0">
              User Reviews ({reviews.length})
            </h2>

            {reviewLoading ? (
              <p>Loading...</p>
            ) : reviews.length === 0 ? (
              <p className="text-gray-500">No reviews found.</p>
            ) : (
              <div className="grid grid-cols-2 gap-5 overflow-y-auto pr-2 space-y-2">
                {reviews.map((review) => (
                  <div
                    key={review.reviewId}
                    className="border border-purple-100  shadow-2xl bg-violet-100 rounded-xl p-2 shadow-sm"
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="flex items-center gap-5">
                          <Link
                            href={`/Admindash/user/userprofile/${review.userId}`}
                            className="font-semibold text-violet-600 hover:underline"
                          >
                            {review.userName}
                          </Link>{" "}
                          <button
                            onClick={() => {
                              setSelectedSession(review.sessionId);
                              setOpenModal(true);
                            }}
                            className="text-white rounded-full text-xs"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height={18}
                              width={18}
                              viewBox="0 0 640 640"
                            >
                              <path d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z" />
                            </svg>
                          </button>
                        </div>

                        <p className="text-xs text-gray-500">
                          {dayjs(Number(review.createdAt)).format(
                            "DD MMM YYYY hh:mm A",
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-500" />
                        <span className="font-semibold">{review.rating}</span>
                      </div>
                    </div>

                    <p className="mt-1 text-gray-700">
                      {review.comment || "No comment"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-purple-100 shadow-2xl mt-6 p-5">
            <h2 className="text-lg font-semibold mb-5">
              Gift History ({gifts.length})
            </h2>

            {giftLoading ? (
              <p>Loading...</p>
            ) : gifts.length === 0 ? (
              <p className="text-gray-500">No gifts found.</p>
            ) : (
              <div className="max-h-[500px] overflow-y-auto grid grid-cols-2 gap-8 space-y-4 pr-2">
                {gifts.map((gift) => (
                  <div
                    key={gift.id}
                    className="border border-violet-200 rounded-lg p-4 shadow-xl"
                  >
                    <div className="flex justify-between">
                      {/* Left */}
                      <div className="flex gap-4">
                        <img
                          src={`https://dhwaniastro.com${gift.gift?.image}`}
                          alt={gift.giftName}
                          className="w-14 h-14 rounded-lg object-cover "
                        />

                        <div>
                          <h3 className="font-semibold">{gift.giftName}</h3>

                          <Link
                            href={`/Admindash/user/userprofile/${gift.user.id}`}
                            className="text-violet-600 hover:underline text-sm"
                          >
                            {gift.user.name}
                          </Link>

                          <p className="text-xs text-gray-500">
                            {dayjs(gift.createdAt).format(
                              "DD MMM YYYY hh:mm A",
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          ₹{gift.giftPrice}
                        </p>

                        <p className="text-xs text-gray-500">Gift Price</p>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <Link
                        href={`/Admindash/user/userprofile/${gift.user.id}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-1 rounded-full"
                      >
                        View User
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <SessionMessagesModal
            open={openModal}
            onClose={() => setOpenModal(false)}
            sessionId={selectedSession}
          />
        </div>
      </div>
    </div>
  );
}
