import { useState, useEffect, useCallback } from 'react';

export type MaterialType = 'metal' | 'plastic' | 'paper' | 'other';
export type StatusType = 'normal' | 'high-load' | 'low-intake' | 'offline';

export interface MaterialData {
  type: MaterialType;
  label: string;
  count: number;
  status: StatusType;
  icon: string;
}

export interface SensorData {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'online' | 'warning' | 'offline';
  lastUpdate: Date;
}

export interface Alert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface SystemHealth {
  overall: 'operational' | 'degraded' | 'critical';
  activeMachines: number;
  totalMachines: number;
  systemAccuracy: number;
  databaseSync: 'synced' | 'syncing' | 'error';
  lastSync: Date;
}

export interface DashboardData {
  materials: MaterialData[];
  sensors: SensorData[];
  alerts: Alert[];
  systemHealth: SystemHealth;
  totalProcessed: number;
  throughput: number;
  current: number;
  isLoading: boolean;
  error: string | null;
}

interface FirestoreDocument {
  name: string;
  fields: {
    metal: { integerValue: string };
    plastic: { integerValue: string };
    paper: { integerValue: string };
    other: { integerValue: string };
    throughput: { integerValue: string };
    current: { doubleValue: number };
  };
  updateTime: string;
}

const FIRESTORE_URL = 'https://firestore.googleapis.com/v1/projects/hit-200-project/databases/(default)/documents/recycling/summary';

const getMaterialIcon = (type: MaterialType): string => {
  const icons: Record<MaterialType, string> = {
    metal: '🔩',
    plastic: '♻️',
    paper: '📄',
    other: '📦',
  };
  return icons[type];
};

const getMaterialLabel = (type: MaterialType): string => {
  const labels: Record<MaterialType, string> = {
    metal: 'Metal',
    plastic: 'Plastic',
    paper: 'Paper',
    other: 'Other',
  };
  return labels[type];
};

const getStatus = (count: number, prevCount: number | null): StatusType => {
  if (prevCount === null) return 'normal';
  const diff = count - prevCount;
  if (diff > 5) return 'high-load';
  if (diff < 0) return 'low-intake';
  return 'normal';
};

export const useRecyclingData = () => {
  const [prevCounts, setPrevCounts] = useState<Record<MaterialType, number> | null>(null);
  const [data, setData] = useState<DashboardData>({
    materials: [],
    sensors: [
      { id: 's1', name: 'Current Draw', value: 0, unit: 'A', status: 'online', lastUpdate: new Date() },
      { id: 's2', name: 'Throughput Rate', value: 0, unit: 'items/min', status: 'online', lastUpdate: new Date() },
    ],
    alerts: [],
    systemHealth: {
      overall: 'operational',
      activeMachines: 1,
      totalMachines: 1,
      systemAccuracy: 98.5,
      databaseSync: 'syncing',
      lastSync: new Date(),
    },
    totalProcessed: 0,
    throughput: 0,
    current: 0,
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(FIRESTORE_URL);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const doc: FirestoreDocument = await response.json();
      
      const metal = parseInt(doc.fields.metal.integerValue, 10);
      const plastic = parseInt(doc.fields.plastic.integerValue, 10);
      const paper = parseInt(doc.fields.paper.integerValue, 10);
      const other = parseInt(doc.fields.other.integerValue, 10);
      const throughput = parseInt(doc.fields.throughput.integerValue, 10);
      const current = doc.fields.current.doubleValue;

      const materialTypes: MaterialType[] = ['metal', 'plastic', 'paper', 'other'];
      const counts: Record<MaterialType, number> = { metal, plastic, paper, other };

      const materials: MaterialData[] = materialTypes.map((type) => ({
        type,
        label: getMaterialLabel(type),
        count: counts[type],
        status: getStatus(counts[type], prevCounts?.[type] ?? null),
        icon: getMaterialIcon(type),
      }));

      const totalProcessed = metal + plastic + paper + other;

      // Generate alerts based on data
      const alerts: Alert[] = [];
      if (current > 15) {
        alerts.push({
          id: 'high-current',
          type: 'warning',
          message: `High current draw detected: ${current.toFixed(1)}A`,
          timestamp: new Date(),
          acknowledged: false,
        });
      }

      setData((prev) => ({
        ...prev,
        materials,
        sensors: [
          { id: 's1', name: 'Current Draw', value: current, unit: 'A', status: current > 15 ? 'warning' : 'online', lastUpdate: new Date() },
          { id: 's2', name: 'Throughput Rate', value: throughput, unit: 'items/min', status: 'online', lastUpdate: new Date() },
        ],
        alerts: alerts.length > 0 ? alerts : prev.alerts.filter(a => a.acknowledged),
        systemHealth: {
          ...prev.systemHealth,
          overall: current > 20 ? 'degraded' : 'operational',
          databaseSync: 'synced',
          lastSync: new Date(doc.updateTime),
        },
        totalProcessed,
        throughput,
        current,
        isLoading: false,
        error: null,
      }));

      setPrevCounts(counts);

    } catch (error) {
      console.error('Firebase fetch error:', error);
      setData((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data',
        systemHealth: {
          ...prev.systemHealth,
          databaseSync: 'error',
        },
      }));
    }
  }, [prevCounts]);

  // Initial fetch and polling every 2 seconds for real-time updates
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setData((prev) => ({
      ...prev,
      alerts: prev.alerts.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ),
    }));
  }, []);

  return { data, acknowledgeAlert, refetch: fetchData };
};
