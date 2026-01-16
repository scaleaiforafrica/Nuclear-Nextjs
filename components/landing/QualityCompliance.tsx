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
    <section className="py-16 sm:py-20 lg:py-24 bg-card">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-md mb-4 sm:mb-6 border border-primary/20">
              <span className="text-primary font-medium text-sm sm:text-base">Quality & Compliance</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 text-foreground font-semibold">
              Regulatory Compliance & Quality Assurance
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8">
              Built to meet international regulatory standards for nuclear medicine logistics.
            </p>

            {/* Key Points */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {[
                'Automated compliance documentation',
                'Real-time audit trail generation',
                'International shipping regulations',
                'Temperature & handling validation',
                'Digital signature verification'
              ].map((point, index) => (
                <div key={index} className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-secondary flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span className="text-foreground text-sm sm:text-base">{point}</span>
                </div>
              ))}
            </div>

            <button className="w-full sm:w-auto bg-primary text-primary-foreground px-6 sm:px-8 py-3 rounded-md hover:bg-primary/90 transition-colors font-medium text-sm sm:text-base touch-manipulation min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              View Compliance Documentation
            </button>
          </div>

          {/* Right Content - Certifications & Stats */}
          <div className="space-y-4 sm:space-y-6">
            {/* Certifications Grid */}
            <div className="bg-background rounded-md p-5 sm:p-6 lg:p-8 border border-secondary/20">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <Award className="w-6 h-6 sm:w-7 sm:h-7 text-secondary" strokeWidth={1.5} />
                <h3 className="text-xl sm:text-2xl text-foreground font-medium">Certifications</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {certifications.map((cert, index) => (
                  <div key={index} className="bg-card rounded-md p-3 sm:p-4 border border-secondary/20 text-center hover:shadow-sm transition-shadow">
                    <span className="text-xs sm:text-sm text-foreground">{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Score */}
            <div className="bg-primary text-white rounded-md p-5 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-medium">Compliance Score</h3>
                <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={1.5} />
              </div>
              <div className="flex items-end gap-2 sm:gap-4 mb-3 sm:mb-4">
                <div className="text-5xl sm:text-6xl">100</div>
                <div className="text-xl sm:text-2xl text-white/60 mb-1 sm:mb-2">/100</div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5 sm:h-3 mb-3 sm:mb-4">
                <div className="bg-secondary h-2.5 sm:h-3 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <p className="text-white/80 text-sm sm:text-base">All regulatory requirements met</p>
            </div>

            {/* Alert System */}
            <div className="bg-background rounded-md p-5 sm:p-6 lg:p-8 border border-secondary/20">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-secondary" strokeWidth={1.5} />
                <h3 className="text-xl sm:text-2xl text-foreground font-medium">Proactive Monitoring</h3>
              </div>
              <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">
                24/7 automated monitoring with instant alerts for any compliance or quality issues.
              </p>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-secondary">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
