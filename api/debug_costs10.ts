import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Product from './src/models/Product';
import PCPart from './src/models/PCPart';
import Settings from './src/models/Settings';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lanforge');
  
  const markupSetting = await Settings.findOne({ key: 'productMarkupPercentage' });
  const markupPercentage = markupSetting && typeof markupSetting.value === 'number' ? markupSetting.value : 20;
  const markupMultiplier = 1 + (markupPercentage / 100);
  
  console.log(`Using Markup Percentage: ${markupPercentage}%`);
  
  const products = await Product.find({});
  
  for (const p of products) {
    if (p.parts && p.parts.length > 0) {
      let newCost = 0;
      let newPriceAcc = 0;
      let breakdown: string[] = [];
      
      for (const partId of p.parts) {
        const partDoc: any = await PCPart.findById(partId);
        if (partDoc) {
          const cost = partDoc.cost || 0;
          const price = partDoc.price || 0;
          newCost += cost;
          newPriceAcc += price;
          breakdown.push(`    ${partDoc.type}: ${partDoc.partModel} (Cost: $${cost}, Retail Price: $${price})`);
        }
      }
      
      console.log(`\n[${p.name}]`);
      console.log(`  Current Product Cost in DB: ${p.cost}`);
      console.log(`  Current Product Price in DB: ${p.price}`);
      console.log(`  Sum of Part Costs: ${newCost.toFixed(2)}`);
      
      const calculatedPriceFromCost = newCost * markupMultiplier;
      
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
      
      console.log(`  New Recalculated Price (Costs * ${markupMultiplier} rounded): ${roundedPrice.toFixed(2)}`);
      console.log(`  Discrepancy (if updated): Price changes from $${p.price} to $${roundedPrice.toFixed(2)}`);
      console.log(`  Breakdown:\n${breakdown.join('\n')}`);
    }
  }
  await mongoose.disconnect();
}
run().catch(console.error);
