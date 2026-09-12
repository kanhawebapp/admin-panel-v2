import { gql } from "@apollo/client";

export const GET_MY_ACCESS = gql`
  query GetMyAccess {
    getMyAccess {
      id
      name
      slug
      permissions
    }
  }
`;

/* ===============================
    MODULES
================================ */

export const GET_MODULES = gql`
  query GetModules($page: Int, $limit: Int) {
    getModulesPaginated(page: $page, limit: $limit) {
      data {
        id
        name
        slug
        description
        isActive
        createdAt
        updatedAt
         section  
      }
      totalCount
      currentPage
      totalPages
    }
  }
`;

export const CREATE_MODULE = gql`
  mutation CreateModule(
    $name: String!
    $slug: String!
    $description: String
    $section: String!
  ) {
    createModule(
      name: $name
      slug: $slug
      description: $description
      section: $section
    ) {
      id
      name
    }
  }
`;

export const UPDATE_MODULE = gql`
  mutation UpdateModule(
    $id: ID!
    $name: String
    $slug: String
    $description: String
    $isActive: Boolean
  ) {
    updateModule(
      id: $id
      name: $name
      slug: $slug
      description: $description
      isActive: $isActive
    ) {
      id
      name
      slug
      description
      isActive
      updatedAt
    }
  }
`;

export const DELETE_MODULE = gql`
  mutation DeleteModule($id: ID!) {
    deleteModule(id: $id)
  }
`;

/* ===============================
    Roles
================================ */
export const GET_ROLES = gql`
  query GetRoles($page: Int, $limit: Int) {
    getRoles(page: $page, limit: $limit) {
      data {
        id
        name
        slug
        description
        isActive
        createdAt
        updatedAt
      }
      totalCount
      currentPage
      totalPages
    }
  }
`;

export const CREATE_ROLE = gql`
  mutation CreateRole($name: String!, $slug: String!, $description: String) {
    createRole(name: $name, slug: $slug, description: $description) {
      id
      name
      slug
      description
      isActive
      createdAt
    }
  }
`;

export const UPDATE_ROLE = gql`
  mutation UpdateRole(
    $roleId: String!
    $name: String
    $slug: String
    $description: String
  ) {
    updateRole(
      roleId: $roleId
      name: $name
      slug: $slug
      description: $description
    ) {
      id
      name
      slug
      description
      isActive
      updatedAt
    }
  }
`;

export const DELETE_ROLE = gql`
  mutation DeleteRole($roleId: ID!) {
    deleteRole(roleId: $roleId) {
      success
      message
      error
    }
  }
`;

export const GET_PERMISSIONS = gql`
  query GetPermissions($page: Int, $limit: Int) {
    getPermissions(page: $page, limit: $limit) {
      data {
        id
        name
        type 
        modules {
          id
          name
        }
      }
    }
  }
`;

export const CREATE_PERMISSION = gql`
  mutation CreatePermission(
    $name: String!
    $moduleIds: [ID!]!
    $type: String!
  ) {
    createPermission(
      name: $name
      moduleIds: $moduleIds
      type: $type
    ) {
      id
      name
      type
    }
  }
`;

export const UPDATE_PERMISSION = gql`
  mutation ($permissionId: ID!, $name: String, $moduleIds: [ID!]) {
    updatePermission(
      permissionId: $permissionId
      name: $name
      moduleIds: $moduleIds
    ) {
      id
      name
    }
  }
`;

export const DELETE_PERMISSION = gql`
  mutation ($permissionId: ID!) {
    deletePermission(permissionId: $permissionId)
  }
`;

// Department muattions
export const GET_DEPARTMENTS = gql`
  query GetDepartments($page: Int, $limit: Int) {
    getDepartments(page: $page, limit: $limit) {
      data {
        id
        name
        slug
        description
        isActive
      }
    }
  }
`;
export const CREATE_DEPARTMENT = gql`
  mutation ($name: String!, $description: String) {
    createDepartment(name: $name, description: $description) {
      id
      name
    }
  }
`;
export const UPDATE_DEPARTMENT = gql`
  mutation ($departmentId: ID!, $name: String, $description: String) {
    updateDepartment(
      departmentId: $departmentId
      name: $name
      description: $description
    ) {
      id
      name
    }
  }
`;
export const DELETE_DEPARTMENT = gql`
  mutation ($departmentId: ID!) {
    deleteDepartment(departmentId: $departmentId)
  }
`;

// Stafff

export const CREATE_STAFF = gql`
  mutation (
    $name: String!
    $email: String!
    $password: String!
    $departmentId: ID!
    $roleId: ID!
    $permissionIds: [ID!]!
  ) {
    createStaff(
      name: $name
      email: $email
      password: $password
      departmentId: $departmentId
      roleId: $roleId
      permissionIds: $permissionIds
    ) {
      id
      name
    }
  }
`;

export const UPDATE_STAFF = gql`
  mutation (
    $staffId: ID!
    $name: String
    $email: String
    $departmentId: ID
    $roleId: ID
    $permissionIds: [ID!]
  ) {
    updateStaff(
      staffId: $staffId
      name: $name
      email: $email
      departmentId: $departmentId
      roleId: $roleId
      permissionIds: $permissionIds
    ) {
      id
      name
      email
      department {
        id
        name
      }
      role {
        id
        name
      }
      permissions {
        id
        name
      }
    }
  }
`;

export const DELETE_STAFF = gql`
  mutation ($staffId: ID!) {
    deleteStaff(staffId: $staffId)
  }
`;

export const GET_STAFF = gql`
  query GetStaff($page: Int, $limit: Int) {
    getStaff(page: $page, limit: $limit) {
      data {
        id
        name
        email
        department {
          id
          name
        }
        role {
          id
          name
        }
        permissions {
          id
          name
        }
      }
      totalCount
      currentPage
      totalPages
    }
  }
`;

export const GET_MODULES_BY_SECTION = gql`
  query ($section: String!) {
    getModulesBySection(section: $section) {
      id
      name
      slug
    }
  }
`;


export const GET_DASHBOARD_COUNTS = gql`
  query GetDashboardCounts {
    getDashboardCounts {
      totalAstrologers
      totalUsers
      totalStaff

      totalCalls
      totalChats
totalRechargeAmount
      totalRevenue
      totalApplications
    }
  }
`;

export const GET_APP_VERSIONS = gql`
  query GetAppVersions {
    getAppVersions {
      id
      appType
      platform
      latestVersion
      minimumVersion
      forceUpdate
      maintenanceMode
      maintenanceMessage
      playStoreUrl
      appStoreUrl
      releaseNotes
      createdAt
      updatedAt
    }
  }
`;