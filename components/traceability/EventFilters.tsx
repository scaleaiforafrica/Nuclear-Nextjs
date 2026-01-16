'use client';

import { useState } from 'react';
import { EventQueryFilters, BlockchainEventType } from '@/models/blockchain.model';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface EventFiltersProps {
  filters: EventQueryFilters;
  onFilterChange: (filters: EventQueryFilters) => void;
}

const EVENT_TYPES: BlockchainEventType[] = [
  'shipment_created',
  'dispatch',
  'pickup',
  'in_transit',
  'checkpoint',
  'customs_check',
  'customs_cleared',
  'customs_hold',
  'temperature_reading',
  'temperature_alert',
  'delivery',
  'receipt_confirmation',
];

const ACTOR_TYPES = ['user', 'system', 'iot_sensor', 'api'];
const LOCATION_TYPES = ['facility', 'checkpoint', 'vehicle', 'port', 'customs', 'destination'];

export function EventFilters({ filters, onFilterChange }: EventFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleEventTypeChange = (value: string) => {
    onFilterChange({ ...filters, eventType: value as BlockchainEventType });
  };

  const handleActorTypeChange = (value: string) => {
    onFilterChange({ ...filters, actorType: value as any });
  };

  const handleLocationTypeChange = (value: string) => {
    onFilterChange({ ...filters, locationType: value as any });
  };

  const handleVerifiedChange = (value: string) => {
    const verified = value === 'all' ? undefined : value === 'true';
    onFilterChange({ ...filters, verified });
  };

  const handleStartDateChange = (value: string) => {
    onFilterChange({ ...filters, startDate: value ? new Date(value) : undefined });
  };

  const handleEndDateChange = (value: string) => {
    onFilterChange({ ...filters, endDate: value ? new Date(value) : undefined });
  };

  const handleClearFilters = () => {
    onFilterChange({
      shipmentId: filters.shipmentId, // Keep shipment ID
    });
  };

  const hasActiveFilters =
    filters.eventType ||
    filters.actorType ||
    filters.locationType ||
    filters.verified !== undefined ||
    filters.startDate ||
    filters.endDate;

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors min-h-[44px]"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">Filters</span>
          {hasActiveFilters && (
            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
              Active
            </span>
          )}
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Filters */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-200 pt-4">
          {/* Event Type */}
          <div className="space-y-2">
            <Label htmlFor="eventType" className="text-sm font-medium">
              Event Type
            </Label>
            <Select
              value={filters.eventType as string || 'all'}
              onValueChange={handleEventTypeChange}
            >
              <SelectTrigger id="eventType" className="min-h-[44px]">
                <SelectValue placeholder="All event types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All event types</SelectItem>
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actor Type */}
          <div className="space-y-2">
            <Label htmlFor="actorType" className="text-sm font-medium">
              Actor Type
            </Label>
            <Select
              value={filters.actorType || 'all'}
              onValueChange={handleActorTypeChange}
            >
              <SelectTrigger id="actorType" className="min-h-[44px]">
                <SelectValue placeholder="All actor types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actor types</SelectItem>
                {ACTOR_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Type */}
          <div className="space-y-2">
            <Label htmlFor="locationType" className="text-sm font-medium">
              Location Type
            </Label>
            <Select
              value={filters.locationType || 'all'}
              onValueChange={handleLocationTypeChange}
            >
              <SelectTrigger id="locationType" className="min-h-[44px]">
                <SelectValue placeholder="All location types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All location types</SelectItem>
                {LOCATION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="min-h-[44px]"
              />
            </div>
          </div>

          {/* Verified Status */}
          <div className="space-y-2">
            <Label htmlFor="verified" className="text-sm font-medium">
              Verification Status
            </Label>
            <Select
              value={
                filters.verified === undefined ? 'all' : filters.verified ? 'true' : 'false'
              }
              onValueChange={handleVerifiedChange}
            >
              <SelectTrigger id="verified" className="min-h-[44px]">
                <SelectValue placeholder="All events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All events</SelectItem>
                <SelectItem value="true">Verified only</SelectItem>
                <SelectItem value="false">Unverified only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="w-full min-h-[44px]"
            >
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
