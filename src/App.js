  import React, { useState } from 'react';
  import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
  import Admin from './Admin';
  import './App.css';

  function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogin = (email, password) => {
      if (email === 'texnikum2024@example.com' && password === '2024texnikum') {
        setIsLoggedIn(true);
      } else {
        alert('Email yoki parol noto\'g\'ri');
      }
    };

    if (!isLoggedIn) {
      return <LoginForm onLogin={handleLogin} />;
    }

    return (
      <Router>
        <div className="App">
          <Routes>
            <Route path="/admin" element={<Admin />} />
            <Route path="/" element={<Navigate to="/admin" />} />
          </Routes>
        </div>
      </Router>
    );
  }

  function LoginForm({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      onLogin(email, password);
    };

    return (
      <div className="login-form">
        <h2>Admin panelga kirish</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Parol"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Kirish</button>
        </form>
      </div>
    );
  }

  export default App;