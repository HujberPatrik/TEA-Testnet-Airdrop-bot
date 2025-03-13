<template>
  <nav :class="['navbar', 'navbar-expand-lg', 'sticky-top', 'px-4', 'py-3', darkMode ? 'navbar-dark' : 'navbar-light', darkMode ? 'bg-dark' : 'bg-light']">
    <a href="/" class="navbar-brand d-flex" aria-label="Home">
      <img
        src="../img/egyetemi logo/fekvo_RGB/sze_logo_fekvo_RGB_white_bg.png"
        alt="SZE Logó"
        class="img-fluid"
        style="max-height: 50px"
      />
    </a>

    <!-- Navbar Text -->
    <div class="navbar-text ms-3" style="font-size: clamp(1rem, 4vw, 1.5rem); font-weight: 500">
      Rendezvénybejelentő űrlap
    </div>
    <button
      class="navbar-toggler custom-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNav"
      aria-controls="navbarNav"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarNav">
      <div class="ms-auto d-flex align-items-center gap-2">
        <a
          href="https://uni.sze.hu/"
          class="btn rounded-circle"
          style="background-color: #50adc9; padding: 12px; width: 42px; height: 42px; display: inline-flex; align-items: center; justify-content: center; border: none"
          aria-label="Back to University Home"
        >
          <i class="fa fa-arrow-left" style="color: #ffffff"></i>
        </a>

        <!-- Dark Mode Toggle -->
        <button
          class="btn rounded-circle"
          @click="toggleDarkMode"
          style="background-color: #50adc9; padding: 12px; width: 42px; height: 42px; display: inline-flex; align-items: center; justify-content: center; border: none"
          aria-label="Toggle Dark Mode"
        >
          <i :class="darkMode ? 'fa fa-sun' : 'fa fa-moon'" style="color: #ffffff"></i>
        </button>

        <a
          href="/Login"
          class="btn rounded-circle"
          style="background-color: #50adc9; padding: 12px; width: 42px; height: 42px; display: inline-flex; align-items: center; justify-content: center; border: none"
          aria-label="Go to Admin"
        >
          <i class="fa fa-user" style="color: #ffffff"></i>
        </a>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      darkMode: false,
    };
  },
  methods: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      document.body.classList.toggle("dark-mode", this.darkMode);
    },
  },
};
</script>

<style scoped>
/* Navbar styles */
.navbar {
  border-bottom: 1px solid #ddd;
}

.navbar-text {
  font-size: 1.2rem;
  font-weight: 500;
}

.navbar .btn {
  transition: background-color 0.3s ease;
}

.navbar .btn:hover {
  background-color: #4099b3;
}

.navbar .navbar-brand img {
  max-height: 50px;
}

.custom-toggler {
  border: none;
  background-color: #50adc9; 
  border-radius: 50%; 
  width: 42px; 
  height: 42px;
  padding: 0; 
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-toggler .navbar-toggler-icon {
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba(255, 255, 255, 1)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100%;
}

@media (max-width: 768px) {
  .navbar-text {
    font-size: 0.9rem; 
    margin-top: 10px;
  }

  .ms-auto {
    flex-direction: column;
    gap: 10px;
  }

  .ms-auto .btn {
    width: 40px;
    height: 40px;
  }
}

/* Dark mode styles */
body.dark-mode {
  background-color: #333;
  color: #fff;
}

body.dark-mode .navbar {
  background-color: #242943; /* Updated color */
  border-bottom: 1px solid #444;
}

body.dark-mode .navbar-text {
  color: #fff;
}

body.dark-mode .navbar .btn {
  background-color: #444;
}

body.dark-mode .navbar .btn:hover {
  background-color: #555;
}

body.dark-mode .custom-toggler {
  background-color: #444;
}

body.dark-mode .custom-toggler .navbar-toggler-icon {
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba(255, 255, 255, 1)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E");
}

.navbar-text {
  font-size: 1.8rem;
  font-weight: 500;
  white-space: nowrap; 
}

@media (max-width: 992px) {
  .navbar-text {
    font-size: 1.5rem;
  }
}

@media (max-width: 1010px) {
  .navbar-text {
    display: none;
  }
}
</style>