<template>
    <div :class="['container-fluid position-relative d-flex p-0', { 'bg-dark text-white': isDarkMode, 'bg-white': !isDarkMode }]">
        <!-- Sidebar Start -->
        <div class="sidebar pe-4 pb-3" :style="{ backgroundColor: isDarkMode ? '#1c1c1c' : '#242943', color: isDarkMode ? '#ffffff' : '#ffffff' }">
            <nav class="navbar navbar-light" style="background-color: rgb(36, 41, 67);">
                <!-- Logó elrejtése kis képernyőkön -->
                <a href="index.html" class="navbar-brand d-none d-md-flex align-items-center mx-4 mb-3">
                    <img src="../img/egyetemi logo/fekvo_RGB/sze_logo_fekvo_RGB_negativ.png" alt="SZE Logó" height="60px">
                </a>
                <!-- Placeholder for logo when hidden on smaller screens (larger gap) -->
                <div class="d-flex d-md-none" style="height: 95px; margin-top: 15px;"></div>
                
                <div class="d-flex align-items-center ms-4 mb-4">
                </div>
                
                <!-- Gombok görgethető konténerben -->
                <div class="navbar-nav w-100" style="flex-wrap: nowrap; overflow-x: auto; white-space: nowrap; position: relative;">
                    <a href="index.html" class="nav-item nav-link active"><i class="fa fa-tachometer-alt me-2"></i>Főoldal</a>
                    <a href="bejelentes.html" class="nav-item nav-link"><i class="fa fa-table me-2"></i>Teszt Bejelentes</a>
                    <a href="signin.html" class="nav-item nav-link"><i class="fa fa-chart-bar me-2"></i>Teszt login</a>
                    <div class="nav-item dropdown">
                        <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown"><i class="far fa-file-alt me-2"></i>Egyéb</a>
                        <div class="dropdown-menu bg-transparent border-0">
                            <a href="" class="dropdown-item"  style="color: #50adc9;">oldal</a>
                            <a href="" class="dropdown-item"  style="color: #50adc9;">oldal</a>
                            <a href="" class="dropdown-item"  style="color: #50adc9;">oldal</a>

                        </div>
                    </div>
                </div>
            </nav>
        </div>
        <!-- Sidebar End -->

        <!-- Content Start -->
        <div class="content">
            <!-- Navbar Start -->
            <nav class="navbar navbar-expand-lg navbar-light sticky-top px-4 py-0" :class="{ 'navbar-dark bg-dark': isDarkMode, 'navbar-light bg-light': !isDarkMode }">
                <a href="index.html" class="navbar-brand d-flex me-4 d-none d-md-flex">
                    <img :src="isDarkMode ? '../img/egyetemi logo/allo_RGB/sze_logo_allo_RGB_dark_blue_bg.png' : '../img/egyetemi logo/allo_RGB/sze_logo_allo_RGB_white_bg.png'" 
                         alt="SZE Logó" class="img-fluid" style="max-height: 50px;">
                </a>

                <div class="d-flex align-items-center flex-nowrap flex-grow-1">
                    <a href="#" class="sidebar-toggler flex-shrink-0 me-3">
                        <i class="fa fa-bars"></i>
                    </a>

                    <form class="d-flex flex-grow-1" style="max-width: 200px;">
                        <input class="form-control border-0" type="search" placeholder="Keresés">
                        <button class="btn button_navbar ms-2 rounded-circle" id="buttons_navbar" type="submit">
                            <i class="fa fa-search" :style="{ color: isDarkMode ? '#ffffff' : '#242943' }"></i>
                        </button>
                    </form>
                </div>

                <div class="navbar-nav align-items-center ms-auto">
                    <div class="nav-item d-none d-lg-flex">
                        <button class="btn button_navbar ms-2 rounded-circle" id="dark-mode-toggle" @click="toggleDarkMode">
                            <i :class="isDarkMode ? 'fa fa-sun' : 'fa fa-moon'" :style="{ color: isDarkMode ? '#ffffff' : '#242943' }"></i>
                        </button>
                    </div>

                    <div class="nav-item dropdown d-none d-lg-flex">
                        <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown">
                            <i class="fa fa-bell me-lg-2" :style="{ color: isDarkMode ? '#ffffff' : '#242943' }"></i>
                            <span class="d-none d-lg-inline-flex">Értesítések</span>
                        </a>
                        <div class="dropdown-menu dropdown-menu-end bg-light border-0 rounded-0 rounded-bottom m-0">
                            <a href="#" class="dropdown-item">
                                <h6 class="fw-normal mb-0">Teszt</h6>
                                <small>Teszt</small>
                            </a>
                        </div>
                    </div>

                    <div class="nav-item dropdown position-relative">
                        <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown">
                            <img class="rounded-circle me-lg-2" src="../img/user.jpg" alt="" style="width: 40px; height: 40px;">
                            <span class="d-none d-lg-inline-flex" :style="{ color: isDarkMode ? '#ffffff' : '#50adc9' }">Teszt Pista</span> 
                            <span class="d-none d-lg-inline-flex ms-1 text-muted" style="font-size: 0.8rem;">(Admin)</span> <!-- Státusz -->
                        </a>
                        <div class="dropdown-menu dropdown-menu-end bg-light border-0 rounded-0 rounded-bottom m-0 position-absolute profile-dropdown">
                            <a href="#" class="dropdown-item d-block d-lg-none" id="notifications-text" :style="{ color: isDarkMode ? '#ffffff' : '#50adc9' }" >
                                Teszt Pista (Admin)
                            </a>

                            <a href="#" class="dropdown-item d-block d-lg-none" id="dark-mode-text" >
                                <i :class="isDarkMode ? 'fa fa-sun me-2' : 'fa fa-moon me-2'"></i> Sötét mód
                            </a>
                            <a href="#" class="dropdown-item d-block d-lg-none" id="notifications-text">
                                <i class="fa fa-bell me-2"></i> Értesítések
                            </a>

                            <a href="#" class="dropdown-item">
                                <i class="fa fa-user me-2"></i> Saját profil
                            </a>
                            <a href="#" class="dropdown-item">
                                <i class="fa fa-cogs me-2"></i> Beállítások
                            </a>

                            <a href="#" class="dropdown-item text-danger">
                                <i class="fa fa-sign-out-alt me-2"></i> Kijelentkezés
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
            <!-- Navbar End -->

            <Graphs></Graphs>
            <Table></Table>
        </div>
    </div>
</template>

<script>
import Graphs from '../components/Graphs.vue';
import Table from '../components/Table.vue';

export default {
  name: 'AdminPage',
  components: {
    Graphs,
    Table
  },
  data() {
    return {
      isDarkMode: localStorage.getItem('darkMode') === 'true' || false
    };
  },
  mounted() {
    // Apply initial theme
    this.applyTheme();
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
</style>