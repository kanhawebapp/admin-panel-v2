import { gql } from "@apollo/client";

export const GET_COUPONS = gql`
  query GetCoupons {
    getCoupons {
      id
      code
      description
      applicable
      type
      status
      visibility
      percentage
      maxDiscount
      redeemLimit
      minOrderAmount
      couponCount
      startDate
      endDate
    }
  }
`;

export const CREATE_COUPON = gql`
  mutation CreateCoupon($input: CreateCouponInput!) {
    createCoupon(input: $input) {
      id
      code
    }
  }
`;

export const DELETE_COUPON = gql`
  mutation DeleteCoupon($id: ID!) {
    deleteCoupon(id: $id)
  }
`;

export const UPDATE_COUPON_STATUS = gql`
  mutation UpdateCouponStatus($id: ID!, $status: String!) {
    updateCouponStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const UPDATE_COUPON = gql`
  mutation UpdateCoupon(
    $id: ID!
    $input: UpdateCouponInput!
  ) {
    updateCoupon(
      id: $id
      input: $input
    ) {
      id
      code
      description
      applicable

      type
      visibility
      status

      couponCount
      percentage
      maxDiscount
      redeemLimit

      startDate
      endDate
    }
  }
`;