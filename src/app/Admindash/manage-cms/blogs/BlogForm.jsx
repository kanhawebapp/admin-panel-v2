"use client";

import {
    CREATE_BLOG,
    GET_BLOG_BY_ID,
    GET_BLOG_BY_SLUG,
    GET_BLOG_CATEGORIES,
    UPDATE_BLOG,
} from "@/app/graphQL/managecms";
import TapEditor from "@/components/Custom/TapEditor";
import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function BlogForm({ mode = "create", slug }) {
    const router = useRouter();
    console.log("mode", mode);
    console.log("slug", slug);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        language: "",
        shortDescription: "",

        date: "",
        time: "",

        status: "DRAFT",

        content: "",

        featuredImage: null,
        featuredImageUrl: "",

        categories: [],

        hashtags: "",

        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",

        schemaMarkup: "",
    });

    const { data: categoryData } = useQuery(GET_BLOG_CATEGORIES);

    const { data: blogData } = useQuery(GET_BLOG_BY_SLUG, {
        skip: mode !== "edit" || !slug,
        variables: {
            slug,
        },
    });

    const [createBlog, { loading: createLoading }] = useMutation(CREATE_BLOG);

    const [updateBlog, { loading: updateLoading }] = useMutation(UPDATE_BLOG);

    const loading = createLoading || updateLoading;

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    useEffect(() => {
        if (mode === "edit" && blogData?.blogBySlug) {
            const blog = blogData.blogBySlug;

            let date = "";
            let time = "";

            if (blog.publishDate) {
                const publishDate = new Date(blog.publishDate);

                if (!isNaN(publishDate.getTime())) {
                    date = publishDate
                        .toISOString()
                        .split("T")[0];

                    time = publishDate
                        .toTimeString()
                        .slice(0, 5);
                }
            }

            setFormData({
                title: blog.title || "",
                slug: blog.slug || "",

                language: blog.language || "",

                shortDescription: blog.shortDescription || "",

                content: blog.content || "",

                featuredImageUrl: blog.featuredImage
                    ?`${process.env.NEXT_PUBLIC_API_BASE_URL}${blog.featuredImage}`
                    : "",



                categories: blog.categories?.map((item) => item.id) || [],

                hashtags: blog.hashtags?.join(",") || "",

                metaTitle: blog.metaTitle || "",

                metaDescription: blog.metaDescription || "",

                metaKeywords: blog.metaKeywords || "",

                schemaMarkup: blog.schemaMarkup || "",

                status: blog.status || "DRAFT",

                date,
                time,
            });
        }
    }, [blogData, mode, slug]);

    const toggleCategory = (cat) => {
        setFormData((prev) => ({
            ...prev,
            categories: prev.categories.includes(cat)
                ? prev.categories.filter((item) => item !== cat)
                : [...prev.categories, cat],
        }));
    };

    const uploadImage = async (file) => {
        if (!file) return null;

        const imageFormData = new FormData();

        imageFormData.append("image", file);

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/adminAuth/api/blog-images`,
            {
                method: "POST",
                body: imageFormData,
            },
        );

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.message || "Image upload failed");
        }

        return data?.url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let featuredImageUrl = formData.featuredImageUrl || null;

            if (formData.featuredImage) {
                featuredImageUrl = await uploadImage(formData.featuredImage);
            }

            const publishDate =
                formData.date && formData.time
                    ? new Date(`${formData.date}T${formData.time}`).toISOString()
                    : null;

            const payload = {
                title: formData.title,
                slug: formData.slug,

                language: formData.language,

                shortDescription: formData.shortDescription,

                content: formData.content,

                status: formData.status,

                publishDate,

                featuredImage: featuredImageUrl,

                hashtags: formData.hashtags?.trim()
                    ? formData.hashtags
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean)
                    : [],

                metaTitle: formData.metaTitle,

                metaDescription: formData.metaDescription,

                metaKeywords: formData.metaKeywords,

                schemaMarkup: formData.schemaMarkup,

                categoryIds: formData.categories || [],
            };

            if (mode === "create") {
                await createBlog({
                    variables: {
                        input: payload,
                    },
                });

                toast.success("Blog created successfully");
            } else {
                await updateBlog({
                    variables: {
                        id: blogData?.blogBySlug?.id,
                        input: payload,
                    },
                });

                toast.success("Blog updated successfully");
            }
        } catch (error) {
            console.error(error);

            toast.error(error?.message || "Something went wrong");
        }
        router.push("/Admindash/manage-cms/blogs");
    };

    return (
        <div className="shadow-xl rounded-xl px-5 py-2">
            <form onSubmit={handleSubmit} className="grid lg:grid-cols-4 gap-6">
                {/* LEFT */}
                <div className="lg:col-span-3 space-y-5">
                    <div>
                        <label className="font-semibold">Blog Title</label>

                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-full p-3 mt-1 bg-white/50"
                        />
                    </div>

                    <div>
                        <label className="font-semibold">Slug</label>

                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            className="w-full border bg-white/50 border-gray-300 rounded-full p-3 mt-1"
                        />
                    </div>

                    <div>
                        <label className="font-semibold">Short Description</label>

                        <textarea
                            rows={4}
                            name="shortDescription"
                            value={formData.shortDescription}
                            onChange={handleChange}
                            className="w-full bg-white/50 border border-gray-300 rounded-2xl p-3 mt-1"
                        />
                    </div>

                    <div className="overflow-y-auto max-h-120">
                   
                        <label className="font-semibold block mb-2">Blog Content</label>

                        <TapEditor
                            value={formData.content}
                            onChange={(html) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    content: html,
                                }))
                            }
                        />
                    </div>

                    <div className="border border-gray-300 rounded-xl p-4">
                        <h3 className="font-bold mb-4">Featured Image</h3>

                        <input
                            type="file"
                            accept="image/*"
                            className="rounded-full px-3 py-2 bg-white/50"
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    featuredImage: e.target.files?.[0],
                                }))
                            }
                        />

                        {formData.featuredImage ? (
                            <img
                                src={URL.createObjectURL(formData.featuredImage)}
                                alt=""
                                className="mt-4 h-40 w-full object-cover rounded"
                            />
                        ) : formData.featuredImageUrl ? (
                            <img
                                src={formData.featuredImageUrl}
                                alt="feature image"
                                className="mt-4 h-40 w-full object-cover rounded"
                            />
                        ) : null}
                    </div>
                    <div className="border border-gray-300 rounded-xl p-5">
                        <h2 className="font-bold text-lg mb-4">SEO Information</h2>

                        <div className="space-y-4">
                            <input
                                type="text"
                                name="metaTitle"
                                placeholder="Meta Title"
                                value={formData.metaTitle}
                                onChange={handleChange}
                                className="w-full border border-gray-300 bg-white/50 rounded-full p-3"
                            />

                            <textarea
                                rows={3}
                                name="metaDescription"
                                placeholder="Meta Description"
                                value={formData.metaDescription}
                                onChange={handleChange}
                               className="w-full border border-gray-300 bg-white/50 rounded-2xl p-3"
                            />

                            <input
                                type="text"
                                name="metaKeywords"
                                placeholder="Meta Keywords"
                                value={formData.metaKeywords}
                                onChange={handleChange}
                                className="w-full border bg-white/50 border-gray-300 rounded-full p-3"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="font-semibold">Popular Hashtags</label>

                        <input
                            type="text"
                            name="hashtags"
                            placeholder="#astro,#kundli,#numerology"
                            value={formData.hashtags}
                            onChange={handleChange}
                            className="w-full border bg-white/50 border-gray-300 rounded-full p-3 mt-2"
                        />
                    </div>

                    <div>
                        <label className="font-semibold">Schema JSON-LD</label>

                        <textarea
                            rows={10}
                            name="schemaMarkup"
                            value={formData.schemaMarkup}
                            onChange={handleChange}
                            placeholder="Paste JSON-LD schema"
                            className="w-full border bg-white/50 border-gray-300 rounded-lg p-3 mt-2 font-mono"
                        />
                    </div>
                </div>

                {/* RIGHT */}
                <div className="space-y-5 ">
                    <div className="border border-gray-300 shadow-xl rounded-xl p-4">
                        <h3 className="font-bold mb-4">Publish</h3>

                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-full bg-white/50 p-2 mb-3"
                        />

                        <input
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-full bg-white/50 p-2 mb-3"
                        />

                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-full bg-white/50 p-2"
                        >
                            <option value="DRAFT">Draft</option>
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="PUBLISHED">Published</option>
                        </select>
                    </div>
                    <div className="border border-gray-300 shadow-xl rounded-2xl bg-white/50 p-4">
                        <h3 className="font-bold mb-4">Language</h3>

                        <select
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-full p-2"
                        >
                            <option value="">Select Language</option>

                            <option value="English">English</option>

                            <option value="Hindi">Hindi</option>
                        </select>
                    </div>
                    <div className="border border-gray-300 bg-white/50 rounded-xl p-4">
                        <h3 className="font-bold mb-4">Categories</h3>

                        <div className="space-y-2">
                            {categoryData?.blogCategories?.map((cat) => (
                                <label key={cat.id} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.categories.includes(cat.id)}
                                        onChange={() => toggleCategory(cat.id)}
                                    />

                                    {cat.name}
                                </label>
                            ))}
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-3 cursor-pointer rounded-full"
                    >
                        {loading
                            ? mode === "create"
                                ? "Creating..."
                                : "Updating..."
                            : mode === "create"
                                ? "Create Blog"
                                : "Update Blog"}
                    </button>{" "}
                    <button
                        type="button"
                        onClick={() =>
                            setFormData({
                                title: "",
                                slug: "",
                                language: "",
                                shortDescription: "",
                                date: "",
                                time: "",
                                status: "DRAFT",
                                content: "",
                                featuredImageUrl: "",
                                categories: [],
                                hashtags: "",
                                metaTitle: "",
                                metaDescription: "",
                                metaKeywords: "",
                                schemaMarkup: "",
                            })
                        }
                         className="w-full bg-gray-600 text-white py-3 cursor-pointer rounded-full"
                    >
                        Reset
                    </button>
                </div>
            </form>
        </div>
    );
}
