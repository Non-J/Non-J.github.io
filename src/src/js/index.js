import '../css/index.scss';

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 * Source: https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        let hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }
        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function shuffleArray(array) {
    // Source: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    let currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

const canvas = document.getElementById('interactive-background');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", (event) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
})

let userDrawTrail = [];

window.addEventListener("mouseover", (event) => {
    userDrawTrail.push([event.clientX, event.clientY]);
});
window.addEventListener("touchstart", (event) => {
    if (event.touches.length === 1) {
        userDrawTrail.push([event.changedTouches.item(0).clientX, event.changedTouches.item(0).clientY]);
    }
});

window.addEventListener("mousemove", (event) => {
    userDrawTrail.push([event.clientX, event.clientY]);
});
window.addEventListener("touchmove", (event) => {
    userDrawTrail.push([event.changedTouches.item(0).clientX, event.changedTouches.item(0).clientY]);
});

window.addEventListener("mouseout", (event) => {
    userDrawTrail = [];
});
window.addEventListener("touchend", (event) => {
    if (event.touches.length === 0) {
        userDrawTrail = [];
    }
});

let lorenzParams = [Math.random() * 15 + 10, Math.random() * 15 + 10, Math.random() * 15 + 10];

function generateLorenzTrail(x, y, z, count) {
    let result = [];
    for (let i = 0; i < count; i++) {
        result.push([x, y, z]);
        x += (lorenzParams[0] * (y - x)) / 10000;
        y += (x * (lorenzParams[1] - z) - y) / 10000;
        z += (x * y - lorenzParams[2] * z) / 10000;
    }
    return result;
}

let trails = [];
let hueValue = Math.random();
let time = new Date().getTime();

let randomAxis = shuffleArray([0, 1, 2]);

function draw() {
    let now = new Date().getTime();
    let timeDelta = now - time;
    time = now;

    let rectBox = Math.min(canvas.width, canvas.height) / 1.25;

    while (trails.length < 200) {
        trails.push(generateLorenzTrail((Math.random() - 0.5) * rectBox, (Math.random() - 0.5) * rectBox, (Math.random() - 0.5) * rectBox, Math.round(Math.random() * 2000 + 100)));
    }

    hueValue = (hueValue + timeDelta / 100000 + Math.random() * 0.01 + 1) % 1;
    let color = hslToRgb(hueValue, 1, 0.5);
    ctx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

    for (let trail of trails) {
        ctx.beginPath();
        ctx.moveTo(trail[0][randomAxis[0]] + canvas.width / 2, trail[0][randomAxis[1]] + canvas.height / 2);

        let sampleCount = Math.min(trail.length, timeDelta / 3);

        for (let i = 1; i < sampleCount; i++) {
            ctx.lineWidth = 2 * (trail[i][randomAxis[2]] / rectBox + 0.5);
            ctx.lineTo(trail[i][randomAxis[0]] + canvas.width / 2, trail[i][randomAxis[1]] + canvas.height / 2);
        }
        ctx.stroke();

        trail.splice(0, sampleCount - 1);
    }

    trails = trails.filter((val) => {
        return val.length > 2
    });

    ctx.beginPath();
    for (let i = 0; i < userDrawTrail.length - 1; i++) {
        ctx.lineWidth = 2;
        ctx.moveTo(userDrawTrail[i][0], userDrawTrail[i][1]);
        ctx.lineTo(userDrawTrail[i + 1][0], userDrawTrail[i + 1][1]);
    }
    userDrawTrail.splice(0, userDrawTrail.length - 1);
    ctx.stroke();

    ctx.fillStyle = 'rgba(18,18,18,0.075)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);