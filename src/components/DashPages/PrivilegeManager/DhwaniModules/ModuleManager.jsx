"use client";

import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  FiChevronDown,
  FiChevronRight,
  FiSearch,
  FiGrid,
  FiFolder,
} from "react-icons/fi";
import { MdDashboard, MdSecurity, MdPeople, MdSettings } from "react-icons/md";
import {
  CREATE_MODULE,
  DELETE_MODULE,
  GET_MODULES,
  UPDATE_MODULE,
} from "@/app/graphQL/privilageOperations";

import { useActionHandler } from "@/hooks/useActionHandler";
import ConfirmModal from "@/components/Custom/ConfirmModal";
import ProtectedActionButton from "@/components/Custom/ActionButton";
import { usePermissions } from "@/context/PermissionContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ModuleManager() {
  const router = useRouter();
  const { confirmState, setConfirmState, executeAction, handleConfirm } =
    useActionHandler();

  const { data, loading, error, refetch } = useQuery(GET_MODULES, {
    variables: { page: 1, limit: 50 },
  });

  const { can, isSuperAdmin } = usePermissions();

  const modules = data?.getModulesPaginated?.data || [];
  const [search, setSearch] = useState("");

  const [openSections, setOpenSections] = useState({});

  const sectionConfig = {
    astrologer: {
      title: "Astrologer",
      color: "from-blue-500 to-cyan-500",
      icon: <MdPeople size={22} />,
    },

    user: {
      title: "Users",
      color: "from-green-500 to-emerald-500",
      icon: <MdPeople size={22} />,
    },

    managecms: {
      title: "CMS",
      color: "from-purple-500 to-pink-500",
      icon: <MdSettings size={22} />,
    },

    privilege: {
      title: "Privileges",
      color: "from-orange-500 to-red-500",
      icon: <MdSecurity size={22} />,
    },

    home: {
      title: "Home",
      color: "from-gray-700 to-gray-900",
      icon: <MdDashboard size={22} />,
    },

    panel: {
      title: "Panel",
      color: "from-indigo-500 to-violet-500",
      icon: <FiFolder size={22} />,
    },

    newastrologer: {
      title: "Hiring",
      color: "from-yellow-500 to-orange-500",
      icon: <MdPeople size={22} />,
    },

    "dhwani-services": {
      title: "Dhwani Services",
      color: "from-pink-500 to-rose-500",
      icon: <FiGrid size={22} />,
    },

    dhwanirevenue: {
      title: "Revenue",
      color: "from-teal-500 to-cyan-600",
      icon: <FiGrid size={22} />,
    },
  };
  const gradients = [
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-purple-500 to-pink-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-violet-500",
    "from-pink-500 to-rose-500",
    "from-teal-500 to-cyan-600",
    "from-yellow-500 to-orange-500",
  ];

  const filteredModules = useMemo(() => {
    return modules.filter((m) => {
      return (
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.slug.toLowerCase().includes(search.toLowerCase()) ||
        m.section.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [modules, search]);

  const groupedModules = useMemo(() => {
    return filteredModules.reduce((acc, module) => {
      const key = module.section || "others";

      if (!acc[key]) acc[key] = [];

      acc[key].push(module);

      return acc;
    }, {});
  }, [filteredModules]);
  useEffect(() => {
    const expanded = {};

    Object.keys(groupedModules).forEach((key) => {
      expanded[key] = true;
    });

    setOpenSections(expanded);
  }, [data]);
  const totalSections = Object.keys(groupedModules).length;

  const totalModules = modules.length;
  const sectionsFromDB = useMemo(() => {
    const allSections = modules.map((m) => m.section).filter(Boolean);
    return [...new Set(allSections)];
  }, [modules]);

  const canEdit = isSuperAdmin || can("modules", "update");

  const [createModule] = useMutation(CREATE_MODULE);
  const [updateModule] = useMutation(UPDATE_MODULE);
  const [deleteModule] = useMutation(DELETE_MODULE);

  const [openModal, setOpenModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const [section, setSection] = useState("");
  const [customSection, setCustomSection] = useState("");
  const [useCustomSection, setUseCustomSection] = useState(false);

  useEffect(() => {
    if (editingModule) {
      setName(editingModule.name);
      setSlug(editingModule.slug);
      setDescription(editingModule.description || "");
      setSection(editingModule.section || "");
      setUseCustomSection(false);
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setSection("");
      setCustomSection("");
      setUseCustomSection(false);
    }
  }, [editingModule]);

  const handleSubmit = async () => {
    try {
      const canSubmit =
        isSuperAdmin ||
        (editingModule ? can("modules", "update") : can("modules", "create"));

      if (!canSubmit) return;

      if (useCustomSection && !customSection.trim()) {
        toast.error("Enter section name");
        return;
      }

      if (useCustomSection) {
        const exists = sectionsFromDB.includes(
          customSection.toLowerCase().trim(),
        );

        if (exists) {
          toast.error("Section already exists");
          return;
        }
      }

      const finalSection = useCustomSection
        ? customSection.toLowerCase().trim()
        : section.toLowerCase().trim();

      if (!finalSection) {
        toast.error("Select section");
        return;
      }

      if (!name.trim() || !slug.trim()) {
        toast.error("Name and slug are required");
        return;
      }

      if (editingModule) {
        await updateModule({
          variables: {
            id: editingModule.id,
            name,
            slug,
            description,
            section: finalSection,
          },
        });

        toast.success("Updated Successfully");
      } else {
        await createModule({
          variables: {
            name,
            slug,
            description,
            section: finalSection,
          },
        });

        toast.success("Created Successfully");
      }

      await refetch();

      setOpenModal(false);
      setEditingModule(null);
      setName("");
      setSlug("");
      setDescription("");
      setSection("");
      setCustomSection("");
    } catch (err) {
      console.error("Module save error:", err);

      const errorMessage =
        err?.graphQLErrors?.[0]?.message ||
        err?.networkError?.result?.errors?.[0]?.message ||
        err?.message ||
        "Something went wrong";

      toast.error(`${errorMessage}. Please login first.`);
      router.push("/");
    }
  };

  if (loading) return <p className="p-10">Loading modules...</p>;
  if (error) return <p className="p-10 text-red-500">Error loading modules</p>;

  return (
    <div className="">
      <ConfirmModal
        open={!!confirmState}
        onCancel={() => setConfirmState(null)}
        onConfirm={handleConfirm}
      />

      <div className="space-y-8 mt-2">
        <div className="rounded-3xl flex flex-col gap-3 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 text-white p-5 shadow-xl">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-2xl font-semibold">Module Manager</h1>
            </div>

            <ProtectedActionButton
              module="modules"
              action="create"
              executeAction={() => {
                setEditingModule(null);
                setOpenModal(true);
              }}
              className="bg-white text-black px-6 py-2 rounded-xl font-semibold hover:scale-105 transition"
            >
              + Create Module
            </ProtectedActionButton>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl items-center justify-between flex bg-gradient-to-r from-blue-500 to-cyan-500 p-3 text-white shadow-lg">
              <p className="opacity-80">Total Modules</p>

              <h2 className="text-2xl font-bold ">{totalModules}</h2>
            </div>

            <div className="rounded-2xl flex items-center justify-between bg-gradient-to-r from-purple-500 to-pink-500 p-3 text-white shadow-lg">
              <p className="opacity-80">Total Sections</p>

              <h2 className="text-2xl font-bold ">{totalSections}</h2>
            </div>

            <div className="rounded-2xl flex items-center justify-between bg-gradient-to-r from-emerald-500 to-green-600 p-3 text-white shadow-lg">
              <p className="opacity-80">Visible Modules</p>

              <h2 className="text-2xl font-bold ">{filteredModules.length}</h2>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-5">
          <div className="relative">
            <FiSearch className="absolute left-5 top-3 text-gray-400 text-xl" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search modules..."
              className="w-full rounded-full border border-gray-200 bg-white pl-14 pr-5 py-2 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                const obj = {};

                Object.keys(groupedModules).forEach((k) => {
                  obj[k] = true;
                });

                setOpenSections(obj);
              }}
              className="px-4 py-1 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Expand All
            </button>

            <button
              onClick={() => {
                const obj = {};

                Object.keys(groupedModules).forEach((k) => {
                  obj[k] = false;
                });

                setOpenSections(obj);
              }}
              className="px-4 py-1 text-sm rounded-xl border hover:bg-gray-100 transition"
            >
              Collapse All
            </button>
          </div>
        </div>

        <div className="space-y-6 ">
          {Object.entries(groupedModules)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([section, items], index) => {
              const config = {
                title:
                  sectionConfig[section]?.title ||
                  section
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase()),

                icon: sectionConfig[section]?.icon || <FiFolder size={22} />,

                color:
                  sectionConfig[section]?.color ||
                  gradients[index % gradients.length],
              };

              return (
                <div
                  key={section}
                  className="bg-white rounded-2xl  shadow-lg overflow-hidden border border-gray-300"
                >
                  <div
                    onClick={() =>
                      setOpenSections((prev) => ({
                        ...prev,
                        [section]: !prev[section],
                      }))
                    }
                    className={`bg-gradient-to-r ${config.color} cursor-pointer text-white px-6 py-2 flex justify-between items-center`}
                  >
                    <div className="flex gap-4 items-center">
                      <div className="bg-white/20 rounded-xl p-3">
                        {config.icon}
                      </div>

                      <div>
                        <h2 className="text-xl font-bold">{config.title}</h2>

                        <p className="text-sm opacity-80">
                          {items.length} Modules
                        </p>
                      </div>
                    </div>

                    {openSections[section] ? (
                      <FiChevronDown size={24} />
                    ) : (
                      <FiChevronRight size={24} />
                    )}
                  </div>

                  {openSections[section] && (
                    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 p-3">
                      {items
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((module) => (
                          <div
                            key={module.id}
                            className="group relative rounded-2xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`h-8 w-8 rounded-xl bg-gradient-to-r ${config.color} flex items-center justify-center text-white shadow`}
                                >
                                  {config.icon}
                                </div>

                                <div>
                                  <h3 className="font-semibold text-md text-gray-800 line-clamp-1">
                                    {module.name}
                                  </h3>

                                  <span className="inline-flex mt-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                    {module.slug}
                                  </span>
                                </div>
                              </div>

                              <span className="rounded-full bg-green-100 px-3 py- text-xs text-green-700">
                                Active
                              </span>
                            </div>

                            <div className="mt-2">
                              <p className="text-sm text-gray-600 leading-6">
                                {module.description ||
                                  "No description available."}
                              </p>
                            </div>

                            <div className="mt-3 flex items-center justify-between border-t border-gray-300 pt-2">
                              <div>
                                <p className="text-xs text-gray-400">Section</p>

                                <p className="font-semibold capitalize">
                                  {config.title}
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  disabled={!canEdit}
                                  onClick={() => {
                                    if (!canEdit) return;
                                    setEditingModule(module);
                                    setOpenModal(true);
                                  }}
                                  className={`rounded-full px-4 py-1 text-xs font-medium transition ${
                                    canEdit
                                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  }`}
                                >
                                  Edit
                                </button>

                                <ProtectedActionButton
                                  module="modules"
                                  action="delete"
                                  executeAction={executeAction}
                                  mutationFn={deleteModule}
                                  variables={{ id: module.id }}
                                  onSuccess={refetch}
                                  className="rounded-full bg-red-500 hover:bg-red-600 px-4 py-1 text-xs text-white transition"
                                >
                                  Delete
                                </ProtectedActionButton>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-[400px] space-y-4">
            <h2 className="text-xl text-center text-violet-600  font-bold">
              {editingModule ? "Edit Module" : "Create Module"}
            </h2>

            <input
              type="text"
              placeholder="Name"
              className="w-full border border-gray-300 p-2 rounded-full"
              value={name}
              onChange={(e) => {
                const val = e.target.value;
                setName(val);

                if (!editingModule) {
                  const generatedSlug = val
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "");

                  setSlug(generatedSlug);
                }
              }}
            />

            <input
              type="text"
              placeholder="Slug"
              className="w-full border border-gray-300 p-2 rounded-full bg-gray-100"
              value={slug}
              readOnly={!editingModule}
            />

            <div>
              <label className="text-sm font-medium">Section</label>

              <select
                value={useCustomSection ? "custom" : section}
                onChange={(e) => {
                  if (e.target.value === "custom") {
                    setUseCustomSection(true);
                    setSection("");
                  } else {
                    setUseCustomSection(false);
                    setCustomSection("");
                    setSection(e.target.value);
                  }
                }}
                className="w-full border border-gray-300 p-2 rounded-full"
              >
                <option value="">Select Section</option>

                {sectionsFromDB.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}

                <option value="custom">+ Create New Section</option>
              </select>
            </div>

            {useCustomSection && (
              <input
                type="text"
                placeholder="Enter new section"
                value={customSection}
                onChange={(e) => setCustomSection(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-2xl"
              />
            )}

            <textarea
              placeholder="Description"
              className="w-full border border-gray-300 p-2 rounded-2xl"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setOpenModal(false);
                  setEditingModule(null);
                }}
                className="px-4 py-1 cursor-pointer border rounded-full"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="px-4 py-1 bg-black  cursor-pointer text-white rounded-full"
              >
                {editingModule ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
