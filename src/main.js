import kaplay from "kaplay";
// import "kaplay/global"; // uncomment if you want to use without the k. prefix

const k = kaplay(
    {
        debug: true,
        global: true,

    }
);

k.loadSprite("bean", "sprites/bean.png");

const bean = k.add([
    k.pos(540, 40),
    k.sprite("bean"),
    body(),
    area(),
    anchor("botleft"),
    "bean",
    "player",

]);


k.onKeyPress("space", () => {
    if (bean.isGrounded()) {
        bean.jump(700);
    }
}
);


k.onKeyDown("a", () => {
    bean.move(-200, 0);
});

k.onKeyDown("d", () => {
    bean.move(200, 0);
});

bean.onCollide("tree", () => {
    k.addKaboom(bean.pos);
    shake(10);
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

const leftWall = add([
    rect(480, height()),
    pos(0, 0),
    area(),
    body({ isStatic: true }),
    color(127, 200, 255),
]);

const rightWall = add([
    rect(480, height()),
    pos(width() - 480, 0),
    area(),
    body({ isStatic: true }),
    color(127, 200, 255),
]);


function spawnPlatform() {
    let platform = add([
        rect(rand(100, 400), 30),
        pos(0, camPosition.y - 500),
        outline(4),
        anchor("botleft"),
        body({ isStatic: true }),
        color(127, 200, 255),
        move(DOWN, 100),
        offscreen({ destroy: true }),
        "platform",
    ]);

    platform.pos.x = rand(480, width() - 480 - platform.width);



    wait(rand(1, 2), () => {
        spawnPlatform();
    });
}


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

setTimeout(() => {
    onUpdate(() => {
        camPos(camPosition.x, camPosition.y); // Moves the camera upwards
        camPosition.y--;
    });
}, 5000);


spawnPlatform();