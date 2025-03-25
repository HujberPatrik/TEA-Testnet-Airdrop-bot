<template>
    <div class="container">
      <div v-for="(page, index) in pages" :key="index" :id="'page' + (index + 1)" class="page" :style="{ display: activePage === index + 1 ? 'block' : 'none' }">
        <!-- Cím rész -->
        <h2>
          <span>{{ page.title }}</span>
          <i class="bi bi-info-circle" title="A * részek kötelezőek"></i>
        </h2>
  
        <!-- Megrendelő (jogi háttér esetén) adatai -->
        <div v-if="page.type === 'client'" class="client-details">
          <div class="row" v-for="(field, index) in clientFields" :key="index">
            <div class="col-md-12">
              <input
                :type="field.type"
                :placeholder="field.placeholder"
                class="form-control mb-3"
                v-model="clientDetails[field.model]"
                :required="field.required"
              />
              <span v-if="errors[field.model]" class="error">{{ errors[field.model] }}</span>
            </div>
          </div>
  
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
          </div>
  
          <div class="form-check">
            <a href="https://munkatars.sze.hu/downloadmanager/details/id/43020/m/13936" target="_blank">A Rendezvényszabályzat ide kattintva érhető el</a>
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
          name: '',
          address: '',
          taxNumber: '',
          phoneNumber: '',
          email: '',
          dataDeclaration: false,
          regulationAcceptance: false,
        },
        fileName: '',
        fileContent: null,
        errors: {},
        pages: [
          {
            title: 'FÁJLFELTÖLTÉS ÉS FELHASZNÁLÓI SZERZŐDÉS',
            type: 'client',
          },
        ],
      };
    },
    methods: {
      saveDataToLocalStorage() {
        const formData = {
          clientDetails: this.clientDetails,
        };
        localStorage.setItem('formDataPage10', JSON.stringify(formData));
        console.log('Adatok mentve a localStorage-ba (Page10):', formData);

        // Fájl mentése, ha van feltöltött fájl
        if (this.fileContent) {
          this.uploadFile();
        }
      },
      validatePage() {
        this.errors = {};
        let isValid = true;
  
        // Név/Cégnév validálása
        if (!this.clientDetails.name) {
          this.errors.name = 'A név/cégnév kötelező.';
          isValid = false;
        }
  
        // Cím validálása
        if (!this.clientDetails.address) {
          this.errors.address = 'A cím kötelező.';
          isValid = false;
        }
  
        // Adószám validálása
        if (!this.clientDetails.taxNumber) {
          this.errors.taxNumber = 'Az adószám kötelező.';
          isValid = false;
        }
  
        // Telefonszám validálása
        if (!this.clientDetails.phoneNumber) {
          this.errors.phoneNumber = 'A telefonszám kötelező.';
          isValid = false;
        }
  
        // E-mail cím validálása
        if (!this.clientDetails.email) {
          this.errors.email = 'Az e-mail cím kötelező.';
          isValid = false;
        }
  
        // Nyilatkozatok validálása
        if (!this.clientDetails.dataDeclaration) {
          this.errors.dataDeclaration = 'A nyilatkozat elfogadása kötelező.';
          isValid = false;
        }
        if (!this.clientDetails.regulationAcceptance) {
          this.errors.regulationAcceptance = 'A szabályzat elfogadása kötelező.';
          isValid = false;
        }
  
        return isValid;
      },
      handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
          if (file.size > 6 * 1024 * 1024) {
            alert('A fájl mérete nem haladhatja meg a 6 MB-ot.');
            return;
          }
          this.fileName = file.name;
  
          // Olvassuk be a fájl tartalmát
          const reader = new FileReader();
          reader.onload = (e) => {
            this.fileContent = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      },
      uploadFile() {
        // Küldjük el a fájlt a szervernek
        fetch('/uploadedfiles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: this.fileName,
            fileContent: this.fileContent,
          }),
        })
          .then((response) => {
            if (response.ok) {
              console.log('Fájl sikeresen feltöltve:', this.fileName);
            } else {
              console.error('Hiba történt a fájl feltöltése során.');
            }
          })
          .catch((error) => {
            console.error('Hálózati hiba:', error);
          });
      },
    },
  };
  </script>
  
  <style src="/src/assets/css/style_pages.css"></style>