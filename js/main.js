var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {

    game.load.atlas('breakout', 'assets/breakout.png', 'assets/breakout.json');
    
    //adding in several sounds
    //multiple explosion and hit sounds for variety
    game.load.audio('explosion_1', 'assets/audio/Explosion_1.wav');
    game.load.audio('explosion_2', 'assets/audio/Explosion_2.wav');
    game.load.audio('explosion_3', 'assets/audio/Explosion_3.wav');
    
    game.load.audio('hit_1', 'assets/audio/Hit_1.wav');
    game.load.audio('hit_2', 'assets/audio/Hit_2.wav');
    game.load.audio('hit_3', 'assets/audio/Hit_3.wav');
    game.load.audio('hit_4', 'assets/audio/Hit_4.wav');
    game.load.audio('hit_5', 'assets/audio/Hit_5.wav');
    
    game.load.audio('scream', 'assets/audio/scream_horror1.mp3');
    game.load.audio('music', 'assets/audio/Vir_Nocturna_-_01_-_Analgesia.mp3');
    
    //laoding in background
    game.load.image('bg', 'assets/Wall.jpg');
}

var ball;
var paddle;
//replaced bricks group with 4 brick groups for each type
var brickBlocks;
var brickBooms;
var brickRocks;
var brickMen;

var ballOnPaddle = true;

var lives = 10;
var score = 0;

var scoreText;
var livesText;
var introText;

var music;
var hit;
var scream;
var boom;
    
var bg;
var spook;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.physics.arcade.checkCollision.down = false;
    
    //adding in background
    bg = game.add.sprite(0,0, 'bg');
    //playing music
    music = game.add.audio('music');
    music.loop = true; //can't stop, won't stop
    music.play();
    
    //slightly modifed from original code for each group
    brickBlocks = game.add.group();
    brickBlocks.enableBody = true;
    brickBlocks.physicsBodyType = Phaser.Physics.ARCADE;
    
    brickBooms = game.add.group();
    brickBooms.enableBody = true;
    brickBooms.physicsBodyType = Phaser.Physics.ARCADE;
        
    brickRocks = game.add.group();
    brickRocks.enableBody = true;
    brickRocks.physicsBodyType = Phaser.Physics.ARCADE;
    
    brickMen = game.add.group();
    brickMen.enableBody = true;
    brickMen.physicsBodyType = Phaser.Physics.ARCADE;
     
    var brick;
    
    var randBrick;//randbrick will decide which brick gets placed
    for (var y = 0; y < 4; y++)
    {
        for (var x = 0; x < 15; x++)
        {
            //number from 0 to 10
            randBrick = Math.floor(Math.random() * 10);
            
            if (randBrick == 0)
                brick = brickBooms.create(120 + (x * 36), 100 + (y * 52), 'breakout', 'brick_3_1.png');//10% chance of TNT
            else if (randBrick <= 2)
                brick = brickBlocks.create(120 + (x * 36), 100 + (y * 52), 'breakout', 'brick_1_1.png');//20% chance of an X Block
            else if (randBrick == 3)
                brick = brickMen.create(120 + (x * 36), 100 + (y * 52), 'breakout', 'brick_2_1.png');//10% chance of a Ghost
            else
                brick = brickRocks.create(120 + (x * 36), 100 + (y * 52), 'breakout', 'brick_4_1.png'); //60% chance of Brick

            brick.body.bounce.set(1);         
            brick.body.immovable = true;
            
        }
    }
    
    


    paddle = game.add.sprite(game.world.centerX, 500, 'breakout', 'paddle_big.png');
    paddle.anchor.setTo(0.5, 0.5);

    game.physics.enable(paddle, Phaser.Physics.ARCADE);

    paddle.body.collideWorldBounds = true;
    paddle.body.bounce.set(1);
    paddle.body.immovable = true;

    ball = game.add.sprite(game.world.centerX, paddle.y - 16, 'breakout', 'ball_1.png');
    ball.anchor.set(0.5);
    ball.checkWorldBounds = true;

    game.physics.enable(ball, Phaser.Physics.ARCADE);

    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1);

    ball.animations.add('spin', [ 'ball_1.png', 'ball_2.png', 'ball_3.png', 'ball_4.png', 'ball_5.png' ], 50, true, false);
    
    ball.events.onOutOfBounds.add(ballLost, this);

    scoreText = game.add.text(32, 550, 'score: 0', { font: "20px Arial", fill: "#ffffff", align: "left" });
    livesText = game.add.text(680, 550, 'lives: 3', { font: "20px Arial", fill: "#ffffff", align: "left" });
    introText = game.add.text(game.world.centerX, 400, '- click to start -\n-Ghosts will hurt you!-\n-TNT destroys your balls-\n-Xs block your balls-', { font: "40px Arial", fill: "#ffffff", align: "center" });
    introText.anchor.setTo(0.5, 0.5);

    game.input.onDown.add(releaseBall, this);

}

function update () {
    paddle.x = game.input.x;

    if (paddle.x < 24)
    {
        paddle.x = 24;
    }
    else if (paddle.x > game.width - 24)
    {
        paddle.x = game.width - 24;
    }

    if (ballOnPaddle)
    {
        ball.body.x = paddle.x;
    }
    else
    {
        //added in similar code, but one each for each type of brick
        game.physics.arcade.collide(ball, paddle, ballHitPaddle, null, this);
        game.physics.arcade.collide(ball, brickBlocks, ballHitBlock, null, this);
        game.physics.arcade.collide(ball, brickBooms, ballHitBoom, null, this);
        game.physics.arcade.collide(ball, brickRocks, ballHitRock, null, this);
        game.physics.arcade.collide(ball, brickMen, ballHitMan, null, this);
    }

}

function releaseBall () {

    if (ballOnPaddle)
    {
        ballOnPaddle = false;
        ball.body.velocity.y = -300;
        ball.body.velocity.x = -75;
        ball.animations.play('spin');
        introText.visible = false;
    }

}

function ballLost () {

    lives--;
    livesText.text = 'lives: ' + lives;

    if (lives === 0)
    {
        gameOver();
    }
    else
    {
        ballOnPaddle = true;

        ball.reset(paddle.body.x + 16, paddle.y - 16);
        
        ball.animations.stop();
    }

}

function gameOver () {

    ball.body.velocity.setTo(0, 0);
    
    introText.text = 'Life ain\'t fair, buddy!';
    introText.visible = true;

}
//The following 4 functions are all modifications of the original ballHit Brick function
function ballHitBlock (_ball, _brick) { //hit an X Block
    var rand = Math.floor(Math.random() * 5) + 1;//number from 1 to 5
    hit = game.add.audio('hit_' + rand); //choose repsective hit sound
    hit.play(); //play sound
}

function ballHitMan (_ball, _brick) { //hits a ghost
    _brick.kill(); //kill ghost
    scream = game.add.audio('scream'); //spooky
    scream.allowMultiple = true; //extra spooky
    scream.play(); //spook
    score -= 20; //reduce score (ghost = bad = spooky)
    scoreText.text = 'score: ' + score;
    checkGameOver(_ball); // created a special check function for clarity
}
    
function ballHitBoom (_ball, _brick) { //hit TNT
    _brick.kill();
    var rand = Math.floor(Math.random() * 5) + 1;
    boom = game.add.audio('hit_' + rand);
    boom.play();
    ballLost(); //kill the ball
}

function ballHitRock (_ball, _brick) { //hit a Brick
    _brick.kill();
    var rand = Math.floor(Math.random() * 5) + 1;
    hit = game.add.audio('hit_' + rand);
    hit.play();
    score += 10; //add 10 points
    scoreText.text = 'score: ' + score;
    checkGameOver(_ball);
}

//Code taken from original ballHitBrick function. Refactored into its own function since now we have more than one brick type
function checkGameOver (ball){
    if (brickRocks.countLiving() == 0 && brickMen.countLiving() == 0)
    {
        score += 1000;
        scoreText.text = 'score: ' + score;
        introText.text = '- Next Level -';

        ballOnPaddle = true;
        ball.body.velocity.set(0);
        ball.x = paddle.x + 16;
        ball.y = paddle.y - 16;
        ball.animations.stop();

        bricks.callAll('revive');
    }
}
    
function ballHitPaddle (_ball, _paddle) {

    var diff = 0;

    if (_ball.x < _paddle.x)
    {
        diff = _paddle.x - _ball.x;
        _ball.body.velocity.x = (-10 * diff);
    }
    else if (_ball.x > _paddle.x)
    {
        diff = _ball.x -_paddle.x;
        _ball.body.velocity.x = (10 * diff);
    }
    else
        _ball.body.velocity.x = 2 + Math.random() * 8;


}