# 🍲 Hotpot - Food Delivery Platform

<div align="center">

![Hotpot Logo](https://img.shields.io/badge/🍲-Hotpot-orange?style=for-the-badge&logoColor=white)

**Delicious food delivered fast. Experience the best local restaurants and cuisines right at your doorstep.**

[![Live Demo](https://img.shields.io/badge/🌐-Live_Demo-orange?style=for-the-badge)](https://hotpot-frontend.onrender.com)
[![Backend API](https://img.shields.io/badge/🔗-Backend_API-blue?style=for-the-badge)](https://hotpot-3y4y.onrender.com)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

</div>

## 📱 About Hotpot

Hotpot is a full-stack food delivery platform that connects hungry customers with local restaurants and delivery drivers. Built with modern web technologies, it offers real-time order tracking, interactive maps, and a seamless user experience across all devices.

### 🎯 Key Features

- **Multi-Role System**: Customers, Restaurant Owners, and Delivery Partners
- **Real-Time Tracking**: Live order status updates and delivery tracking
- **Interactive Maps**: Google Maps integration for location services
- **Secure Payments**: Cash on Delivery and online payment options
- **Smart Notifications**: Real-time updates via Socket.io
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Role-Based Dashboards**: Customized interfaces for each user type

## 🚀 Live Demo

- **Frontend**: [hotpot-frontend.onrender.com](https://hotpot-frontend.onrender.com)
- **Backend API**: [hotpot-3y4y.onrender.com](https://hotpot-3y4y.onrender.com)

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **Maps**: Google Maps API
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Cloudinary
- **Real-time Communication**: Socket.io
- **Email Service**: Nodemailer
- **Security**: CORS, Cookie Parser
- **Environment**: dotenv

### Development & Deployment
- **Version Control**: Git & GitHub
- **Deployment**: Render (Frontend & Backend)
- **Package Manager**: npm
- **Code Quality**: ESLint
- **Build Tool**: Vite

## 🏗️ Project Structure

```
hotpot/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── redux/          # State management
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── vite.config.js
├── backend/                 # Node.js backend API
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middlewares/       # Custom middlewares
│   ├── socket/            # Socket.io events
│   ├── utils/             # Utility functions
│   └── index.js           # Server entry point
└── README.md
```

## 👥 User Roles & Features

### 🛒 Customers
- Browse restaurants by category and location
- Add items to cart and place orders
- Track order status in real-time
- Rate and review restaurants
- Manage profile and order history

### 🏪 Restaurant Owners
- Create and manage restaurant profiles
- Add/edit menu items with photos
- Receive and manage incoming orders
- Update order status (pending → preparing → ready)
- View sales analytics and order history

### 🚴 Delivery Partners
- Register as delivery partner
- Receive nearby delivery assignments
- Update delivery status and location
- Navigate with integrated maps
- Complete deliveries with OTP verification

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Google Maps API key
- Cloudinary account (for image uploads)

### Frontend Setup
```bash
# Clone the repository
git clone https://github.com/Tarun553/Hotpot.git
cd Hotpot/frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your environment variables
VITE_SERVER_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_FIREBASE_API_KEY=your_firebase_key

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd ../backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your environment variables
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Start development server
npm run dev
```

## 🌟 Key Features Showcase

### Real-Time Order Tracking
- Live status updates from order placement to delivery
- Interactive timeline showing order progress
- Push notifications for status changes

### Smart Location Services
- Automatic location detection
- Address search and geocoding
- Delivery radius calculation for restaurants

### Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Progressive Web App capabilities

### Security Features
- JWT-based authentication
- Protected routes and API endpoints
- Input validation and sanitization
- CORS configuration for cross-origin requests

## 📊 Database Schema

### User Model
- Multi-role support (customer, owner, delivery)
- Profile management with location data
- Authentication and session handling

### Restaurant/Shop Model
- Restaurant information and menu management
- Location-based queries with geospatial indexing
- Owner association and verification

### Order Model
- Complex order structure with multiple restaurants
- Status tracking and history
- Delivery assignment and OTP system

### Delivery Assignment Model
- Automatic assignment to nearby delivery partners
- Real-time location tracking
- Completion verification system

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/current` - Get current user

### Orders
- `POST /api/orders/place` - Place new order
- `GET /api/orders/user` - Get user orders
- `PUT /api/orders/:id/status` - Update order status

### Restaurants
- `GET /api/shops/city/:city` - Get restaurants by city
- `POST /api/shops/create` - Create new restaurant
- `GET /api/shops/owner` - Get owner's restaurant

### Delivery
- `GET /api/delivery/available` - Get available deliveries
- `POST /api/delivery/accept` - Accept delivery assignment
- `PUT /api/delivery/complete` - Complete delivery

## 🎨 Design System

### Color Palette
- **Primary**: Orange (#FF6600) - Warm and appetizing
- **Secondary**: Orange variants for accents
- **Neutral**: Grays for text and backgrounds
- **Status**: Green (success), Red (error), Yellow (warning)

### Typography
- **Headings**: Inter/Montserrat for modern appeal
- **Body**: Inter for readability
- **Special**: VT323 for developer signature

## 🔮 Future Enhancements

- [ ] **Payment Integration**: Stripe/PayPal for online payments
- [ ] **Push Notifications**: PWA notifications for mobile
- [ ] **Analytics Dashboard**: Advanced reporting for owners
- [ ] **Multi-language Support**: Internationalization
- [ ] **AI Recommendations**: Personalized food suggestions
- [ ] **Loyalty Program**: Rewards and points system
- [ ] **Chat Support**: Real-time customer service
- [ ] **Advanced Filters**: Dietary restrictions, cuisines, price range

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Tarun** - Full Stack Developer

- GitHub: [@Tarun553](https://github.com/Tarun553)
- Email: tarunchoudhary553@gmail.com

## 🙏 Acknowledgments

- React community for excellent documentation
- Tailwind CSS for utility-first styling
- MongoDB for flexible database solutions
- Google Maps for location services
- Render for reliable hosting
- All the open-source contributors

---

<div align="center">

**Made with ❤️ and lots of 🍕 by Tarun**

⭐ Star this repository if you found it helpful!

</div>
