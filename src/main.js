import kaplay from "kaplay";
// import "kaplay/global"; // uncomment if you want to use without the k. prefix

const k = kaplay();

k.loadRoot("./"); // A good idea for Itch.io publishing later
k.loadSprite("bean", "sprites/bean.png");

const bean = k.add([
    k.pos(540, 40),
    k.sprite("bean"),
    body(),
    area(),
    "bean",
    "player",

]);

k.onKeyPress("space", () => {
    if (bean.isGrounded()) {
        bean.jump(700);
    }}
);

let isSprinting = false;

k.onKeyDown("shift", () => {
    isSprinting = true;
}
);

k.onKeyRelease("shift", () => {
    isSprinting = false;
});

k.onKeyDown("a", () => {
    if (isSprinting) {
        bean.move(-400, 0);
    }
    else {
        bean.move(-200, 0);
    }
});

k.onKeyDown("d", () => {
    if (isSprinting) {
        bean.move(400, 0);
    }
    else {
        bean.move(200, 0);
    }
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
        rect(100, 30),
        pos(rand(480, width() - 480), 0),
        outline(4),
        body({ isStatic: true }),
        color(127, 200, 255),
        move(DOWN, 100),
        offscreen({ destroy: true }),
        "platform",
    ]);



    wait(rand(1, 2), () => {
        spawnPlatform();
    });
}

onUpdate(() => {
    get("platform").forEach(platform => {
        if (bean.pos.y < platform.pos.y) {
            platform.use(area());
        }
    });
});

onUpdate(() => {
    get("platform").forEach(platform => {
        if (bean.pos.y > platform.pos.y) {
            platform.unuse("area");
        }
    });
});




spawnPlatform();