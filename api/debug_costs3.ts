import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Product from './src/models/Product';
import PCPart from './src/models/PCPart';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lanforge');
  
  const products = await Product.find({});
  
  for (const p of products) {
    if ((p.name === 'LANForge Platinum' || p.name === 'LANForge Gold') && p.parts) {
      let newCost = 0;
      let breakdown: string[] = [];
      
      for (const partId of p.parts) {
        const partDoc: any = await PCPart.findById(partId);
        if (partDoc) {
          const cost = partDoc.cost || partDoc.price || 0;
          newCost += cost;
          breakdown.push(`    ${partDoc.type}: ${partDoc.partModel} ($${cost})`);
        }
      }
      
      console.log(`\n[${p.name}]`);
      console.log(`  Cost in DB: ${p.cost}`);
      console.log(`  Calculated Cost from parts: ${newCost}`);
      console.log(`  Breakdown:\n${breakdown.join('\n')}`);
    }
  }
  await mongoose.disconnect();
}
run().catch(console.error);
