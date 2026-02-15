import { motion } from 'framer-motion';
import { Server, Database, Gauge, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { SystemHealth } from '@/hooks/useRecyclingData';

interface SystemHealthCardProps {
  health: SystemHealth;
}

const overallStatusStyles = {
  operational: {
    icon: CheckCircle,
    color: 'text-status-normal',
    bg: 'bg-status-normal/10',
    label: 'All Systems Operational',
  },
  degraded: {
    icon: AlertTriangle,
    color: 'text-status-warning',
    bg: 'bg-status-warning/10',
    label: 'Degraded Performance',
  },
  critical: {
    icon: XCircle,
    color: 'text-status-critical',
    bg: 'bg-status-critical/10',
    label: 'Critical Issues',
  },
};

const syncStatusStyles = {
  synced: { color: 'text-status-normal', label: 'Synced' },
  syncing: { color: 'text-status-warning', label: 'Syncing...' },
  error: { color: 'text-status-critical', label: 'Sync Error' },
};

export const SystemHealthCard = ({ health }: SystemHealthCardProps) => {
  const status = overallStatusStyles[health.overall];
  const syncStatus = syncStatusStyles[health.databaseSync];
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg p-5 border border-border card-glow"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${status.bg}`}>
          <StatusIcon className={`w-6 h-6 ${status.color}`} />
        </div>
        <div>
          <h3 className="font-semibold">System Health</h3>
          <p className={`text-sm ${status.color}`}>{status.label}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Accuracy Gauge */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-muted-foreground" />
              <span>System Accuracy</span>
            </div>
            <motion.span
              key={health.systemAccuracy}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="font-bold font-mono text-primary"
            >
              {health.systemAccuracy}%
            </motion.span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${health.systemAccuracy}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary to-glass rounded-full"
            />
          </div>
        </div>

        {/* Active Machines */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Active Machines</span>
          </div>
          <span className="font-bold font-mono">
            <span className="text-primary">{health.activeMachines}</span>
            <span className="text-muted-foreground">/{health.totalMachines}</span>
          </span>
        </div>

        {/* Database Sync */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Database</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              health.databaseSync === 'synced' ? 'bg-status-normal' :
              health.databaseSync === 'syncing' ? 'bg-status-warning animate-pulse' :
              'bg-status-critical'
            }`} />
            <span className={`text-sm font-medium ${syncStatus.color}`}>
              {syncStatus.label}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
