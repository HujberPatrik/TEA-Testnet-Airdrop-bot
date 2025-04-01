<template>
  <div class="container">
    <div
      v-for="(page, index) in pages"
      :key="index"
      :id="'page' + (index + 1)"
      class="page"
      :style="{ display: activePage === index + 1 ? 'block' : 'none' }"
    >
      <!-- Cím rész -->
      <h2>
        <span>{{ page.title }}</span>
        <i class="bi bi-info-circle" title="A * részek kötelezőek"></i>
      </h2>

      <!-- Szöveges inputok -->
      <div v-if="page.type === 'text'" class="row">
        <div class="col-md-6" v-for="input in page.inputs" :key="input.placeholder">
          <label v-if="input.type === 'date' && input.placeholder.includes('kezdő')">Rendezvény kezdő dátuma *</label>
          <label v-if="input.type === 'date' && input.placeholder.includes('záró')">Rendezvény záró dátuma *</label>
          <label v-if="input.type === 'time' && input.placeholder.includes('kezdő')">Rendezvény kezdő időpontja *</label>
          <label v-if="input.type === 'time' && input.placeholder.includes('záró')">Rendezvény záró időpontja *</label>
          <input
            v-if="input.type === 'text'"
            type="text"
            :placeholder="input.placeholder"
            class="form-control mb-3"
            v-model="inputValues[input.placeholder]"
            :class="{ 'is-invalid': errors[input.placeholder] }"
            required
            :title="input.placeholder.includes('pontos címe') ? 'Formátum: 9026 Győr, Egyetem tér 1.' : ''"
          />
          <input
            v-else-if="input.type === 'date'"
            type="date"
            :placeholder="input.placeholder"
            class="form-control mb-3"
            v-model="inputValues[input.placeholder]"
            :class="{ 'is-invalid': errors[input.placeholder] }"
            required
          />
          <input
            v-else-if="input.type === 'time'"
            type="time"
            :placeholder="input.placeholder"
            class="form-control mb-3"
            v-model="inputValues[input.placeholder]"
            :class="{ 'is-invalid': errors[input.placeholder] }"
            required
          />
          <span v-if="errors[input.placeholder]" class="error">{{ errors[input.placeholder] }}</span>
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
      inputValues: {},
      errors: {},
      pages: [
        {
          title: 'A RENDEZVÉNY ADATAI',
          type: 'text',
          inputs: [
            { placeholder: 'Rendezvény neve *', type: 'text' },
            { placeholder: 'Rendezvény leírása *', type: 'text' },
            { placeholder: 'Rendezvény helyszíne *', type: 'text' },
            { placeholder: 'Rendezvény pontos címe *', type: 'text' },
            { placeholder: 'Rendezvény kezdő dátuma *', type: 'date' },
            { placeholder: 'Rendezvény kezdő időpontja *', type: 'time' },
            { placeholder: 'Rendezvény záró dátuma *', type: 'date' },
            { placeholder: 'Rendezvény záró időpontja *', type: 'time' },
          ],
        },
      ],
    };
  },
  methods: {
    saveDataToLocalStorage() {
      const formData = {
        inputValues: this.inputValues,
      };
      localStorage.setItem(`formDataPage${this.activePage}`, JSON.stringify(formData));
      console.log(`Adatok mentve a localStorage-ba (Page${this.activePage}):`, formData);
    },
    loadDataFromLocalStorage() {
      const savedData = localStorage.getItem(`formDataPage${this.activePage}`);
      if (savedData) {
        const data = JSON.parse(savedData);
        this.inputValues = data.inputValues || {};
        console.log(`Adatok betöltve a localStorage-ból (Page${this.activePage}):`, data);
      }
    },
    validatePage() {
      this.errors = {};
      let isValid = true;

      this.pages[this.activePage - 1].inputs.forEach((input) => {
        const value = this.inputValues[input.placeholder];

        // Kötelező mezők ellenőrzése
        if (!value) {
          this.errors[input.placeholder] = 'A mező kitöltése kötelező!';
          isValid = false;
        }

        // Dátum formátum ellenőrzése
        if (input.type === 'date' && value) {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD formátum
          if (!dateRegex.test(value)) {
            this.errors[input.placeholder] = 'Érvényes dátumot adjon meg (YYYY-MM-DD formátumban)!';
            isValid = false;
          }
        }

        // Idő formátum ellenőrzése
        if (input.type === 'time' && value) {
          const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM formátum
          if (!timeRegex.test(value)) {
            this.errors[input.placeholder] = 'Érvényes időpontot adjon meg (HH:MM formátumban)!';
            isValid = false;
          }
        }

        // Cím formátum ellenőrzése
        if (input.placeholder.includes('pontos címe') && value) {
          const addressRegex = /^\d{4,5} [A-Za-záéíóöőúüűÁÉÍÓÖŐÚÜŰ]+, ?.+$/; // Pl. 9026 Győr, Egyetem tér 1 vagy 92026 Győr,Egyetem tér 1
          if (!addressRegex.test(value)) {
            this.errors[input.placeholder] = 'Érvényes címet adjon meg (Pl. 9026 Győr, Egyetem tér 1.)!';
            isValid = false;
          }
        }
      });

      return isValid;
    },
    navigate(page) {
      if (this.validatePage()) {
        // Mentés a localStorage-ba
        this.saveDataToLocalStorage();

        if (page >= 1 && page <= this.pages.length) {
          this.activePage = page;

          // Betöltés a localStorage-ból
          this.loadDataFromLocalStorage();
        }
      }
    },
  },
  mounted() {
    // Az aktuális oldal adatainak betöltése a localStorage-ból
    this.loadDataFromLocalStorage();
  },
};
</script>

<style src="/src/assets/css/style_pages.css"></style>