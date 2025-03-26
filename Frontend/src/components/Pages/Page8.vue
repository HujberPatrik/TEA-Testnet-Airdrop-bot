<template>
  <div class="container">
    <div v-for="(page, index) in pages" :key="index" :id="'page' + (index + 1)" class="page" :style="{ display: activePage === index + 1 ? 'block' : 'none' }">
      <!-- Cím rész -->
      <h2>
        <span>{{ page.title }}</span>
        <i class="bi bi-info-circle" title="A * részek kötelezőek"></i>
      </h2>

      <!-- Rendezvényért felelős személy (szervező) adatai -->
      <div v-if="page.type === 'organizer'" class="organizer-details">
        <!-- Fő szervező adatai -->
        <div class="row">
          <div class="col-md-6">
            <input
              type="text"
              placeholder="Teljes név *"
              class="form-control mb-3 uniform-input"
              v-model="organizerDetails.fullName"
              required
            />
            <span v-if="errors.fullName" class="error">{{ errors.fullName }}</span>
          </div>
          <div class="col-md-6">
            <input
              type="tel"
              placeholder="Telefonszám *"
              class="form-control mb-3 uniform-input"
              v-model="organizerDetails.phoneNumber"
              required
              title="Formátum: +36 20 123 4567"
            />
            <span v-if="errors.phoneNumber" class="error">{{ errors.phoneNumber }}</span>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <input
              type="email"
              placeholder="E-mail cím *"
              class="form-control mb-3 uniform-input"
              v-model="organizerDetails.email"
              required
            />
            <span v-if="errors.email" class="error">{{ errors.email }}</span>
          </div>
          <div class="col-md-6">
            <input
              type="text"
              placeholder="Lakcím *"
              class="form-control mb-3 uniform-input"
              v-model="organizerDetails.address"
              required
            />
            <span v-if="errors.address" class="error">{{ errors.address }}</span>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <label>Van a rendezvénynek további szervezője? *</label>
            <div class="radio-group">
              <input
                type="radio"
                id="additionalOrganizer_yes"
                name="additionalOrganizer"
                value="igen"
                v-model="organizerDetails.hasAdditionalOrganizer"
                required
              />
              <label for="additionalOrganizer_yes">Igen</label>
              <input
                type="radio"
                id="additionalOrganizer_no"
                name="additionalOrganizer"
                value="nem"
                v-model="organizerDetails.hasAdditionalOrganizer"
                class="ms-3"
                required
              />
              <label for="additionalOrganizer_no">Nem</label>
            </div>
            <span v-if="errors.hasAdditionalOrganizer" class="error">{{ errors.hasAdditionalOrganizer }}</span>
          </div>
        </div>

        <!-- További szervező adatai (csak ha "Igen" a válasz) -->
        <div v-if="organizerDetails.hasAdditionalOrganizer === 'igen'" class="additional-organizer-details">
          <h3>További szervező adatai</h3>
          <div class="row">
            <div class="col-md-6">
              <input
                type="text"
                placeholder="Teljes név *"
                class="form-control mb-3 uniform-input"
                v-model="additionalOrganizerDetails.fullName"
                required
              />
              <span v-if="errors.additionalFullName" class="error">{{ errors.additionalFullName }}</span>
            </div>
            <div class="col-md-6">
              <input
                type="text"
                placeholder="Neptun kód"
                class="form-control mb-3 uniform-input"
                v-model="additionalOrganizerDetails.neptunCode"
              />
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <input
                type="tel"
                placeholder="Telefonszám *"
                class="form-control mb-3 uniform-input"
                v-model="additionalOrganizerDetails.phoneNumber"
                required
                title="Formátum: +36 20 123 4567"
              />
              <span v-if="errors.additionalPhoneNumber" class="error">{{ errors.additionalPhoneNumber }}</span>
            </div>
            <div class="col-md-6">
              <input
                type="email"
                placeholder="E-mail cím *"
                class="form-control mb-3 uniform-input"
                v-model="additionalOrganizerDetails.email"
                required
              />
              <span v-if="errors.additionalEmail" class="error">{{ errors.additionalEmail }}</span>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <input
                type="text"
                placeholder="Lakcím *"
                class="form-control mb-3 uniform-input"
                v-model="additionalOrganizerDetails.address"
                required
              />
              <span v-if="errors.additionalAddress" class="error">{{ errors.additionalAddress }}</span>
            </div>
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
      organizerDetails: {
        fullName: '',
        phoneNumber: '',
        email: '',
        address: '',
        hasAdditionalOrganizer: '',
      },
      additionalOrganizerDetails: {
        fullName: '',
        neptunCode: '',
        phoneNumber: '',
        email: '',
        address: '',
      },
      errors: {},
      pages: [
        {
          title: 'A RENDEZVÉNYÉRT FELELŐS SZEMÉLY (SZERVEZŐ) ADATAI',
          type: 'organizer',
        },
      ],
    };
  },
  methods: {
    saveDataToLocalStorage() {
      const formData = {
        organizerDetails: this.organizerDetails,
        additionalOrganizerDetails: this.additionalOrganizerDetails,
      };
      localStorage.setItem('formDataPage8', JSON.stringify(formData));
      console.log('Adatok mentve a localStorage-ba (Page8):', formData);
    },
    loadDataFromLocalStorage() {
      const savedData = localStorage.getItem('formDataPage8');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.organizerDetails = data.organizerDetails || this.organizerDetails;
        this.additionalOrganizerDetails = data.additionalOrganizerDetails || this.additionalOrganizerDetails;
        console.log('Adatok betöltve a localStorage-ból (Page8):', data);
      }
    },
    validatePage() {
      this.errors = {};
      let isValid = true;

      // Reguláris kifejezések
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Egyszerű e-mail ellenőrzés
      const phoneRegex = /^\+36\s?\d{1,2}\s?\d{3}\s?\d{4}$/; // Magyar telefonszám formátum: +36 20 123 4567 vagy +36201234567

      // Fő szervező adatainak ellenőrzése
      if (!this.organizerDetails.fullName) {
        this.errors.fullName = "A mező kitöltése kötelező!";
        isValid = false;
      }
      if (!this.organizerDetails.phoneNumber) {
        this.errors.phoneNumber = "A mező kitöltése kötelező!";
        isValid = false;
      } else if (!phoneRegex.test(this.organizerDetails.phoneNumber)) {
        this.errors.phoneNumber = "A telefonszám formátuma nem megfelelő! (pl. +36 20 123 4567)";
        isValid = false;
      }
      if (!this.organizerDetails.email) {
        this.errors.email = "A mező kitöltése kötelező!";
        isValid = false;
      } else if (!emailRegex.test(this.organizerDetails.email)) {
        this.errors.email = "Az e-mail cím formátuma nem megfelelő!";
        isValid = false;
      }
      if (!this.organizerDetails.address) {
        this.errors.address = "A mező kitöltése kötelező!";
        isValid = false;
      }
      if (!this.organizerDetails.hasAdditionalOrganizer) {
        this.errors.hasAdditionalOrganizer = "A mező kitöltése kötelező!";
        isValid = false;
      }

      // További szervező adatainak ellenőrzése (ha van)
      if (this.organizerDetails.hasAdditionalOrganizer === "igen") {
        if (!this.additionalOrganizerDetails.fullName) {
          this.errors.additionalFullName = "A mező kitöltése kötelező!";
          isValid = false;
        }
        if (!this.additionalOrganizerDetails.phoneNumber) {
          this.errors.additionalPhoneNumber = "A mező kitöltése kötelező!";
          isValid = false;
        } else if (!phoneRegex.test(this.additionalOrganizerDetails.phoneNumber)) {
          this.errors.additionalPhoneNumber = "A telefonszám formátuma nem megfelelő! (pl. +36 20 123 4567)";
          isValid = false;
        }
        if (!this.additionalOrganizerDetails.email) {
          this.errors.additionalEmail = "A mező kitöltése kötelező!";
          isValid = false;
        } else if (!emailRegex.test(this.additionalOrganizerDetails.email)) {
          this.errors.additionalEmail = "Az e-mail cím formátuma nem megfelelő!";
          isValid = false;
        }
        if (!this.additionalOrganizerDetails.address) {
          this.errors.additionalAddress = "A mező kitöltése kötelező!";
          isValid = false;
        }
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