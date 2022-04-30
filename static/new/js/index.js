/** requires in-view.js */

/**
 * Animated stats counter
 */

inView.offset(0);

function step(elem, value, total) {
    elem.innerHTML = "" + value;
    if (value != total) {
        setTimeout(function () {
            step(elem, value + 1, total);
        }, (1200 - total * 5) / (value + 5));
    }
}

function animateNumber(className) {
    const elements = document.getElementsByClassName(className);
    for (let i = 0; i < elements.length; i++) {
        const elem = elements[i];
        inView("#" + elem.id).once("enter", function () {
            const total = Number(elem.innerHTML);
            elem.innerHTML = "1";
            setTimeout(function () {
                step(elem, 1, total);
            }, (800 - total * 10) / 2);
        });
    }
}

animateNumber("team-stat-value");

// setInterval(function() {
//     if(document.documentElement.clientHeight * 0.22 < window.scrollY) {
//         document.getElementById("member-link").style.visibility = "hidden";
//     } else {
//         //document.getElementById("member-link").style.visibility = "visible";
//     }
// }, 1000);

/**
 * WE ARE INVENTORS
 */

const landingText = document.getElementById("landing-banner-secondary-text");
const texts = ["Inventors", "Engineers", "Problem Solvers", "Family", "1072"];
let textIndex = 0;
let text = texts[textIndex];
let index = 0;
let typing = false;

function addLetter() {
    index += 1;
    landingText.innerHTML =
        "We are " + text.substring(0, index) + (typing ? "|" : "");
    if (index == text.length) {
        setTimeout(removeLetter, 2000);
    } else {
        setTimeout(addLetter, 100);
    }
}

function removeLetter() {
    if (textIndex == texts.length - 1) return;
    index -= 1;
    landingText.innerHTML =
        "We are " + text.substring(0, index) + (typing ? "|" : "");
    if (!index) {
        //landingText.innerHTML = "We are" + (typing ? "|" : "");
    }
    if (index + 1) {
        setTimeout(removeLetter, 100);
    } else {
        textIndex++;
        text = texts[textIndex % texts.length];
        setTimeout(addLetter, 200);
    }
}

setInterval(function () {
    typing = typing == false;
    if (typing) {
        landingText.classList.add("landing-text-shift");
    } else {
        landingText.classList.remove("landing-text-shift");
    }
    if (typing && !landingText.innerHTML.endsWith("|")) {
        landingText.innerHTML += "|";
    } else if (!typing && landingText.innerHTML.endsWith("|")) {
        landingText.innerHTML = landingText.innerHTML.slice(0, -1);
    }
}, 700);

window.addEventListener("load", function () {
    setTimeout(function () {
        addLetter();
    }, 1500);
});

/**
 * SLIDESHOW
 */

const hrefs = [];
const bottom = document.getElementById("landing-banner-image");
const _top = document.getElementById("landing-banner-image-top");
for (let i = 1; i <= 5; i++) {
    hrefs.push(
        "/new/img/media/index/landing-background" + (!(i - 1) ? "" : i) + ".png"
    );
}
bottom.src = hrefs[0];
_top.src = hrefs[1];
let img = 1;

function startSwitch() {
    // bottom.classList.add("fade-out");
    _top.classList.add("fade-in");
    setTimeout(nextSwitch, 1500);
}

function nextSwitch() {
    // bottom.classList.remove("fade-out");
    _top.classList.remove("fade-in");

    bottom.src = hrefs[img];
    img = ++img % hrefs.length;
    _top.src = hrefs[img];

    setTimeout(startSwitch, 2800);
}

setTimeout(startSwitch, 4000);
