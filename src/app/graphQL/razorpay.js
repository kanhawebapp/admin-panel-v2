import { gql } from "@apollo/client";

export const GET_PAYMENT_REPORTS = gql`
  query GetPaymentReports($searchInput: PaymentReportSearchInput!) {
    getPaymentReports(searchInput: $searchInput) {
      totalCount
      totalPages
      currentPage

      totalAmount
      totalCoins

      totalTax
      totalGST
      totalCGST
      totalSGST
      paidAmount
      failedAmount
      totalPGCharge
      paidCount
      failedCount

      data {
        id
        invoiceNo

        userName
        mobile

        rechargePackName

        amount
        coins

        taxableAmount

        gstRate

        cgst
        sgst
        igst
        pgChargeRate
        pgCharge
        pgIgst
        pgTotal
        receivableAmount
        totalTax

        totalAmount

        country
        state
        city

        platform

        razorpayOrderId
        razorpayPaymentId

        status

        createdAt
      }
    }
  }
`;


