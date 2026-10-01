"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import DataTable from "@/components/utils/DataTable";

const GET_PAYMENT_REPORT = gql`
  query GetPaymentReport(
    $page: Int
    $limit: Int
    $search: String
    $startDate: String
    $endDate: String
  ) {
    getPaymentReport(
      page: $page
      limit: $limit
      search: $search
      startDate: $startDate
      endDate: $endDate
    ) {
      totalCount

      data {
        id
        date
        invoiceNo
        customer
        customerPhone
        type
        country
        state
        city
        amount
        gstRate
        igst
        cgst
        sgst
        total
        pgChargesRate
        pgCharges
        pgIgst
        pgTotal
        receivablePayment
        status
        platform
        invoiceUrl
      }
    }
  }
`;

export default function PaymentReportPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    search: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setFilters((prev) => ({
        ...prev,
        search: searchTerm,
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleDateSearch = () => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      startDate,
      endDate,
    }));
  };

  const queryVariables = {
    page,
    limit,
  };

  if (filters.search) {
    queryVariables.search = filters.search;
  }

  if (filters.startDate) {
    queryVariables.startDate = filters.startDate;
  }

  if (filters.endDate) {
    queryVariables.endDate = filters.endDate;
  }

  const { data, loading, error } = useQuery(GET_PAYMENT_REPORT, {
    variables: queryVariables,
    fetchPolicy: "network-only",
  });

  const transactions = data?.getPaymentReport?.data || [];
  const totalCount = data?.getPaymentReport?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / limit);

  const handleCopy = () => {
    const rows = transactions
      .map((row) =>
        [
          row.date,
          row.invoiceNo,
          row.customer,
          row.customerPhone,
          row.type,
          row.country,
          row.state,
          row.city,
          row.amount,
          row.total,
          row.receivablePayment,
          row.status,
          row.platform,
        ].join("\t"),
      )
      .join("\n");

    navigator.clipboard?.writeText(rows);
  };

  const handleExportExcel = () => {
  };

  const handleExportPDF = () => {
  };

  const columns = useMemo(
    () => [
      {
        header: "S.NO",
        render: (row, index) => (page - 1) * limit + index + 1,
      },
      {
        header: "Date",
        render: (row) =>
          row.date ? new Date(row.date).toLocaleDateString() : "-",
      },
      {
        header: "Invoice No",
        accessor: "invoiceNo",
      },
      {
        header: "Customer",
        accessor: "customer",
      },
      {
        header: "Customer Phone",
        accessor: "customerPhone",
      },
      {
        header: "Type",
        render: (row) => (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            {row.type}
          </span>
        ),
      },
      {
        header: "Country",
        accessor: "country",
      },
      {
        header: "State",
        accessor: "state",
      },
      {
        header: "City",
        accessor: "city",
      },
      {
        header: "Amount",
        render: (row) => `${Number(row.amount ?? 0).toFixed(2)}`,
      },
      {
        header: "GST Rate",
        render: (row) => (row.gstRate != null ? `${row.gstRate}%` : "-"),
      },
      {
        header: "IGST",
        render: (row) => (row.igst != null ? row.igst : "-"),
      },
      {
        header: "CGST",
        render: (row) => (row.cgst != null ? row.cgst : "-"),
      },
      {
        header: "SGST",
        render: (row) => (row.sgst != null ? row.sgst : "-"),
      },
      {
        header: "Total",
        render: (row) => `${Number(row.total ?? 0).toFixed(2)}`,
      },
      {
        header: "PG Charges Rate",
        render: (row) =>
          row.pgChargesRate != null ? `${row.pgChargesRate}%` : "-",
      },
      {
        header: "PG Charges",
        render: (row) => (row.pgCharges != null ? row.pgCharges : "-"),
      },
      {
        header: "IGST",
        render: (row) => (row.pgIgst != null ? row.pgIgst : "-"),
      },
      {
        header: "Total",
        render: (row) =>
          row.pgTotal != null ? Number(row.pgTotal).toFixed(2) : "-",
      },
      {
        header: "Receivable Payment",
        render: (row) =>
          row.receivablePayment != null
            ? Number(row.receivablePayment).toFixed(2)
            : "-",
      },
      {
        header: "Status",
        render: (row) => (
          <span
            className={`text-xs font-semibold capitalize ${
              row.status === "captured"
                ? "text-green-600"
                : row.status === "failed"
                  ? "text-red-600"
                  : "text-yellow-600"
            }`}
          >
            {row.status}
          </span>
        ),
      },
      {
        header: "Platform",
        accessor: "platform",
      },
      {
        header: "Invoice",
        render: (row) =>
          row.invoiceUrl ? (
            <a
              href={row.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 underline text-xs"
            >
              View
            </a>
          ) : (
            "-"
          ),
      },
    ],
    [page],
  );

  if (error) {
    return <p className="p-10 text-red-500">Error loading payment report</p>;
  }

  return (
    <div className="p-10 space-y-6">
      <h1 className="text-2xl font-bold">Payment Report</h1>

      <div className="bg-white p-5 rounded-xl shadow border space-y-4">
        <h2 className="font-semibold text-gray-700">Payment Report</h2>

        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded-lg px-4 py-2 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded-lg px-4 py-2 outline-none"
            />
          </div>

          <button
            onClick={handleDateSearch}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium w-fit"
          >
            Search
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-700 mr-2">
              Rozar Pay Details
            </h2>

            <button
              onClick={handleCopy}
              className="border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Copy
            </button>

            <button
              onClick={handleExportExcel}
              className="border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Excel
            </button>

            <button
              onClick={handleExportPDF}
              className="border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              PDF
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Search:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-lg px-3 py-1.5 outline-none text-sm"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto border-t">
          {loading ? (
            <div className="p-10 text-center">Loading Report...</div>
          ) : (
            <DataTable columns={columns} data={transactions} />
          )}
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-end gap-2 p-5">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              page === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            ‹ Previous
          </button>

          {Array.from({ length: totalPages || 1 }, (_, i) => i + 1)
            .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
            .map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-8 w-8 rounded-full text-sm ${
                  p === page
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {p}
              </button>
            ))}

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              page >= totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Next ›
          </button>
        </div>
      </div>
    </div>
  );
}
