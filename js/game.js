// global variables

var mainMusic;
var jumpMusic;
var fallMusic;
var flag = 45;
var girl = girl || {};
var speedPlayer = 2;
var speedChanger = 1000;
var playerName = "Anonymous";
var playerNumber = 1;
var themeNumber = 1;
var sounds = 1;
var level = 1;

if (localStorage["Player_Hurry"] != undefined)
{
    playerNumber = parseInt(localStorage["Player_Hurry"]);
}

if (localStorage["Theme_Hurry"] != undefined)
{
    themeNumber = parseInt(localStorage["Theme_Hurry"]);
}


if (localStorage["Sounds_Hurry"] != undefined)
{
    sounds = parseInt(localStorage["Sounds_Hurry"]);//0 for off and 1 for on
}
    


window.onload = function() {
    // entry point
  
   mainMusic = document.getElementById("main_music");
   jumpMusic = document.getElementById("jump");
   fallMusic = document.getElementById("fall");
   
  girl.game = new girl.Game();
 
    // startup page of game

  var startButton = document.getElementById('start-btn');
  startButton.onclick = function ()
  {
      if (document.getElementById('playerName').value == "")
      {
          document.getElementById('playerName').focus();
      }
      else
      {
          playerName = document.getElementById('playerName').value;
          var menuScene = document.getElementById('menu');
          menuScene.classList.add('hidden');
         
          if (sounds == 1)
          {
              
              mainMusic.play();
          }

          girl.game.initGame();

      }

  }
    //restart page of game

    var restartButton = document.getElementById('restart-btn');
    restartButton.onclick = function ()
    {
        var gameoverScene = document.getElementById('gameover');
        gameoverScene.classList.add('hidden');
        speedChanger = 1000;
        speedPlayer = 2;
        if (sounds == 1)
        {
        
            mainMusic.play();
        }
        girl.game.initGame();
        createjs.Ticker.setPaused(false);
    }

 };



girl.Preloader = (function () {
    // constructor--- this will not be visible to user because of startup page---
    function Preloader(game)
    {
        this.game = game;

        var bg = new createjs.Shape();
        bg.graphics.beginFill("#000");
        bg.graphics.rect(0, 0, game.stage.canvas.width, game.stage.canvas.height);
        this.addChild(bg);

        var progressBar = new createjs.Shape();
        progressBar.graphics.beginFill("#333");
        this.addChild(progressBar);
        this.progressBar = progressBar;

        var percentageText = new createjs.Text("loading...0", "32px sans-serif", "#999");
        percentageText.x = game.stage.canvas.width / 2;
        percentageText.y = game.stage.canvas.height / 2;
        percentageText.textAlign = "center";
        percentageText.textBaseline = "middle";
        this.addChild(percentageText);
        this.percentageText = percentageText;
    };

    Preloader.prototype = new createjs.Container();

    Preloader.prototype.loadGraphics = function ()
    {
        var imagesList = [
          { name: "coin", path: "images/coins.png" },
          { name: "obstacle", path: "images/fire.png" },
          { name: "platform", path: "images/platform.png" },
          { name: "platformLeft", path: "images/platform-left.png" },
          { name: "platformRight", path: "images/platform-right.png" },
          { name: "platformMiddle", path: "images/platform-middle.png" },
          { name: "hero", path: "images/running1.png" },
          { name: "trees", path: "images/theme1.png" },
        ];

        girl.graphics = {};

        var totalFiles = imagesList.length;
        var loadedFiles = 0;
        for (var i = 0, len = totalFiles; i < len; i++)
        {
            imageToLoad = imagesList[i];
            var img = new Image();
            // make sure we have onload event declaring before setting the src property.
            img.onload = (function (event)
            {
                loadedFiles++;
                console.log('loaded', event, loadedFiles, '/', totalFiles)

                this.updateProgress(loadedFiles / totalFiles);

                if (loadedFiles >= totalFiles)
                {
                    this.game.stage.removeChild(this);
                    var menuScene = document.getElementById('menu');
                    menuScene.classList.remove('hidden');
                }
            }).bind(this);

           // console.log("loading: ", imageToLoad.path);
            img.src = imageToLoad.path;

            girl.graphics[imageToLoad.name] = imageToLoad;
        };
    }

    Preloader.prototype.updateProgress = function (percentage)
    {
        var width = percentage * this.game.stage.canvas.width;
        this.progressBar.graphics.rect(0, 0, width, this.game.stage.canvas.height);
        this.percentageText.text = "loading..." + Math.round(percentage * 100);
        this.game.stage.update();
    }


    return Preloader;

})();





girl.CommonShapes = (function () {

    function CommonShapes() { }

    // draw a rectangle with given styling.
    CommonShapes.rectangle = function (rect)
    {
        // defualt value for non-defined parameters.
        rect.strokeThickness = rect.strokeThickness || 0;
        rect.strokeColor = rect.strokeColor || "#000";
        rect.fillColor = rect.fillColor || "#000";
        rect.x = rect.x || 0;
        rect.y = rect.y || 0;
        rect.width = rect.width || 0;
        rect.height = rect.height || 0;

        // drawing the shape
        var shape = new createjs.Shape();
        if (rect.strokeThickness > 0) {
            shape.graphics.setStrokeStyle(rect.strokeThickness);
            shape.graphics.beginStroke(rect.strokeColor);
        }
        shape.graphics.beginFill(rect.fillColor);
        shape.graphics.rect(rect.x, rect.y, rect.width, rect.height);
        return shape;
    };

    return CommonShapes;
})();


girl.GameObject = (function () {
    function GameObject()
    {
        this.initialize();
    };

    var p = GameObject.prototype = new createjs.Container();

    // instance variables
    // what kind of this game object?
    p.category = 'object';

    // dimension
    p.width = 0;
    p.height = 0;

    // mark the game object to be outside of screen
    // useful for collision checking within screen only.
    p.isOutsideOfScreen = false;

    // reference the super initialize
    // before overriding the initialize method.
    p.Container_initialize = p.initialize;
    p.initialize = function ()
    {
        this.Container_initialize();
    }

    p.hitPoint = function (point)
    {
        if (point.x >= 0 && point.x <= this.width && point.y >= 0 && point.y <= this.height)
        {
            return true;
        }
        return false;
    }

    return GameObject;

})();




girl.MovableGameObject = (function () {

    function MovableGameObject()
    {
        this.initialize();
    };

    var p = MovableGameObject.prototype = new girl.GameObject();

    p.GameObject_initialize = p.initialize;
    p.initialize = function ()
    {
        this.GameObject_initialize();

        this.velocity = new createjs.Point(0, 0);

        // how fast it goes downward?
        this.dropSpeed = 1;

        // is this game object stands on any ground (platform)?
        this.onGround = false;

        // Give heartbeat to MovableGameObject
        createjs.Ticker.addListener(this, /*pausable=*/ true);
    }

    p.tick = function (timeElapsed)
    {
        // apply gravity
        this.velocity.y += this.dropSpeed;
        this.velocity.y = Math.min(this.velocity.y, 5); // bound to max velocity
    };

    return MovableGameObject;

})();



girl.Platform = (function () {

    function Platform(width)
    {
        this.initialize(width);
    }

    var p = Platform.prototype = new girl.GameObject();

    p.category = 'platform';

    p.GameObject_initialize = p.initialize;
    p.initialize = function (width)
    {
        this.GameObject_initialize();

        this.width = width || 120;
        this.height = 12;

        // variable width with graphics
        if (width === 120)
        {
            var image = new createjs.Bitmap("images/platform.png");
            this.addChild(image);
        }
        else if (width > 120)
        {
            var imageLeft = new createjs.Bitmap("images/platform-left.png");
            this.addChild(imageLeft); // width 57
            var imageRight = new createjs.Bitmap("images/platform-right.png");
            this.addChild(imageRight); // width 62
            var imageMiddle = new createjs.Bitmap("images/platform-middle.png");
            this.addChild(imageMiddle);

            // place them in correct place.
            imageMiddle.x = 57;
            imageMiddle.scaleX = width - 57 - 62;
            imageRight.x = imageMiddle.x + imageMiddle.scaleX;
        }
    }

    return Platform;
})();


girl.Obstacle = (function () {
    function Obstacle()
    {
        this.initialize();
    }

    var p = Obstacle.prototype = new girl.GameObject();

    p.category = 'obstacle';

    p.width = 20;
    p.height = 28;

    // put registration point to the bottom center.
    p.regX = p.width / 2;
    p.regY = p.height;

    p.GameObject_initialize = p.initialize;
    p.initialize = function ()
    {
        this.GameObject_initialize();

        // copy from zoe exported obstacle.json file.
        // frame: [x, y, width, height, imageIndex, regX, regY]
        var spritesheetData = { "images": ["images/fire.png"], "frames": [[1, 17, 12, 14, 0, 0, 0], [15, 15, 16, 16, 0, 0, 0], [32, 13, 20, 18, 0, 0, 0], [53, 14, 22, 17, 0, 0, 0], [78, 8, 20, 23, 0, 0, 0], [98, 1, 23, 30, 0, 0, 0]], "animations": { "all": { "frames": [0, 1, 2, 3, 4, 5], frequency: 5 } } }
        var spritesheet = new createjs.SpriteSheet(spritesheetData);
        this.animation = new createjs.BitmapAnimation(spritesheet);
        this.animation.gotoAndPlay("all");

        this.addChild(this.animation);
    }

    return Obstacle;
})();


girl.Coin = (function () {
    function Coin()
    {
        this.initialize();
    }
    var p = Coin.prototype = new girl.GameObject();

    // instance variables
    p.category = 'coin';

    p.width = 10;
    p.height = 24;

    // put registration point to the bottom center.
    p.regX = p.width / 2;
    p.regY = p.height;

    p.GameObject_initialize = p.initialize;
    p.initialize = function ()
    {
        this.GameObject_initialize();


        // copy from zoe exported coin.json file.
        // frame: [x, y, width, height, imageIndex, regX, regY]
        var spritesheetData = { "images": ["images/coins.png"], "frames": [[4, 0, 27, 25, 0, 0, 0], [38, 0, 22, 25, 0, 0, 0], [77, 0, 16, 25, 0, 0, 0], [111, 0, 10, 25, 0, 0, 0], [147, 0, 7, 25, 0, 0, 0], [178, 0, 11, 25, 0, 0, 0], [208, 0, 17, 25, 0, 0, 0], [238, 0, 24, 25, 0, 0, 0], [268, 0, 28, 25, 0, 0, 0], [300, 0, 30, 25, 0, 0, 0]], "animations": { "all": { "frames": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], frequency: 4 } } }
        var spritesheet = new createjs.SpriteSheet(spritesheetData);
        this.animation = new createjs.BitmapAnimation(spritesheet);
        this.animation.gotoAndPlay("all");

        this.addChild(this.animation);
    }

    return Coin;
})();



girl.Hero = (function () {

    function Hero()
    {
        this.initialize();
    };

    var p = Hero.prototype = new girl.MovableGameObject();

    // super initialize
    p.MovableGameObject_initialize = p.initialize;
    p.initialize = function ()
    {
        this.MovableGameObject_initialize();

        this.category = 'hero';

        this.width = 18;
        this.height = 30;

        // put registration point to the middle of botth feet.
        this.regX = this.width / 2;
        this.regY = this.height;

        // copy from zoe exported running.json file.
        var spritesheetData;
        if (playerNumber == 1)
        {
           spritesheetData = { "images": ["images/running1.png"], "frames": [[1, 4, 21, 28, 0, 0, 0], [37, 2, 17, 30, 0, 0, 0], [69, 1, 17, 31, 0, 0, 0], [103, 1, 17, 31, 0, 0, 0]], "animations": { "all": { "frames": [0, 1, 2, 3], frequency: 5 } } }
        }
        else
        {
            spritesheetData = { "images": ["images/running2.png"], "frames": [[3, 1, 28, 32, 0, 0, 0], [38, 0, 24, 32, 0, 0, 0], [68, 0, 17, 32, 0, 0, 0], [93, 2, 26, 30, 0, 0, 0]], "animations": { "all": { "frames": [0, 1, 2, 3], frequency: 5 } } }

        }
        var spritesheet = new createjs.SpriteSheet(spritesheetData);
        this.animation = new createjs.BitmapAnimation(spritesheet);
        this.animation.gotoAndPlay('all');
        this.animation.y = 2; // there is some white space between hero graphics and the bottom of the graphics file.
        this.addChild(this.animation);

        // collision point
        this.collisionPoints = [
          new createjs.Point(this.width / 2, this.height), // bottom center
          new createjs.Point(this.width, this.height / 2), // right middle
        ];
    };

    p.jump = function () {

        if (this.onGround)
        {
            if (sounds == 1)
            {
                jumpMusic.play();
            }
            this.velocity.y = -11;
        }

    }

    p.MovableGameObject_tick = p.tick;
    p.tick = function ()
    {
        this.MovableGameObject_tick();
        this.velocity.x = speedPlayer;
        speedChanger--;
        if (speedChanger == 0)
        {
            
            speedChanger = 1000;
            speedPlayer = speedPlayer + 0.3;
            
            if (speedPlayer > 2.5)
            {
                level = 2;
            }
            if (speedPlayer > 3.8)
            {
                level = 3;
            }
           
            //jagraj
            
        }
        
    }

    return Hero;
})();



girl.TopScores = (function () {
    
    function TopScores()
    {
        if (localStorage['scores'] !== undefined)
        {
            this.data = JSON.parse(localStorage['scores']);
        }
        else
        {
            this.data = {
                scores: [],
                names:[]
            }
        }
    }
    
    var p = TopScores.prototype;

    p.saveScore = function (score, player) { //rank updation tested ok

        TopScores();
        if (this.data.scores.length == 0)
        {
            // add to scores array
            
            this.data.scores.push(score);
            this.data.names.push(player);
        }
        else {

            var playerFound = false;
            for (var i = this.data.scores.length - 1; i >= 0 && playerFound==false; i--)
            {
                //checking same player
                if (this.data.names[i] == player)
                {
                    if (this.data.scores[i] < score)//his best score will remain in local storage
                    {
                        this.data.scores[i] = score;
                        while (this.data.scores[i - 1] <= this.data.scores[i]&& i>=0)
                        {
                            var tmp = this.data.scores[i - 1];
                            this.data.scores[i - 1] = this.data.scores[i];
                            this.data.scores[i] = tmp;
                            tmp = this.data.names[i - 1];
                            this.data.names[i - 1] = this.data.names[i];
                            this.data.names[i] = tmp;
                            i--;
                        }
                    }
                    
                    playerFound=true;
                    break;
                }
            }
            if (playerFound == false)
            {
                //this.data.scores.push(score);
                //this.data.names.push(player);
                for (var j = this.data.scores.length - 1; j >= 0; j--)
                {


                    if (this.data.scores[j] > score)
                    {
                        this.data.scores[j + 1] = score;
                        this.data.names[j + 1] = player;
                        break;
                    }
                    else
                    {
                        this.data.scores[j + 1] = this.data.scores[j];
                        this.data.names[j + 1] = this.data.names[j];
                    }

                }

                if (j == -1)
                {
                    this.data.scores[0] = score;
                    this.data.names[0] = player;
                }
            }
        }
        

        // slice the array to maximum 5 elements
        if (this.data.scores.length > 5)
        {
            this.data.scores.pop();
            this.data.names.pop();
        }
        // save to local storage
        
        localStorage['scores'] = JSON.stringify(this.data);
        
    }

    p.toHTML = function ()
    {
        var html = "<ul>";

        for (var i = 0, len = this.data.scores.length; i < len; i++)
        {
            html += "<li>Rank " + (i + 1) + " - " + this.data.names[i] + " - " + this.data.scores[i] + "</li>";
        }

        html += "</ul>";
        return html;
    }

    return TopScores;
})();



girl.Game = (function () {
    // constructor
        function RushGame()
        {
        
        this.canvas = document.getElementById('game-canvas');

        // score
        this.scoreHud = document.getElementById('score');

        // EaselJS Stage
        this.stage = new createjs.Stage(this.canvas);

        // Background
        this.bg = new createjs.Container();
        var bgImage;

        if (themeNumber == 1)
        {

            bgImage = new createjs.Bitmap('images/theme1.png');
        }
        else if (themeNumber == 2)
        {
            bgImage = new createjs.Bitmap('images/theme2.png');
        }
        else if (themeNumber == 3)
        {
            bgImage = new createjs.Bitmap('images/theme3.png');
        }
        else
        {
            bgImage = new createjs.Bitmap('images/theme4.png');
        }
       
        this.bg.addChild(bgImage);
        this.stage.addChild(this.bg);

        // Camera
        this.camera = new createjs.Container();
        this.stage.addChild(this.camera);

        // Create heartbreat for our game loop
        createjs.Ticker.setFPS(40);

        var preloader = new girl.Preloader(this);
        this.stage.addChild(preloader);
        preloader.loadGraphics();
    }

    var p = RushGame.prototype;

    p.resetGame = function ()
    {
        this.camera.removeAllChildren();
        this.camera.x = 0;
        createjs.Ticker.removeAllListeners();
        createjs.Ticker.addListener(this, /*pausable=*/ true);
    }

    p.initGame = function () {
        this.resetGame();
        console.log("Game Inited.");

        this.collectedCoins = 0;
        this.jumpedObstacle = 0;
        var lastPlatformX = 50;
        var lastPlatformY = 150;

        for (var i = 0; i < 200; i++)
        {
            var width = 120 + Math.round(Math.random() * 50);
            var platform = new girl.Platform(width);

            platform.x = lastPlatformX;
            // -40~+40 from the last y position.
            platform.y = Math.random() * 80 - 40 + lastPlatformY;;

            // we need to limit the max and min y to a range.
            // the range is 80-300
            platform.y = Math.max(80, Math.min(300, platform.y));

            this.camera.addChild(platform);

            var gapBetweenPlatforms = Math.random() * 32;
            lastPlatformX += platform.width + gapBetweenPlatforms;
            lastPlatformY = platform.y;

            // let's put an obstacle on platform.
            if (Math.random() > 0.5 && i >= 1)
            {//jagraj
                var obstacle = new girl.Obstacle();
                obstacle.x = platform.x + platform.width / 2;
                obstacle.y = platform.y;
                this.camera.addChild(obstacle);
            }
            else
            {
                // put coins there if no obstacle.
                var coin = new girl.Coin();
                coin.x = platform.x + platform.width / 2;
                coin.y = platform.y;
                this.camera.addChild(coin);
            }

        }

        var hero = this.hero = new girl.Hero();
        hero.x = 100;
        hero.y = 100;
        this.camera.addChild(hero);



        document.onkeydown = handleKeyDown;

        function handleKeyDown(event)
        {

            switch (event.keyCode)
            {
                case 32:
                  
                    hero.jump();
                    break;
                default: console.log("Problem...");
            }
            stage.update();
        }




        //this.stage.onKeyPressed = function () { hero.jump(); }
        this.stage.onMouseDown = function ()
        {
            hero.jump();
        }

        this.updateView();
    }

    p.tick = function ()
    {
        

        this.updateView();
        this.moveGameObjects();
        this.resolveCollision();

        this.moveCamera();
        
    }

    p.moveCamera = function ()
    {
        this.camera.x -= this.hero.velocity.x;
    }

    p.updateView = function ()
    {
        this.stage.update();

        this.scoreHud.innerHTML = "<img src='images/coin1.png' />&nbsp;" + this.collectedCoins + "* 100 &nbsp;&nbsp;&nbsp;&nbsp;<img src='images/fireIcon.png' width='25' height='25'&nbsp; /> " + this.jumpedObstacle + "* 50 &nbsp;"
            + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
            +"Level : "+level
            + "<span style='float:right;'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Player : " + playerName + "</span><span style='float:right;'> &nbsp;&nbsp;&nbsp;Score :" + (this.collectedCoins * 100 + this.jumpedObstacle * 50) + "</span>";
     
    }

    p.gameOver = function () {

        createjs.Ticker.setPaused(true);
        if (sounds == 1)
        {
            
            mainMusic.pause();
        }
        var gameoverScene = document.getElementById('gameover');
        var yourScore = document.getElementById('your-game-score');
        var tweet = document.getElementById("tweet");
        var fb = $("#facebook");
        var fbText;
        localStorage['maxScore'] = localStorage['maxScore'] || 0; // set the saved max score to zero if not defined

        var maxScore = Math.max(localStorage['maxScore'], this.collectedCoins * 100 + this.jumpedObstacle*50);
        localStorage['maxScore'] = maxScore;

        yourScore.innerHTML = '<br/><br/>Your score is ' + (this.collectedCoins * 100 + this.jumpedObstacle*50) + '.';

        if ((this.collectedCoins * 100 + this.jumpedObstacle * 50) >= maxScore)
        {
            yourScore.innerHTML += '<br/><br/><b>Congrats!!! You made highest Score. </b>';
            tweet.href = 'http://twitter.com/share?text=I scored ' + (this.collectedCoins * 100 + this.jumpedObstacle * 50) + ' points which is the highest in the Hurry Up Game by Jagraj Singh...';
            fbText = 'I scored' + (this.collectedCoins * 100 + this.jumpedObstacle * 50) + ' points which is the highest in the Huury Up Game by Jagraj Singh...';
        }
        else
        {
            tweet.href = 'http://twitter.com/share?text=I scored ' + (this.collectedCoins * 100 + this.jumpedObstacle * 50) + ' points in the Hurry Up Game by Jagraj Singh...';
            fbText = 'I scored' + (this.collectedCoins * 100 + this.jumpedObstacle * 50) + ' points in the Huury Up Game by Jagraj Singh...';
          
            yourScore.innerHTML += '<br/><br/><b>Top 5 Highest Scores : </b>' ;
        }
        fb.click(function ()
        {
          window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(location.href),
              fbText+'..',
              'width=626,height=436');
            
        });
        var topScores = new girl.TopScores();
        topScores.saveScore((this.collectedCoins * 100 + this.jumpedObstacle * 50), playerName);
        var topScoresHud = document.getElementById('top-scores');
        topScoresHud.innerHTML = topScores.toHTML();

       
       
        gameoverScene.classList.remove('hidden');
    }
 
    p.moveGameObjects = function () {
        
        for (var i = 0, len = this.camera.children.length; i < len; i++)
        {
            var gameObject = this.camera.children[i];
            if (gameObject.category == "obstacle" && gameObject.x > this.hero.x - 30 && gameObject.x < (this.hero.x -30+ speedPlayer))
            {
                this.jumpedObstacle++;
               // alert("u jumped obstacle");
            }
            
            if (gameObject.velocity)
            {
                gameObject.x += gameObject.velocity.x;
                gameObject.y += gameObject.velocity.y;
            }
            
            // for each game object, we mark the outside of screen flag
            var globalPosition = new createjs.Point();
            globalPosition.x = gameObject.x + this.camera.x;
            globalPosition.y = gameObject.y + this.camera.y;

            if (globalPosition.x > this.canvas.width ||
                globalPosition.x + gameObject.width < 0 ||
                globalPosition.y > this.canvas.height ||
                globalPosition.y + gameObject.height < 0) {
                gameObject.isOutsideOfScreen = true;
            }
            else
            {
                gameObject.isOutsideOfScreen = false;
            }
        }

        flag--;
        if (flag <= 0)
        {
            if (sounds == 1)
            {
                fallMusic.play();
            }
        }

        // game over if the hero falls down
        if (this.hero.y > 500)
        {
            this.gameOver();
        }
    }
    //jagraj
    p.gameObjectHitHero = function (category, hitCallback) {

        for (var i = 0, len = this.camera.children.length; i < len; i++)
        {
            var gameObject = this.camera.children[i];

            // skip the game object if it is out of the screen.
            if (gameObject.isOutsideOfScreen) continue;

            // check collision between platform and hero
            if (gameObject.category === category)
            {
                // loop all collision point.
                for (var j = 0, length = this.hero.collisionPoints.length; j < length; j++)
                {
                    var collisionPoint = this.hero.collisionPoints[j];
                    var point = this.hero.localToLocal(collisionPoint.x, collisionPoint.y, gameObject);
                    if (gameObject.hitPoint(point))
                    {
                        hitCallback(point, gameObject);
                    }
                }
            }
        }
    }

    p.heroHitsPlatform = function (point) {
        // get distance between target point and game object
        var distanceY = -point.y;
        if (this.hero.velocity.y > 0)
        {
            this.hero.y += distanceY;
            this.hero.velocity.y = 0;
        }

        this.hero.onGround = true;

        
         flag = 45;
       
        
      }

    p.heroHitsCoin = function (point, coin)
    {
        this.camera.removeChild(coin);
        this.collectedCoins++;
    }

    p.heroHitsObstacle = function () {
        this.gameOver();
    }

    p.resolveCollision = function () {

        // check collision between platform and hero
        this.hero.onGround = false;
        this.gameObjectHitHero('platform', (this.heroHitsPlatform).bind(this));

        // check collision between obstacle and hero
        this.gameObjectHitHero('obstacle', (this.heroHitsObstacle).bind(this));

        // check collision between obstacle and hero
        this.gameObjectHitHero('coin', (this.heroHitsCoin).bind(this));

    }

    return RushGame;

})();