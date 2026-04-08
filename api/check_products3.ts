import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Product from './src/models/Product';
import PCPart from './src/models/PCPart';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lanforge');
  
  const products = await Product.find({});
  console.log(`Checking ${products.length} products...`);
  
  let validProducts = 0;
  let invalidProducts = 0;
  
  for (const p of products) {
    if (!p.parts || p.parts.length < 9) {
      console.log(`[INVALID] ${p.name}: Only has ${p.parts ? p.parts.length : 0} parts.`);
      invalidProducts++;
      continue;
    }
    
    const requiredTypes = ['cpu', 'gpu', 'ram', 'storage', 'case', 'psu', 'cpu-cooler', 'motherboard', 'os'];
    let foundTypes: string[] = [];
    
    let hasInvalidCost = false;
    for (const partId of p.parts) {
       const part: any = await PCPart.findById(partId);
       if (!part) {
           console.log(`[INVALID] ${p.name}: Has null part reference for ID ${partId}`);
           hasInvalidCost = true;
       } else {
           foundTypes.push(part.type);
           if (typeof part.cost !== 'number' && typeof part.price !== 'number') {
               console.log(`[INVALID] ${p.name}: Part ${part.name || part.partModel} missing cost/price.`);
               hasInvalidCost = true;
           }
       }
    }
    
    const missingTypes = requiredTypes.filter(type => !foundTypes.includes(type));
    
    if (missingTypes.length > 0) {
      console.log(`[INVALID] ${p.name}: Missing types: ${missingTypes.join(', ')}`);
      invalidProducts++;
    } else if (hasInvalidCost) {
      invalidProducts++;
    } else {
      validProducts++;
    }
  }
  
  console.log(`\nValid Products: ${validProducts}, Invalid Products: ${invalidProducts}`);
  await mongoose.disconnect();
}
run().catch(console.error);
