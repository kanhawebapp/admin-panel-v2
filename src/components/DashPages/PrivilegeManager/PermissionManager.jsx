"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client/react";

import {
  CREATE_PERMISSION,
  DELETE_PERMISSION,
  GET_MODULES,
  GET_PERMISSIONS,
  UPDATE_PERMISSION,
} from "@/app/graphQL/privilageOperations";

import DataTable from "@/components/utils/DataTable";
import { usePermissions } from "@/context/PermissionContext";
import { useActionHandler } from "@/hooks/useActionHandler";
import ProtectedActionButton from "@/components/Custom/ActionButton";
import ConfirmModal from "@/components/Custom/ConfirmModal";

export default function PermissionManager() {
  const { can, isSuperAdmin } = usePermissions();

  const { confirmState, setConfirmState, executeAction, handleConfirm } =
    useActionHandler();

  const { data, refetch } = useQuery(GET_PERMISSIONS, {
    variables: { page: 1, limit: 100 },
  });

  const { data: moduleData } = useQuery(GET_MODULES);

  const [createPermission] = useMutation(CREATE_PERMISSION);
  const [updatePermission] = useMutation(UPDATE_PERMISSION);
  const [deletePermission] = useMutation(DELETE_PERMISSION);

  const permissions = data?.getPermissions?.data || [];
  const modules = moduleData?.getModulesPaginated?.data || [];

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [name, setName] = useState("");
  const [selectedModules, setSelectedModules] = useState([]);

  const [activeTab, setActiveTab] = useState("ALL");

  // 🔥 PERMISSION FLAGS
  const canCreate = isSuperAdmin || can("permissions", "create");
  const canUpdate = isSuperAdmin || can("permissions", "update");

  // 🔥 COUNTS
  const counts = useMemo(() => {
    const system = permissions.filter((p) => p.type === "SYSTEM").length;
    const custom = permissions.filter((p) => p.type === "CUSTOM").length;

    return {
      ALL: permissions.length,
      SYSTEM: system,
      CUSTOM: custom,
    };
  }, [permissions]);

  // 🔥 FILTER
  const ACTION_ORDER = {
    read: 1,
    create: 2,
    update: 3,
    delete: 4,
  };

  const filteredPermissions = useMemo(() => {
    const list =
      activeTab === "ALL"
        ? [...permissions]
        : permissions.filter((p) => p.type === activeTab);

    return list.sort((a, b) => {
      const moduleA = a.modules?.[0]?.name || "";
      const moduleB = b.modules?.[0]?.name || "";

      if (moduleA !== moduleB) {
        return moduleA.localeCompare(moduleB);
      }

      const actionA = a.name.split(".")[1] || "";
      const actionB = b.name.split(".")[1] || "";

      return (ACTION_ORDER[actionA] || 99) - (ACTION_ORDER[actionB] || 99);
    });
  }, [permissions, activeTab]);

  const groupedPermissions = useMemo(() => {
    return filteredPermissions.reduce((acc, permission) => {
      const module = permission.modules?.[0];

      if (!module) return acc;

      if (!acc[module.id]) {
        acc[module.id] = {
          id: module.id,
          name: module.name,
          description:
            module.description || `Manage ${module.name.toLowerCase()}`,
          permissions: [],
        };
      }

      acc[module.id].permissions.push(permission);

      return acc;
    }, {});
  }, [filteredPermissions]);
  const formatPermissionName = (permission) => {
    if (!permission.includes(".")) return permission;

    const [module, action] = permission.split(".");

    const actionMap = {
      read: "View",
      create: "Create",
      update: "Update",
      delete: "Delete",
    };

    const moduleName = module
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return `${actionMap[action] || action} ${moduleName}`;
  };

  const resetForm = () => {
    setName("");
    setSelectedModules([]);
    setEditing(null);
  };

  const handleSubmit = async () => {
    try {
 

      const canSubmit =
        isSuperAdmin ||
        (editing ? can("permissions", "update") : can("permissions", "create"));

      if (!canSubmit) return;

      if (editing) {
        await updatePermission({
          variables: {
            permissionId: editing.id,
            name,
            moduleIds: selectedModules,
          },
        });
      } else {
        await createPermission({
          variables: {
            name,
            moduleIds: selectedModules,
            type: "CUSTOM",
          },
        });
      }

      await refetch();
      resetForm();
      setOpen(false);
    } catch (err) {
      console.error("Permission save error:", err);
    }
  };

  const getAction = (name) => {
    return name.split(".")[1] || "-";
  };
  const permissionColumns = [
    {
      header: "Permission",
      render: (row) => formatPermissionName(row.name),
    },
    {
      header: "Type",
      render: (row) => {
        const isSystem = row.type === "SYSTEM";

        return (
          <span
            className={`px-2 py-1 text-xs rounded ${
              isSystem
                ? "bg-gray-200 text-gray-700"
                : "bg-green-200 text-green-800"
            }`}
          >
            {isSystem ? "System Default" : "Custom"}
          </span>
        );
      },
    },
    {
      header: "Modules",
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          {row.modules?.map((m) => (
            <span
              key={m.id}
              className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs"
            >
              {m.name}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Action",
      render: (row) => {
        const action = getAction(row.name);

        return (
          <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs capitalize">
            {action === "read" ? "View" : action}
          </span>
        );
      },
    },
  ];

  return (
    <div className="p-10 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center judtify-center gap-2">
          {["ALL", "SYSTEM", "CUSTOM"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full ${
                activeTab === tab ? "bg-black text-white" : "bg-gray-200"
              }`}
            >
              {tab} ({counts[tab]})
            </button>
          ))}
        </div>

        <button
          disabled={!canCreate || activeTab === "SYSTEM"}
          onClick={() => {
            if (!canCreate) return;
            resetForm();
            setOpen(true);
          }}
          className={`px-4 py-2 rounded-full ${
            !canCreate || activeTab === "SYSTEM"
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-yellow-500"
          }`}
        >
          Create Permission
        </button>
      </div>

      <ConfirmModal
        open={!!confirmState}
        onCancel={() => setConfirmState(null)}
        onConfirm={handleConfirm}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.values(groupedPermissions).map((module) => (
          <div
            key={module.id}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="flex items-start justify-between p-2 px-4 border-b">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {module.name}
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  {module.description}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold">
                {module.permissions.length}
              </span>
            </div>

            {/* Permission List */}

            <div className="">
              {module.permissions.map((permission) => {
                const action = getAction(permission.name);

                return (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between px-5 py-2 border-b border-gray-300 last:border-b-0 hover:bg-gray-50"
                  >
                    <div>
                      <h4 className="text-xs text-gray-800">
                        {formatPermissionName(permission.name)}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium
                  ${
                    action === "read"
                      ? "bg-blue-100 text-blue-700"
                      : action === "create"
                        ? "bg-green-100 text-green-700"
                        : action === "update"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                  }`}
                      >
                        {action === "read"
                          ? "View"
                          : action.charAt(0).toUpperCase() + action.slice(1)}
                      </span>

                      {/* Type */}

                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          permission.type === "SYSTEM"
                            ? "bg-violet-100 text-violet-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {permission.type === "SYSTEM"
                          ? "System Default"
                          : "Custom"}
                      </span>

                      {/* Edit/Delete */}

                      {permission.type === "CUSTOM" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditing(permission);
                              setName(permission.name);
                              setSelectedModules(
                                permission.modules.map((m) => m.id),
                              );
                              setOpen(true);
                            }}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Edit
                          </button>

                          <ProtectedActionButton
                            module="permissions"
                            action="delete"
                            executeAction={executeAction}
                            mutationFn={deletePermission}
                            variables={{
                              permissionId: permission.id,
                            }}
                            onSuccess={refetch}
                            className="text-red-600 hover:underline text-sm"
                          >
                            Delete
                          </ProtectedActionButton>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-[400px] space-y-4">
                   <h2 className="text-xl text-center text-violet-600  font-bold">
              {editing ? "Edit Permissions" : "Create Permissions"}
            </h2>
            <input
              placeholder="Permission Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-full"
            />

            <select
              multiple
              value={selectedModules}
              onChange={(e) => {
                const values = [...e.target.selectedOptions].map(
                  (o) => o.value,
                );
                setSelectedModules(values);
              }}
              className="border border-gray-300 rounded-2xl p-2 w-full h-40"
            >
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            <div className="flex gap-2 justify-center">
              <button
                onClick={() => {
                  resetForm();
                  setOpen(false);
                }}
             className="px-4 py-1 cursor-pointer border rounded-full"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
           className="px-4 py-1 bg-black  cursor-pointer text-white rounded-full"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
