<template>
  <v-container class="pa-6" max-width="1100">
    <h2 class="text-h5 font-weight-bold mb-6">
      {{ i18n.t('dashboard.title') }}
      <v-chip v-if="isOfflineMode" size="x-small" color="warning" class="ml-2">
        {{ i18n.t('sync.offline') }}
      </v-chip>
    </h2>

    <!-- Stat cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="4">
        <v-card color="primary" variant="elevated" elevation="3">
          <v-card-text class="text-center pa-6">
            <v-icon size="40" color="white" class="mb-2"
              >mdi-package-variant-closed</v-icon
            >
            <div class="text-h4 font-weight-bold text-white">
              <v-skeleton-loader v-if="loading" type="text" color="primary" />
              <span v-else>{{ summary?.total_products ?? '—' }}</span>
            </div>
            <div class="text-body-2 text-white mt-1">
              {{ i18n.t('dashboard.totalProducts') }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card color="green-darken-1" variant="elevated" elevation="3">
          <v-card-text class="text-center pa-6">
            <v-icon size="40" color="white" class="mb-2">mdi-currency-usd</v-icon>
            <div class="text-h4 font-weight-bold text-white">
              <v-skeleton-loader v-if="loading" type="text" color="green-darken-1" />
              <span v-else>${{ formatCurrency(summary?.total_value) }}</span>
            </div>
            <div class="text-body-2 text-white mt-1">
              {{ i18n.t('dashboard.totalValue') }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card color="warning" variant="elevated" elevation="3" link style="cursor: pointer;" @click="showLowStockDialog = true">
          <v-card-text class="text-center pa-6">
            <v-icon size="40" color="white" class="mb-2"
              >mdi-alert-circle</v-icon
            >
            <div class="text-h4 font-weight-bold text-white">
              <v-skeleton-loader v-if="loading" type="text" color="warning" />
              <span v-else>{{ summary?.low_stock_count ?? '—' }}</span>
            </div>
            <div class="text-body-2 text-white mt-1">
              {{ i18n.t('dashboard.lowStock') }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card color="success" variant="elevated" elevation="3">
          <v-card-text class="text-center pa-6">
            <v-icon size="40" color="white" class="mb-2">mdi-transfer</v-icon>
            <div class="text-h4 font-weight-bold text-white">
              <v-skeleton-loader v-if="loading" type="text" color="success" />
              <span v-else>{{ summary?.movements_today ?? '—' }}</span>
            </div>
            <div class="text-body-2 text-white mt-1">
              {{ i18n.t('dashboard.movementsToday') }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card color="teal" variant="elevated" elevation="3">
          <v-card-text class="text-center pa-6">
            <v-icon size="40" color="white" class="mb-2">mdi-plus-box</v-icon>
            <div class="text-h4 font-weight-bold text-white">
              <v-skeleton-loader v-if="loading" type="text" color="teal" />
              <span v-else>{{ totalEntries }}</span>
            </div>
            <div class="text-body-2 text-white mt-1">
              {{ i18n.t('dashboard.totalEntries') }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card color="deep-orange" variant="elevated" elevation="3">
          <v-card-text class="text-center pa-6">
            <v-icon size="40" color="white" class="mb-2">mdi-minus-box</v-icon>
            <div class="text-h4 font-weight-bold text-white">
              <v-skeleton-loader v-if="loading" type="text" color="deep-orange" />
              <span v-else>{{ totalWithdrawals }}</span>
            </div>
            <div class="text-body-2 text-white mt-1">
              {{ i18n.t('dashboard.totalWithdrawals') }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Category Stock Levels Chart -->
    <v-card class="mb-6" elevation="2">
      <v-card-title class="pa-4 text-h6">
        {{ i18n.t('dashboard.categoryStock') }}
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4" style="height: 350px;">
        <v-skeleton-loader v-if="loading" type="card" height="100%" />
        <Bar v-else-if="chartData.labels.length" :data="chartData" :options="chartOptions" />
        <div v-else class="text-center py-8 text-grey">
          {{ i18n.t('dashboard.noData') }}
        </div>
      </v-card-text>
    </v-card>

    <!-- Recent operations history table -->
    <v-card class="mb-6" elevation="2">
      <v-card-title class="pa-4 text-h6">{{
        i18n.t('dashboard.recentOperations')
      }}</v-card-title>
      <v-divider />
      <v-skeleton-loader v-if="loading" type="table-tbody" />
      <v-data-table
        v-else
        :headers="historyHeaders"
        :items="historyItems"
        density="compact"
        :no-data-text="i18n.t('dashboard.noData')"
      >
        <template #[`item.created_at`]="{ value }">
          {{ value ? new Date(value).toLocaleString() : '' }}
        </template>
        <template #[`item.qty_change`]="{ item }">
          {{ formatQtyChange(item) }}
        </template>
      </v-data-table>
    </v-card>

    <!-- Top products table -->
    <v-card elevation="2">
      <v-card-title class="pa-4 text-h6">{{
        i18n.t('dashboard.topProducts')
      }}</v-card-title>
      <v-divider />
      <v-skeleton-loader v-if="loading" type="table-tbody" />
      <v-data-table
        v-else
        :headers="topProductHeaders"
        :items="topProducts"
        density="compact"
        :no-data-text="isOfflineMode ? i18n.t('sync.offline') : i18n.t('dashboard.noData')"
      />
    </v-card>

    <!-- Low Stock Dialog -->
    <v-dialog v-model="showLowStockDialog" max-width="800">
      <v-card>
        <v-card-title class="pa-4 text-h6 d-flex align-center">
          <v-icon color="warning" class="mr-2">mdi-alert-circle</v-icon>
          {{ i18n.t('dashboard.lowStockAlert') }}
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="showLowStockDialog = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-data-table
            :headers="lowStockHeaders"
            :items="lowStockProducts"
            :loading="lowStockLoading"
            density="compact"
            :no-data-text="i18n.t('dashboard.noData')"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, computed, inject, watch } from 'vue';
  import { apiFetch } from '../../api/custom-fetch';
  import { useI18nStore } from '../../store/i18n';
  import { useConnectivity } from '../../composables/use-connectivity';
  import { useAuthStore } from '../../store/auth';
  import { getAll } from '../../api/indexeddb';
  import { Bar } from 'vue-chartjs';
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
  } from 'chart.js';

  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

  const i18n = useI18nStore();
  const auth = useAuthStore();
  const { isOnline } = useConnectivity();
  const loading = ref(false);
  const isOfflineMode = ref(false);

  const summary = ref(null);
  const historyItems = ref([]);
  const topProducts = ref([]);
  const allHistoryList = ref([]);

  const totalEntries = computed(() => {
    return allHistoryList.value.reduce((sum, item) => {
      if (item.operation === 'entry') {
        const diff = Number(item.quantity_after ?? 0) - Number(item.quantity_before ?? 0);
        const qty = diff !== 0 ? diff : Number(item.quantity ?? 0);
        return sum + qty;
      }
      return sum;
    }, 0);
  });

  const totalWithdrawals = computed(() => {
    return allHistoryList.value.reduce((sum, item) => {
      if (item.operation === 'withdrawal') {
        const diff = Number(item.quantity_before ?? 0) - Number(item.quantity_after ?? 0);
        const qty = diff !== 0 ? diff : Number(item.quantity ?? 0);
        return sum + qty;
      }
      return sum;
    }, 0);
  });

  const eventBus = inject('eventBus');

  // Low Stock Dialog state and data
  const showLowStockDialog = ref(false);
  const lowStockProducts = ref([]);
  const lowStockLoading = ref(false);

  const lowStockHeaders = computed(() => [
    {
      key: 'name',
      title: i18n.t('tables.products.columns.name'),
      sortable: true,
    },
    {
      key: 'category_name',
      title: i18n.t('tables.products.columns.category_name'),
      sortable: true,
    },
    {
      key: 'quantity',
      title: i18n.t('tables.products.columns.quantity'),
      sortable: true,
    },
  ]);

  // Chart state and data
  const chartData = ref({
    labels: [],
    datasets: []
  });

  const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  }));

  async function loadLowStockProducts() {
    lowStockLoading.value = true;
    try {
      const [allProducts, allCategories] = await Promise.all([
        getAll('products'),
        getAll('categories'),
      ]);
      lowStockProducts.value = allProducts
        .filter(p => Number(p.quantity || 0) < Number(p.min_stock ?? 10))
        .map(p => ({
          ...p,
          category_name: allCategories.find(c => c.id === p.category_id)?.name || '',
        }));
    } catch (err) {
      console.error('Failed to load low stock products:', err);
    } finally {
      lowStockLoading.value = false;
    }
  }

  async function loadChartData() {
    try {
      const [allProducts, allCategories] = await Promise.all([
        getAll('products'),
        getAll('categories'),
      ]);

      const categoryMap = {};
      allCategories.forEach(cat => {
        categoryMap[cat.id] = {
          name: cat.name,
          quantity: 0
        };
      });

      allProducts.forEach(prod => {
        if (prod.category_id && categoryMap[prod.category_id]) {
          categoryMap[prod.category_id].quantity += Number(prod.quantity || 0);
        }
      });

      const labels = allCategories.map(cat => cat.name);
      const data = allCategories.map(cat => categoryMap[cat.id].quantity);

      chartData.value = {
        labels,
        datasets: [
          {
            label: i18n.t('tables.products.columns.quantity'),
            backgroundColor: '#d32f2f',
            data,
          },
        ],
      };
    } catch (err) {
      console.error('Failed to load chart data:', err);
    }
  }

  watch(showLowStockDialog, (val) => {
    if (val) {
      loadLowStockProducts();
    }
  });

  const historyHeaders = computed(() => [
    {
      key: 'created_at',
      title: i18n.t('tables.history.columns.created_at'),
      sortable: true,
    },
    {
      key: 'user_name',
      title: i18n.t('tables.history.columns.user'),
      sortable: true,
    },
    {
      key: 'entity_display',
      title: i18n.t('tables.history.columns.entity'),
      sortable: true,
    },
    {
      key: 'operation_display',
      title: i18n.t('tables.history.columns.operation'),
      sortable: true,
    },
    {
      key: 'qty_change',
      title: i18n.t('tables.history.columns.qty_change'),
      sortable: false,
    },
    {
      key: 'notes',
      title: i18n.t('tables.history.columns.notes'),
      sortable: false,
    },
  ]);

  const topProductHeaders = computed(() => [
    {
      key: 'name',
      title: i18n.t('tables.products.columns.name'),
      sortable: true,
    },
    {
      key: 'movements',
      title: i18n.t('dashboard.movementsToday'),
      sortable: true,
    },
    {
      key: 'quantity',
      title: i18n.t('tables.products.columns.quantity'),
      sortable: true,
    },
  ]);

  function getEntityName(entityType, entityId, localData) {
    const { products, categories, racks, shelves } = localData;
    if (entityType === 'product') {
      const p = products.find(x => x.id === entityId);
      return p ? p.name : `Product #${entityId}`;
    } else if (entityType === 'category') {
      const c = categories.find(x => x.id === entityId);
      return c ? c.name : `Category #${entityId}`;
    } else if (entityType === 'rack') {
      const r = racks.find(x => x.id === entityId);
      return r ? r.name : `Rack #${entityId}`;
    } else if (entityType === 'shelf') {
      const s = shelves.find(x => x.id === entityId);
      return s ? s.name : `Shelf #${entityId}`;
    }
    return `Entity #${entityId}`;
  }

  const formatOperation = (op) => {
    const mapping = {
      entry: i18n.t('actions.entry') || 'Entry',
      withdrawal: i18n.t('actions.withdrawal') || 'Withdrawal',
      create: i18n.t('actions.create') || 'Create',
      update: i18n.t('actions.edit') || 'Update',
      delete: i18n.t('actions.delete') || 'Delete',
    };
    return mapping[op] || (op ? op.charAt(0).toUpperCase() + op.slice(1) : '');
  };

  const formatQtyChange = (item) => {
    const before = item.quantity_before;
    const after = item.quantity_after;
    if (before === undefined || before === null || after === undefined || after === null) {
      return '—';
    }
    const diff = Number(after) - Number(before);
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff} (${before} → ${after})`;
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '0.00';
    return Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  async function loadDashboard() {
    loading.value = true;
    isOfflineMode.value = false;

    // Check if we can sync/call API
    const canUseAPI = isOnline.value && auth.isAuthenticated;

    if (canUseAPI) {
      try {
        const [summaryRes, historyRes, usersRes, topRes] = await Promise.allSettled([
          apiFetch('/dashboard/summary'),
          apiFetch('/history'),
          apiFetch('/users'),
          apiFetch('/dashboard/top-products'),
        ]);

        let loadedSucceeded = false;

        if (summaryRes.status === 'fulfilled') {
          summary.value = summaryRes.value.data;
          loadedSucceeded = true;
        }

        // Fetch local DB stores to resolve entity names
        const [products, categories, racks, shelves] = await Promise.all([
          getAll('products'),
          getAll('categories'),
          getAll('racks'),
          getAll('shelves'),
        ]);
        const localData = { products, categories, racks, shelves };

        let usersList = [];
        if (usersRes.status === 'fulfilled') {
          usersList = usersRes.value.data?.data ?? usersRes.value.data ?? [];
        }

        if (historyRes.status === 'fulfilled') {
          const apiHistory = historyRes.value.data?.data ?? historyRes.value.data ?? [];
          allHistoryList.value = apiHistory;
          historyItems.value = apiHistory.map(item => {
            // resolve user
            let userName = 'Offline User';
            if (item.user_id) {
              const matchedUser = usersList.find(u => u.id === item.user_id);
              if (matchedUser) {
                userName = matchedUser.name;
              } else if (auth.user && item.user_id === auth.user.id) {
                userName = auth.user.name;
              }
            } else if (auth.user) {
              userName = auth.user.name;
            }

            // resolve entity
            const entityTypeKey = `entityTypes.${item.entity_type}`;
            const typeLabel = i18n.t(entityTypeKey) || item.entity_type;
            const entityName = getEntityName(item.entity_type, item.entity_id, localData);
            const entityDisplay = typeLabel ? `${typeLabel}: ${entityName}` : entityName;

            return {
              ...item,
              user_name: userName,
              entity_display: entityDisplay,
              operation_display: formatOperation(item.operation),
            };
          });
        }

        if (topRes.status === 'fulfilled') {
          const apiTopProducts = topRes.value.data ?? [];
          topProducts.value = apiTopProducts.map(p => {
            const prod = products.find(lp => lp.id === p.entity_id);
            return {
              name: prod ? prod.name : `Product #${p.entity_id}`,
              movements: p.movement_count,
              quantity: prod ? prod.quantity : 0
            };
          });
        }

        if (loadedSucceeded) {
          await loadChartData();
          if (showLowStockDialog.value) {
            await loadLowStockProducts();
          }
          loading.value = false;
          return;
        }
      } catch (err) {
        console.warn('Failed to load dashboard from API, falling back to local database.', err);
      }
    }

    // Fallback to offline metrics from local IndexedDB
    isOfflineMode.value = true;
    try {
      const [localProducts, allCategories, allRacks, allShelves] = await Promise.all([
        getAll('products'),
        getAll('categories'),
        getAll('racks'),
        getAll('shelves'),
      ]);
      const localData = { products: localProducts, categories: allCategories, racks: allRacks, shelves: allShelves };

      const totalProducts = localProducts.length;
      const totalStock = localProducts.reduce((sum, p) => sum + Number(p.quantity || 0), 0);
      const lowStockCount = localProducts.filter(p => Number(p.quantity || 0) < Number(p.min_stock ?? 10)).length;
      const totalValue = localProducts.reduce((sum, p) => sum + Number(p.quantity || 0) * Number(p.cost_price || 0), 0);

      const allHistory = await getAll('operation_history');
      allHistoryList.value = allHistory;

      // Calculate movements_today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayStartISO = todayStart.toISOString();
      const movementsTodayCount = allHistory.filter(h => 
        h.created_at >= todayStartISO
      ).length;

      summary.value = {
        total_products: totalProducts,
        total_stock: totalStock,
        low_stock_count: lowStockCount,
        movements_today: movementsTodayCount,
        total_value: totalValue
      };

      // Set historyItems from allHistory sorted by created_at desc
      const sortedHistory = [...allHistory].sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });

      historyItems.value = sortedHistory.map(item => {
        // Resolve user locally
        let userName = 'Offline User';
        if (item.user_id) {
          if (auth.user && item.user_id === auth.user.id) {
            userName = auth.user.name;
          }
        } else if (auth.user) {
          userName = auth.user.name;
        }

        // resolve entity
        const entityTypeKey = `entityTypes.${item.entity_type}`;
        const typeLabel = i18n.t(entityTypeKey) || item.entity_type;
        const entityName = getEntityName(item.entity_type, item.entity_id, localData);
        const entityDisplay = typeLabel ? `${typeLabel}: ${entityName}` : entityName;

        return {
          ...item,
          user_name: userName,
          entity_display: entityDisplay,
          operation_display: formatOperation(item.operation),
        };
      });

      // Calculate top products
      const topProductsMap = {};
      allHistory.forEach(h => {
        if (h.entity_type === 'product' && (h.operation === 'entry' || h.operation === 'withdrawal')) {
          const pid = h.entity_id;
          if (!topProductsMap[pid]) {
            topProductsMap[pid] = 0;
          }
          topProductsMap[pid]++;
        }
      });

      const topProductsList = Object.entries(topProductsMap)
        .map(([idStr, count]) => ({
          entity_id: Number(idStr),
          movement_count: count
        }))
        .sort((a, b) => b.movement_count - a.movement_count)
        .slice(0, 10);

      topProducts.value = topProductsList.map(p => {
        const prod = localProducts.find(lp => lp.id === p.entity_id);
        return {
          name: prod ? prod.name : `Product #${p.entity_id}`,
          movements: p.movement_count,
          quantity: prod ? prod.quantity : 0
        };
      });

      await loadChartData();
      if (showLowStockDialog.value) {
        await loadLowStockProducts();
      }
    } catch (err) {
      console.error('Failed to load local database products for dashboard.', err);
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    loadDashboard();
    if (eventBus) {
      eventBus.on('refreshData', loadDashboard);
      eventBus.on('syncComplete', loadDashboard);
    }
  });

  onUnmounted(() => {
    if (eventBus) {
      eventBus.off('refreshData', loadDashboard);
      eventBus.off('syncComplete', loadDashboard);
    }
  });
</script>
