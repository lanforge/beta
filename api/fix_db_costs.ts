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
      p.cost = newCost;
      await p.save();
    }
  }
  
  console.log('Fixed DB Costs');
  await mongoose.disconnect();
}
run().catch(console.error);
