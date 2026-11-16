"use client";

import Image from "next/image";

export default function BlogSidebar({ categories }) {
  const recentPosts = [
    {
      title: "How to Use Yantra for Money Growth",
      image: "/blogs/yantra.webp",
      date: "Jun 11 2026",
    },
    {
      title: "Baglamukhi Kavach Benefits",
      image: "/blogs/baglamukhi.webp",
      date: "Jun 05 2026",
    },
    {
      title: "5 Mukhi Rudraksha Benefits",
      image: "/blogs/rudraksha.webp",
      date: "May 18 2026",
    },
  ];

  return (
    <div className="space-y-10">
 

      <div className="bg-white rounded-xl border border-gray-300 shadow-xl p-5">
        <h3 className="font-semibold text-center text-gray-400 uppercase mb-5">
          Categories
        </h3>

        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.id}>{cat.name}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
