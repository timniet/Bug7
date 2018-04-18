//
// http://screen-bug.googlecode.com/git/index.html
//
// Copyright ©2011 Kernc (kerncece ^_^ gmail)
// Released under WTFPL license.
//
// ==ClosureCompiler==
// @compilation_level SIMPLE_OPTIMIZATIONS
// @js_externs style.OTransform
// @js_externs style.msTransform
// @js_externs style.KhtmlTransform
// @output_file_name screenbug-min.js
// ==/ClosureCompiler==

/**
 * @preserve WWW: http://screen-bug.googlecode.com/git/index.html
 * Released under WTFPL license.
 */

/** @type {string} */ CSSProperties.prototype.OTransform;
/** @type {string} */ CSSProperties.prototype.msTransform;
/** @type {string} */ CSSProperties.prototype.KhtmlTransform;

(function() {
  /** @const */ var image_stationary = 'https://screen-bug.googlecode.com/git/fruitfly.png';
  /** @const */ var image_moving = image_stationary;  // can be replaced with a moving image
  /** @const */ var move_speed = 2;  // speed modifier
  var angle_deg = 90;
  var angle_rad = deg2rad(angle_deg);
  var large_turn_angle_deg = 0;
  /** @const */ var edge_resistance = 50;
  /** @const */ var NEAR_TOP_EDGE = 1;
  /** @const */ var NEAR_BOTTOM_EDGE = 2;
  /** @const */ var NEAR_LEFT_EDGE = 4;
  /** @const */ var NEAR_RIGHT_EDGE = 8;
  /** @const */ var directions = {}  // 0 degrees starts on the East
  /** @const */ directions[NEAR_TOP_EDGE] = 270;
  /** @const */ directions[NEAR_BOTTOM_EDGE] = 90;
  /** @const */ directions[NEAR_LEFT_EDGE] = 0;
  /** @const */ directions[NEAR_RIGHT_EDGE] = 180;
  /** @const */ directions[NEAR_TOP_EDGE + NEAR_LEFT_EDGE] = 315;
  /** @const */ directions[NEAR_TOP_EDGE + NEAR_RIGHT_EDGE] = 225;
  /** @const */ directions[NEAR_BOTTOM_EDGE + NEAR_LEFT_EDGE] = 45;
  /** @const */ directions[NEAR_BOTTOM_EDGE + NEAR_RIGHT_EDGE] = 135;
  var near_edge = 0;
  var edge_test_counter = 10;
  var small_turn_counter = 0;
  var large_turn_counter = 0;
  var toggle_stationary_counter = Math.random() * 50;
  var stationary = false;
  var bug = null;
  var transform = undefined;
  
  function init() {
    bug = document.createElement('img');
    bug.src = image_moving;
    (new Image()).src = image_stationary;  // preload
    bug.style.position = 'fixed';
    bug.style.zIndex = '99';
    bug.top = random(edge_resistance, document.documentElement.clientHeight - edge_resistance);
    bug.top = bug.top > 0 ? bug.top : -bug.top;
    bug.left = random(edge_resistance, document.documentElement.clientWidth - edge_resistance);
    bug.left = bug.left > 0 ? bug.left : -bug.left;
    bug.style.top = bug.top + 'px';
    bug.style.left = bug.left + 'px';
    document.body.appendChild(bug);
    next_small_turn();
    next_large_turn();
    
    if ('transform' in bug.style) transform = transforms['w3c'];
    var vendors = 'Moz Webkit O Ms Khtml'.split(' ')
    for (i in vendors)
      if (vendors[i] + 'Transform' in bug.style) {
        transform = transforms[vendors[i]];
        break;
      }
    
    angle_deg = random(0, 360);
    if (transform) setInterval(main, 100);
  };
  function main() {
    if (--toggle_stationary_counter <= 0)
      toggle_stationary();
    if (stationary) return;
    
    if (--edge_test_counter <= 0 && bug_near_window_edge()) {
      // if near edge, go away from edge
      angle_deg %= 360;
      if (angle_deg < 0) angle_deg += 360;
      
      if (abs(directions[near_edge] - angle_deg) > 15) {
        var angle1 = directions[near_edge] - angle_deg;
        var angle2 = (360 - angle_deg) + directions[near_edge];
        large_turn_angle_deg = (abs(angle1) < abs(angle2) ? angle1 : angle2);
        
        edge_test_counter = 10;
        large_turn_counter = 100;
        small_turn_counter = 30;
      }
    }
    if (--large_turn_counter <= 0) {
      large_turn_angle_deg = random(1, 150);
      next_large_turn();
    }
    if (--small_turn_counter <= 0) {
      angle_deg += random(1, 10);
      next_small_turn();
    } else {
      var dangle = random(1, 5);
      if (large_turn_angle_deg > 0 && dangle < 0 || large_turn_angle_deg < 0 && dangle > 0)
        dangle = -dangle;  // ensures both values either + or -
      large_turn_angle_deg -= dangle;
      angle_deg += dangle;
    }

    angle_rad = deg2rad(angle_deg);
    var dx = Math.cos(angle_rad) * move_speed;
    var dy = -Math.sin(angle_rad) * move_speed;
    move(dx, dy);
    transform("rotate(" + (90 - angle_deg) + "deg)");
  };
  function MozTransform(s) { bug.style.MozTransform = s; };
  function WebkitTransform(s) { bug.style.WebkitTransform = s; };
  function OTransform(s) { bug.style.OTransform = s; };
  function MsTransform(s) { bug.style.msTransform = s; };
  function KhtmlTransform(s) { bug.style.KhtmlTransform = s; };
  function W3Ctransform(s) { bug.style.transform = s; };
  var transforms = {
    'Moz': MozTransform,
    'Webkit': WebkitTransform,
    'O': OTransform,
    'Ms': MsTransform,
    'Khtml': KhtmlTransform,
    'w3c': W3Ctransform
  };
  function move(dx, dy) {
    bug.style.top = (bug.top += dy) + 'px';
    bug.style.left = (bug.left += dx) + 'px';
  };
  function next_small_turn() { small_turn_counter = round(Math.random() * 10); };
  function next_large_turn() { large_turn_counter = round(Math.random() * 40); };
  function next_stationary() { toggle_stationary_counter = random(50, 300); };
  function random(min, max) {
    var result = round(min + Math.random() * max);
    return Math.random() > 0.5 ? result : -result;
  };
  function bug_near_window_edge() {
    near_edge = 0;
    if (bug.top < edge_resistance)
      near_edge |= NEAR_TOP_EDGE;
    else if (bug.top > document.documentElement.clientHeight - edge_resistance)
      near_edge |= NEAR_BOTTOM_EDGE;
    if (bug.left < edge_resistance)
      near_edge |= NEAR_LEFT_EDGE;
    else if (bug.left > document.documentElement.clientWidth - edge_resistance)
      near_edge |= NEAR_RIGHT_EDGE;
    return near_edge;
  };
  function toggle_stationary() {
    stationary = ! stationary;
    next_stationary();
    
    if (stationary) {
      bug.src = image_stationary;
      enable_onmousemove_event();
    } else {
      bug.src = image_moving;
      disable_onmousemove_event();
    }
  };
  function enable_onmousemove_event() {
    if(document.addEventListener)  // FF, Chrome et al.
      document.addEventListener('mousemove', check_if_mouse_close_to_bug, false);
    else if(document.attachEvent)  // IE
      document.attachEvent('onmousemove', check_if_mouse_close_to_bug); 
  };
  function disable_onmousemove_event() {
    if(document.removeEventListener)  // FF, Chrome et al.
      document.removeEventListener('mousemove', check_if_mouse_close_to_bug, false);
    else if(document.detachEvent)  // IE
      document.detachEvent('onmousemove', check_if_mouse_close_to_bug); 
  };
  function check_if_mouse_close_to_bug(e) {
    e = e || window.event;
    if (e.clientX) {
      posx = e.clientX;
      posy = e.clientY;
    } else if (e.pageX) {
      posx = e.pageX - (document.body.scrollLeft + document.documentElement.scrollLeft);
      posy = e.pageY - (document.body.scrollTop + document.documentElement.scrollTop);
    }
    if (abs(bug.top - posy) + abs(bug.left - posx) < 40) {
      toggle_stationary();
      disable_onmousemove_event();
    }
  };
  var round = Math.round;
  var abs = Math.abs;
  var rad2deg_k = 180 / Math.PI;
  var deg2rad_k = Math.PI / 180;
  function rad2deg(rad) { return rad * rad2deg_k; };
  function deg2rad(deg) { return deg * deg2rad_k; };

  function debug(str) { console.warn(str); };
  
  setTimeout(init, 2000);
})();