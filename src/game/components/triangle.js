class Triangle extends Phaser.Sprite {

  /**
   * It's a triangle, yash it's not a joke
   * @param  {Phaser.Game}  game      [description]
   * @param  {[type]}  x         [description]
   * @param  {[type]}  y         [description]
   * @param  {Boolean} isRotated [description]
   * @param  {Number}  color     [description]
   */
  constructor(game, x, y, isRotated, colorSet, matrixPosition) {
    super(game, x, y, Engine.game.cache.getBitmapData(Engine.keys.triangle));

    this.width = Triangle.size;
    this.height = Triangle.size;
    this.anchor.setTo(0.5);
    this.colorSet = colorSet;
    this.tint = this.colorSet.getRandomColor();

    /**
     * Poition in the matrix of triangles
     * @type {[type]}
     */
    this.matrixPos = matrixPosition;

    this.inputEnabled = true;
    this.input.pixelPerfectOver = true;
    this.input.pixelPerfectClick = true;

    this.events.deleteComplete = new Phaser.Signal();

    this.selected = false;
    this.isRotated = isRotated;

    if (isRotated) {
      this.rotation = Math.PI;
    }

    // this.addTextPosition();
  }

  addTextPosition() {
    let text = new Phaser.Text(
      this.game,
      Triangle.size / 2,
      Triangle.size / 2,
      `${this.matrixPos.x}:${this.matrixPos.y}`,
      {
        font: '64px Open Sans',
        fill: 'black'
      }
    )

    if (this.isRotated) {
      text.rotation += Math.PI;
      text.y = +text.height;
    } else {
      text.x = -text.width / 2;
      text.y = -text.height / 4;
    }

    this.addChild(text);
  }

  select() {
    if (!this.selected) {
      this.selected = true;

      this.game.add.tween(this)
        .to({
          width: Triangle.size / 1.5,
          height: Triangle.size / 1.5
        }, Triangle.animationTimeSelect)
        .start();
      }
  }

  unselect() {
    if (this.selected) {

      this.game.tweens.remove(this);
      this.selected = false;

      this.game.add.tween(this)
        .to({
          width: Triangle.size,
          height: Triangle.size
        }, Triangle.animationTimeSelect)
        .start();
      }
  }

  delete() {
    if (this.game.input.activePointer.isDown) {
      this.game.add.tween(this)
        .to({
          width: 0,
          height: 0,
          alpha: 0
        }, Triangle.animationTimeDelete)
        .start()
        .onComplete
        .add(() => {
          this.events.deleteComplete.dispatch(this);
        }, this);
    }
  }

  recover(colorSet) {
    this.colorSet = colorSet;
    this.tint = this.colorSet.getRandomColor();
    this.width = Triangle.size;
    this.height = Triangle.size;
    this.selected = false;

    this.game.add.tween(this)
      .to({
        alpha: 1
      }, Triangle.animationTimeRecover, Phaser.Easing.Bounce.Out)
      .start();
  }

  updateColor(colorSet, delay = 0) {
    const animationTime = 1000;
    this.colorSet = colorSet;

    let hideTween = this.game.add.tween(this)
      .to({
        alpha: 0
      }, animationTime);

    let showTween = this.game.add.tween(this)
      .to({
        alpha: 1
      }, animationTime);

    hideTween
      .onComplete
      .add(() => {
        this.tint = this.colorSet.getRandomColor();
      }, this);

    hideTween.delay(delay);

    hideTween.chain(showTween);
    hideTween.start();
  }

  blink() {
    const lastColor = this.tint;
    let tween = this.game.add.tween(this);

    tween.to({
        alpha: 2
      }, 100)
      .onComplete
      .add(() => {
        this.tint = lastColor;
        Triangle.blinks = [];
      }, this);

    tween.onStart
      .add(() => {
        this.alpha = 0;
        this.tint = 0x00FF00;
      }, this);

    if (Triangle.blinks.length === 0) {
      Triangle.blinks.push(tween);
      tween.start();
    } else {
      let lastBlink = Triangle.blinks[Triangle.blinks.length - 1];
      lastBlink.chain(tween);
      Triangle.blinks.push(tween);
    }
  }
}

Triangle.size = 71;
Triangle.blinks = [];
Triangle.animationTimeSelect = 200;
Triangle.animationTimeDelete = 200;
Triangle.animationTimeRecover = 1000;
Engine.Triangle = Triangle;
