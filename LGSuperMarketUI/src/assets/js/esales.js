/*! Liberty Mutual eSales - v2.42.0 - 10-19-2018
* Copyright (c) 2018 */

/*! Shoestring - v2.0.0 - 2017-02-14
 * http://github.com/filamentgroup/shoestring/
 * Copyright (c) 2017 Scott Jehl, Filament Group, Inc; Licensed MIT & GPLv2 */
(function( factory ) {
	if( typeof define === 'function' && define.amd ) {
		// AMD. Register as an anonymous module.
		define( [ 'shoestring' ], factory );
	} else if (typeof module === 'object' && module.exports) {
		// Node/CommonJS
		module.exports = factory();
	} else {
		// Browser globals
		factory();
	}
}(function () {
	var win = typeof window !== "undefined" ? window : this;
	var doc = win.document;


	/**
	 * The shoestring object constructor.
	 *
	 * @param {string,object} prim The selector to find or element to wrap.
	 * @param {object} sec The context in which to match the `prim` selector.
	 * @returns shoestring
	 * @this window
	 */
	function shoestring( prim, sec ){
		var pType = typeof( prim ),
			ret = [],
			sel;

		// return an empty shoestring object
		if( !prim ){
			return new Shoestring( ret );
		}

		// ready calls
		if( prim.call ){
			return shoestring.ready( prim );
		}

		// handle re-wrapping shoestring objects
		if( prim.constructor === Shoestring && !sec ){
			return prim;
		}

		// if string starting with <, make html
		if( pType === "string" && prim.indexOf( "<" ) === 0 ){
			var dfrag = doc.createElement( "div" );

			dfrag.innerHTML = prim;

			// TODO depends on children (circular)
			return shoestring( dfrag ).children().each(function(){
				dfrag.removeChild( this );
			});
		}

		// if string, it's a selector, use qsa
		if( pType === "string" ){
			if( sec ){
				return shoestring( sec ).find( prim );
			}

			sel = doc.querySelectorAll( prim );

			return new Shoestring( sel, prim );
		}

		// array like objects or node lists
		if( Object.prototype.toString.call( pType ) === '[object Array]' ||
			(win.NodeList && prim instanceof win.NodeList) ){

			return new Shoestring( prim, prim );
		}

		// if it's an array, use all the elements
		if( prim.constructor === Array ){
			return new Shoestring( prim, prim );
		}

		// otherwise assume it's an object the we want at an index
		return new Shoestring( [prim], prim );
	}

	var Shoestring = function( ret, prim ) {
		this.length = 0;
		this.selector = prim;
		shoestring.merge(this, ret);
	};

	// TODO only required for tests
	Shoestring.prototype.reverse = [].reverse;

	// For adding element set methods
	shoestring.fn = Shoestring.prototype;

	shoestring.Shoestring = Shoestring;

	// For extending objects
	// TODO move to separate module when we use prototypes
	shoestring.extend = function( first, second ){
		for( var i in second ){
			if( second.hasOwnProperty( i ) ){
				first[ i ] = second[ i ];
			}
		}

		return first;
	};

	// taken directly from jQuery
	shoestring.merge = function( first, second ) {
		var len, j, i;

		len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	};

	// expose
	win.shoestring = shoestring;



	var xmlHttp = function() {
		try {
			return new XMLHttpRequest();
		}
		catch( e ){
			return new ActiveXObject( "Microsoft.XMLHTTP" );
		}
	};

	/**
	 * Make an HTTP request to a url.
	 *
	 * **NOTE** the following options are supported:
	 *
	 * - *method* - The HTTP method used with the request. Default: `GET`.
	 * - *data* - Raw object with keys and values to pass with request as query params. Default `null`.
	 * - *headers* - Set of request headers to add. Default `{}`.
	 * - *async* - Whether the opened request is asynchronouse. Default `true`.
	 * - *success* - Callback for successful request and response. Passed the response data.
	 * - *error* - Callback for failed request and response.
	 * - *cancel* - Callback for cancelled request and response.
	 *
	 * @param {string} url The url to request.
	 * @param {object} options The options object, see Notes.
	 * @return shoestring
	 * @this shoestring
	 */

	shoestring.ajax = function( url, options ) {
		var params = "", req = xmlHttp(), settings, key;

		settings = shoestring.extend( {}, shoestring.ajax.settings );

		if( options ){
			shoestring.extend( settings, options );
		}

		if( !url ){
			url = settings.url;
		}

		if( !req || !url ){
			return;
		}

		// create parameter string from data object
		if( settings.data ){
			for( key in settings.data ){
				if( settings.data.hasOwnProperty( key ) ){
					if( params !== "" ){
						params += "&";
					}
					params += encodeURIComponent( key ) + "=" +
						encodeURIComponent( settings.data[key] );
				}
			}
		}

		// append params to url for GET requests
		if( settings.method === "GET" && params ){

			url += "?" + params;
		}

		req.open( settings.method, url, settings.async );

		if( req.setRequestHeader ){
			req.setRequestHeader( "X-Requested-With", "XMLHttpRequest" );

			// Set 'Content-type' header for POST requests
			if( settings.method === "POST" && params ){
				req.setRequestHeader( "Content-type", "application/x-www-form-urlencoded" );
			}

			for( key in settings.headers ){
				if( settings.headers.hasOwnProperty( key ) ){
					req.setRequestHeader(key, settings.headers[ key ]);
				}
			}
		}

		req.onreadystatechange = function () {
			if( req.readyState === 4 ){
				// Trim the whitespace so shoestring('<div>') works
				var res = (req.responseText || '').replace(/^\s+|\s+$/g, '');
				if( req.status.toString().indexOf( "0" ) === 0 ){
					return settings.cancel( res, req.status, req );
				}
				else if ( req.status.toString().match( /^(4|5)/ ) && RegExp.$1 ){
					return settings.error( res, req.status, req );
				}
				else if (settings.success) {
					return settings.success( res, req.status, req );
				}
			}
		};

		if( req.readyState === 4 ){
			return req;
		}

		// Send request
		if( settings.method === "POST" && params ){
			req.send( params );
		} else {
			req.send();
		}

		return req;
	};

	shoestring.ajax.settings = {
		success: function(){},
		error: function(){},
		cancel: function(){},
		method: "GET",
		async: true,
		data: null,
		headers: {}
	};



	/**
	 * Helper function wrapping a call to [ajax](ajax.js.html) using the `GET` method.
	 *
	 * @param {string} url The url to GET from.
	 * @param {function} callback Callback to invoke on success.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.get = function( url, callback ){
		return shoestring.ajax( url, { success: callback } );
	};



	/**
	 * Load the HTML response from `url` into the current set of elements.
	 *
	 * @param {string} url The url to GET from.
	 * @param {function} callback Callback to invoke after HTML is inserted.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.load = function( url, callback ){
		var self = this,
			args = arguments,
			intCB = function( data ){
				self.each(function(){
					shoestring( this ).html( data );
				});

				if( callback ){
					callback.apply( self, args );
				}
			};

		shoestring.ajax( url, { success: intCB } );
		return this;
	};



	/**
	 * Helper function wrapping a call to [ajax](ajax.js.html) using the `POST` method.
	 *
	 * @param {string} url The url to POST to.
	 * @param {object} data The data to send.
	 * @param {function} callback Callback to invoke on success.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.post = function( url, data, callback ){
		return shoestring.ajax( url, { data: data, method: "POST", success: callback } );
	};



	/**
	 * Iterates over `shoestring` collections.
	 *
	 * @param {function} callback The callback to be invoked on each element and index
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.each = function( callback ){
		return shoestring.each( this, callback );
	};

	shoestring.each = function( collection, callback ) {
		var val;
		for( var i = 0, il = collection.length; i < il; i++ ){
			val = callback.call( collection[i], i, collection[i] );
			if( val === false ){
				break;
			}
		}

		return collection;
	};



	/**
	 * Check for array membership.
	 *
	 * @param {object} needle The thing to find.
	 * @param {object} haystack The thing to find the needle in.
	 * @return {boolean}
	 * @this window
	 */
	shoestring.inArray = function( needle, haystack ){
		var isin = -1;
		for( var i = 0, il = haystack.length; i < il; i++ ){
			if( haystack.hasOwnProperty( i ) && haystack[ i ] === needle ){
				isin = i;
			}
		}
		return isin;
	};



	/**
	 * Bind callbacks to be run when the DOM is "ready".
	 *
	 * @param {function} fn The callback to be run
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.ready = function( fn ){
		if( ready && fn ){
			fn.call( doc );
		}
		else if( fn ){
			readyQueue.push( fn );
		}
		else {
			runReady();
		}

		return [doc];
	};

	// TODO necessary?
	shoestring.fn.ready = function( fn ){
		shoestring.ready( fn );
		return this;
	};

	// Empty and exec the ready queue
	var ready = false,
		readyQueue = [],
		runReady = function(){
			if( !ready ){
				while( readyQueue.length ){
					readyQueue.shift().call( doc );
				}
				ready = true;
			}
		};

	// If DOM is already ready at exec time, depends on the browser.
	// From: https://github.com/mobify/mobifyjs/blob/526841be5509e28fc949038021799e4223479f8d/src/capture.js#L128
	if (doc.attachEvent ? doc.readyState === "complete" : doc.readyState !== "loading") {
		runReady();
	} else {
		doc.addEventListener( "DOMContentLoaded", runReady, false );
		doc.addEventListener( "readystatechange", runReady, false );
		win.addEventListener( "load", runReady, false );
	}



	/**
	 * Checks the current set of elements against the selector, if one matches return `true`.
	 *
	 * @param {string} selector The selector to check.
	 * @return {boolean}
	 * @this {shoestring}
	 */
	shoestring.fn.is = function( selector ){
		var ret = false, self = this, parents, check;

		// assume a dom element
		if( typeof selector !== "string" ){
			// array-like, ie shoestring objects or element arrays
			if( selector.length && selector[0] ){
				check = selector;
			} else {
				check = [selector];
			}

			return _checkElements(this, check);
		}

		parents = this.parent();

		if( !parents.length ){
			parents = shoestring( doc );
		}

		parents.each(function( i, e ) {
			var children;

			children = e.querySelectorAll( selector );

			ret = _checkElements( self, children );
		});

		return ret;
	};

	function _checkElements(needles, haystack){
		var ret = false;

		needles.each(function() {
			var j = 0;

			while( j < haystack.length ){
				if( this === haystack[j] ){
					ret = true;
				}

				j++;
			}
		});

		return ret;
	}



	/**
	 * Get data attached to the first element or set data values on all elements in the current set.
	 *
	 * @param {string} name The data attribute name.
	 * @param {any} value The value assigned to the data attribute.
	 * @return {any|shoestring}
	 * @this shoestring
	 */
	shoestring.fn.data = function( name, value ){
		if( name !== undefined ){
			if( value !== undefined ){
				return this.each(function(){
					if( !this.shoestringData ){
						this.shoestringData = {};
					}

					this.shoestringData[ name ] = value;
				});
			}
			else {
				if( this[ 0 ] ) {
					if( this[ 0 ].shoestringData ) {
						return this[ 0 ].shoestringData[ name ];
					}
				}
			}
		}
		else {
			return this[ 0 ] ? this[ 0 ].shoestringData || {} : undefined;
		}
	};


	/**
	 * Remove data associated with `name` or all the data, for each element in the current set.
	 *
	 * @param {string} name The data attribute name.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.removeData = function( name ){
		return this.each(function(){
			if( name !== undefined && this.shoestringData ){
				this.shoestringData[ name ] = undefined;
				delete this.shoestringData[ name ];
			}	else {
				this[ 0 ].shoestringData = {};
			}
		});
	};



	/**
	 * An alias for the `shoestring` constructor.
	 */
	win.$ = shoestring;



	/**
	 * Add a class to each DOM element in the set of elements.
	 *
	 * @param {string} className The name of the class to be added.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.addClass = function( className ){
		var classes = className.replace(/^\s+|\s+$/g, '').split( " " );

		return this.each(function(){
			for( var i = 0, il = classes.length; i < il; i++ ){
				if( this.className !== undefined &&
					(this.className === "" ||
					!this.className.match( new RegExp( "(^|\\s)" + classes[ i ] + "($|\\s)"))) ){
					this.className += " " + classes[ i ];
				}
			}
		});
	};



	/**
	 * Add elements matching the selector to the current set.
	 *
	 * @param {string} selector The selector for the elements to add from the DOM
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.add = function( selector ){
		var ret = [];
		this.each(function(){
			ret.push( this );
		});

		shoestring( selector ).each(function(){
			ret.push( this );
		});

		return shoestring( ret );
	};



	/**
	 * Insert an element or HTML string after each element in the current set.
	 *
	 * @param {string|HTMLElement} fragment The HTML or HTMLElement to insert.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.after = function( fragment ){
		if( typeof( fragment ) === "string" || fragment.nodeType !== undefined ){
			fragment = shoestring( fragment );
		}

		if( fragment.length > 1 ){
			fragment = fragment.reverse();
		}
		return this.each(function( i ){
			for( var j = 0, jl = fragment.length; j < jl; j++ ){
				var insertEl = i > 0 ? fragment[ j ].cloneNode( true ) : fragment[ j ];
				this.parentNode.insertBefore( insertEl, this.nextSibling );
			}
		});
	};



	/**
	 * Insert an element or HTML string as the last child of each element in the set.
	 *
	 * @param {string|HTMLElement} fragment The HTML or HTMLElement to insert.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.append = function( fragment ){
		if( typeof( fragment ) === "string" || fragment.nodeType !== undefined ){
			fragment = shoestring( fragment );
		}

		return this.each(function( i ){
			for( var j = 0, jl = fragment.length; j < jl; j++ ){
				this.appendChild( i > 0 ? fragment[ j ].cloneNode( true ) : fragment[ j ] );
			}
		});
	};



	/**
	 * Insert the current set as the last child of the elements matching the selector.
	 *
	 * @param {string} selector The selector after which to append the current set.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.appendTo = function( selector ){
		return this.each(function(){
			shoestring( selector ).append( this );
		});
	};



	/**
	 * Get the value of the first element of the set or set the value of all the elements in the set.
	 *
	 * @param {string} name The attribute name.
	 * @param {string} value The new value for the attribute.
	 * @return {shoestring|string|undefined}
	 * @this {shoestring}
	 */
	shoestring.fn.attr = function( name, value ){
		var nameStr = typeof( name ) === "string";

		if( value !== undefined || !nameStr ){
			return this.each(function(){
				if( nameStr ){
					this.setAttribute( name, value );
				}	else {
					for( var i in name ){
						if( name.hasOwnProperty( i ) ){
							this.setAttribute( i, name[ i ] );
						}
					}
				}
			});
		} else {
			return this[ 0 ] ? this[ 0 ].getAttribute( name ) : undefined;
		}
	};



	/**
	 * Insert an element or HTML string before each element in the current set.
	 *
	 * @param {string|HTMLElement} fragment The HTML or HTMLElement to insert.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.before = function( fragment ){
		if( typeof( fragment ) === "string" || fragment.nodeType !== undefined ){
			fragment = shoestring( fragment );
		}

		return this.each(function( i ){
			for( var j = 0, jl = fragment.length; j < jl; j++ ){
				this.parentNode.insertBefore( i > 0 ? fragment[ j ].cloneNode( true ) : fragment[ j ], this );
			}
		});
	};



	/**
	 * Get the children of the current collection.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.children = function(){
		var ret = [],
			childs,
			j;
		this.each(function(){
			childs = this.children;
			j = -1;

			while( j++ < childs.length-1 ){
				if( shoestring.inArray(  childs[ j ], ret ) === -1 ){
					ret.push( childs[ j ] );
				}
			}
		});
		return shoestring(ret);
	};



	/**
	 * Clone and return the current set of nodes into a new `shoestring` object.
	 *
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.clone = function() {
		var ret = [];

		this.each(function() {
			ret.push( this.cloneNode( true ) );
		});

		return shoestring( ret );
	};



	/**
	 * Find an element matching the selector in the set of the current element and its parents.
	 *
	 * @param {string} selector The selector used to identify the target element.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.closest = function( selector ){
		var ret = [];

		if( !selector ){
			return shoestring( ret );
		}

		this.each(function(){
			var element, $self = shoestring( element = this );

			if( $self.is(selector) ){
				ret.push( this );
				return;
			}

			while( element.parentElement ) {
				if( shoestring(element.parentElement).is(selector) ){
					ret.push( element.parentElement );
					break;
				}

				element = element.parentElement;
			}
		});

		return shoestring( ret );
	};



	shoestring.cssExceptions = {
		'float': [ 'cssFloat' ]
	};



	(function() {
		var cssExceptions = shoestring.cssExceptions;

		// IE8 uses marginRight instead of margin-right
		function convertPropertyName( str ) {
			return str.replace( /\-([A-Za-z])/g, function ( match, character ) {
				return character.toUpperCase();
			});
		}

		function _getStyle( element, property ) {
			return win.getComputedStyle( element, null ).getPropertyValue( property );
		}

		var vendorPrefixes = [ '', '-webkit-', '-ms-', '-moz-', '-o-', '-khtml-' ];

		/**
		 * Private function for getting the computed style of an element.
		 *
		 * **NOTE** Please use the [css](../css.js.html) method instead.
		 *
		 * @method _getStyle
		 * @param {HTMLElement} element The element we want the style property for.
		 * @param {string} property The css property we want the style for.
		 */
		shoestring._getStyle = function( element, property ) {
			var convert, value, j, k;

			if( cssExceptions[ property ] ) {
				for( j = 0, k = cssExceptions[ property ].length; j < k; j++ ) {
					value = _getStyle( element, cssExceptions[ property ][ j ] );

					if( value ) {
						return value;
					}
				}
			}

			for( j = 0, k = vendorPrefixes.length; j < k; j++ ) {
				convert = convertPropertyName( vendorPrefixes[ j ] + property );

				// VendorprefixKeyName || key-name
				value = _getStyle( element, convert );

				if( convert !== property ) {
					value = value || _getStyle( element, property );
				}

				if( vendorPrefixes[ j ] ) {
					// -vendorprefix-key-name
					value = value || _getStyle( element, vendorPrefixes[ j ] + property );
				}

				if( value ) {
					return value;
				}
			}

			return undefined;
		};
	})();



	(function() {
		var cssExceptions = shoestring.cssExceptions;

		// IE8 uses marginRight instead of margin-right
		function convertPropertyName( str ) {
			return str.replace( /\-([A-Za-z])/g, function ( match, character ) {
				return character.toUpperCase();
			});
		}

		/**
		 * Private function for setting the style of an element.
		 *
		 * **NOTE** Please use the [css](../css.js.html) method instead.
		 *
		 * @method _setStyle
		 * @param {HTMLElement} element The element we want to style.
		 * @param {string} property The property being used to style the element.
		 * @param {string} value The css value for the style property.
		 */
		shoestring._setStyle = function( element, property, value ) {
			var convertedProperty = convertPropertyName(property);

			element.style[ property ] = value;

			if( convertedProperty !== property ) {
				element.style[ convertedProperty ] = value;
			}

			if( cssExceptions[ property ] ) {
				for( var j = 0, k = cssExceptions[ property ].length; j<k; j++ ) {
					element.style[ cssExceptions[ property ][ j ] ] = value;
				}
			}
		};
	})();



	/**
	 * Get the compute style property of the first element or set the value of a style property
	 * on all elements in the set.
	 *
	 * @method _setStyle
	 * @param {string} property The property being used to style the element.
	 * @param {string|undefined} value The css value for the style property.
	 * @return {string|shoestring}
	 * @this shoestring
	 */
	shoestring.fn.css = function( property, value ){
		if( !this[0] ){
			return;
		}

		if( typeof property === "object" ) {
			return this.each(function() {
				for( var key in property ) {
					if( property.hasOwnProperty( key ) ) {
						shoestring._setStyle( this, key, property[key] );
					}
				}
			});
		}	else {
			// assignment else retrieve first
			if( value !== undefined ){
				return this.each(function(){
					shoestring._setStyle( this, property, value );
				});
			}

			return shoestring._getStyle( this[0], property );
		}
	};



	/**
	 * Returns the indexed element wrapped in a new `shoestring` object.
	 *
	 * @param {integer} index The index of the element to wrap and return.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.eq = function( index ){
		if( this[index] ){
			return shoestring( this[index] );
		}

		return shoestring([]);
	};



	/**
	 * Filter out the current set if they do *not* match the passed selector or
	 * the supplied callback returns false
	 *
	 * @param {string,function} selector The selector or boolean return value callback used to filter the elements.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.filter = function( selector ){
		var ret = [];

		this.each(function( index ){
			var wsel;

			if( typeof selector === 'function' ) {
				if( selector.call( this, index ) !== false ) {
					ret.push( this );
				}
			} else {
				if( !this.parentNode ){
					var context = shoestring( doc.createDocumentFragment() );

					context[ 0 ].appendChild( this );
					wsel = shoestring( selector, context );
				} else {
					wsel = shoestring( selector, this.parentNode );
				}

				if( shoestring.inArray( this, wsel ) > -1 ){
					ret.push( this );
				}
			}
		});

		return shoestring( ret );
	};



	/**
	 * Find descendant elements of the current collection.
	 *
	 * @param {string} selector The selector used to find the children
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.find = function( selector ){
		var ret = [],
			finds;
		this.each(function(){
			finds = this.querySelectorAll( selector );

			for( var i = 0, il = finds.length; i < il; i++ ){
				ret = ret.concat( finds[i] );
			}
		});
		return shoestring( ret );
	};



	/**
	 * Returns the first element of the set wrapped in a new `shoestring` object.
	 *
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.first = function(){
		return this.eq( 0 );
	};



	/**
	 * Returns the raw DOM node at the passed index.
	 *
	 * @param {integer} index The index of the element to wrap and return.
	 * @return {HTMLElement|undefined|array}
	 * @this shoestring
	 */
	shoestring.fn.get = function( index ){

		// return an array of elements if index is undefined
		if( index === undefined ){
			var elements = [];

			for( var i = 0; i < this.length; i++ ){
				elements.push( this[ i ] );
			}

			return elements;
		} else {
			return this[ index ];
		}
	};



	/**
	 * Private function for setting/getting the offset property for height/width.
	 *
	 * **NOTE** Please use the [width](width.js.html) or [height](height.js.html) methods instead.
	 *
	 * @param {shoestring} set The set of elements.
	 * @param {string} name The string "height" or "width".
	 * @param {float|undefined} value The value to assign.
	 * @return shoestring
	 * @this window
	 */
	shoestring._dimension = function( set, name, value ){
		var offsetName;

		if( value === undefined ){
			offsetName = name.replace(/^[a-z]/, function( letter ) {
				return letter.toUpperCase();
			});

			return set[ 0 ][ "offset" + offsetName ];
		} else {
			// support integer values as pixels
			value = typeof value === "string" ? value : value + "px";

			return set.each(function(){
				this.style[ name ] = value;
			});
		}
	};



	/**
	 * Gets the height value of the first element or sets the height for the whole set.
	 *
	 * @param {float|undefined} value The value to assign.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.height = function( value ){
		return shoestring._dimension( this, "height", value );
	};



	var set = function( html ){
		if( typeof html === "string" || typeof html === "number" ){
			return this.each(function(){
				this.innerHTML = "" + html;
			});
		} else {
			var h = "";
			if( typeof html.length !== "undefined" ){
				for( var i = 0, l = html.length; i < l; i++ ){
					h += html[i].outerHTML;
				}
			} else {
				h = html.outerHTML;
			}
			return this.each(function(){
				this.innerHTML = h;
			});
		}
	};
	/**
	 * Gets or sets the `innerHTML` from all the elements in the set.
	 *
	 * @param {string|undefined} html The html to assign
	 * @return {string|shoestring}
	 * @this shoestring
	 */
	shoestring.fn.html = function( html ){
		if( typeof html !== "undefined" ){
			return set.call( this, html );
		} else { // get
			var pile = "";

			this.each(function(){
				pile += this.innerHTML;
			});

			return pile;
		}
	};



	(function() {
		function _getIndex( set, test ) {
			var i, result, element;

			for( i = result = 0; i < set.length; i++ ) {
				element = set.item ? set.item(i) : set[i];

				if( test(element) ){
					return result;
				}

				// ignore text nodes, etc
				// NOTE may need to be more permissive
				if( element.nodeType === 1 ){
					result++;
				}
			}

			return -1;
		}

		/**
		 * Find the index in the current set for the passed selector.
		 * Without a selector it returns the index of the first node within the array of its siblings.
		 *
		 * @param {string|undefined} selector The selector used to search for the index.
		 * @return {integer}
		 * @this {shoestring}
		 */
		shoestring.fn.index = function( selector ){
			var self, children;

			self = this;

			// no arg? check the children, otherwise check each element that matches
			if( selector === undefined ){
				children = ( ( this[ 0 ] && this[0].parentNode ) || doc.documentElement).childNodes;

				// check if the element matches the first of the set
				return _getIndex(children, function( element ) {
					return self[0] === element;
				});
			} else {

				// check if the element matches the first selected node from the parent
				return _getIndex(self, function( element ) {
					return element === (shoestring( selector, element.parentNode )[ 0 ]);
				});
			}
		};
	})();



	/**
	 * Insert the current set after the elements matching the selector.
	 *
	 * @param {string} selector The selector after which to insert the current set.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.insertAfter = function( selector ){
		return this.each(function(){
			shoestring( selector ).after( this );
		});
	};



	/**
	 * Insert the current set before the elements matching the selector.
	 *
	 * @param {string} selector The selector before which to insert the current set.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.insertBefore = function( selector ){
		return this.each(function(){
			shoestring( selector ).before( this );
		});
	};



	/**
	 * Returns the last element of the set wrapped in a new `shoestring` object.
	 *
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.last = function(){
		return this.eq( this.length - 1 );
	};



	/**
	 * Returns a `shoestring` object with the set of siblings of each element in the original set.
	 *
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.next = function(){

		var result = [];

		// TODO need to implement map
		this.each(function() {
			var children, item, found;

			// get the child nodes for this member of the set
			children = shoestring( this.parentNode )[0].childNodes;

			for( var i = 0; i < children.length; i++ ){
				item = children.item( i );

				// found the item we needed (found) which means current item value is
				// the next node in the list, as long as it's viable grab it
				// NOTE may need to be more permissive
				if( found && item.nodeType === 1 ){
					result.push( item );
					break;
				}

				// find the current item and mark it as found
				if( item === this ){
					found = true;
				}
			}
		});

		return shoestring( result );
	};



	/**
	 * Removes elements from the current set.
	 *
	 * @param {string} selector The selector to use when removing the elements.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.not = function( selector ){
		var ret = [];

		this.each(function(){
			var found = shoestring( selector, this.parentNode );

			if( shoestring.inArray(this, found) === -1 ){
				ret.push( this );
			}
		});

		return shoestring( ret );
	};



	/**
	 * Returns an object with the `top` and `left` properties corresponging to the first elements offsets.
	 *
	 * @return object
	 * @this shoestring
	 */
	shoestring.fn.offset = function(){
		return {
			top: this[ 0 ].offsetTop,
			left: this[ 0 ].offsetLeft
		};
	};



	/**
	 * Returns the set of first parents for each element in the current set.
	 *
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.parent = function(){
		var ret = [],
			parent;

		this.each(function(){
			// no parent node, assume top level
			// jQuery parent: return the document object for <html> or the parent node if it exists
			parent = (this === doc.documentElement ? doc : this.parentNode);

			// if there is a parent and it's not a document fragment
			if( parent && parent.nodeType !== 11 ){
				ret.push( parent );
			}
		});

		return shoestring(ret);
	};



	/**
	 * Returns the set of all parents matching the selector if provided for each element in the current set.
	 *
	 * @param {string} selector The selector to check the parents with.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.parents = function( selector ){
		var ret = [];

		this.each(function(){
			var curr = this, match;

			while( curr.parentElement && !match ){
				curr = curr.parentElement;

				if( selector ){
					if( curr === shoestring( selector )[0] ){
						match = true;

						if( shoestring.inArray( curr, ret ) === -1 ){
							ret.push( curr );
						}
					}
				} else {
					if( shoestring.inArray( curr, ret ) === -1 ){
						ret.push( curr );
					}
				}
			}
		});

		return shoestring(ret);
	};



	/**
	 * Add an HTML string or element before the children of each element in the current set.
	 *
	 * @param {string|HTMLElement} fragment The HTML string or element to add.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.prepend = function( fragment ){
		if( typeof( fragment ) === "string" || fragment.nodeType !== undefined ){
			fragment = shoestring( fragment );
		}

		return this.each(function( i ){

			for( var j = 0, jl = fragment.length; j < jl; j++ ){
				var insertEl = i > 0 ? fragment[ j ].cloneNode( true ) : fragment[ j ];
				if ( this.firstChild ){
					this.insertBefore( insertEl, this.firstChild );
				} else {
					this.appendChild( insertEl );
				}
			}
		});
	};



	/**
	 * Add each element of the current set before the children of the selected elements.
	 *
	 * @param {string} selector The selector for the elements to add the current set to..
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.prependTo = function( selector ){
		return this.each(function(){
			shoestring( selector ).prepend( this );
		});
	};



	/**
	 * Returns a `shoestring` object with the set of *one* siblingx before each element in the original set.
	 *
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.prev = function(){

		var result = [];

		// TODO need to implement map
		this.each(function() {
			var children, item, found;

			// get the child nodes for this member of the set
			children = shoestring( this.parentNode )[0].childNodes;

			for( var i = children.length -1; i >= 0; i-- ){
				item = children.item( i );

				// found the item we needed (found) which means current item value is
				// the next node in the list, as long as it's viable grab it
				// NOTE may need to be more permissive
				if( found && item.nodeType === 1 ){
					result.push( item );
					break;
				}

				// find the current item and mark it as found
				if( item === this ){
					found = true;
				}
			}
		});

		return shoestring( result );
	};



	/**
	 * Returns a `shoestring` object with the set of *all* siblings before each element in the original set.
	 *
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.prevAll = function(){

		var result = [];

		this.each(function() {
			var $previous = shoestring( this ).prev();

			while( $previous.length ){
				result.push( $previous[0] );
				$previous = $previous.prev();
			}
		});

		return shoestring( result );
	};



	// Property normalization, a subset taken from jQuery src
	shoestring.propFix = {
		"class": "className",
		contenteditable: "contentEditable",
		"for": "htmlFor",
		readonly: "readOnly",
		tabindex: "tabIndex"
	};



	/**
	 * Gets the property value from the first element or sets the property value on all elements of the currrent set.
	 *
	 * @param {string} name The property name.
	 * @param {any} value The property value.
	 * @return {any|shoestring}
	 * @this shoestring
	 */
	shoestring.fn.prop = function( name, value ){
		if( !this[0] ){
			return;
		}

		name = shoestring.propFix[ name ] || name;

		if( value !== undefined ){
			return this.each(function(){
				this[ name ] = value;
			});
		}	else {
			return this[ 0 ][ name ];
		}
	};



	/**
	 * Remove an attribute from each element in the current set.
	 *
	 * @param {string} name The name of the attribute.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.removeAttr = function( name ){
		return this.each(function(){
			this.removeAttribute( name );
		});
	};



	/**
	 * Remove a class from each DOM element in the set of elements.
	 *
	 * @param {string} className The name of the class to be removed.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.removeClass = function( cname ){
		var classes = cname.replace(/^\s+|\s+$/g, '').split( " " );

		return this.each(function(){
			var newClassName, regex;

			for( var i = 0, il = classes.length; i < il; i++ ){
				if( this.className !== undefined ){
					regex = new RegExp( "(^|\\s)" + classes[ i ] + "($|\\s)", "gmi" );
					newClassName = this.className.replace( regex, " " );

					this.className = newClassName.replace(/^\s+|\s+$/g, '');
				}
			}
		});
	};



	/**
	 * Remove the current set of elements from the DOM.
	 *
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.remove = function(){
		return this.each(function(){
			if( this.parentNode ) {
				this.parentNode.removeChild( this );
			}
		});
	};



	/**
	 * Remove a proprety from each element in the current set.
	 *
	 * @param {string} name The name of the property.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.removeProp = function( property ){
		var name = shoestring.propFix[ property ] || property;

		return this.each(function(){
			this[ name ] = undefined;
			delete this[ name ];
		});
	};



	/**
	 * Replace each element in the current set with that argument HTML string or HTMLElement.
	 *
	 * @param {string|HTMLElement} fragment The value to assign.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.replaceWith = function( fragment ){
		if( typeof( fragment ) === "string" ){
			fragment = shoestring( fragment );
		}

		var ret = [];

		if( fragment.length > 1 ){
			fragment = fragment.reverse();
		}
		this.each(function( i ){
			var clone = this.cloneNode( true ),
				insertEl;
			ret.push( clone );

			// If there is no parentNode, this is pointless, drop it.
			if( !this.parentNode ){ return; }

			if( fragment.length === 1 ){
				insertEl = i > 0 ? fragment[ 0 ].cloneNode( true ) : fragment[ 0 ];
				this.parentNode.replaceChild( insertEl, this );
			} else {
				for( var j = 0, jl = fragment.length; j < jl; j++ ){
					insertEl = i > 0 ? fragment[ j ].cloneNode( true ) : fragment[ j ];
					this.parentNode.insertBefore( insertEl, this.nextSibling );
				}
				this.parentNode.removeChild( this );
			}
		});

		return shoestring( ret );
	};



	shoestring.inputTypes = [
		"text",
		"hidden",
		"password",
		"color",
		"date",
		"datetime",
		// "datetime\-local" matched by datetime
		"email",
		"month",
		"number",
		"range",
		"search",
		"tel",
		"time",
		"url",
		"week"
	];

	shoestring.inputTypeTest = new RegExp( shoestring.inputTypes.join( "|" ) );


	/**
	 * Serialize child input element values into an object.
	 *
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.serialize = function(){
		var data = {};

		shoestring( "input, select", this ).each(function(){
			var type = this.type, name = this.name,	value = this.value;

			if( shoestring.inputTypeTest.test( type ) ||
				( type === "checkbox" || type === "radio" ) &&
				this.checked ){

				data[ name ] = value;
			}	else if( this.nodeName === "SELECT" ){
				data[ name ] = this.options[ this.selectedIndex ].nodeValue;
			}
		});

		return data;
	};



	/**
	 * Get all of the sibling elements for each element in the current set.
	 *
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.siblings = function(){

		if( !this.length ) {
			return shoestring( [] );
		}

		var sibs = [], el = this[ 0 ].parentNode.firstChild;

		do {
			if( el.nodeType === 1 && el !== this[ 0 ] ) {
				sibs.push( el );
			}

			el = el.nextSibling;
		} while( el );

		return shoestring( sibs );
	};



	var getText = function( elem ){
		var node,
			ret = "",
			i = 0,
			nodeType = elem.nodeType;

		if ( !nodeType ) {
			// If no nodeType, this is expected to be an array
			while ( (node = elem[i++]) ) {
				// Do not traverse comment nodes
				ret += getText( node );
			}
		} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
			// Use textContent for elements
			// innerText usage removed for consistency of new lines (jQuery #11153)
			if ( typeof elem.textContent === "string" ) {
				return elem.textContent;
			} else {
				// Traverse its children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
		// Do not include comment or processing instruction nodes

		return ret;
	};

	/**
	 * Recursively retrieve the text content of the each element in the current set.
	 *
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.text = function() {

		return getText( this );
	};




	/**
	 * Get the value of the first element or set the value of all elements in the current set.
	 *
	 * @param {string} value The value to set.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.val = function( value ){
		var el;
		if( value !== undefined ){
			return this.each(function(){
				if( this.tagName === "SELECT" ){
					var optionSet, option,
						options = this.options,
						values = [],
						i = options.length,
						newIndex;

					values[0] = value;
					while ( i-- ) {
						option = options[ i ];
						if ( (option.selected = shoestring.inArray( option.value, values ) >= 0) ) {
							optionSet = true;
							newIndex = i;
						}
					}
					// force browsers to behave consistently when non-matching value is set
					if ( !optionSet ) {
						this.selectedIndex = -1;
					} else {
						this.selectedIndex = newIndex;
					}
				} else {
					this.value = value;
				}
			});
		} else {
			el = this[0];

			if( el.tagName === "SELECT" ){
				if( el.selectedIndex < 0 ){ return ""; }
				return el.options[ el.selectedIndex ].value;
			} else {
				return el.value;
			}
		}
	};



	/**
	 * Gets the width value of the first element or sets the width for the whole set.
	 *
	 * @param {float|undefined} value The value to assign.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.width = function( value ){
		return shoestring._dimension( this, "width", value );
	};



	/**
	 * Wraps the child elements in the provided HTML.
	 *
	 * @param {string} html The wrapping HTML.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.wrapInner = function( html ){
		return this.each(function(){
			var inH = this.innerHTML;

			this.innerHTML = "";
			shoestring( this ).append( shoestring( html ).html( inH ) );
		});
	};



	function initEventCache( el, evt ) {
		if ( !el.shoestringData ) {
			el.shoestringData = {};
		}
		if ( !el.shoestringData.events ) {
			el.shoestringData.events = {};
		}
		if ( !el.shoestringData.loop ) {
			el.shoestringData.loop = {};
		}
		if ( !el.shoestringData.events[ evt ] ) {
			el.shoestringData.events[ evt ] = [];
		}
	}

	function addToEventCache( el, evt, eventInfo ) {
		var obj = {};
		obj.isCustomEvent = eventInfo.isCustomEvent;
		obj.callback = eventInfo.callfunc;
		obj.originalCallback = eventInfo.originalCallback;
		obj.namespace = eventInfo.namespace;

		el.shoestringData.events[ evt ].push( obj );

		if( eventInfo.customEventLoop ) {
			el.shoestringData.loop[ evt ] = eventInfo.customEventLoop;
		}
	}

	/**
	 * Bind a callback to an event for the currrent set of elements.
	 *
	 * @param {string} evt The event(s) to watch for.
	 * @param {object,function} data Data to be included with each event or the callback.
	 * @param {function} originalCallback Callback to be invoked when data is define.d.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.bind = function( evt, data, originalCallback ){

		if( typeof data === "function" ){
			originalCallback = data;
			data = null;
		}

		var evts = evt.split( " " );

		// NOTE the `triggeredElement` is purely for custom events from IE
		function encasedCallback( e, namespace, triggeredElement ){
			var result;

			if( e._namespace && e._namespace !== namespace ) {
				return;
			}

			e.data = data;
			e.namespace = e._namespace;

			var returnTrue = function(){
				return true;
			};

			e.isDefaultPrevented = function(){
				return false;
			};

			var originalPreventDefault = e.preventDefault;
			var preventDefaultConstructor = function(){
				if( originalPreventDefault ) {
					return function(){
						e.isDefaultPrevented = returnTrue;
						originalPreventDefault.call(e);
					};
				} else {
					return function(){
						e.isDefaultPrevented = returnTrue;
						e.returnValue = false;
					};
				}
			};

			// thanks https://github.com/jonathantneal/EventListener
			e.target = triggeredElement || e.target || e.srcElement;
			e.preventDefault = preventDefaultConstructor();
			e.stopPropagation = e.stopPropagation || function () {
					e.cancelBubble = true;
				};

			result = originalCallback.apply(this, [ e ].concat( e._args ) );

			if( result === false ){
				e.preventDefault();
				e.stopPropagation();
			}

			return result;
		}

		return this.each(function(){
			var domEventCallback,
				customEventCallback,
				customEventLoop,
				oEl = this;

			for( var i = 0, il = evts.length; i < il; i++ ){
				var split = evts[ i ].split( "." ),
					evt = split[ 0 ],
					namespace = split.length > 0 ? split[ 1 ] : null;

				domEventCallback = function( originalEvent ) {
					if( oEl.ssEventTrigger ) {
						originalEvent._namespace = oEl.ssEventTrigger._namespace;
						originalEvent._args = oEl.ssEventTrigger._args;

						oEl.ssEventTrigger = null;
					}
					return encasedCallback.call( oEl, originalEvent, namespace );
				};
				customEventCallback = null;
				customEventLoop = null;

				initEventCache( this, evt );

				this.addEventListener( evt, domEventCallback, false );

				addToEventCache( this, evt, {
					callfunc: customEventCallback || domEventCallback,
					isCustomEvent: !!customEventCallback,
					customEventLoop: customEventLoop,
					originalCallback: originalCallback,
					namespace: namespace
				});
			}
		});
	};

	shoestring.fn.on = shoestring.fn.bind;




	/**
	 * Unbind a previous bound callback for an event.
	 *
	 * @param {string} event The event(s) the callback was bound to..
	 * @param {function} callback Callback to unbind.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.unbind = function( event, callback ){


		var evts = event ? event.split( " " ) : [];

		return this.each(function(){
			if( !this.shoestringData || !this.shoestringData.events ) {
				return;
			}

			if( !evts.length ) {
				unbindAll.call( this );
			} else {
				var split, evt, namespace;
				for( var i = 0, il = evts.length; i < il; i++ ){
					split = evts[ i ].split( "." ),
						evt = split[ 0 ],
						namespace = split.length > 0 ? split[ 1 ] : null;

					if( evt ) {
						unbind.call( this, evt, namespace, callback );
					} else {
						unbindAll.call( this, namespace, callback );
					}
				}
			}
		});
	};

	function unbind( evt, namespace, callback ) {
		var bound = this.shoestringData.events[ evt ];
		if( !(bound && bound.length) ) {
			return;
		}

		var matched = [], j, jl;
		for( j = 0, jl = bound.length; j < jl; j++ ) {
			if( !namespace || namespace === bound[ j ].namespace ) {
				if( callback === undefined || callback === bound[ j ].originalCallback ) {
					this.removeEventListener( evt, bound[ j ].callback, false );
					matched.push( j );
				}
			}
		}

		for( j = 0, jl = matched.length; j < jl; j++ ) {
			this.shoestringData.events[ evt ].splice( j, 1 );
		}
	}

	function unbindAll( namespace, callback ) {
		for( var evtKey in this.shoestringData.events ) {
			unbind.call( this, evtKey, namespace, callback );
		}
	}

	shoestring.fn.off = shoestring.fn.unbind;


	/**
	 * Bind a callback to an event for the currrent set of elements, unbind after one occurence.
	 *
	 * @param {string} event The event(s) to watch for.
	 * @param {function} callback Callback to invoke on the event.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.one = function( event, callback ){
		var evts = event.split( " " );

		return this.each(function(){
			var thisevt, cbs = {},	$t = shoestring( this );

			for( var i = 0, il = evts.length; i < il; i++ ){
				thisevt = evts[ i ];

				cbs[ thisevt ] = function( e ){
					var $t = shoestring( this );

					for( var j in cbs ) {
						$t.unbind( j, cbs[ j ] );
					}

					return callback.apply( this, [ e ].concat( e._args ) );
				};

				$t.bind( thisevt, cbs[ thisevt ] );
			}
		});
	};



	/**
	 * Trigger an event on the first element in the set, no bubbling, no defaults.
	 *
	 * @param {string} event The event(s) to trigger.
	 * @param {object} args Arguments to append to callback invocations.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.triggerHandler = function( event, args ){
		var e = event.split( " " )[ 0 ],
			el = this[ 0 ],
			ret;

		// See this.fireEvent( 'on' + evts[ i ], document.createEventObject() ); instead of click() etc in trigger.
		if( doc.createEvent && el.shoestringData && el.shoestringData.events && el.shoestringData.events[ e ] ){
			var bindings = el.shoestringData.events[ e ];
			for (var i in bindings ){
				if( bindings.hasOwnProperty( i ) ){
					event = doc.createEvent( "Event" );
					event.initEvent( e, true, true );
					event._args = args;
					args.unshift( event );

					ret = bindings[ i ].originalCallback.apply( event.target, args );
				}
			}
		}

		return ret;
	};



	/**
	 * Trigger an event on each of the DOM elements in the current set.
	 *
	 * @param {string} event The event(s) to trigger.
	 * @param {object} args Arguments to append to callback invocations.
	 * @return shoestring
	 * @this shoestring
	 */
	shoestring.fn.trigger = function( event, args ){
		var evts = event.split( " " );

		return this.each(function(){
			var split, evt, namespace;
			for( var i = 0, il = evts.length; i < il; i++ ){
				split = evts[ i ].split( "." ),
					evt = split[ 0 ],
					namespace = split.length > 0 ? split[ 1 ] : null;

				if( evt === "click" ){
					if( this.tagName === "INPUT" && this.type === "checkbox" && this.click ){
						this.click();
						return false;
					}
				}

				if( doc.createEvent ){
					var event = doc.createEvent( "Event" );
					event.initEvent( evt, true, true );
					event._args = args;
					event._namespace = namespace;

					this.dispatchEvent( event );
				}
			}
		});
	};



	return shoestring;
}));

if( !window.jQuery ){
	window.jQuery = window.shoestring;
	window.$ = window.shoestring;
}
/*! Tappy! - a lightweight normalized tap event. Copyright 2013 @scottjehl, Filament Group, Inc. Licensed MIT */
(function( w, $, undefined ){

	// handling flag is true when an event sequence is in progress (thx androood)
	w.tapHandling = false;
	w.tappy = true;

	var tap = function( $els ){
		return $els.each(function(){

			var $el = $( this ),
				resetTimer,
				startY,
				startX,
				cancel,
				scrollTolerance = 10;

			function trigger( e ){
				$( e.target ).trigger( "tap", [ e, $( e.target ).attr( "href" ) ] );
			}

			function getCoords( e ){
				var ev = e.originalEvent || e,
					touches = ev.touches || ev.targetTouches;

				if( touches ){
					return [ touches[ 0 ].pageX, touches[ 0 ].pageY ];
				}
				else {
					return null;
				}
			}

			function start( e ){
				if( e.touches && e.touches.length > 1 || e.targetTouches && e.targetTouches.length > 1 ){
					return false;
				}

				var coords = getCoords( e );
				startX = coords[ 0 ];
				startY = coords[ 1 ];
			}

			// any touchscroll that results in > tolerance should cancel the tap
			function move( e ){
				if( !cancel ){
					var coords = getCoords( e );
					if( coords && ( Math.abs( startY - coords[ 1 ] ) > scrollTolerance || Math.abs( startX - coords[ 0 ] ) > scrollTolerance ) ){
						cancel = true;
					}
				}
			}

			function end( e ){
				clearTimeout( resetTimer );
				resetTimer = setTimeout( function(){
					w.tapHandling = false;
					cancel = false;
				}, 1000 );

				// make sure no modifiers are present. thx http://www.jacklmoore.com/notes/click-events/
				if( ( e.which && e.which > 1 ) || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey ){
					return;
				}

				e.preventDefault();

				// this part prevents a double callback from touch and mouse on the same tap

				// if a scroll happened between touchstart and touchend
				if( cancel || w.tapHandling && w.tapHandling !== e.type ){
					cancel = false;
					return;
				}

				w.tapHandling = e.type;
				trigger( e );
			}

			$el
				.bind( "touchstart.tappy MSPointerDown.tappy", start )
				.bind( "touchmove.tappy MSPointerMove.tappy", move )
				.bind( "touchend.tappy MSPointerUp.tappy", end )
				.bind( "click.tappy", end );
		});
	};

	var untap = function( $els ){
		return $els.unbind( ".tappy" );
	};

	// use special events api
	if( $.event && $.event.special ){
		$.event.special.tap = {
			add: function( handleObj ) {
				tap( $( this ) );
			},
			remove: function( handleObj ) {
				untap( $( this ) );
			}
		};
	}
	else{
		// monkeybind
		var oldBind = $.fn.bind,
			oldUnbind = $.fn.unbind;
		$.fn.bind = function( evt ){
			if( /(^| )tap( |$)/.test( evt ) ){
				tap( this );
			}
			return oldBind.apply( this, arguments );
		};
		$.fn.unbind = function( evt ){
			if( /(^| )tap( |$)/.test( evt ) ){
				untap( this );
			}
			return oldUnbind.apply( this, arguments );
		};
	}

}( this, jQuery ));

/*
 * Collapsible widget
 * https://github.com/filamentgroup/collapsible
 * Copyright (c) 2014 Filament Group, Inc.
 * Licensed under the MIT, GPL licenses.
 */

;(function ($, window, document, undefined) {

	// Defaults
	var pluginName = "collapsible";
	var idInt = 0;
	// overrideable defaults
	var defaults = {
		pluginClass: pluginName,
		collapsedClass: pluginName + "-collapsed",
		headerClass: pluginName + "-header",
		contentClass: pluginName + "-content",
		enhancedClass: pluginName + "-enhanced",
		instructions: false,
		collapsed: false
	};

	// plugin constructor
	function Plugin(element, options) {
		this.element = $( element );
		var self = this,
			dataOptions = {};

		// Allow data-attr option setting
		if( this.element.is( "[data-config]" ) ){
			for( var option in defaults ){
					if( defaults.hasOwnProperty( option) ){
					var value = self.element.attr( "data-" + option.replace( /[A-Z]/g, function( c ) {
									return "-" + c.toLowerCase();
								}));

					if ( value !== undefined ) {
						if( value === "true" || value === "false" ){
							dataOptions[ option ] = value === "true";
						}
						else {
							dataOptions[ option ] = value;
						}
					}
				}
			}
		}



		this.options = $.extend( {}, defaults, dataOptions, options );

		// allow the collapsedClass to set the option if specified
		if( this.element.is( "." + this.options.collapsedClass ) ){
			this.options.collapsed= true;
		}

		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	Plugin.prototype = {
		init: function () {
			this.header = this.element.find( "." + this.options.headerClass ).eq( 0 );
			if( !this.header.length ){
				this.element.children().eq( 0 );
			}
			this.content = this.element.find( "." + this.options.contentClass ).eq( 0 );
			if( !this.content.length ){
				this.header.next();

			}
			this._addAttributes();
			this._bindEvents();
			idInt++;
			this.element.data( pluginName, this );
			this.element.trigger( "init" );
		},

		_addAttributes: function(){
			this.element
				.addClass( this.options.pluginClass )
				.addClass( this.options.enhancedClass );

			this.header.addClass( this.options.headerClass );

			if( this.options.instructions ){
				this.header.attr( "title", this.options.instructions );
			}

			var id = "collapsible-" + idInt;

			this.header.attr( "role", "button" );

			this.header.attr( "aria-haspopup", "true" );

			this.header.attr( "aria-controls", id );

			this.header.attr( "tabindex", "0" );

			this.content.attr( "role", "menu" );

			this.content.addClass( this.options.contentClass );

			this.content.attr( "id", id );
		},

		_bindEvents: function(){
			var self = this;

			this.header
				// use the tappy plugin if it's available
				// tap can't be namespaced yet without special events api: https://github.com/filamentgroup/tappy/issues/22
				.bind( ( window.tappy ? "tap" : "click" ), function( e ){
					self.toggle( e.target );
					e.preventDefault();
				})
				.bind( "keydown." + pluginName, function( e ){
					if( e.which === 13 || e.which === 32 ){
						self.toggle( e.target );
						e.preventDefault();
					}
				});

			if( this.options.collapsed ){
				this._collapse();
			}
			else {
				this._expand();
			}
		},

		collapsed: false,

		// used internally to expand without triggering events (for init)
		_expand: function() {
			this.element.removeClass( this.options.collapsedClass );
			this.collapsed = false;
			this.header.attr( "aria-expanded", "true" );
			this.content.attr( "aria-hidden", "false" );
		},

		expand: function () {
			var self = $( this ).data( pluginName ) || this;
			self._expand();
			self.element.trigger( "expand" );
		},

		// used internally to expand without triggering events (for init)
		_collapse: function() {
			this.element.addClass( this.options.collapsedClass );
			this.collapsed = true;
			this.header.attr( "aria-expanded", "false" );
			this.content.attr( "aria-hidden", "true" );
		},
		
		collapse: function() {
			var self = $( this ).data( pluginName ) || this;
			self._collapse();
			self.element.trigger( "collapse" );
		},

		toggle: function(){
			if(  this.collapsed ){
				this.expand();
			} else {
				this.collapse();
			}
		},

		focusable: "a, input, textarea, select, button, [tabindex='0']"



	};

	// lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[ pluginName ] = function (options) {
		return this.each(function () {
			if ( !$( this ).data( pluginName ) ) {
				new Plugin( this, options );
			}
		});
	};

	// Simple auto-init by selector that runs when the dom is ready. Trigger "enhance" if desirable.
	$( document ).bind( "enhance", function( e ){
		var selector = "." + pluginName;
		$( $( e.target ).is( selector ) && e.target ).add( selector, e.target ).filter( selector )[ pluginName ]();
	});

})(jQuery, window, document);

/*
 * Collapsible widget extension: set
 * https://github.com/filamentgroup/collapsible
 * Copyright (c) 2014 Filament Group, Inc.
 * Licensed under the MIT, GPL licenses.
 */

;(function ($, window, document, undefined) {
	var pluginName = "collapsible";

	// Simple auto-init by selector that runs when the dom is ready. Trigger "enhance" if desirable.
	$( document ).bind( "expand." + pluginName, function( e ){
		var pluginName = "collapsible";
		var setAttr = "data-" + pluginName + "-set";
		var selector = "." + pluginName + "[" + setAttr + "]";
		var $collapsible = $( e.target );
		if( $collapsible.is( selector ) ){
			var value = $collapsible.attr( setAttr );
			var $set = $( "." + pluginName + "[" + setAttr + "='" + value + "']" ).filter(function() {
				return this !== $collapsible[0];
			});

			$set.each(function(){
				$( this ).data( pluginName ).collapse();
			});
		}
	});

})(jQuery, window, document);

/*
 * Collapsible widget extension: tabs behavior
 * https://github.com/filamentgroup/collapsible
 * Copyright (c) 2014 Filament Group, Inc.
 * Licensed under the MIT, GPL licenses.
 */

;(function ($, window, document) {

	$( document ).bind( "init", function( e ){
		var pluginName = "collapsible";
		var activeTabClass = "tab-active";
		var $collapsible = $( e.target ).closest( "." + pluginName );
		var $tabContainer = $collapsible.parent();
		var $tabNav = $tabContainer.find( ".tabnav" );
		var self;
		var id;

		if( $collapsible.is( "." + pluginName ) && $tabContainer.is( ".tabs" ) ){
			self = $collapsible.data( pluginName );
			id = self.content.attr( "id" );
			$tabNav.find( "[aria-controls=" + id + "]" ).remove();

			self.$tabHeader = $( "<a href='#'>" + self.header[0].innerHTML + "</a>" ).attr( "aria-controls", id );
			self.header.css( 'display', 'none' );

			self.$tabHeader.bind( window.tappy ? "tap" : "click", function( e ){
				e.preventDefault();
				e.stopPropagation();

				if( self.$tabHeader.is( '.' + activeTabClass ) ) {
					// TODO data-attribute option to allow collapsing the active tab
					// self.$tabHeader.removeClass( activeTabClass );
					// self.toggle();
				} else {
					$tabContainer.find( '.' + activeTabClass ).removeClass( activeTabClass );
					self.$tabHeader.addClass( activeTabClass );
					self.toggle();
				}
			});

			if( !$tabNav.length ) {
				$tabNav = $( "<nav class='tabnav'></nav>" );
				$tabContainer.prepend( $tabNav );
			}

			if( !self.collapsed ) {
				self.$tabHeader.addClass( activeTabClass );
				self._expand();
			}

			$tabNav.append( self.$tabHeader );
		}
	});

})(jQuery, window, document);

/*
 * Simple jQuery Dialog
 * https://github.com/filamentgroup/dialog
 *
 * Copyright (c) 2013 Filament Group, Inc.
 * Author: @scottjehl
 * Contributors: @johnbender
 * Licensed under the MIT, GPL licenses.
 */

window.jQuery = window.jQuery || window.shoestring;

(function( w, $ ){
	w.componentNamespace = w.componentNamespace || w;

	var pluginName = "dialog", cl, ev,
		doc = w.document,
		docElem = doc.documentElement,
		body = doc.body,
		$html = $( docElem );

	var Dialog = w.componentNamespace.Dialog = function( element ){
		this.$el = $( element );
		this.$background = !this.$el.is( '[data-nobg]' ) ?
			$( doc.createElement('div') ).addClass( cl.bkgd ).appendTo( "body") :
			$( [] );
		this.hash = this.$el.attr( "id" ) + "-dialog";

		this.isOpen = false;
		this.positionMedia = this.$el.attr( 'data-set-position-media' );
		this.isTransparentBackground = this.$el.is( '[data-transbg]' );
	};

	Dialog.events = ev = {
		open: pluginName + "-open",
		opened: pluginName + "-opened",
		close: pluginName + "-close",
		closed: pluginName + "-closed"
	};

	Dialog.classes = cl = {
		open: pluginName + "-open",
		opened: pluginName + "-opened",
		content: pluginName + "-content",
		close: pluginName + "-close",
		closed: pluginName + "-closed",
		bkgd: pluginName + "-background",
		bkgdOpen: pluginName + "-background-open",
		bkgdTrans: pluginName + "-background-trans"
	};

	Dialog.prototype.isSetScrollPosition = function() {
		return !this.positionMedia ||
			( w.matchMedia && w.matchMedia( this.positionMedia ).matches );
	};

	Dialog.prototype.destroy = function() {
		this.$background.remove();
	};

	Dialog.prototype.open = function() {
		if( this.$background.length ) {
			this.$background[ 0 ].style.height = Math.max( docElem.scrollHeight, docElem.clientHeight ) + "px";
		}
		this.$el.addClass( cl.open );
		this.$background.addClass( cl.bkgdOpen );
		this._setBackgroundTransparency();

		if( this.isSetScrollPosition() ) {
			this.scroll = "pageYOffset" in w ? w.pageYOffset : ( docElem.scrollY || docElem.scrollTop || ( body && body.scrollY ) || 0 );
			this.$el[ 0 ].style.top = this.scroll + "px";
		} else {
			this.$el[ 0 ].style.top = '';
		}

		$html.addClass( cl.open );
		this.isOpen = true;

		window.location.hash = this.hash;

		if( doc.activeElement ){
			this.focused = doc.activeElement;
		}
		this.$el[ 0 ].focus();

		this.$el.trigger( ev.opened );

		//resize background
		if( this.$background.length ) {
			this.$background[ 0 ].style.height = Math.max( doc.body.scrollHeight, docElem.scrollHeight, docElem.clientHeight ) + "px";
		}
	};

	Dialog.prototype._setBackgroundTransparency = function() {
		if( this.isTransparentBackground ){
			this.$background.addClass( cl.bkgdTrans );
		}
	};

	Dialog.prototype.close = function(){
		if( !this.isOpen ){
			return;
		}

		this.$el.removeClass( cl.open );

		this.$background.removeClass( cl.bkgdOpen );
		$html.removeClass( cl.open );

		if( this.focused ){
			this.focused.focus();
		}

		if( this.isSetScrollPosition() ) {
			w.scrollTo( 0, this.scroll );
		}

		this.isOpen = false;

		this.$el.trigger( ev.closed );
	};
}( this, window.jQuery ));

(function( w, $ ){
  var Dialog = w.componentNamespace.Dialog, doc = document;

	$.fn.dialog = function(){
		return this.each(function(){
			var $el = $( this ), dialog = new Dialog( this );

			$el.data( "instance", dialog );

			$el.addClass( Dialog.classes.content )
				.attr( "role", "dialog" )
				.attr( "tabindex", 0 )
				.bind( Dialog.events.open, function(){
					dialog.open();
				})
				.bind( Dialog.events.close, function(){
					dialog.close();
				})
				.bind( "click", function( e ){
					if( $( e.target ).is( "." + Dialog.classes.close ) ){
						w.history.back();
						e.preventDefault();
					}
				});

			dialog.$background.bind( "click", function() {
				w.history.back();
			});

			// close on hashchange if open (supports back button closure)
			$( w ).bind( "hashchange", function(){
				var hash = w.location.hash.replace( "#", "" );

				if( hash !== dialog.hash ){
					dialog.close();
				}
			});

			// open on matching a[href=#id] click
			$( doc ).bind( "click", function( e ){
        var $matchingDialog, $a;

        $a = $( e.target ).closest( "a" );

				if( !dialog.isOpen && $a.length && $a.attr( "href" ) ){

					// catch invalid selector exceptions
					try {
						$matchingDialog = $( $a.attr( "href" ) );
					} catch ( error ) {
						// TODO should check the type of exception, it's not clear how well
						//      the error name "SynatxError" is supported
						return;
					}

					if( $matchingDialog.length && $matchingDialog.is( $el ) ){
						$matchingDialog.trigger( Dialog.events.open );
						e.preventDefault();
					}
				}
			});

			// close on escape key
			$( doc ).bind( "keyup", function( e ){
				if( e.which === 27 ){
					dialog.close();
				}
			});
		});
	};

	// auto-init
	$(function(){
		$( ".dialog" ).dialog();
	});
}( this, window.jQuery ));

/*! politespace - v0.1.20 - 2016-09-26
 Politely add spaces to input values to increase readability (credit card numbers, phone numbers, etc).
 * https://github.com/filamentgroup/politespace
 * Copyright (c) 2016 Filament Group (@filamentgroup)
 * MIT License */

(function( w, $ ){
	"use strict";

	var Politespace = function( element ) {
		if( !element ) {
			throw new Error( "Politespace requires an element argument." );
		}

		if( !element.getAttribute || window.operamini ) {
			// Cut the mustard
			return;
		}

		this.element = element;
		this.$element = $( element );
		this.delimiter = this.$element.attr( "data-delimiter" ) || " ";
		// https://en.wikipedia.org/wiki/Decimal_mark
		this.decimalMark = this.$element.attr( "data-decimal-mark" ) || "";
		this.reverse = this.$element.is( "[data-reverse]" );
		this.strip = this.$element.attr( "data-politespace-strip" );
		this.groupLength = this.$element.attr( "data-grouplength" ) || 3;

		var proxyAnchorSelector = this.$element.attr( "data-proxy-anchor" );
		this.$proxyAnchor = this.$element;
		this.$proxy = null;

		if( proxyAnchorSelector ) {
			this.$proxyAnchor = this.$element.closest( proxyAnchorSelector );
		}
	};

	Politespace.prototype._divideIntoArray = function( value ) {
		var split = ( '' + this.groupLength ).split( ',' ),
			isUniformSplit = split.length === 1,
			dividedValue = [],
			loopIndex = 0,
			groupLength,
			substrStart,
			useCharCount;

		while( split.length && loopIndex < value.length ) {
			if( isUniformSplit ) {
				groupLength = split[ 0 ];
			} else {
				// use the next split or the rest of the string if open ended, ala "3,3,"
				groupLength = split.shift() || value.length - loopIndex;
			}

			// Use min if we’re at the end of a reversed string
			// (substrStart below grows larger than the string length)
			useCharCount = Math.min( parseInt( groupLength, 10 ), value.length - loopIndex );

			if( this.reverse ) {
				substrStart = -1 * (useCharCount + loopIndex);
			} else {
				substrStart = loopIndex;
			}
			dividedValue.push( value.substr( substrStart, useCharCount ) );
			loopIndex += useCharCount;
		}

		if( this.reverse ) {
			dividedValue.reverse();
		}

		return dividedValue;
	};

	Politespace.prototype.format = function( value ) {
		var split;
		var val = this.unformat( value );
		if( this.strip ) {
			val = val.replace( new RegExp(  this.strip, 'g' ), "" );
		}
		var suffix = '';

		if( this.decimalMark ) {
			split = val.split( this.decimalMark );
			suffix = split.length > 1 ? this.decimalMark + split[ 1 ] : '';
			val = split[ 0 ];
		}

		return this._divideIntoArray( val ).join( this.delimiter ) + suffix;
	};

	Politespace.prototype.trimMaxlength = function( value ) {
		var maxlength = this.element.getAttribute( "maxlength" );
		// Note input type="number" maxlength does nothing
		if( maxlength ) {
			value = value.substr( 0, maxlength );
		}
		return value;
	};

	Politespace.prototype.getValue = function() {
		return this.trimMaxlength( this.element.value );
	};

	Politespace.prototype.update = function() {
		this.element.value = this.useProxy() || this.$element.attr( "type" ) === "password" ?
			this.getValue() :
			this.format( this.getValue() );
	};

	Politespace.prototype.unformat = function( value ) {
		return value.replace( new RegExp(  this.delimiter, 'g' ), '' );
	};

	Politespace.prototype.reset = function() {
		this.element.value = this.unformat( this.element.value );
	};

	Politespace.prototype.useProxy = function() {
		var pattern = this.$element.attr( "pattern" );
		var type = this.$element.attr( "type" );

		// this needs to be an attr check and not a prop for `type` toggling (like password)
		return type === "number" ||
			// When Chrome validates form fields using native form validation, it uses `pattern`
			// which causes validation errors when we inject delimiters. So use the proxy to avoid
			// delimiters in the form field value.
			// Chrome also has some sort of
			( pattern ? !( new RegExp( "^" + pattern + "$" ) ).test( this.delimiter ) : false );
	};

	Politespace.prototype.updateProxy = function() {
		if( this.useProxy() && this.$proxy.length ) {
			var html = this.format( this.getValue() );
			var width = this.element.offsetWidth;

			this.$proxy.html( html );

			if( width ) {
				this.$proxy.css( "width", width + "px" );
			}

			// Hide if empty, to show placeholder
			this.$proxy.closest( ".politespace-proxy" )[ html ? 'addClass' : 'removeClass' ]( "notempty" );
		}
	};

	Politespace.prototype.createProxy = function() {
		if( !this.useProxy() ) {
			return;
		}

		function sumStyles( el, props ) {
			var total = 0;
			var $el = $( el );
			for( var j=0, k=props.length; j<k; j++ ) {
				total += parseFloat( $el.css( props[ j ] ) );
			}
			return total;
		}

		var $el = $( "<div>" ).addClass( "politespace-proxy active" );
		var $nextSibling = this.$proxyAnchor.next();
		var $parent = this.$proxyAnchor.parent();

		this.$proxy = $( "<div>" ).addClass( "politespace-proxy-val" ).css({
			font: this.$element.css( "font" ),
			"padding-left": sumStyles( this.element, [ "padding-left", "border-left-width" ] ) + "px",
			"padding-right": sumStyles( this.element, [ "padding-right", "border-right-width" ] ) + "px",
			top: sumStyles( this.element, [ "padding-top", "border-top-width", "margin-top" ] ) + "px"
		});
		$el.append( this.$proxy );
		$el.append( this.$proxyAnchor );

		if( $nextSibling.length ) {
			$el.insertBefore( $nextSibling );
		} else {
			$parent.append( $el );
		}

		this.updateProxy();
	};

	Politespace.prototype.setGroupLength = function( length ) {
		this.groupLength = length;
		this.$element.attr( "data-grouplength", length );
	};

	w.Politespace = Politespace;

}( this, jQuery ));

// Input a credit card number string, returns a key signifying the type of credit card it is
(function( w ) {
	"use strict";

	var types = {
		MASTERCARD: /^(2[2-7]|5[1-5])/, // 22-27 and 51-55
		VISA: /^4/,
		DISCOVER: /^6(011|5)/, // 6011 or 65
		AMEX: /^3[47]/ // 34 or 37
	};

	function CreditableCardType( val ) {
		for( var j in types ) {
			if( !!val.match( types[ j ] ) ) {
				return j;
			}
		}

		return -1;
	}

	CreditableCardType.TYPES = types;
	w.CreditableCardType = CreditableCardType;

}( typeof global !== "undefined" ? global : this ));

// jQuery Plugin
(function( w, $ ) {
	"use strict";

	$( document ).bind( "politespace-init politespace-input", function( event ) {
		var $t = $( event.target );
		if( !$t.is( "[data-politespace-creditcard]" ) ) {
			return;
		}
		var pspace = $t.data( "politespace" );
		var val = $t.val();
		var adjustMaxlength = $t.is( "[data-politespace-creditcard-maxlength]" );
		var type = w.CreditableCardType( val );

		if( type === "AMEX" ) {
			pspace.setGroupLength( adjustMaxlength ? "4,6,5" : "4,6," );

			if( adjustMaxlength ) {
				$t.attr( "maxlength", 15 );
			}
		} else if( type === "DISCOVER" || type === "VISA" || type === "MASTERCARD" ) {
			pspace.setGroupLength( adjustMaxlength ? "4,4,4,4" : "4" );

			if( adjustMaxlength ) {
				$t.attr( "maxlength", 16 );
			}
		}
	});

}( typeof global !== "undefined" ? global : this, jQuery ));

// jQuery Plugin
(function( w, $ ) {
	"use strict";

	var maxlengthCacheKey = "politespace-us-telephone-maxlength";
	var eventName = "politespace-beforeblur.politespace-us-telephone";

	function cleanup( el ) {
		var $t = $( el );
		var val = $t.val();

		$t.val( val.replace( /^1/, "" ) );
	}

	// On init
	$( document ).bind( "politespace-init", function( event ) {
		var $t = $( event.target );
		if( !$t.is( "[data-politespace-us-telephone]" ) ) {
			return;
		}

		// Adjust maxlength
		var maxlength= $t.attr( "maxlength" );

		if( maxlength ) {
			$t.data( maxlengthCacheKey, parseInt( maxlength, 10 ) );

			cleanup( $t[ 0 ] );
			$t.off( eventName ).on( eventName, function() {
				$( this ).attr( "maxlength", $t.data( maxlengthCacheKey ) );
				cleanup( this );
			});
		}
	});

	// On input
	$( document ).bind( "politespace-input", function( event ) {
		var $t = $( event.target );
		if( !$t.is( "[data-politespace-us-telephone]" ) ) {
			return;
		}

		if( $t.val().indexOf( '1' ) === 0 ) {
			$t.attr( "maxlength", $t.data( maxlengthCacheKey ) + 1 );
		}
	});

}( typeof global !== "undefined" ? global : this, jQuery ));

(function( $ ) {
	"use strict";

	// jQuery Plugin

	var componentName = "politespace",
		initSelector = "[data-" + componentName + "]";

	$.fn[ componentName ] = function(){
		return this.each( function(){
			var $t = $( this );
			if( $t.data( componentName ) ) {
				return;
			}

			var polite = new Politespace( this );
			if( polite.useProxy() ) {
				polite.createProxy();
			}

			$t.bind( "politespace-hide-proxy", function() {
				$( this ).closest( ".politespace-proxy" ).removeClass( "active" );
			})
				.bind( "politespace-show-proxy", function() {
					$( this ).closest( ".politespace-proxy" ).addClass( "active" );

					polite.update();
					polite.updateProxy();
				})
				.bind( "input keydown", function() {
					$( this ).trigger( "politespace-input" );

					polite.updateProxy();
				})
				.bind( "blur", function() {
					$( this ).trigger( "politespace-beforeblur" );

					polite.update();

					if( polite.useProxy() ){
						$( this ).trigger( "politespace-show-proxy" );
					}
				})
				.bind( "focus", function() {
					$( this ).trigger( "politespace-hide-proxy" );
					polite.reset();
				})
				.data( componentName, polite )
				.trigger( "politespace-init" );

			polite.update();
			polite.updateProxy();
		});
	};

	// auto-init on enhance (which is called on domready)
	$( document ).bind( "enhance", function( e ) {
		var $sel = $( e.target ).is( initSelector ) ? $( e.target ) : $( initSelector, e.target );
		$sel[ componentName ]();
	});

}( jQuery ));
/*! Menu - v0.1.5 - 2017-03-21
* https://github.com/filamentgroup/menu
* Copyright (c) 2015 Filament Group; Licensed MIT */
window.jQuery = window.jQuery || window.shoestring;

(function( $, w ) {
	"use strict";

	var componentName = "Menu",
		at = {
			ariaHidden: "aria-hidden"
		},
		selectClass = "menu-selected",
		focusables = "a,input,[tabindex]";

	var menu = function( element ){
		if( !element ){
			throw new Error( "Element required to initialize object" );
		}
		this.element = element;
		this.$element = $( element );
		this.opened = true;
	};

	menu.prototype.fill = function( items, selectedText ) {
		var html = "";

		$.each( items, function( i, item ){
			html += "<li" +
				( item === selectedText ? " class='" + selectClass + "'" : "" ) +
				">" + item + "</li>";
		});

		this.$element.find( "ol,ul" ).html( html );
	};

	menu.prototype.moveSelected = function( placement, focus ){
		var $items = this.$element.find( "li" ),
			$selected = $items.filter( "." + selectClass ),
			$nextSelected;

		if( !$selected.length || placement === "start" ){
			$nextSelected = $items.eq( 0 );
		}
		else if( placement === "next" ){
			$nextSelected = $selected.next();
			if( !$nextSelected.length ){
				$nextSelected = $items.eq( 0 );
			}
		}
		else {
			$nextSelected = $selected.prev();
			if( !$nextSelected.length ){
				$nextSelected = $items.eq( $items.length - 1 );
			}
		}
		$selected.removeClass( selectClass );
		$nextSelected.addClass( selectClass );

		if( focus || $( w.document.activeElement ).closest( $selected ).length ){
			if( $nextSelected.is( focusables ) ){
				$nextSelected[ 0 ].focus();
			}
			else{
				var $focusChild = $nextSelected.find( focusables );
				if( $focusChild.length ){
					$focusChild[ 0 ].focus();
				}
			}
		}
	};

	menu.prototype.getSelectedElement = function(){
		return this.$element.find( "li." + selectClass );
	};

	menu.prototype.selectActive = function(){
		var trigger = this.$element.data( componentName + "-trigger" );
		var $selected = this.getSelectedElement();

		if( trigger && $( trigger ).is( "input" ) ){
			trigger.value = $selected.text();
		}
		$selected.trigger( componentName + ":select" );
		this.close();
		return $selected.text();
	};

	menu.prototype.keycodes = {
		38 : function(e) {
			this.moveSelected( "prev" );
			e.preventDefault();
		},

		40 : function(e){
			this.moveSelected( "next" );
			e.preventDefault();
		},

		13 : function(){
			// return the selected value
			return this.selectActive();
		},

		9 : function(e){
			this.moveSelected( e.shiftKey ? "prev" : "next" );
			e.preventDefault();
		},

		27 : function(){
			this.close();
		}
	};

	menu.prototype.keyDown = function( e ){
		var fn = this.keycodes[e.keyCode] || function(){};
		return fn.call( this, e );
	};

	menu.prototype._bindKeyHandling = function(){
		var self = this;
		this.$element
			.bind( "keydown", function( e ){
				self.keyDown( e );
			} )
			.bind( "mouseover", function( e ){
				self.$element.find( "." + selectClass ).removeClass( selectClass );
				$( e.target ).closest( "li" ).addClass( selectClass );
			})
			.bind( "mouseleave", function( e ){
				$( e.target ).closest( "li" ).removeClass( selectClass );
			})
			.bind( "click", function(){
				self.selectActive();
			});
	};

	menu.prototype.open = function( trigger, sendFocus ){
		if( this.opened ){
			return;
		}
		this.$element.attr( at.ariaHidden, false );

		this.$element.data( componentName + "-trigger", trigger );
		this.opened = true;
		this.moveSelected( "start", sendFocus );
		this.$element.trigger( componentName + ":open" );
	};

	menu.prototype.close = function(){
		if( !this.opened ){
			return;
		}
		this.$element.attr( at.ariaHidden, true );
		this.opened = false;
		var $trigger = this.$element.data( componentName + "-trigger" );
		if( $trigger ){
			$trigger.focus();
		}
		this.$element.trigger( componentName + ":close" );
	};

	menu.prototype.toggle = function( trigger, sendFocus ){
		this[ this.opened ? "close" : "open" ]( trigger, sendFocus );
	};

	menu.prototype.init = function(){
		// prevent re-init
		if( this.$element.data( componentName ) ) {
			return;
		}
		this.$element.data( componentName, this );

		this.$element.attr( "role", "menu" );
		this.close();
		var self = this;

		$( document ).bind( "mouseup", function(event){
			// only close the menu if the click is outside the menu element
			if( ! $(event.target).closest( self.$element[0] ).length ){
				self.close();
			}
		});

		this._bindKeyHandling();

		this.$element.trigger( componentName + ":init" );
	};

	menu.prototype.isOpen = function(){
		return this.opened;
	};

	(w.componentNamespace = w.componentNamespace || w)[ componentName ] = menu;
}( jQuery, this ));

/*! auto-complete - v0.2.6 - 2017-03-21
 * https://github.com/filamentgroup/auto-complete
 * Copyright (c) 2016 John Bender  The Filament Group;  Licensed  */
//core.js
(function( w, $ ){
  "use strict";

  var name = "autocomplete";

  w.componentNamespace = w.componentNamespace || {};

  $.proxy = $.proxy || function(fn, context) {
        return function() {
          return fn.apply(context, arguments);
        };
      };

  var AutoComplete = function( element, menu ){
    // assign element for method events
    this.$element = this.$input = $( element );

    if( this.$input.data("autocomplete-component") ){
      return;
    }

    this.ignoreKeycodes = [];
    this.idNum = new Date().getTime();

    // menu ID for aria-owns
    this.menu = menu;
    this.menuID = this.menu.$element.attr( "id" ) || "autocomplete-menu-" + this.idNum;
    this.menu.$element.attr( "id", this.menuID );
    this.menu.$element.removeAttr( "role" );
    this.menu.$element.find( "ol" ).attr( "role", "listbox" );

    // TODO it might be better to push this into the constructor of the menu to
    //      reduce dependency on the structure of the menu's keybinding reresentation
    for( var key in menu.keycodes ) {
      this.ignoreKeycodes.push( parseInt( key, 10 ) );
    }

    // make sure tab key does not rove focus within the menu
    delete menu.keycodes[ "9" ];


    this.url = this.$element.attr( "data-autocomplete" );

    this.$input.data( "autocomplete-component", this );
    this.$input.attr( "autocomplete", "off" );
    this.$input.attr( "spellcheck", "off" );
    this.$input.attr( "autocorrect", "off" );
    this.$input.attr( "autocapitalize", "off" );

    this.$input.attr( "aria-autocomplete", "list" );
    this.$input.attr( "aria-owns", this.menuID );

    this.inputID = this.$input.attr( "id" ) || "autocomplete-" + this.idNum;
    if( !this.inputID ){
      this.$input.attr( "id", this.inputID );
    }

    // helper span for usage description
    this.helpText = this.$input.attr( "data-autocomplete-helptext" ) || "";
    this.helpTextID = "autocomplete-helptext-" + this.idNum;
    this.$helpSpan = $( '<span id="' + this.helpTextID + '" class="autocomplete-helptext a11y-only">' + this.helpText + '</span>' ).insertBefore( this.$input );
    this.$input.attr( "aria-describedby", this.helpTextID );

    this.spokenValue = this.$input.val();
    this.spokenValueID = "autocomplete-spokenvalue-" + this.idNum;
    this.$helpSpan = $( '<span id="' + this.spokenValueID + '" class="autocomplete-spokenvalue a11y-only" aria-live="assertive"></span>' ).insertBefore( this.$input );



    // TODO move to options object
    this.isFiltered = !this.$input.is( "[data-unfiltered]" );
    this.isCaseSensitive = this.$input.is( "[data-case-sensitive]" );
    this.isBestMatch = this.$input.is( "[data-best-match]" );
    this.isEmptyNoMatch = this.$input.is( "[data-empty-no-match]" );

    this.$form = this.$input.parents( "form" );

    this._requestId = 0;

    this.matches = [];
  };

  w.componentNamespace.AutoComplete = AutoComplete;

  AutoComplete.preventSubmitTimeout = 200;
  AutoComplete.ajaxDelayTimeout = 100;

  AutoComplete.prototype.refreshHelpSpan = function( value ){
    this.$helpSpan.html( "" );
    this.$helpSpan.attr( "aria-live", "" );
    this.$helpSpan.html( value );
    this.$helpSpan.attr( "aria-live", "assertive" );
  };

  AutoComplete.prototype.blur = function() {
    // use the best match when there is one
    if( this.isBestMatch && this.matches[0] ){
      this.$input.val( this.matches[0] );
    }

    // empty the field when there are no matches
    if( this.isEmptyNoMatch && !this.matches[0] ){
      this.$input.val("");
    }
  };

  // TODO tightly coupled to the notion of keypresses
  AutoComplete.prototype.navigate = function( event ){
    var value;

    if( this.menu.isOpen() ){
      // Prevent the submit after a keydown for 200ms to avoid submission after hitting
      // enter to select a autocomplete menu item
      this.preventSubmit();
      value = this.menu.keyDown(event);

      if( value ){
        this.val( this.strip(value) );
      }
      else{
        this.refreshHelpSpan( this.menu.getSelectedElement().text() );
      }
    }
  };

  AutoComplete.prototype.select = function() {
    this.val( this.strip(this.menu.selectActive() || "") );
  };

  AutoComplete.prototype.compareDataItem = function(item, val){
    var compare = !this.isCaseSensitive ? item.toLowerCase() : item;

    return compare.indexOf( val ) === 0;
  };

  AutoComplete.prototype.filterData = function( data ){
    if( !data.length ) {
      return;
    }
    if( !this.isFiltered ) {
      return data;
    }
    var val = this.val();
    if( !this.isCaseSensitive ) {
      val = val.toLowerCase();
    }

    var filtered = [];
    for( var j = 0, k = data.length; j < k; j++ ) {
      if( this.compareDataItem( data[ j ], val ) ) {
        filtered.push( data[ j ] );
      }
    }

    return filtered;
  };

  AutoComplete.prototype.suggest = function( e ){
    if( e && e.keyCode && this.ignoreKeycodes.indexOf(e.keyCode) !== -1 ){
      return;
    }

    // before we start rendering, lets just check that the user hasn't
    // stopped everything and hide the suggestions if necessary
    if( !this.$input.val() ){
      this.abortFetch(true);
      return;
    }

    var request = ++this._requestId;

    // let the request stack unwind so that other key presses can
    // proceed to update the request id and thereby cancel this request
    setTimeout($.proxy(function(){
      this.fetch(request, $.proxy(function( data ) {
        this.render(request, typeof data === "string" ? JSON.parse(data): data);
      }, this));
    }, this), AutoComplete.ajaxDelayTimeout);
  };

  AutoComplete.prototype.abortFetch = function(skip) {
    if(skip) { this._requestId++; }

    // on abort we should hide the menu if the input value is empty
    if( !this.$input.val() ){
      this.hideSuggest();
    }

    this.$input.trigger( name + ":aborted" );
  };

  AutoComplete.prototype.fetch = function( request, success ) {
    // the user has changed the request since the suggest method was called so
    // we should ignore this, old request
    if( request !== this._requestId ) {
      this.abortFetch();
      return;
    }

    $.ajax(this.url, {
      dataType: "json",

      data: {
        q: this.val().toLowerCase()
      },

      success: success
    });
  };

  AutoComplete.prototype.fill = function( data ) {
    this.menu.fill( this.filterData(data), this.menu.getSelectedElement().text() );
  };

  // TODO this whole method is project specific due to returned json
  //      set this up so that render can be replaced or at least
  //      the data manip can be parameterized
  AutoComplete.prototype.render = function( request, data ) {
    // the user has changed the request since the suggest method was called so
    // we should ignore this, old request
    if( request !== this._requestId ) {
      this.abortFetch();
      return;
    }

    data = data.location || data;

    this.matches = data;

    if( data.length ) {
      this.fill( data );
      this.showSuggest();
    } else {
      this.hideSuggest();
    }

    this.$input.trigger( name + ":suggested" );
  };

  AutoComplete.prototype.showSuggest = function() {
    this._isSuggestShown = true;
    this.menu.open();
    this.$input.trigger( name + ":shown" );
  };

  AutoComplete.prototype.hideSuggest = function() {
    this._isSuggestShown = false;
    this.menu.close();
    this.$input.trigger( name + ":hidden" );
  };

  // TODO remove
  AutoComplete.prototype.strip = function( string ) {
    return string.replace(/^\s+|\s+$/g, '');
  };

  AutoComplete.prototype.val = function( str ) {
    var value;
    if( str ) {
      value = this.strip(str);
      this.$input.trigger( name + ":set", { value: value } );
      this.$input.val( value );
      this.refreshHelpSpan( "Selected " + value );

    } else {
      return this.$input.val();
    }
  };

  AutoComplete.prototype.preventSubmit = function(){
    this.$form.one( "submit.autocomplete", function( event ){
      event.preventDefault();
    });

    clearTimeout(this.preventedSubmitTimeout);

    this.preventedSubmitTimout = setTimeout($.proxy(function() {
      this.$form.off( "submit.autocomplete" );
    }, this), AutoComplete.submitPreventTimeout);
  };
})( this, this.jQuery );

//dom.js
(function( w, $ ){
  "use strict";

  var AutoCompleteDom = function( element, menu ){
    w.componentNamespace.AutoComplete.call( this, element, menu );
    this.$domSource = $( this.$input.attr("data-autocomplete-dom") );
  };

  w.componentNamespace.AutoCompleteDom = AutoCompleteDom;
  $.extend(AutoCompleteDom.prototype, w.componentNamespace.AutoComplete.prototype);

  AutoCompleteDom.prototype.fetch = function( request, callback ){
    var value = this.$input.val().toLowerCase(), keep = [];

    this.$domSource.children().each($.proxy(function( i, elem ){
      var text = $(elem).text();

      // simple substring match
      if( text.toLowerCase().indexOf( value ) !== -1 ){
        keep.push(this.strip(text));
      }
    }, this));

    callback( keep );
  };
})(this, this.jQuery);

//ajax-html.js
(function( w, $ ){
  "use strict";

  var AutoCompleteAjaxHtml = function( element, menu ){
    w.componentNamespace.AutoComplete.call( this, element, menu );

    this.url = this.$input.attr("data-autocomplete-ajax-html");
    this.selector = this.$input.attr("data-filter-selector");
    this.valueSelector = this.$input.attr("data-value-selector");
  };

  w.componentNamespace.AutoCompleteAjaxHtml = AutoCompleteAjaxHtml;
  $.extend(AutoCompleteAjaxHtml.prototype, w.componentNamespace.AutoComplete.prototype);

  AutoCompleteAjaxHtml.prototype.getItemText = function( $elem ) {
    if( this.valueSelector ){
      return $elem.find( this.valueSelector ).text();
    }
    else {
      return $elem.text();
    }
  };

  AutoCompleteAjaxHtml.prototype.compareDataItem = function( $elem, val ) {
    if( !val ) {
      return false;
    }
    // simple substring match
    return this.getItemText( $elem ).toLowerCase().indexOf( val ) !== -1;
  };

  AutoCompleteAjaxHtml.prototype.fetch = function( request, callback ) {
    var value = this.$input.val().toLowerCase();
    var self = this;

    $.ajax(this.url, {
      dataType: "html",

      data: {
        q: this.val().toLowerCase()
      },

      success: function( data ) {
        var keep = [];
        var $el = $( "<div/>" ).html( data );
        $el.find( self.selector ).each(function( i, elem ){
          var $elem = $( elem );
          if( !this.isFiltered || self.compareDataItem( $elem, value ) ) {
            keep.push( $elem );
          }
        });
        callback( keep );
      }
    });
  };

  AutoCompleteAjaxHtml.prototype.fill = function( data ) {
    var items = this.filterData( data );
    var selectedText = this.menu.getSelectedElement().text();
    var self = this;
    this.menu.$element.removeAttr( "role" );
    this.menu.$element.removeAttr( "aria-hidden" );
    var $list = this.menu.$element.find( "ol,ul" );
    $list.html("");


    $.each( items, function( i, item ){
      var $li = $( "<li/>" );
      //$li.attr( "tabindex", "-1" );
      //$li.attr( "role", "option" );

      if( self.compareDataItem( item, selectedText ) ) {
        $li.addClass( "menu-selected" );
      }
      $li.append( item );
      $list.append( $li );
    });
  };

  AutoCompleteAjaxHtml.prototype.val = function( str ) {
    // ignore str, use the filtered methods
    var $selected;
    var value;
    if( str ) {
      $selected = this.menu.getSelectedElement();
      if( $selected.length ) {
        value = this.strip( this.getItemText( $selected ) );
      }
      this.$input.trigger( "autocomplete:set", { value: value } );
      this.$input.val( value );
    } else {
      return this.$input.val();
    }
  };

  AutoCompleteAjaxHtml.prototype.select = function() {
    this.val( this.menu.selectActive() );
  };
})(this, this.jQuery);

//init.js
(function( w, $ ){
  "use strict";

  $.fn.autocomplete = function(){
    return this.each(function(){
      var $this, autocomplete, menu, $menu;

      $this = $(this);

      if( $this.data( "autocomplete-component" ) ){
        return;
      }

      $menu = $this.parent().find( "[data-menu]" ).eq( 0 );

      menu = $menu.data( 'Menu' );

      if( !menu ) {
        menu = new w.componentNamespace.Menu( $menu[0] );
      }

      if( $this.is("[data-autocomplete]") ){
        autocomplete = new w.componentNamespace.AutoComplete( this, menu );
      } else if( $this.is("[data-autocomplete-ajax-html]") ){
        autocomplete = new w.componentNamespace.AutoCompleteAjaxHtml( this, menu );
      } else {
        autocomplete = new w.componentNamespace.AutoCompleteDom( this, menu );

        // if the form value on the data source changes, update the autocomplete input
        autocomplete.$domSource.on( "change", function() {
          var $this, text;

          $this = $(this);
          text = $this.find( "[value='" + $this.val() + "']" ).text();
          autocomplete.val( text );
        });
      }

      $this.on( "keyup", $.proxy(autocomplete.suggest, autocomplete) );
      $this.on( "keydown", $.proxy(autocomplete.navigate, autocomplete) );
      $this.on( "blur", $.proxy(autocomplete.blur, autocomplete) );

      // NOTE we can't close on `mouseup` in case there's overflow scrolling
      // because the `mouseup` event is fired when using the scrollbar
      menu.$element.on( "click", $.proxy(autocomplete.select, autocomplete) );

      menu.init();
    });
  };

  $( w.document ).on( "enhance", function(){
    $( "[data-autocomplete], [data-autocomplete-dom], [data-autocomplete-ajax-html]" ).autocomplete();
  });
})( this, this.jQuery);

/*! offline-js 0.7.13 */
(function(){var a,b,c,d,e,f,g;d=function(a,b){var c,d,e,f;e=[];for(d in b.prototype)try{f=b.prototype[d],null==a[d]&&"function"!=typeof f?e.push(a[d]=f):e.push(void 0)}catch(g){c=g}return e},a={},null==a.options&&(a.options={}),c={checks:{xhr:{url:function(){return"/favicon.ico?_="+Math.floor(1e9*Math.random())},timeout:5e3},image:{url:function(){return"/favicon.ico?_="+Math.floor(1e9*Math.random())}},active:"xhr"},checkOnLoad:!1,interceptRequests:!0,reconnect:!0},e=function(a,b){var c,d,e,f,g,h;for(c=a,h=b.split("."),d=e=0,f=h.length;f>e&&(g=h[d],c=c[g],"object"==typeof c);d=++e);return d===h.length-1?c:void 0},a.getOption=function(b){var d,f;return f=null!=(d=e(a.options,b))?d:e(c,b),"function"==typeof f?f():f},"function"==typeof window.addEventListener&&window.addEventListener("online",function(){return setTimeout(a.confirmUp,100)},!1),"function"==typeof window.addEventListener&&window.addEventListener("offline",function(){return a.confirmDown()},!1),a.state="up",a.markUp=function(){return a.trigger("confirmed-up"),"up"!==a.state?(a.state="up",a.trigger("up")):void 0},a.markDown=function(){return a.trigger("confirmed-down"),"down"!==a.state?(a.state="down",a.trigger("down")):void 0},f={},a.on=function(b,c,d){var e,g,h,i,j;if(g=b.split(" "),g.length>1){for(j=[],h=0,i=g.length;i>h;h++)e=g[h],j.push(a.on(e,c,d));return j}return null==f[b]&&(f[b]=[]),f[b].push([d,c])},a.off=function(a,b){var c,d,e,g,h;if(null!=f[a]){if(b){for(e=0,h=[];e<f[a].length;)g=f[a][e],d=g[0],c=g[1],c===b?h.push(f[a].splice(e,1)):h.push(e++);return h}return f[a]=[]}},a.trigger=function(a){var b,c,d,e,g,h,i;if(null!=f[a]){for(g=f[a],i=[],d=0,e=g.length;e>d;d++)h=g[d],b=h[0],c=h[1],i.push(c.call(b));return i}},b=function(a,b,c){var d,e,f,g,h;return h=function(){return a.status&&a.status<12e3?b():c()},null===a.onprogress?(d=a.onerror,a.onerror=function(){return c(),"function"==typeof d?d.apply(null,arguments):void 0},g=a.ontimeout,a.ontimeout=function(){return c(),"function"==typeof g?g.apply(null,arguments):void 0},e=a.onload,a.onload=function(){return h(),"function"==typeof e?e.apply(null,arguments):void 0}):(f=a.onreadystatechange,a.onreadystatechange=function(){return 4===a.readyState?h():0===a.readyState&&c(),"function"==typeof f?f.apply(null,arguments):void 0})},a.checks={},a.checks.xhr=function(){var c,d;d=new XMLHttpRequest,d.offline=!1,d.open("HEAD",a.getOption("checks.xhr.url"),!0),null!=d.timeout&&(d.timeout=a.getOption("checks.xhr.timeout")),b(d,a.markUp,a.markDown);try{d.send()}catch(e){c=e,a.markDown()}return d},a.checks.image=function(){var b;return b=document.createElement("img"),b.onerror=a.markDown,b.onload=a.markUp,void(b.src=a.getOption("checks.image.url"))},a.checks.down=a.markDown,a.checks.up=a.markUp,a.check=function(){return a.trigger("checking"),a.checks[a.getOption("checks.active")]()},a.confirmUp=a.confirmDown=a.check,a.onXHR=function(a){var b,c,e;return e=function(b,c){var d;return d=b.open,b.open=function(e,f,g,h,i){return a({type:e,url:f,async:g,flags:c,user:h,password:i,xhr:b}),d.apply(b,arguments)}},c=window.XMLHttpRequest,window.XMLHttpRequest=function(a){var b,d,f;return f=new c(a),e(f,a),d=f.setRequestHeader,f.headers={},f.setRequestHeader=function(a,b){return f.headers[a]=b,d.call(f,a,b)},b=f.overrideMimeType,f.overrideMimeType=function(a){return f.mimeType=a,b.call(f,a)},f},d(window.XMLHttpRequest,c),null!=window.XDomainRequest?(b=window.XDomainRequest,window.XDomainRequest=function(){var a;return a=new b,e(a),a},d(window.XDomainRequest,b)):void 0},g=function(){return a.getOption("interceptRequests")&&a.onXHR(function(c){var d;return d=c.xhr,d.offline!==!1?b(d,a.markUp,a.confirmDown):void 0}),a.getOption("checkOnLoad")?a.check():void 0},setTimeout(g,0),window.Offline=a}).call(this),function(){var a,b,c,d,e,f,g,h,i;if(!window.Offline)throw new Error("Offline Reconnect brought in without offline.js");d=Offline.reconnect={},f=null,e=function(){var a;return null!=d.state&&"inactive"!==d.state&&Offline.trigger("reconnect:stopped"),d.state="inactive",d.remaining=d.delay=null!=(a=Offline.getOption("reconnect.initialDelay"))?a:3},b=function(){var a,b;return a=null!=(b=Offline.getOption("reconnect.delay"))?b:Math.min(Math.ceil(1.5*d.delay),3600),d.remaining=d.delay=a},g=function(){return"connecting"!==d.state?(d.remaining-=1,Offline.trigger("reconnect:tick"),0===d.remaining?h():void 0):void 0},h=function(){return"waiting"===d.state?(Offline.trigger("reconnect:connecting"),d.state="connecting",Offline.check()):void 0},a=function(){return Offline.getOption("reconnect")?(e(),d.state="waiting",Offline.trigger("reconnect:started"),f=setInterval(g,1e3)):void 0},i=function(){return null!=f&&clearInterval(f),e()},c=function(){return Offline.getOption("reconnect")&&"connecting"===d.state?(Offline.trigger("reconnect:failure"),d.state="waiting",b()):void 0},d.tryNow=h,e(),Offline.on("down",a),Offline.on("confirmed-down",c),Offline.on("up",i)}.call(this),function(){var a,b,c,d,e,f;if(!window.Offline)throw new Error("Requests module brought in without offline.js");c=[],f=!1,d=function(a){return Offline.trigger("requests:capture"),"down"!==Offline.state&&(f=!0),c.push(a)},e=function(a){var b,c,d,e,f,g,h,i,j;j=a.xhr,g=a.url,f=a.type,h=a.user,d=a.password,b=a.body,j.abort(),j.open(f,g,!0,h,d),e=j.headers;for(c in e)i=e[c],j.setRequestHeader(c,i);return j.mimeType&&j.overrideMimeType(j.mimeType),j.send(b)},a=function(){return c=[]},b=function(){var b,d,f,g,h,i;for(Offline.trigger("requests:flush"),h={},b=0,f=c.length;f>b;b++)g=c[b],i=g.url.replace(/(\?|&)_=[0-9]+/,function(a,b){return"?"===b?b:""}),h[g.type.toUpperCase()+" - "+i]=g;for(d in h)g=h[d],e(g);return a()},setTimeout(function(){return Offline.getOption("requests")!==!1?(Offline.on("confirmed-up",function(){return f?(f=!1,a()):void 0}),Offline.on("up",b),Offline.on("down",function(){return f=!1}),Offline.onXHR(function(a){var b,c,e,f,g;return g=a.xhr,e=a.async,g.offline!==!1&&(f=function(){return d(a)},c=g.send,g.send=function(b){return a.body=b,c.apply(g,arguments)},e)?null===g.onprogress?(g.addEventListener("error",f,!1),g.addEventListener("timeout",f,!1)):(b=g.onreadystatechange,g.onreadystatechange=function(){return 0===g.readyState?f():4===g.readyState&&(0===g.status||g.status>=12e3)&&f(),"function"==typeof b?b.apply(null,arguments):void 0}):void 0}),Offline.requests={flush:b,clear:a}):void 0},0)}.call(this),function(){var a,b,c,d,e;if(!Offline)throw new Error("Offline simulate brought in without offline.js");for(d=["up","down"],b=0,c=d.length;c>b;b++)e=d[b],(document.querySelector("script[data-simulate='"+e+"']")||localStorage.OFFLINE_SIMULATE===e)&&(null==Offline.options&&(Offline.options={}),null==(a=Offline.options).checks&&(a.checks={}),Offline.options.checks.active=e)}.call(this),function(){var a,b,c,d,e,f,g,h,i,j,k,l,m;if(!window.Offline)throw new Error("Offline UI brought in without offline.js");b='<div class="offline-ui"><div class="offline-ui-content"></div></div>',a='<a href class="offline-ui-retry"></a>',f=function(a){var b;return b=document.createElement("div"),b.innerHTML=a,b.children[0]},g=e=null,d=function(a){return k(a),g.className+=" "+a},k=function(a){return g.className=g.className.replace(new RegExp("(^| )"+a.split(" ").join("|")+"( |$)","gi")," ")},i={},h=function(a,b){return d(a),null!=i[a]&&clearTimeout(i[a]),i[a]=setTimeout(function(){return k(a),delete i[a]},1e3*b)},m=function(a){var b,c,d,e;d={day:86400,hour:3600,minute:60,second:1};for(c in d)if(b=d[c],a>=b)return e=Math.floor(a/b),[e,c];return["now",""]},l=function(){var c,h;return g=f(b),document.body.appendChild(g),null!=Offline.reconnect&&Offline.getOption("reconnect")&&(g.appendChild(f(a)),c=g.querySelector(".offline-ui-retry"),h=function(a){return a.preventDefault(),Offline.reconnect.tryNow()},null!=c.addEventListener?c.addEventListener("click",h,!1):c.attachEvent("click",h)),d("offline-ui-"+Offline.state),e=g.querySelector(".offline-ui-content")},j=function(){return l(),Offline.on("up",function(){return k("offline-ui-down"),d("offline-ui-up"),h("offline-ui-up-2s",2),h("offline-ui-up-5s",5)}),Offline.on("down",function(){return k("offline-ui-up"),d("offline-ui-down"),h("offline-ui-down-2s",2),h("offline-ui-down-5s",5)}),Offline.on("reconnect:connecting",function(){return d("offline-ui-connecting"),k("offline-ui-waiting")}),Offline.on("reconnect:tick",function(){var a,b,c;return d("offline-ui-waiting"),k("offline-ui-connecting"),a=m(Offline.reconnect.remaining),b=a[0],c=a[1],e.setAttribute("data-retry-in-value",b),e.setAttribute("data-retry-in-unit",c)}),Offline.on("reconnect:stopped",function(){return k("offline-ui-connecting offline-ui-waiting"),e.setAttribute("data-retry-in-value",null),e.setAttribute("data-retry-in-unit",null)}),Offline.on("reconnect:failure",function(){return h("offline-ui-reconnect-failed-2s",2),h("offline-ui-reconnect-failed-5s",5)}),Offline.on("reconnect:success",function(){return h("offline-ui-reconnect-succeeded-2s",2),h("offline-ui-reconnect-succeeded-5s",5)})},"complete"===document.readyState?j():null!=document.addEventListener?document.addEventListener("DOMContentLoaded",j,!1):(c=document.onreadystatechange,document.onreadystatechange=function(){return"complete"===document.readyState&&j(),"function"==typeof c?c.apply(null,arguments):void 0})}.call(this);
(function (root, smoothScroll) {
    'use strict';

    // Support RequireJS and CommonJS/NodeJS module formats.
    // Attach smoothScroll to the `window` when executed as a <script>.

    // RequireJS
    if (typeof define === 'function' && define.amd) {
        define(smoothScroll);

        // CommonJS
    } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = smoothScroll();

    } else {
        root.smoothScroll = smoothScroll();
    }

})(this, function(){
    'use strict';

// Do not initialize smoothScroll when running server side, handle it in client:
    if (typeof window !== 'object') return;

// We do not want this script to be applied in browsers that do not support those
// That means no smoothscroll on IE9 and below.
    if(document.querySelectorAll === void 0 || window.pageYOffset === void 0 || history.pushState === void 0) { return; }

// Get the top position of an element in the document
    var getTop = function(element, start) {
        // return value of html.getBoundingClientRect().top ... IE : 0, other browsers : -pageYOffset
        if(element.nodeName === 'HTML') return -start
        return element.getBoundingClientRect().top + start
    }
// ease in out function thanks to:
// http://blog.greweb.fr/2012/02/bezier-curve-based-easing-functions-from-concept-to-implementation/
    var easeInOutCubic = function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 }

// calculate the scroll position we should be in
// given the start and end point of the scroll
// the time elapsed from the beginning of the scroll
// and the total duration of the scroll (default 500ms)
    var position = function(start, end, elapsed, duration) {
        if (elapsed > duration) return end;
        return start + (end - start) * easeInOutCubic(elapsed / duration); // <-- you can change the easing funtion there
        // return start + (end - start) * (elapsed / duration); // <-- this would give a linear scroll
    }

// we use requestAnimationFrame to be called by the browser before every repaint
// if the first argument is an element then scroll to the top of this element
// if the first argument is numeric then scroll to this location
// if the callback exist, it is called when the scrolling is finished
// if context is set then scroll that element, else scroll window
    var smoothScroll = function(el, duration, callback, context){
        duration = duration || 500;
        context = context || window;
        var start = context.scrollTop || window.pageYOffset;

        if (typeof el === 'number') {
            var end = parseInt(el);
        } else {
            var end = getTop(el, start);
        }

        var clock = Date.now();
        var requestAnimationFrame = window.requestAnimationFrame ||
            window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
            function(fn){window.setTimeout(fn, 15);};

        var step = function(){
            var elapsed = Date.now() - clock;
            if (context !== window) {
                context.scrollTop = position(start, end, elapsed, duration);
            }
            else {
                window.scroll(0, position(start, end, elapsed, duration));
            }

            if (elapsed > duration) {
                if (typeof callback === 'function') {
                    callback(el);
                }
            } else {
                requestAnimationFrame(step);
            }
        }
        step();
    }

    var linkHandler = function(ev) {
        ev.preventDefault();

        if (location.hash !== this.hash) window.history.pushState(null, null, this.hash)
        // using the history api to solve issue #1 - back doesn't work
        // most browser don't update :target when the history api is used:
        // THIS IS A BUG FROM THE BROWSERS.
        // change the scrolling duration in this call
        var node = document.getElementById(this.hash.substring(1))
        if(!node) return; // Do not scroll to non-existing node

        smoothScroll(node, 700, function(el) {
            location.replace('#' + el.id)
            // this will cause the :target to be activated.
        });
    }

// We look for all the internal links in the documents and attach the smoothscroll function
    document.addEventListener("DOMContentLoaded", function () {
        var internal = document.querySelectorAll('[data-smoothscroll]'), a;
        for(var i=internal.length; a=internal[--i];){
            a.addEventListener("click", linkHandler, false);
        }
    });
// return smoothscroll API
    return smoothScroll;
});
"use strict";

/*used to determine the css height of the help center panel*/
var pageHeight = function pageHeight() {
    var doc = window.document;
    var docElem = doc.documentElement;
    return Math.max(doc.body.scrollHeight, docElem.scrollHeight, docElem.clientHeight);
};

//Global, so available to various TnT tests

// PARSE URL
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return false;
}

//dunno why, some scripts can't access this. load order?
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/*
flag = getQueryVariable("flag");

scrollPos = getQueryVariable("scrollPos");
const urlParams = window.location.search.split("?")[1];
 */

function setCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        var expires = "; expires=" + date.toGMTString();
    } else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1, c.length);
        }if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function deleteCookie(name) {
    setCookie(name, "", -1);
}

// Polyfill to make NodeList.forEach() method work on internet explorer
(function () {
    if (typeof NodeList.prototype.forEach === "function") return false;
    NodeList.prototype.forEach = Array.prototype.forEach;
})();

(function ($) {

    /* Close notifications, e.g. Recall Quote banner */
    var initRemoveOnce = function initRemoveOnce() {
        // simple function for hiding an element
        $("[data-remove-once]").filterUnenhanced("remove-once").bind("click", function (e) {
            e.preventDefault();
            var $all = $("." + $(this).attr("data-remove-once"));
            $all.removeClass("notification-active");
            //$all.remove();
        });
    };

    $(document).bind("enhance", initRemoveOnce);

    //Image Picker Top 5
    var imagePickerExpand = function imagePickerExpand() {
        $(".img-picker-set .show-all-link").bind("click", function (e) {
            e.preventDefault();
            console.log("yo");
            $(".img-picker-set").removeClass("collapsed");
            $(this).parent().parent().attr("style", "display:none");
        });
    };

    $(document).bind("enhance", imagePickerExpand);

    //Collapse Vehicle Hide Show All Link
    var clickShowAllLink = function clickShowAllLink() {
        $("h4 .show-all-link").bind("click touchstart", function (e) {
            e.preventDefault();
            $(this).parent().attr("style", "display:none");
        });
    };

    $(document).bind("enhance", clickShowAllLink);

    //Make this support multiple themes
    var enableThemer = function enableThemer() {
        var themeClasses = ["lct", "trustage"];
        var themerBox = '<div class="themer"><h3>&oplus; <span>Themes <a onclick="$(\'.themer\').remove()">&ominus;</a></span></h3><div class="choices"></div></div></div>',
            libertyCheckbox = '<label><input type="radio" value="" name="themes"  /> liberty</label>',
            uxCheckbox = '<label><input type="radio" value="ux" name="themes"  /> ux</label>',
            lippincottCheckbox = '<label><input type="radio" value="lct" name="themes"  /> lippincott</label>',
            trustageCheckbox = '<label><input type="radio" value="trustage" name="themes"  /> trustage</label>',
            geicoCheckbox = '<label><input type="radio" value="geico" name="themes"  /> geico</label>',
            safecoCheckbox = '<label><input type="radio" value="safeco" name="themes"  /> safeco</label>',
            themerCss = '<link rel="stylesheet" href="../docs/css/themer/themer.css">';

        $(themerCss).appendTo("head");

        $(themerBox).prependTo("body").find(".choices").append(libertyCheckbox).append(trustageCheckbox);

        //check the radio matching the current cookie theme
        var currentTheme = getCookie("theme"),
            elem = '.themer [value="' + currentTheme + '"]';
        $(elem).prop("checked", true);

        $(".themer h3").bind("click", function (e) {
            $(".themer").classList.toggle("active");
        });

        $(".themer input").bind("click", function (e) {
            //manually remove any others first
            $("link[data-isTheme]").remove();
            //future upgrade, loop through [themeClasses]
            document.body.classList.remove("lct");
            document.body.classList.remove("trustage");

            $(".themer").removeClass("active");
            var thisTheme = $(this).val();

            var thisThemeClass = $(this).attr("value");
            var linkHref = "../assets/css/themes/" + thisTheme + "/main.css";
            var thisLinkObj = thisTheme != "" && thisTheme != null ? makeDomElem("LINK", "stylesheet", linkHref, "data-isTheme") : "";
            if (thisLinkObj !== "") {
                injectLinkObj(thisLinkObj);
                document.body.classList.add(thisThemeClass);
            }
            setCookie("theme", thisTheme, 10);
        });
        // force enable ux theme as a default
        var uxLinkObj = makeDomElem("LINK", "stylesheet", "../assets/css/themes/ux/main.css", "data-isDefaultTheme");
        injectLinkObj(uxLinkObj);
        $("body").addClass("ux");
        // force enable lct theme also as a default
        var lctLinkObj = makeDomElem("LINK", "stylesheet", "../assets/css/themes/lct/main.css", "data-isDefaultTheme");
        injectLinkObj(lctLinkObj);
        $("body").addClass("lct");
    };

    var makeDomElem = function makeDomElem(type, rel, href, attr) {
        var thisElem = document.createElement(type);
        thisElem.rel = rel;
        thisElem.href = href;
        thisElem.setAttribute(attr, "");
        return thisElem;
    };

    var injectLinkObj = function injectLinkObj(thisLinkObj) {
        //console.log("injectLinkObj", thisLinkObj);
        var tntCss = document.querySelectorAll("link[href*='/tnt/']");
        if (tntCss.length > 0) {
            //if there is any TnT in the head
            tntCss[0].insertAdjacentElement('beforebegin', thisLinkObj);
        } else {
            $(thisLinkObj).appendTo("head");
        }
    };

    $(document).bind("enhance", enableThemer);

    var setCurrentThemeByCookie = function setCurrentThemeByCookie() {
        var thisTheme = getCookie("theme");
        if (thisTheme != "" && thisTheme != null) {
            var thisCss = '<link rel="stylesheet" href="../assets/css/themes/' + thisTheme + '/main.css" data-isTheme>';
            $(thisCss).appendTo("head");
            $("body").addClass(thisTheme);
        }
    };

    $(document).bind("enhance", setCurrentThemeByCookie);

    /*
        var progressiveDisclosureOpen= function() {
            // progressive disclosure group -- unfinished function only opens. works with checkboxes and radios
            $("[data-disclosure]") .bind( "click", function( e ){
                var $t = $(this),
                    id = $t.attr( "data-disclosure"),
                    $content = "",
                    thisName = $(this).attr("name"),
                    nameSelector = "[name=" + thisName +  "]";
    
                //loop through choices. close all others but current
                 $( nameSelector ).each(function() {
                     var checked =  this.checked,
                         hasDisclosure = $(this).attr("data-disclosure");
                     if(hasDisclosure!="null"){
                         $content = $("#"  +  $(this).attr("data-disclosure"));
                         $content[ checked ? "removeClass" : "addClass" ]( "hidden" );
                     }
                 });
    
                //$content.removeClass("hidden");
                //console.log("opening " , $content);
    
            });
        }
    
        $( document ).bind( "enhance", progressiveDisclosureOpen );
    */

    //  This might be able to be combined with the progressiveDisclosureCloseFromNonPG function
    //  its purpose is to close others even if you are a data-disclosure
    var progressiveDisclosureCloseOthers = function progressiveDisclosureCloseOthers() {
        $("[data-disclosure]").bind("click", function (e) {
            //look for Adjacent data-disclosures
            $(this).parent().parent().find('[data-disclosure]').each(function (index, elem) {
                if (!elem.checked) {
                    var id = $(elem).attr("data-disclosure");
                    // stop looking for children to close so that user choices are preserved
                    // lookForAllDisclosedChildrenAndHide(id);
                }
            });
        });
    };

    $(document).bind("enhance", progressiveDisclosureCloseOthers);

    // progressive disclosure: extra binding for groups (nested disclosures)
    //  This fires on inputs that are NOT invoking a data-disclosure, but looks for adjacent inputs that ARE disclosures, so it can close them
    var progressiveDisclosureCloseFromNonPG = function progressiveDisclosureCloseFromNonPG() {
        $("[data-disclosure]").parent().parent().find("input:not([data-disclosure])").bind("click", function (e) {
            //look for possible disclosed child and close it
            //find the ID of the disclosure that got opened, so that you may close it
            var theDisclosedElem = $(this).parent().parent().find('[data-disclosure]');
            //THIS IS THE ID OF THE FORM-GROUP THAT GOT DISCLOSED
            var id = theDisclosedElem.attr("data-disclosure");
            // stop looking for children to close so that user choices are preserved
            // lookForAllDisclosedChildrenAndHide(id);
        });
    };

    $(document).bind("enhance", progressiveDisclosureCloseFromNonPG);

    var lookForAllDisclosedChildrenAndHide = function lookForAllDisclosedChildrenAndHide(id) {
        var selector = $("#" + id);
        //zero out its values (this prevents filament's progressive disclosure from being fired after this has been hidden
        $(selector).find("input").each(function () {
            $(this).prop("checked", false);
            var disclosure = $(this).attr("data-disclosure");
            if (disclosure != "") {
                lookForAllDisclosedChildrenAndHide(disclosure);
            }
        });
        $(selector).addClass("hidden");
    };

    //Update Submit URL as per radio selection
    var updateSubmitUrl = function updateSubmitUrl() {
        $("[data-url]").bind("click", function (e) {
            var dataURL = $(this).attr("data-url");
            $(".form-submit .btn-primary").attr("href", dataURL);
            var urlClass = dataURL.split(".")[0];
            $('body').attr('class', '');
            $('body').addClass(urlClass);
        });
    };

    $(document).bind("enhance", updateSubmitUrl);

    // Reset and uncheck radios on page refresh if using Firefox
    var resetRadios = function resetRadios() {
        if (navigator.userAgent.search("Firefox") > 0 && document.forms.length > 0) {
            document.forms[0].reset();
        }
    };
    $(document).bind("enhance", resetRadios);

    // Add back the removed resource to a list
    var addBackResource = function addBackResource() {

        $(".resources-removed .resource-add").bind("click", function (e) {

            var addAttr = $(this).attr("data-resource");
            var elem = ".resource" + "[data-resource=" + addAttr + "]";

            $(elem).removeClass("hidden").find(".resource-edit-confirm").addClass("hidden");
            $(this).addClass("hidden");

            toggleRemovedSection(); // call function to hide the 'removed' section
        });
    };
    $(document).bind("enhance", addBackResource);

    // Hide 'removed' section when nothing is visible
    var toggleRemovedSection = function toggleRemovedSection() {

        var $quanNotHidden = $(".resources-removed").find(".resource-add:not(.hidden)");

        if ($quanNotHidden.length === 0) {
            $(".resources-removed").addClass("hidden");
        }
    };

    // Hide prefill link
    var hidePrefillLink = function hidePrefillLink() {
        $("a[data-resource]").bind("click", function (e) {
            $(this).addClass("hidden");
        });
    };
    $(document).bind("enhance", hidePrefillLink);

    // Show prefill link
    var showPrefillLink = function showPrefillLink() {
        $(".resource[data-resource] .resource-remove").bind("click", function (e) {
            var vehicle = $(this).parent().parent().parent().attr("data-resource");

            $("a[data-resource=" + vehicle + "]").removeClass("hidden");
            $(".resources-removed").removeClass("hidden");
        });
    };
    $(document).bind("enhance", showPrefillLink);

    // show a feedback message when 'loading-feedback' appears in the URL
    var loadingFeedback = function loadingFeedback() {

        var theUrlSubstring = window.location.search.substring(1);
        var theString = "loading-feedback";

        if (theUrlSubstring === theString) {
            $("body").addClass("loading-feedback");
        }

        var counter = 0;
        var animationContainer = $(".loading-feedback .single-price");
        var animationSelector = animationContainer.find(".loading-mssg");
        var titles = animationSelector.find("p");
        var expectedEventCount = titles.length;

        animationContainer.on("webkitAnimationEnd animationend", function (e) {

            counter++;

            if (counter === expectedEventCount) {
                $(".loading-feedback").removeClass("loading-feedback");
            }
        });
    };
    $(document).bind("enhance", loadingFeedback);

    // scroll to top of long dialog
    // var scrollToTopDialog = function(){
    //     $(document).on('dialog-open', null, function() {
    //
    //         if (this.getElementById('dialog-partners')) {
    //             var element = this.getElementById('dialog-partners');
    //             var topPos = element.getBoundingClientRect().top + window.scrollY;
    //
    //             window.scrollTo(null, topPos);
    //         }
    //     });
    // };
    // $( document ).bind( "enhance", scrollToTopDialog );


    // Animated button
    var animatedButton = function animatedButton() {
        // buttons that need classes and disabled attributes set on them
        var animatedButtons = document.querySelectorAll('.btn-animated');
        var buttonSecondary = document.querySelector('.btn-primary-b');
        var addVehicleButton = document.querySelector('.resource-add');
        var quoteRate = document.querySelector('.quote-rate');
        //const selectCoverage = document.getElementsByTagName('select');

        // disable the quote rate and change button state to update
        $('.pane-at-a-glance select').bind('change', function () {
            var animatedButtons = document.querySelectorAll('.btn-animated');
            var allLabels = document.querySelectorAll('.pane-at-a-glance label');

            // disable (grey out) the quote rate text
            quoteRate.classList.add('disabled');
            //sticky price
            document.querySelector('.navigation-persistent .qps-opt-price').classList.add('disabled');
            //console.log('yo');

            animatedButtons.forEach(function (animatedButton) {
                // change button state to update and disable it
                animatedButton.classList.add('update');
                animatedButton.classList.add('btn-disabled');

                // timeout to remove disabled - for demo purposes!
                setTimeout(function () {
                    animatedButton.classList.remove('btn-disabled');
                }, 2000);
            });

            allLabels.forEach(function (label) {
                // disable the labels
                label.classList.add('disabled');

                // timeout to remove disabled - for demo purposes!
                setTimeout(function () {
                    label.classList.remove('disabled');
                }, 2000);
            });
        });

        // for each of the progress buttons, start animation on click
        animatedButtons.forEach(function (animatedButton) {
            animatedButton.addEventListener('click', function (e) {
                return progressStart(e);
            });
        });

        // loading state
        function progressStart(e) {

            // disable the other buttons and links on page
            if (addVehicleButton != null) {
                addVehicleButton.classList.add('btn-disabled');
            }

            //buttonSecondary.classList.add('btn-disabled');
            //buttonSecondary.setAttribute('disabled', 'disabled');

            // loop through all progress buttons on page (apply same effect to all)
            animatedButtons.forEach(function (animatedButton) {
                var buttonElem = animatedButton.querySelector('button');

                // className add/remove
                animatedButton.className = 'btn-animated'; // reset className
                animatedButton.className += " " + 'loading';

                // disable each button when in recalc
                buttonElem.setAttribute('disabled', 'disabled');
                buttonElem.className += " " + 'btn-disabled';

                // timeout for demo purposes!
                setTimeout(function () {
                    progressDone(animatedButton);
                }, 4000);
            });
        }

        // success state
        function progressDone(animatedButton) {
            var buttonElem = animatedButton.querySelector('button');

            // className add/remove
            animatedButton.classList.remove('loading');
            if (quoteRate != null) {
                quoteRate.classList.remove('disabled');
            }
            buttonElem.classList.remove('btn-disabled');
            animatedButton.className += " " + 'success';

            // timeout for demo purposes!
            setTimeout(function () {
                progressComplete(animatedButton);
            }, 1000);
        }

        function progressComplete(animatedButton) {
            var buttonElem = animatedButton.querySelector('button');

            // className add/remove
            animatedButton.classList.remove('success');

            // re-enable all the buttons and links
            if (addVehicleButton != null) {
                addVehicleButton.classList.remove('btn-disabled');
            }

            buttonElem.removeAttribute('disabled');
            if (buttonSecondary != null) {
                buttonSecondary.classList.remove('btn-disabled');
                buttonSecondary.removeAttribute('disabled');
            }

            //sticky price
            if (document.querySelector('.navigation-persistent .qps-opt-price') != null) {
                document.querySelector('.navigation-persistent .qps-opt-price').classList.remove('disabled');
            }
        }
    };
    $(document).bind("enhance", animatedButton);
})(jQuery);

(function( $, window ){

	/* Form interactions */
	var initForm = function(){

		// simple function for showing "other" option when its paired input is checked
		$( ".opt-other" ).filterUnenhanced( "opt-other" ).each( function(){
			var $other = $( this );
			var $radio = $other.parent().parent().find( "input[type=radio]" );
			var $form = $other.closest( "form" );

			$form.bind( "change", function(){
				if($radio[0]!=undefined){ //bug fix for IE throwing undefined error
					$other[ $radio[0].checked ? "removeClass" : "addClass" ]( "hidden" );
				}
			});
		});

		// edit/change masked inputs
		$( ".mask-edit" ).filterUnenhanced( "mask-edit" ).each( function(){
			var $btn = $( this );
			//.textinput is for items like "Full Date" on masked text inputs components page
			//label is for material pickers
			var $parent = $btn.closest( ".textinput, label" );
			var $mask = $parent.find( ".mask-value" );
			var $input = $parent.find( ".mask-input" );
			var hideClass = "hidden";

			$btn.bind( ( window.tappy ? "tap" : "click" ), function( e ){
				$mask.addClass( hideClass );
				$input.removeClass( hideClass );
				e.preventDefault();
			});

		});


		// progressive disclosure -- works with checks, radios, selects

		$( "[data-disclosure]" ).filterUnenhanced( "disclosure" ).each(function(){
			var $t = $( this );
			var id = $t.attr( "data-disclosure" );
			var $content = $( "#" + id );
			if( $t.is( "input" ) ) {
				$t.closest( "form" ).bind( "change", function(){
					var checked = false;
					$( this ).find( "[data-disclosure='" + id + "']" ).each(function() {
						checked = checked || this.checked;
					});
					$content[ checked ? "removeClass" : "addClass" ]( "hidden" );
				});
			}

			// select
			if( $t.is( "option" ) ) {
				var $select = $t.closest( "select" );
				$content = $( "#" + id );
				$select.bind( "change", function(){
					if ( $t[0].index == $select[0].options[ $select[0].selectedIndex ].index ) {
						$content
							.removeClass( "hidden" )
							.siblings().each(function(){
							if ( $( this ).is( ".disclosure" ) ){
								$( this ).addClass( "hidden" );
							}
						});
					}
				});
			}
		});



		// auto-expand textarea height
		$( "textarea" ).bind( "input", function(){
			if( this.scrollHeight > this.clientHeight ){
				$( this ).height( this.scrollHeight + "px" );
			}
		});

	};

	$( document ).bind( "enhance", initForm );

}( shoestring, window ));

(function( $ ){

	/* Help panel in masthead */
	var initHelp = function(){
		var $helpPanel = $( "#help-center" );
		var panelClass = "panel-open";

		function openPanel( e ){
			e.preventDefault();
			$helpPanel.addClass( panelClass )
				.css("min-height",pageHeight()+"px")
				.attr("tabindex","0")
				.removeAttr('hidden');
			document.getElementById("help-center").focus();
		}
		function closePanel( e ){
			var $target = $( e.target );
			if( !$target.closest( '.panel-content' ).length ||
				$target.closest( '.help-center-close' ).length ) {

				e.preventDefault();
				$helpPanel.removeClass( panelClass )
					.css("min-height","0px")
					.removeAttr('tabindex')
					.attr('hidden', '');
			}
		}

		$( '.icon-help-center' )
			.filterUnenhanced( "help-center" )
			.bind( "tap", openPanel );

		$helpPanel
			.filterUnenhanced( "help-center" )
			.bind( "click", closePanel )
			.find( '.help-center-close' ).bind( "tap", closePanel );
	};

	$( document ).bind( "enhance", initHelp );


}( shoestring ));
(function( $ ){

	var initImgPicker = function(){
		// simple functions for toggling img descriptions and adding counts

		$( ".img-picker-set" )
			.filterUnenhanced( "img-picker-set" )
			.each( function( e ){

			var $set = $( this );
			var $toggle = $set.find( ".img-picker-toggle" );
			var $tallies = $set.find( ".picker-count" );
			var $totals = $set.find( ".picker-total" );
			var $form = $set.closest( "form" );
			var hideClass = "hide-desc";
			var hideText = "Hide descriptions";
			var showText = "Show descriptions";

			$toggle.bind( ( window.tappy ? "tap" : "click" ), function( e ){
				if ( $set.is( "." + hideClass ) ) {
					$set.removeClass( hideClass );
					$toggle.html( hideText );
				}
				else {
					$set.addClass( hideClass );
					$toggle.html( showText );
				}
				e.preventDefault();
			});

			$form.bind( "change", function(){
				var $inputs = $set.find( "input[type=checkbox], input[type=radio]");
				var checks = 0;

				$inputs.each( function(){
					if ( $( this )[0].checked ) { checks++; }
				});

				$tallies.html( checks.toString() );
				$totals.html( $inputs.length.toString() );
			});

			
			
		});
	};

	$( document ).bind( "enhance", initImgPicker );


}( shoestring ));
(function( $ ){

	/* Help panel in masthead */
	var initExpandAll = function(){
		// simple function for expanding all collapsibles in a group
		$( "[data-expand-all]" )
			.filterUnenhanced( "expand-all" )
			.bind( "click", function( e ){
				e.preventDefault();
				var $all = $( "." + $( this ).attr( "data-expand-all" ) );
				$all.addClass( "collapsible-expand-all" );
				$( this ).remove();
			});
	};

	$( document ).bind( "enhance", initExpandAll );


}( shoestring ));
/*global shoestring*/
(function( $, window ){
	"use strict";

	var document = window.document;

	/* Show related coverages affected when another coverage is edited. */
	var initEditCoverage = function(){
		$( ".edit-coverage" )
			.filterUnenhanced( "edit-coverage" )
			.each(function() {

			var perPerson,
				perAccident,
				whatPackageEdit,
				newPrice,
				scrollPos,
				flag;

			function numberWithCommas(x) {
				return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			}

			perPerson = numberWithCommas(getQueryVariable("perPerson"));
			perAccident = numberWithCommas(getQueryVariable("perAccident"));
			whatPackageEdit = numberWithCommas(getQueryVariable("whatPackage"));
			newPrice = numberWithCommas(getQueryVariable("newPrice"));
			//TODO: make global in lm-utilities
			scrollPos = getQueryVariable("scrollPos");
			flag = getQueryVariable("flag");

			// Init Radios

			if (perPerson == "25,000") {
				$("#bi25").attr("checked", true);
			} else if (perPerson == "50,000") {
				$("#bi50").prop("checked", true);
			} else if (perPerson == "100,000") {
				$("#bi100").prop("checked", true);
			} else if (perPerson == "250,000") {
				$("#bi250").prop("checked", true);
			}

			var $relInput = $( this );
			var $form = $relInput.closest( "form" );
			var $related = $form.find( ".related-coverage" );
			var $origChkInput = $form.find( "input:checked" );
			var $textInput = $form.find( "input[type=text]", "input[type=number]" );

			var cancelURL= "qps-single-cart-optimized-optimus-"+whatPackageEdit+".html" + "?perPerson=" + perPerson + "&" +
                "perAccident=" + perAccident + "&" +
                "whatPackage=" + whatPackageEdit + "&" +
                "newPrice=" + newPrice;

			$(".edit-qps-cancel").attr("href", cancelURL);

                console.log(cancelURL);

			var showSubmitBtns = function(checked){
				var values = checked[0].value.split( "-" ),
					perPerson = values[0],
                    perAccident = values[1],
                    whatPackageEdit,
					baseHref = "qps-single-cart-optimized-optimus-",
					link = $( ".edit-qps-btn" ),
					linkElement, href;

                whatPackageEdit = numberWithCommas(getQueryVariable("whatPackage"));
				baseHref += whatPackageEdit;

				//flag allows you to set a TnT or whatever to change the url to return to on Update Quote
				switch (flag) {
					case  "cq-flex":
						baseHref = "cq-flex-tabs-customized";
						break;
					case  "ppm":
						baseHref = "qps-persistent-price-module";
						break;
				}

				if( link.length === 0 ){ return; }

				linkElement = link[0];

				href = baseHref+".html" + "?recalc" + "&" +
					"perPerson=" + perPerson + "&" +
                    "perAccident=" + perAccident + "&" +
					"whatPackage=" + whatPackageEdit + "&" +
                    "scrollPos=" + scrollPos + "&" +
                    "newPrice=waiting";

				$( ".edit-qps-cancel" ).html( "Cancel" );
				$( ".edit-qps-btn.hidden" ).removeClass( "hidden" ).addClass( "hidden-placeholder" );
				link.attr( "href", href );
			};

			var hideSubmitBtns = function(){
				$( ".edit-qps-cancel" ).html( "<i class='icon icon-arrow-left'></i>Back" );
				$( ".hidden-placeholder" ).addClass( "hidden" );
			};

			$form.bind( "change", function(){
				// When the form is changed, "Back" becomes "Cancel", and the Update and Continue buttons appear
				var checked = $( this ).find( "input:checked" );
				if ( !$origChkInput[0].checked ) {
					showSubmitBtns(checked);
				} else {
					hideSubmitBtns();
				}

				// No longer needed, using disclosure instead:
				// If input with impacted coverages is selected, show impacted (related) coverages
				/*if ( $related ) {
					$related[ $relInput[0].checked ? "removeClass" : "addClass" ]( "related-hidden" );
				}*/
			});
		});
	};

	$( document ).bind( "enhance", initEditCoverage );

}( shoestring, this ));

/*global jQuery:true*/
(function($, window){
	"use strict";

	var NumericInput = function( el ){
		this.el = el;
		this.$el = $( el );
		this.allowFloat = this.$el.is( '[data-float]' );

		var ua, isFirefoxDesktop;
		ua = navigator.userAgent.toLowerCase();

		// Issue #267 and #521
		// https://github.com/filamentgroup/lm-esales/issues/267
		// https://github.com/filamentgroup/lm-esales/issues/521
		// The goal is to target Firefox on Mac OS, Windows, and Linux (desktop)
		// UA ref from MDN for Firefox:
		// https://developer.mozilla.org/en-US/docs/Web/HTTP/Gecko_user_agent_string_reference
		// NOTE if they make one for windows mobile it may match "Windonws"
		isFirefoxDesktop = /Windows|Macintosh|Linux/.test(ua) && /Firefox/.test(ua);

		if( isFirefoxDesktop ){
			if( this.$el.attr( "type" ) === "number" ) {
				this.$el.attr( "type", "text" );
			}
		}

		// if maxLength isn't defined on `$el` then `parseInt` will return
		// `NaN` which is falsey meaning there is no max length. The max length
		// is then `Infinity`.
		this.maxLength = parseInt(this.$el.attr( "maxlength" ), 10) || Infinity;
		this.$el.on( "keypress", $.proxy(this.onKeypress, this));
	};

	NumericInput.allowedKeys = [
		"Tab",
		"Enter",
		"Escape",
		"Backspace",
		"ArrowRight",
		"ArrowLeft",
		"."
	];

	NumericInput.prototype.onKeypress = function( event ){
		var prevented = false;

		// The key pressed is allowed, no exceptions
		// modifier keys and keys listed in allowedKeys property
		if( this.isKeyAllowed( event ) ){
			return;
		}

		if (event.key !== undefined) {
			var key = event.key;
			// handle anything that's not a number
			prevented = isNaN(parseInt(key, 10));
		} else if (event.keyCode !== undefined) {
			var code = event.keyCode;
			// allow '.', return
			// disallow anything less than 48 or greater than 57
			prevented = (code < 48 || code > 57) &&
				code !== 13 &&
				( !this.allowFloat || code !== 46 );

			if( this.allowFloat && code === 46 && this.el.value.length && this.el.value.indexOf( '.' ) > -1 ) {
				prevented = true;
			}
		}


		// Suppress "double action" if event prevented
		//
		// Kill keypress if the max length has been exceeded and the text
		// in the field isn't selected.
		//
		// Note that numeric inputs are not included in the types that
		// support the `maxlength` attribute. `max` support is failing in
		// our testing
		// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
		// (see `maxlength`)
		if((this.isMaxLengthExceeded() && !this.isInputTextSelected()) || prevented) {
			event.preventDefault();
		}
	};

	NumericInput.prototype.isKeyAllowed = function( event ) {
		var isAllowed = false, key = event.key;

		// indexOf not supported everywhere for arrays
		$.each(NumericInput.allowedKeys, function(i, e){
			if( e === key ) { isAllowed = true;	 }
		});

		return event.altKey || event.ctrlKey || event.metaKey || isAllowed;
	};

	NumericInput.prototype.isMaxLengthExceeded = function() {
		return this.maxLength && this.$el.val().length >= this.maxLength;
	};

	NumericInput.prototype.isInputTextSelected = function() {
		var selectionText;

		// if most browsers
		// else if ie8 or lower
		if (window.getSelection) {
			selectionText = window.getSelection().toString();
		} else if (document.selection && document.selection.type != "Control") {
			selectionText = document.selection.createRange().text;
		}

		return selectionText ? this.$el.val().indexOf(selectionText) > -1 : false;
	};

	window.NumericInput = NumericInput;
}(jQuery, this));

/*global jQuery:true*/
/*global NumericInput:true*/
/*
 * Create a numeric input that actually works
 *
 * Copyright (c) 2015 Filament Group, Inc.
 * Licensed under MIT
 */
(function( $, NumericInput, window ) {
	"use strict";

	var document = window.document;

	var pluginName = "numeric-input",
			initSelector = "[data-" + pluginName + "]";

	$.fn[ pluginName ] = function(){
		return this.each(function(){
			var input = new NumericInput( this );
		});
	};

	// auto-init on enhance (which is called on domready)
	$( document ).bind( "enhance", function( e ){
		$( initSelector, e.target ).filterUnenhanced( pluginName )[ pluginName ]();
	});

}( jQuery, NumericInput, this ));

/*global jQuery:true*/
/*global NumericInput:true*/
/*
 * Create maked input toggle that works with polite space
 *
 * Copyright (c) 2015 Filament Group, Inc.
 * Licensed under MIT
 */
(function( $, window ) {
	"use strict";

	function MaskedInput( e ) {
		var self, $element;

		self = this;
		$element = (this.$element = $(e));
		this.selector = this.$element.attr( "data-toggle-mask" );
		this.$selectedElement = $( this.selector );


		this.$element.on("click", function(){ self.mask(); });
		this.$element.prop( "checked", false );
		this.mask();
	}

	MaskedInput.prototype.mask = function(){
		var type, newType;

		type = this.$selectedElement.attr( "type" );

		if( this.$element.prop( "checked") ){
			newType = this.$selectedElement.attr( "data-toggle-type" ) || "text";
			this.$selectedElement.attr( "type", newType );

			// make sure politespace knows that the type has changed
			this.$selectedElement.trigger( "politespace-show-proxy" );
		} else {
			this.$selectedElement.attr( "data-toggle-type", type );
			this.$selectedElement.attr( "type", "password" );

			// make sure politespace knows that the type has changed
			this.$selectedElement.trigger( "politespace-hide-proxy" );
		}

	};

	$( document ).bind( "enhance", function( e ) {
		$( "[data-toggle-mask]" ).each(function( i, e ){
			$(e).data( "masked-input", new MaskedInput(e));
		});
	});
}( jQuery, this ));

/*global jQuery:true*/
(function($, window){
	"use strict";

	var btnChecked = "btn-action";

	var RadioButton = function( el ){
		this.el = el;
		this.$el = $( el );
	};

	RadioButton.prototype.updateState = function(){
		$( "input[type=radio]", $( this ) ).each(function(){
			if( this.checked ){
				$( this ).parent().addClass( btnChecked );
			}
			else {
				$( this ).parent().removeClass( btnChecked );
			}
		});
	};

	RadioButton.prototype.bindEvents = function(){
		this.$el.on( "click", this.updateState );
	};

	RadioButton.prototype.init = function(){
		this.bindEvents();
	};

	window.RadioButton = RadioButton;
}(jQuery, this));

/*global jQuery:true*/
/*global RadioButton:true*/
/*
 * Create a numeric input that actually works
 *
 * Copyright (c) 2015 Filament Group, Inc.
 * Licensed under MIT
 */
(function( $, RadioButton, window ) {
	"use strict";

	var document = window.document;

	var pluginName = "radio-button",
			initSelector = ".check-radio-set.button";

	$.fn[ pluginName ] = function(){
		return this.each(function(){
			var input = new RadioButton( this );
			input.init();
		});
	};

	// auto-init on enhance (which is called on domready)
	$( document ).bind( "enhance", function( e ){
		$( initSelector, e.target ).filterUnenhanced( pluginName )[ pluginName ]();
	});

}( jQuery, RadioButton, this ));

/**
 * Animation test
 */
(function(window){
	if( typeof Array.prototype.map === "undefined" ){ return; }

	var document = window.document;

	var prop = "animationName";
	var prefixProps = 'Moz O ms Webkit'.split(" ").map(function( prefix ){
		return prefix + prop.charAt( 0 ).toUpperCase() + prop.slice(1);
	});
	prefixProps.push( prop );
	var ok = prefixProps.some(function(prefix){
		var foo = document.createElement( "div" );
		return typeof foo.style[prefix] !== "undefined";
	});

	if( ok ){
		document.documentElement.className = document.documentElement.className + " animation";
	}
}(this));

/**
 * RecalcButton
 */
(function($, window){
	"use strict";

	var RecalcButton = function(element, opts){
		opts = opts || {};
		opts.recalcText = opts.recalcText || "Recalculating";
		this.$el = $( element );
		this.el = element;
		this.originalInnerHTML = element.innerHTML;
		this.recalcText = opts.recalcText;
	};

	RecalcButton.prototype.recalc = function(){
		var spinner = "<span class='spinner'></span>";
		var text = "<span class='text'>" + this.recalcText + "</span>";
		this.$el.addClass( "hidden" );
		this.el.innerHTML = spinner + text;
		this.el.setAttribute( "disabled", "true" );
	};

	RecalcButton.prototype.returnToNormal = function(){
		this.$el.removeClass( "hidden" );
		this.el.innerHTML = this.originalInnerHTML;
		this.el.removeAttribute( "disabled" );
	};

	window.RecalcButton = RecalcButton;

}(jQuery, this));

/*global jQuery:true*/
/*global RecalcButton:true*/
(function( $, RecalcButton, window ) {
	"use strict";

	var document = window.document;

	var pluginName = "recalc",
			initSelector = "." + pluginName + " .btn-action, " + "." + pluginName + " .btn-action-b";

	var buttons = [];

	$.fn[ pluginName ] = function(){
		return this.each(function(){
			var btn = new RecalcButton( this );
			btn.recalc();
			buttons.push( btn );
		});
	};


	$( document ).bind( "close.recalc", function( e ){
		buttons.forEach(function( btn ){
			btn.returnToNormal();
		});
		$( ".recalc" ).removeClass( "recalc" );
	});

	$( document ).bind( "start.recalc", function( e ){
		buttons.forEach(function( btn ){
			btn.recalc();
		});
		$( ".page" ).addClass( "recalc" );
	});

	// auto-init on enhance (which is called on domready)
	$( document ).bind( "enhance", function( e ){
		$( initSelector, e.target ).filterUnenhanced( pluginName )[ pluginName ]();
	});

}( jQuery, RecalcButton, this ));

(function( $, window ){

	/* Edit/remove confirmation */
	var initConfirmation = function(){

		function untabbable( $container ) {
			$container.find( ".btn" ).attr( "tabindex", "-1" );
		}

		function tabbable( $container ) {
			$container.find( ".btn" ).removeAttr( "tabindex" );
		}

		$( ".resource-delete" ).filterUnenhanced( "resource-delete" ).each(function(){
			var $del = $( this );
			var $header = $del.closest( ".resource-header" );
			var $panel = $del.parent().parent().find( ".resource-edit-confirm" );

			untabbable( $panel );
				/* $panel assumes the delete btn is contained within a div, and that div is parallel in the markup to `.resource-edit-confirm`:

					<div class="[ parent ]">
						[ other elements ]
						<span class="[ parent ]">
							<a href="#" class="resource-delete"><span>Delete</span> <i class="icon icon-x"></i></a>
						</span>
						<div class="resource-edit-confirm hidden">
							<a href="#" class="btn btn-sml resource-edit-cancel">Cancel</a>
							<a href="#" class="btn btn-action-final btn-sml resource-remove">Remove</a>
						</div>
					</div>
				*/
			var $confirm = $panel.find( ".resource-remove" );
			var $cancel = $panel.find( ".resource-edit-cancel" );
			var hideResourceClass = "hidden";
			var hidePanelClass = "hidden";

			$del.bind( ( window.tappy ? "tap" : "click" ), function(){
				$panel.removeClass( hidePanelClass );
				tabbable( $panel );
			});

			$cancel.bind( ( window.tappy ? "tap" : "click" ), function(){
				$panel.addClass( hidePanelClass );
				untabbable( $panel );
			});

			$confirm.bind( ( window.tappy ? "tap" : "click" ), function(){
				var $siblingsToHide = $header.add( $header.next().filter( ".resource-form" ) );

				var $resource = $header.closest( ".resource" );
				var $children = $resource.children().filter( ".resource-header,.resource-form" );
				var noOtherSiblings = $children.length === $siblingsToHide.length;

				if( noOtherSiblings ) {
					$resource.addClass( hideResourceClass );
				} else {
					$siblingsToHide.addClass( hideResourceClass );
				}
			});
		});
		
	};

	$( document ).bind( "enhance", initConfirmation );

}( shoestring, this ));
/*global shoestring*/
(function( $, window ){
	"use strict";

	var document = window.document;

	/* Prototype code: Demonstrate how page animation flow should appear */
	var initPageAnim = function(){
		var $loader = $( "#ajax-loader" );

		$( "[data-ajax-example]" ).filterUnenhanced( "ajax-example" ).each(function() {
			var $trigger = $( this );
			var nextUrl = $trigger.attr( "href" );
			var target = $trigger.attr( "data-ajax-example-target" );
			var $content = target ? $trigger.closest( target ) : $trigger.parent();
			var $target;
			var isAfter = $trigger.is( "[data-ajax-example-after]" );
			var isBefore = $trigger.is( "[data-ajax-example-before]" );
			var txOut = "anim-fade-out";
			var txIn = "anim-fade-in";
			var hasSpeed = $trigger.attr('data-tx-speed');
			var txSpeed = hasSpeed ? hasSpeed : 2000;

			var loadContent = function(){
				$.get( nextUrl, function( data ){
					if( isBefore ) {
						$content.prev().replaceWith( data );
						$target = $content.prev();
					} else if( isAfter ) {
						$content.next().replaceWith( data );
						$target = $content.next();
					} else {
						$target = $content.html( data );
					}

					$target.removeClass( txOut )
						.addClass( txIn )
						.trigger( "enhance" );
				});
			};

			$trigger.bind( ( window.tappy ? "tap" : "click" ), function( e ){
				
				var $placeholder = $( "<div></div>" )
					.css( "position", "relative" )
					.html( $loader.html() );

				$placeholder
					.find( ".loading-container" )
					.css( "top", "2px" );

				if( isAfter ) {
					$content.after( $placeholder );
				} else if( isBefore ) {
					$content.before( $placeholder );
				} else {
					// scroll up to make sure content appears at the top of the page
					window.scrollTo(0,0);

					// fade out content
					$content.addClass( txOut );
				}

				setTimeout( loadContent, txSpeed );
			});
		});
	};

	$( document ).bind( "enhance", initPageAnim );

}( shoestring, this ));
(function( $ ){

	$( "html" ).addClass( "enhanced" );

	function getEnhancedAttribute( key ) {
		return "data-enhanced" + ( key ? "-" + key : "" );
	}

	$.fn.filterUnenhanced = function( key ) {
		return this.filter( function() {
				return !$( this ). is( "[" + getEnhancedAttribute( key ) + "]" );
			})
			// mark enhanced
			.attr( getEnhancedAttribute( key ), "" );
	};

	$(function(){
		$(document).trigger( "enhance" );
	});

}( jQuery ) );