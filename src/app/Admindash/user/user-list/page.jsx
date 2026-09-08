"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import DataTable from "@/components/utils/DataTable";
import Link from "next/link";
import {  UPDATE_USER_STATUS} from "@/app/graphQL/astroHiring";
import CustomToggle from "@/components/Custom/CustomToggle";
import ExportMenu from "@/components/Custom/ExportMenu";
import { exportPDF } from "@/components/utils/export/exportPDF";
import { exportExcel } from "@/components/utils/export/exportExcel";

const GET_USERS = gql`
  query GetUsers($searchInput: UserSearchInput!) {
    getUsersListBySearch(searchInput: $searchInput) {
      totalCount
      currentPage
      totalPages

      data {
        id
        name
        mobile
        gender
        isActive
        userCoins

        createdAt
        updatedAt
      }
    }
  }
`;

export default function UsersListPage() {
  const [searchName, setSearchName] = useState("");
  const [searchMobile, setSearchMobile] = useState("");
const [minBalance, setMinBalance] = useState("");
const [maxBalance, setMaxBalance] = useState("");
  const [searchFilterType, setSearchFilterType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
const [filters, setFilters] = useState({
  query: "",
  mobile: "",
  minBalance: "",
  maxBalance: "",
  filterType: "",
  startDate: "",
  endDate: "",
});

 
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
setFilters({
  query: searchName,
  mobile: searchMobile,
  minBalance: minBalance,
  maxBalance: maxBalance,
  filterType: searchFilterType,
  startDate,
  endDate,
});
    }, 500);

    return () => clearTimeout(timer);
  }, [  searchName,
  searchMobile,
  minBalance,
  maxBalance,
  searchFilterType,
  startDate,
  endDate,]);

  const searchInput = {
    page,
    limit,
  };
  const [updateUserStatus] = useMutation(UPDATE_USER_STATUS);
if (filters.minBalance !== "") {
  searchInput.minBalance = Number(filters.minBalance);
}

if (filters.maxBalance !== "") {
  searchInput.maxBalance = Number(filters.maxBalance);
}
  if (filters.query) {
    searchInput.query = filters.query;
  }

  if (filters.mobile) {
    searchInput.mobile = filters.mobile;
  }

  if (filters.filterType) {
    searchInput.filterType = filters.filterType;
  }

  if (filters.filterType === "CUSTOM" && filters.startDate && filters.endDate) {
    searchInput.startDate = filters.startDate;

    searchInput.endDate = filters.endDate;
  }

  // API CALL
  const { data, loading, error , refetch } = useQuery(GET_USERS, {
    variables: {
      searchInput,
    },
    fetchPolicy: "network-only",
  });

  const users = data?.getUsersListBySearch?.data || [];

  const totalCount = data?.getUsersListBySearch?.totalCount || 0;

  const totalPages = data?.getUsersListBySearch?.totalPages || 1;
const exportData = users.map((user) => ({
  ID: user.id,
  Name: user.name || "N/A",
  Mobile: user.mobile || "N/A",
  Gender: user.gender || "N/A",
  WalletBalance: user.userCoins || 0,
  Status: user.isActive ? "Active" : "Inactive",
  CreatedAt: user.createdAt
    ? new Date(user.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      })
    : "",
  UpdatedAt: user.updatedAt
    ? new Date(user.updatedAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      })
    : "",
}));
const handleExcelExport = () => {
  if (!exportData.length) {
    alert("No users available to export");
    return;
  }

  exportExcel(
    exportData,
    "Users List",
    "UsersList.xlsx"
  );
};

const handlePDFExport = () => {
  if (!exportData.length) {
    alert("No users available to export");
    return;
  }

  exportPDF(
    exportData,
    "Users List",
    "UsersList.pdf"
  );
};
  // TABLE COLUMNS
  const columns = useMemo(
    () => [
      {
        header: "Name",
        render: (row) => (
          <div>         
            <Link
              href={`/Admindash/user/userprofile/${row.id}`}
              className="font-semibold text-violet-600 flex flex-col  hover:underline"
            >
              {row.name || "N/A"}
            </Link>
            <p className="text-xs font-semibold"> {row.id?.slice(0, 8)}</p>
          </div>
        ),
      },
      {
        header: "Gender",
        render: (row) => (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              row.gender === "MALE"
                ? "bg-blue-100 text-blue-700"
                : row.gender === "FEMALE"
                  ? "bg-pink-100 text-pink-700"
                  : "bg-gray-100 text-gray-700"
            }`}
          >
            {row.gender || "N/A"}
          </span>
        ),
      },
      {
        header: "Wallet Balance",
        render: (row) => (
          <span className="font-semibold text-green-600">
            {row.userCoins || 0}
          </span>
        ),
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
        render: (row) => (
          <Link
            href={`/Admindash/user/userprofile/${row.id}`}
            className=" rounded-full px-3 py-1 text-xs text-white hover:scale-104 bg-blue-400"
          >
            View
          </Link>
        ),
      },
      {
        header: "Status",
        render: (row) => (
          <div className="flex items-center gap-3">
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                row.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {row.isActive ? "Active" : "Inactive"}
            </span>

            <CustomToggle
              checked={row.isActive}
              onChange={async (value) => {
                try {
                  await updateUserStatus({
                    variables: {
                      userId: row.id,
                      isActive: value,
                    },
                  });

                  await refetch();
                } catch (err) {
                  console.error(err);
                }
              }}
            />
          </div>
        ),
      },
    ],
    [],
  );

  if (error) {
    return <p className="p-10 text-red-500">Error loading users list</p>;
  }

  return (
    <div className="p- space-y-3">
  
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Users List</h1>

        <div className="bg-black text-sm text-white px-4 py-1 rounded-full w-fit">
          Total Records : {totalCount}
        </div>
      </div>

 
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 bg-white p-3 rounded-xl shadow border border-gray-200">
   
      <input
  type="text"
  placeholder="Search by name or ID"
  value={searchName}
  onChange={(e) => setSearchName(e.target.value)}
  className="border rounded-full border-gray-300 placeholder:text-gray-300 px-4 py-1 outline-none"
/>
        <input
          type="text"
          placeholder="Search by mobile"
          value={searchMobile}
          onChange={(e) => setSearchMobile(e.target.value)}
          className="border rounded-full border-gray-300 placeholder:text-gray-300 px-4 py-1 outline-none"
        />
        <input
  type="number"
  min="0"
  placeholder="Min wallet balance"
  value={minBalance}
  onChange={(e) => setMinBalance(e.target.value)}
  className="border rounded-full border-gray-300 placeholder:text-gray-300 px-4 py-1 outline-none"
/>

<input
  type="number"
  min="0"
  placeholder="Max wallet balance"
  value={maxBalance}
  onChange={(e) => setMaxBalance(e.target.value)}
  className="border rounded-full border-gray-300 placeholder:text-gray-300 px-4 py-1 outline-none"
/>
        <select
          value={searchFilterType}
          onChange={(e) => setSearchFilterType(e.target.value)}
          className="border rounded-full border-gray-300 px-4 py-1  outline-none"
        >
          <option value="">All Time</option>

          <option value="WEEK">Last Week</option>

          <option value="MONTH">Last Month</option>

          <option value="YEAR">Last Year</option>

          <option value="CUSTOM">Custom Date</option>
        </select>
        {searchFilterType === "CUSTOM" && (
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-full border-gray-300 px-4 py-2 outline-none"
          />
        )}
        {searchFilterType === "CUSTOM" && (
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-full border-gray-300 px-4 py-2 outline-none"
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

  
      <div className="overflow-x-auto">
        <div className="w-full bg-white shadow-md rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center">Loading Users...</div>
          ) : (
            <DataTable columns={columns} data={users} />
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
