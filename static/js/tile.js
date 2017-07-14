var tiles = []

$(function(){

  // defers images
  $("header, section").attr("id", $(this).attr("tid"));

  // sets up snapping, nav animation
  tiles = $('header, section')

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

  hashUpdate()
  navUpdate()

  $(document).scroll(function() {
    hashUpdate()
    navUpdate()
  })

  $root.bind('scroll mousedown wheel DOMMouseScroll mousewheel keyup', function(e){
    if ( e.which > 0 || e.type == "mousedown" || e.type == "mousewheel"){
      $root.stop();
    }
  })

  $(document).scroll(function(e) {
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

      console.log(lastPast)

      var id = "#" + $.attr(lastPast, 'id')
      var hashname = $.attr(lastPast, 'hashname')
      $root.animate({
        scrollTop: $(id).offset().top
      }, 1000, 'easeInOutExpo', function () {
        window.location.hash = hashname
      })


    }, 275))
  })
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
