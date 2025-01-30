import kaplay from "kaplay";
// import "kaplay/global"; // uncomment if you want to use without the k. prefix

const k = kaplay();

k.loadRoot("./"); // A good idea for Itch.io publishing later
k.loadSprite("bean", "sprites/bean.png");

const bean = k.add([
    k.pos(80, 40),
    k.sprite("bean"),
    body(),
    area(),

]);

k.onKeyPress("space", () => {
    if (bean.isGrounded()) {
        bean.jump(500);
    }
}
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
    }});

bean.onCollide("tree", () => {
    k.addKaboom(bean.pos);
    shake(10);
});


function spawnTree() {
    add([
        rect(48, 64),
        area(),
        outline(4),
        pos(width(), height() - 48),
        anchor("botleft"),
        color(255, 180, 255),
        move(LEFT, 240),
        "tree", // add a tag here
    ]);

    wait(rand(1, 2), () => {
        spawnTree();
    });
}

spawnTree();

k.onClick(() => k.addKaboom(k.mousePos()));

k.setGravity(900)


add([
    rect(width(), 48),
    pos(0, height() - 48),
    outline(4),
    area(),
    body({ isStatic: true }),
    color(127, 200, 255),
]);