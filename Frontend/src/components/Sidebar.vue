<template>
  <div class="sidebar pe-4 pb-3" :style="{ backgroundColor: isDarkMode ? '#1c1c1c' : '#242943', color: isDarkMode ? '#ffffff' : '#ffffff' }">
    <nav class="navbar navbar-light" style="background-color: rgb(36, 41, 67);">
      <a href="index.html" class="navbar-brand d-none d-md-flex align-items-center mx-4 mb-3">
        <img src="../img/egyetemi logo/fekvo_RGB/sze_logo_fekvo_RGB_negativ.png" alt="SZE Logó" height="60px">
      </a>
      <div class="d-flex d-md-none" style="height: 95px; margin-top: 15px;"></div>
      <div class="d-flex align-items-center ms-4 mb-4"></div>
      <div class="navbar-nav w-100" style="flex-wrap: nowrap; overflow-x: auto; white-space: nowrap; position: relative;">
        <a href="index.html" class="nav-item nav-link active"><i class="fa fa-tachometer-alt me-2"></i>Főoldal</a>
        <a href="bejelentes.html" class="nav-item nav-link"><i class="fa fa-table me-2"></i>Teszt </a>
        <a href="signin.html" class="nav-item nav-link"><i class="fa fa-chart-bar me-2"></i>Teszt </a>
        <div class="nav-item dropdown">
          <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown"><i class="far fa-file-alt me-2"></i>Egyéb</a>
          <div class="dropdown-menu bg-transparent border-0">
            <a href="" class="dropdown-item" style="color: #50adc9;">oldal</a>
            <a href="" class="dropdown-item" style="color: #50adc9;">oldal</a>
            <a href="" class="dropdown-item" style="color: #50adc9;">oldal</a>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  props: {
    isDarkMode: Boolean
  }
};
</script>