import { gql } from "@apollo/client";

export const GET_ALL_SCHEDULED_LIVES = gql`
  query GetAllScheduledLives(
    $page: Int!
    $limit: Int!
    $search: String
  ) {
    getAllScheduledLives(
      page: $page
      limit: $limit
      search: $search
    ) {
      lives {
        id
        astrologerId
        title
        channelName
        chatRoomId
        status
        scheduledAt
        scheduledEndAt
        createdAt
        startedAt
        endedAt
        totalViews

        astrologer {
          id
          name
          displayName
          profilePic
        }
      }

      totalRecords
      currentPage
      limit
      totalPages
    }
  }
`;

export const ADMIN_UPDATE_SCHEDULED_LIVE = gql`
  mutation AdminUpdateScheduledLive(
    $id: ID!
    $title: String!
    $scheduledAt: String!
    $scheduledEndAt: String!
  ) {
    adminUpdateScheduledLive(
      id: $id
      title: $title
      scheduledAt: $scheduledAt
      scheduledEndAt: $scheduledEndAt
    ) {
      id
      astrologerId
      title
      channelName
      status
      scheduledAt
      scheduledEndAt
      updatedAt
    }
  }
`;
export const ADMIN_DELETE_SCHEDULED_LIVE = gql`
  mutation AdminDeleteScheduledLive($id: ID!) {
    adminDeleteScheduledLive(id: $id)
  }
`;

export const GET_LIVE_GIFT_TRANSACTIONS = gql`
  query GetLiveGiftTransactions(
    $page: Int
    $limit: Int
    $filters: LiveGiftTransactionFilterInput
  ) {
    getLiveGiftTransactions(
      page: $page
      limit: $limit
      filters: $filters
    ) {
      transactions {
        id
        streamId
        senderId
        astrologerId
        giftId
        quantity
        totalCoins
        status
        createdAt
      }

      totalRecords
      totalPages
      currentPage
      limit
      totalCoins
    }
  }
`;

export const GET_RUNNING_LIVE_STREAMS = gql`
  query GetRunningLiveStreams {
    getRunningLiveStreams {
      id
      astrologerId
      title
      channelName
      chatRoomId
      status
      scheduledAt
      scheduledEndAt
      startedAt
      createdAt
      endedAt
      totalViews

      astrologer {
        id
        name
        displayName
        profilePic
        rating
      }
    }
  }
`;
