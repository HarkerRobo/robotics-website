'use strict'

var tiles = []

$(function(){
  tiles = $('header, section')

  hashUpdate()
  navUpdate()

  $(document).scroll(hashUpdate)
  $(document).scroll(navUpdate)
})

function navUpdate() {
  $('.navbar-left > li > a, .navbar-brand').each(function(){
    if("#" + $(this).attr('gotoname') == window.location.hash)
    {
      $(this).addClass('current-nav')
    } else {
      $(this).removeClass('current-nav')
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
