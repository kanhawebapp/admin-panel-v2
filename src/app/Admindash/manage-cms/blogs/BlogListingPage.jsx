"use client";


import BlogCard from "./BlogCard";

import {
  DELETE_BLOG,
  GET_BLOGS,
} from "@/app/graphQL/managecms";
import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function BlogListPage() {
  const { data: blogData, loading, refetch } = useQuery(GET_BLOGS);
  const router = useRouter();


  const [deleteBlog] = useMutation(DELETE_BLOG);
const handleDelete = async (id) => {
  try {
    const confirmDelete = window.confirm(
      "Delete this Blog?"
    );

    if (!confirmDelete) return;

    await deleteBlog({
      variables: {
        id,
      },
    });

    toast.success(
      "Blog deleted successfully"
    );

    refetch();
  } catch (error) {
    toast.error(
      error.message ||
        "Unable to delete Blog"
    );
  }
};

  const handleEdit = (blog) => {
    router.push(`/Admindash/managecms/blogs/edit/${blog.slug}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-semibold">Blog Lists</h1>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-3">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {blogData?.blogs?.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
