const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

app.use(express.json());

// CORS konfiguráció
const corsOptions = {
    origin: 'http://localhost:5173', // A frontend URL-je
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Engedélyezett HTTP metódusok
    credentials: true // Sütik és hitelesítési adatok engedélyezése
};

app.use(cors(corsOptions));

const users = [
    { 
      email: 'souris20013@gmail.com', 
      passwordHash: '$2b$10$kCD582vqbalLhMsmPspsHe4WUboJ/fh94wEaBO4lYWuqsYRML9im6', 
      role: 'főadmin', 
      name: 'Isten Pista'
    }
  ];
  
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({ message: 'Hibás email vagy jelszó!' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Hibás email vagy jelszó!' });
  }

  // Token generálás (opcionális)
  const token = jwt.sign(
    { email: user.email, role: user.role, name: user.name }, // A név hozzáadása
    'secretkey',
    { expiresIn: '1h' }
  );

  res.json({ token, role: user.role });
});

app.listen(3003, () => console.log('Server running on http://localhost:3003'));