<template>
  <div :class="['container-fluid position-relative d-flex p-0', { 'bg-dark text-white': isDarkMode, 'bg-white': !isDarkMode }]">
    <!-- Sidebar Start -->
    <Sidebar :isDarkMode="isDarkMode" />
    <!-- Sidebar End -->

    <!-- Content Start -->
    <div class="content">
      <!-- Navbar Start -->
      <Navbar_AdminPage :isDarkMode="isDarkMode" @toggle-dark-mode="toggleDarkMode" />
      <!-- Navbar End -->

      <!-- Státusz szűrő gombok -->
      <FilterButtons 
        @filter-status="filterByStatus"
      />

      <!-- Táblázat komponens -->
      <Table 
        :status-filter="statusFilter" 
        :is-dark-mode="isDarkMode"
      />
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue';
import Navbar_AdminPage from '../components/Navbar_AdminPage.vue';
import Table from '../components/Table.vue';
import FilterButtons from '../components/FilterButtons.vue';

export default {
  name: 'AdminPage',
  components: {
    Sidebar,
    Navbar_AdminPage,
    Table,
    FilterButtons
  },
  data() {
    return {
      isDarkMode: localStorage.getItem('darkMode') === 'true' || false,
      statusFilter: null
    };
  },
  mounted() {
    this.applyTheme();
    // Dynamically import the external JavaScript file
    import('../assets/js/main.js').then(() => {
      console.log('main.js loaded');
    });
  },
  methods: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('darkMode', this.isDarkMode);
      this.applyTheme();
    },
    applyTheme() {
      if (this.isDarkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    },
    filterByStatus(status) {
      this.statusFilter = status;
    }
  }
};
</script>

<style>
/* Main dark mode variables */
:root {
  --dark-bg-primary: #1c1c1c;
  --dark-bg-secondary: #242424;
  --dark-bg-tertiary: #2a2a2a;
  --dark-text-primary: #f0f0f0;
  --dark-text-secondary: #cccccc;
  --dark-border: rgba(255, 255, 255, 0.1);
  --dark-accent: #50adc9;
  --dark-input-bg: #333333;
}

/* Base dark mode styles */
.dark-mode, 
.dark-mode body, 
.dark-mode main {
  background-color: var(--dark-bg-primary) !important;
  color: var(--dark-text-primary) !important;
}

/* Sidebar styling */
.dark-mode .sidebar,
.dark-mode [class*="sidebar"],
.dark-mode nav.sidebar,
.dark-mode .nav-sidebar {
  background-color: #171717 !important;
  color: var(--dark-text-primary) !important;
  border-color: var(--dark-border) !important;
}

.dark-mode .sidebar a,
.dark-mode [class*="sidebar"] a,
.dark-mode .sidebar .nav-link,
.dark-mode [class*="sidebar"] .nav-link {
  color: var(--dark-text-primary) !important;
}

.dark-mode .sidebar a:hover,
.dark-mode [class*="sidebar"] a:hover,
.dark-mode .sidebar .nav-link:hover,
.dark-mode [class*="sidebar"] .nav-link:hover {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

.dark-mode .sidebar .active,
.dark-mode [class*="sidebar"] .active,
.dark-mode .sidebar .selected,
.dark-mode [class*="sidebar"] .selected {
  background-color: rgba(80, 173, 201, 0.2) !important;
  color: var(--dark-accent) !important;
}

/* Navbar styling */
.dark-mode .navbar,
.dark-mode [class*="navbar"],
.dark-mode header,
.dark-mode .header {
  background-color: #171717 !important;
  color: var(--dark-text-primary) !important;
  border-color: var(--dark-border) !important;
}

.dark-mode .navbar a,
.dark-mode [class*="navbar"] a,
.dark-mode .navbar .nav-link,
.dark-mode [class*="navbar"] .nav-link {
  color: var(--dark-text-primary) !important;
}

.dark-mode .navbar-brand,
.dark-mode .brand,
.dark-mode .logo {
  color: var(--dark-text-primary) !important;
}

/* Content cards, panels, and containers */
.dark-mode .card,
.dark-mode .accordion-item,
.dark-mode [class*="panel"],
.dark-mode [class*="content-box"],
.dark-mode [class*="card-body"],
.dark-mode .container-white,
.dark-mode [style*="background-color: #ffffff"],
.dark-mode [style*="background-color: white"] {
  background-color: var(--dark-bg-secondary) !important;
  color: var(--dark-text-primary) !important;
  border-color: var(--dark-border) !important;
}

.dark-mode .card-header,
.dark-mode .panel-header,
.dark-mode [class*="header"] {
  background-color: var(--dark-bg-primary) !important;
  color: var(--dark-text-primary) !important;
  border-color: var(--dark-border) !important;
}

/* Dropdown Menu Styling */
.dark-mode .dropdown-menu {
  background-color: var(--dark-bg-secondary) !important;
  border: 1px solid var(--dark-border) !important;
}

.dark-mode .dropdown-menu.bg-light,
.dark-mode .dropdown-menu.bg-transparent {
  background-color: var(--dark-bg-secondary) !important;
}

.dark-mode .dropdown-item {
  color: var(--dark-text-primary) !important;
}

.dark-mode .dropdown-item:hover {
  background-color: var(--dark-bg-tertiary) !important;
  color: var(--dark-accent) !important;
}

.dark-mode .dropdown-menu h6,
.dark-mode .dropdown-menu small {
  color: var(--dark-text-primary) !important;
}

/* Table Styling */
.dark-mode table,
.dark-mode .table {
  color: var(--dark-text-primary) !important;
  background-color: var(--dark-bg-secondary) !important;
}

.dark-mode .table th,
.dark-mode .table td {
  border-color: var(--dark-border) !important;
  color: var(--dark-text-primary) !important;
}

.dark-mode .table thead th {
  background-color: var(--dark-bg-tertiary) !important;
  border-bottom: 2px solid var(--dark-border) !important;
}

.dark-mode .table tbody tr:hover {
  background-color: var(--dark-bg-tertiary) !important;
}

.dark-mode .table-striped tbody tr:nth-of-type(odd) {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

/* Fix for specific dropdown issues */
.dark-mode .profile-dropdown,
.dark-mode .notifications-dropdown {
  background-color: var(--dark-bg-secondary) !important;
  border: 1px solid var(--dark-border) !important;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.5) !important;
}

/* Ensure text-muted is visible in dark mode */
.dark-mode .text-muted {
  color: var(--dark-text-secondary) !important;
}

/* Fix for dropdown dividers if present */
.dark-mode .dropdown-divider {
  border-color: var(--dark-border) !important;
}

/* Card Styling */
.dark-mode .card {
  background-color: var(--dark-bg-secondary) !important;
  color: var(--dark-text-primary) !important;
  border: 1px solid var(--dark-border) !important;
}

.dark-mode .card-header {
  background-color: var(--dark-bg-tertiary) !important;
  color: var(--dark-text-primary) !important;
  border-bottom: 1px solid var(--dark-border) !important;
}

/* Form Styling */
.dark-mode .form-control {
  background-color: var(--dark-input-bg) !important;
  color: var (--dark-text-primary) !important;
  border: 1px solid var(--dark-border) !important;
}

.dark-mode .form-control::placeholder {
  color: var(--dark-text-secondary) !important;
}

/* Button Styling */
.dark-mode .btn {
  background-color: var(--dark-bg-tertiary) !important;
  color: var(--dark-text-primary) !important;
  border: 1px solid var(--dark-border) !important;
}

.dark-mode .btn:hover {
  background-color: var(--dark-accent) !important;
  color: #ffffff !important;
}

/* Fix for text-muted */
.dark-mode .text-muted {
  color: var(--dark-text-secondary) !important;
}

/* Scrollbar Styling */
.dark-mode ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.dark-mode ::-webkit-scrollbar-track {
  background: var(--dark-bg-secondary);
}

.dark-mode ::-webkit-scrollbar-thumb {
  background: var(--dark-bg-tertiary);
  border-radius: 4px;
}

.dark-mode ::-webkit-scrollbar-thumb:hover {
  background: var(--dark-accent);
}

/* Dropdown Menu Styling for Dark Mode */
.dark-mode .dropdown-menu {
  background-color: var(--dark-bg-secondary) !important; /* Dark background */
  border: 1px solid var(--dark-border) !important; /* Subtle border */
  color: var(--dark-text-primary) !important; /* Text color */
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.5) !important; /* Add shadow for better visibility */
}

.dark-mode .dropdown-item {
  color: var(--dark-text-primary) !important; /* Text color for items */
  transition: background-color 0.3s ease, color 0.3s ease; /* Smooth hover transition */
}

.dark-mode .dropdown-item:hover {
  background-color: var(--dark-bg-tertiary) !important; /* Highlighted background */
  color: var(--dark-accent) !important; /* Accent color for hover */
}

.dark-mode .dropdown-divider {
  border-color: var(--dark-border) !important; /* Divider color */
}

.dark-mode .dropdown-menu h6,
.dark-mode .dropdown-menu small {
  color: var(--dark-text-secondary) !important; /* Muted text for headers or small text */
}

/* Fix for the notification icon */
.dark-mode .dropdown-menu .fa-bell {
  color: var(--dark-text-primary) !important; /* Ensure the bell icon is visible */
}

.dark-mode .dropdown-menu .dropdown-header {
  background-color: var(--dark-bg-tertiary) !important; /* Header background */
  color: var(--dark-text-primary) !important; /* Header text color */
}

.navbar {
  position: relative;
  z-index: 1000; /* Alacsonyabb, mint a táblázaté */
}
</style>