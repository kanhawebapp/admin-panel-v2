import { gql } from "@apollo/client";

export const GET_RECHARGE_PACKS = gql`
  query GetRechargePacks {
    getRechargePacks {
      id
      name
      description
      price
      talktime
      coins
      validityDays
      isActive
      createdAt
      hideAfterFirstRecharge
      isFirstTimeOffer
    }
  }
`;

export const CREATE_RECHARGE_PACK = gql`
  mutation CreateRechargePack($input: RechargePackInput!) {
    createRechargePack(input: $input) {
      id
      name
      price
      talktime
      coins
      validityDays
      isActive
    }
  }
`;

export const UPDATE_RECHARGE_PACK = gql`
  mutation UpdateRechargePack($id: ID!, $input: UpdateRechargePackInput!) {
    updateRechargePack(id: $id, input: $input) {
      id
      name
      price
      talktime
      coins
      validityDays
      isActive
    }
  }
`;

export const DELETE_RECHARGE_PACK = gql`
  mutation DeleteRechargePack($id: ID!) {
    deleteRechargePack(id: $id)
  }
`;
