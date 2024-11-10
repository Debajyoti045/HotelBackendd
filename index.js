const connectToMongo = require("./db");
require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();

const availabilityRoutes = require('./routes/availability.js'); 
const reservationRoutes = require('./routes/reservations.js'); 
const admin = require('./routes/admin.js'); 
const roomTypeRoutes = require('./routes/roomType'); 
const roomRateRoutes = require('./routes/roomRate');
const startServer = async () => {
  try {
    const port = process.env.PORT || 3000;
    await connectToMongo();
    app.use(cors());
    app.use(express.json()); 

    app.use('/v1/hotels', availabilityRoutes);
    app.use('/v1', reservationRoutes);
    app.use('/v1', admin);
    app.use('/v1',roomTypeRoutes)
    app.use('/v1',roomRateRoutes)
    app.use("*", (req, res) => {
      res.status(404).json({ error: "NOT FOUND!" });
    });

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.log("Error starting server:", error);
  }
};

startServer();
