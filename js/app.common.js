var app = window.app || window.scriptease;

app.common = function() {

    $('html').removeClass('no-js').addClass('js');

    var isOldIE = $('html.lt-ie8').length > 0;

    if ( isOldIE ) {

        /* correctif ie7 taille image */
        /* correctif min-height sur container et position absolute pour ie<9 */

        var $win = $(window),
            $container = $('#he-main').length > 0 ? $('#he-container') : $('#main'),
            contH = 0,
            $headlineImg = $.id('headline-img').find('img');

        function setImgHeight(){
            $headlineImg.height( $headlineImg.parent().height() );
        }

        function setContainerHeight(){

            contH = $win.height() < 580 ? 'auto' : '100%';
            $container.css( 'height', contH );

            var docHeight = window.innerHeight || document.documentElement.clientHeight;
            $('#wrapper').css('height', (docHeight - 62 - 35) + 'px');
        }

        app.subscribe( this, 'onResize', setImgHeight );
        app.subscribe( this, 'onResize', setContainerHeight );

        setImgHeight();
        setContainerHeight();

    }

    /**
     * menu trades
     */

    function HeadlineMenu(){

        var timerSubMenu = null;

        $('#headline-img').css({
            marginTop: $('#headline').height()-2
        });

        function closeMenu(e){
            clearTimeout( timerSubMenu );
            $('.submenu').slideUp('fast');
            $('.submenu-trigger').removeClass('open');
            $(document).off('click', closeMenu );
            $('#headline').off('mouseover mouseleave', handleClickOut );
        }

        function handleClickOut(e){
            if(e.type == 'mouseleave'){
                $(document).on('click', closeMenu );
            } else {
                $(document).off('click', closeMenu );
            }
        }

        $('.submenu-trigger').on('click', function(e){
            e.preventDefault();

			if( $(this).hasClass('open') ){
				$('.submenu').stop().slideUp('fast', function(){
					$('.submenu-trigger').removeClass('open');
				});
				$('#headline').off('mouseover mouseleave', handleClickOut );
			}else{
				$('.submenu').stop().slideDown('fast', function(){
					$('.submenu-trigger').addClass('open');
				});
				$('#headline').on('mouseover mouseleave', handleClickOut );
			}

		});

		$('.submenu').on('mouseover mouseleave', function(e){
			if( e.type == 'mouseover' ) clearTimeout( timerSubMenu );
			else{
				timerSubMenu = setTimeout(function(){
					$('.submenu').slideUp('fast');
				    $('.submenu-trigger').removeClass('open');
				    $('#headline').off('mouseover mouseleave', handleClickOut );
				    $(document).off('click', closeMenu );
				}, 2000);
			}
		});

	}

    function InitAnchors(){

		/**
		 * anchors scroll manager
		 */

		var anchorsPos = [],
	    	resizeTimer,
	    	$anchors = $('.archor'),
	    	anchorsArr = new Array( $anchors.length ),
	    	currentElemInt = 0,
	    	lastElemInt = 0;

    	$anchors.each(function(i){
    		var tid = $(this).attr('href').replace(/^[^#]?\#/, "");
    		tid=tid.substring(tid.indexOf('#'));
    		tid = tid.replace(/\#/g, "");
    		var el = $( '#' + tid );
    		anchorsArr[i] = el;
    	});

	    function getAnchorsPos(){
	    	clearTimeout(resizeTimer);
	    	resizeTimer = setTimeout(function(){
		    	//anchorsPos.length = 0;
		    	$anchors.each(function(i) {
		    		var $this = anchorsArr[i];
		    		var margTop = parseInt( $this.css('margin-top'), 10 );
		    		anchorsPos[i] = $this.position().top + margTop;
		    	});
	    	}, 200);
	    };

	    app.subscribe( this, 'onResize', getAnchorsPos );
	    getAnchorsPos();

    	$('.jscroll').on("scroll", function() {

    		//getAnchorsPos();
    		if(anchorsPos.length == 0) return;

    		var scrollTop = this.jscrollTop,
    			lastPos = 0,
    			screenPos;

    		$anchors.each(function(i) {
    			screenPos = anchorsPos[i] - 50 - scrollTop;
    			if( screenPos <= 0 && anchorsPos[i] > lastPos ){
    				currentElemInt = i;
    				lastPos = anchorsPos[i];
    			}
			});

    		if( currentElemInt != lastElemInt ){
    			lastElemInt = currentElemInt;
				$anchors.removeClass("selected")
						.eq(currentElemInt).addClass("selected");
    		}

    	});

	    /**
		 * anchors
	     */

	    $('.archor').on('click', function(e) {
	        e.preventDefault();

	        var target = $(this).attr('href').replace(/^[^#]+\#/, "#");
	        var pos = $(target).position().top - ( $("#headline").height() + 10 );

	        setTimeout(function(){
	        	$(target).parents('.jscroll').eq(0).data('jScroll').scrollTo( 0, pos, 700 );
	        }, 10 );

	     	if($(this).hasClass('selected')) {
		        $('.archor').removeClass('selected');
		        $(this).addClass('selected');
	     	}

	    });

    }

	/**
 	 *  ZoomViewer
     */
     $(document).on('click','.viewer-btn',function(e){
     //$('.viewer-btn').on('click', function(e){

     	e.preventDefault();

     	var src = $(this).data('src'),
     		bgcolor = $(this).data('bgcolor'),
     		legend = undefined,
     		$zoomPopin = $('#zoom-popin');

     	//Remove on load the previous legend
     	$zoomPopin.find('.img-legend-zoom').remove();

     	//If viewer has legend post
     	if( typeof $(this).data('legend') != 'undefined' ){

     		legend = $(this).data('legend');
     		$zoomPopin.find('img.tozoom').removeClass('tozoom');

     		//Add the legend of this post
     		$zoomPopin.find('.tozoom').append('<div class="img-legend-zoom"></div>');
     		$zoomPopin.find('.img-legend-zoom').append( $(this).siblings('.img-legend').html() ).css('visibility', 'visible');

     		//Force to refresh Cufon
     		//Cufon.refresh();

     	}

     	app.publish('onInitViewer', [src, bgcolor, legend]);

     });

    /**
     * Popins
     */
     app.utils.Popin.init();

    /**
     *  load images to resize Jscroll
     */
	function preLoadImagesOf( target, callback ){
		var $images = $(target).find('img');
		var numImgToload = $images.length;
      	var numloaded = 0;
        $images.each(function(i){
            app.utils.loadImage( this, $(this).attr('src'), function( img ){
		    	numloaded ++;
		    	app.publish( 'onResize' );

                if ( $('.jscroll').length ) {
                    $('.jscroll').data('jScroll').refresh();
                }

                if( numloaded >= numImgToload ){
                	callback();
                }
            });
        });
	};

     /**
	 * jScroll Custom Scrollbars
	 */

	var jscrollInitTimer = null;
	var jscrollInitated = false;
	$('.jscroll').jScroll({
		selectable: false/*,
		usetransition: false // issue with flash so...*/
	}, function(){
		clearTimeout( jscrollInitTimer );
		jscrollInitTimer = setTimeout(function(){

			/** preload images to give jscroll-content-wrap the real height including images */
			preLoadImagesOf('.jscroll', function(){
            	app.publish( 'onResize' );
            	$('.jscroll').data('jScroll').refresh();
            	$(window).trigger('resize');
            	$(window).trigger('resize');
            	$(window).trigger('resize');
			});

			//console.log('__JSCROLL_READY__');

			if( jscrollInitated ){ return; }

			jscrollInitated = true;
			HeadlineMenu();
			InitAnchors();
			app.publish('jscrollInit');

			/*MMMPlayer.ready(function(){
				$('.mmm-player').each(function(){
					MMMPlayer.create( this.getAttribute('id') );
				});
			});*/

        /***************** MMM PLAYER ****************/

        // var self = this;
        // //this.player = null;
        // this.$player = $('.modal-body .js-player');
        // console.log('video modal ok', this.$player);


        // _.each(this.$player, function(current){
        //   if( typeof MMMPlayer != "undefined" ){
        //     //wait for MMM API callback
        //     _.defer(_.bind(function(){
        //       MMMPlayer.create($(current).attr('id'), {
        //         features: {
        //           related: false,
        //           embed: false,
        //           logo: true,
        //           share: false
        //         }
        //       }, function(test){

        //         self.player = this;
        //         //use FB API as FB sharer doesn't work anymore
        //         //self.initFacebook();
        //       });
        //     },this));
        //   }
        // });

        // if( ! MMMPlayer.isReady ){
        //     MMMPlayer.loadAPI('diorparfums');
        // }

        /*------------------------------------*\
            #pause on close
        \*------------------------------------*/

        $(window).on('modal:close',function(){
            self.player.pause();
        });

        /*************************************************/

		}, 100 );
	});

	/**
     * Slideshow
     */
    if( $('.slideshow').length > 0 ){

	   	var $slideshow = $('.slideshow').not('.slideshow-history');

		preLoadImagesOf('.slideshow', function(){

            $slideshow.slideshow({
                controls: true,
                loop: true,
                speed: 800,
                shownav: false,
                autoslide: false,
                interval: 5000,
                easing : 'easeOutQuad'
            });

    	    if( $slideshow.data('control') == 'custom' ){
    		    $('.slideshow-custom-control .btn-next').on('click', function(e){
    		    	e.preventDefault();
    		    	$('.slideshow-arrow-next').trigger('click');
    		    });

    		    $('.slideshow-custom-control .btn-prev').on('click', function(e){
    		    	e.preventDefault();
    		    	$('.slideshow-arrow-prev').trigger('click');
    		    });

    		}
        });
    }

	/**
	 * JSDISPLAY :
	 * wait for js to load to display .js-display dom nodes;
	 */

 	$('.js-display').stop().css({
 		'visibility': 'visible',
 		opacity: 0
 	}).delay(700).animate({opacity: 1}, 500 );

	/** FILLAPRENT */
	$('.fill-parent').fillParent();

	//Roll img - box legend
	$('.wrapper-img').on('mouseenter mouseleave', function(e){

		if( e.type == 'mouseenter' ){

			$(this).find('.img-legend').stop().css({'visibility': 'visible', 'opacity': '0'}).animate({
				'opacity' : 1
			}, 250, function(){  });


		} else if( e.type == 'mouseleave' ){

			$(this).find('.img-legend').stop().animate({
				'opacity' : 0
			}, 250, function(){
				$(this).css('visibility', 'hidden');
			});

		}

	});

}
