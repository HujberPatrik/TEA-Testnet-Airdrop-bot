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
          <!-- E-mail és verifikációs kód -->
          <div class="row">
            <div class="col-md-12">
              <input
                type="email"
                placeholder="E-mail cím *"
                class="form-control mb-3"
                v-model="clientDetails.email"
                required
              />
              <button
                @click="sendVerificationCode"
                class="btn btn-secondary mb-3"
                :disabled="isSending"
              >
                {{ isSending ? "Küldés..." : "Verifikációs kód küldése" }}
              </button>
              <span v-if="errors.email" class="error">{{ errors.email }}</span>
            </div>
          </div>
          <div class="row" v-if="verificationCodeSent">
            <div class="col-md-12">
              <input
                type="text"
                placeholder="Verifikációs kód"
                class="form-control mb-3"
                v-model="enteredVerificationCode"
                required
              />
              <button
                @click="verifyCode"
                class="btn btn-success mb-3"
              >
                Kód ellenőrzése
              </button>
              <span v-if="errors.verificationCode" class="error">{{ errors.verificationCode }}</span>
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
        name: "",
        address: "",
        taxNumber: "",
        phoneNumber: "",
        email: "",
        dataDeclaration: false,
        regulationAcceptance: false,
      },
      fileName: "",
      fileContent: null,
      errors: {},
      isSending: false, // Gomb állapotának kezelése
      verificationCode: "", // Generált verifikációs kód
      enteredVerificationCode: "", // Felhasználó által megadott kód
      verificationCodeSent: false, // Jelzi, hogy a kód elküldésre került-e
      pages: [
        {
          title: "FÁJLFELTÖLTÉS ÉS FELHASZNÁLÓI SZERZŐDÉS",
          type: "client",
        },
      ],
    };
  },
  methods: {
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
  
        // Név/Cégnév validálása
        if (!this.clientDetails.name) {
          this.errors.name = "A név/cégnév kötelező.";
          isValid = false;
        }
  
        // Cím validálása
        if (!this.clientDetails.address) {
          this.errors.address = "A cím kötelező.";
          isValid = false;
        }
  
        // Adószám validálása
        if (!this.clientDetails.taxNumber) {
          this.errors.taxNumber = "Az adószám kötelező.";
          isValid = false;
        }
  
        // Telefonszám validálása
        if (!this.clientDetails.phoneNumber) {
          this.errors.phoneNumber = "A telefonszám kötelező.";
          isValid = false;
        }
  
        // E-mail cím validálása
        if (!this.clientDetails.email) {
          this.errors.email = "Az e-mail cím kötelező.";
          isValid = false;
        } else if (!this.validateEmail(this.clientDetails.email)) {
          this.errors.email = "Érvénytelen e-mail cím formátum.";
          isValid = false;
        }
  
        return isValid;
      },
      validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      },
      generateVerificationCode() {
        // 6 jegyű véletlenszerű kód generálása
        this.verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      },
      async sendVerificationCode() {
        if (!this.clientDetails.email) {
          this.errors.email = "Az e-mail cím kötelező.";
          return;
        }
        if (!this.validateEmail(this.clientDetails.email)) {
          this.errors.email = "Érvénytelen e-mail cím formátum.";
          return;
        }
  
        this.isSending = true; // Gomb letiltása küldés közben
        this.generateVerificationCode(); // Kód generálása
  
        try {
          const response = await axios.post("http://localhost:3000/send-verification-code", {
            email: this.clientDetails.email,
            verificationCode: this.verificationCode,
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
  
          console.log('Teljes válasz:', response); // Teljes válasz naplózása
          alert(response.data); // "Email sikeresen elküldve!"
          this.verificationCodeSent = true;
        } catch (error) {
          console.error("Hiba részletei:", error.response ? error.response.data : error.message);
          console.error("Teljes hiba objektum:", error);
  
          if (error.response) {
            // A szerver válaszolt, de hibakód érkezett
            alert(`Szerver hiba: ${error.response.status} - ${error.response.data}`);
          } else if (error.request) {
            // A kérés elküldésre került, de nem érkezett válasz
            alert("Nem érkezett válasz a szervertől. Ellenőrizd a szerver futását.");
          } else {
            // Valami más hiba történt a kérés előkészítése közben
            alert("Hálózati vagy más hiba történt.");
          }
        } finally {
          this.isSending = false; // Gomb újra engedélyezése
        }
      },
      verifyCode() {
        if (this.enteredVerificationCode === this.verificationCode) {
          alert("A kód helyes!");
        } else {
          this.errors.verificationCode = "A megadott kód helytelen.";
        }
      },
  },
};
</script>

<style src="/src/assets/css/style_pages.css"></style>