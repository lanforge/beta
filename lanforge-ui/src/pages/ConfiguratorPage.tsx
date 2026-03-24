import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Configurator from '../components/Configurator';

interface CaseOption {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  formFactor: string;
  color: string;
}

const ConfiguratorPage: React.FC = () => {
  const [caseOptions, setCaseOptions] = useState<CaseOption[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseOption | null>(null);
  const [showConfigurator, setShowConfigurator] = useState(false);

  React.useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/pc-parts?type=case&limit=50`)
      .then(res => res.json())
      .then(data => {
        if (data.parts) {
          const mapped = data.parts.map((p: any) => ({
            id: p._id,
            name: p.name,
            description: p.brand + ' ' + p.model,
            price: p.price,
            image: p.images?.[0] || 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&auto=format&fit=crop',
            formFactor: p.specs?.formFactor || 'Mid-Tower',
            color: p.specs?.color || 'Black'
          }));
          // Sort cases from least expensive to most expensive
          mapped.sort((a: any, b: any) => a.price - b.price);
          setCaseOptions(mapped);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleCaseSelect = (caseOption: CaseOption) => {
    setSelectedCase(caseOption);
    setShowConfigurator(true);
    // Scroll to configurator section
    setTimeout(() => {
      document.getElementById('configurator-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleBackToCases = () => {
    setShowConfigurator(false);
    // Scroll to cases section
    setTimeout(() => {
      document.getElementById('cases-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (showConfigurator && selectedCase) {
    return (
      <div className="min-h-screen bg-gray-950">
        {/* Selected Case Header */}
        <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 py-4">
          <div className="container-narrow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Selected Case: {selectedCase.name}</h2>
                <p className="text-gray-400 text-sm">{selectedCase.description} • ${selectedCase.price}</p>
              </div>
              <button 
                className="btn btn-outline"
                onClick={handleBackToCases}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Change Case
              </button>
            </div>
          </div>
        </div>

        {/* Configurator Section */}
        <div id="configurator-section">
          <Configurator selectedCase={selectedCase} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-10 md:py-16">
        <div className="absolute inset-0 bg-gradient-radial from-emerald-400/10 via-transparent to-transparent" />
        <div className="container-narrow relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="heading-1 mb-6">
              Build Your Dream PC
            </h1>
            <p className="body-large max-w-3xl mx-auto mb-10">
              Start by choosing the perfect case for your custom build. Your selection determines 
              compatibility, aesthetics, and the foundation for your dream gaming PC.
            </p>
            
            {/* Build Progress */}
            <div className="flex items-center justify-center gap-8 mb-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">Choose Case</div>
                  <div className="text-sm text-gray-400">Select foundation</div>
                </div>
              </div>
              
              <div className="h-1 w-16 bg-gray-700" />
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-bold">
                  2
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-400">Select Components</div>
                  <div className="text-sm text-gray-500">Customize specs</div>
                </div>
              </div>
              
              <div className="h-1 w-16 bg-gray-700" />
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-bold">
                  3
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-400">Review & Order</div>
                  <div className="text-sm text-gray-500">Finalize build</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cases Grid */}
      <section id="cases-section" className="section">
        <div className="container-narrow">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Choose Your Case</h2>
            <p className="body-large max-w-2xl mx-auto">
              {caseOptions.length} premium cases available. Click any case to start customizing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caseOptions.map((caseOption, index) => (
              <motion.div
                key={caseOption.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`card-glow cursor-pointer group ${selectedCase?.id === caseOption.id ? 'ring-2 ring-emerald-500' : ''}`}
                onClick={() => handleCaseSelect(caseOption)}
              >
                <div className="p-6">
                  {/* Case Image */}
                  <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ 
                        backgroundImage: `url(${caseOption.image})`,
                        backgroundColor: caseOption.color.toLowerCase().includes('black') ? '#333' : 
                                       caseOption.color.toLowerCase().includes('white') ? '#f5f5f5' : 
                                       caseOption.color.toLowerCase().includes('silver') ? '#e0e0e0' : '#8B4513'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className="badge-accent">
                        ${caseOption.price}
                      </div>
                    </div>
                  </div>

                  {/* Case Info */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{caseOption.name}</h3>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs px-2 py-1 bg-gray-800/50 rounded text-gray-300">
                        {caseOption.formFactor}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-800/50 rounded text-gray-300">
                        {caseOption.color}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">{caseOption.description}</p>
                    <button className="btn btn-primary w-full">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Select This Case
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Help Section */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <h3 className="heading-3 mb-4">Need Help Choosing?</h3>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Consider these factors when selecting your case
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card p-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                  <div className="text-xl">📐</div>
                </div>
                <h4 className="text-lg font-bold text-white mb-3">Form Factor</h4>
                <p className="text-gray-400 text-sm">
                  ATX cases offer the most expansion options. Mini-ITX is great for compact builds.
                </p>
              </div>

              <div className="card p-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                  <div className="text-xl">💨</div>
                </div>
                <h4 className="text-lg font-bold text-white mb-3">Airflow</h4>
                <p className="text-gray-400 text-sm">
                  Mesh front panels provide better cooling than solid panels with limited ventilation.
                </p>
              </div>

              <div className="card p-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                  <div className="text-xl">🔌</div>
                </div>
                <h4 className="text-lg font-bold text-white mb-3">Cable Management</h4>
                <p className="text-gray-400 text-sm">
                  Look for cases with dedicated cable routing channels and ample space behind the motherboard tray.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10">
        <div className="container-narrow">
          <div className="card-glow p-8 md:p-12 text-center">
            <h2 className="heading-2 mb-4">Ready to Build Your Dream PC?</h2>
            <p className="body-large max-w-2xl mx-auto mb-8">
              Select a case above to start customizing your perfect gaming PC. Every build includes 
              professional assembly, cable management, and our 3-year warranty.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-primary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Start Building
              </button>
              <button className="btn btn-outline">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View Guide
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ConfiguratorPage;
