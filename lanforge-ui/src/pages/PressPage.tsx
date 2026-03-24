import React from 'react';
import { motion } from 'framer-motion';

const PressPage: React.FC = () => {
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
              Press & Media
            </h1>
            <p className="body-large max-w-3xl mx-auto mb-10">
              Media resources, press releases, and brand assets for journalists and content creators
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-gradient-neon mb-2">press@lanforge.com</div>
                <div className="text-gray-400">Media Contact</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-gradient-neon mb-2">Available</div>
                <div className="text-gray-400">Press Kit</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-gradient-neon mb-2">24-48</div>
                <div className="text-gray-400">Hour Response</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-gradient-neon mb-2">Dignitas</div>
                <div className="text-gray-400">Official Partner</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Press Content */}
      <section className="section">
        <div className="container-narrow">
          <div className="space-y-8">
            {/* Section 1: About LANForge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="card-glow p-8"
            >
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-2xl font-bold text-emerald-400 flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-4">About LANForge</h2>
                  <div className="space-y-4">
                    <p className="text-gray-300">
                      LANForge is a premium custom PC builder specializing in high-performance gaming and workstation systems. 
                      Founded in 2025 by a team of passionate gamers and hardware enthusiasts, we've quickly become a trusted 
                      name in the custom PC industry.
                    </p>
                    <p className="text-gray-300">
                      Our mission is to deliver exceptional performance, quality, and customer service. Each LANForge system 
                      is hand-built by our expert technicians, tested rigorously, and backed by our comprehensive 3-year warranty.
                    </p>
                    <p className="text-gray-300">
                      As an official partner of Dignitas, one of the world's leading esports organizations, we bring professional-grade 
                      performance and reliability to gamers at all levels. Our partnership ensures that LANForge systems meet the 
                      demanding standards of professional esports athletes.
                    </p>
                    <p className="text-gray-300">
                      We serve gamers, content creators, professionals, and enthusiasts who demand the best performance 
                      from their computing systems.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section 2: Press Releases */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card-glow p-8"
            >
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-2xl font-bold text-emerald-400 flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-4">Press Releases</h2>
                  <div className="space-y-6">
                    <div className="bg-gray-800/30 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-white mb-2">LANForge Launches New "Nexus" Series Gaming PCs</h3>
                      <p className="text-gray-400 text-sm mb-3">February 15, 2026</p>
                      <p className="text-gray-300 mb-4">
                        Introducing our latest lineup of high-performance gaming PCs featuring next-generation 
                        components and innovative cooling solutions. The Nexus Series represents our commitment 
                        to pushing the boundaries of PC performance.
                      </p>
                      <button className="btn btn-outline">Read Full Release</button>
                    </div>
                    
                    <div className="bg-gray-800/30 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-white mb-2">LANForge Expands Customization Options with New Configurator Platform</h3>
                      <p className="text-gray-400 text-sm mb-3">January 28, 2026</p>
                      <p className="text-gray-300 mb-4">
                        Our newly launched online configurator allows customers to build their dream PC with 
                        unprecedented flexibility and real-time performance previews.
                      </p>
                      <button className="btn btn-outline">Read Full Release</button>
                    </div>
                    
                    <div className="bg-gray-800/30 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-white mb-2">LANForge Announces Partnership with Leading Component Manufacturers</h3>
                      <p className="text-gray-400 text-sm mb-3">December 10, 2025</p>
                      <p className="text-gray-300 mb-4">
                        Strategic partnerships with industry leaders ensure access to the latest components 
                        and exclusive products for our custom builds.
                      </p>
                      <button className="btn btn-outline">Read Full Release</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section 3: Company Facts & Figures */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="card-glow p-8"
            >
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-2xl font-bold text-emerald-400 flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-4">Company Facts & Figures</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-gradient-neon mb-2">5000+</div>
                      <div className="text-gray-400">Custom PCs Built</div>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-gradient-neon mb-2">98.7%</div>
                      <div className="text-gray-400">Customer Satisfaction</div>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-gradient-neon mb-2">25+</div>
                      <div className="text-gray-400">Countries Served</div>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-gradient-neon mb-2">3 Years</div>
                      <div className="text-gray-400">Warranty Coverage</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Key Milestones</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-300"><strong>2025:</strong> LANForge founded by gaming enthusiasts</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-300"><strong>2025:</strong> Partnered with Dignitas, a leading esports organization</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-300"><strong>2025:</strong> Launched first custom PC lineup</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-300"><strong>2025:</strong> Partnered with leading component manufacturers</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-300"><strong>2026:</strong> Expanded to international markets</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-300"><strong>2026:</strong> Introduced comprehensive 3-year warranty</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-300"><strong>2026:</strong> Launched online configurator platform</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-300"><strong>2026:</strong> Launched Nexus Series gaming PCs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section 4: Media Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="card-glow p-8"
            >
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-2xl font-bold text-emerald-400 flex-shrink-0">
                  4
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-4">Media Contact</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">LANForge Press Office</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Press Inquiries</div>
                            <a href="mailto:press@lanforge.com" className="text-gradient-neon font-medium hover:underline">
                              press@lanforge.com
                            </a>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Phone</div>
                            <a href="tel:+1-800-LANFORGE" className="text-white font-medium hover:underline">
                              +1-800-LANFORGE (Ext. 2 for Press)
                            </a>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Address</div>
                            <div className="text-white">
                              123 Tech Avenue<br />
                              San Francisco, CA 94107<br />
                              United States
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Additional Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-gray-300">General Media: <a href="mailto:media@lanforge.com" className="text-gradient-neon hover:underline">media@lanforge.com</a></span>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-gray-300">For fastest service, include "PRESS" in your email subject line</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-gray-300">Our press team is available Monday-Friday, 9 AM - 6 PM PST</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10">
        <div className="container-narrow">
          <div className="card-glow p-8 md:p-12 text-center">
            <h2 className="heading-2 mb-4">Need Press Materials?</h2>
            <p className="body-large max-w-2xl mx-auto mb-8">
              Download our complete press kit including logos, product images, and company information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-primary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Press Kit
              </button>
              <a href="/contact" className="btn btn-outline">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Press Team
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PressPage;
