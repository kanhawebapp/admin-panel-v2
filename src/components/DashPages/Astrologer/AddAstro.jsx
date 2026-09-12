"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addAstrologerSchema } from "../../../app/schema/addAstrologer.schema";
import Image from "next/image";
import { useWatch } from "react-hook-form";
import CustomDropdown from "@/components/Custom/CustomDropdown";
import CustomInput from "@/components/Custom/CustomInput";
import CustomButton from "@/components/Custom/CustomButtom";
import TapEditor from "@/components/Custom/TapEditor";
import MultiSelect from "@/components/Custom/MultiSelect";
import { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { mapAstrologerPayload } from "@/components/utils/mappers/astrologer.mappers";
import toast from "react-hot-toast";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  GET_ASTROLOGER_BY_ID,
  GET_PROBLEMS,
  GET_SKILLS,
  UPDATE_ASTROLOGER,
} from "../../../app/graphQL/astroHiring";
const ADD_ASTROLOGER = gql`
  mutation AddAstrologer($data: AddAstrologerInput!) {
    addAstrologer(data: $data) {
      success
      message
      data {
        id
        name
        email
      }
    }
  }
`;

const GET_APPLICATION_BY_ID = gql`
  query ($id: String!) {
    getApplicationById(id: $id) {
      id
      name
      email
      phoneNumber
      dob
      gender
      experience
      languages
      problems
      skills
      about
      address
      pincode
      kycDetail {
        accountHolderName
        accountNumber
        bankName
        ifsc
        branchName
        panNumber

        aadhaarImage
        panImage
        passbookImage
      }
    }
  }
`;

export default function AddAstro() {
  const params = useParams(); // edit mode ke liye rehne do
  const [previewImage, setPreviewImage] = useState(null);
  const searchParams = useSearchParams();
  const appId = searchParams.get("appId");
  // console.log("URL APP ID============== =", appId);
  const astrologerId = params?.id;
  const router = useRouter();
  const isEditMode = !!astrologerId;
  const [fileInputKey, setFileInputKey] = useState(0);
  const {
    data: astroData,
    loading: astroLoading,
    error: astroError,
  } = useQuery(GET_ASTROLOGER_BY_ID, {
    variables: {
      id: astrologerId,
    },
    skip: !isEditMode,
  });

  // console.log("ASTRO DATAxxxxxxxxxxxxxxxxxxx:", astroData);

  const [existingDocs, setExistingDocs] = useState({});
  const { data: appData, loading: appLoading } = useQuery(
    GET_APPLICATION_BY_ID,
    {
      variables: { id: appId },
      skip: !appId,
    },
  );

  const [addAstrologer, { loading: addLoading, error }] =
    useMutation(ADD_ASTROLOGER);
const [updateAstrologer, { loading: updateLoading }] = useMutation(
  UPDATE_ASTROLOGER,
  {
    refetchQueries: [
      {
        query: GET_ASTROLOGER_BY_ID,
        variables: {
          id: astrologerId,
        },
      },
    ],
    awaitRefetchQueries: true,
  }
);

  const [dummyLoading, setDummyLoading] = useState(false);

  const emptyForm = {
    astroname: "",
    displayName: "",
    dateOfBirth: "",
    profilePic: null,
    email: "",
    phoneNumber: "",
    experience: "",
    address: "",
    pincode: "",
    gender: "",
    tzone: "",
    tags: "",
    vtags: "",
    expertise: [],
    languages: [],
    problems: [],
    about: "",

    countryStateCity: {
      country: "",
      state: "",
      city: "",
    },

    pricing: [
      {
        type: "CHAT",
        price: "",
        offerPrice: "",
        commissionPercent: "",
        isActive: false,
      },
      {
        type: "CALL",
        price: "",
        offerPrice: "",
        commissionPercent: "",
        isActive: false,
      },
      {
        type: "VIDEO",
        price: "",
        offerPrice: "",
        commissionPercent: "",
        isActive: false,
      },
      {
        type: "AUDIO",
        price: "",
        offerPrice: "",
        commissionPercent: "",
        isActive: false,
      },
      {
        type: "GIFT_COMMISSION",
        commissionPercent: "",
        isActive: false,
      },
      {
        type: "OFFER",
        commissionPercent: "",
        isActive: false,
      },
    ],

    bankDetails: {
      accountHolderName: "",
      accountNumber: "",
      bankName: "",
      ifscCode: "",
      panCardNumber: "",
      branchName: "",
    },

    documents: {
      aadhaar: null,
      panCard: null,
      passbook: null,
    },
  };

  const dummyAstrologerData = {
    astroname: "Rahul Sharma",
    displayName: "Astro Rahul",
    dateOfBirth: "1995-05-15",
    email: "rahulastro@gmail.com",
    phoneNumber: "9876543210",
    experience: 5,
    address: "Sector 15, Delhi",
    pincode: 110001,
    gender: "MALE",
    tzone: "In",
    tags: "Top Choice",
    vtags: "verified",

    expertise: ["Palmistry", "Tarot"],
    languages: ["Hindi", "English"],
    problems: ["Love", "Career"],

    about:
      "<p>I am a professional astrologer with 5 years of experience in tarot and palmistry.</p>",

    countryStateCity: {
      country: "India",
      state: "Delhi",
      city: "New Delhi",
    },

    pricing: [
      {
        type: "CHAT",
        price: 20,
        offerPrice: 15,
        commissionPercent: 10,
        isActive: true,
      },
      {
        type: "CALL",
        price: 30,
        offerPrice: 25,
        commissionPercent: 10,
        isActive: true,
      },
      {
        type: "VIDEO",
        price: 40,
        offerPrice: 35,
        commissionPercent: 10,
        isActive: true,
      },
      {
        type: "AUDIO",
        price: 25,
        offerPrice: 20,
        commissionPercent: 10,
        isActive: true,
      },
      {
        type: "GIFT_COMMISSION",
        commissionPercent: 50,
        isActive: true,
      },
      {
        type: "OFFER",
        commissionPercent: 30,
        isActive: true,
      },
    ],

    bankDetails: {
      accountHolderName: "Rahul Sharma",
      accountNumber: "1234567890",
      bankName: "HDFC Bank",
      ifscCode: "HDFC0001234",
      panCardNumber: "ABCDE1234F",
      branchName: "Delhi Branch",
    },

    documents: {
      aadhaar: null,
      panCard: null,
      passbook: null,
    },
  };

  const handleFillDummyData = () => {
    try {
      setDummyLoading(true);

      reset(dummyAstrologerData);

      toast.success("Dummy data filled successfully ✅");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.log(err);
      toast.error("Failed to fill dummy data");
    } finally {
      setDummyLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addAstrologerSchema),
    defaultValues: {
      gender: "MALE",
      tzone: "In",
      tags: "New",
      dateOfBirth: "",
      profilePic: null,
      vtags: "not verified",
      expertise: [],
      languages: [],
      problems: [],
      about: "",

      countryStateCity: {
        country: "",
        state: "",
        city: "",
      },

      pricing: [
        {
          type: "CHAT",
          price: "",
          offerPrice: "",
          commissionPercent: "",
          isActive: false,
        },
        {
          type: "CALL",
          price: "",
          offerPrice: "",
          commissionPercent: "",
          isActive: false,
        },
        {
          type: "VIDEO",
          price: "",
          offerPrice: "",
          commissionPercent: "",
          isActive: false,
        },
        {
          type: "AUDIO",
          price: "",
          offerPrice: "",
          commissionPercent: "",
          isActive: false,
        },
        {
          type: "GIFT_COMMISSION",
          commissionPercent: "",
          isActive: false,
        },
        {
          type: "OFFER",
          commissionPercent: "",
          isActive: false,
        },
      ],
      bankDetails: {
        accountHolderName: "",
        accountNumber: "",
        bankName: "",
        ifscCode: "",
        panCardNumber: "",
        branchName: "",
        status: "VERIFIED",
      },
      documents: {
        aadhaar: null,
        panCard: null,
        passbook: null,
      },
    },
  });

  useEffect(() => {
    if (!appData?.getApplicationById) return;

    const app = appData.getApplicationById;
    console.log(
      "APP DATA ===============================",
      appData?.getApplicationById?.id,
    );

    reset({
      astroname: app.name,
      displayName: app.name,
      email: app.email,
      phoneNumber: app.phoneNumber,
      dateOfBirth: app.dob ? app.dob.split("T")[0] : "",
      gender: app.gender,
      experience: app.experience,
      address: app.address,
      pincode: app.pincode,

      expertise: app.skills || [],
      languages: app.languages || [],
      problems: app.problems || [],

      about: app.about || "",

      bankDetails: {
        accountHolderName: app.kycDetail?.accountHolderName || "",
        accountNumber: app.kycDetail?.accountNumber || "",
        bankName: app.kycDetail?.bankName || "",
        ifscCode: app.kycDetail?.ifsc || "",
        branchName: app.kycDetail?.branchName || "",
        panCardNumber: app.kycDetail?.panNumber || "",
      },
    });
    console.log("KYC DATA:", app.kycDetail);
    const BASE_URL = "https://dhwaniastro.com/adminAuth/api/upload-documents";
    setExistingDocs({
      aadhaar: app.kycDetail?.aadhaarImage
        ? BASE_URL + app.kycDetail.aadhaarImage
        : null,
      panCard: app.kycDetail?.panImage
        ? BASE_URL + app.kycDetail.panImage
        : null,
      passbook: app.kycDetail?.passbookImage
        ? BASE_URL + app.kycDetail.passbookImage
        : null,
    });
  }, [appData, reset]);

  const pincode = watch("pincode");

  // edit --------------------
  useEffect(() => {
    if (!astroData?.getAstrologerById) return;

    const astro = astroData.getAstrologerById;

    const primaryAddress = astro.addresses?.[0];
    const pricingTypes = [
      "CHAT",
      "CALL",
      "VIDEO",
      "AUDIO",
      "GIFT_COMMISSION",
      "OFFER",
    ];

    const pricing = pricingTypes.map((type) => {
      const existing = astro.pricing?.find((p) => p.type === type);

      const eligibilityMap = {
        CHAT: astro.isEligibleChat,
        CALL: astro.isEligibleCall,
        VIDEO: astro.isEligibleVideo,
        AUDIO: astro.isEligibleAudio,
        GIFT_COMMISSION: !!existing,
        OFFER: !!existing,
      };

      return {
        type,
        price: existing?.price ?? "",
        offerPrice: existing?.offerPrice ?? "",
        commissionPercent: existing?.commissionPercent ?? "",
        isActive: eligibilityMap[type] ?? false,
      };
    });
    reset({
      astroname: astro.name || "",
      displayName: astro.displayName || "",

      email: astro.email || "",
      phoneNumber: astro.contactNo || "",

      dateOfBirth: astro.dateOfBirth ? astro.dateOfBirth.split("T")[0] : "",

      gender: astro.gender || "",

      experience: astro.experience || 0,

      address: primaryAddress?.street || "",

      pincode: primaryAddress?.pincode || "",

      countryStateCity: {
        country: primaryAddress?.country || "",
        state: primaryAddress?.state || "",
        city: primaryAddress?.city || "",
      },

      expertise: astro.skills || [],
      languages: astro.languages || [],
      problems: astro.problems || [],

      about: astro.about || "",

      tags: astro.tags || "New",
      vtags: astro.vtags || "not verified",

      pricing,

      bankDetails: {
        accountHolderName: astro.kycDetail?.accountHolderName || "",

        accountNumber: astro.kycDetail?.accountNumber || "",

        bankName: astro.kycDetail?.bankName || "",

        ifscCode: astro.kycDetail?.ifsc || "",

        branchName: astro.kycDetail?.branchName || "",

        panCardNumber: astro.kycDetail?.panNumber || "",
      },
    });

    const getFileUrl = (path) => {
      if (!path) return null;

      if (path.startsWith("http")) return path;

      return `https://dhwaniastro.com${path}`;
    };

    setExistingDocs({
      profilePic: getFileUrl(astro.profilePic),
      aadhaar: getFileUrl(astro.kycDetail?.aadhaarImage),
      panCard: getFileUrl(astro.kycDetail?.panImage),
      passbook: getFileUrl(astro.kycDetail?.passbookImage),
    });
  }, [astroData, reset]);

  useEffect(() => {
    if (!pincode || pincode.toString().length !== 6) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.zippopotam.us/in/${pincode}`);

        if (!res.ok) {
          // Invalid pincode or not found
          setValue("countryStateCity.country", "");
          setValue("countryStateCity.state", "");
          setValue("countryStateCity.city", "");
          return;
        }

        const data = await res.json();

        if (data?.places?.[0]) {
          const place = data.places[0];
          setValue("countryStateCity.country", "India");
          setValue("countryStateCity.state", place["state"]);
          setValue("countryStateCity.city", place["place name"]);
        }
      } catch (error) {
        console.log("Pincode fetch error:", error);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [pincode, setValue]);

  const onSubmit = async (formData) => {
    try {
      const fd = new FormData();

       console.log("FORM GENDER:", formData.gender);

      if (formData.profilePic instanceof File) {
        fd.append("profilePic", formData.profilePic);

        // console.log("PROFILE APPENDED");
      }

      Object.entries(formData.documents).forEach(([key, file]) => {
        if (file) fd.append(key, file);
      });

      const uploadRes = await fetch(
        "https://dhwaniastro.com/adminAuth/api/upload-documents",
        {
          method: "POST",
          body: fd,
        },
      );

      const uploadedFiles = await uploadRes.json();
      const existingData = isEditMode
        ? astroData?.getAstrologerById
        : appData?.getApplicationById;
     const safeFiles = {
  profilePic:
    typeof uploadedFiles?.profilePic === "string"
      ? uploadedFiles.profilePic
      : existingData?.profilePic || null,

  aadhaar:
    typeof uploadedFiles?.aadhaar === "string"
      ? uploadedFiles.aadhaar
      : existingData?.kycDetail?.aadhaarImage || null,

  panCard:
    typeof uploadedFiles?.panCard === "string"
      ? uploadedFiles.panCard
      : existingData?.kycDetail?.panImage || null,

  passbook:
    typeof uploadedFiles?.passbook === "string"
      ? uploadedFiles.passbook
      : existingData?.kycDetail?.passbookImage || null,
};

      const payload = mapAstrologerPayload({
        ...formData,
        applicationId: appId,
        profilePic: safeFiles.profilePic,
        documents: safeFiles,
        status: true, // ✅ top-level status
      });

      console.log("PAYLOAD GENDER:", payload.gender);

      let res;

      if (isEditMode) {
        res = await updateAstrologer({
          variables: {
            astrologerId,
            data: payload,
          },
        });
        console.log(
  "UPDATE RESPONSE:",
  res?.data?.updateAstrologer
);
      

        toast.success("Astrologer updated successfully ✅");
        router.replace("/Admindash/astrologer/astrologer-list");
      } else {
        res = await addAstrologer({
          variables: {
            data: payload,
          },
        });

        if (res?.data?.addAstrologer?.success) {
          toast.success(res.data.addAstrologer.message);
          router.replace("/Admindash/astrologer/astrologer-list");
        }
      }

      if (!isEditMode) {
        reset(emptyForm);
        setExistingDocs({
          aadhaar: null,
          panCard: null,
          passbook: null,
        });
        setFileInputKey((prev) => prev + 1);
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong ❌");
    }
  };

  const handleReset = () => {
    reset(emptyForm);

    setExistingDocs({
      aadhaar: null,
      panCard: null,
      passbook: null,
    });
    setFileInputKey((prev) => prev + 1);
  };
  const { data: skillsData } = useQuery(GET_SKILLS);

  const { data: problemsData } = useQuery(GET_PROBLEMS);
  const skillOptions =
    skillsData?.getSkills?.filter((x) => x.isActive)?.map((x) => x.name) || [];

  const problemOptions =
    problemsData?.getProblems?.filter((x) => x.isActive)?.map((x) => x.name) ||
    [];

  const selectFields = [
    {
      label: "Skills & Expertise",
      name: "expertise",
      placeholder: "Select Skills",
      options: skillOptions,
    },
    {
      label: "Language Known",
      name: "languages",
      placeholder: "Select Language",
      options: ["English", "Hindi", "Punjabi", "Malayalam"],
    },
    {
      label: "Problems Handled",
      name: "problems",
      placeholder: "Select Problems",
      options: problemOptions,
    },
  ];

  useEffect(() => {
    if (errors && Object.keys(errors).length) {
      console.log("❌ FORM ERRORS:", errors);
    }
  }, [errors]);

  const Toggle = ({ value, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`w-8 h-4 flex items-center rounded-full p-1 ${
        value ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <div
        className={`bg-white w-3 h-3 rounded-full shadow transform ${
          value ? "translate-x-4" : ""
        }`}
      />
    </button>
  );
  const isSubmitting = addLoading || updateLoading;
  console.log("vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv", existingDocs);
  return (
    <div className="min-h-screen">
      <div className="shadow-md rounded-xl p-3 bg-purple-200 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CustomButton
            type="button"
            variant="green"
            className="px-4 py-2"
            onClick={handleFillDummyData}
            disabled={dummyLoading}
          >
            {dummyLoading ? "Loading..." : "Fill Dummy Data"}
          </CustomButton>

          <Image
            src="/admin-img/wired-flat-21-avatar.gif"
            alt="astrologer"
            width={50}
            height={50}
            className="rounded-full"
          />
        </div>
        <h2 className="text-xl font-bold text-purple-900">
          {isEditMode ? "Edit Astrologer" : "Add New Astrologer"}
        </h2>
        <Image
          src="/admin-img/wired-flat-21-avatar.gif"
          alt="astrologer"
          width={50}
          height={50}
          className="rounded-full"
        />
      </div>

      {appId && !appData && (
        <div className="text-center py-4">Loading application...</div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-lg rounded-2xl p-5 space-y-6"
      >
        <h2 className=" mb-2 text-base font-semibold text-purple-500">
          Basic Astrologer Details :
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Astrologer Full Name
            </label>
            <div className="flex items-center gap-2 border border-gray-400 rounded-full px-2 p-1">
              <img
                src="/admin-img/userte.png"
                alt="user"
                className="input-img-side"
              />
              <CustomInput
                className="w-full outline-none border-0 border-none bg-transparent"
                {...register("astroname")}
                placeholder="Enter full name"
              />
            </div>
            {errors.astroname && (
              <p className="text-red-500 text-xs">{errors.astroname.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Profile Image
            </label>

            <div className="flex items-center gap-2 border border-gray-400 rounded-full px-2 p-1">
              <img
                src="/admin-img/userte.png"
                alt="user"
                className="input-img-side"
              />
              <Controller
                name="profilePic"
                control={control}
                defaultValue={null}
                render={({ field }) => (
                  <input
                    type="file"
                    key={`profile-${fileInputKey}`}
                    accept="image/*"
                    className="w-full outline-none border-0 bg-transparent text-sm"
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      console.log("PROFILE SELECTED:", file);

                      field.onChange(file);
                    }}
                  />
                )}
              />
              <button
                type="button"
                onClick={() => setPreviewImage(existingDocs.profilePic)}
                className="text-blue-600 text-[10px] cursor-pointer"
              >
                View
              </button>
            </div>

            {errors.profilePic && (
              <p className="text-red-500 text-xs">
                {errors.profilePic.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Display Name
            </label>
            <div className="flex items-center gap-2 border border-gray-400 rounded-full px-2 p-1">
              <img
                src="/admin-img/userte.png"
                alt="user"
                className="input-img-side"
              />

              <CustomInput
                className="w-full outline-none border-0 border-none bg-transparent"
                {...register("displayName")}
                placeholder="Enter display name"
              />
            </div>
            {errors.displayName && (
              <p className="text-red-500 text-xs">
                {errors.displayName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Email Address
            </label>
            <div className="flex items-center gap-2 border border-gray-400 rounded-full px-2 p-1">
              <img
                src="/admin-img/userte.png"
                alt="user"
                className="input-img-side"
              />

              <CustomInput
                className="w-full outline-none border-0 border-none bg-transparent"
                {...register("email")}
                placeholder="Enter email"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email.message}</p>
            )}
          </div>

          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <CustomDropdown
                {...field}
                label="Gender"
                options={[
                  { value: "MALE", label: "Male" },
                  { value: "FEMALE", label: "Female" },
                  { value: "OTHER", label: "Other" },
                ]}
              />
            )}
          />
          {errors.gender && (
            <p className="text-red-500 text-xs">{errors.gender.message}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              DOB (for age calculation)
            </label>
            <div className="flex items-center gap-2 border border-gray-400 rounded-full px-2 p-1">
              <img
                src="/admin-img/userte.png"
                alt="user"
                className="input-img-side"
              />
              <CustomInput
                className="w-full outline-none border-0 border-none bg-transparent"
                placeholder="Enter date of birth"
                type="date"
                {...register("dateOfBirth")}
              />
            </div>
            {errors.dateOfBirth && (
              <p className="text-red-500 text-xs">
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500    mb-1">
              Years of Experience
            </label>
            <div className="flex items-center gap-2 border border-gray-400 rounded-full px-2 p-1">
              <img
                src="/admin-img/userte.png"
                alt="user"
                className="input-img-side"
              />
              <CustomInput
                className="w-full outline-none border-0 border-none bg-transparent"
                type="number"
                placeholder="Enter experience in years"
                {...register("experience", { valueAsNumber: true })}
              />
            </div>
            {errors.experience && (
              <p className="text-red-500 text-xs">
                {errors.experience.message}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Address
            </label>
            <div className="flex items-center gap-2 border border-gray-400 rounded-2xl px-2 p-1">
              <img
                src="/admin-img/userte.png"
                alt="user"
                className="input-img-side rounded-full"
              />
              <CustomInput
                className="w-full outline-none border-0 border-none bg-transparent"
                {...register("address")}
                placeholder="Enter address"
              />
            </div>
            {errors.address && (
              <p className="text-red-500 text-xs"> {errors.address.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500    mb-1">
              Pincode
            </label>
            <div className="flex items-center gap-2 border border-gray-400 rounded-full px-2 p-1">
              <img
                src="/admin-img/userte.png"
                alt="user"
                className="input-img-side"
              />
              <CustomInput
                className="w-full outline-none border-0 border-none bg-transparent"
                type="number"
                placeholder="Enter pincode"
                {...register("pincode", { valueAsNumber: true })}
              />
            </div>
            {errors.pincode && (
              <p className="text-red-500 text-xs">{errors.pincode.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Phone Number
            </label>
            <div className="flex items-center gap-2 border border-gray-400 rounded-full px-2 p-1">
              <img
                src="/admin-img/userte.png"
                alt="user"
                className="input-img-side"
              />
              <CustomInput
                className="w-full outline-none border-0 border-none bg-transparent"
                placeholder="Enter phone number"
                type="text"
                inputMode="numeric"
                {...register("phoneNumber")}
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div className="col-span-3 grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Country
              </label>

              <CustomInput
                className="w-full outline-none  bg-transparent"
                {...register("countryStateCity.country")}
                placeholder="Auto fetched country"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                State
              </label>

              <CustomInput
                className="w-full outline-none  bg-transparent"
                {...register("countryStateCity.state")}
                placeholder="Auto fetched state"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                City
              </label>

              <CustomInput
                className="w-full outline-none  bg-transparent"
                {...register("countryStateCity.city")}
                placeholder="Auto fetched city"
                readOnly
              />
            </div>
          </div>

          <Controller
            name="tzone"
            control={control}
            render={({ field }) => (
              <CustomDropdown
                {...field}
                label="TimeZone"
                options={[
                  { value: "In", label: "India (UTC+5:30)" },
                  { value: "Us", label: "US (UTC-5:00)" },
                ]}
              />
            )}
          />
        </div>

        <h2 className=" mb-2 text-base font-semibold text-purple-500">
          About Astrologer :
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">
              About Me (in English)
            </label>
            <div className="flex items-center gap-2 border border-gray-400 rounded-2xl px-2 p-1">
              <Controller
                name="about"
                control={control}
                render={({ field }) => (
                  <TapEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="About astrologer (English)"
                  />
                )}
              />
            </div>
            {errors.about && (
              <p className="text-red-500 text-xs">{errors.about.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 ">
          <div className="flex flex-col gap-2">
            {selectFields.map((field, idx) => (
              <Controller
                key={idx}
                name={field.name}
                control={control}
                render={({ field: rhfField }) => (
                  <MultiSelect
                    label={field.label}
                    options={field.options}
                    placeholder={field.placeholder}
                    multiple
                    selected={rhfField.value}
                    setSelected={rhfField.onChange}
                  />
                )}
              />
            ))}
            {errors.label && (
              <p className="text-red-500 text-xs">{errors.label.message}</p>
            )}
          </div>
          <div className="p-4 rounded-xl flex flex-col gap-2 border border-gray-200 bg-white w-full">
            <h2 className="font-semibold text-sm text-center">
              Astrologer Charges
            </h2>

            <div className="grid grid-cols-2 gap-5">
              {[
                "CHAT",
                "CALL",
                "VIDEO",
                "AUDIO",
                "GIFT_COMMISSION",
                "OFFER",
              ].map((type, index) => {
                const isCommissionOnly =
                  type === "GIFT_COMMISSION" || type === "OFFER";
                const isActive = useWatch({
                  control,
                  name: `pricing.${index}.isActive`,
                  defaultValue: false,
                });

                return (
                  <div
                    key={type}
                    className="border border-gray-200 p-2 rounded-lg"
                  >
                    <input
                      type="hidden"
                      value={type}
                      {...register(`pricing.${index}.type`)}
                    />

                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm text-gray-500">{type}</h3>

                      <Controller
                        control={control}
                        name={`pricing.${index}.isActive`}
                        render={({ field }) => (
                          <Toggle
                            value={field.value ?? false}
                            onChange={(val) => {
                              field.onChange(val);

                              if (!val) {
                                if (!isCommissionOnly) {
                                  setValue(`pricing.${index}.price`, "");
                                  setValue(`pricing.${index}.offerPrice`, "");
                                }

                                setValue(
                                  `pricing.${index}.commissionPercent`,
                                  "",
                                );
                              }
                            }}
                          />
                        )}
                      />
                    </div>

                    {isActive && (
                      <>
                        <div className="flex gap-2">
                          {!isCommissionOnly && (
                            <>
                              <input
                                {...register(`pricing.${index}.price`, {
                                     setValueAs: (value) => value === "" ? "" : Number(value),

                                })}
                                placeholder=" Offer"
                                className="border placeholder:text-xs placeholder:text-gray-300 border-gray-200 rounded-xl p-1 text-sm w-1/3"
                              />

                              <input
                                {...register(`pricing.${index}.offerPrice`, {
                                     setValueAs: (value) => value === "" ? "" : Number(value),

                                })}
                                placeholder="Price"
                                className="border placeholder:text-xs placeholder:text-gray-300 border-gray-200 rounded-xl p-1 text-sm w-1/3"
                              />
                            </>
                          )}

                          <input
                            {...register(`pricing.${index}.commissionPercent`, {
                                setValueAs: (value) => value === "" ? "" : Number(value),

                            })}
                            placeholder="%"
                            className={`border border-gray-200 placeholder:text-xs placeholder:text-gray-300 rounded-xl p-1 text-sm ${
                              isCommissionOnly ? "w-full" : "w-1/3"
                            }`}
                          />
                        </div>

                        {errors?.pricing?.[index]?.price && (
                          <p className="text-red-500 text-xs">
                            {errors.pricing[index].price.message}
                          </p>
                        )}

                        {errors?.pricing?.[index]?.commissionPercent && (
                          <p className="text-red-500 text-xs">
                            {errors.pricing[index].commissionPercent.message}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 w-full">
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <CustomDropdown
                {...field}
                label="Tag"
                options={[
                  { value: "New", label: "New" },
                  { value: "Rising Star", label: "Rising Star" },
                  { value: "Celebrity", label: "Celebrity" },
                  { value: "Top Ranking", label: "Top Ranking" },
                  { value: "Top Choice", label: "Top Choice" },
                ]}
              />
            )}
          />

          {errors.tags && (
            <p className="text-red-500 text-xs">{errors.tags.message}</p>
          )}
          <Controller
            name="vtags"
            control={control}
            render={({ field }) => (
              <CustomDropdown
                {...field}
                label="Verification"
                options={[
                  { value: "verified", label: "Verified" },
                  { value: "not verified", label: "Not Verified" },
                ]}
              />
            )}
          />
          {errors.vtags && (
            <p className="text-red-500 text-xs">{errors.vtags.message}</p>
          )}
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-5 space-y-6">
          <h2 className=" mb-2 text-base font-semibold text-purple-500">
            Astrologer Bank Details :
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Account Holder Name
              </label>
              <div className="flex items-center gap-2 border border-gray-400 rounded-full px-2 p-1">
                <img
                  src="/admin-img/userte.png"
                  alt="user"
                  className="input-img-side"
                />
                <CustomInput
                  className="w-full outline-none border-0 border-none bg-transparent"
                  type="text"
                  placeholder="Enter account holder name"
                  {...register("bankDetails.accountHolderName")}
                />
              </div>
              {errors?.bankDetails?.accountHolderName && (
                <p className="text-xs text-red-500">
                  {errors.bankDetails.accountHolderName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Account No :
              </label>
              <div className="flex items-center gap-2 border border-gray-400 rounded-full px-2 p-1">
                <img
                  src="/admin-img/userte.png"
                  alt="user"
                  className="input-img-side"
                />
                <CustomInput
                  className="w-full outline-none border-0 border-none bg-transparent"
                  type="text"
                  placeholder="Enter account number"
                  {...register("bankDetails.accountNumber")}
                />
              </div>
              {errors?.bankDetails?.accountNumber && (
                <p className="text-xs text-red-500">
                  {errors.bankDetails.accountNumber.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Bank Name
              </label>
              <div className="flex items-center gap-2 border border-gray-400 rounded-full px-2 p-1">
                <img
                  src="/admin-img/userte.png"
                  alt="user"
                  className="input-img-side"
                />
                <CustomInput
                  className="w-full outline-none border-0 border-none bg-transparent"
                  type="text"
                  placeholder="Enter bank name"
                  {...register("bankDetails.bankName")}
                />
              </div>
              {errors?.bankDetails?.bankName && (
                <p className="text-xs text-red-500">
                  {errors.bankDetails.bankName.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                IFSC Code
              </label>
              <div className="flex items-center gap-2 border border-gray-400 rounded-full px-2 p-1">
                <img
                  src="/admin-img/userte.png"
                  alt="user"
                  className="input-img-side"
                />
                <CustomInput
                  className="w-full outline-none border-0 border-none bg-transparent"
                  type="text"
                  placeholder="Enter IFSC code"
                  {...register("bankDetails.ifscCode")}
                />
              </div>
              {errors?.bankDetails?.ifscCode && (
                <p className="text-xs text-red-500">
                  {errors.bankDetails.ifscCode.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Branch Name
              </label>
              <div className="flex items-center gap-2 border border-gray-400 rounded-full px-2 p-1">
                <img
                  src="/admin-img/userte.png"
                  alt="user"
                  className="input-img-side"
                />
                <CustomInput
                  className="w-full outline-none border-0 border-none bg-transparent"
                  type="text"
                  placeholder="Enter branch name"
                  {...register("bankDetails.branchName")}
                />
              </div>
              {errors?.bankDetails?.branchName && (
                <p className="text-xs text-red-500">
                  {errors.bankDetails.branchName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                PAN Card Number
              </label>
              <div className="flex items-center gap-2 border border-gray-400 rounded-full px-2 p-1">
                <img
                  src="/admin-img/userte.png"
                  alt="user"
                  className="input-img-side"
                />
                <CustomInput
                  className="w-full outline-none border-0 border-none bg-transparent"
                  type="text"
                  placeholder="Enter pancard number"
                  {...register("bankDetails.panCardNumber")}
                />
              </div>
              {errors?.bankDetails?.panCardNumber && (
                <p className="text-xs text-red-500">
                  {errors.bankDetails.panCardNumber.message}
                </p>
              )}
            </div>

            <div className="mt-3 flex gap-6 col-span-3">
              <div className="shrink-0 bg-[#2f1254] rounded-2xl items-center justify-start flex p-1 ">
                <img
                  src="/admin-img/userte.png"
                  alt="Preview"
                  className=" object-contain rounded-md  input-img-side"
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap gap-4 items-center justify-start">
                  {[
                    { label: "Aadhar Image", name: "aadhaar" },
                    { label: "PanCard Image", name: "panCard" },
                    { label: "Passbook Image", name: "passbook" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <label className="w-40 text-sm font-medium text-gray-600">
                        {item.label} :
                      </label>

                      <Controller
                        name={`documents.${item.name}`}
                        control={control}
                        render={({ field }) => (
                          <input
                            type="file"
                            className="w-full outline-none border rounded-full px-2 py-2 border-gray-300 bg-transparent text-sm"
                            key={`${item.name}-${fileInputKey}`}
                            onChange={(e) =>
                              field.onChange(e.target.files?.[0])
                            }
                          />
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setPreviewImage(existingDocs[item.name])}
                        className="text-blue-600 text-[10px] cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  ))}
                  {/* {errors?.bankDetails?.documents?.profile && (
                                        <p className="text-xs text-red-500">
                                            {errors.bankDetails.documents.profile.message}
                                        </p>
                                    )}
                                    {errors?.bankDetails?.documents?.aadhar && (
                                        <p className="text-xs text-red-500">
                                            {errors.bankDetails.documents.aadhar.message}
                                        </p>
                                    )}
                                    {errors?.bankDetails?.documents?.pan && (
                                        <p className="text-xs text-red-500">
                                            {errors.bankDetails.documents.pan.message}
                                        </p>
                                    )}
                                    {errors?.bankDetails?.documents?.passbook && (
                                        <p className="text-xs text-red-500">
                                            {errors.bankDetails.documents.passbook.message}
                                        </p>
                                    )} */}
                </div>
                <span className="text-xs text-red-400 mt-2">
                  ***Note: Maximum upload limit <b>1 MB</b>.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-center justify-center">
          <CustomButton
            type="submit"
            variant="green"
            className="px-4 py-1"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : isEditMode
                ? "Update Astrologer"
                : "Save Astrologer"}
          </CustomButton>

          <CustomButton
            type="button"
            variant="gray"
            className="px-4 py-1"
            onClick={handleReset}
          >
            Reset
          </CustomButton>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error.message}</p>
        )}
      </form>
      {previewImage && (
        <div
          className="fixed inset-0 z-50   flex items-center justify-center bg-black/60"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative bg-white max-h-[70vh] rounded-xl p-4 shadow-xl max-w-lg w-[90%]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 w-6 h-6 cursor-pointer rounded-full bg-red-500 text-white hover:bg-red-600"
            >
              ✕
            </button>

            <img
              src={previewImage}
              alt="Preview"
              className="w-full max-h-[50vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
