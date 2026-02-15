import { motion } from 'framer-motion';
import { Activity, Wifi, WifiOff } from 'lucide-react';
import type { SensorData } from '@/hooks/useRecyclingData';

interface SensorPanelProps {
  sensors: SensorData[];
}

const statusColors = {
  online: 'text-status-normal',
  warning: 'text-status-warning',
  offline: 'text-status-critical',
};

export const SensorPanel = ({ sensors }: SensorPanelProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card rounded-lg p-5 border border-border card-glow h-full"
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Sensor Readings</h3>
      </div>

      <div className="space-y-3">
        {sensors.map((sensor, index) => (
          <motion.div
            key={sensor.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
          >
            <div className="flex items-center gap-3">
              <div className={`${statusColors[sensor.status]}`}>
                {sensor.status === 'offline' ? (
                  <WifiOff className="w-4 h-4" />
                ) : (
                  <Wifi className="w-4 h-4" />
                )}
              </div>
              <span className="text-sm font-medium">{sensor.name}</span>
            </div>
            <motion.div
              key={sensor.value}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="flex items-baseline gap-1"
            >
              <span className="text-lg font-bold font-mono">{sensor.value}</span>
              <span className="text-xs text-muted-foreground">{sensor.unit}</span>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
