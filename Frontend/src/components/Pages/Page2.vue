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
        </div>

        <div class="event-classification">
          <label for="eventClassification">Rendezvény minősítése *</label>
          <div class="custom-select">
            <select id="eventClassification" v-model="eventClassification" class="form-control mb-3" aria-label="Rendezvény minősítése" required>
              <option value="" disabled>Válasszon minősítést</option>
              <option v-for="qualification in eventQualifications" :key="qualification" :value="qualification">{{ qualification }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Rendezvény résztvevői és sajtó nyilvánosság -->
      <div class="participants-press">
        <div class="expected-participants">
          <label for="expectedParticipants">Rendezvény résztvevőinek várható létszáma (fő) *</label>
          <input type="number" id="expectedParticipants" v-model="expectedParticipants" placeholder="Adja meg a létszámot" class="form-control mb-3" required />
        </div>

        <div class="press-publicity">
          <label>Sajtónyilvános rendezvény? *</label>
          <div class="radio-group">
            <input type="radio" id="sajto_igen" name="sajto" value="igen" v-model="pressPublicity" />
            <label for="sajto_igen">Igen</label>
            <input type="radio" id="sajto_nem" name="sajto" value="nem" v-model="pressPublicity" class="ms-3" />
            <label for="sajto_nem">Nem</label>
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
          inputs: [
            { placeholder: 'Rendezvény neve *', type: 'text' },
            { placeholder: 'Rendezvény leírása *', type: 'text' },
            { placeholder: 'Rendezvény helyszíne *', type: 'text' },
            { placeholder: 'Rendezvény pontos címe *', type: 'text' },
            { placeholder: 'Rendezvény kezdő dátuma *', type: 'date' },
            { placeholder: 'Rendezvény kezdő időpontja *', type: 'time' },
            { placeholder: 'Rendezvény záró dátuma *', type: 'date' },
            { placeholder: 'Rendezvény záró időpontja *', type: 'time' }
          ]
        }
      ],
      eventTypes: ['Egyetemi szervezésű rendezvények', 'Hallgatói rendezvények', 'Külső szervezésű rendezvények', 'Sportrendezvények'],
      eventQualifications: ['Nyilvános', 'Zártkörű']
    };
  },
  methods: {
    navigate(page) {
      if (this.validatePage()) {
        // Mentés a localStorage-ba
        localStorage.setItem('formData', JSON.stringify(this.inputValues));
        if (page >= 1 && page <= this.pages.length) {
          this.activePage = page;
        }
      }
    },
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
    validatePage() {
      this.errors = {};
      let isValid = true;
      this.pages[this.activePage - 1].inputs.forEach(input => {
        if (!this.inputValues[input.placeholder]) {
          this.errors[input.placeholder] = 'This field is required';
          isValid = false;
        }
      });
      return isValid;
    }
  }
};
</script>
  
<style src="/src/assets/css/style_pages.css"></style>