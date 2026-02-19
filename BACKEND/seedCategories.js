const mongoose = require('mongoose')
const categoryModel = require('./models/categoryModel')

const productCategory = [
    { name: "Jersey", value: "jersey" },
    { name: "Boots", value: "boots" },
    { name: "Trainers", value: "trainers" },
    { name: "Swimwear", value: "swimwear" },
    { name: "Bags", value: "backpacks" },
    { name: "Socks", value: "socks" },
    { name: "Balls", value: "balls" },
    { name: "Jackets", value: "jackets" },
    { name: "Polo", value: "polo" },
    { name: "Sandals / Slippers", value: "sandals" },
    { name: "Wallets", value: "wallets" },
    { name: "Watches", value: "watches" },
    { name: "T-shirts", value: "t-shirts" },
    { name: "Water Bottles", value: "waterbottles" },
    { name: "Gloves", value: "gloves" },
    { name: "Headwear", value: "headwear" },
    { name: "Underwear", value: "underwear" },
    { name: "Shin Pads", value: "shinpads" },
    { name: "Vest", value: "vest" },
    { name: "Tracksuit", value: "tracksuit" },
    { name: "Sneakers", value: "sneakers" },
    { name: "Gaming", value: "gaming" },
    { name: "Headset & Pods", value: "headsetpods" },
    { name: "Towels", value: "towels" },
    { name: "Supplement", value: "supplement" },
    { name: "Unclassified", value: "unclassified" },
]

const seedCategories = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/lockerroom')
        
        const count = await categoryModel.countDocuments()
        if (count > 0) {
            console.log('Categories already exist, skipping seed')
            return
        }

        await categoryModel.insertMany(productCategory)
        console.log('Categories seeded successfully')
    } catch (error) {
        console.error('Error seeding categories:', error)
    } finally {
        await mongoose.disconnect()
    }
}

seedCategories()
