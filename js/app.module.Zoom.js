(function( $, window, app ){

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


	var support = scriptease.support;


	app.namespace("app.module.Zoom", (function(){

		function Zoom(elmt){

			var self = this;
			var ns = this.ns =  "." + $(elmt).data("namespace");

			this.$elmt        		= $(elmt).find('.tozoom');
			this.$parent      		= $(elmt);
			this.currentZoom  		= this.initZoom = 35;
			this.zoomStep     		= ( 100 - this.initZoom ) / 5;
			this.customHeight 		= 0;
			this.customWidth  		= 0;
			this.translateZ         = support.transform3d ? 'translateZ(0)' : '';
			this.isMacSafari5       = /Macintosh.*Version\/5.*Safari\/5/.test( navigator.userAgent );
			this.transform          = this.isMacSafari5 ? false : support.transform;
			this.transition         = support.transition;
			this.transitionend      = support.transitionend;
			this.backfacevisibility = support.backfacevisibility;
			this.perspective 		= support.perspective;

			this.$elmt[0].style.top        = 0;
			this.$elmt[0].style.left       = 0;
			this.$elmt[0].style.position   = 'absolute';
			this.$parent[0].style.overflow = 'visible';

			this.setControls();

			if( this.transform  ){
            	this.$elmt[0].style[this.backfacevisibility] = 'hidden';
            	this.$elmt[0].style[this.perspective] 		 = 1000;
            }

			this.setInitDimentions();

			app.subscribe( this, 'panup'            + ns, function(){ self.pan('up');    });
			app.subscribe( this, 'pandown'          + ns, function(){ self.pan('down');  });
			app.subscribe( this, 'panleft'          + ns, function(){ self.pan('left');  });
			app.subscribe( this, 'panright'         + ns, function(){ self.pan('right'); });
			app.subscribe( this, 'zoomin'           + ns, function(){ self.zoom('in'); });
			app.subscribe( this, 'zoomout'          + ns, function(){ self.zoom('out'); });
			app.subscribe( this, 'zoomto'           + ns, function(e, newzoom, useanim){ self.zoom('to', newzoom, useanim ); });
			app.subscribe( this, 'center'           + ns, this.center );
			app.subscribe( this, 'enablezoom'       + ns, this.enable );
			app.subscribe( this, 'disablezoom'      + ns, this.disable );
			app.subscribe( this, 'updatedimentions' + ns, this.setInitDimentions );
			app.subscribe( this, 'updateinitzoom'   + ns, this.updateInitZoom );

		}

		Zoom.prototype = {

			updateInitZoom: function(e, initzoom){
				this.initZoom = this.currentZoom = initzoom;
				this.zoomStep = ( 100 - this.initZoom ) / 5;
				this.setInitDimentions();
			},

			enable: function(){
				var self = this;
				var direction = null;
				this.$parent.on('mousewheel', function( event, delta, deltaX, deltaY ){
	                direction = deltaY >= 1 ? 'in' : 'out';
	                self.zoom( direction );
				});
			},

			disable: function(){
				this.$parent.off('mousewheel');
			},

			resize: function(){
				this.elmtH = this.$elmt.height();
				this.elmtW = this.$elmt.width();
				this.contWidth = this.$parent.width();
				this.contHeight = this.$parent.height();
				this.contMidWidth = this.contWidth >> 1;
	            this.contMidHeight = this.contHeight >> 1;
				this.maxLeft = (this.contWidth / 5);
				this.maxTop = (this.contHeight / 5);
				this.minLeft = ((this.contWidth / 5)*4) - this.elmtW;
				this.minTop = ((this.contHeight / 5)*4) - this.elmtH;
			},

			setInitDimentions: function(){
				this.resize();
				this.elmtInitH = this.elmtH / this.initZoom * 100;
				this.elmtInitW = this.elmtW / this.initZoom * 100;
			},

			setControls: function(){

				var self = this,
					initX, initY,
					isZooming = false, transformTimer = null,
					doDrag = false,
					hasUIDown = false,
					UI = {
						down: Modernizr.touchevents ? 'touchstart': 'mousedown',
						up: Modernizr.touchevents ? 'touchend': 'mouseup',
						move: Modernizr.touchevents ? 'touchmove': 'mousemove'
					};

				/** mousewheel */
				this.$parent.on('mousewheel', function( event, delta, deltaX, deltaY ){
	                var direction = deltaY >= 1 ? 'in' : 'out';
	                self.zoom( direction );
				});

				/** pitchToZoom */
	            if( Modernizr.touchevents ){

			        this.$elmt.hammer({ prevent_default: true, scale_treshold: 0 });
			        this.$elmt.on("transform", function(e) {
			        	clearTimeout( isZooming );
			        	isZooming = true;
			        	transformTimer = setTimeout(function(){ isZooming = false; }, 10);
			        	self.zoom( "to", self.initZoom + e.scale * 20 );
			        });

	            }


				this.$elmt.off( UI.down ).on( UI.down, function( e ){

	            	var $this = $(this),
	            		$dragger = $(document);

	            	hasUIDown = true;

	            	doDrag = true;

	            	$(this).stop(true, true);
	                e.preventDefault();

	                if( Modernizr.touchevents ){
	                	var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
	                	e.pageX = touch.pageX;
	                	e.pageY = touch.pageY;
	                	$dragger = $(this);
	                }

	                initX = e.pageX - $this.offset().left,
	                initY = e.pageY - $this.offset().top;

	                if( typeof e.timeStamp == 'undefined' ){
	                    e.timeStamp = Date.now();
	                }

	                $this.data("mouseEvents", [e]);

	                function onMouseMove(e){

	                	if( isZooming || !doDrag ) return;
	                	e.preventDefault();

	                    if( Modernizr.touchevents ){
			                var dtouch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			                e.pageX = dtouch.pageX;
			                e.pageY = dtouch.pageY;
	                	}

	                	window.isdrag = true;
	                    app.publish( 'drag' + self.ns );
	                    self.startDrag( e, initX, initY );

	                }

	                function onMouseUp(e){

	                	doDrag = false;
	                	setTimeout(function(){ window.isdrag = false }, 50);
	                	app.publish( 'drop' + self.ns );
	                    $dragger.off( UI.move, onMouseMove );
	                    $dragger.off( UI.up, onMouseUp );

	                }

	                $dragger.on( UI.move, onMouseMove );
	                $dragger.on( UI.up, onMouseUp );

	            });


	            this.$elmt.on( UI.up, function(e){

					if( Modernizr.touchevents ){
						$('#bm-filters').removeClass('active'); //SHAME
		                var dtouch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
		                e.pageX = dtouch.pageX;
		                e.pageY = dtouch.pageY;
	            	}
	            	if( hasUIDown ){
	            		hasUIDown = false;
	            		self.stopDrag(e);
	            	}

	            });

			},

	        easeOutQuad: function (t, b, c, d) { /** current, 0, 1, duration */
	          return -c *(t/=d)*(t-2) + b;
	        },

			zoom: function( direction, newzoom, useanim ){

				var self    = this,
					useanim = typeof useanim !== "undefined" ? useanim : true,
					newZoom, newZoomRest,
					incr, h, w, ptX, ptY, matrix,
					currentWidth, currentHeight,
					currentX, currentY,
					progress  = 0,
					startTime = Date.now(),
					diff = 0, e = 0,
					duration  = 700;

				this.$elmt.stop();

				if( this.transform ){
					this.$elmt.off( this.transitionend, this.onTransitionEnd );
		            this.$elmt[0].style[ this.transition] = 'none';
				}

				this.resize();

				if( typeof newzoom !== 'undefined' ){

					this.currentZoom = newzoom;

				} else {

					newZoom = direction == 'in' ? this.zoomStep : this.zoomStep * -1;

					if( parseInt(this.currentZoom + newZoom) < parseInt(this.initZoom) ||
						parseInt(this.currentZoom + newZoom) > 100 ){
						return false;
					}

					this.currentZoom += newZoom;

				}

				if( this.currentZoom < this.initZoom ){
					this.currentZoom = this.initZoom;
				}

				newZoomRest   = 100 - this.currentZoom;
				incr 		  = ( 100 - this.initZoom ) - newZoomRest;
				h 			  = (this.elmtInitH / 100) * ( this.initZoom + incr );
				w 			  = (this.elmtInitW / 100) * ( this.initZoom + incr );
	            currentWidth  = this.elmtW,
	            currentHeight = this.elmtH;

	            if( !this.transform  ){
	            	currentX = parseInt( this.$elmt.css('left'), 10 );
	            	currentY = parseInt( this.$elmt.css('top'), 10 );
					ptX = ( ( this.contMidWidth - currentX ) ) / currentWidth * w;
	            	ptY = ( ( this.contMidHeight - currentY ) ) / currentHeight * h;
				} else {
					matrix = this.getMatrix();
					currentX = matrix[0];
	            	currentY = matrix[1];
					ptX = ( ( this.contMidWidth - currentX ) ) / currentWidth * w;
	            	ptY = ( ( this.contMidHeight - currentY ) ) / currentHeight * h;
				}

				ptX = self.contMidWidth - ptX;
	            ptY = self.contMidHeight - ptY;

		        cancelAnimationFrame( this.startAnim );

				var animZoom = function(timestamp){

					if (timestamp < 1e12){
				        timestamp = Date.now();
				    }

					if( progress > duration ){
						self.resize();
					  	return;
					}

					diff = timestamp - startTime;
					e = progress != 0 ? self.easeOutQuad( progress, 0, 1, duration ) : 0;
					progress = progress + diff;
					startTime = timestamp;

	        		var newX = (currentX + ( (ptX-currentX)*e ));
	        		var newY = (currentY + ( (ptY-currentY)*e ));
	        		var newH = (currentHeight + ( (h-currentHeight)*e ));
	        		var newW = (currentWidth + ( (w-currentWidth)*e ));

	        		self.$elmt[0].style.height = newH +'px';
	        		self.$elmt[0].style.width = newW +'px';

	        		if( self.transform ){

		            	if( support.transform3d ){
							self.$elmt[0].style[  self.transform ]  = 'translate3d(' + newX+'px, '+newY+'px, 0px )';// + this.translateZ;
		            	} else {
		            		self.$elmt[0].style[  self.transform ]  = 'translate(' + newX+'px, '+newY+'px )';// + this.translateZ;
		            	}

	        		} else {
	        			self.$elmt[0].style.left = newX + 'px';
	        			self.$elmt[0].style.top = newY + 'px';
	        		}

					self.startAnim = requestAnimationFrame( animZoom );

				}

		        if( useanim ){

		        	this.startAnim = requestAnimationFrame( animZoom );

		        } else{

	        		var newX = (currentX + ( (ptX-currentX) ));
	        		var newY = (currentY + ( (ptY-currentY) ));

	        		self.$elmt[0].style.height = h +'px';
	        		self.$elmt[0].style.width = w +'px';

	        		if( self.transform ){

		            	if( support.transform3d ){
							self.$elmt[0].style[  self.transform ]  = 'translate3d(' + newX+'px, '+newY+'px, 0px )';// + this.translateZ;
		            	} else {
		            		self.$elmt[0].style[  self.transform ]  = 'translate(' + newX+'px, '+newY+'px )';// + this.translateZ;
		            	}

	        		} else {
	        			self.$elmt[0].style.left = newX + 'px';
	        			self.$elmt[0].style.top = newY + 'px';
	        		}

		        }

				app.publish( 'zoom' + self.ns, [w, h, this.currentZoom ] );

			},


			center: function(){

				cancelAnimationFrame( this.startAnim );

				var self = this;

				if( this.transform ){
					this.$elmt.off( this.transitionend, this.onTransitionEnd );
		            this.$elmt[0].style[ this.transition ] = 'none';
				}

				this.resize();

				var newL = this.contMidWidth - ( this.elmtW / 2 );
				var newT = this.contMidHeight - ( this.elmtH / 2 );

		        if( !this.transform  ){
	            	this.$elmt[0].style.top = newT+'px';
	            	this.$elmt[0].style.left = newL+'px';
		        } else {

	            	if( support.transform3d ){
						this.$elmt[0].style[  this.transform ]  = 'translate3d(' + newL+'px, '+newT+'px, 0px )';// + this.translateZ;
	            	} else {
	            		this.$elmt[0].style[  this.transform ]  = 'translate(' + newL+'px, '+newT+'px )';// + this.translateZ;
	            	}

		        }

			},


			pan: function( direction ){

				cancelAnimationFrame( this.startAnim );

				var newLeft = 0;
				var newTop = 0;
				var incr = app.utils.convertUnit( this.$elmt.children(), 'left', 15, 'topx' );
				/** switch is bad! use an object instead*/
				var cases = {
					right:  [ incr*-1, 0 ],
					left:   [ incr, 0],
					down:   [ 0, incr*-1 ],
					up:     [ 0, incr ],
					center: [ 0, 0 ]
				}

	            if( !this.transform  ){
					newLeft = cases[direction][0] + parseFloat( this.$elmt.css('left'), 10 );
	            	newTop = cases[direction][1] + parseFloat( this.$elmt.css('top'), 10 );
				} else {
					var matrix = this.getMatrix();
					newLeft = cases[direction][0] + matrix[0];
	            	newTop = cases[direction][1] + matrix[1];
				}

				if( newLeft < this.minLeft )newLeft = this.minLeft;
	            if( newLeft > this.maxLeft )newLeft = this.maxLeft;
	            if( newTop > this.maxTop )newTop = this.maxTop;
	            if( newTop < this.minTop )newTop = this.minTop;

				if( !this.transform ){
	            	this.animate({ left: newLeft + "px", top: newTop+ "px" }, 700);
	            }else{
	            	this.$elmt[0].style[ this.transition ] = 'all 700ms ease-out';
					this.$elmt.on( this.transitionend, this.onTransitionEnd.bind(this) );

	            	if( support.transform3d ){
						this.$elmt[0].style[  this.transform ]  = 'translate3d(' + newLeft+'px, '+newTop+'px, 0px )';// + this.translateZ;
	            	} else {
	            		this.$elmt[0].style[  this.transform ]  = 'translate(' + newLeft+'px, '+newTop+'px )';// + this.translateZ;
	            	}

	            }

	            app.publish( 'pan' + self.ns );

			},

			onTransitionEnd: function(){
				this.$elmt.off( this.transitionend, this.onTransitionEnd );
				this.$elmt[0].style[ self.transition ] = 'none';
			},

   	   		getMatrix: function(){

				var initMatrix, initArray, x, y;
	            var reg = new RegExp('(\\-[a-zA-Z]*\\-)?transform\\s*:\\s*translate3?d?\\s*\\(([0-9.\-]*)px\\s*\\,\\s*([0-9.\-]*)px\\s*(\\,\\s*([0-9.\-])*p(x|t))?\\s*\\)?','g');

	            this.$elmt.attr( 'style' ).replace(reg, function( match, prefx, x, y, z ){
	            	initMatrix = 'matrix(1, 0, 0, 1, ' + x + ', ' + y + ')';
	            });

			    initArray = initMatrix != 'none' && typeof initMatrix !== 'undefined' ? this.cssMatrixToArray( initMatrix ) : [ 1, 0, 0, 1, 0, 0 ];

	            x = initArray[4];
	            y = initArray[5];

			    return [ x, y ];
	   		},

		    cssMatrixToArray: function( matrix ) {
		    	var matrix,ml,i=0;
		    	matrix = matrix.substr(7, matrix.length - 8).split(', ');
		    	ml = matrix.length;
		    	for( ;i<ml;i++ ) matrix[i] = parseFloat(matrix[i]);
		        return matrix;
		    },

			startDrag: function( e, initX, initY ){

				cancelAnimationFrame( this.startAnim );

	            var newLeft = ( ( e.pageX - this.$parent.offset().left ) - initX ),
	                newTop = ( ( e.pageY - this.$parent.offset().top ) - initY );

	            if( newLeft < this.minLeft ){ newLeft = this.minLeft; }
	            if( newLeft > this.maxLeft ){ newLeft = this.maxLeft; }
	            if( newTop > this.maxTop ){   newTop  = this.maxTop;  }
	            if( newTop < this.minTop ){   newTop  = this.minTop;  }


	            if( this.transform  ){

	            	this.$elmt.off( this.transitionend, this.onTransitionEnd );
	                this.$elmt[0].style[ this.transition] = 'none';

	            	if( support.transform3d ){
						this.$elmt[0].style[  this.transform ]  = 'translate3d(' + newLeft+'px, '+newTop+'px, 0px )';// + this.translateZ;
	            	} else {
	            		this.$elmt[0].style[  this.transform ]  = 'translate(' + newLeft+'px, '+newTop+'px )';// + this.translateZ;
	            	}

	            } else {

	            	this.$elmt[0].style.top = newTop+'px';
	            	this.$elmt[0].style.left = newLeft+'px';
	            }
	        },


	        stopDrag: function( e ){

	            var self = this,
	            	lastE = this.$elmt.data( "mouseEvents" ).shift(),
	                t1 = lastE.timeStamp,
	                t2 = typeof e.timeStamp != 'undefined' ? e.timeStamp : Date.now(),
	                dX = e.pageX - lastE.pageX,
	                dY = e.pageY - lastE.pageY,
	                dMs = Math.max(t2 - t1, 1),
	                speedX = Math.max(Math.min(dX / dMs, 1), -1),
	                speedY = Math.max(Math.min(dY / dMs, 1), -1),
	                coef =  Math.max(Math.abs(speedX), Math.abs(speedY)),
	                maxDuration = 700,
	                maxDistance = 300,
	                duration =  maxDuration * coef;

	            //this.$elmt.removeData( "mouseEvents" );

	            if( dMs > 500 ) return false;
	            if( duration < maxDuration * .6 ) return false;

	            if( !this.transform ){
					var newLeft = parseFloat( this.$elmt.css('left') ) + (speedX * maxDistance);
					var newTop  = parseFloat( this.$elmt.css('top') ) + (speedY * maxDistance);
				} else {
					var matrix = this.getMatrix();
					var newLeft = matrix[0] + (speedX * maxDistance);
					var newTop  = matrix[1] + (speedY * maxDistance);
				}

				if( newLeft < this.minLeft )newLeft = this.minLeft;
	            if( newLeft > this.maxLeft )newLeft = this.maxLeft;
	            if( newTop > this.maxTop )newTop = this.maxTop;
	            if( newTop < this.minTop )newTop = this.minTop;

	            if( this.transform  ){

	            	this.$elmt[0].style[ this.transition ] =  'all ' + duration + 'ms ease-out';
					this.$elmt.on( this.transitionend, this.onTransitionEnd.bind(this) );

	            	if( support.transform3d ){
						this.$elmt[0].style[  this.transform ]  = 'translate3d(' + newLeft+'px, '+newTop+'px, 0px )';// + this.translateZ;
	            	} else {
	            		this.$elmt[0].style[  this.transform ]  = 'translate(' + newLeft+'px, '+newTop+'px )';// + this.translateZ;
	            	}

	            } else {
	            	this.animate({ left: newLeft + "px", top: newTop+ "px" }, duration );
	            }

	        },


	        animate: function( props, duration, callback, usefx ){

	            var self = this,
	                $img = $(this.img),
	                duration = duration || 700,
	                usefx =  typeof usefx === 'undefined' ? true : usefx,
	                animMethod = jQuery.fn.fx && usefx ? 'fx' : 'animate',
	                callback = typeof callback != 'undefined' ? callback : function(){};

	            this.$elmt.stop()[ animMethod ]( props, {
	            	duration: duration,
	            	easing: 'easeOutQuad',
	            	complete: callback
	            }).css('overflow', 'visible');

	        }
	    }

	    return Zoom;

	})());

	app.subscribe(this, app.events.MODULE_SCRIPTS_LOADED, function(e, s) {
		if(s && s.name == "app.module.Zoom") {
			if( typeof $(s.element).data('ZoomClass') == 'undefined' )
				$(s.element).data('ZoomClass', new app.module.Zoom(s.element));
		}
	});

})( jQuery, window, scriptease );
