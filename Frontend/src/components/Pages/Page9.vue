<template>
  <div class="container">
    <div v-for="(page, index) in pages" :key="index" :id="'page' + (index + 1)" class="page" :style="{ display: activePage === index + 1 ? 'block' : 'none' }">
      <!-- Cím rész -->
      <h2>
        <span>{{ page.title }}</span>
        <i class="bi bi-info-circle" title="A * részek kötelezőek"></i>
      </h2>

      <!-- Megrendelő (jogi háttér esetén) adatai -->
      <div v-if="page.type === 'client'" class="client-details">
        <!-- Név/Cégnév -->
        <div class="row">
          <div class="col-md-12">
            <input
              type="text"
              placeholder="Név/Cégnév *"
              class="form-control mb-3 uniform-input"
              v-model="clientDetails.name"
              required
            />
            <span v-if="errors.name" class="error">{{ errors.name }}</span>
          </div>
        </div>

        <!-- Cím -->
        <div class="row">
          <div class="col-md-12">
            <input
              type="text"
              placeholder="Cím *"
              class="form-control mb-3 uniform-input"
              v-model="clientDetails.address"
              required
            />
            <span v-if="errors.address" class="error">{{ errors.address }}</span>
          </div>
        </div>

        <!-- Adószám -->
        <div class="row">
          <div class="col-md-12">
            <input
              type="text"
              placeholder="Adószám *"
              class="form-control mb-3 uniform-input"
              v-model="clientDetails.taxNumber"
              required
            />
            <span v-if="errors.taxNumber" class="error">{{ errors.taxNumber }}</span>
          </div>
        </div>

        <!-- Telefonszám -->
        <div class="row">
          <div class="col-md-12">
            <input
              type="tel"
              placeholder="Telefonszám *"
              class="form-control mb-3 uniform-input"
              v-model="clientDetails.phoneNumber"
              required
              title="Formátum: +36 20 123 4567"
            />
            <span v-if="errors.phoneNumber" class="error">{{ errors.phoneNumber }}</span>
          </div>
        </div>

        <!-- E-mail cím -->
        <div class="row">
          <div class="col-md-12">
            <input
              type="email"
              placeholder="E-mail cím *"
              class="form-control mb-3 uniform-input"
              v-model="clientDetails.email"
              required
            />
            <span v-if="errors.email" class="error">{{ errors.email }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activePage: 1,
      clientDetails: {
        name: '',
        address: '',
        taxNumber: '',
        phoneNumber: '',
        email: '',
      },
      errors: {},
      pages: [
        {
          title: 'MEGRENDELŐ (JOGI HÁTTÉR ESETÉN) ADATAI',
          type: 'client',
        },
      ],
    };
  },
  methods: {
    saveDataToLocalStorage() {
      const formData = {
        clientDetails: this.clientDetails,
      };
      localStorage.setItem('formDataPage9', JSON.stringify(formData));
      console.log('Adatok mentve a localStorage-ba (Page9):', formData);
    },
    loadDataFromLocalStorage() {
      const savedData = localStorage.getItem('formDataPage9');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.clientDetails = data.clientDetails || this.clientDetails;
        console.log('Adatok betöltve a localStorage-ból (Page9):', data);
      }
    },
    validatePage() {
      this.errors = {};
      let isValid = true;

      // Reguláris kifejezések
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Egyszerű e-mail ellenőrzés
      const phoneRegex = /^\+36\s?\d{1,2}\s?\d{3}\s?\d{4}$/; // Magyar telefonszám formátum: +36 20 123 4567 vagy +36201234567
      const taxNumberRegex = /^\d{8}-\d{1}-\d{2}$|^\d{10}$/; // Magyar adószám: 12345678-1-12 vagy civil adóigazolvány: 1234567890
      const addressRegex = /^\d{4,5} [A-Za-záéíóöőúüűÁÉÍÓÖŐÚÜŰ]+, ?.+$/; // Pl. 9026 Győr, Egyetem tér 1 vagy 92026 Győr,Egyetem tér 1

      // Név/Cégnév validálása
      if (!this.clientDetails.name) {
        this.errors.name = "A név/cégnév megadása kötelező!";
        isValid = false;
      }

      // Cím validálása
      if (!this.clientDetails.address) {
        this.errors.address = "A cím megadása kötelező!";
        isValid = false;
      } else if (!addressRegex.test(this.clientDetails.address)) {
        this.errors.address = "Érvényes címet adjon meg (Pl. 9026 Győr, Egyetem tér 1.)!";
        isValid = false;
      }

      // Adószám validálása
      if (!this.clientDetails.taxNumber) {
        this.errors.taxNumber = "Az adószám megadása kötelező!";
        isValid = false;
      } else if (!taxNumberRegex.test(this.clientDetails.taxNumber)) {
        this.errors.taxNumber = "Az adószám formátuma nem megfelelő! (pl. 12345678-1-12 vagy 1234567890)";
        isValid = false;
      }

      // Telefonszám validálása
      if (!this.clientDetails.phoneNumber) {
        this.errors.phoneNumber = "A telefonszám megadása kötelező!";
        isValid = false;
      } else if (!phoneRegex.test(this.clientDetails.phoneNumber)) {
        this.errors.phoneNumber = "A telefonszám formátuma nem megfelelő! (pl. +36 20 123 4567)";
        isValid = false;
      }

      // E-mail cím validálása
      if (!this.clientDetails.email) {
        this.errors.email = "Az e-mail cím megadása kötelező!";
        isValid = false;
      } else if (!emailRegex.test(this.clientDetails.email)) {
        this.errors.email = "Az e-mail cím formátuma nem megfelelő!";
        isValid = false;
      }

      return isValid;
    },
  },
  mounted() {
    // Az oldal betöltésekor automatikusan betölti az adatokat a localStorage-ból
    this.loadDataFromLocalStorage();
  },
};
</script>

<style src="/src/assets/css/style_pages.css"></style>
<style scoped>
.uniform-input {
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
}

.uniform-input::placeholder {
  color: #888;
  opacity: 0.5;
}

.error {
  color: red;
  font-size: 0.875rem;
}
</style>