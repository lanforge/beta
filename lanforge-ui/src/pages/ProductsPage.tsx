import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image?: string;
  specs: string[];
  imageColor: string;
  series: string;
  basePrice: number;
}

interface ComponentOption {
  id: number;
  name: string;
  description: string;
  price: number;
  fpsImpact: number;
}

interface GameFPS {
  game: string;
  resolution: string;
  settings: string;
  baseFPS: number;
}

const ProductsPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [componentCategories, setComponentCategories] = useState<any[]>([]);
  const [gameFPSData, setGameFPSData] = useState<GameFPS[]>([
    { game: 'Cyberpunk 2077', resolution: '1440p', settings: 'Ultra + RT', baseFPS: 85 },
    { game: 'Call of Duty: Modern Warfare III', resolution: '1440p', settings: 'Extreme', baseFPS: 165 },
    { game: 'Fortnite', resolution: '1440p', settings: 'Epic + RT', baseFPS: 180 },
    { game: 'Apex Legends', resolution: '1440p', settings: 'Max', baseFPS: 240 },
    { game: 'Baldur\'s Gate 3', resolution: '1440p', settings: 'Ultra', baseFPS: 120 },
    { game: 'Elden Ring', resolution: '1440p', settings: 'Max', baseFPS: 90 },
  ]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<Record<string, ComponentOption>>({});
  const [customizationMode, setCustomizationMode] = useState(false);
  const [showBenchmarkModal, setShowBenchmarkModal] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.REACT_APP_API_URL}/products?limit=50`).then(res => res.json()),
      fetch(`${process.env.REACT_APP_API_URL}/pc-parts?limit=100`).then(res => res.json())
    ]).then(([productsData, partsData]) => {
      if (productsData.products) {
        const mappedProducts = productsData.products.map((p: any) => ({
          id: p._id,
          name: p.name,
          description: p.shortDescription || p.description,
          price: `$${p.price.toFixed(2)}`,
          image: p.images?.[0] || null, // Primary photo
          specs: p.parts && p.parts.length > 0 && typeof p.parts[0] === 'object'
            ? [
                p.parts.find((part: any) => part.type === 'cpu'),
                p.parts.find((part: any) => part.type === 'gpu'),
                p.parts.find((part: any) => part.type === 'ram')
              ].filter(Boolean).map((part: any) => `${(part.type || 'Part').toUpperCase()}: ${part.brand || ''} ${part.name || ''}`)
            : (p.specs && typeof p.specs === 'object' ? Object.entries(p.specs).map(([k, v]) => `${k}: ${v}`).slice(0, 3) : []),
          imageColor: '#3a86ff',
          series: p.subcategory || p.category || 'LANForge Series',
          basePrice: p.price
        }));
        setProducts(mappedProducts);

        if (productId) {
          const product = mappedProducts.find((p: any) => p.id === productId);
          setSelectedProduct(product || mappedProducts[0]);
        } else {
          setSelectedProduct(mappedProducts[0]);
        }
      }

      if (partsData.parts) {
        const grouped: Record<string, any> = {
          cpu: { id: 'cpu', name: 'CPU', options: [] },
          gpu: { id: 'gpu', name: 'GPU', options: [] },
          ram: { id: 'ram', name: 'RAM', options: [] },
        };

        partsData.parts.forEach((p: any) => {
          if (grouped[p.type]) {
            grouped[p.type].options.push({
              id: p._id,
              name: p.name,
              description: p.brand + ' ' + p.model,
              price: p.price,
              fpsImpact: Math.floor(Math.random() * 20) // dummy impact
            });
          }
        });

        const categoriesArray = Object.values(grouped).filter(c => c.options.length > 0);
        setComponentCategories(categoriesArray);

        const defaults: Record<string, ComponentOption> = {};
        categoriesArray.forEach(c => {
          if (c.options.length > 0) defaults[c.id] = c.options[0];
        });
        setSelectedComponents(defaults);
      }
    }).catch(err => console.error(err));
  }, [productId]);

  const totalPrice = selectedProduct 
    ? selectedProduct.basePrice + Object.values(selectedComponents).reduce((sum, comp) => sum + comp.price, 0)
    : 0;

  const totalFPSImpact = Object.values(selectedComponents).reduce((sum, comp) => sum + comp.fpsImpact, 0);

  const handleSelect = (categoryId: string, option: ComponentOption) => {
    setSelectedComponents(prev => ({
      ...prev,
      [categoryId]: option
    }));
  };

  const calculateGameFPS = (baseFPS: number) => {
    return Math.round(baseFPS * (1 + totalFPSImpact / 100));
  };

  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gradient-neon text-2xl font-bold mb-4">Loading...</div>
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
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
              {selectedProduct.name}
            </h1>
            <p className="body-large max-w-3xl mx-auto mb-10">
              {selectedProduct.description}
            </p>
            
          </motion.div>
        </div>
      </section>

      {/* Product Details */}
      <section className="section">
        <div className="container-narrow">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="card-glow overflow-hidden bg-gray-900"
            >
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center relative">
                {selectedProduct.image ? (
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover absolute inset-0 z-10"
                  />
                ) : (
                  <div className="text-center p-8 relative z-10">
                    <div className="text-6xl mb-4">🖥️</div>
                    <div className="text-gradient-neon text-2xl font-bold mb-2">{selectedProduct.name}</div>
                    <div className="text-gray-400">{selectedProduct.series}</div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Product Specs */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="card-glow p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Specifications</h2>
              <div className="space-y-4">
                {selectedProduct.specs.map((spec, idx) => {
                  const colonIndex = spec.indexOf(':');
                  const partType = colonIndex !== -1 ? spec.substring(0, colonIndex) : 'Component';
                  const partValue = colonIndex !== -1 ? spec.substring(colonIndex + 1).trim() : spec;
                  
                  return (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-gray-800/30 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-400 mb-1">{partType}</div>
                        <div className="text-white font-medium">{partValue}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-4">
                <button 
                  className={`btn w-full ${customizationMode ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setCustomizationMode(!customizationMode)}
                >
                  {customizationMode ? 'View Product Details' : 'Customize This Build'}
                </button>
                <button 
                  className="btn btn-primary w-full"
                  onClick={() => {
                    if (!selectedProduct) return;
                    let sessionId = localStorage.getItem('cartSessionId');
                    if (!sessionId) {
                      sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
                      localStorage.setItem('cartSessionId', sessionId);
                    }
                    
                    fetch(`${process.env.REACT_APP_API_URL}/carts/${sessionId}`)
                      .then(res => res.json())
                      .then(data => {
                        const existingItems = data.cart?.items || [];
                        // map existing items back to the format expected by the API
                        const mappedItems = existingItems.map((i: any) => ({
                          product: i.product?._id || i.product,
                          pcPart: i.pcPart?._id || i.pcPart,
                          accessory: i.accessory?._id || i.accessory,
                          customBuild: i.customBuild?._id || i.customBuild,
                          quantity: i.quantity
                        }));
                        
                        mappedItems.push({
                          product: selectedProduct.id,
                          quantity: 1
                        });
                        
                        return fetch(`${process.env.REACT_APP_API_URL}/carts/${sessionId}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ items: mappedItems })
                        });
                      })
                      .then(() => {
                        alert('Added to cart!');
                        window.location.href = '/cart';
                      })
                      .catch(err => console.error(err));
                  }}
                >
                  Add to Cart
                </button>
                <button 
                  className="btn btn-outline w-full"
                  onClick={() => setShowBenchmarkModal(true)}
                >
                  📊 View Benchmarking Stats
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Customizer Modal */}
      <AnimatePresence>
        {customizationMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Customize Your Build</h2>
                <button 
                  onClick={() => setCustomizationMode(false)}
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Component Selection */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-6">Select Components</h3>
                    <div className="space-y-6">
                      {componentCategories.map((category) => (
                        <div key={category.id} className="bg-gray-800/30 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-white">{category.name}</h4>
                            <div className="text-sm text-gray-400">
                              Selected: {selectedComponents[category.id]?.name}
                            </div>
                          </div>
                          <div className="space-y-3">
                            {category.options.map((option: any) => (
                              <div
                                key={option.id}
                                className={`p-4 rounded-lg cursor-pointer transition-all ${
                                  selectedComponents[category.id]?.id === option.id
                                    ? 'bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30'
                                    : 'bg-gray-800/50 hover:bg-gray-700/50'
                                }`}
                                onClick={() => handleSelect(category.id, option)}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-white font-medium">{option.name}</div>
                                    <div className="text-gray-400 text-sm mt-1">{option.description}</div>
                                    {option.fpsImpact > 0 && (
                                      <div className="text-emerald-400 text-sm mt-1">
                                        +{option.fpsImpact}% performance
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-gradient-neon font-bold">${option.price}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Build Summary */}
                  <div>
                    <div className="card-glow p-6">
                      <h3 className="text-xl font-bold text-white mb-6">Your Custom Build</h3>
                      
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                          <div>
                            <div className="text-sm text-gray-400">Base System</div>
                            <div className="text-white font-medium">{selectedProduct.name}</div>
                          </div>
                          <div className="text-gradient-neon font-bold">${selectedProduct.basePrice}</div>
                        </div>
                        
                        {Object.entries(selectedComponents).map(([categoryId, component]) => (
                          <div key={categoryId} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                            <div>
                              <div className="text-sm text-gray-400">{categoryId.toUpperCase()}</div>
                              <div className="text-white font-medium">{component.name}</div>
                              {component.fpsImpact > 0 && (
                                <div className="text-emerald-400 text-sm mt-1">
                                  +{component.fpsImpact}% performance
                                </div>
                              )}
                            </div>
                            <div className="text-gradient-neon font-bold">${component.price}</div>
                          </div>
                        ))}
                      </div>

                      {/* Total Price */}
                      <div className="mt-8 p-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-lg font-semibold text-white">Total Price</div>
                          <div className="text-3xl font-bold text-gradient-neon">${totalPrice}</div>
                        </div>
                        <div className="text-gray-400 text-sm">
                          Includes base system and all selected components
                        </div>
                      </div>

                      {/* Performance Impact */}
                      <div className="mt-6 p-6 bg-gray-800/30 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-lg font-semibold text-white">Performance Impact</div>
                          <div className="text-2xl font-bold text-emerald-400">+{totalFPSImpact}%</div>
                        </div>
                        <div className="text-gray-400 text-sm">
                          Estimated FPS improvement over base configuration
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-8 space-y-4">
                        <button 
                          className="btn btn-primary w-full"
                          onClick={() => {
                            if (!selectedProduct) return;
                            
                            // 1. Save the custom build
                            const parts = Object.values(selectedComponents).map(comp => ({
                              part: comp.id,
                              quantity: 1,
                              partType: 'Component' // Fallback, the API figures it out
                            }));
                            
                            fetch(`${process.env.REACT_APP_API_URL}/custom-builds`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                name: `Custom ${selectedProduct.name}`,
                                parts
                              })
                            })
                            .then(res => res.json())
                            .then(buildData => {
                              if (!buildData.customBuild) throw new Error('Failed to create build');
                              
                              // 2. Add to Cart
                              let sessionId = localStorage.getItem('cartSessionId');
                              if (!sessionId) {
                                sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
                                localStorage.setItem('cartSessionId', sessionId);
                              }
                              
                              return fetch(`${process.env.REACT_APP_API_URL}/carts/${sessionId}`)
                                .then(res => res.json())
                                .then(cartData => {
                                  const existingItems = cartData.cart?.items || [];
                                  const mappedItems = existingItems.map((i: any) => ({
                                    product: i.product?._id || i.product,
                                    pcPart: i.pcPart?._id || i.pcPart,
                                    accessory: i.accessory?._id || i.accessory,
                                    customBuild: i.customBuild?._id || i.customBuild,
                                    quantity: i.quantity
                                  }));
                                  
                                  mappedItems.push({
                                    customBuild: buildData.customBuild._id,
                                    quantity: 1
                                  });
                                  
                                  return fetch(`${process.env.REACT_APP_API_URL}/carts/${sessionId}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ items: mappedItems })
                                  });
                                });
                            })
                            .then(() => {
                              alert('Custom build added to cart!');
                              window.location.href = '/cart';
                            })
                            .catch(err => console.error(err));
                          }}
                        >
                          Add Custom Build to Cart
                        </button>
                        <button className="btn btn-outline w-full">Save Configuration</button>
                        <button 
                          className="btn btn-outline w-full"
                          onClick={() => setCustomizationMode(false)}
                        >
                          Cancel Customization
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Benchmark Modal */}
      <AnimatePresence>
        {showBenchmarkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Benchmarking Stats</h2>
                <button 
                  onClick={() => setShowBenchmarkModal(false)}
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">Performance Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card p-6 text-center">
                      <div className="text-3xl font-bold text-gradient-neon mb-2">+{totalFPSImpact}%</div>
                      <div className="text-gray-400">Performance Gain</div>
                    </div>
                    <div className="card p-6 text-center">
                      <div className="text-3xl font-bold text-gradient-neon mb-2">${totalPrice}</div>
                      <div className="text-gray-400">Total Price</div>
                    </div>
                    <div className="card p-6 text-center">
                      <div className="text-3xl font-bold text-gradient-neon mb-2">1440p</div>
                      <div className="text-gray-400">Test Resolution</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Game Performance</h3>
                  <div className="space-y-4">
                    {gameFPSData.map((game, idx) => {
                      const customFPS = calculateGameFPS(game.baseFPS);
                      return (
                        <div key={idx} className="bg-gray-800/30 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="text-white font-medium">{game.game}</div>
                              <div className="text-gray-400 text-sm">
                                {game.resolution} • {game.settings}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gradient-neon">{customFPS} FPS</div>
                              <div className="text-gray-400 text-sm">
                                Base: {game.baseFPS} FPS
                              </div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full"
                              style={{ width: `${Math.min(100, (customFPS / 240) * 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 p-6 bg-gray-800/30 rounded-xl">
                  <h4 className="text-lg font-semibold text-white mb-3">Performance Notes</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>All tests performed at 1440p resolution with maximum settings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>Ray Tracing enabled where applicable</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>DLSS/FSR disabled for baseline comparison</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>Performance varies based on specific game optimization</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Section */}
      <section className="py-10">
        <div className="container-narrow">
          <div className="card-glow p-8 md:p-12 text-center">
            <h2 className="heading-2 mb-4">Ready to Build Your Dream PC?</h2>
            <p className="body-large max-w-2xl mx-auto mb-8">
              Customize your perfect gaming rig with our easy-to-use configurator and get expert support every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="btn btn-primary"
                onClick={() => setCustomizationMode(true)}
              >
                ⚙️ Start Customizing
              </button>
              <a href="/contact" className="btn btn-outline">
                💬 Talk to an Expert
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
