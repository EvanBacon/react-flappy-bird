import { PIXI } from 'expo-pixi';
import { Sprite, Container, extras } from 'pixi.js';
import { PixelRatio } from 'react-native';

import setupSpriteSheetAsync from './setupSpriteSheetAsync';
import sprites from './sprites';
import source from '../assets/spritesheet.png';

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

console.log(PIXI);

class Pipe extends FlappySprite {
  constructor(texture) {
    super(texture);
    this.width = Settings.pipeWidth;
    this.height = Settings.pipeHeight;
    this.anchor.set(0.5);
  }
}

class Bird extends PIXI.extras.AnimatedSprite {
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

let localStorage = {
  getItem() {
    return 0;
  },
  setItem() {},
};

class Game {
  pipes = [];
  stopAnimating = false;
  isStarted = false;
  isDead = false;
  score = 0;
  pipeIndex = 0;
  bestScore = 0;

  constructor(context) {
    // Sharp pixels
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    this.app = new PIXI.Application({
      context,
    });
    /*
    this.app.stage.interactive = true;
    this.app.stage.buttonMode = true;
    this.app.stage.on('mousedown', this.beginGame);
    this.app.stage.on('tap', this.beginGame);
    */

    Settings.width = this.app.renderer.width;
    Settings.height = this.app.renderer.height;
    Settings.skyHeight = Settings.height - Settings.groundHeight;
    Settings.pipeHorizontalGap = Settings.width - Settings.pipeWidth - 100;

    this.loadAsync();
  }

  loadAsync = async () => {
    this.textures = await setupSpriteSheetAsync(source, sprites);
    this.onAssetsLoaded();
  };

  onAssetsLoaded = () => {
    this.background = new FlappySprite(this.textures.background);
    this.background.position.x = 0;
    this.background.position.y = 0;
    this.background.width = Settings.width;
    this.background.height = Settings.height;
    this.pipeContainer = new Container();

    this.ground = new PIXI.extras.TilingSprite(
      this.textures.ground,
      Settings.width,
      Settings.groundHeight,
    );
    this.ground.tileScale.set(scale * 2);
    this.ground.position.x = 0;
    this.ground.position.y = Settings.skyHeight;

    const bird_texture_array = [
      this.textures['bird_000'],
      this.textures['bird_001'],
      this.textures['bird_002'],
      this.textures['bird_001'],
    ];
    this.bird = new Bird(bird_texture_array);

    [this.background, this.pipeContainer, this.ground, this.bird].map(child =>
      this.app.stage.addChild(child),
    );

    this.animate();
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
      this.addNewPipe();
    }
    this.bird.speedY = Settings.playerFallSpeed;
  };

  animate = () => {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = undefined;
    }
    if (this.stopAnimating) {
      return;
    }
    this.raf = requestAnimationFrame(this.animate);

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
        this.showDialog();
        this.stopAnimating = true;
      }
    } else {
      if (this.bird.position.y + this.bird.height / 2 > Settings.skyHeight) {
        this.hitPipe();
      }

      for (let i = 0; i < this.pipes.length; i++) {
        let currentPileContainer = this.pipes[i];
        currentPileContainer.pipe.position.x -= Settings.gameSpeed;
        currentPileContainer.pipe2.position.x -= Settings.gameSpeed;

        if (
          i == this.pipes.length - 1 &&
          currentPileContainer.pipe.position.x <= Settings.pipeHorizontalGap
        ) {
          this.addNewPipe();
        }

        if (
          currentPileContainer.pipe.position.x ==
          Settings.playerHorizontalPosition
        ) {
          this.updateScore();
        }

        if (
          currentPileContainer.pipe.position.x + Settings.pipeWidth / 2 >=
            Settings.playerHorizontalPosition - this.bird.width / 2 &&
          currentPileContainer.pipe.position.x - Settings.pipeWidth / 2 <=
            Settings.playerHorizontalPosition + this.bird.width / 2
        ) {
          if (
            this.bird.position.y - this.bird.height / 2 <
              currentPileContainer.upper ||
            this.bird.position.y + this.bird.height / 2 >
              currentPileContainer.lower
          ) {
            this.hitPipe();
          }
        }
      }
    }
  };

  restart = () => {
    this.isStarted = false;
    this.isDead = false;
    this.stopAnimating = false;
    this.pipeIndex = 0;
    this.score = 0;
    this.onScore(this.score);
    this.bird.restart();
    this.pipeContainer.children = [];
    this.pipes = [];
    this.animate();
  };

  hitPipe = () => {
    this.bird.stop();
    this.isDead = true;
  };

  updateScore = () => {
    this.score += 1;
    this.onScore(this.score);
    //TODO: UPDATE UI
  };

  addNewPipe = () => {
    const pipeGroup = {};
    const pipe = new Pipe(this.textures.pipe);
    const pipe2 = new Pipe(this.textures.pipe);
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
    pipe.position.x = pipe2.position.x = 600 * scale;

    pipeGroup.upper = pipe.position.y + pipe.height / 2;
    pipeGroup.lower = pipeGroup.upper + Settings.pipeVerticalGap;
    pipeGroup.pipe = pipe;
    pipeGroup.pipe2 = pipe2;

    this.pipeContainer.addChild(pipe);
    this.pipeContainer.addChild(pipe2);
    this.pipeIndex += 1;
    if (this.pipeIndex > 3) {
      this.pipes.shift();
    }

    this.pipes.push(pipeGroup);
  };

  showDialog = () => {
    const storeHi = localStorage.getItem('hiscore');

    if (storeHi > this.bestScore) {
      this.bestScore = storeHi;
    }

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('hiscore', this.bestScore);
    }
  };
}

export default Game;
