"use client";

import { GET_ENDED_LIVE_STREAMS } from "@/app/graphQL/liveStream";
import { useQuery } from "@apollo/client/react";

export default function EndedLiveStreams() {
  const { data, loading, error } = useQuery(
    GET_ENDED_LIVE_STREAMS,
    {
      variables: {
        page: 1,
        limit: 20,
      },
    }
  );

  if (loading) return <p>Loading ended livestreams...</p>;

  if (error) {
    return <p>Failed to load: {error.message}</p>;
  }

  const result = data?.getEndedLiveStreams;
  const streams = result?.data ?? [];

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">
        Ended Livestreams ({result?.total ?? 0})
      </h1>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Astrologer</th>
              <th className="p-3">Status</th>
              <th className="p-3">Views</th>
              <th className="p-3">Started At</th>
              <th className="p-3">Ended At</th>
            </tr>
          </thead>

          <tbody>
            {streams.map((stream) => (
              <tr key={stream.id} className="border-t">
                <td className="p-3">{stream.title}</td>
                <td className="p-3">{stream.astrologer.displayName}</td>
                <td className="p-3">{stream.status}</td>
                <td className="p-3">{stream.totalViews ?? 0}</td>
                <td className="p-3">
                  {stream.startedAt
                    ? new Date(stream.startedAt).toLocaleString("en-IN")
                    : "—"}
                </td>
                <td className="p-3">
                  {stream.endedAt
                    ? new Date(stream.endedAt).toLocaleString("en-IN")
                    : "—"}
                </td>
              </tr>
            ))}

            {streams.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center">
                  No ended livestreams found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}