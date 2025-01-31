import kaplay from "kaplay";
// import "kaplay/global"; // uncomment if you want to use without the k. prefix

const k = kaplay(
    {
        debug: true,
        global: true,
        width: 1280,
        height: 720

    }
);

k.loadSprite("bean", "sprites/bean.png");

const bean = k.add([
    k.pos(540, 700),
    k.sprite("bean"),
    body(),
    area(),
    anchor("botleft"),
    "bean",
    "player",

]);


k.onKeyPress("space", () => {
    if (bean.isGrounded()) {
        bean.jump(Math.max(600, Math.abs(velocity) * 2));
    }
}
);


let velocity = 0;
let acceleration = 3;
const maxSpeed = 500;
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

function wallSpawner(wallPosY) {
    for (let i = 0; i < 5; i++) {
        const leftWall = add([
            rect(480, height()),
            pos(0, wallPosY),
            area(),

            body({ isStatic: true }),
            color(127, 200, 255),
            "wall",
            "leftwall",
        ]);
        const rightWall = add([
            rect(480, height()),
            pos(width() - 480, wallPosY),
            area(),
            body({ isStatic: true }),
            color(127, 200, 255),
            "wall",
            "rightwall",
        ]);

        wallPosY -= height();
    }



    // wait(10, () => {
    //     wallSpawner(wallPosY);
    // });
}

wallSpawner(0);
// wallSpawner(-height());



function platformSpawner(platformPosY) {
    let spawnedPlatform;
    for (let i = 0; i < 10; i++) {
        spawnedPlatform = add([
            rect(rand(100, 400), 30),
            pos(0, platformPosY),
            outline(4),
            anchor("botleft"),
            body({ isStatic: true }),
            color(127, 200, 255),
            "platform",
        ]);

        spawnedPlatform.pos.x = rand(480, width() - 480 - spawnedPlatform.width);
        platformPosY -= 100;
    }

    return spawnedPlatform; //return last generated platform
}

let initialPlatformPosY = bean.pos.y - 50;
let currentPlatform = platformSpawner(initialPlatformPosY);

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
        if (bean.pos.y < platform.pos.y - 30) {
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

let camsSpeed = -2;

setTimeout(() => {
    onUpdate(() => {
        setCamPos(camPosition.x, camPosition.y); // Moves the camera upwards
        camPosition.y += camsSpeed;
    });
}, 2000);

setTimeout(() => {
    camsSpeed = -3;
}, 20000);
