
(function( $, window ){

	'use strict';

	if( typeof window.scriptease != 'undefined' ) return;

	/**
	 * javascript utils
	 */
	String.prototype.trim = function(){
		return this.replace(/^\s+/g,'').replace(/\s+$/g,'') 
	}


	if (!(window.console && console.log)) {
	    (function() {
	        var noop = function() {};
	        var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'markTimeline', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
	        var length = methods.length;
	        var console = window.console = {};
	        while (length--) {
	            console[methods[length]] = noop;
	        }
	    }());
	}

	/**
	 * Add standard implementation for bind to Function if necessary (addition to ECMA-262 standard)
	 */
	if (!Function.prototype.bind) {
		Function.prototype.bind = function (oThis) {
			if (typeof this !== "function") {
				// closest thing possible to the ECMAScript 5 internal IsCallable function
				throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
			}

			var aArgs = Array.prototype.slice.call(arguments, 1), 
				fToBind = this, 
				fNOP = function () {},
				fBound = function () {
					return fToBind.apply(this instanceof fNOP && oThis
						? this
						: oThis,
					aArgs.concat(Array.prototype.slice.call(arguments)));
				};

			fNOP.prototype = this.prototype;
			fBound.prototype = new fNOP();

			return fBound;
		};
	}

	/**
	 * Extend jQuery for blazing fast selectors.
	 * More about it: http://jsperf.com/extend-jquery-for-classname-id-vs-find
	 */
	$.id = function(id) {
		return $(document.getElementById(id));
	};

	$.tag = function(tag) {
		return $().pushStack(document.getElementsByTagName(tag));
	};

	$.fn.tag = function(tag) {
		var e = $();
		this.each(function() {
			e = $.merge(e, $().pushStack(this.getElementsByTagName(tag)));
		});
		return e;
	};

	$.classname = document.getElementsByClassName
		? function(cl) {
			return $().pushStack(document.getElementsByClassName(cl));
		}
		: function(cl) {
			return $(cl.replace(/^| +/g, '.'));
		};

	$.fn.classname = document.getElementsByClassName
		? function(cl) {
			var e = $();
			this.each(function() {
				e = $.merge(e, $().pushStack(this.getElementsByClassName(cl)));
			});
			return e;
		}
		: function(cl) {
			return this.find(cl.replace(/^| +/g, '.'));
		};


	/**
	 * Scriptease Extends
	 */
	var scriptease = {};

    scriptease.extend = function(){
 
    	var options, k,
    		baseObject = arguments[0] || {},
    		length = arguments.length;	

    	if( length == 1 ){
    	   baseObject = Ultima;
    	   i = 0;
    	}
    	
    	if ( typeof baseObject !== "object" && typeof baseObject !== 'function' ) {
    		baseObject = {};
    	}
    	
    	for ( var i=1; i<length; i++ ) {
    	    if ( (options = arguments[i]) != null ) {
    		    for ( k in options ) {
                    if ( options[k] !== undefined ) {
    					baseObject[k] = options[k];
    				}
    		    }
    	    }
    	}
    	return baseObject;
    }


    /**
     * scriptease core variables
     */

    scriptease.getRootDomain = function(d) {
		var c = d.split(".");
		var a = d;
		if(c.length > 1) {
			var b = c.slice(c.length - 2);
			a = b ? b.join(".") : a
		}
		return a
	}

	scriptease = scriptease.extend({}, scriptease, {

		global : window,
		NAME : 'scriptease',
		ROOT_DOMAIN : scriptease.getRootDomain(window.location.hostname),
		SSL_ONLY : '',//.attr("protocol") == "https",
		GADGET_INSTANCE : "gadgetInstance",
		IS_LOADED_KEY : "isLoaded",
		ROOT_URLS : undefined,
		SECURE_ROOT_URLS : undefined,
		SERVICE_URLS : undefined,
		DEFAULT_APP_NAME : undefined,
		DEFAULT_VERSION : undefined,
		SCRIPT_MANAGER_FORMAT : undefined,
		ROOT_URL : undefined,
		SECURE_ROOT_URL : undefined,
		COUNTRY : undefined,
		LOCALE : undefined,
		REGION : undefined,
		BUILD_REVISION : undefined,
		additionalAppVersions : [],
		stylesToInclude : [],
		scriptsToInclude : [],
		loadedScripts : [],
		scriptConfig : {
	        waitSeconds: 7,
	        baseUrl: './',
	        paths: {},
	        pkgs: {},
	        shim: {}
	    },
		format : '',// jQuery.url.param("format") || "optimized",
		scriptManagerLoadComplete : false,
		scriptIncludeLoadStart : false,
        UAList : {
            'Ipad' : '.*(Ipad).*',
            'Ipod' : '.*(Ipod).*',
            'Iphone' : '.*(Iphone).*',
            'IE6' : '.*(MSIE 6).*',
            'IE7' : '.*(MSIE 7).*',
            'IE8' : '.*(MSIE 8).*',
            'IE9' : '.*(MSIE 9).*',
            'Opera Mobile' : '.*Opera Mobi.*',
            'Opera' : '.*Opera.*',
            'Firefox 2' : '.*Firefox/2.*',
            'Firefox 3' : '.*Firefox/3.*',
            'Firefox 4' : '.*Firefox/4.*',
            'Firefox' : '.*Firefox.*',
            'Netscape' : '.*Netscape.*',
            'Chrome' : '.*(Chrome).*',
            'Safari' : '.*(Safari|Camino).*',
            'Konqueror' : '.*Konqueror.*',
            'Other' : '.*'
        }
	});


	/**
     * scriptease core functions
     */
	scriptease = scriptease.extend({}, scriptease, {
		error : function(err){ 
			throw new Error(err)
		},

		debug: function(log){
			if( window.console ) console.log(log)
		},

		emptyFn: function(){},

		isDefined : function(b, f, a) {
			var e = b.split(".");
			var d = f ? f : scriptease.global;
			for(var c = 0; c < e.length; c++) {
				if(!d[e[c]]) {
					return a ? d[e[c]] : false
				}
				d = d[e[c]]
			}
			return a ? d : true
		},

        namespace: function( path, obj ){
            var namespaceArr = path.split("."),
                namespace = null, 
                root = window;

            for( var i = 0; i < namespaceArr.length; i++ ) {
                namespace = namespaceArr[i];
                if( i >= namespaceArr.length-1 && typeof obj == 'function'){
            		root[namespace] = obj;
            		return root;
            		break;
                }
                root[namespace] = root[namespace] || {};
                root = root[namespace];
            }


            if( typeof obj != undefined ){
            	for(var k in obj){
            		if( !root[k] ) root[k] = obj[k];
            	}
            }
            return root;
        },

		requireDependencies : function(dependencies) {
			var dps = typeof dependencies == "string" ? [dependencies] : dependencies,
				c = new Array(), d;
			for( var i = 0; i < dps.length; i++) {
				if( !scriptease.loadingScripts.contains(dps[i]) && !scriptease.loadedScripts.contains(dps[i]) ){
					scriptease.loadingScripts.push( dps[i] );
					scriptease.loadScript( dps[i] );
				}
			}
		},

		/*subscribe : function(eventName, method) {
			var events = typeof eventName == "string" ? [eventName] : eventName;
			for(var i = 0, l = events.length; i < l; i++) {
				$(scriptease.global).on(events[i], method);
			}
		},

		unsubscribe : function(eventName, method) {
			var events = typeof eventName == "string" ? [eventName] : eventName;
			for(var i = 0, l = events.length; i < l; i++) {
				$(scriptease.global).off(events[i], method)
			}
		},

		publish : function(eventName, args) {
			$(scriptease.global).trigger(eventName, args)
		},*/


		handlers : {},

	    subscribe: function( target, event, method ) {
			var events = typeof event == "string" ? [event] : event;
	        this.handlers[method] = function() { method.apply(target, arguments); }
			for(var i = 0, l = events.length; i < l; i++) {
		        $(scriptease.global).on(events[i], this.handlers[method]);
			}
	    },

	    unsubscribe: function( event, method ) {
			var events = typeof event == "string" ? [event] : event;
			for(var i = 0, l = events.length; i < l; i++) {
				$(scriptease.global).off(events[i], this.handlers[method]);
			}
	    },
	    
	    publish: function( event, data ) {
	        $(scriptease.global).trigger( event, typeof data != 'undefined'? data : [] );
	    },

		getRootUrl : function(a){
			return scriptease.ROOT_URLS[a]
		},

		getScriptUrl : function(a){
			return scriptease.ROOT_URL + "/js/"
		},

		getScriptFromUrl : function(m){
			return scriptease.ROOT_URL + "js/" + m + '.js';
		},

		getNameFromUrl : function(m){
			return m.match(/[^\/]+$/)[0];
		},

		getModuleUrl : function(a) {
			return scriptease.getScriptUrl() + scriptease.NAME + '.module.' + a + '.js';
		},
		
		loadAllModuleScripts : function() {
			var a = {};
			var c = new Array();
			$("div[data-module]").each(function() {
				a[$(this).attr("data-module")] = true;
				var ctrls = $(this).attr("data-module").split(',');
				for(var i=0;i<ctrls.length;i++){
					var b = { 
						name: 'app.module.' + ctrls[i].trim(),
						src: scriptease.getModuleUrl(ctrls[i].trim()),
						element : $(this)[0]
					};
					if(typeof(app.module[ctrls[i].trim()]) == "undefined") {
						c.push(b);
						scriptease.scriptsToInclude.push(b);
					} else {
						scriptease.publish(scriptease.events.MODULE_SCRIPTS_LOADED, [ b ]);
					}
				}
			});

			if(c.length > 0) {
				scriptease.loadScript();
			}
		},
		loadScript : function(e) {
			
			function check() {
				if( typeof this != 'undefined' ){
					scriptease.publish(scriptease.events.MODULE_SCRIPTS_LOADED, [ this ]);
				}
				if(scriptease.scriptsToInclude.length == 0) {
					scriptease.scriptIncludeLoadStart = false;
					//scriptease.publish(scriptease.events.MODULE_SCRIPTS_LOADED);
				} else {
					var f = scriptease.scriptsToInclude.shift();
					if(f) {
						scriptease.loadScript(f);
					}
				}
			}
			if(e) {
				var c = document;
				var b = c.createElement("script");
				b.type = "text/javascript";
				b.defer = false;
				b.name = e.name;
				b.src = e.src;
				b.element = e.element;
				if( b.addEventListener )
				  b.addEventListener( "load", check, false );
				else if( b.readyState )
				  b.onreadystatechange = function(){ 
				  	if(("loaded" === b.readyState || "complete" === b.readyState))
				  		check.call(this);
				  };
				c.body.appendChild(b);
			} else {
				check();
			}
		},
		addLoadedScript : function(e, b) {
			var c, a;
			var d = false;
			for(var c = 0, a = scriptease.loadedScripts.length; c < a; c++) {
				if(scriptease.loadedScripts[c].name === e) {
					d = true;
					break
				}
			}
			if(!d) {
				scriptease.loadedScripts.push({
					name : e,
					isDependency : b
				})
			}
		},
		getLoadedScript : function(c) {
			var b, a;
			for(var b = 0, a = scriptease.loadedScripts.length; b < a; b++) {
				if(scriptease.loadedScripts[b].name === c) {
					return scriptease.loadedScripts[b]
				}
			}
		},
        checkBrowser : function() {
            var UAList = scriptease.UAList;
            for(var r_browser in UAList) {
                var rule = new RegExp( UAList[r_browser], 'i');
                if(navigator.userAgent.match(rule)) {
                    scriptease.browser = r_browser;
                    break;
                }
            }
        }

	});


	/**
	 * scriptease events
	 */
	scriptease.events = {
		MODULE_SCRIPTS_LOADED : 'onModuleScroptsLoaded'
	}


	/**
	 * expose scriptease to global
	 */
	window.scriptease = scriptease;


})( jQuery, window );