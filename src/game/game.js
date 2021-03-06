class Game extends Phaser.State {
  constructor() {
    super();
  }

  init(numberOfGradation) {
    this.colorSets = [];
    /**
     * Number of colorSets will use in this game level
     * @type {[type]}
     */
    this.numberOfGradation = numberOfGradation;

    /**
     * Tone system manager
     * @type {Engine}
     */
    this.tone = new Engine.Tone(this.game);

    /**
     * MarginTop of triangles matrix
     * @type {Number}
     */
    this.marginTop = 100;

    /**
     * MarginLeft of triangles matrix
     * @type {Number}
     */
    this.marginLeft = 64;

    /**
     * Minimal triangles destroy length
     * @type {Number}
     */
    this.minTrianglesDestroy = 3;

    this.trianglesMatrix = [];
    this.selectedTriangles = [];

    this.score = 0;

    this.triangleMatrixWidth = 25;
    this.triangleMatrixHeight = 9;

    this.lvl = Engine.Lvl.instance;
  }

  create() {
    this.game.stage.backgroundColor = '#000';

    this.createUniverse();
    this.createGradations();

    this.triangleGroup = this.game.add.group();

    this.tone.create();

    this.sketch();
    this.initEvents();
    this.createWave();
    this.createSounds();
    this.createSnakes();
    this.createHintTimer();
    this.createScoreBadge();
    this.createIlluminati();
    this.createScoreLabel();
    this.initializationFullScreen();
    this.createLvlLabel();
    this.createMeteor();

    this.forcePortrait = true;
  }

  render() {
  }

  update() {}

  createScoreBadge() {
    const marginBadge = 35;

    this.scoreBadge = new Engine.ScoreBadge(this.game, 850, 500);

    this.scoreBadge.update = () => {
      this.scoreBadge.x = this.game.input.x;
      this.scoreBadge.y = this.game.input.y - marginBadge;
    }

    this.game.add.existing(this.scoreBadge);
  }

  createSnakes() {
    const snakesPullSize = 30;
    this.snakes = this.game.add.group();

    for (let i = 0; i < snakesPullSize; i++) {
      this.addSnake();
    }
  }

  createSounds() {
    // this.music1 = this.game.sound.add('music1', 1, true);
    // this.music1.play();
  }

  createGradations() {
    let allGradation = Phaser.ArrayUtils.shuffle(ColorSet.GRADATIONS);

    for (let i = 0; i < this.numberOfGradation; i++) {
      let colorSet = new ColorSet(allGradation[i]);
      this.colorSets.push(colorSet);
    }
  }

  createUniverse() {
    /**
     * Rotation speed for second universe
     * @type {Number}
     */
    const secondRotationSpeed = 5;
    const delayForSecondUniverseShow = 500;

    this.universeFirst = new Engine.Universe(this.game);
    this.universeSecond = new Engine.Universe(this.game, secondRotationSpeed);

    this.universeFirst.alpha = 0;
    this.universeSecond.alpha = 0;

    this.game.add.existing(this.universeFirst);
    this.game.add.existing(this.universeSecond);

    this.add.tween(this.universeFirst)
      .to({
        alpha: 1
      })
      .start();

    this.add.tween(this.universeSecond)
      .to({
        alpha: 1
      })
      .delay(delayForSecondUniverseShow)
      .start();
  }

  /**
   * Add score on stage
   */
  createScoreLabel() {
    const randomColorSet = this.game.rnd.pick(this.colorSets);
    const color = '#00E676';
    const marginRight = 15;
    const marginTop = 15;

    const style = {
      font: '42px Open Sans',
      fontStyle: 'italic',
      fill: color
    };

    this.scoreLabel = new Engine.ScoreLabel(
      this.game,
      this.game.width - marginRight,
      marginTop,
      0,
      style
    );
    this.scoreLabel.anchor.setTo(1, 0);
    this.scoreLabel.alpha = 0;

    this.add.tween(this.scoreLabel)
      .to({
        alpha: 1
      })
      .start();

    // TODO: TEMP
    this.scoreLabel.inputEnabled = true;
    this.scoreLabel.events.onInputDown.add(this.toggleFullScreen, this);
  }

  createLvlLabel() {
    const marginRight = 15;
    const marginTop = 0;
    const x = this.game.width - marginRight;
    const y = marginTop + this.scoreLabel.y + this.scoreLabel.height;
    const text = `LvL: ${this.lvl.current}`;
    const style = {
      font: '36px Open Sans',
      fontStyle: 'italic',
      fill: '#FFC107',
    };

    this.lvlLabel = this.add.text(x, y, text, style);
    this.lvlLabel.anchor.setTo(1, 0);
    this.lvlLabel.alpha = 0;

    this.add.tween(this.lvlLabel)
      .to({
        alpha: 1
      })
      .start();
  }

  createIlluminati() {
    const marginTop = 50;
    const x = this.game.world.centerX;
    const y = marginTop;
    const animationTime = 2000;
    const animationType = Phaser.Easing.Linear.None;

    this.ill = new Engine.Illuminati(this.game, x, y);
    this.ill.tint = 0x00E676;

    this.add.tween(this.ill)
      .to({
        x: x + 200,
        alpha: 1
      }, animationTime, animationType)
      .to({
        x: x - 200,
        alpha: 0
      }, animationTime * 2, animationType)
      .to({
        x: x,
        alpha: 1
      }, animationTime, animationType)
      .loop(-1)
      .start();

    this.add.existing(this.ill);
  }

  createHintTimer() {
    const hintTimeout = 20000;
    this.hintTimer = this.game.time.create();

    this.hintTimer.loop(hintTimeout, this.visualisationHint, this);
  }

  createMeteor() {
    const meteorTimerDelay = 20 * 1000;

    this.meteor = new Engine.Meteor(this.game);
    this.game.add.existing(this.meteor);
    this.meteor.sendToBack();
    this.meteor.outOfCameraBoundsKill = true;
    this.meteor.kill();

    this.meteorTimer = this.game.time.create();
    this.meteorTimer.loop(meteorTimerDelay, () => {
      if (this.game.rnd.pick([true, false])) {
        this.runMeteor();
      }
    }, this);
    this.meteorTimer.start();
  }

  createWave() {
    this.wave = new Engine.Wave(this.game, 0, 0);

    this.game.add.existing(this.wave);
  }

  runMeteor() {
    const marginX = this.game.width / 10;
    const marginY = this.game.height / 10;
    const marginRotation = Math.PI / 10;
    let x, y, rotation;
    let side = this.game.rnd.pick(['top', 'left', 'right', 'bottom']);

    switch (side) {
      case 'top':
        x = this.game.rnd.between(marginX, this.game.width - marginX);
        y = 0;
        rotation = this.game.rnd.realInRange(marginRotation, Math.PI - marginRotation);
        break;
      case 'left':
        x = 0;
        y = this.game.rnd.between(marginY, this.game.height - marginY);
        rotation = this.game.rnd.realInRange(-Math.PI / 2 + marginRotation, Math.PI / 2 - marginRotation);
        break;
      case 'right':
        x = this.game.width;
        y = this.game.rnd.between(marginY, this.game.height - marginY);
        rotation = this.game.rnd.realInRange(Math.PI / 2 + marginRotation, Math.PI * 3 / 2 - marginRotation);
        break;
      case 'bottom':
        x = this.game.rnd.between(marginX, this.game.width - marginX);
        y = this.game.height;
        rotation = this.game.rnd.realInRange(marginRotation, -Math.PI + marginRotation);
        break;
    }

    this.meteor.reset(x, y, rotation);
  }

  visualisationHint() {
    let triangle = this.getHintTriangle();

    if (triangle !== undefined)
      triangle.hintMe();
  }

  /**
   * Initialization event in the game
   */
  initEvents() {
    this.game.input.onUp.add(this.destroyTriangle, this);
  }

  /**
   * Create triangles on canvas
   */
  sketch() {
    const delayForDisplay = 500;

    for (let x = 0; x < this.triangleMatrixWidth; x++) {
      this.trianglesMatrix[x] = [];
      for (let y = 0; y < this.triangleMatrixHeight; y++) {
        let posX = x * (Engine.Triangle.size / 2 - 1);
        let posY = y * (Engine.Triangle.size - 1);
        let isRotated = x % 2 === 1;
        let colorSet = this.game.rnd.pick(this.colorSets);

        if (y % 2 === 1) {
          isRotated = !isRotated;
        }

        let triangle = new Engine.Triangle(
          this.game,
          posX,
          posY,
          isRotated,
          colorSet, {
            x,
            y
          }
        );

        triangle.growUp(delayForDisplay + (x + y) * 25);

        triangle.events.onInputOver.add(this.selectTriangle, this);
        triangle.events.onInputDown.add(this.selectTriangle, this);
        triangle.events.deleteComplete.add(this.recoverTriangle, this);

        this.trianglesMatrix[x][y] = triangle;
        // this.add.existing(triangle);
        this.triangleGroup.add(triangle);
      }
    }

    this.centeringMatrix();
  }

  /**
   * Destroy or unselect triangles
   */
  destroyTriangle() {
    this.tone.reset();

    let isUnselect = this.selectedTriangles.length < this.minTrianglesDestroy;

    if (!isUnselect) {
      this.updateScore(Math.pow(this.selectedTriangles.length, 2.15) * 10);
      this.shakeItShakeIt(this.selectedTriangles.length);
      this.hintTimer.stop(false);
      this.hintTimer.start();
    }

    const betweenAnimationDalay = 25;
    const snakeForTriangle = 2;

    for (let i = 0; this.selectedTriangles.length > 0; i++) {
      let triangle = this.selectedTriangles.shift();

      if (isUnselect) {
        triangle.unselect();
      } else {
        triangle.delete(i * betweenAnimationDalay);
        if (this.selectedTriangles.length === 0) {
          this.scoreBadge.hide();
          this.snakesAnimationRun(triangle.world.x, triangle.world.y, triangle.colorSet, Math.floor((i + 1) / snakeForTriangle));
          this.wave.playAnimation(triangle.world.x, triangle.world.y, triangle.isRotated);
        }
      }
    }

    if (!isUnselect) {
      let timerExistMove = this.game.time.create();

      timerExistMove.add(
        Triangle.animationTimeDelete +
        Triangle.animationTimeRecover,
        this.processPosition,
        this
      );

      timerExistMove.start();
    }
  }

  recoverTriangle(triangle) {
    triangle.recover(this.game.rnd.pick(this.colorSets));
  }

  selectTriangle(triangle, point) {
    if (!this.game.input.activePointer.isDown) {
      return;
    }

    if (this.selectedTriangles.length === 0) {
      triangle.select();
      this.selectedTriangles.push(triangle);

    } else {
      let lastSelectedTriangle = this.selectedTriangles[this.selectedTriangles.length - 1];
      let preLastSelectedTriangle = this.selectedTriangles[this.selectedTriangles.length - 2];

      if (triangle.selected && triangle === preLastSelectedTriangle) {
        lastSelectedTriangle.unselect();
        this.selectedTriangles.pop();
        this.newUnselect(this.selectedTriangles.length);
      } else if (!triangle.selected &&
        this.canTriangleLink(lastSelectedTriangle, triangle) &&
        lastSelectedTriangle.colorSet === triangle.colorSet
      ) {
        triangle.select();
        this.selectedTriangles.push(triangle);
        this.newSelect(this.selectedTriangles.length);
      }
    }
  }

  newSelect(count) {
    if (count > this.minTrianglesDestroy - 1) {
      this.scoreBadge.score = Math.round(Math.pow(count, 2.15) * 10);
      this.scoreBadge.show();
    }
    this.tone.up();
  }

  newUnselect(count) {
    if (count < this.minTrianglesDestroy) {
      this.scoreBadge.hide();
    } else {
      this.scoreBadge.score = Math.round(Math.pow(count, 2.15) * 10);
    }
    this.tone.low();
  }

  /**
   * Check triangles link
   */
  canTriangleLink(tr1, tr2) {
    let result = false;
    if (tr1.matrixPos.y === tr2.matrixPos.y) {
      if (tr1.matrixPos.x + 1 === tr2.matrixPos.x ||
        tr1.matrixPos.x - 1 === tr2.matrixPos.x) {
        result = true;
      }
    } else if (tr1.matrixPos.x === tr2.matrixPos.x) {
      if (tr1.matrixPos.x % 2 === 0) {
        if (tr1.isRotated && tr2.matrixPos.y === tr1.matrixPos.y - 1) {
          result = true;
        } else if (!tr1.isRotated && tr2.matrixPos.y === tr1.matrixPos.y + 1) {
          result = true;
        }
      } else {
        if (!tr1.isRotated && tr2.matrixPos.y === tr1.matrixPos.y + 1) {
          result = true;
        } else if (tr1.isRotated && tr2.matrixPos.y === tr1.matrixPos.y - 1) {
          result = true;
        }
      }
    }

    return result;
  }

  initializationFullScreen() {
    this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.RESIZE;
    this.game.scale.onFullScreenChange
      .add(this.resizeScreen, this);
  }

  toggleFullScreen() {
    if (this.game.scale.isFullScreen) {
      this.game.scale.stopFullScreen();
    } else {
      this.game.scale.startFullScreen();
    }
  }

  updateScore(val) {
    val = Math.round(val);

    this.score += val;
    this.scoreLabel.changeValue(this.score);
  }

  resizeScreen() {
    this.scoreLabel.x = this.game.width - 15;
    this.scoreLabel.y = 15;

    this.universeFirst.resize();
    this.universeSecond.resize();

    this.centeringMatrix();
  }

  centeringMatrix() {
    const halfTriangleSize = Engine.Triangle.size / 2;

    this.triangleGroup.x = this.game.width / 2 - this.triangleGroup.width / 2 + halfTriangleSize;
    this.triangleGroup.y = this.game.height / 2 - this.triangleGroup.height / 2 + halfTriangleSize;
  }

  rebuildMap() {
    const timeDelay = 50;

    for (let x = 0; x < this.triangleMatrixWidth; x++) {
      for (let y = 0; y < this.triangleMatrixHeight; y++) {
        let triangle = this.trianglesMatrix[x][y];
        let randomColorSet = this.game.rnd.pick(this.colorSets);

        triangle.updateColor(randomColorSet, x * timeDelay + y * timeDelay);
      }
    }
  }

  processPosition() {
    if (this.getSomeCombination().length === 0) {
      const delayDestroy = 5000;
      let timer = this.game.time.create();

      timer.add(delayDestroy, this.rebuildMap, this);
      timer.start(0);
    }
  }

  getHintTriangle() {
    return this.game.rnd.pick(this.getSomeCombination());
  }

  /**
   * Get existing combination, if we haven't exist move, then return empty array
   */
  getSomeCombination() {
    let usedCell = [];
    let triangles = [];

    for (let x = 0; x < this.triangleMatrixWidth; x++) {
      usedCell[x] = [];
      for (let y = 0; y < this.triangleMatrixHeight; y++) {
        usedCell[x][y] = false;
      }
    }

    for (let x = 0; x < this.triangleMatrixWidth; x++) {
      for (let y = 0; y < this.triangleMatrixHeight; y++) {
        if (!usedCell[x][y] && this.hasCombination(usedCell, this.trianglesMatrix[x][y].colorSet, x, y, 1)) {
          triangles.push(this.trianglesMatrix[x][y]);
        }
      }
    }

    return triangles;
  }

  hasCombination(usedCell, colorSet, x, y, cnt) {
    if (colorSet !== this.trianglesMatrix[x][y].colorSet || usedCell[x][y]) {
      return (cnt > this.minTrianglesDestroy);
    }

    usedCell[x][y] = true;
    if (x + 1 < this.triangleMatrixWidth) {
      if (this.hasCombination(usedCell, colorSet, x + 1, y, cnt + 1)) {
        return true;
      }
    }

    if (x - 1 >= 0) {
      if (this.hasCombination(usedCell, colorSet, x - 1, y, cnt + 1)) {
        return true;
      }
    }

    if (this.trianglesMatrix[x][y].isRotated) {
      if (y - 1 >= 0) {
        if (this.hasCombination(usedCell, colorSet, x, y - 1, cnt + 1)) {
          return true;
        }
      }
    } else {
      if (y + 1 < this.triangleMatrixHeight) {
        if (this.hasCombination(usedCell, colorSet, x, y + 1, cnt + 1)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * ScreeShaker Hero
   */
  shakeItShakeIt(destroyedTriangles) {
    let x = this.triangleGroup.x;
    let y = this.triangleGroup.y;
    let amplitudeY = this.rnd.between(1, destroyedTriangles * 0.9);
    let amplitudeX = this.rnd.between(1, destroyedTriangles * 0.9);
    let timeAnimation = 15;
    let numbersPulse = 10;
    let amplitudePart = Math.sqrt(Math.pow(amplitudeX, 2) + Math.pow(amplitudeY, 2)) / numbersPulse;

    let shakerTween = this.add.tween(this.triangleGroup);

    for (let i = 0; i < numbersPulse; i++) {
      if (i % 2 === 0) {
        shakerTween.to({
          x: x + amplitudeX,
          y: y + amplitudeY
        }, timeAnimation, Phaser.Easing.Linear.None);
      } else {
        shakerTween.to({
          x: x - amplitudeX,
          y: y - amplitudeY
        }, timeAnimation, Phaser.Easing.Linear.None);
      }

      amplitudeX -= amplitudePart;
      amplitudeY -= amplitudePart;
    }

    shakerTween.onComplete.add(() => {
      this.triangleGroup.x = x;
      this.triangleGroup.y = y;
    }, this);
    shakerTween.start();
  }

  snakesAnimationRun(x, y, colorGradation, count) {
    const force = 25;

    for (let i = 0; i < count; i++) {
      let snake = this.snakes.getFirstDead();

      if (snake === null) {
        snake = this.addSnake();
      }

      let angle = (Math.PI * 2) / count * i;
      let impulseX = Math.cos(angle) * force;
      let impulseY = Math.sin(angle) * force;

      snake.run(
        x,
        y,
        this.scoreLabel.world.x,
        this.scoreLabel.world.y,
        impulseX,
        impulseY,
        colorGradation.getRandomColor()
      );
    }
  }

  addSnake() {
    let snake = new Engine.Snake(this.game);
    snake.kill();

    this.snakes.add(snake);

    return snake;
  }
}

Engine.Game = Game;
