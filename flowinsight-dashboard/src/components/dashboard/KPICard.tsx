import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'critical';
}

const variantStyles = {
  default: 'border-border',
  success: 'border-status-normal/30',
  warning: 'border-status-warning/30',
  critical: 'border-status-critical/30',
};

const iconVariantStyles = {
  default: 'text-primary bg-primary/10',
  success: 'text-status-normal bg-status-normal/10',
  warning: 'text-status-warning bg-status-warning/10',
  critical: 'text-status-critical bg-status-critical/10',
};

export const KPICard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
}: KPICardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card rounded-lg p-5 border ${variantStyles[variant]} card-glow`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <motion.p
            key={String(value)}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold font-mono tracking-tight"
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </motion.p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconVariantStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      {trend && trendValue && (
        <div className="mt-3 flex items-center gap-1">
          <span
            className={`text-xs font-medium ${
              trend === 'up'
                ? 'text-status-normal'
                : trend === 'down'
                ? 'text-status-critical'
                : 'text-muted-foreground'
            }`}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </span>
          <span className="text-xs text-muted-foreground">vs yesterday</span>
        </div>
      )}
    </motion.div>
  );
};
