var tiles = $('header, section')
var $root = $('html, body')
var scrollTimer

var SNAP_WAIT_TIME = 500
var SNAP_ANIM_TIME = 1000
var SNAP_ANIM_TYPE = 'easeInOutExpo'

// defers images
$("header, section").attr("id", $(this).attr("tid"));

// sets up navbar click
$('.navbar-left > li > a, .navbar-brand').click(function() {
  $($root).stop()
  var href = $.attr(this, 'href')
  var gotoname = $.attr(this, 'gotoname')
  snap(href)
})

// stops animation upon scroll
$($root).bind('scroll mousedown wheel DOMMouseScroll mousewheel keyup wheel', function(e){
  console.log(e.type)
  if ( e.which > 0 || e.type == 'mousedown' || e.type == 'mousewheel' || e.type == 'wheel'){
    $($root).stop();
  }
})

/**
 * Gets the element correlating to the tile at the top edge of the screen
 */
function getCurrentTile() {
  var scrollPosition = window.scrollY
  var res = tiles[0]

  tiles.each(function (index, thisTile) {
    var thisTilePosition = $(thisTile).offset().top
    

    if (thisTilePosition <= scrollPosition) 
      res = thisTile
  })
  return res
}

/**
 * Highlights the button in then nav correlating to the current position
 */
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

/**
 * Updates the URL fragment to the current position
 */
function hashUpdate() {
  window.location.hash = $(getCurrentTile()).attr('hashname')
}

/**
 * Snaps the screen to a designated tile
 * @param {JQquery} tile the element or selector corresponding to the designated tile
 */
function snap(tile) {
  $root.animate({
    scrollTop: $(tile).offset().top
  }, SNAP_ANIM_TIME, SNAP_ANIM_TYPE)
}

/**
 * Snaps the screen to the closest tile
 */
function snapToClosest() {
  var scrollPosition = window.scrollY
  var closestTile = tiles[0]

  tiles.each(function (index, curTile) {
    var distToClosest = Math.abs($(closestTile).offset().top - scrollPosition)
    var distToCur = Math.abs($(curTile).offset().top - scrollPosition)

    if (distToClosest > distToCur) closestTile = curTile
  })

  // if the tile is at the top of the screen, don't snap
  if ($(closestTile).offset().top == scrollPosition) return false

  snap(closestTile)  
}

hashUpdate()
navUpdate()

$(document).scroll(function (e) {
  hashUpdate()
  navUpdate()

  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(snapToClosest, SNAP_WAIT_TIME)
})