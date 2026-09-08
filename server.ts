import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

interface Listing {
  id: string;
  title: string;
  category: string;
  location: string;
  price: number;
  phone: string;
  image: string;
  description: string;
  status: 'approved' | 'pending' | 'rejected';
  isFeatured: boolean;
  date: string;
  userId: string;
  views: number;
  serviceTrade?: string;
  pricingType?: 'fixed' | 'starting_at' | 'hourly' | 'quote';
  serviceArea?: string;
  isVerifiedPro?: boolean;
  isEmergency247?: boolean;
}

interface User {
  id: string;
  username: string;
  fullname: string;
  email: string;
  password?: string;
  securityQuestion: string;
  securityAnswer?: string;
  created: string;
}

interface EventItem {
  id: string;
  title: string;
  category: string;
  district: string;
  date: string;
  month: string;
  day: string;
  time: string;
  location: string;
  venue: string;
  image: string;
  badge?: string;
  price: string;
  isFree: boolean;
  attendees: number;
  description: string;
  organizer: string;
  isSpotlight?: boolean;
}

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const LISTINGS_FILE = path.join(DATA_DIR, 'listings.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const ADMIN_CONFIG_FILE = path.join(DATA_DIR, 'admin.json');

function getAdminPassword(): string {
  if (fs.existsSync(ADMIN_CONFIG_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(ADMIN_CONFIG_FILE, 'utf-8'));
      if (data.password) return String(data.password);
    } catch {
      // ignore
    }
  }
  return process.env.ADMIN_PASSWORD || 'admin123';
}

function setAdminPassword(newPassword: string): void {
  fs.writeFileSync(
    ADMIN_CONFIG_FILE,
    JSON.stringify({ password: newPassword, updatedAt: new Date().toISOString() }, null, 2),
    'utf-8'
  );
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Seed Data
const DEFAULT_LISTINGS: Listing[] = [
  {
    id: '101',
    title: 'Toyota Vitz KSP130 Safety Edition 2018',
    category: 'Vehicles',
    location: 'Colombo',
    price: 7850000,
    phone: '0771234567',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    description: 'First owner, low mileage (42,000 km), original paint, fully serviced at Toyota Lanka. Eco-mode, push start, reverse camera with guide lines. Price negotiable after inspection in Colombo 07.',
    status: 'approved',
    isFeatured: true,
    date: '2026-09-01',
    userId: 'system',
    views: 142
  },
  {
    id: '102',
    title: 'Apple iPhone 15 Pro 128GB Natural Titanium',
    category: 'Electronics',
    location: 'Gampaha',
    price: 315000,
    phone: '0719876543',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
    description: 'Brand new condition (Battery Health 99%), full set with original box and braided Type-C cable. Apple Care warranty remaining for 5 months. No scratches or dents. Glass screen protector applied from day 1.',
    status: 'approved',
    isFeatured: false,
    date: '2026-09-03',
    userId: 'system',
    views: 89
  },
  {
    id: '103',
    title: '2-Story Modern Luxury House in Kandy Town',
    category: 'Property',
    location: 'Kandy',
    price: 45000000,
    phone: '0755554433',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    description: '15 Perches prime residential land with 4 large bedrooms, 3 attached modern bathrooms with solar hot water, rooftop terrace with scenic Hanthana mountain view. Just 5 minutes drive to Kandy lake & city center.',
    status: 'approved',
    isFeatured: true,
    date: '2026-09-05',
    userId: 'system',
    views: 230
  },
  {
    id: '104',
    title: 'Sony PlayStation 5 Console + 2 DualSense Controllers',
    category: 'Electronics',
    location: 'Galle',
    price: 185000,
    phone: '0781122334',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
    description: 'Disc Edition PS5 with 2 original wireless controllers, HDMI 2.1 cable, power cord, and God of War Ragnarok physical game disc included. Used very lightly on weekends.',
    status: 'approved',
    isFeatured: false,
    date: '2026-09-06',
    userId: 'system',
    views: 12
  },
  {
    id: '105',
    title: 'Yamaha FZ-S Version 3.0 ABS (Dark Knight)',
    category: 'Motorcycles',
    location: 'Kurunegala',
    price: 980000,
    phone: '0702233445',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
    description: '2022 Registered BIH-XXXX, Single-channel ABS, pristine condition, single owner used for daily office commute. 18,500 km done. New rear tubeless tyre recently installed.',
    status: 'pending',
    isFeatured: false,
    date: '2026-09-04',
    userId: 'system',
    views: 67
  },
  {
    id: '106',
    title: 'Luxury 3-Bedroom Furnished Apartment for Rent',
    category: 'Property',
    location: 'Colombo',
    price: 260000,
    phone: '0763344556',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    description: 'Spacious sea-view 1,450 sqft apartment in Kollupitiya. Fully air-conditioned, gym, infinity swimming pool, backup generator, and 2 designated parking slots. Monthly rent LKR 260,000.',
    status: 'pending',
    isFeatured: true,
    date: '2026-09-02',
    userId: 'system',
    views: 195
  }
];

// Helper to read/write listings
function getStoredListings(): Listing[] {
  try {
    if (fs.existsSync(LISTINGS_FILE)) {
      const data = fs.readFileSync(LISTINGS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading listings file, fallback to defaults', err);
  }
  saveStoredListings(DEFAULT_LISTINGS);
  return DEFAULT_LISTINGS;
}

function saveStoredListings(listings: Listing[]) {
  try {
    fs.writeFileSync(LISTINGS_FILE, JSON.stringify(listings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving listings file', err);
  }
}

// Helper to read/write users
function getStoredUsers(): User[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading users file', err);
  }
  return [];
}

function saveStoredUsers(users: User[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users file', err);
  }
}

const DEFAULT_EVENTS: EventItem[] = [
  {
    id: 'cardcon_lanka',
    title: 'CARDCON & Collectibles Expo 2026',
    category: 'Entertainment',
    district: 'Colombo',
    date: 'OCT 18 - 20, 2026',
    month: 'OCT',
    day: '18',
    time: '10:00 AM - 08:00 PM',
    location: 'Colombo 07',
    venue: 'BMICH Exhibition Centre, Hall A',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    badge: 'Popular',
    price: 'Free Entry',
    isFree: true,
    attendees: 4200,
    description: 'Sri Lanka’s premier trading card, gaming, pop culture, and collectible convention. Trade rare Pokémon, sports cards, comics, and participate in competitive tabletop showdowns.',
    organizer: 'Lanka Collectors Guild',
    isSpotlight: true,
  },
  {
    id: 'colombo_motor_show',
    title: 'Ceylon International Motor Show',
    category: 'Exhibitions',
    district: 'Colombo',
    date: 'NOV 05 - 08, 2026',
    month: 'NOV',
    day: '05',
    time: '09:00 AM - 09:00 PM',
    location: 'Colombo 01',
    venue: 'Colombo Port City Marina Boulevard',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
    badge: 'Featured',
    price: 'LKR 1,500',
    isFree: false,
    attendees: 12500,
    description: 'The premier automotive showcase featuring electric mobility, supercars, vintage classics, 4x4 overland rigs, and live drift exhibitions.',
    organizer: 'Ceylon Motor Sports Club',
    isSpotlight: true,
  },
  {
    id: 'galle_food_fest',
    title: 'Southern Spice & Seafood Festival',
    category: 'Food & Culture',
    district: 'Galle',
    date: 'DEC 12 - 14, 2026',
    month: 'DEC',
    day: '12',
    time: '04:00 PM - 11:30 PM',
    location: 'Galle Fort',
    venue: 'Galle Fort Ramparts Lawn',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    badge: 'Culinary',
    price: 'Free Entry',
    isFree: true,
    attendees: 8900,
    description: 'Authentic southern Sri Lankan seafood curries, artisanal bakeries, live acoustic island bands, and sunset ocean dining.',
    organizer: 'Galle Heritage Tourism',
    isSpotlight: true,
  },
  {
    id: 'lanka_comic_con',
    title: 'Lanka Comic Con & Gaming Arena',
    category: 'Entertainment',
    district: 'Colombo',
    date: 'JAN 22 - 24, 2027',
    month: 'JAN',
    day: '22',
    time: '11:00 AM - 09:00 PM',
    location: 'Battaramulla',
    venue: 'SLECC Exhibition Hall',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
    badge: 'Gaming',
    price: 'LKR 800',
    isFree: false,
    attendees: 6400,
    description: 'Cosplay championships, international indie game stalls, VR gaming suites, artist alleys, and tabletop tournaments.',
    organizer: 'Geek Club of Sri Lanka',
    isSpotlight: true,
  },
  {
    id: 'kandy_heritage_fest',
    title: 'Kandy Hill Country Crafts & Culture',
    category: 'Food & Culture',
    district: 'Kandy',
    date: 'FEB 04 - 07, 2027',
    month: 'FEB',
    day: '04',
    time: '10:00 AM - 08:30 PM',
    location: 'Kandy',
    venue: 'Kandy Lake Round Promenade',
    image: 'https://images.unsplash.com/photo-1609137144822-4752c0f4553a?w=800&auto=format&fit=crop&q=80',
    badge: 'Cultural',
    price: 'Free Entry',
    isFree: true,
    attendees: 5100,
    description: 'Traditional Kandyan brassware, handloom weaving masterclasses, Ceylon spice exhibits, and authentic hill-country culinary treats.',
    organizer: 'Central Province Cultural Dept',
    isSpotlight: false,
  },
  {
    id: 'tech_summit_colombo',
    title: 'AI & Digital Sri Lanka Summit',
    category: 'Tech',
    district: 'Colombo',
    date: 'FEB 20 - 21, 2027',
    month: 'FEB',
    day: '20',
    time: '08:30 AM - 05:30 PM',
    location: 'Colombo 03',
    venue: 'Cinnamon Grand Colombo, Oak Room',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    badge: 'Tech Summit',
    price: 'Registration Req.',
    isFree: false,
    attendees: 3100,
    description: 'Keynotes from top global AI pioneers, venture capital speed-dating, startup pitch battle with USD 25k in grants, and engineering workshops.',
    organizer: 'SLASSCOM & Tech Lanka',
    isSpotlight: false,
  },
  {
    id: 'jaffna_music_fiesta',
    title: 'Northern Beats & Food Carnival',
    category: 'Food & Culture',
    district: 'Jaffna',
    date: 'MAR 14 - 15, 2027',
    month: 'MAR',
    day: '14',
    time: '05:00 PM - 11:00 PM',
    location: 'Jaffna',
    venue: 'Jaffna Cultural Centre Open Arena',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    badge: 'Live Music',
    price: 'Free Entry',
    isFree: true,
    attendees: 7300,
    description: 'Celebration of northern Sri Lankan flavours (authentic Jaffna crab curry, Odiyal Kool), Carnatic fusion bands, and fire performances.',
    organizer: 'Northern Tourism Bureau',
    isSpotlight: false,
  },
  {
    id: 'negombo_beach_fest',
    title: 'Negombo Coastline Beach Fest & Regatta',
    category: 'Sports',
    district: 'Negombo',
    date: 'APR 03 - 05, 2027',
    month: 'APR',
    day: '03',
    time: '08:00 AM - 10:00 PM',
    location: 'Negombo',
    venue: 'Negombo Beach Park Golden Sands',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    badge: 'Beach & Sports',
    price: 'Free Entry',
    isFree: true,
    attendees: 9800,
    description: 'Catamaran regatta races, beach volleyball tournament, live acoustic sets by the shore, and sundown cocktail lounges.',
    organizer: 'Negombo Municipal Council',
    isSpotlight: false,
  }
];

function getStoredEvents(): EventItem[] {
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      const data = fs.readFileSync(EVENTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading events file, fallback to defaults', err);
  }
  saveStoredEvents(DEFAULT_EVENTS);
  return DEFAULT_EVENTS;
}

function saveStoredEvents(events: EventItem[]) {
  try {
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving events file', err);
  }
}

let listingsCache = getStoredListings();
let usersCache = getStoredUsers();
let eventsCache = getStoredEvents();

// Lazy initialize Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // -------------------------------------------------------------
  // API Routes
  // -------------------------------------------------------------

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // GET /api/listings
  app.get('/api/listings', (req, res) => {
    const { status, category, location, search, minPrice, maxPrice, sort, userId } = req.query;

    let result = [...listingsCache];

    if (userId) {
      result = result.filter(item => item.userId === String(userId));
    } else if (status === 'all') {
      // Return all listings (e.g. for admin)
    } else if (status === 'pending') {
      result = result.filter(item => item.status === 'pending');
    } else {
      // By default, public search only returns approved listings
      result = result.filter(item => item.status === 'approved');
    }

    if (category && category !== 'All') {
      result = result.filter(item => item.category.toLowerCase() === String(category).toLowerCase());
    }

    if (location && location !== 'All Sri Lanka') {
      result = result.filter(item => item.location.toLowerCase() === String(location).toLowerCase());
    }

    if (search) {
      const q = String(search).toLowerCase();
      result = result.filter(item => item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q));
    }

    if (minPrice) {
      const min = parseFloat(String(minPrice));
      if (!isNaN(min)) {
        result = result.filter(item => item.price >= min);
      }
    }

    if (maxPrice) {
      const max = parseFloat(String(maxPrice));
      if (!isNaN(max)) {
        result = result.filter(item => item.price <= max);
      }
    }

    // Sort
    if (sort === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else {
      // newest first
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    res.json(result);
  });

  // GET /api/listings/:id
  app.get('/api/listings/:id', (req, res) => {
    const item = listingsCache.find(l => l.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json(item);
  });

  // POST /api/listings
  app.post('/api/listings', (req, res) => {
    const {
      title,
      category,
      location,
      price,
      phone,
      image,
      description,
      userId,
      serviceTrade,
      pricingType,
      serviceArea,
      isVerifiedPro,
      isEmergency247,
    } = req.body;

    if (!title || !category || !location || price === undefined || !phone || !description) {
      return res.status(400).json({ error: 'Missing required listing fields' });
    }

    const newListing: Listing = {
      id: Date.now().toString(),
      title: String(title).trim(),
      category: String(category).trim(),
      location: String(location).trim(),
      price: Number(price),
      phone: String(phone).trim(),
      image: image || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
      description: String(description).trim(),
      status: 'pending', // Pending admin review
      isFeatured: false,
      date: new Date().toISOString().split('T')[0],
      userId: userId ? String(userId) : 'system',
      views: 0,
      serviceTrade: serviceTrade ? String(serviceTrade).trim() : undefined,
      pricingType: pricingType || (category === 'Services' ? 'starting_at' : 'fixed'),
      serviceArea: serviceArea ? String(serviceArea).trim() : undefined,
      isVerifiedPro: Boolean(isVerifiedPro),
      isEmergency247: Boolean(isEmergency247),
    };

    listingsCache.unshift(newListing);
    saveStoredListings(listingsCache);
    res.status(201).json(newListing);
  });

  // PUT /api/listings/:id
  app.put('/api/listings/:id', (req, res) => {
    const index = listingsCache.findIndex(l => l.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const current = listingsCache[index];
    const {
      title,
      category,
      location,
      price,
      phone,
      image,
      description,
      isFeatured,
      status,
      serviceTrade,
      pricingType,
      serviceArea,
      isVerifiedPro,
      isEmergency247,
    } = req.body;

    listingsCache[index] = {
      ...current,
      title: title !== undefined ? String(title).trim() : current.title,
      category: category !== undefined ? String(category).trim() : current.category,
      location: location !== undefined ? String(location).trim() : current.location,
      price: price !== undefined ? Number(price) : current.price,
      phone: phone !== undefined ? String(phone).trim() : current.phone,
      image: image !== undefined ? String(image) : current.image,
      description: description !== undefined ? String(description).trim() : current.description,
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : current.isFeatured,
      status: status !== undefined ? status : current.status,
      serviceTrade: serviceTrade !== undefined ? String(serviceTrade).trim() : current.serviceTrade,
      pricingType: pricingType !== undefined ? pricingType : current.pricingType,
      serviceArea: serviceArea !== undefined ? String(serviceArea).trim() : current.serviceArea,
      isVerifiedPro: isVerifiedPro !== undefined ? Boolean(isVerifiedPro) : current.isVerifiedPro,
      isEmergency247: isEmergency247 !== undefined ? Boolean(isEmergency247) : current.isEmergency247,
    };

    saveStoredListings(listingsCache);
    res.json(listingsCache[index]);
  });

  // PUT /api/listings/:id/verify-pro
  app.put('/api/listings/:id/verify-pro', (req, res) => {
    const index = listingsCache.findIndex(l => l.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    listingsCache[index].isVerifiedPro = !listingsCache[index].isVerifiedPro;
    saveStoredListings(listingsCache);
    res.json(listingsCache[index]);
  });

  // PUT /api/listings/:id/approve
  app.put('/api/listings/:id/approve', (req, res) => {
    const index = listingsCache.findIndex(l => l.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    listingsCache[index].status = 'approved';
    saveStoredListings(listingsCache);
    res.json(listingsCache[index]);
  });

  // PUT /api/listings/:id/reject
  app.put('/api/listings/:id/reject', (req, res) => {
    const index = listingsCache.findIndex(l => l.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    listingsCache[index].status = 'rejected';
    saveStoredListings(listingsCache);
    res.json(listingsCache[index]);
  });

  // PUT /api/listings/:id/feature
  app.put('/api/listings/:id/feature', (req, res) => {
    const index = listingsCache.findIndex(l => l.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    listingsCache[index].isFeatured = !listingsCache[index].isFeatured;
    saveStoredListings(listingsCache);
    res.json(listingsCache[index]);
  });

  // PUT /api/listings/:id/view
  app.put('/api/listings/:id/view', (req, res) => {
    const index = listingsCache.findIndex(l => l.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    listingsCache[index].views = (listingsCache[index].views || 0) + 1;
    saveStoredListings(listingsCache);
    res.json({ views: listingsCache[index].views });
  });

  // DELETE /api/listings/:id
  app.delete('/api/listings/:id', (req, res) => {
    const index = listingsCache.findIndex(l => l.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    listingsCache.splice(index, 1);
    saveStoredListings(listingsCache);
    res.json({ success: true, message: 'Listing deleted' });
  });

  // -------------------------------------------------------------
  // Events & Upcoming Spotlight Routes
  // -------------------------------------------------------------

  // GET /api/events
  app.get('/api/events', (req, res) => {
    const { category, district, spotlight } = req.query;
    let result = [...eventsCache];

    if (spotlight === 'true') {
      result = result.filter(e => e.isSpotlight);
    }
    if (category && category !== 'All') {
      result = result.filter(e => e.category.toLowerCase() === String(category).toLowerCase());
    }
    if (district && district !== 'All') {
      result = result.filter(e => e.district.toLowerCase() === String(district).toLowerCase());
    }

    res.json(result);
  });

  // POST /api/events
  app.post('/api/events', (req, res) => {
    const {
      title,
      category,
      district,
      date,
      month,
      day,
      time,
      location,
      venue,
      image,
      badge,
      price,
      isFree,
      attendees,
      description,
      organizer,
      isSpotlight
    } = req.body;

    if (!title || !category || !venue) {
      return res.status(400).json({ error: 'Title, category, and venue are required.' });
    }

    const newEvent: EventItem = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: String(title).trim(),
      category: String(category).trim(),
      district: district ? String(district).trim() : 'Colombo',
      date: date ? String(date).trim() : 'Upcoming 2026',
      month: month ? String(month).trim().toUpperCase() : 'OCT',
      day: day ? String(day).trim() : '01',
      time: time ? String(time).trim() : '10:00 AM - 06:00 PM',
      location: location ? String(location).trim() : (district || 'Colombo'),
      venue: String(venue).trim(),
      image: image ? String(image) : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      badge: badge ? String(badge).trim() : 'Featured',
      price: isFree ? 'Free Entry' : (price ? String(price).trim() : 'Free Entry'),
      isFree: Boolean(isFree),
      attendees: attendees ? Number(attendees) : 1000,
      description: description ? String(description).trim() : '',
      organizer: organizer ? String(organizer).trim() : 'HUTA Community',
      isSpotlight: isSpotlight !== undefined ? Boolean(isSpotlight) : true,
    };

    eventsCache.unshift(newEvent);
    saveStoredEvents(eventsCache);
    res.status(201).json(newEvent);
  });

  // PUT /api/events/:id
  app.put('/api/events/:id', (req, res) => {
    const index = eventsCache.findIndex(e => e.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const current = eventsCache[index];
    const {
      title,
      category,
      district,
      date,
      month,
      day,
      time,
      location,
      venue,
      image,
      badge,
      price,
      isFree,
      attendees,
      description,
      organizer,
      isSpotlight
    } = req.body;

    eventsCache[index] = {
      ...current,
      title: title !== undefined ? String(title).trim() : current.title,
      category: category !== undefined ? String(category).trim() : current.category,
      district: district !== undefined ? String(district).trim() : current.district,
      date: date !== undefined ? String(date).trim() : current.date,
      month: month !== undefined ? String(month).trim().toUpperCase() : current.month,
      day: day !== undefined ? String(day).trim() : current.day,
      time: time !== undefined ? String(time).trim() : current.time,
      location: location !== undefined ? String(location).trim() : current.location,
      venue: venue !== undefined ? String(venue).trim() : current.venue,
      image: image !== undefined ? String(image) : current.image,
      badge: badge !== undefined ? String(badge).trim() : current.badge,
      price: price !== undefined ? String(price).trim() : current.price,
      isFree: isFree !== undefined ? Boolean(isFree) : current.isFree,
      attendees: attendees !== undefined ? Number(attendees) : current.attendees,
      description: description !== undefined ? String(description).trim() : current.description,
      organizer: organizer !== undefined ? String(organizer).trim() : current.organizer,
      isSpotlight: isSpotlight !== undefined ? Boolean(isSpotlight) : current.isSpotlight,
    };

    saveStoredEvents(eventsCache);
    res.json(eventsCache[index]);
  });

  // PUT /api/events/:id/spotlight
  app.put('/api/events/:id/spotlight', (req, res) => {
    const index = eventsCache.findIndex(e => e.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }
    eventsCache[index].isSpotlight = !eventsCache[index].isSpotlight;
    saveStoredEvents(eventsCache);
    res.json(eventsCache[index]);
  });

  // DELETE /api/events/:id
  app.delete('/api/events/:id', (req, res) => {
    const index = eventsCache.findIndex(e => e.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }
    eventsCache.splice(index, 1);
    saveStoredEvents(eventsCache);
    res.json({ success: true, message: 'Event deleted' });
  });

  // -------------------------------------------------------------
  // Auth Routes
  // -------------------------------------------------------------

  // Admin login
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    const currentAdminPassword = getAdminPassword();
    if (password === currentAdminPassword) {
      return res.json({ success: true, role: 'admin' });
    }
    return res.status(401).json({ error: 'Invalid admin credentials' });
  });

  // Admin change password
  app.post('/api/admin/change-password', (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const activeAdminPassword = getAdminPassword();

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (currentPassword !== activeAdminPassword) {
      return res.status(401).json({ error: 'Incorrect current admin password.' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    setAdminPassword(String(newPassword));
    return res.json({ success: true, message: 'Admin password updated successfully!' });
  });

  // User register
  app.post('/api/auth/register', (req, res) => {
    const { username, fullname, email, password, securityQuestion, securityAnswer } = req.body;

    if (!username || !password || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ error: 'Username, password, and security question are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const existing = usersCache.find(u => u.username.toLowerCase() === cleanUsername);
    if (existing) {
      return res.status(409).json({ error: 'Username already registered.' });
    }

    const newUser: User = {
      id: 'user_' + Date.now(),
      username: cleanUsername,
      fullname: fullname ? String(fullname).trim() : cleanUsername,
      email: email ? String(email).trim() : `${cleanUsername}@huta.lk`,
      password: String(password),
      securityQuestion: String(securityQuestion),
      securityAnswer: String(securityAnswer).trim().toLowerCase(),
      created: new Date().toISOString()
    };

    usersCache.push(newUser);
    saveStoredUsers(usersCache);

    // Return user without security details
    const safeUser = { ...newUser };
    delete safeUser.password;
    delete safeUser.securityAnswer;
    res.status(201).json(safeUser);
  });

  // User login
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required.' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const user = usersCache.find(u => (u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanUsername) && u.password === password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const safeUser = { ...user };
    delete safeUser.password;
    delete safeUser.securityAnswer;
    res.json(safeUser);
  });

  // Get Security Question for User
  app.post('/api/auth/get-question', (req, res) => {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username required.' });
    }
    const cleanUsername = String(username).trim().toLowerCase();
    const user = usersCache.find(u => u.username.toLowerCase() === cleanUsername);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const questionMap: Record<string, string> = {
      pet: "What is your pet's name?",
      mother: "What is your mother's maiden name?",
      city: "What city were you born in?",
      school: "What is your primary school name?"
    };

    const questionText = questionMap[user.securityQuestion] || user.securityQuestion || "Security Question";
    res.json({ question: questionText });
  });

  // Reset Password via Security Answer
  app.post('/api/auth/reset-password', (req, res) => {
    const { username, answer, newPassword } = req.body;
    if (!username || !answer || !newPassword) {
      return res.status(400).json({ error: 'Username, answer, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanAnswer = String(answer).trim().toLowerCase();
    const userIndex = usersCache.findIndex(u => u.username.toLowerCase() === cleanUsername);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = usersCache[userIndex];
    if (!user.securityAnswer || user.securityAnswer.toLowerCase() !== cleanAnswer) {
      return res.status(403).json({ error: 'Incorrect security answer.' });
    }

    usersCache[userIndex].password = String(newPassword);
    saveStoredUsers(usersCache);
    res.json({ success: true, message: 'Password reset successfully. Please login.' });
  });

  // Change Password
  app.post('/api/auth/change-password', (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const userIndex = usersCache.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (usersCache[userIndex].password !== currentPassword) {
      return res.status(403).json({ error: 'Current password is incorrect.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    usersCache[userIndex].password = String(newPassword);
    saveStoredUsers(usersCache);
    res.json({ success: true, message: 'Password updated successfully.' });
  });

  // -------------------------------------------------------------
  // AI Feature: Suggest & Enhance Ad Description
  // -------------------------------------------------------------
  app.post('/api/ai/suggest-description', async (req, res) => {
    const { title, category, price, location, condition, notes } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    const ai = getGenAI();
    if (ai) {
      try {
        const prompt = `You are an expert classifieds copywriter for HUTA Sri Lanka (Sri Lanka's leading marketplace).
Write an attractive, professional, and clear advertisement description for the following item:
- Item Title: ${title}
- Category: ${category}
- Location: ${location || 'Sri Lanka'}
- Price: Rs ${price ? Number(price).toLocaleString('en-LK') : 'Negotiable'}
- Condition: ${condition || 'Good/Used'}
- Key Highlights / Seller Notes: ${notes || 'Clean, tested, fully functional'}

Rules:
1. Write 2-3 concise paragraphs or bullet points highlighting key specifications, cosmetic & functional condition, and reasons to buy.
2. Include a friendly note encouraging serious buyers in Sri Lanka to call or WhatsApp.
3. Mention whether price is negotiable and inspection location.
4. Keep the tone authentic, direct, and high-trust. Avoid exaggeration. Only return the plain text description.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        const descriptionText = response.text?.trim();
        if (descriptionText) {
          return res.json({ description: descriptionText, source: 'gemini' });
        }
      } catch (err) {
        console.warn('Gemini API call failed, using intelligent template fallback:', err);
      }
    }

    // High quality rule-based fallback if GEMINI_API_KEY is not set or failed
    const fallback = `${title} is in excellent condition and ready for immediate purchase in ${location || 'Sri Lanka'}.

Key Highlights:
• Category: ${category}
• Genuine item, thoroughly checked and maintained
• Well taken care of with minimal signs of usage
• Complete with all standard accessories

Price: Rs ${price ? Number(price).toLocaleString('en-LK') : 'Negotiable'}. Price is slightly negotiable after genuine inspection for serious buyers. Contact via phone call or WhatsApp to arrange viewing.`;

    res.json({ description: fallback, source: 'template' });
  });

  // Catch-all for undefined API routes
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  // Global error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({ error: err?.message || 'Internal server error' });
  });

  // -------------------------------------------------------------
  // Vite Dev Server / Production Static Serving
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
