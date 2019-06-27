/** requires in-view.js */

inView.offset(0);

function step(elem, value, total) {
    elem.innerHTML = "" + value;
    if(value != total) {
        setTimeout(function() {
            step(elem, value + 1, total);
        }, (1200 - total * 5) / (value + 5))
    }
}

function animateNumber(className) {
    const elements = document.getElementsByClassName(className);
    for(let i = 0;i < elements.length;i ++) {
        const elem = elements[i];
        inView("#" + elem.id).once("enter", function() {
            const total = Number(elem.innerHTML);
            elem.innerHTML = "1";
            setTimeout(function() {
                step(elem, 1, total);
            }, (800 - total * 10) / 2);
        });
    }
}

animateNumber("team-stat-value");

setInterval(function() {
    if(document.documentElement.clientHeight * 0.22 < window.scrollY) {
        console.log("ree");
        document.getElementById("member-link").style.visibility = "hidden";
    } else {
        //document.getElementById("member-link").style.visibility = "visible";
    }
}, 1000);

const landingText = document.getElementById("landing-banner-text");
const texts = ["Engineers", "Inventors", "Problem Solvers", "Family", "Harker Robotics"];
let textIndex = 0;
let text = texts[textIndex];
let index = 0;
let typing = false;

function addLetter() {
    index += 1;
    landingText.innerHTML = "We are " + text.substring(0, index) + (typing ? "|" : "");
    if(index == text.length) {
        setTimeout(removeLetter, 2000);
    } else {
        setTimeout(addLetter, 150);
    }
}

function removeLetter() {
    index -= 1;
    landingText.innerHTML = "We are " + text.substring(0, index) + (typing ? "|" : "");
    if(!index) {
        //landingText.innerHTML = "We are" + (typing ? "|" : "");
    }
    if(index + 1) {
        setTimeout(removeLetter, 150);
    } else {
        textIndex++;
        text = texts[textIndex % texts.length];
        setTimeout(addLetter, 150);
    }
}

setInterval(function() {
    typing = typing == false;
    landingText.style.marginLeft = typing ? "1.94vw" : "0";
    if(typing && !landingText.innerHTML.endsWith("|")) {
        landingText.innerHTML += "|";
    } else if(!typing && landingText.innerHTML.endsWith("|")) {
        landingText.innerHTML = landingText.innerHTML.slice(0, -1);
    }
}, 800)

window.addEventListener("load", function() {
    setTimeout(function() {
        addLetter();
    }, 1100);
});