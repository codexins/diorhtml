(function( $, window, app ){

    'use strict';

    app.namespace("app.utils.Popin", {

        init: function(){

            var self = this;

            $(document).on('click','.popin .close',function(e){
                console.log('CLOSEEE');
                e.preventDefault(e);
                e.stopPropagation();
                MMMPlayer.stopAllVideos();
                self.closePop( $(this).closest('.popin') );
            });

            $(document).on('click','.popin-btn', function(e){
                console.log('__OPPIN BTN CLICK__');
                e.preventDefault();
                self.openPop( $(this).data('popin') );
            });

            //L'attribut 'data-click-out-side = true' permet au click outside de fermer la popin
            $('.popin').on('mouseover',function(){
                if($(this).data('click-out-side') == true)
                    $(document).off('mouseup');
            }).on('mouseleave',function(){
                var $self = $(this);
                if($(this).data('click-out-side') == true)
                    $(document).on('mouseup', function(){
                        self.closePop();
                    });
            });

            app.publish(app.events.POPIN_INITIATED);

        },

        openPop: function( elmt ){

            $('.popin').stop().animate({opacity:0}, 450, function(){
                $(this).hide();
            });

            if( $(elmt).css('display') == "none" )
                $(elmt).stop().css({'display':'block', opacity:0});

            $(elmt).stop().animate({opacity:1}, 450, function(){
                if(typeof this.style.removeAttribute != "undefined")this.style.removeAttribute('filter');
            });

            app.publish(app.events.OPEN_POPIN, [elmt]);

        },

        closePop: function(){
            app.publish(app.events.CLOSE_POPIN);
            $('.popin').stop().animate({opacity:0}, 450, function(){
                $(this).hide();
            });
        }

    });

})( jQuery, window, scriptease );


