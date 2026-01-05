import { Shield, AlertTriangle, CheckCircle, FileText, Download, Upload, Eye } from 'lucide-react';
import { useState } from 'react';

export function ComplianceModule() {
  const [selectedShipment, setSelectedShipment] = useState('SH-2851');

  const documents = [
    { 
      name: 'Certificate of Analysis', 
      description: 'Quality assurance documentation',
      required: ['South Africa', 'Namibia'],
      status: 'complete', 
      statusColor: 'text-green-600',
      statusBg: 'bg-green-50',
      icon: CheckCircle
    },
    { 
      name: 'Transport Permit', 
      description: 'Nuclear material transport authorization',
      required: ['South Africa'],
      status: 'complete', 
      statusColor: 'text-green-600',
      statusBg: 'bg-green-50',
      icon: CheckCircle
    },
    { 
      name: 'Customs Declaration', 
      description: 'International shipping documentation',
      required: ['South Africa', 'International'],
      status: 'in-progress', 
      statusColor: 'text-amber-600',
      statusBg: 'bg-amber-50',
      icon: AlertTriangle
    },
    { 
      name: 'Radiation Safety Certificate', 
      description: 'Safety compliance certification',
      required: ['All jurisdictions'],
      status: 'expired', 
      statusColor: 'text-red-600',
      statusBg: 'bg-red-50',
      icon: AlertTriangle
    },
    { 
      name: 'Insurance Certificate', 
      description: 'Shipment insurance documentation',
      required: ['International'],
      status: 'complete', 
      statusColor: 'text-green-600',
      statusBg: 'bg-green-50',
      icon: CheckCircle
    },
    { 
      name: 'Export License', 
      description: 'Export authorization for nuclear materials',
      required: ['International'],
      status: 'not-started', 
      statusColor: 'text-gray-600',
      statusBg: 'bg-gray-50',
      icon: FileText
    },
  ];

  return (
    <div>
      <h2 className="text-2xl mb-6">Compliance & Regulatory</h2>

      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-3xl">87%</div>
              <div className="text-sm text-gray-600">Documents Compliant</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="text-3xl">5</div>
              <div className="text-sm text-gray-600">Expiring Soon</div>
            </div>
          </div>
          <p className="text-sm text-amber-600">Review within 7 days</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-3xl">2</div>
              <div className="text-sm text-gray-600">Action Required</div>
            </div>
          </div>
          <p className="text-sm text-red-600">Immediate attention needed</p>
        </div>
      </div>

      {/* Jurisdiction Map */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <h3 className="text-xl mb-4">Compliance by Jurisdiction</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { country: 'South Africa', status: 'compliant', color: 'bg-green-100 text-green-700' },
            { country: 'Kenya', status: 'compliant', color: 'bg-green-100 text-green-700' },
            { country: 'Nigeria', status: 'review', color: 'bg-amber-100 text-amber-700' },
            { country: 'Egypt', status: 'action-needed', color: 'bg-red-100 text-red-700' },
          ].map((jurisdiction) => (
            <div key={jurisdiction.country} className={`${jurisdiction.color} rounded-lg p-4 text-center`}>
              <div className="font-medium mb-1">{jurisdiction.country}</div>
              <div className="text-xs capitalize">{jurisdiction.status.replace('-', ' ')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts Panel */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <h3 className="text-xl mb-4">Urgent Alerts</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-red-900 mb-1">Radiation Safety Certificate Expired</div>
              <p className="text-sm text-red-700">Shipment #SH-2851 - Renew immediately to avoid shipment delays</p>
              <button className="text-sm text-red-600 hover:text-red-700 mt-2 underline">
                Renew Now
              </button>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-amber-900 mb-1">3 Transport Permits Expiring in 7 Days</div>
              <p className="text-sm text-amber-700">Review and renew transport permits for continued operations</p>
              <button className="text-sm text-amber-600 hover:text-amber-700 mt-2 underline">
                Review Permits
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Checklist */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl mb-1">Document Checklist</h3>
            <p className="text-sm text-gray-600">Shipment #SH-2851</p>
          </div>
          <div className="flex gap-2">
            <select 
              value={selectedShipment}
              onChange={(e) => setSelectedShipment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="SH-2851">SH-2851</option>
              <option value="SH-2850">SH-2850</option>
              <option value="SH-2849">SH-2849</option>
            </select>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Generate All Missing
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {documents.map((doc, index) => {
              const Icon = doc.icon;
              return (
                <div 
                  key={index}
                  className={`${doc.statusBg} border ${doc.statusColor.replace('text-', 'border-')} rounded-xl p-6`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 ${doc.statusBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${doc.statusColor}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{doc.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Required for:</span>
                          {doc.required.map((jurisdiction, i) => (
                            <span key={i} className="px-2 py-1 bg-white rounded border border-gray-200">
                              {jurisdiction}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {doc.status === 'complete' && (
                        <>
                          <button className="p-2 hover:bg-white rounded-lg transition-colors" title="View">
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-white rounded-lg transition-colors" title="Download">
                            <Download className="w-4 h-4 text-gray-600" />
                          </button>
                        </>
                      )}
                      {doc.status === 'in-progress' && (
                        <button className="px-4 py-2 bg-white border border-amber-600 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors">
                          Upload Document
                        </button>
                      )}
                      {doc.status === 'expired' && (
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                          Renew Now
                        </button>
                      )}
                      {doc.status === 'not-started' && (
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                          Generate
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-xs ${doc.statusColor} capitalize`}>
                      Status: {doc.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
