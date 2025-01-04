const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const db = require('./db');

const app = express();

require('dotenv').config();
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const apiKey = process.env.WEATHER_API_KEY;

app.use(express.static('public')); // Serve static files
app.use(bodyParser.json()); // Parse JSON requests


app.get('/map-api', (req, res) => {
    const url = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
    
    fetch(url)
        .then(response => response.text())
        .then(data => res.send(data))
        .catch(error => res.status(500).send("Error fetching Google Maps API"));
});

app.get('/api/weather', async (req, res) => {
    const { lat, lon } = req.query; // Expect latitude and longitude from the client
    if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    try {
        const response = await fetch(weatherUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
        res.json(data); // Send the weather data to the client
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// Generate a packing list based on destination and dates
function generatePackingList(destination) {
    const baseItems = ['Clothes', 'Toiletries', 'Phone Charger', 'Passport'];
    // const additionalItems = destination.toLowerCase().includes('beach') ? ['Swimsuit', 'Sunscreen'] : ['Jacket', 'Umbrella'];
    const additionalItems = ['Jacket', 'Sunscreen'];
    return [...baseItems, ...additionalItems];
}

// Insert new data
app.post('/submit', (req, res) => {
    const { destination, startDate, endDate, lat, lon, weather, temperature } = req.body;

    // Generate packing list based on the destination and weather
    const packingList = generatePackingList(destination, weather).join(', ');

    // SQL query to insert the new data including additional fields
    const query = `
        INSERT INTO packingList (destination, startDate, endDate, lat, lon, weather, temperature, packingList)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Execute the query with the new fields
    db.query(query, [destination, startDate, endDate, lat, lon, weather, temperature, packingList], (err) => {
            if (err) return res.status(500).json({ error: 'Error inserting data' });
            res.json({ message: 'Data inserted successfully', packingList });
        }
    );
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
