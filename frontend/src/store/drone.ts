import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { Waypoint, NoFlyZone, TerrainPoint, FlightPlan, DroneConfig, TaskTemplate } from '../types';
import {
  aStarPathfind,
  rrtPathfind,
  smoothPath,
  calculateFlightStats,
  checkTerrainCollision,
  exportKML,
  mockNoFlyZones,
  mockTerrainData,
} from '../utils/pathfinding';
import {
  fetchTemplatesSafe,
  createTemplateRemote,
  updateTemplateRemote,
  deleteTemplateRemote,
} from '../api/templates';

const TEMPLATE_STORAGE_KEY = 'drone-task-templates';

function loadTemplatesFromStorage(): TaskTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

function saveTemplatesToStorage(templates: TaskTemplate[]) {
  try {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
  } catch {
    // ignore
  }
}

export const useDroneStore = defineStore('drone', () => {
  const waypoints = ref<Waypoint[]>([]);
  const noFlyZones = ref<NoFlyZone[]>([]);
  const terrainData = ref<TerrainPoint[]>([]);
  const currentPlan = ref<FlightPlan | null>(null);
  const selectedAlgorithm = ref<'astar' | 'rrt'>('astar');
  const isSimulating = ref(false);
  const simProgress = ref(0);
  const mapCenter = ref<[number, number]>([39.9, 116.4]);
  const taskTemplates = ref<TaskTemplate[]>(loadTemplatesFromStorage());
  const mapFitVersion = ref(0);
  const templatesSynced = ref(false);

  const droneConfig = ref<DroneConfig>({
    maxAltitude: 500,
    maxSpeed: 20,
    batteryCapacity: 5000,
    consumptionRate: 100,
    safeDistance: 30,
  });

  // ─── Actions ──────────────────────────────────────────────────────────────
  function addWaypoint(
    lat: number,
    lng: number,
    altitude = 100,
    speed = 10,
    action: Waypoint['action'] = 'none'
  ) {
    const id = `wp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    waypoints.value.push({ id, lat, lng, altitude, speed, action });
  }

  function removeWaypoint(id: string) {
    waypoints.value = waypoints.value.filter((w) => w.id !== id);
  }

  function updateWaypoint(id: string, updates: Partial<Waypoint>) {
    const wp = waypoints.value.find((w) => w.id === id);
    if (wp) Object.assign(wp, updates);
  }

  function planRoute(start: [number, number], goal: [number, number]) {
    const bounds = { minLat: 39.85, maxLat: 39.95, minLng: 116.35, maxLng: 116.45 };
    let raw: Waypoint[];
    if (selectedAlgorithm.value === 'astar') {
      raw = aStarPathfind(start, goal, 30, noFlyZones.value, bounds);
    } else {
      raw = rrtPathfind(start, goal, noFlyZones.value);
    }
    const smoothed = smoothPath(raw);
    waypoints.value = smoothed;
    updatePlan();
  }

  function clearRoute() {
    stopSimulation();
    waypoints.value = [];
    currentPlan.value = null;
    simProgress.value = 0;
  }

  function updatePlan(name?: string) {
    const stats = calculateFlightStats(waypoints.value, droneConfig.value);
    currentPlan.value = {
      id: `plan-${Date.now()}`,
      name: name || currentPlan.value?.name || 'Flight Plan',
      waypoints: [...waypoints.value],
      totalDistance: stats.totalDistance,
      estimatedTime: stats.estimatedTime,
      batteryUsage: stats.batteryUsage,
    };
  }

  let simInterval: ReturnType<typeof setInterval> | null = null;

  function stopSimulation() {
    if (simInterval) {
      clearInterval(simInterval);
      simInterval = null;
    }
    isSimulating.value = false;
  }

  function simulateFlight() {
    if (waypoints.value.length < 2 || isSimulating.value) return;
    isSimulating.value = true;
    simProgress.value = 0;
    simInterval = setInterval(() => {
      simProgress.value += 1;
      if (simProgress.value >= 100) {
        simProgress.value = 100;
        stopSimulation();
      }
    }, 50);
  }

  function loadMockData() {
    noFlyZones.value = mockNoFlyZones;
    terrainData.value = mockTerrainData;
  }

  function exportPlan(): string {
    if (!currentPlan.value) return '';
    return exportKML(currentPlan.value);
  }

  function fitMapToBounds() {
    mapFitVersion.value++;
  }

  watch(taskTemplates, (val) => {
    saveTemplatesToStorage(val);
  }, { deep: true });

  // ─── Template Management ──────────────────────────────────────────────────
  async function initTemplates() {
    const remote = await fetchTemplatesSafe();
    if (remote.length > 0) {
      const localIds = new Set(taskTemplates.value.map((t) => t.id));
      for (const t of remote) {
        if (!localIds.has(t.id)) {
          taskTemplates.value.push(t);
        }
      }
    }
    templatesSynced.value = true;
  }

  function saveTemplate(name: string, description?: string, category: TaskTemplate['category'] = 'other') {
    const now = Date.now();
    const template: TaskTemplate = {
      id: `tpl-${now}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      description,
      category,
      waypoints: JSON.parse(JSON.stringify(waypoints.value)),
      droneConfig: { ...droneConfig.value },
      selectedAlgorithm: selectedAlgorithm.value,
      defaultAltitude: waypoints.value.length > 0 ? waypoints.value[0].altitude : 100,
      defaultSpeed: waypoints.value.length > 0 ? waypoints.value[0].speed : 10,
      createdAt: now,
      updatedAt: now,
    };
    taskTemplates.value.push(template);
    void createTemplateRemote(template);
    return template.id;
  }

  function updateTemplate(id: string, updates: Partial<Omit<TaskTemplate, 'id' | 'createdAt'>>) {
    const tpl = taskTemplates.value.find((t) => t.id === id);
    if (tpl) {
      Object.assign(tpl, updates, { updatedAt: Date.now() });
      void updateTemplateRemote(id, updates);
    }
  }

  function deleteTemplate(id: string) {
    taskTemplates.value = taskTemplates.value.filter((t) => t.id !== id);
    void deleteTemplateRemote(id);
  }

  function loadTemplate(id: string): boolean {
    const tpl = taskTemplates.value.find((t) => t.id === id);
    if (!tpl) return false;
    stopSimulation();
    simProgress.value = 0;
    waypoints.value = JSON.parse(JSON.stringify(tpl.waypoints));
    droneConfig.value = { ...tpl.droneConfig };
    selectedAlgorithm.value = tpl.selectedAlgorithm;
    if (waypoints.value.length >= 2) {
      updatePlan(tpl.name);
    } else {
      currentPlan.value = null;
    }
    fitMapToBounds();
    return true;
  }

  function getTemplatesByCategory(category?: TaskTemplate['category']): TaskTemplate[] {
    if (!category) return [...taskTemplates.value].sort((a, b) => b.updatedAt - a.updatedAt);
    return taskTemplates.value
      .filter((t) => t.category === category)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  // ─── Computed ─────────────────────────────────────────────────────────────
  const totalDistance = computed(() => {
    if (!currentPlan.value) return 0;
    return currentPlan.value.totalDistance;
  });

  const estimatedTime = computed(() => {
    if (!currentPlan.value) return 0;
    return currentPlan.value.estimatedTime;
  });

  const batteryPercent = computed(() => {
    if (!currentPlan.value) return 0;
    return currentPlan.value.batteryUsage;
  });

  const terrainProfile = computed(() => {
    if (waypoints.value.length < 2) return [];
    return waypoints.value.map((wp) => {
      let nearestElev = 0;
      let minDist = Infinity;
      for (const tp of terrainData.value) {
        const d =
          (tp.lat - wp.lat) ** 2 + (tp.lng - wp.lng) ** 2;
        if (d < minDist) {
          minDist = d;
          nearestElev = tp.elevation;
        }
      }
      return {
        lat: wp.lat,
        lng: wp.lng,
        altitude: wp.altitude,
        terrainElevation: nearestElev,
      };
    });
  });

  return {
    waypoints,
    noFlyZones,
    terrainData,
    currentPlan,
    droneConfig,
    selectedAlgorithm,
    isSimulating,
    simProgress,
    mapCenter,
    mapFitVersion,
    taskTemplates,
    templatesSynced,
    totalDistance,
    estimatedTime,
    batteryPercent,
    terrainProfile,
    addWaypoint,
    removeWaypoint,
    updateWaypoint,
    planRoute,
    clearRoute,
    stopSimulation,
    simulateFlight,
    loadMockData,
    exportPlan,
    updatePlan,
    fitMapToBounds,
    initTemplates,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    loadTemplate,
    getTemplatesByCategory,
  };
});
