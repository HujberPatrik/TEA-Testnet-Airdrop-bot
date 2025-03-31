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
                                <th scope="col">Státusz</th>
                                <th scope="col">Neve</th>
                                <th scope="col">Helyszín</th>
                                <th scope="col">Kezdő Időpont</th>
                                <th scope="col">Záró Időpont</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="event in filteredEvents"
                                :key="event.id"
                                :class="getStatusClass(event.status)"
                                @click="navigateToEvent(event.id)"
                                style="cursor: pointer;"
                            >
                                <td style="width: 50px; text-align: center;">
                                    <span class="status-icon" :title="event.status">
                                        <i :class="getStatusIcon(event.status)" class="me-2"></i>
                                    </span>
                                </td>
                                <td v-html="highlightText(event.name)"></td>
                                <td v-html="highlightText(event.location)"></td>
                                <td v-html="highlightText(event.startTime)"></td>
                                <td v-html="highlightText(event.endTime)"></td>
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
                { id: 1, status: "Elfogadva", name: "Rendezvény 1", startTime: "2025-03-01 10:00", endTime: "2025-03-01 18:00", location: "Helyszín 1", type: "Konferencia" },
                { id: 2, status: "Elutasítva", name: "Rendezvény 2", startTime: "2025-03-02 09:00", endTime: "2025-03-02 17:00", location: "Helyszín 2", type: "Workshop" },
                { id: 3, status: "Elfogadásra vár", name: "Rendezvény 3", startTime: "2025-03-03 08:00", endTime: "2025-03-03 16:00", location: "Helyszín 3", type: "Előadás" }
            ],
            filters: {
                name: "",
                startDate: "",
                location: "",
                type: "",
            },
        };
    },
    computed: {
        uniqueLocations() {
            return [...new Set(this.events.map(event => event.location))];
        },
        uniqueTypes() {
            return [...new Set(this.events.map(event => event.type))];
        },
        filteredEvents() {
            const searchTerm = this.filters.name.toLowerCase();
            return this.events.filter((event) => {
                const matchesName = event.name.toLowerCase().includes(searchTerm);
                const matchesLocation = event.location.toLowerCase().includes(searchTerm);
                const matchesStartTime = event.startTime.toLowerCase().includes(searchTerm);
                const matchesEndTime = event.endTime.toLowerCase().includes(searchTerm);
                const matchesStatus = event.status.toLowerCase().includes(searchTerm);

                const matchesStartDate = !this.filters.startDate || new Date(event.startTime).toISOString().split('T')[0] === this.filters.startDate;
                const matchesLocationFilter = !this.filters.location || event.location === this.filters.location;
                const matchesTypeFilter = !this.filters.type || event.type === this.filters.type;

                return (
                    (matchesName || matchesLocation || matchesStartTime || matchesEndTime || matchesStatus) &&
                    matchesStartDate &&
                    matchesLocationFilter &&
                    matchesTypeFilter
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
                case "Elfogadva": return "bg-success-light";
                case "Elutasítva": return "bg-danger-light";
                case "Elfogadásra vár": return "bg-warning-light";
                default: return "";
            }
        },
        getStatusIcon(status) {
            switch (status) {
                case "Elfogadva": return "fas fa-check-circle text-success";
                case "Elutasítva": return "fas fa-times-circle text-danger";
                case "Elfogadásra vár": return "fas fa-hourglass-half text-warning";
                default: return "fas fa-question-circle text-secondary";
            }
        },
        navigateToEvent(id) {
            this.$router.push({ name: 'event', params: { id } });
        },
        highlightText(text) {
            if (!this.filters.name) return text;
            const searchTerm = this.filters.name;
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
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
    background-color: #f8fafc;
    color: #1f2937;
}

.table-container.dark-mode {
    background-color: #1e293b;
    color: #f8fafc;
}

.table-container.expanded .table-filters {
    display: none;
}

/* Táblázat stílusok */
.table-container .table {
    width: 100%;
    border-collapse: collapse;
    background-color: #ffffff;
    color: #1f2937;
}

.table-container .table th,
.table-container .table td {
    border: 1px solid #e5e7eb;
    padding: 8px;
}

.table-container.dark-mode .table th,
.table-container.dark-mode .table td {
    border-color: #334155;
}

.table-container.dark-mode .table {
    background-color: #334155;
    color: #f1f5f9;
}

.table-container.dark-mode .table tbody tr:hover {
    background-color: #475569;
}

/* Táblázat oszlop szélesség */
.table-container .table th:first-child,
.table-container .table td:first-child {
    width: 50px;
    text-align: center;
}

/* Státusz színek */
.bg-success-light {
    background-color: #22c55e !important;
    color: #ffffff !important;
}

.bg-danger-light {
    background-color: #ef4444 !important;
    color: #ffffff !important;
}

.bg-warning-light {
    background-color: #f59e0b !important;
    color: #ffffff !important;
}

/* Dark mode státusz színek */
.table-container.dark-mode .bg-success-light {
    background-color: #16a34a !important;
}

.table-container.dark-mode .bg-danger-light {
    background-color: #dc2626 !important;
}

.table-container.dark-mode .bg-warning-light {
    background-color: #d97706 !important;
}

/* Ikonok színei */
.status-icon i.text-success {
    color: #15803d !important;
}

.status-icon i.text-danger {
    color: #b91c1c !important;
}

.status-icon i.text-warning {
    color: #c2410c !important;
}

.status-icon i.text-secondary {
    color: #6b7280 !important;
}

.status-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

mark {
    background-color: #ffeb3b;
    color: #000;
    padding: 0 2px;
    border-radius: 2px;
}
</style>