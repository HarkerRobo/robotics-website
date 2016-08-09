'use strict'

var tiles = []
var $root = $('html, body')
var autoPhrases = ['ENGINEERS', 'PROBLEM SOLVERS', 'FAMILY', 'HARKER ROBOTICS']
var autoIndex = 0
var auto = document.getElementById('autotype')

$(function(){
  try {
    // scroll to on nav click
    $('.navbar-left > li > a, .navbar-brand').click(function() {
      $($root).stop()
      var href = $.attr(this, 'href')
      var gotoname = $.attr(this, 'gotoname')
      $root.animate({
        scrollTop: $(href).offset().top
      }, 1000, 'easeInOutExpo', function () {
        window.location.hash = gotoname
      })
      return false
    })


    // updates hash and navbar
    tiles = $('header, section')

    hashUpdate()
    navUpdate()

    $(document).scroll(function() {
      hashUpdate()
      navUpdate()
    })


    // snaps on stop scrolling
    $(document).scroll(function() {
      clearTimeout($.data(this, 'scrollTimer'))

      $.data(this, 'scrollTimer', setTimeout(function() {

        var scrollPosition = window.scrollY
        var amt = Math.abs($(tiles[0]).offset().top - scrollPosition)
        var lastPast = tiles[0]
        tiles.each(function(index, value) {
          if(Math.abs($(lastPast).offset().top - scrollPosition) > Math.abs($(value).offset().top) - scrollPosition)
          {
            lastPast = value
          }
        })

        if ($(lastPast).offset().top == scrollPosition)
        {
          return false
        }

        var id = "#" + $.attr(lastPast, 'id')
        var hashname = $.attr(lastPast, 'hashname')
        $root.animate({
          scrollTop: $(id).offset().top
        }, 500, 'easeInOutExpo', function () {
          window.location.hash = hashname
        })


      }, 500))
    })


    // automatic typing on the front page
    setTimeout(autoType, 2000)
  } catch(err) {
    console.log(err)
  }
})

function navUpdate() {
  $('.navbar-left > li > a, .navbar-brand').each(function(){
    if("#" + $(this).attr('gotoname') == window.location.hash)
    {
      $(this).addClass('current-nav')
    } else {
      $(this).removeClass('current-nav')
      $(this).blur()
    }
  })
}

function hashUpdate() {
  var scrollPosition = window.scrollY
  var lastPast = tiles[0]
  tiles.each(function(index, value){
    if(scrollPosition >= $(value).offset().top && $(lastPast).offset().top < $(value).offset().top)
    {
      lastPast = value
    }
  })
  window.location.hash = $(lastPast).attr('hashname')
}

function autoType() {
  autoIndex += 1
  if (autoIndex>autoPhrases.length-1)
  {
    autoIndex = 0
  }
  removeLetterFromAuto()
}

function removeLetterFromAuto() {
  auto.innerHTML = auto.innerHTML.substring(0, auto.innerHTML.length-2) + "|"
  if (auto.innerHTML.length>1) {
    setTimeout(removeLetterFromAuto, 100)
  } else {
    setTimeout(addLetterToAuto, 1000)
  }
}

function addLetterToAuto() {
  var newWord = autoPhrases[autoIndex]
  auto.innerHTML = newWord.substring(0, auto.innerHTML.length) + "|"
  if (auto.innerHTML.length<newWord.length+1) {
    setTimeout(addLetterToAuto, 100)
  } else {
    setTimeout(autoType, 2000)
  }
}
