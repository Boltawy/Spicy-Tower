import kaplay from "kaplay";
// import "kaplay/global"; // uncomment if you want to use without the k. prefix

const k = kaplay(
    {
        debug: true,
        debugKey: "r",
        global: true,
        width: Math.min(window.innerWidth, 600),
        height: Math.min(window.innerHeight, 800),
        letterbox: false,
        stretch: false,

    }
);
k.loadSound("spicyTheme", "audio/spicy-theme.mp3")


// k.onLoad(() => {
//     k.play("spicyTheme", { volume: 0.2, loop: true });

// });


k.loadSprite("bean", "sprites/bean.png");

const bean = k.add([
    k.pos(width() / 2, height() - 50),
    k.sprite("bean"),
    k.body(),
    area(),
    scale(0.5),
    anchor("botleft"),
    "bean",
    "player",

]);



k.onKeyDown("space", () => {
    if (bean.isGrounded()) {
        bean.jump(Math.max(570, Math.abs(velocity) * 2.1));
    }
}
);


let velocity = 0;
let acceleration = 2;
const maxSpeed = 1000;
const friction = 50; // Slow down when no key is pressed

onUpdate(() => {
    if (isKeyDown("d")) {
        if (velocity < 0) velocity = Math.min(velocity + friction, 0);
        velocity = Math.min(velocity + acceleration * acceleration, maxSpeed);
    } else if (isKeyDown("a")) {
        if (velocity > 0) velocity = Math.max(velocity - friction, 0);
        velocity = Math.max(velocity - acceleration * acceleration, -maxSpeed);
    } else {
        if (bean.isGrounded()) {
            if (velocity > 0) velocity = Math.max(velocity - friction, 0);
            if (velocity < 0) velocity = Math.min(velocity + friction, 0);
        }
    }

    onCollide("player", "wall", () => {
        if (bean.isGrounded()) {
            velocity = 0;
        }
        else {
            velocity = velocity * -1;
        }
    });

    bean.move(velocity, 0);
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



// k.viewport.follow(bean);

function wallSpawner(wallPosY) {
    for (let i = 0; i < 10; i++) {
        const leftWall = add([
            rect(5, height()),
            pos(0, wallPosY),
            area(),
            body({ isStatic: true }),
            color(127, 200, 255),
            "wall",
            "leftwall",
        ]);
        const rightWall = add([
            rect(5, height()),
            pos(width() - 5, wallPosY),
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

let leftWall = wallSpawner(0);
setInterval(() => {
    if (leftWall.pos.y > getCamPos().y - 500) {
        leftWall = wallSpawner(leftWall.pos.y - height());
    }
    get("wall").forEach(wall => {
        if (wall.pos.y > getCamPos().y + 500) {
            wall.destroy();
        }
    })
}, 500);


// wallSpawner(-height());

// setInterval(() => {
// }, 1000);

function platformSpawner(platformPosY) {
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

let currentPlatform = platformSpawner(bean.pos.y - 50);

setInterval(() => {
    if (currentPlatform.pos.y > getCamPos().y - 500) {
        currentPlatform = platformSpawner(currentPlatform.pos.y - 100);
    }
    get("platform").forEach(platform => {
        if (platform.pos.y > getCamPos().y + 500) {
            platform.destroy();
        }
    })
}, 500);


onUpdate(() => { // Adds collision when the player is above any given platform
    get("platform").forEach(platform => {
        if (bean.pos.y < platform.pos.y - 20) {
            platform.use(area({ shape: new Rect(vec2(0, -platform.height), platform.width, 1) }))
        }
    });
});

onUpdate(() => { // Removes collision when the player is below any given platform
    get("platform").forEach(platform => {
        if (bean.pos.y > platform.pos.y) {
            platform.unuse("area");
        }
    });
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
let bgMusic;


let startMusic = onUpdate(() => {
    if (startScroll) {
        bgMusic = k.play("spicyTheme", { volume: 0.2, loop: true });
        startMusic.cancel();
    }
});

k.onUpdate(() => {
    if (bean.pos.y < height() / 2) {
        startScroll = true;
    }
    if (startScroll) {
        if (bean.pos.y < camPosition.y - height() / 3) {
            camsSpeed = -4;
        }
        else {
            camsSpeed = -height() / 600;
        }
        setCamPos(camPosition.x, camPosition.y);
        camPosition.y += camsSpeed;
    }
    if (bean.pos.y > camPosition.y + height()) {
        isDead = true;
        shakeOnDeath();
        bgMusic.stop();
    }
});


k.on
