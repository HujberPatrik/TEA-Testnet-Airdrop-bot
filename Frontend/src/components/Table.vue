<template>
<div :class="['container-fluid pt-4 px-4 table-container', { expanded: isExpanded, 'dark-mode': isDarkMode }]">
    <div class="bg-light text-center rounded p-4">
        <div class="d-flex align-items-center justify-content-between mb-4">
            <h6 class="mb-0">Rendezvények</h6>
            <div>
                <button @click="toggleExpand" class="btn btn-sm btn-outline-secondary">
                    <i :class="isExpanded ? 'fas fa-compress' : 'fas fa-expand'"></i>
                </button>
            </div>
        </div>
        
        <div class="table-wrapper">
            <div class="table-filters mb-3 d-flex flex-wrap gap-2" v-if="!isExpanded">
                <input
                    type="text"
                    id="filter-name"
                    class="form-control form-control-sm flex-grow-1"
                    placeholder="Neve keresése"
                    v-model="filters.name"
                />
                <div class="d-flex flex-grow-1 gap-2">
                    <input
                        type="date"
                        id="filter-start-time"
                        class="form-control form-control-sm"
                        v-model="filters.startDate"
                    />
                </div>
                <select
                    id="filter-location"
                    class="form-control form-control-sm flex-grow-1"
                    v-model="filters.location"
                >
                    <option value="">Helyszín szűrése</option>
                    <option v-for="location in locations" :key="location" :value="location">
                        {{ location }}
                    </option>
                </select>
                <select
                    id="filter-type"
                    class="form-control form-control-sm flex-grow-1"
                    v-model="filters.type"
                >
                    <option value="">Státusz szűrése</option>
                    <option v-for="status in statuses" :key="status" :value="status">
                        {{ status }}
                    </option>
                </select>
            </div>

            <!-- Táblázat -->
            <div class="table-scrollable">
                <table class="table text-start align-middle table-bordered table-hover mb-0">
                    <thead>
                        <tr class="text-dark">
                            <th scope="col">Státusz</th>
                            <th scope="col">Neve</th>
                            <th scope="col">Helyszín</th>
                            <th scope="col">Kezdő Időpont</th>
                            <th scope="col">Záró Időpont</th>
                            <th scope="col">Szerkesztés</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="event in filteredEvents"
                            :key="event.id"
                            :class="getStatusClass(event.status)"
                        >
                            <td>{{ event.status }}</td>
                            <td>{{ event.name }}</td>
                            <td>{{ event.location }}</td>
                            <td>{{ event.startTime }}</td>
                            <td>{{ event.endTime }}</td>
                            <td>
                                <a :href="'/event/' + event.id">
                                    <button id="settingsButton">
                                        <i class="fas fa-cog"></i>
                                    </button>
                                </a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
</template>

<script>
export default {
    props: {
        isDarkMode: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            isExpanded: false,
            events: [
                {
                    id: 1,
                    status: "Elfogadva",
                    name: "Rendezvény 1",
                    startTime: "2025-03-01 10:00",
                    endTime: "2025-03-01 18:00",
                    location: "Helyszín 1",
                    type: "Konferencia",
                },
                {
                    id: 2,
                    status: "Elutasítva",
                    name: "Rendezvény 2",
                    startTime: "2025-03-02 09:00",
                    endTime: "2025-03-02 17:00",
                    location: "Helyszín 2",
                    type: "Workshop",
                },
                {
                    id: 3,
                    status: "Elfogadásra vár",
                    name: "Rendezvény 3",
                    startTime: "2025-03-03 08:00",
                    endTime: "2025-03-03 16:00",
                    location: "Helyszín 3",
                    type: "Előadás",
                },
                {
                    id: 4,
                    status: "Elfogadva",
                    name: "Rendezvény 4",
                    startTime: "2025-03-04 11:00",
                    endTime: "2025-03-04 19:00",
                    location: "Helyszín 4",
                    type: "Konferencia",
                },
                {
                    id: 5,
                    status: "Elutasítva",
                    name: "Rendezvény 5",
                    startTime: "2025-03-05 12:00",
                    endTime: "2025-03-05 20:00",
                    location: "Helyszín 5",
                    type: "Workshop",
                },
            ],
            filters: {
                name: "",
                startDate: "",
                location: "",
                type: "",
            },
            locations: ["Helyszín 1", "Helyszín 2", "Helyszín 3", "Helyszín 4", "Helyszín 5"],
            statuses: ["Elfogadva", "Elutasítva", "Elfogadásra vár"],
        };
    },
    computed: {
        filteredEvents() {
            return this.events.filter((event) => {
                const matchesName = this.filters.name
                    ? event.name
                          .toLowerCase()
                          .includes(this.filters.name.toLowerCase())
                    : true;
                const matchesStartDate = this.filters.startDate
                    ? event.startTime.startsWith(this.filters.startDate)
                    : true;
                const matchesLocation = this.filters.location
                    ? event.location === this.filters.location
                    : true;
                const matchesType = this.filters.type
                    ? event.type === this.filters.type
                    : true;

                return (
                    matchesName &&
                    matchesStartDate &&
                    matchesLocation &&
                    matchesType
                );
            });
        },
    },
    methods: {
        toggleExpand() {
            this.isExpanded = !this.isExpanded;
            this.$emit("toggle-expand", this.isExpanded);
        },
        getStatusClass(status) {
            switch (status) {
                case "Elfogadva":
                    return "bg-success-light";
                case "Elutasítva":
                    return "bg-danger-light";
                case "Elfogadásra vár":
                    return "bg-warning-light";
                default:
                    return "";
            }
        },
    },
};
</script>

<style scoped>
.container-fluid {
    transition: transform 0.4s ease, opacity 0.4s ease; 
    transform: scale(1); 
    opacity: 1; 
}

.container-fluid.expanded {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1050;
    background-color: white;
    overflow: auto;
    transform: scale(1.05); 
    opacity: 1; 
}

.table-container {
    background-color: #ffffff;
    color: #000000;
}

.table-container.dark-mode {
    background-color: var(--dark-bg-secondary);
    color: var(--dark-text-primary);
}

.table-container.expanded .table-filters {
    display: none;
}

/* Táblázat stílusok */
.table-container .table {
    width: 100%;
    border-collapse: collapse;
}

.table-container .table th,
.table-container .table td {
    border: 1px solid #ddd;
    padding: 8px;
}

.table-container.dark-mode .table th,
.table-container.dark-mode .table td {
    border-color: var(--dark-border);
}

.table-container.dark-mode .table {
    background-color: var(--dark-bg-secondary);
    color: var(--dark-text-primary);
}

.table-container.dark-mode .table tbody tr:hover {
    background-color: var(--dark-bg-tertiary);
}

/* Státusz színek */
.bg-success-light {
    background-color: rgba(0, 128, 0, 0.8) !important;
    color: #ffffff !important;
}

.bg-danger-light {
    background-color: rgba(227, 6, 19, 0.8) !important;
    color: #ffffff !important;
}

.bg-warning-light {
    background-color: rgba(253, 185, 19, 0.8) !important;
    color: #212529 !important;
}

/* Dark mode státusz színek */
.table-container.dark-mode .bg-success-light {
    background-color: rgba(0, 128, 0, 0.6) !important;
}

.table-container.dark-mode .bg-danger-light {
    background-color: rgba(227, 6, 19, 0.6) !important;
}

.table-container.dark-mode .bg-warning-light {
    background-color: rgba(253, 185, 19, 0.6) !important;
}
</style>