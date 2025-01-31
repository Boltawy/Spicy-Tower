import kaplay from "kaplay";
// import "kaplay/global"; // uncomment if you want to use without the k. prefix

const k = kaplay(
    {
        debug: true,
        debugKey: "r",
        global: true,
        width: 360,
        height: 800,
        letterbox: false,
        stretch: false,

    }
);

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
        bean.jump(Math.max(570, Math.abs(velocity) * 2));
    }
}
);


let velocity = 0;
let acceleration = 2.1;
const maxSpeed = 900;
const friction = 100; // Slow down when no key is pressed

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
        velocity = velocity * -1;
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
    for (let i = 0; i < 5; i++) {
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
    }

}

wallSpawner(0);
// wallSpawner(-height());

// setInterval(() => {
// }, 1000);

function platformSpawner(platformPosY) {
    let spawnedPlatform;
    for (let i = 0; i < 10; i++) {
        spawnedPlatform = add([
            rect(rand(50, 500), 30),
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

let initialPlatformPosY = bean.pos.y - 50;
let currentPlatform = platformSpawner(initialPlatformPosY);
debug.log(currentPlatform.pos);

setInterval(() => {
    if (currentPlatform.pos.y > getCamPos().y - 500) {
        currentPlatform = platformSpawner(currentPlatform.pos.y - 100);
    }
    get("platform").forEach(platform => {
        if (platform.pos.y > getCamPos().y + 500) {
            platform.destroy();
        }
    })
}, 1000);


onUpdate(() => { // Adds collision when the player is above a platform
    get("platform").forEach(platform => {
        if (bean.pos.y < platform.pos.y - 20) {
            platform.use(area({ shape: new Rect(vec2(0, -platform.height), platform.width, 1) }))
        }
    });
});

onUpdate(() => { // Removes collision when the player is below a platform
    get("platform").forEach(platform => {
        if (bean.pos.y > platform.pos.y) {
            platform.unuse("area");
        }
    });
});

let camPosition = {
    x: 0,
    y: 0
}

camPosition.x = width() / 2;
camPosition.y = height() / 2;

let camsSpeed = -height() / 600;

setTimeout(() => {
    onUpdate(() => {
        setCamPos(camPosition.x, camPosition.y); // Moves the camera upwards
        camPosition.y += camsSpeed;
    });
}, 2000);

setTimeout(() => {
    camsSpeed = -height() / 700;
}, 20000);
