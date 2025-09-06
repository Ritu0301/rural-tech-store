# Rural Tech Store - Affiliate Marketing Platform

A comprehensive affiliate marketing platform built with React, TypeScript, Supabase, and Cuelinks API integration.

## Features

- **User Authentication**: Email/password and social login (Google, Facebook)
- **Affiliate Link Generation**: Generate affiliate links for major brands
- **Real-time Earnings Tracking**: Track earnings and commissions with Cuelinks integration
- **Analytics Dashboard**: Performance insights and data visualization
- **Withdrawal Management**: Request and track withdrawals
- **Notification System**: Real-time notifications for important events
- **Responsive Design**: Mobile-first responsive design

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Affiliate API**: Cuelinks API integration
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Lucide React
- **Routing**: React Router v7

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Cuelinks API account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rural-tech-store
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your environment variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_CUELINKS_API_KEY`: Your Cuelinks API key
- `VITE_SUPPORT_EMAIL`: Support email address
- `VITE_SUPPORT_PHONE`: Support phone number

4. Set up Supabase:
   - Create a new Supabase project
   - Run the migration file in `supabase/migrations/create_users_and_earnings.sql`
   - Enable social authentication providers (Google, Facebook) in Supabase Auth settings

5. Start the development server:
```bash
npm run dev
```

## Database Schema

The application uses the following main tables:

- `user_profiles`: Extended user information
- `affiliate_links`: Generated affiliate links
- `earnings`: User earnings from commissions
- `transactions`: Withdrawal and payment history
- `analytics_data`: Performance analytics
- `notifications`: User notifications

## API Integration

### Cuelinks API

The application integrates with Cuelinks API for:
- Generating affiliate links
- Fetching earnings data
- Processing withdrawals
- Getting analytics data

### Supabase

Used for:
- User authentication
- Database operations
- Real-time subscriptions
- File storage (if needed)

## Deployment

### Hostinger Deployment

1. Build the application:
```bash
npm run build
```

2. Upload the `dist` folder contents to your Hostinger hosting directory

3. Configure environment variables in your hosting panel

4. Set up URL rewriting for SPA routing:
   - Create `.htaccess` file in the root directory:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Environment Variables for Production

Make sure to set these in your hosting environment:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CUELINKS_API_KEY`
- `VITE_SUPPORT_EMAIL`
- `VITE_SUPPORT_PHONE`

## Features Checklist

### ✅ Completed Features

- [x] User authentication (email/password + social login)
- [x] Dashboard with real-time data
- [x] Affiliate link generation
- [x] Earnings tracking and withdrawal system
- [x] Analytics dashboard with charts
- [x] Profile management
- [x] Notification system
- [x] Responsive design
- [x] Cuelinks API integration
- [x] Supabase database integration
- [x] Real-time updates

### 🔧 Configuration Required

- [ ] Set up Supabase project and run migrations
- [ ] Configure Cuelinks API credentials
- [ ] Set up social login providers
- [ ] Configure email/SMS notification services
- [ ] Set up domain and SSL certificate

## Support

For support, contact:
- Email: support@ruraltechstore.com
- Phone: +1-800-SUPPORT

## License

This project is proprietary software. All rights reserved.