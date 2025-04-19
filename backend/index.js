const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://mongodb:27017/microservices', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Product = mongoose.model('Product', {
  name: String,
  price: Number
});

// Route to get products
app.get('/api/products', async (req, res) => {
  try {
    // Verify token with auth service
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const authResponse = await axios.get('http://auth-service/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!authResponse.data.valid) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to add product
app.post('/api/products', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const authResponse = await axios.get('http://auth-service/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!authResponse.data.valid) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend service running on port ${PORT}`);
});