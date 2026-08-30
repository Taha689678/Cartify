import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import Product from './models/Product.js';

const SELLER_ID = '6a920678b82630dd9be92f73';

const catElectronics = '6a92037b0367ac8c2b1de390';
const catAudio = '6a920abba11cf767c88cb153';
const catWatches = '6a920abba11cf767c88cb154';
const catComputers = '6a920abba11cf767c88cb155';
const catGym = '6a94884fee1b6626ccfcd76b';

const imagesElectronics = [
  'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800',
  'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?q=80&w=800',
  'https://images.unsplash.com/photo-1506947411487-a56738267384?q=80&w=800',
  'https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=800',
  'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800'
];

const imagesAudio = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800',
  'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800',
  'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=800',
  'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800'
];

const imagesWatches = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800',
  'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800',
  'https://images.unsplash.com/photo-1434493789847-2f02b0c1eeb4?q=80&w=800',
  'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800',
  'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?q=80&w=800'
];

const imagesComputers = [
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800',
  'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800',
  'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800',
  'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=800'
];

const imagesGym = [
  'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=800',
  'https://images.unsplash.com/photo-1579722820308-d74e571900a9?q=80&w=800',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800',
  'https://images.unsplash.com/photo-1526506159807-1a5e335c058b?q=80&w=800'
];

const generatedProducts = [];

function generate(category, images, prefixes, items, suffixes, basePrice) {
  for (let i = 0; i < 10; i++) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const item = items[Math.floor(Math.random() * items.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const name = `${prefix} ${item} ${suffix}`;
    
    const price = Math.floor(basePrice * (0.8 + Math.random() * 0.7));
    const compareAt = Math.floor(price * (1.1 + Math.random() * 0.3));
    
    generatedProducts.push({
      name: name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substr(2,4),
      description: `Experience the pinnacle of performance with the ${name}. Designed with precision engineering and premium materials, this product delivers exceptional value and unparalleled quality for everyday use.`,
      price: price,
      compareAtPrice: compareAt,
      stock: Math.floor(Math.random() * 150) + 10,
      seller: SELLER_ID,
      categories: [category],
      images: [{ url: images[i % images.length] }]
    });
  }
}

generate(catElectronics, imagesElectronics, 
  ['Ultra', 'Quantum', 'Nexus', 'Apex', 'Nova', 'Vision'], 
  ['Smart TV', '4K Drone', 'Mirrorless Camera', 'Gaming Console', 'Pro Tablet', 'VR Headset'], 
  ['Pro', 'Max', 'Series X', 'Elite', 'Plus', 'Edition'], 
  95000);

generate(catAudio, imagesAudio, 
  ['Sonic', 'Acoustic', 'Bass', 'Aero', 'Studio', 'Pulse'], 
  ['Wireless Earbuds', 'Over-Ear Headphones', 'Bluetooth Speaker', 'Condenser Mic', 'Soundbar'], 
  ['Pro', 'Active', 'ANC', 'Max', 'Lite'], 
  12000);

generate(catWatches, imagesWatches, 
  ['Titanium', 'Sport', 'Health', 'Active', 'Classic', 'Chrono'], 
  ['Smartwatch', 'Fitness Tracker', 'Hybrid Watch', 'Pro Band'], 
  ['Gen 3', 'Series 9', 'Pro', 'Ultra', 'GPS'], 
  25000);

generate(catComputers, imagesComputers, 
  ['Cyber', 'Pro', 'Elite', 'Zen', 'Legion', 'Omni'], 
  ['Gaming Laptop', 'Mechanical Keyboard', 'Curved Monitor', 'Wireless Mouse', 'NVMe SSD', 'Ultrabook'], 
  ['M3', 'X', 'Pro Max', 'RGB', '144Hz'], 
  110000);

generate(catGym, imagesGym, 
  ['Optimum', 'Gold', 'Nitro', 'Pure', 'Iron', 'Apex'], 
  ['Whey Protein', 'Pre-Workout', 'Creatine', 'BCAA', 'Mass Gainer', 'Lifting Belt'], 
  ['Isolate', 'Blend', 'Extreme', 'Formula', 'Pro'], 
  8500);

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log(`Seeding ${generatedProducts.length} products...`);
  let successCount = 0;
  for (const prod of generatedProducts) {
    try {
      await Product.create(prod);
      successCount++;
    } catch (e) {
      console.log('Skipped/Failed:', prod.name);
    }
  }
  console.log(`Successfully seeded ${successCount} products!`);
  process.exit(0);
});
