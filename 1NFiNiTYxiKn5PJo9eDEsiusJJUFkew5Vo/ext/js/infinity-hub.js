
/* ---- /js/lib/Class.coffee ---- */


(function() {
  var Class,
	__slice = [].slice;

  Class = (function() {
	function Class() {}

	Class.prototype.trace = true;

	Class.prototype.log = function() {
	  var args;
	  args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
	  if (!this.trace) {
		return;
	  }
	  if (typeof console === 'undefined') {
		return;
	  }
	  args.unshift("[" + this.constructor.name + "]");
	  console.log.apply(console, args);
	  return this;
	};

	Class.prototype.logStart = function() {
	  var args, name;
	  name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
	  if (!this.trace) {
		return;
	  }
	  this.logtimers || (this.logtimers = {});
	  this.logtimers[name] = +(new Date);
	  if (args.length > 0) {
		this.log.apply(this, ["" + name].concat(__slice.call(args), ["(started)"]));
	  }
	  return this;
	};

	Class.prototype.logEnd = function() {
	  var args, ms, name;
	  name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
	  ms = +(new Date) - this.logtimers[name];
	  this.log.apply(this, ["" + name].concat(__slice.call(args), ["(Done in " + ms + "ms)"]));
	  return this;
	};

	return Class;

  })();

  window.Class = Class;

}).call(this);


/* ---- /js/lib/Dollar.coffee ---- */


(function() {
  window.$ = function(selector) {
	if (selector.startsWith("#")) {
	  return document.getElementById(selector.replace("#", ""));
	}
  };

}).call(this);


/* ---- /js/lib/Promise.coffee ---- */


(function() {
  var Promise,
	__slice = [].slice;

  Promise = (function() {
	Promise.join = function() {
	  var args, num_uncompleted, promise, task, task_id, tasks, _fn, _i, _len;
	  tasks = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
	  num_uncompleted = tasks.length;
	  args = new Array(num_uncompleted);
	  promise = new Promise();
	  _fn = function(task_id) {
		return task.then(function() {
		  var callback, _j, _len1, _ref, _results;
		  args[task_id] = Array.prototype.slice.call(arguments);
		  num_uncompleted--;
		  if (num_uncompleted === 0) {
			_ref = promise.callbacks;
			_results = [];
			for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
			  callback = _ref[_j];
			  _results.push(callback.apply(promise, args));
			}
			return _results;
		  }
		});
	  };
	  for (task_id = _i = 0, _len = tasks.length; _i < _len; task_id = ++_i) {
		task = tasks[task_id];
		_fn(task_id);
	  }
	  return promise;
	};

	function Promise() {
	  this.resolved = false;
	  this.end_promise = null;
	  this.result = null;
	  this.callbacks = [];
	}

	Promise.prototype.resolve = function() {
	  var back, callback, _i, _len, _ref;
	  if (this.resolved) {
		return false;
	  }
	  this.resolved = true;
	  this.data = arguments;
	  if (!arguments.length) {
		this.data = [true];
	  }
	  this.result = this.data[0];
	  _ref = this.callbacks;
	  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
		callback = _ref[_i];
		back = callback.apply(callback, this.data);
	  }
	  if (this.end_promise && back && back.then) {
		return back.then((function(_this) {
		  return function(back_res) {
			return _this.end_promise.resolve(back_res);
		  };
		})(this));
	  }
	};

	Promise.prototype.fail = function() {
	  return this.resolve(false);
	};

	Promise.prototype.then = function(callback) {
	  if (this.resolved === true) {
		return callback.apply(callback, this.data);
	  }
	  this.callbacks.push(callback);
	  this.end_promise = new Promise();
	  return this.end_promise;
	};

	return Promise;

  })();

  window.Promise = Promise;


  /*
  s = Date.now()
  log = (text) ->
  	console.log Date.now()-s, Array.prototype.slice.call(arguments).join(", ")
  
  log "Started"
  
  cmd = (query) ->
  	p = new Promise()
  	setTimeout ( ->
  		p.resolve query+" Result"
  	), 100
  	return p
  
  
  back = cmd("SELECT * FROM message").then (res) ->
  	log res
  	p = new Promise()
  	setTimeout ( ->
  		p.resolve("DONE parsing SELECT")
  	), 100
  	return p
  .then (res) ->
  	log "Back of messages", res
  	return cmd("SELECT * FROM users")
  .then (res) ->
  	log "End result", res
  
  log "Query started", back
  
  
  q1 = cmd("SELECT * FROM anything")
  q2 = cmd("SELECT * FROM something")
  
  Promise.join(q1, q2).then (res1, res2) ->
	log res1, res2
   */

}).call(this);


/* ---- /js/lib/Property.coffee ---- */


(function() {
  Function.prototype.property = function(prop, desc) {
	return Object.defineProperty(this.prototype, prop, desc);
  };

}).call(this);


/* ---- /js/lib/Prototypes.coffee ---- */


(function() {
  String.prototype.startsWith = function(s) {
	return this.slice(0, s.length) === s;
  };

  String.prototype.endsWith = function(s) {
	return s === '' || this.slice(-s.length) === s;
  };

  String.prototype.repeat = function(count) {
	return new Array(count + 1).join(this);
  };

  window.isEmpty = function(obj) {
	var key;
	for (key in obj) {
	  return false;
	}
	return true;
  };

}).call(this);


/* ---- /js/lib/RateLimitCb.coffee ---- */


(function() {
  var call_after_interval, calling, last_time,
	__slice = [].slice;

  last_time = {};

  calling = {};

  call_after_interval = {};

  window.RateLimitCb = function(interval, fn, args) {
	var cb;
	if (args == null) {
	  args = [];
	}
	cb = function() {
	  var left;
	  left = interval - (Date.now() - last_time[fn]);
	  if (left <= 0) {
		delete last_time[fn];
		if (calling[fn]) {
		  RateLimitCb(interval, fn, calling[fn]);
		}
		return delete calling[fn];
	  } else {
		return setTimeout((function() {
		  delete last_time[fn];
		  if (calling[fn]) {
			RateLimitCb(interval, fn, calling[fn]);
		  }
		  return delete calling[fn];
		}), left);
	  }
	};
	if (last_time[fn]) {
	  return calling[fn] = args;
	} else {
	  last_time[fn] = Date.now();
	  return fn.apply(this, [cb].concat(__slice.call(args)));
	}
  };

  window.RateLimit = function(interval, fn) {
	if (!calling[fn]) {
	  call_after_interval[fn] = false;
	  fn();
	  return calling[fn] = setTimeout((function() {
		if (call_after_interval[fn]) {
		  fn();
		}
		delete calling[fn];
		return delete call_after_interval[fn];
	  }), interval);
	} else {
	  return call_after_interval[fn] = true;
	}
  };


  /*
  window.s = Date.now()
  window.load = (done, num) ->
	console.log "Loading #{num}...", Date.now()-window.s
	setTimeout (-> done()), 1000
  
  RateLimit 500, window.load, [0] # Called instantly
  RateLimit 500, window.load, [1]
  setTimeout (-> RateLimit 500, window.load, [300]), 300
  setTimeout (-> RateLimit 500, window.load, [600]), 600 # Called after 1000ms
  setTimeout (-> RateLimit 500, window.load, [1000]), 1000
  setTimeout (-> RateLimit 500, window.load, [1200]), 1200  # Called after 2000ms
  setTimeout (-> RateLimit 500, window.load, [3000]), 3000  # Called after 3000ms
   */

}).call(this);


/* ---- /js/lib/clone.js ---- */


function clone(obj) {
	if (null == obj || "object" != typeof obj) return obj;
	var copy = obj.constructor();
	for (var attr in obj) {
		if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
	}
	return copy;
}


/* ---- /js/utils/Animation.coffee ---- */


(function() {
  var Animation;

  Animation = (function() {
	function Animation() {}

	Animation.prototype.slideDown = function(elem, props) {
	  var border_bottom_width, border_top_width, cstyle, h, margin_bottom, margin_top, next_elem, padding_bottom, padding_top, parent, top_after, top_before, transition;
      h = elem.offsetHeight;
	  cstyle = window.getComputedStyle(elem);
	  margin_top = cstyle.marginTop;
	  margin_bottom = cstyle.marginBottom;
	  padding_top = cstyle.paddingTop;
	  padding_bottom = cstyle.paddingBottom;
	  border_top_width = cstyle.borderTopWidth;
	  border_bottom_width = cstyle.borderBottomWidth;
	  transition = cstyle.transition;
	  if (props.animate_scrollfix && elem.getBoundingClientRect().top < 0) {
        top_after = document.body.scrollHeight;
        next_elem = elem.nextSibling;
        parent = elem.parentNode;
        parent.removeChild(elem);
        top_before = document.body.scrollHeight;
        console.log("Scrollcorrection down", top_before - top_after);
        window.scrollTo(window.scrollX, window.scrollY - (top_before - top_after));
        if (next_elem) {
          parent.insertBefore(elem, next_elem);
        } else {
          parent.appendChild(elem);
        }
        return;
      }
	  if (props.animate_scrollfix && elem.getBoundingClientRect().top > 2000) {
        return;
      }
	  elem.style.boxSizing = "border-box";
	  elem.style.overflow = "hidden";
	  if (!props.animate_noscale) {
		elem.style.transform = "scale(0.6)";
	  }
	  elem.style.opacity = "0";
	  elem.style.height = "0px";
	  elem.style.marginTop = "0px";
	  elem.style.marginBottom = "0px";
	  elem.style.paddingTop = "0px";
	  elem.style.paddingBottom = "0px";
	  elem.style.borderTopWidth = "0px";
	  elem.style.borderBottomWidth = "0px";
	  elem.style.transition = "none";
	  setTimeout((function() {
		elem.className += " animate-inout";
		elem.style.height = h + "px";
		elem.style.transform = "scale(1)";
		elem.style.opacity = "1";
		elem.style.marginTop = margin_top;
		elem.style.marginBottom = margin_bottom;
		elem.style.paddingTop = padding_top;
		elem.style.paddingBottom = padding_bottom;
		elem.style.borderTopWidth = border_top_width;
		return elem.style.borderBottomWidth = border_bottom_width;
	  }), 1);
	  return elem.addEventListener("transitionend", function() {
		elem.classList.remove("animate-inout");
		elem.style.transition = elem.style.transform = elem.style.opacity = elem.style.height = null;
		elem.style.boxSizing = elem.style.marginTop = elem.style.marginBottom = null;
		elem.style.paddingTop = elem.style.paddingBottom = elem.style.overflow = null;
		elem.style.borderTopWidth = elem.style.borderBottomWidth = elem.style.overflow = null;
		return elem.removeEventListener("transitionend", arguments.callee, false);
	  });
	};

	Animation.prototype.slideDownAnime = function(elem, props) {
	  var cstyle;
	  cstyle = window.getComputedStyle(elem);
	  elem.style.overflowY = "hidden";
	  return anime({
		targets: elem,
		height: [0, elem.offsetHeight],
		easing: 'easeInOutExpo'
	  });
	};

	Animation.prototype.slideUpAnime = function(elem, remove_func, props) {
	  elem.style.overflowY = "hidden";
	  return anime({
		targets: elem,
		height: [elem.offsetHeight, 0],
		complete: remove_func,
		easing: 'easeInOutExpo'
	  });
	};

	Animation.prototype.slideUp = function(elem, remove_func, props) {
      var next_elem, parent, top_after, top_before;
      if (props.animate_scrollfix && elem.getBoundingClientRect().top < 0 && elem.nextSibling) {
        top_after = document.body.scrollHeight;
        next_elem = elem.nextSibling;
        parent = elem.parentNode;
        parent.removeChild(elem);
        top_before = document.body.scrollHeight;
        console.log("Scrollcorrection down", top_before - top_after);
        window.scrollTo(window.scrollX, window.scrollY + (top_before - top_after));
        if (next_elem) {
          parent.insertBefore(elem, next_elem);
        } else {
          parent.appendChild(elem);
        }
        remove_func();
        return;
      }
      if (props.animate_scrollfix && elem.getBoundingClientRect().top > 2000) {
        remove_func();
        return;
      }
	  elem.className += " animate-inout";
	  elem.style.boxSizing = "border-box";
	  elem.style.height = elem.offsetHeight + "px";
	  elem.style.overflow = "hidden";
	  elem.style.transform = "scale(1)";
	  elem.style.opacity = "1";
	  elem.style.pointerEvents = "none";
	  setTimeout((function() {
		elem.style.height = "0px";
		elem.style.marginTop = "0px";
		elem.style.marginBottom = "0px";
		elem.style.paddingTop = "0px";
		elem.style.paddingBottom = "0px";
		elem.style.transform = "scale(0.8)";
		elem.style.borderTopWidth = "0px";
		elem.style.borderBottomWidth = "0px";
		return elem.style.opacity = "0";
	  }), 1);
	  return elem.addEventListener("transitionend", function(e) {
		if (e.propertyName === "opacity" || e.elapsedTime >= 0.6) {
		  remove_func();
		  return elem.removeEventListener("transitionend", arguments.callee, false);
		}
	  });
	};

	Animation.prototype.showRight = function(elem, props) {
	  elem.className += " animate";
	  elem.style.opacity = 0;
	  elem.style.transform = "TranslateX(-20px) Scale(1.01)";
	  setTimeout((function() {
		elem.style.opacity = 1;
		return elem.style.transform = "TranslateX(0px) Scale(1)";
	  }), 1);
	  return elem.addEventListener("transitionend", function() {
		elem.classList.remove("animate");
		elem.style.transform = elem.style.opacity = null;
		return elem.removeEventListener("transitionend", arguments.callee, false);
	  });
	};

	Animation.prototype.show = function(elem, props) {
	  var delay, _ref;
	  delay = ((_ref = arguments[arguments.length - 2]) != null ? _ref.delay : void 0) * 1000 || 1;
	  elem.className += " animate";
	  elem.style.opacity = 0;
	  setTimeout((function() {
		return elem.style.opacity = 1;
	  }), delay);
	  return elem.addEventListener("transitionend", function() {
		elem.classList.remove("animate");
		elem.style.opacity = null;
		return elem.removeEventListener("transitionend", arguments.callee, false);
	  });
	};

	Animation.prototype.hide = function(elem, remove_func, props) {
	  var delay, _ref;
	  delay = ((_ref = arguments[arguments.length - 2]) != null ? _ref.delay : void 0) * 1000 || 1;
	  elem.className += " animate";
	  setTimeout((function() {
		return elem.style.opacity = 0;
	  }), delay);
	  return elem.addEventListener("transitionend", function(e) {
		if (e.propertyName === "opacity") {
		  remove_func();
		  return elem.removeEventListener("transitionend", arguments.callee, false);
		}
	  });
	};

	Animation.prototype.addVisibleClass = function(elem, props) {
	  return setTimeout(function() {
		return elem.classList.add("visible");
	  });
	};

	Animation.prototype.cloneAnimation = function(elem, animation) {
	  return window.requestAnimationFrame((function(_this) {
		return function() {
		  var clone, cloneleft, cstyle;
		  if (elem.style.pointerEvents === "none") {
			elem = elem.nextSibling;
		  }
		  elem.style.position = "relative";
		  elem.style.zIndex = "2";
		  clone = elem.cloneNode(true);
		  cstyle = window.getComputedStyle(elem);
		  clone.classList.remove("loading");
		  clone.style.position = "absolute";
		  clone.style.zIndex = "1";
		  clone.style.pointerEvents = "none";
		  clone.style.animation = "none";
		  elem.parentNode.insertBefore(clone, elem);
		  cloneleft = clone.offsetLeft;
		  clone.parentNode.removeChild(clone);
		  clone.style.marginLeft = parseInt(cstyle.marginLeft) + elem.offsetLeft - cloneleft + "px";
		  elem.parentNode.insertBefore(clone, elem);
		  clone.style.animation = animation + " 0.8s ease-in-out forwards";
		  return setTimeout((function() {
			return clone.remove();
		  }), 1000);
		};
	  })(this));
	};

	Animation.prototype.flashIn = function(elem) {
	  if (elem.offsetWidth > 100) {
		return this.cloneAnimation(elem, "flash-in-big");
	  } else {
		return this.cloneAnimation(elem, "flash-in");
	  }
	};

	Animation.prototype.flashOut = function(elem) {
	  if (elem.offsetWidth > 100) {
		return this.cloneAnimation(elem, "flash-out-big");
	  } else {
		return this.cloneAnimation(elem, "flash-out");
	  }
	};

	return Animation;

  })();

  window.Animation = new Animation();

}).call(this);


/* ---- /js/utils/Autosize.coffee ---- */


(function() {
  var Autosize,
	__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	__hasProp = {}.hasOwnProperty;

  Autosize = (function(_super) {
	__extends(Autosize, _super);

	function Autosize(_at_attrs) {
	  var _base;
	  this.attrs = _at_attrs != null ? _at_attrs : {};
	  this.render = __bind(this.render, this);
	  this.handleKeydown = __bind(this.handleKeydown, this);
	  this.handleInput = __bind(this.handleInput, this);
	  this.autoHeight = __bind(this.autoHeight, this);
	  this.setValue = __bind(this.setValue, this);
	  this.storeNode = __bind(this.storeNode, this);
	  this.node = null;
	  if ((_base = this.attrs).classes == null) {
		_base.classes = {};
	  }
	  this.attrs.classes.loading = false;
	  this.attrs.oninput = this.handleInput;
	  this.attrs.onkeydown = this.handleKeydown;
	  this.attrs.afterCreate = this.storeNode;
	  this.attrs.rows = 1;
	  this.attrs.value = null;
	  this.attrs.disabled = false;
	}

	Autosize.property('loading', {
	  get: function() {
		return this.attrs.classes.loading;
	  },
	  set: function(loading) {
		this.attrs.classes.loading = loading;
		this.node.value = this.attrs.value;
		this.autoHeight();
		return Page.projector.scheduleRender();
	  }
	});

	Autosize.prototype.storeNode = function(node) {
	  this.node = node;
	  if (this.attrs.focused) {
		node.focus();
	  }
	  return setTimeout((function(_this) {
		return function() {
		  return _this.autoHeight();
		};
	  })(this));
	};

	Autosize.prototype.setValue = function(value) {
	  if (value == null) {
		value = null;
	  }
	  this.attrs.value = value;
	  if (this.node) {
		this.node.value = value;
		this.autoHeight();
	  }
	  return Page.projector.scheduleRender();
	};

	Autosize.prototype.autoHeight = function() {
	  var h, height_before, scrollh;
	  height_before = this.node.style.height;
	  if (height_before) {
		this.node.style.height = "0px";
	  }
	  h = this.node.offsetHeight;
	  scrollh = this.node.scrollHeight;
	  this.node.style.height = height_before;
	  if (scrollh > h) {
		return anime({
		  targets: this.node,
		  height: scrollh,
		  scrollTop: 0
		});
	  } else {
		return this.node.style.height = height_before;
	  }
	};

	Autosize.prototype.handleInput = function(e) {
	  if (e == null) {
		e = null;
	  }
	  this.attrs.value = e.target.value;
	  return RateLimit(300, this.autoHeight);
	};

	Autosize.prototype.handleKeydown = function(e) {
	  if (e == null) {
		e = null;
	  }
	  if (e.which === 13 && !e.shiftKey && this.attrs.onsubmit && this.attrs.value.trim()) {
		this.attrs.onsubmit();
		setTimeout(((function(_this) {
		  return function() {
			return _this.autoHeight();
		  };
		})(this)), 100);
		return false;
	  }
	};

	Autosize.prototype.render = function(body) {
	  var attrs;
	  if (body == null) {
		body = null;
	  }
	  if (body && this.attrs.value === void 0) {
		this.setValue(body);
	  }
	  if (this.loading) {
		attrs = clone(this.attrs);
		attrs.disabled = true;
		return h("textarea.autosize", attrs);
	  } else {
		return h("textarea.autosize", this.attrs);
	  }
	};

	return Autosize;

  })(Class);

  window.Autosize = Autosize;

}).call(this);


/* ---- /js/utils/Debug.coffee ---- */


(function() {
  var Debug;

  Debug = (function() {
	function Debug() {}

	Debug.prototype.formatException = function(err) {
	  if (typeof err === 'object') {
		if (err.message) {
		  console.log('Message: ' + err.message);
		}
		if (err.stack) {
		  console.log('Stacktrace:');
		  console.log('====================');
		  return console.log(err.stack);
		}
	  } else {
		return console.log(err);
	  }
	};

	return Debug;

  })();

  window.Debug = new Debug();

}).call(this);


/* ---- /js/utils/Editable.coffee ---- */


(function() {
  var Editable,
	__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	__hasProp = {}.hasOwnProperty;

  Editable = (function(_super) {
	__extends(Editable, _super);

	function Editable(_at_type, _at_handleSave, _at_handleDelete) {
	  this.type = _at_type;
	  this.handleSave = _at_handleSave;
	  this.handleDelete = _at_handleDelete;
	  this.render = __bind(this.render, this);
	  this.handleSaveClick = __bind(this.handleSaveClick, this);
	  this.handleDeleteClick = __bind(this.handleDeleteClick, this);
	  this.handleCancelClick = __bind(this.handleCancelClick, this);
	  this.handleEditClick = __bind(this.handleEditClick, this);
	  this.storeNode = __bind(this.storeNode, this);
	  this.node = null;
	  this.editing = false;
	  this.render_function = null;
	}

	Editable.prototype.storeNode = function(node) {
	  return this.node = node;
	};

	Editable.prototype.handleEditClick = function(e) {
	  this.editing = true;
	  this.field_edit = new Autosize({
		focused: 1,
		style: "height: 0px"
	  });
	  return false;
	};

	Editable.prototype.handleCancelClick = function() {
	  this.editing = false;
	  return false;
	};

	Editable.prototype.handleDeleteClick = function() {
	  Page.cmd("wrapperConfirm", ["Are you sure?", "Delete"], (function(_this) {
		return function() {
		  _this.field_edit.loading = true;
		  return _this.handleDelete(function(res) {
			return _this.field_edit.loading = false;
		  });
		};
	  })(this));
	  return false;
	};

	Editable.prototype.handleSaveClick = function() {
	  this.field_edit.loading = true;
	  this.handleSave(this.field_edit.attrs.value, (function(_this) {
		return function(res) {
		  _this.field_edit.loading = false;
		  if (res) {
			return _this.editing = false;
		  }
		};
	  })(this));
	  return false;
	};

	Editable.prototype.render = function(body) {
	  if (this.editing) {
		return h("div.editable.editing", {
		  exitAnimation: Animation.slideUp
		}, this.field_edit.render(body), h("div.editablebuttons", h("a.link", {
		  href: "#Cancel",
		  onclick: this.handleCancelClick,
		  tabindex: "-1"
		}, "Cancel"), this.handleDelete ? h("a.button.button-submit.button-small.button-outline", {
		  href: "#Delete",
		  onclick: this.handleDeleteClick,
		  tabindex: "-1"
		}, "Delete") : void 0, h("a.button.button-submit.button-small", {
		  href: "#Save",
		  onclick: this.handleSaveClick
		}, "Save")));
	  } else {
		return h("div.editable", {
		  enterAnimation: Animation.slideDown
		}, h("a.icon.icon-edit", {
		  key: this.node,
		  href: "#Edit",
		  onclick: this.handleEditClick
		}), !body ? h(this.type, h("span.empty", {
		  onclick: this.handleEditClick
		}, "Click here to edit this field")) : this.render_function ? h(this.type, {
		  innerHTML: this.render_function(body)
		}) : h(this.type, body));
	  }
	};

	return Editable;

  })(Class);

  window.Editable = Editable;

}).call(this);


/* ---- /js/utils/ItemList.coffee ---- */


(function() {
  var ItemList;

  ItemList = (function() {
	function ItemList(_at_item_class, _at_key) {
	  this.item_class = _at_item_class;
	  this.key = _at_key;
	  this.items = [];
	  this.items_bykey = {};
	}

	ItemList.prototype.sync = function(rows, item_class, key) {
	  var current_obj, item, row, _i, _len, _results;
	  this.items.splice(0, this.items.length);
	  _results = [];
	  for (_i = 0, _len = rows.length; _i < _len; _i++) {
		row = rows[_i];
		current_obj = this.items_bykey[row[this.key]];
		if (current_obj) {
		  current_obj.row = row;
		  _results.push(this.items.push(current_obj));
		} else {
		  item = new this.item_class(row, this);
		  this.items_bykey[row[this.key]] = item;
		  _results.push(this.items.push(item));
		}
	  }
	  return _results;
	};

	ItemList.prototype.deleteItem = function(item) {
	  var index;
	  index = this.items.indexOf(item);
	  if (index > -1) {
		this.items.splice(index, 1);
	  } else {
		console.log("Can't delete item", item);
	  }
	  return delete this.items_bykey[item.row[this.key]];
	};

	return ItemList;

  })();

  window.ItemList = ItemList;

}).call(this);


/* ---- /js/utils/Menu.coffee ---- */


(function() {
  var Menu,
	__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Menu = (function() {
	function Menu() {
	  this.render = __bind(this.render, this);
	  this.renderItem = __bind(this.renderItem, this);
	  this.handleClick = __bind(this.handleClick, this);
	  this.storeNode = __bind(this.storeNode, this);
	  this.toggle = __bind(this.toggle, this);
	  this.hide = __bind(this.hide, this);
	  this.show = __bind(this.show, this);
	  this.visible = false;
	  this.items = [];
	  this.node = null;
	}

	Menu.prototype.show = function() {
	  var _ref;
	  if ((_ref = window.visible_menu) != null) {
		_ref.hide();
	  }
	  this.visible = true;
	  return window.visible_menu = this;
	};

	Menu.prototype.hide = function() {
	  return this.visible = false;
	};

	Menu.prototype.toggle = function() {
	  if (this.visible) {
		return this.hide();
	  } else {
		return this.show();
	  }
	};

	Menu.prototype.addItem = function(title, cb, selected) {
	  if (selected == null) {
		selected = false;
	  }
	  return this.items.push([title, cb, selected]);
	};

	Menu.prototype.storeNode = function(node) {
	  this.node = node;
	  if (this.visible) {
		node.className = node.className.replace("visible", "");
		return setTimeout((function() {
		  return node.className += " visible";
		}), 10);
	  }
	};

	Menu.prototype.handleClick = function(e) {
	  var cb, keep_menu, title, _i, _len, _ref, _ref1;
	  keep_menu = false;
	  _ref = this.items;
	  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
		_ref1 = _ref[_i], title = _ref1[0], cb = _ref1[1];
		if (title === e.target.textContent) {
		  keep_menu = cb();
		}
	  }
	  if (keep_menu !== true) {
		this.hide();
	  }
	  return false;
	};

	Menu.prototype.renderItem = function(item) {
	  var cb, href, onclick, selected, title;
	  title = item[0], cb = item[1], selected = item[2];
	  if (title === "---") {
		return h("div.menu-item-separator");
	  } else {
		if (typeof cb === "string") {
		  href = cb;
		  onclick = true;
		} else {
		  href = "#" + title;
		  onclick = this.handleClick;
		}
		return h("a.menu-item", {
		  href: href,
		  onclick: onclick,
		  key: title,
		  classes: {
			"selected": selected
		  }
		}, [title]);
	  }
	};

	Menu.prototype.render = function(class_name) {
	  if (class_name == null) {
		class_name = "";
	  }
	  if (this.visible || this.node) {
		return h("div.menu" + class_name, {
		  classes: {
			"visible": this.visible
		  },
		  afterCreate: this.storeNode
		}, this.items.map(this.renderItem));
	  }
	};

	return Menu;

  })();

  window.Menu = Menu;

  document.body.addEventListener("mouseup", function(e) {
	if (!window.visible_menu || !window.visible_menu.node) {
	  return false;
	}
	if (e.target.parentNode !== window.visible_menu.node.parentNode && e.target.parentNode !== window.visible_menu.node && e.target.parentNode.parentNode !== window.visible_menu.node.parentNode) {
	  window.visible_menu.hide();
	  return Page.projector.scheduleRender();
	}
  });

}).call(this);


/* ---- /js/utils/Text.coffee ---- */


(function() {
  var MarkedRenderer, Text,
	__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	__hasProp = {}.hasOwnProperty,
	__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	__indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  MarkedRenderer = (function(_super) {
	__extends(MarkedRenderer, _super);

	function MarkedRenderer() {
	  return MarkedRenderer.__super__.constructor.apply(this, arguments);
	}

	MarkedRenderer.prototype.image = function(href, title, text) {
	  return "<code>![" + text + "](" + href + ")</code>";
	};

	return MarkedRenderer;

  })(marked.Renderer);

  Text = (function() {
	function Text() {
	  this.renderLinks = __bind(this.renderLinks, this);
	  this.renderMarked = __bind(this.renderMarked, this);
	}

	Text.prototype.toColor = function(text, saturation, lightness) {
	  var hash, i, _i, _ref;
	  if (saturation == null) {
		saturation = 30;
	  }
	  if (lightness == null) {
		lightness = 50;
	  }
	  hash = 0;
	  for (i = _i = 0, _ref = text.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
		hash += text.charCodeAt(i) * i;
		hash = hash % 1777;
	  }
	  return "hsl(" + (hash % 360) + ("," + saturation + "%," + lightness + "%)");
	};

	Text.prototype.renderMarked = function(text, options) {
	  if (options == null) {
		options = {};
	  }
	  options["gfm"] = true;
	  options["breaks"] = true;
	  options["sanitize"] = true;
	  options["renderer"] = marked_renderer;
	  text = this.fixReply(text);
	  text = marked(text, options);
	  // text = this.emailLinks(text);
	  return this.fixHtmlLinks(text);
	};

	 Text.prototype.renderLinks = function(text) {
      text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      text = text.replace(/(https?:\/\/[^\s)]+)/g, function(match) {
        return "<a href=\"" + (match.replace(/&amp;/g, '&')) + "\">" + match + "</a>";
      });
      text = text.replace(/\n/g, '<br>');
      text = text.replace(/(@[A-Za-z0-9 ]+):/g, '<b class="reply-name">$1</b>:');
      return text;
    };

	Text.prototype.emailLinks = function(text) {
	  return text.replace(/([a-zA-Z0-9]+)@zeroid.bit/g, "<a href='?to=$1' onclick='return Page.message_create.show(\"$1\")'>$1@zeroid.bit</a>");
	};

	Text.prototype.fixHtmlLinks = function(text) {
      if (window.is_proxy) {
        text = text.replace(/href="http:\/\/(127.0.0.1|localhost):43110/g, 'href="http://zero');
      } else {
        text = text.replace(/href="http:\/\/(127.0.0.1|localhost):43110/g, 'href="');
      }
      text = text.replace('href="?', 'onclick="return Page.handleLinkClick(window.event)" href="?');
      return text;
    };

	Text.prototype.fixLink = function(link) {
	  var back;
	  if (window.is_proxy) {
		back = link.replace(/http:\/\/(127.0.0.1|localhost):43110/, 'http://zero');
		return back.replace(/http:\/\/zero\/([^\/]+\.bit)/, "http://$1");
	  } else {
		return link.replace(/http:\/\/(127.0.0.1|localhost):43110/, '');
	  }
	};

	Text.prototype.toUrl = function(text) {
	  return text.replace(/[^A-Za-z0-9]/g, "+").replace(/[+]+/g, "+").replace(/[+]+$/, "");
	};

	Text.prototype.getSiteUrl = function(address) {
	  if (window.is_proxy) {
		if (__indexOf.call(address, ".") >= 0) {
		  return "http://" + address + "/";
		} else {
		  return "http://zero/" + address + "/";
		}
	  } else {
		return "/" + address + "/";
	  }
	};

	Text.prototype.fixReply = function(text) {
	  return text.replace(/(>.*\n)([^\n>])/gm, "$1\n$2");
	};

	Text.prototype.toBitcoinAddress = function(text) {
	  return text.replace(/[^A-Za-z0-9]/g, "");
	};

	Text.prototype.jsonEncode = function(obj) {
	  return unescape(encodeURIComponent(JSON.stringify(obj)));
	};

	Text.prototype.jsonDecode = function(obj) {
	  return JSON.parse(decodeURIComponent(escape(obj)));
	};

	Text.prototype.fileEncode = function(obj) {
	  if (typeof obj === "string") {
		return btoa(unescape(encodeURIComponent(obj)));
	  } else {
		return btoa(unescape(encodeURIComponent(JSON.stringify(obj, void 0, '\t'))));
	  }
	};

	Text.prototype.utf8Encode = function(s) {
	  return unescape(encodeURIComponent(s));
	};

	Text.prototype.utf8Decode = function(s) {
	  return decodeURIComponent(escape(s));
	};

	Text.prototype.distance = function(s1, s2) {
	  var char, extra_parts, key, match, next_find, next_find_i, val, _i, _len;
	  s1 = s1.toLocaleLowerCase();
	  s2 = s2.toLocaleLowerCase();
	  next_find_i = 0;
	  next_find = s2[0];
	  match = true;
	  extra_parts = {};
	  for (_i = 0, _len = s1.length; _i < _len; _i++) {
		char = s1[_i];
		if (char !== next_find) {
		  if (extra_parts[next_find_i]) {
			extra_parts[next_find_i] += char;
		  } else {
			extra_parts[next_find_i] = char;
		  }
		} else {
		  next_find_i++;
		  next_find = s2[next_find_i];
		}
	  }
	  if (extra_parts[next_find_i]) {
		extra_parts[next_find_i] = "";
	  }
	  extra_parts = (function() {
		var _results;
		_results = [];
		for (key in extra_parts) {
		  val = extra_parts[key];
		  _results.push(val);
		}
		return _results;
	  })();
	  if (next_find_i >= s2.length) {
		return extra_parts.length + extra_parts.join("").length;
	  } else {
		return false;
	  }
	};

	Text.prototype.queryParse = function(query) {
	  var key, params, part, parts, val, _i, _len, _ref;
	  params = {};
	  parts = query.split('&');
	  for (_i = 0, _len = parts.length; _i < _len; _i++) {
		part = parts[_i];
		_ref = part.split("="), key = _ref[0], val = _ref[1];
		if (val) {
		  params[decodeURIComponent(key)] = decodeURIComponent(val);
		} else {
		  params["url"] = decodeURIComponent(key);
		  params["urls"] = params["url"].split("/");
		}
	  }
	  return params;
	};

	Text.prototype.queryEncode = function(params) {
	  var back, key, val;
	  back = [];
	  if (params.url) {
		back.push(params.url);
	  }
	  for (key in params) {
		val = params[key];
		if (!val || key === "url") {
		  continue;
		}
		back.push((encodeURIComponent(key)) + "=" + (encodeURIComponent(val)));
	  }
	  return back.join("&");
	};

	Text.prototype.highlight = function(text, search) {
	  var back, i, part, parts, _i, _len;
	  parts = text.split(RegExp(search, "i"));
	  back = [];
	  for (i = _i = 0, _len = parts.length; _i < _len; i = ++_i) {
		part = parts[i];
		back.push(part);
		if (i < parts.length - 1) {
		  back.push(h("span.highlight", {
			key: i
		  }, search));
		}
	  }
	  return back;
	};
	
	Text.prototype.sqlIn = function(values) {
      var value;
      return "(" + ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = values.length; _i < _len; _i++) {
          value = values[_i];
          _results.push("'" + value + "'");
        }
        return _results;
      })()).join(',') + ")";
    };

	return Text;

  })();

  window.is_proxy = document.location.host === "zero" || window.location.pathname === "/";

  window.marked_renderer = new MarkedRenderer();

  window.Text = new Text();

}).call(this);


/* ---- /js/utils/Time.coffee ---- */


(function() {
  var Time;

  Time = (function() {
	function Time() {}

	Time.prototype.since = function(timestamp) {
	  var back, now, secs;
	  now = +(new Date) / 1000;
	  if (timestamp > 1000000000000) {
		timestamp = timestamp / 1000;
	  }
	  secs = now - timestamp;
	  if (secs < 60) {
		back = "Just now";
	  } else if (secs < 60 * 60) {
		back = (Math.round(secs / 60)) + " minutes ago";
	  } else if (secs < 60 * 60 * 24) {
		back = (Math.round(secs / 60 / 60)) + " hours ago";
	  } else if (secs < 60 * 60 * 24 * 3) {
		back = (Math.round(secs / 60 / 60 / 24)) + " days ago";
	  } else {
		back = "on " + this.date(timestamp);
	  }
	  back = back.replace(/^1 ([a-z]+)s/, "1 $1");
	  return back;
	};

	Time.prototype.date = function(timestamp, format) {
	  var display, parts;
	  if (format == null) {
		format = "short";
	  }
	  if (timestamp > 1000000000000) {
		timestamp = timestamp / 1000;
	  }
	  parts = (new Date(timestamp * 1000)).toString().split(" ");
	  if (format === "short") {
		display = parts.slice(1, 4);
	  } else {
		display = parts.slice(1, 5);
	  }
	  return display.join(" ").replace(/( [0-9]{4})/, ",$1");
	};

	Time.prototype.timestamp = function(date) {
	  if (date == null) {
		date = "";
	  }
	  if (date === "now" || date === "") {
		return parseInt(+(new Date) / 1000);
	  } else {
		return parseInt(Date.parse(date) / 1000);
	  }
	};

	return Time;

  })();

  window.Time = new Time;

}).call(this);


/* ---- /js/utils/Uploadable.coffee ---- */


(function() {
  var Uploadable,
	__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	__hasProp = {}.hasOwnProperty;

  Uploadable = (function(_super) {
	__extends(Uploadable, _super);

	function Uploadable(_at_handleSave) {
	  this.handleSave = _at_handleSave;
	  this.render = __bind(this.render, this);
	  this.handleUploadClick = __bind(this.handleUploadClick, this);
	  this.resizeImage = __bind(this.resizeImage, this);
	  this.storeNode = __bind(this.storeNode, this);
	  this.node = null;
	  this.resize_w = 50;
	  this.resize_h = 50;
	}

	Uploadable.prototype.storeNode = function(node) {
	  return this.node = node;
	};

	Uploadable.prototype.resizeImage = function(file, width, height, cb) {
	  var image, resizer;
	  image = new Image();
	  resizer = function(i) {
		var cc, cc_ctx;
		cc = document.createElement("canvas");
		cc.width = i.width / 2;
		cc.height = i.height / 2;
		cc_ctx = cc.getContext("2d");
		cc_ctx.drawImage(i, 0, 0, cc.width, cc.height);
		return cc;
	  };
	  image.onload = (function(_this) {
		return function() {
		  var canvas, canvas_quant, ctx, image_base64uri, optimizer, quant;
		  canvas = document.createElement("canvas");
		  canvas.width = width;
		  canvas.height = height;
		  ctx = canvas.getContext("2d");
		  ctx.fillStyle = "#FFF";
		  ctx.fillRect(0, 0, canvas.width, canvas.height);
		  while (image.width > width * 2) {
			image = resizer(image);
		  }
		  ctx.drawImage(image, 0, 0, width, height);
		  quant = new RgbQuant({
			colors: 128,
			method: 1
		  });
		  quant.sample(canvas);
		  quant.palette(true);
		  canvas_quant = drawPixels(quant.reduce(canvas), width);
		  optimizer = new CanvasTool.PngEncoder(canvas_quant, {
			bitDepth: 8,
			colourType: CanvasTool.PngEncoder.ColourType.TRUECOLOR
		  });
		  image_base64uri = "data:image/png;base64," + btoa(optimizer.convert());
		  if (image_base64uri.length > 2200) {
			_this.log("PNG too large (" + image_base64uri.length + " bytes), convert to jpg instead");
			image_base64uri = canvas.toDataURL("image/jpeg", 0.8);
		  }
		  _this.log("Size: " + image_base64uri.length + " bytes");
		  return cb(image_base64uri);
		};
	  })(this);
	  image.onerror = (function(_this) {
		return function(e) {
		  _this.log("Image upload error", e);
		  return cb(null);
		};
	  })(this);
	  return image.src = URL.createObjectURL(file);
	};

	Uploadable.prototype.handleUploadClick = function(e) {
	  var input, script;
	  script = document.createElement("script");
	  script.src = "ext/js/pngencoder.js";
	  document.head.appendChild(script);
	  input = document.createElement('input');
	  input.type = "file";
	  input.addEventListener('change', (function(_this) {
		return function(e) {
		  return script.onload = _this.resizeImage(input.files[0], _this.resize_w, _this.resize_h, function(image_base64uri) {
			_this.handleSave(image_base64uri);
			return input.remove();
		  });
		};
	  })(this));
	  input.click();
	  return false;
	};

	Uploadable.prototype.render = function(body) {
	  return h("div.uploadable", h("a.icon.icon-upload", {
		href: "#Upload",
		onclick: this.handleUploadClick
	  }), body());
	};

	return Uploadable;

  })(Class);

  window.Uploadable = Uploadable;

}).call(this);


/* ---- /js/utils/ZeroFrame.coffee ---- */


(function() {
  var ZeroFrame,
	__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	__hasProp = {}.hasOwnProperty;

  ZeroFrame = (function(_super) {
	__extends(ZeroFrame, _super);

	function ZeroFrame(url) {
	  this.onCloseWebsocket = __bind(this.onCloseWebsocket, this);
	  this.onOpenWebsocket = __bind(this.onOpenWebsocket, this);
	  this.onRequest = __bind(this.onRequest, this);
	  this.onMessage = __bind(this.onMessage, this);
	  this.url = url;
	  this.waiting_cb = {};
	  this.history_state = {};
	  this.wrapper_nonce = document.location.href.replace(/.*wrapper_nonce=([A-Za-z0-9]+).*/, "$1");
	  this.connect();
	  this.next_message_id = 1;
	  this.init();
	}

	ZeroFrame.prototype.init = function() {
	  return this;
	};

	ZeroFrame.prototype.connect = function() {
	  this.target = window.parent;
	  window.addEventListener("message", this.onMessage, false);
	  this.cmd("innerReady");
	  window.addEventListener("beforeunload", (function(_this) {
		return function(e) {
		  _this.log("Save scrollTop", window.pageYOffset);
		  _this.history_state["scrollTop"] = window.pageYOffset;
		  return _this.cmd("wrapperReplaceState", [_this.history_state, null]);
		};
	  })(this));
	  return this.cmd("wrapperGetState", [], (function(_this) {
		return function(state) {
		  return _this.handleState(state);
		};
	  })(this));
	};

	ZeroFrame.prototype.handleState = function(state) {
	  if (state != null) {
		this.history_state = state;
	  }
	  this.log("Restore scrollTop", state, window.pageYOffset);
	  if (window.pageYOffset === 0 && state) {
		return window.scroll(window.pageXOffset, state.scrollTop);
	  }
	};

	ZeroFrame.prototype.onMessage = function(e) {
	  var cmd, message;
	  message = e.data;
	  cmd = message.cmd;
	  if (cmd === "response") {
		if (this.waiting_cb[message.to] != null) {
		  return this.waiting_cb[message.to](message.result);
		} else {
		  return this.log("Websocket callback not found:", message);
		}
	  } else if (cmd === "wrapperReady") {
		return this.cmd("innerReady");
	  } else if (cmd === "ping") {
		return this.response(message.id, "pong");
	  } else if (cmd === "wrapperOpenedWebsocket") {
		return this.onOpenWebsocket();
	  } else if (cmd === "wrapperClosedWebsocket") {
		return this.onCloseWebsocket();
	  } else if (cmd === "wrapperPopState") {
		this.handleState(message.params.state);
		return this.onRequest(cmd, message.params);
	  } else {
		return this.onRequest(cmd, message.params);
	  }
	};

	ZeroFrame.prototype.onRequest = function(cmd, message) {
	  return this.log("Unknown request", message);
	};

	ZeroFrame.prototype.response = function(to, result) {
	  return this.send({
		"cmd": "response",
		"to": to,
		"result": result
	  });
	};

	ZeroFrame.prototype.cmd = function(cmd, params, cb) {
	  if (params == null) {
		params = {};
	  }
	  if (cb == null) {
		cb = null;
	  }
	  return this.send({
		"cmd": cmd,
		"params": params
	  }, cb);
	};

	ZeroFrame.prototype.cmdp = function(cmd, params) {
	  var p;
	  if (params == null) {
		params = {};
	  }
	  p = new Promise();
	  this.send({
		"cmd": cmd,
		"params": params
	  }, function(res) {
		return p.resolve(res);
	  });
	  return p;
	};

	ZeroFrame.prototype.send = function(message, cb) {
	  if (cb == null) {
		cb = null;
	  }
	  message.wrapper_nonce = this.wrapper_nonce;
	  message.id = this.next_message_id;
	  this.next_message_id += 1;
	  this.target.postMessage(message, "*");
	  if (cb) {
		return this.waiting_cb[message.id] = cb;
	  }
	};

	ZeroFrame.prototype.onOpenWebsocket = function() {
	  return this.log("Websocket open");
	};

	ZeroFrame.prototype.onCloseWebsocket = function() {
	  return this.log("Websocket close");
	};

	return ZeroFrame;

  })(Class);

  window.ZeroFrame = ZeroFrame;

}).call(this);


/* ---- /js/ActivityList.coffee ---- */


(function() {
  var ActivityList,
	__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	__hasProp = {}.hasOwnProperty,
	__indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ActivityList = (function(_super) {
	__extends(ActivityList, _super);

	function ActivityList() {
	  this.update = __bind(this.update, this);
	  this.render = __bind(this.render, this);
	  this.handleMoreClick = __bind(this.handleMoreClick, this);
	  this.activities = null;
	  this.directories = [];
	  this.need_update = true;
	  this.limit = 10;
	  this.found = 0;
	  this.loading = true;
	}

	ActivityList.prototype.queryActivities = function(cb) {
	  var query, where;
      if (this.directories === "all") {
        where = "WHERE date_added > " + (Time.timestamp() - 60 * 60 * 6);
      } else {
        where = "WHERE json.directory IN " + (Text.sqlIn(this.directories));
      }
      query = "SELECT\n 'comment' AS type, json.*,\n json.site || \"/\" || post_uri AS subject, body, date_added,\n NULL AS subject_auth_address, NULL AS subject_hub, NULL AS subject_user_name\nFROM\n json\nLEFT JOIN comment USING (json_id)\n " + where + "\n\nUNION ALL\n\nSELECT\n 'post_like' AS type, json.*,\n json.site || \"/\" || post_uri AS subject, '' AS body, date_added,\n NULL AS subject_auth_address, NULL AS subject_hub, NULL AS subject_user_name\nFROM\n json\nLEFT JOIN post_like USING (json_id)\n " + where + "\n\nUNION ALL\n\nSELECT\n 'follow' AS type, json.*,\n follow.hub || \"/\" || follow.auth_address AS subject, '' AS body, date_added,\n follow.auth_address AS subject_auth_address, follow.hub AS subject_hub, follow.user_name AS subject_user_name\nFROM\n json\nLEFT JOIN follow USING (json_id)\n " + where + "\nORDER BY date_added DESC\nLIMIT " + (this.limit + 1);
      this.logStart("Update");
	  return Page.cmd("dbQuery", [
		query, {
		  directories: this.directories
		}
	  ], (function(_this) {
		return function(rows) {
		  var directories, directory, row, subject_address, _i, _len;
		  directories = [];
		  rows = (function() {
			var _i, _len, _results;
			_results = [];
			for (_i = 0, _len = rows.length; _i < _len; _i++) {
			  row = rows[_i];
			  if (row.subject) {
				_results.push(row);
			  }
			}
			return _results;
		  })();
		  for (_i = 0, _len = rows.length; _i < _len; _i++) {
			row = rows[_i];
			row.auth_address = row.directory.replace("data/users/", "");
			subject_address = row.subject.replace(/_.*/, "").replace(/.*\//, "");
			row.post_id = row.subject.replace(/.*_/, "").replace(/.*\//, "");
			row.subject_address = subject_address;
			directory = "data/users/" + subject_address;
			if (__indexOf.call(directories, directory) < 0) {
              directories.push(directory);
            }
          }
          return Page.cmd("dbQuery", [
            "SELECT * FROM json WHERE ?", {
              directory: directories
            }
          ], function(subject_rows) {
            var last_row, row_group, row_groups, subject_db, subject_row, _base, _base1, _base2, _j, _k, _l, _len1, _len2, _len3;
            subject_db = {};
            for (_j = 0, _len1 = subject_rows.length; _j < _len1; _j++) {
              subject_row = subject_rows[_j];
              subject_row.auth_address = subject_row.directory.replace("data/users/", "");
              subject_db[subject_row.auth_address] = subject_row;
            }
            for (_k = 0, _len2 = rows.length; _k < _len2; _k++) {
              row = rows[_k];
              row.subject = subject_db[row.subject_address];
              if (row.subject == null) {
                row.subject = {};
              }
              if ((_base = row.subject).auth_address == null) {
                _base.auth_address = row.subject_auth_address;
              }
              if ((_base1 = row.subject).hub == null) {
                _base1.hub = row.subject_hub;
              }
              if ((_base2 = row.subject).user_name == null) {
                _base2.user_name = row.subject_user_name;
              }
            }
            last_row = null;
            row_group = [];
            row_groups = [];
            for (_l = 0, _len3 = rows.length; _l < _len3; _l++) {
              row = rows[_l];
              if (!last_row || (row.auth_address === (last_row != null ? last_row.auth_address : void 0) && row.type === (last_row != null ? last_row.type : void 0))) {
                row_group.push(row);
              } else {
                row_groups.push(row_group);
                row_group = [row];
              }
              last_row = row;
            }
            if (row_group.length) {
              row_groups.push(row_group);
            }
            _this.found = rows.length;
			_this.logEnd("Update");
            return cb(row_groups);
          });
        };
      })(this));
    };

	ActivityList.prototype.handleMoreClick = function() {
	  this.limit += 20;
	  this.update(0);
	  return false;
	};

	ActivityList.prototype.renderActivity = function(activity_group) {
      var activity, activity_user_link, back, body, now, subject_post_link, subject_user_link, _i, _len;
      back = [];
	  now = Time.timestamp();
      for (_i = 0, _len = activity_group.length; _i < _len; _i++) {
        activity = activity_group[_i];
        if (!activity.subject.user_name) {
          continue;
        }
        activity_user_link = "?Profile/" + activity.hub + "/" + activity.auth_address + "/" + activity.cert_user_id;
        subject_user_link = "?Profile/" + activity.subject.hub + "/" + activity.subject.auth_address + "/" + (activity.subject.cert_user_id || '');
        subject_post_link = "?Post/" + activity.subject.hub + "/" + activity.subject.auth_address + "/" + activity.post_id;
        if (activity.type === "post_like") {
          body = [
            h("a.link", {
              href: activity_user_link,
              onclick: this.Page.handleLinkClick
            }, activity.user_name), " liked ", h("a.link", {
              href: subject_user_link,
              onclick: this.Page.handleLinkClick
            }, activity.subject.user_name), "'s ", h("a.link", {
              href: subject_post_link,
              onclick: this.Page.handleLinkClick
            }, "post")
          ];
        } else if (activity.type === "comment") {
          body = [
            h("a.link", {
              href: activity_user_link,
              onclick: this.Page.handleLinkClick
            }, activity.user_name), " commented on ", h("a.link", {
              href: subject_user_link,
              onclick: this.Page.handleLinkClick
            }, activity.subject.user_name), "'s ", h("a.link", {
              href: subject_post_link,
              onclick: this.Page.handleLinkClick
            }, "post"), ": " + activity.body
          ];
        } else if (activity.type === "follow") {
          body = [
            h("a.link", {
              href: activity_user_link,
              onclick: this.Page.handleLinkClick
            }, activity.user_name), " started following ", h("a.link", {
              href: subject_user_link,
              onclick: this.Page.handleLinkClick
            }, activity.subject.user_name)
          ];
        } else {
          body = activity.body;
        }
        back.push(h("div.activity", {
          key: activity.cert_user_id + "_" + activity.date_added,
          title: Time.since(activity.date_added),
		  classes: {
            latest: now - activity.date_added < 600
          },
          enterAnimation: Animation.slideDown,
          exitAnimation: Animation.slideUp
        }, [h("div.circle"), h("div.body", body)]));
      }
      return back;
    };

	ActivityList.prototype.render = function() {
	  if (this.need_update) {
        this.queryActivities((function(_this) {
          return function(res) {
            _this.activities = res;
            _this.need_update = false;
            return Page.projector.scheduleRender();
          };
        })(this));
	  }
	  if (this.activities === null) {
		return null;
	  }
	  return h("div.activity-list", [
		this.activities.length > 0 ? h("h2", {
		  enterAnimation: Animation.slideDown,
		  exitAnimation: Animation.slideUp
		}, "Activity feed") : void 0, h("div.items", [h("div.bg-line"), this.activities.slice(0, +(this.limit - 1) + 1 || 9e9).map(this.renderActivity)]), this.found > this.limit ? h("a.more.small", {
          href: "#More",
		  onclick: this.handleMoreClick,
		  enterAnimation: Animation.slideDown,
		  exitAnimation: Animation.slideUp
		}, "Show more...") : void 0
	  ]);
	};
	
	ActivityList.prototype.update = function(delay) {
      if (delay == null) {
        delay = 600;
      }
      return setTimeout(((function(_this) {
        return function() {
          _this.need_update = true;
          return Page.projector.scheduleRender();
        };
      })(this)), delay);
    };
	
	return ActivityList;

  })(Class);

  window.ActivityList = ActivityList;

}).call(this);


/* ---- /js/AnonUser.coffee ---- */


(function() {
  var AnonUser,
	__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	__hasProp = {}.hasOwnProperty;

  AnonUser = (function(_super) {
	__extends(AnonUser, _super);

	function AnonUser() {
	  this.save = __bind(this.save, this);
	  this.updateInfo = __bind(this.updateInfo, this);
	  this.auth_address = null;
	  this.hub = null;
	  this.followed_users = {};
	  this.likes = {};
	}

	AnonUser.prototype.updateInfo = function(cb) {
	  if (cb == null) {
		cb = null;
	  }
	  return Page.on_local_storage.then((function(_this) {
		return function() {
		  _this.followed_users = Page.local_storage.followed_users;
		  return typeof cb === "function" ? cb(true) : void 0;
		};
	  })(this));
	};

	AnonUser.prototype.like = function(site, post_uri, cb) {
	  if (cb == null) {
		cb = null;
	  }
	  Page.cmd("wrapperNotification", ["info", "You need a profile for this feature"]);
	  return cb(true);
	};

	AnonUser.prototype.dislike = function(site, post_uri, cb) {
	  if (cb == null) {
		cb = null;
	  }
	  Page.cmd("wrapperNotification", ["info", "You need a profile for this feature"]);
	  return cb(true);
	};

	AnonUser.prototype.followUser = function(hub, auth_address, user_name, cb) {
	  if (cb == null) {
		cb = null;
	  }
	  this.followed_users[hub + "/" + auth_address] = true;
	  this.save(cb);
	  Page.needSite(hub);
	  return Page.content.update();
	};

	AnonUser.prototype.unfollowUser = function(hub, auth_address, cb) {
	  if (cb == null) {
		cb = null;
	  }
	  delete this.followed_users[hub + "/" + auth_address];
	  this.save(cb);
	  return Page.content.update();
	};

	AnonUser.prototype.comment = function(site, post_uri, body, cb) {
	  if (cb == null) {
		cb = null;
	  }
	  Page.cmd("wrapperNotification", ["info", "You need a profile for this feature"]);
	  return typeof cb === "function" ? cb(false) : void 0;
	};

	AnonUser.prototype.save = function(cb) {
	  if (cb == null) {
		cb = null;
	  }
	  return Page.saveLocalStorage(cb);
	};

	return AnonUser;

  })(Class);

  window.AnonUser = AnonUser;

}).call(this);


/* ---- /js/ContentCreateProfile.coffee ---- */


(function() {
  var ContentCreateProfile,
	__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	__hasProp = {}.hasOwnProperty;

  ContentCreateProfile = (function(_super) {
	__extends(ContentCreateProfile, _super);

	function ContentCreateProfile() {
	  this.update = __bind(this.update, this);
	  this.render = __bind(this.render, this);
	  this.renderDefaultHubs = __bind(this.renderDefaultHubs, this);
	  this.renderSeededHubs = __bind(this.renderSeededHubs, this);
	  this.renderHub = __bind(this.renderHub, this);
	  this.updateHubs = __bind(this.updateHubs, this);
	  this.handleJoinClick = __bind(this.handleJoinClick, this);
	  this.handleDownloadClick = __bind(this.handleDownloadClick, this);
	  this.loaded = true;
	  this.hubs = [];
	  this.default_hubs = [];
	  this.need_update = true;
	  this.creation_status = [];
	  this.downloading = {};
	}

	ContentCreateProfile.prototype.handleDownloadClick = function(e) {
	  var hub;
	  hub = e.target.attributes.address.value;
	  this.downloading[hub] = true;
	  Page.needSite(hub, (function(_this) {
		return function() {
		  return _this.update();
		};
	  })(this));
	  return false;
	};

	ContentCreateProfile.prototype.handleJoinClick = function(e) {
	  var hub, user;
	  hub = e.target.attributes.address.value;
	  user = new User({
		hub: hub,
		auth_address: Page.site_info.auth_address
	  });
	  this.creation_status.push("Checking user on selected hub...");
	  Page.cmd("fileGet", {
		"inner_path": user.getPath() + "/data.json",
		"required": false
	  }, (function(_this) {
		return function(found) {
		  var data, user_name;
		  if (found) {
			Page.cmd("wrapperNotification", ["error", "User " + Page.site_info.cert_user_id + " already exists on this hub"]);
			_this.creation_status = [];
			return;
		  }
		  user_name = Page.site_info.cert_user_id.replace(/@.*/, "");
		  data = user.getDefaultData();
		  data.avatar = "generate";
		  data.user_name = user_name.charAt(0).toUpperCase() + user_name.slice(1);
		  data.hub = hub;
		  _this.creation_status.push("Creating new profile...");
		  return user.save(data, hub, function() {
			_this.creation_status = [];
			Page.checkUser();
			return Page.setUrl("?Home");
		  });
		};
	  })(this));
	  return false;
	};

	ContentCreateProfile.prototype.updateHubs = function() {
	  return Page.cmd("mergerSiteList", true, (function(_this) {
		return function(sites) {
		  var address, content, _ref, _results;
		  
		  // count users
		  Page.cmd("dbQuery", "SELECT * FROM json", function(users) {
			var address, hubs, site, site_users, user, _i, _len, _name;
			site_users = {};
			for (_i = 0, _len = users.length; _i < _len; _i++) {
			  user = users[_i];
			  if (site_users[_name = user.hub] == null) {
				site_users[_name] = [];
			  }
			  site_users[user.hub].push(user);
			}
			hubs = [];
			for (address in sites) {
			  site = sites[address];
			  if (address === Page.userdb) {
				continue;
			  }
			  site["users"] = site_users[site.address] || [];
			  hubs.push(site);
			}
			_this.hubs = hubs;
			return Page.projector.scheduleRender();
		  });
		  _this.default_hubs = [];
		  _ref = Page.site_info.content.settings.default_hubs;
		  _results = [];
		  for (address in _ref) {
			content = _ref[address];
			if (!sites[address] && !_this.downloading[address]) {
			  _results.push(_this.default_hubs.push({
				users: [],
				address: address,
				content: content,
				type: "available"
			  }));
			} else {
			  _results.push(void 0);
			}
		  }
		  return _results;
		};
	  })(this));
	};

	ContentCreateProfile.prototype.renderHub = function(hub) {
	  var rendered;
      rendered = 0;
	  return h("div.hub.card", {
		key: hub.address + hub.type,
		enterAnimation: Animation.slideDown,
		exitAnimation: Animation.slideUp
	  }, [
		hub.type === "available" ? h("a.button.button-join", {
		  href: "#Download:" + hub.address,
		  address: hub.address,
		  onclick: this.handleDownloadClick
		}, "Download") : h("a.button.button-join", {
		  href: "#Join:" + hub.address,
		  address: hub.address,
		  onclick: this.handleJoinClick
		}, "Join!"), h("div.avatars", [
		  hub.users.map((function(_this) {
            return function(user) {
              var avatar, _ref;
              if (((_ref = user.avatar) !== "jpg" && _ref !== "png") || rendered >= 4) {
                return "";
              }
              avatar = "merged-space/" + hub.address + "/" + user.directory + "/avatar." + user.avatar;
              rendered += 1;
              return h("a.avatar", {
                title: user.user_name,
                style: "background-image: url('" + avatar + "')"
              });
            };
          })(this)), hub.users.length - rendered > 0 ? h("a.avatar.empty", "+" + (hub.users.length - rendered)) : void 0
        ]), h("div.name", hub.content.title), h("div.intro", hub.content.description)
      ]);
    };

	ContentCreateProfile.prototype.renderSeededHubs = function() {
	  return h("div.hubs.hubs-seeded", this.hubs.map(this.renderHub));
	};

	ContentCreateProfile.prototype.renderDefaultHubs = function() {
	  return h("div.hubs.hubs-default", this.default_hubs.map(this.renderHub));
	};

	ContentCreateProfile.prototype.handleSelectUserClick = function() {
	  Page.cmd("certSelect", {
		"accepted_domains": ["zeroid.bit"],
		"accept_any": true
	  });
	  return false;
	};

	ContentCreateProfile.prototype.render = function() {
	  var _ref;
	  if (this.loaded && !Page.on_loaded.resolved) {
		Page.on_loaded.resolve();
	  }
	  if (this.need_update) {
		this.updateHubs();
		this.need_update = false;
	  }
	  return h("div#Content.center.content-signup", [
		h("h1", "Hub Space"), h("a.button.button-submit.button-certselect.certselect", {
		  href: "#Select+user",
		  onclick: this.handleSelectUserClick
		}, [h("div.icon.icon-profile"), ((_ref = Page.site_info) != null ? _ref.cert_user_id : void 0) ? "As: " + Page.site_info.cert_user_id : "Select ID..."]), this.creation_status.length > 0 ? h("div.creation-status", {
		  enterAnimation: Animation.slideDown,
		  exitAnimation: Animation.slideUp
		}, [
		  this.creation_status.map((function(_this) {
			return function(creation_status) {
			  return h("h3", {
				key: creation_status,
				enterAnimation: Animation.slideDown,
				exitAnimation: Animation.slideUp
			  }, creation_status);
			};
		  })(this))
		]) : Page.site_info.cert_user_id ? h("div.hubs", {
		  enterAnimation: Animation.slideDown,
		  exitAnimation: Animation.slideUp
		}, [
		  this.hubs.length ? h("div.hubselect.seeded", {
			enterAnimation: Animation.slideDown,
			exitAnimation: Animation.slideUp
		  }, [h("h2", "Seeded HUBs"), this.renderSeededHubs()]) : void 0, this.default_hubs.length ? h("div.hubselect.default", {
			enterAnimation: Animation.slideDown,
			exitAnimation: Animation.slideUp
		  }, [h("h2", "Available HUBs"), this.renderDefaultHubs()]) : void 0, h("h5", "(With this you choose where is your profile stored. There is no difference on content and you will able to reach all users from any hub)")
        ]) : void 0
	  ]);
	};

	ContentCreateProfile.prototype.update = function() {
	  this.need_update = true;
	  return Page.projector.scheduleRender();
	};

	return ContentCreateProfile;

  })(Class);

  window.ContentCreateProfile = ContentCreateProfile;

}).call(this);


/* ---- /js/ContentFeed.coffee ---- */


(function() {
  var ContentFeed,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __hasProp = {}.hasOwnProperty;

  ContentFeed = (function(_super) {
    __extends(ContentFeed, _super);

    function ContentFeed() {
      this.update = __bind(this.update, this);
      this.render = __bind(this.render, this);
      this.handleListTypeClick = __bind(this.handleListTypeClick, this);
      this.post_create = new PostCreate();
      this.post_list = new PostList();
      this.activity_list = new ActivityList();
      this.user_list = new UserList();
      this.need_update = true;
      this.type = "followed";
      this.update();
    }

    ContentFeed.prototype.handleListTypeClick = function(e) {
      this.type = e.currentTarget.attributes.type.value;
      this.update();
      return false;
    };

    ContentFeed.prototype.render = function() {
      var followed, key;
      if (this.post_list.loaded && !Page.on_loaded.resolved) {
        Page.on_loaded.resolve();
      }
      if (this.need_update) {
        this.log("Updating");
        this.need_update = false;
        this.user_list.need_update = true;
        if (this.type === "followed") {
          this.post_list.directories = (function() {
            var _ref, _results;
            _ref = Page.user.followed_users;
            _results = [];
            for (key in _ref) {
              followed = _ref[key];
              _results.push("data/users/" + (key.split('/')[1]));
            }
            return _results;
          })();
          if (Page.user.hub) {
            this.post_list.directories.push("data/users/" + Page.user.auth_address);
          }
        } else {
          this.post_list.directories = "all";
        }
        this.post_list.need_update = true;
        if (this.type === "followed") {
          this.activity_list.directories = (function() {
            var _ref, _results;
            _ref = Page.user.followed_users;
            _results = [];
            for (key in _ref) {
              followed = _ref[key];
              _results.push("data/users/" + (key.split('/')[1]));
            }
            return _results;
          })();
        } else {
          this.activity_list.directories = "all";
        }
        this.activity_list.update();
      }
      return h("div#Content.center", [
        h("div.col-left", [
		  this.user_list.users.length > 0 ? h("div#View-user-list-button", [
	// checking..
	//	   this.user_list_recent === undefined ? h("h3", this.user_list_recent, [
		    h("a.button", { href: "?Users", onclick: Page.handleLinkClick }, "View All \u203A") 
	//	   ]) : void 0,
		  ]) : void 0, this.user_list.render(".gray")
        ]), h("div.col-center", [
          this.post_create.render(), h("div.post-list-type", h("a.link", {
            href: "#Everyone",
            onclick: this.handleListTypeClick,
            type: "everyone",
            classes: {
              active: this.type === "everyone"
            }
          }, "Everyone"), h("a.link", {
            href: "#Followed+users",
            onclick: this.handleListTypeClick,
            type: "followed",
            classes: {
              active: this.type === "followed"
            }
          }, "Followed users")), this.post_list.render()
        ]), h("div.col-right", [
          this.activity_list.render()
		])
	  ]);
	};

	ContentFeed.prototype.update = function() {
	  this.need_update = true;
	  return Page.projector.scheduleRender();
	};

	return ContentFeed;

  })(Class);

  window.ContentFeed = ContentFeed;

}).call(this);


/* ---- /js/ContentProfile.coffee ---- */


(function() {
  var ContentProfile,
	__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	__hasProp = {}.hasOwnProperty;

  ContentProfile = (function(_super) {
	__extends(ContentProfile, _super);

	function ContentProfile() {
	  this.update = __bind(this.update, this);
	  this.render = __bind(this.render, this);
	  this.handleAvatarUpload = __bind(this.handleAvatarUpload, this);
	  this.handleUserNameSave = __bind(this.handleUserNameSave, this);
	  this.handleIntroSave = __bind(this.handleIntroSave, this);
	  this.filter = __bind(this.filter, this);
	  this.setUser = __bind(this.setUser, this);
	  this.renderNotSeeded = __bind(this.renderNotSeeded, this);
	  this.post_list = null;
	  this.activity_list = null;
	  this.user_list = null;
	  this.auth_address = null;
	  this.user = new User();
	  this.activity_list = new ActivityList();
	  this.owned = false;
	  this.need_update = true;
	  this.filter_post_id = null;
	  this.loaded = false;
	}
	
	ContentProfile.prototype.renderNotSeeded = function() {
	  return h("div#Content.center." + this.auth_address, [
		h("div.col-left", [
		  h("div.users", [
			h("div.user.card.profile", [
			  this.user.renderAvatar(), h("a.name.link", {
				href: this.user.getLink(),
				style: "color: " + (Text.toColor(this.user.row.auth_address)),
				onclick: Page.handleLinkClick
			  }, this.user.row.user_name), h("div.cert_user_id", this.user.row.cert_user_id), h("div.intro-full", this.user.row.intro), h("div.follow-container", [
				h("a.button.button-follow-big", {
				  href: "#",
				  onclick: this.user.handleFollowClick,
				  classes: {
					loading: this.user.submitting_follow
				  }
				}, h("span.icon-follow", "+"), this.user.isFollowed() ? "Unfollow" : "Follow")
			  ])
			])
		  ])
		]),
		h("div.col-center", { style: "padding-top: 30px; text-align: center" }, [
		  h("h1", "Download profile site"), h("h2", "User's profile site not loaded to your client yet."), h("a.button.submit", {
			href: "#Add+site",
			onclick: this.user.handleDownloadClick
		  }, "Download user's site")
		])
	  ]);
	};

	ContentProfile.prototype.setUser = function(_at_hub, _at_auth_address) {
	  this.hub = _at_hub;
	  this.auth_address = _at_auth_address;
	  this.log("setUser", this.hub, this.auth_address);
	  if (!this.post_list || this.post_list.directories[0] !== "data/users/" + this.auth_address) {
		this.post_list = new PostList();
		this.activity_list = new ActivityList();
		this.user_list = new UserList();
		this.user = new User();
		this.post_list.directories = ["data/users/" + this.auth_address];
		this.user_list.followed_by = this.user;
		this.user_list.limit = 50;
		this.need_update = true;
      }
      return this;
    };

    ContentProfile.prototype.filter = function(post_id) {
	  this.log("Filter", post_id);
	  this.filter_post_id = post_id;
	  return this.need_update = true;
	};

	ContentProfile.prototype.handleIntroSave = function(intro, cb) {
	  this.user.row.intro = intro;
	  return this.user.getData(this.user.hub, (function(_this) {
		return function(data) {
		  data.intro = intro;
		  return _this.user.save(data, _this.user.hub, function(res) {
			cb(res);
			return _this.update();
		  });
		};
	  })(this));
	};

	ContentProfile.prototype.handleUserNameSave = function(user_name, cb) {
	  this.user.row.user_name = user_name;
	  return this.user.getData(this.user.hub, (function(_this) {
		return function(data) {
		  data.user_name = user_name;
		  return _this.user.save(data, _this.user.hub, function(res) {
			cb(res);
			return _this.update();
		  });
		};
	  })(this));
	};

	ContentProfile.prototype.handleAvatarUpload = function(image_base64uri) {
	  var ext, image_base64;
	  Page.cmd("fileDelete", this.user.getPath() + "/avatar.jpg");
	  Page.cmd("fileDelete", this.user.getPath() + "/avatar.png");
	  if (!image_base64uri) {
		this.user.getData(this.user.hub, (function(_this) {
		  return function(data) {
			data.avatar = "generate";
			return _this.user.save(data, _this.user.hub, function(res) {
			  return Page.cmd("wrapperReload");
			});
		  };
		})(this));
		return false;
	  }
	  image_base64 = image_base64uri != null ? image_base64uri.replace(/.*?,/, "") : void 0;
	  ext = image_base64uri.match("image/([a-z]+)")[1];
	  if (ext === "jpeg") {
		ext = "jpg";
	  }
	  return Page.cmd("fileWrite", [this.user.getPath() + "/avatar." + ext, image_base64], (function(_this) {
		return function(res) {
		  return _this.user.getData(_this.user.hub, function(data) {
			data.avatar = ext;
			return _this.user.save(data, _this.user.hub, function(res) {
			  return Page.cmd("wrapperReload");
			});
		  });
		};
	  })(this));
	};

	ContentProfile.prototype.render = function() {
      var _ref, _ref1, _ref2, _ref3;
      if (this.need_update) {
        this.log("Updating");
        this.need_update = false;
		this.post_list.filter_post_id = this.filter_post_id;
        if ((_ref = this.post_list) != null) {
          _ref.need_update = true;
        }
        if ((_ref1 = this.user_list) != null) {
          _ref1.need_update = true;
        }
        if ((_ref2 = this.activity_list) != null) {
          _ref2.need_update = true;
        }
        this.activity_list.directories = ["data/users/" + this.auth_address];
        this.user.get(this.hub, this.auth_address, (function(_this) {
          return function() {
            var _ref3;
            _this.owned = _this.user.auth_address === ((_ref3 = Page.user) != null ? _ref3.auth_address : void 0);
            if (_this.owned && !_this.editable_intro) {
              _this.editable_intro = new Editable("div", _this.handleIntroSave);
              _this.editable_intro.render_function = Text.renderMarked;
              _this.editable_user_name = new Editable("span", _this.handleUserNameSave);
              _this.uploadable_avatar = new Uploadable(_this.handleAvatarUpload);
            }
            Page.projector.scheduleRender();
            return _this.loaded = true;
          };
        })(this));
        if (!Page.merged_sites[this.hub]) {
          Page.queryUserdb(this.auth_address, (function(_this) {
            return function(row) {
              _this.user.setRow(row);
              Page.projector.scheduleRender();
              return _this.loaded = true;
            };
          })(this));
        }
      }
      if (!((_ref3 = this.user) != null ? _ref3.row : void 0)) {
        return h("div#Content.center." + this.auth_address, []);
      }
      if (!Page.merged_sites[this.hub]) {
        return this.renderNotSeeded();
      }
      if (this.post_list.loaded && !Page.on_loaded.resolved) {
        Page.on_loaded.resolve();
      }
      
      // ===== Followers by Bot ==================================================================================================
	  
	  this.logStart("Loading Followers");
	  
      if (this.user.row.user_name) {
		
        query = "SELECT json.user_name FROM follow LEFT JOIN json USING (json_id) WHERE follow.user_name = '" + this.user.row.user_name + "'";
        Page.cmd("dbQuery", query, (function(__this) {
         return function(res) {
		  var _row, _i, _len, _names;
		  __this.users_followers_names = {}; // follower names
		  window.followers_total = res.length;
		  window.follower_names = "";
		  for (_i = 0, _len = res.length; _i < _len; _i++) {
			_row = res[_i];
			__this.users_followers_names[_i] = _row.user_name; // alert(row.user_name);
			window.follower_names += _row.user_name.substring(0,15) + " , "; // max 15 chars
		  }
		 };
	   })(this));
	   
	 } else  { window.follower_names = "unknown"; window.followers_total = "?"; }
	  
      // =========================================================================================================================
	  
	  // pending (make followers panel, top followers list, etc)
	  // h("div#Content.center", h("br") , h("br") , [h("h1#Spacer", "Total members: " + window.totalMembers), h("div.users.cards", [this.user_list_recent.render("card") ]) ]);
      
      // Follower button
      return h("div#Content.center." + this.auth_address, [
	    h("div.followers", [
		  h("div#Content.center", [
		    h("a.button.button-follow-big", {
              href: "#",
			  title: window.follower_names,
			}, h("span.icon-follow", " Followers:"), window.followers_total + "!" )
    	  ])
        ]), h("div.col-left", {
		  classes: {
            faded: this.filter_post_id
          }
        }, [
          h("div.users", [
            h("div.user.card.profile", {
              classes: {
				  followed: this.user.isFollowed() 
			  }
            }, [
              this.owned ? this.uploadable_avatar.render(this.user.renderAvatar) : this.user.renderAvatar(), h("span.name.link", {
                style: "color: " + (Text.toColor(this.user.row.auth_address))
              }, this.owned ? this.editable_user_name.render(this.user.row.user_name) : h("a", {
                href: this.user.getLink(),
                onclick: Page.handleLinkClick
              }, this.user.row.user_name)), h("div.cert_user_id", this.user.row.cert_user_id), this.owned ? h("div.intro-full", this.editable_intro.render(this.user.row.intro)) : h("div.intro-full", {
                innerHTML: Text.renderMarked(this.user.row.intro)
              }), h("div.follow-container", [
                h("a.button.button-follow-big", {
                  href: "#",
                  onclick: this.user.handleFollowClick,
                  classes: {
                    loading: this.user.submitting_follow
                  }
                }, h("span.icon-follow", "+"), this.user.isFollowed() ? "Unfollow" : "Follow")
              ])
            ])
          ]), this.user_list.users.length > 0 ? h("h2.sep", {
            afterCreate: Animation.show
          }, "Following: " + this.user_list.users.length ) : void 0 , this.user_list.render(".gray")
        ]), h("div.col-center", [
		   this.post_list.render()
        ]), h("div.col-right-profile", [
		   this.activity_list.render()
		])
      ]);
    };
	
	ContentProfile.prototype.update = function() {
	  if (!this.auth_address) {
		return;
	  }
	  this.need_update = true;
	  return Page.projector.scheduleRender();
	};

	return ContentProfile;

  })(Class);

  window.ContentProfile = ContentProfile;

}).call(this);


/* ---- /js/ContentUsers.coffee ---- */


(function() {
  var ContentUsers,
	__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	__hasProp = {}.hasOwnProperty;

  ContentUsers = (function(_super) {
	__extends(ContentUsers, _super);

	function ContentUsers() {
	  this.update = __bind(this.update, this);
	  this.render = __bind(this.render, this);
	  this.user_list_recent = new UserList("recent");
	  this.user_list_recent.limit = 2000;
	  this.loaded = true;
	  this.need_update = false;
	}

	ContentUsers.prototype.render = function() {
	  var _ref;
	  if (this.loaded && !Page.on_loaded.resolved) {
		Page.on_loaded.resolve();
	  }
	  if (this.need_update) {
		this.log("Updating");
		this.need_update = false;
		if ((_ref = this.user_list_recent) != null) {
		  _ref.need_update = true;
		}
	  }
	  
	  // if (!window.totalMembers) { window.totalMembers = ""; }
	  return h("div#Content.center", h("br") , h("br") , [h("h1#Spacer", "Total members: " + this.user_list_recent.users.length), 
	    h("div.users.cards", [this.user_list_recent.render("card") ])
	  ]);
	  
	  
	  /*
	  return h("div#Content.center", [
        h("h2", "New users in ZeroMe"), h("div.users.cards", [this.user_list_recent.render("card")]), this.user_list_recent.users.length ? h("h5", {
          style: "text-align: center"
        }, "Total: " + this.user_list_recent.users.length + " registered users") : void 0
      ]);
	  */
	  
	  
	  /*
				h("a.more", {href: "#"}, "Show more..."),
				h("h2", "Followed users"),
				h("div.users.cards", [
					h("div.user.card", [
						h("a.button.button-follow", {href: "#"}, "+"),
						h("a.avatar", {href: "#", style: "background-image: url('img/1.png')"}),
						h("a.name.link", {href: "#"}, "Nofish"),
						h("div.intro", "ZeroNet developer")
					])
				]),
			])
	   */
	};
	
	ContentUsers.prototype.update = function() {
	  this.need_update = true;
	  return Page.projector.scheduleRender();
	};

	return ContentUsers;

  })(Class);

  window.ContentUsers = ContentUsers;

}).call(this);


/* ---- /js/Head.coffee ---- */


(function() {
  var Head,
	__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	__hasProp = {}.hasOwnProperty,
	__indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Head = (function(_super) {
	__extends(Head, _super);

	function Head() {
	  this.render = __bind(this.render, this);
	  this.renderSettings = __bind(this.renderSettings, this);
	  return Head.__super__.constructor.apply(this, arguments);
	}

	Head.prototype.handleSelectUserClick = function() {
	  if (__indexOf.call(Page.site_info.settings.permissions, "Merger:Space") < 0) {
		Page.cmd("wrapperPermissionAdd", "Merger:Space", (function(_this) {
		  return function() {
			return Page.updateSiteInfo(function() {
			  return Page.content.update();
			});
		  };
		})(this));
	  } else {
		Page.cmd("certSelect", {
		  "accepted_domains": ["zeroid.bit"],
		  "accept_any": true
		});
	  }
	  return false;
	};

	Head.prototype.renderSettings = function() {
	  return "";
	};
	
	Head.prototype.render = function() {
	  var _ref, _ref1, _ref2, _ref3;
	  return h("div.head.center", [
		h("a.logo", {
		  href: "?Home",
		  title: "Home",
		  onclick: Page.handleLinkClick
		}, h("img", { src: "img/Infinite.png"
		})), ((_ref = Page.user) != null ? _ref.hub : void 0) ? h("div.right.authenticated", [
		  h("div.user", h("a.name.link", {
			href: Page.user.getLink(),
			onclick: Page.handleLinkClick
		  }, Page.user.row.user_name), h("a.address", {
			href: "#Select+user",
			onclick: this.handleSelectUserClick
		  }, Page.site_info.cert_user_id)), this.renderSettings()
		]) : !((_ref1 = Page.user) != null ? _ref1.hub : void 0) && ((_ref2 = Page.site_info) != null ? _ref2.cert_user_id : void 0) ? h("div.right.selected", [
		  h("div.user", h("a.name.link", {
			href: "?Create+profile",
			onclick: Page.handleLinkClick
		  }, "Create profile"), h("a.address", {
			href: "#Select+user",
			onclick: this.handleSelectUserClick
		  }, Page.site_info.cert_user_id)), this.renderSettings()
		]) : !((_ref3 = Page.user) != null ? _ref3.hub : void 0) && Page.site_info ? h("div.right.unknown", [
		  h("div.user", h("a.name.link", {
			href: "#Select+user",
			onclick: this.handleSelectUserClick
		  }, "Visitor"), h("a.address", {
			href: "#Select+user",
			onclick: this.handleSelectUserClick
		  }, "Select your account")), this.renderSettings()
		]) : h("div.right.unknown")
	  ]);
	};

	return Head;

  })(Class);

  window.Head = Head;

}).call(this);



/* ---- /js/Post.coffee ---- */


(function() {
  var Post,
	__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	__hasProp = {}.hasOwnProperty;

  Post = (function(_super) {
	__extends(Post, _super);

	function Post(row, _at_item_list) {
	  this.item_list = _at_item_list;
	  this.render = __bind(this.render, this);
	  this.renderComments = __bind(this.renderComments, this);
	  this.handleReplyClick = __bind(this.handleReplyClick, this);
	  this.handleMoreCommentsClick = __bind(this.handleMoreCommentsClick, this);
	  this.handleCommentDelete = __bind(this.handleCommentDelete, this);
	  this.handleCommentSave = __bind(this.handleCommentSave, this);
	  this.handleCommentSubmit = __bind(this.handleCommentSubmit, this);
	  this.handleCommentClick = __bind(this.handleCommentClick, this);
	  this.handleLikeClick = __bind(this.handleLikeClick, this);
	  this.handlePostDelete = __bind(this.handlePostDelete, this);
	  this.handlePostSave = __bind(this.handlePostSave, this);
	  this.liked = false;
	  this.commenting = false;
	  this.submitting_like = false;
	  this.owned = false;
	  this.editable_comments = {};
	  this.field_comment = new Autosize({
		placeholder: "Add your comment",
		onsubmit: this.handleCommentSubmit
	  });
	  this.comment_limit = 3;
	  this.setRow(row);
	}

	Post.prototype.setRow = function(row) {
	  var _ref;
	  this.row = row;
	  if (Page.user) {
		this.liked = Page.user.likes[this.row.key];
	  }
	  this.user = new User({
		hub: row.site,
		auth_address: row.directory.replace("data/users/", "")
	  });
	  this.user.row = row;
	  this.owned = this.user.auth_address === ((_ref = Page.user) != null ? _ref.auth_address : void 0);
	  if (this.owned) {
		this.editable_body = new Editable("div.body", this.handlePostSave, this.handlePostDelete);
		return this.editable_body.render_function = Text.renderMarked;
	  }
	};
	
	Post.prototype.getLink = function() {
      return "?Post/" + this.user.hub + "/" + this.user.auth_address + "/" + this.row.post_id;
    };
	
	Post.prototype.handlePostSave = function(body, cb) {
	  return Page.user.getData(Page.user.hub, (function(_this) {
		return function(data) {
		  var i, post, post_index, _i, _len, _ref;
		  _ref = data.post;
		  for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
			post = _ref[i];
			if (post.post_id === _this.row.post_id) {
			  post_index = i;
			}
		  }
		  data.post[post_index].body = body;
		  return Page.user.save(data, Page.user.hub, function(res) {
			return cb(res);
		  });
		};
	  })(this));
	};

	Post.prototype.handlePostDelete = function(cb) {
	  return Page.user.getData(Page.user.hub, (function(_this) {
		return function(data) {
		  var i, post, post_index, _i, _len, _ref;
		  _ref = data.post;
		  for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
			post = _ref[i];
			if (post.post_id === _this.row.post_id) {
			  post_index = i;
			}
		  }
		  data.post.splice(post_index, 1);
		  return Page.user.save(data, Page.user.hub, function(res) {
			return cb(res);
		  });
		};
	  })(this));
	};

	Post.prototype.handleLikeClick = function(e) {
	  var post_uri, site, _ref;
	  this.submitting_like = true;
	  _ref = this.row.key.split("-"), site = _ref[0], post_uri = _ref[1];
	  if (Page.user.likes[post_uri]) {
		Animation.flashOut(e.currentTarget.firstChild);
		Page.user.dislike(site, post_uri, (function(_this) {
		  return function() {
			return _this.submitting_like = false;
		  };
		})(this));
	  } else {
		Animation.flashIn(e.currentTarget.firstChild);
		Page.user.like(site, post_uri, (function(_this) {
		  return function() {
			return _this.submitting_like = false;
		  };
		})(this));
	  }
	  return false;
	};

	Post.prototype.handleCommentClick = function() {
	  if (this.field_comment.node) {
		this.field_comment.node.focus();
	  } else {
		this.commenting = true;
		setTimeout(((function(_this) {
		  return function() {
			return _this.field_comment.node.focus();
		  };
		})(this)), 600);
	  }
	  return false;
	};

	Post.prototype.handleCommentSubmit = function() {
	  var post_uri, site, timer_loading, _ref;
	  timer_loading = setTimeout(((function(_this) {
		return function() {
		  return _this.field_comment.loading = true;
		};
	  })(this)), 100);
	  _ref = this.row.key.split("-"), site = _ref[0], post_uri = _ref[1];
	  return Page.user.comment(site, post_uri, this.field_comment.attrs.value, (function(_this) {
		return function(res) {
		  clearInterval(timer_loading);
		  _this.field_comment.loading = false;
		  if (res) {
			return _this.field_comment.setValue("");
		  }
		};
	  })(this));
	};

	Post.prototype.handleCommentSave = function(comment_id, body, cb) {
      return Page.user.getData(this.row.site, (function(_this) {
        return function(data) {
          var comment, comment_index, i, _i, _len, _ref;
          _ref = data.comment;
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            comment = _ref[i];
            if (comment.comment_id === comment_id) {
              comment_index = i;
            }
          }
          data.comment[comment_index].body = body;
          return Page.user.save(data, _this.row.site, function(res) {
            return cb(res);
          });
        };
      })(this));
    };

    Post.prototype.handleCommentDelete = function(comment_id, cb) {
      return Page.user.getData(this.row.site, (function(_this) {
        return function(data) {
          var comment, comment_index, i, _i, _len, _ref;
          _ref = data.comment;
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            comment = _ref[i];
            if (comment.comment_id === comment_id) {
              comment_index = i;
            }
          }
          data.comment.splice(comment_index, 1);
          return Page.user.save(data, _this.row.site, function(res) {
            return cb(res);
          });
        };
      })(this));
    };

	Post.prototype.handleMoreCommentsClick = function() {
	  this.comment_limit += 10;
	  return false;
	};

    Post.prototype.handleReplyClick = function(e) {
      var user_name;
      user_name = e.currentTarget.attributes.user_name.value;
      if (this.field_comment.attrs.value) {
        this.field_comment.setValue(this.field_comment.attrs.value + "\n@" + user_name + ": ");
      } else {
        this.field_comment.setValue("@" + user_name + ": ");
      }
      this.handleCommentClick(e);
      return false;
    };

	Post.prototype.getEditableComment = function(comment_uri) {
	  var comment_id, handleCommentDelete, handleCommentSave, user_address, _ref;
	  if (!this.editable_comments[comment_uri]) {
		_ref = comment_uri.split("_"), user_address = _ref[0], comment_id = _ref[1];
		handleCommentSave = (function(_this) {
		  return function(body, cb) {
			return _this.handleCommentSave(parseInt(comment_id), body, cb);
		  };
		})(this);
		handleCommentDelete = (function(_this) {
		  return function(cb) {
			return _this.handleCommentDelete(parseInt(comment_id), cb);
		  };
		})(this);
		this.editable_comments[comment_uri] = new Editable("div.body", handleCommentSave, handleCommentDelete);
		this.editable_comments[comment_uri].render_function = Text.renderLinks;
	  }
	  return this.editable_comments[comment_uri];
	};

	Post.prototype.renderComments = function() {
	  var comment_limit, _ref, _ref1;
      if (!this.row.comments && !this.commenting) {
        return [];
      }
      if (this.row.selected) {
        comment_limit = 50;
      } else {
        comment_limit = this.comment_limit;
      }
	  return h("div.comment-list", {
		enterAnimation: Animation.slideDown,
		exitAnimation: Animation.slideUp,
		animate_scrollfix: true,
		animate_noscale: true
	  }, [
		this.commenting ? h("div.comment-create", {
		  enterAnimation: Animation.slideDown
		}, this.field_comment.render()) : void 0, (_ref = this.row.comments) != null ? _ref.slice(0, +(comment_limit - 1) + 1 || 9e9).map((function(_this) {
		  return function(comment) {
			var comment_uri, owned, user_address, user_link, _ref1;
			user_address = comment.directory.replace("data/users/", "");
			comment_uri = user_address + "_" + comment.comment_id;
			owned = user_address === ((_ref1 = Page.user) != null ? _ref1.auth_address : void 0);
			user_link = "?Profile/" + comment.hub + "/" + user_address + "/" + comment.cert_user_id;
			return h("div.comment", {
			  id: comment_uri,
			  key: comment_uri,
			  animate_scrollfix: true,
			  enterAnimation: Animation.slideDown,
			  exitAnimation: Animation.slideUp
			}, [
			  h("div.user", [
				h("a.name.link", {
				  href: user_link,
				  style: "color: " + (Text.toColor(user_address)),
				  onclick: Page.handleLinkClick
				}, comment.user_name), h("span.sep", " \u00B7 "), h("span.address", {
				  title: user_address
				}, comment.cert_user_id), h("span.sep", " \u2015 "), h("a.added.link", {
				  href: "#",
				  title: Time.date(comment.date_added, "long")
				}, Time.since(comment.date_added)), h("a.icon.icon-reply", {
                  href: "#Reply",
                  onclick: _this.handleReplyClick,
                  user_name: comment.user_name
                }, "Reply")
              ]), owned ? _this.getEditableComment(comment_uri).render(comment.body) : h("div.body", {
                innerHTML: Text.renderLinks(comment.body)
              })
			]);
		  };
		})(this)) : void 0, ((_ref1 = this.row.comments) != null ? _ref1.length : void 0) > comment_limit ? h("a.more", {
		  href: "#More",
		  onclick: this.handleMoreCommentsClick,
		  enterAnimation: Animation.slideDown,
		  exitAnimation: Animation.slideUp
		}, "Show more comments...") : void 0
	  ]);
	};

	Post.prototype.render = function() {
	  var post_uri, site, _ref, _ref1, _ref2, image;
	  _ref = this.row.key.split("-"), site = _ref[0], post_uri = _ref[1];
	  
	  // adding sigs/images
	  // alert(this.row.image);
	  // if (this.row.user_name = "Bot") {
	  //	this.row.image = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAyADIDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD5f8Jr4d0uwXVNf0qbxFPPI0dnpYvWs7ZUXIaWeRMOxJBCorL0yScgV109z8NLiJZNQ+HF7prOobGleI7lO2eFmWXPFcd4R1f+zNJiuikUgheVSJkDrgMT0P1qt4j8Tz3GpTSSzbL/AD+9lQgGA9kjIJAYf89F9cGvm4zxWKxM6dObioN3elrdElbc/b6mEyHIclw+MxdCNeVenFxi3JS5/ttyUvgV0kkk76d2ui8RaF8PbSUpb6d4i01/LLiO88QwStvwCibUtSQWz1PA/ix0pvhrSfhWzRprU/iiY/LufT9Qhj3f3yqyQdEOBy2W6rmvOItVgmkWGziNxIx2gIuQcnnJ9M9R/EelPk1CS3VGu7SSGN2IDsAfmU4wcd/7p/h717sqLlHl53fvpf8AK34H41iq0cRJuFNU12jf/wBucn97PsrwL8CPgD4otzNpsPiPWpI1DyW99r3lOgIyCyRxKce4NYmpfCf4XfEDVNc8KeF/D134S8TadbNPb3UepT3KORjAnjmZgVYlRldpGcjPQ/M3h7xndeEtRt9T0m+e3lgYspjb7pz82PYn7wP38V9ufDz4vWHjb4f3ev20Fpb6gls6XzxRKJNyIWALdSvQgHpnHavyXiGpnWQzeKWJlVpS0jpFcsrq3MlG0otXV9Ne3X5bFPEYV8/O3F7baPz01PhJ38pikgKSKcMvoe4opUP2hFlY5aQbifc80V+yRSsubc98n0zUJbHw9PPC217e5llB5zlVBGD25wc+1e3+J/2W/hX4Y17XNO1vxp8R7600V7CPV9V0rRNPFnaNeRRSRffuPOcETLnZGxzng15d4Z05r/4V6yiW6SM+quvmLCGm/wBWAFBxuIyR8mcE47gV6H488e/CfxNq2q6vqvjjTrSXxBYaXDdM3g973VtNktLWKFzZ3RkXyWLR53hTggYzip+qvDe8/t+9+n6HbiM3/tSNOn/z4j7P7m5f+3HNeGf2cfDUfj34xaFq/wAQtS8P6R4A1P7BC1vpAv8AUNWMl09vDHFGHQGVmWMAYPMnYAmrn7RfwX8MfCf4S6lqOhan44t/G+i6pYwazoHjWwtbV0sriKYxTxpBvVkZ4guRI2DkMAcVW8M/ETwF4o+O/wARfE2oeJ73wz4d1a4Op6Z4iezeaS2vobyG5tZJYCDvz5bggjncRkZyNH9ob9oDwV8UPBXj37T4o1Hxv4/8Q2dhZWt5ZeHjpenWttZ3Pn7FSSRnJYvIWck9QAAKDiOu8Q/sS+BfB3jTQfDN1rfxP16/123kurCbQtJ0oWtwsUUck+xprtSPLEqg7lHOcZxXHeELY/Cfx38aPAtpeT3+n6ONRsYbqbAeVYGZEkcDgFlY9Ov4V6rJ+158JbzWvhd4huvFsy6j4Qs9QjltE0W5m86W8tFgIEm0CMptHzDduywGM5ryvwVe6d8R/ij8avFWjwveaJeWGp3NpPe2+G/eKoVsN/Hwx55UgEda8LPI0p5dVVf4bJ/c01+Nio4V42Sw8d5f8OeS2jf6JD/uL/KiorJ82cB/6Zr/ACor3WSez/CDTrCT4avFqj+XZ6he3SuwbDY3BQy45yCmRj0rzbxx8J5PDfiJ49RjEtvLtkjuoIwySK2dsiKODnB2x/x4OcEEDufhreeHvEfheDw3resf2BdWc0jQXDBdsqO5fjdwT8xBGc8A165q/jD4ejSxoOualYXuiRLthb7ekd5bNjBlhlGSjHuMEH0zgj7eeDjj8FS9m0nCK1utX1i+zTPyalnE8nzWvHERk41Ju8VFtpK3LNd01vbsfKcHhGTSpDLpkkIiljZZIZQJYCpAywPUAfxOMeUTjPeop/DGo6ojxXH2a1ikZBILW32uQAQoyehZfugY833616t4k074cQXEcuifErS7lDw0d7bS2sqc/KxEUckTbRjKgqJTktg1n+H9L8I6yYP7Q+Ifh7R4Wf5/tVzcyuig4PyxwfMXHIyymHouetfE4i2FV62n4/lc/UsNWhi1ejr8mvzseeRfDy0maK0tLcyzudgESbyuQAQAMlmOfnHWKvtH4OfBSz+GngHV9FuZYj4l1O1k+3WyMG+yjy2VLfI4Yrk7j1JJz0qT4TXfwU8AXAvdG8baVr3iHpFql/NFbraDBUfZ4M4R9pw0rFnbqSDU2qa34D+FOo6541/4TAave3toY7TQbeaOXfLwcrtJJyR1OAoJ5r8Q4qz55spZTgFJPR35Je/JNWgtL263atofpOS5asFbHYlpra3MvdTWsn+VvM+F7WQw2sMbcMiBSPcCirT2sUztJK581zufYPlyeuPaiv3GNmk5bn52730JYwGIBGQeoNTiCIdI0/75FFFZGiDyY/8Anmv5UeTH/wA81/KiimSBgiPWND/wEVHKixABFCA9doxmiir6E9SE9aKKKgo//9k=";
	  // } else { this.row.image = ""; }
	  
	  return h("div.post", {
		key: this.row.key,
		enterAnimation: Animation.slideDown,
		exitAnimation: Animation.slideUp,
		animate_scrollfix: true,
		classes: {
          selected: this.row.selected
        }
	  }, [
		h("div.user", [
		  this.user.renderAvatar({
			href: this.user.getLink(),
			onclick: Page.handleLinkClick
		  }), h("a.name.link", {
			href: this.user.getLink(),
			onclick: Page.handleLinkClick,
			style: "color: " + (Text.toColor(this.user.auth_address))
		  }, this.row.user_name), h("span.sep", " \u00B7 "), h("span.address", {
			title: this.user.auth_address
		  }, this.row.cert_user_id), h("span.sep", " \u2015 "), h("a.added.link", {
			href: this.getLink(),
            title: Time.date(this.row.date_added, "long"),
            onclick: Page.handleLinkClick
		  }, Time.since(this.row.date_added))
		  // Testing image posting..
		// ]), h("div.body", {
			// innerHTML: Text.renderMarked(this.row.body)
		    // innerHTML: "<img style='display: block; width: 100px; height: 100px;' id='base64image' src=" + this.row.image + ">"
		]), this.owned ? this.editable_body.render(this.row.body) : h("div.body", {
		// ]), this.row.image ? this.editable_body.render(this.row.body) : h("div.body", {
		  innerHTML: Text.renderMarked(this.row.body)
		  
		  // innerHTML: Text.renderMarked(this.row.image)
		  // style: "background-image: url('" + avatar + "')"
		  
		// ===========================================================================================================
		// ===========================================================================================================
		// ===========================================================================================================
		// ===========================================================================================================
		// ===========================================================================================================
		// ===========================================================================================================
		// ===========================================================================================================
		
		}), h("div.actions", [
		  h("a.icon.icon-comment.link", {
			href: "#Comment",
			onclick: this.handleCommentClick
		  }, "Comment"), h("a.like.link", {
			classes: {
			  active: (_ref1 = Page.user) != null ? _ref1.likes[post_uri] : void 0,
			  loading: this.submitting_like,
			  "like-zero": this.row.likes === 0
			},
			href: "#Like",
			onclick: this.handleLikeClick
		  }, h("div.icon.icon-heart", {
			classes: {
			  active: (_ref2 = Page.user) != null ? _ref2.likes[post_uri] : void 0
			}
		  }), this.row.likes ? this.row.likes : void 0)
		]), this.renderComments()
	  ]);
	};

	return Post;

  })(Class);

  window.Post = Post;

}).call(this);


/* ---- /js/PostCreate.coffee ---- */


(function() {
  var PostCreate,
	__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  PostCreate = (function() {
	function PostCreate() {
	  this.render = __bind(this.render, this);
	  this.handlePostSubmit = __bind(this.handlePostSubmit, this);
	  this.field_post = new Autosize({
		placeholder: "What's new? \n\n\n\n",
		"class": "postfield",
		onfocus: Page.projector.scheduleRender,
		onblur: Page.projector.scheduleRender
	  });
	}

	PostCreate.prototype.isEditing = function() {
	  var _ref, _ref1, _ref2;
	  return ((_ref = this.field_post.attrs.value) != null ? _ref.length : void 0) || ((_ref1 = document.activeElement) != null ? _ref1.parentElement : void 0) === ((_ref2 = this.field_post.node) != null ? _ref2.parentElement : void 0);
	};

	PostCreate.prototype.handlePostSubmit = function() {
	  this.field_post.loading = true;
	  Page.user.post(this.field_post.attrs.value, (function(_this) {
		return function(res) {
		  _this.field_post.loading = false;
		  if (res) {
			_this.field_post.setValue("");
			document.activeElement.blur();
		  }
		  return setTimeout((function() {
			return Page.content.update();
		  }), 100);
		};
	  })(this));
	  return false;
	};

	PostCreate.prototype.render = function() {
	  var user;
	  user = Page.user;
	  if (user === false) {
		return h("div.post-create.post.empty");
	  } else if (user != null ? user.hub : void 0) {
		return h("div.post-create.post", {
		  classes: {
			editing: this.isEditing()
		  }
		}, h("div.user", user.renderAvatar()), this.field_post.render(), 
			h("div.postbuttons", h("a.button.button-submit", {
		  href: "#Submit",
		  onclick: this.handlePostSubmit
		}, "Submit new post")), h("div", {
		  style: "clear: both"
		  // Testing image posting..
		 }), h("div#upload", [ h("input.text", {
			type: "file"
		 }), h("input", {
			type: "hidden",
			id: "filedata"
		 })
		]));
		
		// <h2 class="upload">
		// <input type="file" id="image_file" class="text"><input type="hidden" id="filedata">
		// </h2>
		
		
	  } else if (Page.site_info.cert_user_id) {
		return h("div.post-create.post.empty.noprofile", h("div.user", h("a.avatar", {
		  href: "#",
		  style: "background-image: url('img/unkown.png')"
		})), h("div.select-user-container", h("a.button.button-submit.select-user", {
		  href: "?Create+profile",
		  onclick: Page.handleLinkClick
		}, ["Hub Space"])), h("textarea", {
		  disabled: true
		}));
	  } else {
		return h("div.post-create.post.empty.nocert", h("div.user", h("a.avatar", {
		  href: "#",
		  style: "background-image: url('img/unkown.png')"
		})), h("div.select-user-container", h("a.button.button-submit.select-user", {
		  href: "#Select+user",
		  onclick: Page.head.handleSelectUserClick
		}, [h("div.icon.icon-profile"), "Select user to post new content"])), h("textarea", {
		  disabled: true
		}));
	  }
	};

	return PostCreate;

  })();

  window.PostCreate = PostCreate;

}).call(this);


/* ---- /js/PostList.coffee ---- */


(function() {
  var PostList,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __hasProp = {}.hasOwnProperty;

  PostList = (function(_super) {
    __extends(PostList, _super);

    function PostList() {
      this.render = __bind(this.render, this);
      this.handleMoreClick = __bind(this.handleMoreClick, this);
      this.update = __bind(this.update, this);
      this.queryComments = __bind(this.queryComments, this);
      this.item_list = new ItemList(Post, "key");
      this.posts = this.item_list.items;
      this.need_update = true;
      this.directories = [];
      this.loaded = false;
	  this.filter_post_id = null;
      this.limit = 10;
    }

    PostList.prototype.queryComments = function(post_uris, cb) {
      var query;
      query = "SELECT post_uri, comment.body, comment.date_added, comment.comment_id, json.cert_auth_type, json.cert_user_id, json.user_name, json.hub, json.directory, json.site FROM comment LEFT JOIN json USING (json_id) WHERE ? ORDER BY date_added DESC";
      return Page.cmd("dbQuery", [
        query, {
          post_uri: post_uris
        }
      ], cb);
    };

    PostList.prototype.update = function() {
      var param, query, where;
      this.need_update = false;
      param = {};
      if (this.directories === "all") {
        where = "WHERE post_id IS NOT NULL AND post.date_added < " + (Time.timestamp() + 120) + " ";
      } else {
        where = "WHERE directory IN " + (Text.sqlIn(this.directories)) + " AND post_id IS NOT NULL ";
      }
      if (this.filter_post_id) {
        where += "AND post_id = :post_id ";
        param.post_id = this.filter_post_id;
      }
      query = "SELECT (SELECT COUNT(*) FROM post_like WHERE 'data/users/' || post_uri =  directory || '_' || post_id) AS likes, * FROM post LEFT JOIN json ON (post.json_id = json.json_id) " + where + " ORDER BY date_added DESC LIMIT " + (this.limit + 1);
      this.logStart("Update");
      return Page.cmd("dbQuery", [query, param], (function(_this) {
        return function(rows) {
          var items, post_uris, row, _i, _len;
          items = [];
          post_uris = [];
          for (_i = 0, _len = rows.length; _i < _len; _i++) {
            row = rows[_i];
            row["key"] = row["site"] + "-" + row["directory"].replace("data/users/", "") + "_" + row["post_id"];
            row["post_uri"] = row["directory"].replace("data/users/", "") + "_" + row["post_id"];
            post_uris.push(row["post_uri"]);
          }
          return _this.queryComments(post_uris, function(comment_rows) {
            var comment_db, comment_row, _j, _k, _len1, _len2, _name;
            comment_db = {};
            for (_j = 0, _len1 = comment_rows.length; _j < _len1; _j++) {
              comment_row = comment_rows[_j];
              if (comment_db[_name = comment_row.site + "/" + comment_row.post_uri] == null) {
                comment_db[_name] = [];
              }
              comment_db[comment_row.site + "/" + comment_row.post_uri].push(comment_row);
            }
            for (_k = 0, _len2 = rows.length; _k < _len2; _k++) {
              row = rows[_k];
              row["comments"] = comment_db[row.site + "/" + row.post_uri];
              if (row.post_id === parseInt(_this.filter_post_id)) {
                row.selected = true;
              }
            }
            _this.item_list.sync(rows);
            _this.loaded = true;
			_this.logEnd("Update");
            return Page.projector.scheduleRender();
          });
        };
      })(this));
    };

    PostList.prototype.handleMoreClick = function() {
      this.limit += 10;
      this.update();
      return false;
    };

    PostList.prototype.render = function() {
      if (this.need_update) {
        this.update();
      }
      if (!this.posts.length) {
        if (!this.loaded) {
          return null;
        } else {
          return h("div.post-list", [
            h("div.post-list-empty", {
              enterAnimation: Animation.slideDown,
              exitAnimation: Animation.slideUp
            }, [
              h("h2", "No posts yet"), h("a", {
                href: "?Users",
                onclick: Page.handleLinkClick
              }, "Let's follow some users!")
            ])
          ]);
        }
      }
      return [
        h("div.post-list", this.posts.slice(0, +this.limit + 1 || 9e9).map((function(_this) {
          return function(post) {
            var err;
            try {
              return post.render();
            } catch (_error) {
              err = _error;
              h("div.error", ["Post render error:", err.message]);
              return Debug.formatException(err);
            }
          };
        })(this))), this.posts.length > this.limit ? h("a.more.small", {
          href: "#More",
          onclick: this.handleMoreClick,
          enterAnimation: Animation.slideDown,
          exitAnimation: Animation.slideUp
        }, "Show more posts...") : void 0
      ];
    };

    return PostList;

  })(Class);

  window.PostList = PostList;

}).call(this);


/* ---- /js/User.coffee ---- */


(function() {
  var User,
	__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	__hasProp = {}.hasOwnProperty;

  User = (function(_super) {
	__extends(User, _super);

	function User(row, _at_item_list) {
	  this.item_list = _at_item_list;
	  this.renderList = __bind(this.renderList, this);
	  this.handleDownloadClick = __bind(this.handleDownloadClick, this);
	  this.download = __bind(this.download, this);
	  this.handleFollowClick = __bind(this.handleFollowClick, this);
	  this.renderAvatar = __bind(this.renderAvatar, this);
	  this.updateInfo = __bind(this.updateInfo, this);
	  if (row) {
		this.setRow(row);
	  }
	  this.likes = {};
	  this.followed_users = {};
	  this.submitting_follow = false;
	}

	User.prototype.setRow = function(row) {
	  this.row = row;
	  this.hub = row.hub;
	  return this.auth_address = row.auth_address;
	};

	User.prototype.get = function(site, auth_address, cb) {
      var params;
      if (cb == null) {
        cb = null;
      }
      params = {
        site: site,
        directory: "data/users/" + auth_address
      };
      return Page.cmd("dbQuery", ["SELECT * FROM json WHERE site = :site AND directory = :directory LIMIT 1", params], (function(_this) {
        return function(res) {
          var row;
          row = res[0];
          if (row) {
            row.auth_address = row.directory.replace("data/users/", "");
            _this.setRow(row);
            return typeof cb === "function" ? cb(row) : void 0;
          } else {
            return cb(false);
          }
        };
      })(this));
    };

	User.prototype.updateInfo = function(cb) {
	  var p_followed_users, p_likes;
	  if (cb == null) {
		cb = null;
	  }
	  this.logStart("Info loaded");
	  p_likes = new Promise();
	  p_followed_users = new Promise();
	  Page.cmd("dbQuery", ["SELECT * FROM follow WHERE json_id = " + this.row.json_id], (function(_this) {
		return function(res) {
		  var row, _i, _len;
		  _this.followed_users = {};
		  for (_i = 0, _len = res.length; _i < _len; _i++) {
			row = res[_i];
			_this.followed_users[row.hub + "/" + row.auth_address] = row;
		  }
		  return p_followed_users.resolve();
		};
	  })(this));
	  Page.cmd("dbQuery", ["SELECT post_like.* FROM json LEFT JOIN post_like USING (json_id) WHERE directory = 'data/users/" + this.auth_address + "' AND post_uri IS NOT NULL"], (function(_this) {
		return function(res) {
		  var row, _i, _len;
		  _this.likes = {};
		  for (_i = 0, _len = res.length; _i < _len; _i++) {
			row = res[_i];
			_this.likes[row.post_uri] = true;
		  }
		  return p_likes.resolve();
		};
	  })(this));
	  return Promise.join(p_followed_users, p_likes).then((function(_this) {
		return function(res1, res2) {
		  _this.logEnd("Info loaded");
		  return typeof cb === "function" ? cb(true) : void 0;
		};
	  })(this));
	};

	User.prototype.isFollowed = function() {
	  return Page.user.followed_users[this.hub + "/" + this.auth_address];
	};

	User.prototype.isSeeding = function() {
	  return Page.merged_sites[this.hub];
	};

	User.prototype.getPath = function(site) {
	  if (site == null) {
		site = this.hub;
	  }
	  if (site === Page.userdb) {
		return "merged-space/" + site + "/data/userdb/" + this.auth_address;
	  } else {
		return "merged-space/" + site + "/data/users/" + this.auth_address;
	  }
	};

	User.prototype.getLink = function() {
	  // alert(this.row.cert_user_id);
	  return "?Profile/" + this.hub + "/" + this.auth_address + "/" + this.row.cert_user_id;
	};

	User.prototype.getAvatarLink = function() {
	  var cache_invalidation, _ref;
	  cache_invalidation = "";
	  if (this.auth_address === ((_ref = Page.user) != null ? _ref.auth_address : void 0)) {
		cache_invalidation = "?" + Page.cache_time;
	  }
	  return "merged-space/" + this.hub + "/data/users/" + this.auth_address + "/avatar." + this.row.avatar + cache_invalidation;
	};

	User.prototype.getDefaultData = function() {
	  var _ref;
	  return {
		"next_post_id": 2,
		"next_comment_id": 1,
		"next_follow_id": 1,
		"avatar": "generate",
		"user_name": (_ref = this.row) != null ? _ref.user_name : void 0,
		"hub": this.hub,
		"intro": "Random ZeroNet user",
		"post": [
		  {
			"post_id": 1,
			"date_added": Time.timestamp(),
			"body": "Hello World!",
			"image": "~"
		  }
		],
		"post_like": {},
		"comment": [],
		"follow": []
	  };
	};

	User.prototype.getData = function(site, cb) {
	  return Page.cmd("fileGet", [this.getPath(site) + "/data.json", false], (function(_this) {
		return function(data) {
		  var _ref;
		  data = JSON.parse(data);
		  if (data == null) {
			data = {
			  "next_comment_id": 1,
			  "user_name": (_ref = _this.row) != null ? _ref.user_name : void 0,
			  "hub": _this.hub,
			  "post_like": {},
			  "comment": []
			};
		  }
		  return cb(data);
		};
	  })(this));
	};

	User.prototype.renderAvatar = function(attrs) {
	  if (attrs == null) {
		attrs = {};
	  }
	  if (this.isSeeding() && (this.row.avatar === "png" || this.row.avatar === "jpg")) {
		attrs.style = "background-image: url('" + (this.getAvatarLink()) + "')";
	  } else {
		attrs.style = "background: linear-gradient(" + Text.toColor(this.auth_address) + "," + Text.toColor(this.auth_address.slice(-5)) + ")";
	  }
	  return h("a.avatar", attrs);
	};

	User.prototype.saveUserdb = function(data, cb) {
	  if (cb == null) {
		cb = null;
	  }
	  return Page.cmd("fileWrite", [this.getPath(Page.userdb) + "/content.json", Text.fileEncode(data)], (function(_this) {
		return function(res_write) {
		  return Page.cmd("sitePublish", {
			"inner_path": _this.getPath(Page.userdb) + "/content.json"
		  }, function(res_sign) {
			_this.log("Userdb save result", res_write, res_sign);
			return typeof cb === "function" ? cb(res_sign) : void 0;
		  });
		};
	  })(this));
	};

	User.prototype.save = function(data, site, cb) {
	  if (site == null) {
		site = this.hub;
	  }
	  if (cb == null) {
		cb = null;
	  }
	  Page.cmd("fileWrite", [this.getPath(site) + "/data.json", Text.fileEncode(data)], (function(_this) {
		return function(res_write) {
		  if (Page.server_info.rev > 1400) {
            Page.content.update();
          }
		  if (typeof cb === "function") {
			cb(res_write);
		  }
		  return Page.cmd("sitePublish", {
			"inner_path": _this.getPath(site) + "/data.json"
		  }, function(res_sign) {
			return _this.log("Save result", res_write, res_sign);
		  });
		};
	  })(this));
	  if (site === this.hub) {
		return Page.cmd("fileGet", [this.getPath(Page.userdb) + "/content.json", false], (function(_this) {
		  return function(userdb_data) {
			var changed, field, _i, _len, _ref;
			userdb_data = JSON.parse(userdb_data);
			changed = false;
			if (!(userdb_data != null ? userdb_data.user : void 0)) {
			  userdb_data = {
				user: [
				  {
					date_added: Time.timestamp()
				  }
				]
			  };
			  changed = true;
			}
			_ref = ["avatar", "hub", "intro", "user_name"];
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
			  field = _ref[_i];
			  if (userdb_data.user[0][field] !== data[field]) {
				changed = true;
				_this.log("Changed in profile:", field);
			  }
			  userdb_data.user[0][field] = data[field];
			}
			if (changed) {
			  return _this.saveUserdb(userdb_data);
			}
		  };
		})(this));
	  }
	};

	User.prototype.like = function(site, post_uri, cb) {
	  if (cb == null) {
		cb = null;
	  }
	  this.log("Like", site, post_uri);
	  this.likes[post_uri] = true;
	  return this.getData(site, (function(_this) {
		return function(data) {
		  data.post_like[post_uri] = Time.timestamp();
		  return _this.save(data, site, function(res) {
			if (cb) {
			  return cb(res);
			}
		  });
		};
	  })(this));
	};

	User.prototype.dislike = function(site, post_uri, cb) {
	  if (cb == null) {
		cb = null;
	  }
	  this.log("Dislike", site, post_uri);
	  delete this.likes[post_uri];
	  return this.getData(site, (function(_this) {
		return function(data) {
		  delete data.post_like[post_uri];
		  return _this.save(data, site, function(res) {
			if (cb) {
			  return cb(res);
			}
		  });
		};
	  })(this));
	};

	User.prototype.comment = function(site, post_uri, body, cb) {
	  if (cb == null) {
		cb = null;
	  }
	  return this.getData(site, (function(_this) {
		return function(data) {
		  data.comment.push({
			"comment_id": data.next_comment_id,
			"body": body,
			"post_uri": post_uri,
			"date_added": Time.timestamp()
		  });
		  data.next_comment_id += 1;
		  return _this.save(data, site, function(res) {
			if (cb) {
			  return cb(res);
			}
		  });
		};
	  })(this));
	};

	User.prototype.post = function(body, cb) {
	  if (cb == null) {
		cb = null;
	  }
	//  if (image == null) {
	//	image = "+";
	//  }
	  return this.getData(this.hub, (function(_this) {
		return function(data) {
		  data.post.push({
			"post_id": data.next_post_id,
			"body": body,
			"image": image,
			"date_added": Time.timestamp()
		  });
		  data.next_post_id += 1;
		  return _this.save(data, _this.hub, function(res) {
			if (cb) {
			  return cb(res);
			}
		  });
		};
	  })(this));
	};

	User.prototype.followUser = function(hub, auth_address, user_name, cb) {
	  if (cb == null) {
		cb = null;
	  }
	  this.log("Following", hub, auth_address);
	  this.download();
	  return this.getData(this.hub, (function(_this) {
		return function(data) {
		  var follow_row;
		  follow_row = {
			"follow_id": data.next_follow_id,
			"hub": hub,
			"auth_address": auth_address,
			"user_name": user_name,
			"date_added": Time.timestamp()
		  };
		  data.follow.push(follow_row);
		  _this.followed_users[hub + "/" + auth_address] = true;
		  data.next_follow_id += 1;
		  _this.save(data, _this.hub, function(res) {
			if (cb) {
			  return cb(res);
			}
		  });
		  return Page.needSite(hub);
		};
	  })(this));
	};

	User.prototype.unfollowUser = function(hub, auth_address, cb) {
	  if (cb == null) {
		cb = null;
	  }
	  this.log("UnFollowing", hub, auth_address);
	  delete this.followed_users[hub + "/" + auth_address];
	  return this.getData(this.hub, (function(_this) {
		return function(data) {
		  var follow, follow_index, i, _i, _len, _ref;
		  _ref = data.follow;
		  for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
			follow = _ref[i];
			if (follow.hub === hub && follow.auth_address === auth_address) {
			  follow_index = i;
			}
		  }
		  data.follow.splice(follow_index, 1);
		  return _this.save(data, _this.hub, function(res) {
			if (cb) {
			  return cb(res);
			}
		  });
		};
	  })(this));
	};

	User.prototype.handleFollowClick = function(e) {
	  this.submitting_follow = true;
	  if (!this.isFollowed()) {
		Animation.flashIn(e.target);
		Page.user.followUser(this.hub, this.auth_address, this.row.user_name, (function(_this) {
		  return function(res) {
			_this.submitting_follow = false;
			return Page.projector.scheduleRender();
		  };
		})(this));
	  } else {
		Animation.flashOut(e.target);
		Page.user.unfollowUser(this.hub, this.auth_address, (function(_this) {
		  return function(res) {
			_this.submitting_follow = false;
			return Page.projector.scheduleRender();
		  };
		})(this));
	  }
	  return false;
	};

	User.prototype.download = function() {
	  if (!Page.merged_sites[this.hub]) {
		return Page.cmd("mergerSiteAdd", this.hub, (function(_this) {
		  return function() {
			return Page.updateSiteInfo();
		  };
		})(this));
	  }
	};

	User.prototype.handleDownloadClick = function(e) {
	  this.download();
	  return false;
	};

	User.prototype.renderList = function(type) {
      var classname, followed, link, seeding, title;
      if (type == null) {
        type = "normal";
      }
      classname = "";
      if (type === "card") {
        classname = ".card";
      }
      link = this.getLink();
	  // alert(link);
      followed = this.isFollowed();
	  seeding = this.isSeeding();
      if (followed) {
        title = "Unfollow";
      } else {
        title = "Follow";
      }
      return h("div.user" + classname, {
        key: this.hub + "/" + this.auth_address,
        classes: {
          followed: followed,
		  notseeding: !seeding
        },
        enterAnimation: Animation.slideDown,
        exitAnimation: Animation.slideUp
      }, [
        h("a.button.button-follow", {
          href: link,
          onclick: this.handleFollowClick,
          title: title,
          classes: {
            loading: this.submitting_follow
          }
        }, "+"), h("a", {
          href: link,
          onclick: Page.handleLinkClick
        }, this.renderAvatar()), h("div.nameline", [
          h("a.name.link", {
            href: link,
            onclick: Page.handleLinkClick
          }, this.row.user_name), type === "card" ? h("span.added", Time.since(this.row.date_added)) : void 0
        ]), h("div.intro", this.row.intro)
      ]);
    };

	return User;

  })(Class);

  window.User = User;

}).call(this);


/* ---- /js/UserList.coffee ---- */


(function() {
  var UserList,
	__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	__hasProp = {}.hasOwnProperty;

  UserList = (function(_super) {
	__extends(UserList, _super);

	function UserList(_at_type) {
	  this.type = _at_type != null ? _at_type : "recent";
	  this.render = __bind(this.render, this);
	  this.item_list = new ItemList(User, "key");
	  this.users = this.item_list.items;
	  this.need_update = true;
	  this.limit = 8;
	  this.followed_by = null;
	}

	UserList.prototype.update = function() {
	  var query;
	  if (this.followed_by) {
		query = "SELECT user.user_name, follow.*, user.*\nFROM follow\nLEFT JOIN user USING (auth_address, hub)\nWHERE\n follow.json_id = " + this.followed_by.row.json_id + "  AND user.json_id IS NOT NULL\n\nUNION\n\nSELECT user.user_name, follow.*, user.*\nFROM follow\nLEFT JOIN json ON (json.directory = 'data/userdb/' || follow.auth_address)\nLEFT JOIN user ON (user.json_id = json.json_id)\nWHERE\n follow.json_id = " + this.followed_by.row.json_id + "  AND user.json_id IS NOT NULL\n\nORDER BY date_added DESC\nLIMIT " + this.limit;
	  } else {
		query = "SELECT\n user.*,\n json.site AS json_site,\n json.directory AS json_directory,\n json.file_name AS json_file_name,\n json.cert_user_id AS json_cert_user_id,\n json.hub AS json_hub,\n json.user_name AS json_user_name,\n json.avatar AS json_avatar\nFROM\n user LEFT JOIN json USING (json_id)\nORDER BY date_added DESC\nLIMIT " + this.limit;
	  }
	  return Page.cmd("dbQuery", query, (function(_this) {
		return function(rows) {
		  var key, row, rows_by_user, user_rows, val, _i, _len;
		  rows_by_user = {};
		  for (_i = 0, _len = rows.length; _i < _len; _i++) {
			row = rows[_i];
			if (row.json_cert_user_id) {
			  // alert(row.json_cert_user_id);
			  row.cert_user_id = row.json_cert_user_id;
			  row.auth_address = row.json_directory.replace("data/userdb/", "");
			}
			if (!row.auth_address) {
			  continue;
			}
			row.key = row.hub + "/" + row.auth_address;
			if (!rows_by_user[row.hub + row.auth_address]) {
			  rows_by_user[row.hub + row.auth_address] = row;
			}
		  }
		  user_rows = (function() {
			var _results;
			_results = [];
			for (key in rows_by_user) {
			  val = rows_by_user[key];
			  _results.push(val);
			}
			return _results;
		  })();
		  _this.item_list.sync(user_rows);
		  return Page.projector.scheduleRender();
		};
	  })(this));
	};

	UserList.prototype.render = function(type) {
      if (type == null) {
        type = "normal";
      }
      if (this.need_update) {
        this.need_update = false;
        setTimeout(((function(_this) {
          return function() {
            return _this.update();
          };
        })(this)), 100);
      }
      if (!this.users.length) {
        return null;
      }
	  return h("div.UserList.users" + type, {
		afterCreate: Animation.show
	  }, this.users.map((function(_this) {
		return function(user) {
		  return user.renderList(type);
		};
	  })(this)));
	};

	return UserList;

  })(Class);

  window.UserList = UserList;

}).call(this);


/* ---- /js/SpaceHub.coffee ---- */


(function() {
  var SpaceHub,
	__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	__hasProp = {}.hasOwnProperty,
	__indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  window.h = maquette.h;

  SpaceHub = (function(_super) {
	__extends(SpaceHub, _super);

	function SpaceHub() {
	  this.queryUserdb = __bind(this.queryUserdb, this);
	  this.checkUser = __bind(this.checkUser, this);
	  this.needSite = __bind(this.needSite, this);
	  this.updateServerInfo = __bind(this.updateServerInfo, this);
	  this.updateSiteInfo = __bind(this.updateSiteInfo, this);
	  this.onOpenWebsocket = __bind(this.onOpenWebsocket, this);
	  this.handleLinkClick = __bind(this.handleLinkClick, this);
	  this.renderContent = __bind(this.renderContent, this);
	  return SpaceHub.__super__.constructor.apply(this, arguments);
	}

	SpaceHub.prototype.init = function() {
	  this.params = {};
	  this.merged_sites = {};
	  this.site_info = null;
	  this.server_info = null;
	  this.address = null;
	  this.user = false;
	  this.user_loaded = false;
	  this.userdb = "1DENTBoT8SwzrELFhRrU7gyhjF6fjt2vNP";
	  this.cache_time = Time.timestamp();
	  this.on_site_info = new Promise();
	  this.on_local_storage = new Promise();
	  this.on_user_info = new Promise();
	  this.on_loaded = new Promise();
	  this.local_storage = null;
	  return this.on_site_info.then((function(_this) {
		return function() {
		  _this.checkUser(function() {
			return _this.on_user_info.resolve();
		  });
		  if (__indexOf.call(_this.site_info.settings.permissions, "Merger:Space") < 0) {
			return _this.cmd("wrapperPermissionAdd", "Merger:Space", function() {
			  return _this.updateSiteInfo(function() {
				return _this.content.update();
			  });
			});
		  }
		};
	  })(this));
	};

	SpaceHub.prototype.createProjector = function() {
	  this.projector = maquette.createProjector();
	  this.head = new Head();
	  this.content_feed = new ContentFeed();
	  this.content_users = new ContentUsers();
	  this.content_profile = new ContentProfile();
	  this.content_create_profile = new ContentCreateProfile();
	  if (base.href.indexOf("?") === -1) {
		this.route("");
	  } else {
		this.route(base.href.replace(/.*?\?/, ""));
	  }
	  this.on_loaded.then((function(_this) {
		return function() {
		  _this.log("onloaded");
		  return document.body.className = "loaded";
		};
	  })(this));
	  this.projector.replace($("#Head"), this.head.render);
	  this.loadLocalStorage();
	  return setInterval((function() {
		return Page.projector.scheduleRender();
	  }), 60 * 1000);
	};

	SpaceHub.prototype.renderContent = function() {
	  if (this.site_info) {
		return h("div#Content", this.content.render());
	  } else {
		return h("div#Content");
	  }
	};

	SpaceHub.prototype.route = function(query) {
      var changed, content;
      this.params = Text.queryParse(query);
      this.log("Route", this.params);
      if (this.params.urls[0] === "Create+profile") {
        content = this.content_create_profile;
      } else if (this.params.urls[0] === "Users" && (content = this.content_users)) {

      } else if (this.params.urls[0] === "Profile") {
        content = this.content_profile;
        changed = this.content_profile.auth_address !== this.params.urls[2];
        this.content_profile.setUser(this.params.urls[1], this.params.urls[2]).filter(null);
      } else if (this.params.urls[0] === "Post") {
        content = this.content_profile;
        changed = this.content_profile.auth_address !== this.params.urls[2];
        this.content_profile.setUser(this.params.urls[1], this.params.urls[2]).filter(this.params.urls[3]);
      } else {
        content = this.content_feed;
      }
      setTimeout(((function(_this) {
        return function() {
          return _this.content.update();
        };
      })(this)), 100);
      if (this.content !== content || changed) {
        if (this.content) {
          this.projector.detach(this.content.render);
        }
        this.content = content;
        return this.on_user_info.then((function(_this) {
          return function() {
            return _this.projector.replace($("#Content"), _this.content.render);
          };
        })(this));
      }
    };

	SpaceHub.prototype.setUrl = function(url) {
	  url = url.replace(/.*?\?/, "");
	  this.log("setUrl", this.history_state["url"], "->", url);
	  if (this.history_state["url"] === url) {
		this.content.update();
		return false;
	  }
	  this.history_state["url"] = url;
	  this.cmd("wrapperPushState", [this.history_state, "", url]);
	  this.route(url);
	  return false;
	};

	SpaceHub.prototype.handleLinkClick = function(e) {
	  if (e.which === 2) {
		return true;
	  } else {
		this.log("save scrollTop", window.pageYOffset);
		this.history_state["scrollTop"] = window.pageYOffset;
		this.cmd("wrapperReplaceState", [this.history_state, null]);
		window.scroll(window.pageXOffset, 0);
		this.history_state["scrollTop"] = 0;
		this.on_loaded.resolved = false;
		document.body.className = "";
		this.setUrl(e.currentTarget.search);
		return false;
	  }
	};

	SpaceHub.prototype.createUrl = function(key, val) {
	  var params, vals;
	  params = JSON.parse(JSON.stringify(this.params));
	  if (typeof key === "Object") {
		vals = key;
		for (key in keys) {
		  val = keys[key];
		  params[key] = val;
		}
	  } else {
		params[key] = val;
	  }
	  return "?" + Text.queryEncode(params);
	};

	SpaceHub.prototype.loadLocalStorage = function() {
	  return this.on_site_info.then((function(_this) {
		return function() {
		  _this.logStart("Loaded localstorage");
		  return _this.cmd("wrapperGetLocalStorage", [], function(_at_local_storage) {
			var _base;
			_this.local_storage = _at_local_storage;
			_this.logEnd("Loaded localstorage");
			if (_this.local_storage == null) {
			  _this.local_storage = {};
			}
			if ((_base = _this.local_storage).followed_users == null) {
			  _base.followed_users = {};
			}
			return _this.on_local_storage.resolve(_this.local_storage);
		  });
		};
	  })(this));
	};

	SpaceHub.prototype.saveLocalStorage = function(cb) {
	  if (cb == null) {
		cb = null;
	  }
	  this.logStart("Saved localstorage");
	  if (this.local_storage) {
		return this.cmd("wrapperSetLocalStorage", this.local_storage, (function(_this) {
		  return function(res) {
			_this.logEnd("Saved localstorage");
			return typeof cb === "function" ? cb(res) : void 0;
		  };
		})(this));
	  }
	};

	SpaceHub.prototype.onOpenWebsocket = function(e) {
	  this.updateSiteInfo();
	  return this.updateServerInfo();
	};

	SpaceHub.prototype.updateSiteInfo = function(cb) {
	  var on_site_info;
	  if (cb == null) {
		cb = null;
	  }
	  on_site_info = new Promise();
	  this.cmd("mergerSiteList", {}, (function(_this) {
		return function(merged_sites) {
		  _this.merged_sites = merged_sites;
		  return on_site_info.then(function() {
			if (__indexOf.call(_this.site_info.settings.permissions, "Merger:Space") >= 0 && !_this.merged_sites[_this.userdb]) {
			  _this.cmd("mergerSiteAdd", _this.userdb);
			}
			return typeof cb === "function" ? cb(true) : void 0;
		  });
		};
	  })(this));
	  return this.cmd("siteInfo", {}, (function(_this) {
		return function(site_info) {
		  _this.address = site_info.address;
		  _this.setSiteInfo(site_info);
		  return on_site_info.resolve();
		};
	  })(this));
	};

	SpaceHub.prototype.updateServerInfo = function() {
	  return this.cmd("serverInfo", {}, (function(_this) {
		return function(server_info) {
		  return _this.setServerInfo(server_info);
		};
	  })(this));
	};

	SpaceHub.prototype.needSite = function(address, cb) {
	  if (this.merged_sites[address]) {
		return typeof cb === "function" ? cb(true) : void 0;
	  } else {
		return Page.cmd("mergerSiteAdd", address, cb);
	  }
	};

	SpaceHub.prototype.checkUser = function(cb) {
	  if (cb == null) {
		cb = null;
	  }
	  this.log("Find hub for user", this.site_info.cert_user_id);
	  if (!this.site_info.cert_user_id) {
		this.user = new AnonUser();
		this.user.updateInfo(cb);
		return false;
	  }
	  return Page.cmd("dbQuery", [
        "SELECT * FROM json WHERE directory = :directory AND user_name IS NOT NULL AND file_name = 'data.json'", {
          directory: "data/users/" + this.site_info.auth_address
        }
      ], (function(_this) {
        return function(res) {
          var row, _i, _len;
          if ((res != null ? res.length : void 0) > 0) {
            _this.user = new User({
              hub: res[0]["hub"],
              auth_address: _this.site_info.auth_address
            });
            _this.user.row = res[0];
            for (_i = 0, _len = res.length; _i < _len; _i++) {
              row = res[_i];
              if (row.site === row.hub) {
                _this.user.row = row;
              }
            }
            _this.log("Choosen site for user", _this.user.row.site, _this.user.row);
			_this.user.updateInfo(cb);
		  } else {
			_this.user = new AnonUser();
			_this.user.updateInfo();
			_this.queryUserdb(_this.site_info.auth_address, function(user) {
			  if (user) {
				if (!_this.merged_sites[user.hub]) {
				  _this.log("Profile not seeded, but found in the userdb", user);
				  return Page.cmd("mergerSiteAdd", user.hub, function() {
					return typeof cb === "function" ? cb(true) : void 0;
				  });
				} else {
				  return typeof cb === "function" ? cb(true) : void 0;
				}
			  } else {
				return typeof cb === "function" ? cb(false) : void 0;
			  }
			});
		  }
		  return Page.projector.scheduleRender();
		};
	  })(this));
	};

	SpaceHub.prototype.queryUserdb = function(auth_address, cb) {
	  var query;
	  query = "SELECT\n CASE WHEN user.auth_address IS NULL THEN REPLACE(json.directory, \"data/userdb/\", \"\") ELSE user.auth_address END AS auth_address,\n CASE WHEN user.cert_user_id IS NULL THEN json.cert_user_id ELSE user.cert_user_id END AS cert_user_id,\n *\nFROM user\nLEFT JOIN json USING (json_id)\nWHERE\n user.auth_address = :auth_address OR\n json.directory = :directory\nLIMIT 1";
	  return Page.cmd("dbQuery", [
		query, {
		  auth_address: auth_address,
		  directory: "data/userdb/" + auth_address
		}
	  ], (function(_this) {
		return function(res) {
		  if ((res != null ? res.length : void 0) > 0) {
			return typeof cb === "function" ? cb(res[0]) : void 0;
		  } else {
			return typeof cb === "function" ? cb(false) : void 0;
		  }
		};
	  })(this));
	};

	SpaceHub.prototype.onRequest = function(cmd, params) {
	  if (cmd === "setSiteInfo") {
		return this.setSiteInfo(params);
	  } else if (cmd === "wrapperPopState") {
		if (params.state) {
		  this.on_loaded.resolved = false;
		  document.body.className = "";
		  window.scroll(window.pageXOffset, params.state.scrollTop || 0);
		  return this.route(params.state.url || "");
		}
	  } else {
		return this.log("Unknown command", cmd, params);
	  }
	};

	SpaceHub.prototype.setSiteInfo = function(site_info) {
	  var file_name, _ref, _ref1, _ref2;
	  if (site_info.address === this.address) {
		if (!this.site_info) {
		  this.site_info = site_info;
		  this.on_site_info.resolve();
		}
		this.site_info = site_info;
		if (((_ref = site_info.event) != null ? _ref[0] : void 0) === "cert_changed") {
		  this.checkUser((function(_this) {
			return function(found) {
			  if (Page.site_info.cert_user_id && !found) {
				_this.setUrl("?Create+profile");
			  }
			  return _this.content.update();
			};
		  })(this));
		}
	  }
	  if (((_ref1 = site_info.event) != null ? _ref1[0] : void 0) === "file_done") {
		file_name = site_info.event[1];
		if (file_name.indexOf(site_info.auth_address) !== -1 && ((_ref2 = Page.user) != null ? _ref2.auth_address : void 0) !== site_info.auth_address) {
		  return this.checkUser((function(_this) {
			return function() {
			  return _this.content.update();
			};
		  })(this));
		} else if (!this.merged_sites[site_info.address] && site_info.address !== this.address) {
		  this.log("New site added:", site_info.address);
		  return this.updateSiteInfo((function(_this) {
			return function() {
			  return _this.content.update();
			};
		  })(this));
		} else if (file_name.indexOf(site_info.auth_address) !== -1) {
		  return this.content.update();
		} else if (!file_name.endsWith("content.json") || file_name.indexOf(this.userdb) !== -1) {
		  if (site_info.tasks > 100) {
			return RateLimit(3000, this.content.update);
		  } else if (site_info.tasks > 20) {
			return RateLimit(1000, this.content.update);
		  } else {
			return RateLimit(500, this.content.update);
		  }
		}
	  }
	};

	SpaceHub.prototype.setServerInfo = function(server_info) {
	  this.server_info = server_info;
	  if (this.server_info.rev < 1400) {
        this.cmd("wrapperNotification", ["error", "This site requries ZeroNet 0.4.0+<br>Please delete the site from your current client, update it, then add again!"]);
      }
	  return this.projector.scheduleRender();
	};

	SpaceHub.prototype.returnFalse = function() {
	  return false;
	};

	return SpaceHub;

  })(ZeroFrame);

  window.Page = new SpaceHub();

  window.Page.createProjector();

}).call(this);
