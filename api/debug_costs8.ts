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
      let newPriceAcc = 0;
      let breakdown: string[] = [];
      
      for (const partId of p.parts) {
        const partDoc: any = await PCPart.findById(partId);
        if (partDoc) {
          const cost = partDoc.cost || partDoc.price || 0;
          const price = partDoc.price || partDoc.cost || 0;
          newCost += cost;
          newPriceAcc += price;
          breakdown.push(`    ${partDoc.type}: ${partDoc.partModel} (Cost: $${cost}, Price: $${price})`);
        }
      }
      
      console.log(`\n[${p.name}] BEFORE UPDATE`);
      console.log(`  Product Cost in DB: ${p.cost}`);
      console.log(`  Product Price in DB: ${p.price}`);
      
      // DO THE UPDATE
      p.cost = newCost;
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
      p.price = roundedPrice;
      await p.save();
      
      console.log(`[${p.name}] AFTER UPDATE`);
      console.log(`  Product Cost in DB: ${p.cost}`);
      console.log(`  Product Price in DB: ${p.price}`);
    }
  }
  await mongoose.disconnect();
}
run().catch(console.error);
