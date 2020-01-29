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

const canvas = document.getElementById('interactive-background');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", (event) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
})

let mousePos = [];
window.addEventListener("mousemove", (event) => {
    mousePos.push([event.clientX, event.clientY]);
});

window.addEventListener("touchmove", (event) => {
    mousePos.push([event.changedTouches.item(0).clientX, event.changedTouches.item(0).clientY]);
});

let eqnResult;
let hueValue = 0;
let tPast = (new Date().getTime() % 20000) / 20000 * 12 * Math.PI;

function draw() {
    let t = (new Date().getTime() % 20000) / 20000 * 12 * Math.PI;
    let tDelta = t - tPast;
    tPast = t;

    let eqnCurrentResult = [
        Math.sin(t) * (Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t)) - Math.pow(Math.sin(t / 12), 5),
        Math.cos(t) * (Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t)) - Math.pow(Math.sin(t / 12), 5),
    ];

    if (!eqnResult) {
        eqnResult = eqnCurrentResult;
    }

    let rectScale = Math.min(window.innerWidth, window.innerHeight);

    ctx.beginPath();
    ctx.moveTo(window.innerWidth / 2 - eqnResult[0] / 6 * rectScale, rectScale / 2 + 20 - eqnResult[1] / 6 * rectScale);
    ctx.lineTo(window.innerWidth / 2 - eqnCurrentResult[0] / 6 * rectScale, rectScale / 2 + 20 - eqnCurrentResult[1] / 6 * rectScale);
    hueValue = (hueValue + tDelta / 10 + Math.random() * 0.01 + 1) % 1;
    let color = hslToRgb(hueValue, 1, 0.5);
    ctx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    for (let i = 0; i < mousePos.length - 1; i++) {
        ctx.moveTo(mousePos[i][0], mousePos[i][1]);
        ctx.lineTo(mousePos[i + 1][0], mousePos[i + 1][1]);
    }
    mousePos.splice(0, mousePos.length - 1);
    ctx.stroke();

    ctx.fillStyle = 'rgba(18,18,18,0.075)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    eqnResult = eqnCurrentResult;

    window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);