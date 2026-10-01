"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";

import DataTable from "@/components/utils/DataTable";
import { usePermissions } from "@/context/PermissionContext";

import {
  GET_APPLICATIONS,
  SCHEDULE_INTERVIEW,
  UPDATE_APPROVAL_STATUS,
  UPLOAD_IMAGE,
  // SAVE_AND_VERIFY_KYC,
  REJECT_KYC,
} from "@/app/graphQL/astroHiring";
const SAVE_AND_VERIFY_KYC = gql`
  mutation SaveKyc(
    $astrologerId: String!
    $input: KycDetailInput!
    $remarks: String
  ) {
    saveAndVerifyKyc(
      astrologerId: $astrologerId
      input: $input
      remarks: $remarks
    ) {
      id
      status
    }
  }
`;

import { GET_INTERVIEWERS } from "@/app/graphQL/astroHiring";
import toast from "react-hot-toast";
import { gql } from "@apollo/client";
import Link from "next/link";

export default function AstrologerHiring() {
  const { can } = usePermissions();

  const { data, refetch } = useQuery(GET_APPLICATIONS);
  const { data: interviewerData } = useQuery(GET_INTERVIEWERS);

  const [scheduleInterview] = useMutation(SCHEDULE_INTERVIEW);
  const [updateApprovalStatus] = useMutation(UPDATE_APPROVAL_STATUS);
  const [uploadImage] = useMutation(UPLOAD_IMAGE);
  const [saveAndVerifyKyc] = useMutation(SAVE_AND_VERIFY_KYC);
  const [rejectKyc] = useMutation(REJECT_KYC);
  const [documentRemarks, setDocumentRemarks] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("interview");
  const [filterTab, setFilterTab] = useState("NEW");
  const [form, setForm] = useState({
    interviewerId: "",
    date: "",
    time: "",
    round: "1",
  });

  const interviewers = interviewerData?.getInterviewers || [];
  const applications = data?.getApplications || [];

  const allData = applications.filter((item) => {
    switch (filterTab) {
      case "NEW":
        return (
          item.interviewStatus === "PENDING" &&
          item.documentStatus === "PENDING"
        );

      case "INTERVIEW_PASSED":
        return (
          item.interviewStatus === "PASSED" &&
          item.documentStatus === "PENDING" &&
          item.documentStatus !== "REJECTED" &&
          item.approvalStatus !== "APPROVED"
        );

      case "REJECTED":
        return (
          item.interviewStatus === "REJECTED" ||
          item.documentStatus === "REJECTED" ||
          item.approvalStatus === "REJECTED"
        );
      case "APPROVAL_PENDING":
        return (
          item.interviewStatus === "PASSED" &&
          item.documentStatus === "VERIFIED" &&
          item.approvalStatus === "PENDING"
        );

      case "APPROVED":
        return item.approvalStatus === "APPROVED";

      default:
        return true;
    }
  });

  const interviewerMap = Object.fromEntries(
    interviewers.map((i) => [i.id, i.name]),
  );

  const StatusBadge = ({ status }) => {
    const map = {
      pending: "bg-yellow-500",
      scheduled: "bg-orange-500",
      passed: "bg-green-500",
      rejected: "bg-red-500",
      verified: "bg-green-600",
    };
    return (
      <span
        className={`w-2 h-2 rounded-full ${map[status?.toLowerCase()] || "bg-gray-400"}`}
      />
    );
  };

  // 🔥 Schedule / Reschedule
  const handleSchedule = async () => {
    if (!form.interviewerId) return alert("Select interviewer");

    await scheduleInterview({
      variables: {
        astrologerId: selected.id,
        astrologerNumber: selected.phoneNumber,
        astrologerMail: selected.email,
        interviewerId: form.interviewerId,
        interviewDate: form.date,
        interviewTime: form.time,
        round: Number(form.round),
      },
    });
    setOpenModal(false);
    toast.success("Interview Scheduled !");

    refetch();
  };

  const handleUpload = async (key, file) => {
    if (!file) return;

    const res = await uploadImage({ variables: { file } });

    const url = res.data.uploadImage.url;

    setSelected((prev) => ({
      ...prev,
      kyc: {
        ...(prev.kyc || {}),
        [key]: url,
      },
    }));
  };

  const handleSave = async () => {
    await saveAndVerifyKyc({
      variables: {
        astrologerId: selected.id,
        remarks: documentRemarks,
        input: {
          accountHolderName: selected.kyc?.accountHolderName,
          accountNumber: selected.kyc?.accountNumber,
          bankName: selected.kyc?.bankName,
          ifsc: selected.kyc?.ifsc,
          branchName: selected.kyc?.branchName,
          panNumber: selected.kyc?.panNumber,

          aadhaarImage: selected.kyc?.aadhaarImage,
          panImage: selected.kyc?.panImage,
          passbookImage: selected.kyc?.passbookImage,

          status: "VERIFIED",
        },
      },
    });
    setOpenModal(false);
    toast.success("Docs Verified Successfully !");

    refetch();
  };

  const handleReject = async () => {
    await rejectKyc({
      variables: { astrologerId: selected.id, remarks: documentRemarks },
    });
    setOpenModal(false);
    toast.success("Docs Rejected !");
    refetch();
  };

  const columns = [
    {
      header: "Name",
      render: (row) => (
        <div>
          <Link className="text-xs font-semibold text-purple-500" href={`#`}>
            {row.name}
          </Link>
          <p className="text-xs text-gray-500">{row.phoneNumber}</p>
        </div>
      ),
    },

    {
      header: "Skills",
      render: (row) => row.skills?.join(", ") || "-",
    },
    {
      header: "Languages",
      render: (row) => row.languages?.join(", ") || "-",
    },
    {
      header: "Problems",
      render: (row) => row.problems?.join(", ") || "-",
    },
    {
      header: "Experience",
      accessor: "experience",
    },
    {
      header: " Date",
      render: (row) => {
        const createdDate = row.createdAt
          ? new Date(Number(row.createdAt))
          : null;

        return (
          <div className="text-xs">
            {createdDate && !isNaN(createdDate)
              ? createdDate.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "Asia/Kolkata",
                })
              : "-"}
            <p className="text-xs text-gray-500">
              {createdDate && !isNaN(createdDate)
                ? createdDate.toLocaleTimeString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </p>
          </div>
        );
      },
    },

    {
      header: "Insights",
      render: (row) => (
        <div className="flex gap-2 items-center">
          <button
            onClick={() => {
              setSelected(row);
              setOpenModal(true);
              setActiveTab("interview");
            }}
            className="px-3 py-1 text-xs bg-purple-500 text-white rounded-full"
          >
            Open
          </button>

          <div className="text-[10px]">
            <div className="flex items-center gap-1">
              <b>I:</b> <StatusBadge status={row.interviewStatus} />
            </div>
            <div className="flex items-center gap-1">
              <b>D:</b> <StatusBadge status={row.documentStatus} />
            </div>
          </div>
        </div>
      ),
    },

    {
      header: "Approval",
      render: (row) => {
        if (
          row.interviewStatus === "REJECTED" ||
          row.documentStatus === "REJECTED"
        ) {
          return <span className="text-red-600 font-medium">REJECTED</span>;
        }

        return (
          <select
            className={`border rounded px-2 py-1 ${
              row.approvalStatus === "REJECTED" ||
              row.approvalStatus === "APPROVED"
                ? "cursor-not-allowed bg-gray-200 text-gray-500"
                : ""
            }`}
            value={row.approvalStatus}
            disabled={
              row.approvalStatus === "REJECTED" ||
              row.approvalStatus === "APPROVED"
            }
            onChange={(e) =>
              updateApprovalStatus({
                variables: {
                  astrologerId: row.id,
                  status: e.target.value,
                },
              }).then(refetch)
            }
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        );
      },
    },

    {
      header: "Profile",
      render: (row) => {
        const isAdded = !!row.astrologerId;
        return (
          <button
            disabled={isAdded || row.approvalStatus !== "APPROVED"}
            onClick={() => {
              if (!isAdded) {
                window.location.href = `/Admindash/astrologer/add-astrologer?appId=${row.id}`;
              }
            }}
            className={`px-3 py-1 rounded text-xs ${
              isAdded
                ? "bg-blue-600 text-white"
                : row.approvalStatus === "APPROVED"
                  ? "bg-green-600 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isAdded ? "ADDED" : "ADD"}
          </button>
        );
      },
    },
  ];

  const docFields = [
    { label: "Aadhaar", key: "aadhaarImage" },
    { label: "Pancard", key: "panImage" },
    { label: "Bank Passbook", key: "passbookImage" },
  ];

  return (
    <div className="p-10">
      <div className="flex gap-3 mb-6">
        {[
          { key: "NEW", label: "New Applications" },
          { key: "INTERVIEW_PASSED", label: "Interview Passed" },
          { key: "REJECTED", label: "Rejected" },
          { key: "APPROVAL_PENDING", label: "Approval Pending" },
          { key: "APPROVED", label: "Approved" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filterTab === tab.key
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <DataTable columns={columns} data={allData} />

      {openModal && selected && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white w-[700px] rounded-xl p-5 space-y-4">
            <div className="flex justify-between">
              <h2>{selected.name}</h2>
              <button onClick={() => setOpenModal(false)}>✕</button>
            </div>
            <div className="flex justify-evenly bg-purple-200 p-2 rounded-xl gap-2">
              <button
                onClick={() => setActiveTab("interview")}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  activeTab === "interview"
                    ? "bg-purple-400 text-white"
                    : "bg-transparent"
                }`}
              >
                Interview
              </button>

              <button
                disabled={selected.interviewStatus !== "PASSED"}
                onClick={() => setActiveTab("documents")}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  activeTab === "documents"
                    ? "bg-purple-400 text-white"
                    : "bg-transparent"
                } ${
                  selected.interviewStatus !== "PASSED"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                Documents
              </button>
            </div>

            {activeTab === "interview" && (
              <div className="space-y-3">
                {selected.interviewStatus === "PENDING" && (
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      className="border border-gray-200 rounded-xl px-2 py-1 text-sm"
                      onChange={(e) =>
                        setForm({ ...form, interviewerId: e.target.value })
                      }
                    >
                      <option>Select Interviewer</option>
                      {interviewers.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name}
                        </option>
                      ))}
                    </select>

                    <input
                      className="border border-gray-200 rounded-xl px-2 py-1 text-sm"
                      type="date"
                      onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                      }
                    />

                    <input
                      className="border border-gray-200 rounded-xl px-2 py-1 text-sm"
                      type="time"
                      onChange={(e) =>
                        setForm({ ...form, time: e.target.value })
                      }
                    />

                    <select
                      className="border border-gray-200 rounded-xl px-2 py-1 text-sm"
                      onChange={(e) =>
                        setForm({ ...form, round: e.target.value })
                      }
                    >
                      <option value="1">Round 1</option>
                      <option value="2">Round 2</option>
                    </select>

                    <button
                      onClick={handleSchedule}
                      className="col-span-2 bg-black text-white py-2 w-[40%] rounded-xl justify-self-center "
                    >
                      Schedule
                    </button>
                  </div>
                )}

                {["SCHEDULED", "PASSED", "REJECTED"].includes(
                  selected.interviewStatus,
                ) && (
                  <div className="bg-gray-100 p-3 rounded space-y-2 text-sm">
                    <p>
                      <b>Interviewer:</b>{" "}
                      {interviewerMap[selected.interviewerId] || "-"}
                    </p>
                    <p>
                      <b>Date:</b>{" "}
                      {selected.interviewDate
                        ? new Date(
                            Number(selected.interviewDate),
                          ).toLocaleDateString("en-IN")
                        : "-"}
                    </p>
                    <p>
                      <b>Time:</b> {selected.interviewTime || "-"}
                    </p>
                    <p>
                      <b>Round:</b> {selected.round || "-"}
                    </p>
                    <p>
                      <b>Status:</b> {selected.interviewStatus}
                    </p>
                    <p>
                      <b>Remarks:</b> {selected.interviewRemarks}
                    </p>

                    <button
                      onClick={() => {
                        setSelected({
                          ...selected,
                          interviewStatus: "PENDING",
                        });
                        setForm({
                          interviewerId: selected.interviewerId || "",
                          date: selected.interviewDate?.split("T")[0] || "",
                          time: selected.interviewTime || "",
                          round: selected.round || "1",
                        });
                      }}
                      className="bg-orange-500 text-white px-3 py-1 rounded"
                    >
                      Reschedule
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "documents" && (
              <>
                {selected.documentStatus === "PENDING" && (
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "accountHolderName",
                          "accountNumber",
                          "bankName",
                          "ifsc",
                          "branchName",
                          "panNumber",
                        ].map((field) => (
                          <input
                            key={field}
                            placeholder={field}
                            value={selected.kyc?.[field] || ""}
                            onChange={(e) =>
                              setSelected((prev) => ({
                                ...prev,
                                kyc: { ...prev.kyc, [field]: e.target.value },
                              }))
                            }
                            className="border border-gray-200 rounded-xl px-2 py-1 text-sm"
                          />
                        ))}
                      </div>

                      {docFields.map(({ label, key }) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span>{label}</span>
                          {selected.kyc?.[key] && (
                            <a href={selected.kyc[key]} target="_blank">
                              View
                            </a>
                          )}
                          <input
                            type="file"
                            className="border border-gray-200 rounded-xl px-2 py-1 text-sm"
                            onChange={(e) =>
                              handleUpload(key, e.target.files[0])
                            }
                          />
                        </div>
                      ))}
                      <textarea
                        value={documentRemarks}
                        onChange={(e) => setDocumentRemarks(e.target.value)}
                        placeholder="Enter remarks..."
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm"
                      />

                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={handleSave}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg"
                        >
                          Save & Verify
                        </button>
                        <button
                          onClick={handleReject}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selected.documentStatus === "VERIFIED" && (
                  <div className="bg-gray-100 p-3 rounded space-y-2 text-sm">
                    <p>
                      <b>Account Holder:</b>{" "}
                      {selected.kycDetail?.accountHolderName || "-"}
                    </p>

                    <p>
                      <b>Account Number:</b>{" "}
                      {selected.kycDetail?.accountNumber || "-"}
                    </p>

                    <p>
                      <b>Bank:</b> {selected.kycDetail?.bankName || "-"}
                    </p>

                    <p>
                      <b>IFSC:</b> {selected.kycDetail?.ifsc || "-"}
                    </p>

                    <p>
                      <b>PAN:</b> {selected.kycDetail?.panNumber || "-"}
                    </p>
                    <p>
                      <b>Remarks:</b>{" "}
                      {selected.kycDetail?.documentRemarks || "-"}
                    </p>

                    <div className="flex gap-3">
                      {selected.kycDetail?.aadhaarImage && (
                        <a
                          href={selected.kycDetail.aadhaarImage}
                          target="_blank"
                          className="text-blue-600"
                        >
                          Aadhaar
                        </a>
                      )}

                      {selected.kycDetail?.panImage && (
                        <a
                          href={selected.kycDetail.panImage}
                          target="_blank"
                          className="text-blue-600"
                        >
                          PAN
                        </a>
                      )}

                      {selected.kycDetail?.passbookImage && (
                        <a
                          href={selected.kycDetail.passbookImage}
                          target="_blank"
                          className="text-blue-600"
                        >
                          Passbook
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {selected.documentStatus === "REJECTED" && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded">
                    <p className="text-red-600 font-medium">
                      Documents Rejected
                    </p>
                    <p>
                      <b>Remarks:</b> {selected.documentRemarks || "-"}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
