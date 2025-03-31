<template>
  <div class="container mt-4">
    <h2 class="mb-4">Rendezvény Szerkesztése</h2>
    <form @submit.prevent="saveEvent">
      <div class="mb-3">
        <label for="event-name" class="form-label">Neve</label>
        <input
          type="text"
          id="event-name"
          class="form-control"
          v-model="event.name"
          required
        />
      </div>
      <div class="mb-3">
        <label for="event-status" class="form-label">Státusz</label>
        <select
          id="event-status"
          class="form-control"
          v-model="event.status"
          required
        >
          <option value="Elfogadva">Elfogadva</option>
          <option value="Elutasítva">Elutasítva</option>
          <option value="Elfogadásra vár">Elfogadásra vár</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="event-location" class="form-label">Helyszín</label>
        <input
          type="text"
          id="event-location"
          class="form-control"
          v-model="event.location"
          required
        />
      </div>
      <div class="mb-3">
        <label for="event-start-time" class="form-label">Kezdő Időpont</label>
        <input
          type="datetime-local"
          id="event-start-time"
          class="form-control"
          v-model="event.startTime"
          required
        />
      </div>
      <div class="mb-3">
        <label for="event-end-time" class="form-label">Záró Időpont</label>
        <input
          type="datetime-local"
          id="event-end-time"
          class="form-control"
          v-model="event.endTime"
          required
        />
      </div>
      <button type="submit" class="btn btn-primary">Mentés</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      event: {},
    };
  },
  created() {
    const index = this.$route.params.index;
    const events = JSON.parse(localStorage.getItem('events')) || [];
    if (index !== undefined && events[index]) {
      this.event = { ...events[index] };
    } else {
      this.$router.push('/'); // Ha az index érvénytelen, visszairányítjuk a főoldalra
    }
  },
  methods: {
    saveEvent() {
      const index = this.$route.params.index;
      const events = JSON.parse(localStorage.getItem('events')) || [];
      if (index !== undefined && events[index]) {
        events[index] = this.event; // Frissítjük az eseményt
        localStorage.setItem('events', JSON.stringify(events)); // Mentés
      }
      this.$router.push('/'); // Visszanavigálás a főoldalra
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
}
</style>