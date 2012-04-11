//
// JQuery Carte plugins
//
(function($) {

var methods = {
  init: function(options) {
    var options = $.extend({ title: 'No title' }, options);
    return this.each(function() {
      var $this = $(this);
      if (options.title) { 
        $this.attr('title', options.title);
      }
      $this.svg();
      $this.svg('get').load(options.mapURL, { changeSize: true });
      loadItems($this, options.itemsURL);
    });
  },

  title: function(title) {
    if (title) {
      return $(this).attr('title', title);
    } else {
      return $(this).attr('title');
    }
  },

  // Initialise the legend. If no options is given it cleans the legend.
  // Options are:
  //  min     the minimum value
  //  max     the maximum value (will be rounded according to levels)
  //  levels  number of levels in the gradient
  //
  legend: function(options) {
    var $this = $(this);
    var svg = $this.svg('get');
    var elt = $this.find('#legende');
                    elt.children().each(function() { svg.remove(this); });
 
    if (isUndefined(options)) { return this; }

    var legend = $.extend({ min: 0, max: 0, title: 'Legend' }, options);
    legend.elt = elt;
    legend.delta = legend.max - legend.min;

    if (!legend.levels) {
      if (legend.delta < 10) {
        legend.levels = legend.delta;
      } else {
        legend.levels = 5;
      }
    }

    legend.step = legend.delta / legend.levels;
    if (legend.step < 10.0) {
       legend.step = Math.ceil(legend.step);
    } else {
       var i = 0;
       while(legend.step >= 100) {
         legend.step /= 10;
         i++;
       }
       legend.step = Math.ceil(legend.step) * Math.pow(10, i);
    }
    
    if (legend.max == 0) {
      legend.norm_factor = 1.0;
    } else {
      legend.norm_factor = (legend.step * legend.levels) / (lum_max - lum_min);
    }
  
 
    var y = 300;
    for (var val = legend.min; val <= legend.max; val += legend.step) {
      var col = LegendGetColor(legend, val);
      svg.rect(legend.elt, 510, y, 24, 15, { fill: col, stroke: '#5d5d5d', strokeWidth: 0.25 });
  
      svg.text(legend.elt, 540, y + 2, "" + val, {fontSize: '8px'});
      y -= 15;
    }

    if (legend.title) {
      svg.text(legend.elt, 510, y, legend.title, {fontSize: '9px'});
    }
    
    return $this.data('legend', legend);
  },

  // Find item by attribute value or index
  // e.g { attr: "id", value: "FR-01" }
  // e.g { index: 42 }
  //
  item: function(options) {
    var items = $(this).data('items');
    if (isDefined(options.index)) {
      return items[options.index];
    } else if (isDefined(options.attr) && isDefined(options.value)) {
      for (var i = 0; i < items.length; i++) {
        var obj = items[i];
        if (obj[options.attr] == options.value) {
          return obj;
        }
      }
    }
    return undefined;
  },

  set: function(options) {
    if (isUndefined(options) || isUndefined(options.id)) {
       return this;
    }
    var elt = $(this).find('#' + options.id);

    if (isDefined(options.value)) {
      elt.css('fill', LegendGetColor($(this).data('legend'), options.value))
    }
    if (isDefined(options.title)) {
      elt.attr('title', options.title);
    }
    return this;
  }
};

$.fn.carte = function(method) {                   
  if (methods[method]) {
    return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
  } else if (typeof method === 'object' || ! method) {
    return methods.init.apply(this, arguments);
  } else {
    $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
  }    
};

// Private functions

function isUndefined(v) {
  return typeof v === 'undefined';
}

function isDefined(v) {
  return typeof v !== 'undefined';
}

function loadItems(This, itemsURL) {
  $.ajax({
    url: itemsURL,
    async: false,
    cache: true,
    dataType: 'json',
    error: function(data) {
             This.element.html('Could not load items data file.');
           },
    success: function(data) {
             This.data('itemsTitle', data.title);
             This.data('items', data.items);
           }
   });
}

// Functions to manage the color gradient of the legend.
// TODO: make something more generic, using a css gradient for instance?

var lum_min = 45;
var lum_max = 100;

function LegendGetColor(leg, val) {
  var v = (val - leg.min) / leg.step;
  v = Math.ceil(v) * leg.step;
  return getColor(leg, v);
}

function getColor(leg, val) {
  var lum = Math.floor(lum_max - val / leg.norm_factor);
  var col = 'hsl(32, 100, ' + lum + ')';
  return $.xcolor.test(col).getHex();
}

})(jQuery);

