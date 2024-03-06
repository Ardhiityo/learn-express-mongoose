const mongoose = require('mongoose');
const Product = require('./product');

const garmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'nama wajib di isi']
    },
    lokasi: {
        type: String,
        required: [true, 'lokasi wajib di isi']
    },
    kontak: {
        type: String,
        required: [true, 'kontak wajib di isi']
    },
    product: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]
});

garmentSchema.post(('findOneAndDelete'), async (garment) => {
    if (garment.product.length) {
        await Product.deleteMany({
            _id: {
                $in: garment.product
            }
        });
    }
});


const Garment = mongoose.model('Garment', garmentSchema);
module.exports = Garment;