import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
  icon: string;
}

const faqCategories: FAQCategory[] = [
  {
    title: 'Ordering & Shipping',
    icon: '🚚',
    items: [
      {
        question: 'How long does shipping take?',
        answer: 'Standard shipping is 3‑5 business days within the continental US. Express shipping (1‑2 days) is available for an additional fee. International shipping typically takes 7‑14 business days depending on the destination.'
      },
      {
        question: 'Do you offer international shipping?',
        answer: 'Yes, we ship to over 50 countries. Shipping costs and times vary by location. Contact our support team for a custom quote. All international shipments include customs documentation and tracking.'
      },
      {
        question: 'Can I modify or cancel my order?',
        answer: 'You can modify or cancel your order within 24 hours of placement by contacting our support team. After 24 hours, orders enter our production queue and cannot be modified or cancelled without a restocking fee.'
      },
      {
        question: 'What shipping carriers do you use?',
        answer: 'We primarily use FedEx and UPS for domestic shipments, and DHL for international shipments. All shipments include full tracking and insurance coverage.'
      }
    ]
  },
  {
    title: 'Products & Customization',
    icon: '💻',
    items: [
      {
        question: 'Can I upgrade components later?',
        answer: 'Yes! All our systems are built with upgradeability in mind. We offer upgrade services for existing customers at discounted rates. You can also purchase individual components through our accessories page.'
      },
      {
        question: 'Can I customize the RGB lighting?',
        answer: 'Absolutely! Our systems feature fully customizable RGB with software control. You can sync lighting across all compatible components, create custom profiles, and even sync with games and applications.'
      },
      {
        question: 'What if a component I want is out of stock?',
        answer: 'We maintain relationships with multiple suppliers to ensure component availability. If a specific component is out of stock, our team will contact you with comparable alternatives or provide an estimated restock date.'
      },
      {
        question: 'Do you offer pre-built systems?',
        answer: 'Yes, we offer both pre-built systems and fully custom configurations. Our pre-built systems are optimized for specific use cases (gaming, content creation, workstation) and can be further customized.'
      }
    ]
  },
  {
    title: 'Warranty & Support',
    icon: '🛡️',
    items: [
      {
        question: 'What’s included in the warranty?',
        answer: 'Our 3‑year warranty covers all components against defects, plus free technical support. Accidental damage protection is available as an add‑on. The warranty includes parts, labor, and return shipping for warranty repairs.'
      },
      {
        question: 'What if I need help setting up my PC?',
        answer: 'We provide detailed setup guides, video tutorials, and 24/7 live support. For an extra fee, we can even do a remote setup session where our technicians guide you through the process via screen sharing.'
      },
      {
        question: 'How do I make a warranty claim?',
        answer: 'Contact our support team via email or phone with your order number and a description of the issue. We\'ll provide a prepaid shipping label if needed, and typically complete repairs within 5‑7 business days.'
      },
      {
        question: 'Do you offer extended warranty options?',
        answer: 'Yes, we offer extended warranty options up to 5 years total coverage. Extended warranties can be purchased at the time of your original order or within the first year of ownership.'
      }
    ]
  },
  {
    title: 'Technical & Performance',
    icon: '⚡',
    items: [
      {
        question: 'How are your PCs tested before shipping?',
        answer: 'Every LANForge PC undergoes 48 hours of stress testing, including temperature monitoring, benchmark validation, and real-world gaming/application testing. We also perform a thorough visual inspection and cable management check.'
      },
      {
        question: 'What software comes pre-installed?',
        answer: 'We install Windows (activated), essential drivers, and our LANForge Control Center software for RGB and performance monitoring. We do not install bloatware or trial software. You can request a clean Windows install if preferred.'
      },
      {
        question: 'Can you help with overclocking?',
        answer: 'Yes, we offer professional overclocking services for an additional fee. Our technicians will safely overclock your system for optimal performance and stability, with full documentation provided.'
      },
      {
        question: 'What cooling solutions do you recommend?',
        answer: 'We offer air cooling, AIO liquid cooling, and custom loop options. Our recommendations depend on your components, performance needs, and budget. All cooling solutions are tested for optimal thermal performance.'
      }
    ]
  },
  {
    title: 'Payment & Financing',
    icon: '💳',
    items: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay, Google Pay, and financing through Affirm and Klarna.'
      },
      {
        question: 'Do you offer financing options?',
        answer: 'Yes, we offer financing through Affirm and Klarna with terms ranging from 6 to 36 months. Approval and terms depend on your creditworthiness. You can check your eligibility during checkout.'
      },
      {
        question: 'Are there any hidden fees?',
        answer: 'No hidden fees. The price you see includes all components, assembly, testing, and standard shipping. Taxes are calculated at checkout based on your location. Optional services (extended warranty, expedited shipping, etc.) are clearly marked.'
      },
      {
        question: 'When will my card be charged?',
        answer: 'Your card is authorized at checkout but only charged when your order ships. For custom builds, this typically occurs 3‑5 business days after order confirmation when your system enters production.'
      }
    ]
  }
];

const FAQPage: React.FC = () => {
  const [openItems, setOpenItems] = useState<{[key: string]: boolean}>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggleFAQ = (categoryTitle: string, question: string) => {
    const key = `${categoryTitle}-${question}`;
    console.log('Toggling FAQ:', key, 'Current state:', openItems[key]);
    console.log('Click event fired for:', question);
    setOpenItems(prev => {
      const newState = !(prev[key] || false);
      console.log('Setting new state for', key, 'to:', newState);
      return {
        ...prev,
        [key]: newState
      };
    });
  };

  const toggleCategory = (categoryTitle: string) => {
    setActiveCategory(activeCategory === categoryTitle ? null : categoryTitle);
  };

  // Filter FAQ items based on search query
  const filteredCategories = faqCategories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-radial from-emerald-400/10 via-transparent to-transparent" />
        <div className="container-narrow relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="heading-1 mb-6">
              Frequently Asked Questions
            </h1>
            <p className="body-large max-w-3xl mx-auto mb-10">
              Find answers to common questions about ordering, products, warranty, and more
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-gradient-neon mb-2">5</div>
                <div className="text-gray-400">Categories</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-gradient-neon mb-2">20</div>
                <div className="text-gray-400">Questions</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-gradient-neon mb-2">24/7</div>
                <div className="text-gray-400">Support</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-gradient-neon mb-2">3</div>
                <div className="text-gray-400">Year Warranty</div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for answers..."
                  className="input w-full pl-12 pr-4 py-4 text-lg"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-gray-400 text-sm mt-2">
                  Found {filteredCategories.reduce((total, cat) => total + cat.items.length, 0)} results
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="section">
        <div className="container-narrow">
          {/* Category Navigation */}
          <div className="flex flex-wrap gap-3 mb-12">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                activeCategory === null
                  ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white border-transparent'
                  : 'bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              All Categories
            </button>
            {faqCategories.map((category) => (
              <button
                key={category.title}
                onClick={() => toggleCategory(category.title)}
                className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                  activeCategory === category.title
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white border-transparent'
                    : 'bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                {category.icon} {category.title}
              </button>
            ))}
          </div>

          {/* FAQ Content */}
          <div className="space-y-8">
            {(activeCategory 
              ? filteredCategories.filter(cat => cat.title === activeCategory)
              : filteredCategories
            ).map((category, categoryIndex) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-2xl">
                    {category.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{category.title}</h2>
                    <p className="text-gray-400">{category.items.length} questions</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => {
                    const key = `${category.title}-${item.question}`;
                    const isOpen = !!openItems[key]; // Convert undefined to false
                    
                    return (
                      <div
                        key={itemIndex}
                        className="bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-emerald-400/30 transition-colors duration-200"
                      >
                        <div 
                          onClick={() => toggleFAQ(category.title, item.question)}
                          className="w-full p-6 flex items-center justify-between text-left cursor-pointer hover:bg-gray-700/20 transition-colors duration-200"
                        >
                          <h3 className="text-lg font-semibold text-white pr-8">
                            {item.question}
                          </h3>
                          <div
                            className={`w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center text-emerald-400 flex-shrink-0 hover:bg-gray-600/50 transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        {isOpen && (
                          <div className="px-6 pb-6">
                            <div className="pt-4 border-t border-gray-700/50">
                              <p className="text-gray-300 leading-relaxed">
                                {item.answer}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-900/30">
        <div className="container-narrow">
          <div className="card-glow p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="heading-2 mb-6">Still Have Questions?</h2>
                <p className="body-large mb-8">
                  Can't find the answer you're looking for? Our support team is here to help.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-xl">
                      📧
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Email Support</h3>
                      <p className="text-gradient-neon text-lg font-medium">support@lanforge.co</p>
                      <p className="text-gray-400 text-sm">Typically respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-xl">
                      📞
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Phone Support</h3>
                      <p className="text-white text-lg font-medium">+1-800-LANFORGE</p>
                      <p className="text-gray-400 text-sm">Monday–Friday, 9AM–6PM PST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-xl">
                      💬
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Live Chat</h3>
                      <p className="text-white">Available via Intercom widget</p>
                      <p className="text-gray-400 text-sm">Bottom right corner of every page</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-gray-900/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Support Tips</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-300">Include your order number for faster service</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-300">Provide detailed descriptions of your issue</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-300">Attach photos or videos when applicable</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-300">Check our knowledge base for common solutions</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6">
                  <p className="text-gray-400 text-sm">
                    For fastest response, please include your order number (if applicable) and a detailed description of your question.
                    Our support team typically responds within 24 hours during business days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-narrow">
          <div className="card-glow p-8 md:p-12 text-center">
            <h2 className="heading-2 mb-4">Need Immediate Assistance?</h2>
            <p className="body-large max-w-2xl mx-auto mb-8">
              Our live chat support is available 24/7 for urgent issues. 
              For complex inquiries, contact our support team directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="btn btn-primary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Live Chat Support
              </a>
              <a href="/tech-support" className="btn btn-outline">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Book Tech Support
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;

