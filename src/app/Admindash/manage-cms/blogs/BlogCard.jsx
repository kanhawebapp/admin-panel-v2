"use client";

import Image from "next/image";
import Link from "next/link";
import { FaComment, FaTrash, FaEdit } from "react-icons/fa";

export default function BlogCard({ blog, onEdit, onDelete }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return "-";

    return new Date(Number(timestamp)).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-300 shadow-xl ">
      <Image
        src={
          blog.featuredImage?.startsWith("http")
            ? blog.featuredImage
            :`${process.env.NEXT_PUBLIC_API_BASE_URL}${blog.featuredImage}`
        }
        alt={blog.title}
        width={800}
        height={400}
        unoptimized
        className="w-full h-[200px] object-cover"
      />

      <div className="p-3">
        <h2 className="text-xl font-medium mb-2">{blog.title}</h2>

        <div className="flex gap-2 text-xs font-bold text-gray-500 mb-2">
          <span>by {blog.author}</span>
          <span>|</span>
          <span>{formatDate(blog.createdAt)}</span>
        </div>

        {/* <p className="text-gray-600 line-clamp-3">{blog.description}</p> */}

        <hr className="my-2" />

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-gray-500">
            <FaComment />
            <span>{blog.comments} Comments</span>
          </div>

          <Link
            className="text-indigo-600 text-xs"
            href={`/Admindash/managecms/blogs/${blog.slug}`}
          >
            Read More
          </Link>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => onEdit(blog)}
              className="bg-green-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1"
            >
              <FaEdit />
              Edit
            </button>

            <button
              onClick={() => onDelete(blog.id)}
              className="bg-red-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1"
            >
              <FaTrash />
              Delete
            </button>

            <span className=" text-black text-xs font-medium px-3 py-1 rounded-full">
              {blog.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
