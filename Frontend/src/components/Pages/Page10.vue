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

      <!-- Megrendelő (jogi háttér esetén) adatai -->
      <div v-if="page.type === 'client'" class="client-details">
        <!-- Fájl feltöltés -->
        <div class="row">
          <div class="col-md-12">
            <label for="fileUpload">Helyszín berendezési rajz (nem kötelező)</label>
            <input
              type="file"
              id="fileUpload"
              class="form-control mb-3"
              @change="handleFileUpload"
            />
            <div v-if="fileName" class="file-info">
              <p>{{ fileName }}</p>
            </div>
            <p class="max-size-text">Max. méret 6Mb</p> <!-- Max. méret szöveg -->
          </div>
        </div>

        <div class="row  mb-3">
          <div class="col-auto position-relative">
            <button
              class="btn btn-sm verification-btn d-inline-block"
              @click="uploadFile"
              style="background-color: #50adc9; color: white; border: none;"
            >
            Fájl feltöltése
            </button>
          </div>
        </div>

        
        <!-- Nyilatkozatok -->
        <div class="form-check">
          <input
            type="checkbox"
            id="dataDeclaration"
            v-model="clientDetails.dataDeclaration"
            required
            class="form-check-input"
          />
          <label for="dataDeclaration" class="form-check-label">
            Az űrlap kitöltésével és elküldésével büntetőjogi felelősségem teljes tudatában kijelentem, hogy az általam megadott adatok a valóságnak teljes mértékben megfelelnek és saját akaratomból adtam meg azokat. Továbbá hozzájárulok ahhoz, hogy adataimat a Széchenyi István Egyetem nevében eljáró személyek a személyi adatok védelméről és a közérdekű adatok nyilvánosságáról szóló 1992. évi LXIII. törvénynek megfelelően kezelje.
          </label>
          <span v-if="errors.dataDeclaration" class="error">{{ errors.dataDeclaration }}</span>
        </div>

        <div class="form-check">
          <input
            type="checkbox"
            id="regulationAcceptance"
            v-model="clientDetails.regulationAcceptance"
            required
            class="form-check-input"
          />
          <label for="regulationAcceptance" class="form-check-label">
            A Széchenyi István Egyetem hatályban lévő Rendezvényszabályzatát elfogadom.
          </label>
          <span v-if="errors.regulationAcceptance" class="error">{{ errors.regulationAcceptance }}</span>
        </div>

        <div class="form-check">
          <a
            href="https://munkatars.sze.hu/downloadmanager/details/id/43020/m/13936"
            target="_blank"
            >A Rendezvényszabályzat ide kattintva érhető el</a
          >
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
      clientDetails: {
        dataDeclaration: false,
        regulationAcceptance: false,
      },
      fileName: "",
      fileContent: null,
      errors: {},
      pages: [
        {
          title: "FÁJLFELTÖLTÉS ÉS FELHASZNÁLÓI SZERZŐDÉS",
          type: "client",
        },
      ],
    };
  },
  methods: {
    saveDataToLocalStorage() {
      const formData = {
        clientDetails: this.clientDetails,
        activePage: this.activePage,
        fileName: this.fileName,
      };
      localStorage.setItem('formDataPage10', JSON.stringify(formData));
      console.log('Adatok mentve a localStorage-ba (Page10):', formData);
    },
    loadDataFromLocalStorage() {
      const savedData = localStorage.getItem('formDataPage10');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.clientDetails = data.clientDetails || this.clientDetails;
        this.activePage = data.activePage || this.activePage;
        this.fileName = data.fileName || this.fileName;
        console.log('Adatok betöltve a localStorage-ból (Page10):', data);
      }
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 6 * 1024 * 1024) {
          alert("A fájl mérete nem haladhatja meg a 6 MB-ot.");
          return;
        }
        this.fileName = file.name;

        const reader = new FileReader();
        reader.onload = (e) => {
          this.fileContent = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    uploadFile() {
      fetch("/uploadedfiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: this.fileName,
          fileContent: this.fileContent,
        }),
      })
        .then((response) => {
          if (response.ok) {
            console.log("Fájl sikeresen feltöltve:", this.fileName);
          } else {
            console.error("Hiba történt a fájl feltöltése során.");
          }
        })
        .catch((error) => {
          console.error("Hálózati hiba:", error);
        });
    },
    validatePage() {
      this.errors = {};
      let isValid = true;

      // Ellenőrizzük, hogy a checkboxok ki vannak-e pipálva
      if (!this.clientDetails.dataDeclaration) {
        this.errors.dataDeclaration = 'Ezt a mezőt kötelező elfogadni!';
        isValid = false;
      }
      if (!this.clientDetails.regulationAcceptance) {
        this.errors.regulationAcceptance = 'Ezt a mezőt kötelező elfogadni!';
        isValid = false;
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
