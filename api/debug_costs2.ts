import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Product from './src/models/Product';
import PCPart from './src/models/PCPart';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lanforge');
  
  const products = await Product.find({});
  console.log('Total Products:', products.length);
  
  for (const p of products) {
    if (p.parts && p.parts.length > 0) {
      let newCost = 0;
      let breakdown: string[] = [];
      
      for (const partId of p.parts) {
        const partDoc: any = await PCPart.findById(partId);
        if (partDoc) {
          const cost = partDoc.cost || partDoc.price || 0;
          newCost += cost;
          breakdown.push(`${partDoc.partModel}: ${cost}`);
        }
      }
      
      console.log(`[${p.name}]`);
      console.log(`  Original Price in DB: ${p.price}, Cost in DB: ${p.cost}`);
      console.log(`  Calculated Cost from parts: ${newCost}`);
      if (p.price > 6000) {
        console.log(`  Breakdown: ${breakdown.join(', ')}`);
      }
    }
  }
  await mongoose.disconnect();
}
run().catch(console.error);
