"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PujaServiceForm from "../../PujaServiceForm";


export default function EditPujaPage() {
  const { id } = useParams();
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto p-6">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Puja Service</h1>
          <p className="text-gray-500 mt-1">
            Update your puja service details.
          </p>
        </div>

        <Link
          href="/Admindash/dhwani-services/puja-services"
          className="border px-5 py-1 text-sm rounded-full"
        >
          Back to List
        </Link>
      </div>

      <PujaServiceForm
        mode="edit"
        pujaId={id}
        onSuccess={() => router.push("/Admindash/dhwani-services/puja-services")}
      />

    </div>
  );
}