import { gql } from "@apollo/client";

export const GET_GIFTS = gql`
  query {
    getGifts {
      id
      name
      amount
      image
      status
      createdAt
    }
  }
`;

export const CREATE_GIFT = gql`
  mutation ($input: GiftInput!) {
    createGift(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_GIFT = gql`
  mutation ($id: ID!, $input: GiftInput!) {
    updateGift(id: $id, input: $input) {
      id
      name
    }
  }
`;

export const DELETE_GIFT = gql`
  mutation ($id: ID!) {
    deleteGift(id: $id)
  }
`;

export const GET_TESTIMONIALS = gql`
  query {
    testimonials {
      id
      name
      address
      content
      image
      rating
    }
  }
`;

export const CREATE_TESTIMONIAL = gql`
  mutation ($input: CreateTestimonialInput!) {
    createTestimonial(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_TESTIMONIAL = gql`
  mutation ($id: ID!, $input: UpdateTestimonialInput!) {
    updateTestimonial(id: $id, input: $input) {
      id
    }
  }
`;

export const DELETE_TESTIMONIAL = gql`
  mutation ($id: ID!) {
    deleteTestimonial(id: $id)
  }
`;

export const GET_FAQS = gql`
  query {
    faqs {
      id
      question
      answer
    }
  }
`;

export const CREATE_FAQ = gql`
  mutation ($input: CreateFaqInput!) {
    createFaq(input: $input) {
      id
    }
  }
`;

export const UPDATE_FAQ = gql`
  mutation ($id: ID!, $input: UpdateFaqInput!) {
    updateFaq(id: $id, input: $input) {
      id
    }
  }
`;

export const DELETE_FAQ = gql`
  mutation ($id: ID!) {
    deleteFaq(id: $id)
  }
`;

export const GET_BANNERS = gql`
  query {
    getBanners {
      id
      heading
      subheading
      slug
      sortorder
      bannerlink
      language
     imageUrl
     bannerType
      status
    }
  }
`;

export const CREATE_BANNER = gql`
  mutation CreateBanner($input: CreateBannerInput!) {
    createBanner(input: $input) {
      id
      heading
      slug
      status
    }
  }
`;

export const UPDATE_BANNER = gql`
  mutation UpdateBanner(
    $id: ID!
    $input: UpdateBannerInput!
  ) {
    updateBanner(
      id: $id
      input: $input
    ) {
      id
      heading
      slug
      status
    }
  }
`;

export const DELETE_BANNER = gql`
  mutation DeleteBanner($id: ID!) {
    deleteBanner(id: $id)
  }
`;
