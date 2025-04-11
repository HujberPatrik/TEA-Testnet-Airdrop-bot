<template>
  <div class="container">
    <div
      v-for="(page, index) in pages"
      :key="index"
      :id="'page' + (index + 1)"
      class="page"
      :style="{ display: activePage === index + 1 ? 'block' : 'none' }"
    >
      <h2>
        <span>{{ page.title }}</span>
        <i class="bi bi-info-circle" title="A * részek kötelezőek"></i>
      </h2>

      <div v-if="page.type === 'text'" class="row">
        <div class="col-md-6" v-for="input in page.inputs" :key="input.placeholder">
          <label :for="input.id" class="form-label">{{ input.placeholder }}</label>
          <input
            v-if="input.type === 'text'"
            type="text"
            :id="input.id"
            :placeholder="input.placeholder"
            class="form-control mb-3"
            v-model.trim="inputValues[input.id]"
            :class="{ 'is-invalid': errors[input.id] }"
            required
          />
          <input
            v-else-if="input.type === 'date'"
            type="date"
            :id="input.id"
            class="form-control mb-3"
            v-model="inputValues[input.id]"
            :class="{ 'is-invalid': errors[input.id] }"
            required
          />
          <input
            v-else-if="input.type === 'time'"
            type="time"
            :id="input.id"
            class="form-control mb-3"
            v-model="inputValues[input.id]"
            :class="{ 'is-invalid': errors[input.id] }"
            required
          />
          <span v-if="errors[input.id]" class="error">{{ errors[input.id] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      activePage: 1,
      inputValues: JSON.parse(localStorage.getItem('inputValues')) || {
        nev: '',
        leiras: '',
        helyszin: '',
        cim: '',
        kezdo_datum: '',
        veg_datum: '',
        kezdo_idopont: '',
        veg_idopont: '',
      },
      errors: {},
      pages: [
        {
          title: 'A RENDEZVÉNY ADATAI',
          type: 'text',
          inputs: [
            { id: 'nev', placeholder: 'Rendezvény neve *', type: 'text' },
            { id: 'leiras', placeholder: 'Rendezvény leírása *', type: 'text' },
            { id: 'helyszin', placeholder: 'Rendezvény helyszíne *', type: 'text' },
            { id: 'cim', placeholder: 'Rendezvény pontos címe *', type: 'text' },
            { id: 'kezdo_datum', placeholder: 'Rendezvény kezdő dátuma *', type: 'date' },
            { id: 'kezdo_idopont', placeholder: 'Rendezvény kezdő időpontja *', type: 'time' },
            { id: 'veg_datum', placeholder: 'Rendezvény záró dátuma *', type: 'date' },
            { id: 'veg_idopont', placeholder: 'Rendezvény záró időpontja *', type: 'time' },
          ],
        },
      ],
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
    saveDataToLocalStorage() {
      localStorage.setItem('inputValues', JSON.stringify(this.inputValues));
      console.log('Adatok mentve a localStorage-ba:', this.inputValues);
    },
    loadDataFromLocalStorage() {
      const savedData = localStorage.getItem('inputValues');
      if (savedData) {
        this.inputValues = JSON.parse(savedData);
        console.log('Adatok betöltve a localStorage-ból:', this.inputValues);
      }
    },
    validatePage() {
      this.errors = {};
      let isValid = true;

      this.pages[this.activePage - 1].inputs.forEach((input) => {
        const value = this.inputValues[input.id];
        if (!value || value.toString().trim() === '') {
          this.errors[input.id] = 'A mező kitöltése kötelező!';
          isValid = false;
        } else if (input.id === 'cim') {
          // Rugalmasabb címformátum-ellenőrzés
          const cimFormat = /^[0-9]{4}\s+[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]+(?:\s+[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]+)*(?:,\s*)?(?:utca|u\.|tér|út|köz|krt\.|körút|liget|tér|sq\.|square|street|st\.|avenue|ave\.|road|rd\.|boulevard|blvd\.)?\s*[0-9]+(?:\s*[A-Za-z]?)?(?:\s*[/-]\s*[0-9]+)?(?:\s*[A-Za-z])?$/i;
          
          if (!cimFormat.test(value)) {
            this.errors[input.id] = 'Kérjük, adja meg a címet érvényes formátumban! Példák: "9026 Győr, Egyetem tér 1." vagy "4028 Debrecen Kassai út 26"';
            isValid = false;
          }
        } else if (input.type === 'date') {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (selectedDate < today) {
            this.errors[input.id] = 'A kezdő dátum nem lehet korábbi a mai dátumnál!';
            isValid = false;
          }
        }
      });

      return isValid;
    },
    async sendDataToBackend() {
      if (this.validatePage()) {
        try {
          const response = await axios.post('http://localhost:3000/api/kerveny', this.inputValues);
          console.log('Sikeres mentés:', response.data);
          alert('A rendezvény adatai sikeresen mentve az adatbázisba!');
          localStorage.removeItem('inputValues');
        } catch (error) {
          console.error('Hiba történt az API-kérés során:', error);
          alert('Nem sikerült menteni a rendezvény adatait. Próbálja újra később!');
        }
      } else {
        alert('Kérjük, javítsa a hibákat a mezőkben!');
      }
    },
  },
  mounted() {
    this.loadDataFromLocalStorage();
  },
};
</script>

<style>
.error {
  color: red;
  font-size: 0.8rem;
  display: block;
  margin-top: -10px;
  margin-bottom: 10px;
}

.page {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 5px;
  margin-bottom: 20px;
}

.is-invalid {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25) !important;
}
</style>