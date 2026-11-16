"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

import {
  GET_PUJA_SERVICES,
  DELETE_PUJA_SERVICE,
  DELETE_PUJA_REVIEW,
} from "../../../graphQL/homeGql";
import PujaServicesTable from "./PujaServicesTable";



export default function PujaServicesAdmin() {
  const router = useRouter();
  const [showReviews, setShowReviews] = useState(null);

  const { data, loading, error } = useQuery(GET_PUJA_SERVICES);

  const [deletePuja] = useMutation(DELETE_PUJA_SERVICE, {
    refetchQueries: [GET_PUJA_SERVICES],
  });

  const [deleteReview] = useMutation(DELETE_PUJA_REVIEW, {
    refetchQueries: [GET_PUJA_SERVICES],
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Puja?")) {
      return;
    }

    try {
      await deletePuja({ variables: { id } });
      toast.success("Puja deleted successfully");
    } catch (error) {
      toast.error(error.message || "Unable to delete Puja");
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Delete this customer review?")) return;

    try {
      await deleteReview({ variables: { id } });
      toast.success("Review deleted successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="p-6">Loading Puja Services...</div>;

  if (error) {
    return <div className="p-6 text-red-500">{error.message}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Puja Services</h1>
          <p className="text-gray-500 mt-1 text-xs">
            Manage all your puja services here.
          </p>
        </div>

        <Link
          href="/Admindash/dhwani-services/puja-services/add"
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full"
        >
          + Add Puja
        </Link>
      </div>

      <PujaServicesTable
        services={data?.pujaServices || []}
        onEdit={(id) =>
          router.push(
            `/Admindash/dhwani-services/puja-services/edit/${id}`
          )
        }
        onDelete={handleDelete}
        onDeleteReview={handleDeleteReview}
        showReviews={showReviews}
        setShowReviews={setShowReviews}
      />

    </div>
  );
}