

(function ($) {

	"use strict";











	$(".slick-slider").slick({
		// normal options...
		infinite: false,
		autoplay:true ,
		prevArrow:'<button type="button" class="slick-prev"><i class="fa fa-angle-left" aria-hidden="true"></i></button>',
		nextArrow:'<button type="button" class="slick-next"><i class="fa fa-angle-right" aria-hidden="true"></i></button>',
		// the magic

		responsive: [{
			breakpoint: 1024,
			settings: {
				slidesToShow: 1,
				infinite: true
			}
		}, {
			breakpoint: 600,
			settings: {

				slidesToShow: 1,

				dots: true
			}
		}]
	});
    
    // fragnance slider / slick carousel js code
    $('.fragnance-slider-content').slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        dots: false,
        centerMode: true,
        focusOnSelect: true,
        draggable: false,

        centerPadding: '50px',
        appendArrows: $(".fragnance-slider-content"),
        prevArrow: '<div class="slider-nav-left"></div>',
        nextArrow: '<div class="slider-nav-right"></div>',
    });

    //     $(".prototype-carosel").slick({
    //     // normal options...
    //     infinite: false,
    //     autoplay:true ,
    //     arrows: false,
    //     // the magic

    //     responsive: [{
    //         breakpoint: 1024,
    //         settings: {
    //             slidesToShow: 1,
    //             infinite: true
    //         }
    //     }, {
    //         breakpoint: 600,
    //         settings: {

    //             slidesToShow: 1,

    //             dots: true
    //         }
    //     }]
    // });

    // FINE SOFT DRESSMAKING
    $(".prototype-carosel").slick({
        // normal options...
        infinite: false,
        autoplay:true ,
        arrows: false,
        // infinite:true,
        // the magic

        responsive: [{
            breakpoint: 1024,
            settings: {
                slidesToShow: 1,
                infinite: true
            }
        }, {
            breakpoint: 600,
            settings: {

                slidesToShow: 1,

                dots: true
            }
        }]
    });



    // Example with single object
    $('#video-popup').magnificPopup({
        items: {
            src: 'video/craft-video.mp4',
          },
       type: 'iframe' // this overrides default type
    });

    $('#fragnance-row-two').magnificPopup({
        items: {
            src: 'video/fragnance-row2-video2.mp4',
          },
       type: 'iframe' // this overrides default type
    });

    $('#fragnance-row-three-one').magnificPopup({
        items: {
            src: 'video/fragnance-row3-video1.mp4',
          },
       type: 'iframe' // this overrides default type
    });

    $('#fragnance-row-three-two').magnificPopup({
        items: {
            src: 'video/fragnance-row3-video2.mp4',
          },
       type: 'iframe' // this overrides default type
    });

    $('#makeup-row-two').magnificPopup({
        items: {
            src: 'video/makeup-row2.mp4',
        },
    type: 'iframe' // this overrides default type
    });

    $('#makeup-row-three-five').magnificPopup({
        items: {
            src: 'video/makeup-row3-5.mp4',
        },
    type: 'iframe' // this overrides default type
    });





    // Example with single object
    $('#video-popup2').magnificPopup({
        items: {
            src: 'video/2.mp4',
          },
       type: 'iframe' // this overrides default type
    });



    $('#video-popup3').magnificPopup({
        items: {
            src: 'video/3.mp4',
          },
       type: 'iframe' // this overrides default type
    });










    // Banner Scroll button
    $(".scroll-button").click(function() {
        $('html,body').animate({
            scrollTop: $(".ongoing").offset().top},
            'slow');
    });
    
    // sticky nav scroll

    $( ".sticky-nav-home" ).hover(
        function() {
            $(".sticky-nav-home .fa").addClass( "sticky-nav-i" );
        }, function() {
            $(".sticky-nav-home .fa").removeClass( "sticky-nav-i" );
        }
    );
    $( ".sticky-nav-ongoing" ).hover(
        function() {
            $(".sticky-nav-ongoing .fa").addClass( "sticky-nav-i" );
        }, function() {
            $(".sticky-nav-ongoing .fa").removeClass( "sticky-nav-i" );
        }
    );
    $( ".sticky-nav-archive" ).hover(
        function() {
            $(".sticky-nav-archive .fa").addClass( "sticky-nav-i" );
        }, function() {
            $(".sticky-nav-archive .fa").removeClass( "sticky-nav-i" );
        }
    );

    $(".sticky-nav-home").click(function(e) {
        e.preventDefault();
        $('html,body').animate({
            scrollTop: $(".header-top").offset().top},
            'slow');

    });
    $(".sticky-nav-ongoing").click(function(e) {
        e.preventDefault();
        $('html,body').animate({
            scrollTop: $(".ongoing").offset().top},
            'slow');
    });
    $(".sticky-nav-archive").click(function(e) {
        e.preventDefault();
        $('html,body').animate({
            scrollTop: $(".archive").offset().top},
            'slow');
    });







})(jQuery);