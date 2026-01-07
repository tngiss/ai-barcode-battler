# AI Barcode Battler - Phase 1 PoC

A mobile-first web application that brings the nostalgic Barcode Battler experience to modern smartphones with AI-powered character generation.

## 🎮 Features Implemented (Phase 1)

### Core Functionality
- **Barcode Scanner Interface**: Camera-style interface with manual JAN code entry
- **Deterministic Character Generation**: Same barcode always generates the same character
- **Character Stats System**: HP, ATK, DEF, SPD based on product category
- **Element System**: Fire, Water, Earth, Electric, Wind
- **Rarity Tiers**: Common, Rare, Epic, Legendary
- **Campaign Boost System**: Sponsor products (Suntory) get 1.5x stat multiplier
- **Battle Arena**: Retro-styled battlefield with scanline effects
- **Collection System**: Save and manage scanned characters
- **Language Support**: English and Japanese (EN/JP switcher)

### Screens
1. **Home Screen**: Main menu with animated background
2. **Scanner Screen**: Barcode scanning interface with quick-scan demo products
3. **Generating Screen**: Animated loading with progress steps
4. **Character Card**: Detailed character view with stats and animations
5. **Battle Screen**: Retro Barcode Battler styled arena
6. **Collection Screen**: Grid view of all collected characters

## 🎨 Design Features

### Mobile-First & Responsive
- Optimized for mobile devices (max-width: 28rem)
- Touch-friendly interface
- Smooth animations using Motion (Framer Motion)
- Modern game-like aesthetic

### Retro Battle Arena
- CRT scanline effects
- Glowing grid horizon
- Neon color scheme (cyan, purple, pink)
- Nostalgic Barcode Battler atmosphere

### Animations
- Character card flip reveal
- Stat bar progress animations
- Particle effects during generation
- Battle damage effects
- Smooth screen transitions

## 🛠️ Tech Stack

- **React 18.3.1**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS v4**: Styling
- **Motion (Framer Motion)**: Animations
- **Lucide React**: Icons

## 📦 Mock Data Structure

### Products (5 Demo Products)
- Suntory Premium Highball (Campaign ★)
- Boss Coffee (Campaign ★)
- Pocky Chocolate
- Shin Ramyun
- Kit Kat Matcha

### Character Generation Algorithm
1. **Element Assignment**: Based on product category
   - Alcohol → Water
   - Food → Fire
   - Snacks → Earth
   - Beverage → Water
   - Electronics → Electric

2. **Rarity Assignment**: Based on product price
   - >¥300 → Legendary
   - >¥200 → Epic
   - >¥150 → Rare
   - Default → Common

3. **Base Stats**: Category-dependent
   - Food: High HP, Good ATK
   - Alcohol: High SPD, High ATK
   - Snacks: Balanced, Good DEF
   - Beverage: High SPD, Balanced
   - Electronics: High DEF, High ATK

4. **Stat Variance**: Based on JAN code seed (±10 points)

5. **Campaign Multiplier**: 1.5x for sponsored products

## 🌐 Internationalization

All UI text supports both English and Japanese:
- Real-time language switching
- Persistent language selection
- No page reload required

## 🎯 Phase 1 Success Criteria

✅ Barcode scanning interface  
✅ Product → Character generation  
✅ Deterministic output (same JAN = same character)  
✅ Basic image generation (element-based)  
✅ Hardcoded trend logic (campaign boost)  
✅ Battle system with retro aesthetic  
✅ Collection management  
✅ Mobile-optimized UI  
✅ Bilingual support (EN/JP)  

## 🚀 Next Steps (Phase 2+)

- Real camera barcode scanning
- Backend integration (Firebase/AWS)
- Real AI character generation (LLM + Image Gen)
- User authentication
- Synergy/Fusion system
- Social sharing
- Leaderboards
- Real-time multiplayer battles

## 📱 Usage

1. **Scan**: Click "Scan Barcode" and enter a 13-digit JAN code (or use quick-scan)
2. **Generate**: Watch the AI generate your character
3. **Save**: Add character to your collection
4. **Battle**: Select characters from collection and fight
5. **Language**: Switch between EN/JP using top-right buttons

## 🎨 Key Design Decisions

- **Mobile-First**: All screens optimized for portrait mobile view
- **Retro Meets Modern**: Classic Barcode Battler aesthetic with modern animations
- **Campaign Integration**: Visual indicators (★) for boosted products
- **Deterministic**: Same input always produces same output for fairness
- **Minimalist UI**: Clean, focused interface with smooth transitions

---

**Status**: Phase 1 PoC Complete  
**Ready for**: Client Demo & Phase 2 Planning
