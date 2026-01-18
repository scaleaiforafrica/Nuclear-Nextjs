'use client';

import { useState, useEffect, useMemo } from 'react';
import { subDays, differenceInDays } from 'date-fns';
import { TrendingUp, Download, Loader2 } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { toast } from 'sonner';
import { ExportMenu, ExportFormat, ShareDestination } from '@/components/ui/export-menu';
import {
  exportReportAsPDF,
  exportReportAsCSV,
  exportReportAsExcel,
  exportReportAsJSON,
  downloadBlob,
  shareReportViaEmail,
  shareReportToCloud,
  ReportData,
} from '@/lib/report-export-utils';

const EXPORT_DELAY_MS = 1000;

// Mock data structure for different report types
const MOCK_DATA = {
  'Shipment Performance': {
    baseShipments: 150,
    dailyVariance: 5,
    onTimeRate: 98.7,
    avgTransit: 18.5,
    complianceRate: 100,
  },
  'Compliance Overview': {
    baseShipments: 120,
    dailyVariance: 3,
    onTimeRate: 99.2,
    avgTransit: 17.2,
    complianceRate: 100,
  },
  'Financial Summary': {
    baseShipments: 180,
    dailyVariance: 7,
    onTimeRate: 97.5,
    avgTransit: 19.8,
    complianceRate: 98.5,
  },
  'Activity Decay Analysis': {
    baseShipments: 95,
    dailyVariance: 4,
    onTimeRate: 96.8,
    avgTransit: 20.1,
    complianceRate: 99.2,
  },
};

export default function ReportsPage() {
  const [reportType, setReportType] = useState<keyof typeof MOCK_DATA>('Shipment Performance');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Calculate filtered statistics based on current filters
  const filteredStats = useMemo(() => {
    if (!startDate || !endDate) {
      return {
        totalShipments: 0,
        onTimeDelivery: 0,
        avgTransitTime: 0,
        complianceRate: 0,
        changePercent: 0,
      };
    }

    const data = MOCK_DATA[reportType];
    const daysDiff = Math.max(1, differenceInDays(endDate, startDate));
    
    // Calculate shipments based on date range (scaled by days)
    const totalShipments = Math.floor(data.baseShipments * (daysDiff / 30));
    
    // Add some variance based on date range
    const variance = (daysDiff % 7) * data.dailyVariance;
    const adjustedShipments = totalShipments + variance;
    
    // Calculate change percentage (comparing to previous period)
    const changePercent = 5 + (daysDiff % 10) * 1.5;

    return {
      totalShipments: Math.max(1, adjustedShipments),
      onTimeDelivery: data.onTimeRate,
      avgTransitTime: data.avgTransit,
      complianceRate: data.complianceRate,
      changePercent: Number(changePercent.toFixed(1)),
    };
  }, [reportType, startDate, endDate]);

  // Initialize dates on mount
  useEffect(() => {
    const today = new Date();
    setStartDate(subDays(today, 7));
    setEndDate(today);
  }, []);



  // Handle start date change with validation
  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    
    // If end date exists and is before new start date, clear end date
    if (date && endDate && endDate < date) {
      setEndDate(undefined);
      toast.error('End date cannot be before start date');
    }
  };

  // Handle end date change with validation
  const handleEndDateChange = (date: Date | undefined) => {
    if (date && startDate && date < startDate) {
      toast.error('End date cannot be before start date');
      return;
    }
    setEndDate(date);
  };



  // Handle export report with different formats
  const handleExportReport = async (format: ExportFormat) => {
    if (!startDate || !endDate) {
      toast.error('Please select date range before exporting');
      return;
    }

    const reportData: ReportData = {
      reportType,
      startDate,
      endDate,
      totalShipments: filteredStats.totalShipments,
      onTimeDelivery: filteredStats.onTimeDelivery,
      avgTransitTime: filteredStats.avgTransitTime,
      complianceRate: filteredStats.complianceRate,
      changePercent: filteredStats.changePercent,
    };

    try {
      let blob: Blob;
      let extension: string;

      switch (format) {
        case 'pdf':
          blob = await exportReportAsPDF(reportData);
          extension = 'pdf';
          break;
        case 'csv':
          blob = await exportReportAsCSV(reportData);
          extension = 'csv';
          break;
        case 'excel':
          blob = await exportReportAsExcel(reportData);
          extension = 'xlsx';
          break;
        case 'json':
          blob = await exportReportAsJSON(reportData);
          extension = 'json';
          break;
        default:
          throw new Error('Unsupported format');
      }

      const filename = `report_${reportType.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.${extension}`;
      downloadBlob(blob, filename);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export report');
    }
  };

  // Handle share report
  const handleShareReport = async (destination: ShareDestination) => {
    if (!startDate || !endDate) {
      toast.error('Please select date range before sharing');
      return;
    }

    const reportData: ReportData = {
      reportType,
      startDate,
      endDate,
      totalShipments: filteredStats.totalShipments,
      onTimeDelivery: filteredStats.onTimeDelivery,
      avgTransitTime: filteredStats.avgTransitTime,
      complianceRate: filteredStats.complianceRate,
      changePercent: filteredStats.changePercent,
    };

    try {
      if (destination === 'email') {
        await shareReportViaEmail(reportData);
      } else {
        await shareReportToCloud(destination, reportData);
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Failed to share report');
    }
  };



  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h2 className="text-xl sm:text-2xl">Reports & Analytics</h2>
        <ExportMenu
          onExport={handleExportReport}
          onShare={handleShareReport}
          formats={['pdf', 'csv', 'excel', 'json']}
          shareDestinations={['email', 'google-drive', 'dropbox', 'onedrive']}
          disabled={!startDate || !endDate}
          buttonText="Export Report"
          buttonVariant="default"
          showShareOptions={true}
        />
      </div>

      {/* Report Filters */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-2">Report Type</label>
            <select 
              value={reportType}
              onChange={(e) => setReportType(e.target.value as keyof typeof MOCK_DATA)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option>Shipment Performance</option>
              <option>Compliance Overview</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-2">Start Date</label>
            <DatePicker 
              date={startDate}
              onDateChange={handleStartDateChange}
              placeholder="Pick a date"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">End Date</label>
            <DatePicker 
              date={endDate}
              onDateChange={handleEndDateChange}
              placeholder="Pick a date"
            />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        {[
          { 
            label: 'Total Shipments', 
            value: filteredStats.totalShipments.toString(), 
            change: `+${filteredStats.changePercent}%`, 
            color: 'blue' 
          },
          { 
            label: 'On-Time Delivery', 
            value: `${filteredStats.onTimeDelivery}%`, 
            change: '+2.3%', 
            color: 'green' 
          },
          { 
            label: 'Avg Transit Time', 
            value: `${filteredStats.avgTransitTime}h`, 
            change: '-1.2h', 
            color: 'purple' 
          },
          { 
            label: 'Compliance Rate', 
            value: `${filteredStats.complianceRate}%`, 
            change: '0%', 
            color: 'green' 
          },
        ].map((metric, index) => (
          <div key={index} className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
            <div className="text-xs sm:text-sm text-gray-600 mb-2">{metric.label}</div>
            <div className="text-2xl sm:text-3xl mb-2">{metric.value}</div>
            <div className={`text-xs sm:text-sm ${metric.change.startsWith('+') ? 'text-green-600' : metric.change.startsWith('-') && metric.label === 'Avg Transit Time' ? 'text-green-600' : 'text-gray-600'} flex items-center gap-1`}>
              <TrendingUp className="w-4 h-4" />
              {metric.change} from last period
            </div>
          </div>
        ))}
      </div>


      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg mb-4">Shipments by Status</h3>
          <div className="h-64 flex items-end justify-around gap-2">
            {[
              { label: 'Delivered', value: 85, color: 'bg-green-600' },
              { label: 'In Transit', value: 65, color: 'bg-blue-600' },
              { label: 'At Customs', value: 35, color: 'bg-amber-600' },
              { label: 'Dispatched', value: 45, color: 'bg-purple-600' },
            ].map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full ${item.color} rounded-t-lg transition-all hover:opacity-80`}
                  style={{ height: `${item.value}%` }}
                ></div>
                <div className="text-sm mt-2 text-center">{item.label}</div>
                <div className="text-xs text-gray-500">{Math.floor(filteredStats.totalShipments * item.value / 100)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg mb-4">Isotope Distribution</h3>
          <div className="flex items-center justify-center h-48 sm:h-56 lg:h-64">
            <div className="relative w-40 h-40 sm:w-48 sm:h-48">
              {/* Donut Chart Visualization */}
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="20" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#7C3AED" strokeWidth="20" 
                  strokeDasharray="75 251" strokeDashoffset="0" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" strokeWidth="20" 
                  strokeDasharray="63 251" strokeDashoffset="-75" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="20" 
                  strokeDasharray="50 251" strokeDashoffset="-138" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#F59E0B" strokeWidth="20" 
                  strokeDasharray="38 251" strokeDashoffset="-188" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl">{filteredStats.totalShipments}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {[
              { label: 'Tc-99m', color: 'bg-purple-600', percent: '42%' },
              { label: 'F-18 FDG', color: 'bg-blue-600', percent: '28%' },
              { label: 'I-131', color: 'bg-green-600', percent: '18%' },
              { label: 'Lu-177', color: 'bg-amber-600', percent: '12%' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                <span className="text-sm">{item.label}</span>
                <span className="text-sm text-gray-500 ml-auto">{item.percent}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Trends */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
        <h3 className="text-base sm:text-lg mb-4">Shipment Activity Trends (Last 30 Days)</h3>
        <div className="h-48 sm:h-56 lg:h-64 flex items-end gap-1">
          {Array.from({ length: 30 }).map((_, i) => {
            const height = 30 + Math.random() * 70;
            return (
              <div key={i} className="flex-1 flex flex-col justify-end group relative">
                <div 
                  className="bg-gradient-to-t from-purple-600 to-blue-600 rounded-t hover:opacity-80 transition-all"
                  style={{ height: `${height}%` }}
                ></div>
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Day {i + 1}: {Math.floor(height / 10)} shipments
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
