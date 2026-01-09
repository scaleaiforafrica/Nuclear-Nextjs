import { CheckCircle, FileText, Award, AlertTriangle } from 'lucide-react';

export function QualityCompliance() {
  const certifications = [
    'ISO 9001:2015',
    'FDA 21 CFR Part 11',
    'IATA Regulations',
    'DOT Compliance',
    'HIPAA Compliant',
    'GMP Certified'
  ];

  return (
    <section id="quality-compliance" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-block px-4 py-2 bg-green-100 rounded-full mb-6">
              <span className="text-green-600">Quality & Compliance</span>
            </div>
            <h2 className="text-5xl mb-6">
              International Quality & Compliance Assurance
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Our platform is built to meet the strictest regulatory standards for nuclear medicine logistics worldwide.
            </p>

            {/* Key Points */}
            <div className="space-y-4 mb-8">
              {[
                'Automated compliance documentation',
                'Real-time audit trail generation',
                'International shipping regulations',
                'Temperature & handling validation',
                'Digital signature verification'
              ].map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{point}</span>
                </div>
              ))}
            </div>

            <button className="bg-green-600 text-white px-8 py-4 rounded-full hover:bg-green-700 transition-colors">
              Download Compliance Guide
            </button>
          </div>

          {/* Right Content - Certifications & Stats */}
          <div className="space-y-6">
            {/* Certifications Grid */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-8 border border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-7 h-7 text-green-600" />
                <h3 className="text-2xl">Certifications</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {certifications.map((cert, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 border border-green-200 text-center hover:scale-105 transition-transform">
                    <span className="text-sm">{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Score */}
            <div className="bg-gray-900 text-white rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl">Compliance Score</h3>
                <FileText className="w-7 h-7 text-blue-400" />
              </div>
              <div className="flex items-end gap-4 mb-4">
                <div className="text-6xl">100</div>
                <div className="text-2xl text-gray-400 mb-2">/100</div>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 mb-4">
                <div className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <p className="text-gray-400">All regulatory requirements met</p>
            </div>

            {/* Alert System */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 border border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-7 h-7 text-orange-600" />
                <h3 className="text-2xl">Proactive Monitoring</h3>
              </div>
              <p className="text-gray-700 mb-4">
                24/7 automated monitoring with instant alerts for any compliance or quality issues.
              </p>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
