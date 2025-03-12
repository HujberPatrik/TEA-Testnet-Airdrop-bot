<template>
  <div class="container">
    <div class="page" :style="{ display: 'block' }">
      <!-- Cím rész -->
      <h2>
        <span>A RENDEZVÉNY RÉSZLETES ADATAI</span>
        <i class="bi bi-info-circle" title="A * részek kötelezőek"></i>
      </h2>

      <!-- Igen/Nem választó mezők közvetlenül -->
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
      ],
      fireHazardDetails: "", // Tűzveszélyes tevékenység leírása
      chemicalsDetails: "", // Vegyi anyag felhasználásával kapcsolatos tevékenység leírása
      decorationDetails: "", // Dekoráció részletei
      errors: {},
    };
  },
  methods: {
    validateForm() {
      this.errors = {};

      // Tűzveszélyes tevékenység validáció
      const fireHazardField = this.yesNoFields.find(field => field.id === "fireHazard");
      if (fireHazardField && fireHazardField.value === "igen" && !this.fireHazardDetails) {
        this.errors.fireHazardDetails = "Kötelező megadni a tűzveszélyes tevékenység leírását.";
      }

      // Vegyi anyag felhasználása validáció
      const chemicalsField = this.yesNoFields.find(field => field.id === "chemicals");
      if (chemicalsField && chemicalsField.value === "igen" && !this.chemicalsDetails) {
        this.errors.chemicalsDetails = "Kötelező megadni a vegyi anyag felhasználásával kapcsolatos tevékenység leírását.";
      }

// Dekoráció validáció
const decorationField = this.yesNoFields.find(field => field.id === "decoration");
if (decorationField && decorationField.value === "igen" && !this.decorationDetails) {
this.errors.decorationDetails = "Kötelező megadni a dekoráció részleteit.";
      }
  
      // További validációk...

      return Object.keys(this.errors).length === 0;
    },
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


