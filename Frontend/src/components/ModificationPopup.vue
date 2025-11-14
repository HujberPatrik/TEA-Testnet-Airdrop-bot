<template>
  <!-- Esemény részletes popup -->
  <div class="event-details-modal" v-if="event" v-show="!detailsHidden" @click.self="closeEventDetails">
    <div class="event-details-content sze-theme" :class="{ 'dark-mode': isDarkMode }">
      <div class="event-details-header">
        <h3>{{ event.nev }}</h3>
        <div class="header-controls">
          <div class="status-controls">
            <!-- ÚJ státusz megjelenítés -->
            <div
              class="event-status"
              :class="getStatusClassFromCode(normalizedStatus)"
              :title="getStatusLabel(normalizedStatus)"
            >
              <i :class="getStatusIcon(normalizedStatus)"></i>
              {{ getStatusLabel(normalizedStatus) }}
            </div>
            <button class="status-change-button" @click="openStatusModal" title="Státusz módosítása">
              <i class="fas fa-pen"></i>
            </button>
          </div>
          <button class="edit-button" @click="toggleEditMode" title="Szerkesztés">
            <i class="fas fa-cog"></i>
          </button>
          <button class="close-button" @click="closeEventDetails" title="Bezárás">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <div class="event-details-body">
        <!-- Fülek navigáció -->
        <ul class="nav nav-tabs mb-3">
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'basic' }" @click.prevent="activeTab = 'basic'" href="#">Alapadatok</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'details' }" @click.prevent="activeTab = 'details'" href="#">Részletes adatok</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'organizer' }" @click.prevent="activeTab = 'organizer'" href="#">Szervező</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'client' }" @click.prevent="activeTab = 'client'" href="#">Megrendelő</a>
          </li>
          <!-- Uni-Famulus és Egyetem fülek ELTÁVOLÍTVA -->
        </ul>

        <!-- Csak olvasható mód -->
        <div v-if="!editMode">
          <!-- Alapadatok lap -->
          <div v-if="activeTab === 'basic'" class="tab-content">
            <div class="row">
              <div class="col-md-6">
                <p><span class="label-text">Rendezvény neve:</span> {{ event.nev }}</p>
                <p><span class="label-text">Helyszín:</span> {{ event.helyszin }}</p>
                <p><span class="label-text">Cím:</span> {{ event.cim || 'Nincs megadva' }}</p>
                <p><span class="label-text">Kezdés:</span> {{ formatDateTime(event.kezdo_datum, event.kezdo_idopont) }}</p>
                <p><span class="label-text">Befejezés:</span> {{ formatDateTime(event.veg_datum, event.veg_idopont) }}</p>
              </div>
              <div class="col-md-6">
                <p><span class="label-text">Típus:</span> {{ event.tipus || 'Nincs megadva' }}</p>
                <p><span class="label-text">Minősítés:</span> {{ event.minosites || 'Nincs megadva' }}</p>
                <p><span class="label-text">Sajtónyilvános:</span> {{ event.sajto ? 'Igen' : 'Nem' }}</p>
                <p><span class="label-text">Várható létszám:</span> {{ event.letszam || 'Nincs megadva' }} fő</p>
              </div>
            </div>
            <div class="row mt-3">
              <div class="col-12">
                <p><span class="label-text">Leírás:</span></p>
                <p>{{ event.leiras || 'Nincs megadva' }}</p>
              </div>
            </div>
          </div>

          <!-- Részletes adatok lap -->
          <div v-if="activeTab === 'details'" class="tab-content">
            <div class="row">
              <div class="col-md-6">
                <p><span class="label-text">Rendezvény jellege:</span> {{ event.jelleg || 'Nincs megadva' }}</p>
                <p><span class="label-text">Programterv:</span> {{ event.programterv || 'Nincs megadva' }}</p>
                <p><span class="label-text">Berendezési mód:</span> {{ event.berendezesi_mod || 'Nincs megadva' }}</p>
                <p><span class="label-text">Szállásigény:</span> {{ event.szallasigeny ? 'Igen' : 'Nem' }}</p>
                <p v-if="event.szallasigeny"><span class="label-text">Szállásigény létszáma:</span> {{ event.szallasigeny_letszam || 'Nincs megadva' }} fő</p>
              </div>
              <div class="col-md-6">
                <p><span class="label-text">Parkoló:</span> {{ event.parkolo ? 'Igen' : 'Nem' }}</p>
                <p v-if="event.parkolo"><span class="label-text">Parkoló részletek:</span> {{ event.parkolo_reszletek || 'Nincs megadva' }}</p>
                <p><span class="label-text">Internet:</span> {{ event.internet ? 'Igen' : 'Nem' }}</p>
                <p><span class="label-text">Oktatástechnika:</span> {{ event.oktatastechnika ? 'Igen' : 'Nem' }}</p>
                <p v-if="event.oktatastechnika"><span class="label-text">Oktatástechnikai eszközök:</span> {{ event.oktatas_eszkozok || 'Nincs megadva' }}</p>
              </div>
            </div>
            <div class="row mt-3">
              <div class="col-md-6">
                <p><span class="label-text">Fotó/videó készül:</span> {{ event.foto ? 'Igen' : 'Nem' }}</p>
                <p v-if="event.foto"><span class="label-text">Fotó/videó részletek:</span> {{ event.foto_reszletek || 'Nincs megadva' }}</p>
                <p><span class="label-text">Catering:</span> {{ event.cater ? 'Igen' : 'Nem' }}</p>
                <p v-if="event.cater"><span class="label-text">Catering típusa:</span> {{ formatCateringType(event.catering_tipus) }}</p>
              </div>
              <div class="col-md-6">
                <p><span class="label-text">Építés:</span> {{ event.epites ? 'Igen' : 'Nem' }}</p>
                <p v-if="event.epites"><span class="label-text">Építés kezdete:</span> {{ formatDateTime(event.epites_kezdet, null) }}</p>
                <p v-if="event.epites"><span class="label-text">Építés vége:</span> {{ formatDateTime(event.epites_veg, null) }}</p>
                <p v-if="event.epites"><span class="label-text">Alvállalkozók:</span> {{ event.epites_vallalkozok || 'Nincs megadva' }}</p>
              </div>
            </div>
            <div class="row mt-3">
              <div class="col-md-6">
                <p><span class="label-text">Korlátozott mozgású személyek:</span> {{ event.korlatozott_mozgas ? 'Igen' : 'Nem' }}</p>
                <p v-if="event.korlatozott_mozgas"><span class="label-text">Részletek:</span> {{ event.korlatozott_mozgas_reszletek || 'Nincs megadva' }}</p>
                <p><span class="label-text">Hulladék:</span> {{ event.hulladek ? 'Igen' : 'Nem' }}</p>
                <p v-if="event.hulladek"><span class="label-text">Hulladék elszállítás módja:</span> {{ event.hulladek_elszallitas_modja || 'Nincs megadva' }}</p>
                <p v-if="event.hulladek"><span class="label-text">Hulladék elszállítás felelős:</span> {{ event.hulladek_elszallitas_felelos || 'Nincs megadva' }}</p>
              </div>
              <div class="col-md-6">
                <p><span class="label-text">Villanyszerelői ügyelet:</span> {{ event.villanyszerelo || 'Nincs megadva' }}</p>
                <p><span class="label-text">Áramigény:</span> {{ event.aramigeny ? 'Igen' : 'Nem' }}</p>
                <p><span class="label-text">Légszennyezés típusa:</span> {{ event.leg_szennyezes || 'Nincs megadva' }}</p>
                <p v-if="event.leg_szennyezes === 'egyéb'"><span class="label-text">Egyéb tevékenység:</span> {{ event.egyeb_tevekenyseg || 'Nincs megadva' }}</p>
              </div>
            </div>
          </div>

          <!-- Szervező lap -->
          <div v-if="activeTab === 'organizer'" class="tab-content">
            <div class="row">
              <div class="col-md-6">
                <p><span class="label-text">Név:</span> {{ event.felelos || 'Nincs megadva' }}</p>
                <p><span class="label-text">Email:</span> {{ event.email || 'Nincs megadva' }}</p>
                <p><span class="label-text">Telefonszám:</span> {{ event.telefon || 'Nincs megadva' }}</p>
              </div>
              <div class="col-md-6">
                <p><span class="label-text">Lakcím:</span> {{ event.lakcim || 'Nincs megadva' }}</p>
                <p><span class="label-text">További szervező:</span> {{ event.tovabbi_szervezo ? 'Igen' : 'Nem' }}</p>
              </div>
            </div>
            <div v-if="event.tovabbi_szervezo" class="row mt-3">
              <div class="col-12">
                <h5>További szervező adatai</h5>
              </div>
              <div class="col-md-6">
                <p><span class="label-text">Név:</span> {{ event.tovabbi_nev || 'Nincs megadva' }}</p>
                <p><span class="label-text">Email:</span> {{ event.tovabbi_email || 'Nincs megadva' }}</p>
                <p><span class="label-text">Telefonszám:</span> {{ event.tovabbi_telefon || 'Nincs megadva' }}</p>
              </div>
              <div class="col-md-6">
                <p><span class="label-text">Lakcím:</span> {{ event.tovabbi_lakcim || 'Nincs megadva' }}</p>
                <p><span class="label-text">Neptun kód:</span> {{ event.tovabbi_neptun || 'Nincs megadva' }}</p>
              </div>
            </div>
          </div>

          <!-- Megrendelő lap -->
          <div v-if="activeTab === 'client'" class="tab-content">
            <div class="row">
              <div class="col-md-6">
                <p><span class="label-text">Név/Cégnév:</span> {{ event.megrendelo_nev || 'Nincs megadva' }}</p>
                <p><span class="label-text">Cím:</span> {{ event.megrendelo_cim || 'Nincs megadva' }}</p>
                <p><span class="label-text">Adószám:</span> {{ event.megrendelo_ado || 'Nincs megadva' }}</p>
              </div>
              <div class="col-md-6">
                <p><span class="label-text">Email:</span> {{ event.megrendelo_email || 'Nincs megadva' }}</p>
                <p><span class="label-text">Telefonszám:</span> {{ event.megrendelo_telefon || 'Nincs megadva' }}</p>
              </div>
            </div>
          </div>
        </div>
        <!-- Uni-Famulus lap ELTÁVOLÍTVA -->
        <!-- Egyetem lap ELTÁVOLÍTVA -->
        <!-- Szerkesztési mód - minden fülhöz a megfelelő mezőkkel -->
        <div v-if="editMode" class="edit-mode">
          <!-- Alapadatok fül tartalma -->
          <div v-if="activeTab === 'basic'" class="edit-tab-content">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="edit-name">Rendezvény neve</label>
                <input type="text" id="edit-name" class="form-control" v-model="editedEvent.nev">
              </div>
              <div class="col-md-6 mb-3">
                <label for="edit-type">Rendezvény típusa</label>
                <select id="edit-type" class="form-control" v-model="editedEvent.tipus">
                  <option value="Egyetemi szervezésű rendezvény">Egyetemi szervezésű rendezvény</option>
                  <option value="Egyetemi szervezésű hallgatói rendezvény">Egyetemi szervezésű hallgatói rendezvény</option>
                  <option value="Egyetemi szervezésű sportrendezvény">Egyetemi szervezésű sportrendezvény</option>
                  <option value="Külső szervezésű sportrendezvény">Külső szervezésű sportrendezvény</option>
                  <option value="Külső szervezésű rendezvény">Külső szervezésű rendezvény</option>
                </select>
              </div>
              <div class="col-md-6 mb-3">
                <label for="edit-qualification">Rendezvény minősítése</label>
                <select id="edit-qualification" class="form-control" v-model="editedEvent.minosites">
                  <option value="Nyilvános">Nyilvános</option>
                  <option value="Zártkörű">Zártkörű</option>
                </select>
              </div>
              <div class="col-md-6 mb-3">
                <label for="edit-participants">Létszám</label>
                <input type="number" id="edit-participants" class="form-control" v-model="editedEvent.letszam">
              </div>
              <div class="col-md-6 mb-3">
                <label for="edit-location">Helyszín</label>
                <input type="text" id="edit-location" class="form-control" v-model="editedEvent.helyszin">
              </div>
              <div class="col-md-6 mb-3">
                <label for="edit-address">Cím</label>
                <input type="text" id="edit-address" class="form-control" v-model="editedEvent.cim">
              </div>
              <div class="col-md-6 mb-3">
                <label for="edit-start-date">Kezdő dátum</label>
                <input type="date" id="edit-start-date" class="form-control" v-model="editedEvent.kezdo_datum">
              </div>
              <div class="col-md-6 mb-3">
                <label for="edit-start-time">Kezdő időpont</label>
                <input type="time" id="edit-start-time" class="form-control" v-model="editedEvent.kezdo_idopont">
              </div>
              <div class="col-md-6 mb-3">
                <label for="edit-end-date">Befejező dátum</label>
                <input type="date" id="edit-end-date" class="form-control" v-model="editedEvent.veg_datum">
              </div>
              <div class="col-md-6 mb-3">
                <label for="edit-end-time">Befejező időpont</label>
                <input type="time" id="edit-end-time" class="form-control" v-model="editedEvent.veg_idopont">
              </div>
              <div class="col-md-12 mb-3">
                <label for="edit-description">Leírás</label>
                <textarea id="edit-description" class="form-control" v-model="editedEvent.leiras" rows="3"></textarea>
              </div>
            </div>
          </div>

          <!-- Részletes adatok fül tartalma -->
          <div v-if="activeTab === 'details'" class="edit-tab-content">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="edit-nature">Jelleg</label>
                <input type="text" id="edit-nature" class="form-control" v-model="editedEvent.jelleg">
              </div>
              <div class="col-md-6 mb-3">
                <label>Sajtónyilvános</label>
                <div class="d-flex gap-3">
                  <div class="form-check">
                    <input type="radio" id="edit-press-yes" class="form-check-input" value="igen" v-model="editedEvent.sajto">
                    <label for="edit-press-yes" class="form-check-label">Igen</label>
                  </div>
                  <div class="form-check">
                    <input type="radio" id="edit-press-no" class="form-check-input" value="nem" v-model="editedEvent.sajto">
                    <label for="edit-press-no" class="form-check-label">Nem</label>
                  </div>
                </div>
              </div>
              <div class="col-md-6 mb-3">
                <label>Szállásigény</label>
                <div class="d-flex gap-3">
                  <div class="form-check">
                    <input type="radio" id="edit-accommodation-yes" class="form-check-input" value="igen" v-model="editedEvent.szallasigeny">
                    <label for="edit-accommodation-yes" class="form-check-label">Igen</label>
                  </div>
                  <div class="form-check">
                    <input type="radio" id="edit-accommodation-no" class="form-check-input" value="nem" v-model="editedEvent.szallasigeny">
                    <label for="edit-accommodation-no" class="form-check-label">Nem</label>
                  </div>
                </div>
              </div>
              <div class="col-md-6 mb-3" v-if="editedEvent.szallasigeny === 'igen'">
                <label for="edit-accommodation-count">Szállásigény létszáma</label>
                <input type="number" id="edit-accommodation-count" class="form-control" v-model="editedEvent.szallasigeny_letszam">
              </div>
              <div class="col-md-12 mb-3">
                <label for="edit-program">Programterv</label>
                <textarea id="edit-program" class="form-control" v-model="editedEvent.programterv" rows="3"></textarea>
              </div>
              <div class="col-md-12 mb-3">
                <label for="edit-setup">Berendezési mód</label>
                <textarea id="edit-setup" class="form-control" v-model="editedEvent.berendezesi_mod" rows="3"></textarea>
              </div>
              <!-- További részletes adatok mezők -->
              <div class="col-md-6 mb-3">
                <label>Internet</label>
                <div class="d-flex gap-3">
                  <div class="form-check">
                    <input type="radio" id="edit-internet-yes" class="form-check-input" value="igen" v-model="editedEvent.internet">
                    <label for="edit-internet-yes" class="form-check-label">Igen</label>
                  </div>
                  <div class="form-check">
                    <input type="radio" id="edit-internet-no" class="form-check-input" value="nem" v-model="editedEvent.internet">
                    <label for="edit-internet-no" class="form-check-label">Nem</label>
                  </div>
                </div>
              </div>
              <div class="col-md-6 mb-3">
                <label>Parkoló</label>
                <div class="d-flex gap-3">
                  <div class="form-check">
                    <input type="radio" id="edit-parking-yes" class="form-check-input" value="igen" v-model="editedEvent.parkolo">
                    <label for="edit-parking-yes" class="form-check-label">Igen</label>
                  </div>
                  <div class="form-check">
                    <input type="radio" id="edit-parking-no" class="form-check-input" value="nem" v-model="editedEvent.parkolo">
                    <label for="edit-parking-no" class="form-check-label">Nem</label>
                  </div>
                </div>
              </div>
              <div class="col-md-12 mb-3" v-if="editedEvent.parkolo === 'igen'">
                <label for="edit-parking-details">Parkoló részletek</label>
                <textarea id="edit-parking-details" class="form-control" v-model="editedEvent.parkolo_reszletek" rows="3"></textarea>
              </div>
              <div class="col-md-6 mb-3">
                <label>Hulladék</label>
                <div class="d-flex gap-3">
                  <div class="form-check">
                    <input type="radio" id="edit-waste-yes" class="form-check-input" value="igen" v-model="editedEvent.hulladek">
                    <label for="edit-waste-yes" class="form-check-label">Igen</label>
                  </div>
                  <div class="form-check">
                    <input type="radio" id="edit-waste-no" class="form-check-input" value="nem" v-model="editedEvent.hulladek">
                    <label for="edit-waste-no" class="form-check-label">Nem</label>
                  </div>
                </div>
              </div>
              <div class="col-md-6 mb-3" v-if="editedEvent.hulladek === 'igen'">
                <label for="edit-waste-disposal-method">Hulladék elszállítás módja</label>
                <input type="text" id="edit-waste-disposal-method" class="form-control" v-model="editedEvent.hulladek_elszallitas_modja">
              </div>
              <div class="col-md-6 mb-3" v-if="editedEvent.hulladek === 'igen'">
                <label for="edit-waste-disposal-responsible">Hulladék elszállítás felelős</label>
                <input type="text" id="edit-waste-disposal-responsible" class="form-control" v-model="editedEvent.hulladek_elszallitas_felelos">
              </div>
            </div>
          </div>

          <!-- Szervező fül tartalma -->
          <div v-if="activeTab === 'organizer'" class="edit-tab-content">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="edit-organizer">Felelős neve</label>
                <input type="text" id="edit-organizer" class="form-control" v-model="editedEvent.felelos">
              </div>
              <div class="col-md-6 mb-3">
                <label for="edit-organizer-email">Email</label>
                <input type="email" id="edit-organizer-email" class="form-control" v-model="editedEvent.email">
              </div>
              <div class="col-md-6 mb-3">
                <label for="edit-organizer-phone">Telefon</label>
                <input type="tel" id="edit-organizer-phone" class="form-control" v-model="editedEvent.telefon">
              </div>
              <div class="col-md-6 mb-3">
                <label for="edit-organizer-address">Lakcím</label>
                <input type="text" id="edit-organizer-address" class="form-control" v-model="editedEvent.lakcim">
              </div>
              <div class="col-md-6 mb-3">
                <label>További szervező</label>
                <div class="d-flex gap-3">
                  <div class="form-check">
                    <input type="radio" id="edit-additional-organizer-yes" class="form-check-input" value="igen" v-model="editedEvent.tovabbi_szervezo">
                    <label for="edit-additional-organizer-yes" class="form-check-label">Igen</label>
                  </div>
                  <div class="form-check">
                    <input type="radio" id="edit-additional-organizer-no" class="form-check-input" value="nem" v-model="editedEvent.tovabbi_szervezo">
                    <label for="edit-additional-organizer-no" class="form-check-label">Nem</label>
                  </div>
                </div>
              </div>
              <div v-if="editedEvent.tovabbi_szervezo === 'igen'" class="col-12">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="edit-additional-name">További szervező neve</label>
                    <input type="text" id="edit-additional-name" class="form-control" v-model="editedEvent.tovabbi_nev">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="edit-additional-neptun">Neptun kód</label>
                    <input type="text" id="edit-additional-neptun" class="form-control" v-model="editedEvent.tovabbi_neptun">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="edit-additional-email">További szervező email</label>
                    <input type="email" id="edit-additional-email" class="form-control" v-model="editedEvent.tovabbi_email">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="edit-additional-phone">További szervező telefon</label>
                    <input type="tel" id="edit-additional-phone" class="form-control" v-model="editedEvent.tovabbi_telefon">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="edit-additional-address">További szervező lakcím</label>
                    <input type="text" id="edit-additional-address" class="form-control" v-model="editedEvent.tovabbi_lakcim">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Megrendelő fül tartalma -->
          <div v-if="activeTab === 'client'" class="edit-tab-content">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="edit-client-name">Megrendelő neve/cégneve</label>
                <input type="text" id="edit-client-name" class="form-control" v-model="editedEvent.megrendelo_nev">
              </div>
              <div class="col-md-6 mb-3">
                <label for="edit-client-address">Cím</label>
                <input type="text" id="edit-client-address" class="form-control" v-model="editedEvent.megrendelo_cim">
              </div>
              <div class="col-md-6 mb-3">
                <label for="edit-client-tax">Adószám</label>
                <input type="text" id="edit-client-tax" class="form-control" v-model="editedEvent.megrendelo_ado">
              </div>
              <div class="col-md-6 mb-3">
                <label for="edit-client-phone">Telefon</label>
                <input type="tel" id="edit-client-phone" class="form-control" v-model="editedEvent.megrendelo_telefon">
              </div>
              <div class="col-md-6 mb-3">
                <label for="edit-client-email">Email</label>
                <input type="email" id="edit-client-email" class="form-control" v-model="editedEvent.megrendelo_email">
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="event-details-footer">
        <div class="footer-left">
          <!-- Tovább -->
          <button class="pill-btn pill-primary" @click="openPricingWizard" title="Tovább">
            <i class="fas fa-arrow-right"></i>
            <span class="label">Tovább</span>
          </button>
        </div>
        <div class="footer-right">
          <button v-if="editMode" class="pill-btn pill-light" @click="cancelEdit" title="Mégsem">
            <i class="fas fa-times-circle"></i>
            <span class="label">Mégsem</span>
          </button>
          <button v-if="editMode" class="pill-btn pill-primary" @click="saveChanges" :disabled="isSaving" title="Mentés">
            <i v-if="!isSaving" class="fas fa-save"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            <span class="label">{{ isSaving ? 'Mentés...' : 'Mentés' }}</span>
          </button>
          <button v-if="!editMode" class="pill-btn pill-secondary" @click="closeEventDetails" title="Bezárás">
            <i class="fas fa-times"></i>
            <span class="label">Bezárás</span>
          </button>
          <button v-if="!editMode" class="pill-btn pill-primary" @click="toggleEditMode" title="Szerkesztés">
            <i class="fas fa-pen"></i>
            <span class="label">Szerkesztés</span>
          </button>
        </div>
      </div>
      
      <div v-if="saveError" class="alert alert-danger mt-3">
        {{ saveError }}
      </div>
    </div>
  </div>

  <!-- Státusz módosító popup -->
  <div class="status-modal" v-if="statusModalVisible" @click.self="closeStatusModal">
    <div class="status-modal-content">
      <h3>Státusz módosítása</h3>
      <div class="status-options status-options--wide">
        <div
          class="status-phase-group"
          v-for="grp in groupedStatuses"
          :key="grp.phase"
        >
          <h5>{{ phaseLabel(grp.phase) }}</h5>
          <div class="status-option" v-for="s in grp.items" :key="s.code">
            <input
              type="radio"
              :id="'status-' + s.code"
              :value="s.code"
              v-model="selectedStatus"
            />
            <label
              :for="'status-' + s.code"
              class="status-label"
              :class="['phase-' + s.phase.toLowerCase(), s.terminal ? 'terminal':'']"
            >
              {{ s.label }}
            </label>
          </div>
        </div>
      </div>
      <div class="status-buttons">
        <button class="pill-btn pill-light" @click="statusModalVisible = false">
          <i class="fas fa-arrow-left"></i>
          <span class="label">Mégse</span>
        </button>
        <button class="pill-btn pill-primary" @click="changeStatus(selectedStatus)">
          <i class="fas fa-check"></i>
          <span class="label">Mentés</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { STATUSES, TERMINAL_STATUS_CODES } from '@/constants/statuses.js';
import { isAdminRole } from '@/constants/roles.js';
// ÚJ import
import PricingFlowWizard from '@/components/PricingFlowWizard.vue';

const STATUS_MAP = STATUSES.reduce((a,s)=>{a[s.code]=s;return a;}, {});
const PHASE_LABELS = {
  BEERKEZETT: 'Beérkezett',
  SZERZODES: 'Szerződés',
  MEGVALOSITAS: 'Megvalósítás',
  ELSZAMOLAS: 'Elszámolás',
  LEZART: 'Lezárt'
};

const PHASE_ORDER = ['BEERKEZETT','SZERZODES','MEGVALOSITAS','ELSZAMOLAS','LEZART']; // <<< ÚJ

const LEGACY_NUMERIC_MAP = {
  0: 'BEERKEZETT',              // <<< MÓDOSÍTVA
  1: 'UF_ARAJANLAT_ELFOGADASARA_VAR',
  2: 'SZERZODES_ALAIRVA',
  3: 'ELUTASITVA',
  4: 'LEZARVA'
};

export default {
  name: 'ModificationPopup',
  components: {
    // ...existing code...
    PricingFlowWizard // ÚJ
  },
  props: {
    isDarkMode: { type: Boolean, default: false },
    event: { type: Object, default: null },
    userRole: { type: String, default: '' } // a parent adja át; ha nem, fallback lesz
  },
  data() {
    return {
      selectedStatus: null,
      statusModalVisible: false,
      activeTab: 'basic',
      editMode: false,
      editedEvent: {},
      isSaving: false,
      saveError: null,
      statusChanging: false,
      famulusPrices: [],
      famulusLoading: false,
      famulusError: null,
      uniPrices: [],
      uniLoading: false,
      uniError: null,
      detailsHidden: false,   // a ModificationPopup láthatóságának vezérlése
      pricingWizardVisible: false
    };
  },
  computed: {
    // Normalizált státusz kód (szám -> kód)
    normalizedStatus() {
      if (!this.event) return null;
      const raw = this.event.statusz ?? this.event.status;
      if (typeof raw === 'number') return LEGACY_NUMERIC_MAP[raw] || 'BEERKEZETT'; // <<< ALAP
      if (!raw) return 'BEERKEZETT';                                             // <<< ALAP
      return String(raw).trim().toUpperCase();
    },
    groupedStatuses() {
      const groups = {};
      STATUSES.forEach(s => {
        const phaseKey = String(s.phase || '').toUpperCase(); // normalizálás
        if (!groups[phaseKey]) groups[phaseKey] = [];
        // ne módosítsuk az eredeti objektumot
        groups[phaseKey].push({ ...s, phase: phaseKey });
      });
      return PHASE_ORDER
        .filter(p => groups[p])
        .map(phase => ({
          phase,
          items: groups[phase].sort(
            (a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999)
          )
        }));
    },
    effectiveUserRole() {
      // Fallback sorrend – állítsd a projekted szerint:
      return this.userRole
        || (this.$store && this.$store.state?.user?.role)
        || (this.$root?.currentUser && this.$root.currentUser.role)
        || (this.event && this.event.userRole)
        || '';
    },
    canAcceptQuote() {
      return isAdminRole(this.effectiveUserRole);
    },
    // Egység (mértékegység) szerinti csoportosítás a táblázathoz
    famulusGroups() {
      return this.buildUnitGroups(this.famulusPrices);
    },
    universityGroups() {
      return this.buildUnitGroups(this.uniPrices);
    }
  },
  watch: {
    event: {
      handler(ne) {
        if (ne) {
          this.editedEvent = JSON.parse(JSON.stringify(ne));
          this.prepareEditedEventData();
          this.activeTab = 'basic';
          this.editMode = false;
          document.body.style.overflow = 'hidden';
          this.detailsHidden = false; // új megnyitáskor legyen látható
        }
      },
      immediate: true
    },
    activeTab(newTab) {
      if (newTab === 'famulus') {
        this.fetchFamulusPrices();
      } else if (newTab === 'uni') {
        this.fetchUniPrices();
      }
    }
  },
  methods: {
    addRow() {
      this.famulusPrices.push({
        id: null,
        kerveny_Id: this.event.id,
        service_Id: null,
        service_name: '',
        rate_key: '',   // üres => placeholder látszik
        unit: '',       // üres => placeholder látszik
        hours: 0,      // üres => placeholder látszik
        persons: 0,     // üres => placeholder látszik
        unit_price: 0,
        line_total: 0,
        created_at: new Date().toISOString(),
      });
    },
    addRowUni() {
      this.uniPrices.push({
        id: null,
        kerveny_Id: this.event.id,
        service_Id: null,
        service_name: '',
        rate_key: '',
        unit: '',
        hours: 0,
        persons: 0,
        unit_price: 0,
        line_total: 0,
        created_at: new Date().toISOString(),
      });
    },
    // Uni-Famulus fül: Ajánlat elfogadása → ARAJANLAT_KESZITESERE_VAR + lista frissítés
    async acceptOfferFromFamulus() {
      if (!this.event?.id || this.statusChanging) return;
      this.statusChanging = true;
      try {
        const resp = await axios.patch(
          `http://localhost:3000/api/kerveny/${this.event.id}/status`,
          { statusz: 'ARAJANLAT_KESZITESERE_VAR' }
        );
        if (resp.status === 200) {
          this.$emit('status-updated', { ...this.event, statusz: 'ARAJANLAT_KESZITESERE_VAR' });
          this.$emit('refresh-events');
        }
      } catch (e) {
        console.error(e);
        alert('Státusz váltás sikertelen.');
      } finally {
        this.statusChanging = false;
      }
    },
    async generateUniversityQuote() {
      if (!this.event?.id || this.statusChanging) return;
      this.statusChanging = true;
      try {
        const newStatus = 'ARAJANLAT_ELFOGADASRA_VAR';
        const resp = await axios.patch(
          `http://localhost:3000/api/kerveny/${this.event.id}/status`,
          { statusz: newStatus }
        );
        if (resp.status === 200) {
          // Lokális állapot frissítése (azonnali UI visszaigazolás)
          this.event.statusz = newStatus;
          // Szülő értesítése + lista frissítés
          this.$emit('status-updated', { ...this.event, statusz: newStatus });
          this.$emit('refresh-events'); // fetchevents
        }
      } catch (e) {
        console.error('Árajánlat generálása státuszváltás hiba:', e);
        alert('Nem sikerült átállítani a státuszt.');
      } finally {
        this.statusChanging = false;
      }
    },
    // Egyetem fül: Módosítás kérése → Árajánlat készítésére vár
    async requestUniversityOfferChange() {
      if (!this.event?.id || this.statusChanging) return;
      this.statusChanging = true;
      try {
        const newStatus = 'ARAJANLAT_KESZITESERE_VAR';
        const resp = await axios.patch(
          `http://localhost:3000/api/kerveny/${this.event.id}/status`,
          { statusz: newStatus }
        );
        if (resp.status === 200) {
          this.event.statusz = newStatus;
          this.$emit('status-updated', { ...this.event, statusz: newStatus });
          this.$emit('refresh-events'); // fetchevents
        }
      } catch (e) {
        console.error('Egyetemi módosítás státusz hiba:', e);
       alert('Nem sikerült visszaállítani a státuszt.');
      } finally {
       this.statusChanging = false;
      }
  },
    // Módosítás kérése → UF_ARAJANLATRA_VAR (reuse)
    async requestUfOfferChange() {
      // ugyanazt a logikát használjuk, ami már emiteli a refresh-events-et
      await this.acceptUfQuote();
    },
    // ===== ÚJ státusz helper függvények =====
    getStatusLabel(code) {
      return STATUS_MAP[code]?.label || code || 'Ismeretlen';
    },
    getStatusPhase(code) {
      return STATUS_MAP[code]?.phase || '';
    },
    isTerminal(code) {
      return TERMINAL_STATUS_CODES.includes(code);
    },
    getStatusClassFromCode(code) {
      const s = STATUS_MAP[code];
      if (!s) return 'status-unknown';
      return [
        'phase-' + s.phase.toLowerCase(),
        s.terminal ? 'terminal' : ''
      ].join(' ');
    },

    getStatusIcon(code) {
      const phase = this.getStatusPhase(code);
      if (this.isTerminal(code)) return 'fas fa-flag-checkered';
      const iconMap = {
        BEERKEZETT:'fas fa-inbox',
        SZERZODES:'fas fa-file-signature',
        MEGVALOSITAS:'fas fa-tasks',
        ELSZAMOLAS:'fas fa-calculator',
        LEZART:'fas fa-lock'
      };
      return iconMap[phase] || 'fas fa-tag';
    },
    phaseLabel(phase) {
      return PHASE_LABELS[phase] || phase;
    },
    // ========================================

    prepareEditedEventData() {
      if (!this.editedEvent) return;
      const booleanFields = ['sajto','szallasigeny','parkolo','internet','hulladek',
        'oktatastechnika','korlatozott_mozgas','foto','cater','epites',
        'takaritas','takaritas_alatt','vegyi_anyag','tuzveszelyes_tevekenyseg',
        'dekoracio','portaszolgalat','tovabbi_szervezo'];
      booleanFields.forEach(f=>{
        if (typeof this.editedEvent[f] === 'boolean')
          this.editedEvent[f] = this.editedEvent[f] ? 'igen':'nem';
      });
      ['kezdo_datum','veg_datum','epites_kezdet','epites_veg'].forEach(f=>{
        if (this.editedEvent[f]) this.editedEvent[f] = this.formatDateForInput(this.editedEvent[f]);
      });
      if (this.editedEvent.catering_tipus) {
        try { this.editedEvent.catering_tipus = JSON.parse(this.editedEvent.catering_tipus); }
        catch { this.editedEvent.catering_tipus = []; }
      }
    },
    openStatusModal() {
      this.selectedStatus = this.normalizedStatus;
      this.statusModalVisible = true;
    },
    closeStatusModal() {
      this.statusModalVisible = false;
    },
    async changeStatus(newStatus) {
      if (!newStatus) return;
      try {
        const resp = await axios.patch(
          `http://localhost:3000/api/kerveny/${this.event.id}/status`,
          { statusz: newStatus }
        );
        if (resp.status === 200) {
          this.statusModalVisible = false;
          this.$emit('status-updated', { ...this.event, statusz: newStatus });
          if (this.isTerminal(newStatus)) {
            this.$emit('close');
            this.$emit('archived', this.event.id);
          }
        }
      } catch (e) {
        console.error(e);
        alert('Státusz módosítás sikertelen.');
      }
    }, // ===== A RÉGI getStatusText / getStatusClass ELTÁVOLÍTVA =====
    formatDateTime(date, time) {
      if (!date) return 'Nincs megadva';
      const d = new Date(date);
      const formattedDate = d.toLocaleDateString('hu-HU', { year:'numeric', month:'long', day:'numeric' });
      if (time) return `${formattedDate}, ${time.substring(0,5)}`;
      return formattedDate;
    },
    formatCateringType(cateringType) {
      if (!cateringType) return 'Nincs megadva';
      try {
        const types = typeof cateringType === 'string' ? JSON.parse(cateringType) : cateringType;
        return Array.isArray(types) ? types.join(', ') : cateringType;
      } catch {
        return cateringType;
      }
    },
    async saveChanges() {
      try {
        this.isSaving = true;
        this.saveError = null;
        const eventToSave = { ...this.editedEvent };

        if (eventToSave.catering_tipus && Array.isArray(eventToSave.catering_tipus)) {
          const jsonString = JSON.stringify(eventToSave.catering_tipus);
            if (jsonString.length > 300) {
              throw new Error('A catering_tipus mező hossza meghaladja a 300 karaktert.');
            }
          eventToSave.catering_tipus = jsonString;
        }

        const booleanFields = ['sajto','szallasigeny','parkolo','internet','hulladek',
          'oktatastechnika','korlatozott_mozgas','foto','cater','epites',
          'takaritas','takaritas_alatt','vegyi_anyag','tuzveszelyes_tevekenyseg',
          'dekoracio','portaszolgalat','tovabbi_szervezo'];
        booleanFields.forEach(f=>{
          if (eventToSave[f] === 'igen') eventToSave[f] = true;
          else if (eventToSave[f] === 'nem') eventToSave[f] = false;
        });

        ['kezdo_datum','veg_datum','epites_kezdet','epites_veg'].forEach(f=>{
          if (eventToSave[f]) eventToSave[f] = new Date(eventToSave[f]).toISOString();
        });

        const response = await axios.put(
          `http://localhost:3000/api/kerveny/${eventToSave.id}`,
          eventToSave
        );
        this.$emit('event-updated', response.data);
        this.editMode = false;
      } catch (e) {
        console.error(e);
        this.saveError = e.message || 'Nem sikerült menteni a módosításokat.';
      } finally {
        this.isSaving = false;
      }
    },
    formatDateForInput(ds) {
      if (!ds) return '';
      return new Date(ds).toISOString().slice(0,10);
    },
    toggleEditMode() { this.editMode = !this.editMode; },
    cancelEdit() { this.editMode = false; this.prepareEditedEventData(); },
    closeEventDetails() {
      this.$emit('close');
      document.body.style.overflow = '';
    },
    async acceptUfQuote() {
      // Gomb feltételein NEM változtatunk – csak státusz váltás logika
      if (this.statusChanging || !this.event?.id) return;
      this.statusChanging = true;
      try {
        const resp = await axios.patch(
          `http://localhost:3000/api/kerveny/${this.event.id}/status`,
          { statusz: 'UF_ARAJANLATRA_VAR' }
        );
        if (resp.status === 200) {
          // Lokális frissítés emit
          this.$emit('status-updated', { ...this.event, statusz: 'UF_ARAJANLATRA_VAR' });
          // Lista újratöltése (szülő komponensben kezeld @refresh-events)
          this.$emit('refresh-events');
        }
      } catch (e) {
        console.error('Elfogadás státusz váltás hiba:', e);
        alert('Nem sikerült átállítani a státuszt.');
      } finally {
        this.statusChanging = false;
      }
    },

    // ÚJ: elutasítás ugyanazzal a logikával
    async rejectEvent() {
      if (this.statusChanging || !this.event?.id) return;
      this.statusChanging = true;
      try {
        const resp = await axios.patch(
          `http://localhost:3000/api/kerveny/${this.event.id}/status`,
          { statusz: 'ELUTASITVA' }
        );
        if (resp.status === 200) {
          this.$emit('status-updated', { ...this.event, statusz: 'ELUTASITVA' });
          this.$emit('refresh-events');
        }
      } catch (e) {
        console.error('Elutasítás státusz váltás hiba:', e);
        alert('Nem sikerült elutasítani a rendezvényt.');
      } finally {
        this.statusChanging = false;
      }
    },
    async fetchFamulusPrices() {
      this.famulusLoading = true;
      this.famulusError = null;
      try {
        const response = await axios.get(`http://localhost:3000/api/kerveny/famulus/${this.event.id}`);
        this.famulusPrices = response.data;
      } catch (e) {
        this.famulusError = 'Nem sikerült betölteni a famulus árakat.';
      } finally {
        this.famulusLoading = false;
      }
    },
    async fetchUniPrices() {
      this.uniLoading = true;
      this.uniError = null;
      try {
        // Állítsd az endpointot a backendhez (Egyetemi kategóriás sorok)
        // Lehetséges alternatívák:
        // - GET /api/kerveny/egyetem/:id
        // - GET /api/kerveny/prices/:id?category=EGYETEM
        const response = await axios.get(`http://localhost:3000/api/kerveny/egyetem/${this.event.id}`);
        this.uniPrices = response.data;
      } catch (e) {
        this.uniError = 'Nem sikerült betölteni az egyetemi árakat.';
      } finally {
        this.uniLoading = false;
      }
    },
    // ===== Dinamikus táblázat segédek (mértékegység alapján) =====
    normalizeUnit(s) {
      return (s ?? '')
        .toString()
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .trim();
    },
    unitColumnDefs(unitNorm) {
      // csak az adott egységhez kapcsolódó oszlopok
      // minden táblában a "Megnevezés" oszlop fixen megjelenik (service_name)
      const cols = [];
      const add = (key, label, format) => cols.push({ key, label, format });
      if (unitNorm.includes('db/alkalom')) {
        add('quantity', 'Darab');
        add('occasions', 'Alkalom');
      } else if (unitNorm.includes('fo/ora')) {
        add('hours', 'Óra');
        add('persons', 'Fő');
      } else if (unitNorm.includes('nap')) {
        add('days', 'Nap');
      } else if (unitNorm.includes('ora')) {
        add('hours', 'Óra');
      } else if (unitNorm === 'fo' || unitNorm.includes(' fo')) {
        add('persons', 'Fő');
      } else if (unitNorm.includes('alkalom')) {
        add('occasions', 'Alkalom');
      } else if (unitNorm === 'db' || unitNorm.includes(' db')) {
        add('quantity', 'Darab');
      } else {
        // ismeretlen egység → óra × fő a visszaesés
        add('hours', 'Óra'); add('persons', 'Fő');
      }
      add('unit_price', 'Egység ár', 'money');
      add('line_total', 'Teljes Szolgáltatás ára', 'money');
      return cols;
    },
    buildUnitGroups(items) {
      const map = new Map();
      (Array.isArray(items) ? items : []).forEach(r => {
        const unitLabel = r.unit || r.mertekegyseg || '';
        const unitNorm = this.normalizeUnit(unitLabel);
        if (!map.has(unitNorm)) {
          map.set(unitNorm, { unitNorm, unitLabel, rows: [] });
        }
        map.get(unitNorm).rows.push(r);
      });
      return Array.from(map.values()).map(g => ({
        ...g,
        cols: this.unitColumnDefs(g.unitNorm)
      }));
    },
    money(v) {
      const n = Number(v) || 0;
      return n.toLocaleString('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    displayNumber(v) {
      const n = Number(v);
      if (Number.isNaN(n)) return v ?? '';
      // egész számokra nincs tizedes, egyébként 2 tizedes
      return Number.isInteger(n) ? n.toString() : n.toFixed(2);
    },
    openPricingWizard() {
      // Szülő értesítése → wizard megnyitása
      this.$emit('open-pricing-wizard', this.event);
      // Popup teljes bezárása
      this.$emit('close');
      document.body.style.overflow = '';
    },
    onClosePricingWizard() {
      this.pricingWizardVisible = false;
      document.body.style.overflow = '';
      // szándékosan nem állítjuk vissza detailsHidden-t → a popup zárva marad
    }
  }
};
</script>

<style scoped>
/* Alap modal stílusok */
.event-details-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
  overflow-y: auto;
  padding: 22px;
}

.event-details-content {
  background-color: #fff;
  border-radius: 26px;
   max-width: 2000px;
   width: 95%;
   height: 95%;
   overflow-y: auto;
  box-shadow: 0 18px 40px -18px rgba(0,0,0,.35), 0 8px 18px -10px rgba(0,0,0,.2);
   display: flex;
   flex-direction: column;
  position: relative;
}
.event-details-content::before {
  content:'';
  position:absolute;
  inset:0;
  border-radius: 26px;
  pointer-events:none;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.7), inset 0 0 0 2px rgba(0,0,0,.03);
}

/* Széchenyi téma */
.sze-theme { border-top: none; }

.event-details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg,#5a9cff 0%,#0d6efd 60%,#0b5ed7 100%);
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 2;
}

.event-details-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #fff;
  font-weight: 700;
  letter-spacing: .2px;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Státusz badge a kék headeren jól látszódjon */
.status-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}
.event-status {
  display:inline-flex;
  align-items:center;
  gap:.35rem;
  padding:6px 10px;
  border-radius:12px;
  font-size:.78rem;
  font-weight:700;
  background: rgba(255,255,255,.15);
  color:#fff;
}
.event-status i { font-size:.8rem; }

/* Ikon gombok (pill) a fejlécben */
.close-button, .edit-button, .status-change-button {
  background: rgba(255,255,255,.15);
  border: 1px solid rgba(255,255,255,.35);
  cursor: pointer;
  font-size: .95rem;
  color: #fff;
  transition: all .18s ease;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.close-button:hover, .edit-button:hover, .status-change-button:hover {
  transform: translateY(-1px);
  background: rgba(255,255,255,.22);
}

/* Törzs */
.event-details-body {
  padding: 18px 20px;
   flex-grow: 1;
  background:#f7f9ff;
}

/* Tabok – pill stílus */
.nav-tabs { 
  border: none; 
  margin-bottom: 1rem; 
  display:flex; 
  flex-wrap:wrap; 
  gap:.45rem;
}
 .nav-tabs .nav-item { margin-bottom: -1px; }
 .nav-tabs .nav-link {
  border: 1px solid #d7e3f5;
  border-radius: 999px;
  padding: .45rem .9rem;
  margin-right: 0;
  font-weight: 700;
  font-size: .78rem;
  color:#24415f;
  background:#fff;
  transition: all .18s ease;
 }
 .nav-tabs .nav-link:hover, 
 .nav-tabs .nav-link:focus {
  transform: translateY(-1px);
  border-color:#c3d6f1;
 }
 .nav-tabs .nav-link.active {
  color:#0b5ed7;
  background:#eef4ff;
  border-color:#b6cff5;
 }

/* Kártyaszerű tartalmi blokkok */
.tab-content {
  padding: 0;
}
.tab-content .row {
  background:#fff;
  border:1px solid #e8eef9;
  border-radius: 18px;
  padding: 12px 12px 2px 12px;
  box-shadow: 0 4px 10px -6px rgba(0,0,0,.15);
}

/* Lábléc – ragadós, pill gombok */
.event-details-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 10px 12px;
  background:#ffffff;
  border-top:1px solid #e8eef9;
  position: sticky;
  bottom: 0;
  z-index: 2;
}
.footer-left, .footer-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Gombok – pill stílus az alján (csak ebben a komponensben) */
.event-details-footer .btn,
.status-buttons .btn {
  border-radius: 999px;
  font-weight: 700;
  letter-spacing: .3px;
  padding: .5rem 1rem;
  font-size: .82rem;
}

.btn-primary {
  background: linear-gradient(135deg,#3a8bff 0%,#0d6efd 45%,#0b58d0 100%);
  border-color: #0d6efd;
  color:#fff;
}
.btn-primary:hover {
  background: linear-gradient(135deg,#5a9cff 0%,#0b5ed7 50%,#0a4fb6 100%);
  border-color:#0b5ed7;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
  color:#fff;
  border-radius: 999px;
}
.btn-secondary:hover { filter: brightness(0.95); }

/* Light/ghost (fehér háttér, kék keret) */
.pill-light {
  background: #fff;
  color: #0d6efd;
  border-color: #d7e3f5;
  box-shadow: 0 2px 6px -3px rgba(0,0,0,.12);
}
.pill-light:hover {
  background: #eef4ff;
  border-color: #b6cff5;
  transform: translateY(-1px);
}

/* Sötét mód finomítások */
.dark-mode .pill-light {
  background: #242943;
  color: #aecdff;
  border-color: #3d4366;
}
.dark-mode .pill-light:hover {
  background: #273b84;
  border-color: #4256a1;
}
.dark-mode .pill-secondary {
  background: #505a65;
  border-color: #505a65;
}

/* Meglévő státusz színek (test) – változatlanok, csak fentebb a headerhez igazítva már fehér a text */
.phase-beerkezett { background:#fde8cc; color:#a65f00; }
.phase-szerzodes { background:#ffe0e3; color:#9d1d30; }
.phase-megvalositas { background:#d8eefc; color:#05537a; }
.phase-elszamolas { background:#e1f5e8; color:#1f6d3f; }
.phase-lezart { background:#e0e0e0; color:#555; }
.event-status.terminal { box-shadow: inset 0 0 0 1px rgba(0,0,0,.08); }
.status-unknown { background:#ccc; color:#333; }

/* Reszponzív igazítások */
@media (max-width: 768px) {
  .event-details-content { max-height: 95vh; max-width: 95%; }
  .event-details-header h3 { font-size: 1.05rem; }
  .nav-tabs .nav-link { padding: .4rem .75rem; font-size: .74rem; }
}

/* Status modal (belső popup) – lekerekített */
.status-modal {
  position: fixed;        /* overlay a teljes képernyőn */
  inset: 0;
  background: rgba(0,0,0,.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1300;          /* nagyobb mint .event-details-modal (1200) */
}

.status-modal-content {
  background-color: white;
  border-radius: 20px;
  padding: 20px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 18px 40px -18px rgba(0,0,0,.35), 0 8px 18px -10px rgba(0,0,0,.2);
}

/* Szerkesztési mód stílusa */
.edit-mode { padding: 0; }
.edit-tab-content {
  animation: fadeIn 0.3s ease;
  padding-top: 15px;
}

/* Pill gombok – egységes, lekerekített stílus (Chat/DOCX-hoz igazítva) */
.pill-btn {
  --clr-base: #0d6efd;
  --clr-hover: #0b5ed7;
  display: inline-flex;
  align-items: center;
  gap: .45rem;
  padding: .5rem 1rem;
  font-size: .82rem;
  font-weight: 700;
  letter-spacing: .3px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: #fff;
  color: #24415f;
  transition: all .18s ease;
  line-height: 1;
}
.pill-btn i { font-size: .95rem; }
.pill-btn:active { transform: translateY(0); }
.pill-btn[disabled] { opacity: .7; cursor: not-allowed; }

/* Kék elsődleges */
.pill-primary {
  border-color: var(--clr-base);
  color: #fff;
  background: linear-gradient(135deg,#3a8bff 0%,#0d6efd 45%,#0b58d0 100%);
  box-shadow: 0 3px 6px -2px rgba(0,0,0,.25), inset 0 0 0 1px rgba(255,255,255,.12);
}
.pill-primary:hover {
  background: linear-gradient(135deg,#5a9cff 0%,#0b5ed7 50%,#0a4fb6 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px -3px rgba(0,0,0,.35);
}

/* Másodlagos (szürke, tömör) */
.pill-secondary {
  background: #6c757d;
  color: #fff;
  border-color: #6c757d;
  box-shadow: 0 3px 6px -2px rgba(0,0,0,.25), inset 0 0 0 1px rgba(255,255,255,.08);
}
.pill-secondary:hover {
  filter: brightness(0.95);
  transform: translateY(-1px);
}

/* Meglévő (változatlan) részletek és animációk... */
/* ...existing code... */
</style>