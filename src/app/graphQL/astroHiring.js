import { gql } from "@apollo/client";

export const GET_APPLICATIONS = gql`
  query {
    getApplications {
      id
      name
      phoneNumber
      email
      gender
      skills
      languages
      problems
      experience
      dob
      applicationStatus
      interviewStatus
      documentStatus
      approvalStatus
      interviewerId
      interviewDate
      interviewTime
      interviewRemarks

      round
      astrologerId
      createdAt
      kycDetail {
        accountHolderName
        accountNumber
        bankName
        ifsc
        branchName
        panNumber
        documentRemarks
        aadhaarImage
        panImage
        passbookImage

        status
      }
    }
  }
`;

export const GET_INTERVIEWERS = gql`
  query {
    getInterviewers {
      id
      name
      email
    }
  }
`;

export const SCHEDULE_INTERVIEW = gql`
  mutation (
    $astrologerId: ID!
    $astrologerNumber: String!
    $astrologerMail: String!
    $interviewerId: String!
    $interviewDate: String!
    $interviewTime: String!
    $round: Int!
  ) {
    scheduleInterview(
      astrologerId: $astrologerId
      astrologerNumber: $astrologerNumber
      astrologerMail: $astrologerMail
      interviewerId: $interviewerId
      interviewDate: $interviewDate
      interviewTime: $interviewTime
      round: $round
    ) {
      id
      interviewStatus
      interviewDate
      interviewTime
      round
    }
  }
`;

export const UPDATE_DOCUMENT_STATUS = gql`
  mutation ($astrologerId: ID!, $status: DocumentStatus!) {
    updateDocumentStatus(astrologerId: $astrologerId, status: $status) {
      id
      documentStatus
    }
  }
`;

export const UPDATE_APPROVAL_STATUS = gql`
  mutation ($astrologerId: ID!, $status: ApprovalStatus!) {
    updateApprovalStatus(astrologerId: $astrologerId, status: $status) {
      id
      approvalStatus
      applicationStatus
    }
  }
`;

export const UPLOAD_IMAGE = gql`
  mutation UploadImage($file: Upload!) {
    uploadImage(file: $file) {
      url
      filename
    }
  }
`;

export const REJECT_KYC = gql`
  mutation RejectKyc($astrologerId: String!, $remarks: String) {
    rejectKyc(astrologerId: $astrologerId, remarks: $remarks)
  }
`;

export const GET_OFFERS = gql`
  query GetOffers {
    getOffers {
      id
      offerName
      description
      price
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_OFFER = gql`
  mutation CreateOffer(
    $offerName: String!
    $price: Float!
    $description: String!
  ) {
    createOffer(
      data: { offerName: $offerName, price: $price, description: $description }
    ) {
      success
      message
      data {
        id
      }
    }
  }
`;

export const UPDATE_OFFER = gql`
  mutation UpdateOffer(
    $id: String!
    $offerName: String!
    $price: Float!
    $description: String!
    $isActive: Boolean
  ) {
    updateOffer(
      id: $id
      data: {
        offerName: $offerName
        price: $price
        description: $description
        isActive: $isActive
      }
    ) {
      success
      message
    }
  }
`;

export const DELETE_OFFER = gql`
  mutation DeleteOffer($id: String!) {
    deleteOffer(id: $id) {
      success
      message
    }
  }
`;

export const GET_ASTROLOGER_BY_ID = gql`
  query GetAstrologerById($id: ID!) {
    getAstrologerById(id: $id) {
      id

      name
      displayName
      profilePic
      dateOfBirth

      email
      contactNo
      createdAt
      updatedAt
      gender
      experience

      about

      tags
      vtags

      languages
      skills
      problems
      isCallActive
      isChatActive
      isLiveActive
      isBusy
      isOnline
      isPromotional
      isEligibleChat
      isEligibleCall
      isEligibleVideo
      isEligibleAudio
      pricing {
        type
        price
        offerPrice
        commissionPercent
        isActive
      }

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

      addresses {
        street
        city
        state
        country
        pincode
      }
    }
  }
`;
export const UPDATE_ASTROLOGER = gql`
  mutation UpdateAstrologer($astrologerId: ID!, $data: UpdateAstrologerInput!) {
    updateAstrologer(astrologerId: $astrologerId, data: $data) {
      id
      name
      email
    }
  }
`;

export const GET_CATEGORIES = gql`
  query getCategories {
    getCategories {
      id
      name
      slug
      image
    }
  }
`;
export const DELETE_CATEGORY = gql`
  mutation ($id: ID!) {
    deleteCategory(id: $id)
  }
`;

export const GET_ASTROLOGER_DASHBOARD_STATS = gql`
  query GetAstrologerDashboardStats($astrologerId: ID!) {
    getAstrologerDashboardStats(astrologerId: $astrologerId) {
      totalChats
      totalCalls
      totalSessions

      totalCoinsEarned
      totalCoinsDeducted
      totalCommission

      totalDurationMinutes

      walletBalance
      totalEarned
      totalWithdrawn

      totalFollowers
      totalReviews

      averageRating

      statusSummary {
        requested
        accepted
        ongoing
        completed
        cancelled
        failed
      }
    }
  }
`;
export const GET_SESSION_ANALYTICS = gql`
  query GetSessionAnalytics($status: SessionStatus, $filter: DashboardFilter) {
    getSessionAnalytics(status: $status, filter: $filter) {
      totalSessions
      totalChats
      totalCalls

      statusSummary {
        requested
        accepted
        ongoing
        completed
        cancelled
        failed
      }

      recentSessions {
        sessionId
        roomId
        type
        userName
        status
        ratePerMin
        durationSec
        userId
        astrologerId
        coinsDeducted
        startedAt
        endedAt
        createdAt
      }
    }
  }
`;

export const GET_ASTROLOGER_CHAT_HISTORY = gql`
  query GetAstrologerChatHistory($astrologerId: ID!, $page: Int, $limit: Int) {
    getAstrologerChatHistory(
      astrologerId: $astrologerId
      page: $page
      limit: $limit
    ) {
      totalCount

      currentPage

      totalPages

      data {
        sessionId
        by
        userName
        userId
        ratePerMin

        durationSec

        astrologerCommission
        dhwaniCommission
        hasRemedy
        coinsDeducted

        status

        createdAt
      }
    }
  }
`;

export const GET_ASTROLOGER_CALL_HISTORY = gql`
  query GetAstrologerCallHistory($astrologerId: ID!, $page: Int, $limit: Int) {
    getAstrologerCallHistory(
      astrologerId: $astrologerId
      page: $page
      limit: $limit
    ) {
      totalCount

      currentPage

      totalPages

      data {
        sessionId
        by
        userName
        userId
        ratePerMin

        durationSec

        astrologerCommission
        dhwaniCommission

        coinsDeducted

        status

        createdAt
      }
    }
  }
`;

export const UPDATE_AVAILABILITY = gql`
  mutation UpdateAvailability(
    $astrologerId: ID!
    $isChatActive: Boolean
    $isCallActive: Boolean
    $isLiveActive: Boolean
    $isPromotional: Boolean
  ) {
    updateAstrologerAvailability(
      astrologerId: $astrologerId
      isChatActive: $isChatActive
      isCallActive: $isCallActive
      isLiveActive: $isLiveActive
      isPromotional: $isPromotional
    ) {
      id
      isChatActive
      isCallActive
      isLiveActive
      isPromotional
    }
  }
`;

export const TOGGLE_REVIEW_FLAG = gql`
  mutation ToggleReviewFlag($reviewId: ID!, $isFlagged: Boolean!) {
    toggleReviewFlag(reviewId: $reviewId, isFlagged: $isFlagged) {
      success
      message
    }
  }
`;

export const GET_USER_CALL_HISTORY = gql`
  query GetUserCallHistory($searchInput: UserCallHistorySearchInput!) {
    getUserCallHistory(searchInput: $searchInput) {
      totalCount
      currentPage
      totalPages

      totalCoinsDeducted
      totalCoinsEarned
      totalCommission

      data {
        sessionId
        by
        userId
        userName
        mobile
        source
        astrologerId
        astrologerName

        type
        status

        ratePerMin
        durationSec

        coinsDeducted
        coinsEarned
        commission

        startedAt
        endedAt
        createdAt
      }
    }
  }
`;
export const GET_USER_WALLET_TRANSACTIONS = gql`
  query GetUserWalletTransactions(
    $userId: ID
    $mobile: String
    $type: String
    $amount: Float
    $page: Int
    $limit: Int
    $filterType: String
    $startDate: String
    $endDate: String
    $onlyRecharge: Boolean
  ) {
    getUserWalletTransactions(
      userId: $userId
      mobile: $mobile
      type: $type
      amount: $amount
      page: $page
      limit: $limit
      filterType: $filterType
      startDate: $startDate
      endDate: $endDate
      onlyRecharge: $onlyRecharge
    ) {
      totalCount

      data {
        id

        type
        coins
        amount
        description
        createdAt
        sessionId
        userWallet {
          user {
            id
            name
            mobile
          }
        }
        updatedBalance
        rechargePack {
          id
          name
          talktime
          validityDays
        }
      }
    }
  }
`;

export const GET_USERS_CHAT_HISTORY = gql`
  query GetUsersChatHistory($searchInput: UserChatHistorySearchInput!) {
    getUsersChatHistory(searchInput: $searchInput) {
      totalCount
      currentPage
      totalPages

      totalCoinsDeducted
      totalCoinsEarned
      totalCommission

      data {
        userId
        sessionId
        userName
        mobile
        astrologerName
        astrologerId
        source
        status
        ratePerMin
        coinsDeducted
        coinsEarned
        commission
        by
        durationSec
        hasRemedy
        createdAt
      }
    }
  }
`;
export const GET_ASTROLOGER_WALLET_TRANSACTIONS = gql`
  query GetAstrologerWalletTransactions(
    $page: Int
    $limit: Int
    $type: String
    $contactNo: String
    $amount: Float
    $filterType: String
    $startDate: String
    $astrologerId: ID
    $endDate: String
  ) {
    getAstrologerWalletTransactions(
      page: $page
      limit: $limit
      type: $type
      contactNo: $contactNo
      astrologerId: $astrologerId
      amount: $amount
      filterType: $filterType
      startDate: $startDate
      endDate: $endDate
    ) {
      totalCount
      totalPages
      data {
        id
        sessionId
        type
        coins
        amount
        description
        createdAt
        updatedBalance

        astrologerWallet {
          balanceCoins
          totalEarned
          totalWithdrawn

          astrologer {
            id
            displayName
            contactNo
            email
          }
        }

        session {
          id
          type
          status
          ratePerMin
          durationSec
          coinsDeducted
          coinsEarned
          commission
          source
          roomId
          startedAt
          endedAt
          createdAt
        }

        payment {
          id
          amount
          coins
          provider
          status
          razorpayPaymentId
          createdAt
        }
      }
    }
  }
`;

export const GET_ASTRO_LIST = gql`
  query GetAstrologerList($searchInput: AstrologerSearchInput!) {
    getAstrologerListBySearch(searchInput: $searchInput) {
      data {
        id
        displayName
        email
        contactNo
        experience
        tags
        vtags
        createdAt
      }
    }
  }
`;

export const GET_USER_PROFILE = gql`
  query GetUserProfile($userId: ID!) {
    getUserProfile(userId: $userId) {
      id
      name

      mobile
      countryCode

      gender

      birthDate
      birthTime
      source
      occupation

      isActive

      createdAt

      stats {
        walletBalance

        totalRecharge
        totalRechargeCount

        totalCalls
        totalChats

        totalReviews

        totalFollowing

        totalBookings

        lastRechargeAmount
        lastRechargeDate
      }
    }
  }
`;
export const UPDATE_USER_STATUS = gql`
  mutation UpdateUserStatus(
    $userId: ID!
    $isActive: Boolean!
    $isDeleted: Boolean!
  ) {
    updateUserStatus(
      userId: $userId
      isActive: $isActive
      isDeleted: $isDeleted
    ) {
      id
      isActive
      isDeleted
    }
  }
`;

export const CREATE_NOTICE = gql`
  mutation CreateNotice($input: CreateNoticeInput!) {
    createNotice(input: $input) {
      id
      title
    }
  }
`;

export const UPDATE_NOTICE = gql`
  mutation UpdateNotice($id: ID!, $input: UpdateNoticeInput!) {
    updateNotice(id: $id, input: $input) {
      id
      title
      isActive
    }
  }
`;
export const DELETE_NOTICE = gql`
  mutation DeleteNotice($id: ID!) {
    deleteNotice(id: $id)
  }
`;

export const GET_NOTICES = gql`
  query GetNotices {
    getNotices {
      id
      title
      description
      targetType
      isActive
      createdAt

      astrologers {
        id
        name
        displayName
      }
    }
  }
`;
export const UPDATE_REVIEW_COMMENT = gql`
  mutation UpdateReviewComment($reviewId: ID!, $comment: String, $rating: Int) {
    updateReviewComment(
      reviewId: $reviewId
      comment: $comment
      rating: $rating
    ) {
      reviewId
      comment
      rating
    }
  }
`;
export const UPDATE_GIFT_STATUS = gql`
  mutation UpdateGiftStatus($id: ID!, $status: String!) {
    updateGiftStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;
export const GET_USER_REVIEWS = gql`
  query GetUserReviews($searchInput: UserReviewSearchInput!) {
    getUserReviews(searchInput: $searchInput) {
      totalCount
      currentPage
      totalPages
      averageRating

      data {
        reviewId
        sessionId
        userId
        userName
        mobile
        astrologerId
        astrologerName
        displayName
        isFlagged
        sessionType
        sessionStatus
        rating
        comment
        createdAt
      }
    }
  }
`;

export const MANAGE_ASTROLOGER_WALLET = gql`
  mutation ManageAstrologerWallet(
    $astrologerId: ID!
    $amount: Float!
    $remarks: String
    $type: TransactionType!
  ) {
    manageAstrologerWallet(
      astrologerId: $astrologerId
      amount: $amount
      remarks: $remarks
      type: $type
    ) {
      success
      message
      walletBalance
    }
  }
`;
export const MANAGE_USER_WALLET = gql`
  mutation ManageUserWallet(
    $userId: ID!
    $amount: Float!
    $remarks: String
    $type: TransactionType!
  ) {
    manageUserWallet(
      userId: $userId
      amount: $amount
      remarks: $remarks
      type: $type
    ) {
      success
      message
      walletBalance
    }
  }
`;
export const GET_ASTROLOGER_REVIEWS = gql`
  query GetAstrologerReviews($astrologerId: ID!) {
    getAstrologerReviews(astrologerId: $astrologerId) {
      reviewId
      sessionId
      userId
      userName
      rating
      comment
      sessionType
      createdAt
    }
  }
`;
export const GET_ASTROLOGER_GIFT_HISTORY = gql`
  query GetAstrologerGiftHistory(
    $astrologerId: String!
    $page: Int
    $limit: Int
  ) {
    getSendGiftHistory(
      astrologerId: $astrologerId
      page: $page
      limit: $limit
    ) {
      totalCount

      data {
        id
        giftName
        giftPrice
        createdAt

        user {
          id
          name
          mobile
        }

        gift {
          id
          name
          image
          amount
        }
      }
    }
  }
`;
export const GET_ASTROLOGER_FOLLOWERS = gql`
  query GetAstrologerFollowers(
    $astrologerId: ID!
    $page: Int
    $limit: Int
    $search: String
  ) {
    getAstrologerFollowers(
      astrologerId: $astrologerId
      page: $page
      limit: $limit
      search: $search
    ) {
      totalCount
      currentPage
      totalPages

      data {
        id
        createdAt

        user {
          id
          name
          mobile
          gender
        }
      }
    }
  }
`;
export const GET_SESSION_REMEDIES = gql`
  query GetSessionRemedies($sessionId: String!) {
    getSessionRemedies(sessionId: $sessionId) {
      id
      remedyText
      createdAt
    }
  }
`;

export const GET_CALL_RECORDING = gql`
  query GetCallRecording($sessionId: ID!) {
    getCallRecording(sessionId: $sessionId) {
      id
      fileUrl
      fileName
    }
  }
`;

export const END_SESSION_BY_ADMIN = gql`
  mutation EndSessionByAdmin($sessionId: ID!) {
    endSessionByAdmin(sessionId: $sessionId)
  }
`;
export const GET_ASTROLOGER_WAITING_USERS = gql`
  query GetAstrologerWaitingUsers($astrologerId: ID!) {
    getAstrologerWaitingUsers(astrologerId: $astrologerId) {
      waitingCount
      waitingUsers {
        userId
        name
        mobile
        roomId
        maximumTime
      }
    }
  }
`;
export const GET_ALL_WAITING_QUEUES = gql`
  query GetAllWaitingQueues {
    getAllWaitingQueues {
      astrologerId
      astrologerName
      astrologerProfilePic
      isOnline
      isBusy
      waitingCount

      waitingUsers {
        userId
        name
        mobile
        countryCode

        roomId
        maximumTime
        source
        type
      }
    }
  }
`;

export const GET_SKILLS = gql`
  query GetSkills {
    getSkills {
      id
      name
      slug
      sortOrder
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_SKILL = gql`
  query GetSkill($id: ID!) {
    getSkill(id: $id) {
      id
      name
      slug
      sortOrder
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_SKILL = gql`
  mutation CreateSkill($input: CreateSkillInput!) {
    createSkill(input: $input) {
      id
      name
      slug
      sortOrder
      isActive
    }
  }
`;

export const UPDATE_SKILL = gql`
  mutation UpdateSkill($id: ID!, $input: UpdateSkillInput!) {
    updateSkill(id: $id, input: $input) {
      id
      name
      slug
      sortOrder
      isActive
    }
  }
`;

export const DELETE_SKILL = gql`
  mutation DeleteSkill($id: ID!) {
    deleteSkill(id: $id)
  }
`;

export const UPDATE_SKILL_STATUS = gql`
  mutation UpdateSkillStatus($id: ID!, $status: Boolean!) {
    updateSkillStatus(id: $id, status: $status) {
      id
      isActive
    }
  }
`;

export const GET_PROBLEMS = gql`
  query GetProblems {
    getProblems {
      id
      name
      slug
      sortOrder
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_PROBLEM = gql`
  query GetProblem($id: ID!) {
    getProblem(id: $id) {
      id
      name
      slug
      sortOrder
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_PROBLEM = gql`
  mutation CreateProblem($input: CreateProblemInput!) {
    createProblem(input: $input) {
      id
      name
      slug
      sortOrder
      isActive
    }
  }
`;

export const UPDATE_PROBLEM = gql`
  mutation UpdateProblem($id: ID!, $input: UpdateProblemInput!) {
    updateProblem(id: $id, input: $input) {
      id
      name
      slug
      sortOrder
      isActive
    }
  }
`;

export const DELETE_PROBLEM = gql`
  mutation DeleteProblem($id: ID!) {
    deleteProblem(id: $id)
  }
`;

export const UPDATE_PROBLEM_STATUS = gql`
  mutation UpdateProblemStatus($id: ID!, $status: Boolean!) {
    updateProblemStatus(id: $id, status: $status) {
      id
      isActive
    }
  }
`;
export const GET_ASTROLOGER_PAYOUT_HISTORY = gql`
  query GetAstrologerPayoutHistory($astrologerId: ID!) {
    getAstrologerPayoutHistory(astrologerId: $astrologerId) {
      id
      astrologerId
      astrologerName
      remark
      earning
      pgCharge
      subTotal
      tdsAmount
      paidAmount
      startDate
      endDate
      paidOn
    }
  }
`;
export const EXPORT_PAYOUT_REPORT = gql`
  mutation ExportPayoutReport($fromDate: String!, $toDate: String!,     $remark: String) {
    exportPayoutReport(fromDate: $fromDate, toDate: $toDate, remark: $remark) {
      astrologerId
      astrologerName
      profilePic

      accountHolderName
      accountNumber
      bankName
      ifsc
      panNumber
      state

      totalSessions
      totalRevenue

      commissionPercent
      commission

      earning

      pgChargeRate
      pgCharge

      gstRate
      cgst
      sgst
      igst

      pgTotal

      grossAmount

      tdsPercent
      tdsAmount

      lastPaidAmount
      payableAmount
    }
  }
`;

export const GET_REFUND_REQUESTS = gql`
  query GetRefundRequests(
    $searchInput: RefundRequestSearchInput
  ) {
    getRefundRequests(
      searchInput: $searchInput
    ) {
      totalCount
      currentPage
      totalPages

      data {
        id

        sessionId

        userId
        userName
        userMobile

        astrologerId
        astrologerName

        transactionId
        orderId
sessionDate
        sessionDuration
        ratePerMin

        refundDuration
        refundAmount

        refundType
        mode
        refundReason

        requestedByStaffId
        requestedByStaffName

        status

        approvedByStaffId
        approvedByStaffName
        approvedAt

        rejectedByStaffId
        rejectedByStaffName
        rejectedAt
        rejectionReason

        createdAt
        updatedAt
      }
    }
  }
`;

export const CREATE_REFUND_REQUEST = gql`
  mutation CreateRefundRequest(
    $input: CreateRefundRequestInput!
  ) {
    createRefundRequest(
      input: $input
    ) {
      id
      status

      sessionId

      refundDuration
      refundAmount
      refundReason
sessionDate
      requestedByStaffId
      requestedByStaffName

      createdAt
    }
  }
`;

export const APPROVE_REFUND_REQUEST = gql`
  mutation ApproveRefundRequest(
    $id: ID!
  ) {
    approveRefundRequest(
      id: $id
    ) {
      id
      status

      approvedByStaffId
      approvedByStaffName
      approvedAt

      refundDuration
      refundAmount
    }
  }
`;

export const REJECT_REFUND_REQUEST = gql`
  mutation RejectRefundRequest(
    $id: ID!
    $reason: String!
  ) {
    rejectRefundRequest(
      id: $id
      reason: $reason
    ) {
      id
      status

      rejectedByStaffId
      rejectedByStaffName
      rejectedAt

      rejectionReason
    }
  }
`;
