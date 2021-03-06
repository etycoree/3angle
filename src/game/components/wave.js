class Wave extends Phaser.Sprite {
  constructor(game, x, y) {
    super(game, x, y, Wave.bitmapKey, 0);

    this.anchor.setTo(0.5);

    this.alpha = 0;
    this.width = Engine.Triangle.size / 2;
    this.height = Engine.Triangle.size / 2;
  }

  playAnimation(x, y) {
    const animationTime = 200;
    this.alpha = 1;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.width = Engine.Triangle.size / 2;
    this.height = Engine.Triangle.size / 2;

    let tweenSize = this.game.add.tween(this)
      .to({
        width: Engine.Triangle.size * Wave.sizeRatio,
        height: Engine.Triangle.size * Wave.sizeRatio,
      }, animationTime);

    let tweenDestroy = this.game.add.tween(this)
      .to({alpha: 0}, animationTime)
      .onUpdateCallback(() => {
        if (this.frame === Wave.countFrameAnimation - 1) {
          this.alpha = 0;
        }
        this.frame++;
      }, this);

    tweenSize.chain(tweenDestroy);
    tweenSize.start();
  }

  static generateAtlasData() {
    let atlasData = {
      frames: []
    };

    const size = Engine.Triangle.size * Wave.sizeRatio;
    const lineSize = 15;
    const spriteSheetWidth = Wave.countFrameAnimation;

    let bitmap = Engine.game.make.bitmapData(size * spriteSheetWidth, size);
    bitmap.ctx.strokeStyle = '#e9e9e9';

    for (let x = 0; x < spriteSheetWidth; x++) {
      atlasData.frames[x] = {
        frame: {
          x: x * size,
          y: 0,
          w: size,
          h: size,
        }
      };

      bitmap.ctx.lineWidth = lineSize / (1 + x);
      bitmap.ctx.moveTo(size + x * size - lineSize / 2, size / 2);

      let radius = size / 2 - lineSize / 2;

      bitmap.ctx.ellipse(
        size / 2 + x * size,
        size / 2,
        radius,
        radius,
        0,
        0,
        Math.PI * 2
      );
      bitmap.ctx.stroke();
    }

    return {
      bitmap,
      atlasData,
    };
  }
}

Wave.sizeRatio = 3.5;
Wave.bitmapKey = 'wave';
Wave.countFrameAnimation = 12;

Engine.Wave = Wave;
