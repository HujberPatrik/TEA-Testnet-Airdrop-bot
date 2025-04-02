const express = require('express');
const rendezvenyRoutes = require('./routes/rendezveny.route');
const statuszRoutes = require('./routes/statusz.route')
const pool = require('./config/db')

const app = express();

app.use(express.json()); // json formátum beállítása
app.use(express.urlencoded({extended:true}));
app.use('/api',rendezvenyRoutes);
app.use('/api',statuszRoutes);


app.get('/', (req,res)=>{
    res.json({
        message: 'ok',
    });
});
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Database connection error:', err);
    } else {
      console.log('Database connected:', res.rows);
    }
});


const port = 3000;

app.listen(port, ()=>{
    console.log(`Server is running http://localhost:${port}`);
});