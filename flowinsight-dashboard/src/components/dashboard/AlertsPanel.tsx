import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, XCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Alert } from '@/hooks/useRecyclingData';
import { formatDistanceToNow } from 'date-fns';

interface AlertsPanelProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
}

const alertStyles = {
  info: {
    icon: Info,
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    iconColor: 'text-primary',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-status-warning/10',
    border: 'border-status-warning/30',
    iconColor: 'text-status-warning',
  },
  critical: {
    icon: XCircle,
    bg: 'bg-status-critical/10',
    border: 'border-status-critical/30',
    iconColor: 'text-status-critical',
  },
};

export const AlertsPanel = ({ alerts, onAcknowledge }: AlertsPanelProps) => {
  const activeAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card rounded-lg p-5 border border-border card-glow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-status-warning" />
          <h3 className="font-semibold">System Alerts</h3>
        </div>
        <span className="px-2 py-1 bg-status-warning/20 text-status-warning text-xs font-medium rounded-full">
          {activeAlerts.length} active
        </span>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        <AnimatePresence>
          {alerts.map((alert, index) => {
            const style = alertStyles[alert.type];
            const Icon = style.icon;

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: alert.acknowledged ? 0.5 : 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 rounded-lg border ${style.bg} ${style.border} ${
                  alert.acknowledged ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 ${style.iconColor} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                  {!alert.acknowledged && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAcknowledge(alert.id)}
                      className="flex-shrink-0"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {alerts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Check className="w-8 h-8 mx-auto mb-2 text-status-normal" />
            <p className="text-sm">All systems operational</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
