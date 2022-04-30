"use strict";

var autoPhrases = ["ENGINEERS", "PROBLEM SOLVERS", "FAMILY", "HARKER ROBOTICS"];
var autoIndex = 0;
var auto = document.getElementById("autotype");

$(function () {
    try {
        // automatic typing on the front page
        setTimeout(autoType, 2000);
    } catch (err) {
        console.log(err);
    }
});

function autoType() {
    autoIndex += 1;
    if (autoIndex > autoPhrases.length - 1) {
        autoIndex = 0;
    }
    removeLetterFromAuto();
}

function removeLetterFromAuto() {
    auto.innerHTML =
        auto.innerHTML.substring(0, auto.innerHTML.length - 2) + "|";
    if (auto.innerHTML.length > 1) {
        setTimeout(removeLetterFromAuto, 100);
    } else {
        setTimeout(addLetterToAuto, 1000);
    }
}

function addLetterToAuto() {
    var newWord = autoPhrases[autoIndex];
    auto.innerHTML = newWord.substring(0, auto.innerHTML.length) + "|";
    if (auto.innerHTML.length < newWord.length + 1) {
        setTimeout(addLetterToAuto, 100);
    } else {
        setTimeout(autoType, 2000);
    }
}
