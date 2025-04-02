const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Apply CORS middleware globally with proper configuration
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from this origin
  methods: ['GET', 'POST', 'OPTIONS'], // Allow these HTTP methods
  allowedHeaders: ['Content-Type'], // Allow these headers
  credentials: true, // Allow credentials (if needed)
}));

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Globális változó az id nyomon követésére
let currentId = 0;

// POST endpoint to handle data
app.post('/api/data', (req, res) => {
    const receivedData = req.body; // Data sent from the frontend
    console.log('Received data as an object:', receivedData);

    // Increment the ID for each new request
    currentId += 1;

    // Combine all data into a single object with a unique ID
    const allDataArray = {
        id: currentId, // Auto-incrementing ID
        data: [
            receivedData.formDataPage8 || null,
            receivedData.formDataPage9 || null,
            receivedData.formDataPage1 || null,
            receivedData.formDataPage7 || null,
            receivedData.formDataPage5 || null,
            receivedData.formDataPage10 || null,
            receivedData.formDataPage6 || null,
            receivedData.formDataPage3 || null,
            receivedData.formDataPage4 || null,
            receivedData.formDataPage2 || null,
        ],
    };

    // Log all data to the console
    console.log('All data with a unique ID:', JSON.stringify(allDataArray, null, 2));

    // Send a response back to the frontend
    res.status(200).json({ message: 'Data received successfully', data: allDataArray });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});