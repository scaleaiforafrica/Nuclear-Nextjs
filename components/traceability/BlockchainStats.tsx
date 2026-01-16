'use client';

import { ChainStatistics } from '@/models/blockchain.model';
import { Package, Activity, CheckCircle, TrendingUp, BarChart3, Shield } from 'lucide-react';

interface BlockchainStatsProps {
  stats: ChainStatistics;
}

export function BlockchainStats({ stats }: BlockchainStatsProps) {
  const statCards = [
    {
      label: 'Total Events',
      value: stats.totalEvents.toLocaleString(),
      icon: Activity,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Total Shipments',
      value: stats.totalShipments.toLocaleString(),
      icon: Package,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Events Today',
      value: stats.eventsToday.toLocaleString(),
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Verification Rate',
      value: `${(stats.verificationRate * 100).toFixed(1)}%`,
      icon: CheckCircle,
      color: 'bg-cyan-100 text-cyan-600',
    },
    {
      label: 'Avg Events/Shipment',
      value: stats.averageEventsPerShipment.toFixed(1),
      icon: BarChart3,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'Chain Integrity',
      value: `${stats.chainIntegrityPercentage.toFixed(1)}%`,
      icon: Shield,
      color: 'bg-green-100 text-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
