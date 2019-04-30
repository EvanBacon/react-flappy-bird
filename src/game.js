import { PIXI } from 'expo-pixi';
import { Container, extras, Sprite } from 'pixi.js';
import { AsyncStorage, PixelRatio } from 'react-native';

import source from '../assets/spritesheet.png';
import setupSpriteSheetAsync from './setupSpriteSheetAsync';
import sprites from './sprites';

const { TilingSprite, AnimatedSprite } = extras;

const scale = PixelRatio.get();

const Settings = {
  playerFallSpeed: 8 * scale,
  playerHorizontalPosition: 100 * scale,
  playerVerticalPosition: 200 * scale,
  playerMaxVelocity: -3 * scale,
  pipeWidth: 80 * scale,
  groundHeight: 100 * scale,
  pipeHeight: 500 * scale,
  playerGravity: 0.4 * scale,
  minPipeHeight: 50 * scale,
  pipeVerticalGap: 190 * scale, //180 is pretty legit
  gameSpeed: 40 * 0.25,
};

class FlappySprite extends Sprite {
  constructor(...args) {
    super(...args);
    this.scale.set(scale);
  }
}

class Ground extends TilingSprite {
  constructor(texture) {
    super(texture, Settings.width, Settings.groundHeight);
    this.tileScale.set(scale * 2);
    this.position.x = 0;
    this.position.y = Settings.skyHeight;
  }
}

class Background extends FlappySprite {
  constructor(texture) {
    super(texture);
    this.position.x = 0;
    this.position.y = 0;
    this.width = Settings.width;
    this.height = Settings.height;
  }
}

function boxesIntersect(a, b, paddingA = 0) {
  const ab = a.getBounds();
  ab.x += paddingA;
  ab.width -= paddingA * 2;
  ab.y += paddingA;
  ab.height -= paddingA * 2;

  const bb = b.getBounds();
  return (
    ab.x + ab.width > bb.x &&
    ab.x < bb.x + bb.width &&
    ab.y + ab.height > bb.y &&
    ab.y < bb.y + bb.height
  );
}
class PipeContainer extends Container {
  pipes = [];
  pipeIndex = 0;

  constructor(pipeTexture) {
    super();
    this.pipeTexture = pipeTexture;
    this.position.x = Settings.width + Settings.pipeWidth / 2;
  }

  tryAddingNewPipe = () => {
    if (!this.pipes.length) return;
    const { pipe } = this.pipes[this.pipes.length - 1];
    if (-pipe.position.x >= Settings.pipeHorizontalGap) {
      this.addNewPipe();
    }
  };

  moveAll = () => {
    let score = 0;
    for (let index = 0; index < this.pipes.length; index++) {
      this.move(index);
      if (this.tryScoringPipe(index)) {
        score += 1;
      }
    }
    return score;
  };

  tryScoringPipe = index => {
    const group = this.pipes[index];

    if (
      !group.scored &&
      this.toGlobal(group.pipe.position).x < Settings.playerHorizontalPosition
    ) {
      group.scored = true;
      return true;
    }
    return false;
  };

  move = index => {
    const { pipe, pipe2 } = this.pipes[index];
    pipe.position.x -= Settings.gameSpeed;
    pipe2.position.x -= Settings.gameSpeed;
  };

  addNewPipe = () => {
    const pipeGroup = {};
    const pipe = new Pipe(this.pipeTexture);
    const pipe2 = new Pipe(this.pipeTexture);
    pipe.rotation = Math.PI;

    const maxPosition =
      Settings.skyHeight -
      Settings.minPipeHeight -
      Settings.pipeVerticalGap -
      pipe.height / 2;
    const minPosition = -(pipe.height / 2 - Settings.minPipeHeight);

    pipe.position.y = Math.floor(
      Math.random() * (maxPosition - minPosition + 1) + minPosition,
    );

    pipe2.position.y = pipe.height + pipe.position.y + Settings.pipeVerticalGap;
    pipe.position.x = pipe2.position.x = 0;

    pipeGroup.upper = pipe.position.y + pipe.height / 2;
    pipeGroup.lower = pipeGroup.upper + Settings.pipeVerticalGap;
    pipeGroup.pipe = pipe;
    pipeGroup.pipe2 = pipe2;

    this.addChild(pipe);
    this.addChild(pipe2);
    this.pipes.push(pipeGroup);
    this.tryRemovingLastGroup();
  };

  tryRemovingLastGroup = () => {
    if (
      this.pipes[0].pipe.position.x + Settings.pipeWidth / 2 >
      Settings.width
    ) {
      this.pipes.shift();
    }
  };

  setXforGroup = (index, x) => {
    const { pipe, pipe2 } = this.pipes[index];
    pipe.position.x = x;
    pipe2.position.x = x;
  };

  getX = index => {
    const { pipe } = this.pipes[index];
    return this.toGlobal(pipe.position).x;
  };

  restart = () => {
    this.pipeIndex = 0;
    this.pipes = [];
    this.children = [];
  };
}

class Pipe extends FlappySprite {
  constructor(texture) {
    super(texture);
    this.width = Settings.pipeWidth;
    this.height = Settings.pipeHeight;
    this.anchor.set(0.5);
  }
}

class Bird extends AnimatedSprite {
  constructor(textures) {
    super(textures);
    this.animationSpeed = 0.2;
    this.anchor.set(0.5);
    this.width = 60 * scale;
    this.height = 48 * scale;

    this.speedY = Settings.playerFallSpeed;
    this.rate = Settings.playerGravity;

    this.restart();
  }

  restart = () => {
    this.play();
    this.rotation = 0;
    this.position.x = Settings.playerHorizontalPosition;
    this.position.y = Settings.playerVerticalPosition;
  };

  updateGravity = () => {
    this.position.y -= this.speedY;
    this.speedY -= this.rate;

    const FLAP = 35;
    this.rotation = -Math.min(
      Math.PI / 4,
      Math.max(-Math.PI / 2, (FLAP + this.speedY) / FLAP),
    );
  };
}

class Game {
  stopAnimating = true;
  isStarted = false;
  isDead = false;
  score = 0;

  constructor(context) {
    // Sharp pixels
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    this.app = new PIXI.Application({
      context,
      autoResize: false,
      width: context.drawingBufferWidth / 1,
      height: context.drawingBufferHeight / 1,
    });
    this.app.ticker.add(this.animate);
    /*
    this.app.stage.interactive = true;
    this.app.stage.buttonMode = true;
    this.app.stage.on('mousedown', this.beginGame);
    this.app.stage.on('tap', this.beginGame);
    */

    Settings.width = this.app.renderer.width;
    Settings.pipeScorePosition = -(
      Settings.width - Settings.playerHorizontalPosition
    );
    Settings.height = this.app.renderer.height;
    Settings.skyHeight = Settings.height - Settings.groundHeight;
    Settings.pipeHorizontalGap = Settings.pipeWidth * 5;
    this.loadAsync();
  }

  // Resize function window
  resize = ({ width, height, scale }) => {
    const parent = this.app.view.parentNode;
    // Resize the renderer
    // this.app.renderer.resize(width * scale, height * scale);

    // if (Platform.OS === 'web') {
    //   this.app.view.style.width = width;
    //   this.app.view.style.height = height;
    // }
  };

  loadAsync = async () => {
    this.textures = await setupSpriteSheetAsync(source, sprites);
    this.onAssetsLoaded();
  };

  onAssetsLoaded = () => {
    this.background = new Background(this.textures.background);
    this.pipeContainer = new PipeContainer(this.textures.pipe);
    this.ground = new Ground(this.textures.ground);

    this.bird = new Bird([
      this.textures['bird_000'],
      this.textures['bird_001'],
      this.textures['bird_002'],
      this.textures['bird_001'],
    ]);

    [this.background, this.pipeContainer, this.ground, this.bird].map(child =>
      this.app.stage.addChild(child),
    );

    this.stopAnimating = false;
  };

  onPress = () => {
    if (this.isDead) {
      this.restart();
    } else {
      this.beginGame();
    }
  };

  beginGame = () => {
    if (!this.isStarted) {
      this.isStarted = true;
      this.score = 0;
      this.onScore(this.score);
      this.pipeContainer.addNewPipe();
    }
    this.bird.speedY = Settings.playerFallSpeed;
  };

  animate = () => {
    if (this.stopAnimating) {
      return;
    }

    if (!this.isDead) {
      if (Math.abs(this.ground.tilePosition.x) > this.ground.width) {
        this.ground.tilePosition.x = 0;
      }
      this.ground.tilePosition.x -= Settings.gameSpeed;
    }

    if (this.isStarted) {
      this.bird.updateGravity();
    }

    if (this.isDead) {
      this.bird.rotation += Math.PI / 4;
      if (
        this.bird.rotation > Math.PI / 2 &&
        this.bird.position.y > Settings.skyHeight - this.bird.height / 2
      ) {
        saveHighScoreAsync(this.score);
        this.stopAnimating = true;
      }
    } else {
      if (this.bird.position.y + this.bird.height / 2 > Settings.skyHeight) {
        this.hitPipe();
      }

      const points = this.pipeContainer.moveAll();
      if (points) {
        this.score += points;
        this.onScore(this.score);
      }
      this.pipeContainer.tryAddingNewPipe();

      const padding = 15;
      for (const group of this.pipeContainer.pipes) {
        const { pipe, pipe2, upper, lower } = group;
        if (
          boxesIntersect(this.bird, pipe, padding) ||
          boxesIntersect(this.bird, pipe2, padding)
        ) {
          this.hitPipe();
        }
      }
    }
  };

  restart = () => {
    this.isStarted = false;
    this.isDead = false;
    this.stopAnimating = false;
    this.score = 0;
    this.onScore(this.score);
    this.bird.restart();
    this.pipeContainer.restart();
    this.animate();
  };

  hitPipe = () => {
    this.bird.stop();
    this.isDead = true;
  };

  updateScore = () => {
    this.score += 1;
    this.onScore(this.score);
    // TODO: UPDATE UI
  };
}

async function saveHighScoreAsync(score) {
  const highScore = await getHighScoreAsync();
  if (score > highScore) {
    await AsyncStorage.setItem('hiscore', highScore);
  }
  return {
    score: Math.max(score, highScore),
    isBest: score > highScore,
  };
}

async function getHighScoreAsync() {
  const score = await AsyncStorage.getItem('hiscore');
  if (score) {
    return parseInt(score);
  }
  return 0;
}

export default Game;
