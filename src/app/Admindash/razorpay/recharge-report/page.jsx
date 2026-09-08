"use client";

import { useEffect, useRef, useState } from "react";
import { useApolloClient, useLazyQuery } from "@apollo/client/react";
import DataTable from "@/components/utils/DataTable";
import { GET_PAYMENT_REPORTS } from "@/app/graphQL/razorpay";
import PaymentInvoice from "../PaymentInvoice";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { exportExcel } from "@/components/utils/export/exportExcel";
import { exportPDF } from "@/components/utils/export/exportPDF";
import { exportCSV } from "@/components/utils/export/exportCsv";
import { printTable } from "@/components/utils/export/exportPrint";
import ExportMenu from "@/components/Custom/ExportMenu";
export default function RazorpayReports() {
  const [filters, setFilters] = useState({
    query: "",
    status: "",
    provider: "",
    platform: "",
    country: "",
    filterType: "MONTH",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    page: 1,
    limit: 10,
  });
  const client = useApolloClient();

  const [selectedRows, setSelectedRows] = useState([]);

  const toggleSelection = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === reportData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(reportData.map((x) => x.id));
    }
  };
  const [searchText, setSearchText] = useState("");

  const [getReports, { data, loading, error }] = useLazyQuery(
    GET_PAYMENT_REPORTS,
    {
      fetchPolicy: "network-only",
    },
  );

  const buildSearchInput = (payload) => ({
    ...(payload.query && { query: payload.query }),
    ...(payload.status && { status: payload.status }),
    ...(payload.provider && { provider: payload.provider }),
    ...(payload.platform && { platform: payload.platform }),
    ...(payload.country && { country: payload.country }),
    ...(payload.filterType && { filterType: payload.filterType }),

    ...(payload.filterType === "CUSTOM" &&
      payload.startDate &&
      payload.endDate && {
        startDate: payload.startDate,
        endDate: payload.endDate,
      }),

    ...(payload.minAmount && {
      minAmount: Number(payload.minAmount),
    }),

    ...(payload.maxAmount && {
      maxAmount: Number(payload.maxAmount),
    }),

    page: payload.page,
    limit: payload.limit,
  });

  const fetchReports = (payload = filters) => {
    getReports({
      variables: {
        searchInput: buildSearchInput(payload),
      },
    });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSearch = () => {
    const updated = {
      ...filters,
      query: searchText,
      page: 1,
    };

    setFilters(updated);
    fetchReports(updated);
  };

  const handleFilterChange = (key, value) => {
    const updated = {
      ...filters,
      [key]: value,
      page: 1,
    };

    setFilters(updated);

    if (updated.filterType !== "CUSTOM") {
      fetchReports(updated);
    }
  };

  const resetFilters = () => {
    const reset = {
      query: "",
      status: "",
      provider: "",
      platform: "",
      country: "",
      filterType: "MONTH",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
      page: 1,
      limit: 10,
    };

    setSearchText("");
    setFilters(reset);
    fetchReports(reset);
  };

  const handlePageChange = (page) => {
    const updated = {
      ...filters,
      page,
    };

    setFilters(updated);
    fetchReports(updated);
  };

  const reportData = data?.getPaymentReports?.data || [];
  const summary = data?.getPaymentReports || {};
  const currentExportData = reportData.map((x) => ({
    Date: new Date(x.createdAt).toLocaleString("en-IN"),

    Invoice: x.invoiceNo,

    Customer: x.userName,

    Mobile: x.mobile,

    RechargePack: x.rechargePackName,

    Coins: x.coins,

    PaidAmount: x.amount,

    TaxableAmount: x.taxableAmount,

    GST: x.gstRate,

    CGST: x.cgst,

    SGST: x.sgst,

    IGST: x.igst,

    TotalTax: x.totalTax,

    TotalAmount: x.totalAmount,

    PGCharge: x.pgCharge,

    PGTotal: x.pgTotal,

    ReceivableAmount: x.receivableAmount,

    Platform: x.platform,

    Provider: x.provider,

    Status: x.status,

    City: x.city,

    State: x.state,

    Country: x.country,

    OrderId: x.razorpayOrderId,

    PaymentId: x.razorpayPaymentId,
  }));
  const selectedExportData = reportData
    .filter((x) => selectedRows.includes(x.id))
    .map((x) => ({
      Date: new Date(x.createdAt).toLocaleString("en-IN"),

      Invoice: x.invoiceNo,

      Customer: x.userName,

      Mobile: x.mobile,

      RechargePack: x.rechargePackName,

      Coins: x.coins,

      PaidAmount: x.amount,

      TaxableAmount: x.taxableAmount,

      GST: x.gstRate,

      CGST: x.cgst,

      SGST: x.sgst,

      IGST: x.igst,

      TotalTax: x.totalTax,

      TotalAmount: x.totalAmount,

      PGCharge: x.pgCharge,

      PGTotal: x.pgTotal,

      ReceivableAmount: x.receivableAmount,

      Platform: x.platform,

      Provider: x.provider,

      Status: x.status,

      City: x.city,

      State: x.state,

      Country: x.country,

      OrderId: x.razorpayOrderId,

      PaymentId: x.razorpayPaymentId,
    }));
  const exportData =
    selectedRows.length > 0 ? selectedExportData : currentExportData;
  const handleExportAll = async () => {
    const { data } = await client.query({
      query: GET_PAYMENT_REPORTS,
      variables: {
        searchInput: {
          ...buildSearchInput(filters),
          page: 1,
          limit: 100000,
        },
      },
      fetchPolicy: "network-only",
    });

    const allData =
      data?.getPaymentReports?.data?.map((x) => ({
        Date: new Date(x.createdAt).toLocaleString("en-IN"),

        Invoice: x.invoiceNo,

        Customer: x.userName,

        Mobile: x.mobile,

        RechargePack: x.rechargePackName,

        Coins: x.coins,

        PaidAmount: x.amount,

        TaxableAmount: x.taxableAmount,

        GST: x.gstRate,

        CGST: x.cgst,

        SGST: x.sgst,

        IGST: x.igst,

        TotalTax: x.totalTax,

        TotalAmount: x.totalAmount,

        PGCharge: x.pgCharge,

        PGTotal: x.pgTotal,

        ReceivableAmount: x.receivableAmount,

        Platform: x.platform,

        Provider: x.provider,

        Status: x.status,

        City: x.city,

        State: x.state,

        Country: x.country,

        OrderId: x.razorpayOrderId,

        PaymentId: x.razorpayPaymentId,
      })) || [];

    exportExcel(allData);
  };
  const cards = [
    {
      title: "Total Amount",
      value: `₹${Number(summary.totalAmount || 0).toFixed(1)}`,
      color: "text-green-600",
    },
    {
      title: "Total Paid Amount",
      value: `₹${summary?.paidAmount?.toFixed?.(2) ?? "0.00"}`,
      color: "text-blue-600",
    },
    {
      title: "Failed Amount",
      value: `₹${summary.failedAmount || 0}`,
      color: "text-red-600",
    },
    {
      title: "Total Transactions",
      value: summary.totalCount || 0,
      color: "text-purple-600",
    },

    {
      title: "Total GST",
      value: `₹${summary.totalGST || 0}`,
      color: "text-pink-600",
    },
    {
      title: " Total CGST",
      value: `₹${summary.totalCGST || 0}`,
      color: "text-orange-600",
    },
    {
      title: "Total SGST / IGST",
      value: `₹${summary.totalSGST || 0}`,
      color: "text-indigo-600",
    },
    {
      title: "Total Pg Charges",
      value: `₹${Number(summary.totalPGCharge || 0).toFixed(1)}`,
      color: "text-indigo-600",
    },
  ];
const invoiceRef = useRef(null);
const [selectedInvoice, setSelectedInvoice] = useState(null);

const handleDownloadInvoice = async (row) => {
  setSelectedInvoice(row);

  // Invoice component ko DOM me render hone ka time do
  setTimeout(async () => {
    try {
      if (!invoiceRef.current) {
        console.error("Invoice element not found");
        return;
      }

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = 210;
      const pdfHeight = 297;

      const imgWidth = pdfWidth;
      const imgHeight =
        (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(
        imgData,
        "PNG",
        0,
        position,
        imgWidth,
        imgHeight
      );

      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;

        pdf.addPage();

        pdf.addImage(
          imgData,
          "PNG",
          0,
          position,
          imgWidth,
          imgHeight
        );

        heightLeft -= pdfHeight;
      }

      pdf.save(`Invoice-${row.invoiceNo || row.id}.pdf`);
    } catch (error) {
      console.error("Invoice PDF download failed:", error);
    }
  }, 300);
};
  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={
            selectedRows.length === reportData.length && reportData.length > 0
          }
          onChange={toggleSelectAll}
        />
      ),

      render: (row) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.id)}
          onChange={() => toggleSelection(row.id)}
        />
      ),

      width: "30px",
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
      header: "Customer",
      render: (row) => (
        <div>
          <p className="font-semibold text-[10px]">{row.userName || "-"}</p>

          <p className="text-[10px] text-gray-500">{row.mobile || "-"}</p>
        </div>
      ),
    },

    {
      header: "Service",
      render: (row) => (
        <div>
          <p className=" text-[10px]">{row.rechargePackName || "-"}</p>
        </div>
      ),
    },

    {
      header: "Amount",
      render: (row) => (
        <div>
          <p className="text-[10px] text-gray-500">Amount : ₹{row.coins} </p>
          <p className="font-semibold text-[10px] "> Paid : ₹{row.amount}</p>
        </div>
      ),
    },

    {
      header: "Taxable",
      render: (row) => <span>₹{row.taxableAmount ?? "-"}</span>,
    },

    {
      header: "GST",
      render: (row) => (
        <div className="text-[10px] grid grid-cols-2 leading-5">
          <div>GST: {row.gstRate || 0}%</div>
          <div>IGST: ₹{row.igst || 0}</div>
          <div>CGST: ₹{row.cgst || 0}</div>

          <div>SGST: ₹{row.sgst || 0}</div>
        </div>
      ),
    },

    {
      header: "Tax",
      render: (row) => (
        <span className="font-medium text-[10px]">₹{row.totalTax || 0}</span>
      ),
    },

    {
      header: "Total",
      render: (row) => (
        <span className="font-bold text-xs text-blue-600">
          ₹{row.totalAmount || 0}
        </span>
      ),
    },
    {
      header: "PG Rates",
      render: (row) => (
        <span className=" text-[10px]">{row.pgChargeRate || 0}%</span>
      ),
    },
    {
      header: "PG Charges",
      render: (row) => (
        <div className=" text-[10px] grid grid-cols-1 gap-1 ">
          <span className=" ">Amount : ₹{row.pgCharge || 0}</span>
          <span className=" ">IGST : ₹{row.pgIgst || 0}</span>
          <span className=" text-[10px]">Total : ₹{row.pgTotal || 0}</span>
        </div>
      ),
    },

    {
      header: "Recievable Amount ",
      render: (row) => (
        <span className="font-bold text-xs text-blue-600">
          ₹{row.receivableAmount || 0}
        </span>
      ),
    },

    {
      header: "Location",
      render: (row) => (
        <div className="text-[10px] flex flex-wrap gap-1">
          <div>{row.city || "-"}</div>

          <div>{row.state || "-"}</div>

          <div className="text-gray-500">{row.country || "-"}</div>
        </div>
      ),
    },

    {
      header: "Platform",
      render: (row) => {
        const styles = {
          WEB: "bg-blue-100  text-blue-700",
          ANDROID: "bg-green-100 text-green-700",
          IOS: "bg-gray-200 text-gray-700",
        };

        return (
          <span
            className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
              styles[row.platform] || "bg-gray-100 text-gray-600"
            }`}
          >
            {row.platform}
          </span>
        );
      },
    },

    {
      header: "Order ID",
      render: (row) => (
        <div className="max-w-[170px] break-all text-[10px]">
          {row.razorpayOrderId?.slice(0, 10)}
        </div>
      ),
    },

    {
      header: "Payment ID",
      render: (row) => (
        <div className="max-w-[170px] break-all text-[10px]">
          {row.razorpayPaymentId?.slice(0, 10)}
        </div>
      ),
    },

    {
      header: "Status",
      render: (row) => {
        const styles = {
          SUCCESS: "bg-green-100 text-[10px] text-green-700",

          PAID: "bg-green-100 text-[10px] text-green-700",

          FAILED: "bg-red-100 text-[10px] text-red-700",

          PENDING: "bg-yellow-100 text-[10px] text-yellow-700",

          CREATED: "bg-yellow-100 text-[10px] text-yellow-700",
        };

        return (
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-semibold ${
              styles[row.status] || "bg-gray-100 text-gray-600"
            }`}
          >
            {row.status.slice(0, 1)}
          </span>
        );
      },
    },
    {
      header: "Invoice",

      render: (row) => (
        <div className="flex gap-1 items-center">
          <p className="font-semibold text-[10px]">{row.invoiceNo || "-"}</p>

          <button className="cursor-pointer"
        onClick={() => handleDownloadInvoice(row)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height={18}
              width={18}
              viewBox="0 0 640 640"
            >
              <path
                fill="rgb(30, 48, 80)"
                d="M352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 306.7L246.6 265.3C234.1 252.8 213.8 252.8 201.3 265.3C188.8 277.8 188.8 298.1 201.3 310.6L297.3 406.6C309.8 419.1 330.1 419.1 342.6 406.6L438.6 310.6C451.1 298.1 451.1 277.8 438.6 265.3C426.1 252.8 405.8 252.8 393.3 265.3L352 306.7L352 96zM160 384C124.7 384 96 412.7 96 448L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 448C544 412.7 515.3 384 480 384L433.1 384L376.5 440.6C345.3 471.8 294.6 471.8 263.4 440.6L206.9 384L160 384zM464 440C477.3 440 488 450.7 488 464C488 477.3 477.3 488 464 488C450.7 488 440 477.3 440 464C440 450.7 450.7 440 464 440z"
              />
            </svg>
          </button>
        </div>
      ),
    },
  ];
  return (
    <div className="p- space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payment Reports</h1>
      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-2xl border border-gray-300 shadow-sm p-4"
          >
            <p className="text-xs text-gray-500">{card.title}</p>

            <h2 className={`text-xl font-bold mt-2 ${card.color}`}>
              {card.value}
            </h2>
          </div>
        ))}
      </div>

      {/* FILTERS */}

      <div className="bg-white rounded-xl border shadow-sm p-5 space-y-5">
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 flex gap-2">
            <input
              className="border rounded-full border-gray-300 px-4 py-2 w-full"
              placeholder="Search Customer / Invoice / Order / Payment ID"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            <button
              onClick={handleSearch}
              className="bg-indigo-600 text-white px-5 rounded-full"
            >
              Search
            </button>
          </div>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="border rounded-full border-gray-300 px-3"
          >
            <option value="">All Status</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
            <option value="PENDING">PENDING</option>
          </select>

          <select
            value={filters.platform}
            onChange={(e) => handleFilterChange("platform", e.target.value)}
            className="border rounded-full border-gray-300 px-3"
          >
            <option value="">Platform</option>
            <option value="ANDROID">Android</option>
            <option value="IOS">IOS</option>
            <option value="WEB">Web</option>
          </select>
        </div>

        <div className="grid md:grid-cols-7 gap-4">
          <select
            value={filters.country}
            onChange={(e) => handleFilterChange("country", e.target.value)}
            className="border rounded-full border-gray-300 px-3"
          >
            <option value="">Country</option>
            <option value="India">India</option>
          </select>

          <select
            value={filters.filterType}
            onChange={(e) => handleFilterChange("filterType", e.target.value)}
            className="border rounded-full border-gray-300 px-3"
          >
            <option value="TODAY">Today</option>
            <option value="WEEK">Week</option>
            <option value="MONTH">Month</option>
            <option value="YEAR">Year</option>
            <option value="CUSTOM">Custom</option>
          </select>

          <input
            type="number"
            placeholder="Min Amount"
            className="border rounded-full border-gray-300 px-3"
            value={filters.minAmount}
            onChange={(e) =>
              setFilters({
                ...filters,
                minAmount: e.target.value,
              })
            }
          />

          <input
            type="number"
            placeholder="Max Amount"
            className="border rounded-full border-gray-300 px-3"
            value={filters.maxAmount}
            onChange={(e) =>
              setFilters({
                ...filters,
                maxAmount: e.target.value,
              })
            }
          />

          <button
            onClick={() => fetchReports(filters)}
            className="bg-green-600 text-white rounded-full border-gray-300"
          >
            Apply
          </button>

          <button
            onClick={resetFilters}
            className="border rounded-full border-gray-300"
          >
            Reset
          </button>
          <ExportMenu
            onExcel={() => exportExcel(exportData)}
            onCSV={() => exportCSV(currentExportData, "Payment Reports")}
            onPDF={() =>
              exportPDF(
                currentExportData,
                "Payment Reports",
                "PaymentReports.pdf",
              )
            }
            onPrint={() => printTable()}
            onExportCurrent={() =>
              exportExcel(
                currentExportData,
                "Payment Reports",
                "PaymentReports.xlsx",
              )
            }
            onExportAll={handleExportAll}
          />
        </div>

        {filters.filterType === "CUSTOM" && (
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="date"
              className="border rounded-lg px-3 py-2"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  startDate: e.target.value,
                })
              }
            />

            <input
              type="date"
              className="border rounded-lg px-3 py-2"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  endDate: e.target.value,
                })
              }
            />

            <button
              onClick={() => fetchReports(filters)}
              className="bg-indigo-600 text-white rounded-lg"
            >
              Apply Date Filter
            </button>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">Loading...</div>
        ) : error ? (
          <div className="py-20 text-center text-red-500">{error.message}</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[1900px]">
              <DataTable columns={columns} data={reportData} />
            </div>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {/* FOOTER */}

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold">
            {(filters.page - 1) * filters.limit + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold">
            {Math.min(filters.page * filters.limit, summary.totalCount || 0)}
          </span>{" "}
          of <span className="font-semibold">{summary.totalCount || 0}</span>
          entries
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={filters.page === 1}
            onClick={() => handlePageChange(1)}
            className="border rounded-lg px-3 py-2 disabled:opacity-40"
          >
            {"<<"}
          </button>

          <button
            disabled={filters.page === 1}
            onClick={() => handlePageChange(filters.page - 1)}
            className="border rounded-lg px-4 py-2 disabled:opacity-40"
          >
            Previous
          </button>

          <span className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold">
            {filters.page}
          </span>

          <button
            disabled={filters.page >= (summary.totalPages || 1)}
            onClick={() => handlePageChange(filters.page + 1)}
            className="border rounded-lg px-4 py-2 disabled:opacity-40"
          >
            Next
          </button>

          <button
            disabled={filters.page >= (summary.totalPages || 1)}
            onClick={() => handlePageChange(summary.totalPages)}
            className="border rounded-lg px-3 py-2 disabled:opacity-40"
          >
            {">>"}
          </button>
        </div>
      </div>
  <div
  style={{
    position: "fixed",
    left: "-10000px",
    top: 0,
    width: "794px",
    background: "#ffffff",
  }}
>
  {selectedInvoice && (
    <PaymentInvoice
      ref={invoiceRef}
      data={selectedInvoice}
    />
  )}
</div>
    </div>
  );
}
