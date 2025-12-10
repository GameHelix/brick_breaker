'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Ball,
  Paddle,
  Brick,
  PowerUp,
  Particle,
  GameState,
  BrickType,
  PowerUpType,
  Bullet
} from '@/lib/types';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_HEIGHT = 12;
const PADDLE_WIDTH = 100;
const BALL_RADIUS = 8;
const BRICK_ROWS = 6;
const BRICK_COLS = 10;
const BRICK_WIDTH = 70;
const BRICK_HEIGHT = 25;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 60;
const BRICK_OFFSET_LEFT = 35;

export default function BrickBreaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    lives: 3,
    gameOver: false,
    paused: false,
    won: false,
    highScore: typeof window !== 'undefined' ? parseInt(localStorage.getItem('brickBreakerHighScore') || '0') : 0
  });

  // Game objects
  const paddleRef = useRef<Paddle>({
    x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    y: CANVAS_HEIGHT - 30,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 8,
    color: '#00ffff'
  });

  const ballsRef = useRef<Ball[]>([]);
  const bricksRef = useRef<Brick[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const activePowerUpsRef = useRef<PowerUp[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const mouseXRef = useRef<number>(CANVAS_WIDTH / 2);
  const fireBallActiveRef = useRef(false);
  const laserActiveRef = useRef(false);
  const lastShootTimeRef = useRef(0);

  // Create initial ball
  const createBall = useCallback((x?: number, y?: number): Ball => {
    return {
      x: x || CANVAS_WIDTH / 2,
      y: y || CANVAS_HEIGHT - 50,
      radius: BALL_RADIUS,
      dx: (Math.random() > 0.5 ? 1 : -1) * 4,
      dy: -4,
      speed: 4,
      color: '#ffffff',
      trail: []
    };
  }, []);

  // Generate bricks for level
  const generateBricks = useCallback((level: number): Brick[] => {
    const bricks: Brick[] = [];
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ];

    const rows = Math.min(BRICK_ROWS + Math.floor(level / 3), 8);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        const x = col * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
        const y = row * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;

        let type = BrickType.NORMAL;
        let maxHits = 1;
        let points = 10;

        // Add variety based on level
        const rand = Math.random();
        if (level > 2 && rand < 0.15) {
          type = BrickType.EXTRA_STRONG;
          maxHits = 3;
          points = 30;
        } else if (level > 1 && rand < 0.3) {
          type = BrickType.STRONG;
          maxHits = 2;
          points = 20;
        } else if (rand < 0.6) {
          type = BrickType.POWERUP;
        }

        bricks.push({
          x,
          y,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          color: colors[row % colors.length],
          visible: true,
          hits: 0,
          maxHits,
          points,
          type
        });
      }
    }
    return bricks;
  }, []);

  // Create particles
  const createParticles = useCallback((x: number, y: number, color: string, count: number = 10) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        color,
        size: 3 + Math.random() * 3
      });
    }
    particlesRef.current.push(...newParticles);
  }, []);

  // Create power-up
  const createPowerUp = useCallback((x: number, y: number) => {
    const types = Object.values(PowerUpType);
    const type = types[Math.floor(Math.random() * types.length)];

    const powerUpConfig = {
      [PowerUpType.EXPAND_PADDLE]: { color: '#4ECDC4', icon: '⬌' },
      [PowerUpType.SHRINK_PADDLE]: { color: '#FF6B6B', icon: '⬍' },
      [PowerUpType.SLOW_BALL]: { color: '#45B7D1', icon: '🐌' },
      [PowerUpType.FAST_BALL]: { color: '#FFA07A', icon: '⚡' },
      [PowerUpType.MULTI_BALL]: { color: '#F7DC6F', icon: '⚽' },
      [PowerUpType.EXTRA_LIFE]: { color: '#98D8C8', icon: '❤️' },
      [PowerUpType.FIRE_BALL]: { color: '#FF4500', icon: '🔥' },
      [PowerUpType.LASER]: { color: '#00FF00', icon: '🔫' }
    };

    const config = powerUpConfig[type];

    powerUpsRef.current.push({
      x,
      y,
      width: 30,
      height: 30,
      type,
      dy: 2,
      color: config.color,
      icon: config.icon,
      active: false
    });
  }, []);

  // Apply power-up effect
  const applyPowerUp = useCallback((powerUp: PowerUp) => {
    const paddle = paddleRef.current;
    const balls = ballsRef.current;

    switch (powerUp.type) {
      case PowerUpType.EXPAND_PADDLE:
        paddle.width = Math.min(paddle.width * 1.5, 200);
        powerUp.duration = 10000;
        break;
      case PowerUpType.SHRINK_PADDLE:
        paddle.width = Math.max(paddle.width * 0.7, 50);
        powerUp.duration = 8000;
        break;
      case PowerUpType.SLOW_BALL:
        balls.forEach(ball => {
          ball.dx *= 0.7;
          ball.dy *= 0.7;
          ball.speed *= 0.7;
        });
        powerUp.duration = 8000;
        break;
      case PowerUpType.FAST_BALL:
        balls.forEach(ball => {
          ball.dx *= 1.3;
          ball.dy *= 1.3;
          ball.speed *= 1.3;
        });
        powerUp.duration = 6000;
        break;
      case PowerUpType.MULTI_BALL:
        if (balls.length > 0) {
          const mainBall = balls[0];
          for (let i = 0; i < 2; i++) {
            const newBall = createBall(mainBall.x, mainBall.y);
            const angle = (Math.random() - 0.5) * Math.PI;
            newBall.dx = Math.cos(angle) * mainBall.speed;
            newBall.dy = -Math.abs(Math.sin(angle) * mainBall.speed);
            balls.push(newBall);
          }
        }
        break;
      case PowerUpType.EXTRA_LIFE:
        setGameState(prev => ({ ...prev, lives: prev.lives + 1 }));
        break;
      case PowerUpType.FIRE_BALL:
        fireBallActiveRef.current = true;
        balls.forEach(ball => {
          ball.color = '#FF4500';
        });
        powerUp.duration = 12000;
        break;
      case PowerUpType.LASER:
        laserActiveRef.current = true;
        paddle.color = '#00FF00';
        powerUp.duration = 20000; // Longer duration for more fun
        break;
    }

    if (powerUp.duration) {
      powerUp.active = true;
      powerUp.startTime = Date.now();
      activePowerUpsRef.current.push(powerUp);
    }
  }, [createBall]);

  // Initialize game
  const initGame = useCallback(() => {
    ballsRef.current = [createBall()];
    bricksRef.current = generateBricks(gameState.level);
    powerUpsRef.current = [];
    particlesRef.current = [];
    activePowerUpsRef.current = [];
    bulletsRef.current = [];
    paddleRef.current.width = PADDLE_WIDTH;
    paddleRef.current.color = '#00ffff';
    fireBallActiveRef.current = false;
    laserActiveRef.current = false;
    lastShootTimeRef.current = 0;
  }, [createBall, generateBricks, gameState.level]);

  // Reset ball
  const resetBall = useCallback(() => {
    if (gameState.lives > 0) {
      ballsRef.current = [createBall()];
      paddleRef.current.x = CANVAS_WIDTH / 2 - paddleRef.current.width / 2;
    }
  }, [createBall, gameState.lives]);

  // Collision detection
  const detectCollision = useCallback((ball: Ball, brick: Brick): boolean => {
    return (
      ball.x + ball.radius > brick.x &&
      ball.x - ball.radius < brick.x + brick.width &&
      ball.y + ball.radius > brick.y &&
      ball.y - ball.radius < brick.y + brick.height
    );
  }, []);

  // Shoot bullet
  const shootBullet = useCallback(() => {
    const now = Date.now();
    if (laserActiveRef.current && now - lastShootTimeRef.current > 30) { // ULTRA fast fire rate (30ms = 33.3 shots/second)
      const paddle = paddleRef.current;
      // Shoot FOUR bullets for maximum intensity
      bulletsRef.current.push({
        x: paddle.x + paddle.width * 0.2,
        y: paddle.y,
        width: 5,
        height: 18,
        speed: 15, // Even faster bullets
        color: '#00FF00'
      });
      bulletsRef.current.push({
        x: paddle.x + paddle.width * 0.4,
        y: paddle.y,
        width: 5,
        height: 18,
        speed: 15,
        color: '#00FF00'
      });
      bulletsRef.current.push({
        x: paddle.x + paddle.width * 0.6,
        y: paddle.y,
        width: 5,
        height: 18,
        speed: 15,
        color: '#00FF00'
      });
      bulletsRef.current.push({
        x: paddle.x + paddle.width * 0.8,
        y: paddle.y,
        width: 5,
        height: 18,
        speed: 15,
        color: '#00FF00'
      });
      lastShootTimeRef.current = now;

      // Add intense muzzle flash particles
      createParticles(paddle.x + paddle.width * 0.2, paddle.y, '#00FF00', 8);
      createParticles(paddle.x + paddle.width * 0.4, paddle.y, '#00FF00', 8);
      createParticles(paddle.x + paddle.width * 0.6, paddle.y, '#00FF00', 8);
      createParticles(paddle.x + paddle.width * 0.8, paddle.y, '#00FF00', 8);
    }
  }, [createParticles]);

  // Update game
  const update = useCallback(() => {
    if (gameState.paused || gameState.gameOver) return;

    const paddle = paddleRef.current;
    const balls = ballsRef.current;
    const bricks = bricksRef.current;
    const powerUps = powerUpsRef.current;
    const particles = particlesRef.current;
    const bullets = bulletsRef.current;

    // Update paddle position
    if (keysRef.current['ArrowLeft'] || keysRef.current['a']) {
      paddle.x = Math.max(0, paddle.x - paddle.speed);
    }
    if (keysRef.current['ArrowRight'] || keysRef.current['d']) {
      paddle.x = Math.min(CANVAS_WIDTH - paddle.width, paddle.x + paddle.speed);
    }

    // Mouse control
    if (mouseXRef.current !== null) {
      paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, mouseXRef.current - paddle.width / 2));
    }

    // Auto-shoot when laser is active
    if (laserActiveRef.current) {
      shootBullet();
    }

    // Update balls
    for (let i = balls.length - 1; i >= 0; i--) {
      const ball = balls[i];

      // Add trail effect
      ball.trail.push({ x: ball.x, y: ball.y });
      if (ball.trail.length > 10) ball.trail.shift();

      ball.x += ball.dx;
      ball.y += ball.dy;

      // Wall collision
      if (ball.x + ball.radius > CANVAS_WIDTH || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
        createParticles(ball.x, ball.y, ball.color, 5);
      }
      if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
        createParticles(ball.x, ball.y, ball.color, 5);
      }

      // Paddle collision
      if (
        ball.y + ball.radius > paddle.y &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
      ) {
        ball.dy = -Math.abs(ball.dy);

        // Add spin based on where ball hits paddle
        const hitPos = (ball.x - paddle.x) / paddle.width;
        ball.dx = (hitPos - 0.5) * 8;

        createParticles(ball.x, ball.y, paddle.color, 8);
      }

      // Bottom boundary (lose ball)
      if (ball.y - ball.radius > CANVAS_HEIGHT) {
        balls.splice(i, 1);
        if (balls.length === 0) {
          setGameState(prev => {
            const newLives = prev.lives - 1;
            if (newLives <= 0) {
              return { ...prev, lives: 0, gameOver: true };
            }
            return { ...prev, lives: newLives };
          });
          setTimeout(resetBall, 1000);
        }
      }

      // Brick collision
      bricks.forEach(brick => {
        if (brick.visible && detectCollision(ball, brick)) {
          if (fireBallActiveRef.current) {
            brick.visible = false;
          } else {
            brick.hits++;
            if (brick.hits >= brick.maxHits) {
              brick.visible = false;
              if (brick.type === BrickType.POWERUP) {
                createPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2);
              }
            }
            ball.dy = -ball.dy;
          }

          createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color, 15);

          setGameState(prev => ({
            ...prev,
            score: prev.score + brick.points
          }));
        }
      });
    }

    // Update power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
      const powerUp = powerUps[i];
      powerUp.y += powerUp.dy;

      // Collision with paddle
      if (
        powerUp.y + powerUp.height > paddle.y &&
        powerUp.y < paddle.y + paddle.height &&
        powerUp.x + powerUp.width > paddle.x &&
        powerUp.x < paddle.x + paddle.width
      ) {
        applyPowerUp(powerUp);
        createParticles(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, powerUp.color, 20);
        powerUps.splice(i, 1);
      } else if (powerUp.y > CANVAS_HEIGHT) {
        powerUps.splice(i, 1);
      }
    }

    // Update active power-ups
    const now = Date.now();
    for (let i = activePowerUpsRef.current.length - 1; i >= 0; i--) {
      const powerUp = activePowerUpsRef.current[i];
      if (powerUp.duration && powerUp.startTime) {
        if (now - powerUp.startTime > powerUp.duration) {
          // Reverse power-up effect
          switch (powerUp.type) {
            case PowerUpType.EXPAND_PADDLE:
            case PowerUpType.SHRINK_PADDLE:
              paddle.width = PADDLE_WIDTH;
              break;
            case PowerUpType.SLOW_BALL:
            case PowerUpType.FAST_BALL:
              balls.forEach(ball => {
                const speed = 4;
                const currentSpeed = Math.sqrt(ball.dx ** 2 + ball.dy ** 2);
                ball.dx = (ball.dx / currentSpeed) * speed;
                ball.dy = (ball.dy / currentSpeed) * speed;
                ball.speed = speed;
              });
              break;
            case PowerUpType.FIRE_BALL:
              fireBallActiveRef.current = false;
              balls.forEach(ball => {
                ball.color = '#ffffff';
              });
              break;
            case PowerUpType.LASER:
              laserActiveRef.current = false;
              paddle.color = '#00ffff';
              break;
          }
          activePowerUpsRef.current.splice(i, 1);
        }
      }
    }

    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];

      let bulletHit = false;

      // Bullet-brick collision (check BEFORE moving bullet to prevent passing through)
      for (let j = bricks.length - 1; j >= 0; j--) {
        const brick = bricks[j];
        if (
          brick.visible &&
          bullet.x + bullet.width > brick.x &&
          bullet.x < brick.x + brick.width &&
          bullet.y - bullet.speed < brick.y + brick.height &&
          bullet.y + bullet.height > brick.y
        ) {
          // Destroy brick
          brick.hits++;
          if (brick.hits >= brick.maxHits) {
            brick.visible = false;
            if (brick.type === BrickType.POWERUP) {
              createPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2);
            }
          }

          // Create explosion particles
          createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color, 20);

          // Add score
          setGameState(prev => ({
            ...prev,
            score: prev.score + brick.points
          }));

          bulletHit = true;
          break;
        }
      }

      // Remove bullet if it hit something or went off screen
      if (bulletHit) {
        bullets.splice(i, 1);
        continue;
      }

      // Move bullet
      bullet.y -= bullet.speed;

      // Remove bullets that go off screen
      if (bullet.y + bullet.height < 0) {
        bullets.splice(i, 1);
      }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.1; // Gravity
      particle.life -= 0.02;

      if (particle.life <= 0) {
        particles.splice(i, 1);
      }
    }

    // Check win condition
    const allBricksDestroyed = bricks.every(brick => !brick.visible);
    if (allBricksDestroyed) {
      setGameState(prev => ({
        ...prev,
        level: prev.level + 1,
        paused: true
      }));
      setTimeout(() => {
        setGameState(prev => ({ ...prev, paused: false }));
        initGame();
      }, 2000);
    }

    // Update high score
    setGameState(prev => {
      if (prev.score > prev.highScore) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('brickBreakerHighScore', prev.score.toString());
        }
        return { ...prev, highScore: prev.score };
      }
      return prev;
    });
  }, [gameState.paused, gameState.gameOver, detectCollision, createParticles, createPowerUp, applyPowerUp, resetBall, initGame, shootBullet]);

  // Draw game
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(1, '#1a0a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw particles
    particlesRef.current.forEach(particle => {
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw bricks
    bricksRef.current.forEach(brick => {
      if (brick.visible) {
        // Brick shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(brick.x + 3, brick.y + 3, brick.width, brick.height);

        // Brick gradient
        const brickGradient = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
        brickGradient.addColorStop(0, brick.color);
        brickGradient.addColorStop(1, adjustBrightness(brick.color, -30));
        ctx.fillStyle = brickGradient;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

        // Brick border
        ctx.strokeStyle = adjustBrightness(brick.color, 30);
        ctx.lineWidth = 2;
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);

        // Hits indicator
        if (brick.maxHits > 1) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${brick.maxHits - brick.hits}`, brick.x + brick.width / 2, brick.y + brick.height / 2 + 4);
        }
      }
    });

    // Draw paddle
    ctx.save();
    ctx.shadowColor = paddleRef.current.color;
    ctx.shadowBlur = 15;
    const paddleGradient = ctx.createLinearGradient(
      paddleRef.current.x,
      paddleRef.current.y,
      paddleRef.current.x,
      paddleRef.current.y + paddleRef.current.height
    );
    paddleGradient.addColorStop(0, paddleRef.current.color);
    paddleGradient.addColorStop(1, adjustBrightness(paddleRef.current.color, -40));
    ctx.fillStyle = paddleGradient;
    ctx.fillRect(
      paddleRef.current.x,
      paddleRef.current.y,
      paddleRef.current.width,
      paddleRef.current.height
    );

    // Draw gun barrels when laser is active
    if (laserActiveRef.current) {
      const gunPositions = [0.2, 0.4, 0.6, 0.8];
      gunPositions.forEach(pos => {
        const gunX = paddleRef.current.x + paddleRef.current.width * pos;
        const gunY = paddleRef.current.y - 3;

        // Gun barrel
        ctx.fillStyle = '#00FF00';
        ctx.shadowColor = '#00FF00';
        ctx.shadowBlur = 10;
        ctx.fillRect(gunX - 2.5, gunY, 5, 6);

        // Gun glow
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(gunX - 1.5, gunY, 3, 4);
        ctx.globalAlpha = 1;
      });
    }

    ctx.restore();

    // Draw balls
    ballsRef.current.forEach(ball => {
      // Ball trail
      ball.trail.forEach((pos, index) => {
        ctx.globalAlpha = (index / ball.trail.length) * 0.5;
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, ball.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Ball
      ctx.save();
      ctx.shadowColor = ball.color;
      ctx.shadowBlur = 20;
      const ballGradient = ctx.createRadialGradient(
        ball.x - ball.radius / 3,
        ball.y - ball.radius / 3,
        0,
        ball.x,
        ball.y,
        ball.radius
      );
      ballGradient.addColorStop(0, '#ffffff');
      ballGradient.addColorStop(1, ball.color);
      ctx.fillStyle = ballGradient;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw bullets
    bulletsRef.current.forEach(bullet => {
      ctx.save();
      ctx.shadowColor = bullet.color;
      ctx.shadowBlur = 15;

      // Bullet gradient
      const bulletGradient = ctx.createLinearGradient(bullet.x, bullet.y, bullet.x, bullet.y + bullet.height);
      bulletGradient.addColorStop(0, '#ffffff');
      bulletGradient.addColorStop(0.3, bullet.color);
      bulletGradient.addColorStop(1, adjustBrightness(bullet.color, -50));
      ctx.fillStyle = bulletGradient;
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

      // Bullet glow
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = bullet.color;
      ctx.fillRect(bullet.x - 1, bullet.y, bullet.width + 2, bullet.height);
      ctx.globalAlpha = 1;

      ctx.restore();
    });

    // Draw power-ups
    powerUpsRef.current.forEach(powerUp => {
      ctx.save();
      ctx.shadowColor = powerUp.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = powerUp.color;
      ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(powerUp.icon, powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2 + 7);
      ctx.restore();
    });

    // Draw UI
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${gameState.score}`, 20, 30);
    ctx.fillText(`Level: ${gameState.level}`, 20, 55);
    ctx.textAlign = 'right';
    ctx.fillText(`Lives: ${'❤️'.repeat(gameState.lives)}`, CANVAS_WIDTH - 20, 30);
    ctx.fillText(`High: ${gameState.highScore}`, CANVAS_WIDTH - 20, 55);

    // Draw active power-ups indicators
    let powerUpY = 80;
    activePowerUpsRef.current.forEach(powerUp => {
      if (powerUp.duration && powerUp.startTime) {
        const remaining = Math.max(0, powerUp.duration - (Date.now() - powerUp.startTime));
        const seconds = Math.ceil(remaining / 1000);
        ctx.fillStyle = powerUp.color;
        ctx.font = '16px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`${powerUp.icon} ${seconds}s`, CANVAS_WIDTH - 20, powerUpY);
        powerUpY += 25;
      }
    });

    // Draw overlays
    if (gameState.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#ff6b6b';
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.fillText(`Final Score: ${gameState.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
      ctx.fillText('Press SPACE to Restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
    } else if (gameState.paused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#4ECDC4';
      ctx.font = 'bold 50px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.fillText('Press SPACE to Continue', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
    }
  }, [gameState]);

  // Helper function to adjust color brightness
  const adjustBrightness = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Game loop
  const gameLoop = useCallback(() => {
    update();
    draw();
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [update, draw]);

  // Event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;

      if (e.key === ' ') {
        e.preventDefault();
        if (gameState.gameOver) {
          setGameState({
            score: 0,
            level: 1,
            lives: 3,
            gameOver: false,
            paused: false,
            won: false,
            highScore: gameState.highScore
          });
          initGame();
        } else {
          setGameState(prev => ({ ...prev, paused: !prev.paused }));
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        mouseXRef.current = e.clientX - rect.left;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [gameState.gameOver, gameState.highScore, initGame]);

  // Initialize and start game
  useEffect(() => {
    initGame();
    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [initGame, gameLoop]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 mb-2">
          BRICK BREAKER
        </h1>
        <p className="text-gray-400 text-sm">Use Arrow Keys or Mouse to move • Space to Pause • Get Laser to auto-shoot!</p>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-purple-600 rounded-lg shadow-2xl shadow-purple-500/50"
        />
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 max-w-2xl">
        <h2 className="text-xl font-bold text-cyan-400 mb-3">Power-Ups</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⬌</span>
            <span>Expand Paddle</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⬍</span>
            <span>Shrink Paddle</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐌</span>
            <span>Slow Ball</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span>Fast Ball</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚽</span>
            <span>Multi Ball</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">❤️</span>
            <span>Extra Life</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <span>Fire Ball (destroy all)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔫</span>
            <span>Laser (auto-shoot bullets)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
