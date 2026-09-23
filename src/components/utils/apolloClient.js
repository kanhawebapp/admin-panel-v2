"use client";

import {
  ApolloClient,
  InMemoryCache,
  from,
  makeVar,
  split,
  HttpLink,
} from "@apollo/client";

import { getMainDefinition } from "@apollo/client/utilities";

import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";

export const authTokenVar = makeVar(null);


const httpLink = new HttpLink({
  uri:
    process.env.NEXT_PUBLIC_GRAPHQL_URL 
    ,
  credentials: "include",
});

const uploadLink = new UploadHttpLink({
  uri:
    process.env.NEXT_PUBLIC_GRAPHQL_URL ,
  credentials: "include",
  headers: {
    "apollo-require-preflight": "true",
  },
});


const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === "OperationDefinition" &&
      definition.operation === "mutation" &&
      definition.name?.value === "UploadImage"; 
  },
  uploadLink,
  httpLink
);

const authLink = setContext((_, { headers }) => {
  const token = authTokenVar();

  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});


const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    console.log("GraphQL Errors:", graphQLErrors);
  }
  if (networkError) {
    console.log("Network Error:", networkError);
  }
});

const client = new ApolloClient({
  link: from([
    errorLink,
    authLink,   
       link,
  ]),
  cache: new InMemoryCache(),
});

export default client;