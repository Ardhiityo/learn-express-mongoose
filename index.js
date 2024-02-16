const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const app = express();
const ErrorHandler = require('./ErrorHandler');

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


function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch((err) => next(err));
    }
}

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/products', wrapAsync(async (req, res) => {
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
}));

app.get('/products/create', (req, res) => {
    res.render('products/create');
});

app.get('/products/edit/:id', wrapAsync(async (req, res, next) => {
    const {
        id
    } = req.params;
    const products = await Product.findById(id);
    console.log(products);
    res.render('products/edit', {
        products
    });
}));

app.get('/products/:id', wrapAsync(async (req, res, next) => {
    const {
        id
    } = req.params;
    const products = await Product.findById(id);
    res.render('products/show', {
        products
    });
}));

app.put('/products/:id', wrapAsync(async (req, res, next) => {
    const {
        id
    } = req.params;
    const products = await Product.findByIdAndUpdate(id, req.body, {
        runValidators: true
    });
    res.redirect(`/products/${products.id}`);
}));

app.post('/products', (req, res, next) => {
    const products = new Product(req.body);
    products.save();
    res.redirect(`/products/${products.id}`);
});

app.delete('/products/delete/:id', wrapAsync(async (req, res, next) => {
    const {
        id
    } = req.params;
    await Product.findByIdAndDelete(id);
    res.redirect(`/products`);
}));

app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') {
        err.status = 404;
        err.message = Object.values(err.errors).map(item => item.message);
    }
    
    if(err.name === 'CastError') {
        err.status = 404;
        err.message = 'Product Unavailable';    
    }
    
    next(err);
})

app.use((err, req, res, next) => {
    const {
        message = 'Something went wrong', status = 404
    } = err;
    res.status(status).send(message);
})

app.listen(3000, () => {
    console.log('shop app listening on port http://127.0.0.1:3000');
});