<template>
  <div>
    <h1>LocalStorage Adatok</h1>
    <table>
      <thead>
        <tr>
          <th>Kulcs</th>
          <th>Érték</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(value, key) in allData" :key="key">
          <td>{{ key }}</td>
          <td>{{ value }}</td>
        </tr>
      </tbody>
    </table>
    <button @click="sendDataToBackend" class="btn btn-primary">Adatok Küldése</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      allData: {}, // Az összes adat tárolása
    };
  },
  mounted() {
    // Betöltjük az összes adatot a localStorage-ból
    this.loadLocalStorageData();
  },
  methods: {
    loadLocalStorageData() {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      this.allData = data; // Az összes adatot hozzárendeljük az allData-hoz
    },
    async sendDataToBackend() {
      try {
        const response = await axios.post('http://localhost:3001/api/data', this.allData);
        console.log('Adatok sikeresen elküldve:', response.data);
        alert('Adatok sikeresen elküldve a backendnek!');
      } catch (error) {
        console.error('Hiba történt az adatok küldésekor:', error);
        alert('Hiba történt az adatok küldésekor!');
      }
    },
  },
};
</script>

<style scoped>
h1 {
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f4f4f4;
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #f1f1f1;
}

button {
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>