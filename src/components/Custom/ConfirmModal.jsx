// components/ConfirmModal.js

import { useState, useEffect } from "react";

export default function ConfirmModal({
  open,
  onCancel,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  requireRemark = false,
}) {
  const [remark, setRemark] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setRemark("");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const handleConfirm = () => {
    if (requireRemark && !remark.trim()) {
      setError("Please enter a remark before confirming.");
      return;
    }

    onConfirm(remark.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[400px] space-y-4">
        
        <h2 className="text-lg font-semibold">
          {title}
        </h2>

        <p className="text-sm text-gray-600">
          {description}
        </p>

        {requireRemark && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Delete Remark <span className="text-red-500">*</span>
            </label>

            <textarea
              value={remark}
              onChange={(e) => {
                setRemark(e.target.value);
                if (e.target.value.trim()) {
                  setError("");
                }
              }}
              placeholder="Enter reason for deleting this astrologer..."
              rows={4}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
            />

            {error && (
              <p className="text-xs text-red-500 mt-1">
                {error}
              </p>
            )}
          </div>
        )}

        <div className="flex text-xs justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded-full cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-full cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}