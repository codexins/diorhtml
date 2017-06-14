$(document).ready(function() {

    if ( $('#main-home.home-tpl').length ) {
       $('html').addClass('main-home');
        app.home();
    };
    if ( $('.chrono-grid').length ) {
       $('html').addClass('page-chronology');
    };

    if( $('#library-map').length || $('#library-content').length || $('#library-bookview').length ){
       $('html').addClass('page-jscroll');
    }

    //for overide scrollbar
    if ( $('#prehome.home-tpl').length ) {
       $('html').addClass('prehome-histoires');
       $(window).trigger('resize');
    };

    //Re-parse DOM because SMILE add our CSS in body tag after respondjs
    if( $('html').hasClass('lt-ie9') ){
        if( typeof respond !== 'undefined' ){
            respond.update();
        }
    }

	app.checkBrowser();
	//MMMPlayer.init();
	app.resizer();
	app.common();
	app.loadAllModuleScripts();
    // app.history();

    if ($('html').hasClass('lt-ie10')) {
        $('#univers-trigger').on('click', function() {
            setTimeout(function(){

                var padding = "0px";
                if ($('body').hasClass('universContentOpened')) {
                    padding = "183px";
                }

                $('#wrapper').animate({ marginTop: padding }, 400);
            },0);
        });
        $(window).on('scroll', function() {
            $('#wrapper').animate({ marginTop: "0px" }, 400);
        });
    }

    //Custom overlay/menu of Happy-End
    var $footer = $('#footer'),
        $listlanguageFooter = $footer.find('#languages'),
        $footerOverlay = $('#maz-custom-overlay');

    $footer.find('.footer-language-js').on('click', function(e){
        e.preventDefault();
        $footerOverlay.stop().fadeToggle();
        $listlanguageFooter.stop().slideToggle(500);
    });

    $footerOverlay.on('click', function(){
        $listlanguageFooter.stop().slideToggle(500, function(){
            $footerOverlay.stop().fadeToggle();
        });
    });

    $listlanguageFooter.find('.footer-language-toggle-js').on('click', function(e){
        e.preventDefault();
        var self = $(this);

        if( !self.hasClass('active') ){

            if( $listlanguageFooter.find('ul.active') ){
                $listlanguageFooter.find('.footer-language-toggle-js.active').removeClass('active');
                $listlanguageFooter.find('ul.active').hide(300, function(){
                    $(this).removeClass('active');
                });
            }

            self.siblings('ul').show(300, function(){
                $(this).addClass('active');
                self.addClass('active');
            });

        }
    });

});