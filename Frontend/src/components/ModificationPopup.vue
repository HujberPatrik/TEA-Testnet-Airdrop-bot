<template>
  <!-- Esemény részletes popup -->
  <div class="event-details-modal" v-if="event" @click.self="closeEventDetails">
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
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'famulus' }" @click.prevent="activeTab = 'famulus'" href="#">Uni-Famulus</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'uni' }" @click.prevent="activeTab = 'uni'" href="#">Egyetem</a>
          </li>
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
        <!-- Uni-Famulus lap -->
        <div v-if="activeTab === 'famulus'" class="tab-content">
          <div class="row mt-4">
            <div class="col-12">
              <h5>Famulus árlista</h5>
              <div v-if="famulusLoading">Árak betöltése...</div>
              <div v-else-if="famulusError" class="text-danger">{{ famulusError }}</div>

              <div v-else>
                <div v-for="grp in famulusGroups" :key="'fam-'+grp.unitNorm" class="mb-4">
                  <h6 class="mb-2">Mértékegység: <strong>{{ grp.unitLabel || '—' }}</strong></h6>
                  <table class="table table-bordered table-sm">
                    <thead>
                      <tr>
                        <th>Megnevezés</th>
                        <th v-for="c in grp.cols" :key="c.key">{{ c.label }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in grp.rows" :key="row.id">
                        <td>{{ row.service_name || row.megnevezes }}</td>
                        <td v-for="c in grp.cols" :key="c.key">
                          <span v-if="c.format === 'money'">{{ money(row[c.key]) }}</span>
                          <span v-else>{{ displayNumber(row[c.key]) }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="d-flex gap-3 mt-3">
                <button
                  class="btn btn-success"
                  @click="acceptOfferFromFamulus"
                  :disabled="statusChanging"
                >
                  <i v-if="!statusChanging" class="fas fa-check-circle me-1"></i>
                  <i v-else class="fas fa-spinner fa-spin me-1"></i>
                  Ajánlat elfogadása
                </button>
                <button
                  class="btn btn-warning"
                  @click="requestUfOfferChange"
                  :disabled="statusChanging"
                >
                  <i v-if="!statusChanging" class="fas fa-edit me-1"></i>
                  <i v-else class="fas fa-spinner fa-spin me-1"></i>
                  Módosítás kérése
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Egyetem lap -->
        <div v-if="activeTab === 'uni'" class="tab-content">
          <div class="row mt-4">
            <div class="col-12">
              <h5>Egyetemi árlista</h5>
              <div v-if="uniLoading">Árak betöltése...</div>
              <div v-else-if="uniError" class="text-danger">{{ uniError }}</div>
              <div v-else>
                <div v-for="grp in universityGroups" :key="'uni-'+grp.unitNorm" class="mb-4">
                  <h6 class="mb-2">Mértékegység: <strong>{{ grp.unitLabel || '—' }}</strong></h6>
                  <table class="table table-bordered table-sm">
                    <thead>
                      <tr>
                        <th>Megnevezés</th>
                        <th v-for="c in grp.cols" :key="c.key">{{ c.label }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in grp.rows" :key="row.id">
                        <td>{{ row.service_name || row.megnevezes }}</td>
                        <td v-for="c in grp.cols" :key="c.key">
                          <span v-if="c.format === 'money'">{{ money(row[c.key]) }}</span>
                          <span v-else>{{ displayNumber(row[c.key]) }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="d-flex gap-3 mt-3">
                <button
                  class="btn btn-success"
                  @click="generateUniversityQuote"
                  :disabled="statusChanging"
                >
                  <i v-if="!statusChanging" class="fas fa-check-circle me-1"></i>
                  <i v-else class="fas fa-spinner fa-spin me-1"></i>
                  Árajánlat generálása
                </button>
                <button
                  class="btn btn-warning"
                  @click="requestUniversityOfferChange"
                  :disabled="statusChanging"
                >
                  <i v-if="!statusChanging" class="fas fa-edit me-1"></i>
                  <i v-else class="fas fa-spinner fa-spin me-1"></i>
                  Módosítás kérése
                </button>
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
          <div v-if="activeTab === 'famulus'" class="edit-tab-content">
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
          <!-- Uni-Famulus fül -->
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
        </div>
      </div>
      <div class="event-details-footer">
        <div class="footer-left">
          <!-- Admin / Főadmin / Uni-Famulus -->
          <button
            class="btn btn-success admin-accept-btn"
            @click="acceptUfQuote"
            :disabled="statusChanging"
            title="Státusz váltás: UF Árajánlatra vár"
          >
            <i v-if="!statusChanging" class="fas fa-check-circle me-1"></i>
            <i v-else class="fas fa-spinner fa-spin me-1"></i>
            Elfogadás
          </button>

          <!-- ÚJ: Elutasítás gomb -->
          <button
            class="btn btn-danger admin-reject-btn"
            @click="rejectEvent"
            :disabled="statusChanging"
            title="Státusz váltás: Elutasítva"
          >
            <i v-if="!statusChanging" class="fas fa-times-circle me-1"></i>
            <i v-else class="fas fa-spinner fa-spin me-1"></i>
            Elutasítás
          </button>
        </div>
        <div class="footer-right">
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
        <button class="btn btn-secondary" @click="statusModalVisible = false">Mégse</button>
        <button class="btn btn-primary" @click="changeStatus(selectedStatus)">Mentés</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { STATUSES, TERMINAL_STATUS_CODES } from '@/constants/statuses.js';
import { isAdminRole } from '@/constants/roles.js'; // <<< ÚJ

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
      uniError: null
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
        if (!groups[s.phase]) groups[s.phase] = [];
        groups[s.phase].push(s);
      });
      return PHASE_ORDER
        .filter(p => groups[p])
        .map(phase => ({
          phase,
          items: groups[phase].sort((a,b)=>a.sort_order - b.sort_order)
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
          // Lokális állapot frissítése (azonnali UI visszajelzés)
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
  max-width: 2000px;
  width: 95%;
  height: 95%;
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
  font-weight: normal;
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
  font-weight: normal;
}

.status-processing {
  background-color: #f0ad4e;
  color: white;
}

.status-pending {
  background-color: #6c757d;
  color: white;
}

.status-pending .status-icon {
  background-color: rgba(108, 117, 125, 0.15);
  color: white;
}

.status-approved {
  background-color: #5cb85c;
  color: white;
}

.status-rejected {
  background-color: #d9534f;
  color: white;
}

.status-archived {
  background-color: #8a8a8a;
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
  font-weight: normal;
  font-size: 1.25rem;
  border-bottom: 2px solid #50adc9;
  padding-bottom: 8px;
  display: inline-block;
}

.tab-content h5 {
  color: #242943;
  font-weight: normal;
  font-size: 1.1rem;
  margin-bottom: 15px;
}

.tab-content p {
  margin-bottom: 10px;
  line-height: 1.5;
}

.label-text {
  color: #444;
}

.event-details-footer {
  display: flex;
  justify-content: space-between; /* <<< módosítva */
  align-items: center;
  gap: 10px;
  margin: 10px;
}

.footer-left, .footer-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Admin Elfogadás gomb */
.btn-success {
  background-color: #1f6d3f;
  border-color: #1f6d3f;
  color:#fff;
}
.btn-success:hover {
  background-color: #185330;
  border-color: #185330;
}

.admin-accept-btn {
  min-width: 140px;
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
  font-weight: normal;
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
  font-weight: normal;
  margin-bottom: 20px;
}

.status-options {
  margin-bottom: 20px;
}

.status-phase-group {
  margin-bottom: 1rem;
}

.status-phase-group h5 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 0.4rem;
  opacity: 0.8;
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
.dark-mode .label-text {
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
  font-weight: normal;
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

/* Új státusz stílusok (átveszi a Table.vue logikát) */
.event-status {
  display:inline-flex;
  align-items:center;
  gap:.35rem;
  padding:4px 10px;
  border-radius:4px;
  font-size:.8rem;
  font-weight:600;
}

.event-status i { font-size:.75rem; }

.phase-beerkezett { background:#fde8cc; color:#a65f00; }
.phase-szerzodes { background:#ffe0e3; color:#9d1d30; }
.phase-megvalositas { background:#d8eefc; color:#05537a; }
.phase-elszamolas { background:#e1f5e8; color:#1f6d3f; }
.phase-lezart { background:#e0e0e0; color:#555; }
.event-status.terminal {
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.08);
}

.status-unknown { background:#ccc; color:#333; }

/* Státusz modal csoportosítás */
.status-phase-group + .status-phasegroup {
  margin-top:1rem;
  padding-top:.75rem;
  border-top:1px solid #e5e5e5;
}
.status-phase-group h5 {
  font-size:.85rem;
  text-transform:uppercase;
  letter-spacing:.5px;
  margin:0 0 .4rem;
  opacity:.8;
}

.status-option {
  display:flex;
  align-items:center;
  gap:.5rem;
  margin-bottom:.4rem;
  flex-wrap:wrap;
}

.status-label {
  cursor:pointer;
  display:inline-flex;
  align-items:center;
  gap:.4rem;
  border-radius:12px;
  padding:.3rem .65rem;
  font-size:.7rem;
  font-weight:600;
  border:1px solid transparent;
  background:#f5f5f5;
  color:#333;
  transition:.15s;
}

.status-option input[type="radio"]:checked + .status-label {
  border-color:#50adc9;
  box-shadow:0 0 0 2px rgba(80,173,201,.25);
}

.status-label.phase-beerkezett { background:#fde8cc; color:#a65f00; }
.status-label.phase-szerzodes { background:#ffe0e3; color:#9d1d30; }
.status-label.phase-megvalositas { background:#d8eefc; color:#05537a; }
.status-label.phase-elszamolas { background:#e1f5e8; color:#1f6d3f; }
.status-label.phase-lezart { background:#e0e0e0; color:#555; }
.status-label.terminal { filter:brightness(.95); }

.status-label:hover {
  transform:translateY(-2px);
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

/* === Wide (16:9) elrendezés: ugyanaz a dizájn, csak több hasáb === */
.status-modal-content {
  max-width: 960px; /* szélesebb, hogy kiférjen vízszintesen */
  width: 92%;
}

.status-options.status-options--wide {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 28px 48px; /* sor / oszloptávolság */
  margin-bottom: 20px;
}

/* 5 csoport: próbáljuk 3 + 2 elosztásban (rugalmas) */
.status-options.status-options--wide .status-phase-group {
  flex: 1 1 260px;
  max-width: 300px;
  margin: 0;
  padding: 0;
}

/* Eltávolítjuk a vertikális stack-hez tartozó felső szeparátort */
.status-options.status-options--wide .status-phase-group + .status-phase-group {
  margin-top: 0 !important;
  padding-top: 0 !important;
  border-top: none !important;
}

/* A belső elemek közti eredeti térköz megmarad, csak finom igazítás */
.status-options.status-options--wide .status-option {
  margin-bottom: 6px;
}

/* Nagyobb kijelzőn kicsit szűkebb badge-ek hogy több kiférjen */
@media (min-width: 1100px) {
  .status-options.status-options--wide .status-label {
    font-size: 0.68rem;
    padding: .28rem .6rem;
  }
}

/* Kisebb kijelzőn visszaáll az eredeti (egyoszlopos) elrendezés */
@media (max-width: 820px) {
  .status-options.status-options--wide {
    display: block;
  }
  .status-options.status-options--wide .status-phase-group {
    margin-bottom: 1.25rem;
  }
  .status-options.status-options--wide .status-phase-group + .status-phase-group {
    border-top: 1px solid #e5e5e5 !important;
    padding-top: .75rem
  }
}
</style>