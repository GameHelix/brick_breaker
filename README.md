# 🎮 Brick Breaker / Arkanoid

A modern, feature-rich implementation of the classic Brick Breaker (Arkanoid) game built with Next.js, TypeScript, and HTML5 Canvas.

![Game Banner](https://img.shields.io/badge/Game-Brick%20Breaker-purple?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

## 🎯 Features

### Core Gameplay
- **Classic Mechanics**: Paddle control, ball physics, and brick destruction
- **Multiple Brick Types**: Normal, Strong (2 hits), Extra Strong (3 hits), and Power-up bricks
- **Level Progression**: Increasing difficulty with more rows and stronger bricks
- **Lives System**: 3 lives to start, lose one when ball falls off screen
- **High Score Tracking**: Local storage persistence of your best score

### 8 Power-Ups
1. **⬌ Expand Paddle** - Makes paddle wider (10s)
2. **⬍ Shrink Paddle** - Makes paddle smaller (8s)
3. **🐌 Slow Ball** - Reduces ball speed (8s)
4. **⚡ Fast Ball** - Increases ball speed (6s)
5. **⚽ Multi Ball** - Spawns 2 additional balls
6. **❤️ Extra Life** - Adds one life
7. **🔥 Fire Ball** - Destroys bricks instantly (12s)
8. **🔫 Laser** - Auto-shoots 133+ bullets/second (20s)

### Visual Effects
- **Beautiful Gradients**: Purple/dark theme with glowing elements
- **Particle Systems**: Explosions on brick destruction and collisions
- **Ball Trails**: Motion blur effect on the ball
- **Glowing Shadows**: Dynamic lighting on paddle, ball, and bullets
- **Gun Barrels**: Visual indicators when laser is active
- **Animated Favicon**: Bouncing ball icon in browser tab

### Polish
- **Responsive Design**: Clean UI with Tailwind CSS
- **Smooth Animations**: 60 FPS gameplay
- **Sound Effects Ready**: Architecture supports audio (easy to add)
- **Pause/Resume**: Space bar to pause gameplay
- **Game Over Screen**: With restart functionality

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd brick_breaker
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to [http://localhost:3000](http://localhost:3000) (or the port shown in terminal)

### Production Build

```bash
npm run build
npm start
```

## 🎮 How to Play

### Objective
Destroy all bricks to advance to the next level. Don't let the ball fall off the bottom of the screen!

### Controls
- **Mouse**: Move paddle by moving mouse horizontally
- **Arrow Keys**: ← → to move paddle left/right
- **A/D Keys**: Alternative paddle movement
- **Space**: Pause/Resume game or Restart after game over

### Gameplay Tips
1. **Aim Strategically**: Hit the ball with different parts of the paddle to control angle
2. **Collect Power-Ups**: Catch falling power-ups with the paddle
3. **Use Laser Wisely**: The laser power-up creates intense bullet spray - position well!
4. **Watch Multi-Ball**: Can create chaos but also clear levels faster
5. **Fire Ball**: Passes through all bricks - great for clearing difficult spots

### Scoring
- **Normal Brick**: 10 points
- **Strong Brick**: 20 points (2 hits)
- **Extra Strong Brick**: 30 points (3 hits)

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **Canvas**: HTML5 Canvas API
- **State Management**: React Hooks (useState, useRef, useCallback)
- **Animation**: RequestAnimationFrame loop

## 📁 Project Structure

```
brick_breaker/
├── app/
│   ├── globals.css          # Global styles and Tailwind imports
│   ├── layout.tsx            # Root layout with metadata
│   ├── page.tsx              # Main game page
│   └── icon.svg              # Animated favicon
├── components/
│   └── BrickBreaker.tsx      # Main game component (900+ lines)
├── lib/
│   └── types.ts              # TypeScript interfaces and enums
├── public/                   # Static assets
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── next.config.js            # Next.js configuration
```

## 🎨 Game Architecture

### Core Systems

1. **Game Loop**
   - 60 FPS update/draw cycle using `requestAnimationFrame`
   - Separate update (physics) and draw (rendering) phases

2. **Physics Engine**
   - Ball velocity and collision detection
   - Paddle-ball interaction with spin mechanics
   - Brick collision with hit counting

3. **Power-Up System**
   - Random drop from power-up bricks (60% of all bricks)
   - Timed effects with automatic reversal
   - Visual indicators for active power-ups

4. **Particle System**
   - Dynamic particle generation on collisions
   - Gravity and fade effects
   - Color-matched to source objects

5. **Bullet System** (Laser Power-Up)
   - Quad-barrel automatic firing
   - High-speed projectiles (15 units/frame)
   - Look-ahead collision detection

## 🔧 Configuration

### Game Constants
Edit `components/BrickBreaker.tsx` to adjust:
- `CANVAS_WIDTH` / `CANVAS_HEIGHT`: Game dimensions
- `PADDLE_WIDTH` / `PADDLE_HEIGHT`: Paddle size
- `BALL_RADIUS`: Ball size
- `BRICK_ROWS` / `BRICK_COLS`: Grid layout
- Power-up durations in `applyPowerUp` function
- Bullet fire rate in `shootBullet` function

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

### Ideas for Enhancement
- Sound effects and background music
- More power-up types
- Boss levels with moving targets
- Multiplayer mode
- Mobile touch controls
- Achievements system
- Leaderboard integration

## 🎯 Roadmap

- [ ] Add sound effects
- [ ] Implement touch controls for mobile
- [ ] Add more visual themes
- [ ] Create level designer
- [ ] Add achievements
- [ ] Implement online leaderboard

## 👨‍💻 Author

Built with ❤️ using Claude Code

## 🙏 Acknowledgments

- Inspired by the classic Taito Arkanoid (1986)
- Built as a demonstration of modern web game development
- Canvas rendering techniques from HTML5 game development best practices

---

**Enjoy the game!** 🎮✨
