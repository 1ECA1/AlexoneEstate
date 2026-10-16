import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Property from "../models/Property.js";

const img1 =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85";
const img2 =
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85";
const img3 =
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85";

const sampleProperties = [
  {
    title: "Contemporary Luxury Duplex",
    location: "Lekki Phase 1, Lagos",
    price: 185000000,
    pricePeriod: "none",
    status: "For Sale",
    type: "Detached Duplex",
    bedrooms: 4,
    bathrooms: 5,
    area: 320,
    images: [img1],
    createdAt: new Date("2026-10-12"),
  },
  {
    title: "Modern Minimalist Residence",
    location: "Maitama, Abuja",
    price: 12000000,
    pricePeriod: "year",
    status: "For Rent",
    type: "Luxury Apartment",
    bedrooms: 3,
    bathrooms: 3,
    area: 210,
    images: [img2],
    createdAt: new Date("2026-10-11"),
  },
  {
    title: "Elegant Family Home",
    location: "GRA, Port Harcourt",
    price: 95000000,
    pricePeriod: "none",
    status: "For Sale",
    type: "Semi-Detached Duplex",
    bedrooms: 5,
    bathrooms: 5,
    area: 400,
    images: [img3],
    createdAt: new Date("2026-10-10"),
  },
  {
    title: "Prime Commercial Plaza",
    location: "Wuse 2, Abuja",
    price: 450000000,
    pricePeriod: "none",
    status: "For Sale",
    type: "Commercial Property",
    bedrooms: 0,
    bathrooms: 4,
    area: 900,
    images: [img1],
    createdAt: new Date("2026-10-09"),
  },
  {
    title: "Serviced Land Plot",
    location: "Epe, Lagos",
    price: 18000000,
    pricePeriod: "none",
    status: "For Sale",
    type: "Residential Land",
    bedrooms: 0,
    bathrooms: 0,
    area: 600,
    images: [img2],
    createdAt: new Date("2026-10-08"),
  },
  {
    title: "Cozy Shortlet Studio",
    location: "Victoria Island, Lagos",
    price: 150000,
    pricePeriod: "night",
    status: "Shortlet",
    type: "Studio Apartment",
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    images: [img3],
    createdAt: new Date("2026-10-07"),
  },
  {
    title: "Spacious Terrace House",
    location: "Gwarinpa, Abuja",
    price: 7500000,
    pricePeriod: "year",
    status: "For Rent",
    type: "Terraced House",
    bedrooms: 3,
    bathrooms: 3,
    area: 180,
    images: [img1],
    createdAt: new Date("2026-10-06"),
  },
];

const seed = async () => {
  try {
    await connectDB();
    await Property.deleteMany();
    await Property.insertMany(sampleProperties);
    console.log(`Seeded ${sampleProperties.length} properties`);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
  } finally {
    await mongoose.connection.close();
  }
};

seed();