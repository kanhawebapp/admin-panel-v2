// hooks/useActionHandler.js
"use client";

import { usePermissions } from "@/context/PermissionContext";
import { useState } from "react";
import toast from "react-hot-toast";

export const useActionHandler = () => {
  const [confirmState, setConfirmState] = useState(null);

  const { can, isSuperAdmin } = usePermissions();

  const executeAction = async ({
    module,
    action,
    mutationFn,
    variables,
    onSuccess,
  }) => {
    console.log("66666666666555555555555555")
    if (!(isSuperAdmin || can(module, action))) {
      toast.error("You are not authorized to perform this action.");
      return;
    }
    console.log("8777777777777777777aaaaaaa");
    setConfirmState({
      mutationFn,
      variables,
      onSuccess,
    });
  };

  const handleConfirm = async () => {
    try {

      const { mutationFn, variables, onSuccess } = confirmState;

      const res = await mutationFn({ variables });
      console.log("7777777777777779999999999999999999997777777777777",res);

      // 🔥 Handle both structured + boolean responses
      const result = res?.data?.[Object.keys(res.data)[0]];
      console.log("testing");

      if (typeof result === "boolean") {
        // toast.success("Action successful");
      } else if (result) {
        toast.success(result?.message || "Action successful");
      } else {
        toast.error("Action failed");
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      const message =
        err?.graphQLErrors?.[0]?.message ||
        err?.networkError?.result?.errors?.[0]?.message ||
        err.message;

      if (message.includes("Unauthorized")) {
        toast.error("You are not authorized to perform this action.");
      } else if (message.includes("assigned")) {
        toast.error(message);
      } else {
        toast.error(message || "Something went wrong");
      }
    }

    setConfirmState(null);
  };

  return {
    confirmState,
    setConfirmState,
    executeAction,
    handleConfirm,
  };
};
