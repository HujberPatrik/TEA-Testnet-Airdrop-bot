<template>
  <div class="container">
    <div class="page" :style="{ display: 'block' }">
      <!-- Cím rész -->
      <h2>
        <span>A RENDEZVÉNYÉRT FELELŐS SZEMÉLY (SZERVEZŐ) ADATAI</span>
        <i class="bi bi-info-circle" title="A * részek kötelezőek"></i>
      </h2>

      <!-- Fő szervező adatai -->
      <div class="row">
        <div class="col-md-6">
          <input
            type="text"
            placeholder="Teljes név *"
            class="form-control mb-3 uniform-input"
            v-model="inputValues['felelos']"
            required
          />
          <span v-if="errors.felelos" class="error">{{ errors.felelos }}</span>
        </div>
        <div class="col-md-6">
          <input
            type="tel"
            placeholder="Telefonszám *"
            class="form-control mb-3 uniform-input"
            v-model="inputValues['telefon']"
            required
            title="Formátum: +36 20 123 4567"
          />
          <span v-if="errors.telefon" class="error">{{ errors.telefon }}</span>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <input
            type="email"
            placeholder="E-mail cím *"
            class="form-control mb-3 uniform-input"
            v-model="inputValues['email']"
            required
          />
          <span v-if="errors.email" class="error">{{ errors.email }}</span>
        </div>
        <div class="col-md-6">
          <input
            type="text"
            placeholder="Lakcím * (pl: 1061 Budapest, Andrássy út 1.)"
            class="form-control mb-3 uniform-input"
            v-model="inputValues['lakcim']"
            required
          />
          <span v-if="errors.lakcim" class="error">{{ errors.lakcim }}</span>
        </div>
      </div>

      <!-- További szervező adatai -->
      <div class="row">
        <div class="col-md-12">
          <label>Van a rendezvénynek további szervezője? *</label>
          <div class="radio-group">
            <input
              type="radio"
              id="additionalOrganizer_yes"
              name="additionalOrganizer"
              value="igen"
              v-model="inputValues['tovabbi_szervezo']"
              required
            />
            <label for="additionalOrganizer_yes">Igen</label>
            <input
              type="radio"
              id="additionalOrganizer_no"
              name="additionalOrganizer"
              value="nem"
              v-model="inputValues['tovabbi_szervezo']"
              class="ms-3"
              required
            />
            <label for="additionalOrganizer_no">Nem</label>
          </div>
          <span v-if="errors.tovabbi_szervezo" class="error">{{ errors.tovabbi_szervezo }}</span>
        </div>
      </div>

      <!-- További szervező adatai (csak ha "Igen" a válasz) -->
      <div v-if="inputValues['tovabbi_szervezo'] === 'igen'" class="additional-organizer-details mt-4">
        <h3>További szervező adatai</h3>
        <div class="row">
          <div class="col-md-6">
            <input
              type="text"
              placeholder="Teljes név *"
              class="form-control mb-3 uniform-input"
              v-model="inputValues['tovabbi_nev']"
              required
            />
            <span v-if="errors.tovabbi_nev" class="error">{{ errors.tovabbi_nev }}</span>
          </div>
          <div class="col-md-6">
            <input
              type="text"
              placeholder="Neptun kód"
              class="form-control mb-3 uniform-input"
              v-model="inputValues['tovabbi_neptun']"
            />
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <input
              type="tel"
              placeholder="Telefonszám *"
              class="form-control mb-3 uniform-input"
              v-model="inputValues['tovabbi_telefon']"
              required
              title="Formátum: +36 20 123 4567"
            />
            <span v-if="errors.tovabbi_telefon" class="error">{{ errors.tovabbi_telefon }}</span>
          </div>
          <div class="col-md-6">
            <input
              type="email"
              placeholder="E-mail cím *"
              class="form-control mb-3 uniform-input"
              v-model="inputValues['tovabbi_email']"
              required
            />
            <span v-if="errors.tovabbi_email" class="error">{{ errors.tovabbi_email }}</span>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <input
              type="text"
              placeholder="Lakcím * (pl: 1061 Budapest, Andrássy út 1.)"
              class="form-control mb-3 uniform-input"
              v-model="inputValues['tovabbi_lakcim']"
              required
            />
            <span v-if="errors.tovabbi_lakcim" class="error">{{ errors.tovabbi_lakcim }}</span>
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
      inputValues: JSON.parse(localStorage.getItem('inputValues')) || {
        felelos: '',
        telefon: '',
        email: '',
        lakcim: '',
        tovabbi_szervezo: '',
        tovabbi_nev: '',
        tovabbi_neptun: '',
        tovabbi_telefon: '',
        tovabbi_email: '',
        tovabbi_lakcim: '',
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
    validatePage() {
      this.errors = {};
      let isValid = true;

      // Kötelező mezők ellenőrzése
      if (!this.inputValues['felelos']) {
        this.errors['felelos'] = 'A mező kitöltése kötelező!';
        isValid = false;
      }
      
      // Telefonszám ellenőrzése
      if (!this.inputValues['telefon']) {
        this.errors['telefon'] = 'A mező kitöltése kötelező!';
        isValid = false;
      } else if (!this.validatePhone(this.inputValues['telefon'])) {
        this.errors['telefon'] = 'Érvénytelen telefonszám formátum! Példa: +36 20 123 4567';
        isValid = false;
      }
      
      // Email ellenőrzése
      if (!this.inputValues['email']) {
        this.errors['email'] = 'A mező kitöltése kötelező!';
        isValid = false;
      } else if (!this.validateEmail(this.inputValues['email'])) {
        this.errors['email'] = 'Érvénytelen email cím formátum!';
        isValid = false;
      }
      
      // Lakcím ellenőrzése
      if (!this.inputValues['lakcim']) {
        this.errors['lakcim'] = 'A mező kitöltése kötelező!';
        isValid = false;
      } else if (!this.validateAddress(this.inputValues['lakcim'])) {
        this.errors['lakcim'] = 'Érvénytelen cím formátum! Példa: 1061 Budapest, Andrássy út 1.';
        isValid = false;
      }
      
      if (!this.inputValues['tovabbi_szervezo']) {
        this.errors['tovabbi_szervezo'] = 'A mező kitöltése kötelező!';
        isValid = false;
      }

      // További szervező adatainak ellenőrzése (ha van)
      if (this.inputValues['tovabbi_szervezo'] === 'igen') {
        if (!this.inputValues['tovabbi_nev']) {
          this.errors['tovabbi_nev'] = 'A mező kitöltése kötelező!';
          isValid = false;
        }
        
        // További telefonszám ellenőrzése
        if (!this.inputValues['tovabbi_telefon']) {
          this.errors['tovabbi_telefon'] = 'A mező kitöltése kötelező!';
          isValid = false;
        } else if (!this.validatePhone(this.inputValues['tovabbi_telefon'])) {
          this.errors['tovabbi_telefon'] = 'Érvénytelen telefonszám formátum! Példa: +36 20 123 4567';
          isValid = false;
        }
        
        // További email ellenőrzése
        if (!this.inputValues['tovabbi_email']) {
          this.errors['tovabbi_email'] = 'A mező kitöltése kötelező!';
          isValid = false;
        } else if (!this.validateEmail(this.inputValues['tovabbi_email'])) {
          this.errors['tovabbi_email'] = 'Érvénytelen email cím formátum!';
          isValid = false;
        }
        
        // További lakcím ellenőrzése
        if (!this.inputValues['tovabbi_lakcim']) {
          this.errors['tovabbi_lakcim'] = 'A mező kitöltése kötelező!';
          isValid = false;
        } else if (!this.validateAddress(this.inputValues['tovabbi_lakcim'])) {
          this.errors['tovabbi_lakcim'] = 'Érvénytelen cím formátum! Példa: 1061 Budapest, Andrássy út 1.';
          isValid = false;
        }
      }

      return isValid;
    },
  },
  mounted() {
    const savedData = localStorage.getItem('inputValues');
    if (savedData) {
      this.inputValues = JSON.parse(savedData);
      console.log('Adatok betöltve a localStorage-ból (Page8):', this.inputValues);
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