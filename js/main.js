

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
    $("#video-popup").magnificPopup({
        items: {
            src: 'video/craft-video.mp4',
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
    		$("a.sticky-nav-home i.fa").addClass( "sticky-nav-i" );
    	}, function() {
    		$("a.sticky-nav-home i.fa").removeClass( "sticky-nav-i" );
    	}
    );
    $( ".sticky-nav-ongoing" ).hover(
    	function() {
    		$("a.sticky-nav-ongoing i.fa").addClass( "sticky-nav-i" );
    	}, function() {
    		$("a.sticky-nav-ongoing i.fa").removeClass( "sticky-nav-i" );
    	}
    );
    $( ".sticky-nav-archive" ).hover(
    	function() {
    		$("a.sticky-nav-archive i.fa").addClass( "sticky-nav-i" );
    	}, function() {
    		$("a.sticky-nav-archive i.fa").removeClass( "sticky-nav-i" );
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
    // sticky nav scroll for haute-couture.html

    $( ".sticky-introduction" ).hover(
        function() {
            $("a.sticky-introduction i.fa").addClass( "sticky-nav-i" );
        }, function() {
            $("a.sticky-introduction i.fa").removeClass( "sticky-nav-i" );
        }
    );
    $( ".sticky-fine-soft" ).hover(
        function() {
            $("a.sticky-fine-soft i.fa").addClass( "sticky-nav-i" );
        }, function() {
            $("a.sticky-fine-soft i.fa").removeClass( "sticky-nav-i" );
        }
    );
    $( ".sticky-prototypes" ).hover(
        function() {
            $("a.sticky-prototypes i.fa").addClass( "sticky-nav-i" );
        }, function() {
            $("a.sticky-prototypes i.fa").removeClass( "sticky-nav-i" );
        }
    );
    $( ".sticky-allocation" ).hover(
        function() {
            $("a.sticky-allocation i.fa").addClass( "sticky-nav-i" );
        }, function() {
            $("a.sticky-allocation i.fa").removeClass( "sticky-nav-i" );
        }
    );
    $( ".sticky-cutting" ).hover(
        function() {
            $("a.sticky-cutting i.fa").addClass( "sticky-nav-i" );
        }, function() {
            $("a.sticky-cutting i.fa").removeClass( "sticky-nav-i" );
        }
    );

    $( ".sticky-final-assembly" ).hover(
        function() {
            $("a.sticky-final-assembly i.fa").addClass( "sticky-nav-i" );
        }, function() {
            $("a.sticky-final-assembly i.fa").removeClass( "sticky-nav-i" );
        }
    );
    $( ".sticky-conclusion" ).hover(
        function() {
            $("a.sticky-conclusion i.fa").addClass( "sticky-nav-i" );
        }, function() {
            $("a.sticky-conclusion i.fa").removeClass( "sticky-nav-i" );
        }
    );



    $(".sticky-introduction").click(function(e) {
        e.preventDefault();
        $('html,body').animate({
            scrollTop: $("#introduction").offset().top},
            'slow');

    });

    $(".sticky-fine-soft").click(function(e) {
        e.preventDefault();
        $('html,body').animate({
            scrollTop: $("#soft-dressmaking").offset().top},
            'slow');

    });
    $(".sticky-prototypes").click(function(e) {
        e.preventDefault();
        $('html,body').animate({
            scrollTop: $("#prototype").offset().top},
            'slow');

    });
    $(".sticky-allocation").click(function(e) {
        e.preventDefault();
        $('html,body').animate({
            scrollTop: $("#allocation").offset().top},
            'slow');

    });
    $(".sticky-cutting").click(function(e) {
        e.preventDefault();
        $('html,body').animate({
            scrollTop: $("#cutting").offset().top},
            'slow');

    });

    $(".sticky-final-assembly").click(function(e) {
        e.preventDefault();
        $('html,body').animate({
            scrollTop: $("#final-assembly").offset().top},
            'slow');

    });
    $(".sticky-conclusion").click(function(e) {
        e.preventDefault();
        $('html,body').animate({
            scrollTop: $("#find-more").offset().top},
            'slow');

    });










})(jQuery);