const path = require('path');
const { Pool } = require('pg');
const app = express();
app.use(express.json());
const pool = new Pool({
  user: 'your_db_user',
  host: 'localhost',
  database: 'blackjack',
  password: 'your_db_password',
  port: 5432,
});

pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err.stack));


// Simple Blackjack game logic
let deck = [];
let playerHand = [];
let dealerHand = [];

function initializeDeck() {
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  const values = [
    'Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'
  ];
  deck = [];
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }
}

function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function dealCard(hand) {
  hand.push(deck.pop());
}

function calculateHandValue(hand) {
  let value = 0;
  let aceCount = 0;
  for (const card of hand) {
    if (card.value === 'Ace') {
      aceCount++;
      value += 11;
    } else if (['Jack', 'Queen', 'King'].includes(card.value)) {
      value += 10;
    } else {
      value += parseInt(card.value);
    }
  }
  while (value > 21 && aceCount > 0) {
    value -= 10;
    aceCount--;
  }
  return value;
}

app.get('/start', (req, res) => {
  initializeDeck();
  shuffleDeck();
  playerHand = [];
  dealerHand = [];
  dealCard(playerHand);
  dealCard(dealerHand);
  dealCard(playerHand);
  dealCard(dealerHand);
  res.json({
    playerHand,
    dealerHand: [dealerHand[0], { suit: 'Hidden', value: 'Hidden' }]
  });
});

app.get('/hit', (req, res) => {
  dealCard(playerHand);
  const playerValue = calculateHandValue(playerHand);
  if (playerValue > 21) {
    res.json({ playerHand, message: 'Bust! You lose.' });
  } else {
    res.json({ playerHand });
  }
});

app.get('/stand', (req, res) => {
  let dealerValue = calculateHandValue(dealerHand);
  while (dealerValue < 17) {
    dealCard(dealerHand);
    dealerValue = calculateHandValue(dealerHand);
  }
  const playerValue = calculateHandValue(playerHand);
  let message = '';
  if (dealerValue > 21 || playerValue > dealerValue) {
    message = 'You win!';
  } else if (playerValue < dealerValue) {
    message = 'You lose!';
  } else {
    message = 'It\'s a tie!';
  }
  res.json({ playerHand, dealerHand, message });
});

app.use(express.static(path.join(__dirname, 'client', 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.post('/register', async (req, res) => {
  console.log('Register endpoint hit');
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *', [username, hashedPassword]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/save-game', async (req, res) => {
  const { userId, gameState } = req.body;
  try {
    const result = await pool.query('INSERT INTO games (user_id, state) VALUES ($1, $2) RETURNING *', [userId, gameState]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
    console.log(`Blackjack server running at http://localhost:${port}`);
});