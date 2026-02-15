import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { MaterialData } from '@/hooks/useRecyclingData';

interface MaterialChartsProps {
  materials: MaterialData[];
}

const COLORS = {
  metal: 'hsl(215, 25%, 50%)',
  plastic: 'hsl(38, 92%, 50%)',
  paper: 'hsl(30, 40%, 55%)',
  glass: 'hsl(185, 80%, 45%)',
  other: 'hsl(260, 50%, 60%)',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">
          {payload[0].value.toLocaleString()} items
        </p>
      </div>
    );
  }
  return null;
};

export const MaterialCharts = ({ materials }: MaterialChartsProps) => {
  const barData = materials.map(m => ({
    name: m.label,
    count: m.count,
    fill: COLORS[m.type],
  }));

  const pieData = materials.map(m => ({
    name: m.label,
    value: m.count,
    color: COLORS[m.type],
  }));

  const total = pieData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-lg p-5 border border-border card-glow"
      >
        <h3 className="font-semibold mb-4">Material Counts</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
            <XAxis
              dataKey="name"
              tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(220, 15%, 22%)' }}
            />
            <YAxis
              tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(220, 15%, 22%)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-lg p-5 border border-border card-glow"
      >
        <h3 className="font-semibold mb-4">Material Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [
                `${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`,
                'Items',
              ]}
              contentStyle={{
                backgroundColor: 'hsl(220, 18%, 13%)',
                border: '1px solid hsl(220, 15%, 22%)',
                borderRadius: '8px',
              }}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: 'hsl(210, 20%, 95%)' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};
