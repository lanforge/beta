import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/lanforge';

// Simple definition of the PCPart model since we only need a few fields
const PCPartSchema = new mongoose.Schema({
  brand: String,
  partModel: String,
  sku: String,
  price: Number,
  cost: Number,
});

const PCPart = mongoose.models.PCPart || mongoose.model('PCPart', PCPartSchema, 'pcparts');

async function checkPartsPrices() {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to Database.\n');

    const parts = await PCPart.find({}, 'brand partModel sku price cost').lean();
    
    if (parts.length === 0) {
      console.log('No parts found in the database.');
      return;
    }

    console.log(`Found ${parts.length} parts in the database.\n`);
    
    console.log('=' . repeat(100));
    console.log('ALL PARTS LISTING');
    console.log('=' . repeat(100));
    console.log(
      'SKU'.padEnd(20) + 
      'BRAND'.padEnd(20) + 
      'MODEL'.padEnd(40) + 
      'PRICE'.padEnd(10) + 
      'COST'
    );
    console.log('-' . repeat(100));

    let discrepanciesCount = 0;
    const discrepancies: any[] = [];

    for (const part of parts) {
      const price = part.price || 0;
      const cost = part.cost || 0;
      const partModel = (part.partModel || '').substring(0, 38);
      const brand = (part.brand || '').substring(0, 18);
      const sku = (part.sku || 'N/A').substring(0, 18);
      
      console.log(
        sku.padEnd(20) + 
        brand.padEnd(20) + 
        partModel.padEnd(40) + 
        `$${price.toFixed(2)}`.padEnd(10) + 
        `$${cost.toFixed(2)}`
      );

      // Check for discrepancies (missing or zero price/cost)
      if (price === 0 || cost === 0) {
        discrepanciesCount++;
        discrepancies.push(part);
      }
    }

    console.log('\n' + '=' . repeat(100));
    console.log('DISCREPANCIES FOUND (Missing or $0 COST/PRICE)');
    console.log('=' . repeat(100));
    
    if (discrepancies.length === 0) {
      console.log('No discrepancies found. All parts have both a cost and a price.');
    } else {
      console.log(
        'SKU'.padEnd(20) + 
        'BRAND'.padEnd(20) + 
        'MODEL'.padEnd(40) + 
        'PRICE'.padEnd(10) + 
        'COST'
      );
      console.log('-' . repeat(100));
      for (const part of discrepancies) {
        const price = part.price || 0;
        const cost = part.cost || 0;
        const partModel = (part.partModel || '').substring(0, 38);
        const brand = (part.brand || '').substring(0, 18);
        const sku = (part.sku || 'N/A').substring(0, 18);
        
        console.log(
          sku.padEnd(20) + 
          brand.padEnd(20) + 
          partModel.padEnd(40) + 
          `$${price.toFixed(2)}`.padEnd(10) + 
          `$${cost.toFixed(2)}`
        );
      }
    }

    console.log('\n' + '=' . repeat(50));
    console.log(`SUMMARY`);
    console.log('=' . repeat(50));
    console.log(`Total Parts Evaluated : ${parts.length}`);
    console.log(`Total Discrepancies   : ${discrepanciesCount}`);
    
  } catch (error) {
    console.error('Error occurred while checking parts:', error);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('\nDisconnected from Database.');
    }
  }
}

checkPartsPrices();
