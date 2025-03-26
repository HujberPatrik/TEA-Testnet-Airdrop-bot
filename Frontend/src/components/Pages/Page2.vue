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
            <select id="eventType" v-model="eventType" class="form-control mb-3" aria-label="Rendezvény típusa" required>
              <option value="" disabled>Válasszon típust</option>
              <option v-for="type in eventTypes" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>
          <p v-if="errors.eventType" class="text-danger">{{ errors.eventType }}</p>
        </div>

        <div class="event-classification">
          <label for="eventClassification">Rendezvény minősítése *</label>
          <div class="custom-select">
            <select id="eventClassification" v-model="eventClassification" class="form-control mb-3" aria-label="Rendezvény minősítése" required>
              <option value="" disabled>Válasszon minősítést</option>
              <option v-for="qualification in eventQualifications" :key="qualification" :value="qualification">{{ qualification }}</option>
            </select>
          </div>
          <p v-if="errors.eventClassification" class="text-danger">{{ errors.eventClassification }}</p>
        </div>
      </div>

      <!-- Rendezvény résztvevői és sajtó nyilvánosság -->
      <div class="participants-press">
        <div class="expected-participants">
          <label for="expectedParticipants">Rendezvény résztvevőinek várható létszáma (fő) *</label>
          <input type="number" id="expectedParticipants" v-model="expectedParticipants" placeholder="Adja meg a létszámot" class="form-control mb-3" required />
          <p v-if="errors.expectedParticipants" class="text-danger">{{ errors.expectedParticipants }}</p>
        </div>

        <div class="press-publicity">
          <label>Sajtónyilvános rendezvény? *</label>
          <div class="radio-group">
            <input type="radio" id="sajto_igen" name="sajto" value="igen" v-model="pressPublicity" />
            <label for="sajto_igen">Igen</label>
            <input type="radio" id="sajto_nem" name="sajto" value="nem" v-model="pressPublicity" class="ms-3" />
            <label for="sajto_nem">Nem</label>
          </div>
          <p v-if="errors.pressPublicity" class="text-danger">{{ errors.pressPublicity }}</p>
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
      eventType: '',
      eventClassification: '',
      expectedParticipants: '',
      pressPublicity: '',
      inputValues: {},
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
  methods: {
    saveDataToLocalStorage() {
      const formData = {
        eventType: this.eventType,
        eventClassification: this.eventClassification,
        expectedParticipants: this.expectedParticipants,
        pressPublicity: this.pressPublicity,
        inputValues: this.inputValues,
      };
      localStorage.setItem('formDataPage2', JSON.stringify(formData));
      console.log('Adatok mentve a localStorage-ba (Page2):', formData);
    },
    loadDataFromLocalStorage() {
      const savedData = localStorage.getItem('formDataPage2');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.eventType = data.eventType || '';
        this.eventClassification = data.eventClassification || '';
        this.expectedParticipants = data.expectedParticipants || '';
        this.pressPublicity = data.pressPublicity || '';
        this.inputValues = data.inputValues || {};
        console.log('Adatok betöltve a localStorage-ból (Page2):', data);
      }
    },
    validatePage() {
      this.errors = {};
      let isValid = true;

      // Kötelező mezők ellenőrzése az inputValues alapján
      this.pages[this.activePage - 1].inputs.forEach((input) => {
        const value = this.inputValues[input.placeholder];
        if (!value) {
          this.errors[input.placeholder] = 'A mező kitöltése kötelező!';
          isValid = false;
        }
      });

      // Rendezvény típusa ellenőrzése
      if (!this.eventType) {
        this.errors.eventType = 'A mező kitöltése kötelező!';
        isValid = false;
      }

      // Rendezvény minősítése ellenőrzése
      if (!this.eventClassification) {
        this.errors.eventClassification = 'A mező kitöltése kötelező!';
        isValid = false;
      }

      // Résztvevők száma ellenőrzése
      if (!this.expectedParticipants || isNaN(this.expectedParticipants) || this.expectedParticipants <= 0) {
        this.errors.expectedParticipants = 'Adjon meg egy érvényes létszámot!';
        isValid = false;
      }

      // Sajtónyilvánosság ellenőrzése
      if (!this.pressPublicity) {
        this.errors.pressPublicity = 'A mező kitöltése kötelező!';
        isValid = false;
      }

      // Ha minden mező helyesen ki van töltve, engedélyezés
      if (isValid) {
        console.log('Az oldal validációja sikeres.');
      } else {
        console.log('Az oldal validációja sikertelen.', this.errors);
      }

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