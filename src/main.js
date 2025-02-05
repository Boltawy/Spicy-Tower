import kaplay from "kaplay";
import "kaplay/global"; // uncomment if you want to use without the k. prefix

const k = kaplay(
    {
        debug: true,
        debugKey: "t",
        global: true,
        width: 640,
        height: window.screen.height * 1.3,
        maxFPS: 60,
        letterbox: true,
        stretch: false,

    }
);

let pauseTheme;
let bgMusic;
let paused = false;
let pauseThemeTime;
let pauseThemeDuration;
let bgMusicTime



k.scene("game", () => {
    // k.loadSound("spicyTheme", "audio/spicy-theme.mp3")
    // k.loadSound("track1", "audio/track1.mp3")
    // k.loadSound("track2", "audio/track2.mp3")
    // k.loadSound("track4", "audio/track4.mp3")
    k.loadSound("track5", "audio/track5.mp3")
    loadSound("fall", "audio/fall.mp3")
    loadFont("VCR_OSD", "fonts/VCR_OSD_Mono.ttf");
    loadSprite("bg", "sprites/brick-wall.png");
    loadSprite("bg2", "sprites/Dungeon_brick_wall_blue.png.png");

    let spawnedBg;
    let camSpeed = 0;



    function bgSpawner(bgPositionY) {
        if (!paused) {
            spawnedBg = add([
                sprite("bg2"),
                pos(-width() / 4, bgPositionY),
                anchor("topleft"),
                scale(0.75),
                color(90, 90, 90),
                z(-1),
                "bg",
            ])
        }
        return spawnedBg;
    }

    let currentBg = bgSpawner(innerHeight / 2);
    currentBg = bgSpawner(currentBg.pos.y - innerHeight / 1.4);

    let bgInterval = setInterval(() => {
        if (!paused && currentBg.pos.y > getCamPos().y - innerHeight) {
            currentBg = bgSpawner(currentBg.pos.y - innerHeight / 1.4);
        }
    }, 500)

    function updateBgSpeed() {
        if (!paused) {
            get("bg").forEach(bg => {
                bg.use(move(DOWN, camSpeed * 0.7));
            });
        }
        if (isDead) {
            get("bg").forEach(bg => {
                bg.unuse("move");
            });
        }
    }


    let scoreCounter = add([
        k.text("0", {
            font: "VCR_OSD",
            size: 48,
        }),
        z(10),
        pos(width() / 2, 50),
        color(20, 20, 20),
        anchor("center"),
        fixed(),
        "score",
    ]);

    add([
        k.text("0", {
            font: "VCR_OSD",
            size: 48,
        }),
        z(10),
        pos(width() / 2 + 3, 50 + 3),
        color(255, 255, 255),
        anchor("center"),
        fixed(),
        "score",
    ]);


    let score = 0;

    onUpdate(() => {
        if (!paused && startScroll && !isDead) {
            score += Math.floor(150 * dt());
            get("score").forEach(scoreText => scoreText.text = score.toString());

        }
    });




    loadSprite("startingPlatform", "sprites/startingPlatform.png")

    const startingPlatform = add([
        sprite("startingPlatform"),
        // rect(width(), 48),
        scale(1.01),
        pos(width() / 2, height() + 20),
        anchor("center"),
        area(),
        body({ isStatic: true }),
        // color(127, 200, 255),
        "startingPlatform",
    ]);

    loadSprite("hooded", "sprites/hooded.png", {
        sliceX: 8,
        sliceY: 9,
        anims: {
            idle1: { from: 0, to: 1, loop: false, speed: 4 },
            idle2: { from: 8, to: 9, loop: false, speed: 4 },
            walk: { from: 16, to: 19, loop: true, speed: 4 },
            run: { from: 24, to: 31, loop: true, speed: 8 },
        },
    });


    const player = k.add([
        k.pos(width() / 2, height() - 90),
        k.sprite("hooded", { anim: "idle1" }),
        k.body(),
        area({ shape: new Rect(vec2(0, 3), 10, 24) }),
        // scale(0.5),
        scale(2),
        anchor("center"),
        "player",
    ]);


    let idleAnimationCounter = 0;
    let blinkTimer = 0;
    player.on("animEnd", (anim) => {
        blinkTimer = rand(5, 10)
        if (anim === "idle1" && idleAnimationCounter < blinkTimer) {
            player.play("idle1");
            idleAnimationCounter++;
        } else if (anim === "idle1" && idleAnimationCounter >= blinkTimer) {
            player.play("idle2");  // Switch to idle2 after idle1 finishes 2 times
            idleAnimationCounter = 0;  // Reset counter for next cycle
        } else if (anim === "idle2") {
            player.play("idle1");  // Play idle1 after idle2 finishes
        }
    });

    let canWalk = false;
    let isWalking = false;
    let isRunning = false;
    let canRun = false;
    let isIdle = false;
    let canIdle = false;

    function mainAnimations() {
        if (isWalking && canWalk) {
            player.play("walk");
            canWalk = false;
        }
        else if (isRunning && canRun) {
            player.play("run");
            canRun = false;
        }
        else if (isIdle) {
            player.play("idle1");
            isIdle = false;
        }
    }

    let playerFlip = false;
    let canJump = true;

    function playerJump() {
        if (!paused && canJump) {
            if (player.isGrounded()) {
                player.jump(Math.max(590, Math.abs(velocity) * 2.1));
            }
        }
    }

    k.onKeyDown(["space", "w", "up", "ص"], () => {
        playerJump();
    }
    );


    let velocity = 0;
    let acceleration = 23;
    const maxSpeed = 1000;
    const friction = 1000; // Slow down when no key is pressed

    function moveleft() {
        if (velocity > 0) velocity = Math.max(velocity - friction * dt(), 0);
        if (velocity > 0 && !player.isGrounded()) velocity = Math.max(velocity - friction / 1.5 * dt(), 0);
        velocity = Math.max(velocity - acceleration * acceleration * dt(), -maxSpeed);
        playerFlip ? null : player.scale.x *= -1;
        playerFlip = true;

    }

    function moveright() {
        if (velocity < 0) velocity = Math.min(velocity + friction * dt(), 0);
        if (velocity < 0 && !player.isGrounded()) velocity = Math.min(velocity + friction / 1.5 * dt(), 0);
        velocity = Math.min(velocity + acceleration * acceleration * dt(), maxSpeed);
        playerFlip ? player.scale.x *= -1 : null;
        playerFlip = false;
    }

    let isPlayerJumping = false;


    let isMovingRight = false;
    let isMovingLeft = false;
    
    if (isTouchscreen()) {
        add([
            polygon([
                vec2(25, height() - 100),
                vec2(75, height() - 150),
                vec2(75, height() - 50),

            ]),
            color(255, 255, 255),
            opacity(0.1),
            fixed()
        ])

        add([
            polygon([
                vec2(250, height() - 100),
                vec2(200, height() - 150),
                vec2(200, height() - 50),

            ]),
            color(255, 255, 255),
            opacity(0.1),
            fixed()
        ])

        add([
            pos(width() - 75, height() - 100),
            circle(45),
            color(255, 255, 255),
            opacity(0.1),
            fixed()
        ])
    }




    onTouchStart((pos) => {
        if (pos.x > 0 && pos.x < 80) {
            isMovingLeft = true;
            isMovingRight = false;
        } else if (pos.x > 80 && pos.x < 190) {
            isMovingRight = true;
            isMovingLeft = false;
        }
        if (pos.x > 250 && pos.x < width()) {
            isPlayerJumping = true
        }
    });

    onTouchEnd((pos) => {
        if (pos.x < 200) {
            isMovingLeft = false;
            isMovingRight = false;
        }
        else if (pos.x > 200) {
            isPlayerJumping = false;
        }
    });

    onUpdate(() => {
        if (!paused) {
            if (isKeyDown(["d", "right", "ي"]) || isMovingRight) {
                moveright();
            } else if (isKeyDown(["a", "left", "ش"]) || isMovingLeft) {
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



            if (isPlayerJumping) {
                playerJump();
            }




            if (player.isGrounded() && Math.abs(velocity) > 100) {
                isWalking = true;
            }
            else if (player.isGrounded() && Math.abs(velocity) < 100) {
                isWalking = false;
                canWalk = true;
                isRunning = false;
                canRun = true;
                isIdle = true;
            }

            if ((player.isGrounded() && Math.abs(velocity) > 100) && player.isGrounded() && Math.abs(velocity) < 300) {
                isWalking = true;
            }
            else if (player.isGrounded() && Math.abs(velocity) < 100) {
                isWalking = false;
                canWalk = true;
                isRunning = false;
                canRun = true;
                isIdle = true;
            }






            onCollide("player", "wall", () => {
                // canJump = false;
                velocity = -velocity;
            });
            onCollideEnd("player", "wall", () => {
                canJump = true;
            });

            mainAnimations();
            player.move(velocity, 0);
        }
    });


    k.onKeyPress(["p", "escape", "ح"], () => {
        paused = !paused;
        if (player.has("body")) {
            player.unuse("body");
        }
        else {
            player.use(body());
        }
        if (paused) {
            if (startScroll) {
                bgMusicTime = bgMusic?.time();
                bgMusic?.stop();
                pauseTheme = k.play("track5", { volume: 0.1, loop: true, speed: 0.7, seek: bgMusicTime });
            }

            get("bg").forEach(bg => {
                bg.unuse("move")
            })

            add([
                rect(width(), height()),
                pos(getCamPos().x - width() / 2, getCamPos().y - height() / 2),
                color(0, 0, 0),
                opacity(0.5),
                "pauseoverlay",
            ]);

            add([
                text("PAUSED", {
                    font: "VCR_OSD",
                    size: 50,
                    width: 500,
                    align: "center",
                }),
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
            if (startScroll) {
                pauseThemeDuration = pauseTheme?.duration();
                pauseThemeTime = (pauseTheme?.time() * 0.7) + bgMusicTime;
                pauseTheme?.stop();
                bgMusic?.play(pauseThemeTime);
            }
            k.get("pauseoverlay").forEach(overlay => overlay.destroy());
        }

    });


    // k.onClick(() => k.addKaboom(k.mousePos()));

    k.setGravity(1400)

    loadSprite("platform1", "sprites/platform1.png")
    loadSprite("platform2", "sprites/platform2.png")
    loadSprite("platform3", "sprites/platform3.png")
    loadSprite("platform4", "sprites/platform4.png")
    loadSprite("platform5", "sprites/platform5.png")
    loadSprite("platform6", "sprites/platform6.png")
    loadSprite("platform7", "sprites/platform7.png")
    loadSprite("platform8", "sprites/platform8.png")
    // loadSprite("platform9", "sprites/platform9.png")
    // loadSprite("platformFull", "sprites/platformFull.png")




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
                    opacity(0),
                    "wall",
                    "leftwall",
                ]);
                const rightWall = add([
                    rect(100, height()),
                    pos(width(), wallPosY),
                    area(),
                    body({ isStatic: true }),
                    color(127, 200, 255),
                    opacity(0),
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
            let platformNumber;
            for (let i = 0; i < 10; i++) {
                platformNumber = Math.floor(rand(1, 9));
                // debug.log(platformNumber);
                spawnedPlatform = add([
                    sprite(`platform${platformNumber}`),
                    pos(width() / 2, platformPosY),
                    outline(4),
                    scale(0.75),
                    anchor("center"),
                    body({ isStatic: true }),
                    // color(127, 200, 255),
                    "platform",
                    `platform${platformNumber}`,
                ]);

                spawnedPlatform.pos.x = k.rand(75, width() - 75);
                platformPosY -= 100;


            }

            return spawnedPlatform; //return last generated platform
        }
    }

    let currentPlatform = platformSpawner(player.pos.y - 60);

    let platformInterval = setInterval(() => {
        if (!paused) {
            if (currentPlatform.pos.y > getCamPos().y - height()) {
                currentPlatform = platformSpawner(currentPlatform.pos.y - 100);
            }
            get("platform").forEach(platform => {
                if (platform.pos.y > getCamPos().y + height() / 1.7) {
                    platform.destroy();
                }
            })
        }
    }, 500);


    onUpdate(() => { // Adds collision when the player is above any given platform
        if (!paused) {
            get("platform").forEach(platform => {
                if (player.pos.y < platform.pos.y - 45) {
                    if (platform.is("platform1")) {
                        platform.use(area({ shape: new Rect(vec2(0, -10), 60, 1) }));
                    }
                    else if (platform.is("platform2")) {
                        platform.use(area({ shape: new Rect(vec2(0, -11), 123, 1) }));
                    }
                    else if (platform.is("platform3")) {
                        platform.use(area({ shape: new Rect(vec2(0, -13), 187, 1) }));
                    }
                    else if (platform.is("platform4")) {
                        platform.use(area({ shape: new Rect(vec2(0, -11), 251, 1) }));
                    }
                    else if (platform.is("platform5")) {
                        platform.use(area({ shape: new Rect(vec2(0, -12), 315, 1) }));
                    }
                    else if (platform.is("platform6")) {
                        platform.use(area({ shape: new Rect(vec2(0, -13), 378, 1) }));
                    }
                    else if (platform.is("platform7")) {
                        platform.use(area({ shape: new Rect(vec2(0, -18), 440, 1) }));
                    }
                    else if (platform.is("platform8")) {
                        platform.use(area({ shape: new Rect(vec2(0, -21), 506, 1) }));
                    }
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
            k.play("fall", { volume: 0.2 });
            deathAnimation = false;
        }
    }


    let startScroll = false;


    let startMusic = onUpdate(() => {
        if (startScroll) {
            // bgMusic = k.play("spicyTheme", { volume: 0.2, loop: true });
            bgMusic = k.play("track5", { volume: 0.1, loop: true });
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
                    camSpeed = -height() / 2;
                    updateBgSpeed();
                }
                else {
                    camSpeed = -height() / 6;
                    updateBgSpeed();
                }
                setCamPos(camPosition.x, camPosition.y);
                camPosition.y += camSpeed * dt();
            }
            if (player.pos.y > camPosition.y + height()) {
                isDead = true;
                startScroll = false;
                shakeOnDeath();
                updateBgSpeed();
                bgMusic?.stop();
                pauseTheme?.stop();
            }
        }
    });

    onkeydown = (e) => {
        if (e.key == "r" || e.key == "R" || e.key == "ق") {
            bgMusic?.stop();
            pauseTheme?.stop();
            k.destroyAll("platform");
            clearInterval(platformInterval);
            k.destroyAll("wall");
            clearInterval(wallInterval);
            k.destroyAll("bg");
            clearInterval(bgInterval);
            k.go("game");
        }
    }


})

k.go("game");
