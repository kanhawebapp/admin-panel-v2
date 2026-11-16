"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import PujaServiceForm from "../PujaServiceForm";

export default function AddPujaPage() {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto p-6">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Add Puja Service</h1>
          <p className="text-gray-500 mt-1">
            Create a new puja service.
          </p>
        </div>

        <Link
          href="/Admindash/dhwani-services/puja-services"
          className="border px-5 py-1 rounded-full text-sm"
        >
          Back to List
        </Link>
      </div>

      <PujaServiceForm
        mode="create"
        onSuccess={() => router.push("/Admindash/dhwani-services/puja-services")}
      />

    </div>
  );
}