const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();

app.use(express.static('public')); // Serve static files
app.use(bodyParser.json()); // Parse JSON requests

// Generate a packing list based on destination and dates
function generatePackingList(destination) {
    const baseItems = ['Clothes', 'Toiletries', 'Phone Charger', 'Passport'];
    // const additionalItems = destination.toLowerCase().includes('beach') ? ['Swimsuit', 'Sunscreen'] : ['Jacket', 'Umbrella'];
    const additionalItems = ['Jacket', 'Sunscreen'];
    return [...baseItems, ...additionalItems];
}

// Insert new data
app.post('/submit', (req, res) => {
    const { destination, startDate, endDate } = req.body;
    const packingList = generatePackingList(destination).join(', ');
    const query = 'INSERT INTO packingList (destination, startDate, endDate, packingList) VALUES (?, ?, ?, ?)';
    db.query(query, [destination, startDate, endDate, packingList], (err) => {
        if (err) return res.status(500).json({ error: 'Error inserting data' });
        res.json({ message: 'Data inserted successfully', packingList });
    });
});

// Retrieve all data
app.get('/data', (req, res) => {
    const query = 'SELECT * FROM packingList';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error retrieving data' });
        res.json(results);
    });
});

// Delete a record
app.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM packingList WHERE id = ?';
    db.query(query, [id], (err) => {
        if (err) return res.status(500).json({ error: 'Error deleting data' });
        res.json({ message: 'Data deleted successfully' });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
