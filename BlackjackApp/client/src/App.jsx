import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    if (token) {
      startGame();
    }
  }, [token]);

  const register = async () => {
    const response = await fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (data.error) {
      setMessage(data.error);
    } else {
      setMessage('Registration successful!');
    }
  };

  const login = async () => {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (data.error) {
      setMessage(data.error);
    } else {
      setToken(data.token);
      setMessage('Login successful!');
    }
  };

  const startGame = async () => {
    const response = await fetch('/start');
    const data = await response.json();
    setPlayerHand(data.playerHand);
    setDealerHand(data.dealerHand);
  };

  const hit = async () => {
    const response = await fetch('/hit');
    const data = await response.json();
    setPlayerHand(data.playerHand);
    if (data.message) {
      setMessage(data.message);
    }
  };

  const stand = async () => {
    const response = await fetch('/stand');
    const data = await response.json();
    setPlayerHand(data.playerHand);
    setDealerHand(data.dealerHand);
    setMessage(data.message);
  };

  return (
    <div className="App">
      <h1>Blackjack</h1>
      {!token ? (
        <div className="auth">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={register}>Register</button>
          <button onClick={login}>Login</button>
        </div>
      ) : (
        <>
          <div className="hand">
            <h2>Player's Hand</h2>
            <ul>
              {playerHand.map((card, index) => (
                <li key={index}>{card.value} of {card.suit}</li>
              ))}
            </ul>
          </div>
          <div className="hand">
            <h2>Dealer's Hand</h2>
            <ul>
              {dealerHand.map((card, index) => (
                <li key={index}>{card.value} of {card.suit}</li>
              ))}
            </ul>
          </div>
          <div className="controls">
            <button onClick={hit}>Hit</button>
            <button onClick={stand}>Stand</button>
          </div>
        </>
      )}
      {message && <h2>{message}</h2>}
    </div>
  );
}

export default App;
