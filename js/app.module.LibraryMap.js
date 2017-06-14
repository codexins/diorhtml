(function( $, window, app ){

	'use strict';

 /* fixing ie<9 date.now support */
    Date.now = Date.now || function() { return +new Date; };

	app.namespace("app.module.LibraryMap", {

		init: function(elmt){
		    var self = this;
			this.elmt = elmt;
			this.$elmt = $(elmt);
			this.$parent = this.$elmt.parent();
			this.initHeight = 0;
			this.initWidth = 0;

			this.$elmt[0].style.top = 0;
			this.$elmt[0].style.left = 0;
			this.$elmt[0].style.position = 'absolute';
			this.$parent[0].style.overflow = 'visible';

			this.$filters = $('.filter').find('input');
			this.$books = $('.book').css({visibility:'visible',opacity:0});
			this.$images = this.$elmt.find('img');
			this.$freetileObj = null;
			this.isHdLoaded = false;
			this.isFiltering = false;

			this.loadImages('sd');
			this.setControls();
			app.subscribe( this, 'zoom.library', this.setContainerHeight );

		},

		loadImages: function(quality){

			var self = this;
			var numImgToload = this.$images.length;
	      	var numloaded = 0;
	      	var width, height, ratio,  url;

	        this.$images.each(function(i){

	        	if(typeof $(this).data('src') == 'undefined')
	        		$(this).data('src', this.getAttribute('src') );

	        	url = $(this).data('src');
	        	if( quality == 'hd' ) url = url.replace('small', 'large');

	            app.utils.loadImage( this, url, function( img ){

			    	if( quality == 'sd' ){

				    	width = img.width;
				    	height = img.height;
				    	ratio = Math.max(width, height) / Math.min(width, height);
				    	$(this).data( 'initW', width * 2 )
				    	       .data('ratio', ratio * 100)
				    		   .siblings('.ratio').css('margin-top', (ratio*100)+'%');
			    	}

			    	numloaded ++;

	                if( numloaded >= numImgToload ){
	                	if( quality == 'sd' ){
		                	self.setImageSize();
		                	self.initFreetile();
		                	self.loadImages('hd');
	                	} else {
	                		self.isHdLoaded = true;
	                	}
	                }

	            });

	        });

		},

		setImageSize: function(){
			var self = this;
			this.$images.each(function(){
				var initW = $(this).data('initW');
				var currentW = (initW /100) * 35;
				$(this).parent().width(currentW);
				$(this).show();
				if( app.browser == "IE6" ){
					var ratio = ( currentW / 100 ) * $(this).data('ratio');
					$(this).siblings('.ratio').css('margin-top', ratio + 'px' );
				}
			});
		},

		initFreetile: function(){
			var self = this;
			var freetileTimer=null;

			this.$elmt.freetile({
				animate: false,
	   			elementDelay: 30,
	   			selector: '.freetile-obj',
	   			containerResize: false,
	   			animationOptions: {duration:700,easing:"easeInOutQuad"},
	   			callback: function(){
	   				self.freetileCallback();
	   			},
	   			persistentCallback: true,
	   			customEvents: 'onfilter'
			});
		},

		freetileCallback : function(){

			var self = this,
				maxtopPos = 0,
				maxleftPos = 0,
				newT, newL, top, left;

			if( this.initHeight == 0 && this.initWidth == 0 ){
				this.$books.animate({opacity:1},300, function(){
					if( typeof this.style.removeAttribute != 'undefined' )
						this.style.removeAttribute('filter');
				});
				this.initHeight = this.$elmt.height();
				this.initWidth = this.$elmt.width();
			}


			$('.freetile-obj').each(function(){
				top = $(this).position().top + $(this).height();
				left = $(this).position().left + $(this).width();
				if(top > maxtopPos) maxtopPos = top;
				if(left > maxleftPos) maxleftPos = left;
			});

			newT = (this.$parent.height()/2) - (maxtopPos/2);
			newL = (this.$parent.width()/2) - (maxleftPos/2);

			this.$elmt.height( maxtopPos );
			this.$elmt.width( maxleftPos );

			app.publish( 'updatedimentions.library' );
			app.publish( 'center.library' );

			this.setFluidPositions();
		},

		setContainerHeight: function(e,w,h,c){
			//this.initHeight = h;
			//this.initWidth = w;
			this.currentZoom = c;
			if( this.currentZoom > 70 ) this.switchDef('hd');
			else this.switchDef('sd');
		},

		switchDef: function(quality){
			if(!this.isHdLoaded) return;
			this.$images.each(function(){
				this.src = quality == 'sd' ? this.getAttribute('src').replace('large', 'small') :
										     this.getAttribute('src').replace('small', 'large');
			});
		},

		setFluidPositions: function(){

			var self  =this;
			this.$images.each(function(){
				var $book = $(this).parent('.book');
				var flTop = app.utils.convertUnit( $book, 'top', $book.position().top );
				var flLeft = app.utils.convertUnit( $book, 'left', $book.position().left );
				var flWidth = app.utils.convertUnit( $book, 'left', $book.width() );
				var flHeight = app.utils.convertUnit( $book, 'top', $book.height() );

				$book[0].style.top = flTop+'%';
				$book[0].style.left = flLeft+'%';
				$book[0].style.width = flWidth+'%';
				$book[0].style.height = flHeight+'%';
			})
		},

		setStaticPositions: function(){
			var self  =this;
			this.$images.each(function(){
				var $book = $(this).parent('.book');
				var flTop = $book.position().top;
				var flLeft = $book.position().left;
				var flWidth = $book.width();
				var flHeight = $book.height();

				$book[0].style.top = flTop+'px';
				$book[0].style.left = flLeft+'px';
				$book[0].style.width = flWidth+'px';
				$book[0].style.height = flHeight+'px';
			});
		},

		setControls: function(){

			var self = this;
			var currentBook = null;
			var $books = this.$elmt.find('.book');
			var showInfosTimer = null;
			var isLongPress = false;
			var isDragging = false;
			var pressTimer = null;

            var UI = {
                down: Modernizr.touchevents ? 'touchstart': 'mousedown',
                up: Modernizr.touchevents ? 'touchend': 'mouseup',
                move: Modernizr.touchevents ? 'touchmove': 'mousemove'
            };


			$('.bm-ui').on(UI.up, function(e){
				e.preventDefault();
				var action = $(this).data('action');
				var direction = $(this).data('direction');
				app.publish( action + direction + '.library' );
				return false;
			});


			this.$elmt.on(UI.down, function(){
				pressTimer = setTimeout(function(){
					isLongPress = true;
				},100);
				$books.not( currentBook ).removeClass('active');
				currentBook = null;
			});

			app.subscribe( this, 'drag.library zoom.library', function(){
				if( isLongPress ) isDragging = true;
				$books.removeClass('active');
			});


			this.$elmt.on(UI.up, '.book', function(){
				isLongPress = false;
				clearTimeout( pressTimer );
				if( isDragging ){
					isDragging = false;
					return;
				}
				currentBook = self;
				$books.removeClass('selected');
				$(this).addClass('selected');
			});


			this.$filters.on('click', function(){

				var $this  = $(this);
				var filters = [];
				var allFilters = [];

				if( self.isFiltering ){

					if( $this.is(':checked') ){
						$this.removeAttr('checked');
					} else{
						$this.attr('checked', 'checked');
					}

				} else {

					$books.removeClass('selected');

					self.isFiltering = true;

					self.$filters.each(function(){
						var isChecked = $(this).is(':checked');
						if( isChecked > 0 ) filters.push( $(this).attr('value') );
						allFilters.push( $(this).attr('value') );
					});

					if( filters.length > 0 ){
						self.filterBooks( filters );
					} else {
						self.$filters.attr('checked', 'checked').addClass('active'),
						self.filterBooks( allFilters );
					}

				}

			});


			$('.bm-pop').on('mousedown touchstart', function(e){
				e.stopPropagation();
			})


			if( Modernizr.touchevents ){
				$('#bm-filters').on('click', function(){
					var $this = $(this);
					if($(this).hasClass('active')) {
						$(this).removeClass('active');
						 $(document).off('.bmfilter');
					}else {
						$(this).addClass('active');

						// Close on click outside
			            $(document).on('touchstart.bmfilter', function(e){
			                var $target = $(e.target);

			                if ($target.parents().index($('#bm-filters')) === -1) {
			                    $this.removeClass('active');
			                }
			                $(document).off('.bmfilter');
			            });
					}
				});
			} else {
                $('#bm-filters').on('mouseenter', function(){
                    var $this = $(this);

                    $(this).addClass('active');

                    // Close on click outside
                    $(document).on('touchstart.bmfilter', function(e){
                        var $target = $(e.target);

                        if ($target.parents().index($('#bm-filters')) === -1) {
                            $this.removeClass('active');
                        }
                        $(document).off('.bmfilter');
                    });
                }).on('mouseleave', function() {
                    var $this = $(this);

                    $(this).removeClass('active');
                    $(document).off('.bmfilter');
                });
            }

		},

		filterBooks: function( filters ){

			var self = this;
			var animEndtimer;

			if( app.browser !== "IE8" ){

				self.$books.find('img').stop().animate({opacity:0}, 500, function(){
					$(this).parent().removeClass('freetile-obj');
					clearTimeout(animEndtimer);
					animEndtimer = setTimeout(function(){
						self.reorderBooks(filters);
					},50);
				});

			} else {

				self.$books.find('img').hide();
				self.$books.removeClass('freetile-obj');
				setTimeout(function(){
					self.reorderBooks(filters);
				});
			}

		},

		reorderBooks: function( filters ){

 			var self = this;
			var isFilters = '.' + filters.join(', .').replace(/^\,\s/, '.');
			var numBooks = this.$books.length;
			var animMethod = jQuery.fn.fx ? 'fx' : 'animate';

			this.$books.each(function(){
				if( $(this).is( isFilters ) )
					$(this).addClass('freetile-obj');
				else {
					//$(this).find('img')[0].style.display = "none";
					this.style.visibility = 'hidden';
				}
			});

			app.publish( 'zoomto.library', [0, false] );

			this.setStaticPositions();


			//setTimeout(function(){

			    self.$elmt.width( self.initWidth );
				self.$elmt.freetile('layout');
				self.$freetileObj = $('.freetile-obj');
				self.$freetileObj.css('visibility', 'visible');

				if( app.browser == "IE8" ){
					self.$freetileObj.find('img').show();
					self.isFiltering = false;
				} else {
					self.$freetileObj.find('img').each(function(){
						$(this).stop().css({display: "block", opacity:0})[animMethod]({opacity: 1}, 500, function(){
							self.isFiltering = false;
						});
					});
				}

			//}, 500 );

		}

	});

	app.subscribe( this, app.events.MODULE_SCRIPTS_LOADED, function(e, s) {
		if(s && s.name == "app.module.LibraryMap")
			app.module.LibraryMap.init(s.element);
	});


})( jQuery, window, scriptease );
