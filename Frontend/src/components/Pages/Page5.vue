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

            <!-- Fotó és/vagy videófelvétel részletei -->
            <div v-if="field.id === 'photography' && field.value === 'igen'" class="form-group">
              <label for="photographyDetails">Milyen eszközzel fog történni? *</label>
              <textarea
                id="photographyDetails"
                v-model="photographyDetails"
                placeholder="Fényképezőgép, videokamera, GoPro, drón, stb."
                class="form-control"
                required
              ></textarea>
              <span v-if="errors.photographyDetails" class="error">{{ errors.photographyDetails }}</span>
            </div>

            <!-- Catering típusa -->
            <div v-if="field.id === 'catering' && field.value === 'igen'" class="form-group">
              <label>Catering típusa *</label>
              <div>
                <input type="checkbox" id="coldFood" value="hideg étel" v-model="cateringTypes" />
                <label for="coldFood" class="checkbox-label">hideg étel</label>
              </div>
              <div>
                <input type="checkbox" id="hotFood" value="meleg étel" v-model="cateringTypes" />
                <label for="hotFood" class="checkbox-label">meleg étel</label>
              </div>
              <div>
                <input type="checkbox" id="drinks" value="kávé, tea, üdítő" v-model="cateringTypes" />
                <label for="drinks" class="checkbox-label">kávé, tea, üdítő</label>
              </div>
              <span v-if="errors.cateringTypes" class="error">{{ errors.cateringTypes }}</span>
            </div>

            <!-- Oktatástechnikai eszközigény -->
            <div v-if="field.id === 'technicalSupport' && field.value === 'igen'" class="form-group mt-3">
              <label for="technicalEquipmentNeeds">Oktatástechnikai eszközigény *</label>
              <input
                type="text"
                id="technicalEquipmentNeeds"
                v-model="technicalEquipmentNeeds"
                placeholder="laptop, projektor, prezenter, stb."
                class="form-control uniform-input"
                required
              />
              <span v-if="errors.technicalEquipmentNeeds" class="error">{{ errors.technicalEquipmentNeeds }}</span>
            </div>

            <!-- Korlátozott mozgású személyek részletei -->
            <div v-if="field.id === 'disabledAccess' && field.value === 'igen'" class="form-group mt-3">
              <label for="disabledAccessDetails">Korlátozott mozgású személyek részvételének részletei *</label>
              <textarea
                id="disabledAccessDetails"
                v-model="disabledAccessDetails"
                placeholder="Adja meg a részleteket"
                class="form-control uniform-input"
                required
              ></textarea>
              <span v-if="errors.disabledAccessDetails" class="error">{{ errors.disabledAccessDetails }}</span>
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
      yesNoFields: [
        { id: "photography", label: "Fotó és/vagy videófelvétel készül-e a rendezvényen?", value: "" },
        { id: "catering", label: "Lesz a rendezvény területén catering?", value: "" },
        { id: "technicalSupport", label: "Szükséges-e oktatástechnikai támogatás?", value: "" },
        { id: "disabledAccess", label: "Korlátozott mozgású személyek részt vesznek?", value: "" },
      ],
      photographyDetails: "",
      cateringTypes: [],
      technicalEquipmentNeeds: "",
      disabledAccessDetails: "",
      errors: {},
    };
  },
  methods: {
    saveDataToLocalStorage() {
      const formData = {
        yesNoFields: this.yesNoFields,
        photographyDetails: this.photographyDetails,
        cateringTypes: this.cateringTypes,
        technicalEquipmentNeeds: this.technicalEquipmentNeeds,
        disabledAccessDetails: this.disabledAccessDetails,
      };
      localStorage.setItem("formDataPage5", JSON.stringify(formData));
      console.log("Adatok mentve a localStorage-ba (Page5):", formData);
    },
    loadDataFromLocalStorage() {
      const savedData = localStorage.getItem("formDataPage5");
      if (savedData) {
        const data = JSON.parse(savedData);
        this.yesNoFields = data.yesNoFields || this.yesNoFields;
        this.photographyDetails = data.photographyDetails || "";
        this.cateringTypes = data.cateringTypes || [];
        this.technicalEquipmentNeeds = data.technicalEquipmentNeeds || "";
        this.disabledAccessDetails = data.disabledAccessDetails || "";
        console.log("Adatok betöltve a localStorage-ból (Page5):", data);
      }
    },
    validateForm() {
      this.errors = {};

      // Fotó és/vagy videófelvétel validáció
      const photographyField = this.yesNoFields.find((field) => field.id === "photography");
      if (photographyField && photographyField.value === "igen" && !this.photographyDetails) {
        this.errors.photographyDetails = "Kötelező megadni a fotó és/vagy videófelvétel részleteit.";
      }

      // Catering validáció
      const cateringField = this.yesNoFields.find((field) => field.id === "catering");
      if (cateringField && cateringField.value === "igen" && this.cateringTypes.length === 0) {
        this.errors.cateringTypes = "Kötelező megadni a catering típusát.";
      }

      // Oktatástechnikai támogatás validáció
      const technicalSupportField = this.yesNoFields.find((field) => field.id === "technicalSupport");
      if (technicalSupportField && technicalSupportField.value === "igen" && !this.technicalEquipmentNeeds) {
        this.errors.technicalEquipmentNeeds = "Kötelező megadni az oktatástechnikai eszközigényt.";
      }

      // Korlátozott mozgású személyek részvételének validáció
      const disabledAccessField = this.yesNoFields.find((field) => field.id === "disabledAccess");
      if (disabledAccessField && disabledAccessField.value === "igen" && !this.disabledAccessDetails) {
        this.errors.disabledAccessDetails = "Kötelező megadni a korlátozott mozgású személyek részvételének részleteit.";
      }

      return Object.keys(this.errors).length === 0;
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

.form-group {
  margin-bottom: 30px; /* Larger margin between form groups */
}

.error {
  color: red;
  font-size: 0.875rem;
}
</style>

