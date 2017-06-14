(function( $, window, app ){

	'use strict';

	app.namespace("app.utils", {

		convertUnit: function( elem, prop, value, method ){
			var self = $(elem),
				parent = self.parent(),
				parentW = parent.width(),
				parentH = parent.height(),
				oldProp = value,
				parentDim = prop == 'left' ? parentW : parentH,
				method = typeof method === 'undefined' ? 'toperc' : method;
	        return  method == 'topx' ? ( parentDim / 100 ) * oldProp : ( oldProp / parentDim ) * 100;
		},

		loadImage: function(image, src, callback){

			var img = new Image();
			$(img).on('load',function(){
				$(this).off('load');
				callback.call(image, this);
			});
			img.src = src;
		    /*if (image.complete || image.complete === undefined){
			    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
			    $(img).on('load',function(){
			   		$(this).off('load');
			   	    callback.call(image, this);
			    });
			   img.src = src;
			} else {
				$(img).on('load',function(){ callback.call(image, this); });
				img.src = src;
			}*/


		},

		animate: function( elem, props, duration, callback, usefx ){

            var self = this,
                $img = $(this.img),
                duration = duration || 700,
                usefx = typeof usefx === 'undefined' ? true : usefx,
                animMethod = jQuery.fn.fx && usefx ? 'fx' : 'animate',
                callback = typeof callback != 'undefined' ? callback : function(){};

            $(elem).stop()[ animMethod ]( props, {
            	duration: duration,
            	easing: 'easeOutQuad',
            	complete: callback
            }).css('overflow', 'visible');

        }

	});


})( jQuery, window, scriptease );