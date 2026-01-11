# Nivaara Realty Solutions - Mobile App Documentation

## 📱 Overview

This document provides comprehensive information about the Nivaara Realty Solutions mobile app, including architecture, features, and integration with the website.

---

## 🏗️ Architecture

### Technology Stack

**Progressive Web App (PWA)**:
- **Framework**: React 18 with Vite
- **Service Worker**: Workbox (via vite-plugin-pwa)
- **State Management**: TanStack Query (React Query)
- **API**: tRPC for type-safe API calls
- **Database**: MySQL with Drizzle ORM
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + shadcn/ui

**Android App (Trusted Web Activity)**:
- **Type**: TWA (Trusted Web Activity)
- **Build Tool**: Gradle 8.2
- **Min SDK**: 21 (Android 5.0 Lollipop)
- **Target SDK**: 34 (Android 14)
- **Package**: com.nivaararealty.app

---

## ✨ Features

### Core Features

1. **Property Listings**
   - Browse all properties
   - Filter by location (Pune zones, other cities)
   - Filter by type (Residential, Commercial, Land)
   - Filter by budget range
   - Filter by status (Ready, Under-Construction)
   - Sort by price, date, relevance

2. **Property Details**
   - High-quality images
   - Detailed specifications
   - Location map
   - Price and payment options
   - Contact seller button
   - Share property

3. **Services**
   - Buy & Sell Properties
   - Under-Construction Projects
   - Rentals (Residential & Commercial)
   - Investment Advisory
   - Land Deals
   - Documentation Support
   - Commercial Spaces
   - Distress Sales & Bank Auctions

4. **Contact & Inquiry**
   - Contact form
   - Direct call button
   - WhatsApp integration
   - Email integration
   - Office location map

5. **About & Team**
   - Company information
   - Team profiles
   - RERA registration details
   - Geographic coverage

6. **User Experience**
   - Fast loading (PWA)
   - Offline support
   - Install as app
   - Push notifications (ready)
   - Responsive design
   - Dark mode support (ready)

---

## 🔄 Website-App Integration

### How It Works

The mobile app is a **Trusted Web Activity (TWA)** that wraps your website in a native Android app shell. This means:

1. **Single Codebase**
   - The app displays your website
   - No separate mobile codebase to maintain
   - Updates to website automatically reflect in app

2. **Native Features**
   - Appears in app drawer
   - Full-screen experience (no browser UI)
   - App icon and splash screen
   - Deep linking support
   - Push notifications (when implemented)

3. **Seamless Experience**
   - Users can't tell it's a web app
   - Native app performance
   - Offline support via Service Worker
   - Fast loading with caching

### Data Synchronization

**Automatic**:
- All data comes from your website/API
- Real-time updates when online
- Cached data when offline
- No separate app database needed

**Benefits**:
- ✅ Always up-to-date
- ✅ No sync conflicts
- ✅ Single source of truth
- ✅ Easier maintenance

---

## 📂 Project Structure

```
nivaara-real-estate/
├── android-app/                    # Android TWA project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/nivaararealty/app/
│   │   │   │   └── MainActivity.java
│   │   │   ├── res/
│   │   │   │   ├── mipmap-*/       # App icons
│   │   │   │   ├── values/
│   │   │   │   │   └── strings.xml
│   │   │   │   └── xml/
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle
│   ├── build.gradle
│   ├── settings.gradle
│   └── gradle.properties
│
├── client/                         # React web app
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── pages/                 # Page components
│   │   ├── lib/                   # Utilities
│   │   ├── App.tsx                # Main app component
│   │   └── main.tsx               # Entry point + PWA registration
│   └── public/
│       ├── android-chrome-*.png   # App icons
│       ├── apple-touch-icon.png
│       ├── favicon.ico
│       └── site.webmanifest       # PWA manifest
│
├── server/                         # Backend API
│   ├── routes/                    # tRPC routes
│   ├── db.ts                      # Database helpers
│   └── email.ts                   # Email service
│
├── vite.config.ts                 # Vite + PWA config
└── PLAY_STORE_SUBMISSION_GUIDE.md
```

---

## 🔧 Configuration Files

### PWA Configuration (vite.config.ts)

```typescript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Nivaara Realty Solutions',
    short_name: 'Nivaara',
    description: 'Your Trusted Real Estate Partner',
    theme_color: '#1A1A1A',
    background_color: '#FFFFFF',
    display: 'standalone',
    icons: [...]
  },
  workbox: {
    // Caching strategies
    runtimeCaching: [...]
  }
})
```

### Android Configuration (AndroidManifest.xml)

```xml
<application
    android:name=".MainActivity"
    android:theme="@style/Theme.AppCompat.Light.NoActionBar">
    
    <!-- Deep linking -->
    <intent-filter android:autoVerify="true">
        <data android:host="nivaararealty.com" />
    </intent-filter>
    
    <!-- Digital Asset Links -->
    <meta-data
        android:name="asset_statements"
        android:resource="@string/asset_statements" />
</application>
```

---

## 🚀 Development Workflow

### Local Development

1. **Start Development Server**
   ```bash
   cd nivaara-real-estate
   pnpm dev
   ```
   
   Server runs at: `http://localhost:5000`

2. **Test PWA Features**
   - Open Chrome DevTools
   - Go to Application tab
   - Check Service Worker status
   - Test offline mode
   - Test "Install App" prompt

3. **Test on Mobile**
   - Connect phone via USB
   - Enable USB debugging
   - Chrome DevTools > Remote Devices
   - Inspect and test

### Building for Production

1. **Build Website**
   ```bash
   pnpm build
   ```

2. **Build Android App**
   ```bash
   cd android-app
   ./gradlew assembleRelease
   ```

---

## 📱 App Features in Detail

### 1. Property Browsing

**Implementation**:
- Properties fetched via tRPC from MySQL database
- Cached by Service Worker for offline access
- Infinite scroll pagination
- Real-time search and filtering

**User Flow**:
1. User opens app
2. Sees featured properties on home page
3. Navigates to "Properties" section
4. Applies filters (location, type, budget)
5. Views property cards with images and details
6. Taps property to see full details

### 2. Property Details

**Information Displayed**:
- Property images (gallery)
- Title and description
- Price and payment options
- Location (with map)
- Specifications (BHK, area, amenities)
- Contact seller button
- Share button

**Actions**:
- Call seller directly
- WhatsApp inquiry
- Email inquiry
- Save to favorites (when implemented)
- Share via native share sheet

### 3. Services Section

**All 8 Services**:
1. Buy & Sell Properties
2. Under-Construction Projects
3. Rentals
4. Investment Advisory
5. Land Deals
6. Documentation Support
7. Commercial Spaces
8. Distress Sales & Bank Auctions

**Each Service Includes**:
- Description
- Key features
- Benefits
- Contact CTA

### 4. Contact Form

**Fields**:
- Name (required)
- Email (required)
- Phone (required)
- Property interest (dropdown)
- Message (required)

**Submission**:
- Validates input
- Sends via tRPC to backend
- Saves to database
- Sends email notification to info@nivaararealty.com
- Shows success message

### 5. Offline Support

**Cached Content**:
- All pages (HTML, CSS, JS)
- Property images
- Google Fonts
- Static assets

**Offline Behavior**:
- User can browse previously loaded properties
- Contact form queues submissions
- Shows offline indicator
- Syncs when back online

---

## 🔔 Push Notifications (Future)

### Implementation Plan

1. **Add Firebase Cloud Messaging (FCM)**
   ```bash
   pnpm add firebase
   ```

2. **Register for Notifications**
   - Request permission from user
   - Get FCM token
   - Send token to backend
   - Store in database

3. **Send Notifications**
   - New property listings
   - Price drops
   - Inquiry responses
   - Property updates

4. **Handle Notifications**
   - Foreground: Show in-app
   - Background: System notification
   - Tap: Open relevant page

---

## 🎨 Customization

### Branding

**Colors**:
- Primary: #1A1A1A (Charcoal Black)
- Secondary: #D4AF37 (Gold)
- Background: #FFFFFF (White)

**Fonts**:
- Headings: Montserrat
- Body: Poppins

**Logo**:
- Location: `client/public/nivaara-logo.png`
- App Icon: `client/public/android-chrome-512x512.png`

### Modifying App Metadata

**App Name**:
- File: `android-app/app/src/main/res/values/strings.xml`
- Change: `<string name="app_name">Your New Name</string>`

**Package Name**:
- File: `android-app/app/build.gradle`
- Change: `applicationId "com.yourcompany.app"`
- Also update in: `AndroidManifest.xml`, `MainActivity.java`

**Website URL**:
- File: `android-app/app/src/main/java/com/nivaararealty/app/MainActivity.java`
- Change: `return Uri.parse("https://your-website.com");`

---

## 🧪 Testing

### Manual Testing Checklist

**Functionality**:
- [ ] App launches successfully
- [ ] Home page loads
- [ ] Properties page displays listings
- [ ] Filters work correctly
- [ ] Property details page opens
- [ ] Contact form submits
- [ ] Navigation works
- [ ] Back button works
- [ ] Deep links work
- [ ] Share functionality works

**Performance**:
- [ ] App loads in <3 seconds
- [ ] Smooth scrolling
- [ ] Images load quickly
- [ ] No lag or freezing
- [ ] Offline mode works

**UI/UX**:
- [ ] Responsive on different screen sizes
- [ ] Buttons are tappable
- [ ] Text is readable
- [ ] Images display correctly
- [ ] No layout issues

**Compatibility**:
- [ ] Works on Android 5.0+
- [ ] Works on different manufacturers (Samsung, Xiaomi, OnePlus, etc.)
- [ ] Works on tablets
- [ ] Works in portrait and landscape

### Automated Testing

**Unit Tests**:
```bash
pnpm test
```

**E2E Tests** (Future):
- Set up Playwright or Cypress
- Test critical user flows
- Run before each release

---

## 📊 Analytics (Future)

### Recommended Tools

1. **Google Analytics 4**
   - Track page views
   - Monitor user behavior
   - Measure conversions

2. **Firebase Analytics**
   - App-specific metrics
   - User engagement
   - Retention rates

3. **Hotjar or Microsoft Clarity**
   - Heatmaps
   - Session recordings
   - User feedback

### Key Metrics to Track

- Daily/Monthly Active Users (DAU/MAU)
- Session duration
- Property views
- Inquiry submissions
- Conversion rate
- Retention rate
- Crash rate
- App rating

---

## 🔒 Security

### Best Practices Implemented

1. **HTTPS Only**
   - All communication encrypted
   - Digital Asset Links require HTTPS

2. **Input Validation**
   - All form inputs validated
   - SQL injection prevention (Drizzle ORM)
   - XSS protection (React)

3. **Secure API**
   - tRPC with type safety
   - Authentication ready
   - Rate limiting (recommended)

4. **Data Privacy**
   - Minimal data collection
   - GDPR compliant (when implemented)
   - Privacy policy required

### Recommendations

- [ ] Add rate limiting to API
- [ ] Implement user authentication
- [ ] Add CAPTCHA to contact form
- [ ] Regular security audits
- [ ] Keep dependencies updated

---

## 🆘 Troubleshooting

### Common Issues

**1. App Won't Install**
- Check minimum Android version (5.0+)
- Enable "Install from Unknown Sources" (for APK)
- Verify APK is signed correctly

**2. App Shows Browser UI**
- Check Digital Asset Links configuration
- Verify assetlinks.json is accessible
- Wait 24-48 hours for verification
- Check SHA-256 fingerprint matches

**3. Offline Mode Not Working**
- Check Service Worker registration
- Verify cache configuration
- Clear browser cache and retry
- Check console for errors

**4. Images Not Loading**
- Check image URLs are absolute
- Verify images are cached
- Check network connectivity
- Verify S3 bucket permissions

**5. Contact Form Not Submitting**
- Check network connectivity
- Verify API endpoint
- Check form validation
- Check email configuration

### Debug Mode

**Enable Debug Logging**:
```typescript
// In main.tsx
if (import.meta.env.DEV) {
  console.log('Debug mode enabled');
}
```

**Check Service Worker**:
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});
```

---

## 📈 Future Enhancements

### Planned Features

1. **User Accounts**
   - Sign up / Login
   - Save favorite properties
   - Track inquiries
   - Personalized recommendations

2. **Advanced Search**
   - AI-powered search
   - Voice search
   - Image search
   - Saved searches with alerts

3. **Property Comparison**
   - Compare up to 3 properties
   - Side-by-side specs
   - Price comparison

4. **Virtual Tours**
   - 360° property views
   - Video tours
   - AR visualization

5. **Mortgage Calculator**
   - EMI calculator
   - Loan eligibility
   - Compare loan offers

6. **Chat Support**
   - Live chat with agents
   - Chatbot for FAQs
   - WhatsApp integration

7. **Property Alerts**
   - New listings matching criteria
   - Price drop alerts
   - Status updates

8. **Social Features**
   - Share properties
   - Property reviews
   - Agent ratings

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks

**Weekly**:
- Monitor crash reports
- Review user feedback
- Check analytics

**Monthly**:
- Update dependencies
- Review performance metrics
- Optimize caching strategies

**Quarterly**:
- Major feature updates
- Security audits
- User survey

### Getting Help

**Technical Issues**:
- Email: info@nivaararealty.com
- Phone: +91 9764515697

**Play Store Issues**:
- Google Play Console Help Center
- https://support.google.com/googleplay/android-developer

**Development Questions**:
- React: https://react.dev
- Vite: https://vitejs.dev
- Android: https://developer.android.com

---

## 📚 Additional Resources

### Documentation

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Trusted Web Activity Guide](https://developer.chrome.com/docs/android/trusted-web-activity/)
- [Play Store Publishing](https://developer.android.com/studio/publish)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

### Tools

- [Android Studio](https://developer.android.com/studio)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)

---

## ✅ Checklist for Launch

**Pre-Launch**:
- [ ] All features tested
- [ ] No critical bugs
- [ ] Performance optimized
- [ ] SEO optimized
- [ ] Privacy policy created
- [ ] Terms of service created
- [ ] Digital Asset Links configured
- [ ] App signed with release key
- [ ] Screenshots prepared
- [ ] Store listing completed

**Launch Day**:
- [ ] Submit to Play Store
- [ ] Monitor for approval
- [ ] Prepare marketing materials
- [ ] Update website with app links

**Post-Launch**:
- [ ] Monitor crash reports
- [ ] Respond to user reviews
- [ ] Track analytics
- [ ] Plan updates

---

**Congratulations on building your mobile app!** 🎉

For any questions or support, contact: info@nivaararealty.com
