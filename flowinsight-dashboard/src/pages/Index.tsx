import { Package, Scale, Cpu, Activity } from 'lucide-react';
import { useRecyclingData } from '@/hooks/useRecyclingData';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { KPICard } from '@/components/dashboard/KPICard';
import { MaterialCard } from '@/components/dashboard/MaterialCard';
import { SensorPanel } from '@/components/dashboard/SensorPanel';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { SystemHealthCard } from '@/components/dashboard/SystemHealthCard';
import { MaterialCharts } from '@/components/dashboard/MaterialCharts';
import { ThroughputDisplay } from '@/components/dashboard/ThroughputDisplay';

const Index = () => {
  const { data, acknowledgeAlert } = useRecyclingData();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="p-6 space-y-6">
        {/* KPI Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Processed"
            value={data.totalProcessed}
            subtitle="All-time items"
            icon={Package}
            trend="up"
            trendValue="+12.5%"
            variant="success"
          />
          <KPICard
            title="Throughput"
            value={`${data.throughput} items/min`}
            subtitle="Processing rate"
            icon={Scale}
            trend="up"
            trendValue="Live"
          />
          <KPICard
            title="Current Draw"
            value={`${data.current.toFixed(1)} A`}
            subtitle="Power consumption"
            icon={Activity}
            variant={data.current > 15 ? 'warning' : 'default'}
          />
          <KPICard
            title="Active Machines"
            value={`${data.systemHealth.activeMachines}/${data.systemHealth.totalMachines}`}
            subtitle="Operational units"
            icon={Cpu}
            variant={data.systemHealth.activeMachines < data.systemHealth.totalMachines ? 'warning' : 'success'}
          />
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Materials & Charts */}
          <div className="lg:col-span-3 space-y-6">
            {/* Throughput Display */}
            <ThroughputDisplay 
              materials={data.materials} 
              throughput={data.throughput} 
              current={data.current} 
            />

            {/* Material Cards */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Material Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {data.materials.map((material) => (
                  <MaterialCard key={material.type} material={material} />
                ))}
              </div>
            </section>

            {/* Charts */}
            <MaterialCharts materials={data.materials} />
          </div>

          {/* Right Column - Status & Sensors */}
          <div className="space-y-6">
            <SystemHealthCard health={data.systemHealth} />
            <SensorPanel sensors={data.sensors} />
            <AlertsPanel alerts={data.alerts} onAcknowledge={acknowledgeAlert} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
