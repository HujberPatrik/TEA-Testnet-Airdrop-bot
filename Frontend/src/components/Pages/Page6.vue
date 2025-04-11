<template>
  <div class="container">
    <div class="page" :style="{ display: 'block' }">
      <h2>
        <span>A RENDEZVÉNY RÉSZLETES ADATAI</span>
        <i class="bi bi-info-circle" title="A * részek kötelezőek"></i>
      </h2>

      <!-- Igen/Nem választó mezők + kapcsolódó kérdések -->
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
                v-model="inputValues[field.dbColumn]"
              />
              <label :for="field.id + '_igen'">Igen</label>
              <input
                type="radio"
                :id="field.id + '_nem'"
                :name="field.id"
                value="nem"
                v-model="inputValues[field.dbColumn]"
                class="ms-3"
              />
              <label :for="field.id + '_nem'">Nem</label>
            </div>
            <small class="text-danger" v-if="errors[field.dbColumn]">{{ errors[field.dbColumn] }}</small>

            <!-- Kapcsolódó kérdések megjelenítése közvetlenül alatta -->
            <div v-if="field.dbColumn === 'epites' && inputValues['epites'] === 'igen'" class="mt-3">
              <label>Rendezvényterület igénybevételének dátuma *</label>
              <input type="date" v-model="inputValues['epites_kezdet']" class="form-control" />
              <small class="text-danger" v-if="errors['epites_kezdet']">{{ errors['epites_kezdet'] }}</small>

              <label class="mt-3">Rendezvényterület igénybevételének időpontja *</label>
              <input type="text" v-model="inputValues['epites_kezdet_idopont']" class="form-control" />
              <small class="text-danger" v-if="errors['epites_kezdet_idopont']">{{ errors['epites_kezdet_idopont'] }}</small>

              <label class="mt-3">Rendezvényterület visszaadásának dátuma *</label>
              <input type="date" v-model="inputValues['epites_veg']" class="form-control" />
              <small class="text-danger" v-if="errors['epites_veg']">{{ errors['epites_veg'] }}</small>

              <label class="mt-3">Rendezvényterület visszaadásának időpontja *</label>
              <input type="text" v-model="inputValues['epites_veg_idopont']" class="form-control" />
              <small class="text-danger" v-if="errors['epites_veg_idopont']">{{ errors['epites_veg_idopont'] }}</small>

              <label class="mt-3">Rendezvényen megjelenő alvállalkozók *</label>
              <input type="text" v-model="inputValues['epites_vallalkozok']" class="form-control" />
              <small class="text-danger" v-if="errors['epites_vallalkozok']">{{ errors['epites_vallalkozok'] }}</small>

              <label class="mt-3">Lesz-e magasban végzett tevékenység az építés során? *</label>
              <div class="radio-group">
                <input type="radio" id="magasban_igen" value="igen" v-model="inputValues['epites_magasban']" />
                <label for="magasban_igen">Igen</label>
                <input type="radio" id="magasban_nem" value="nem" v-model="inputValues['epites_magasban']" class="ms-3" />
                <label for="magasban_nem">Nem</label>
              </div>
              <small class="text-danger" v-if="errors['epites_magasban']">{{ errors['epites_magasban'] }}</small>

              <label class="mt-3">Szükséges-e állvány az építéshez? *</label>
              <div class="radio-group">
                <input type="radio" id="allvany_igen" value="igen" v-model="inputValues['epites_allvany']" />
                <label for="allvany_igen">Igen</label>
                <input type="radio" id="allvany_nem" value="nem" v-model="inputValues['epites_allvany']" class="ms-3" />
                <label for="allvany_nem">Nem</label>
              </div>
              <small class="text-danger" v-if="errors['epites_allvany']">{{ errors['epites_allvany'] }}</small>

              <label class="mt-3">Lesz-e rendezvényelemek kézi anyagmozgatása? *</label>
              <div class="radio-group">
                <input type="radio" id="kezi_igen" value="igen" v-model="inputValues['epites_kezi']" />
                <label for="kezi_igen">Igen</label>
                <input type="radio" id="kezi_nem" value="nem" v-model="inputValues['epites_kezi']" class="ms-3" />
                <label for="kezi_nem">Nem</label>
              </div>
              <small class="text-danger" v-if="errors['epites_kezi']">{{ errors['epites_kezi'] }}</small>

              <label class="mt-3">Lesz-e rendezvényelemek gépi anyagmozgatása? *</label>
              <div class="radio-group">
                <input type="radio" id="gepi_igen" value="igen" v-model="inputValues['epites_gepi']" />
                <label for="gepi_igen">Igen</label>
                <input type="radio" id="gepi_nem" value="nem" v-model="inputValues['epites_gepi']" class="ms-3" />
                <label for="gepi_nem">Nem</label>
              </div>
              <small class="text-danger" v-if="errors['epites_gepi']">{{ errors['epites_gepi'] }}</small>

              <div v-if="inputValues['epites_gepi'] === 'igen'" class="mt-3">
                <label>Gépi anyagmozgatás eszköze *</label>
                <select v-model="inputValues['epites_gepi_eszkoz']" class="form-control">
                  <option value="">Válassz...</option>
                  <option value="targonca">Targonca</option>
                  <option value="daru">Daru</option>
                  <option value="egyeb">Egyéb emelő eszköz</option>
                </select>
                <small class="text-danger" v-if="errors['epites_gepi_eszkoz']">{{ errors['epites_gepi_eszkoz'] }}</small>
              </div>
            </div>

            <div v-if="field.dbColumn === 'aramigeny' && inputValues['aramigeny'] === 'igen'" class="mt-3">
              <label>Áramigény *</label>
              <input type="text" v-model="inputValues['aramigeny_mertek']" placeholder="Pl. 10A, 230V" class="form-control" />
              <small class="text-danger" v-if="errors['aramigeny_mertek']">{{ errors['aramigeny_mertek'] }}</small>
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
      inputValues: JSON.parse(localStorage.getItem('inputValues')) || {
        epites: '',
        epites_kezdet: '',
        epites_kezdet_idopont: '',
        epites_veg: '',
        epites_veg_idopont: '',
        epites_vallalkozok: '',
        epites_magasban: '',
        epites_allvany: '',
        epites_kezi: '',
        epites_gepi: '',
        epites_gepi_eszkoz: '',
        aramigeny: '',
        aramigeny_mertek: '',
        takaritas: '',
        takaritas_alatt: '',
      },
      yesNoFields: [
        {
          id: "construction",
          label: "Várhatóak a rendezvényen építési és bontási munkálatok?",
          dbColumn: "epites",
        },
        {
          id: "powerSupply",
          label: "Szükséges rendezvényszekrényből áram vételezése?",
          dbColumn: "aramigeny",
        },
        {
          id: "cleaningBefore",
          label: "Igényel takarítást a rendezvény előtt?",
          dbColumn: "takaritas",
        },
        {
          id: "cleaningDuring",
          label: "Igényel takarítási ügyeletet a rendezvény alatt?",
          dbColumn: "takaritas_alatt",
        },
      ],
      errors: {},
    };
  },
  watch: {
    inputValues: {
      handler(newValues) {
        localStorage.setItem("inputValues", JSON.stringify(newValues));
      },
      deep: true,
    },
  },
  methods: {
    validatePage() {
      this.errors = {};
      let isValid = true;

      this.yesNoFields.forEach((field) => {
        if (!this.inputValues[field.dbColumn]) {
          this.errors[field.dbColumn] = 'A mező kitöltése kötelező!';
          isValid = false;
        }
      });

      if (this.inputValues.epites === 'igen') {
        const requiredFields = [
          { key: 'epites_kezdet', msg: 'Adja meg az építési kezdés dátumát!' },
          { key: 'epites_kezdet_idopont', msg: 'Adja meg az igénybevétel időpontját!' },
          { key: 'epites_veg', msg: 'Adja meg az építési befejezés dátumát!' },
          { key: 'epites_veg_idopont', msg: 'Adja meg a visszaadás időpontját!' },
          { key: 'epites_vallalkozok', msg: 'Adja meg az alvállalkozókat!' },
          { key: 'epites_magasban', msg: 'Válassza ki, lesz-e magasban végzett tevékenység!' },
          { key: 'epites_allvany', msg: 'Válassza ki, szükséges-e állvány!' },
          { key: 'epites_kezi', msg: 'Válassza ki, lesz-e kézi anyagmozgatás!' },
          { key: 'epites_gepi', msg: 'Válassza ki, lesz-e gépi anyagmozgatás!' },
        ];
        requiredFields.forEach(f => {
          if (!this.inputValues[f.key]) {
            this.errors[f.key] = f.msg;
            isValid = false;
          }
        });

        if (this.inputValues.epites_gepi === 'igen' && !this.inputValues.epites_gepi_eszkoz) {
          this.errors.epites_gepi_eszkoz = 'Adja meg a gépi anyagmozgatás eszközét!';
          isValid = false;
        }
      }

      if (this.inputValues.aramigeny === 'igen') {
        if (!this.inputValues.aramigeny_mertek) {
          this.errors.aramigeny_mertek = 'Adja meg az áramigényt!';
          isValid = false;
        }
      }

      return isValid;
    },
  },
  mounted() {
    const savedData = localStorage.getItem("inputValues");
    if (savedData) {
      this.inputValues = JSON.parse(savedData);
      console.log("Adatok betöltve a localStorage-ból (Page):", this.inputValues);
    }
  },
};
</script>

<style src="/src/assets/css/style_pages.css"></style>
