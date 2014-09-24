var gui = gui || {};
gui.anim = gui.anim || {};

// requestAnim shim layer by Paul Irish

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame   ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(/* function */ callback, /* DOMElement */ element){
			return window.setTimeout(callback, 1000 / 60);
        };
})();

window.cancelRequestAnimFrame = ( function() {
    return window.cancelAnimationFrame          	||
        window.webkitCancelRequestAnimationFrame    ||
        window.mozCancelRequestAnimationFrame       ||
        window.oCancelRequestAnimationFrame     	||
        window.msCancelRequestAnimationFrame        ||
        clearTimeout
})();

/*
 * Yuichi Tateno. <hotchpotch@N0!spam@gmail.com>
 * http://rails2u.com/
 *
 * The MIT License
 * --------
 * Copyright (c) 2007 Yuichi Tateno.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

(function ()
{
	gui.anim.JSTweener = {
		looping: false,
		objects: [],
		defaultOptions: {
			time: 1,
			transition: 'easeoutexpo',
			delay: 0,
			delayed: false,
			prefix: {},
			suffix: {},
			onStart: undefined,
			onStartParams: undefined,
			onUpdate: undefined,
			onUpdateParams: undefined,
			onComplete: undefined,
			onCompleteParams: undefined
		},
		inited: false,
		easingFunctionsLowerCase: {},
		init: function() {
			this.inited = true;
			for (var key in gui.anim.JSTweener.easingFunctions) {
				this.easingFunctionsLowerCase[key.toLowerCase()] = gui.anim.JSTweener.easingFunctions[key];
			}
		},
		toNumber: function(value, prefix, suffix) {
			// for style
			if (!suffix) suffix = 'px';

			return value.toString().match(/[0-9]/) ? Number(value.toString().replace(
															new RegExp(suffix + '$'), ''
														   ).replace(
															new RegExp('^' + (prefix ? prefix : '')), ''
														   ))
												   : 0;
		},

		addTween: function(obj, options)
		{
			if (!this.inited) this.init();

			var self = this;
			var key;
			var o = {};
			o.target = obj;

			// TODO Quick hack - Remove object if already in JSTWeener - needs to be better
			self.kill(o);

			o.targetProperties = {};

			for (key in this.defaultOptions) {
				if (typeof options[key] != 'undefined') {
					o[key] = options[key];
					delete options[key];
				} else {
					o[key] = this.defaultOptions[key];
				}
			}

			if (typeof o.transition == 'function') {
				o.easing = o.transition;
			} else {
				o.easing = this.easingFunctionsLowerCase[o.transition.toLowerCase()];
			}

			for (key in options) {
				if (!o.prefix[key]) o.prefix[key] = '';
				if (!o.suffix[key]) o.suffix[key] = '';
				var sB = this.toNumber(obj[key], o.prefix[key],  o.suffix[key]);
				o.targetProperties[key] = {
					b: sB,
					c: options[key] - sB
				};
			}


			o.startTime = (new Date() - 0) + (o.delay * 1000);
			o.endTime = o.time * 1000 + o.startTime;

			if (o.startTime == o.endTime)
			{
				 self.finalFrame(o);
				if (typeof o.target.updateElement == 'function')
				{
					o.target.updateElement();
				}
			}
			else
			{
				self.objects.push(o);

				if (o.delay > 0)
				{
					o.delayed = true;
				}
				else
				{
					if (typeof o.onStart == 'function') {
						if (o.onStartParams) {
							o.onStart.apply(o, o.onStartParams);
						} else {
							o.onStart();
						}
					}
				}

				if (!self.looping) {
					self.looping = true;
					window.requestAnimFrame(function() { self.eventLoop() });
				}
			}

			return o;
		},

		kill:function(object)
		{
			var o;
			var i;
			var target = object.target;
			var totalObjects = this.objects.length;

			for (i = 0; i < totalObjects; i++)
			{
				o = this.objects[i].target;
				if (o === target)
				{
					this.objects.splice(i, 1);
					totalObjects--;
				}
			}
		},

		finalFrame:function(o)
		{
			var property;
			var targetProperties = o.targetProperties;

			for (property in targetProperties) {
				if (targetProperties.hasOwnProperty(property))
				{
					var tP = targetProperties[property];
					try {
						o.target[property] = o.prefix[property] + (tP.b + tP.c) + o.suffix[property];
					} catch(e) {}
				}
			}

			if (typeof o.onUpdate == 'function') {
				if (o.onUpdateParams) {
					o.onUpdate.apply(o, o.onUpdateParams);
				} else {
					o.onUpdate();
				}
			}

			if (typeof o.onComplete == 'function') {
				if (o.onCompleteParams) {
					o.onComplete.apply(o, o.onCompleteParams);
				} else {
					o.onComplete();
				}
			}
		},

		eventLoop: function()
		{
			var self = this;
			var now = (new Date() - 0);

			var objects = this.objects;
			var totalObjects = objects.length;

			function loopClosure()
			{
				var i = totalObjects;
				var o;
				var t;
				var d;
				var property;
				var targetProperties;

				for (i = 0; i < totalObjects; i++)
				{
					o = objects[i];

					t = now - o.startTime;
					d = o.endTime - o.startTime;
					targetProperties = o.targetProperties;
					
					if (t >= d) {
						self.finalFrame(o);
						self.objects.splice(i, 1);
						totalObjects--;
					} else {

						if (t >= 0)
						{

							for (property in targetProperties)
							{
								if (targetProperties.hasOwnProperty(property))
								{
									var tP = targetProperties[property];
									var val = o.easing(t, tP.b, tP.c, d);
									try {
										// FIXME:For IE. A Few times IE (style.width||style.height) = value is throw error...

										o.target[property] = o.prefix[property] + val + o.suffix[property];
									} catch(e)
									{
									}
								}
							}

							if (o.delayed)
							{
								o.delayed = false;

								if (typeof o.onStart == 'function') {
									if (o.onStartParams) {
										o.onStart.apply(o, o.onStartParams);
									} else {
										o.onStart();
									}
								}
							}
						}


						if (typeof o.onUpdate == 'function') {
							if (o.onUpdateParams) {
								o.onUpdate.apply(o, o.onUpdateParams);
							} else {
								o.onUpdate();
							}
						}
					}

					if (typeof o.target.updateElement == 'function')
					{
						o.target.updateElement();
					}
				};
			}

			loopClosure();

			if (this.objects.length > 0)
			{
				window.requestAnimFrame(function() { self.eventLoop() });
			}
			else
			{
				this.looping = false;
			}
		}
	};

	gui.anim.JSTweener.Utils = {
		bezier2: function(t, p0, p1, p2)
		{
			return (1 - t) * (1 - t) * p0 + 2 * t * (1 - t) * p1 + t * t * p2;
		},
		bezier3: function(t, p0, p1, p2, p3)
		{
			return Math.pow(1 - t, 3) * p0 + 3 * t * Math.pow(1 - t, 2) * p1 + 3 * t * t * (1 - t) * p2 + t * t * t * p3;
		},
		allSetStyleProperties: function(element)
		{
			var css;
			if (document.defaultView && document.defaultView.getComputedStyle)
			{
				css = document.defaultView.getComputedStyle(element, null);
			}
			else
			{
				css = element.currentStyle
			}
			for (var key in css)
			{
				if (!key.match(/^\d+$/))
				{
					try
					{
						element.style[key] = css[key];
					}
					catch(e)
					{
					}
					;
				}
			}
		}
	};

	/*
	 * gui.anim.JSTweener.easingFunctions is
	 * Tweener's easing functions (Penner's Easing Equations) porting to JavaScript.
	 * http://code.google.com/p/tweener/
	 */

	gui.anim.JSTweener.easingFunctions = {
		easeNone: function(t, b, c, d) {
			return c*t/d + b;
		},
		easeInQuad: function(t, b, c, d) {
			return c*(t/=d)*t + b;
		},
		easeOutQuad: function(t, b, c, d) {
			return -c *(t/=d)*(t-2) + b;
		},
		easeInOutQuad: function(t, b, c, d) {
			if((t/=d/2) < 1) return c/2*t*t + b;
			return -c/2 *((--t)*(t-2) - 1) + b;
		},
		easeInCubic: function(t, b, c, d) {
			return c*(t/=d)*t*t + b;
		},
		easeOutCubic: function(t, b, c, d) {
			return c*((t=t/d-1)*t*t + 1) + b;
		},
		easeInOutCubic: function(t, b, c, d) {
			if((t/=d/2) < 1) return c/2*t*t*t + b;
			return c/2*((t-=2)*t*t + 2) + b;
		},
		easeOutInCubic: function(t, b, c, d) {
			if(t < d/2) return gui.anim.JSTweener.easingFunctions.easeOutCubic(t*2, b, c/2, d);
			return gui.anim.JSTweener.easingFunctions.easeInCubic((t*2)-d, b+c/2, c/2, d);
		},
		easeInQuart: function(t, b, c, d) {
			return c*(t/=d)*t*t*t + b;
		},
		easeOutQuart: function(t, b, c, d) {
			return -c *((t=t/d-1)*t*t*t - 1) + b;
		},
		easeInOutQuart: function(t, b, c, d) {
			if((t/=d/2) < 1) return c/2*t*t*t*t + b;
			return -c/2 *((t-=2)*t*t*t - 2) + b;
		},
		easeOutInQuart: function(t, b, c, d) {
			if(t < d/2) return gui.anim.JSTweener.easingFunctions.easeOutQuart(t*2, b, c/2, d);
			return gui.anim.JSTweener.easingFunctions.easeInQuart((t*2)-d, b+c/2, c/2, d);
		},
		easeInQuint: function(t, b, c, d) {
			return c*(t/=d)*t*t*t*t + b;
		},
		easeOutQuint: function(t, b, c, d) {
			return c*((t=t/d-1)*t*t*t*t + 1) + b;
		},
		easeInOutQuint: function(t, b, c, d) {
			if((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
			return c/2*((t-=2)*t*t*t*t + 2) + b;
		},
		easeOutInQuint: function(t, b, c, d) {
			if(t < d/2) return gui.anim.JSTweener.easingFunctions.easeOutQuint(t*2, b, c/2, d);
			return gui.anim.JSTweener.easingFunctions.easeInQuint((t*2)-d, b+c/2, c/2, d);
		},
		easeInSine: function(t, b, c, d) {
			return -c * Math.cos(t/d *(Math.PI/2)) + c + b;
		},
		easeOutSine: function(t, b, c, d) {
			return c * Math.sin(t/d *(Math.PI/2)) + b;
		},
		easeInOutSine: function(t, b, c, d) {
			return -c/2 *(Math.cos(Math.PI*t/d) - 1) + b;
		},
		easeOutInSine: function(t, b, c, d) {
			if(t < d/2) return gui.anim.JSTweener.easingFunctions.easeOutSine(t*2, b, c/2, d);
			return gui.anim.JSTweener.easingFunctions.easeInSine((t*2)-d, b+c/2, c/2, d);
		},
		easeInExpo: function(t, b, c, d) {
			return(t==0) ? b : c * Math.pow(2, 10 *(t/d - 1)) + b - c * 0.001;
		},
		easeOutExpo: function(t, b, c, d) {
			return(t==d) ? b+c : c * 1.001 *(-Math.pow(2, -10 * t/d) + 1) + b;
		},
		easeInOutExpo: function(t, b, c, d) {
			if(t==0) return b;
			if(t==d) return b+c;
			if((t/=d/2) < 1) return c/2 * Math.pow(2, 10 *(t - 1)) + b - c * 0.0005;
			return c/2 * 1.0005 *(-Math.pow(2, -10 * --t) + 2) + b;
		},
		easeOutInExpo: function(t, b, c, d) {
			if(t < d/2) return gui.anim.JSTweener.easingFunctions.easeOutExpo(t*2, b, c/2, d);
			return gui.anim.JSTweener.easingFunctions.easeInExpo((t*2)-d, b+c/2, c/2, d);
		},
		easeInCirc: function(t, b, c, d) {
			return -c *(Math.sqrt(1 -(t/=d)*t) - 1) + b;
		},
		easeOutCirc: function(t, b, c, d) {
			return c * Math.sqrt(1 -(t=t/d-1)*t) + b;
		},
		easeInOutCirc: function(t, b, c, d) {
			if((t/=d/2) < 1) return -c/2 *(Math.sqrt(1 - t*t) - 1) + b;
			return c/2 *(Math.sqrt(1 -(t-=2)*t) + 1) + b;
		},
		easeOutInCirc: function(t, b, c, d) {
			if(t < d/2) return gui.anim.JSTweener.easingFunctions.easeOutCirc(t*2, b, c/2, d);
			return gui.anim.JSTweener.easingFunctions.easeInCirc((t*2)-d, b+c/2, c/2, d);
		},
		easeInElastic: function(t, b, c, d, a, p) {
			var s;
			if(t==0) return b;  if((t/=d)==1) return b+c;  if(!p) p=d*.3;
			if(!a || a < Math.abs(c)) { a=c; s=p/4; } else s = p/(2*Math.PI) * Math.asin(c/a);
			return -(a*Math.pow(2,10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p )) + b;
		},
		easeOutElastic: function(t, b, c, d, a, p) {
			var s;
			if(t==0) return b;  if((t/=d)==1) return b+c;  if(!p) p=d*.3;
			if(!a || a < Math.abs(c)) { a=c; s=p/4; } else s = p/(2*Math.PI) * Math.asin(c/a);
			return(a*Math.pow(2,-10*t) * Math.sin((t*d-s)*(2*Math.PI)/p ) + c + b);
		},
		easeInOutElastic: function(t, b, c, d, a, p) {
			var s;
			if(t==0) return b;  if((t/=d/2)==2) return b+c;  if(!p) p=d*(.3*1.5);
			if(!a || a < Math.abs(c)) { a=c; s=p/4; }       else s = p/(2*Math.PI) * Math.asin(c/a);
			if(t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p )) + b;
			return a*Math.pow(2,-10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p )*.5 + c + b;
		},
		easeOutInElastic: function(t, b, c, d, a, p) {
			if(t < d/2) return gui.anim.JSTweener.easingFunctions.easeOutElastic(t*2, b, c/2, d, a, p);
			return gui.anim.JSTweener.easingFunctions.easeInElastic((t*2)-d, b+c/2, c/2, d, a, p);
		},
		easeInBack: function(t, b, c, d, s) {
			if(s == undefined) s = 1.70158;
			return c*(t/=d)*t*((s+1)*t - s) + b;
		},
		easeOutBack: function(t, b, c, d, s) {
			if(s == undefined) s = 1.70158;
			return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
		},
		easeInOutBack: function(t, b, c, d, s) {
			if(s == undefined) s = 1.70158;
			if((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
			return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
		},
		easeOutInBack: function(t, b, c, d, s) {
			if(t < d/2) return gui.anim.JSTweener.easingFunctions.easeOutBack(t*2, b, c/2, d, s);
			return gui.anim.JSTweener.easingFunctions.easeInBack((t*2)-d, b+c/2, c/2, d, s);
		},
		easeInBounce: function(t, b, c, d) {
			return c - gui.anim.JSTweener.easingFunctions.easeOutBounce(d-t, 0, c, d) + b;
		},
		easeOutBounce: function(t, b, c, d) {
			if((t/=d) <(1/2.75)) {
				return c*(7.5625*t*t) + b;
			} else if(t <(2/2.75)) {
				return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
			} else if(t <(2.5/2.75)) {
				return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
			} else {
				return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
			}
		},
		easeInOutBounce: function(t, b, c, d) {
			if(t < d/2) return gui.anim.JSTweener.easingFunctions.easeInBounce(t*2, 0, c, d) * .5 + b;
			else return gui.anim.JSTweener.easingFunctions.easeOutBounce(t*2-d, 0, c, d) * .5 + c*.5 + b;
		},
		easeOutInBounce: function(t, b, c, d) {
			if(t < d/2) return gui.anim.JSTweener.easingFunctions.easeOutBounce(t*2, b, c/2, d);
			return gui.anim.JSTweener.easingFunctions.easeInBounce((t*2)-d, b+c/2, c/2, d);
		}
	};
	gui.anim.JSTweener.easingFunctions.linear = gui.anim.JSTweener.easingFunctions.easeNone;
}());

/**
 * Created by IntelliJ IDEA.
 * User: martin
 * Date: 14/09/2011
 * Time: 12:01
 * To change this template use File | Settings | File Templates.
 */

(function ()
{
	gui.anim.DOMAnimElement = function(target)
	{
		this.$target = target.jquery ? target : $(target);

		this.target = this.$target[0];

		this.init();
	};

	gui.anim.DOMAnimElement.prototype =
	{
		init:function()
		{
			// Set initial starting values
			this.rotation = 0;
			this.scaleX = 1;
			this.scaleY = 1;
			this.skewX = 0;
			this.skewY = 0;

			// Retrieve x/y width/height opacity properties from jQuery
			var position;
			try
			{
				var position = this.$target.position();
			}
			catch(e)
			{
				position = {left:0, top:0}
			}

			this.x = Number(position.left);
			this.y = Number(position.top);

			this.width = this.$target.css("width");
			this.height = this.$target.css("height");
			this.opacity = this.$target.css("opacity") || 1;

			// Retrieve transformation properties from css using jQuery
			var transform = $.matrix.unmatrix($.matrix.fromString(this.$target.css('transform')));

			if (transform)
			{
				this.rotation = transform.rotate;

				this.scaleX = transform.scale[0];
				this.scaleY = transform.scale[1];

				this.skewX = transform.skew[0];
				this.skewY = transform.skew[1];
			}

			// Remove
			this.$target.css({left:0, top:0});

			this.updateElement();
		},

		setProps:function(props, silent)
		{
			_.each(props, function(prop, key)
			{
				this[key] = prop;
			}, this);

			if (!silent)
			{
				this.updateElement();
			}
		},

		updateElement:function()
		{
			var transformMatrix = [this.scaleX, -this.skewY, -this.skewX, this.scaleY, Math.round(this.x), Math.round(this.y)];

			if (this.rotation != 0)
			{
				var rotationSin = Math.sin(this.rotation);
				var rotationCos = Math.cos(this.rotation);

				transformMatrix = this.multiplyMatrices(transformMatrix, [rotationCos, rotationSin, -rotationSin, rotationCos, 0, 0]);
			}

			var transformObj = {
						width:Math.round(this.width),
						height:Math.round(this.height),
						opacity:this.opacity,
						transform: 'matrix(' + transformMatrix.join(", ") + ')'
					};

			this.$target.css(transformObj);
		},

		multiplyMatrices:function(matA, matB)
		{
			var a = (matA[0] * matB[0]) + (matA[1] * matB[2]);
			var b = (matA[0] * matB[1]) + (matA[1] * matB[3]);
			var c = (matA[2] * matB[0]) + (matA[3] * matB[2]);
			var d = (matA[2] * matB[1]) + (matA[3] * matB[3]);

			return [a, b, c, d, matA[4], matA[5]];
		},

		destroy:function()
		{
			// TODO
		}

	};
}());

/**
 * Created by IntelliJ IDEA.
 * User: martin
 * Date: 16/09/2011
 * Time: 12:26
 * To change this template use File | Settings | File Templates.
 */
(function($)
{
	var guiAnimElement = gui.anim.DOMAnimElement;
	var guiTweener = gui.anim.JSTweener;

	var methods = {
		init : function(options)
		{
			var _arguments = arguments;

			return this.each(function()
			{
				var $this = $(this);
				var data = $this.data('guiAnim');

				// If the plugin hasn't been initialized yet
				if (! data)
				{
					$this.data('guiAnim', {
						target : $this,
						animElement : new guiAnimElement(this)
					});

					data = $this.data('guiAnim');
				}

				if (options.time === undefined || options.time != parseFloat(options.time))
				{
					options.time = 0;
				}

				methods.anim.apply($this, _arguments);

			});
		},

		destroy : function()
		{
			return this.each(function()
			{
				var $this = $(this);
				var data = $this.data('guiAnim');

				gui.anim.JSTweener.kill(data.animElement);

				data.animElement.destroy();
				$this.removeData('guiAnim');
			})
		},

		anim : function(props)
		{
			return this.each(function()
			{
				var $this = $(this);
				var data = $this.data('guiAnim');
				var copyProps = {};

				_.each(props, function(prop, propName)
				{
					copyProps[propName] = prop;
				});

				methods.delegateTweenEvent("onStart", "onStartParams", $this, data.animElement, copyProps, arguments);
				methods.delegateTweenEvent("onUpdate", "onUpdateParams",  $this, data.animElement, copyProps, arguments);
				methods.delegateTweenEvent("onComplete", "onCompleteParams", $this, data.animElement, copyProps, arguments);

				guiTweener.addTween(data.animElement, copyProps);
			})
		},

		delegateTweenEvent: function(funcName, params, scope, animElement, props, args)
		{
			if (props[funcName] && (typeof props[funcName] === 'function'))
			{
				animElement[funcName] = props[funcName];
				var paramsObj = props[params] || [];
				props[funcName] = function()
				{
					animElement[funcName].apply(scope, paramsObj);
				}
			}
		}
	};

	$.fn.guiAnim = function(method)
	{
		if (methods[method])
		{
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}
		else if (typeof method === 'object')
		{
			return methods.init.apply(this, Array.prototype.slice.call(arguments, 0));
		}
		else
		{
			$.error('You need to supply a tween object to make this work!');
		}

	};

})(jQuery);


/*
 * transform: A jQuery cssHooks adding cross-browser 2d transform capabilities to $.fn.css() and $.fn.animate()
 *
 * limitations:
 * - requires jQuery 1.4.3+
 * - Should you use the *translate* property, then your elements need to be absolutely positionned in a relatively positionned wrapper **or it will fail in IE678**.
 * - transformOrigin is not accessible
 *
 * latest version and complete README available on Github:
 * https://github.com/louisremi/jquery.transform.js
 *
 * Copyright 2011 @louis_remi
 * Licensed under the MIT license.
 *
 * This saved you an hour of work?
 * Send me music http://www.amazon.co.uk/wishlist/HNTU0468LQON
 *
 */
(function($)
{

	/*
	 * Feature tests and global variables
	 */
	var div = document.createElement("div"),
			divStyle = div.style,
			propertyName = "transform",
			suffix = "Transform",
			testProperties = [
				"O" + suffix,
				"ms" + suffix,
				"Webkit" + suffix,
				"Moz" + suffix,
				// prefix-less property
				propertyName
			],
			i = testProperties.length,
			supportProperty,
			supportMatrixFilter,
			propertyHook,
			propertyGet,
			rMatrix = /Matrix([^)]*)/;

	// test different vendor prefixes of this property
	while (i--)
	{
		if (testProperties[i] in divStyle)
		{
			$.support[propertyName] = supportProperty = testProperties[i];
			continue;
		}
	}
	// IE678 alternative
	if (!supportProperty)
	{
		$.support.matrixFilter = supportMatrixFilter = divStyle.filter === "";
	}
	// prevent IE memory leak
	div = divStyle = null;

	// px isn't the default unit of this property
	$.cssNumber[propertyName] = true;

	$.matrix = $.matrix || {};
	$.matrix.fromString = matrix;
	$.matrix.unmatrix = unmatrix;

	/*
	 * fn.css() hooks
	 */
	if (supportProperty && supportProperty != propertyName)
	{
		// Modern browsers can use jQuery.cssProps as a basic hook
		$.cssProps[propertyName] = supportProperty;

		// Firefox needs a complete hook because it stuffs matrix with "px"
		if (supportProperty == "Moz" + suffix)
		{
			propertyHook = {
				get: function(elem, computed)
				{
					return (computed ? // remove "px" from the computed matrix
							$.css(elem, supportProperty).split("px").join("") : elem.style[supportProperty]
							)
				},
				set: function(elem, value)
				{
					// add "px" to matrices
					elem.style[supportProperty] = /matrix\([^)p]*\)/.test(value) ? value.replace(/matrix((?:[^,]*,){4})([^,]*),([^)]*)/, "matrix$1$2px,$3px") : value;
				}
			}
			/* Fix two jQuery bugs still present in 1.5.1
			 * - rupper is incompatible with IE9, see http://jqbug.com/8346
			 * - jQuery.css is not really jQuery.cssProps aware, see http://jqbug.com/8402
			 */
		} else if (/^1\.[0-5](?:\.|$)/.test($.fn.jquery))
		{
			propertyHook = {
				get: function(elem, computed)
				{
					return (computed ? $.css(elem, supportProperty.replace(/^ms/, "Ms")) : elem.style[supportProperty])
				}
			}
		}
		/* TODO: leverage hardware acceleration of 3d transform in Webkit only
		 else if ( supportProperty == "Webkit" + suffix && support3dTransform ) {
		 propertyHook = {
		 set: function( elem, value ) {
		 elem.style[supportProperty] =
		 value.replace();
		 }
		 }
		 }*/

	} else if (supportMatrixFilter)
	{
		propertyHook = {
			get: function(elem, computed)
			{
				var elemStyle = ( computed && elem.currentStyle ? elem.currentStyle : elem.style ),
						matrix;

				if (elemStyle && rMatrix.test(elemStyle.filter))
				{
					matrix = RegExp.$1.split(",");
					matrix = [
						matrix[0].split("=")[1],
						matrix[2].split("=")[1],
						matrix[1].split("=")[1],
						matrix[3].split("=")[1]
					];
				}
				else
				{
					matrix = [1,0,0,1];
				}
				matrix[4] = elemStyle ? elemStyle.left : 0;
				matrix[5] = elemStyle ? elemStyle.top : 0;
				return "matrix(" + matrix + ")";
			},
			set: function(elem, value, animate)
			{
				var elemStyle = elem.style,
						currentStyle,
						Matrix,
						filter,
						centerOrigin;

				if (!animate)
				{
					elemStyle.zoom = 1;
				}

				value = matrix(value);

				// rotate, scale and skew
				if (!animate || animate.M)
				{
					Matrix = [
						"Matrix(" + "M11=" + value[0],
						"M12=" + value[2],
						"M21=" + value[1],
						"M22=" + value[3],
						"SizingMethod='auto expand'"
					].join();
					filter = ( currentStyle = elem.currentStyle ) && currentStyle.filter || elemStyle.filter || "";

					elemStyle.filter = rMatrix.test(filter) ? filter.replace(rMatrix, Matrix) : filter + " progid:DXImageTransform.Microsoft." + Matrix + ")";

					// center the transform origin, from pbakaus's Transformie http://github.com/pbakaus/transformie
					if ((centerOrigin = $.transform.centerOrigin))
					{
						elemStyle[centerOrigin == "margin" ? "marginLeft" : "left"] = -(elem.offsetWidth / 2) + (elem.clientWidth / 2) + "px";
						elemStyle[centerOrigin == "margin" ? "marginTop" : "top"] = -(elem.offsetHeight / 2) + (elem.clientHeight / 2) + "px";
					}
				}

				// translate
				if (!animate || animate.T)
				{
					try {
							// FIXME:For IE. A Few times IE (style.width||style.height) = value is throw error...
						    elemStyle.left = value[4] + "px";
							elemStyle.top = value[5] + "px";
						} catch(e)
						{
						}
					// We assume that the elements are absolute positioned inside a relative positioned wrapper

				}
			}
		}
	}
	// populate jQuery.cssHooks with the appropriate hook if necessary
	if (propertyHook)
	{
		$.cssHooks[propertyName] = propertyHook;
	}
	// we need a unique setter for the animation logic
	propertyGet = propertyHook && propertyHook.get || $.css;

	/*
	 * fn.animate() hooks
	 */
	$.fx.step.transform = function(fx)
	{
		var elem = fx.elem,
				start = fx.start,
				end = fx.end,
				split,
				pos = fx.pos,
				transform,
				translate,
				rotate,
				scale,
				skew,
				T = false,
				M = false,
				prop;
		translate = rotate = scale = skew = "";

		// fx.end and fx.start need to be converted to their translate/rotate/scale/skew components
		// so that we can interpolate them
		if (!start || typeof start === "string")
		{
			// the following block can be commented out with jQuery 1.5.1+, see #7912
			if (!start)
			{
				start = propertyGet(elem, supportProperty);
			}

			// force layout only once per animation
			if (supportMatrixFilter)
			{
				elem.style.zoom = 1;
			}

			// if the start computed matrix is in end, we are doing a relative animation
			split = end.split(start);
			if (split.length == 2)
			{
				// remove the start computed matrix to make animations more accurate
				end = split.join("");
				fx.origin = start;
				start = "none";
			}

			// start is either "none" or a matrix(...) that has to be parsed
			fx.start = start = start == "none" ? {
				translate: [0,0],
				rotate: 0,
				scale: [1,1],
				skew: [0,0]
			} : unmatrix(toArray(start));

			// fx.end has to be parsed and decomposed
			fx.end = end = ~end.indexOf("matrix") ? // bullet-proof parser
					unmatrix(matrix(end)) : // faster and more precise parser
					components(end);

			// get rid of properties that do not change
			for (prop in start)
			{
				if (prop == "rotate" ? start[prop] == end[prop] : start[prop][0] == end[prop][0] && start[prop][1] == end[prop][1])
				{
					delete start[prop];
				}
			}
		}

		/*
		 * We want a fast interpolation algorithm.
		 * This implies avoiding function calls and sacrifying DRY principle:
		 * - avoid $.each(function(){})
		 * - round values using bitewise hacks, see http://jsperf.com/math-round-vs-hack/3
		 */
		if (start.translate)
		{
			// round translate to the closest pixel
			translate = " translate(" + ((start.translate[0] + (end.translate[0] - start.translate[0]) * pos + .5) | 0) + "px," + ((start.translate[1] + (end.translate[1] - start.translate[1]) * pos + .5) | 0) + "px" + ")";
			T = true;
		}
		if (start.rotate != undefined)
		{
			rotate = " rotate(" + (start.rotate + (end.rotate - start.rotate) * pos) + "rad)";
			M = true;
		}
		if (start.scale)
		{
			scale = " scale(" + (start.scale[0] + (end.scale[0] - start.scale[0]) * pos) + "," + (start.scale[1] + (end.scale[1] - start.scale[1]) * pos) + ")";
			M = true;
		}
		if (start.skew)
		{
			skew = " skew(" + (start.skew[0] + (end.skew[0] - start.skew[0]) * pos) + "rad," + (start.skew[1] + (end.skew[1] - start.skew[1]) * pos) + "rad" + ")";
			M = true;
		}

		// In case of relative animation, restore the origin computed matrix here.
		transform = fx.origin ? fx.origin + translate + skew + scale + rotate : translate + rotate + scale + skew;

		propertyHook && propertyHook.set ? propertyHook.set(elem, transform, {M: M, T: T}) : elem.style[supportProperty] = transform;
	};

	/*
	 * Utility functions
	 */

	// turns a transform string into its "matrix(A,B,C,D,X,Y)" form (as an array, though)
	function matrix(transform)
	{
		transform = transform.split(")");
		var trim = $.trim
			// last element of the array is an empty string, get rid of it
				, i = transform.length - 1
				, split, prop, val
				, A = 1
				, B = 0
				, C = 0
				, D = 1
				, A_, B_, C_, D_
				, tmp1, tmp2
				, X = 0
				, Y = 0;
		// Loop through the transform properties, parse and multiply them
		while (i--)
		{
			split = transform[i].split("(");
			prop = trim(split[0]);
			val = split[1];
			A_ = B_ = C_ = D_ = 0;

			switch (prop)
			{
				case "translateX":
					X += parseInt(val, 10);
					continue;

				case "translateY":
					Y += parseInt(val, 10);
					continue;

				case "translate":
					val = val.split(",");
					X += parseInt(val[0], 10);
					Y += parseInt(val[1] || 0, 10);
					continue;

				case "rotate":
					val = toRadian(val);
					A_ = Math.cos(val);
					B_ = Math.sin(val);
					C_ = -Math.sin(val);
					D_ = Math.cos(val);
					break;

				case "scaleX":
					A_ = val;
					D_ = 1;
					break;

				case "scaleY":
					A_ = 1;
					D_ = val;
					break;

				case "scale":
					val = val.split(",");
					A_ = val[0];
					D_ = val.length > 1 ? val[1] : val[0];
					break;

				case "skewX":
					A_ = D_ = 1;
					C_ = Math.tan(toRadian(val));
					break;

				case "skewY":
					A_ = D_ = 1;
					B_ = Math.tan(toRadian(val));
					break;

				case "skew":
					A_ = D_ = 1;
					val = val.split(",");
					C_ = Math.tan(toRadian(val[0]));
					B_ = Math.tan(toRadian(val[1] || 0));
					break;

				case "matrix":
					val = val.split(",");
					A_ = +val[0];
					B_ = +val[1];
					C_ = +val[2];
					D_ = +val[3];
					X += parseInt(val[4], 10);
					Y += parseInt(val[5], 10);
			}
			// Matrix product
			tmp1 = A * A_ + B * C_;
			B = A * B_ + B * D_;
			tmp2 = C * A_ + D * C_;
			D = C * B_ + D * D_;
			A = tmp1;
			C = tmp2;
		}
		return [A,B,C,D,X,Y];
	}

	// turns a matrix into its rotate, scale and skew components
	// algorithm from http://hg.mozilla.org/mozilla-central/file/7cb3e9795d04/layout/style/nsStyleAnimation.cpp
	function unmatrix(matrix)
	{
		var scaleX
				, scaleY
				, skew
				, A = matrix[0]
				, B = matrix[1]
				, C = matrix[2]
				, D = matrix[3];

		// Make sure matrix is not singular
		if (A * D - B * C)
		{
			// step (3)
			scaleX = Math.sqrt(A * A + B * B);
			A /= scaleX;
			B /= scaleX;
			// step (4)
			skew = A * C + B * D;
			C -= A * skew;
			D -= B * skew;
			// step (5)
			scaleY = Math.sqrt(C * C + D * D);
			C /= scaleY;
			D /= scaleY;
			skew /= scaleY;
			// step (6)
			if (A * D < B * C)
			{
				//scaleY = -scaleY;
				//skew = -skew;
				A = -A;
				B = -B;
				skew = -skew;
				scaleX = -scaleX;
			}

			// matrix is singular and cannot be interpolated
		}
		else
		{
			B = A = scaleX = scaleY = skew = 0;
		}

		return {
			translate: [+matrix[4], +matrix[5]],
			rotate: Math.atan2(B, A),
			scale: [scaleX, scaleY],
			skew: [skew, 0]
		}
	}

	// parse transform components of a transform string not containing "matrix(...)"
	function components(transform)
	{
		// split the != transforms
		transform = transform.split(")");

		var translate = [0,0],
				rotate = 0,
				scale = [1,1],
				skew = [0,0],
				i = transform.length - 1,
				trim = $.trim,
				split, value;

		// add components
		while (i--)
		{
			split = transform[i].split("(");
			value = split[1];

			switch (trim(split[0]))
			{
				case "translateX":
					translate[0] += parseInt(value, 10);
					break;

				case "translateY":
					translate[1] += parseInt(value, 10);
					break;

				case "translate":
					value = value.split(",");
					translate[0] += parseInt(value[0], 10);
					translate[1] += parseInt(value[1] || 0, 10);
					break;

				case "rotate":
					rotate += toRadian(value);
					break;

				case "scaleX":
					scale[0] *= value;

				case "scaleY":
					scale[1] *= value;

				case "scale":
					value = value.split(",");
					scale[0] *= value[0];
					scale[1] *= (value.length > 1 ? value[1] : value[0]);
					break;

				case "skewX":
					skew[0] += toRadian(value);
					break;

				case "skewY":
					skew[1] += toRadian(value);
					break;

				case "skew":
					value = value.split(",");
					skew[0] += toRadian(value[0]);
					skew[1] += toRadian(value[1] || "0");
					break;
			}
		}

		return {
			translate: translate,
			rotate: rotate,
			scale: scale,
			skew: skew
		};
	}

	// converts an angle string in any unit to a radian Float
	function toRadian(value)
	{
		return ~value.indexOf("deg") ? parseInt(value, 10) * (Math.PI * 2 / 360) : ~value.indexOf("grad") ? parseInt(value, 10) * (Math.PI / 200) : parseFloat(value);
	}

	// Converts "matrix(A,B,C,D,X,Y)" to [A,B,C,D,X,Y]
	function toArray(matrix)
	{
		// Fremove the unit of X and Y for Firefox
		matrix = /\(([^,]*),([^,]*),([^,]*),([^,]*),([^,p]*)(?:px)?,([^)p]*)(?:px)?/.exec(matrix);
		return [matrix[1], matrix[2], matrix[3], matrix[4], matrix[5], matrix[6]];
	}

	$.transform = {
		centerOrigin: "margin"
	};

})(jQuery);