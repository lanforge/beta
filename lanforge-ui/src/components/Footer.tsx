import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Footer: React.FC = () => {
  const [businessInfo, setBusinessInfo] = useState<any>(null);

  useEffect(() => {
    const fetchBusinessInfo = async () => {
      try {
        const response = await api.get('/business/public');
        if (response.data.businessInfo) {
          setBusinessInfo(response.data.businessInfo);
        }
      } catch (err) {
        console.error('Failed to fetch business info:', err);
      }
    };
    fetchBusinessInfo();
  }, []);

  const footerColumns = [
    {
      title: 'Products',
      links: [
        { name: 'Pre‑built PCs', path: '/products' },
        { name: 'Custom Configurator', path: '/configurator' },
        { name: 'Components', path: '/products' },
        { name: 'Peripherals', path: '/products' },
        { name: 'Special Deals', path: '/products' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Contact Us', path: '/contact' },
        { name: 'FAQ', path: '/faq' },
        { name: 'Warranty', path: '/warranty' },
        { name: 'Shipping & Returns', path: '/shipping' },
        { name: 'Build Guides', path: '/guides' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'Reviews', path: '/reviews' },
        { name: 'Careers', path: '/careers' },
        { name: 'Press', path: '/press' },
        { name: 'Blog', path: '/blog' }
      ]
    }
  ];

  const socialLinks = [
    { icon: '🐦', label: 'Twitter', url: 'https://twitter.com/lanforge' },
    { icon: '🎮', label: 'Discord', url: 'https://discord.gg/lanforge' },
    { icon: '📺', label: 'YouTube', url: 'https://youtube.com/lanforge' },
    { icon: '📸', label: 'Instagram', url: 'https://instagram.com/lanforge' }
  ];

  return (
    <footer className="bg-gray-950 border-t border-gray-800/50">
      <div className="w-full px-8">
        <div className="py-12">
          {/* Full width single row layout */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 w-full">
            {/* Logo only */}
            <div className="flex-shrink-0">
              <Link to="/" className="inline-block">
                <img 
                  src="https://lanforge.co/cdn/shop/files/logo2.png?height=120&v=1763939118" 
                  alt="LANForge" 
                  className="h-10 w-auto"
                />
              </Link>
            </div>
            
            {/* Navigation columns spanning full width */}
            <div className="flex-1 flex flex-wrap justify-between gap-8 md:gap-12 w-full">
              {footerColumns.map((column) => (
                <div key={column.title} className="min-w-[120px]">
                  <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                    {column.title}
                  </h3>
                  <ul className="space-y-2">
                    {column.links.map((link) => (
                      <li key={link.name}>
                        <Link 
                          to={link.path}
                          className="text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-300"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              
              {/* Connect / Contact */}
              <div className="min-w-[120px]">
                <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                  Connect
                </h3>
                {businessInfo?.phone && (
                  <p className="text-sm text-gray-400 mb-2">{businessInfo.phone}</p>
                )}
                {businessInfo?.email && (
                  <p className="text-sm text-gray-400 mb-4">{businessInfo.email}</p>
                )}
                <div className="flex items-center gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-lg"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
              
              {/* Newsletter */}
              <div className="min-w-[200px]">
                <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                  Newsletter
                </h3>
                <div className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Email"
                    className="w-full px-3 py-2 text-sm rounded bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400/50"
                  />
                  <button className="btn btn-primary text-sm py-2 w-full">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom bar - full width */}
        <div className="py-6 border-t border-gray-800/50 w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm w-full">
            <div className="text-gray-500">
              © {new Date().getFullYear()} {businessInfo?.storeName || 'LANForge'} PC Builders. All rights reserved.
            </div>
            
            <div className="flex items-center gap-6">
              <Link 
                to="/privacy" 
                className="text-gray-400 hover:text-emerald-400 transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="text-gray-400 hover:text-emerald-400 transition-colors duration-300"
              >
                Terms of Service
              </Link>
              <Link 
                to="/cookies" 
                className="text-gray-400 hover:text-emerald-400 transition-colors duration-300"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
