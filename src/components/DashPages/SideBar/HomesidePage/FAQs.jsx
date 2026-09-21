"use client";

import { useState, useEffect } from "react";

import { usePermissions } from "@/context/PermissionContext";
import ProtectedActionButton from "@/components/Custom/ActionButton";
import ConfirmModal from "@/components/Custom/ConfirmModal";
import { useActionHandler } from "@/hooks/useActionHandler";
import toast from "react-hot-toast";
import { CREATE_FAQ, DELETE_FAQ, GET_FAQS, UPDATE_FAQ } from "@/app/graphQL/homeGql";
import { useMutation, useQuery } from "@apollo/client/react";

export default function FAQPage() {
    const { can, isSuperAdmin } = usePermissions();

    const { confirmState, setConfirmState, executeAction, handleConfirm } =
        useActionHandler();

    const { data, refetch } = useQuery(GET_FAQS);

    const [createFaq] = useMutation(CREATE_FAQ);
    const [updateFaq] = useMutation(UPDATE_FAQ);
    const [deleteFaq] = useMutation(DELETE_FAQ);

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const [form, setForm] = useState({
        question: "",
        answer: "",
    });

   
    const canCreate = isSuperAdmin || can("faqs", "create");
    const canUpdate = isSuperAdmin || can("faqs", "update");

    useEffect(() => {
        if (editing) {
            setForm({
                question: editing.question,
                answer: editing.answer,
            });
        } else {
            setForm({ question: "", answer: "" });
        }
    }, [editing]);

    const handleSubmit = async () => {
        try {
            const allowed =
                isSuperAdmin ||
                (editing ? can("faqs", "update") : can("faqs", "create"));

            if (!allowed) return;

            if (editing) {
                await updateFaq({
                    variables: { id: editing.id, input: form },
                });
                toast.success("FAQ updated");
            } else {
                await createFaq({
                    variables: { input: form },
                });
                toast.success("FAQ created");
            }

            setOpen(false);
            setEditing(null);
            refetch();
            setForm("");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-10 space-y-6">
            
            <button
                onClick={() => {
                    if (!canCreate) return;
                    setEditing(null);
                    setOpen(true);
                }}
                className={`px-5 py-2 rounded-full bg-yellow-500 text-black ${!canCreate ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                    }`}
            >
                Create FAQ
            </button>

           
            <ConfirmModal
                open={!!confirmState}
                onCancel={() => setConfirmState(null)}
                onConfirm={handleConfirm}
            />

       
            <div className="grid gap-4">
                {data?.faqs?.map((faq) => (
                    <div
                        key={faq.id}
                        className="border border-gray-300  p-4 rounded-2xl shadow-xl flex flex-col "
                    >
                        <div className="flex flex-col gap-3">
                            <h2 className="font-semibold">{faq.question}</h2>
                            <p className="text-gray-600">{faq.answer}</p>
                        </div>

                        <div className="flex justify-end justify-self-end gap-2">
                   
                            <button
                                onClick={() => {
                                    if (!canUpdate) return;
                                    setEditing(faq);
                                    setOpen(true);
                                }}
                                className={`px-3 py-1 text-xs rounded-full bg-blue-500 text-white ${!canUpdate ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                                    }`}
                            >
                                Edit
                            </button>

                          
                            <ProtectedActionButton
                                module="faqs"
                                action="delete"
                                executeAction={executeAction}
                                mutationFn={deleteFaq}
                                variables={{ id: faq.id }}
                                onSuccess={() => {
                                    toast.success("Deleted");
                                    refetch();
                                }}
                                className={`px-3 py-1 text-xs bg-red-500 text-white rounded-full ${!(isSuperAdmin || can("faqs", "delete"))
                                        ? "cursor-not-allowed opacity-70"
                                        : "cursor-pointer"
                                    }`}
                            >
                                Delete
                            </ProtectedActionButton>
                        </div>
                    </div>
                ))}
            </div>

         
            {open && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-[400px] space-y-4">
                        <h2 className="text-xl font-semibold">
                            {editing ? "Edit FAQ" : "Create FAQ"}
                        </h2>

                        <input
                            placeholder="Question"
                            className="w-full border border-gray-300 rounded-full p-2"
                            value={form.question}
                            onChange={(e) =>
                                setForm({ ...form, question: e.target.value })
                            }
                        />

                        <textarea
                            placeholder="Answer"
                            className="w-full border   border-gray-300 rounded-full p-2"
                            value={form.answer}
                            onChange={(e) =>
                                setForm({ ...form, answer: e.target.value })
                            }
                        />

                        <div className="flex text-xs justify-center gap-3">
                            <button className="rounded-full px-4 py-2 bg-gray-400 cursor-pointer" onClick={() => setOpen(false)}>Cancel</button>
                            <button
                                onClick={handleSubmit}
                                className="px-4 py-2 bg-black text-white cursor-pointer rounded-full"
                            >
                                {editing ? "Update" : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}