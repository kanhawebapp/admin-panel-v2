import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useQuery } from "@apollo/client/react";
import { GET_MY_ACCESS } from "@/app/graphQL/privilageOperations";

const PermissionContext = createContext(null);

export const PermissionProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadAuth = () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      setToken(storedToken);

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Invalid user data", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    loadAuth();

    window.addEventListener("auth-change", loadAuth);

    return () => {
      window.removeEventListener("auth-change", loadAuth);
    };
  }, []);

  const { data, loading } = useQuery(GET_MY_ACCESS, {
    skip: !token,

    // IMPORTANT
    fetchPolicy: "network-only",
  });

  const permissions = useMemo(() => {
    return data?.getMyAccess || [];
  }, [data]);

  // IMPORTANT:
  // Super Admin should come from ROLE, not permissions.
  const isSuperAdmin =
    user?.role?.name === "SUPER_ADMIN";

  const can = (module, action) => {
    if (isSuperAdmin) return true;

    return permissions.some(
      (mod) =>
        mod.slug === module &&
        mod.permissions.includes(`${module}.${action}`)
    );
  };

  const canPermission = (permission) => {
    if (isSuperAdmin) return true;

    return permissions.some((mod) =>
      mod.permissions.includes(permission)
    );
  };

  const value = useMemo(
    () => ({
      permissions,
      loading,
      can,
      canPermission,
      isSuperAdmin,
      user,
    }),
    [
      permissions,
      loading,
      isSuperAdmin,
      user,
    ]
  );

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);

  if (!context) {
    throw new Error(
      "usePermissions must be used inside PermissionProvider"
    );
  }

  return context;
};