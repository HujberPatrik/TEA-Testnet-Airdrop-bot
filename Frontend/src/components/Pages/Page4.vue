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
              />
              <label :for="field.id + '_igen'">Igen</label>
              <input
                type="radio"
                :id="field.id + '_nem'"
                :name="field.id"
                value="nem"
                v-model="field.value"
                class="ms-3"
              />
              <label :for="field.id + '_nem'">Nem</label>
            </div>

            <!-- Szállásigény létszám mezője -->
            <div v-if="field.id === 'accommodation' && field.value === 'igen'" class="form-group mt-3">
              <label for="accommodationCount">Szállásigény várható létszáma *</label>
              <input
                type="number"
                id="accommodationCount"
                v-model="accommodationCount"
                placeholder="Adja meg a létszámot"
                class="form-control uniform-input"
                required
              />
              <span v-if="errors.accommodationCount" class="error">{{ errors.accommodationCount }}</span>
            </div>

            <!-- Parkolóhely igény részletei -->
            <div v-if="field.id === 'parking' && field.value === 'igen'" class="form-group mt-3">
              <label for="parkingDetails">Várható gépkocsiforgalom és parkolóhely igény *</label>
              <textarea
                id="parkingDetails"
                v-model="parkingDetails"
                placeholder="Adja meg a várható gépkocsiforgalom és parkolóhely igény részleteit"
                class="form-control uniform-input"
                required
              ></textarea>
              <span v-if="errors.parkingDetails" class="error">{{ errors.parkingDetails }}</span>
            </div>

            <!-- Hulladék elszállításának módja -->
            <div v-if="field.id === 'waste' && field.value === 'igen'" class="form-group mt-3">
              <label for="wasteDisposalMethod">Hulladék elszállításának módja *</label>
              <select
                id="wasteDisposalMethod"
                v-model="wasteDisposalMethod"
                class="form-control uniform-input"
                required
              >
                <option value="" disabled>Válasszon egy opciót</option>
                <option value="sajat">Saját úton</option>
                <option value="egyetem">Egyetem által biztosítva</option>
              </select>
              <span v-if="errors.wasteDisposalMethod" class="error">{{ errors.wasteDisposalMethod }}</span>

              <!-- Ha a "Saját úton" opció van kiválasztva -->
              <div v-if="wasteDisposalMethod === 'sajat'" class="form-group mt-3">
                <label for="wasteDisposalResponsible">Ki végzi a hulladék elszállítását? *</label>
                <input
                  type="text"
                  id="wasteDisposalResponsible"
                  v-model="wasteDisposalResponsible"
                  placeholder="Adja meg a felelős személyt vagy céget"
                  class="form-control uniform-input"
                  required
                />
                <span v-if="errors.wasteDisposalResponsible" class="error">{{ errors.wasteDisposalResponsible }}</span>
              </div>
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
        { id: "accommodation", label: "Van a rendezvény idejére szállásigénye?", value: "" },
        { id: "parking", label: "Van parkolóhely igénye?", value: "" },
        { id: "waste", label: "Keletkezik hulladék?", value: "" },
        { id: "internet", label: "Szükséges internetkapcsolat (WiFi) a rendezvény idejére?", value: "" },
      ],
      accommodationCount: "",
      parkingDetails: "",
      wasteDisposalMethod: "",
      wasteDisposalResponsible: "",
      errors: {},
    };
  },
  methods: {
    saveDataToLocalStorage() {
      const formData = {
        yesNoFields: this.yesNoFields,
        accommodationCount: this.accommodationCount,
        parkingDetails: this.parkingDetails,
        wasteDisposalMethod: this.wasteDisposalMethod,
        wasteDisposalResponsible: this.wasteDisposalResponsible,
      };
      localStorage.setItem("formDataPage4", JSON.stringify(formData));
      console.log("Adatok mentve a localStorage-ba (Page4):", formData);
    },
    loadDataFromLocalStorage() {
      const savedData = localStorage.getItem("formDataPage4");
      if (savedData) {
        const data = JSON.parse(savedData);
        this.yesNoFields = data.yesNoFields || this.yesNoFields;
        this.accommodationCount = data.accommodationCount || "";
        this.parkingDetails = data.parkingDetails || "";
        this.wasteDisposalMethod = data.wasteDisposalMethod || "";
        this.wasteDisposalResponsible = data.wasteDisposalResponsible || "";
        console.log("Adatok betöltve a localStorage-ból (Page4):", data);
      }
    },
    validatePage() {
      this.errors = {};
      let isValid = true;

      // Kötelező mezők ellenőrzése a yesNoFields alapján
      this.yesNoFields.forEach((field) => {
        if (!field.value) {
          this.errors[field.id] = `A mező kitöltése kötelező!`;
          isValid = false;
        }
      });

      // Egyedi mezők validációja
      const accommodationField = this.yesNoFields.find((field) => field.id === "accommodation");
      if (accommodationField && accommodationField.value === "igen") {
        if (!this.accommodationCount) {
          this.errors.accommodationCount = "A mező kitöltése kötelező!";
          isValid = false;
        } else if (!Number.isInteger(parseInt(this.accommodationCount)) || this.accommodationCount <= 0) {
          this.errors.accommodationCount = "Adjon meg egy érvényes létszámot!";
          isValid = false;
        }
      }

      const parkingField = this.yesNoFields.find((field) => field.id === "parking");
      if (parkingField && parkingField.value === "igen" && !this.parkingDetails) {
        this.errors.parkingDetails = "A mező kitöltése kötelező!";
        isValid = false;
      }

      const wasteField = this.yesNoFields.find((field) => field.id === "waste");
      if (wasteField && wasteField.value === "igen") {
        if (!this.wasteDisposalMethod) {
          this.errors.wasteDisposalMethod = "A mező kitöltése kötelező!.";
          isValid = false;
        }
        if (this.wasteDisposalMethod === "sajat" && !this.wasteDisposalResponsible) {
          this.errors.wasteDisposalResponsible = "A mező kitöltése kötelező!";
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
