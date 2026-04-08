import express from 'express';
import Product from '../models/Product';
import CustomBuild from '../models/CustomBuild';
import Accessory from '../models/Accessory';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://lanforge.co';

    // Fetch dynamic content
    const products = await Product.find({ status: 'active' }).select('_id updatedAt').lean() as any[];
    const builds = await CustomBuild.find({ isPublic: true }).select('buildId updatedAt').lean() as any[];
    const accessories = await Accessory.find({ inStock: true }).select('_id updatedAt').lean() as any[];

    // Static routes
    const staticPages = [
      { url: '/', priority: 1.0, changefreq: 'weekly' },
      { url: '/configurator', priority: 0.9, changefreq: 'daily' },
      { url: '/products', priority: 0.8, changefreq: 'daily' },
      { url: '/pcs', priority: 0.8, changefreq: 'daily' },
      { url: '/accessories', priority: 0.8, changefreq: 'daily' },
      { url: '/warranty', priority: 0.5, changefreq: 'monthly' },
      { url: '/terms', priority: 0.5, changefreq: 'monthly' },
      { url: '/privacy', priority: 0.5, changefreq: 'monthly' },
      { url: '/contact', priority: 0.7, changefreq: 'monthly' },
      { url: '/faq', priority: 0.7, changefreq: 'monthly' },
      { url: '/shipping', priority: 0.6, changefreq: 'monthly' },
      { url: '/dignitas', priority: 0.6, changefreq: 'monthly' },
      { url: '/tradeify', priority: 0.6, changefreq: 'monthly' },
      { url: '/reviews', priority: 0.7, changefreq: 'weekly' },
      { url: '/tech-support', priority: 0.6, changefreq: 'monthly' },
      { url: '/pc-services', priority: 0.6, changefreq: 'monthly' },
      { url: '/guides', priority: 0.6, changefreq: 'monthly' },
      { url: '/about', priority: 0.6, changefreq: 'monthly' },
      { url: '/careers', priority: 0.5, changefreq: 'monthly' },
      { url: '/blog', priority: 0.7, changefreq: 'weekly' },
      { url: '/cookies', priority: 0.4, changefreq: 'yearly' },
      { url: '/press', priority: 0.5, changefreq: 'monthly' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Add static pages
    staticPages.forEach(page => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Add Products
    products.forEach(product => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/products/${product._id}</loc>\n`;
      if (product.updatedAt) {
        xml += `    <lastmod>${new Date(product.updatedAt).toISOString()}</lastmod>\n`;
      }
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    // Add Custom Builds
    builds.forEach(build => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/build/${build.buildId || build._id}</loc>\n`;
      if (build.updatedAt) {
        xml += `    <lastmod>${new Date(build.updatedAt).toISOString()}</lastmod>\n`;
      }
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);

  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).end();
  }
});

export default router;
