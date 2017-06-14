(function( $, window ){

    var app = window.app || window.scriptease;

    app.home = function() {

        /*------------------------------------*\
            #slideshows
        \*------------------------------------*/

        jQuery('.slideshow.slideshow-cover').slideshow({
            speed: 1000,
            interval: 8000,
            shownav: true,
            controls: false,
            loop: true,
            autoslide: true,
            callsync: function(elmtSlides, activeIndex, newIndex){
                $('.wrap-text li').removeClass('active').eq(newIndex).addClass('active');
            }
        });

        if ($('#main-home .slideshow-push').length) {
            jQuery('.slideshow.slideshow-push').slideshow({
                speed: 1000,
                interval: 3000,
                shownav: false,
                controls: false,
                loop: false,
                autoslide: false,
            });
        }

        var $window =       $(window),
            mainHome      = $('#main-home'),
            pushSlideshow = mainHome.find('.push .slideshow-push'),heightImg,widthImg,
            rightCol      = mainHome.find('.col-right'),
            leftCol       = mainHome.find('.col-left'),biggerCol,smallerCol,
            windowWidth   = $window.outerWidth();
            coef          = null;
            heightCover   = $('.cover').outerHeight() + $('.top-logo').outerHeight()+coef;

        mainHome.imagesLoaded(function(){

        /*------------------------------------*\
            #parallax
        \*------------------------------------*/

            //calcul smaller column
            if (rightCol.outerHeight() > leftCol.outerHeight()) {
                biggerCol  = rightCol;
                smallerCol = leftCol;
            } else {
                biggerCol  = leftCol;
                smallerCol = rightCol;
            }

            // requestAnimationFrame polyfill
            (function() {
                var lastTime = 0;
                var vendors = ['ms', 'moz', 'webkit', 'o'];
                for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
                    window.cancelRequestAnimationFrame = window[vendors[x]+
                      'CancelRequestAnimationFrame'];
                }

                if (!window.requestAnimationFrame)
                    window.requestAnimationFrame = function(callback, element) {
                        var currTime = new Date().getTime();
                        var timeToCall = Math.max(0, 16 - (currTime - lastTime)); //if ie timetocall = 1000/60
                        var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                          timeToCall);
                        lastTime = currTime + timeToCall;
                        return id;
                    };

                if (!window.cancelAnimationFrame)
                    window.cancelAnimationFrame = function(id) {
                        clearTimeout(id);
                    };
            }());

            var endIndex, endValue;
            var resizeTimer;

            function calculateParallaxValue() {
                endIndex = $('.wrap-main-home').outerHeight() - $window.outerHeight();
                endValue = biggerCol.outerHeight() - smallerCol.outerHeight();
                //console.log(endIndex, endValue);
            }

            function majParallax() {
                calculateParallaxValue();

                smallerCol.data('parallax').options.top.endIndex = endIndex;
                smallerCol.data('parallax').options.top.endValue = endValue;
            }

            function updateParallax(){
                var scrollTop = $window.scrollTop();
                //document.title = scrollTop;
                if ( $window.outerWidth() > 800 ) {
                    smallerCol.data('parallax').update(scrollTop);
                }else{
                    smallerCol.data('parallax').update(0);
                }
            }

            function initParallax() {
                startPointParallax();
                calculateParallaxValue();
                smallerCol.parallax({
                    'top': {
                        startIndex: heightCover,
                        endIndex: endIndex,
                        startValue: 0,
                        endValue: endValue,
                        easing: 'linear'
                    }
                });
            }

            function startPointParallax(){
                if (windowWidth > 1400) {
                    coef = 40;
                }else{
                    coef = 28;
                }

                heightCover   = $('.big-wrapper').outerHeight() + $('.top-logo').outerHeight()+coef;
            }

            $window.on('scroll', function() {
                // 2 columns only
                if( $window.outerWidth() > 800 && $('.no-touchevents').length && !$('.lt-ie9').length)
                {
                    window.requestAnimationFrame(updateParallax);
                }

                // test if show scroll top
                var screenTop    = $(window).scrollTop(),
                    screenBottom = $(window).scrollTop() + $(window).height(),
                    footerTop    = $('#dior-footer').offset().top,
                    header       = $('#dior-header'),
                    headerTop    = header.offset().top,
                    headerHeight = header.height(),
                    headerBottom = parseInt(headerTop) + parseInt(headerHeight),
                    scrollToTop  = $('.scroll-to-top');

                if (screenTop >= headerBottom) {
                    scrollToTop.addClass('show fixed');

                    if (screenBottom >= footerTop) {
                        scrollToTop.removeClass('fixed');
                    }
                } else {
                    scrollToTop.removeClass('show fixed');
                }
            });

            $window.on('resize', function() {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function() {
                    startPointParallax();
                    majParallax();
                    updateParallax();
                }, 100);
            });


        /*------------------------------------*\
            #hauteur img slideshow-push
        \*------------------------------------*/

            function heightSlideshowPush() {
                pushSlideshow.each(function(index){
                    heightImg = $(this).find('img').eq(0).height();
                    widthImg  = $(this).find('img').eq(0).width();

                    paddinghack = Math.round( (heightImg / widthImg)*100 ) +'%';
                    $(this).closest('.push').css('padding-top',paddinghack);
                    $(this).closest('.push').css('position','relative');
                    $(this).closest('.push').css('overflow','hidden');
                });
            }

        /*------------------------------------*\
            #scroll top
        \*------------------------------------*/
            $('.scroll-to-top').on('click', function(e) {
                $('html, body').animate({
                    scrollTop: 0
                }, 500);
            });


            heightSlideshowPush();
            initParallax();
        });
    };
})( jQuery, window );
