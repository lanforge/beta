import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/lanforge';

// Important: import the actual models and services from the src directory
import PCPart from './src/models/PCPart';
import { scrapeSinglePart } from './src/services/scraperService';

async function forceRescrape() {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to Database.\n');

    // Find parts with discrepancy (missing cost or missing price)
    // We fetch full mongoose documents because scrapeSinglePart uses .save()
    const parts = await PCPart.find({
      $or: [
        { cost: { $in: [0, null, undefined] } },
        { price: { $in: [0, null, undefined] } },
        { cost: { $exists: false } },
        { price: { $exists: false } }
      ]
    });
    
    if (parts.length === 0) {
      console.log('No parts found with discrepancies. All parts seem to have cost and price.');
      return;
    }

    console.log(`Found ${parts.length} parts with missing cost or price. Starting rescrape...`);
    
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      console.log(`\n[${i + 1}/${parts.length}] Scraping: ${part.sku} - ${part.brand} ${part.partModel}`);
      
      if (!part.productUrl) {
        console.log(`WARNING: Part ${part.sku} does not have a productUrl. Cannot scrape.`);
        failCount++;
        continue;
      }

      console.log(`URL: ${part.productUrl}`);
      
      try {
        const success = await scrapeSinglePart(part);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
         console.error(`Error scraping ${part.sku}:`, err);
         failCount++;
      }
      
      // Add a small delay between requests to be nice to the scraper API
      if (i < parts.length - 1) {
        console.log('Waiting 2 seconds before next request...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n' + '=' . repeat(50));
    console.log(`SCRAPE SUMMARY`);
    console.log('=' . repeat(50));
    console.log(`Total Parts to Rescrape : ${parts.length}`);
    console.log(`Successful Scrapes      : ${successCount}`);
    console.log(`Failed Scrapes          : ${failCount}`);
    
  } catch (error) {
    console.error('Error occurred while forcing rescrape:', error);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('\nDisconnected from Database.');
    }
  }
}

forceRescrape();
