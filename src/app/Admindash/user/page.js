"use client";

import { useEffect, useState } from "react";
import { GET_DEPARTMENTS, GET_ROLES, GET_STAFF } from "@/app/graphQL/privilageOperations";
import { useQuery } from "@apollo/client/react";

export default function Page() {
  const [userName, setUserName] = useState("");

  //  Get user from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (user?.name) {
      setUserName(user.name);
    }
  }, []);

  
  const { data: deptData, loading: deptLoading } = useQuery(GET_DEPARTMENTS, {
    variables: { page: 1, limit: 50 },  fetchPolicy: "cache-first",

  });

  const { data: roleData, loading: roleLoading } = useQuery(GET_ROLES, {
    variables: { page: 1, limit: 50 },  fetchPolicy: "cache-first",

  });

  const { data: staffData, loading: staffLoading } = useQuery(GET_STAFF, {
    variables: { page: 1, limit: 50 },  fetchPolicy: "cache-first",

  });

const departments = deptData?.getDepartments?.data || [];
  const roles = roleData?.getRoles.data || [];
  const staff = staffData?.getStaff.data || [];

  return (
    <div className="p-6 space-y-6 bg-[#1a012b]  rounded-xl text-white">


      <div className="bg-[#2c0a4d] px-6 py-4 rounded-xl shadow flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          Welcome, <span className="text-yellow-400">{userName || "User"}</span> 👋
        </h1>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

       
        <div className="bg-[#2c0a4d] p-5 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2 text-yellow-400">
            Departments ({departments.length})
          </h2>

          {deptLoading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : (
            <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
              {departments.map((d) => (
                <li key={d.id}>• {d.name}</li>
              ))}
            </ul>
          )}
        </div>

      
        <div className="bg-[#2c0a4d] p-5 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2 text-yellow-400">
            Roles ({roles.length})
          </h2>

          {roleLoading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : (
            <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
              {roles.map((r) => (
                <li key={r.id}>• {r.name}</li>
              ))}
            </ul>
          )}
        </div>

      
        <div className="bg-[#2c0a4d] p-5 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2 text-yellow-400">
            Staff ({staff.length})
          </h2>

          {staffLoading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : (
            <p className="text-sm text-gray-300">
              Total Staff Members: {staff.length}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}