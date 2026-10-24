
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useApolloClient, useLazyQuery } from "@apollo/client/react";

import DataTable from "@/components/utils/DataTable";
import ExportMenu from "@/components/Custom/ExportMenu";

import { GET_SERVICE_BANK_PAYMENT_DETAILS } from "@/app/graphQL/razorpay";
import { exportExcel } from "@/components/utils/export/exportExcel";
import { exportPDF } from "@/components/utils/export/exportPDF";
import { exportCSV } from "@/components/utils/export/exportCsv";
import { printTable } from "@/components/utils/export/exportPrint";

const money = (value) =>
  `₹${Number(value ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const exportRow = (row) => ({
  Date: formatDate(row.createdAt),
  Invoice: row.invoiceNo || "",
  "User ID": row.userId,
  "Service Type": row.serviceType,
  "Service ID": row.serviceId,
  "Booking ID": row.bookingId || "",
  Amount: row.amount,
  Provider: row.provider || "",
  Status: row.status,
  "Taxable Amount": row.taxableAmount,
  "GST Rate (%)": row.gstRate,
  CGST: row.cgst,
  SGST: row.sgst,
  IGST: row.igst,
  "Total Tax": row.totalTax,
  "Total Amount": row.totalAmount,
  "PG Charge Rate (%)": row.pgChargeRate,
  "PG Charge": row.pgCharge,
  "PG IGST": row.pgIgst,
  "PG Total": row.pgTotal,
  "Receivable Amount": row.receivableAmount,
  Country: row.country || "",
  State: row.state || "",
  City: row.city || "",
  Platform: row.platform || "",
  "Coupon ID": row.couponId || "",
  Discount: row.discount,
  Cashback: row.cashback,
  "Razorpay Order ID": row.razorpayOrderId || "",
  "Razorpay Payment ID": row.razorpayPaymentId || "",
});

export default function ServiceBankPaymentReports() {
  const client = useApolloClient();
const [combinedData, setCombinedData] = useState(null);
  const invoiceRef = useRef(null);
const [selectedInvoice, setSelectedInvoice] = useState(null);
const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);
  const [filters, setFilters] = useState({
    serviceType: "",
    status: "SUCCESS",
    page: 1,
    limit: 10,
  });

  const [selectedRows, setSelectedRows] = useState([]);

  const [getPayments, { data, loading, error }] = useLazyQuery(
    GET_SERVICE_BANK_PAYMENT_DETAILS,
    {
      fetchPolicy: "network-only",
    }
  );

 const fetchPayments = async (payload = filters) => {
  const baseVariables = {
    page: payload.page,
    limit: payload.limit,
    status: payload.status,
  };

  try {
    if (payload.serviceType === "ALL") {
      const [serviceResult, pujaResult] = await Promise.all([
        getPayments({
          variables: {
            ...baseVariables,
            serviceType: "SERVICE",
          },
          fetchPolicy: "network-only",
        }),
        client.query({
          query: GET_SERVICE_BANK_PAYMENT_DETAILS,
          variables: {
            ...baseVariables,
            serviceType: "PUJA",
          },
          fetchPolicy: "network-only",
        }),
      ]);

      const serviceData =
        serviceResult.data?.getServiceBankPaymentDetails;

      const pujaData =
        pujaResult.data?.getServiceBankPaymentDetails;

      const combinedRows = [
        ...(serviceData?.data ?? []),
        ...(pujaData?.data ?? []),
      ].sort(
        (a, b) =>
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );

      setCombinedData({
        rows: combinedRows,
        totalRecords:
          (serviceData?.pagination?.totalRecords ?? 0) +
          (pujaData?.pagination?.totalRecords ?? 0),
        totalPages: Math.max(
          serviceData?.pagination?.totalPages ?? 0,
          pujaData?.pagination?.totalPages ?? 0
        ),
        currentPage: payload.page,
        limit: payload.limit,
        pagination: {
          totalAmount:
            Number(serviceData?.pagination?.totalAmount ?? 0) +
            Number(pujaData?.pagination?.totalAmount ?? 0),
          totalTaxableAmount:
            Number(serviceData?.pagination?.totalTaxableAmount ?? 0) +
            Number(pujaData?.pagination?.totalTaxableAmount ?? 0),
          totalTax:
            Number(serviceData?.pagination?.totalTax ?? 0) +
            Number(pujaData?.pagination?.totalTax ?? 0),
          totalPgCharge:
            Number(serviceData?.pagination?.totalPgCharge ?? 0) +
            Number(pujaData?.pagination?.totalPgCharge ?? 0),
          totalPgIgst:
            Number(serviceData?.pagination?.totalPgIgst ?? 0) +
            Number(pujaData?.pagination?.totalPgIgst ?? 0),
          totalPgAmount:
            Number(serviceData?.pagination?.totalPgAmount ?? 0) +
            Number(pujaData?.pagination?.totalPgAmount ?? 0),
          totalReceivableAmount:
            Number(serviceData?.pagination?.totalReceivableAmount ?? 0) +
            Number(pujaData?.pagination?.totalReceivableAmount ?? 0),
          totalDiscount:
            Number(serviceData?.pagination?.totalDiscount ?? 0) +
            Number(pujaData?.pagination?.totalDiscount ?? 0),
          totalCashback:
            Number(serviceData?.pagination?.totalCashback ?? 0) +
            Number(pujaData?.pagination?.totalCashback ?? 0),
        },
      });

      return;
    }

    setCombinedData(null);

    await getPayments({
      variables: {
        ...baseVariables,
        serviceType: payload.serviceType,
      },
      fetchPolicy: "network-only",
    });
  } catch (error) {
    console.error("Failed to fetch service bank payments:", error);
  }
};

  useEffect(() => {
    fetchPayments(filters);   
  }, []);

const result = data?.getServiceBankPaymentDetails;

const rows =
  filters.serviceType === "ALL" && combinedData
    ? combinedData.rows
    : result?.data ?? [];

const pagination =
  filters.serviceType === "ALL" && combinedData
    ? {
        ...combinedData.pagination,
        totalRecords: combinedData.totalRecords,
        totalPages: combinedData.totalPages,
        currentPage: combinedData.currentPage,
        limit: combinedData.limit,
      }
    : result?.pagination ?? {};

  const handleFilterChange = (key, value) => {
    const updated = {
      ...filters,
      [key]: value,
      page: 1,
    };

    setFilters(updated);
    setSelectedRows([]);
    fetchPayments(updated);
  };

  const handlePageChange = (page) => {
    const updated = { ...filters, page };

    setFilters(updated);
    setSelectedRows([]);
    fetchPayments(updated);
  };

  const toggleSelection = (id) => {
    setSelectedRows((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedRows((previous) =>
      rows.length > 0 && previous.length === rows.length
        ? []
        : rows.map((row) => row.id)
    );
  };

  const currentExportData = useMemo(
    () => rows.map(exportRow),
    [rows]
  );

  const selectedExportData = useMemo(
    () =>
      rows
        .filter((row) => selectedRows.includes(row.id))
        .map(exportRow),
    [rows, selectedRows]
  );

  const exportData =
    selectedRows.length > 0
      ? selectedExportData
      : currentExportData;

  const handleExportAll = async () => {
    try {
      // Fetch all records using the currently applied filters.
      // The backend must allow a limit large enough for this request.
      const { data: allResult } = await client.query({
        query: GET_SERVICE_BANK_PAYMENT_DETAILS,
        variables: {
          page: 1,
          limit: Math.max(Number(pagination.totalRecords) || 0, 1),
          serviceType: filters.serviceType,
          status: filters.status,
        },
        fetchPolicy: "network-only",
      });

      const allRows =
        allResult?.getServiceBankPaymentDetails?.data ?? [];

      exportExcel(allRows.map(exportRow));
    } catch (exportError) {
      console.error("Export all payments failed:", exportError);
    }
  };


const handleDownloadInvoice = async (row) => {
  if (downloadingInvoiceId) return;

  try {
    setDownloadingInvoiceId(row.id);
    setSelectedInvoice(row);

    // Wait for the hidden invoice to render.
    await new Promise((resolve) =>
      requestAnimationFrame(() =>
        requestAnimationFrame(resolve)
      )
    );

    if (!invoiceRef.current) {
      throw new Error("Invoice element not found");
    }

    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const ratio = canvas.width / canvas.height;

    let imgWidth = pageWidth;
    let imgHeight = pageWidth / ratio;

    if (imgHeight > pageHeight) {
      imgHeight = pageHeight;
      imgWidth = pageHeight * ratio;
    }

    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      x,
      y,
      imgWidth,
      imgHeight,
      undefined,
      "FAST"
    );

    pdf.save(`Invoice-${row.invoiceNo || row.id}.pdf`);
  } catch (error) {
    console.error("Invoice download failed:", error);
  } finally {
    setSelectedInvoice(null);
    setDownloadingInvoiceId(null);
  }
};

  const cards = [
    {
      title: "Total Records",
      value: pagination.totalRecords ?? 0,
      color: "text-purple-600",
    },
    {
      title: "Total Amount",
      value: money(pagination.totalAmount),
      color: "text-blue-600",
    },
    {
      title: "Taxable Amount",
      value: money(pagination.totalTaxableAmount),
      color: "text-indigo-600",
    },
    {
      title: "Total Tax",
      value: money(pagination.totalTax),
      color: "text-orange-600",
    },
    {
      title: "PG Charges",
      value: money(pagination.totalPgCharge),
      color: "text-pink-600",
    },
    {
      title: "PG IGST",
      value: money(pagination.totalPgIgst),
      color: "text-amber-600",
    },
    {
      title: "PG Total",
      value: money(pagination.totalPgAmount),
      color: "text-red-600",
    },
    {
      title: "Receivable Amount",
      value: money(pagination.totalReceivableAmount),
      color: "text-green-600",
    },
    {
      title: "Total Discount",
      value: money(pagination.totalDiscount),
      color: "text-cyan-600",
    },
    {
      title: "Total Cashback",
      value: money(pagination.totalCashback),
      color: "text-teal-600",
    },
  ];

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          aria-label="Select all rows on this page"
          checked={
            rows.length > 0 && selectedRows.length === rows.length
          }
          onChange={toggleSelectAll}
        />
      ),
      render: (row) => (
        <input
          type="checkbox"
          aria-label={`Select payment ${row.id}`}
          checked={selectedRows.includes(row.id)}
          onChange={() => toggleSelection(row.id)}
        />
      ),
      width: "35px",
    },
     {
      header: "Date",
      render: (row) => (
        <div className="text-[10px] whitespace-nowrap">
          <p className="font-medium">
            {new Date(row.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>

          <p className="text-[10px] text-gray-500">
            {new Date(row.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      ),
    },

    {
      header: "User ID",
      render: (row) => (
        <span className="block max-w-36 break-all text-xs">
          {row.userId.slice(0,8)}
        </span>
      ),
    },
    {
      header: "Service / Booking",
      render: (row) => (
        <div className="space-y-1 text-xs">
        
          <p className="break-all">
            <span className="text-gray-500">Service: </span>
            {row.serviceId}
          </p>
            <p>
            <span className="text-gray-500">Type: </span>
            {row.serviceType}
          </p>
          {/* <p className="break-all">
            <span className="text-gray-500">Booking: </span>
            {row.bookingId || "-"}
          </p> */}
        </div>
      ),
    },
    {
      header: "Payment",
      render: (row) => (
        <div className="space-y-1 text-xs">
          <p>Amount: {money(row.amount)}</p>
          <p>Total: {money(row.totalAmount)}</p>
          <p>Provider: {row.provider || "-"}</p>
        </div>
      ),
    },
    {
      header: "GST",
      render: (row) => (
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
          <span>Rate: {row.gstRate ?? 0}%</span>
          <span>Tax: {money(row.totalTax)}</span>
          <span>CGST: {money(row.cgst)}</span>
          <span>SGST: {money(row.sgst)}</span>
          <span>IGST: {money(row.igst)}</span>
          <span>Taxable: {money(row.taxableAmount)}</span>
        </div>
      ),
    },
    {
      header: "PG Charges",
      render: (row) => (
        <div className="space-y-1 text-[10px]">
          <p>Rate: {row.pgChargeRate ?? 0}%</p>
          <p>Charge: {money(row.pgCharge)}</p>
          <p>IGST: {money(row.pgIgst)}</p>
          <p>Total: {money(row.pgTotal)}</p>
        </div>
      ),
    },
    {
      header: "Receivable",
      render: (row) => (
        <span className="whitespace-nowrap text-xs font-bold text-green-700">
          {money(row.receivableAmount)}
        </span>
      ),
    },
    {
      header: "Discount / Cashback",
      render: (row) => (
        <div className="space-y-1 text-xs">
          <p>Discount: {money(row.discount)}</p>
          <p>Cashback: {money(row.cashback)}</p>
          <p className="break-all">
            Coupon: {row.couponId || "-"}
          </p>
        </div>
      ),
    },
    {
      header: "Location",
      render: (row) => (
        <div className="space-y-1 text-xs">
          <p>{row.city || "-"}</p>
          <p>{row.state || "-"}</p>
          <p>{row.country || "-"}</p>
        </div>
      ),
    },
    {
      header: "Platform",
      render: (row) => {
        const styles = {
          WEB: "bg-blue-100 text-blue-700",
          ANDROID: "bg-green-100 text-green-700",
          IOS: "bg-gray-200 text-gray-700",
        };

        return (
          <span
            className={`rounded-full px-2 py-1 text-xs ${
              styles[row.platform] || "bg-gray-100 text-gray-600"
            }`}
          >
            {row.platform || "-"}
          </span>
        );
      },
    },
    {
      header: "Order / Payment ID",
      render: (row) => (
        <div className="max-w-44 space-y-1 break-all text-xs">
          <p>Order: {row.razorpayOrderId || "-"}</p>
          <p>Payment: {row.razorpayPaymentId || "-"}</p>
        </div>
      ),
    },
    {
      header: "Status",
      render: (row) => {
        const styles = {
          SUCCESS: "bg-green-100 text-green-700",
          FAILED: "bg-red-100 text-red-700",
          PENDING: "bg-yellow-100 text-yellow-700",
          CREATED: "bg-blue-100 text-blue-700",
        };

        return (
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold ${
              styles[row.status] || "bg-gray-100 text-gray-600"
            }`}
          >
            {row.status || "-"}
          </span>
        );
      },
    },
    {
  header: "Invoice",
  render: (row) => (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold">
        {row.invoiceNo || "-"}
      </span>

      <button
        type="button"
        onClick={() => handleDownloadInvoice(row)}
        disabled={Boolean(downloadingInvoiceId)}
        title="Download Invoice"
        className="rounded-md p-1 text-blue-600 hover:bg-blue-50 disabled:opacity-40"
      >
        {downloadingInvoiceId === row.id ? (
          <span className="text-xs">...</span>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v12" />
            <path d="m7 10 5 5 5-5" />
            <path d="M5 17v3h14v-3" />
          </svg>
        )}
      </button>
    </div>
  ),
},
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">
          Service Bank Payment Reports
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View service payment, GST, payment gateway charges and receivables.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-gray-500">{card.title}</p>
            <p className={`mt-2 break-words text-lg font-bold ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters and exports */}
      <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium">
            Service Type
            <select
              value={filters.serviceType}
              onChange={(event) =>
                handleFilterChange("serviceType", event.target.value)
              }
              className="ml-2 rounded-lg border px-3 py-2"
            >
                     <option value="ALL">ALL</option>
              <option value="SERVICE">SERVICE</option>
                <option value="PUJA">PUJA</option>
            </select>
          </label>

          <label className="text-sm font-medium">
            Status
            <select
              value={filters.status}
              onChange={(event) =>
                handleFilterChange("status", event.target.value)
              }
              className="ml-2 rounded-lg border px-3 py-2"
            >
              <option value="SUCCESS">SUCCESS</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
            </select>
          </label>

          <label className="text-sm font-medium">
            Rows
            <select
              value={filters.limit}
              onChange={(event) =>
                handleFilterChange("limit", Number(event.target.value))
              }
              className="ml-2 rounded-lg border px-3 py-2"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>

          <button
            onClick={() => fetchPayments(filters)}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

          <ExportMenu
            onExcel={() => exportExcel(exportData)}
            onCSV={() => exportCSV(exportData, "Service Bank Payments")}
            onPDF={() =>
              exportPDF(
                exportData,
                "Service Bank Payment Reports",
                "ServiceBankPayments.pdf"
              )
            }
            onPrint={() => printTable()}
            onExportCurrent={() =>
              exportExcel(
                currentExportData,
                "Service Bank Payments",
                "ServiceBankPayments.xlsx"
              )
            }
            onExportAll={handleExportAll}
          />
        </div>

        <p className="text-xs text-gray-500">
          {selectedRows.length > 0
            ? `${selectedRows.length} row(s) selected for export.`
            : "Select rows to export only selected payments; otherwise exports use the current page."}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {loading && !data ? (
          <div className="py-20 text-center">Loading payments...</div>
        ) : error && !data ? (
          <div className="space-y-3 py-20 text-center">
            <p className="text-red-600">{error.message}</p>
            <button
              onClick={() => fetchPayments(filters)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {result?.success === false && (
              <p className="p-4 text-red-600">
                {result.message || "Unable to fetch payment details."}
              </p>
            )}

            <div className="overflow-x-auto">
              <div className="min-w-[1900px]">
                <DataTable columns={columns} data={rows} />
              </div>
            </div>

            {loading && (
              <p className="px-4 py-2 text-sm text-gray-500">
                Refreshing payment data...
              </p>
            )}

            {error && (
              <p className="px-4 py-2 text-sm text-red-600">
                Refresh failed: {error.message}
              </p>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold">
            {pagination.totalRecords
              ? (filters.page - 1) * filters.limit + 1
              : 0}
          </span>
          {" "}to{" "}
          <span className="font-semibold">
            {Math.min(
              filters.page * filters.limit,
              pagination.totalRecords ?? 0
            )}
          </span>
          {" "}of{" "}
          <span className="font-semibold">
            {pagination.totalRecords ?? 0}
          </span>{" "}
          records
        </p>

        <div className="flex items-center gap-2">
          <button
            disabled={filters.page <= 1 || loading}
            onClick={() => handlePageChange(1)}
            className="rounded-lg border px-3 py-2 disabled:opacity-40"
          >
            {"<<"}
          </button>

          <button
            disabled={filters.page <= 1 || loading}
            onClick={() => handlePageChange(filters.page - 1)}
            className="rounded-lg border px-4 py-2 disabled:opacity-40"
          >
            Previous
          </button>

          <span className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white">
            {pagination.currentPage ?? filters.page}
          </span>

          <span className="self-center text-sm text-gray-500">
            of {pagination.totalPages ?? 0}
          </span>

          <button
            disabled={
              loading ||
              filters.page >= (pagination.totalPages ?? 0)
            }
            onClick={() => handlePageChange(filters.page + 1)}
            className="rounded-lg border px-4 py-2 disabled:opacity-40"
          >
            Next
          </button>

          <button
            disabled={
              loading ||
              filters.page >= (pagination.totalPages ?? 0)
            }
            onClick={() => handlePageChange(pagination.totalPages)}
            className="rounded-lg border px-3 py-2 disabled:opacity-40"
          >
            {">>"}
          </button>
        </div>
      </div>
    </div>
  );
}
