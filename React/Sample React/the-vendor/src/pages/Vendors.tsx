import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Vendor } from '../types';
import { ROUTES } from '../constants/routes';
import { formatCurrency } from '../utils/helpers';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import './Vendors.css';

// Mock data for demonstration
const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'Tech Solutions Inc.',
    description: 'Leading technology solutions provider specializing in enterprise software and cloud services.',
    contactInfo: {
      email: 'contact@techsolutions.com',
      phone: '+1-555-0123',
      address: '123 Tech Street, Silicon Valley, CA'
    },
    products: [
      {
        id: '1',
        name: 'Cloud Management Suite',
        description: 'Comprehensive cloud infrastructure management solution',
        price: 2999.99,
        category: 'Software',
        vendorId: '1'
      }
    ]
  },
  {
    id: '2',
    name: 'Green Manufacturing Co.',
    description: 'Sustainable manufacturing solutions with eco-friendly materials and processes.',
    contactInfo: {
      email: 'info@greenmanufacturing.com',
      phone: '+1-555-0456',
      address: '456 Green Avenue, Portland, OR'
    },
    products: [
      {
        id: '2',
        name: 'Eco-Friendly Packaging',
        description: 'Biodegradable packaging solutions for various industries',
        price: 149.99,
        category: 'Packaging',
        vendorId: '2'
      }
    ]
  },
  {
    id: '3',
    name: 'Global Logistics Partners',
    description: 'Worldwide logistics and supply chain management services.',
    contactInfo: {
      email: 'service@globallogistics.com',
      phone: '+1-555-0789',
      address: '789 Logistics Way, Chicago, IL'
    },
    products: [
      {
        id: '3',
        name: 'Supply Chain Analytics',
        description: 'Advanced analytics platform for supply chain optimization',
        price: 1999.99,
        category: 'Analytics',
        vendorId: '3'
      }
    ]
  }
];

const Vendors: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setVendors(mockVendors);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           vendor.products.some(product => product.category === selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(vendors.flatMap(v => v.products.map(p => p.category))))];

  if (loading) {
    return (
      <div className="vendors-page">
        <div className="container">
          <LoadingSpinner size="large" text="Loading vendors..." />
        </div>
      </div>
    );
  }

  return (
    <div className="vendors-page">
      <div className="container">
        <div className="page-header">
          <h1>Vendors</h1>
          <p>Discover trusted vendors for your business needs</p>
        </div>

        <div className="filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="category-filter">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="vendors-grid">
          {filteredVendors.map(vendor => (
            <div key={vendor.id} className="vendor-card">
              <div className="vendor-header">
                <h3>{vendor.name}</h3>
                <span className="vendor-rating">⭐ 4.8</span>
              </div>
              
              <p className="vendor-description">{vendor.description}</p>
              
              <div className="vendor-contact">
                <p><strong>Email:</strong> {vendor.contactInfo.email}</p>
                <p><strong>Phone:</strong> {vendor.contactInfo.phone}</p>
                <p><strong>Location:</strong> {vendor.contactInfo.address}</p>
              </div>
              
              <div className="vendor-products">
                <h4>Featured Products:</h4>
                {vendor.products.slice(0, 2).map(product => (
                  <div key={product.id} className="product-item">
                    <span className="product-name">{product.name}</span>
                    <span className="product-price">{formatCurrency(product.price)}</span>
                  </div>
                ))}
              </div>
              
              <div className="vendor-actions">
                <Link 
                  to={`${ROUTES.VENDOR_DETAILS.replace(':id', vendor.id)}`}
                  className="btn btn-primary"
                >
                  View Details
                </Link>
                <Link 
                  to={`${ROUTES.PRODUCTS}?vendor=${vendor.id}`}
                  className="btn btn-secondary"
                >
                  View Products
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredVendors.length === 0 && (
          <div className="no-results">
            <p>No vendors found matching your criteria.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="btn btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vendors;
