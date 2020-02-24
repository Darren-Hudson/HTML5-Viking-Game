var controller, player, loop;

//Defining controller class
controller =
{
    left:{active:false, state:false},
    right:{active:false, state:false},
    up:{active:false, state:false},
    down:{active:false, state:false},
    attack:{active:false, state: false},
    //Is called every frame to listen for keyboard events
    keyListener:function(e)
    {
      var keyState = (e.type == 'keydown')?true:false;

      switch (e.keyCode) {
        case 37:
          if(controller.left.state != keyState){controller.left.active = keyState;
          controller.left.state = keyState};
          break;
        case 38:
        if(controller.up.state != keyState ){controller.up.active = keyState;
        controller.up.state = keyState};
          break;
        case 39:
        if(controller.right.state != keyState ){controller.right.active = keyState;
        controller.right.state = keyState};
          break;
        case 40:
          controller.down.state = keyState;
          break;
        case 76:
        if (controller.attack.state !=keyState){controller.attack.active =keyState;
        controller.attack.state = keyState; controller.attack.frames = 4};
          break;
      }
    }
};

//Defining animation class
var Animation = function(frameSet, delay)
{
  this.count=0;
  this.delay= delay;
  this.frame=0;
  this.frameIndex=0;
  this.frameSet= frameSet;
  this.change = function(frameSet, delay =15)
  {
    if(this.frameSet != frameSet){
      this.count=0;
      this.delay= delay;
      this.frameIndex=0;
      this.frameSet= frameSet;
      this.frame=this.frameSet[this.frameIndex];
    }
  }
};

//Instantiates animation class and adds change() and update() functions
Animation.prototype = {
  //changes the keyframe set being displayed
  change:function (frameSet, delay =15) {
    if(this.frameSet != frameSet){
      this.count=0;
      this.delay= delay;
      this.frameIndex=0;
      this.frameSet= frameSet;
      this.frame=this.frameSet[this.frameIndex];
    }
  },
//Updates animation keyframe every frame.
  update:function() {
    this.count ++;
    if(this.count >= this.delay){
      this.count = 0;
      this.frameIndex = (this.frameIndex == this.frameSet.length -1)?0:this.frameIndex +1;
      this.frame = this.frameSet[this.frameIndex];
    }
  }
};
var players = [player1 = new player("player1",27,14,20,0,true),player2 = new player("player2",27,14,50,0, false)];

var buffer, display, resize, render, spriteSheet;

//Defining buffer and display
buffer = document.createElement("canvas").getContext("2d");
display = document.querySelector("canvas").getContext("2d");

//Player class constructor
function player (name,height,width,x, y,facingRight)
{
  this.name = name;
  this.animation=new Animation();
  this.hp=100;
  this.height=height;
  this.width= width;
  this.jumping=true;
  this.attacking = false;
  this.hit = false;
  this.facingRight = facingRight;
  this.x=x,
  this.xVelocity=0,
  this.y=y,
  this.yVelocity=0,
  this.damage = 10;
};

spriteSheet =
{
  frameSets: [[0,1],[2,3],[6,7],[4,5],[8,9,10,11],[12,13,14,15],[17,16]],
  image:new Image()
};

//Loop is called every frame
loop = function(timeStamp)
{
  controllerCheck();
  
  players.forEach(el =>
    {
      physicsCheck(el);
      opponentCheck();
      el.animation.update();
      collisionCheck(el);
    })
  render();
  window.requestAnimationFrame(loop);

};

var controllerCheck = function()
{
  //Jump only if player isnt already jumping
  if (controller.up.active && player1.jumping == false){
    controller.up.active = false;
    player1.yVelocity -= 2.5;
    player1.jumping = true;
  }
  //Check for left input
  if (controller.left.active){
    player1.animation.change(spriteSheet.frameSets[2],15);
    player1.facingRight = false;
    player1.xVelocity -=0.05;
  }
  //Check for right input
  if(controller.right.active){
    player1.animation.change(spriteSheet.frameSets[3],15);
    player1.facingRight = true;
    player1.xVelocity +=0.05;
  }
  //Idle animation plays when not attacking or moving.
  if(!controller.right.active&&!controller.left.active && !player1.attacking){
    if(player1.facingRight){
    player1.animation.change(spriteSheet.frameSets[0],15);}
    else{
      player1.animation.change(spriteSheet.frameSets[1],15)
    }
  }
  //Plays attack animation
  if (controller.attack.active && !player1.attacking){
    controller.attack.active = false;
    if(player1.facingRight){
    player1.animation.change(spriteSheet.frameSets[4],5);}
    else{player1.animation.change(spriteSheet.frameSets[5],5);}
    player1.attacking = true;
  }
  //Sets player.attack to false on last frame of animation
  if (player1.attacking && player1.animation.frameIndex == player1.animation.frameSet.length -1)
  {
    player1.attacking = false;
  }
  
  
}
var physicsCheck = function(character)
{
  character.yVelocity += 0.25;
  character.x += character.xVelocity;
  character.y += character.yVelocity;
  character.xVelocity *= 0.91;
  character.yVelocity *= 0.91;

  if(character.y + character.height > buffer.canvas.height-2)
  {
    character.jumping = false;
    character.y = buffer.canvas.height-2-character.height;
    character.yVelocity=0;
  }
}
var collisionCheck = function(character)
{
  // Keeps characters from going offscreen
  if (character.x < 0)
  {
    character.x = 0;
  }
  else if(character.x > buffer.canvas.width- character.width)
  {
    character.x = buffer.canvas.width-character.width;
  }
  // Checks Player to player collision
  if(player1.x+player1.width >= player2.x)
  {
    if(player1.attacking && player1.animation.frameIndex == 2 && player1.animation.count == 0){
      player2.hp -= player1.damage;
      player2.hit = true;
    }
    player1.x = player2.x-player1.width;
  }
}
var opponentCheck=function()
{
  if(player2.facingRight && !player2.hit){
   player2.animation.change(spriteSheet.frameSets[0],15);}
  else if (!player2.hit){player2.animation.change(spriteSheet.frameSets[1],15);}
  if(player2.hit){
    player2.animation.change(spriteSheet.frameSets[6],10)
    if (player2.animation.frameIndex == player2.animation.frameSet.length -1)
    {
      player2.hit = false;
    }
  }
  if(player2.hp <= 0)
  {
    players.splice(1,1);
  }
}

//Draws canvas every frame
render = function(){
    buffer.fillStyle = "#ffffff";
    buffer.fillRect(0,0,buffer.canvas.width,buffer.canvas.height);
    buffer.fillStyle = "#000000"
    // buffer.fillText(player1.hp.toString(),0,10);
    // buffer.fillText(player2.hp.toString(),buffer.canvas.width-20,10)
    players.forEach(element => {
      buffer.drawImage(spriteSheet.image,element.animation.frame * 27,0,27,27,Math.floor(element.x),Math.floor(element.y),27,27);
      if (element.name ==="player2")
      {
        buffer.fillText(player2.hp.toString(),buffer.canvas.width-20,10)
      }
      else
      {
        buffer.fillText(element.hp.toString(),0,10);
      }
    });
    
    display.drawImage(buffer.canvas,0,0,buffer.canvas.width,buffer.canvas.height,0,0,display.canvas.width,display.canvas.height);
  };

//Resises canvas
resize = function()
{
    display.canvas.width = document.documentElement.clientWidth -32;
    if(display.canvas.width >document.documentElement.clientHeight){
      display.canvas.width = document.documentElement.clientHeight;
    }
     display.canvas.height = display.canvas.width * 0.5;
     display.imageSmoothingEnabled = false;
};

//Setting buffer dimensions
buffer.canvas.width = 120;
buffer.canvas.height = 60;

//Adding event listeners
window.addEventListener("resize",resize);
window.addEventListener("keydown",controller.keyListener);
window.addEventListener("keyup",controller.keyListener);

//Calls resize function
resize();

//Requests animation frame on loading of spritesheet
spriteSheet.image.addEventListener("load", function(event){
  window.requestAnimationFrame(loop);
});

//
spriteSheet.image.src = "animation.png";
