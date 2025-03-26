<template>
  <div class="container">
    <div class="page" :style="{ display: 'block' }">
      <!-- Cím rész -->
      <h2>
        <span>A RENDEZVÉNY RÉSZLETES ADATAI</span>
        <i class="bi bi-info-circle" title="A * részek kötelezőek"></i>
      </h2>

      <!-- Igen/Nem választó mezők -->
      <div class="row">
        <div class="col-md-6" v-for="field in yesNoFields" :key="field.id">
          <div class="form-group mb-4">
            <label>{{ field.label }} *</label>
            <div class="radio-group">
              <input
                type="radio"
                :id="field.id + '_igen'"
                :name="field.id"
                value="igen"
                v-model="field.value"
                @change="logFieldValue(field)"
              />
              <label :for="field.id + '_igen'">Igen</label>
              <input
                type="radio"
                :id="field.id + '_nem'"
                :name="field.id"
                value="nem"
                v-model="field.value"
                class="ms-3"
                @change="logFieldValue(field)"
              />
              <label :for="field.id + '_nem'">Nem</label>
            </div>

            <!-- Tűzveszélyes tevékenység leírása -->
            <div v-if="field.id === 'fireHazard' && field.value === 'igen'" class="form-group">
              <label for="fireHazardDetails">Tűzveszélyes tevékenység leírása *</label>
              <textarea
                id="fireHazardDetails"
                v-model="fireHazardDetails"
                placeholder="Írja le a tűzveszélyes tevékenységet"
                class="form-control"
                required
              ></textarea>
              <span v-if="errors.fireHazardDetails" class="error">{{ errors.fireHazardDetails }}</span>
            </div>

            <!-- Vegyi anyag felhasználása várható-e -->
            <div v-if="field.id === 'chemicals' && field.value === 'igen'" class="form-group">
              <label for="chemicalsDetails">Tevékenység leírása *</label>
              <textarea
                id="chemicalsDetails"
                v-model="chemicalsDetails"
                placeholder="Írja le a vegyi anyag felhasználásával kapcsolatos tevékenységet"
                class="form-control"
                required
              ></textarea>
              <span v-if="errors.chemicalsDetails" class="error">{{ errors.chemicalsDetails }}</span>
            </div>

            <!-- Dekoráció részletei -->
            <div v-if="field.id === 'decoration' && field.value === 'igen'" class="form-group">
              <label for="decorationDetails">Dekoráció részletei *</label>
              <textarea
                id="decorationDetails"
                v-model="decorationDetails"
                placeholder="Írja le a dekoráció részleteit"
                class="form-control"
                required
              ></textarea>
              <span v-if="errors.decorationDetails" class="error">{{ errors.decorationDetails }}</span>
            </div>

            <!-- Portaszolgálat igénylése részletek -->
            <div
              v-if="field.id === 'securityService' && field.value === 'igen'"
              class="form-group"
              style="display: block; visibility: visible; opacity: 1;"
            >
              <label for="securityServiceDetails">Portaszolgálat részletei *</label>
              <textarea
                id="securityServiceDetails"
                v-model="securityServiceDetails"
                placeholder="Írja le a portaszolgálat igénylésével kapcsolatos részleteket"
                class="form-control"
                required
              ></textarea>
              <span v-if="errors.securityServiceDetails" class="error">{{ errors.securityServiceDetails }}</span>
            </div>

            <span v-if="errors[field.id]" class="error">{{ errors[field.id] }}</span>
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
      yesNoFields: [
        { id: "fireHazard", label: "Tűzveszélyes tevékenység várható-e?", value: "" },
        { id: "chemicals", label: "Vegyi anyag felhasználása várható-e?", value: "" },
        { id: "decoration", label: "Várható-e dekoráció a helyiség légterében?", value: "" },
        { id: "securityService", label: "Portaszolgálat igénylése a rendezvény idejére?", value: "" } // Új mező
      ],
      fireHazardDetails: "", // Tűzveszélyes tevékenység leírása
      chemicalsDetails: "", // Vegyi anyag felhasználásával kapcsolatos tevékenység leírása
      decorationDetails: "", // Dekoráció részletei
      securityServiceDetails: "", // Portaszolgálat részletei
      errors: {},
    };
  },
  methods: {
    saveDataToLocalStorage() {
      const formData = {
        yesNoFields: this.yesNoFields,
        fireHazardDetails: this.fireHazardDetails,
        chemicalsDetails: this.chemicalsDetails,
        decorationDetails: this.decorationDetails,
        securityServiceDetails: this.securityServiceDetails, // Új mező
      };
      localStorage.setItem("formDataPage7", JSON.stringify(formData));
      console.log("Adatok mentve a localStorage-ba (Page7):", formData);
    },
    loadDataFromLocalStorage() {
      const savedData = localStorage.getItem("formDataPage7");
      if (savedData) {
        const data = JSON.parse(savedData);
        console.log("Betöltött adatok:", data); // Ellenőrzés
        this.yesNoFields = data.yesNoFields || this.yesNoFields;
        this.fireHazardDetails = data.fireHazardDetails || "";
        this.chemicalsDetails = data.chemicalsDetails || "";
        this.decorationDetails = data.decorationDetails || "";
        this.securityServiceDetails = data.securityServiceDetails || ""; // Új mező
        console.log("Adatok betöltve a localStorage-ból (Page7):", data);
      }
    },
    validatePage() {
      this.errors = {};
      let isValid = true;

      // Kötelező mezők ellenőrzése a yesNoFields alapján
      this.yesNoFields.forEach((field) => {
        if (!field.value) {
          this.errors[field.id] = "A mező kitöltése kötelező!";
          isValid = false;
        }
      });

      // Tűzveszélyes tevékenység mező ellenőrzése
      const fireHazardField = this.yesNoFields.find((field) => field.id === "fireHazard");
      if (fireHazardField && fireHazardField.value === "igen" && !this.fireHazardDetails) {
        this.errors.fireHazardDetails = "A mező kitöltése kötelező!";
        isValid = false;
      }

      // Vegyi anyag felhasználása mező ellenőrzése
      const chemicalsField = this.yesNoFields.find((field) => field.id === "chemicals");
      if (chemicalsField && chemicalsField.value === "igen" && !this.chemicalsDetails) {
        this.errors.chemicalsDetails = "A mező kitöltése kötelező!";
        isValid = false;
      }

      // Dekoráció részletei mező ellenőrzése
      const decorationField = this.yesNoFields.find((field) => field.id === "decoration");
      if (decorationField && decorationField.value === "igen" && !this.decorationDetails) {
        this.errors.decorationDetails = "A mező kitöltése kötelező!";
        isValid = false;
      }

      // Portaszolgálat részletei mező ellenőrzése
      const securityServiceField = this.yesNoFields.find((field) => field.id === "securityService");
      if (securityServiceField && securityServiceField.value === "igen" && !this.securityServiceDetails) {
        this.errors.securityServiceDetails = "A mező kitöltése kötelező!";
        isValid = false;
      }

      return isValid;
    },
    logFieldValue(field) {
      console.log(`Field ID: ${field.id}, Value: ${field.value}`);
    },
  },
  mounted() {
    // Az oldal betöltésekor automatikusan betölti az adatokat a localStorage-ból
    this.loadDataFromLocalStorage();
  },
};

</script>

<style src="/src/assets/css/style_pages.css"></style>
