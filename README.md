# AgroFlow AI - Smart Farm-to-Market Optimization System

**Hackathon Project**: Solving inefficient agricultural distribution through intelligent matching algorithms.

---

## 🎯 Problem Statement (From Challenge Brief)

Farmers face losses due to:
- **Inefficient distribution**
- **Price fluctuations**
- **Dependency on intermediaries**

Our solution connects farmers directly to buyers while optimizing profits, reducing waste, and ensuring fair pricing.

---

## ✅ Core Objectives Achieved

| Requirement | Our Implementation |
|------------|-------------------|
| **Improve farmer profitability** | ✓ Smart pricing algorithm that maximizes profit margins |
| **Reduce crop wastage** | ✓ Spoilage penalty system prioritizes crops near expiry |
| **Fair & transparent pricing** | ✓ Algorithm suggests fair price based on margin split (60% to farmer) |
| **Optimize supply distribution** | ✓ Distance-based matching minimizes transport costs |

---

## 🏗️ System Architecture

```
Frontend (React + Tailwind) ←→ REST API ←→ Backend (Flask) ←→ Database (SQLite)
                                              ↓
                                    Optimization Engine
```

### Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Axios, React Router, Lucide Icons
- **Backend**: Python Flask, Flask-CORS, SQLAlchemy, PyJWT, Bcrypt
- **Database**: SQLite
- **Optimization**: Custom scoring algorithm

---

## 🔐 Security & Features
- **JWT Authentication**: Secure signup/login for Farmers and Buyers.
- **Role-Based Access**: Specialized dashboards for each user type.
- **Analytics Dashboard**: Real-time insights on sales and listings.
- **Smart Feed**: Filter crops by category, price, and location.
- **Image Uploads**: Farmers can showcase fresh produce with photos.

---

## 🧠 Smart Decision Logic

Our **optimization algorithm** evaluates every potential buyer-farmer match using:

```python
Score = (Price Margin) - (Transport Cost) + (Demand Priority) - (Spoilage Penalty)
```

### Components:
1. **Price Margin**: `Buyer Max Price - Farmer Base Price`
2. **Transport Cost**: `Distance × ₹2 per km`
3. **Demand Priority**: Higher quantity demands get slight boost
4. **Spoilage Penalty**: Crops expiring soon get priority (penalty reduces their score)

The system automatically selects the **highest scoring match** for maximum farmer profit.

---

## 📊 Clear Workflow

### For Farmers:
1. Register with name and location
2. Add crops (name, quantity, base price, expiry days)
3. Click "Optimize" to find best buyer
4. View suggested price, profit, and buyer details

### For Buyers:
1. Register with business name and location
2. Post demand (crop type, quantity needed, max price)
3. System automatically matches with farmers

---

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Backend runs on: `http://localhost:5000`

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:5173`

### 3. Test the System (Credentials Pre-loaded)

| Role | Email | Password |
|------|-------|----------|
| **Farmer** | `rajesh@farm.com` | `password123` |
| **Buyer** | `metro@buy.com` | `password123` |

1. Navigate to **http://localhost:5173**
2. Click **Get Started** to Signup, or **Login** with test credentials.
3. **Farmer Dashboard**: Add crops (with images!), view Analytics, Optimize deals.
4. **Buyer Portal**: Browse Feed, Filter by Veg/Fruit, Place Blind Bids.
5. **Feed**: Check out the Instagram-style marketplace.

---

## 💡 Real-World Usability

- **Clean, modern UI** with glassmorphic design
- **Responsive layout** works on all devices
- **Instant feedback** with loading states and modals
- **Error handling** for missing data
- **Live data** updates after form submissions

---

## 🏆 Innovation & Extensions

Our system can be extended with:
- **Google Maps API** for real route distances
- **Historical price analytics** for trend forecasting
- **SMS/WhatsApp notifications** for match alerts
- **Multi-language support** for rural farmers
- [x] **User authentication** (JWT-based) - *Implemented*
- [x] **Analytics Dashboard** - *Implemented*
- [x] **Image Uploads** - *Implemented*

---

## 📈 Expected Outcomes Delivered

✓ **Working prototype** - Fully functional end-to-end system  
✓ **Clear workflow** - Intuitive user journey  
✓ **Smart decision logic** - Sophisticated optimization algorithm  
✓ **Real-world usability** - Professional, production-ready UI  

---

## 🎤 Demo Pitch Script

**"Farmers lose 20-30% of their income due to inefficient distribution and middlemen dependency. AgroFlow AI solves this by directly connecting farmers to buyers using an intelligent matching algorithm.**

**Our system analyzes location, demand, pricing, and spoilage risk to recommend the optimal buyer for each crop. This maximizes farmer profit while reducing waste and ensuring fair pricing.**

**The technical edge: Our scoring model evaluates price margin, transport cost, demand priority, and spoilage penalty to compute the best match in real-time.**

**This solution is scalable using real-time mandi price APIs and Google Maps for actual logistics. AgroFlow AI transforms traditional agriculture distribution into an intelligent, data-driven ecosystem."**

---

## 📝 Evaluation Checklist

- [x] **Problem Understanding**: Addresses all 4 core objectives
- [x] **System Design**: Clean architecture with separation of concerns
- [x] **Logic & Optimization**: Custom scoring algorithm with multiple factors
- [x] **Technical Execution**: Working full-stack application
- [x] **Real-world Relevance**: Solves actual farmer pain points

---

## 👥 Stakeholders Supported

- ✓ **Producers (Farmers)**: Maximize profit, reduce wastage
- ✓ **Buyers (Consumers/Retailers)**: Access fresh produce at fair prices

---

## ⏱️ Built in 5 Hours

This hackathon project demonstrates rapid prototyping with production-quality code.

---

## 📄 License

Open source for educational purposes.
