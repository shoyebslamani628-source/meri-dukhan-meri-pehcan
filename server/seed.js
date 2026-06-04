require("dotenv").config();

const connectDB = require("./config/db");
const Part = require("./models/Part");
const Supplier = require("./models/Supplier");
const User = require("./models/User");

const seed = async () => {
  await connectDB();

  const ownerEmail = process.env.OWNER_EMAIL || "owner@mechanicshop.com";
  const owner = await User.findOne({ email: ownerEmail });

  if (!owner) {
    await User.create({
      name: process.env.OWNER_NAME || "Shop Owner",
      email: ownerEmail,
      password: process.env.OWNER_PASSWORD || "Owner@12345"
    });
    console.log(`Created owner: ${ownerEmail}`);
  } else {
    console.log(`Owner already exists: ${ownerEmail}`);
  }

  const supplierCount = await Supplier.countDocuments();
  let suppliers = await Supplier.find();

  if (!supplierCount) {
    suppliers = await Supplier.insertMany([
      {
        name: "Bharat Auto Spares",
        phone: "+91 98765 43210",
        email: "sales@bharatauto.example",
        address: "Industrial Area, Pune",
        paymentDue: 12500
      },
      {
        name: "Precision Motor Parts",
        phone: "+91 91234 56780",
        email: "orders@precisionparts.example",
        address: "Mysore Road, Bengaluru",
        paymentDue: 7800
      }
    ]);
    console.log("Created sample suppliers.");
  }

  const partCount = await Part.countDocuments();

  if (!partCount) {
    await Part.insertMany([
      {
        name: "Engine Oil Filter",
        category: "Engine",
        quantity: 18,
        price: 450,
        min_stock_level: 6,
        supplier: suppliers[0]?._id
      },
      {
        name: "Front Brake Pad Set",
        category: "Brakes",
        quantity: 4,
        price: 1850,
        min_stock_level: 5,
        supplier: suppliers[0]?._id
      },
      {
        name: "Battery Terminal Clamp",
        category: "Electrical",
        quantity: 0,
        price: 220,
        min_stock_level: 8,
        supplier: suppliers[1]?._id
      },
      {
        name: "Tubeless Tyre Valve",
        category: "Tyres",
        quantity: 35,
        price: 85,
        min_stock_level: 15,
        supplier: suppliers[1]?._id
      }
    ]);
    console.log("Created sample parts.");
  }

  console.log("Seed complete.");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});

