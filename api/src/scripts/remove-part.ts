import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env from the root of api directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import models
import PCPart from '../models/PCPart';
import Product from '../models/Product';
import Accessory from '../models/Accessory';

const removePart = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');

    const skuToRemove = 'PART-565171';
    let foundAndDeleted = false;

    // Check PCParts
    const pcPartResult = await PCPart.deleteOne({ sku: skuToRemove });
    if (pcPartResult.deletedCount > 0) {
      console.log(`✅ Successfully deleted part with sku: ${skuToRemove} from 'PCPart' collection`);
      foundAndDeleted = true;
    }

    // Check Products
    const productResult = await Product.deleteOne({ sku: skuToRemove });
    if (productResult.deletedCount > 0) {
      console.log(`✅ Successfully deleted part with sku: ${skuToRemove} from 'Product' collection`);
      foundAndDeleted = true;
    }

    // Check Accessories
    const accessoryResult = await Accessory.deleteOne({ sku: skuToRemove });
    if (accessoryResult.deletedCount > 0) {
      console.log(`✅ Successfully deleted part with sku: ${skuToRemove} from 'Accessory' collection`);
      foundAndDeleted = true;
    }

    if (!foundAndDeleted) {
      console.log(`⚠️ Part with sku: ${skuToRemove} not found in any inventory collection (PCPart, Product, Accessory).`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  }
};

removePart();