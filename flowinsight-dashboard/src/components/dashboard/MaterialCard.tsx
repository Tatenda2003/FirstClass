import { motion } from 'framer-motion';
import type { MaterialData } from '@/hooks/useRecyclingData';

interface MaterialCardProps {
  material: MaterialData;
}

const materialStyles: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  metal: {
    bg: 'bg-metal/10',
    border: 'border-metal/30',
    text: 'text-metal',
    glow: 'shadow-[0_0_20px_hsl(215_25%_50%/0.3)]',
  },
  plastic: {
    bg: 'bg-plastic/10',
    border: 'border-plastic/30',
    text: 'text-plastic',
    glow: 'shadow-[0_0_20px_hsl(38_92%_50%/0.3)]',
  },
  paper: {
    bg: 'bg-paper/10',
    border: 'border-paper/30',
    text: 'text-paper',
    glow: 'shadow-[0_0_20px_hsl(30_40%_55%/0.3)]',
  },
  glass: {
    bg: 'bg-glass/10',
    border: 'border-glass/30',
    text: 'text-glass',
    glow: 'shadow-[0_0_20px_hsl(185_80%_45%/0.3)]',
  },
  other: {
    bg: 'bg-other/10',
    border: 'border-other/30',
    text: 'text-other',
    glow: 'shadow-[0_0_20px_hsl(260_50%_60%/0.3)]',
  },
};

const statusStyles = {
  normal: { bg: 'bg-status-normal', text: 'Normal' },
  'high-load': { bg: 'bg-status-warning', text: 'High Load' },
  'low-intake': { bg: 'bg-status-critical', text: 'Low Intake' },
  offline: { bg: 'bg-status-offline', text: 'Offline' },
};

export const MaterialCard = ({ material }: MaterialCardProps) => {
  const styles = materialStyles[material.type];
  const status = statusStyles[material.status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-card rounded-lg p-5 border ${styles.border} card-glow hover:${styles.glow} transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg ${styles.bg} flex items-center justify-center text-2xl`}>
            {material.icon}
          </div>
          <div>
            <h3 className={`font-semibold text-lg ${styles.text}`}>{material.label}</h3>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${status.bg} status-pulse`} />
              <span className="text-xs text-muted-foreground">{status.text}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-1">Count</p>
        <motion.p
          key={material.count}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold font-mono"
        >
          {material.count.toLocaleString()}
        </motion.p>
      </div>
    </motion.div>
  );
};
