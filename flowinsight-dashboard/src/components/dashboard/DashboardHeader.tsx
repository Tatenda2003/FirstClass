import { motion } from 'framer-motion';
import { Recycle, Wifi, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export const DashboardHeader = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-6 py-4 bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Recycle className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">EcoSort Pro</h1>
            <p className="text-sm text-muted-foreground">Recycling Plant Dashboard</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Live Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-normal/10 border border-status-normal/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-normal opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-status-normal" />
          </span>
          <span className="text-sm font-medium text-status-normal">LIVE</span>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Wifi className="w-4 h-4 text-status-normal" />
          <span className="text-sm">Connected</span>
        </div>

        {/* Current Time */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-mono">
            {format(currentTime, 'HH:mm:ss')}
          </span>
          <span className="text-sm">
            {format(currentTime, 'MMM dd, yyyy')}
          </span>
        </div>
      </div>
    </motion.header>
  );
};
