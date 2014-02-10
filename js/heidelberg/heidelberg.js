(function() {

  function Heidelberg(el, options) {

    // Allow developer to omit new when instantiating
    if (!(this instanceof Heidelberg)) {
      if (el.length) {
        Array.prototype.forEach.call(el, function(n) {
          return new Heidelberg(n, options);
        });
      } else {
        return new Heidelberg(el, options);
      }
    }

    if (this === window) {
      return;
    }

    // OPTIONS
    var defaults = {
      nextButton: $(),
      previousButton: $(),
      hasSpreads: false,
      canClose: false,
      arrowKeys: true,
      concurrentAnimations: null,
      onPageTurn: function() {},
      onSpreadSetup: function() {}
    };

    this.options = $.extend({}, defaults, options);

    !this.options.concurrentAnimations || this.options.concurrentAnimations++;

    // PRIVATE VARIABLES
    // Main element always a jQuery object
    this.el = (el instanceof jQuery) ? el : $(el);

    // RUN
    this.init();

  };

  Heidelberg.prototype.init = function() {

    var el       = this.el;
    var options  = this.options;

    $(window).load(function() {
      el.addClass('ready');
    });

    if(options.hasSpreads) {
      this.setupSpreads();
    }

    var els = {
      pages:       $('.Heidelberg-Page', el),
      pagesLeft:  options.canClose ? $('.Heidelberg-Page:nth-child(2n)', el) : $('.Heidelberg-Page:nth-child(2n+1)', el),
      pagesRight: options.canClose ? $('.Heidelberg-Page:nth-child(2n+1)', el) : $('.Heidelberg-Page:nth-child(2n)', el),
    };

    if(!options.canClose) {
      var coverEl = $('<div />').addClass('Heidelberg-HiddenCover');
      el.prepend(coverEl.clone());
      el.append(coverEl.clone());
      els.pages.eq(0).add(els.pages.eq(1)).addClass('is-active');
    }
    else {
      els.pages.eq(0).addClass('is-active');
    }

    els.previousTrigger = els.pagesLeft.add(options.previousButton);
    els.nextTrigger     = els.pagesRight.add(options.nextButton);

    els.previousTrigger.on('click', function() {
      this.turnPage('back');
    }.bind(this));

    els.nextTrigger.on('click', function() {
      this.turnPage('forwards');
    }.bind(this));

    if(typeof Hammer !== 'undefined') {
      opts = {
        drag_min_distance: 5,
        swipe_velocity: 0.3
      }
      Hammer(els.pagesLeft, opts).on("dragright", function(evt) {
        this.turnPage('back');
      }.bind(this));

      Hammer(els.pagesRight, opts).on("dragleft", function(evt) {
        this.turnPage('forwards');
      }.bind(this));
    }

    var forwardsKeycode = 37;
    var backKeycode = 39;

    if($('html').hasClass('no-csstransforms3d')) {
      forwardsKeycode = 39;
      backKeycode = 37;
    }

    if(options.arrowKeys) {
      $(document).keydown(function(e){
        if (e.keyCode == forwardsKeycode) {
          this.turnPage('forwards');
          return false;
        }
        if (e.keyCode == backKeycode) {
          this.turnPage('back');
          return false;
        }
      }.bind(this));
    }
  };

  Heidelberg.prototype.turnPage = function(direction) {

    var el = this.el;
    var els = {};
    var options = this.options;

    els.pages = $('.Heidelberg-Page', el);

    if((els.pages.last().hasClass('is-active') && direction == 'forwards') ||
       (els.pages.first().hasClass('is-active') && direction == 'back') ||
        (options.concurrentAnimations && $('.Heidelberg-Page.is-animating', el).length > options.concurrentAnimations))
    {
      return
    }

    els.isActive       = $('.Heidelberg-Page.is-active', el);
    els.isAnimatingOut = (direction == 'back') ? els.isActive.first() : els.isActive.last();

    $('.Heidelberg-Page.was-active', el).removeClass('was-active');

    if (direction == 'back') {
      els.isAnimatingIn = els.isAnimatingOut.prev();
      els.newActive     = els.isAnimatingIn.add(els.isAnimatingIn.prev());
    }

    if (direction == 'forwards') {
      els.isAnimatingIn = els.isAnimatingOut.next();
      els.newActive     = els.isAnimatingIn.add(els.isAnimatingIn.next());
    }

    els.isActive.removeClass('is-active').addClass('was-active');
    els.newActive.addClass('is-active');

    els.isAnimating = els.isAnimatingIn.add(els.isAnimatingOut);

    els.isAnimating.addClass('is-animating');
    els.isAnimating.on('webkittransitionEnd otransitionend mstransitionEnd transitionend', function () {
      els.isAnimating.removeClass('is-animating');
    }.bind(document));

    options.onPageTurn(el, els);

  };

  Heidelberg.prototype.setupSpreads = function() {

    var el      = this.el;
    var options = this.options;

    $('.Heidelberg-Spread', el).each(function() {
      var spreadEl = $(this);
      var pageEl   = $('<div />').addClass('Heidelberg-Page with-Spread').html(spreadEl.clone());
      spreadEl.after(pageEl);
      spreadEl.replaceWith(pageEl.clone());
    });

    options.onSpreadSetup(el);
  }

  // expose Heidelberg
  window.Heidelberg = Heidelberg;

})();
