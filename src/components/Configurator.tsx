import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ComponentOption {
  id: number;
  name: string;
  description: string;
  price: number;
}

interface CaseOption {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  formFactor: string;
  color: string;
}

interface ConfiguratorProps {
  selectedCase: CaseOption;
}

const componentCategories = [
  {
    id: 'cpu',
    name: 'CPU',
    icon: '⚡',
    options: [
      { id: 1, name: 'Intel Core i5‑14600K', description: '6+8 cores, up to 5.3 GHz', price: 289 },
      { id: 2, name: 'AMD Ryzen 7 7800X3D', description: '8 cores, 3D V‑Cache', price: 349 },
      { id: 3, name: 'Intel Core i9‑14900K', description: '24 cores, up to 6.0 GHz', price: 589 },
      { id: 4, name: 'AMD Ryzen 9 7950X', description: '16 cores, up to 5.7 GHz', price: 699 },
    ]
  },
  {
    id: 'gpu',
    name: 'GPU',
    icon: '🎮',
    options: [
      { id: 5, name: 'NVIDIA RTX 4060 Ti', description: '8GB GDDR6', price: 399 },
      { id: 6, name: 'AMD Radeon RX 7800 XT', description: '16GB GDDR6', price: 499 },
      { id: 7, name: 'NVIDIA RTX 4080 Super', description: '16GB GDDR6X', price: 999 },
      { id: 8, name: 'NVIDIA RTX 4090', description: '24GB GDDR6X', price: 1599 },
    ]
  },
  {
    id: 'ram',
    name: 'RAM',
    icon: '🧠',
    options: [
      { id: 9, name: '16GB DDR5 5600MHz', description: '2×8GB', price: 89 },
      { id: 10, name: '32GB DDR5 6000MHz', description: '2×16GB', price: 149 },
      { id: 11, name: '64GB DDR5 6400MHz', description: '2×32GB', price: 289 },
      { id: 12, name: '128GB DDR5 5600MHz', description: '4×32GB', price: 549 },
    ]
  },
  {
    id: 'motherboard',
    name: 'Motherboard',
    icon: '🔌',
    options: [
      { id: 13, name: 'ASUS ROG Strix B760-F', description: 'ATX, WiFi 6E', price: 249 },
      { id: 14, name: 'MSI MPG B650 Edge', description: 'ATX, DDR5', price: 279 },
      { id: 15, name: 'Gigabyte Z790 AORUS Elite', description: 'ATX, PCIe 5.0', price: 329 },
      { id: 16, name: 'ASUS ROG Maximus Z790 Hero', description: 'ATX, Premium', price: 699 },
    ]
  },
  {
    id: 'ssd',
    name: 'SSD',
    icon: '💾',
    options: [
      { id: 17, name: '1TB NVMe SSD', description: 'PCIe 4.0', price: 79 },
      { id: 18, name: '2TB NVMe SSD', description: 'PCIe 4.0', price: 129 },
      { id: 19, name: '4TB NVMe SSD', description: 'PCIe 5.0', price: 299 },
      { id: 20, name: '2TB NVMe + 4TB HDD', description: 'Dual storage', price: 199 },
    ]
  },
  {
    id: 'psu',
    name: 'PSU',
    icon: '🔋',
    options: [
      { id: 21, name: '750W 80+ Gold', description: 'Semi-modular', price: 99 },
      { id: 22, name: '850W 80+ Gold', description: 'Fully modular', price: 129 },
      { id: 23, name: '1000W 80+ Platinum', description: 'Fully modular', price: 199 },
      { id: 24, name: '1200W 80+ Titanium', description: 'Premium', price: 299 },
    ]
  },
  {
    id: 'windows',
    name: 'Windows Edition',
    icon: '🪟',
    options: [
      { id: 29, name: 'Windows 11 Home', description: 'Standard edition', price: 119 },
      { id: 30, name: 'Windows 11 Pro', description: 'Professional edition', price: 199 },
      { id: 31, name: 'Windows 11 Pro + Office', description: 'Pro + Office Suite', price: 299 },
      { id: 32, name: 'No OS', description: 'Bring your own license', price: 0 },
    ]
  }
];

const Configurator: React.FC<ConfiguratorProps> = ({ selectedCase }) => {
  const [selectedComponents, setSelectedComponents] = useState<Record<string, ComponentOption>>({
    cpu: componentCategories[0].options[0],
    gpu: componentCategories[1].options[0],
    ram: componentCategories[2].options[0],
    motherboard: componentCategories[3].options[0],
    ssd: componentCategories[4].options[0],
    psu: componentCategories[5].options[0],
    windows: componentCategories[6].options[0],
  });

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const currentCategory = componentCategories[currentStep];

  // Calculate total price including the selected case
  const componentsTotal = Object.values(selectedComponents).reduce((sum, comp) => sum + comp.price, 0);
  const totalPrice = componentsTotal + selectedCase.price;

  const handleSelect = (categoryId: string, option: ComponentOption) => {
    setSelectedComponents(prev => ({
      ...prev,
      [categoryId]: option
    }));
  };

  const handleNextStep = () => {
    if (currentStep < componentCategories.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowReviewModal(true);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Configurator Header with Tabs */}
      <section className="py-8 border-b border-gray-800/50 bg-gray-900/30">
        <div className="container-narrow">
          <div className="text-center mb-8">
            <h1 className="heading-1 mb-4">Customize Your PC</h1>
            <p className="body-large max-w-3xl mx-auto">
              Select each component step by step to build your perfect gaming PC. All parts are compatible with your chosen case.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {componentCategories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => handleStepClick(index)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all duration-200 ${
                  currentStep === index
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white border-transparent'
                    : index < currentStep
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                    : 'bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep === index
                    ? 'bg-white text-gray-900'
                    : index < currentStep
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  {index + 1}
                </div>
                <span className="font-medium">{category.name}</span>
                {index < currentStep && (
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Current Step Indicator */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-full">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-lg">
                {currentCategory.icon}
              </div>
              <span className="font-semibold text-white">Step {currentStep + 1} of {componentCategories.length}: {currentCategory.name}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Configurator Layout */}
      <div className="container-narrow py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Component Selection */}
          <div className="lg:col-span-2">
            <motion.div
              key={currentCategory.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="category-section"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-2xl">
                  {currentCategory.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{currentCategory.name}</h2>
                  <p className="text-gray-400">Select your preferred {currentCategory.name.toLowerCase()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentCategory.options.map((option) => (
                  <div
                    key={option.id}
                    className={`card cursor-pointer transition-all duration-300 ${
                      selectedComponents[currentCategory.id]?.id === option.id
                        ? 'ring-2 ring-emerald-500 bg-gray-800/50'
                        : 'hover:bg-gray-800/30'
                    }`}
                    onClick={() => handleSelect(currentCategory.id, option)}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-white">{option.name}</h3>
                        <div className="text-xl font-bold text-gradient-neon">
                          ${option.price}
                        </div>
                      </div>
                      <p className="text-gray-400 mb-6">{option.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full mr-3 ${
                            selectedComponents[currentCategory.id]?.id === option.id
                              ? 'bg-emerald-500'
                              : 'bg-gray-700'
                          }`} />
                          <span className="font-medium text-gray-300">
                            {selectedComponents[currentCategory.id]?.id === option.id ? 'Selected' : 'Select this option'}
                          </span>
                        </div>
                        <svg 
                          className={`w-6 h-6 transition-transform ${
                            selectedComponents[currentCategory.id]?.id === option.id
                              ? 'text-emerald-500 rotate-180'
                              : 'text-gray-500'
                          }`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-800/50">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  className={`btn btn-outline flex items-center gap-2 ${
                    currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Previous Step
                </button>

                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">
                    Step {currentStep + 1} of {componentCategories.length}
                  </div>
                  <div className="w-48 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / componentCategories.length) * 100}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={handleNextStep}
                  className="btn btn-primary flex items-center gap-2"
                >
                  {currentStep === componentCategories.length - 1 ? (
                    <>
                      Review Build
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </>
                  ) : (
                    <>
                      Continue to {componentCategories[currentStep + 1]?.name}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="sticky top-24"
            >
              <div className="card-glow p-6">
                <h2 className="text-xl font-bold text-white mb-6">Your Build Summary</h2>
                
                {/* Selected Case */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center">
                      <div className="text-lg">📦</div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Selected Case</h3>
                      <p className="text-gray-400 text-sm">{selectedCase.name}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">{selectedCase.description}</span>
                    <span className="font-bold text-white">${selectedCase.price}</span>
                  </div>
                </div>

                {/* Components List */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-semibold text-gray-300">Selected Components</h4>
                  {Object.entries(selectedComponents).map(([categoryId, component]) => {
                    const category = componentCategories.find(c => c.id === categoryId);
                    return (
                      <div key={categoryId} className="flex justify-between items-center py-2 border-b border-gray-800/50">
                        <div>
                          <div className="text-sm text-gray-300">{category?.name}</div>
                          <div className="text-xs text-gray-500">{component.name}</div>
                        </div>
                        <div className="font-semibold text-white">${component.price}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Total */}
                <div className="border-t border-gray-800/50 pt-6 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-gray-300">Components Total</div>
                    <div className="font-semibold text-white">${componentsTotal}</div>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-gray-300">Case</div>
                    <div className="font-semibold text-white">${selectedCase.price}</div>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold pt-4 border-t border-gray-800/50">
                    <div className="text-white">Total Price</div>
                    <div className="text-gradient-neon">${totalPrice}</div>
                  </div>
                </div>

                {/* Included Features */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-300 mb-3">Included with Every Build</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-400">Professional assembly & cable management</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-400">3-year comprehensive warranty</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-400">Free insured shipping</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-400">Lifetime technical support</span>
                    </div>
                  </div>
                </div>

                {/* Continue Building Message */}
                <div className="text-center p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                  <p className="text-gray-300 text-sm">
                    Complete all steps to review your build and add to cart
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Review Build Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl"
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-2xl">
                    🎉
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Build Complete!</h2>
                    <p className="text-gray-400">Review your custom PC configuration</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="w-10 h-10 rounded-full bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Build Summary */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Your Build Summary</h3>
                  
                  {/* Selected Case */}
                  <div className="mb-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center">
                        <div className="text-lg">📦</div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Selected Case</h4>
                        <p className="text-gray-400 text-sm">{selectedCase.name}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">{selectedCase.description}</span>
                      <span className="font-bold text-white">${selectedCase.price}</span>
                    </div>
                  </div>

                  {/* Components List */}
                  <div className="space-y-3 mb-6">
                    <h4 className="font-semibold text-gray-300">Selected Components</h4>
                    {Object.entries(selectedComponents).map(([categoryId, component]) => {
                      const category = componentCategories.find(c => c.id === categoryId);
                      return (
                        <div key={categoryId} className="flex justify-between items-center py-3 px-4 bg-gray-800/20 rounded-lg">
                          <div>
                            <div className="text-sm text-gray-300">{category?.name}</div>
                            <div className="text-xs text-gray-500">{component.name}</div>
                          </div>
                          <div className="font-semibold text-white">${component.price}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total Price */}
                  <div className="p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700/50">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-gray-300">Components Total</div>
                      <div className="font-semibold text-white">${componentsTotal}</div>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-gray-300">Case</div>
                      <div className="font-semibold text-white">${selectedCase.price}</div>
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold pt-4 border-t border-gray-700/50">
                      <div className="text-white">Total Price</div>
                      <div className="text-gradient-neon">${totalPrice}</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons & Features */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Next Steps</h3>
                  
                  {/* Action Buttons */}
                  <div className="space-y-3 mb-8">
                    <button className="btn btn-primary w-full">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Add to Cart
                    </button>
                    <button className="btn btn-outline w-full">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Save Configuration
                    </button>
                    <button className="btn btn-text w-full">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share Build
                    </button>
                  </div>

                  {/* Included Features */}
                  <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                    <h4 className="font-semibold text-gray-300 mb-3">Included with Every Build</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-400">Professional assembly & cable management</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-400">3-year comprehensive warranty</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-400">Free insured shipping</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-400">Lifetime technical support</span>
                      </div>
                    </div>
                  </div>

                  {/* Continue Building Option */}
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                    >
                      ← Continue customizing your build
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Configurator;
