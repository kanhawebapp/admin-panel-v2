"use client";

import Image from "next/image";
import React from "react";

const PaymentInvoice = React.forwardRef(({ data }, ref) => {
  const COMPANY_DETAILS = {
  name: "DHWANI ASTRO",
  gstin: "07ABBFM1961C1ZN",
  website: "www.dhwaniastro.com",
  email: "support@dhwaniastro.com",
  address:
    "2ND FLOOR, 1511/2B, Kotla Mubarakpur, Bhishma Pitamah Marg, Wazir Nagar, New Delhi, South East Delhi, Delhi, 110003",
};
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const money = (value) => {
    const num = Number(value || 0);
    return num.toFixed(2);
  };

  return (
    <>
    <style jsx global>{`
  @page {
    size: A4 portrait;
    margin: 0;
  }

  @media print {
    html,
    body {
      width: 210mm;
      margin: 0;
      padding: 0;
      background: white;
    }

    body {
      display: flex;
      justify-content: center;
    }

.invoice-page {
  width: 210mm;
  min-height: 0;
  margin: 0 auto;
  box-sizing: border-box;
}
  }
`}</style>
<div
  ref={ref}
className="invoice-page mx-auto box-border w-[210mm] bg-white text-black px-[10mm] py-[9mm] text-[12px]"
  style={{
    fontFamily: "Arial, Helvetica, sans-serif",
  }}
 >
      <div className="flex items-start justify-between">
        <div className="w-[32%] pt-2">
          <div className="flex flex-col items-start">
            <img
              src="/admin-img/adlogo.png"
              width={100}
              height={100}
              alt="logo"
            />
          </div>
        </div>
        <div className="w-[68%] text-right">
          <h1 className="text-[20px] font-bold">Payment Invoice</h1>

          <p className="text-[13px] mt-1">(Original for recipient)</p>
  <p className="font-bold mt-5">{COMPANY_DETAILS.name}</p>

  <p>Supplier GSTIN: {COMPANY_DETAILS.gstin}</p>

  <p>Website: {COMPANY_DETAILS.website}</p>

  <p>E-mail: {COMPANY_DETAILS.email}</p>

  <p className="mt-1 leading-5">
    Address - {COMPANY_DETAILS.address}
  </p>
        </div>
      </div>

      <div className="mt-11 grid grid-cols-2 gap-8">
        <div>
          <p className="font-bold mb-2">Customer Address:</p>

          <p>{data.userName || "-"}</p>

          <p>
            {data.city || "-"}
            {data.state ? `, ${data.state}` : ""}
            {data.pincode ? ` - ${data.pincode}` : ""}
          </p>

          <p>{data.country || "India"}</p>

          <div className="mt-5">
            <p className="font-bold">Place of Supply:</p>

            <p>{data.placeOfSupply || data.state || "-"}</p>
          </div>
        </div>

        <div className="text-right">
          <p>
            <span className="font-bold">Transaction Id:</span>{" "}
            {data.transactionId || data.razorpayOrderId || "-"}
          </p>

          <p className="mt-3">
            <span className="font-bold">Payment Id:</span>{" "}
            {data.razorpayPaymentId || "-"}
          </p>

          <p className="mt-3">
            <span className="font-bold">Recipient GSTIN:</span>{" "}
            {data.recipientGSTIN || "-"}
          </p>

          <p className="mt-3">
            <span className="font-bold">Invoice Voucher No:</span>{" "}
            {data.invoiceNo || "-"}
          </p>

          <p className="mt-3">
            <span className="font-bold">Invoice Voucher Date:</span>{" "}
            {formatDate(data.createdAt)}
          </p>
        </div>
      </div>

      {/* =========================================================
          MAIN PAYMENT TABLE
      ========================================================= */}

      <div className="mt-[45px]">
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr className="font-bold text-center">
              <th rowSpan="2" className="border border-black px-2 py-2">
                Description
              </th>

              <th rowSpan="2" className="border border-black px-2 py-2">
                Total
              </th>

              <th rowSpan="2" className="border border-black px-2 py-2">
                Discount
              </th>

              <th rowSpan="2" className="border border-black px-2 py-2">
                Taxable
                <br />
                Value
              </th>

              <th colSpan="2" className="border border-black px-2 py-1">
                SGST
              </th>

              <th colSpan="2" className="border border-black px-2 py-1">
                CGST
              </th>

              <th colSpan="2" className="border border-black px-2 py-1">
                IGST
              </th>
            </tr>

            <tr className="font-bold text-center">
              <th className="border border-black px-2 py-1">Rate</th>

              <th className="border border-black px-2 py-1">Amount</th>

              <th className="border border-black px-2 py-1">Rate</th>

              <th className="border border-black px-2 py-1">Amount</th>

              <th className="border border-black px-2 py-1">Rate</th>

              <th className="border border-black px-2 py-1">Amount</th>
            </tr>
          </thead>

          <tbody>
            {/* Item */}
            <tr>
              <td className="border border-black px-2 py-2">
                Purchase of AT-Money via Razorpay
              </td>

              <td className="border border-black px-2 py-2 text-right">
                ₹{money(data.amount)}
              </td>

              <td className="border border-black px-2 py-2 text-right">
                ₹{money(data.discount)}
              </td>

              <td className="border border-black px-2 py-2 text-right">
                ₹{money(data.taxableAmount)}
              </td>

              <td className="border border-black px-2 py-2 text-center">
                {data.sgstRate || 0}%
              </td>

              <td className="border border-black px-2 py-2 text-right">
                ₹{money(data.sgst)}
              </td>

              <td className="border border-black px-2 py-2 text-center">
                {data.cgstRate || 0}%
              </td>

              <td className="border border-black px-2 py-2 text-right">
                ₹{money(data.cgst)}
              </td>

              <td className="border border-black px-2 py-2 text-center">
                {data.igstRate || data.gstRate || 0}%
              </td>

              <td className="border border-black px-2 py-2 text-right">
                ₹{money(data.igst || data.totalTax)}
              </td>
            </tr>

            {/* Total */}
            <tr className="font-bold">
              <td
                colSpan="4"
                className="border border-black px-2 py-1 text-right"
              >
                Total
              </td>

              <td
                colSpan="2"
                className="border border-black px-2 py-1 text-right"
              >
                ₹{money(data.sgst)}
              </td>

              <td
                colSpan="2"
                className="border border-black px-2 py-1 text-right"
              >
                ₹{money(data.cgst)}
              </td>

              <td
                colSpan="2"
                className="border border-black px-2 py-1 text-right"
              >
                ₹{money(data.igst || data.totalTax)}
              </td>
            </tr>

            {/* Total Tax */}
            <tr className="font-bold">
              <td
                colSpan="8"
                className="border border-black px-2 py-1 text-right"
              >
                Total Tax
              </td>

              <td
                colSpan="2"
                className="border border-black px-2 py-1 text-right"
              >
                INR {money(data.totalTax)}
              </td>
            </tr>

            {/* Total Amount */}
            <tr className="font-bold">
              <td
                colSpan="8"
                className="border border-black px-2 py-1 text-right"
              >
                Total amount
              </td>

              <td
                colSpan="2"
                className="border border-black px-2 py-1 text-right"
              >
                INR {money(data.totalAmount || data.amount)}
              </td>
            </tr>

            {/* Amount in words */}
            <tr className="font-bold">
              <td
                colSpan="8"
                className="border border-black px-2 py-1 text-right"
              >
                Total amount (in words)
              </td>

              <td
                colSpan="2"
                className="border border-black px-2 py-1 text-right"
              >
                {data.amountInWords || "-"}
              </td>
            </tr>

            {/* Received */}
            <tr className="font-bold">
              <td
                colSpan="8"
                className="border border-black px-2 py-1 text-right"
              >
                Total amount received
              </td>

              <td
                colSpan="2"
                className="border border-black px-2 py-1 text-right"
              >
                INR{" "}
                {money(data.amountReceived || data.totalAmount || data.amount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* =========================================================
          TRANSACTION HISTORY NOTE
      ========================================================= */}

      <div className="mt-[35px] text-[11px]">
        To view your transaction history, please visit:{" "}
        <span className="underline">{data.transactionHistoryUrl || "-"}</span>
      </div>

      {/* =========================================================
          OTHER DETAILS
      ========================================================= */}

      <div className="mt-[35px]">
        <p className="font-bold mb-1">Other details:</p>

        <div className="grid grid-cols-[220px_20px_1fr] leading-6">
          <span>HSN/SAC</span>
          <span>:</span>
          <span>{data.hsnSac || "999799"}</span>

          <span>Whether tax is payable on reverse charge basis</span>
          <span>:</span>
          <span>{data.reverseCharge === true ? "Yes" : "No"}</span>

          <span>PAN Number</span>
          <span>:</span>
          <span>{data.panNumber || "-"}</span>
        </div>
      </div>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <div className="mt-[45px] text-[11px]">
        This is a computer generated invoice voucher, no signatures required
      </div>
    </div>
    </>
  );
});

PaymentInvoice.displayName = "PaymentInvoice";

export default PaymentInvoice;
