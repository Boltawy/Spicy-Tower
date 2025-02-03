import kaplay from "kaplay";
import "kaplay/global"; // uncomment if you want to use without the k. prefix

const k = kaplay(
    {
        debug: true,
        debugKey: "t",
        global: true,
        width: 640,
        height: 800,
        letterbox: true,
        stretch: false,

    }
);

let pauseTheme;
let bgMusic;



k.scene("game", () => {
    k.loadSound("spicyTheme", "audio/spicy-theme.mp3")


    // k.onLoad(() => {
    //     k.play("spicyTheme", { volume: 0.2, loop: true });

    // });


    
    
    let scoreCounter = add([
        k.text("Score: 0", 24),
        pos(width() / 2, 50),
        color(0, 0, 0),
        opacity(0.5),
        anchor("center"),
        fixed(),
        "score",
    ]);

    let score = 0;
    
    onUpdate(() => {
        if (!paused && startScroll && !isDead) {
            score += Math.floor(150 * dt());
            scoreCounter.text = `Score: ${score}`;
            
        }
    });
    
    

    
    k.loadSprite("bean", "sprites/bean.png");
    loadSprite("hooded", "sprites/hooded.png");


    const player = k.add([
        k.pos(width() / 2, height() - 50),
        k.sprite("bean"),
        k.body(),
        area(),
        scale(0.5),
        anchor("botleft"),
        "player",
    ]);




    k.onKeyDown(["space", "w", "up"], () => {
        if (!paused) {
            if (player.isGrounded()) {
                player.jump(Math.max(570, Math.abs(velocity) * 2.1));
            }
        }
    }
    );


    let velocity = 0;
    let acceleration = 20;
    const maxSpeed = 1000;
    const friction = 1000; // Slow down when no key is pressed

    function moveleft() {
        if (velocity > 0) velocity = Math.max(velocity - friction * dt(), 0);
        if (velocity > 0 && !player.isGrounded()) velocity = Math.max(velocity - friction / 1.5 * dt(), 0);
        velocity = Math.max(velocity - acceleration * acceleration * dt(), -maxSpeed);
    }

    function moveright() {
        if (velocity < 0) velocity = Math.min(velocity + friction * dt(), 0);
        if (velocity < 0 && !player.isGrounded()) velocity = Math.min(velocity + friction / 1.5 * dt(), 0);
        velocity = Math.min(velocity + acceleration * acceleration * dt(), maxSpeed);
    }

    onUpdate(() => {
        if (!paused) {
            if (isKeyDown(["d", "right"])) {
                moveright();
            } else if (isKeyDown(["a", "left"])) {
                moveleft();
            } else {
                if (player.isGrounded()) {
                    if (velocity > 0) velocity = Math.max(velocity - friction / 1.4 * dt(), 0);
                    if (velocity < 0) velocity = Math.min(velocity + friction / 1.4 * dt(), 0);
                }
                else {
                    if (velocity > 0) velocity = Math.max(velocity - friction / 3 * dt(), 0);
                    if (velocity < 0) velocity = Math.min(velocity + friction / 3 * dt(), 0);
                }
            }

            onCollide("player", "wall", () => {
                if (player.isGrounded()) {
                    velocity = 0;
                }
                else {
                    velocity = velocity * -1;
                }
            });

            player.move(velocity, 0);
        }
    });


    let paused = false;
    let pauseThemeTime;
    let pauseThemeDuration;
    let bgMusicTime;
    k.onKeyPress(["p", "escape"], () => {
        paused = !paused;
        if (player.has("body")) {
            player.unuse("body");
        }
        else {
            player.use(body());
        }
        if (paused) {
            bgMusicTime = bgMusic?.time();
            bgMusic?.stop();
            pauseTheme = k.play("spicyTheme", { volume: 0.2, loop: true, speed: 0.7, seek: bgMusicTime });

            add([
                rect(width(), height()),
                pos(getCamPos().x - width() / 2, getCamPos().y - height() / 2),
                color(0, 0, 0),
                opacity(0.5),
                "pauseoverlay",
            ]);

            add([
                text("PAUSED"),
                pos(getCamPos().x, getCamPos().y),
                color(255, 255, 255),
                anchor("center"),
                "pauseoverlay",
                "pausetext",
            ]);

            // get("pausetext").forEach(text => {
            //     text.;
            // });
        }
        else {
            pauseThemeDuration = pauseTheme?.duration();
            pauseThemeTime = (pauseTheme?.time() * 0.7) + bgMusicTime;
            pauseTheme?.stop();
            bgMusic?.play(pauseThemeTime);
            k.get("pauseoverlay").forEach(overlay => overlay.destroy());
        }

    });


    k.onClick(() => k.addKaboom(k.mousePos()));

    k.setGravity(1400)


    const startingPlatform = add([
        rect(width(), 48),
        pos(0, height() - 48),
        area(),
        body({ isStatic: true }),
        color(127, 200, 255),
    ]);



    // k.viewport.follow(player);

    function wallSpawner(wallPosY) {
        if (!paused) {
            for (let i = 0; i < 10; i++) {
                const leftWall = add([
                    rect(-100, height()),
                    pos(0, wallPosY),
                    area(),
                    body({ isStatic: true }),
                    color(127, 200, 255),
                    "wall",
                    "leftwall",
                ]);
                const rightWall = add([
                    rect(100, height()),
                    pos(width(), wallPosY),
                    area(),
                    body({ isStatic: true }),
                    color(127, 200, 255),
                    "wall",
                    "rightwall",
                ]);

                wallPosY -= height();
                return leftWall;
            }
        }
    }

    let leftWall = wallSpawner(0);
    let wallInterval = setInterval(() => {
        if (!paused) {
            if (leftWall.pos.y > getCamPos().y - height()) {
                leftWall = wallSpawner(leftWall.pos.y - height());
            }
            get("wall").forEach(wall => {
                if (wall.pos.y > getCamPos().y + 500) {
                    wall.destroy();
                }
            });
        }
    }, 500);


    function platformSpawner(platformPosY) {
        if (!paused) {
            let spawnedPlatform;
            for (let i = 0; i < 10; i++) {
                spawnedPlatform = add([
                    rect(rand(150, 600), 30),
                    pos(0, platformPosY),
                    outline(4),
                    scale(0.5),
                    anchor("botleft"),
                    body({ isStatic: true }),
                    color(127, 200, 255),
                    "platform",
                ]);

                spawnedPlatform.pos.x = k.rand(0, width() - spawnedPlatform.width * spawnedPlatform.scale.x);
                platformPosY -= 100;
            }

            return spawnedPlatform; //return last generated platform
        }
    }

    let currentPlatform = platformSpawner(player.pos.y - 50);

    let platformInterval = setInterval(() => {
        if (!paused) {
            if (currentPlatform.pos.y > getCamPos().y - 500) {
                currentPlatform = platformSpawner(currentPlatform.pos.y - 100);
            }
            get("platform").forEach(platform => {
                if (platform.pos.y > getCamPos().y + 500) {
                    platform.destroy();
                }
            })
        }
    }, 500);


    onUpdate(() => { // Adds collision when the player is above any given platform
        if (!paused) {
            get("platform").forEach(platform => {
                if (player.pos.y < platform.pos.y - 20) {
                    platform.use(area({ shape: new Rect(vec2(0, -platform.height), platform.width, 1) }))
                }
            });
        }
    });

    onUpdate(() => { // Removes collision when the player is below any given platform
        if (!paused) {
            get("platform").forEach(platform => {
                if (player.pos.y > platform.pos.y) {
                    platform.unuse("area");
                }
            });
        }
    });

    let camPosition = {
        x: width() / 2,
        y: height() / 2
    }

    let isDead = false;
    let deathAnimation = true;

    function shakeOnDeath() {
        if (isDead && deathAnimation) {
            shake(20)

            deathAnimation = false;
        }
    }

    let camsSpeed = -height() / 800;

    let startScroll = false;


    let startMusic = onUpdate(() => {
        if (startScroll) {
            bgMusic = k.play("spicyTheme", { volume: 0.2, loop: true });
            startMusic.cancel();
        }
    });

    k.onUpdate(() => {
        if (!paused) {
            if (player.pos.y < height() / 2) {
                startScroll = true;
            }
            if (startScroll) {
                if (player.pos.y < camPosition.y - height() / 3) {
                    camsSpeed = -height() / 2;
                }
                else {
                    camsSpeed = -height() / 6;
                }
                setCamPos(camPosition.x, camPosition.y);
                camPosition.y += camsSpeed * dt();
            }
            if (player.pos.y > camPosition.y + height()) {
                isDead = true;
                startScroll = false;
                shakeOnDeath();
                bgMusic?.stop();
                pauseTheme?.stop();
            }
        }
    });

    onkeydown = (e) => {
        if (e.key == "r") {
            bgMusic?.stop();
            pauseTheme?.stop();
            k.destroyAll("platform");
            clearInterval(platformInterval);
            k.destroyAll("wall");
            clearInterval(wallInterval);
            k.go("game");
        }
    }


})

k.go("game");
