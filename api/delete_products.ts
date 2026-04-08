import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Product from './src/models/Product';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lanforge');
  
  const deleteNames = [
    'LANForge Standard',
    'Tradeify #1',
    'Tradeify #2',
    'Tradeify #3',
    'Dignitas #1',
    'Dignitas #2',
    'Dignitas #3'
  ];
  
  const result = await Product.deleteMany({ name: { $in: deleteNames } });
  console.log(`Deleted ${result.deletedCount} products.`);
  
  await mongoose.disconnect();
}
run().catch(console.error);
