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
          // KEY FIX: Only use COST for calculations
          const cost = partDoc.cost || 0;
          const price = partDoc.price || 0;
          newCost += cost;
          breakdown.push(`    ${partDoc.type}: ${partDoc.partModel} (Cost: $${cost}, Retail Price: $${price})`);
        }
      }
      
      console.log(`\n[${p.name}]`);
      console.log(`  Sum of Part Costs: ${newCost.toFixed(2)}`);
      
      const calculatedPriceFromCost = newCost * 1.20;
      
      let roundedPrice;
      const fullDollars = Math.floor(calculatedPriceFromCost);
      const remainder = fullDollars % 50;
      if (remainder === 49) {
        roundedPrice = fullDollars + 0.99;
      } else {
        const chunksOf50 = Math.ceil((calculatedPriceFromCost - 49.99) / 50);
        roundedPrice = (chunksOf50 * 50) + 49.99;
        if (roundedPrice < calculatedPriceFromCost) roundedPrice += 50;
      }
      
      console.log(`  Recalculated Price (Sum of Costs * 1.20 rounded): ${roundedPrice.toFixed(2)}`);
      
      console.log(`  Breakdown:\n${breakdown.join('\n')}`);
    }
  }
  await mongoose.disconnect();
}
run().catch(console.error);
