const mongoose = require('mongoose');
const Product = require('./models/product');

mongoose.connect('mongodb://127.0.0.1/shop_db')
    .then(() => {
        console.log('Connect to mongoDB');
    }).catch((err) => {
        console.log(err);
    });

const seedProduct = [{
        "name": "Kemeja Flanel",
        "brand": "Hollister",
        "price": 750000,
        "color": "biru muda",
        "category": "Baju",
    },
    {
        "name": "Sweater",
        "brand": "Gap",
        "price": 650000,
        "color": "merah muda",
        "category": "Fashion"
    },
    {
        "name": "Tas Ransel",
        "brand": "Herschel",
        "price": 1500000,
        "color": "biru",
        "category": "Fashion"
    },
    {
        "name": "Baju Renang",
        "brand": "Speedo",
        "price": 500000,
        "color": "biru tua",
        "category": "Baju",
    },
    {
        "name": "Topi Baseball",
        "brand": "New Era",
        "price": 350000,
        "color": "hitam",
        "category": "Fashion",
    },
    {
        "name": "Rompi",
        "brand": "Zara",
        "price": 850000,
        "color": "abu-abu",
        "category": "Baju"
    },
    {
        "name": "Jas",
        "brand": "Hugo Boss",
        "price": 4500000,
        "color": "hitam",
        "category": "Fashion",
    },
]

Product.insertMany(seedProduct)
    .then((result) => {
        console.log(result);
    }).catch((err) => {
        console.log(err);
    });