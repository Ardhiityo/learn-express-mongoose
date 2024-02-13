const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const app = express();
const errorHandler = require('./ErrorHandler');

const Product = require('./models/product');

mongoose.connect('mongodb://127.0.0.1/shop_db')
    .then(() => {
        console.log('Connect to mongoDB');
    }).catch((err) => {
        console.log(err);
    });

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(morgan('tiny'));
app.use(express.urlencoded({
    extended: true
}));
app.use(methodOverride('_method'));


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/products', async (req, res) => {
    const {
        category
    } = req.query;
    if (category) {
        const products = await Product.find({
            category
        });
        res.render('products/index', {
            products,
            category
        });
    } else {
        const products = await Product.find({});
        res.render('products/index', {
            products,
            category: 'all'
        });
    }
});

app.get('/products/create', (req, res) => {
    res.render('products/create');
});

app.get('/products/edit/:id', async (req, res, next) => {
    try {
        const {
            id
        } = req.params;
        const products = await Product.findById(id);
        console.log(products);
        res.render('products/edit', {
            products
        });
    } catch (error) {
        next(new errorHandler('Terjadi kesalahan', 404));
    }
});

app.get('/products/:id', async (req, res, next) => {
    try {
        const {
            id
        } = req.params;
        const products = await Product.findById(id);
        res.render('products/show', {
            products
        });
    } catch (error) {
        next(new errorHandler('Terjadi kesalahan', 404));
    }
});

app.put('/products/:id', async (req, res, next) => {
    try {
        const {
            id
        } = req.params;
        const products = await Product.findByIdAndUpdate(id, req.body, {
            runValidators: true
        });
        res.redirect(`/products/${products.id}`);
    } catch (error) {
        next(new errorHandler('Gagal Update', 404));
    }
});

app.post('/products', (req, res, next) => {
    try {
        const products = new Product(req.body);
        products.save();
        res.redirect(`/products/${products.id}`);
    } catch (error) {
        next(new errorHandler('Terjadi Kesalahan', 404));
    }
});

app.delete('/products/delete/:id', async (req, res, next) => {
    try {
        const {
            id
        } = req.params;
        await Product.findByIdAndDelete(id);
        res.redirect(`/products`);
    } catch (error) {
        next(new errorHandler('Terjadi Kesalahan', 404));
    }
})

app.use((err, req, res, next) => {
    const {
        status = 404, message = 'terjadi kesalahan'
    } = err;
    res.status(status).send(message);
})

app.listen(3000, () => {
    console.log('shop app listening on port http://127.0.0.1:3000');
});