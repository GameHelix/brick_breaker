export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Velocity {
  dx: number;
  dy: number;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
}

export interface Ball {
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
  speed: number;
  color: string;
  trail: Position[];
}

export interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  visible: boolean;
  hits: number;
  maxHits: number;
  points: number;
  type?: BrickType;
}

export enum BrickType {
  NORMAL = 'normal',
  STRONG = 'strong',
  EXTRA_STRONG = 'extra-strong',
  POWERUP = 'powerup'
}

export enum PowerUpType {
  EXPAND_PADDLE = 'expand-paddle',
  SHRINK_PADDLE = 'shrink-paddle',
  SLOW_BALL = 'slow-ball',
  FAST_BALL = 'fast-ball',
  MULTI_BALL = 'multi-ball',
  EXTRA_LIFE = 'extra-life',
  FIRE_BALL = 'fire-ball'
}

export interface PowerUp {
  x: number;
  y: number;
  width: number;
  height: number;
  type: PowerUpType;
  dy: number;
  color: string;
  icon: string;
  active: boolean;
  duration?: number;
  startTime?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface GameState {
  score: number;
  level: number;
  lives: number;
  gameOver: boolean;
  paused: boolean;
  won: boolean;
  highScore: number;
}
