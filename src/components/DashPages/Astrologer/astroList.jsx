"use client";

import { gql } from "@apollo/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import CustomInput from "@/components/Custom/CustomInput";
import CustomButton from "@/components/Custom/CustomButtom";
import DataTable from "@/components/utils/DataTable";
import { usePermissions } from "@/context/PermissionContext";
import { useActionHandler } from "@/hooks/useActionHandler";
import { useMutation, useQuery } from "@apollo/client/react";
import ProtectedActionButton from "@/components/Custom/ActionButton";
import ConfirmModal from "@/components/Custom/ConfirmModal";
import { GET_ASTRO_LIST } from "@/app/graphQL/astroHiring";
import Link from "next/link";
import dayjs from "dayjs";
import Pagination from "@/app/Admindash/Pagination";
import { exportExcel } from "@/components/utils/export/exportExcel";
import { exportPDF } from "@/components/utils/export/exportPDF";
import { printTable } from "@/components/utils/export/exportPrint";
import ExportMenu from "@/components/Custom/ExportMenu";
import { exportCSV } from "@/components/utils/export/exportCsv";
const DELETE_ASTRO = gql`
  mutation DeleteAstrologer($astrologerId: ID!) {
    deleteAstrologer(astrologerId: $astrologerId)
  }
`;
const RESTORE_ASTRO = gql`
  mutation RestoreAstrologer($astrologerId: ID!) {
    restoreAstrologer(astrologerId: $astrologerId)
  }
`;

export default function AstroList() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const LIMIT = 50;
  const { can, isSuperAdmin } = usePermissions();

  const canViewProfile = isSuperAdmin || can("astroprofile", "view");
  const canEdit = isSuperAdmin || can("astrologer-list", "update");
  const canDelete = isSuperAdmin || can("astrologer-list", "delete");

  console.log("PERMISSION DEBUG:", {
    isSuperAdmin,
    canViewProfile,
    astroprofileView: can("astroprofile", "view"),
  });

  const { confirmState, setConfirmState, executeAction, handleConfirm } =
    useActionHandler();
  const toggleSelection = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  const toggleSelectAll = () => {
    if (selectedRows.length === astrologers.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(astrologers.map((a) => a.id));
    }
  };
  const { data, loading, refetch } = useQuery(GET_ASTRO_LIST, {
    variables: {
      searchInput: {
        query,
        limit: LIMIT,
        page,
      },
    },
    fetchPolicy: "cache-and-network",
  });
  const totalPages = data?.getAstrologerListBySearch?.totalPages || 1;

  const currentPage = data?.getAstrologerListBySearch?.currentPage || page;

  const [deleteAstrologer] = useMutation(DELETE_ASTRO);
const [restoreAstrologer] = useMutation(RESTORE_ASTRO);
  const astrologers = data?.getAstrologerListBySearch?.data || [];

  const viewProfile = (id) => {
    router.push(`/Admindash/astrologer/astroprofile/${id}`);
  };

  const handleEdit = (id) => {
    router.push(`/Admindash/astrologer/edit-astrologer/${id}`);
  };

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={
            selectedRows.length === astrologers.length && astrologers.length > 0
          }
          onChange={toggleSelectAll}
        />
      ),

      render: (row) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.id)}
          onChange={() => toggleSelection(row.id)}
        />
      ),

      width: "60px",
    },
    {
      header: "Name",
      accessor: "name",
      render: (row) => (
        <div className="flex flex-col">
          {canViewProfile ? (
            <Link
              href={`/Admindash/astrologer/astroprofile/${row.id}`}
              className="font-bold text-purple-500 hover:underline"
            >
              {row.displayName}
            </Link>
          ) : (
            <span className="font-bold text-gray-500 cursor-not-allowed">
              {row.displayName}
            </span>
          )}
          <small className="text-gray-400">ID: {row.id?.slice(0, 8)}</small>
        </div>
      ),
    },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "contactNo" },
    {
      header: "Joined On",
      render: (row) => dayjs(row.createdAt).format("DD MMM YYYY hh:mm A"),
    },

  {
  header: "Actions",
  render: (row) => {
    if (row.isDeleted) {
      return (
        <div className="flex items-center justify-center gap-3">
          <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600">
            Inactive
          </span>

          <button
            type="button"
            disabled={!canEdit}
            onClick={() => {
              if (!canEdit) return;

              executeAction({
                action: "activate",
                mutationFn: restoreAstrologer,
                variables: {
                  astrologerId: row.id,
                },
                onSuccess: refetch,
              });
            }}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
              canEdit
                ? "bg-gray-400 cursor-pointer"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            title="Activate astrologer"
          >
            <span className="inline-block h-4 w-4 translate-x-0.5 rounded-full bg-white transition" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex justify-center gap-2">
        <button
          type="button"
          disabled={!canViewProfile}
          onClick={() => {
            if (!canViewProfile) return;
            viewProfile(row.id);
          }}
          className={`px-2 py-1 text-xs rounded-full ${
            canViewProfile
              ? "bg-blue-500 text-white cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          View
        </button>

        <button
          type="button"
          disabled={!canEdit}
          onClick={() => {
            if (!canEdit) return;
            handleEdit(row.id);
          }}
          className={`px-2 py-1 text-xs rounded-full ${
            canEdit
              ? "bg-yellow-500 text-white cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Edit
        </button>

        <button
          type="button"
          disabled={!canDelete}
          onClick={() => {
            if (!canDelete) return;

            executeAction({
              action: "delete",
              mutationFn: deleteAstrologer,
              variables: {
                astrologerId: row.id,
              },
              onSuccess: refetch,
            });
          }}
          className={`px-2 py-1 text-xs rounded-full ${
            canDelete
              ? "bg-red-500 text-white cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Delete
        </button>
      </div>
    );
  },
},
  ];

  /* =========================
      SEARCH
  ========================= */

  const handleSearch = () => {
    setPage(1);

    refetch({
      searchInput: {
        query,
        limit: LIMIT,
        page: 1,
      },
    });
  };

  const currentExportData = astrologers.map((x) => ({
    Name: x.displayName,
    Email: x.email,
    Phone: x.contactNo,
    Joined: dayjs(x.createdAt).format("DD MMM YYYY hh:mm A"),
  }));
  const selectedExportData = astrologers
    .filter((x) => selectedRows.includes(x.id))
    .map((x) => ({
      Name: x.displayName,
      Email: x.email,
      Phone: x.contactNo,
      Joined: dayjs(x.createdAt).format("DD MMM YYYY hh:mm A"),
    }));
  const handleExportAll = async () => {
    const { data } = await client.query({
      query: EXPORT_ASTROLOGERS,

      variables: {
        query,
      },

      fetchPolicy: "network-only",
    });

    exportExcel(data.exportAstrologers);
  };
  const exportData = selectedRows.length
    ? selectedExportData
    : currentExportData;
  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <div className="shadow-md rounded-xl p-3 bg-purple-200 mb-6 flex justify-between">
        <h2 className="text-xl font-bold text-purple-900">Astrologer List</h2>

        <div className="flex items-center gap-3">
          <CustomInput
            placeholder="Search by name, email or mobile..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-[100%]"
          />
          {/* <CustomButton onClick={handleSearch}>Search</CustomButton> */}
        </div>
        <ExportMenu
          onExcel={() => exportExcel(exportData)}
          onCSV={() => exportCSV(currentExportData, "Astrologers")}
          onPDF={() =>
            exportPDF(currentExportData, "Astrologer Report", "Astrologers.pdf")
          }
          onPrint={() => printTable()}
          onExportCurrent={() =>
            exportExcel(currentExportData, "Astrologers", "Astrologers.xlsx")
          }
          onExportAll={handleExportAll}
        />
      </div>

      {/* CONFIRM MODAL */}
      <ConfirmModal
        open={!!confirmState}
        onCancel={() => setConfirmState(null)}
        onConfirm={handleConfirm}
      />

      {loading ? (
        <p className="p-4">Loading...</p>
      ) : (
        <>
          <DataTable columns={columns} data={astrologers} />

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPrevious={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => p + 1)}
          />
        </>
      )}
    </div>
  );
}
