(function( $, window ){

    var app = window.app || window.scriptease;

    app.history = function() {

        /*------------------------------------*\
            #slideshows
        \*------------------------------------*/
        jQuery('.slideshow-history').slideshow({
            controls: false,
            speed: 1000,
            interval: 3000,
            shownav: false,
            loop: false,
            autoslide: false
        });

        /*------------------------------------*\
            #open popin video
        \*------------------------------------*/

        $('.push .sequenceImg').on('click', function(e){
            e.preventDefault();
            $('#myModal').modal('show');


            /*------------------------------------*\
                #pause on close
            \*------------------------------------*/

            $('#myModal').on('hidden.bs.modal', function (e) {
                $(window).trigger('modal:close');
            })
        });

        /*------------------------------------*\
            #sequence img
        \*------------------------------------*/

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

        // Configuration
        var timer_sequence = null,
            index          = 0,
            sequenceImg    = $('.push .sequenceImg'),
            tabNbImg       = [],
            tabSeq         = [],
            tabFrame       = [];

        for (var i = 0; i < sequenceImg.length; i++) {

            // S�quenceur
            var seq = new Sequencer("#"+sequenceImg[i].id, {
                    sdPath: sequenceImg[i].getAttribute("data-url") + "img_#.jpg",
                    hdPath: sequenceImg[i].getAttribute("data-url") + "img_#.jpg",
                    imageCount: sequenceImg[i].getAttribute("data-nbImg"),
                    startIndex: 1
                }, function(){
                    console.log('Sequence ready');
            });

            tabSeq.push(seq);
            tabFrame.push(0);
            tabNbImg.push(sequenceImg[i].getAttribute("data-nbImg"));
        };

        // D�filement automatique
        $(sequenceImg).each(function(index){
            $(this).on('mouseenter', function() {
                $(this).removeClass('pause');
                timer_sequence = setInterval(function() {
                    tabFrame[index]++;
                    if (tabFrame[index] >= tabNbImg[index]) {
                        tabFrame[index] = 1;
                    }
                    tabSeq[index].update(tabFrame[index]);
                }, 60);
            });
        });

        $(sequenceImg).on('mouseleave', function() {
            $(this).addClass('pause');
            clearInterval(timer_sequence);
        });

        /*------------------------------------*\
            #player mmm video in slideshow
        \*------------------------------------*/

        var self = this;

        // if( ! MMMPlayer.isReady ){
        //     console.log('Load API here');
        //     MMMPlayer.loadAPI('diorparfums');
        // }

        $('.slideshow-history').find('video').each(function(index){

                var myPlayer = $('.js-player-'+index);

                myPlayer = MMMPlayer.create('dior_home_histoires_boucle_cover_v2', {

                capture: false,
                autoHideControls: true,
                autoplay: true,
                //subtitle: '/xml/dior_mydior_itw_vdc_en.xml',
                features: {
                    light: true,
                    mute: true,
                    embed: true,
                    share: false,
                    related: false,
                    logo: true,
                    time:true,
                    description:false
                }
            }, function(){

                this.on('capture', function(  base64String ){
                    $('#base64').attr('src', 'data:image/jpg;base64,' + base64String );
                    //$('#base64save').attr('href', 'data:image/jpg;base64,' + base64String );
                    //l'attrbiyut download semble ne pas fonctionner avec un data base64
                    //on créer un blob object pour contourner ce probleme
                    var blob = b64toBlob(base64String, "image/jpg");
                    var blobUrl = URL.createObjectURL(blob);
                    $('#base64save').attr('href', blobUrl );

                });

                var idDeLaVideo = this.getSrc();

                this.on('play', function(){
                    console.log('___play___');
                });
                this.on('pause', function(){
                    console.log('___pause___');
                });
                this.on('replay', function(){
                    console.log('___replay___');
                });
                this.on('sharefacebook', function(){
                    console.log('___sharefacebook___');
                });
                this.on('sharetumblr', function(){
                    console.log('___sharetumblr___');
                });
                this.on('sharetwitter', function(){
                    console.log('___sharetwitter___');
                });
                this.on('sharegoogle', function(){
                    console.log('___sharegoogle___');
                });
                this.on('shareweibo', function(){
                    console.log('___shareweibo___');
                });
                this.on('completion25', function(){
                    console.log('__completion25__');
                });
                this.on('completion50', function(){
                    console.log('__completion50__');
                });
                this.on('completion75', function(){
                    console.log('__completion75__');
                });
                this.on('completion100', function(){
                    console.log('__completion100__');
                });
            });
        });
        /**********************************************/
    }
})( jQuery, window );
