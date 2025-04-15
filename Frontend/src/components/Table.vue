<template>
  <div :class="['container-fluid pt-4 px-4 table-container', { expanded: isExpanded }]">
    <div class="bg-light text-center rounded p-4">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <h6 class="mb-0">Rendezvények</h6>
        <div>
          <button @click="toggleExpand" class="btn btn-sm btn-outline-secondary me-2" title="Kinagyítás/Kicsinyítés">
            <i :class="isExpanded ? 'fas fa-compress' : 'fas fa-expand'"></i>
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Betöltés...</span>
        </div>
        <p class="mt-2">Adatok betöltése...</p>
      </div>

      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div v-else class="table-wrapper">
        <div class="table-filters mb-3 d-flex flex-wrap gap-2" v-if="!isExpanded">
          <!-- Keresőmező -->
          <input
            type="text"
            id="filter-name"
            class="form-control form-control-sm flex-grow-1"
            placeholder="Keresés minden adatban"
            v-model="filters.name"
          />

          <!-- Kezdő dátum szűrő -->
          <input
            type="date"
            id="filter-start-date"
            class="form-control form-control-sm"
            v-model="filters.startDate"
          />

          <!-- Helyszín szűrő -->
          <select
            id="filter-location"
            class="form-select form-select-sm"
            v-model="filters.location"
          >
            <option value="">Összes helyszín</option>
            <option v-for="location in uniqueLocations" :key="location" :value="location">
              {{ location }}
            </option>
          </select>

          <!-- Típus szűrő -->
          <select
            id="filter-type"
            class="form-select form-select-sm"
            v-model="filters.type"
          >
            <option value="">Összes típus</option>
            <option v-for="type in uniqueTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>

        <div class="table-scrollable">
          <table class="table text-start align-middle table-bordered table-hover mb-0">
            <thead>
              <tr class="text-dark">
                <th scope="col" @click="sortBy('statusz')" class="sortable-header">
                  Státusz
                  <i v-if="sortColumn === 'statusz'" :class="getSortIconClass()"></i>
                </th>
                <th scope="col" @click="sortBy('nev')" class="sortable-header">
                  Neve
                  <i v-if="sortColumn === 'nev'" :class="getSortIconClass()"></i>
                </th>
                <th scope="col" @click="sortBy('helyszin')" class="sortable-header">
                  Helyszín
                  <i v-if="sortColumn === 'helyszin'" :class="getSortIconClass()"></i>
                </th>
                <th scope="col" @click="sortBy('kezdo_datum')" class="sortable-header">
                  Kezdő Időpont
                  <i v-if="sortColumn === 'kezdo_datum'" :class="getSortIconClass()"></i>
                </th>
                <th scope="col" @click="sortBy('veg_datum')" class="sortable-header">
                  Záró Időpont
                  <i v-if="sortColumn === 'veg_datum'" :class="getSortIconClass()"></i>
                </th>
                <th>Műveletek</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="sortedAndFilteredEvents.length === 0">
                <td colspan="6" class="text-center">Nincs megjeleníthető rendezvény</td>
              </tr>
              <tr
                v-for="event in sortedAndFilteredEvents"
                :key="event.id"
                :class="getStatusClass(getStatusText(event.statusz))"
                @click="showEventDetails(event)"
                style="cursor: pointer;"
              >
                <td style="width: 50px; text-align: center;">
                  <span class="status-icon" :title="getStatusText(event.statusz)">
                    <i :class="getStatusIcon(getStatusText(event.statusz))"></i>
                  </span>
                </td>
                <td>{{ event.nev }}</td>
                <td>{{ event.helyszin }}</td>
                <td>{{ formatDateTime(event.kezdo_datum, event.kezdo_idopont) }}</td>
                <td>{{ formatDateTime(event.veg_datum, event.veg_idopont) }}</td>
                <td class="text-center">
                  <div class="btn-group">
                    <button 
                      class="btn btn-sm btn-outline-primary" 
                      @click.stop="exportDocument(event)" 
                      title="Dokumentum exportálása">
                      <i class="fas fa-file-word"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Esemény részletes popup -->
  <div class="event-details-modal" v-if="selectedEvent" @click.self="closeEventDetails">
    <div class="event-details-content sze-theme" :class="{ 'dark-mode': isDarkMode }">
      <div class="event-details-header">
        <h3>{{ selectedEvent.nev }}</h3>
        <div class="header-controls">
          <div class="status-controls">
            <div class="event-status" :class="getStatusClass(getStatusText(selectedEvent.statusz))">
              {{ getStatusText(selectedEvent.statusz) }}
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
        </ul>

        <!-- Csak olvasható mód -->
        <div v-if="!editMode">
          <!-- Alapadatok lap -->
          <div v-if="activeTab === 'basic'" class="tab-content">
            <h4>Alapinformációk</h4>
            <div class="row">
              <div class="col-md-6">
                <p><strong>Rendezvény neve:</strong> {{ selectedEvent.nev }}</p>
                <p><strong>Helyszín:</strong> {{ selectedEvent.helyszin }}</p>
                <p><strong>Cím:</strong> {{ selectedEvent.cim || 'Nincs megadva' }}</p>
                <p><strong>Kezdés:</strong> {{ formatDateTime(selectedEvent.kezdo_datum, selectedEvent.kezdo_idopont) }}</p>
                <p><strong>Befejezés:</strong> {{ formatDateTime(selectedEvent.veg_datum, selectedEvent.veg_idopont) }}</p>
              </div>
              <div class="col-md-6">
                <p><strong>Típus:</strong> {{ selectedEvent.tipus || 'Nincs megadva' }}</p>
                <p><strong>Minősítés:</strong> {{ selectedEvent.minosites || 'Nincs megadva' }}</p>
                <p><strong>Sajtónyilvános:</strong> {{ selectedEvent.sajto ? 'Igen' : 'Nem' }}</p>
                <p><strong>Várható létszám:</strong> {{ selectedEvent.letszam || 'Nincs megadva' }} fő</p>
              </div>
            </div>
            <div class="row mt-3">
              <div class="col-12">
                <p><strong>Leírás:</strong></p>
                <p>{{ selectedEvent.leiras || 'Nincs megadva' }}</p>
              </div>
            </div>
          </div>

          <!-- Részletes adatok lap -->
          <div v-if="activeTab === 'details'" class="tab-content">
            <h4>Részletes adatok</h4>
            <div class="row">
              <div class="col-md-6">
                <p><strong>Rendezvény jellege:</strong> {{ selectedEvent.jelleg || 'Nincs megadva' }}</p>
                <p><strong>Programterv:</strong> {{ selectedEvent.programterv || 'Nincs megadva' }}</p>
                <p><strong>Berendezési mód:</strong> {{ selectedEvent.berendezesi_mod || 'Nincs megadva' }}</p>
                <p><strong>Szállásigény:</strong> {{ selectedEvent.szallasigeny ? 'Igen' : 'Nem' }}</p>
                <p v-if="selectedEvent.szallasigeny"><strong>Szállásigény létszáma:</strong> {{ selectedEvent.szallasigeny_letszam || 'Nincs megadva' }} fő</p>
              </div>
              <div class="col-md-6">
                <p><strong>Parkoló:</strong> {{ selectedEvent.parkolo ? 'Igen' : 'Nem' }}</p>
                <p v-if="selectedEvent.parkolo"><strong>Parkoló részletek:</strong> {{ selectedEvent.parkolo_reszletek || 'Nincs megadva' }}</p>
                <p><strong>Internet:</strong> {{ selectedEvent.internet ? 'Igen' : 'Nem' }}</p>
                <p><strong>Oktatástechnika:</strong> {{ selectedEvent.oktatastechnika ? 'Igen' : 'Nem' }}</p>
                <p v-if="selectedEvent.oktatastechnika"><strong>Oktatástechnikai eszközök:</strong> {{ selectedEvent.oktatas_eszkozok || 'Nincs megadva' }}</p>
              </div>
            </div>
            <div class="row mt-3">
              <div class="col-md-6">
                <p><strong>Fotó/videó készül:</strong> {{ selectedEvent.foto ? 'Igen' : 'Nem' }}</p>
                <p v-if="selectedEvent.foto"><strong>Fotó/videó részletek:</strong> {{ selectedEvent.foto_reszletek || 'Nincs megadva' }}</p>
                <p><strong>Catering:</strong> {{ selectedEvent.cater ? 'Igen' : 'Nem' }}</p>
                <p v-if="selectedEvent.cater"><strong>Catering típusa:</strong> {{ formatCateringType(selectedEvent.catering_tipus) }}</p>
              </div>
              <div class="col-md-6">
                <p><strong>Építés:</strong> {{ selectedEvent.epites ? 'Igen' : 'Nem' }}</p>
                <p v-if="selectedEvent.epites"><strong>Építés kezdete:</strong> {{ formatDateTime(selectedEvent.epites_kezdet, null) }}</p>
                <p v-if="selectedEvent.epites"><strong>Építés vége:</strong> {{ formatDateTime(selectedEvent.epites_veg, null) }}</p>
                <p v-if="selectedEvent.epites"><strong>Alvállalkozók:</strong> {{ selectedEvent.epites_vallalkozok || 'Nincs megadva' }}</p>
              </div>
            </div>
            <div class="row mt-3">
              <div class="col-md-6">
                <p><strong>Korlátozott mozgású személyek:</strong> {{ selectedEvent.korlatozott_mozgas ? 'Igen' : 'Nem' }}</p>
                <p v-if="selectedEvent.korlatozott_mozgas"><strong>Részletek:</strong> {{ selectedEvent.korlatozott_mozgas_reszletek || 'Nincs megadva' }}</p>
                <p><strong>Hulladék:</strong> {{ selectedEvent.hulladek ? 'Igen' : 'Nem' }}</p>
                <p v-if="selectedEvent.hulladek"><strong>Hulladék elszállítás módja:</strong> {{ selectedEvent.hulladek_elszallitas_modja || 'Nincs megadva' }}</p>
                <p v-if="selectedEvent.hulladek"><strong>Hulladék elszállítás felelős:</strong> {{ selectedEvent.hulladek_elszallitas_felelos || 'Nincs megadva' }}</p>
              </div>
              <div class="col-md-6">
                <p><strong>Villanyszerelői ügyelet:</strong> {{ selectedEvent.villanyszerelo || 'Nincs megadva' }}</p>
                <p><strong>Áramigény:</strong> {{ selectedEvent.aramigeny ? 'Igen' : 'Nem' }}</p>
                <p><strong>Légszennyezés típusa:</strong> {{ selectedEvent.leg_szennyezes || 'Nincs megadva' }}</p>
                <p v-if="selectedEvent.leg_szennyezes === 'egyéb'"><strong>Egyéb tevékenység:</strong> {{ selectedEvent.egyeb_tevekenyseg || 'Nincs megadva' }}</p>
              </div>
            </div>
          </div>

          <!-- Szervező lap -->
          <div v-if="activeTab === 'organizer'" class="tab-content">
            <h4>Szervező adatai</h4>
            <div class="row">
              <div class="col-md-6">
                <p><strong>Név:</strong> {{ selectedEvent.felelos || 'Nincs megadva' }}</p>
                <p><strong>Email:</strong> {{ selectedEvent.email || 'Nincs megadva' }}</p>
                <p><strong>Telefonszám:</strong> {{ selectedEvent.telefon || 'Nincs megadva' }}</p>
              </div>
              <div class="col-md-6">
                <p><strong>Lakcím:</strong> {{ selectedEvent.lakcim || 'Nincs megadva' }}</p>
                <p><strong>További szervező:</strong> {{ selectedEvent.tovabbi_szervezo ? 'Igen' : 'Nem' }}</p>
              </div>
            </div>
            <div v-if="selectedEvent.tovabbi_szervezo" class="row mt-3">
              <div class="col-12">
                <h5>További szervező adatai</h5>
              </div>
              <div class="col-md-6">
                <p><strong>Név:</strong> {{ selectedEvent.tovabbi_nev || 'Nincs megadva' }}</p>
                <p><strong>Email:</strong> {{ selectedEvent.tovabbi_email || 'Nincs megadva' }}</p>
                <p><strong>Telefonszám:</strong> {{ selectedEvent.tovabbi_telefon || 'Nincs megadva' }}</p>
              </div>
              <div class="col-md-6">
                <p><strong>Lakcím:</strong> {{ selectedEvent.tovabbi_lakcim || 'Nincs megadva' }}</p>
                <p><strong>Neptun kód:</strong> {{ selectedEvent.tovabbi_neptun || 'Nincs megadva' }}</p>
              </div>
            </div>
          </div>

          <!-- Megrendelő lap -->
          <div v-if="activeTab === 'client'" class="tab-content">
            <h4>Megrendelő adatai</h4>
            <div class="row">
              <div class="col-md-6">
                <p><strong>Név/Cégnév:</strong> {{ selectedEvent.megrendelo_nev || 'Nincs megadva' }}</p>
                <p><strong>Cím:</strong> {{ selectedEvent.megrendelo_cim || 'Nincs megadva' }}</p>
                <p><strong>Adószám:</strong> {{ selectedEvent.megrendelo_ado || 'Nincs megadva' }}</p>
              </div>
              <div class="col-md-6">
                <p><strong>Email:</strong> {{ selectedEvent.megrendelo_email || 'Nincs megadva' }}</p>
                <p><strong>Telefonszám:</strong> {{ selectedEvent.megrendelo_telefon || 'Nincs megadva' }}</p>
              </div>
            </div>
          </div>
        </div>

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
        <button v-if="editMode" class="btn btn-secondary" @click="cancelEdit">Mégsem</button>
        <button v-if="editMode" class="btn btn-primary" @click="saveChanges" :disabled="isSaving">
          <span v-if="isSaving">
            <i class="fas fa-spinner fa-spin me-1"></i> Mentés...
          </span>
          <span v-else>Mentés</span>
        </button>
        <button v-if="!editMode" class="btn btn-secondary" @click="closeEventDetails">Bezárás</button>
        <button v-if="!editMode" class="btn btn-primary" @click="toggleEditMode">Szerkesztés</button>
      </div>
      
      <div v-if="saveError" class="alert alert-danger mt-3">
        {{ saveError }}
      </div>
    </div>
  </div>

  <!-- Státusz módosító popup -->
  <div class="status-modal" v-if="statusModalVisible" @click.self="statusModalVisible = false">
    <div class="status-modal-content">
      <h3>Státusz módosítása</h3>
      <div class="status-options">
        <div class="status-option" v-for="status in [0, 1, 2, 3]" :key="status">
          <input
            type="radio"
            :id="'status-' + status"
            :value="status"
            v-model="selectedStatus"
          />
          <label :for="'status-' + status" class="status-label" :class="getStatusClass(getStatusText(status))">
            {{ getStatusText(status) }}
          </label>
        </div>
      </div>
      <div class="status-buttons">
        <button class="btn btn-secondary" @click="statusModalVisible = false">Mégse</button>
        <button class="btn btn-primary" @click="changeStatus(selectedStatus)">Mentés</button>
      </div>
    </div>
  </div>

  <!-- Opcionális - Exportálási állapot jelző -->
  <div v-if="exportStatus.isLoading" class="position-fixed bottom-0 end-0 p-3">
    <div class="toast show" role="alert">
      <div class="toast-header">
        <strong class="me-auto">Dokumentum exportálása</strong>
      </div>
      <div class="toast-body">
        <div class="d-flex align-items-center">
          <div class="spinner-border spinner-border-sm me-2" role="status"></div>
          Dokumentum generálása folyamatban...
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    isDarkMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedStatus: null,
      statusModalVisible: false,
      events: [],
      loading: true,
      error: null,
      isExpanded: false,
      filters: {
        name: '',
        startDate: '',
        location: '',
        type: ''
      },
      sortColumn: 'kezdo_datum',
      sortDirection: 'asc',
      selectedEvent: null,
      activeTab: 'basic',
      editMode: false,
      editedEvent: {},
      isSaving: false,
      saveError: null,
      exportStatus: {
        isLoading: false,
        error: null
      }
    };
  },
  computed: {
    uniqueLocations() {
      return [...new Set(this.events.map(event => event.helyszin).filter(Boolean))];
    },
    uniqueTypes() {
      return [...new Set(this.events.map(event => event.tipus).filter(Boolean))];
    },
    sortedAndFilteredEvents() {
      let filteredEvents = [...this.events];
      
      // Név/leírás szűrés
      if (this.filters.name) {
        const searchTerm = this.filters.name.toLowerCase();
        filteredEvents = filteredEvents.filter(event => {
          return (
            (event.nev && event.nev.toLowerCase().includes(searchTerm)) ||
            (event.leiras && event.leiras.toLowerCase().includes(searchTerm)) ||
            (event.helyszin && event.helyszin.toLowerCase().includes(searchTerm)) ||
            (event.tipus && event.tipus.toLowerCase().includes(searchTerm))
          );
        });
      }
      
      // Kezdő dátum szűrés
      if (this.filters.startDate) {
        const filterDate = new Date(this.filters.startDate);
        filteredEvents = filteredEvents.filter(event => {
          if (!event.kezdo_datum) return false;
          const eventStartDate = new Date(event.kezdo_datum);
          return eventStartDate >= filterDate;
        });
      }
      
      // Helyszín szűrés
      if (this.filters.location) {
        filteredEvents = filteredEvents.filter(event => {
          return event.helyszin === this.filters.location;
        });
      }
      
      // Típus szűrés
      if (this.filters.type) {
        filteredEvents = filteredEvents.filter(event => {
          return event.tipus === this.filters.type;
        });
      }
      
      // Rendezés
      return filteredEvents.sort((a, b) => {
        let aValue = a[this.sortColumn];
        let bValue = b[this.sortColumn];
        
        // Dátum mezők kezelése
        if (this.sortColumn === 'kezdo_datum' || this.sortColumn === 'veg_datum') {
          aValue = aValue ? new Date(aValue) : new Date(0);
          bValue = bValue ? new Date(bValue) : new Date(0);
        }
        
        // Szöveges mezők kezelése
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        
        // Rendezési irány figyelembevétele
        if (this.sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }
  },
  methods: {
    async fetchEvents() {
      try {
        this.loading = true;
        this.error = null;
        const response = await axios.get('http://localhost:3000/api/kerveny');
        this.events = response.data;
      } catch (err) {
        console.error('Hiba az adatok lekérdezése során:', err);
        this.error = 'Nem sikerült betölteni az adatokat. Kérjük, próbálja újra később!';
      } finally {
        this.loading = false;
      }
    },
    
    sortBy(column) {
      if (this.sortColumn === column) {
        // Már eszerint a mező szerint rendez, váltás a rendezési irányban
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        // Új mező szerint rendez, alapértelmezett irány: növekvő
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
    },
    
    getSortIconClass() {
      return this.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    },
    
    toggleExpand() {
      this.isExpanded = !this.isExpanded;
      const container = document.querySelector('.table-container');
      if (this.isExpanded) {
        container.style.width = '100vw';
        container.style.maxWidth = '100vw';
        container.style.marginLeft = '0';
        container.style.marginRight = '0';
        container.style.paddingLeft = '0';
        container.style.paddingRight = '0';
      } else {
        container.style.width = '';
        container.style.maxWidth = '';
        container.style.marginLeft = '';
        container.style.marginRight = '';
        container.style.paddingLeft = '';
        container.style.paddingRight = '';
      }
    },
    
    showEventDetails(event) {
      this.selectedEvent = { ...event };
      this.editedEvent = { ...event };
      this.activeTab = 'basic';
      this.editMode = false;
      document.body.style.overflow = 'hidden';
    },
    
    closeEventDetails() {
      this.selectedEvent = null;
      this.editMode = false;
      document.body.style.overflow = '';
    },
    
    toggleEditMode() {
      if (!this.editMode) {
        // Másolat készítése a szerkesztéshez
        this.editedEvent = JSON.parse(JSON.stringify(this.selectedEvent));
        this.activeTab = 'basic'; // Alapértelmezetten az alapadatok fül

        // Boolean konverzió radio button értékekké
        const booleanFields = ['sajto', 'szallasigeny', 'parkolo', 'internet', 'hulladek', 
            'oktatastechnika', 'korlatozott_mozgas', 'foto', 'cater', 'epites',
            'takaritas', 'takaritas_alatt', 'vegyi_anyag', 'tuzveszelyes_tevekenyseg', 
            'dekoracio', 'portaszolgalat', 'tovabbi_szervezo'];
            
        booleanFields.forEach(field => {
            if (typeof this.editedEvent[field] === 'boolean') {
                this.editedEvent[field] = this.editedEvent[field] ? 'igen' : 'nem';
            }
        });

        // Formázd a dátum mezőket a megfelelő formátumra
        if (this.editedEvent.kezdo_datum) {
            this.editedEvent.kezdo_datum = this.formatDateForInput(this.editedEvent.kezdo_datum);
        }
        if (this.editedEvent.veg_datum) {
            this.editedEvent.veg_datum = this.formatDateForInput(this.editedEvent.veg_datum);
        }
        if (this.editedEvent.epites_kezdet) {
            this.editedEvent.epites_kezdet = this.formatDateForInput(this.editedEvent.epites_kezdet);
        }
        if (this.editedEvent.epites_veg) {
            this.editedEvent.epites_veg = this.formatDateForInput(this.editedEvent.epites_veg);
        }

        // Formázd vissza a catering_tipus mezőt tömbbé
        if (this.editedEvent.catering_tipus) {
            try {
                this.editedEvent.catering_tipus = JSON.parse(this.editedEvent.catering_tipus);
            } catch (e) {
                console.error('Hiba a catering_tipus formázása során:', e);
                this.editedEvent.catering_tipus = [];
            }
        }
      }
      this.editMode = !this.editMode;
    },
    
    cancelEdit() {
      this.editMode = false;
      this.editedEvent = { ...this.selectedEvent };
    },
    
    openStatusModal() {
      this.selectedStatus = this.selectedEvent.statusz;
      this.statusModalVisible = true;
    },
    
    async changeStatus(newStatus) {
      if (!this.selectedEvent) return;

      try {
        // Csak a státuszt módosítjuk, más adatot nem érintünk
        const response = await axios.patch(
          `http://localhost:3000/api/kerveny/${this.selectedEvent.id}/status`,
          { statusz: newStatus }
        );

        if (response.status === 200) {
          this.selectedEvent.statusz = newStatus;
          await this.fetchEvents(); // Frissíti a táblázat adatait
          this.statusModalVisible = false;
        }
      } catch (error) {
        console.error('Hiba a státusz módosítása során:', error);
        alert('Nem sikerült módosítani a státuszt. Próbálja újra később!');
      }
    },
    
    formatDateTime(date, time) {
      if (!date) return 'Nincs megadva';
      
      const formattedDate = new Date(date).toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (time) {
        return `${formattedDate}, ${time.substring(0, 5)}`;
      }
      
      return formattedDate;
    },
    
    formatCateringType(cateringType) {
      if (!cateringType) return 'Nincs megadva';
      
      try {
        const types = JSON.parse(cateringType);
        return Array.isArray(types) ? types.join(', ') : cateringType;
      } catch (e) {
        return cateringType;
      }
    },
    
    getStatusText(statusId) {
      const statusMap = {
        0: 'Feldolgozás alatt',
        1: 'Elfogadásra vár',
        2: 'Elfogadva',
        3: 'Elutasítva'
      };
      
      return statusMap[statusId] || 'Ismeretlen';
    },
    
    getStatusClass(statusText) {
      const classMap = {
        'Feldolgozás alatt': 'status-processing',
        'Elfogadásra vár': 'status-pending',
        'Elfogadva': 'status-approved',
        'Elutasítva': 'status-rejected'
      };
      
      return classMap[statusText] || '';
    },
    
    getStatusIcon(statusText) {
      const iconMap = {
        'Feldolgozás alatt': 'fas fa-spinner fa-pulse',
        'Elfogadásra vár': 'fas fa-clock',
        'Elfogadva': 'fas fa-check-circle',
        'Elutasítva': 'fas fa-times-circle'
      };
      return iconMap[statusText] || 'fas fa-question-circle';
    },
    
    async saveChanges() {
      try {
        this.isSaving = true;
        this.saveError = null;

        // Készíts másolatot az API híváshoz
        const eventToSave = { ...this.editedEvent };

        // Ellenőrizd a catering_tipus hosszát és formázd JSON stringgé
        if (eventToSave.catering_tipus && Array.isArray(eventToSave.catering_tipus)) {
          const jsonString = JSON.stringify(eventToSave.catering_tipus);
          if (jsonString.length > 300) {
            throw new Error('A catering_tipus mező hossza meghaladja a 300 karaktert.');
          }
          eventToSave.catering_tipus = jsonString; // Formázás JSON stringgé
        }

        // Boolean konverziók visszafelé
        const booleanFields = ['sajto', 'szallasigeny', 'parkolo', 'internet', 'hulladek', 
          'oktatastechnika', 'korlatozott_mozgas', 'foto', 'cater', 'epites',
          'takaritas', 'takaritas_alatt', 'vegyi_anyag', 'tuzveszelyes_tevekenyseg', 
          'dekoracio', 'portaszolgalat', 'tovabbi_szervezo'];
          
        booleanFields.forEach(field => {
          if (eventToSave[field] === 'igen') {
            eventToSave[field] = true;
          } else if (eventToSave[field] === 'nem') {
            eventToSave[field] = false;
          }
        });

        // Alakítsd vissza a dátumokat ISO 8601 formátumra
        if (eventToSave.kezdo_datum) {
          eventToSave.kezdo_datum = new Date(eventToSave.kezdo_datum).toISOString();
        }
        if (eventToSave.veg_datum) {
          eventToSave.veg_datum = new Date(eventToSave.veg_datum).toISOString();
        }
        if (eventToSave.epites_kezdet) {
          eventToSave.epites_kezdet = new Date(eventToSave.epites_kezdet).toISOString();
        }
        if (eventToSave.epites_veg) {
          eventToSave.epites_veg = new Date(eventToSave.epites_veg).toISOString();
        }

        // API hívás a módosításhoz
        const response = await axios.put(
          `http://localhost:3000/api/kerveny/${eventToSave.id}`,
          eventToSave
        );

        console.log('Sikeres frissítés:', response.data);

        // Frissítsd a selectedEvent objektumot, hogy a popup a frissített adatokat mutassa
        this.selectedEvent = { ...response.data };
        
        // Frissítsd a szerkesztett adatokat is
        this.editedEvent = { ...response.data };
        
        // Boolean konverzió radio button értékekké (a frissített adatokhoz)
        booleanFields.forEach(field => {
          if (typeof this.editedEvent[field] === 'boolean') {
            this.editedEvent[field] = this.editedEvent[field] ? 'igen' : 'nem';
          }
        });
        
        // Dátumok formázása input mezőknek (a frissített adatokhoz)
        if (this.editedEvent.kezdo_datum) {
          this.editedEvent.kezdo_datum = this.formatDateForInput(this.editedEvent.kezdo_datum);
        }
        if (this.editedEvent.veg_datum) {
          this.editedEvent.veg_datum = this.formatDateForInput(this.editedEvent.veg_datum);
        }
        if (this.editedEvent.epites_kezdet) {
          this.editedEvent.epites_kezdet = this.formatDateForInput(this.editedEvent.epites_kezdet);
        }
        if (this.editedEvent.epites_veg) {
          this.editedEvent.epites_veg = this.formatDateForInput(this.editedEvent.epites_veg);
        }

        // Formázd vissza a catering_tipus mezőt tömbbé (a frissített adatokhoz)
        if (this.editedEvent.catering_tipus) {
          try {
            this.editedEvent.catering_tipus = JSON.parse(this.editedEvent.catering_tipus);
          } catch (e) {
            console.error('Hiba a catering_tipus formázása során:', e);
            this.editedEvent.catering_tipus = [];
          }
        }

        // Frissítsd az események listáját
        await this.fetchEvents();

        this.editMode = false; // Kilépés a szerkesztési módból
      } catch (error) {
        console.error('Hiba a mentés során:', error);
        this.saveError = error.message || 'Nem sikerült menteni a módosításokat.';
      } finally {
        this.isSaving = false;
      }
    },
    
    formatDateForInput(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().slice(0, 10);
    },

    async exportDocument(event) {
      try {
        const response = await fetch('http://localhost:3000/api/document/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: event, // Az esemény adatai
          }),
        });
    
        if (!response.ok) {
          throw new Error('Dokumentum generálás sikertelen');
        }
    
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${event.nev || 'dokumentum'}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Hiba a dokumentum generálása során:', err);
        alert('Hiba történt a dokumentum generálása során.');
      }
    }
  },
  mounted() {
    this.fetchEvents();
  }
};
</script>

<style scoped>
/* Táblázat stílusok */
.table-container {
  transition: all 0.3s ease;
}

.table-container.expanded {
  width: 100vw !important;
  max-width: 100vw !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  transition: all 0.3s ease;
}
.table-scrollable {
  overflow-x: auto;
}

.sortable-header {
  cursor: pointer;
  user-select: none;
  position: relative;
}

.sortable-header i {
  margin-left: 5px;
}

.status-icon {
  font-size: 16px;
}

/* Alap modal stílusok */
.event-details-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
  overflow-y: auto;
  padding: 20px;
}

.event-details-content {
  background-color: #fff;
  border-radius: 8px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

/* Széchenyi téma */
.sze-theme {
  border-top: 5px solid #50adc9;
}

.event-details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #dee2e6;
  background-color: #f8f9fa;
}

.event-details-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #242943;
  font-weight: 600;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.event-status {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-processing {
  background-color: #f0ad4e;
  color: white;
}

.status-pending {
  background-color: #6c757d; /* Szürke szín a korábbi kék (#5bc0de) helyett */
  color: white;
}

/* Icon színek is módosítva */
.status-pending .status-icon {
  background-color: rgba(108, 117, 125, 0.15); /* Szürke szín transparensebb változata */
  color: white; /* Szürke szín az ikonhoz */
}

.status-approved {
  background-color: #5cb85c;
  color: white;
}

.status-rejected {
  background-color: #d9534f;
  color: white;
}

.close-button, .edit-button, .status-change-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: #6c757d;
  transition: color 0.2s;
}

.close-button:hover, .edit-button:hover, .status-change-button:hover {
  color: #242943;
}

.event-details-body {
  padding: 20px;
  flex-grow: 1;
}

.tab-content {
  padding: 15px 0;
}

.tab-content h4 {
  color: #242943;
  margin-bottom: 20px;
  font-weight: 600;
  font-size: 1.25rem;
  border-bottom: 2px solid #50adc9;
  padding-bottom: 8px;
  display: inline-block;
}

.tab-content h5 {
  color: #242943;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 15px;
}

.tab-content p {
  margin-bottom: 10px;
  line-height: 1.5;
}

.tab-content strong {
  font-weight: 600;
  color: #444;
}

.event-details-footer {
  padding: 15px 20px;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background-color: #f8f9fa;
}

/* Széchenyi színek a gomboknak */
.btn-primary {
  background-color: #50adc9;
  border-color: #50adc9;
}

.btn-primary:hover {
  background-color: #3d8ca1;
  border-color: #3d8ca1;
}

.nav-tabs .nav-link {
  color: #6c757d;
  cursor: pointer;
}

.nav-tabs .nav-link.active {
  color: #242943;
  font-weight: 500;
  border-bottom-color: #50adc9;
  border-bottom-width: 2px;
}

/* Státusz módosító modal */
.status-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1300;
}

.status-modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.status-modal-content h3 {
  margin-top: 0;
  color: #242943;
  font-weight: 600;
  margin-bottom: 20px;
}

.status-options {
  margin-bottom: 20px;
}

.status-option {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.status-option input[type="radio"] {
  margin-right: 10px;
}

.status-label {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.875rem;
}

.status-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Szerkesztési mód stílusa */
.edit-mode {
  padding: 0;
}

.edit-tab-content {
  animation: fadeIn 0.3s ease;
  padding-top: 15px;
}

/* Sötét mód */
.dark-mode {
  background-color: #242943;
  color: #e4e6eb;
}

.dark-mode .event-details-header,
.dark-mode .event-details-footer {
  background-color: #1a1e33;
  border-color: #2c3153;
}

.dark-mode .event-details-header h3,
.dark-mode .tab-content h4,
.dark-mode .tab-content h5,
.dark-mode .tab-content strong {
  color: #e4e6eb;
}

/* Reszponzív igazítások */
@media (max-width: 768px) {
  .event-details-content {
    max-height: 95vh;
    max-width: 95%;
  }
  
  .event-details-header h3 {
    font-size: 1.25rem;
  }
  
  .tab-content h4 {
    font-size: 1.1rem;
  }
  
  .tab-content h5 {
    font-size: 1rem;
  }
}

/* Form elemek stílusai */
.form-control {
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 0.375rem 0.75rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  border-color: #50adc9;
  box-shadow: 0 0 0 0.25rem rgba(80, 173, 201, 0.25);
}

.form-select {
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 0.375rem 2.25rem 0.375rem 0.75rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-select:focus {
  border-color: #50adc9;
  box-shadow: 0 0 0 0.25rem rgba(80, 173, 201, 0.25);
}

/* Radio és checkbox stílusok */
.form-check {
  display: block;
  min-height: 1.5rem;
  padding-left: 1.5em;
  margin-bottom: 0.125rem;
}

.form-check-input {
  width: 1em;
  height: 1em;
  margin-top: 0.25em;
  vertical-align: top;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.25);
}

.form-check-input:checked {
  background-color: #50adc9;
  border-color: #50adc9;
}

.form-check-label {
  margin-bottom: 0;
}

/* Szerkesztési mód animációk */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Tab navigáció kijavított stílusai */
.nav-tabs {
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 1rem;
}

.nav-tabs .nav-item {
  margin-bottom: -1px;
}

.nav-tabs .nav-link {
  border: 1px solid transparent;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  padding: 0.5rem 1rem;
  margin-right: 0.25rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;
}

.nav-tabs .nav-link:hover, 
.nav-tabs .nav-link:focus {
  border-color: #e9ecef #e9ecef #dee2e6;
  isolation: isolate;
}

.nav-tabs .nav-link.active {
  color: #242943;
  background-color: #fff;
  border-color: #dee2e6 #dee2e6 #fff;
  border-bottom-width: 2px;
  border-bottom-color: #50adc9;
}

/* Szerkesztő űrlap csoportok */
.edit-tab-content .row {
  margin-bottom: 1rem;
}

.edit-tab-content label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #212529;
}

.edit-tab-content textarea {
  min-height: 100px;
  resize: vertical;
}

.edit-tab-content .d-flex.gap-3 {
  display: flex;
  gap: 1rem;
}

/* Hibaüzenetek */
.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Mentés közben animáció */
.saving-indicator {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Sötét mód kiegészítő stílusok */
.dark-mode .form-control,
.dark-mode .form-select {
  background-color: #2c3153;
  border-color: #3d4366;
  color: #e4e6eb;
}

.dark-mode .form-control:focus,
.dark-mode .form-select:focus {
  border-color: #50adc9;
  box-shadow: 0 0 0 0.25rem rgba(80, 173, 201, 0.25);
  background-color: #242943;
}

.dark-mode .form-check-input {
  background-color: #2c3153;
  border-color: #3d4366;
}

.dark-mode .form-check-input:checked {
  background-color: #50adc9;
  border-color: #50adc9;
}

.dark-mode label {
  color: #e4e6eb;
}

.dark-mode .nav-tabs {
  border-bottom-color: #3d4366;
}

.dark-mode .nav-tabs .nav-link.active {
  color: #e4e6eb;
  background-color: #242943;
  border-color: #3d4366 #3d4366 #242943;
}

.dark-mode .edit-tab-content label {
  color: #e4e6eb;
}

/* Reszponzivitás kiegészítések */
@media (max-width: 576px) {
  .edit-tab-content .col-md-6 {
    width: 100%;
  }
  
  .d-flex.gap-3 {
    flex-direction: column;
    gap: 0.5rem !important;
  }
  
  .edit-tab-content label {
    font-size: 0.9rem;
  }
  
  .form-control, 
  .form-select {
    font-size: 0.9rem;
  }
  
  .nav-tabs .nav-link {
    padding: 0.4rem 0.75rem;
    font-size: 0.9rem;
  }
}

/* Státusz szövegek és ikonok színezése */
.status-processing .status-icon,
.status-processing {
  color: #f0ad4e; /* Narancssárga szín */
}

.status-pending .status-icon,
.status-pending {
  color: #6c757d; /* Szürke szín */
}

.status-approved .status-icon,
.status-approved {
  color: #5cb85c; /* Zöld szín */
}

.status-rejected .status-icon,
.status-rejected {
  color: #d9534f; /* Piros szín */
}

/* Táblázat cellák háttérszíne fehér marad */
.table-scrollable table tbody tr td {
  background-color: #ffffff; /* Fehér háttér */
}

/* Általános ikon stílusok */
.status-icon {
  font-size: 20px; /* Ikon mérete */
  color: inherit; /* Örökölje a színt a szülő osztályból */
  display: inline-block;
  vertical-align: middle;
}

/* Specifikus státusz ikon színek */
.status-processing .status-icon {
  color: #f0ad4e; /* Narancssárga */
}

.status-pending .status-icon {
  color: #6c757d; /* Szürke */
}

.status-approved .status-icon {
  color: #5cb85c; /* Zöld */
}

.status-rejected .status-icon {
  color: #d9534f; /* Piros */
}

.event-details-header .close-button {
  display: none;
}

/* Popup státusz színezése */
.event-details-modal .event-status.status-processing {
  background-color: #f0ad4e; /* Narancssárga */
  color: white;
}

.event-details-modal .event-status.status-pending {
  background-color: #6c757d; /* Szürke */
  color: white;
}

.event-details-modal .event-status.status-approved {
  background-color: #5cb85c; /* Zöld */
  color: white;
}

.event-details-modal .event-status.status-rejected {
  background-color: #d9534f; /* Piros */
  color: white;
}

/* Státusz módosító modal szöveg színezése */
.status-modal-content .status-label {
  color: white; /* Szöveg színe fehér */
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 4px;
  display: inline-block;
}

/* Színek a státuszokhoz */
.status-modal-content .status-label.status-processing {
  background-color: #f0ad4e; /* Narancssárga */
}

.status-modal-content .status-label.status-pending {
  background-color: #6c757d; /* Szürke */
}

.status-modal-content .status-label.status-approved {
  background-color: #5cb85c; /* Zöld */
}

.status-modal-content .status-label.status-rejected {
  background-color: #d9534f; /* Piros */
}
</style>