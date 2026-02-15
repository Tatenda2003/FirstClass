import { motion } from 'framer-motion';
import { TrendingUp, Zap, Activity } from 'lucide-react';
import type { MaterialData } from '@/hooks/useRecyclingData';

interface ThroughputDisplayProps {
  materials: MaterialData[];
  throughput: number;
  current: number;
}

export const ThroughputDisplay = ({ materials, throughput, current }: ThroughputDisplayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-primary/20 via-card to-glass/10 rounded-lg p-6 border border-primary/30 relative overflow-hidden"
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      
      <div className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Throughput */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-muted-foreground">Throughput</h3>
            </div>
            
            <div className="flex items-baseline gap-2">
              <motion.span
                key={throughput}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-5xl font-bold font-mono text-primary counter-glow"
              >
                {throughput}
              </motion.span>
              <span className="text-lg text-muted-foreground">items/min</span>
            </div>
          </div>

          {/* Current Draw */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-status-warning" />
              <h3 className="font-semibold text-muted-foreground">Current Draw</h3>
            </div>
            
            <div className="flex items-baseline gap-2">
              <motion.span
                key={current}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-5xl font-bold font-mono text-status-warning counter-glow"
              >
                {current.toFixed(1)}
              </motion.span>
              <span className="text-lg text-muted-foreground">Amps</span>
            </div>
          </div>
        </div>

        {/* Material breakdown */}
        <div className="mt-6 grid grid-cols-4 gap-2">
          {materials.map((material) => (
            <div
              key={material.type}
              className="flex flex-col items-center p-3 rounded-lg bg-background/50"
            >
              <span className="text-2xl mb-1">{material.icon}</span>
              <span className="text-xs text-muted-foreground mb-1">{material.label}</span>
              <motion.span
                key={material.count}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="text-lg font-mono font-bold"
              >
                {material.count}
              </motion.span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-status-normal">
          <TrendingUp className="w-4 h-4" />
          <span>Live data from Firebase</span>
        </div>
      </div>
    </motion.div>
  );
};
