import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Home from './pages/Home';
import Vendors from './pages/Vendors';
import './App.css';

// Placeholder components for other pages
const Products = () => <div className="container"><h1>Products</h1><p>Products page coming soon...</p></div>;
const About = () => <div className="container"><h1>About</h1><p>About page coming soon...</p></div>;
const Contact = () => <div className="container"><h1>Contact</h1><p>Contact page coming soon...</p></div>;
const Login = () => <div className="container"><h1>Login</h1><p>Login page coming soon...</p></div>;
const Register = () => <div className="container"><h1>Register</h1><p>Register page coming soon...</p></div>;

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/products" element={<Products />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
