"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import dayjs from "dayjs";


import { GET_USER_WALLET_TRANSACTIONS } from "@/app/graphQL/astroHiring";
import Pagination from "../Pagination";
import DataTable from "@/components/utils/DataTable";

const LIMIT = 50;

export default function WalletTab({ userId }) {
  const [page, setPage] = useState(1);

  const { data, loading } = useQuery(GET_USER_WALLET_TRANSACTIONS, {
    variables: {
      userId,
      page,
      limit: LIMIT,
    },
    fetchPolicy: "cache-first",
  });

  const walletData = data?.getUserWalletTransactions;

  const transactions = walletData?.data || [];

  const columns = useMemo(
    () => [
      {
        header: " ID",
        render: (row) => (
               <div className="flex flex-col gap-1">
  <span
    className={`px-2 py- rounded-full text-[10px] font-semibold ${
      row.type === "CREDIT"
        ? " text-green-700"
        : "text-red-700"
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
            className={`px-3 py-1 rounded-full text-xs font-semibold
            ${
              row.type === "CREDIT"
                ? " text-green-700"
                : " text-red-700"
            }`}
          >
            {row.type}
          </span>
        ),
      },

      {
        header: "Amount",
        render: (row) => `₹${row.coins || 0}`,
      },

      {
        header: "Wallet",
        render: (row) => `₹${row.updatedBalance || 0}`,
      },

      {
        header: "Description",
        render: (row) => (
          <div className="max-w-65 truncate">
            {row.description || "-"}
          </div>
        ),
      },

      {
        header: "Date",
        render: (row) =>
          dayjs(row.createdAt).format("DD MMM YYYY hh:mm A"),
      },
    ],
    []
  );

  if (loading) {
    return (
      <div className="py-10 text-center">
        Loading wallet history...
      </div>
    );
  }

  return (
    <>
      <DataTable columns={columns} data={transactions} />

      <Pagination
        page={walletData?.currentPage || page}
        totalPages={walletData?.totalPages || 1}
        onPrevious={() => setPage((p) => p - 1)}
        onNext={() => setPage((p) => p + 1)}
      />
    </>
  );
}