var HTown = HTown || {};

HTown.Building = function(state, x, y, data) {
  Phaser.Sprite.call(this, state.game, x, y, data.asset);

  this.game = state.game;
  this.state = state;

  //init stats
    this.food = data.food;
    this.jobs = data.jobs;
    this.housing = data.housing;



  this.anchor.setTo(0.5);

  //init physics
  this.game.physics.arcade.enable(this);
};

HTown.Building.prototype = Object.create(Phaser.Sprite.prototype);
HTown.Building.prototype.constructor = HTown.Building;