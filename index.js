const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const app = express();
const ErrorHandler = require('./ErrorHandler');
const session = require('express-session');
const flash = require('connect-flash');

const Product = require('./models/product');
const Garment = require('./models/garment');

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
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));
app.use(flash());
app.use((req, res, next) => {
    res.locals.flash_message = req.flash('flash_message');
    next();
})

function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch((err) => next(err));
    }
}

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/garment', wrapAsync(async (req, res) => {
    const garments = await Garment.find({});
    res.render('garment/index', {
        garments
    });
}));

app.get('/garment/create', (req, res) => {
    res.render('garment/create');
});

app.post('/garment', wrapAsync(async (req, res) => {
    Garment.insertMany(req.body);
    req.flash('flash_message', 'Data berhasil ditambah!');
    res.redirect('/garment');
}))

app.get('/garment/:id', wrapAsync(async (req, res) => {
    const {
        id
    } = req.params;
    const garment = await Garment.findById(id).populate('product');
    res.render('garment/show', {
        garment
    });
}));

app.delete('/garment/:garment_id', wrapAsync(async (req, res) => {
    const {
        garment_id
    } = req.params;
    await Garment.findOneAndDelete({
        _id: garment_id
    });
    res.redirect('/garment');
}));

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

app.get('/garment/:garment_id/products/create', (req, res) => {
    const {
        garment_id
    } = req.params;
    res.render('products/create', {
        garment_id
    });
});

app.get('/garment/edit/:garment_id', wrapAsync(async (req, res) => {
    const {
        garment_id
    } = req.params;
    const garment = await Garment.findById(garment_id);
    res.render('garment/edit', {
        garment
    });
}));

app.put('/garment/:garment_id', wrapAsync(async (req, res) => {
    const {
        garment_id
    } = req.params;

    const garment = await Garment.findByIdAndUpdate(garment_id, req.body, {
        runValidators: true
    });
    res.redirect(`/garment/${garment_id}`);
}));

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
    const products = await Product.findById(id).populate('garment');
    console.log(products);
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

app.post('/products/:garment_id', wrapAsync(async (req, res, next) => {
    const {
        garment_id
    } = req.params;
    const products = new Product(req.body);
    const garment = await Garment.findById(garment_id);
    garment.product.push(products);
    products.garment = garment;

    products.save();
    garment.save();
    res.redirect(`/products/${products.id}`);
}));

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

    if (err.name === 'CastError') {
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