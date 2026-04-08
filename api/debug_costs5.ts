import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Product from './src/models/Product';
import PCPart from './src/models/PCPart';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lanforge');
  
  const products = await Product.find({});
  
  for (const p of products) {
    if (p.parts && p.parts.length > 0) {
      let newCost = 0;
      
      for (const partId of p.parts) {
        const partDoc: any = await PCPart.findById(partId);
        if (partDoc) {
          const cost = partDoc.cost || partDoc.price || 0;
          newCost += cost;
        }
      }
      
      const calculatedPrice = newCost * 1.20;
      const fullDollars = Math.floor(calculatedPrice);
      const remainder = fullDollars % 50;
      
      let roundedPrice;
      if (remainder === 49) {
        roundedPrice = fullDollars + 0.99;
      } else {
        const chunksOf50 = Math.ceil((calculatedPrice - 49.99) / 50);
        roundedPrice = (chunksOf50 * 50) + 49.99;
        if (roundedPrice < calculatedPrice) {
           roundedPrice += 50;
        }
      }
      console.log(`[${p.name}] newCost: ${newCost}, calcPrice: ${calculatedPrice.toFixed(2)}, finalPrice: ${roundedPrice.toFixed(2)}`);
    }
  }
  await mongoose.disconnect();
}
run().catch(console.error);
