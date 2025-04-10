<template>
  <div class="container">
    <div v-for="(page, index) in pages" :key="index" :id="'page' + (index + 1)" class="page" :style="{ display: activePage === index + 1 ? 'block' : 'none' }">
      <!-- Cím rész -->
      <h2>
        <span>{{ page.title }}</span>
        <i class="bi bi-info-circle" title="A * részek kötelezőek"></i>
      </h2>

      <!-- Rendezvény típusa és minősítése -->
      <div class="event-details">
        <div class="event-type">
          <label for="eventType">Rendezvény típusa *</label>
          <div class="custom-select">
            <select id="eventType" v-model="inputValues['tipus']" class="form-control mb-3" aria-label="Rendezvény típusa" required>
              <option value="" disabled>Válasszon típust</option>
              <option v-for="type in eventTypes" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>
          <p v-if="errors['tipus']" class="text-danger">{{ errors['tipus'] }}</p>
        </div>

        <div class="event-classification">
          <label for="eventClassification">Rendezvény minősítése *</label>
          <div class="custom-select">
            <select id="eventClassification" v-model="inputValues['minosites']" class="form-control mb-3" aria-label="Rendezvény minősítése" required>
              <option value="" disabled>Válasszon minősítést</option>
              <option v-for="qualification in eventQualifications" :key="qualification" :value="qualification">{{ qualification }}</option>
            </select>
          </div>
          <p v-if="errors['minosites']" class="text-danger">{{ errors['minosites'] }}</p>
        </div>
      </div>

      <!-- Rendezvény résztvevői és sajtó nyilvánosság -->
      <div class="participants-press">
        <div class="expected-participants">
          <label for="expectedParticipants">Rendezvény résztvevőinek várható létszáma (fő) *</label>
          <input type="number" id="expectedParticipants" v-model="inputValues['letszam']" placeholder="Adja meg a létszámot" class="form-control mb-3" required />
          <p v-if="errors['letszam']" class="text-danger">{{ errors['letszam'] }}</p>
        </div>

        <div class="press-publicity">
          <label>Sajtónyilvános rendezvény? *</label>
          <div class="radio-group">
            <input type="radio" id="sajto_igen" name="sajto" value="igen" v-model="inputValues['sajto']" />
            <label for="sajto_igen">Igen</label>
            <input type="radio" id="sajto_nem" name="sajto" value="nem" v-model="inputValues['sajto']" class="ms-3" />
            <label for="sajto_nem">Nem</label>
          </div>
          <p v-if="errors['sajto']" class="text-danger">{{ errors['sajto'] }}</p>
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
      inputValues: JSON.parse(localStorage.getItem('inputValues')) || {}, // Betöltés localStorage-ből
      errors: {},
      pages: [
        {
          title: 'A RENDEZVÉNY ADATAI',
          type: 'text',
          inputs: [] // Az összes placeholder és type eltávolítva
        }
      ],
      eventTypes: [
        'Egyetemi szervezésű rendezvény',
        'Egyetemi szervezésű hallgatói rendezvény',
        'Egyetemi szervezésű sportrendezvény',
        'Külső szervezésű sportrendezvény',
        'Külső szervezésű rendezvény'
      ],
      eventQualifications: ['Nyilvános', 'Zártkörű']
    };
  },
  watch: {
    inputValues: {
      handler(newValues) {
        localStorage.setItem('inputValues', JSON.stringify(newValues)); // Mentés localStorage-be
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

      // Kötelező mezők ellenőrzése
      if (!this.inputValues['tipus']) {
        this.errors['tipus'] = 'A mező kitöltése kötelező!';
        isValid = false;
      }
      if (!this.inputValues['minosites']) {
        this.errors['minosites'] = 'A mező kitöltése kötelező!';
        isValid = false;
      }
      if (!this.inputValues['letszam'] || isNaN(this.inputValues['letszam']) || this.inputValues['letszam'] <= 0) {
        this.errors['letszam'] = 'Adjon meg egy érvényes létszámot!';
        isValid = false;
      }
      if (!this.inputValues['sajto']) {
        this.errors['sajto'] = 'A mező kitöltése kötelező!';
        isValid = false;
      }

      return isValid;
    },
    navigate(page) {
      if (this.validatePage()) {
        this.saveDataToLocalStorage();
        if (page >= 1 && page <= this.pages.length) {
          this.activePage = page;
        }
      }
    },
  },
  mounted() {
    const savedData = localStorage.getItem('inputValues');
    if (savedData) {
      this.inputValues = JSON.parse(savedData);
      console.log('Adatok betöltve a localStorage-ból (Page2):', this.inputValues);
    }
  },
};
</script>
  
<style src="/src/assets/css/style_pages.css"></style>