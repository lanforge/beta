const mongoose = require('mongoose');

require('dotenv').config({ path: 'api/.env' });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
  
  const PCPart = require('./api/src/models/PCPart').default;
  
  const id = '69bd707679b5694aeef8c997';
  
  console.log('Trying findById...');
  try {
    const part = await PCPart.findById(id);
    console.log('findById part:', part ? part.name : 'null');
  } catch (e: any) {
    console.error('findById error:', e.message);
  }
  
  console.log('Trying findOne with $or...');
  try {
    const part2 = await PCPart.findOne({
      $or: [{ _id: id }, { slug: id }]
    });
    console.log('findOne part:', part2 ? part2.name : 'null');
  } catch (e: any) {
    console.error('findOne error:', e.message);
  }
  
  // Try directly using ObjectId
  console.log('Trying fineOne with mongoose.Types.ObjectId...');
  try {
    const part3 = await PCPart.findOne({
      $or: [{ _id: new mongoose.Types.ObjectId(id) }, { slug: id }]
    });
    console.log('findOne ObjectId part:', part3 ? part3.name : 'null');
  } catch (e: any) {
    console.error('findOne ObjectId error:', e.message);
  }
  
  process.exit(0);
}

run();