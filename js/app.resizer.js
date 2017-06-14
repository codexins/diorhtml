(function( $, window ){

	var app = window.app || window.scriptease;

	app.resizer = function() {

		var $win = $(window),
			$page = $('#page'),
			winH = $win.height(),
			utilH = $page.height(),
			isOldIE = $('html.lt-ie8').length > 0 || $('html.ie7').length > 0;

		var headerH, footerH;

		function resizeContent(){
			winH = $win.height();
			utilH = $page.height();

            if ( $('#topbar').length ) {
                headerH = $('#topbar').height();
            } else {
                if ( $('#dior-header').length ) {
                    headerH = $('#dior-header').height();
                }
            }

			footerH = $('#footer').length ? $('#footer').height() : 0;

			$('.js-fit-win-height').height( winH );

			$('.js-fit-util-height').height( winH-headerH );
			$('.js-min-util-height').css( 'min-height', (winH-headerH-footerH) + 'px' );
		}

		function fixIE(){
			/**
		     * top bottom : fixe top-bottom behaviour on ie6
		     */
			$('.topbottom').each(function(){

				var $this = $(this),
		    		$parent = $this.parent(),
					oldTop = parseInt($this.css('top')),
					oldBottom = parseInt($this.css('bottom')),
					margin = parseInt($this.css('top'), 10) + parseInt($this.css('bottom'), 10);

	            $this.css({
	            	bottom: 'auto',
	            	height: $parent.height() - margin
	            });

			});


			$('.borderbox').each(function(){

				var $this = $(this);

				var padTop    = parseInt( $this.css('padding-top'), 10);
				var padRight  = parseInt( $this.css('padding-right'), 10);
				var padBottom = parseInt( $this.css('padding-bottom'), 10);
				var padLeft   = parseInt( $this.css('padding-left'), 10);
				var margTop    = parseInt( $this.css('margin-top'), 10);
				var margRight  = parseInt( $this.css('margin-right'), 10);
				var margBottom = parseInt( $this.css('margin-bottom'), 10);
				var margLeft   = parseInt( $this.css('margin-left'), 10);
				var bordTop    = parseInt( $this.css('border-top'), 10);
				var bordRight  = parseInt( $this.css('border-right'), 10);
				var bordBottom = parseInt( $this.css('border-bottom'), 10);
				var bordLeft   = parseInt( $this.css('border-left'), 10);

				$this.removeAttr( 'style' );
				$this.css({margin: 0, padding: 0});

				var width = $this.width();
				var height = $this.height();

	            $this.css({
	            	width: width - padRight - padLeft - margRight - margLeft,
	            	height: height - padTop - padBottom - margTop - margBottom,
	            	paddingTop: padTop,
	            	paddingRight: padRight,
	            	paddingBottom: padBottom,
	            	paddingLeft: padLeft,
	            	marginTop: margTop,
	            	marginRight: margRight,
	            	marginBottom: margBottom,
	            	marginLeft: margLeft,
	            	borderTop: bordTop,
	            	borderRight: bordRight,
	            	borderBottom: bordBottom,
	            	borderLeft: bordLeft
	            });

			});

		}

		function onResize(){
			app.publish('onResize');
			resizeContent();
			if ( isOldIE ) {
				fixIE();
			}
		}

		$(window).on("resize orientationchange load", onResize );
		onResize();

	}

})( jQuery, window );
