// src/constants/menuList.js
const menuList = [
  {
    title: "Dashboard",
    path: "/",
  },
 {
  title: "HR Management",
  children: [
    { title: "CV Management", path: "/cv-management" },
    { title: "Interview Management", path: "/interview-management" },
    { title: "Offer Letter", path: "/offer-letter" },
    { title: "Employee Management", path: "/employee-management" },
    { title: "Attendance Management", path: "/attendance-management" },
    { title: "Punch In / Punch Out", path: "/punch-in-out" },
    { title: "Leave Management", path: "/leave-management" },
    { title: "Request", path: "#" }, // 🔥 manual click dropdown
    { title: "Experience Certificate", path: "/experience-certificate" },
    { title: "Salary Certificate", path: "/salary-certificate" },

      // ✅ New Request category with submenu items
      {
        title: "Request",
        children: [
          { title: "Leave Request", path: "/request/leave" },
          { title: "Late Request", path: "/request/late" },
          { title: "Early Request", path: "/request/early" },
        ],
      },

      { title: "Experience Certificate", path: "/experience-certificate" },
      { title: "Salary Certificate", path: "/salary-certificate" },
    ],
  },

  {
    title: "Marketing",
    children: [
      { title: "Campaigns", path: "/marketing-campaigns" },
      { title: "Promotions", path: "/marketing-promotions" },
      { title: "Leads", path: "/marketing-leads" },
    ],
  },
  {
    title: "Vehicle Management",
    children: [
      { title: "Company Vehicle", path: "/company-vehicle" },
      { title: "Non Company Vehicle", path: "/non-company-vehicle" },
    ],
  },
  {
    title: "Target Management",
    children: [
      { title: "Target Setup", path: "/target-setup" },
      { title: "Target Review", path: "/target-review" },
    ],
  },
  {
    title: "Warehouse Management",
    children: [
      { title: "Warehouse List", path: "/warehouse-list" },
      { title: "Stock Transfer", path: "/stock-transfer" },
    ],
  },
  {
    title: "Delivery Management",
    children: [
      { title: "Delivery Status", path: "/delivery-status" },
      { title: "Pending Deliveries", path: "/pending-deliveries" },
    ],
  },
  {
    title: "User Management",
    children: [
      { title: "Add User", path: "/add-user" },
      { title: "User Control", path: "/user-control" },
      { title: "Configure Access", path: "/configure-access" },
    ],
  },
  {
    title: "Master",
    children: [
      { title: "Master Data", path: "/master-data" },
      { title: "Settings", path: "/settings" },
    ],
  },
];

export default menuList;
