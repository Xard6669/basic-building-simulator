var HTown = HTown || {};

HTown.TownModel = function(coefs, initialStats, buildings){

    //basic stats with was included at begining
    this.stats = {}
    this.stats.population = initialStats.population;
    this.stats.food = initialStats.food;
    this.stats.money = initialStats.money;
    
    //co efficent stats which will work on keepiong the economy
    this.coefs = {};
    this.coefs.populationGrowth = this.coefs.populationGrowth || 1.02;
    this.coefs.foodConsumption = this.coefs.foodConsumption || 1;
    this.coefs.productivityPerPerson = this.coefs.productivityPerPerson || 0.5;
    
    //buildings stats object
    this.buildings = buildings;
    
    this.updateBuildingProduction();
    
};

HTown.TownModel.prototype.step = function(){
    
    //update building production
    this.updateBuildingProduction();
    
    //population
    this.stats.population = this.stats.population * this.coefs.populationGrowth;
    
    //population can't be grater then number if housing space
    this.stats.population = Math.min(this.stats.population, this.stats.housing);
    
    //update food new food = old food + food prod - food consumption
    this.stats.food -= this.stats.population * this.coefs.foodConsumption;
    
    //if food is negative, decrese population
    if(this.stats.food < 0) {
        this.stats.population += this.stats.food / this.coefs.foodConsumption;
    }
    
    //industtrial output
    this.stats.money += Math.min(this.stats.population, this.stats.jobs) * this.coefs.productivityPerPerson;
    
    console.log(this.stats);
};

HTown.TownModel.prototype.updateBuildingProduction = function(){
    //housing stats
    this.stats.housing = 0;
    this.stats.jobs = 0;
    
    this.buildings.forEach(function(building){
        if(building.housing){
            this.stats.housing += building.housing;
        }
        
        if(building.food){
            this.stats.food += building.food;
        }
        
        if(building.jobs){
            this.stats.jobs += building.jobs;
        }
    },this)
    
}