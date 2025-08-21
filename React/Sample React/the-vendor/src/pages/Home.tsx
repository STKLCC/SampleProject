import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to The Vendor</h1>
          <p>Discover quality vendors and products for your business needs</p>
          <div className="hero-actions">
            <Link to={ROUTES.VENDORS} className="btn btn-primary btn-large">
              Browse Vendors
            </Link>
            <Link to={ROUTES.PRODUCTS} className="btn btn-secondary btn-large">
              View Products
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Why Choose The Vendor?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Easy Discovery</h3>
              <p>Find the perfect vendors and products with our advanced search and filtering system.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Quality Assured</h3>
              <p>All vendors are verified and rated by our community of business professionals.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Trusted Partnerships</h3>
              <p>Build long-term relationships with reliable vendors who understand your business.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of businesses who trust The Vendor for their procurement needs.</p>
          <Link to={ROUTES.REGISTER} className="btn btn-primary btn-large">
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
