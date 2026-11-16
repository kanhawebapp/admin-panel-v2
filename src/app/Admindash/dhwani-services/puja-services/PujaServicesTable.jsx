
"use client";

export default function PujaServicesTable({
  services = [],
  onEdit,
  onDelete,
  onDeleteReview,
  showReviews,
  setShowReviews,
}) {
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? new URL(process.env.NEXT_PUBLIC_API_BASE_URL).origin
    : "";

  if (!services.length) {
    return (
      <div className="border rounded-xl p-12 text-center">
        <h3 className="text-xl font-semibold text-gray-700">
          No Puja Services Found
        </h3>
        <p className="text-gray-500 mt-2">
          Click Add Puja to create your first service.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 shadow-lg rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">
        All Puja Services ({services.length})
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px]">
          <thead>
            <tr className="border-b border-gray-200 bg-purple-100">
              <th className="text-left p-3">Puja</th>
              <th className="text-left p-3">Price</th>
              <th className="text-left p-3">Rating</th>
              <th className="text-left p-3">Reviews</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {services.map((puja) => (
              <tr key={puja.id} className="border-b border-gray-300 hover:bg-gray-50">

                {/* Puja Information */}
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        puja.image?.startsWith("http")
                          ? puja.image
                          : `${backendUrl}${puja.image || ""}`
                      }
                      alt={puja.title || "Puja image"}
                      className="w-20 h-20 rounded-lg object-cover border"
                    />

                    <div>
                      <p className="font-semibold">
                        {puja.title}
                      </p>

                      <p className="text-xs text-gray-500">
                        {puja.slug}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td className="p-3 font-medium">
                  ₹{puja.price}
                </td>

                {/* Rating */}
                <td className="p-3">
                  ⭐ {puja.rating || 0}
                </td>

                {/* Reviews */}
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() =>
                      setShowReviews(
                        showReviews === puja.id ? null : puja.id
                      )
                    }
                    className="text-purple-600 font-medium hover:underline"
                  >
                    {puja.reviews?.length || 0} Reviews
                  </button>
                </td>

                {/* Actions */}
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(puja.id)}
                      className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white px-3 py-1 rounded-lg text-xs"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(puja.id)}
                      className="bg-red-500 hover:bg-red-600 cursor-pointer text-white px-3 py-1 rounded-lg text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reviews Section */}
      {services
        .filter((puja) => puja.id === showReviews)
        .map((puja) => (
          <div
            key={puja.id}
            className="mt-8 border-t pt-6"
          >
            <h3 className="text-xl font-bold mb-5">
              Reviews for {puja.title}
            </h3>

            {!puja.reviews?.length ? (
              <p className="text-gray-500">
                No reviews yet.
              </p>
            ) : (
              <div className="space-y-4">
                {puja.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border rounded-xl p-5"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">
                          {review.userName}
                        </p>

                        <p>
                          {"⭐".repeat(
                            Math.max(
                              0,
                              Math.min(5, Number(review.rating) || 0)
                            )
                          )}
                        </p>
                      </div>

                      <p className="text-sm text-gray-500">
                        {review.createdAt
                          ? new Date(
                              Number(review.createdAt)
                            ).toLocaleDateString("en-IN")
                          : "-"}
                      </p>
                    </div>

                    <p className="mt-3 text-gray-700">
                      {review.comment}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        onDeleteReview(review.id)
                      }
                      className="mt-4 text-red-500 text-sm hover:underline"
                    >
                      Delete Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
