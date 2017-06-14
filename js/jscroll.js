/**
 * jscroll customize your scrollbar
 * @version : 0.9
 * @author : Nicolas Riciotti
 * @thanks : Clément Caillard
 */

(function($, window){

    'use strict';

    /** Date.now browser compatibility */
    Date.now = Date.now || function() { return new Date().getTime() };

    /** RequestAnimationFrame browser compatibility */
    (function() {

      var lastTime = 0, x = 0,
          vendors = ['ms', 'moz', 'webkit', 'o'];

      for( ; x < vendors.length && !window.requestAnimationFrame; ++x ) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
      }

      if( window.msRequestAnimationFrame ){
        window.requestAnimationFrame = function(callback){
          return window.msRequestAnimationFrame(function(){
            callback( +new Date() );
          });
        }
      }

      if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
          var currTime = Date.now();
          var timeToCall = 1000/60;//Math.max(0, 16 - (currTime - lastTime));
          var id = window.setTimeout(function(){ callback(currTime + timeToCall); }, timeToCall);
          lastTime = currTime + timeToCall;
          return id;
        };

      if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) { clearTimeout(id); };

    }());

    /** check browser capabilities */
    var support = (function(){

        var vendors = [ '', 'Ms', 'O', 'WebKit', 'Webkit', 'Moz' ],
            div     = document.createElement( 'div' );

        function testProperty( prop ){
          if ( prop in div.style ) return true;
          else return getPrefixed( prop ) == false ? false : true;
        };

        function getPrefixed ( prop, cssformat ) {

           var formatForCss = typeof cssformat != "undefined" ? cssformat : true,
               propd, l = vendors.length;

               propd = prop.replace(/(^[a-z])/g, function(val) {
                  return val.toUpperCase();
               }).replace(/\-([a-z])/g, function(val,a) {
                  return a.toUpperCase();
               });

             while( l-- ){
                if ( prop in div.style  ){
                  return prop;
              } else if ( vendors[l] + propd in div.style  ){
                  return formatForCss ? '-' + vendors[l].toLowerCase() + '-' + prop.toLowerCase() : vendors[l] + propd;
                }else if( window[vendors[l].toLowerCase()+propd] != undefined ){
                  return vendors[l].toLowerCase() + propd;
                }else if( typeof window[ vendors[l] + propd ] != 'undefined' ){
                  return vendors[l] + propd;
                }
             }

             return false;
        };

        return {
          prefix : testProperty('transform') ? getPrefixed('transform', false).replace('Transform','') : '',
          cssprefix : testProperty('transform') ? getPrefixed('transform').replace('transform','') : '',
          transition : testProperty('transition'),
          transform : testProperty('transform'),
          translate3d : ( 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix() ) || testProperty( 'perspective' ),
          getPrefixed : getPrefixed,
          test : testProperty
        }

    })();

    /** merge two objects */
    function extend(){
      var options, k,
        baseObject = arguments[0] || {},
        length = arguments.length;

      if ( typeof baseObject !== "object" && typeof baseObject !== 'function' ) {
        baseObject = {};
      }

      for ( var i=1; i<length; i++ ) {
          if ( (options = arguments[i]) != null ) {
            for ( k in options ) {
                    if ( options[k] !== undefined ) {
              baseObject[k] = options[k];
            }
            }
          }
      }
      return baseObject;
    }


    /** convert css transform matrix string to array */
    function cssMatrixToArray ( matrix ) {
        var matrix,ml,i=0;
        matrix = matrix.substr(7, matrix.length - 8).split(', ');
        ml = matrix.length;
        for( ;i<ml;i++ ) matrix[i] = parseFloat(matrix[i]);
        return matrix;
    }

    /** get the REAL current style of and element */
    function getCurrentStyle( elem, prop, method ){

      var val, valParts, reg, cases, m,
          method = method || 'def';

      cases = {
          gcs: function(){
            if( window.getComputedStyle )
              return window.getComputedStyle( elem ).getPropertyValue( prop )
            else if( elem.currentStyle )
              return  elem.currentStyle[ prop ];
            else
              this.def();
          },
          gas: function(){
            reg = new RegExp('(\\-[a-zA-Z]*\\-)?transform\\s*:\\s*translate3?d?\\s*\\(([0-9.\-]*)px\\s*\\,\\s*([0-9.\-]*)px\\s*(\\,\\s*([0-9.\-])*p(x|t))?\\s*\\)?','g');
            elem.getAttribute('style').replace(reg, function( match, prefx, x, y, z ){
              m = 'matrix(1, 0, 0, 1, ' + x + ', ' + y + ')';
            });
            return m;
          },
          def: function(){ return $(elem).css( prop ); }
       };

      val = cases[ method ]();
      return typeof val != 'undefined' ? val : cases[ 'def' ]();
    }

    /** broser compatibility Events manager */

    function fixEvent(event) {

      var doc = document.documentElement, body = document.body,
          pageX = event.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 ),
          pageY = event.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );

      var fixedEvnt = {
        target: event.srcElement,
        currentTarget : event.srcElement,
        pageX:  pageX,
        pageY:  pageY,
        stopPropagation: function() { this.cancelBubble = true },
        preventDefault:  function() { this.returnValue = false }
      };

      for(var k in fixedEvnt){
        if( typeof event[ k ] === 'undefined' ){
          event[k] = fixedEvnt[k];
        }
      }
      return event;
    };

    function addOrRemoveListener( method, obj, evt, fnc, useCapture ){

      var useCapture = typeof useCapture != 'undefined' ? useCapture : false,
          ieMethod = method == 'add' ? 'at' : 'de',
          ieCaptureMethod = method == 'add' ? 'set' : 'release',
          success;

      if( typeof fnc === 'object' && typeof fnc.handleEvent != "undefined" ){
        var orgFnc = fnc;
        if( method == 'add' ){
          if ( typeof obj.handleEvent === 'undefined')  obj.handleEvent = {};
          obj.handleEvent[evt] = function(e){
            orgFnc.handleEvent.call( orgFnc, e );
          }
        }
        if( typeof obj.handleEvent != 'undefined' )
          fnc = obj.handleEvent[evt];
      }

      if ( obj[method + 'EventListener'] )
        success = obj[method + 'EventListener'](evt,fnc,useCapture);
      else if ( obj[ieMethod + 'tachEvent'] ){
        obj[ieMethod + 'tachEvent']('on' + evt,fnc);
        if( useCapture ) obj[ieCaptureMethod + 'Capture'];
      }
      return success;
    }

    function addEventListener ( obj, evt, fnc, useCapture ){
      addOrRemoveListener( 'add', obj, evt, fnc, useCapture );
    };

    function removeEventListener ( obj, evt, fnc, useCapture ){
      addOrRemoveListener( 'remove', obj, evt, fnc, useCapture );
    };

    function dispatchEvent( obj, evt ){
      var e = null;
      if (document.createEventObject) {
          e = document.createEventObject();
          obj.fireEvent(evt, e);
      } else {
          e = document.createEvent('Events');
          e.initEvent(evt, true, true);
          obj.dispatchEvent(e);
      }
    };

    /** get offset */
    function getOffset(elem){
      var offset = { left: 0, top: 0},
          docElem    = document.documentElement,
          clientTop  = docElem.clientTop  || document.body.clientTop  || 0,
          clientLeft = docElem.clientLeft || document.body.clientLeft || 0,
          scrollTop  = window.pageYOffset || docElem.scrollTop,
          scrollLeft = window.pageXOffset || docElem.scrollLeft;

      while ( elem = elem.offsetParent ) {
        offset.left += elem.offsetLeft;
        offset.top  += elem.offsetTop;
      }

      offset.left -= clientLeft + scrollLeft;
      offset.top  -= clientTop + scrollTop;
      return offset;
    }


    /** STATIC VARIABLES */
    var vendor                   = support.prefix,
        transform                = support.getPrefixed('transform', false),
        transformCss             = support.getPrefixed('transform'),
        transformOrigin          = support.getPrefixed('transformOrigin', false),
        backfaceVisibility       = support.getPrefixed('backfaceVisibility', false),
        perspective              = support.getPrefixed('perspective', false),
        transition               = support.getPrefixed('transition', false),
        transitionProperty       = support.getPrefixed('transitionProperty', false),
        transitionDuration       = support.getPrefixed('transitionDuration', false),
        transitionTimingFunction = support.getPrefixed('transitionTimingFunction', false),
        transitionDelay          = support.getPrefixed('transitionDelay', false),
        transitionEnd            = vendor != '' ? vendor + 'TransitionEnd' : 'transitionend',
        cssEasing                = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
        has3d                    = ( 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix() ) || support.test( 'perspective' ),
        translateZ               = has3d ? 'translateZ(0)' : '',
        hasTouch                 = ( 'ontouchstart' in window ) || ( navigator.maxTouchPoints > 0 ) || ( navigator.msMaxTouchPoints > 0 ),
        hasMSPointer             = window.navigator.msPointerEnabled,
        hasTransition            = support.test( 'transition' ),
        hasTransform             = support.test('transform'),
        hasTransitionEvent       = support.test( 'transitionEvent' ),//prefixStyle('transition') in dummyStyle,
        transitionEvent          = support.getPrefixed( 'transitionEvent', false ),
        transEventPrefix         = transitionEvent ? transitionEvent.replace( 'TransitionEvent', '' ).toLowerCase() : '',
        transitionEnd            = transEventPrefix != '' ? transEventPrefix + 'TransitionEnd' : 'transitionend';

    /** jScroll Constructor */
    function JScroll( elem, options, callback ){

        var self = this;

        this.options = extend({
          mousedrag: true,
          deceleration: 0.0006,
          usetransition: true,
          selectable: true,
          fixedHandler: false
        }, options || {});


        if( !this.options.usetransition ){
          hasTransition = false;
        }

        this.$elem                   = $(elem);
        this.$win                    = $(window);
        this.$contentWrap            = null;
        this.$scrollbars             = null;
        this.$scrollbarH             = null;
        this.$scrollbarV             = null;
        this.$handlers               = null;
        this.$handlerV               = null;
        this.$handlerH               = null;

        this.$fixedScroll            = null;

        this.scrollDirection         = null;
        this.tempScrollTop           = 0;
        this.tempScrollLeft          = 0;
        this.currentScrollTop        = 0
        this.currentScrollLeft       = 0;
        this.isVertical              = false;
        this.isHorizontal            = false;
        this.scrollTop               = 0;
        this.scrollLeft              = 0;
        this.elemoffset              = getOffset( this.$elem[0] );
        this.elemHeight              = 0;
        this.elemWidth               = 0;
        this.wrapperHeight           = 0;
        this.wrapperWidth            = 0;
        this.isContentDragging       = false;
        this.timeStamp               = null;
        this.startAnim               = null;
        this.isManualScroll          = false;
        this.endTimer                = false;
        this.$elem[0].jscrollTop     = 0;
        this.$elem[0].jscrollLeft    = 0;
        this.$elem[0].jscrollHeight  = 0;
        this.$elem[0].jscrollWidth   = 0;
        this.callback                = typeof callback != 'undefined' ? callback : function(){};

        this.init();

    };

    /** jScroll prototype */
    JScroll.prototype = {

        handlers : {},

        subscribe: function( event, method ) {
          var self = this;
            this.handlers[method] = function() {
                method.apply(self, arguments);
            }
            this.$elem.on(event, this.handlers[method]);
        },

        unsubscribe: function( event, method ) {
            this.$elem.off(event, this.handlers[method] );
        },

        publish: function( event, data ) {
            this.$elem.trigger( event, typeof data != 'undefined'? data : [] );
        },

        Events: {
            UI_DOWN : hasTouch  ? 'touchstart': (hasMSPointer ? 'MSPointerDown' : 'mousedown'),
            UI_MOVE : hasTouch  ? 'touchmove' : (hasMSPointer ? 'MSPointerMove' : 'mousemove'),
            UI_UP   : hasTouch  ? 'touchend'  : (hasMSPointer ? 'MSPointerUp' : 'mouseup')
        },

        handleEvent: function(event){
            var e = fixEvent(event);
            switch(e.type) {
              case this.Events.UI_DOWN: this.onDown(e);   break;
              case this.Events.UI_MOVE: this.onMove(e);   break;
              case this.Events.UI_UP:   this.onUp(e);     break;
              case transitionEnd:       this.scrollEnd(); break;
              case 'DOMMouseScroll':    this.wheel(e);    break;
              case 'mousewheel':        this.wheel(e);    break;
              case 'resize':            this.refresh(e);  break;
            }
        },


        init: function(){

            var self = this;

            this.createScrollBars();

            this.setControls();
            /** publish an event on $elem when everything is ready */

            this.callback.call(this);
            this.publish('init');

            this.$elem.on('refresh', function(){ self.refresh(); });

        },

        pos: function( x, y, duration, easing, bypass ){



          var self = this,
              move = typeof move != 'undefined' ? move : true,
              contentX = this.isHorizontal ? x : this.scrollLeft,
              contentY = this.isVertical ? y : this.scrollTop,
              duration = typeof duration != "undefined"? duration: 0,
              easing = typeof easing != "undefined"? easing: '',
              handlerX = x,
              handlerY = y;

          if( duration == 0 ){
            this.scrollLeft = contentX;
            this.scrollTop  = contentY;
          }

          this.$elem[0].jscrollTop  = this.scrollLeft;
          this.$elem[0].jscrollLeft = this.scrollTop;

          this.publish('scroll' );

          if( duration != 0 ){
            this.publish('scrollto', [ x, y, duration, easing ] );
          }

          contentX = ( contentX < 0 ) ? Math.abs( contentX ) : contentX * -1;
          contentY = ( contentY < 0 ) ? Math.abs( contentY ) : contentY * -1;

          var invContentY = (contentY*-1);

          if( hasTransform ){

            this.$contentWrap[0].style[ transform ] = 'translate(' + contentX + 'px,' + contentY + 'px) ' + translateZ;
            this.$fixedScroll.each(function(){
              this.style[ transform ] = 'translate(0px, ' + invContentY + 'px) ' + translateZ;
            });

          } else {

            contentY = contentY << 0;

            if( this.isHorizontal )
              this.$contentWrap[0].style.left = contentX + 'px';

            if( this.isVertical ){

              this.$contentWrap[0].style.top = contentY + 'px';
              this.$fixedScroll.each(function(){
                this.style.top = invContentY + 'px';
              });

            }

          }

          this.posHandler( 'h', handlerX, handlerY );
          this.posHandler( 'v', handlerX, handlerY );




        },

        posHandler: function( dir, contentX, contentY ){

          if( dir == "h" && !this.isHorizontal ) return;
          if( dir == "v" && !this.isVertical ) return;

            var scrollRatio   = 0,
                isHorizontal  = dir == "h",
                scrollDim     = isHorizontal ? this.scrollWidth : this.scrollHeight,
                scrollPos     = isHorizontal ? contentX : contentY,
                scrollbarSize = isHorizontal ? this.scrollBarWidth : this.scrollBarHeight,
                handlerSize   = isHorizontal ? this.handlerWidth : this.handlerHeight,
                dirU          = isHorizontal ? 'H' : 'V',
                scrollRatio   = scrollDim != 0 ? ( scrollPos / scrollDim ) : 0,
                handlerpos    = ( scrollbarSize - handlerSize ) * scrollRatio;

          //handlerpos = ( handlerpos < 0 ) ? Math.abs( handlerpos ) : handlerpos * -1;

          if( hasTransform ){
            this[ '$handler' + dirU ][0].style[ transform ] = 'translate(' + ( isHorizontal ? handlerpos + 'px, 0px)' : '0px, ' + handlerpos + 'px)' ) + ' ' + translateZ;
          } else {
            this[ '$handler' + dirU ][0].style[ isHorizontal ? 'left' : 'top' ] = handlerpos + 'px';
          }

        },


        scrollBy: function( distX, distY, duration ){

          this.scrollTo( this.scrollLeft + distX, this.scrollTop + distY, duration );

        },


        jumpTo: function( newX, newY ){
          this.pos( newX, newY );
          this.scrollEnd();
        },

        scrollTo: function( newX, newY, duration ){



          var self = this,
              initScrollY = this.scrollTop,
              initScrollX = this.scrollLeft,
              startTime = Date.now(),
              distX = newX - initScrollX ,
              distY = newY - initScrollY,
              diff, e, x, y, curr, initMatrix;

          this.progress = 0;
          this.hasMoved = true;

          if( hasTransition ){


            if( hasTransitionEvent ){
                removeEventListener( this.$contentWrap[0], transitionEnd, this );
                addEventListener( this.$contentWrap[0], transitionEnd, this );
            }

            this.$contentWrap[0].style[ transition ] = transformCss + ' ' + duration + 'ms ' + cssEasing;

            this.$fixedScroll.each(function(){
              this.style[ transition ] = transformCss + ' ' + duration + 'ms ' + cssEasing;
            });

            this.$handlerH[0].style[ transition ]    = transformCss + ' ' + duration + 'ms ' + cssEasing;
            this.$handlerV[0].style[ transition ]    = transformCss + ' ' + duration + 'ms ' + cssEasing;

            this.pos( newX, newY, duration, cssEasing );

          }

          var animScroll = function(timestamp){

            if( self.progress < 0 || self.progress > duration ){
              if( !hasTransition ) self.scrollEnd();
              return;
            }

            diff = timestamp - startTime;
            e = self.progress != 0 ? self.easeOutQuad( self.progress, 0, 1, duration ) : 0;
            self.progress = self.progress + diff;

            startTime = timestamp;

            x = initScrollX + (e * distX);
            y = initScrollY + (e * distY);

            if( !hasTransition ){

              self.pos( x, y );

            } else{

              curr = getCurrentStyle( self.$contentWrap[0], transformCss, 'gcs'  );
              initMatrix = curr != 'none' ? cssMatrixToArray( curr ) : [1,0,0,1,0,0];
              self.scrollLeft  = ((initMatrix.length == 16) ? initMatrix[12] : initMatrix[4]) * -1;
              self.scrollTop = ((initMatrix.length == 16) ? initMatrix[13] : initMatrix[5]) * -1;

              self.publish( 'scroll' );

            }

            self.startAnim = requestAnimationFrame( animScroll );

          }

          cancelAnimationFrame( self.startAnim );
          this.startAnim = requestAnimationFrame( animScroll );

        },

        easeOutQuad: function (t, b, c, d) { /** current, 0, 1, duration */
          return -c *(t/=d)*(t-2) + b;
        },

        scrollEnd : function( hasmoved ){



          this.hasMoved = typeof hasmoved != "undefined" ? hasmoved : true;

          var curr, initMatrix, x, y;

          cancelAnimationFrame( this.startAnim );

          if( hasTransform ){

            curr = getCurrentStyle( this.$contentWrap[0], transformCss, 'gcs'  );
            initMatrix = curr != 'none' ? cssMatrixToArray( curr ) : [1,0,0,1,0,0];

            x = ((initMatrix.length == 16) ? initMatrix[12] : initMatrix[4]) * -1;
            y = ((initMatrix.length == 16) ? initMatrix[13] : initMatrix[5]) * -1;

            if( hasTransition ){
              //this.$contentWrap.off( this.transEventName );
              removeEventListener( this.$contentWrap[0], transitionEnd, this );

              this.$contentWrap[0].style[ transition ] = transformCss + ' 0ms';
              this.$fixedScroll.each(function(){
               this.style[ transition ] = transformCss + ' 0ms';
              });
              this.$handlerH[0].style[ transition ]    = transformCss + ' 0ms';
              this.$handlerV[0].style[ transition ]    = transformCss + ' 0ms';
            }

          } else {

            x = this.scrollLeft;
            y = this.scrollTop;

          }

          this.pos( x, y );

          removeEventListener( document, this.Events.UI_MOVE, this );
          removeEventListener( document, this.Events.UI_UP, this );

          if( this.hasMoved ){
            this.hasMoved = false;
            this.publish('scrollend');
          }

        },

        createScrollBars: function(){

          var csspos = getCurrentStyle(this.$elem,'position'),
              $content = this.$elem[0].innerHTML,
              contentWrap;

          /** to be sure scrollbars will be correctly positionned */
          if( csspos == "static" && csspos == "inherit" )
              this.$elem[0].style.position = 'relative';

          /** avoid elem to scroll */
          this.$elem[0].style.overflow = 'hidden';
          if (hasMSPointer) {
            this.$elem[0].style.msTouchAction = 'none';
          }

          /** create wrapper ( div that will actually 'scroll' ) */
          contentWrap = $('<div class="jscroll-content-wrap"></div>');

          /** if available use innerHTML for IE8< html5 tags support */
          if( typeof innerShiv != "undefined" ){
            contentWrap[0].appendChild( innerShiv( $content ) );
          }else{
            contentWrap[0].innerHTML = $content;
          }


          contentWrap[0].style.position = 'relative';

          if( hasTransform ){
            contentWrap[0].style[ backfaceVisibility ] = 'hidden';
            contentWrap[0].style[ perspective ] = 1000;
            contentWrap[0].style[ transition ] = transformCss + ' 0ms';
            contentWrap[0].style[ transformOrigin ] = '0px 0px';
          }

          this.$elem.html( contentWrap );
          this.$contentWrap = this.$elem.find('.jscroll-content-wrap');

/**
 * Quick fix to improive IE8 perfs
 */
 this.$fixedScroll = this.$contentWrap.find('.jscroll-fixed');

          /** create scrollbars */
          this.$scrollbarH = $('<div class="jscroll-scrollbar horizontal"><div class="jscroll-handler"></div></div>');
          this.$scrollbarV = $('<div class="jscroll-scrollbar vertical"><div class="jscroll-handler"></div></div>');
          this.$elem.append( this.$scrollbarH , this.$scrollbarV );

          this.$scrollbars = this.$elem.find('.jscroll-scrollbar');
          this.$scrollbarH = this.$elem.find('.jscroll-scrollbar.horizontal')
          this.$scrollbarV = this.$elem.find('.jscroll-scrollbar.vertical')

          this.$handlers = this.$elem.find('.jscroll-handler');
          this.$handlers.each(function(){
            this.style[ backfaceVisibility ] = 'hidden';
            this.style[ transition ] = transformCss + ' 0ms';
            this.style[ transformOrigin ] = '0px 0px';
            this.style[ perspective ] = 1000;
          });
          this.$handlerV = this.$scrollbarV.find('.jscroll-handler');
          this.$handlerH = this.$scrollbarH.find('.jscroll-handler');

          if( hasTouch ){
            this.$contentWrap[0].style.overflow = 'hidden'
          }

          this.refresh();

        },

        onDown : function( e ){

            var self   = this,
                doc    = document,
                target = e.currentTarget,
                pageX  = hasTouch ? e.changedTouches[0].pageX : e.pageX,
                pageY  = hasTouch ? e.changedTouches[0].pageY : e.pageY;

            this.isContentDragging = target.className != 'jscroll-handler';

              //e.preventDefault();
              //e.stopPropagation();


            /** avoid text and image selection */
            if( !this.options.selectable && !hasTouch && !hasMSPointer ){
              if( e.target.tagName != "OBJECT" ){
                 e.preventDefault();
              }
            }

            /** prevent content drag event on scrolllabr handler drag */
            if( !this.isContentDragging ){
              e.preventDefault();
              e.stopPropagation();
            } else if( !this.options.mousedrag && !hasTouch && !hasMSPointer ){
              return false;
            }

            this.scrollEnd( false );

            this.timeStamp   = e.timeStamp || Date.now();
            this.pageX       = pageX; //- getOffset( target ).left;
            this.pageY       = pageY; //- getOffset( target ).top;
            this.initpageX   = pageX;
            this.initpageY   = pageY;
            this.initScrollY = this.scrollTop;
            this.initScrollX = this.scrollLeft;

            addEventListener( doc, this.Events.UI_MOVE, this );
            addEventListener( doc, this.Events.UI_UP,   this );

            //return false;

        },

        scroll : function( dir, x, y, method ){

            if( !this.hasMoved ){
              this.publish('scrollstart');
            }

            var isHorizontal = dir == 'h',
                mousePos     = isHorizontal ? x : y,
                lastMousePos = isHorizontal ? this.pageX : this.pageY,
                scrollPos    = isHorizontal ? this.scrollLeft : this.scrollTop,
                scrollRatio  = method == 'drag' ? 1 : ( isHorizontal ? this.scrollRatioH : this.scrollRatioV ),
                maxScroll    = isHorizontal ? this.maxScrollH : this.maxScrollV,
                delta, newScroll, x, y;

            delta = ( mousePos - lastMousePos ) * scrollRatio;

            this[ isHorizontal ? 'pageX' : 'pageY' ] = mousePos;

            if( method != 'scroll' ){
              delta = ( delta < 0 ) ? Math.abs( delta ) : delta * -1;
            }

            newScroll = scrollPos + delta;

            if ( newScroll > maxScroll || newScroll < 0 ){
              return;
            }

            x = isHorizontal ? newScroll : this.scrollLeft;
            y = isHorizontal ? this.scrollTop : newScroll;

            this.pos( x, y );

        },

        onMove: function(e){

          var x = hasTouch ? e.changedTouches[0].pageX : e.pageX,
              y = hasTouch ? e.changedTouches[0].pageY : e.pageY,
              method = this.isContentDragging ? 'drag' : 'scroll';

          this.moveTimeStamp = e.timeStamp || Date.now();

          e.preventDefault();
          this.isManualScroll = true;

          this.hasMoved  = true;

          this.scroll( 'h', x, y, method );
          this.scroll( 'v', x, y, method );

          return false;

        },

        onUp: function(e){



           var self    = this;




          var doc     = document,
              isTouch = hasTouch,
              t1      = this.timeStamp,
              t2      = e.timeStamp || Date.now(),
              pageX   = isTouch ? e.changedTouches[0].pageX : e.pageX,
              pageY   = isTouch ? e.changedTouches[0].pageY : e.pageY,
              dX      = pageX - this.initpageX,
              dY      = pageY - this.initpageY,
              dMs     = Math.max(t2 - t1, 1),
              easing  = this.isContentDragging;


          this.isManualScroll = false;
          this.isContentDragging = false;
          removeEventListener( doc, this.Events.UI_MOVE, this );
          removeEventListener( doc, this.Events.UI_UP, this );




          this.hasMoved = false;



          var momentumX = this.momentum( 'h', dX, dMs, this.scrollLeft, ( this.maxScrollH  - this.scrollLeft ), 0  );
          var momentumY = this.momentum( 'v', dY, dMs, this.scrollTop,  ( this.maxScrollV  - this.scrollTop ), 0 );
          var newDuration = Math.max( momentumX.time, momentumY.time );



          if( !easing || ( t2 - this.moveTimeStamp ) > 200 ){
            this.publish( 'scrollend' );
            return;
          }

          this.scrollBy(  momentumX.dist, momentumY.dist, newDuration );

        },

        momentum: function( dir, dist, time, maxDistUpper, maxDistLower, size ){

          var speed = Math.abs(dist) / time,
              newDist = (speed * speed ) / (2 * this.options.deceleration),
              newTime = 0,
              outsideDist = outsideDist = size / (6 / (newDist / speed * this.options.deceleration));

          if (dist > 0 && newDist > maxDistUpper) {
            maxDistUpper = maxDistUpper + outsideDist;
            speed = speed * maxDistUpper / newDist;
            newDist = maxDistUpper;
          } else if ( dist < 0 && newDist > maxDistLower ) {
            maxDistLower = maxDistLower + outsideDist;
            speed = speed * maxDistLower / newDist;
            newDist = maxDistLower;
          }

          newDist = newDist * (dist > 0 ? -1 : 1);
          newTime = speed / this.options.deceleration;

          return { dist: newDist, time: Math.round( newTime ) };

        },


        setControls : function(){

          addEventListener( this.$elem[0], this.Events.UI_DOWN, this );
          addEventListener( this.$handlerH[0], this.Events.UI_DOWN, this );
          addEventListener( this.$handlerV[0], this.Events.UI_DOWN, this );
          addEventListener( this.$elem[0], 'DOMMouseScroll', this );
          addEventListener( this.$elem[0], 'mousewheel', this );
          addEventListener( window, 'resize', this );

        },

        refresh : function(){

console.log('elem : ', this.$elem[0]);
console.log('wrapper : ', this.$contentWrap[0]);
          var self           = this;
          var scrubRatio     = 0;
          var $scrollbar     = null;
          var $handler       = null;

          this.elemoffset    = getOffset( this.$elem[0] );
          this.elemWidth     = this.$elem[0].offsetWidth;//.width();
          this.elemHeight    = this.$elem[0].offsetHeight;//.height();
          this.wrapperHeight = this.$contentWrap[0].offsetHeight; //clientHeight;
          this.wrapperWidth  = this.$contentWrap[0].offsetWidth; //clientWidth;
          this.scrollHeight  = this.wrapperHeight - this.elemHeight;
          this.scrollWidth   = this.wrapperWidth - this.elemWidth;
          this.maxScrollH    = this.wrapperWidth - this.elemWidth;
          this.maxScrollV    = this.wrapperHeight - this.elemHeight;

          this.$elem[0].jscrollHeight = this.wrapperHeight;
          this.$elem[0].jscrollWidth  = this.wrapperWidth;
          this.$scrollbars.hide();
          this.isVertical = false;
          this.isHorizontal = false;
console.log('this.elemHeight : ' + this.elemHeight);
console.log('this.wrapperHeight : ' + this.wrapperHeight);
          if( this.elemHeight < this.wrapperHeight - 2 ){
            this.isVertical = true;
            this.$scrollbarV.show();
            if( !this.options.fixedHandler ){
              scrubRatio = this.elemHeight / this.wrapperHeight;
              this.$handlerV.height( this.$scrollbarV.height() * scrubRatio );
            }
          }

          if( this.elemWidth < this.wrapperWidth - 2 ){
            this.isHorizontal = true;
            this.$scrollbarH.show();
            if( !this.options.fixedHandler ){
              scrubRatio = this.elemWidth / this.wrapperWidth;
              this.$handlerH.width( this.$scrollbarH.width() * scrubRatio );
            }
          }

          this.scrollBarHeight = this.$scrollbarV.height();
          this.scrollBarWidth  = this.$scrollbarH.width();
          this.handlerHeight   = this.$handlerV.height();
          this.handlerWidth    = this.$handlerH.width();
          this.scrollRatioH    = this.scrollWidth / ( this.scrollBarWidth - this.handlerWidth );
          this.scrollRatioV    = this.scrollHeight / ( this.scrollBarHeight - this.handlerHeight );


          this.$fixedScroll = this.$contentWrap.find('.jscroll-fixed');

          this.pos( this.scrollLeft, this.scrollTop );


        },

        wheel: function (e) {

          e.preventDefault();

          var self = this,
            e = e,
            wheelDeltaX, wheelDeltaY,
            deltaX, deltaY,
            newX, newY;

          this.scrollEnd( false );
          this.publish('scrollstart');

          if ( e.wheelDelta ){
            wheelDeltaX = wheelDeltaY = e.wheelDelta; //6 or 12
          } else if ( e.detail ){
            wheelDeltaX = wheelDeltaY = -e.detail * 40; // *3
          } else if ( e.wheelDeltaX ) {
            wheelDeltaY = e.wheelDeltaY/12;
            wheelDeltaX = -1 * e.wheelDeltaX/12;
          } else if ( e.axis !== undefined && e.axis === e.HORIZONTAL_AXIS ) {
            wheelDeltaY = 0;
            wheelDeltaX = -1 * wheelDeltaY;
          }

          newY = this.scrollTop - wheelDeltaY;
          newX = this.scrollLeft - wheelDeltaX;

          if( newX < 0 ) newX = 0;
          else if( newX > this.maxScrollH ) newX = this.maxScrollH;

          if( newY < 0 ) newY = 0;
          else if( newY > this.maxScrollV ) newY = this.maxScrollV;

          this.pos( newX, newY );

          clearTimeout( this.endTimer );
          this.endTimer = setTimeout(function(){
            self.publish('scrollend');
          }, 500 );

          return false;

        }

    };

    /** jQuery plugin: jScroll instantiation */
    $.fn.jScroll = function(options, callback) {
      return this.each(function(index) {
        var $self = $(this);
        if($self.data('jScroll')) return;
        var instance = new JScroll(this, options, callback);
        $self.data('jScroll', instance);
      });
    }


    window.JScroll = JScroll;

})(jQuery, window, undefined);
