import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Product from './src/models/Product';
import PCPart from './src/models/PCPart';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lanforge');
  
  const products = await Product.find({});
  
  for (const p of products) {
    console.log(`\n======================================`);
    console.log(`Product: ${p.name}`);
    console.log(`Cost: ${p.cost}`);
    console.log(`Price: ${p.price}`);
    
    if (p.parts && p.parts.length > 0) {
      console.log(`Parts (${p.parts.length}):`);
      for (const partId of p.parts) {
        const partDoc: any = await PCPart.findById(partId);
        if (partDoc) {
          const cost = partDoc.cost || partDoc.price || 0;
          console.log(`  - ${partDoc.type}: ${partDoc.partModel} -> Cost: $${cost}, Price: $${partDoc.price}`);
        } else {
          console.log(`  - [NOT FOUND] ID: ${partId}`);
        }
      }
    } else {
      console.log(`Parts: None`);
    }
  }
  
  await mongoose.disconnect();
}
run().catch(console.error);
