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


export const GET_SERVICE_BANK_PAYMENT_DETAILS = gql`
  query GetServiceBankPaymentDetails(
    $page: Int!
    $limit: Int!
    $serviceType: String!
    $status: String!
  ) {
    getServiceBankPaymentDetails(
      page: $page
      limit: $limit
      serviceType: $serviceType
      status: $status
    ) {
      success
      message

      data {
        id
        userId
        serviceType
        serviceName
        bookingId
        amount
        provider
        razorpayOrderId
        razorpayPaymentId
        status
        invoiceNo
        taxableAmount
        gstRate
        cgst
        sgst
        igst
        totalTax
        totalAmount
        pgChargeRate
        pgCharge
        pgIgst
        pgTotal
        receivableAmount
        country
        state
        city
        platform
        couponId
        discount
        cashback
        createdAt
        updatedAt
      }

      pagination {
        totalRecords
        totalPages
        currentPage
        limit
        totalAmount
        totalTaxableAmount
        totalTax
        totalPgCharge
        totalPgIgst
        totalPgAmount
        totalReceivableAmount
        totalDiscount
        totalCashback
      }
    }
  }
`;


