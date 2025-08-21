# The Vendor - React Application

A modern, well-structured React application for managing vendors and products with a clean architecture and best practices.

## 🚀 Features

- **Modern React 19** with TypeScript support
- **Responsive Design** with mobile-first approach
- **Clean Architecture** with organized folder structure
- **Routing** with React Router v6
- **Custom Hooks** for common functionality
- **Utility Functions** for common operations
- **Type Safety** with TypeScript interfaces
- **Modular CSS** with component-specific stylesheets

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout/         # Layout components (Header, Footer, Layout)
├── pages/              # Page components
│   ├── Home.tsx        # Home page
│   └── Vendors.tsx     # Vendors listing page
├── hooks/              # Custom React hooks
│   ├── useLocalStorage.ts  # Local storage hook
│   └── useApi.ts           # API management hook
├── utils/              # Utility functions
│   ├── api.ts          # API client and HTTP utilities
│   └── helpers.ts      # Common helper functions
├── constants/          # Application constants
│   └── routes.ts       # Route definitions and navigation
├── types/              # TypeScript type definitions
│   └── index.ts        # Main type definitions
├── styles/             # Global styles
│   └── global.css      # Global CSS and utility classes
└── assets/             # Static assets (images, icons, etc.)
```

## 🛠️ Available Scripts

- `npm start` - Starts the development server
- `npm run build` - Creates a production build
- `npm test` - Runs the test suite
- `npm run eject` - Ejects from Create React App (irreversible)

## 🎯 Key Components

### Layout Components
- **Header**: Navigation bar with logo, menu items, and action buttons
- **Footer**: Site footer with links and social media
- **Layout**: Main layout wrapper component

### Page Components
- **Home**: Landing page with hero section, features, and call-to-action
- **Vendors**: Vendor listing with search, filtering, and vendor cards
- **Products**: Product catalog (placeholder)
- **About**: About page (placeholder)
- **Contact**: Contact page (placeholder)
- **Login/Register**: Authentication pages (placeholder)

### Custom Hooks
- **useLocalStorage**: Manages localStorage with React state
- **useApi**: Handles API calls with loading and error states

### Utility Functions
- **API Client**: Centralized HTTP client with authentication
- **Helpers**: Common utility functions (formatting, validation, etc.)

## 🔧 Dependencies

- **React 19.1.1** - Latest React version
- **React Router DOM** - Client-side routing
- **TypeScript** - Type safety and better development experience

## 🎨 Styling

- **Component-specific CSS** - Each component has its own stylesheet
- **Global CSS** - Common styles and utility classes
- **Responsive Design** - Mobile-first approach with breakpoints
- **CSS Grid & Flexbox** - Modern layout techniques

## 📱 Responsive Design

The application is fully responsive with breakpoints at:
- **Desktop**: 1200px and above
- **Tablet**: 768px - 1199px
- **Mobile**: Below 768px

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd the-vendor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## 🔮 Future Enhancements

- [ ] **Authentication System** - User login/registration
- [ ] **Product Management** - Product catalog and details
- [ ] **Vendor Dashboard** - Vendor management interface
- [ ] **Search & Filtering** - Advanced search capabilities
- [ ] **State Management** - Redux or Context API integration
- [ ] **Testing** - Unit and integration tests
- [ ] **API Integration** - Backend service integration
- [ ] **Performance Optimization** - Code splitting and lazy loading

## 📝 Development Guidelines

### Code Style
- Use TypeScript for all new components
- Follow React functional component patterns
- Use custom hooks for reusable logic
- Keep components focused and single-purpose

### File Naming
- Components: PascalCase (e.g., `VendorCard.tsx`)
- Utilities: camelCase (e.g., `formatCurrency.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS`)

### CSS Organization
- Component-specific styles in component folders
- Global styles in `src/styles/global.css`
- Use CSS custom properties for consistent theming
- Follow BEM methodology for class naming

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.
