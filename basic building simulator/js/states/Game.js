var HTown = HTown || {};

HTown.GameState = {

  init: function() {
    //game constans
      this.STEP = 2;

    //no gravity in a top-down game
    this.game.physics.arcade.gravity.y = 0;

  },
  create: function() {

    //grass floor
    this.background = this.add.tileSprite(0,0, 1200, 800, 'grass');
    this.game.world.setBounds(0, 0, 1200, 800);
    
    //crating a buildiungs
    this.buildings = this.add.group();
      
    var house = new HTown.Building(this, 100, 100, {asset: 'house', housing: 120});
    this.buildings.add(house);
    
    var farm = new HTown.Building(this, 100, 200, {asset: 'crops', food: 130});
    this.buildings.add(farm);
      
    var factory = new HTown.Building(this, 100, 300, {asset: 'factory', jobs: 100});
    this.buildings.add(factory);
    
    //creating a town
    this.town = new HTown.TownModel({}, {population: 100, food: 200, money:  100},this.buildings);
    
    //update simulation
    this.simulationTimer = this.game.time.events.loop(Phaser.Timer.SECOND * this.STEP, this.simulationStep, this);
      
    this.initGui();
  },
  update: function() {
      
      if(!this.isDraggingMapBlocked){
          //start dragging
          if(!this.isDraggingMap){
              if(this.game.input.activePointer.isDown){
                  this.isDraggingMap = true;
                  
                  this.startDragPoint = {};
                  this.startDragPoint.x = this.game.input.activePointer.position.x;
                  this.startDragPoint.y = this.game.input.activePointer.position.y;
              }
          }
          else{
                this.endDragPoint = {};
                this.endDragPoint.x = this.game.input.activePointer.position.x;
                this.endDragPoint.y = this.game.input.activePointer.position.y;
              
                //defining a camera position
                this.game.camera.x += this.startDragPoint.x - this.endDragPoint.x;
                this.game.camera.y += this.startDragPoint.y - this.endDragPoint.y;
              
                //after update, take new startomg point so the camera will update again
                this.startDragPoint.x = this.game.input.activePointer.position.x;
                this.startDragPoint.y = this.game.input.activePointer.position.y;
              
                //stop dragging map wgen you relecse the active pointer
                if(this.game.input.activePointer.isUp){
                    this.isDraggingMap = false;
                }
                    
          }
      }
      
      if(this.isBuildingBtnActive && this.game.input.activePointer.isDown){
          //we can no longer drag the map
          this.isDraggingMapBlocked = true;
          
          //we'll start dragging the shadow building
          this.isDragginsBuilding = true;
      }
      
      if(this.isDragginsBuilding){
          var pointerWX = this.game.input.activePointer.worldX;
          var pointerWY = this.game.input.activePointer.worldY;
          
          if(!this.shadowBuilding || !this.shadowBuilding.alive){
              this.shadowBuilding = this.add.sprite(pointerWX, pointerWY, this.selectedBuilding.asset);
              this.shadowBuilding.alpha = 0.5;
              this.shadowBuilding.anchor.setTo(0.5);
              
              //enable physics
              this.game.physics.arcade.enable(this.shadowBuilding);
          }
          this.shadowBuilding.x = pointerWX;
          this.shadowBuilding.y = pointerWY;
      }
      if(this.isDragginsBuilding && this.game.input.activePointer.isUp){
          if(this.canBuild()){
          this.town.stats.money -=this.selectedBuilding.cost;
          
          this.createBuilding(this.game.input.activePointer.worldX, this.game.input.activePointer.worldY, this.selectedBuilding);
          }
          this.clearSelection();
      }

  },
    
    simulationStep: function(){
        this.town.step();
        this.refreshStats();
    },
    
    initGui: function (){
        //style for labels
        var style = {font: '14px Arial', fill: '#fff'};
        
        //money
        this.moneyIcon = this.add.sprite(10, 7, 'money');
        this.moneyIcon.fixedToCamera = true;
        
        this.moneyLabel = this.add.text(45, 15, '0', style);
        this.moneyLabel.fixedToCamera = true;
        
        //food
        this.foodIcon = this.add.sprite(100, 5, 'food');
        this.foodIcon.fixedToCamera = true;
        
        this.foodLabel = this.add.text(135, 15, '0', style);
        this.foodLabel.fixedToCamera = true;
        
        //population
        this.populationIcon = this.add.sprite(190, 7, 'population');
        this.populationIcon.fixedToCamera = true;
        
        this.populationLabel = this.add.text(225, 15, '0', style);
        this.populationLabel.fixedToCamera = true;
        
        //jobs
        this.jobsIcon = this.add.sprite(280, 7, 'jobs');
        this.jobsIcon.fixedToCamera = true;
        
        this.jobsLabel = this.add.text(315, 15, '0', style);
        this.jobsLabel.fixedToCamera = true;
        
        //button data
        this.buttonData = JSON.parse(this.game.cache.getText('buttonData'));
        
        //button group
        this.buttons = this.add.group();
        
        var button
        this.buttonData.forEach(function(element, index){
            button = new Phaser.Button(this.game, this.game.width - 60 - 60 * index, this.game.height - 60, element.btnAsset, this.clickBuildBtn, this);
            button.fixedToCamera = true;
            this.buttons.add(button);
            
            //pass the data of the button
            button.buildingData = element;
        },this)
        
        //showing all stats at the start of the game
        this.refreshStats();
    },
    
    refreshStats: function(){
        this.moneyLabel.text = Math.round(this.town.stats.money);
        
        this.foodLabel.text = Math.round(this.town.stats.food);
        this.populationLabel.text = Math.round(this.town.stats.population) + '/' + Math.round(this.town.stats.housing);
        this.jobsLabel.text = Math.round(this.town.stats.jobs);
    },
    
    clickBuildBtn: function(button){
        this.clearSelection();
        
        //check if the user can afford the building
        if(this.town.stats.money >= button.buildingData.cost){
            button.alpha = 0.5;
            this.selectedBuilding = button.buildingData;
            this.isBuildingBtnActive = true;
        }
    },
    
    clearSelection(){
        this.isDraggingMapBlocked = false;
        this.isDraggingMap = false;
        this.isBuildingBtnActive = false;
        this.selectedBuilding = null;
        this.isDragginsBuilding = false;
        
        if(this.shadowBuilding){
            this.shadowBuilding.kill();
        }
        
        this.refreshStats();
        
        this.buttons.setAll('alpha', 1);
    },
    
    
    createBuilding: function(x, y, data){
        var newBuilding = new HTown.Building(this, x, y, data);
        this.buildings.add(newBuilding);
    },
    
    canBuild:function(){
        var isOverlappingBuildings = this.game.physics.arcade.overlap(this.shadowBuilding, this.buildings);
        
        return !isOverlappingBuildings;
    }
};
