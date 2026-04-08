import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import PCPart from './src/models/PCPart';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lanforge');
  
  const parts = await PCPart.find({});
  console.log(`Checking ${parts.length} parts...`);
  
  let validCount = 0;
  let missingCost = 0;
  let missingPrice = 0;
  
  for (const part of parts) {
    let isValid = true;
    if (typeof part.cost !== 'number' || isNaN(part.cost)) {
      console.log(`[NO COST] ${part.partModel} (${part._id})`);
      missingCost++;
      isValid = false;
    }
    if (typeof part.price !== 'number' || isNaN(part.price)) {
      console.log(`[NO PRICE] ${part.partModel} (${part._id})`);
      missingPrice++;
      isValid = false;
    }
    
    if (isValid) {
      validCount++;
    }
  }
  
  console.log(`\nValid Parts: ${validCount}`);
  console.log(`Missing Cost: ${missingCost}`);
  console.log(`Missing Price: ${missingPrice}`);
  
  await mongoose.disconnect();
}
run().catch(console.error);
