<template>
  <div class="container">
    <div class="page" :style="{ display: 'block' }">
      <!-- Cím rész -->
      <h2>
        <span>MEGRENDELŐ (JOGI HÁTTÉR ESETÉN) ADATAI</span>
        <i class="bi bi-info-circle" title="A * részek kötelezőek"></i>
      </h2>

      <!-- Megrendelő adatai -->
      <div class="row">
        <div class="col-md-6">
          <input
            type="text"
            placeholder="Név/Cégnév *"
            class="form-control mb-3 uniform-input"
            v-model="inputValues['megrendelo_nev']"
            required
          />
          <span v-if="errors.megrendelo_nev" class="error">{{ errors.megrendelo_nev }}</span>
        </div>
        <div class="col-md-6">
          <input
            type="text"
            placeholder="Cím * (pl: 1061 Budapest, Andrássy út 1.)"
            class="form-control mb-3 uniform-input"
            v-model="inputValues['megrendelo_cim']"
            required
          />
          <span v-if="errors.megrendelo_cim" class="error">{{ errors.megrendelo_cim }}</span>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <input
            type="text"
            placeholder="Adószám * (pl: 12345678-1-23)"
            class="form-control mb-3 uniform-input"
            v-model="inputValues['megrendelo_ado']"
            required
          />
          <span v-if="errors.megrendelo_ado" class="error">{{ errors.megrendelo_ado }}</span>
        </div>
        <div class="col-md-6">
          <input
            type="tel"
            placeholder="Telefonszám * (+36 20 123 4567)"
            class="form-control mb-3 uniform-input"
            v-model="inputValues['megrendelo_telefon']"
            required
          />
          <span v-if="errors.megrendelo_telefon" class="error">{{ errors.megrendelo_telefon }}</span>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <input
            type="email"
            placeholder="E-mail cím * (pl: pelda@email.hu)"
            class="form-control mb-3 uniform-input"
            v-model="inputValues['megrendelo_email']"
            required
          />
          <span v-if="errors.megrendelo_email" class="error">{{ errors.megrendelo_email }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      inputValues: JSON.parse(localStorage.getItem('inputValues')) || {
        megrendelo_nev: '',
        megrendelo_cim: '',
        megrendelo_ado: '',
        megrendelo_telefon: '',
        megrendelo_email: '',
      },
      errors: {},
    };
  },
  watch: {
    inputValues: {
      handler(newValues) {
        localStorage.setItem('inputValues', JSON.stringify(newValues));
      },
      deep: true,
    },
  },
  methods: {
    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },
    validatePhone(phone) {
      // Elfogadja a magyar telefonszámokat különböző formátumokban
      const re = /^(\+36|06|36)[\s-]?(\d{1,2})[\s-]?(\d{3})[\s-]?(\d{3,4})$/;
      return re.test(phone);
    },
    validateAddress(address) {
      // Egyszerű lakcím ellenőrzés - tartalmaznia kell számot és várost/utcanevet
      return /.*\d+.*/.test(address) && /[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ]/.test(address);
    },
    validateTaxNumber(taxNumber) {
      // Magyar adószám ellenőrzése (8 számjegy, kötőjel, 1 számjegy, kötőjel, 2 számjegy)
      const re = /^\d{8}-\d{1}-\d{2}$/;
      return re.test(taxNumber);
    },
    validatePage() {
      this.errors = {};
      let isValid = true;

      // Kötelező mezők ellenőrzése
      if (!this.inputValues['megrendelo_nev']) {
        this.errors['megrendelo_nev'] = 'A mező kitöltése kötelező!';
        isValid = false;
      }
      
      // Cím ellenőrzése
      if (!this.inputValues['megrendelo_cim']) {
        this.errors['megrendelo_cim'] = 'A mező kitöltése kötelező!';
        isValid = false;
      } else if (!this.validateAddress(this.inputValues['megrendelo_cim'])) {
        this.errors['megrendelo_cim'] = 'Érvénytelen cím formátum! Példa: 1061 Budapest, Andrássy út 1.';
        isValid = false;
      }
      
      // Adószám ellenőrzése
      if (!this.inputValues['megrendelo_ado']) {
        this.errors['megrendelo_ado'] = 'A mező kitöltése kötelező!';
        isValid = false;
      } else if (!this.validateTaxNumber(this.inputValues['megrendelo_ado'])) {
        this.errors['megrendelo_ado'] = 'Érvénytelen adószám formátum! Példa: 12345678-1-23';
        isValid = false;
      }
      
      // Telefonszám ellenőrzése
      if (!this.inputValues['megrendelo_telefon']) {
        this.errors['megrendelo_telefon'] = 'A mező kitöltése kötelező!';
        isValid = false;
      } else if (!this.validatePhone(this.inputValues['megrendelo_telefon'])) {
        this.errors['megrendelo_telefon'] = 'Érvénytelen telefonszám formátum! Példa: +36 20 123 4567';
        isValid = false;
      }
      
      // Email ellenőrzése
      if (!this.inputValues['megrendelo_email']) {
        this.errors['megrendelo_email'] = 'A mező kitöltése kötelező!';
        isValid = false;
      } else if (!this.validateEmail(this.inputValues['megrendelo_email'])) {
        this.errors['megrendelo_email'] = 'Érvénytelen email cím formátum! Példa: pelda@email.hu';
        isValid = false;
      }

      return isValid;
    },
  },
  mounted() {
    const savedData = localStorage.getItem('inputValues');
    if (savedData) {
      this.inputValues = JSON.parse(savedData);
      console.log('Adatok betöltve a localStorage-ból (Page9):', this.inputValues);
    }
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