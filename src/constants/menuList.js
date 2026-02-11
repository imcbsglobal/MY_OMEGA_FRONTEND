// src/constants/menuList.js

const menuList = [
  {
    id: 2,
    title: "HR Management",
    children: [
      { id: 3, title: "CV Management", path: "/cv-management" },
      { id: 4, title: "Interview Management", path: "/interview-management" },
      { id: 5, title: "Offer Letter", path: "/offer-letter" },
      { id: 6, title: "Employee Management", path: "/employee-management" },
      { id: 7, title: "Attendance Management", path: "/attendance-management" },
      { id: 8, title: "Punch In / Punch Out", path: "/punch-in-out" },
      { id: 9, title: "Leave Management", path: "/leave-management" },

      {
        id: 10,
        title: "Request",
        children: [
          { id: 11, title: "Leave Request", path: "/request/leave" },
          { id: 12, title: "Late Request", path: "/request/late" },
          { id: 13, title: "Early Request", path: "/request/early" },
        ],
      },

      { id: 14, title: "Experience Certificate", path: "/experience-certificate" },
      { id: 15, title: "Salary Certificate", path: "/salary-certificate" },
    ],
  },

  {
    id: 16,
    title: "Marketing",
    children: [
      { id: 17, title: "Campaigns", path: "/marketing-campaigns" },
      { id: 18, title: "Promotions", path: "/marketing-promotions" },
      { id: 19, title: "Leads", path: "/marketing-leads" },
    ],
  },

  {
    id: 20,
    title: "Vehicle Management",
    children: [
      { id: 21, title: "Company Vehicle", path: "/company-vehicle" },
      { id: 22, title: "Non Company Vehicle", path: "/non-company-vehicle" },
    ],
  },

  {
    id: 23,
    title: "Target Management",
    children: [
      { id: 24, title: "Target Setup", path: "/target-setup" },
    ],
  },

  {
    id: 26,
    title: "Warehouse Management",
    children: [
      { id: 27, title: "Warehouse List", path: "/warehouse-list" },
      { id: 28, title: "Stock Transfer", path: "/stock-transfer" },
    ],
  },

  {
    id: 29,
    title: "Delivery Management",
    children: [
      { id: 30, title: "Delivery Status", path: "/delivery-status" },
      { id: 31, title: "Pending Deliveries", path: "/pending-deliveries" },
    ],
  },

  {
    id: 32,
    title: "User Management",
    children: [
      { id: 33, title: "Add User", path: "/add-user" },
      { id: 34, title: "User Control", path: "/user-control" },
      { id: 35, title: "Configure Access", path: "/configure-access" },
    ],
  },

  {
    id: 36,
    title: "Master",
    children: [
      { id: 37, title: "Master Data", path: "/master-data" },
      { id: 38, title: "Settings", path: "/settings" },
    ],
  },
];

export default menuList;
