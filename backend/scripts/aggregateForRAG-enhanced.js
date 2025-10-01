import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Shop from "../models/shop.model.js";  
import Item from "../models/items.model.js";
import { embedAndUpsert } from "../utils/ai.js";

dotenv.config({ path: "../.env" });

// Enhanced data aggregation with richer context
async function fetchAndFormatEnhanced() {

    
    await mongoose.connect(process.env.MONGO_URI);

  
    const shops = await Shop.find({});
    const items = await Item.find({}).populate("shop");
    


    const chunks = [];

    // Enhanced Shop Information
    shops.forEach((shop, index) => {
        const shopText = `Restaurant: ${shop.name}
Location: ${shop.city}, ${shop.state}
Full Address: ${shop.address}
Contact: ${shop.phone || "Contact not available"}
Restaurant Type: ${shop.category || "Restaurant"}
Description: This is ${shop.name}, a popular restaurant located in ${shop.city}. 
You can find them at ${shop.address}. ${shop.phone ? `Call them at ${shop.phone} for reservations or inquiries.` : ''}
They serve various food items and are available for delivery through Hotpot app.`;

        chunks.push({
            id: `shop-${shop._id}`,
            type: "shop",
            shopId: shop._id.toString(),
            shopName: shop.name,
            city: shop.city,
            state: shop.state,
            text: shopText
        });
        
        if ((index + 1) % 10 === 0) {
         
        }
    });

    // Enhanced Item Information  
    items.forEach((item, index) => {
        const itemText = `Food Item: ${item.name}
Category: ${item.category}
Price: ₹${item.price}
Food Type: ${item.foodType} (${item.foodType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'})
Available at: ${item.shop?.name || "Restaurant not specified"}
Restaurant Location: ${item.shop?.city || "Location not specified"}, ${item.shop?.state || ""}
Description: ${item.name} is a delicious ${item.foodType} ${item.category} item priced at ₹${item.price}. 
You can order this from ${item.shop?.name || "the restaurant"} ${item.shop?.city ? `located in ${item.shop.city}` : ''}.
This is a great choice for ${item.foodType === 'veg' ? 'vegetarian' : 'non-vegetarian'} food lovers.`;

        chunks.push({
            id: `item-${item._id}`,
            type: "item", 
            itemId: item._id.toString(),
            itemName: item.name,
            category: item.category,
            price: item.price,
            foodType: item.foodType,
            shopId: item.shop?._id?.toString(),
            shopName: item.shop?.name,
            city: item.shop?.city,
            text: itemText
        });
        
        if ((index + 1) % 50 === 0) {
      
        }
    });

    // Add general app information
    const appInfo = [
        {
            id: "app-info-1",
            type: "app_info",
            text: `Hotpot Food Delivery App Information:
Hotpot is a comprehensive food delivery platform that connects customers, restaurant owners, and delivery partners.
Features include:
- Browse restaurants by location and category
- Real-time order tracking
- Multiple payment options
- Ratings and reviews system
- Quick delivery service
- User-friendly interface for ordering food`
        },
        {
            id: "app-info-2", 
            type: "app_info",
            text: `How to use Hotpot:
1. Browse restaurants in your city
2. Select items from restaurant menus
3. Add items to your cart
4. Proceed to checkout and payment
5. Track your order in real-time
6. Enjoy your food delivered to your doorstep

Hotpot serves multiple cities and offers a wide variety of cuisines including vegetarian and non-vegetarian options.`
        }
    ];
    
    chunks.push(...appInfo);

   

    // Save to file
    fs.writeFileSync("enhanced_rag_chunks.json", JSON.stringify(chunks, null, 2));
   

    // Automatically embed and upload to Pinecone
 
    try {
        await embedAndUpsert(chunks);
        
    } catch (error) {
        console.error("❌ Error uploading to Pinecone:", error.message);
       

    await mongoose.disconnect();
    console.log("✅ Database connection closed");
}

fetchAndFormatEnhanced().catch((err) => {
    console.error("❌ Error:", err.message);
    console.error(err.stack);
    process.exit(1);
});
}