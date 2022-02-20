(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.orbital = factory());
}(this, (function () { 'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var es6Shim = createCommonjsModule(function (module, exports) {
/*!
  * https://github.com/paulmillr/es6-shim
  * @license es6-shim Copyright 2013-2016 by Paul Miller (http://paulmillr.com)
  *   and contributors,  MIT License
  * es6-shim: v0.35.1
  * see https://github.com/paulmillr/es6-shim/blob/0.35.1/LICENSE
  * Details and documentation:
  * https://github.com/paulmillr/es6-shim/
  */

// UMD (Universal Module Definition)
// see https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
  /*global define, module, exports */
  if (typeof undefined === 'function' && undefined.amd) {
    // AMD. Register as an anonymous module.
    undefined(factory);
  } else {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  }
}(commonjsGlobal, function () {
  'use strict';

  var _apply = Function.call.bind(Function.apply);
  var _call = Function.call.bind(Function.call);
  var isArray = Array.isArray;
  var keys = Object.keys;

  var not = function notThunker(func) {
    return function notThunk() {
      return !_apply(func, this, arguments);
    };
  };
  var throwsError = function (func) {
    try {
      func();
      return false;
    } catch (e) {
      return true;
    }
  };
  var valueOrFalseIfThrows = function valueOrFalseIfThrows(func) {
    try {
      return func();
    } catch (e) {
      return false;
    }
  };

  var isCallableWithoutNew = not(throwsError);
  var arePropertyDescriptorsSupported = function () {
    // if Object.defineProperty exists but throws, it's IE 8
    return !throwsError(function () {
      Object.defineProperty({}, 'x', { get: function () {} });
    });
  };
  var supportsDescriptors = !!Object.defineProperty && arePropertyDescriptorsSupported();
  var functionsHaveNames = (function foo() {}).name === 'foo'; // eslint-disable-line no-extra-parens

  var _forEach = Function.call.bind(Array.prototype.forEach);
  var _reduce = Function.call.bind(Array.prototype.reduce);
  var _filter = Function.call.bind(Array.prototype.filter);
  var _some = Function.call.bind(Array.prototype.some);

  var defineProperty = function (object, name, value, force) {
    if (!force && name in object) { return; }
    if (supportsDescriptors) {
      Object.defineProperty(object, name, {
        configurable: true,
        enumerable: false,
        writable: true,
        value: value
      });
    } else {
      object[name] = value;
    }
  };

  // Define configurable, writable and non-enumerable props
  // if they don’t exist.
  var defineProperties = function (object, map, forceOverride) {
    _forEach(keys(map), function (name) {
      var method = map[name];
      defineProperty(object, name, method, !!forceOverride);
    });
  };

  var _toString = Function.call.bind(Object.prototype.toString);
  var isCallable = function IsCallableFast(x) { return typeof x === 'function'; };

  var Value = {
    getter: function (object, name, getter) {
      if (!supportsDescriptors) {
        throw new TypeError('getters require true ES5 support');
      }
      Object.defineProperty(object, name, {
        configurable: true,
        enumerable: false,
        get: getter
      });
    },
    proxy: function (originalObject, key, targetObject) {
      if (!supportsDescriptors) {
        throw new TypeError('getters require true ES5 support');
      }
      var originalDescriptor = Object.getOwnPropertyDescriptor(originalObject, key);
      Object.defineProperty(targetObject, key, {
        configurable: originalDescriptor.configurable,
        enumerable: originalDescriptor.enumerable,
        get: function getKey() { return originalObject[key]; },
        set: function setKey(value) { originalObject[key] = value; }
      });
    },
    redefine: function (object, property, newValue) {
      if (supportsDescriptors) {
        var descriptor = Object.getOwnPropertyDescriptor(object, property);
        descriptor.value = newValue;
        Object.defineProperty(object, property, descriptor);
      } else {
        object[property] = newValue;
      }
    },
    defineByDescriptor: function (object, property, descriptor) {
      if (supportsDescriptors) {
        Object.defineProperty(object, property, descriptor);
      } else if ('value' in descriptor) {
        object[property] = descriptor.value;
      }
    },
    preserveToString: function (target, source) {
      if (source && isCallable(source.toString)) {
        defineProperty(target, 'toString', source.toString.bind(source), true);
      }
    }
  };

  // Simple shim for Object.create on ES3 browsers
  // (unlike real shim, no attempt to support `prototype === null`)
  var create = Object.create || function (prototype, properties) {
    var Prototype = function Prototype() {};
    Prototype.prototype = prototype;
    var object = new Prototype();
    if (typeof properties !== 'undefined') {
      keys(properties).forEach(function (key) {
        Value.defineByDescriptor(object, key, properties[key]);
      });
    }
    return object;
  };

  var supportsSubclassing = function (C, f) {
    if (!Object.setPrototypeOf) { return false; /* skip test on IE < 11 */ }
    return valueOrFalseIfThrows(function () {
      var Sub = function Subclass(arg) {
        var o = new C(arg);
        Object.setPrototypeOf(o, Subclass.prototype);
        return o;
      };
      Object.setPrototypeOf(Sub, C);
      Sub.prototype = create(C.prototype, {
        constructor: { value: Sub }
      });
      return f(Sub);
    });
  };

  var getGlobal = function () {
    /* global self, window, global */
    // the only reliable means to get the global object is
    // `Function('return this')()`
    // However, this causes CSP violations in Chrome apps.
    if (typeof self !== 'undefined') { return self; }
    if (typeof window !== 'undefined') { return window; }
    if (typeof commonjsGlobal !== 'undefined') { return commonjsGlobal; }
    throw new Error('unable to locate global object');
  };

  var globals = getGlobal();
  var globalIsFinite = globals.isFinite;
  var _indexOf = Function.call.bind(String.prototype.indexOf);
  var _arrayIndexOfApply = Function.apply.bind(Array.prototype.indexOf);
  var _concat = Function.call.bind(Array.prototype.concat);
  // var _sort = Function.call.bind(Array.prototype.sort);
  var _strSlice = Function.call.bind(String.prototype.slice);
  var _push = Function.call.bind(Array.prototype.push);
  var _pushApply = Function.apply.bind(Array.prototype.push);
  var _shift = Function.call.bind(Array.prototype.shift);
  var _max = Math.max;
  var _min = Math.min;
  var _floor = Math.floor;
  var _abs = Math.abs;
  var _exp = Math.exp;
  var _log = Math.log;
  var _sqrt = Math.sqrt;
  var _hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);
  var ArrayIterator; // make our implementation private
  var noop = function () {};

  var OrigMap = globals.Map;
  var origMapDelete = OrigMap && OrigMap.prototype['delete'];
  var origMapGet = OrigMap && OrigMap.prototype.get;
  var origMapHas = OrigMap && OrigMap.prototype.has;
  var origMapSet = OrigMap && OrigMap.prototype.set;

  var Symbol = globals.Symbol || {};
  var symbolSpecies = Symbol.species || '@@species';

  var numberIsNaN = Number.isNaN || function isNaN(value) {
    // NaN !== NaN, but they are identical.
    // NaNs are the only non-reflexive value, i.e., if x !== x,
    // then x is NaN.
    // isNaN is broken: it converts its argument to number, so
    // isNaN('foo') => true
    return value !== value;
  };
  var numberIsFinite = Number.isFinite || function isFinite(value) {
    return typeof value === 'number' && globalIsFinite(value);
  };
  var _sign = isCallable(Math.sign) ? Math.sign : function sign(value) {
    var number = Number(value);
    if (number === 0) { return number; }
    if (numberIsNaN(number)) { return number; }
    return number < 0 ? -1 : 1;
  };

  // taken directly from https://github.com/ljharb/is-arguments/blob/master/index.js
  // can be replaced with require('is-arguments') if we ever use a build process instead
  var isStandardArguments = function isArguments(value) {
    return _toString(value) === '[object Arguments]';
  };
  var isLegacyArguments = function isArguments(value) {
    return value !== null &&
      typeof value === 'object' &&
      typeof value.length === 'number' &&
      value.length >= 0 &&
      _toString(value) !== '[object Array]' &&
      _toString(value.callee) === '[object Function]';
  };
  var isArguments = isStandardArguments(arguments) ? isStandardArguments : isLegacyArguments;

  var Type = {
    primitive: function (x) { return x === null || (typeof x !== 'function' && typeof x !== 'object'); },
    string: function (x) { return _toString(x) === '[object String]'; },
    regex: function (x) { return _toString(x) === '[object RegExp]'; },
    symbol: function (x) {
      return typeof globals.Symbol === 'function' && typeof x === 'symbol';
    }
  };

  var overrideNative = function overrideNative(object, property, replacement) {
    var original = object[property];
    defineProperty(object, property, replacement, true);
    Value.preserveToString(object[property], original);
  };

  // eslint-disable-next-line no-restricted-properties
  var hasSymbols = typeof Symbol === 'function' && typeof Symbol['for'] === 'function' && Type.symbol(Symbol());

  // This is a private name in the es6 spec, equal to '[Symbol.iterator]'
  // we're going to use an arbitrary _-prefixed name to make our shims
  // work properly with each other, even though we don't have full Iterator
  // support.  That is, `Array.from(map.keys())` will work, but we don't
  // pretend to export a "real" Iterator interface.
  var $iterator$ = Type.symbol(Symbol.iterator) ? Symbol.iterator : '_es6-shim iterator_';
  // Firefox ships a partial implementation using the name @@iterator.
  // https://bugzilla.mozilla.org/show_bug.cgi?id=907077#c14
  // So use that name if we detect it.
  if (globals.Set && typeof new globals.Set()['@@iterator'] === 'function') {
    $iterator$ = '@@iterator';
  }

  // Reflect
  if (!globals.Reflect) {
    defineProperty(globals, 'Reflect', {}, true);
  }
  var Reflect = globals.Reflect;

  var $String = String;

  /* global document */
  var domAll = (typeof document === 'undefined' || !document) ? null : document.all;
  /* jshint eqnull:true */
  var isNullOrUndefined = domAll == null ? function isNullOrUndefined(x) {
    /* jshint eqnull:true */
    return x == null;
  } : function isNullOrUndefinedAndNotDocumentAll(x) {
    /* jshint eqnull:true */
    return x == null && x !== domAll;
  };

  var ES = {
    // http://www.ecma-international.org/ecma-262/6.0/#sec-call
    Call: function Call(F, V) {
      var args = arguments.length > 2 ? arguments[2] : [];
      if (!ES.IsCallable(F)) {
        throw new TypeError(F + ' is not a function');
      }
      return _apply(F, V, args);
    },

    RequireObjectCoercible: function (x, optMessage) {
      if (isNullOrUndefined(x)) {
        throw new TypeError(optMessage || 'Cannot call method on ' + x);
      }
      return x;
    },

    // This might miss the "(non-standard exotic and does not implement
    // [[Call]])" case from
    // http://www.ecma-international.org/ecma-262/6.0/#sec-typeof-operator-runtime-semantics-evaluation
    // but we can't find any evidence these objects exist in practice.
    // If we find some in the future, you could test `Object(x) === x`,
    // which is reliable according to
    // http://www.ecma-international.org/ecma-262/6.0/#sec-toobject
    // but is not well optimized by runtimes and creates an object
    // whenever it returns false, and thus is very slow.
    TypeIsObject: function (x) {
      if (x === void 0 || x === null || x === true || x === false) {
        return false;
      }
      return typeof x === 'function' || typeof x === 'object' || x === domAll;
    },

    ToObject: function (o, optMessage) {
      return Object(ES.RequireObjectCoercible(o, optMessage));
    },

    IsCallable: isCallable,

    IsConstructor: function (x) {
      // We can't tell callables from constructors in ES5
      return ES.IsCallable(x);
    },

    ToInt32: function (x) {
      return ES.ToNumber(x) >> 0;
    },

    ToUint32: function (x) {
      return ES.ToNumber(x) >>> 0;
    },

    ToNumber: function (value) {
      if (_toString(value) === '[object Symbol]') {
        throw new TypeError('Cannot convert a Symbol value to a number');
      }
      return +value;
    },

    ToInteger: function (value) {
      var number = ES.ToNumber(value);
      if (numberIsNaN(number)) { return 0; }
      if (number === 0 || !numberIsFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * _floor(_abs(number));
    },

    ToLength: function (value) {
      var len = ES.ToInteger(value);
      if (len <= 0) { return 0; } // includes converting -0 to +0
      if (len > Number.MAX_SAFE_INTEGER) { return Number.MAX_SAFE_INTEGER; }
      return len;
    },

    SameValue: function (a, b) {
      if (a === b) {
        // 0 === -0, but they are not identical.
        if (a === 0) { return 1 / a === 1 / b; }
        return true;
      }
      return numberIsNaN(a) && numberIsNaN(b);
    },

    SameValueZero: function (a, b) {
      // same as SameValue except for SameValueZero(+0, -0) == true
      return (a === b) || (numberIsNaN(a) && numberIsNaN(b));
    },

    IsIterable: function (o) {
      return ES.TypeIsObject(o) && (typeof o[$iterator$] !== 'undefined' || isArguments(o));
    },

    GetIterator: function (o) {
      if (isArguments(o)) {
        // special case support for `arguments`
        return new ArrayIterator(o, 'value');
      }
      var itFn = ES.GetMethod(o, $iterator$);
      if (!ES.IsCallable(itFn)) {
        // Better diagnostics if itFn is null or undefined
        throw new TypeError('value is not an iterable');
      }
      var it = ES.Call(itFn, o);
      if (!ES.TypeIsObject(it)) {
        throw new TypeError('bad iterator');
      }
      return it;
    },

    GetMethod: function (o, p) {
      var func = ES.ToObject(o)[p];
      if (isNullOrUndefined(func)) {
        return void 0;
      }
      if (!ES.IsCallable(func)) {
        throw new TypeError('Method not callable: ' + p);
      }
      return func;
    },

    IteratorComplete: function (iterResult) {
      return !!iterResult.done;
    },

    IteratorClose: function (iterator, completionIsThrow) {
      var returnMethod = ES.GetMethod(iterator, 'return');
      if (returnMethod === void 0) {
        return;
      }
      var innerResult, innerException;
      try {
        innerResult = ES.Call(returnMethod, iterator);
      } catch (e) {
        innerException = e;
      }
      if (completionIsThrow) {
        return;
      }
      if (innerException) {
        throw innerException;
      }
      if (!ES.TypeIsObject(innerResult)) {
        throw new TypeError("Iterator's return method returned a non-object.");
      }
    },

    IteratorNext: function (it) {
      var result = arguments.length > 1 ? it.next(arguments[1]) : it.next();
      if (!ES.TypeIsObject(result)) {
        throw new TypeError('bad iterator');
      }
      return result;
    },

    IteratorStep: function (it) {
      var result = ES.IteratorNext(it);
      var done = ES.IteratorComplete(result);
      return done ? false : result;
    },

    Construct: function (C, args, newTarget, isES6internal) {
      var target = typeof newTarget === 'undefined' ? C : newTarget;

      if (!isES6internal && Reflect.construct) {
        // Try to use Reflect.construct if available
        return Reflect.construct(C, args, target);
      }
      // OK, we have to fake it.  This will only work if the
      // C.[[ConstructorKind]] == "base" -- but that's the only
      // kind we can make in ES5 code anyway.

      // OrdinaryCreateFromConstructor(target, "%ObjectPrototype%")
      var proto = target.prototype;
      if (!ES.TypeIsObject(proto)) {
        proto = Object.prototype;
      }
      var obj = create(proto);
      // Call the constructor.
      var result = ES.Call(C, obj, args);
      return ES.TypeIsObject(result) ? result : obj;
    },

    SpeciesConstructor: function (O, defaultConstructor) {
      var C = O.constructor;
      if (C === void 0) {
        return defaultConstructor;
      }
      if (!ES.TypeIsObject(C)) {
        throw new TypeError('Bad constructor');
      }
      var S = C[symbolSpecies];
      if (isNullOrUndefined(S)) {
        return defaultConstructor;
      }
      if (!ES.IsConstructor(S)) {
        throw new TypeError('Bad @@species');
      }
      return S;
    },

    CreateHTML: function (string, tag, attribute, value) {
      var S = ES.ToString(string);
      var p1 = '<' + tag;
      if (attribute !== '') {
        var V = ES.ToString(value);
        var escapedV = V.replace(/"/g, '&quot;');
        p1 += ' ' + attribute + '="' + escapedV + '"';
      }
      var p2 = p1 + '>';
      var p3 = p2 + S;
      return p3 + '</' + tag + '>';
    },

    IsRegExp: function IsRegExp(argument) {
      if (!ES.TypeIsObject(argument)) {
        return false;
      }
      var isRegExp = argument[Symbol.match];
      if (typeof isRegExp !== 'undefined') {
        return !!isRegExp;
      }
      return Type.regex(argument);
    },

    ToString: function ToString(string) {
      return $String(string);
    }
  };

  // Well-known Symbol shims
  if (supportsDescriptors && hasSymbols) {
    var defineWellKnownSymbol = function defineWellKnownSymbol(name) {
      if (Type.symbol(Symbol[name])) {
        return Symbol[name];
      }
      // eslint-disable-next-line no-restricted-properties
      var sym = Symbol['for']('Symbol.' + name);
      Object.defineProperty(Symbol, name, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: sym
      });
      return sym;
    };
    if (!Type.symbol(Symbol.search)) {
      var symbolSearch = defineWellKnownSymbol('search');
      var originalSearch = String.prototype.search;
      defineProperty(RegExp.prototype, symbolSearch, function search(string) {
        return ES.Call(originalSearch, string, [this]);
      });
      var searchShim = function search(regexp) {
        var O = ES.RequireObjectCoercible(this);
        if (!isNullOrUndefined(regexp)) {
          var searcher = ES.GetMethod(regexp, symbolSearch);
          if (typeof searcher !== 'undefined') {
            return ES.Call(searcher, regexp, [O]);
          }
        }
        return ES.Call(originalSearch, O, [ES.ToString(regexp)]);
      };
      overrideNative(String.prototype, 'search', searchShim);
    }
    if (!Type.symbol(Symbol.replace)) {
      var symbolReplace = defineWellKnownSymbol('replace');
      var originalReplace = String.prototype.replace;
      defineProperty(RegExp.prototype, symbolReplace, function replace(string, replaceValue) {
        return ES.Call(originalReplace, string, [this, replaceValue]);
      });
      var replaceShim = function replace(searchValue, replaceValue) {
        var O = ES.RequireObjectCoercible(this);
        if (!isNullOrUndefined(searchValue)) {
          var replacer = ES.GetMethod(searchValue, symbolReplace);
          if (typeof replacer !== 'undefined') {
            return ES.Call(replacer, searchValue, [O, replaceValue]);
          }
        }
        return ES.Call(originalReplace, O, [ES.ToString(searchValue), replaceValue]);
      };
      overrideNative(String.prototype, 'replace', replaceShim);
    }
    if (!Type.symbol(Symbol.split)) {
      var symbolSplit = defineWellKnownSymbol('split');
      var originalSplit = String.prototype.split;
      defineProperty(RegExp.prototype, symbolSplit, function split(string, limit) {
        return ES.Call(originalSplit, string, [this, limit]);
      });
      var splitShim = function split(separator, limit) {
        var O = ES.RequireObjectCoercible(this);
        if (!isNullOrUndefined(separator)) {
          var splitter = ES.GetMethod(separator, symbolSplit);
          if (typeof splitter !== 'undefined') {
            return ES.Call(splitter, separator, [O, limit]);
          }
        }
        return ES.Call(originalSplit, O, [ES.ToString(separator), limit]);
      };
      overrideNative(String.prototype, 'split', splitShim);
    }
    var symbolMatchExists = Type.symbol(Symbol.match);
    var stringMatchIgnoresSymbolMatch = symbolMatchExists && (function () {
      // Firefox 41, through Nightly 45 has Symbol.match, but String#match ignores it.
      // Firefox 40 and below have Symbol.match but String#match works fine.
      var o = {};
      o[Symbol.match] = function () { return 42; };
      return 'a'.match(o) !== 42;
    }());
    if (!symbolMatchExists || stringMatchIgnoresSymbolMatch) {
      var symbolMatch = defineWellKnownSymbol('match');

      var originalMatch = String.prototype.match;
      defineProperty(RegExp.prototype, symbolMatch, function match(string) {
        return ES.Call(originalMatch, string, [this]);
      });

      var matchShim = function match(regexp) {
        var O = ES.RequireObjectCoercible(this);
        if (!isNullOrUndefined(regexp)) {
          var matcher = ES.GetMethod(regexp, symbolMatch);
          if (typeof matcher !== 'undefined') {
            return ES.Call(matcher, regexp, [O]);
          }
        }
        return ES.Call(originalMatch, O, [ES.ToString(regexp)]);
      };
      overrideNative(String.prototype, 'match', matchShim);
    }
  }

  var wrapConstructor = function wrapConstructor(original, replacement, keysToSkip) {
    Value.preserveToString(replacement, original);
    if (Object.setPrototypeOf) {
      // sets up proper prototype chain where possible
      Object.setPrototypeOf(original, replacement);
    }
    if (supportsDescriptors) {
      _forEach(Object.getOwnPropertyNames(original), function (key) {
        if (key in noop || keysToSkip[key]) { return; }
        Value.proxy(original, key, replacement);
      });
    } else {
      _forEach(Object.keys(original), function (key) {
        if (key in noop || keysToSkip[key]) { return; }
        replacement[key] = original[key];
      });
    }
    replacement.prototype = original.prototype;
    Value.redefine(original.prototype, 'constructor', replacement);
  };

  var defaultSpeciesGetter = function () { return this; };
  var addDefaultSpecies = function (C) {
    if (supportsDescriptors && !_hasOwnProperty(C, symbolSpecies)) {
      Value.getter(C, symbolSpecies, defaultSpeciesGetter);
    }
  };

  var addIterator = function (prototype, impl) {
    var implementation = impl || function iterator() { return this; };
    defineProperty(prototype, $iterator$, implementation);
    if (!prototype[$iterator$] && Type.symbol($iterator$)) {
      // implementations are buggy when $iterator$ is a Symbol
      prototype[$iterator$] = implementation;
    }
  };

  var createDataProperty = function createDataProperty(object, name, value) {
    if (supportsDescriptors) {
      Object.defineProperty(object, name, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: value
      });
    } else {
      object[name] = value;
    }
  };
  var createDataPropertyOrThrow = function createDataPropertyOrThrow(object, name, value) {
    createDataProperty(object, name, value);
    if (!ES.SameValue(object[name], value)) {
      throw new TypeError('property is nonconfigurable');
    }
  };

  var emulateES6construct = function (o, defaultNewTarget, defaultProto, slots) {
    // This is an es5 approximation to es6 construct semantics.  in es6,
    // 'new Foo' invokes Foo.[[Construct]] which (for almost all objects)
    // just sets the internal variable NewTarget (in es6 syntax `new.target`)
    // to Foo and then returns Foo().

    // Many ES6 object then have constructors of the form:
    // 1. If NewTarget is undefined, throw a TypeError exception
    // 2. Let xxx by OrdinaryCreateFromConstructor(NewTarget, yyy, zzz)

    // So we're going to emulate those first two steps.
    if (!ES.TypeIsObject(o)) {
      throw new TypeError('Constructor requires `new`: ' + defaultNewTarget.name);
    }
    var proto = defaultNewTarget.prototype;
    if (!ES.TypeIsObject(proto)) {
      proto = defaultProto;
    }
    var obj = create(proto);
    for (var name in slots) {
      if (_hasOwnProperty(slots, name)) {
        var value = slots[name];
        defineProperty(obj, name, value, true);
      }
    }
    return obj;
  };

  // Firefox 31 reports this function's length as 0
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1062484
  if (String.fromCodePoint && String.fromCodePoint.length !== 1) {
    var originalFromCodePoint = String.fromCodePoint;
    overrideNative(String, 'fromCodePoint', function fromCodePoint(codePoints) {
      return ES.Call(originalFromCodePoint, this, arguments);
    });
  }

  var StringShims = {
    fromCodePoint: function fromCodePoint(codePoints) {
      var arguments$1 = arguments;

      var result = [];
      var next;
      for (var i = 0, length = arguments.length; i < length; i++) {
        next = Number(arguments$1[i]);
        if (!ES.SameValue(next, ES.ToInteger(next)) || next < 0 || next > 0x10FFFF) {
          throw new RangeError('Invalid code point ' + next);
        }

        if (next < 0x10000) {
          _push(result, String.fromCharCode(next));
        } else {
          next -= 0x10000;
          _push(result, String.fromCharCode((next >> 10) + 0xD800));
          _push(result, String.fromCharCode((next % 0x400) + 0xDC00));
        }
      }
      return result.join('');
    },

    raw: function raw(callSite) {
      var arguments$1 = arguments;

      var cooked = ES.ToObject(callSite, 'bad callSite');
      var rawString = ES.ToObject(cooked.raw, 'bad raw value');
      var len = rawString.length;
      var literalsegments = ES.ToLength(len);
      if (literalsegments <= 0) {
        return '';
      }

      var stringElements = [];
      var nextIndex = 0;
      var nextKey, next, nextSeg, nextSub;
      while (nextIndex < literalsegments) {
        nextKey = ES.ToString(nextIndex);
        nextSeg = ES.ToString(rawString[nextKey]);
        _push(stringElements, nextSeg);
        if (nextIndex + 1 >= literalsegments) {
          break;
        }
        next = nextIndex + 1 < arguments$1.length ? arguments$1[nextIndex + 1] : '';
        nextSub = ES.ToString(next);
        _push(stringElements, nextSub);
        nextIndex += 1;
      }
      return stringElements.join('');
    }
  };
  if (String.raw && String.raw({ raw: { 0: 'x', 1: 'y', length: 2 } }) !== 'xy') {
    // IE 11 TP has a broken String.raw implementation
    overrideNative(String, 'raw', StringShims.raw);
  }
  defineProperties(String, StringShims);

  // Fast repeat, uses the `Exponentiation by squaring` algorithm.
  // Perf: http://jsperf.com/string-repeat2/2
  var stringRepeat = function repeat(s, times) {
    if (times < 1) { return ''; }
    if (times % 2) { return repeat(s, times - 1) + s; }
    var half = repeat(s, times / 2);
    return half + half;
  };
  var stringMaxLength = Infinity;

  var StringPrototypeShims = {
    repeat: function repeat(times) {
      var thisStr = ES.ToString(ES.RequireObjectCoercible(this));
      var numTimes = ES.ToInteger(times);
      if (numTimes < 0 || numTimes >= stringMaxLength) {
        throw new RangeError('repeat count must be less than infinity and not overflow maximum string size');
      }
      return stringRepeat(thisStr, numTimes);
    },

    startsWith: function startsWith(searchString) {
      var S = ES.ToString(ES.RequireObjectCoercible(this));
      if (ES.IsRegExp(searchString)) {
        throw new TypeError('Cannot call method "startsWith" with a regex');
      }
      var searchStr = ES.ToString(searchString);
      var position;
      if (arguments.length > 1) {
        position = arguments[1];
      }
      var start = _max(ES.ToInteger(position), 0);
      return _strSlice(S, start, start + searchStr.length) === searchStr;
    },

    endsWith: function endsWith(searchString) {
      var S = ES.ToString(ES.RequireObjectCoercible(this));
      if (ES.IsRegExp(searchString)) {
        throw new TypeError('Cannot call method "endsWith" with a regex');
      }
      var searchStr = ES.ToString(searchString);
      var len = S.length;
      var endPosition;
      if (arguments.length > 1) {
        endPosition = arguments[1];
      }
      var pos = typeof endPosition === 'undefined' ? len : ES.ToInteger(endPosition);
      var end = _min(_max(pos, 0), len);
      return _strSlice(S, end - searchStr.length, end) === searchStr;
    },

    includes: function includes(searchString) {
      if (ES.IsRegExp(searchString)) {
        throw new TypeError('"includes" does not accept a RegExp');
      }
      var searchStr = ES.ToString(searchString);
      var position;
      if (arguments.length > 1) {
        position = arguments[1];
      }
      // Somehow this trick makes method 100% compat with the spec.
      return _indexOf(this, searchStr, position) !== -1;
    },

    codePointAt: function codePointAt(pos) {
      var thisStr = ES.ToString(ES.RequireObjectCoercible(this));
      var position = ES.ToInteger(pos);
      var length = thisStr.length;
      if (position >= 0 && position < length) {
        var first = thisStr.charCodeAt(position);
        var isEnd = position + 1 === length;
        if (first < 0xD800 || first > 0xDBFF || isEnd) { return first; }
        var second = thisStr.charCodeAt(position + 1);
        if (second < 0xDC00 || second > 0xDFFF) { return first; }
        return ((first - 0xD800) * 1024) + (second - 0xDC00) + 0x10000;
      }
    }
  };
  if (String.prototype.includes && 'a'.includes('a', Infinity) !== false) {
    overrideNative(String.prototype, 'includes', StringPrototypeShims.includes);
  }

  if (String.prototype.startsWith && String.prototype.endsWith) {
    var startsWithRejectsRegex = throwsError(function () {
      /* throws if spec-compliant */
      '/a/'.startsWith(/a/);
    });
    var startsWithHandlesInfinity = valueOrFalseIfThrows(function () {
      return 'abc'.startsWith('a', Infinity) === false;
    });
    if (!startsWithRejectsRegex || !startsWithHandlesInfinity) {
      // Firefox (< 37?) and IE 11 TP have a noncompliant startsWith implementation
      overrideNative(String.prototype, 'startsWith', StringPrototypeShims.startsWith);
      overrideNative(String.prototype, 'endsWith', StringPrototypeShims.endsWith);
    }
  }
  if (hasSymbols) {
    var startsWithSupportsSymbolMatch = valueOrFalseIfThrows(function () {
      var re = /a/;
      re[Symbol.match] = false;
      return '/a/'.startsWith(re);
    });
    if (!startsWithSupportsSymbolMatch) {
      overrideNative(String.prototype, 'startsWith', StringPrototypeShims.startsWith);
    }
    var endsWithSupportsSymbolMatch = valueOrFalseIfThrows(function () {
      var re = /a/;
      re[Symbol.match] = false;
      return '/a/'.endsWith(re);
    });
    if (!endsWithSupportsSymbolMatch) {
      overrideNative(String.prototype, 'endsWith', StringPrototypeShims.endsWith);
    }
    var includesSupportsSymbolMatch = valueOrFalseIfThrows(function () {
      var re = /a/;
      re[Symbol.match] = false;
      return '/a/'.includes(re);
    });
    if (!includesSupportsSymbolMatch) {
      overrideNative(String.prototype, 'includes', StringPrototypeShims.includes);
    }
  }

  defineProperties(String.prototype, StringPrototypeShims);

  // whitespace from: http://es5.github.io/#x15.5.4.20
  // implementation from https://github.com/es-shims/es5-shim/blob/v3.4.0/es5-shim.js#L1304-L1324
  var ws = [
    '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003',
    '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028',
    '\u2029\uFEFF'
  ].join('');
  var trimRegexp = new RegExp('(^[' + ws + ']+)|([' + ws + ']+$)', 'g');
  var trimShim = function trim() {
    return ES.ToString(ES.RequireObjectCoercible(this)).replace(trimRegexp, '');
  };
  var nonWS = ['\u0085', '\u200b', '\ufffe'].join('');
  var nonWSregex = new RegExp('[' + nonWS + ']', 'g');
  var isBadHexRegex = /^[-+]0x[0-9a-f]+$/i;
  var hasStringTrimBug = nonWS.trim().length !== nonWS.length;
  defineProperty(String.prototype, 'trim', trimShim, hasStringTrimBug);

  // Given an argument x, it will return an IteratorResult object,
  // with value set to x and done to false.
  // Given no arguments, it will return an iterator completion object.
  var iteratorResult = function (x) {
    return { value: x, done: arguments.length === 0 };
  };

  // see http://www.ecma-international.org/ecma-262/6.0/#sec-string.prototype-@@iterator
  var StringIterator = function (s) {
    ES.RequireObjectCoercible(s);
    this._s = ES.ToString(s);
    this._i = 0;
  };
  StringIterator.prototype.next = function () {
    var s = this._s;
    var i = this._i;
    if (typeof s === 'undefined' || i >= s.length) {
      this._s = void 0;
      return iteratorResult();
    }
    var first = s.charCodeAt(i);
    var second, len;
    if (first < 0xD800 || first > 0xDBFF || (i + 1) === s.length) {
      len = 1;
    } else {
      second = s.charCodeAt(i + 1);
      len = (second < 0xDC00 || second > 0xDFFF) ? 1 : 2;
    }
    this._i = i + len;
    return iteratorResult(s.substr(i, len));
  };
  addIterator(StringIterator.prototype);
  addIterator(String.prototype, function () {
    return new StringIterator(this);
  });

  var ArrayShims = {
    from: function from(items) {
      var C = this;
      var mapFn;
      if (arguments.length > 1) {
        mapFn = arguments[1];
      }
      var mapping, T;
      if (typeof mapFn === 'undefined') {
        mapping = false;
      } else {
        if (!ES.IsCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }
        if (arguments.length > 2) {
          T = arguments[2];
        }
        mapping = true;
      }

      // Note that that Arrays will use ArrayIterator:
      // https://bugs.ecmascript.org/show_bug.cgi?id=2416
      var usingIterator = typeof (isArguments(items) || ES.GetMethod(items, $iterator$)) !== 'undefined';

      var length, result, i;
      if (usingIterator) {
        result = ES.IsConstructor(C) ? Object(new C()) : [];
        var iterator = ES.GetIterator(items);
        var next, nextValue;

        i = 0;
        while (true) {
          next = ES.IteratorStep(iterator);
          if (next === false) {
            break;
          }
          nextValue = next.value;
          try {
            if (mapping) {
              nextValue = typeof T === 'undefined' ? mapFn(nextValue, i) : _call(mapFn, T, nextValue, i);
            }
            result[i] = nextValue;
          } catch (e) {
            ES.IteratorClose(iterator, true);
            throw e;
          }
          i += 1;
        }
        length = i;
      } else {
        var arrayLike = ES.ToObject(items);
        length = ES.ToLength(arrayLike.length);
        result = ES.IsConstructor(C) ? Object(new C(length)) : new Array(length);
        var value;
        for (i = 0; i < length; ++i) {
          value = arrayLike[i];
          if (mapping) {
            value = typeof T === 'undefined' ? mapFn(value, i) : _call(mapFn, T, value, i);
          }
          createDataPropertyOrThrow(result, i, value);
        }
      }

      result.length = length;
      return result;
    },

    of: function of() {
      var arguments$1 = arguments;

      var len = arguments.length;
      var C = this;
      var A = isArray(C) || !ES.IsCallable(C) ? new Array(len) : ES.Construct(C, [len]);
      for (var k = 0; k < len; ++k) {
        createDataPropertyOrThrow(A, k, arguments$1[k]);
      }
      A.length = len;
      return A;
    }
  };
  defineProperties(Array, ArrayShims);
  addDefaultSpecies(Array);

  // Our ArrayIterator is private; see
  // https://github.com/paulmillr/es6-shim/issues/252
  ArrayIterator = function (array, kind) {
    this.i = 0;
    this.array = array;
    this.kind = kind;
  };

  defineProperties(ArrayIterator.prototype, {
    next: function () {
      var this$1 = this;

      var i = this.i;
      var array = this.array;
      if (!(this instanceof ArrayIterator)) {
        throw new TypeError('Not an ArrayIterator');
      }
      if (typeof array !== 'undefined') {
        var len = ES.ToLength(array.length);
        for (; i < len; i++) {
          var kind = this$1.kind;
          var retval;
          if (kind === 'key') {
            retval = i;
          } else if (kind === 'value') {
            retval = array[i];
          } else if (kind === 'entry') {
            retval = [i, array[i]];
          }
          this$1.i = i + 1;
          return iteratorResult(retval);
        }
      }
      this.array = void 0;
      return iteratorResult();
    }
  });
  addIterator(ArrayIterator.prototype);

/*
  var orderKeys = function orderKeys(a, b) {
    var aNumeric = String(ES.ToInteger(a)) === a;
    var bNumeric = String(ES.ToInteger(b)) === b;
    if (aNumeric && bNumeric) {
      return b - a;
    } else if (aNumeric && !bNumeric) {
      return -1;
    } else if (!aNumeric && bNumeric) {
      return 1;
    } else {
      return a.localeCompare(b);
    }
  };

  var getAllKeys = function getAllKeys(object) {
    var ownKeys = [];
    var keys = [];

    for (var key in object) {
      _push(_hasOwnProperty(object, key) ? ownKeys : keys, key);
    }
    _sort(ownKeys, orderKeys);
    _sort(keys, orderKeys);

    return _concat(ownKeys, keys);
  };
  */

  // note: this is positioned here because it depends on ArrayIterator
  var arrayOfSupportsSubclassing = Array.of === ArrayShims.of || (function () {
    // Detects a bug in Webkit nightly r181886
    var Foo = function Foo(len) { this.length = len; };
    Foo.prototype = [];
    var fooArr = Array.of.apply(Foo, [1, 2]);
    return fooArr instanceof Foo && fooArr.length === 2;
  }());
  if (!arrayOfSupportsSubclassing) {
    overrideNative(Array, 'of', ArrayShims.of);
  }

  var ArrayPrototypeShims = {
    copyWithin: function copyWithin(target, start) {
      var o = ES.ToObject(this);
      var len = ES.ToLength(o.length);
      var relativeTarget = ES.ToInteger(target);
      var relativeStart = ES.ToInteger(start);
      var to = relativeTarget < 0 ? _max(len + relativeTarget, 0) : _min(relativeTarget, len);
      var from = relativeStart < 0 ? _max(len + relativeStart, 0) : _min(relativeStart, len);
      var end;
      if (arguments.length > 2) {
        end = arguments[2];
      }
      var relativeEnd = typeof end === 'undefined' ? len : ES.ToInteger(end);
      var finalItem = relativeEnd < 0 ? _max(len + relativeEnd, 0) : _min(relativeEnd, len);
      var count = _min(finalItem - from, len - to);
      var direction = 1;
      if (from < to && to < (from + count)) {
        direction = -1;
        from += count - 1;
        to += count - 1;
      }
      while (count > 0) {
        if (from in o) {
          o[to] = o[from];
        } else {
          delete o[to];
        }
        from += direction;
        to += direction;
        count -= 1;
      }
      return o;
    },

    fill: function fill(value) {
      var start;
      if (arguments.length > 1) {
        start = arguments[1];
      }
      var end;
      if (arguments.length > 2) {
        end = arguments[2];
      }
      var O = ES.ToObject(this);
      var len = ES.ToLength(O.length);
      start = ES.ToInteger(typeof start === 'undefined' ? 0 : start);
      end = ES.ToInteger(typeof end === 'undefined' ? len : end);

      var relativeStart = start < 0 ? _max(len + start, 0) : _min(start, len);
      var relativeEnd = end < 0 ? len + end : end;

      for (var i = relativeStart; i < len && i < relativeEnd; ++i) {
        O[i] = value;
      }
      return O;
    },

    find: function find(predicate) {
      var list = ES.ToObject(this);
      var length = ES.ToLength(list.length);
      if (!ES.IsCallable(predicate)) {
        throw new TypeError('Array#find: predicate must be a function');
      }
      var thisArg = arguments.length > 1 ? arguments[1] : null;
      for (var i = 0, value; i < length; i++) {
        value = list[i];
        if (thisArg) {
          if (_call(predicate, thisArg, value, i, list)) {
            return value;
          }
        } else if (predicate(value, i, list)) {
          return value;
        }
      }
    },

    findIndex: function findIndex(predicate) {
      var list = ES.ToObject(this);
      var length = ES.ToLength(list.length);
      if (!ES.IsCallable(predicate)) {
        throw new TypeError('Array#findIndex: predicate must be a function');
      }
      var thisArg = arguments.length > 1 ? arguments[1] : null;
      for (var i = 0; i < length; i++) {
        if (thisArg) {
          if (_call(predicate, thisArg, list[i], i, list)) {
            return i;
          }
        } else if (predicate(list[i], i, list)) {
          return i;
        }
      }
      return -1;
    },

    keys: function keys() {
      return new ArrayIterator(this, 'key');
    },

    values: function values() {
      return new ArrayIterator(this, 'value');
    },

    entries: function entries() {
      return new ArrayIterator(this, 'entry');
    }
  };
  // Safari 7.1 defines Array#keys and Array#entries natively,
  // but the resulting ArrayIterator objects don't have a "next" method.
  if (Array.prototype.keys && !ES.IsCallable([1].keys().next)) {
    delete Array.prototype.keys;
  }
  if (Array.prototype.entries && !ES.IsCallable([1].entries().next)) {
    delete Array.prototype.entries;
  }

  // Chrome 38 defines Array#keys and Array#entries, and Array#@@iterator, but not Array#values
  if (Array.prototype.keys && Array.prototype.entries && !Array.prototype.values && Array.prototype[$iterator$]) {
    defineProperties(Array.prototype, {
      values: Array.prototype[$iterator$]
    });
    if (Type.symbol(Symbol.unscopables)) {
      Array.prototype[Symbol.unscopables].values = true;
    }
  }
  // Chrome 40 defines Array#values with the incorrect name, although Array#{keys,entries} have the correct name
  if (functionsHaveNames && Array.prototype.values && Array.prototype.values.name !== 'values') {
    var originalArrayPrototypeValues = Array.prototype.values;
    overrideNative(Array.prototype, 'values', function values() { return ES.Call(originalArrayPrototypeValues, this, arguments); });
    defineProperty(Array.prototype, $iterator$, Array.prototype.values, true);
  }
  defineProperties(Array.prototype, ArrayPrototypeShims);

  if (1 / [true].indexOf(true, -0) < 0) {
    // indexOf when given a position arg of -0 should return +0.
    // https://github.com/tc39/ecma262/pull/316
    defineProperty(Array.prototype, 'indexOf', function indexOf(searchElement) {
      var value = _arrayIndexOfApply(this, arguments);
      if (value === 0 && (1 / value) < 0) {
        return 0;
      }
      return value;
    }, true);
  }

  addIterator(Array.prototype, function () { return this.values(); });
  // Chrome defines keys/values/entries on Array, but doesn't give us
  // any way to identify its iterator.  So add our own shimmed field.
  if (Object.getPrototypeOf) {
    addIterator(Object.getPrototypeOf([].values()));
  }

  // note: this is positioned here because it relies on Array#entries
  var arrayFromSwallowsNegativeLengths = (function () {
    // Detects a Firefox bug in v32
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1063993
    return valueOrFalseIfThrows(function () {
      return Array.from({ length: -1 }).length === 0;
    });
  }());
  var arrayFromHandlesIterables = (function () {
    // Detects a bug in Webkit nightly r181886
    var arr = Array.from([0].entries());
    return arr.length === 1 && isArray(arr[0]) && arr[0][0] === 0 && arr[0][1] === 0;
  }());
  if (!arrayFromSwallowsNegativeLengths || !arrayFromHandlesIterables) {
    overrideNative(Array, 'from', ArrayShims.from);
  }
  var arrayFromHandlesUndefinedMapFunction = (function () {
    // Microsoft Edge v0.11 throws if the mapFn argument is *provided* but undefined,
    // but the spec doesn't care if it's provided or not - undefined doesn't throw.
    return valueOrFalseIfThrows(function () {
      return Array.from([0], void 0);
    });
  }());
  if (!arrayFromHandlesUndefinedMapFunction) {
    var origArrayFrom = Array.from;
    overrideNative(Array, 'from', function from(items) {
      if (arguments.length > 1 && typeof arguments[1] !== 'undefined') {
        return ES.Call(origArrayFrom, this, arguments);
      } else {
        return _call(origArrayFrom, this, items);
      }
    });
  }

  var int32sAsOne = -(Math.pow(2, 32) - 1);
  var toLengthsCorrectly = function (method, reversed) {
    var obj = { length: int32sAsOne };
    obj[reversed ? (obj.length >>> 0) - 1 : 0] = true;
    return valueOrFalseIfThrows(function () {
      _call(method, obj, function () {
        // note: in nonconforming browsers, this will be called
        // -1 >>> 0 times, which is 4294967295, so the throw matters.
        throw new RangeError('should not reach here');
      }, []);
      return true;
    });
  };
  if (!toLengthsCorrectly(Array.prototype.forEach)) {
    var originalForEach = Array.prototype.forEach;
    overrideNative(Array.prototype, 'forEach', function forEach(callbackFn) {
      return ES.Call(originalForEach, this.length >= 0 ? this : [], arguments);
    }, true);
  }
  if (!toLengthsCorrectly(Array.prototype.map)) {
    var originalMap = Array.prototype.map;
    overrideNative(Array.prototype, 'map', function map(callbackFn) {
      return ES.Call(originalMap, this.length >= 0 ? this : [], arguments);
    }, true);
  }
  if (!toLengthsCorrectly(Array.prototype.filter)) {
    var originalFilter = Array.prototype.filter;
    overrideNative(Array.prototype, 'filter', function filter(callbackFn) {
      return ES.Call(originalFilter, this.length >= 0 ? this : [], arguments);
    }, true);
  }
  if (!toLengthsCorrectly(Array.prototype.some)) {
    var originalSome = Array.prototype.some;
    overrideNative(Array.prototype, 'some', function some(callbackFn) {
      return ES.Call(originalSome, this.length >= 0 ? this : [], arguments);
    }, true);
  }
  if (!toLengthsCorrectly(Array.prototype.every)) {
    var originalEvery = Array.prototype.every;
    overrideNative(Array.prototype, 'every', function every(callbackFn) {
      return ES.Call(originalEvery, this.length >= 0 ? this : [], arguments);
    }, true);
  }
  if (!toLengthsCorrectly(Array.prototype.reduce)) {
    var originalReduce = Array.prototype.reduce;
    overrideNative(Array.prototype, 'reduce', function reduce(callbackFn) {
      return ES.Call(originalReduce, this.length >= 0 ? this : [], arguments);
    }, true);
  }
  if (!toLengthsCorrectly(Array.prototype.reduceRight, true)) {
    var originalReduceRight = Array.prototype.reduceRight;
    overrideNative(Array.prototype, 'reduceRight', function reduceRight(callbackFn) {
      return ES.Call(originalReduceRight, this.length >= 0 ? this : [], arguments);
    }, true);
  }

  var lacksOctalSupport = Number('0o10') !== 8;
  var lacksBinarySupport = Number('0b10') !== 2;
  var trimsNonWhitespace = _some(nonWS, function (c) {
    return Number(c + 0 + c) === 0;
  });
  if (lacksOctalSupport || lacksBinarySupport || trimsNonWhitespace) {
    var OrigNumber = Number;
    var binaryRegex = /^0b[01]+$/i;
    var octalRegex = /^0o[0-7]+$/i;
    // Note that in IE 8, RegExp.prototype.test doesn't seem to exist: ie, "test" is an own property of regexes. wtf.
    var isBinary = binaryRegex.test.bind(binaryRegex);
    var isOctal = octalRegex.test.bind(octalRegex);
    var toPrimitive = function (O) { // need to replace this with `es-to-primitive/es6`
      var result;
      if (typeof O.valueOf === 'function') {
        result = O.valueOf();
        if (Type.primitive(result)) {
          return result;
        }
      }
      if (typeof O.toString === 'function') {
        result = O.toString();
        if (Type.primitive(result)) {
          return result;
        }
      }
      throw new TypeError('No default value');
    };
    var hasNonWS = nonWSregex.test.bind(nonWSregex);
    var isBadHex = isBadHexRegex.test.bind(isBadHexRegex);
    var NumberShim = (function () {
      // this is wrapped in an IIFE because of IE 6-8's wacky scoping issues with named function expressions.
      var NumberShim = function Number(value) {
        var primValue;
        if (arguments.length > 0) {
          primValue = Type.primitive(value) ? value : toPrimitive(value, 'number');
        } else {
          primValue = 0;
        }
        if (typeof primValue === 'string') {
          primValue = ES.Call(trimShim, primValue);
          if (isBinary(primValue)) {
            primValue = parseInt(_strSlice(primValue, 2), 2);
          } else if (isOctal(primValue)) {
            primValue = parseInt(_strSlice(primValue, 2), 8);
          } else if (hasNonWS(primValue) || isBadHex(primValue)) {
            primValue = NaN;
          }
        }
        var receiver = this;
        var valueOfSucceeds = valueOrFalseIfThrows(function () {
          OrigNumber.prototype.valueOf.call(receiver);
          return true;
        });
        if (receiver instanceof NumberShim && !valueOfSucceeds) {
          return new OrigNumber(primValue);
        }
        /* jshint newcap: false */
        return OrigNumber(primValue);
        /* jshint newcap: true */
      };
      return NumberShim;
    }());
    wrapConstructor(OrigNumber, NumberShim, {});
    // this is necessary for ES3 browsers, where these properties are non-enumerable.
    defineProperties(NumberShim, {
      NaN: OrigNumber.NaN,
      MAX_VALUE: OrigNumber.MAX_VALUE,
      MIN_VALUE: OrigNumber.MIN_VALUE,
      NEGATIVE_INFINITY: OrigNumber.NEGATIVE_INFINITY,
      POSITIVE_INFINITY: OrigNumber.POSITIVE_INFINITY
    });
    /* globals Number: true */
    /* eslint-disable no-undef, no-global-assign */
    /* jshint -W020 */
    Number = NumberShim;
    Value.redefine(globals, 'Number', NumberShim);
    /* jshint +W020 */
    /* eslint-enable no-undef, no-global-assign */
    /* globals Number: false */
  }

  var maxSafeInteger = Math.pow(2, 53) - 1;
  defineProperties(Number, {
    MAX_SAFE_INTEGER: maxSafeInteger,
    MIN_SAFE_INTEGER: -maxSafeInteger,
    EPSILON: 2.220446049250313e-16,

    parseInt: globals.parseInt,
    parseFloat: globals.parseFloat,

    isFinite: numberIsFinite,

    isInteger: function isInteger(value) {
      return numberIsFinite(value) && ES.ToInteger(value) === value;
    },

    isSafeInteger: function isSafeInteger(value) {
      return Number.isInteger(value) && _abs(value) <= Number.MAX_SAFE_INTEGER;
    },

    isNaN: numberIsNaN
  });
  // Firefox 37 has a conforming Number.parseInt, but it's not === to the global parseInt (fixed in v40)
  defineProperty(Number, 'parseInt', globals.parseInt, Number.parseInt !== globals.parseInt);

  // Work around bugs in Array#find and Array#findIndex -- early
  // implementations skipped holes in sparse arrays. (Note that the
  // implementations of find/findIndex indirectly use shimmed
  // methods of Number, so this test has to happen down here.)
  /*jshint elision: true */
  /* eslint-disable no-sparse-arrays */
  if ([, 1].find(function () { return true; }) === 1) {
    overrideNative(Array.prototype, 'find', ArrayPrototypeShims.find);
  }
  if ([, 1].findIndex(function () { return true; }) !== 0) {
    overrideNative(Array.prototype, 'findIndex', ArrayPrototypeShims.findIndex);
  }
  /* eslint-enable no-sparse-arrays */
  /*jshint elision: false */

  var isEnumerableOn = Function.bind.call(Function.bind, Object.prototype.propertyIsEnumerable);
  var ensureEnumerable = function ensureEnumerable(obj, prop) {
    if (supportsDescriptors && isEnumerableOn(obj, prop)) {
      Object.defineProperty(obj, prop, { enumerable: false });
    }
  };
  var sliceArgs = function sliceArgs() {
    var arguments$1 = arguments;

    // per https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
    // and https://gist.github.com/WebReflection/4327762cb87a8c634a29
    var initial = Number(this);
    var len = arguments.length;
    var desiredArgCount = len - initial;
    var args = new Array(desiredArgCount < 0 ? 0 : desiredArgCount);
    for (var i = initial; i < len; ++i) {
      args[i - initial] = arguments$1[i];
    }
    return args;
  };
  var assignTo = function assignTo(source) {
    return function assignToSource(target, key) {
      target[key] = source[key];
      return target;
    };
  };
  var assignReducer = function (target, source) {
    var sourceKeys = keys(Object(source));
    var symbols;
    if (ES.IsCallable(Object.getOwnPropertySymbols)) {
      symbols = _filter(Object.getOwnPropertySymbols(Object(source)), isEnumerableOn(source));
    }
    return _reduce(_concat(sourceKeys, symbols || []), assignTo(source), target);
  };

  var ObjectShims = {
    // 19.1.3.1
    assign: function (target, source) {
      var to = ES.ToObject(target, 'Cannot convert undefined or null to object');
      return _reduce(ES.Call(sliceArgs, 1, arguments), assignReducer, to);
    },

    // Added in WebKit in https://bugs.webkit.org/show_bug.cgi?id=143865
    is: function is(a, b) {
      return ES.SameValue(a, b);
    }
  };
  var assignHasPendingExceptions = Object.assign && Object.preventExtensions && (function () {
    // Firefox 37 still has "pending exception" logic in its Object.assign implementation,
    // which is 72% slower than our shim, and Firefox 40's native implementation.
    var thrower = Object.preventExtensions({ 1: 2 });
    try {
      Object.assign(thrower, 'xy');
    } catch (e) {
      return thrower[1] === 'y';
    }
  }());
  if (assignHasPendingExceptions) {
    overrideNative(Object, 'assign', ObjectShims.assign);
  }
  defineProperties(Object, ObjectShims);

  if (supportsDescriptors) {
    var ES5ObjectShims = {
      // 19.1.3.9
      // shim from https://gist.github.com/WebReflection/5593554
      setPrototypeOf: (function (Object, magic) {
        var set;

        var checkArgs = function (O, proto) {
          if (!ES.TypeIsObject(O)) {
            throw new TypeError('cannot set prototype on a non-object');
          }
          if (!(proto === null || ES.TypeIsObject(proto))) {
            throw new TypeError('can only set prototype to an object or null' + proto);
          }
        };

        var setPrototypeOf = function (O, proto) {
          checkArgs(O, proto);
          _call(set, O, proto);
          return O;
        };

        try {
          // this works already in Firefox and Safari
          set = Object.getOwnPropertyDescriptor(Object.prototype, magic).set;
          _call(set, {}, null);
        } catch (e) {
          if (Object.prototype !== {}[magic]) {
            // IE < 11 cannot be shimmed
            return;
          }
          // probably Chrome or some old Mobile stock browser
          set = function (proto) {
            this[magic] = proto;
          };
          // please note that this will **not** work
          // in those browsers that do not inherit
          // __proto__ by mistake from Object.prototype
          // in these cases we should probably throw an error
          // or at least be informed about the issue
          setPrototypeOf.polyfill = setPrototypeOf(
            setPrototypeOf({}, null),
            Object.prototype
          ) instanceof Object;
          // setPrototypeOf.polyfill === true means it works as meant
          // setPrototypeOf.polyfill === false means it's not 100% reliable
          // setPrototypeOf.polyfill === undefined
          // or
          // setPrototypeOf.polyfill ==  null means it's not a polyfill
          // which means it works as expected
          // we can even delete Object.prototype.__proto__;
        }
        return setPrototypeOf;
      }(Object, '__proto__'))
    };

    defineProperties(Object, ES5ObjectShims);
  }

  // Workaround bug in Opera 12 where setPrototypeOf(x, null) doesn't work,
  // but Object.create(null) does.
  if (Object.setPrototypeOf && Object.getPrototypeOf &&
      Object.getPrototypeOf(Object.setPrototypeOf({}, null)) !== null &&
      Object.getPrototypeOf(Object.create(null)) === null) {
    (function () {
      var FAKENULL = Object.create(null);
      var gpo = Object.getPrototypeOf;
      var spo = Object.setPrototypeOf;
      Object.getPrototypeOf = function (o) {
        var result = gpo(o);
        return result === FAKENULL ? null : result;
      };
      Object.setPrototypeOf = function (o, p) {
        var proto = p === null ? FAKENULL : p;
        return spo(o, proto);
      };
      Object.setPrototypeOf.polyfill = false;
    }());
  }

  var objectKeysAcceptsPrimitives = !throwsError(function () {  });
  if (!objectKeysAcceptsPrimitives) {
    var originalObjectKeys = Object.keys;
    overrideNative(Object, 'keys', function keys(value) {
      return originalObjectKeys(ES.ToObject(value));
    });
    keys = Object.keys;
  }
  var objectKeysRejectsRegex = throwsError(function () {  });
  if (objectKeysRejectsRegex) {
    var regexRejectingObjectKeys = Object.keys;
    overrideNative(Object, 'keys', function keys(value) {
      if (Type.regex(value)) {
        var regexKeys = [];
        for (var k in value) {
          if (_hasOwnProperty(value, k)) {
            _push(regexKeys, k);
          }
        }
        return regexKeys;
      }
      return regexRejectingObjectKeys(value);
    });
    keys = Object.keys;
  }

  if (Object.getOwnPropertyNames) {
    var objectGOPNAcceptsPrimitives = !throwsError(function () {  });
    if (!objectGOPNAcceptsPrimitives) {
      var cachedWindowNames = typeof window === 'object' ? Object.getOwnPropertyNames(window) : [];
      var originalObjectGetOwnPropertyNames = Object.getOwnPropertyNames;
      overrideNative(Object, 'getOwnPropertyNames', function getOwnPropertyNames(value) {
        var val = ES.ToObject(value);
        if (_toString(val) === '[object Window]') {
          try {
            return originalObjectGetOwnPropertyNames(val);
          } catch (e) {
            // IE bug where layout engine calls userland gOPN for cross-domain `window` objects
            return _concat([], cachedWindowNames);
          }
        }
        return originalObjectGetOwnPropertyNames(val);
      });
    }
  }
  if (Object.getOwnPropertyDescriptor) {
    var objectGOPDAcceptsPrimitives = !throwsError(function () {  });
    if (!objectGOPDAcceptsPrimitives) {
      var originalObjectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
      overrideNative(Object, 'getOwnPropertyDescriptor', function getOwnPropertyDescriptor(value, property) {
        return originalObjectGetOwnPropertyDescriptor(ES.ToObject(value), property);
      });
    }
  }
  if (Object.seal) {
    var objectSealAcceptsPrimitives = !throwsError(function () { Object.seal('foo'); });
    if (!objectSealAcceptsPrimitives) {
      var originalObjectSeal = Object.seal;
      overrideNative(Object, 'seal', function seal(value) {
        if (!ES.TypeIsObject(value)) { return value; }
        return originalObjectSeal(value);
      });
    }
  }
  if (Object.isSealed) {
    var objectIsSealedAcceptsPrimitives = !throwsError(function () {  });
    if (!objectIsSealedAcceptsPrimitives) {
      var originalObjectIsSealed = Object.isSealed;
      overrideNative(Object, 'isSealed', function isSealed(value) {
        if (!ES.TypeIsObject(value)) { return true; }
        return originalObjectIsSealed(value);
      });
    }
  }
  if (Object.freeze) {
    var objectFreezeAcceptsPrimitives = !throwsError(function () { Object.freeze('foo'); });
    if (!objectFreezeAcceptsPrimitives) {
      var originalObjectFreeze = Object.freeze;
      overrideNative(Object, 'freeze', function freeze(value) {
        if (!ES.TypeIsObject(value)) { return value; }
        return originalObjectFreeze(value);
      });
    }
  }
  if (Object.isFrozen) {
    var objectIsFrozenAcceptsPrimitives = !throwsError(function () {  });
    if (!objectIsFrozenAcceptsPrimitives) {
      var originalObjectIsFrozen = Object.isFrozen;
      overrideNative(Object, 'isFrozen', function isFrozen(value) {
        if (!ES.TypeIsObject(value)) { return true; }
        return originalObjectIsFrozen(value);
      });
    }
  }
  if (Object.preventExtensions) {
    var objectPreventExtensionsAcceptsPrimitives = !throwsError(function () { Object.preventExtensions('foo'); });
    if (!objectPreventExtensionsAcceptsPrimitives) {
      var originalObjectPreventExtensions = Object.preventExtensions;
      overrideNative(Object, 'preventExtensions', function preventExtensions(value) {
        if (!ES.TypeIsObject(value)) { return value; }
        return originalObjectPreventExtensions(value);
      });
    }
  }
  if (Object.isExtensible) {
    var objectIsExtensibleAcceptsPrimitives = !throwsError(function () {  });
    if (!objectIsExtensibleAcceptsPrimitives) {
      var originalObjectIsExtensible = Object.isExtensible;
      overrideNative(Object, 'isExtensible', function isExtensible(value) {
        if (!ES.TypeIsObject(value)) { return false; }
        return originalObjectIsExtensible(value);
      });
    }
  }
  if (Object.getPrototypeOf) {
    var objectGetProtoAcceptsPrimitives = !throwsError(function () {  });
    if (!objectGetProtoAcceptsPrimitives) {
      var originalGetProto = Object.getPrototypeOf;
      overrideNative(Object, 'getPrototypeOf', function getPrototypeOf(value) {
        return originalGetProto(ES.ToObject(value));
      });
    }
  }

  var hasFlags = supportsDescriptors && (function () {
    var desc = Object.getOwnPropertyDescriptor(RegExp.prototype, 'flags');
    return desc && ES.IsCallable(desc.get);
  }());
  if (supportsDescriptors && !hasFlags) {
    var regExpFlagsGetter = function flags() {
      if (!ES.TypeIsObject(this)) {
        throw new TypeError('Method called on incompatible type: must be an object.');
      }
      var result = '';
      if (this.global) {
        result += 'g';
      }
      if (this.ignoreCase) {
        result += 'i';
      }
      if (this.multiline) {
        result += 'm';
      }
      if (this.unicode) {
        result += 'u';
      }
      if (this.sticky) {
        result += 'y';
      }
      return result;
    };

    Value.getter(RegExp.prototype, 'flags', regExpFlagsGetter);
  }

  var regExpSupportsFlagsWithRegex = supportsDescriptors && valueOrFalseIfThrows(function () {
    return String(new RegExp(/a/g, 'i')) === '/a/i';
  });
  var regExpNeedsToSupportSymbolMatch = hasSymbols && supportsDescriptors && (function () {
    // Edge 0.12 supports flags fully, but does not support Symbol.match
    var regex = /./;
    regex[Symbol.match] = false;
    return RegExp(regex) === regex;
  }());

  var regexToStringIsGeneric = valueOrFalseIfThrows(function () {
    return RegExp.prototype.toString.call({ source: 'abc' }) === '/abc/';
  });
  var regexToStringSupportsGenericFlags = regexToStringIsGeneric && valueOrFalseIfThrows(function () {
    return RegExp.prototype.toString.call({ source: 'a', flags: 'b' }) === '/a/b';
  });
  if (!regexToStringIsGeneric || !regexToStringSupportsGenericFlags) {
    var origRegExpToString = RegExp.prototype.toString;
    defineProperty(RegExp.prototype, 'toString', function toString() {
      var R = ES.RequireObjectCoercible(this);
      if (Type.regex(R)) {
        return _call(origRegExpToString, R);
      }
      var pattern = $String(R.source);
      var flags = $String(R.flags);
      return '/' + pattern + '/' + flags;
    }, true);
    Value.preserveToString(RegExp.prototype.toString, origRegExpToString);
  }

  if (supportsDescriptors && (!regExpSupportsFlagsWithRegex || regExpNeedsToSupportSymbolMatch)) {
    var flagsGetter = Object.getOwnPropertyDescriptor(RegExp.prototype, 'flags').get;
    var sourceDesc = Object.getOwnPropertyDescriptor(RegExp.prototype, 'source') || {};
    var legacySourceGetter = function () {
      // prior to it being a getter, it's own + nonconfigurable
      return this.source;
    };
    var sourceGetter = ES.IsCallable(sourceDesc.get) ? sourceDesc.get : legacySourceGetter;

    var OrigRegExp = RegExp;
    var RegExpShim = (function () {
      return function RegExp(pattern, flags) {
        var patternIsRegExp = ES.IsRegExp(pattern);
        var calledWithNew = this instanceof RegExp;
        if (!calledWithNew && patternIsRegExp && typeof flags === 'undefined' && pattern.constructor === RegExp) {
          return pattern;
        }

        var P = pattern;
        var F = flags;
        if (Type.regex(pattern)) {
          P = ES.Call(sourceGetter, pattern);
          F = typeof flags === 'undefined' ? ES.Call(flagsGetter, pattern) : flags;
          return new RegExp(P, F);
        } else if (patternIsRegExp) {
          P = pattern.source;
          F = typeof flags === 'undefined' ? pattern.flags : flags;
        }
        return new OrigRegExp(pattern, flags);
      };
    }());
    wrapConstructor(OrigRegExp, RegExpShim, {
      $input: true // Chrome < v39 & Opera < 26 have a nonstandard "$input" property
    });
    /* globals RegExp: true */
    /* eslint-disable no-undef, no-global-assign */
    /* jshint -W020 */
    RegExp = RegExpShim;
    Value.redefine(globals, 'RegExp', RegExpShim);
    /* jshint +W020 */
    /* eslint-enable no-undef, no-global-assign */
    /* globals RegExp: false */
  }

  if (supportsDescriptors) {
    var regexGlobals = {
      input: '$_',
      lastMatch: '$&',
      lastParen: '$+',
      leftContext: '$`',
      rightContext: '$\''
    };
    _forEach(keys(regexGlobals), function (prop) {
      if (prop in RegExp && !(regexGlobals[prop] in RegExp)) {
        Value.getter(RegExp, regexGlobals[prop], function get() {
          return RegExp[prop];
        });
      }
    });
  }
  addDefaultSpecies(RegExp);

  var inverseEpsilon = 1 / Number.EPSILON;
  var roundTiesToEven = function roundTiesToEven(n) {
    // Even though this reduces down to `return n`, it takes advantage of built-in rounding.
    return (n + inverseEpsilon) - inverseEpsilon;
  };
  var BINARY_32_EPSILON = Math.pow(2, -23);
  var BINARY_32_MAX_VALUE = Math.pow(2, 127) * (2 - BINARY_32_EPSILON);
  var BINARY_32_MIN_VALUE = Math.pow(2, -126);
  var E = Math.E;
  var LOG2E = Math.LOG2E;
  var LOG10E = Math.LOG10E;
  var numberCLZ = Number.prototype.clz;
  delete Number.prototype.clz; // Safari 8 has Number#clz

  var MathShims = {
    acosh: function acosh(value) {
      var x = Number(value);
      if (numberIsNaN(x) || value < 1) { return NaN; }
      if (x === 1) { return 0; }
      if (x === Infinity) { return x; }
      return _log((x / E) + (_sqrt(x + 1) * _sqrt(x - 1) / E)) + 1;
    },

    asinh: function asinh(value) {
      var x = Number(value);
      if (x === 0 || !globalIsFinite(x)) {
        return x;
      }
      return x < 0 ? -asinh(-x) : _log(x + _sqrt((x * x) + 1));
    },

    atanh: function atanh(value) {
      var x = Number(value);
      if (numberIsNaN(x) || x < -1 || x > 1) {
        return NaN;
      }
      if (x === -1) { return -Infinity; }
      if (x === 1) { return Infinity; }
      if (x === 0) { return x; }
      return 0.5 * _log((1 + x) / (1 - x));
    },

    cbrt: function cbrt(value) {
      var x = Number(value);
      if (x === 0) { return x; }
      var negate = x < 0;
      var result;
      if (negate) { x = -x; }
      if (x === Infinity) {
        result = Infinity;
      } else {
        result = _exp(_log(x) / 3);
        // from http://en.wikipedia.org/wiki/Cube_root#Numerical_methods
        result = ((x / (result * result)) + (2 * result)) / 3;
      }
      return negate ? -result : result;
    },

    clz32: function clz32(value) {
      // See https://bugs.ecmascript.org/show_bug.cgi?id=2465
      var x = Number(value);
      var number = ES.ToUint32(x);
      if (number === 0) {
        return 32;
      }
      return numberCLZ ? ES.Call(numberCLZ, number) : 31 - _floor(_log(number + 0.5) * LOG2E);
    },

    cosh: function cosh(value) {
      var x = Number(value);
      if (x === 0) { return 1; } // +0 or -0
      if (numberIsNaN(x)) { return NaN; }
      if (!globalIsFinite(x)) { return Infinity; }
      if (x < 0) { x = -x; }
      if (x > 21) { return _exp(x) / 2; }
      return (_exp(x) + _exp(-x)) / 2;
    },

    expm1: function expm1(value) {
      var x = Number(value);
      if (x === -Infinity) { return -1; }
      if (!globalIsFinite(x) || x === 0) { return x; }
      if (_abs(x) > 0.5) {
        return _exp(x) - 1;
      }
      // A more precise approximation using Taylor series expansion
      // from https://github.com/paulmillr/es6-shim/issues/314#issuecomment-70293986
      var t = x;
      var sum = 0;
      var n = 1;
      while (sum + t !== sum) {
        sum += t;
        n += 1;
        t *= x / n;
      }
      return sum;
    },

    hypot: function hypot(x, y) {
      var arguments$1 = arguments;

      var result = 0;
      var largest = 0;
      for (var i = 0; i < arguments.length; ++i) {
        var value = _abs(Number(arguments$1[i]));
        if (largest < value) {
          result *= (largest / value) * (largest / value);
          result += 1;
          largest = value;
        } else {
          result += value > 0 ? (value / largest) * (value / largest) : value;
        }
      }
      return largest === Infinity ? Infinity : largest * _sqrt(result);
    },

    log2: function log2(value) {
      return _log(value) * LOG2E;
    },

    log10: function log10(value) {
      return _log(value) * LOG10E;
    },

    log1p: function log1p(value) {
      var x = Number(value);
      if (x < -1 || numberIsNaN(x)) { return NaN; }
      if (x === 0 || x === Infinity) { return x; }
      if (x === -1) { return -Infinity; }

      return (1 + x) - 1 === 0 ? x : x * (_log(1 + x) / ((1 + x) - 1));
    },

    sign: _sign,

    sinh: function sinh(value) {
      var x = Number(value);
      if (!globalIsFinite(x) || x === 0) { return x; }

      if (_abs(x) < 1) {
        return (Math.expm1(x) - Math.expm1(-x)) / 2;
      }
      return (_exp(x - 1) - _exp(-x - 1)) * E / 2;
    },

    tanh: function tanh(value) {
      var x = Number(value);
      if (numberIsNaN(x) || x === 0) { return x; }
      // can exit early at +-20 as JS loses precision for true value at this integer
      if (x >= 20) { return 1; }
      if (x <= -20) { return -1; }

      return (Math.expm1(x) - Math.expm1(-x)) / (_exp(x) + _exp(-x));
    },

    trunc: function trunc(value) {
      var x = Number(value);
      return x < 0 ? -_floor(-x) : _floor(x);
    },

    imul: function imul(x, y) {
      // taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
      var a = ES.ToUint32(x);
      var b = ES.ToUint32(y);
      var ah = (a >>> 16) & 0xffff;
      var al = a & 0xffff;
      var bh = (b >>> 16) & 0xffff;
      var bl = b & 0xffff;
      // the shift by 0 fixes the sign on the high part
      // the final |0 converts the unsigned value into a signed value
      return (al * bl) + ((((ah * bl) + (al * bh)) << 16) >>> 0) | 0;
    },

    fround: function fround(x) {
      var v = Number(x);
      if (v === 0 || v === Infinity || v === -Infinity || numberIsNaN(v)) {
        return v;
      }
      var sign = _sign(v);
      var abs = _abs(v);
      if (abs < BINARY_32_MIN_VALUE) {
        return sign * roundTiesToEven(
          abs / BINARY_32_MIN_VALUE / BINARY_32_EPSILON
        ) * BINARY_32_MIN_VALUE * BINARY_32_EPSILON;
      }
      // Veltkamp's splitting (?)
      var a = (1 + (BINARY_32_EPSILON / Number.EPSILON)) * abs;
      var result = a - (a - abs);
      if (result > BINARY_32_MAX_VALUE || numberIsNaN(result)) {
        return sign * Infinity;
      }
      return sign * result;
    }
  };
  defineProperties(Math, MathShims);
  // IE 11 TP has an imprecise log1p: reports Math.log1p(-1e-17) as 0
  defineProperty(Math, 'log1p', MathShims.log1p, Math.log1p(-1e-17) !== -1e-17);
  // IE 11 TP has an imprecise asinh: reports Math.asinh(-1e7) as not exactly equal to -Math.asinh(1e7)
  defineProperty(Math, 'asinh', MathShims.asinh, Math.asinh(-1e7) !== -Math.asinh(1e7));
  // Chrome 40 has an imprecise Math.tanh with very small numbers
  defineProperty(Math, 'tanh', MathShims.tanh, Math.tanh(-2e-17) !== -2e-17);
  // Chrome 40 loses Math.acosh precision with high numbers
  defineProperty(Math, 'acosh', MathShims.acosh, Math.acosh(Number.MAX_VALUE) === Infinity);
  // Firefox 38 on Windows
  defineProperty(Math, 'cbrt', MathShims.cbrt, Math.abs(1 - (Math.cbrt(1e-300) / 1e-100)) / Number.EPSILON > 8);
  // node 0.11 has an imprecise Math.sinh with very small numbers
  defineProperty(Math, 'sinh', MathShims.sinh, Math.sinh(-2e-17) !== -2e-17);
  // FF 35 on Linux reports 22025.465794806725 for Math.expm1(10)
  var expm1OfTen = Math.expm1(10);
  defineProperty(Math, 'expm1', MathShims.expm1, expm1OfTen > 22025.465794806719 || expm1OfTen < 22025.4657948067165168);

  var origMathRound = Math.round;
  // breaks in e.g. Safari 8, Internet Explorer 11, Opera 12
  var roundHandlesBoundaryConditions = Math.round(0.5 - (Number.EPSILON / 4)) === 0 &&
    Math.round(-0.5 + (Number.EPSILON / 3.99)) === 1;

  // When engines use Math.floor(x + 0.5) internally, Math.round can be buggy for large integers.
  // This behavior should be governed by "round to nearest, ties to even mode"
  // see http://www.ecma-international.org/ecma-262/6.0/#sec-terms-and-definitions-number-type
  // These are the boundary cases where it breaks.
  var smallestPositiveNumberWhereRoundBreaks = inverseEpsilon + 1;
  var largestPositiveNumberWhereRoundBreaks = (2 * inverseEpsilon) - 1;
  var roundDoesNotIncreaseIntegers = [
    smallestPositiveNumberWhereRoundBreaks,
    largestPositiveNumberWhereRoundBreaks
  ].every(function (num) {
    return Math.round(num) === num;
  });
  defineProperty(Math, 'round', function round(x) {
    var floor = _floor(x);
    var ceil = floor === -1 ? -0 : floor + 1;
    return x - floor < 0.5 ? floor : ceil;
  }, !roundHandlesBoundaryConditions || !roundDoesNotIncreaseIntegers);
  Value.preserveToString(Math.round, origMathRound);

  var origImul = Math.imul;
  if (Math.imul(0xffffffff, 5) !== -5) {
    // Safari 6.1, at least, reports "0" for this value
    Math.imul = MathShims.imul;
    Value.preserveToString(Math.imul, origImul);
  }
  if (Math.imul.length !== 2) {
    // Safari 8.0.4 has a length of 1
    // fixed in https://bugs.webkit.org/show_bug.cgi?id=143658
    overrideNative(Math, 'imul', function imul(x, y) {
      return ES.Call(origImul, Math, arguments);
    });
  }

  // Promises
  // Simplest possible implementation; use a 3rd-party library if you
  // want the best possible speed and/or long stack traces.
  var PromiseShim = (function () {
    var setTimeout = globals.setTimeout;
    // some environments don't have setTimeout - no way to shim here.
    if (typeof setTimeout !== 'function' && typeof setTimeout !== 'object') { return; }

    ES.IsPromise = function (promise) {
      if (!ES.TypeIsObject(promise)) {
        return false;
      }
      if (typeof promise._promise === 'undefined') {
        return false; // uninitialized, or missing our hidden field.
      }
      return true;
    };

    // "PromiseCapability" in the spec is what most promise implementations
    // call a "deferred".
    var PromiseCapability = function (C) {
      if (!ES.IsConstructor(C)) {
        throw new TypeError('Bad promise constructor');
      }
      var capability = this;
      var resolver = function (resolve, reject) {
        if (capability.resolve !== void 0 || capability.reject !== void 0) {
          throw new TypeError('Bad Promise implementation!');
        }
        capability.resolve = resolve;
        capability.reject = reject;
      };
      // Initialize fields to inform optimizers about the object shape.
      capability.resolve = void 0;
      capability.reject = void 0;
      capability.promise = new C(resolver);
      if (!(ES.IsCallable(capability.resolve) && ES.IsCallable(capability.reject))) {
        throw new TypeError('Bad promise constructor');
      }
    };

    // find an appropriate setImmediate-alike
    var makeZeroTimeout;
    /*global window */
    if (typeof window !== 'undefined' && ES.IsCallable(window.postMessage)) {
      makeZeroTimeout = function () {
        // from http://dbaron.org/log/20100309-faster-timeouts
        var timeouts = [];
        var messageName = 'zero-timeout-message';
        var setZeroTimeout = function (fn) {
          _push(timeouts, fn);
          window.postMessage(messageName, '*');
        };
        var handleMessage = function (event) {
          if (event.source === window && event.data === messageName) {
            event.stopPropagation();
            if (timeouts.length === 0) { return; }
            var fn = _shift(timeouts);
            fn();
          }
        };
        window.addEventListener('message', handleMessage, true);
        return setZeroTimeout;
      };
    }
    var makePromiseAsap = function () {
      // An efficient task-scheduler based on a pre-existing Promise
      // implementation, which we can use even if we override the
      // global Promise below (in order to workaround bugs)
      // https://github.com/Raynos/observ-hash/issues/2#issuecomment-35857671
      var P = globals.Promise;
      var pr = P && P.resolve && P.resolve();
      return pr && function (task) {
        return pr.then(task);
      };
    };
    /*global process */
    /* jscs:disable disallowMultiLineTernary */
    var enqueue = ES.IsCallable(globals.setImmediate) ?
      globals.setImmediate :
      typeof process === 'object' && process.nextTick ? process.nextTick :
      makePromiseAsap() ||
      (ES.IsCallable(makeZeroTimeout) ? makeZeroTimeout() :
      function (task) { setTimeout(task, 0); }); // fallback
    /* jscs:enable disallowMultiLineTernary */

    // Constants for Promise implementation
    var PROMISE_IDENTITY = function (x) { return x; };
    var PROMISE_THROWER = function (e) { throw e; };
    var PROMISE_PENDING = 0;
    var PROMISE_FULFILLED = 1;
    var PROMISE_REJECTED = 2;
    // We store fulfill/reject handlers and capabilities in a single array.
    var PROMISE_FULFILL_OFFSET = 0;
    var PROMISE_REJECT_OFFSET = 1;
    var PROMISE_CAPABILITY_OFFSET = 2;
    // This is used in an optimization for chaining promises via then.
    var PROMISE_FAKE_CAPABILITY = {};

    var enqueuePromiseReactionJob = function (handler, capability, argument) {
      enqueue(function () {
        promiseReactionJob(handler, capability, argument);
      });
    };

    var promiseReactionJob = function (handler, promiseCapability, argument) {
      var handlerResult, f;
      if (promiseCapability === PROMISE_FAKE_CAPABILITY) {
        // Fast case, when we don't actually need to chain through to a
        // (real) promiseCapability.
        return handler(argument);
      }
      try {
        handlerResult = handler(argument);
        f = promiseCapability.resolve;
      } catch (e) {
        handlerResult = e;
        f = promiseCapability.reject;
      }
      f(handlerResult);
    };

    var fulfillPromise = function (promise, value) {
      var _promise = promise._promise;
      var length = _promise.reactionLength;
      if (length > 0) {
        enqueuePromiseReactionJob(
          _promise.fulfillReactionHandler0,
          _promise.reactionCapability0,
          value
        );
        _promise.fulfillReactionHandler0 = void 0;
        _promise.rejectReactions0 = void 0;
        _promise.reactionCapability0 = void 0;
        if (length > 1) {
          for (var i = 1, idx = 0; i < length; i++, idx += 3) {
            enqueuePromiseReactionJob(
              _promise[idx + PROMISE_FULFILL_OFFSET],
              _promise[idx + PROMISE_CAPABILITY_OFFSET],
              value
            );
            promise[idx + PROMISE_FULFILL_OFFSET] = void 0;
            promise[idx + PROMISE_REJECT_OFFSET] = void 0;
            promise[idx + PROMISE_CAPABILITY_OFFSET] = void 0;
          }
        }
      }
      _promise.result = value;
      _promise.state = PROMISE_FULFILLED;
      _promise.reactionLength = 0;
    };

    var rejectPromise = function (promise, reason) {
      var _promise = promise._promise;
      var length = _promise.reactionLength;
      if (length > 0) {
        enqueuePromiseReactionJob(
          _promise.rejectReactionHandler0,
          _promise.reactionCapability0,
          reason
        );
        _promise.fulfillReactionHandler0 = void 0;
        _promise.rejectReactions0 = void 0;
        _promise.reactionCapability0 = void 0;
        if (length > 1) {
          for (var i = 1, idx = 0; i < length; i++, idx += 3) {
            enqueuePromiseReactionJob(
              _promise[idx + PROMISE_REJECT_OFFSET],
              _promise[idx + PROMISE_CAPABILITY_OFFSET],
              reason
            );
            promise[idx + PROMISE_FULFILL_OFFSET] = void 0;
            promise[idx + PROMISE_REJECT_OFFSET] = void 0;
            promise[idx + PROMISE_CAPABILITY_OFFSET] = void 0;
          }
        }
      }
      _promise.result = reason;
      _promise.state = PROMISE_REJECTED;
      _promise.reactionLength = 0;
    };

    var createResolvingFunctions = function (promise) {
      var alreadyResolved = false;
      var resolve = function (resolution) {
        var then;
        if (alreadyResolved) { return; }
        alreadyResolved = true;
        if (resolution === promise) {
          return rejectPromise(promise, new TypeError('Self resolution'));
        }
        if (!ES.TypeIsObject(resolution)) {
          return fulfillPromise(promise, resolution);
        }
        try {
          then = resolution.then;
        } catch (e) {
          return rejectPromise(promise, e);
        }
        if (!ES.IsCallable(then)) {
          return fulfillPromise(promise, resolution);
        }
        enqueue(function () {
          promiseResolveThenableJob(promise, resolution, then);
        });
      };
      var reject = function (reason) {
        if (alreadyResolved) { return; }
        alreadyResolved = true;
        return rejectPromise(promise, reason);
      };
      return { resolve: resolve, reject: reject };
    };

    var optimizedThen = function (then, thenable, resolve, reject) {
      // Optimization: since we discard the result, we can pass our
      // own then implementation a special hint to let it know it
      // doesn't have to create it.  (The PROMISE_FAKE_CAPABILITY
      // object is local to this implementation and unforgeable outside.)
      if (then === Promise$prototype$then) {
        _call(then, thenable, resolve, reject, PROMISE_FAKE_CAPABILITY);
      } else {
        _call(then, thenable, resolve, reject);
      }
    };
    var promiseResolveThenableJob = function (promise, thenable, then) {
      var resolvingFunctions = createResolvingFunctions(promise);
      var resolve = resolvingFunctions.resolve;
      var reject = resolvingFunctions.reject;
      try {
        optimizedThen(then, thenable, resolve, reject);
      } catch (e) {
        reject(e);
      }
    };

    var Promise$prototype, Promise$prototype$then;
    var Promise = (function () {
      var PromiseShim = function Promise(resolver) {
        if (!(this instanceof PromiseShim)) {
          throw new TypeError('Constructor Promise requires "new"');
        }
        if (this && this._promise) {
          throw new TypeError('Bad construction');
        }
        // see https://bugs.ecmascript.org/show_bug.cgi?id=2482
        if (!ES.IsCallable(resolver)) {
          throw new TypeError('not a valid resolver');
        }
        var promise = emulateES6construct(this, PromiseShim, Promise$prototype, {
          _promise: {
            result: void 0,
            state: PROMISE_PENDING,
            // The first member of the "reactions" array is inlined here,
            // since most promises only have one reaction.
            // We've also exploded the 'reaction' object to inline the
            // "handler" and "capability" fields, since both fulfill and
            // reject reactions share the same capability.
            reactionLength: 0,
            fulfillReactionHandler0: void 0,
            rejectReactionHandler0: void 0,
            reactionCapability0: void 0
          }
        });
        var resolvingFunctions = createResolvingFunctions(promise);
        var reject = resolvingFunctions.reject;
        try {
          resolver(resolvingFunctions.resolve, reject);
        } catch (e) {
          reject(e);
        }
        return promise;
      };
      return PromiseShim;
    }());
    Promise$prototype = Promise.prototype;

    var _promiseAllResolver = function (index, values, capability, remaining) {
      var alreadyCalled = false;
      return function (x) {
        if (alreadyCalled) { return; }
        alreadyCalled = true;
        values[index] = x;
        if ((--remaining.count) === 0) {
          var resolve = capability.resolve;
          resolve(values); // call w/ this===undefined
        }
      };
    };

    var performPromiseAll = function (iteratorRecord, C, resultCapability) {
      var it = iteratorRecord.iterator;
      var values = [];
      var remaining = { count: 1 };
      var next, nextValue;
      var index = 0;
      while (true) {
        try {
          next = ES.IteratorStep(it);
          if (next === false) {
            iteratorRecord.done = true;
            break;
          }
          nextValue = next.value;
        } catch (e) {
          iteratorRecord.done = true;
          throw e;
        }
        values[index] = void 0;
        var nextPromise = C.resolve(nextValue);
        var resolveElement = _promiseAllResolver(
          index, values, resultCapability, remaining
        );
        remaining.count += 1;
        optimizedThen(nextPromise.then, nextPromise, resolveElement, resultCapability.reject);
        index += 1;
      }
      if ((--remaining.count) === 0) {
        var resolve = resultCapability.resolve;
        resolve(values); // call w/ this===undefined
      }
      return resultCapability.promise;
    };

    var performPromiseRace = function (iteratorRecord, C, resultCapability) {
      var it = iteratorRecord.iterator;
      var next, nextValue, nextPromise;
      while (true) {
        try {
          next = ES.IteratorStep(it);
          if (next === false) {
            // NOTE: If iterable has no items, resulting promise will never
            // resolve; see:
            // https://github.com/domenic/promises-unwrapping/issues/75
            // https://bugs.ecmascript.org/show_bug.cgi?id=2515
            iteratorRecord.done = true;
            break;
          }
          nextValue = next.value;
        } catch (e) {
          iteratorRecord.done = true;
          throw e;
        }
        nextPromise = C.resolve(nextValue);
        optimizedThen(nextPromise.then, nextPromise, resultCapability.resolve, resultCapability.reject);
      }
      return resultCapability.promise;
    };

    defineProperties(Promise, {
      all: function all(iterable) {
        var C = this;
        if (!ES.TypeIsObject(C)) {
          throw new TypeError('Promise is not object');
        }
        var capability = new PromiseCapability(C);
        var iterator, iteratorRecord;
        try {
          iterator = ES.GetIterator(iterable);
          iteratorRecord = { iterator: iterator, done: false };
          return performPromiseAll(iteratorRecord, C, capability);
        } catch (e) {
          var exception = e;
          if (iteratorRecord && !iteratorRecord.done) {
            try {
              ES.IteratorClose(iterator, true);
            } catch (ee) {
              exception = ee;
            }
          }
          var reject = capability.reject;
          reject(exception);
          return capability.promise;
        }
      },

      race: function race(iterable) {
        var C = this;
        if (!ES.TypeIsObject(C)) {
          throw new TypeError('Promise is not object');
        }
        var capability = new PromiseCapability(C);
        var iterator, iteratorRecord;
        try {
          iterator = ES.GetIterator(iterable);
          iteratorRecord = { iterator: iterator, done: false };
          return performPromiseRace(iteratorRecord, C, capability);
        } catch (e) {
          var exception = e;
          if (iteratorRecord && !iteratorRecord.done) {
            try {
              ES.IteratorClose(iterator, true);
            } catch (ee) {
              exception = ee;
            }
          }
          var reject = capability.reject;
          reject(exception);
          return capability.promise;
        }
      },

      reject: function reject(reason) {
        var C = this;
        if (!ES.TypeIsObject(C)) {
          throw new TypeError('Bad promise constructor');
        }
        var capability = new PromiseCapability(C);
        var rejectFunc = capability.reject;
        rejectFunc(reason); // call with this===undefined
        return capability.promise;
      },

      resolve: function resolve(v) {
        // See https://esdiscuss.org/topic/fixing-promise-resolve for spec
        var C = this;
        if (!ES.TypeIsObject(C)) {
          throw new TypeError('Bad promise constructor');
        }
        if (ES.IsPromise(v)) {
          var constructor = v.constructor;
          if (constructor === C) {
            return v;
          }
        }
        var capability = new PromiseCapability(C);
        var resolveFunc = capability.resolve;
        resolveFunc(v); // call with this===undefined
        return capability.promise;
      }
    });

    defineProperties(Promise$prototype, {
      'catch': function (onRejected) {
        return this.then(null, onRejected);
      },

      then: function then(onFulfilled, onRejected) {
        var promise = this;
        if (!ES.IsPromise(promise)) { throw new TypeError('not a promise'); }
        var C = ES.SpeciesConstructor(promise, Promise);
        var resultCapability;
        var returnValueIsIgnored = arguments.length > 2 && arguments[2] === PROMISE_FAKE_CAPABILITY;
        if (returnValueIsIgnored && C === Promise) {
          resultCapability = PROMISE_FAKE_CAPABILITY;
        } else {
          resultCapability = new PromiseCapability(C);
        }
        // PerformPromiseThen(promise, onFulfilled, onRejected, resultCapability)
        // Note that we've split the 'reaction' object into its two
        // components, "capabilities" and "handler"
        // "capabilities" is always equal to `resultCapability`
        var fulfillReactionHandler = ES.IsCallable(onFulfilled) ? onFulfilled : PROMISE_IDENTITY;
        var rejectReactionHandler = ES.IsCallable(onRejected) ? onRejected : PROMISE_THROWER;
        var _promise = promise._promise;
        var value;
        if (_promise.state === PROMISE_PENDING) {
          if (_promise.reactionLength === 0) {
            _promise.fulfillReactionHandler0 = fulfillReactionHandler;
            _promise.rejectReactionHandler0 = rejectReactionHandler;
            _promise.reactionCapability0 = resultCapability;
          } else {
            var idx = 3 * (_promise.reactionLength - 1);
            _promise[idx + PROMISE_FULFILL_OFFSET] = fulfillReactionHandler;
            _promise[idx + PROMISE_REJECT_OFFSET] = rejectReactionHandler;
            _promise[idx + PROMISE_CAPABILITY_OFFSET] = resultCapability;
          }
          _promise.reactionLength += 1;
        } else if (_promise.state === PROMISE_FULFILLED) {
          value = _promise.result;
          enqueuePromiseReactionJob(
            fulfillReactionHandler, resultCapability, value
          );
        } else if (_promise.state === PROMISE_REJECTED) {
          value = _promise.result;
          enqueuePromiseReactionJob(
            rejectReactionHandler, resultCapability, value
          );
        } else {
          throw new TypeError('unexpected Promise state');
        }
        return resultCapability.promise;
      }
    });
    // This helps the optimizer by ensuring that methods which take
    // capabilities aren't polymorphic.
    PROMISE_FAKE_CAPABILITY = new PromiseCapability(Promise);
    Promise$prototype$then = Promise$prototype.then;

    return Promise;
  }());

  // Chrome's native Promise has extra methods that it shouldn't have. Let's remove them.
  if (globals.Promise) {
    delete globals.Promise.accept;
    delete globals.Promise.defer;
    delete globals.Promise.prototype.chain;
  }

  if (typeof PromiseShim === 'function') {
    // export the Promise constructor.
    defineProperties(globals, { Promise: PromiseShim });
    // In Chrome 33 (and thereabouts) Promise is defined, but the
    // implementation is buggy in a number of ways.  Let's check subclassing
    // support to see if we have a buggy implementation.
    var promiseSupportsSubclassing = supportsSubclassing(globals.Promise, function (S) {
      return S.resolve(42).then(function () {}) instanceof S;
    });
    var promiseIgnoresNonFunctionThenCallbacks = !throwsError(function () {
      globals.Promise.reject(42).then(null, 5).then(null, noop);
    });
    var promiseRequiresObjectContext = throwsError(function () { globals.Promise.call(3, noop); });
    // Promise.resolve() was errata'ed late in the ES6 process.
    // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1170742
    //      https://code.google.com/p/v8/issues/detail?id=4161
    // It serves as a proxy for a number of other bugs in early Promise
    // implementations.
    var promiseResolveBroken = (function (Promise) {
      var p = Promise.resolve(5);
      p.constructor = {};
      var p2 = Promise.resolve(p);
      try {
        p2.then(null, noop).then(null, noop); // avoid "uncaught rejection" warnings in console
      } catch (e) {
        return true; // v8 native Promises break here https://code.google.com/p/chromium/issues/detail?id=575314
      }
      return p === p2; // This *should* be false!
    }(globals.Promise));

    // Chrome 46 (probably older too) does not retrieve a thenable's .then synchronously
    var getsThenSynchronously = supportsDescriptors && (function () {
      var count = 0;
      var thenable = Object.defineProperty({}, 'then', { get: function () { count += 1; } });
      return count === 1;
    }());

    var BadResolverPromise = function BadResolverPromise(executor) {
      var p = new Promise(executor);
      executor(3, function () {});
      this.then = p.then;
      this.constructor = BadResolverPromise;
    };
    BadResolverPromise.prototype = Promise.prototype;
    BadResolverPromise.all = Promise.all;
    // Chrome Canary 49 (probably older too) has some implementation bugs
    var hasBadResolverPromise = valueOrFalseIfThrows(function () {
      return !!BadResolverPromise.all([1, 2]);
    });

    if (!promiseSupportsSubclassing || !promiseIgnoresNonFunctionThenCallbacks ||
        !promiseRequiresObjectContext || promiseResolveBroken ||
        !getsThenSynchronously || hasBadResolverPromise) {
      /* globals Promise: true */
      /* eslint-disable no-undef, no-global-assign */
      /* jshint -W020 */
      Promise = PromiseShim;
      /* jshint +W020 */
      /* eslint-enable no-undef, no-global-assign */
      /* globals Promise: false */
      overrideNative(globals, 'Promise', PromiseShim);
    }
    if (Promise.all.length !== 1) {
      var origAll = Promise.all;
      overrideNative(Promise, 'all', function all(iterable) {
        return ES.Call(origAll, this, arguments);
      });
    }
    if (Promise.race.length !== 1) {
      var origRace = Promise.race;
      overrideNative(Promise, 'race', function race(iterable) {
        return ES.Call(origRace, this, arguments);
      });
    }
    if (Promise.resolve.length !== 1) {
      var origResolve = Promise.resolve;
      overrideNative(Promise, 'resolve', function resolve(x) {
        return ES.Call(origResolve, this, arguments);
      });
    }
    if (Promise.reject.length !== 1) {
      var origReject = Promise.reject;
      overrideNative(Promise, 'reject', function reject(r) {
        return ES.Call(origReject, this, arguments);
      });
    }
    ensureEnumerable(Promise, 'all');
    ensureEnumerable(Promise, 'race');
    ensureEnumerable(Promise, 'resolve');
    ensureEnumerable(Promise, 'reject');
    addDefaultSpecies(Promise);
  }

  // Map and Set require a true ES5 environment
  // Their fast path also requires that the environment preserve
  // property insertion order, which is not guaranteed by the spec.
  var testOrder = function (a) {
    var b = keys(_reduce(a, function (o, k) {
      o[k] = true;
      return o;
    }, {}));
    return a.join(':') === b.join(':');
  };
  var preservesInsertionOrder = testOrder(['z', 'a', 'bb']);
  // some engines (eg, Chrome) only preserve insertion order for string keys
  var preservesNumericInsertionOrder = testOrder(['z', 1, 'a', '3', 2]);

  if (supportsDescriptors) {

    var fastkey = function fastkey(key, skipInsertionOrderCheck) {
      if (!skipInsertionOrderCheck && !preservesInsertionOrder) {
        return null;
      }
      if (isNullOrUndefined(key)) {
        return '^' + ES.ToString(key);
      } else if (typeof key === 'string') {
        return '$' + key;
      } else if (typeof key === 'number') {
        // note that -0 will get coerced to "0" when used as a property key
        if (!preservesNumericInsertionOrder) {
          return 'n' + key;
        }
        return key;
      } else if (typeof key === 'boolean') {
        return 'b' + key;
      }
      return null;
    };

    var emptyObject = function emptyObject() {
      // accomodate some older not-quite-ES5 browsers
      return Object.create ? Object.create(null) : {};
    };

    var addIterableToMap = function addIterableToMap(MapConstructor, map, iterable) {
      if (isArray(iterable) || Type.string(iterable)) {
        _forEach(iterable, function (entry) {
          if (!ES.TypeIsObject(entry)) {
            throw new TypeError('Iterator value ' + entry + ' is not an entry object');
          }
          map.set(entry[0], entry[1]);
        });
      } else if (iterable instanceof MapConstructor) {
        _call(MapConstructor.prototype.forEach, iterable, function (value, key) {
          map.set(key, value);
        });
      } else {
        var iter, adder;
        if (!isNullOrUndefined(iterable)) {
          adder = map.set;
          if (!ES.IsCallable(adder)) { throw new TypeError('bad map'); }
          iter = ES.GetIterator(iterable);
        }
        if (typeof iter !== 'undefined') {
          while (true) {
            var next = ES.IteratorStep(iter);
            if (next === false) { break; }
            var nextItem = next.value;
            try {
              if (!ES.TypeIsObject(nextItem)) {
                throw new TypeError('Iterator value ' + nextItem + ' is not an entry object');
              }
              _call(adder, map, nextItem[0], nextItem[1]);
            } catch (e) {
              ES.IteratorClose(iter, true);
              throw e;
            }
          }
        }
      }
    };
    var addIterableToSet = function addIterableToSet(SetConstructor, set, iterable) {
      if (isArray(iterable) || Type.string(iterable)) {
        _forEach(iterable, function (value) {
          set.add(value);
        });
      } else if (iterable instanceof SetConstructor) {
        _call(SetConstructor.prototype.forEach, iterable, function (value) {
          set.add(value);
        });
      } else {
        var iter, adder;
        if (!isNullOrUndefined(iterable)) {
          adder = set.add;
          if (!ES.IsCallable(adder)) { throw new TypeError('bad set'); }
          iter = ES.GetIterator(iterable);
        }
        if (typeof iter !== 'undefined') {
          while (true) {
            var next = ES.IteratorStep(iter);
            if (next === false) { break; }
            var nextValue = next.value;
            try {
              _call(adder, set, nextValue);
            } catch (e) {
              ES.IteratorClose(iter, true);
              throw e;
            }
          }
        }
      }
    };

    var collectionShims = {
      Map: (function () {

        var empty = {};

        var MapEntry = function MapEntry(key, value) {
          this.key = key;
          this.value = value;
          this.next = null;
          this.prev = null;
        };

        MapEntry.prototype.isRemoved = function isRemoved() {
          return this.key === empty;
        };

        var isMap = function isMap(map) {
          return !!map._es6map;
        };

        var requireMapSlot = function requireMapSlot(map, method) {
          if (!ES.TypeIsObject(map) || !isMap(map)) {
            throw new TypeError('Method Map.prototype.' + method + ' called on incompatible receiver ' + ES.ToString(map));
          }
        };

        var MapIterator = function MapIterator(map, kind) {
          requireMapSlot(map, '[[MapIterator]]');
          this.head = map._head;
          this.i = this.head;
          this.kind = kind;
        };

        MapIterator.prototype = {
          next: function next() {
            var this$1 = this;

            var i = this.i;
            var kind = this.kind;
            var head = this.head;
            if (typeof this.i === 'undefined') {
              return iteratorResult();
            }
            while (i.isRemoved() && i !== head) {
              // back up off of removed entries
              i = i.prev;
            }
            // advance to next unreturned element.
            var result;
            while (i.next !== head) {
              i = i.next;
              if (!i.isRemoved()) {
                if (kind === 'key') {
                  result = i.key;
                } else if (kind === 'value') {
                  result = i.value;
                } else {
                  result = [i.key, i.value];
                }
                this$1.i = i;
                return iteratorResult(result);
              }
            }
            // once the iterator is done, it is done forever.
            this.i = void 0;
            return iteratorResult();
          }
        };
        addIterator(MapIterator.prototype);

        var Map$prototype;
        var MapShim = function Map() {
          if (!(this instanceof Map)) {
            throw new TypeError('Constructor Map requires "new"');
          }
          if (this && this._es6map) {
            throw new TypeError('Bad construction');
          }
          var map = emulateES6construct(this, Map, Map$prototype, {
            _es6map: true,
            _head: null,
            _map: OrigMap ? new OrigMap() : null,
            _size: 0,
            _storage: emptyObject()
          });

          var head = new MapEntry(null, null);
          // circular doubly-linked list.
          /* eslint no-multi-assign: 1 */
          head.next = head.prev = head;
          map._head = head;

          // Optionally initialize map from iterable
          if (arguments.length > 0) {
            addIterableToMap(Map, map, arguments[0]);
          }
          return map;
        };
        Map$prototype = MapShim.prototype;

        Value.getter(Map$prototype, 'size', function () {
          if (typeof this._size === 'undefined') {
            throw new TypeError('size method called on incompatible Map');
          }
          return this._size;
        });

        defineProperties(Map$prototype, {
          get: function get(key) {
            requireMapSlot(this, 'get');
            var entry;
            var fkey = fastkey(key, true);
            if (fkey !== null) {
              // fast O(1) path
              entry = this._storage[fkey];
              if (entry) {
                return entry.value;
              } else {
                return;
              }
            }
            if (this._map) {
              // fast object key path
              entry = origMapGet.call(this._map, key);
              if (entry) {
                return entry.value;
              } else {
                return;
              }
            }
            var head = this._head;
            var i = head;
            while ((i = i.next) !== head) {
              if (ES.SameValueZero(i.key, key)) {
                return i.value;
              }
            }
          },

          has: function has(key) {
            requireMapSlot(this, 'has');
            var fkey = fastkey(key, true);
            if (fkey !== null) {
              // fast O(1) path
              return typeof this._storage[fkey] !== 'undefined';
            }
            if (this._map) {
              // fast object key path
              return origMapHas.call(this._map, key);
            }
            var head = this._head;
            var i = head;
            while ((i = i.next) !== head) {
              if (ES.SameValueZero(i.key, key)) {
                return true;
              }
            }
            return false;
          },

          set: function set(key, value) {
            var this$1 = this;

            requireMapSlot(this, 'set');
            var head = this._head;
            var i = head;
            var entry;
            var fkey = fastkey(key, true);
            if (fkey !== null) {
              // fast O(1) path
              if (typeof this._storage[fkey] !== 'undefined') {
                this._storage[fkey].value = value;
                return this;
              } else {
                entry = this._storage[fkey] = new MapEntry(key, value); /* eslint no-multi-assign: 1 */
                i = head.prev;
                // fall through
              }
            } else if (this._map) {
              // fast object key path
              if (origMapHas.call(this._map, key)) {
                origMapGet.call(this._map, key).value = value;
              } else {
                entry = new MapEntry(key, value);
                origMapSet.call(this._map, key, entry);
                i = head.prev;
                // fall through
              }
            }
            while ((i = i.next) !== head) {
              if (ES.SameValueZero(i.key, key)) {
                i.value = value;
                return this$1;
              }
            }
            entry = entry || new MapEntry(key, value);
            if (ES.SameValue(-0, key)) {
              entry.key = +0; // coerce -0 to +0 in entry
            }
            entry.next = this._head;
            entry.prev = this._head.prev;
            entry.prev.next = entry;
            entry.next.prev = entry;
            this._size += 1;
            return this;
          },

          'delete': function (key) {
            var this$1 = this;

            requireMapSlot(this, 'delete');
            var head = this._head;
            var i = head;
            var fkey = fastkey(key, true);
            if (fkey !== null) {
              // fast O(1) path
              if (typeof this._storage[fkey] === 'undefined') {
                return false;
              }
              i = this._storage[fkey].prev;
              delete this._storage[fkey];
              // fall through
            } else if (this._map) {
              // fast object key path
              if (!origMapHas.call(this._map, key)) {
                return false;
              }
              i = origMapGet.call(this._map, key).prev;
              origMapDelete.call(this._map, key);
              // fall through
            }
            while ((i = i.next) !== head) {
              if (ES.SameValueZero(i.key, key)) {
                i.key = empty;
                i.value = empty;
                i.prev.next = i.next;
                i.next.prev = i.prev;
                this$1._size -= 1;
                return true;
              }
            }
            return false;
          },

          clear: function clear() {
             /* eslint no-multi-assign: 1 */
            requireMapSlot(this, 'clear');
            this._map = OrigMap ? new OrigMap() : null;
            this._size = 0;
            this._storage = emptyObject();
            var head = this._head;
            var i = head;
            var p = i.next;
            while ((i = p) !== head) {
              i.key = empty;
              i.value = empty;
              p = i.next;
              i.next = i.prev = head;
            }
            head.next = head.prev = head;
          },

          keys: function keys() {
            requireMapSlot(this, 'keys');
            return new MapIterator(this, 'key');
          },

          values: function values() {
            requireMapSlot(this, 'values');
            return new MapIterator(this, 'value');
          },

          entries: function entries() {
            requireMapSlot(this, 'entries');
            return new MapIterator(this, 'key+value');
          },

          forEach: function forEach(callback) {
            var this$1 = this;

            requireMapSlot(this, 'forEach');
            var context = arguments.length > 1 ? arguments[1] : null;
            var it = this.entries();
            for (var entry = it.next(); !entry.done; entry = it.next()) {
              if (context) {
                _call(callback, context, entry.value[1], entry.value[0], this$1);
              } else {
                callback(entry.value[1], entry.value[0], this$1);
              }
            }
          }
        });
        addIterator(Map$prototype, Map$prototype.entries);

        return MapShim;
      }()),

      Set: (function () {
        var isSet = function isSet(set) {
          return set._es6set && typeof set._storage !== 'undefined';
        };
        var requireSetSlot = function requireSetSlot(set, method) {
          if (!ES.TypeIsObject(set) || !isSet(set)) {
            // https://github.com/paulmillr/es6-shim/issues/176
            throw new TypeError('Set.prototype.' + method + ' called on incompatible receiver ' + ES.ToString(set));
          }
        };

        // Creating a Map is expensive.  To speed up the common case of
        // Sets containing only string or numeric keys, we use an object
        // as backing storage and lazily create a full Map only when
        // required.
        var Set$prototype;
        var SetShim = function Set() {
          if (!(this instanceof Set)) {
            throw new TypeError('Constructor Set requires "new"');
          }
          if (this && this._es6set) {
            throw new TypeError('Bad construction');
          }
          var set = emulateES6construct(this, Set, Set$prototype, {
            _es6set: true,
            '[[SetData]]': null,
            _storage: emptyObject()
          });
          if (!set._es6set) {
            throw new TypeError('bad set');
          }

          // Optionally initialize Set from iterable
          if (arguments.length > 0) {
            addIterableToSet(Set, set, arguments[0]);
          }
          return set;
        };
        Set$prototype = SetShim.prototype;

        var decodeKey = function (key) {
          var k = key;
          if (k === '^null') {
            return null;
          } else if (k === '^undefined') {
            return void 0;
          } else {
            var first = k.charAt(0);
            if (first === '$') {
              return _strSlice(k, 1);
            } else if (first === 'n') {
              return +_strSlice(k, 1);
            } else if (first === 'b') {
              return k === 'btrue';
            }
          }
          return +k;
        };
        // Switch from the object backing storage to a full Map.
        var ensureMap = function ensureMap(set) {
          if (!set['[[SetData]]']) {
            var m = new collectionShims.Map();
            set['[[SetData]]'] = m;
            _forEach(keys(set._storage), function (key) {
              var k = decodeKey(key);
              m.set(k, k);
            });
            set['[[SetData]]'] = m;
          }
          set._storage = null; // free old backing storage
        };

        Value.getter(SetShim.prototype, 'size', function () {
          requireSetSlot(this, 'size');
          if (this._storage) {
            return keys(this._storage).length;
          }
          ensureMap(this);
          return this['[[SetData]]'].size;
        });

        defineProperties(SetShim.prototype, {
          has: function has(key) {
            requireSetSlot(this, 'has');
            var fkey;
            if (this._storage && (fkey = fastkey(key)) !== null) {
              return !!this._storage[fkey];
            }
            ensureMap(this);
            return this['[[SetData]]'].has(key);
          },

          add: function add(key) {
            requireSetSlot(this, 'add');
            var fkey;
            if (this._storage && (fkey = fastkey(key)) !== null) {
              this._storage[fkey] = true;
              return this;
            }
            ensureMap(this);
            this['[[SetData]]'].set(key, key);
            return this;
          },

          'delete': function (key) {
            requireSetSlot(this, 'delete');
            var fkey;
            if (this._storage && (fkey = fastkey(key)) !== null) {
              var hasFKey = _hasOwnProperty(this._storage, fkey);
              return (delete this._storage[fkey]) && hasFKey;
            }
            ensureMap(this);
            return this['[[SetData]]']['delete'](key);
          },

          clear: function clear() {
            requireSetSlot(this, 'clear');
            if (this._storage) {
              this._storage = emptyObject();
            }
            if (this['[[SetData]]']) {
              this['[[SetData]]'].clear();
            }
          },

          values: function values() {
            requireSetSlot(this, 'values');
            ensureMap(this);
            return this['[[SetData]]'].values();
          },

          entries: function entries() {
            requireSetSlot(this, 'entries');
            ensureMap(this);
            return this['[[SetData]]'].entries();
          },

          forEach: function forEach(callback) {
            requireSetSlot(this, 'forEach');
            var context = arguments.length > 1 ? arguments[1] : null;
            var entireSet = this;
            ensureMap(entireSet);
            this['[[SetData]]'].forEach(function (value, key) {
              if (context) {
                _call(callback, context, key, key, entireSet);
              } else {
                callback(key, key, entireSet);
              }
            });
          }
        });
        defineProperty(SetShim.prototype, 'keys', SetShim.prototype.values, true);
        addIterator(SetShim.prototype, SetShim.prototype.values);

        return SetShim;
      }())
    };

    if (globals.Map || globals.Set) {
      // Safari 8, for example, doesn't accept an iterable.
      var mapAcceptsArguments = valueOrFalseIfThrows(function () { return new Map([[1, 2]]).get(1) === 2; });
      if (!mapAcceptsArguments) {
        globals.Map = function Map() {
          if (!(this instanceof Map)) {
            throw new TypeError('Constructor Map requires "new"');
          }
          var m = new OrigMap();
          if (arguments.length > 0) {
            addIterableToMap(Map, m, arguments[0]);
          }
          delete m.constructor;
          Object.setPrototypeOf(m, globals.Map.prototype);
          return m;
        };
        globals.Map.prototype = create(OrigMap.prototype);
        defineProperty(globals.Map.prototype, 'constructor', globals.Map, true);
        Value.preserveToString(globals.Map, OrigMap);
      }
      var testMap = new Map();
      var mapUsesSameValueZero = (function () {
        // Chrome 38-42, node 0.11/0.12, iojs 1/2 also have a bug when the Map has a size > 4
        var m = new Map([[1, 0], [2, 0], [3, 0], [4, 0]]);
        m.set(-0, m);
        return m.get(0) === m && m.get(-0) === m && m.has(0) && m.has(-0);
      }());
      var mapSupportsChaining = testMap.set(1, 2) === testMap;
      if (!mapUsesSameValueZero || !mapSupportsChaining) {
        overrideNative(Map.prototype, 'set', function set(k, v) {
          _call(origMapSet, this, k === 0 ? 0 : k, v);
          return this;
        });
      }
      if (!mapUsesSameValueZero) {
        defineProperties(Map.prototype, {
          get: function get(k) {
            return _call(origMapGet, this, k === 0 ? 0 : k);
          },
          has: function has(k) {
            return _call(origMapHas, this, k === 0 ? 0 : k);
          }
        }, true);
        Value.preserveToString(Map.prototype.get, origMapGet);
        Value.preserveToString(Map.prototype.has, origMapHas);
      }
      var testSet = new Set();
      var setUsesSameValueZero = (function (s) {
        s['delete'](0);
        s.add(-0);
        return !s.has(0);
      }(testSet));
      var setSupportsChaining = testSet.add(1) === testSet;
      if (!setUsesSameValueZero || !setSupportsChaining) {
        var origSetAdd = Set.prototype.add;
        Set.prototype.add = function add(v) {
          _call(origSetAdd, this, v === 0 ? 0 : v);
          return this;
        };
        Value.preserveToString(Set.prototype.add, origSetAdd);
      }
      if (!setUsesSameValueZero) {
        var origSetHas = Set.prototype.has;
        Set.prototype.has = function has(v) {
          return _call(origSetHas, this, v === 0 ? 0 : v);
        };
        Value.preserveToString(Set.prototype.has, origSetHas);
        var origSetDel = Set.prototype['delete'];
        Set.prototype['delete'] = function SetDelete(v) {
          return _call(origSetDel, this, v === 0 ? 0 : v);
        };
        Value.preserveToString(Set.prototype['delete'], origSetDel);
      }
      var mapSupportsSubclassing = supportsSubclassing(globals.Map, function (M) {
        var m = new M([]);
        // Firefox 32 is ok with the instantiating the subclass but will
        // throw when the map is used.
        m.set(42, 42);
        return m instanceof M;
      });
      // without Object.setPrototypeOf, subclassing is not possible
      var mapFailsToSupportSubclassing = Object.setPrototypeOf && !mapSupportsSubclassing;
      var mapRequiresNew = (function () {
        try {
          return !(globals.Map() instanceof globals.Map);
        } catch (e) {
          return e instanceof TypeError;
        }
      }());
      if (globals.Map.length !== 0 || mapFailsToSupportSubclassing || !mapRequiresNew) {
        globals.Map = function Map() {
          if (!(this instanceof Map)) {
            throw new TypeError('Constructor Map requires "new"');
          }
          var m = new OrigMap();
          if (arguments.length > 0) {
            addIterableToMap(Map, m, arguments[0]);
          }
          delete m.constructor;
          Object.setPrototypeOf(m, Map.prototype);
          return m;
        };
        globals.Map.prototype = OrigMap.prototype;
        defineProperty(globals.Map.prototype, 'constructor', globals.Map, true);
        Value.preserveToString(globals.Map, OrigMap);
      }
      var setSupportsSubclassing = supportsSubclassing(globals.Set, function (S) {
        var s = new S([]);
        s.add(42, 42);
        return s instanceof S;
      });
      // without Object.setPrototypeOf, subclassing is not possible
      var setFailsToSupportSubclassing = Object.setPrototypeOf && !setSupportsSubclassing;
      var setRequiresNew = (function () {
        try {
          return !(globals.Set() instanceof globals.Set);
        } catch (e) {
          return e instanceof TypeError;
        }
      }());
      if (globals.Set.length !== 0 || setFailsToSupportSubclassing || !setRequiresNew) {
        var OrigSet = globals.Set;
        globals.Set = function Set() {
          if (!(this instanceof Set)) {
            throw new TypeError('Constructor Set requires "new"');
          }
          var s = new OrigSet();
          if (arguments.length > 0) {
            addIterableToSet(Set, s, arguments[0]);
          }
          delete s.constructor;
          Object.setPrototypeOf(s, Set.prototype);
          return s;
        };
        globals.Set.prototype = OrigSet.prototype;
        defineProperty(globals.Set.prototype, 'constructor', globals.Set, true);
        Value.preserveToString(globals.Set, OrigSet);
      }
      var newMap = new globals.Map();
      var mapIterationThrowsStopIterator = !valueOrFalseIfThrows(function () {
        return newMap.keys().next().done;
      });
      /*
        - In Firefox < 23, Map#size is a function.
        - In all current Firefox, Set#entries/keys/values & Map#clear do not exist
        - https://bugzilla.mozilla.org/show_bug.cgi?id=869996
        - In Firefox 24, Map and Set do not implement forEach
        - In Firefox 25 at least, Map and Set are callable without "new"
      */
      if (
        typeof globals.Map.prototype.clear !== 'function' ||
        new globals.Set().size !== 0 ||
        newMap.size !== 0 ||
        typeof globals.Map.prototype.keys !== 'function' ||
        typeof globals.Set.prototype.keys !== 'function' ||
        typeof globals.Map.prototype.forEach !== 'function' ||
        typeof globals.Set.prototype.forEach !== 'function' ||
        isCallableWithoutNew(globals.Map) ||
        isCallableWithoutNew(globals.Set) ||
        typeof newMap.keys().next !== 'function' || // Safari 8
        mapIterationThrowsStopIterator || // Firefox 25
        !mapSupportsSubclassing
      ) {
        defineProperties(globals, {
          Map: collectionShims.Map,
          Set: collectionShims.Set
        }, true);
      }

      if (globals.Set.prototype.keys !== globals.Set.prototype.values) {
        // Fixed in WebKit with https://bugs.webkit.org/show_bug.cgi?id=144190
        defineProperty(globals.Set.prototype, 'keys', globals.Set.prototype.values, true);
      }

      // Shim incomplete iterator implementations.
      addIterator(Object.getPrototypeOf((new globals.Map()).keys()));
      addIterator(Object.getPrototypeOf((new globals.Set()).keys()));

      if (functionsHaveNames && globals.Set.prototype.has.name !== 'has') {
        // Microsoft Edge v0.11.10074.0 is missing a name on Set#has
        var anonymousSetHas = globals.Set.prototype.has;
        overrideNative(globals.Set.prototype, 'has', function has(key) {
          return _call(anonymousSetHas, this, key);
        });
      }
    }
    defineProperties(globals, collectionShims);
    addDefaultSpecies(globals.Map);
    addDefaultSpecies(globals.Set);
  }

  var throwUnlessTargetIsObject = function throwUnlessTargetIsObject(target) {
    if (!ES.TypeIsObject(target)) {
      throw new TypeError('target must be an object');
    }
  };

  // Some Reflect methods are basically the same as
  // those on the Object global, except that a TypeError is thrown if
  // target isn't an object. As well as returning a boolean indicating
  // the success of the operation.
  var ReflectShims = {
    // Apply method in a functional form.
    apply: function apply() {
      return ES.Call(ES.Call, null, arguments);
    },

    // New operator in a functional form.
    construct: function construct(constructor, args) {
      if (!ES.IsConstructor(constructor)) {
        throw new TypeError('First argument must be a constructor.');
      }
      var newTarget = arguments.length > 2 ? arguments[2] : constructor;
      if (!ES.IsConstructor(newTarget)) {
        throw new TypeError('new.target must be a constructor.');
      }
      return ES.Construct(constructor, args, newTarget, 'internal');
    },

    // When deleting a non-existent or configurable property,
    // true is returned.
    // When attempting to delete a non-configurable property,
    // it will return false.
    deleteProperty: function deleteProperty(target, key) {
      throwUnlessTargetIsObject(target);
      if (supportsDescriptors) {
        var desc = Object.getOwnPropertyDescriptor(target, key);

        if (desc && !desc.configurable) {
          return false;
        }
      }

      // Will return true.
      return delete target[key];
    },

    has: function has(target, key) {
      throwUnlessTargetIsObject(target);
      return key in target;
    }
  };

  if (Object.getOwnPropertyNames) {
    Object.assign(ReflectShims, {
      // Basically the result of calling the internal [[OwnPropertyKeys]].
      // Concatenating propertyNames and propertySymbols should do the trick.
      // This should continue to work together with a Symbol shim
      // which overrides Object.getOwnPropertyNames and implements
      // Object.getOwnPropertySymbols.
      ownKeys: function ownKeys(target) {
        throwUnlessTargetIsObject(target);
        var keys = Object.getOwnPropertyNames(target);

        if (ES.IsCallable(Object.getOwnPropertySymbols)) {
          _pushApply(keys, Object.getOwnPropertySymbols(target));
        }

        return keys;
      }
    });
  }

  var callAndCatchException = function ConvertExceptionToBoolean(func) {
    return !throwsError(func);
  };

  if (Object.preventExtensions) {
    Object.assign(ReflectShims, {
      isExtensible: function isExtensible(target) {
        throwUnlessTargetIsObject(target);
        return Object.isExtensible(target);
      },
      preventExtensions: function preventExtensions(target) {
        throwUnlessTargetIsObject(target);
        return callAndCatchException(function () {
          Object.preventExtensions(target);
        });
      }
    });
  }

  if (supportsDescriptors) {
    var internalGet = function get(target, key, receiver) {
      var desc = Object.getOwnPropertyDescriptor(target, key);

      if (!desc) {
        var parent = Object.getPrototypeOf(target);

        if (parent === null) {
          return void 0;
        }

        return internalGet(parent, key, receiver);
      }

      if ('value' in desc) {
        return desc.value;
      }

      if (desc.get) {
        return ES.Call(desc.get, receiver);
      }

      return void 0;
    };

    var internalSet = function set(target, key, value, receiver) {
      var desc = Object.getOwnPropertyDescriptor(target, key);

      if (!desc) {
        var parent = Object.getPrototypeOf(target);

        if (parent !== null) {
          return internalSet(parent, key, value, receiver);
        }

        desc = {
          value: void 0,
          writable: true,
          enumerable: true,
          configurable: true
        };
      }

      if ('value' in desc) {
        if (!desc.writable) {
          return false;
        }

        if (!ES.TypeIsObject(receiver)) {
          return false;
        }

        var existingDesc = Object.getOwnPropertyDescriptor(receiver, key);

        if (existingDesc) {
          return Reflect.defineProperty(receiver, key, {
            value: value
          });
        } else {
          return Reflect.defineProperty(receiver, key, {
            value: value,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      }

      if (desc.set) {
        _call(desc.set, receiver, value);
        return true;
      }

      return false;
    };

    Object.assign(ReflectShims, {
      defineProperty: function defineProperty(target, propertyKey, attributes) {
        throwUnlessTargetIsObject(target);
        return callAndCatchException(function () {
          Object.defineProperty(target, propertyKey, attributes);
        });
      },

      getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
        throwUnlessTargetIsObject(target);
        return Object.getOwnPropertyDescriptor(target, propertyKey);
      },

      // Syntax in a functional form.
      get: function get(target, key) {
        throwUnlessTargetIsObject(target);
        var receiver = arguments.length > 2 ? arguments[2] : target;

        return internalGet(target, key, receiver);
      },

      set: function set(target, key, value) {
        throwUnlessTargetIsObject(target);
        var receiver = arguments.length > 3 ? arguments[3] : target;

        return internalSet(target, key, value, receiver);
      }
    });
  }

  if (Object.getPrototypeOf) {
    var objectDotGetPrototypeOf = Object.getPrototypeOf;
    ReflectShims.getPrototypeOf = function getPrototypeOf(target) {
      throwUnlessTargetIsObject(target);
      return objectDotGetPrototypeOf(target);
    };
  }

  if (Object.setPrototypeOf && ReflectShims.getPrototypeOf) {
    var willCreateCircularPrototype = function (object, lastProto) {
      var proto = lastProto;
      while (proto) {
        if (object === proto) {
          return true;
        }
        proto = ReflectShims.getPrototypeOf(proto);
      }
      return false;
    };

    Object.assign(ReflectShims, {
      // Sets the prototype of the given object.
      // Returns true on success, otherwise false.
      setPrototypeOf: function setPrototypeOf(object, proto) {
        throwUnlessTargetIsObject(object);
        if (proto !== null && !ES.TypeIsObject(proto)) {
          throw new TypeError('proto must be an object or null');
        }

        // If they already are the same, we're done.
        if (proto === Reflect.getPrototypeOf(object)) {
          return true;
        }

        // Cannot alter prototype if object not extensible.
        if (Reflect.isExtensible && !Reflect.isExtensible(object)) {
          return false;
        }

        // Ensure that we do not create a circular prototype chain.
        if (willCreateCircularPrototype(object, proto)) {
          return false;
        }

        Object.setPrototypeOf(object, proto);

        return true;
      }
    });
  }
  var defineOrOverrideReflectProperty = function (key, shim) {
    if (!ES.IsCallable(globals.Reflect[key])) {
      defineProperty(globals.Reflect, key, shim);
    } else {
      var acceptsPrimitives = valueOrFalseIfThrows(function () {
        globals.Reflect[key](1);
        globals.Reflect[key](NaN);
        globals.Reflect[key](true);
        return true;
      });
      if (acceptsPrimitives) {
        overrideNative(globals.Reflect, key, shim);
      }
    }
  };
  Object.keys(ReflectShims).forEach(function (key) {
    defineOrOverrideReflectProperty(key, ReflectShims[key]);
  });
  var originalReflectGetProto = globals.Reflect.getPrototypeOf;
  if (functionsHaveNames && originalReflectGetProto && originalReflectGetProto.name !== 'getPrototypeOf') {
    overrideNative(globals.Reflect, 'getPrototypeOf', function getPrototypeOf(target) {
      return _call(originalReflectGetProto, globals.Reflect, target);
    });
  }
  if (globals.Reflect.setPrototypeOf) {
    if (valueOrFalseIfThrows(function () {
      globals.Reflect.setPrototypeOf(1, {});
      return true;
    })) {
      overrideNative(globals.Reflect, 'setPrototypeOf', ReflectShims.setPrototypeOf);
    }
  }
  if (globals.Reflect.defineProperty) {
    if (!valueOrFalseIfThrows(function () {
      var basic = !globals.Reflect.defineProperty(1, 'test', { value: 1 });
      // "extensible" fails on Edge 0.12
      var extensible = typeof Object.preventExtensions !== 'function' || !globals.Reflect.defineProperty(Object.preventExtensions({}), 'test', {});
      return basic && extensible;
    })) {
      overrideNative(globals.Reflect, 'defineProperty', ReflectShims.defineProperty);
    }
  }
  if (globals.Reflect.construct) {
    if (!valueOrFalseIfThrows(function () {
      var F = function F() {};
      return globals.Reflect.construct(function () {}, [], F) instanceof F;
    })) {
      overrideNative(globals.Reflect, 'construct', ReflectShims.construct);
    }
  }

  if (String(new Date(NaN)) !== 'Invalid Date') {
    var dateToString = Date.prototype.toString;
    var shimmedDateToString = function toString() {
      var valueOf = +this;
      if (valueOf !== valueOf) {
        return 'Invalid Date';
      }
      return ES.Call(dateToString, this);
    };
    overrideNative(Date.prototype, 'toString', shimmedDateToString);
  }

  // Annex B HTML methods
  // http://www.ecma-international.org/ecma-262/6.0/#sec-additional-properties-of-the-string.prototype-object
  var stringHTMLshims = {
    anchor: function anchor(name) { return ES.CreateHTML(this, 'a', 'name', name); },
    big: function big() { return ES.CreateHTML(this, 'big', '', ''); },
    blink: function blink() { return ES.CreateHTML(this, 'blink', '', ''); },
    bold: function bold() { return ES.CreateHTML(this, 'b', '', ''); },
    fixed: function fixed() { return ES.CreateHTML(this, 'tt', '', ''); },
    fontcolor: function fontcolor(color) { return ES.CreateHTML(this, 'font', 'color', color); },
    fontsize: function fontsize(size) { return ES.CreateHTML(this, 'font', 'size', size); },
    italics: function italics() { return ES.CreateHTML(this, 'i', '', ''); },
    link: function link(url) { return ES.CreateHTML(this, 'a', 'href', url); },
    small: function small() { return ES.CreateHTML(this, 'small', '', ''); },
    strike: function strike() { return ES.CreateHTML(this, 'strike', '', ''); },
    sub: function sub() { return ES.CreateHTML(this, 'sub', '', ''); },
    sup: function sub() { return ES.CreateHTML(this, 'sup', '', ''); }
  };
  _forEach(Object.keys(stringHTMLshims), function (key) {
    var method = String.prototype[key];
    var shouldOverwrite = false;
    if (ES.IsCallable(method)) {
      var output = _call(method, '', ' " ');
      var quotesCount = _concat([], output.match(/"/g)).length;
      shouldOverwrite = output !== output.toLowerCase() || quotesCount > 2;
    } else {
      shouldOverwrite = true;
    }
    if (shouldOverwrite) {
      overrideNative(String.prototype, key, stringHTMLshims[key]);
    }
  });

  var JSONstringifiesSymbols = (function () {
    // Microsoft Edge v0.12 stringifies Symbols incorrectly
    if (!hasSymbols) { return false; } // Symbols are not supported
    var stringify = typeof JSON === 'object' && typeof JSON.stringify === 'function' ? JSON.stringify : null;
    if (!stringify) { return false; } // JSON.stringify is not supported
    if (typeof stringify(Symbol()) !== 'undefined') { return true; } // Symbols should become `undefined`
    if (stringify([Symbol()]) !== '[null]') { return true; } // Symbols in arrays should become `null`
    var obj = { a: Symbol() };
    obj[Symbol()] = true;
    if (stringify(obj) !== '{}') { return true; } // Symbol-valued keys *and* Symbol-valued properties should be omitted
    return false;
  }());
  var JSONstringifyAcceptsObjectSymbol = valueOrFalseIfThrows(function () {
    // Chrome 45 throws on stringifying object symbols
    if (!hasSymbols) { return true; } // Symbols are not supported
    return JSON.stringify(Object(Symbol())) === '{}' && JSON.stringify([Object(Symbol())]) === '[{}]';
  });
  if (JSONstringifiesSymbols || !JSONstringifyAcceptsObjectSymbol) {
    var origStringify = JSON.stringify;
    overrideNative(JSON, 'stringify', function stringify(value) {
      if (typeof value === 'symbol') { return; }
      var replacer;
      if (arguments.length > 1) {
        replacer = arguments[1];
      }
      var args = [value];
      if (!isArray(replacer)) {
        var replaceFn = ES.IsCallable(replacer) ? replacer : null;
        var wrappedReplacer = function (key, val) {
          var parsedValue = replaceFn ? _call(replaceFn, this, key, val) : val;
          if (typeof parsedValue !== 'symbol') {
            if (Type.symbol(parsedValue)) {
              return assignTo({})(parsedValue);
            } else {
              return parsedValue;
            }
          }
        };
        args.push(wrappedReplacer);
      } else {
        // create wrapped replacer that handles an array replacer?
        args.push(replacer);
      }
      if (arguments.length > 2) {
        args.push(arguments[2]);
      }
      return origStringify.apply(this, args);
    });
  }

  return globals;
}));
});

function nodeReq(pkg) {
    return require(pkg);
}

var alias = {"b":"bundle","c":"config","e":"env","h":"help","v":"version","i":"install","w":"watch"};
var commands = {
	alias: alias
};

function cliArgs() {
    var minimist = nodeReq('minimist');
    var argv = process.argv.slice(2);
    var parentArgs;
    var parentArgsExitst = argv.some(function (arg) {
        parentArgs = arg;
        return arg.startsWith('orbitalprocessargv=');
    });
    if (parentArgsExitst) {
        var parentArgv = JSON.parse(parentArgs.split('=')[1]);
        return minimist(parentArgv.slice(2), commands);
    } else {
        return minimist(process.argv.slice(2), commands);
    }
}

var DEFAULT_CONFIG_FILE_NAME = 'orbital.config.js';

function getOrbitalConfig() {
    var fs = nodeReq('fs');
    var cargs = cliArgs();
    var configFileName = DEFAULT_CONFIG_FILE_NAME;
    if (typeof cargs.config === 'string') {
        configFileName = cargs.config;
    }
    var configPath = fs.realpathSync(configFileName);
    if (fs.existsSync(configPath)) {
        return nodeReq(configPath);
    }
    return {};
}

function getPlatform() {
    if (typeof process === 'object') {
        if (process.browser) {
            return 'webpack';
        } else {
            return 'node';
        }
    } else if (window) {
        return 'amd';
    } else {
        return 'unknown';
    }
}

function nextTick(fn) {
    setTimeout(fn);
}

function prefix() {
    var chalk = nodeReq('chalk');
    return chalk.green.bold('ORBITAL');
}
function arrow() {
    var chalk = nodeReq('chalk');
    return chalk.white('>');
}
var nl = '\n';

var style = {
    debug: function debug(str) {
        var chalk = nodeReq('chalk');
        return chalk.gray(str);
    },
    error: function error(str) {
        var chalk = nodeReq('chalk');
        return chalk.red(str);
    },
    info: function info(str) {
        var chalk = nodeReq('chalk');
        return chalk.greenBright(str);
    },
    warn: function warn(str) {
        var chalk = nodeReq('chalk');
        return chalk.yellowBright(str);
    }
};

function format(args) {
    args.unshift(arrow());
    args.unshift(prefix());
    args.push(nl);
}

function out(arrs, type) {
    var args = ([]).slice.call(arrs);
    if (args.length) {
        format(args);
        var str = args.join(' ');
        var res = type ? style[type](str) : str;
        process.stdout.write(res);
    }
}

function err(arrs, type) {
    var args = ([]).slice.call(arrs);
    if (args.length) {
        format(args);
        process.stderr.write(style[type](args.join(' ')));
    }
}

var logger = {
    debug: function debug() {
        out(arguments, 'debug');
    },
    error: function error() {
        err(arguments, 'error');
    },
    info: function info() {
        out(arguments, 'info');
    },
    log: function log() {
        out(arguments);
    },
    nl: function nl$1() {
        process.stdout.write(nl);
    },
    warn: function warn() {
        err(arguments, 'warn');
    }
};

//TODO convert as a servcie

var nl$1 = '\n          ';

function trimStack(stack) {
    var stacks = stack.split('\n');
    var lines = stacks.map(function (line) {
        return line.trim();
    });
    return lines.join(nl$1);
}

function formated(type, thrower, error) {
    var msg;
    if (getPlatform() === 'node') {
        msg = (type.toLowerCase()) + " " + thrower + nl$1;
        if (error.stack) {
            msg += trimStack(error.stack);
        } else {
            msg += "Reason: " + error;
        }
    } else {
        msg = "[ORBITAL] " + type + "\n"
            + "Location: " + thrower + "\n"
            + "Reason: " + error;
        if (error.stack) {
            msg += "\n" + (error.stack);
        }
    }
    return msg;
}

var Notice = function Notice () {};

Notice.debug = function debug () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

    if (getPlatform() === 'node') {
        logger.debug.apply(logger, args);
    } else {
        if (args[0]) {
            args[0] = '' + args[0];
        }
        console.info.apply(console, args);
    }
};

Notice.error = function error (thrower, error$1) {
    var msg = formated('ERROR', thrower, error$1);
    if (getPlatform() === 'node') {
        logger.error(msg);
    } else {
        console.warn(msg);
    }
};

Notice.log = function log () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

    if (getPlatform() === 'node') {
        logger.log.apply(logger, args);
    } else {
        if (args[0]) {
            args[0] = '' + args[0];
        }
        console.log.apply(console, args);
    }
};

Notice.warn = function warn (thrower, error) {
    var msg = formated('WARNING', thrower, error);
    if (getPlatform() === 'node') {
        logger.warn(msg);
    } else {
        console.warn(msg);
    }
};

function objectify(path, value) {
    if (typeof path !== 'string') { return value; }
    var tokens = path.split('/').reverse();
    return tokens.reduce(function (prev, cur) {
        var o = {};
        o[cur] = prev;
        return o;
    }, value);
}

'use strict';

var domain;

// This constructor is used to store event handlers. Instantiating this is
// faster than explicitly calling `Object.create(null)` to get a "clean" empty
// object (tested with v8 v4.9).
function EventHandlers() {}
EventHandlers.prototype = Object.create(null);

function EventEmitter() {
  EventEmitter.init.call(this);
}
// nodejs oddity
// require('events') === require('events').EventEmitter
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.usingDomains = false;

EventEmitter.prototype.domain = undefined;
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

EventEmitter.init = function() {
  this.domain = null;
  if (EventEmitter.usingDomains) {
    // if there is an active domain, then attach to it.
    if (domain.active && !(this instanceof domain.Domain)) {
      this.domain = domain.active;
    }
  }

  if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
    this._events = new EventHandlers();
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    { throw new TypeError('"n" argument must be a positive number'); }
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    { return EventEmitter.defaultMaxListeners; }
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    { handler.call(self); }
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      { listeners[i].call(self); }
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    { handler.call(self, arg1); }
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      { listeners[i].call(self, arg1); }
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    { handler.call(self, arg1, arg2); }
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      { listeners[i].call(self, arg1, arg2); }
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    { handler.call(self, arg1, arg2, arg3); }
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      { listeners[i].call(self, arg1, arg2, arg3); }
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    { handler.apply(self, args); }
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      { listeners[i].apply(self, args); }
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var arguments$1 = arguments;

  var er, handler, len, args, i, events, domain;
  var needDomainExit = false;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    { doError = (doError && events.error == null); }
  else if (!doError)
    { return false; }

  domain = this.domain;

  // If there is no 'error' event listener then throw.
  if (doError) {
    er = arguments[1];
    if (domain) {
      if (!er)
        { er = new Error('Uncaught, unspecified "error" event'); }
      er.domainEmitter = this;
      er.domain = domain;
      er.domainThrown = false;
      domain.emit('error', er);
    } else if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    { return false; }

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
    // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
    // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        { args[i - 1] = arguments$1[i]; }
      emitMany(handler, isFn, this, args);
  }

  if (needDomainExit)
    { domain.exit(); }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    { throw new TypeError('"listener" argument must be a function'); }

  events = target._events;
  if (!events) {
    events = target._events = new EventHandlers();
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] = prepend ? [listener, existing] :
                                          [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
                            existing.length + ' ' + type + ' listeners added. ' +
                            'Use emitter.setMaxListeners() to increase limit');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        emitWarning(w);
      }
    }
  }

  return target;
}
function emitWarning(e) {
  typeof console.warn === 'function' ? console.warn(e) : console.log(e);
}
EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function _onceWrap(target, type, listener) {
  var fired = false;
  function g() {
    target.removeListener(type, g);
    if (!fired) {
      fired = true;
      listener.apply(target, arguments);
    }
  }
  g.listener = listener;
  return g;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    { throw new TypeError('"listener" argument must be a function'); }
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        { throw new TypeError('"listener" argument must be a function'); }
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        { throw new TypeError('"listener" argument must be a function'); }

      events = this._events;
      if (!events)
        { return this; }

      list = events[type];
      if (!list)
        { return this; }

      if (list === listener || (list.listener && list.listener === listener)) {
        if (--this._eventsCount === 0)
          { this._events = new EventHandlers(); }
        else {
          delete events[type];
          if (events.removeListener)
            { this.emit('removeListener', type, list.listener || listener); }
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length; i-- > 0;) {
          if (list[i] === listener ||
              (list[i].listener && list[i].listener === listener)) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          { return this; }

        if (list.length === 1) {
          list[0] = undefined;
          if (--this._eventsCount === 0) {
            this._events = new EventHandlers();
            return this;
          } else {
            delete events[type];
          }
        } else {
          spliceOne(list, position);
        }

        if (events.removeListener)
          { this.emit('removeListener', type, originalListener || listener); }
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var this$1 = this;

      var listeners, events;

      events = this._events;
      if (!events)
        { return this; }

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = new EventHandlers();
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            { this._events = new EventHandlers(); }
          else
            { delete events[type]; }
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        for (var i = 0, key; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') { continue; }
          this$1.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = new EventHandlers();
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        do {
          this$1.removeListener(type, listeners[listeners.length - 1]);
        } while (listeners[0]);
      }

      return this;
    };

EventEmitter.prototype.listeners = function listeners(type) {
  var evlistener;
  var ret;
  var events = this._events;

  if (!events)
    { ret = []; }
  else {
    evlistener = events[type];
    if (!evlistener)
      { ret = []; }
    else if (typeof evlistener === 'function')
      { ret = [evlistener.listener || evlistener]; }
    else
      { ret = unwrapListeners(evlistener); }
  }

  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    { list[i] = list[k]; }
  list.pop();
}

function arrayClone(arr, i) {
  var copy = new Array(i);
  while (i--)
    { copy[i] = arr[i]; }
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

var Base = (function (EventEmitter$$1) {
    function Base() {
        EventEmitter$$1.call(this);
        this.setMaxListeners(0);
    }

    if ( EventEmitter$$1 ) Base.__proto__ = EventEmitter$$1;
    Base.prototype = Object.create( EventEmitter$$1 && EventEmitter$$1.prototype );
    Base.prototype.constructor = Base;

    Base.prototype.define = function define (key, value, option) {
        if (typeof option !== 'object') {
            Reflect.defineProperty(this, key, {value: value});
        } else {
            Object.assign(option, {value: value});
            Reflect.defineProperty(this, key, option);
        }
    };

    Base.prototype.shouldImplement = function shouldImplement (method) {
        throw new Error(((this) + " should implement " + method));
    };

    Base.prototype.debug = function debug () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        args[0] = this + ' ' + args[0];
        Notice.debug.apply(Notice, args);
    };

    Base.prototype.off = function off (eventName, listener) {
        this.removeListener(eventName, listener);
    };

    Base.prototype.toString = function toString () {
        var className = '';
        if (this.constructor.name) {
            className = "<" + (this.constructor.name) + ">";
        }
        return className;
    };

    return Base;
}(EventEmitter));

var PluginActivator = (function (Base$$1) {
    function PluginActivator () {
        Base$$1.apply(this, arguments);
    }

    if ( Base$$1 ) PluginActivator.__proto__ = Base$$1;
    PluginActivator.prototype = Object.create( Base$$1 && Base$$1.prototype );
    PluginActivator.prototype.constructor = PluginActivator;

    PluginActivator.prototype.onStart = function onStart (/*context*/) {
    };

    PluginActivator.prototype.onStop = function onStop (/*context*/) {
    };

    return PluginActivator;
}(Base));

function getPackageId$1(node) {
    var pack = node.package;
    return pack.name + '@' + pack.version;
}

function getBundleModuleName(type, contributionId, index) {
    return [type, contributionId, index].join('-').replace(':', '@');
}

function getPackageName(id) {
    return id.split(':')[0];
}

function listenNodeRegistry(registry, Starter) {
    registry.on('packageAdded', function (pack) {
        if (!Starter.system) {return;}
        Starter.system.getContext()
            .installPlugin(pack.getManifest())
            .then(function (plugin) {
                plugin.start();
            });
    });
    registry.on('packageWillUpdate', function (reloadId) {
        if (!Starter.system) {return;}
        var pluginToReload = Starter.system.getContext()
            .getPluginRegistry().getPluginById(reloadId);
        pluginToReload.stop();
    });
    registry.on('packageUpdated', function (id, manifest) {
        if (!Starter.system) {return;}
        var plugin = Starter.system.getContext()
            .getPluginRegistry().getPluginById(id);
        plugin.ensureStopped().then(function () {
            plugin.init(manifest);
            plugin.start({
                contributors: 'active'
            });
        });
    });
    registry.on('packageWillRemove', function (pack) {
        if (!Starter.system) {return;}
        Starter.system.getContext().uninstallPlugin(pack.getId());
    });
}

function touchOrbital(rootPath, callback) {
    var rpt = nodeReq('read-package-tree');
    rpt(rootPath, function (err, root) {
        if (err) {
            logger.error(err);
            return;
        }
        (function walk(node) {
            var pack = node.package;
            if (pack.name === 'orbital.js') {
                var fs = nodeReq('fs');
                var path = nodeReq('path');
                var p = path.resolve(node.realpath, pack.main);
                fs.open(p, 'r+', function (err, fd) {
                    var time = Date.now() / 1000;
                    fs.futimes(fd, time, time, function () {
                        callback(p);
                    });
                });
                return;
            }
            node.children.forEach(function (child) {
                walk(child);
            });
        })(root);
    });
}

function listenWebpackRegistry(registry) {
    function processQueue() {
        logger.log('processing update queue');
        touchOrbital(registry.rootPath, function (/*p*/) {
            logger.log('orbital touched');
        });
    }
    function addUpdateQueue(event, id, manifest) {
        logger.log(event, id);
        if (registry.queue.length === 0) {
            processQueue();
        }
        registry.queue.push({event: event, id: id, manifest: manifest});
    }
    registry.on('packageAdded', function (pack) {
        addUpdateQueue('packageAdded', pack.getId(), pack.getManifest());
    });
    registry.on('packageWillUpdate', function (reloadId) {
        logger.log('packageWillUpdate', reloadId, 'does nothing');
    });
    registry.on('packageUpdated', function (id, manifest) {
        addUpdateQueue('packageUpdated', id, manifest);
    });
    registry.on('packageWillRemove', function (pack) {
        logger.log('packageWillRemove', pack, 'does nothing');
    });
    registry.on('packageRemoved', function (pack) {
        addUpdateQueue('packageRemoved', pack.getId(), pack.getManifest());
    });
}

var RegistryListener = function RegistryListener () {};

RegistryListener.listen = function listen (registry, platform, Starter) {
    switch (platform) {
        case 'node':
            listenNodeRegistry(registry, Starter);
            break;
        case 'webpack':
            listenWebpackRegistry(registry, Starter);
            break;
        default:
    }
};

function loadLiveUpdateManager(registry, platform, Starter) {
    var args = cliArgs();
    if (args.watch) {
        RegistryListener.listen(registry, platform, Starter);
        var lum = new LiveUpdateManager(registry, platform);
        return lum;
    }
    return null;
}

var DEFAULT_BUNDLE_PATH = './dist';
var DEFAULT_TARGET = 'node';
var DEFAULT_NODE_BUNDLER = 'rollup';
var DEFAULT_UMD_BUNDLER = 'webpack';
var DEFAULT_WEB_BUNDLER = 'webpack';
var DEFAULT_NODE_FORMAT = 'cjs';
var DEFAULT_UMD_FORMAT = 'umd';
var DEFAULT_WEB_FORMAT = 'amd';

/*
1) default target is 'node'.
2) without bundle field,
    'web' target assumes source modules are 'amd'.
    'node' target assumes source modules are 'commonjs'.
    target is set to both, assumes source modules are 'umd'.
*/

function normalize(mf) {
    var manifest = Object.assign({}, mf);
    function applyNorm(orbMeta, type) {
        if (!orbMeta[type]) {
            orbMeta[type] = {
                services: [],
                extensions: []
            };
        } else {
            if (!orbMeta[type].services) {
                orbMeta[type].services = [];
            }
            if (!orbMeta[type].extensions) {
                orbMeta[type].extensions = [];
            }
        }
    }
    function applyTarget(orbMeta) {
        if (!orbMeta.policies) {
            orbMeta.policies = [];
        }
        if (!orbMeta.target) {
            orbMeta.target = [DEFAULT_TARGET];
        } else {
            if (typeof orbMeta.target === 'string') {
                orbMeta.target = [orbMeta.target];
            } else if (!(orbMeta.target instanceof Array)) {
                logger.warn('target should be a string or an array of strings');
            }
        }
    }
    function applyBundle(orbMeta) {
        var targetIsWeb = orbMeta.target.indexOf('web') > -1;
        var targetIsNode = orbMeta.target.indexOf('node') > -1;
        var typeofBundle = typeof orbMeta.bundle;
        if (targetIsWeb && targetIsNode) {
            if (typeofBundle === 'boolean') {
                orbMeta.bundle = {
                    bundler: DEFAULT_UMD_BUNDLER,
                    format: DEFAULT_UMD_FORMAT
                };
            } else if (typeofBundle === 'object') {
                if (!orbMeta.bundle.bundler) {
                    orbMeta.bundle.bundler = DEFAULT_UMD_BUNDLER;
                }
                if (!orbMeta.bundle.format) {
                    orbMeta.bundle.format = DEFAULT_UMD_FORMAT;
                }
            }
        } else {
            if (targetIsWeb) {
                if (typeofBundle === 'boolean') {
                    orbMeta.bundle = {
                        bundler: DEFAULT_WEB_BUNDLER,
                        format: DEFAULT_WEB_FORMAT
                    };
                } else if (typeofBundle === 'object') {
                    if (!orbMeta.bundle.bundler) {
                        orbMeta.bundle.bundler = DEFAULT_WEB_BUNDLER;
                    }
                    if (!orbMeta.bundle.format) {
                        orbMeta.bundle.format = DEFAULT_WEB_FORMAT;
                    }
                }
            } else if (targetIsNode) {
                if (typeofBundle === 'boolean') {
                    orbMeta.bundle = {
                        bundler: DEFAULT_NODE_BUNDLER,
                        format: DEFAULT_NODE_FORMAT
                    };
                } else if (typeofBundle === 'object') {
                    if (!orbMeta.bundle.bundler) {
                        orbMeta.bundle.bundler = DEFAULT_NODE_BUNDLER;
                    }
                    if (!orbMeta.bundle.format) {
                        orbMeta.bundle.format = DEFAULT_NODE_FORMAT;
                    }
                }
            }
        }
        if (orbMeta.bundle && !orbMeta.bundle.path) {
            orbMeta.bundle.path = DEFAULT_BUNDLE_PATH;
        }
    }
    if (typeof manifest.dependencies !== 'object') {
        manifest.dependencies = {};
    }
    if (typeof manifest.orbital !== 'object') {
        manifest.orbital = {};
    }
    ['contributable', 'contributes'].forEach(function (type) {
        applyNorm(manifest.orbital, type);
    });
    applyTarget(manifest.orbital);
    applyBundle(manifest.orbital);
    return manifest;
}

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
function resolve() {
  var arguments$1 = arguments;

  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments$1[i] : '/';

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
}

// path.normalize(path)
// posix version
function normalize$2(path) {
  var isPathAbsolute = isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isPathAbsolute).join('/');

  if (!path && !isPathAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isPathAbsolute ? '/' : '') + path;
}

// posix version
function isAbsolute(path) {
  return path.charAt(0) === '/';
}

// posix version
function join() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return normalize$2(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
}


// path.relative(from, to)
// posix version
function relative(from, to) {
  from = resolve(from).substr(1);
  to = resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') { break; }
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') { break; }
    }

    if (start > end) { return []; }
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
}

var sep = '/';
var delimiter = ':';

function dirname(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
}

function basename(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
}


function extname(path) {
  return splitPath(path)[3];
}
var path = {
  extname: extname,
  basename: basename,
  dirname: dirname,
  sep: sep,
  delimiter: delimiter,
  relative: relative,
  join: join,
  isAbsolute: isAbsolute,
  normalize: normalize$2,
  resolve: resolve
};
function filter (xs, f) {
    if (xs.filter) { return xs.filter(f); }
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) { res.push(xs[i]); }
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b' ?
    function (str, start, len) { return str.substr(start, len) } :
    function (str, start, len) {
        if (start < 0) { start = str.length + start; }
        return str.substr(start, len);
    };

function validateContributionFile(realizedPath) {
    var fs = nodeReq('fs');
    if (!fs.existsSync(realizedPath)) {
        var relativePath = path.relative(process.cwd(), realizedPath);
        var error = new Error(relativePath);
        error.type = 'MODULE_NOT_FOUND';
        throw error;
    }
}

var REALIZE_REQUIRED = "'realize' field is required";
var ID_REQUIRED = "'id' field is required";
var ID_SYNTAX_ERROR = "'id' field has a syntax error";

function validateContributionSyntax(contribution, type) {
    var error = new Error();
    var id = contribution.id;
    error.type = 'CONTRIBUTION_SYNTAX_ERROR';
    function context() {
        var result = ' by ' + type;
        if (id) {
            result = ' by ' + id + ' ' + type;
        }
        return result;
    }
    if (!id) {
        error.message = ID_REQUIRED + context();
        throw error;
    }
    var index = id.indexOf(':');
    if (index === -1 || index === (id.length - 1)) {
        error.message = ID_SYNTAX_ERROR + " ('" + id + "')";
        throw error;
    }
    if (!contribution.realize) {
        error.message = REALIZE_REQUIRED + context();
        throw error;
    }
}

var DEFAULT_ROOT_PATH = '.';
var DEFAULT_PLUGINS_PATH = './src/plugins';

function getRootPath(config) {
    return config.path && config.path.root || DEFAULT_ROOT_PATH;
}

function getPluginsPath(config) {
    return config.path && config.path.plugins || DEFAULT_PLUGINS_PATH;
}

var LiveUpdateManager = function LiveUpdateManager(registry, platform) {
    this.registry = registry;
    this.platform = platform;
    this.startPluginWatcher();
};

LiveUpdateManager.prototype.close = function close () {
    this.watcher.close();
    logger.log('live-update-manager stopped.');
};

LiveUpdateManager.prototype.startPluginWatcher = function startPluginWatcher () {
    var config = getOrbitalConfig();
    var chalk = nodeReq('chalk');
    var chokidar = nodeReq('chokidar');
    this.rootPath = getRootPath(config);
    this.pluginsPath = getPluginsPath(config);
    this.startWatcher = chokidar
        .watch(this.pluginsPath, {ignoreInitial: true, persistent: true})
        .on('all', this.handleChange.bind(this))
        .on('error', function (err) {
            logger.log(err);
        });
    logger.nl();
    logger.log('live-update-manager is watching '
        + "'" + (chalk.bold.cyan(this.pluginsPath)) + "'. ctrl+c to exit.\n");
};

LiveUpdateManager.prototype.copy = function copy (source, target) {
    var fse = nodeReq('fs-extra');
    var path = nodeReq('path');
    return new Promise(function (resolve, reject) {
        fse.ensureDir(path.dirname(target))
            .then(function () {
                fse.copy(source, target, function (err) {
                    if (err) {
                        reject(err);
                        logger.error(err);
                        return;
                    }
                    delete require.cache[target];
                    logger.log(("cache cleared (" + target + ")"));
                    resolve();
                });
            })
            .catch(function (err) {
                reject(err);
                logger.error(err);
            });
    });
};

/**
 * For WDS, copy is just enough.
 * But manifest change needs to call registry.refresh()
 * and it could be handled by registry.queue and orbital-loader.
 */
LiveUpdateManager.prototype.copySource = function copySource (source, target, event, node) {
        var this$1 = this;

    return this.copy(source, target)
        .then(function () {
            this$1.logState(event, target);
            if (node) {
                if (this$1.platform === 'node') {
                    this$1.registry.refresh(node);
                }
            }
        });
};

LiveUpdateManager.prototype.execSync = function execSync (cmd) {
    var childProcess = nodeReq('child_process');
    logger.log(cmd);
    childProcess.execSync(cmd, {
        stdio: 'inherit'
    });
};

LiveUpdateManager.prototype.getEldestNode = function getEldestNode (seed) {
    var node = seed;
    var rootId = this.registry.root.package._id;
    while (node && (node.parent.package._id !== rootId)) {
        node = node.parent;
    }
    return node;
};

LiveUpdateManager.prototype.getManifestPath = function getManifestPath (node) {
    var path = nodeReq('path');
    return path.resolve(
        node.package._from, 'package.json');
};

LiveUpdateManager.prototype.handleChange = function handleChange (event, changedPath) {
        var this$1 = this;

    var path = nodeReq('path');
    var filepath = path.relative(process.cwd(), changedPath);
    if (this.isRemovedManifestHandled(event, filepath)) {
        return;
    } else if (this.isNewManifestHandled(event, filepath)) {
        return;
    }
    var fs = nodeReq('fs');
    var rpj = nodeReq('read-package-json');
    var rpt = nodeReq('read-package-tree');
    var cwd = process.cwd();
    var absSourceFile = cwd + path.sep + filepath;
    var absPluginsDir = fs.realpathSync(this.pluginsPath);
    var relFile = path.relative(absPluginsDir, absSourceFile);
    var relTokens = relFile.split(path.sep);
    var relSourcePackageDir = relTokens.shift();
    var relSourceFile = relTokens.join(path.sep);
    var manifestPath = absPluginsDir + path.sep
        + relSourcePackageDir + path.sep + 'package.json';
    rpj(manifestPath, function (err, manifest) {
        if (err) {
            logger.error(("Error reading manifest file (" + manifestPath + ")"));
            return;
        }
        //find a package inside of the rpt
        //Node {path, realpath, error, id, package, parent, isLink, children}
        rpt(this$1.rootPath, function (err, root) {
            this$1.walk(root, {
                event: event,
                manifest: manifest,
                source: {
                    absolute: absSourceFile,
                    relative: relSourceFile
                }
            });
        });
    });
};

LiveUpdateManager.prototype.handleSourceChange = function handleSourceChange (source, target, event, node) {
    var fs = nodeReq('fs');
    if (fs.existsSync(target)) {
        if (this.isSame(source, target)) {
            this.logState('nothing changed');
        } else {
            this.handleSourceChangeByType(source, target, event, node);
        }
    } else {
        this.handleSourceChangeByType(source, target, event, node);
    }
};

LiveUpdateManager.prototype.handleSourceChangeByType = function handleSourceChangeByType (source, target, event, node) {
    if (this.getManifestPath(node) === source) {
        this.logState('manifest changed');
        var registry = this.registry;
        var id = getPackageId$1(node);
        if (registry.exists(node)) {
            this.updateEldestNode(node)
                .then(function () {
                    logger.log(
                        (id + " exists, refreshing package in registry"));
                    registry.refresh(node);
                });
        } else {
            this.installEldestNode(node)
                .then(function () {
                    logger.log(
                        (id + " does not exists, add package to registry"));
                    registry.add(node);
                });
        }
    } else {
        this.copySource(source, target, event, node);
    }
};

LiveUpdateManager.prototype.handleSourceRemove = function handleSourceRemove (source, target, event, node) {
    if (this.getManifestPath(node) === source) {
        logger.warn('abnormal manifest unlink case', source, target, node);
    } else {
        this.removeTarget(target, event, node);
    }
};

LiveUpdateManager.prototype.installEldestNode = function installEldestNode (node) {
        var this$1 = this;

    return new Promise(function (resolve, reject) {
        try {
            var fs = nodeReq('fs');
            var eldest = this$1.getEldestNode(node);
            var from = fs.realpathSync(eldest.package._from);
            this$1.installPath(from);
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

LiveUpdateManager.prototype.installPath = function installPath (path) {
    this.execSync(("npm install " + path));
};

/**
* 1) Validate manifest path (src\plugins\examples.rest.products\package.json)
* 2) Locate path to install
* 3) npm install <package>
* 4) registry.initPackages()
*/
LiveUpdateManager.prototype.isNewManifestHandled = function isNewManifestHandled (event, filepath) {
    var path = nodeReq('path');
    if (path.basename(filepath) === 'package.json') {
        var relativePath = path.relative(this.pluginsPath, filepath);
        var packageDir = path.dirname(relativePath);
        if (packageDir.indexOf(path.sep) === -1) {
            this.logState(("manifest " + event), filepath);
            try {
                var registry = this.registry;
                var manifest = this.readManifest(filepath);
                var packageId = (manifest.name) + "@" + (manifest.version);
                var srcPath = path.dirname(filepath);
                if ((event === 'add')
                    || ((event === 'change')
                        && !registry.getPackageById(packageId)
                    )) {
                    this.logState(("manifest " + event + " success"),
                        ("installing " + packageDir + " ..."));
                    this.installPath(srcPath);
                    registry.addById(packageId)
                        .then(function () {
                            registry.printDependencies();
                        });
                    return true;
                }
                return false;
            } catch (e) {
                logger.warn('manifest error.',
                    ((e.message) + " (" + filepath + ")"));
                return true;
            }
        }
        logger.warn((packageDir + " is not a valid package path"));
        return false;
    }
    return false;
};

/**
* 1) Locate installed path
* 2) npm uninstall <package>
* 3) registry.initPackages()
*/
LiveUpdateManager.prototype.isRemovedManifestHandled = function isRemovedManifestHandled (event, filepath) {
        var this$1 = this;

    var fs = nodeReq('fs');
    var path = nodeReq('path');
    if (event === 'unlink' && path.basename(filepath) === 'package.json') {
        var registry = this.registry;
        var from = path.dirname(filepath);
        var pack = registry.getPackageByProperty('_from', from);
        if (pack) {
            var installedPath = fs.realpathSync(
                './node_modules' + pack.node.package._location);
            this.logState(("manifest " + event + " success"),
                ("uninstalling " + (pack.getId()) + " ..."));
            registry.remove(pack)
                .then(function () {
                    registry.printDependencies();
                })
                .then(function () {
                    this$1.remove(installedPath)
                        .then(function () {
                            this$1.logState('manifest removed',
                                pack.getId() + ' uninstalled');

                        });
                });
            return true;
        }
    }
    return false;
};

LiveUpdateManager.prototype.isSame = function isSame (source, target) {
    var fs = nodeReq('fs');
    var sCode = fs.readFileSync(source);
    var tCode = fs.readFileSync(target);
    return sCode.toString() === tCode.toString();
};

LiveUpdateManager.prototype.logState = function logState (state, path) {
    var chalk = nodeReq('chalk');
    logger.log(
        chalk.bold.white.bgGreen((" " + (state.toUpperCase()) + " ")),
        path ? path.replace(process.cwd(), '') : '');
};

LiveUpdateManager.prototype.readManifest = function readManifest (filepath) {
    var fs = nodeReq('fs');
    var manifest = JSON.parse(fs.readFileSync(filepath));
    if (!manifest.name) {
        throw new Error("package.json should have a 'name' field.");
    } else if (!manifest.version) {
        throw new Error("package.json should have a 'version' field.");
    } else if (typeof manifest.orbital === 'undefined') {
        throw new Error("orbital's package.json should have an 'orbital' field.");
    } else if (typeof manifest.orbital !== 'object') {
        throw new Error("'orbital' field should be an object.");
    }
    return manifest;
};

LiveUpdateManager.prototype.remove = function remove (target) {
    var fse = nodeReq('fs-extra');
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            fse.remove(target, function (err) {
                if (err) {
                    reject(err);
                    logger.error(err);
                    return;
                }
                delete require.cache[target];
                resolve();
            });
        }, 300);
    });
};

LiveUpdateManager.prototype.removeTarget = function removeTarget (target, event, node) {
        var this$1 = this;

    this.remove(target)
        .then(function () {
            this$1.logState(event, target);
            if (node) {
                this$1.registry.refresh(node);
            }
        });
};

LiveUpdateManager.prototype.update = function update (node, opt) {
    var path = nodeReq('path');
    var event = opt.event;
    var source = opt.source.absolute;
    var target = node.realpath + path.sep + opt.source.relative;
    if (event === 'change') {
        this.handleSourceChange(source, target, event, node);
    } else if (event === 'unlink') {
        this.handleSourceRemove(source, target, event, node);
    } else if (event === 'add') {
        this.handleSourceChangeByType(source, target, event, node);
    } else if (event === 'addDir') {
        this.copySource(source, target, event);
    } else if (event === 'unlinkDir') {
        this.removeTarget(target, event);
    } else {
        logger.warn('live-update-manager received an unhandled event', event);
    }
};

LiveUpdateManager.prototype.updateEldestNode = function updateEldestNode (node) {
        var this$1 = this;

    return new Promise(function (resolve, reject) {
        try {
            var eldest = this$1.getEldestNode(node);
            this$1.updateNode(eldest);
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

LiveUpdateManager.prototype.updateNode = function updateNode (node) {
    this.execSync(("npm uninstall " + (node.package.name)));
    this.execSync(("npm install " + (node.package._from)));
};

LiveUpdateManager.prototype.walk = function walk (node, opt) {
        var this$1 = this;

    if (opt.manifest._id === node.package._id) {
        this.update(node, opt);
    }
    if (node.children) {
        node.children.forEach(function (childNode) {
            this$1.walk(childNode, opt);
        });
    }
};

var loaders = {
    amd: function amd() {
        console.log('amd');
    },
    node: function node(Starter, onDiscover) {
        var registry = new PackageRegistry$1('./');
        registry
            .initPackages()
            .then(function () {registry.printDependencies();})
            .then(function () {loadLiveUpdateManager(registry, 'node', Starter);})
            .then(function () {onDiscover(registry.getManifests());})
            .catch(function (e) {
                logger.error(e);
                logger.warn(e.stack);
            });
    },
    webpack: function webpack() {
        'webpack-orbital-loader-code-block';
    },
    unknown: function unknown() {
        console.log('unknown platform');
    }
};

var ManifestLoader = function ManifestLoader () {};

ManifestLoader.discover = function discover (Starter, onDiscover) {
    loaders[getPlatform()](Starter, onDiscover);
};

var FlagSupport = function FlagSupport() {
    this.resetFlags();
};

FlagSupport.prototype.getBitMask = function getBitMask () {
    return this._flags;
};

/**
 * Returns true the flag (or one of the flags)
 * indicated by the given bitmask is set to true.
 *
 * @param {number} flag - the bitmask of flag(s)
 * @return {boolean}
 */
FlagSupport.prototype.getFlag = function getFlag (flag) {
    return (this._flags & flag) !== 0;
};

FlagSupport.prototype.resetFlags = function resetFlags () {
    this._flags = 0;
};

/**
 * Sets the flag (or all of the flags) indicated by
 * the given bitmask to the given value.
 *
 * @param {number} flag - the bitmask of the flag(s)
 * @param {boolean} value - the new value
 */
FlagSupport.prototype.setFlag = function setFlag (flag, value) {
    if (typeof flag === 'undefined') {
        throw new Error('Invalid flag name');
    }
    if (value) {
        this._flags |= flag;
    } else {
        this._flags &= ~flag;
    }
};

//import InstallError from '../exceptions/InstallError';
var reg = new Map();

var ExportsRegistry = {

    register: function register(name, version, exports) {
        if (!reg.has(name)) {
            reg.set(name, {});
        }
        var regsByName = reg.get(name);
        regsByName[version] = exports;
        Notice.log((name + "@" + version + " registered to ExportsRegistry"));
        /*
        if (regsByName[version]) {
            throw new Error(
                `${InstallError.ALEXIST} (${name}@${version})`);
        } else {
            regsByName[version] = exports;
            Notice.log(`${name}@${version} ${JSON.stringify(exports)} registered to ExportsRegistry`);
        }
        */
    },

    unregister: function unregister(name, version) {
        var regsByName = reg.get(name);
        if (regsByName && regsByName[version]) {
            delete regsByName[version];
            Notice.log((name + "@" + version + " unregistered from ExportsRegistry"));
        }
    },

    update: function update(name, version, exports) {
        this.unregister(name, version);
        this.register(name, version, exports);
    },

    getExportsByPlugin: function getExportsByPlugin(plugin) {
        var name = plugin.getName();
        var version = plugin.getVersion();
        var byName = reg.get(name);
        if (byName) {
            return byName[version];
        }
        return null;
    }
};

var lodash_merge = createCommonjsModule(function (module, exports) {
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
cloneableTags[boolTag] = cloneableTags[dateTag] =
cloneableTags[float32Tag] = cloneableTags[float64Tag] =
cloneableTags[int8Tag] = cloneableTags[int16Tag] =
cloneableTags[int32Tag] = cloneableTags[mapTag] =
cloneableTags[numberTag] = cloneableTags[objectTag] =
cloneableTags[regexpTag] = cloneableTags[setTag] =
cloneableTags[stringTag] = cloneableTags[symbolTag] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports = 'object' == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Adds the key-value `pair` to `map`.
 *
 * @private
 * @param {Object} map The map to modify.
 * @param {Array} pair The key-value pair to add.
 * @returns {Object} Returns `map`.
 */
function addMapEntry(map, pair) {
  // Don't return `map.set` because it's not chainable in IE 11.
  map.set(pair[0], pair[1]);
  return map;
}

/**
 * Adds `value` to `set`.
 *
 * @private
 * @param {Object} set The set to modify.
 * @param {*} value The value to add.
 * @returns {Object} Returns `set`.
 */
function addSetEntry(set, value) {
  // Don't return `set.add` because it's not chainable in IE 11.
  set.add(value);
  return set;
}

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/**
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */
function arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1,
      length = array ? array.length : 0;

  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    getPrototype = overArg(Object.getPrototypeOf, Object),
    objectCreate = Object.create,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols,
    nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
    nativeKeys = overArg(Object.keys, Object),
    nativeMax = Math.max;

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap'),
    nativeCreate = getNative(Object, 'create');

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var this$1 = this;

  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this$1.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var this$1 = this;

  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this$1.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var this$1 = this;

  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this$1.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  this.__data__ = new ListCache(entries);
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  return this.__data__['delete'](key);
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var cache = this.__data__;
  if (cache instanceof ListCache) {
    var pairs = cache.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      return this;
    }
    cache = this.__data__ = new MapCache(pairs);
  }
  cache.set(key, value);
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = (isArray(value) || isArguments(value))
    ? baseTimes(value.length, String)
    : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * This function is like `assignValue` except that it doesn't assign
 * `undefined` values.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignMergeValue(object, key, value) {
  if ((value !== undefined && !eq(object[key], value)) ||
      (typeof key == 'number' && value === undefined && !(key in object))) {
    object[key] = value;
  }
}

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    object[key] = value;
  }
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && copyObject(source, keys(source), object);
}

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @param {boolean} [isFull] Specify a clone including symbols.
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, isDeep, isFull, customizer, key, object, stack) {
  var result;
  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    var tag = getTag(value),
        isFunc = tag == funcTag || tag == genTag;

    if (isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
      if (isHostObject(value)) {
        return object ? value : {};
      }
      result = initCloneObject(isFunc ? {} : value);
      if (!isDeep) {
        return copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, baseClone, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (!isArr) {
    var props = isFull ? getAllKeys(value) : keys(value);
  }
  arrayEach(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    assignValue(result, key, baseClone(subValue, isDeep, isFull, customizer, key, value, stack));
  });
  return result;
}

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} prototype The object to inherit from.
 * @returns {Object} Returns the new object.
 */
function baseCreate(proto) {
  return isObject(proto) ? objectCreate(proto) : {};
}

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

/**
 * The base implementation of `getTag`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  return objectToString.call(value);
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[objectToString.call(value)];
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * The base implementation of `_.merge` without support for multiple sources.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  if (!(isArray(source) || isTypedArray(source))) {
    var props = baseKeysIn(source);
  }
  arrayEach(props || source, function(srcValue, key) {
    if (props) {
      key = srcValue;
      srcValue = source[key];
    }
    if (isObject(srcValue)) {
      stack || (stack = new Stack);
      baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
    }
    else {
      var newValue = customizer
        ? customizer(object[key], srcValue, (key + ''), object, source, stack)
        : undefined;

      if (newValue === undefined) {
        newValue = srcValue;
      }
      assignMergeValue(object, key, newValue);
    }
  });
}

/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = object[key],
      srcValue = source[key],
      stacked = stack.get(srcValue);

  if (stacked) {
    assignMergeValue(object, key, stacked);
    return;
  }
  var newValue = customizer
    ? customizer(objValue, srcValue, (key + ''), object, source, stack)
    : undefined;

  var isCommon = newValue === undefined;

  if (isCommon) {
    newValue = srcValue;
    if (isArray(srcValue) || isTypedArray(srcValue)) {
      if (isArray(objValue)) {
        newValue = objValue;
      }
      else if (isArrayLikeObject(objValue)) {
        newValue = copyArray(objValue);
      }
      else {
        isCommon = false;
        newValue = baseClone(srcValue, true);
      }
    }
    else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      if (isArguments(objValue)) {
        newValue = toPlainObject(objValue);
      }
      else if (!isObject(objValue) || (srcIndex && isFunction(objValue))) {
        isCommon = false;
        newValue = baseClone(srcValue, true);
      }
      else {
        newValue = objValue;
      }
    }
    else {
      isCommon = false;
    }
  }
  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack['delete'](srcValue);
  }
  assignMergeValue(object, key, newValue);
}

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = array;
    return apply(func, this, otherArgs);
  };
}

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var result = new buffer.constructor(buffer.length);
  buffer.copy(result);
  return result;
}

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

/**
 * Creates a clone of `map`.
 *
 * @private
 * @param {Object} map The map to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned map.
 */
function cloneMap(map, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(mapToArray(map), true) : mapToArray(map);
  return arrayReduce(array, addMapEntry, new map.constructor);
}

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

/**
 * Creates a clone of `set`.
 *
 * @private
 * @param {Object} set The set to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned set.
 */
function cloneSet(set, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(setToArray(set), true) : setToArray(set);
  return arrayReduce(array, addSetEntry, new set.constructor);
}

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    assignValue(object, key, newValue === undefined ? source[key] : newValue);
  }
  return object;
}

/**
 * Copies own symbol properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return copyObject(source, getSymbols(source), object);
}

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return baseRest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Creates an array of the own enumerable symbol properties of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11,
// for data views in Edge < 14, and promises in Node.js.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = objectToString.call(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : undefined;

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !isPrototype(object))
    ? baseCreate(getPrototype(object))
    : {};
}

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, cloneFunc, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag:
      return cloneArrayBuffer(object);

    case boolTag:
    case dateTag:
      return new Ctor(+object);

    case dataViewTag:
      return cloneDataView(object, isDeep);

    case float32Tag: case float64Tag:
    case int8Tag: case int16Tag: case int32Tag:
    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
      return cloneTypedArray(object, isDeep);

    case mapTag:
      return cloneMap(object, isDeep, cloneFunc);

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      return cloneRegExp(object);

    case setTag:
      return cloneSet(object, isDeep, cloneFunc);

    case symbolTag:
      return cloneSymbol(object);
  }
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq(object[index], value);
  }
  return false;
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) ||
      objectToString.call(value) != objectTag || isHostObject(value)) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return (typeof Ctor == 'function' &&
    Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
}

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/**
 * Converts `value` to a plain object flattening inherited enumerable string
 * keyed properties of `value` to own properties of the plain object.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.assign({ 'a': 1 }, new Foo);
 * // => { 'a': 1, 'b': 2 }
 *
 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */
function toPlainObject(value) {
  return copyObject(value, keysIn(value));
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

/**
 * This method is like `_.assign` except that it recursively merges own and
 * inherited enumerable string keyed properties of source objects into the
 * destination object. Source properties that resolve to `undefined` are
 * skipped if a destination value exists. Array and plain object properties
 * are merged recursively. Other objects and value types are overridden by
 * assignment. Source objects are applied from left to right. Subsequent
 * sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 0.5.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var object = {
 *   'a': [{ 'b': 2 }, { 'd': 4 }]
 * };
 *
 * var other = {
 *   'a': [{ 'c': 3 }, { 'e': 5 }]
 * };
 *
 * _.merge(object, other);
 * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
 */
var merge = createAssigner(function(object, source, srcIndex) {
  baseMerge(object, source, srcIndex);
});

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = merge;
});

var STOPPED = 1;
var STOPPED_BY_DEPENDENCY = 1 << 1;
var INACTIVE = 1 << 2;
var INACTIVE_BY_DEPENDENCY = 1 << 3;
var INVALID_MODULE = 1 << 4;
var CONTRIBUTION_SYNTAX_ERROR = 1 << 5;
var MODULE_NOT_FOUND = 1 << 6;

/**
 * dependencies : Array of <OrbitalPackage> created from depMap.
 *      dependencies should be synchronized with depMap after init().
 *      In common <OrbitalPackageRegistry>.add(node), update(node)
 *      calls validatePackages() then synchronizes depMap to dependencies
 *      and removes orphan dependencies too.
 * depMap : Map of manifest's resolved npm dependencies.
 * depList : List version of depMap. (for convenience)
 */
var OrbitalPackage = (function (FlagSupport$$1) {
    function OrbitalPackage(node) {
        FlagSupport$$1.call(this);
        this.init(node);
    }

    if ( FlagSupport$$1 ) OrbitalPackage.__proto__ = FlagSupport$$1;
    OrbitalPackage.prototype = Object.create( FlagSupport$$1 && FlagSupport$$1.prototype );
    OrbitalPackage.prototype.constructor = OrbitalPackage;

    OrbitalPackage.prototype.init = function init (node, isUpdate) {
        logger.log(getPackageId$1(node) + ' initializing ...');
        this.node = node;
        this.dependencies = []; // [<OrbitalPackage>somePack, ...]
        this.meta = normalize(node.package);
        this.depMap = {}; // {abc: '1.2.3', ...}
        this.depList = []; // ['abc@1.2.3', ...]
        this.exports = {
            ids: [],
            paths: []
        };
        this.errorReasons = {};
        this.initFlags();
        this.createDepCache();
        this.exportModules();
        this.requireModules(!!isUpdate);
    };

    /**
     * @param {OrbitalPackage} pack
     */
    OrbitalPackage.prototype.addDependency = function addDependency (toAdd) {
        if (!toAdd) {
            return;
        }
        if (!this.dependencyExists(toAdd)) {
            this.dependencies.push(toAdd);
        }
    };

    OrbitalPackage.prototype.removeDependency = function removeDependency (toRemove) {
        var dependencies = this.dependencies;
        if (this.dependencyExists(toRemove)) {
            dependencies.splice(dependencies.indexOf(toRemove), 1);
            this.depList.splice(dependencies.indexOf(toRemove.getId()), 1);
            Reflect.deleteProperty(this.depMap, toRemove.getName());
        }
    };

    /**
     * Create {name: version} map & list
     * for dependencies of this package.
     * For example, if this package requires
     * acme.main@0.1.0 and acme.other@1.2.3
     * depMap = {acme.main: '0.1.0', acme.other: '1.2.3'}
     * depList = ['acme.main@0.1.0', 'acme.other@1.2.3']
     */
    OrbitalPackage.prototype.createDepCache = function createDepCache () {
        var this$1 = this;

        Reflect.ownKeys(this.meta.dependencies).forEach(function (depName) {
            var dep = this$1.getDependency(depName);
            var depMeta = dep.package;
            this$1.depMap[depMeta.name] = depMeta.version;
            this$1.depList.push(depMeta.name + '@' + depMeta.version);
        });
    };

    OrbitalPackage.prototype.dependencyExists = function dependencyExists (pack) {
        return this.dependencies.indexOf(pack) > -1;
    };

    OrbitalPackage.prototype.exportModules = function exportModules () {
        logger.log(this.getId() + ' exporting modules ...');
        this.exportActivator();
        this.exportServiceContributions();
        this.exportExtensionContributions();
    };

    OrbitalPackage.prototype.exportActivator = function exportActivator () {
        var exports = this.exports;
        var orbMeta = this.meta.orbital;
        var activator = orbMeta.activator;
        var bundle = orbMeta.bundle;
        if (activator) {
            var path = nodeReq('path');
            var activatorPath = bundle
                ? path.join(bundle.path, 'activator.js')
                : activator;
            var realizedPath = path.join(this.getBaseDir(), activatorPath);
            try {
                validateContributionFile(realizedPath);
                exports.ids.push('Activator');
                exports.paths.push(realizedPath);
            } catch (e) {
                this.handleError('activator', e, 'MODULE_NOT_FOUND');
            }
        }
    };

    OrbitalPackage.prototype.exportServiceContributions = function exportServiceContributions () {
        var this$1 = this;

        this.meta.orbital.contributes.services.forEach(function (service, index) {
            this$1.exportValidContributionModule(service, 'service', index);
        });
    };

    OrbitalPackage.prototype.exportExtensionContributions = function exportExtensionContributions () {
        var this$1 = this;

        this.meta.orbital.contributes.extensions.forEach(function (extension, index) {
            this$1.exportValidContributionModule(extension, 'extension', index);
        });
    };

    OrbitalPackage.prototype.exportValidContributionModule = function exportValidContributionModule (contribution, type, index) {
        try {
            validateContributionSyntax(contribution, type);
            this.exportContributionModule(contribution, type, index);
        } catch (e) {
            this.handleError(type, e, 'CONTRIBUTION_SYNTAX_ERROR');
        }
    };

    OrbitalPackage.prototype.exportContributionModule = function exportContributionModule (contribution, type, index) {
        var contributionId = contribution.id;
        var path = nodeReq('path');
        var exports = this.exports;
        var basedir = this.getBaseDir();
        var bundle = this.meta.orbital.bundle;
        var contributionPath = bundle
            ? path.join(bundle.path,
                getBundleModuleName(type, contribution.id, index) + '.js')
            : contribution.realize;
        var realizedPath = path.join(basedir, contributionPath);
        console.log('realizedPath', realizedPath);
        try {
            validateContributionFile(realizedPath);
        } catch (e) {
            this.handleError(type, e, 'MODULE_NOT_FOUND');
            return;
        }
        var specProviderName = getPackageName(contributionId);
        var specProviderVersion = this.depMap[specProviderName];
        var uniqId = 'contributes/' + type + 's'
            + '/' + specProviderName
            + '/' + specProviderVersion
            + '/' + contributionId
            + '/' + index;
        exports.ids.push(uniqId);
        exports.paths.push(realizedPath);
    };

    OrbitalPackage.prototype.getBaseDir = function getBaseDir () {
        return this.node.realpath;
    };

    /**
     * Find rpt node with depName,
     * walking from this node's children to the root.
     * @param {string} depName
     */
    OrbitalPackage.prototype.getDependency = function getDependency (depName) {
        var mod = this.node;
        var dependency;
        while (mod) {
            var isExists = mod.children.some(function (child) {
                if (child.package.name === depName) {
                    dependency = child;
                    return true;
                }
            });
            if (isExists) {
                return dependency;
            }
            mod = mod.parent;
        }
        return null;
    };

    OrbitalPackage.prototype.getErrorReason = function getErrorReason () {
        var this$1 = this;

        var FLAGS = OrbitalPackage.FLAGS;
        var reasons = [];
        Reflect.ownKeys(FLAGS).forEach(function (KEY) {
            var bit = FLAGS[KEY];
            if (this$1.getFlag(bit)) {
                var reason = this$1.getReadableFlag(KEY);
                if (this$1.errorReasons[bit]) {
                    reason += " (" + (this$1.errorReasons[bit]) + ")";
                }
                reasons.push(reason);
            }
        });
        return reasons.join(', ');
    };

    OrbitalPackage.prototype.getErrorState = function getErrorState () {
        return this._flags;
    };

    OrbitalPackage.prototype.getErrorString = function getErrorString () {
        var chalk = nodeReq('chalk');
        var magenta = chalk.magenta.bold;
        var yellow = chalk.yellow.bold;
        if (this.getFlag(STOPPED)) {
            return magenta('(stopped)');
        } else if (this.getFlag(STOPPED_BY_DEPENDENCY)) {
            return magenta('(stopped by dependency)');
        } else if (this.getFlag(INACTIVE)) {
            return yellow('(inactive)');
        } else if (this.getFlag(INACTIVE_BY_DEPENDENCY)) {
            return yellow('(inactive by dependency)');
        } else if (this.getFlag(INVALID_MODULE)) {
            return yellow('(invalid module)');
        } else if (this.getFlag(CONTRIBUTION_SYNTAX_ERROR)) {
            return yellow('(contribution syntax error)');
        } else if (this.getFlag(MODULE_NOT_FOUND)) {
            return yellow('(module not found)');
        }
        return '';
    };

    OrbitalPackage.prototype.getId = function getId () {
        var meta = this.meta;
        return meta.name + '@' + meta.version;
    };

    /**
     * @return {Object}
     */
    OrbitalPackage.prototype.getManifest = function getManifest () {
        var meta = this.meta;
        var node = this.node;
        var orb = meta.orbital;
        var dependencies = {};
        this.dependencies.forEach(function (depPack) {
            var depMeta = depPack.meta;
            dependencies[depMeta.name] = depMeta.version;
        });
        return {
            name: meta.name,
            version: meta.version,
            path: node.path.replace(/\\/g, '/'),
            description: meta.description,
            license: meta.license || '',
            policies: orb.policies,
            activator: orb.activator,
            contributable: orb.contributable,
            contributes: orb.contributes,
            parent: getPackageId$1(node.parent),
            state: this._flags,
            errorReason: this.getErrorReason(),
            dependencies: dependencies
        };
    };

    OrbitalPackage.prototype.getName = function getName () {
        return this.meta.name;
    };

    OrbitalPackage.prototype.getReadableFlag = function getReadableFlag (key) {
        return key.toLowerCase().replace(/_/g, ' ');
    };

    OrbitalPackage.prototype.getVersion = function getVersion () {
        return this.meta.version;
    };

    OrbitalPackage.prototype.handleError = function handleError (context, e, defaultType) {
        var nl = '\n          ';
        var FLAGS = OrbitalPackage.FLAGS;
        var key = e.type || defaultType;
        this.setFlag(FLAGS[key], true, e.message);
        logger.warn(this.getId() + "'s "
            + context + ' contribution rejected.' + nl
            + "Reason: " + (this.getReadableFlag(key)) + " (" + (e.message) + ")");
    };

    OrbitalPackage.prototype.initFlags = function initFlags () {
        this.resetFlags();
        var state = this.meta.orbital.state;
        if (state === 'inactive') {
            this.setFlag(INACTIVE, true);
        } else if (state === 'stopped') {
            this.setFlag(STOPPED, true);
        }
    };

    OrbitalPackage.prototype.isLessOrEqualState = function isLessOrEqualState (state) {
        return this.getBitMask() <= state;
    };

    OrbitalPackage.prototype.reloadModules = function reloadModules () {
        this.exports.paths.forEach(function (path) {
            delete require.cache[require.resolve(path)];
        });
    };

    OrbitalPackage.prototype.setFlag = function setFlag (flag, value, message) {
        if ( message === void 0 ) message = null;

        FlagSupport$$1.prototype.setFlag.call(this, flag, value);
        this.errorReasons[flag] = message;
    };

    OrbitalPackage.prototype.requireModules = function requireModules (isUpdate) {
        var this$1 = this;

        var config = getOrbitalConfig();
        if (config.target !== 'node') {
            return;
        }
        var isError = false;
        var obj = {};
        var meta = this.meta;
        var ids = this.exports.ids;
        var paths = this.exports.paths;
        if (isUpdate) {
            this.reloadModules();
        }
        ids.forEach(function (id, i) {
            try {
                lodash_merge(obj, objectify(id, nodeReq(paths[i])));
            } catch (e) {
                isError = true;
                e.message += " (" + (paths[i]) + ")";
                this$1.handleError('module', e, 'INVALID_MODULE');
            }
        });
        if (!isError) {
            if (isUpdate) {
                ExportsRegistry.update(meta.name, meta.version, obj);
            } else {
                ExportsRegistry.register(meta.name, meta.version, obj);
            }
        }
    };

    OrbitalPackage.prototype.requireModulesAsync = function requireModulesAsync () {

    };

    OrbitalPackage.prototype.requires = function requires (pack) {
        return this.depList.indexOf(pack.getId()) > -1;
    };

    OrbitalPackage.prototype.removeModules = function removeModules () {
        var meta = this.meta;
        ExportsRegistry.unregister(meta.name, meta.version);
    };

    OrbitalPackage.prototype.toString = function toString () {
        return '<OrbitalPackage>' + this.getId();
    };

    return OrbitalPackage;
}(FlagSupport));

OrbitalPackage.FLAGS = {
    STOPPED: STOPPED,
    STOPPED_BY_DEPENDENCY: STOPPED_BY_DEPENDENCY,
    INACTIVE: INACTIVE,
    INACTIVE_BY_DEPENDENCY: INACTIVE_BY_DEPENDENCY,
    INVALID_MODULE: INVALID_MODULE,
    CONTRIBUTION_SYNTAX_ERROR: CONTRIBUTION_SYNTAX_ERROR,
    MODULE_NOT_FOUND: MODULE_NOT_FOUND
};

var ref = OrbitalPackage.FLAGS;
var STOPPED$1 = ref.STOPPED;
var STOPPED_BY_DEPENDENCY$1 = ref.STOPPED_BY_DEPENDENCY;
var INACTIVE$1 = ref.INACTIVE;
var INACTIVE_BY_DEPENDENCY$1 = ref.INACTIVE_BY_DEPENDENCY;
var INVALID_MODULE$1 = ref.INVALID_MODULE;
var CONTRIBUTION_SYNTAX_ERROR$1 = ref.CONTRIBUTION_SYNTAX_ERROR;
var MODULE_NOT_FOUND$1 = ref.MODULE_NOT_FOUND;

var PackageRegistry$1 = (function (Base$$1) {
    function PackageRegistry(rootPath) {
        Base$$1.call(this);
        this.define('queue', []);
        this.define('rootPath', rootPath);
        this.define('root', null, {writable: true});
        this.define('packs', {}, {writable: true});
        this.define('isInitialized', false, {writable: true});
    }

    if ( Base$$1 ) PackageRegistry.__proto__ = Base$$1;
    PackageRegistry.prototype = Object.create( Base$$1 && Base$$1.prototype );
    PackageRegistry.prototype.constructor = PackageRegistry;

    /**
     * Walking through all node packages,
     * collect orbital packages then resolve promise
     */
    PackageRegistry.prototype.initPackages = function initPackages () {
        var this$1 = this;

        return new Promise(function (resolve, reject) {
            try {
                var chalk = nodeReq('chalk');
                var rpt = nodeReq('read-package-tree');
                var stopped = chalk.magenta.bold('(stopped)');
                var inactive = chalk.yellow.bold('(inactive)');
                var cyan = chalk.cyan.bold;
                var registry = this$1;
                rpt(this$1.rootPath, function (err, root) {
                    if (err) {
                        logger.error(err);
                        return;
                    }
                    this$1.root = root;
                    this$1.packs = {};
                    (function walk(node) {
                        var pack = node.package;
                        if (Reflect.has(pack, 'orbital')) {
                            var state = '';
                            if (pack.orbital.state === 'stopped') {
                                state = stopped;
                            } else if (pack.orbital.state === 'inactive') {
                                state = inactive;
                            }
                            logger.log(cyan(getPackageId$1(node)), state, 'detected');
                            registry.add(node);
                        }
                        node.children.forEach(function (child) {
                            walk(child);
                        });
                    })(root);
                    resolve();
                    this$1.isInitialized = true;
                });
            } catch (e) {
                reject(e);
            }
        });
    };

    PackageRegistry.prototype.add = function add (node) {
        if (!this.exists(node)) {
            var pack = new OrbitalPackage(node);
            this.packs[getPackageId$1(node)] = pack;
            this.validatePackages();
            this.emit('packageAdded', pack);
        }
    };

    PackageRegistry.prototype.addById = function addById (id) {
        var this$1 = this;

        logger.log(("adding " + id + " ..."));
        return new Promise(function (resolve, reject) {
            var reg = this$1;
            var rpt = nodeReq('read-package-tree');
            rpt(this$1.rootPath, function (err, root) {
                if (err) {
                    logger.error(err);
                    reject(err);
                    return;
                }
                (function walk(node) {
                    if (id === getPackageId$1(node)) {
                        reg.add(node);
                        resolve(reg.getPackageById(id));
                    }
                    node.children.forEach(function (child) {
                        walk(child);
                    });
                })(root);
            });
        });
    };

    PackageRegistry.prototype.exists = function exists (node) {
        return this.packs[getPackageId$1(node)];
    };

    PackageRegistry.prototype.forEachPacks = function forEachPacks (callback) {
        var this$1 = this;

        Reflect.ownKeys(this.packs).forEach(function (id, i) {
            callback(this$1.packs[id], i);
        });
    };

    PackageRegistry.prototype.getManifests = function getManifests () {
        var manifests = [];
        this.forEachPacks(function (pack) {
            manifests.push(pack.getManifest());
        });
        return manifests;
    };

    PackageRegistry.prototype.getPackageById = function getPackageById (id) {
        return this.packs[id];
    };

    PackageRegistry.prototype.getPackageByProperty = function getPackageByProperty (key, value) {
        var pak = null;
        this.forEachPacks(function (pack) {
            if (pack.node.package[key] === value) {
                pak = pack;
            }
        });
        return pak;
    };

    PackageRegistry.prototype.getPackageIds = function getPackageIds () {
        return Reflect.ownKeys(this.packs);
    };

    PackageRegistry.prototype.getPackages = function getPackages () {
        return this.packs;
    };

    PackageRegistry.prototype.getPackagesByName = function getPackagesByName (name) {
        var this$1 = this;

        var packages = [];
        var packIds = this.getPackageIds();
        packIds.forEach(function (id) {
            if (id.substring(0, id.indexOf('@')) === name) {
                packages.push(this$1.packs[id]);
            }
        });
        return packages;
    };

    PackageRegistry.prototype.printDependencies = function printDependencies () {
        var nl = '\n';
        function log() {
            var args = ([]).slice.call(arguments);
            args.push(nl);
            process.stdout.write(args.join(' '));
        }
        var root = {
            label: getPackageId$1(this.root),
            nodes: []
        };
        this.forEachPacks(function (pack) {
            var id = pack.getId();
            var node = {
                label: id + ' ' + pack.getErrorString(),
                nodes: []
            };
            root.nodes.push(node);
            pack.dependencies.forEach(function (depPack) {
                var depId = depPack.getId();
                node.nodes.push({
                    label: depId + ' ' + depPack.getErrorString(),
                    nodes: []
                });
            });
        });
        var archy = nodeReq('archy');
        log('');
        logger.info('orbital dependency graph');
        log(archy(root, '', {unicode: process.platform !== 'win32'}));
        return this;
    };

    /**
     * Find new installed package node,
     * then update registry with the new node.
     */
    PackageRegistry.prototype.refresh = function refresh (oldNode) {
        this.refreshById(getPackageId$1(oldNode));
    };

    PackageRegistry.prototype.refreshById = function refreshById (oldId) {
        logger.log(("refreshing " + oldId + " ..."));
        var reg = this;
        var rpt = nodeReq('read-package-tree');
        rpt(this.rootPath, function (err, root) {
            if (err) {
                logger.error(err);
                return;
            }
            (function walk(node) {
                if (oldId === getPackageId$1(node)) {
                    reg.emit('packageWillUpdate', getPackageId$1(node));
                    reg.update(node);
                }
                node.children.forEach(function (child) {
                    walk(child);
                });
            })(root);
        });
    };

    /**
     * @param {OrbitalPackage} packToRemove
     *
     * 1) emit('packageWillRemove')
     *    - uninstallPlugin(id)
     * 2) remove packToRemove from this.packs
     * 3) emit('packageRemoved')
     */
    PackageRegistry.prototype.remove = function remove (packToRemove) {
        var this$1 = this;

        return new Promise(function (resolve, reject) {
            try {
                this$1.emit('packageWillRemove', packToRemove);
                Reflect.deleteProperty(this$1.packs, packToRemove.getId());
                packToRemove.removeModules();
                this$1.emit('packageRemoved', packToRemove);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    };

    /**
     * Update registry with the given new package node.
     */
    PackageRegistry.prototype.update = function update (node) {
        var pack = this.getPackageById(getPackageId$1(node));
        if (pack) {
            pack.init(node, true);
            this.validatePackages();
            this.emit('packageUpdated', getPackageId$1(node), pack.getManifest());
        }
    };

    PackageRegistry.prototype.validateDependencies = function validateDependencies () {
        var this$1 = this;

        this.forEachPacks(function (pack) {
            pack.depList.forEach(function (depId) {
                var depPack = this$1.getPackageById(depId);
                if (depPack) {
                    if (!pack.dependencyExists(depPack)) {
                        pack.addDependency(depPack);
                    }
                }
            });
        });
    };

    PackageRegistry.prototype.validatePackages = function validatePackages () {
        this.validateDependencies();
        this.validateOrphanDependencies();
        this.validatePackagesState();
    };

    PackageRegistry.prototype.validateOrphanDependencies = function validateOrphanDependencies () {
        this.forEachPacks(function (pack) {
            var dependencies = pack.dependencies;
            var clone = dependencies.concat();
            clone.forEach(function (depPack) {
                var depPackId = depPack.getId();
                if (pack.depList.indexOf(depPackId) === -1) {
                    dependencies.splice(dependencies.indexOf(depPack), 1);
                    logger.log("orphan dependency " + depPackId
                        + " removed from " + (pack.getId()));
                }
            });
        });
    };

    PackageRegistry.prototype.validatePackagesState = function validatePackagesState () {
        var this$1 = this;

        function isAncestalInactive(pack) {
            if (pack.getFlag(CONTRIBUTION_SYNTAX_ERROR$1 | INACTIVE$1
                | INACTIVE_BY_DEPENDENCY$1 | INVALID_MODULE$1
                | MODULE_NOT_FOUND$1)) {
                return true;
            }
            return pack.dependencies.some(function (depPack) {
                return isAncestalInactive(depPack);
            });
        }
        function isAncestalStopped(pack) {
            if (pack.getFlag(STOPPED$1 | STOPPED_BY_DEPENDENCY$1)) {
                return true;
            }
            return pack.dependencies.some(function (depPack) {
                return isAncestalStopped(depPack);
            });
        }
        this.forEachPacks(function (pack) {
            var activeAll = true;
            pack.depList.forEach(function (depId) {
                var depPack = this$1.getPackageById(depId);
                if (depPack) {
                    if (isAncestalInactive(depPack)) {
                        if (!pack.getFlag(INACTIVE_BY_DEPENDENCY$1)) {
                            pack.setFlag(INACTIVE_BY_DEPENDENCY$1, true);
                        }
                        activeAll = false;
                    }
                    if (isAncestalStopped(depPack)) {
                        if (!pack.getFlag(STOPPED_BY_DEPENDENCY$1)) {
                            pack.setFlag(STOPPED_BY_DEPENDENCY$1, true);
                        }
                        activeAll = false;
                    }
                }
            });
            if (activeAll) {
                if (pack.getFlag(INACTIVE_BY_DEPENDENCY$1)) {
                    pack.setFlag(INACTIVE_BY_DEPENDENCY$1, false);
                }
                if (pack.getFlag(STOPPED_BY_DEPENDENCY$1)) {
                    pack.setFlag(STOPPED_BY_DEPENDENCY$1, false);
                }
            }
        });
    };

    return PackageRegistry;
}(Base));

var BaseError = (function (Error) {
    function BaseError() {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        Error.call(this);
        var message = args.shift();
        args.forEach(function (arg, i) {
            message = message.replace(("#{" + i + "}"), arg);
        });
        this.name = this.constructor.name;
        this.message = message;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }
    }

    if ( Error ) BaseError.__proto__ = Error;
    BaseError.prototype = Object.create( Error && Error.prototype );
    BaseError.prototype.constructor = BaseError;

    return BaseError;
}(Error));

var PluginError = (function (BaseError$$1) {
	function PluginError () {
		BaseError$$1.apply(this, arguments);
	}if ( BaseError$$1 ) PluginError.__proto__ = BaseError$$1;
	PluginError.prototype = Object.create( BaseError$$1 && BaseError$$1.prototype );
	PluginError.prototype.constructor = PluginError;

	

	return PluginError;
}(BaseError));

PluginError.INVALIDSTATE = 'Plugin has been uninstalled.';
PluginError.NOCONTEXT = 'PluginContext does not exist.';
PluginError.RESOLVE_FAILED = 'The resolution has been failed due to the following reasons.';
PluginError.UNABLETORESOLVE = 'Plugin dependency resolution has been failed.';

var ManifestError = (function (BaseError$$1) {
	function ManifestError () {
		BaseError$$1.apply(this, arguments);
	}if ( BaseError$$1 ) ManifestError.__proto__ = BaseError$$1;
	ManifestError.prototype = Object.create( BaseError$$1 && BaseError$$1.prototype );
	ManifestError.prototype.constructor = ManifestError;

	

	return ManifestError;
}(BaseError));

ManifestError.NOMETA = "Manifest requires packages.json's meta information.";
ManifestError.NONAME = "The 'name' field doesn't exist in package.json.";
ManifestError.NOVERSION = "The 'version' field doesn't exist in package.json.";
ManifestError.SYNTAX_CONTRIBUTABLE_ID = "The contributable 'id' field has syntax error.\nthe id should be a form of 'packageName:id' or just 'id'. Plese check ";
ManifestError.SYNTAX_CONTRIBUTING_ID = "The contributing 'id' field has syntax error.\nthe id should be a form of 'packageName:id'. Plese check ";
ManifestError.PACKAGENAME_MISSMATCH = "The packageName in a contributable id should be\nthe same as it's package name.";
ManifestError.MISSING_DEPENDENCY = "The dependencies field is missing.\nPlease add '#{0}' to the dependencies field in '#{1}/package.json'";

var ContributableExtensionDescriptor = (function (Base$$1) {
    function ContributableExtensionDescriptor(provider, version, id, spec, desc) {
        Base$$1.call(this);
        this.define('provider', provider);
        this.define('version', version);
        this.define('id', id);
        this.define('spec', spec || {});
        this.define('desc', desc || '');
        Object.freeze(this);
    }

    if ( Base$$1 ) ContributableExtensionDescriptor.__proto__ = Base$$1;
    ContributableExtensionDescriptor.prototype = Object.create( Base$$1 && Base$$1.prototype );
    ContributableExtensionDescriptor.prototype.constructor = ContributableExtensionDescriptor;

    ContributableExtensionDescriptor.prototype.getExtensionPoint = function getExtensionPoint () {
        return ((this.provider) + "@" + (this.version) + ":" + (this.id));
    };

    return ContributableExtensionDescriptor;
}(Base));

var ContributingExtensionDescriptor = (function (Base$$1) {
    function ContributingExtensionDescriptor(provider, version, id, index, realize, priority, vendor) {
        Base$$1.call(this);
        this.define('provider', provider);
        this.define('version', version);
        this.define('id', id);
        this.define('index', index);
        this.define('realize', realize);
        this.define('priority', priority || 0);
        this.define('vendor', vendor || '');
        Object.freeze(this);
    }

    if ( Base$$1 ) ContributingExtensionDescriptor.__proto__ = Base$$1;
    ContributingExtensionDescriptor.prototype = Object.create( Base$$1 && Base$$1.prototype );
    ContributingExtensionDescriptor.prototype.constructor = ContributingExtensionDescriptor;

    return ContributingExtensionDescriptor;
}(Base));

var ContributableServiceDescriptor = (function (Base$$1) {
    function ContributableServiceDescriptor(provider, version, id, spec, desc) {
        Base$$1.call(this);
        this.define('provider', provider);
        this.define('version', version);
        this.define('id', id);
        this.define('spec', spec || {});
        this.define('desc', desc || '');
        Object.freeze(this);
    }

    if ( Base$$1 ) ContributableServiceDescriptor.__proto__ = Base$$1;
    ContributableServiceDescriptor.prototype = Object.create( Base$$1 && Base$$1.prototype );
    ContributableServiceDescriptor.prototype.constructor = ContributableServiceDescriptor;

    ContributableServiceDescriptor.prototype.getServicePoint = function getServicePoint () {
        return ((this.provider) + "@" + (this.version) + ":" + (this.id));
    };

    return ContributableServiceDescriptor;
}(Base));

var ContributingServiceDescriptor = (function (Base$$1) {
    function ContributingServiceDescriptor(provider, version, id, index, realize, priority, vendor) {
        Base$$1.call(this);
        this.define('provider', provider);
        this.define('version', version);
        this.define('id', id);
        this.define('index', index);
        this.define('realize', realize);
        this.define('priority', priority || 0);
        this.define('vendor', vendor || '');
        Object.freeze(this);
    }

    if ( Base$$1 ) ContributingServiceDescriptor.__proto__ = Base$$1;
    ContributingServiceDescriptor.prototype = Object.create( Base$$1 && Base$$1.prototype );
    ContributingServiceDescriptor.prototype.constructor = ContributingServiceDescriptor;

    return ContributingServiceDescriptor;
}(Base));

var privates$1 = {
    createDescriptors: function createDescriptors() {
        var this$1 = this;

        var pluginName = this.name;
        var pluginVersion = this.version;
        var contributableServices = [];
        var contributingServices = [];
        var contributableExtensions = [];
        var contributingExtensions = [];

        function normalizeContributableId(pluginName, id) {
            var index = id.indexOf(':');
            var result = id;
            if (index < 0) {
                result = pluginName + ':' + id;
            } else if (index === 0) {
                throw new ManifestError(
                    ManifestError.SYNTAX_CONTRIBUTABLE_ID + id);
            } else if (index > 0) {
                if (index === (id.length - 1)) {
                    throw new ManifestError(
                        ManifestError.SYNTAX_CONTRIBUTABLE_ID + id);
                }
                var packageName = Manifest.getPackageName(id);
                if (packageName !== pluginName) {
                    throw new ManifestError(
                        ManifestError.PACKAGENAME_MISSMATCH + id);
                }
            }
            return result;
        }
        function validateContributingId(id) {
            var index = id.indexOf(':');
            if (index <= 0) {
                throw new ManifestError(
                    ManifestError.SYNTAX_CONTRIBUTING_ID + id);
            } else if (index > 0) {
                if (index === (id.length - 1)) {
                    throw new ManifestError(
                        ManifestError.SYNTAX_CONTRIBUTING_ID + id);
                }
            }
        }
        function checkDependencies(manifest, provider) {
            if (manifest.name === provider) {
                return;
            }
            if (!Reflect.has(manifest.dependencies, provider)) {
                throw new ManifestError(
                    ManifestError.MISSING_DEPENDENCY,
                    provider,
                    manifest.name);
            }
        }

        this.contributable.services.forEach(function (raw) {
            contributableServices.push(new ContributableServiceDescriptor(
                pluginName,
                pluginVersion,
                normalizeContributableId(pluginName, raw.id),
                Object.freeze(raw.spec),
                raw.desc
            ));
        });
        this.contributes.services.forEach(function (raw, index) {
            var id = raw.id;
            validateContributingId(id);
            var provider = Manifest.getPackageName(id);
            var version = this$1.dependencies[provider];
            checkDependencies(this$1, provider);
            contributingServices.push(new ContributingServiceDescriptor(
                provider,
                version,
                id,
                index,
                raw.realize,
                raw.priority,
                raw.vendor
            ));
        });
        this.contributable.extensions.forEach(function (raw) {
            contributableExtensions.push(new ContributableExtensionDescriptor(
                pluginName,
                pluginVersion,
                normalizeContributableId(pluginName, raw.id),
                Object.freeze(raw.spec),
                raw.desc
            ));
        });
        this.contributes.extensions.forEach(function (raw, index) {
            var id = raw.id;
            validateContributingId(id);
            var provider = Manifest.getPackageName(id);
            var version = this$1.dependencies[provider];
            checkDependencies(this$1, provider);
            contributingExtensions.push(new ContributingExtensionDescriptor(
                provider,
                version,
                id,
                index,
                raw.realize,
                raw.priority,
                raw.vendor
            ));
        });
        Reflect.defineProperty(this.contributable, 'services', {
            value: Object.freeze(contributableServices)
        });
        Reflect.defineProperty(this.contributes, 'services', {
            value: Object.freeze(contributingServices)
        });
        Reflect.defineProperty(this.contributable, 'extensions', {
            value: Object.freeze(contributableExtensions)
        });
        Reflect.defineProperty(this.contributes, 'extensions', {
            value: Object.freeze(contributingExtensions)
        });
    }
};

var Manifest = (function (Base$$1) {
    function Manifest(meta) {
        Base$$1.call(this);
        function throwError(code) {
            throw new ManifestError(
                ManifestError[code] + ' (' + meta.path + ')');
        }
        if (!meta) {
            throwError('NOMETA');
        }
        if (meta.name) {
            this.define('name', meta.name);
        } else {
            throwError('NONAME');
        }
        if (meta.version) {
            this.define('version', meta.version);
        } else {
            throwError('VERSION');
        }
        this.define('path', meta.path);
        this.define('description', meta.description);
        this.define('license', meta.license);
        this.define('policies', meta.policies || []);
        this.define('activator', meta.activator);
        this.define('contributable', meta.contributable);
        this.define('contributes', meta.contributes);
        this.define('dependencies', meta.dependencies || {});
        this.define('parent', meta.parent);
        this.define('state', meta.state);
        this.define('errorReason', meta.errorReason);
        var ref = OrbitalPackage.FLAGS;
        var STOPPED = ref.STOPPED;
        var STOPPED_BY_DEPENDENCY = ref.STOPPED_BY_DEPENDENCY;
        if (this.state <= (STOPPED | STOPPED_BY_DEPENDENCY)) {
            privates$1.createDescriptors.call(this);
        }
    }

    if ( Base$$1 ) Manifest.__proto__ = Base$$1;
    Manifest.prototype = Object.create( Base$$1 && Base$$1.prototype );
    Manifest.prototype.constructor = Manifest;

    Manifest.getPackageName = function getPackageName (id) {
        return id.split(':')[0];
    };

    Manifest.prototype.getContributableServiceDescriptors = function getContributableServiceDescriptors () {
        return this.contributable.services;
    };

    /**
     * Returns ContributableServiceDescriptor for this plugin
     * with the given service id.
     * @param {string} id - Service id
     * @return {ContributableServiceDescriptor}
     */
    Manifest.prototype.getContributableServiceDescriptor = function getContributableServiceDescriptor (id) {
        var result = null;
        this.getContributableServiceDescriptors().some(function (descriptor) {
            if (descriptor.id === id) {
                result = descriptor;
                return true;
            }
        });
        return result;
    };

    Manifest.prototype.getContributableExtensionDescriptors = function getContributableExtensionDescriptors () {
        return this.contributable.extensions;
    };

    Manifest.prototype.getContributableExtensionDescriptor = function getContributableExtensionDescriptor (id) {
        var result = null;
        this.getContributableExtensionDescriptors().some(function (descriptor) {
            if (descriptor.id === id) {
                result = descriptor;
                return true;
            }
        });
        return result;
    };

    Manifest.prototype.getContributingServiceDescriptors = function getContributingServiceDescriptors () {
        return this.contributes.services;
    };

    Manifest.prototype.getContributingExtensionDescriptors = function getContributingExtensionDescriptors () {
        return this.contributes.extensions;
    };

    Manifest.prototype.getDependencyList = function getDependencyList () {
        var dependencies = this.dependencies;
        return Reflect.ownKeys(dependencies).map(function (name) {
            return name + '@' + dependencies[name];
        });
    };

    Manifest.prototype.hasPolicy = function hasPolicy (policy) {
        return this.policies.indexOf(policy) > -1;
    };

    Manifest.prototype.hasState = function hasState (state) {
        return (this.state & state) !== 0;
    };

    Manifest.prototype.define = function define (key, value) {
        Base$$1.prototype.define.call(this, key, value, {
            enumerable: true
        });
    };

    return Manifest;
}(Base));

/**
 * A plugins's execution context within the Framework.
 * The context is used to interact with the Framework.
 */
var PluginContext = (function (Base$$1) {
    function PluginContext(plugin, container) {
        Base$$1.call(this);
        this.define('_plugin', plugin);
        this.define('_syscon', container);
        this.define('_activator', null, {
            writable: true
        });
        this.define('_pluginReg', container.getPluginRegistry());
        this.define('_extensionReg', container.getExtensionRegistry());
        this.define('_servicesInUse', new Map());
        this.listenRegistry();
    }

    if ( Base$$1 ) PluginContext.__proto__ = Base$$1;
    PluginContext.prototype = Object.create( Base$$1 && Base$$1.prototype );
    PluginContext.prototype.constructor = PluginContext;


    PluginContext.prototype.close = function close (resolve) {
        var container = this.getSystemContainer();
        var serviceRegistry = container.getServiceRegistry();
        var extensionRegistry = container.getExtensionRegistry();

        //TODO serviceRegistry.removeAllServiceListeners(this);
        serviceRegistry.unregisterServices(this);
        serviceRegistry.releaseServicesInUse(this);
        extensionRegistry.unregisterExtensions(this);
        resolve(this.getPlugin());
    };

    PluginContext.prototype.getDependencyVersion = function getDependencyVersion (packageName) {
        var manifest = this.getPlugin().getManifest();
        return manifest.dependencies[packageName];
    };

    /**
     * Returns array of {@link ExtensionRegistration}
     * with the given extensionId.
     * @example
     * refreshAside() {
     *    const contributions = [];
     *    this.context.getExtensions('examples.shop.layout:aside')
     *        .forEach((ext) => {
     *            contributions.push(ext.getView(this.context));
     *        });
     *    const aside = this.root.querySelector('aside');
     *    aside.innerHTML = contributions.join('\n');
     * }
     * @param {string} extensionId
     * @returns {Array.<ExtensionRegistration>}
     */
    PluginContext.prototype.getExtensions = function getExtensions (extensionId) {
        var container = this.getSystemContainer();
        var registry = container.getExtensionRegistry();
        return registry.getExtensions(extensionId);
    };

    /**
     * Convenient method which returns ExtensionRegistry.
     * @returns {ExtensionRegistry}
     */
    PluginContext.prototype.getExtensionRegistry = function getExtensionRegistry () {
        return this._extensionReg;
    };

    /**
     * Returns the given context's Plugin object.
     * @returns {Plugin}
     */
    PluginContext.prototype.getPlugin = function getPlugin () {
        return this._plugin;
    };

    /**
     * Returns the Plugin instance with the given package id.
     * The format is of [packageName]@[packageVersion]
     * @param {string} id package id
     * @returns {Plugin}
     */
    PluginContext.prototype.getPluginById = function getPluginById (id) {
        return this.getPluginRegistry().getPluginById(id);
    };

    /**
     * Returns the Plugin instance with the given package name and version.
     * @param {string} name package name
     * @param {string} version package version
     * @returns {Plugin}
     */
    PluginContext.prototype.getPluginByNameAndVersion = function getPluginByNameAndVersion (name, version) {
        return this.getPluginRegistry()
            .getPluginByNameAndVersion(name, version);
    };

    /**
     * Convenient method which returns PluginRegistry.
     * @returns {PluginRegistry}
     */
    PluginContext.prototype.getPluginRegistry = function getPluginRegistry () {
        return this._pluginReg;
    };

    /**
     * Returns the array of all Plugins registered.
     * @example
     * onStart(context) {
     *     this.context = context;
     *     context.getPlugins().forEach((plugin) => {
     *         plugin.on('stateChange', this.stateListener);
     *     });
     * } 
     * @returns {Array.<Plugin>}
     */
    PluginContext.prototype.getPlugins = function getPlugins () {
        return this.getPluginRegistry().getPlugins();
    };

    /**
     * Returns the array of Plugins with the given package name.
     * Because packages with same name but different version
     * can be installed together.
     * @param {string} name package name
     * @returns {Array.<Plugin>}
     */
    PluginContext.prototype.getPluginsByName = function getPluginsByName (name) {
        return this.getPluginRegistry().getPluginsByName(name);
    };

    /**
     * The returned object is valid at the time of the
     * call to this method. However as the Framework is
     * a very dynamic environment, services can be modified
     * or unregistered at any time.
     *
     * If multiple such services exist, the service with the
     * top priority (highest priority number) is returned.
     *
     * If there is a tie in priority, the service with the
     * lowest service id; that is, the service
     * that was registered first is returned.
     *
     * This method returns Service instance which contains
     * an actual service implementation.
     * the implementation inside of the Service instance
     * can be changed by ServiceRegistry's
     * register, unregister event.
     *
     * @example
     * import meta from '../../package.json';
     * import asideView from '../views/asideView';
     * 
     * export default {
     *     getView(layoutContext) {
     *         const productsContext = layoutContext.switch(meta);
     *         const api = productsContext.getService('examples.shop.resources:api');
     *         const items = api.getProductCategories().map((name) => {
     *             return `<li><a href='#products/${name}'>${name}</a></li>`;
     *         });
     *         return asideView.replace('{ITEMS}', items.join('\n'));
     *     }
     * };
     * 
     * @param {string} serviceId
     * @param {Object} options
     * @property {string} version
     * @property {string} vendor
     * @property {Object} orderBy
     * @return {ServiceClosure}
     */
    PluginContext.prototype.getService = function getService (serviceId, options) {
        var container = this.getSystemContainer();
        var registry = container.getServiceRegistry();
        return registry.getService(
            this, serviceId, options);
    };

    PluginContext.prototype.getServices = function getServices (/*serviceId, options*/) {

    };

    PluginContext.prototype.getServicesInUse = function getServicesInUse () {
        return this._servicesInUse;
    };

    PluginContext.prototype.getSystemContainer = function getSystemContainer () {
        return this._syscon;
    };

    /**
     * @return {ServiceRegistration}
     */
    PluginContext.prototype.publishService = function publishService (serviceId, service, options) {
        //TODO checkValid();
        var container = this.getSystemContainer();
        var registry = container.getServiceRegistry();
        return registry.register(this, serviceId, service, options);
    };

    /**
     * Unregisters a service with the given ServiceRegistration.
     * which is registered by this PluginContext's Plugin.
     * A service can only be unregistered by the
     * service provider (an implementer or a spec-consumer).
     * This method is automatically called
     * When the plugin is about to stop.
     *
     * @param {ServiceRegistration} registration
     */
    PluginContext.prototype.unpublishService = function unpublishService (registration) {
        registration.unregister();
    };

    /**
     * Installs plugin with the given package manifest object.
     * The manifest object is generated by {@link ManifestLoader}
     * @param {Object} manifest
     * @return {Promise}
     */
    PluginContext.prototype.installPlugin = function installPlugin (manifest) {
        var this$1 = this;

        this.debug('installPlugin(manifest)', manifest);
        return new Promise(function (resolve/*, reject*/) {
            var container = this$1.getSystemContainer();
            var registry = container.getPluginRegistry();
            try {
                var plugin = new Plugin(manifest, container);
                var installed = registry.install(
                    this$1.getPlugin(), plugin);
                resolve(installed);
            } catch (e) {
                Notice.warn(this$1, e);
                resolve(e);
            }
        });
    };

    /**
     * Uninstalls the plugin with the given package id.
     * 1) stop the plugin
     * 2) remove from plugin registry.
     *    - remove from ServiceRegistry
     *    - remove from ExtensionRegistry
     *    - remove from ExportsRegistry
     *    - remove from each plugins' manifest's dependencies
     * @param {string} id
     * @return {Promise}
     */
    PluginContext.prototype.uninstallPlugin = function uninstallPlugin (id) {
        var this$1 = this;

        this.debug('uninstallPlugin(' + id + ')');
        return new Promise(function (resolve, reject) {
            try {
                this$1.getPluginRegistry()
                    .uninstall(this$1.getPluginById(id))
                    .then(function () {
                        resolve(id);
                    });
            } catch (e) {
                reject(e);
            }
        });
    };

    PluginContext.prototype.installPluginByLocation = function installPluginByLocation (/*location*/) {
        //TODO
    };

    PluginContext.prototype.isContributionForThis = function isContributionForThis (registration) {
        var plugin = this.getPlugin();
        var name = plugin.getName();
        var version = plugin.getVersion();
        if (registration.getSpecProviderName() === name
            && registration.getSpecProviderVersion() === version) {
            return true;
        }
        return false;
    };

    PluginContext.prototype.listenRegistry = function listenRegistry () {
        var this$1 = this;

        this.debug('listenRegistry()');
        var container = this.getSystemContainer();
        var serviceRegistry = container.getServiceRegistry();
        var extensionRegistry = container.getExtensionRegistry();
        serviceRegistry.on('registered', function (registration) {
            if (this$1.isContributionForThis(registration)) {
                this$1.emit('serviceRegistered', registration);
            }
        });
        serviceRegistry.on('unregistered', function (registration) {
            if (this$1.isContributionForThis(registration)) {
                this$1.emit('serviceUnregistered', registration);
            }
        });
        extensionRegistry.on('registered', function (registration) {
            if (this$1.isContributionForThis(registration)) {
                this$1.emit('extensionRegistered', registration);
            }
        });
        extensionRegistry.on('unregistered', function (registration) {
            if (this$1.isContributionForThis(registration)) {
                this$1.emit('extensionUnregistered', registration);
            }
        });
    };

    /**
     * Call plugin's PluginActivator.start()
     * This method is called by Plugin.startWorker().
     */
    PluginContext.prototype.start = function start () {
        var this$1 = this;

        this.debug('start()');
        try {
            var ref = Plugin.State;
            var ACTIVE = ref.ACTIVE;
            var plugin = this.getPlugin();
            var manifest = plugin.getManifest();
            if (manifest.activator) {
                this._loadActivator(function (activator) {
                    this$1._activator = activator;
                    nextTick(function () {
                        activator.onStart(this$1);
                        plugin.setState(ACTIVE);
                    });
                });
            } else {
                plugin.setState(ACTIVE);
            }
        } catch (e) {
            Notice.warn(this, e);
        }
    };

    PluginContext.prototype.stop = function stop () {
        this.debug('stop()');
        try {
            var ref = Plugin.State;
            var RESOLVED = ref.RESOLVED;
            var plugin = this.getPlugin();
            var manifest = plugin.getManifest();
            if (manifest.activator) {
                if (this._activator) {
                    this._activator.onStop(this);
                    plugin.setState(RESOLVED);
                }
            } else {
                plugin.setState(RESOLVED);
            }
        } catch (e) {
            Notice.warn(this, e);
        }
    };

    /**
     * Switches to the given plugin's context.
     * Each services and extensions should know their consumer,
     * so {PluginContext} should be switched correctly before
     * getting service or to use extensions.
     * Please refer to the example code.
     * 
     * @example
     * import meta from '../../package.json';
     * import css from '../views/css/header.css';
     * import headerView from '../views/headerView';
     * 
     * function addListener(fragment, api) {
     *     const container = fragment.querySelector('#cart');
     *     container.addEventListener('cartChange', () => {
     *         refresh(container, api);
     *     });
     * }
     * 
     * function refresh(container, api) {
     *     let badge = '';
     *     const products = api.getCart();
     *     if (products.length) {
     *         badge = `<span class='${css.badge}'>${products.length}</span>`;
     *     }
     *     container.innerHTML = `<a href='#cart'>Cart${badge}</a>`;
     * }
     * 
     * export default {
     *     getView(layoutContext) {
     *         const cartContext = layoutContext.switch(meta);
     *         const api = cartContext.getService('examples.shop.resources:api');
     *         const fragment = document.createRange().createContextualFragment(headerView);
     *         const container = fragment.querySelector('#cart');
     *         addListener(fragment, api);
     *         refresh(container, api);
     *         return fragment;
     *     }
     * };
     * 
     * @param {(string|Object) param id or menifest object
     * which has id, version properties.
     */
    PluginContext.prototype.switch = function switch$1 (param) {
        var id = param;
        if (typeof param === 'object') {
            id = (param.name) + "@" + (param.version);
        }
        var plugin = this.getPluginById(id);
        if (plugin) {
            return plugin.getContext();
        }
        return null;
    };

    PluginContext.prototype.toString = function toString () {
        return ("<PluginContext>(" + (this.getPlugin()) + ")");
    };

    /*
     * This method implementation should be different
     * with respect to each runtime environment.
     * (such as webpack, node, amd)
     * If possible, this method can load Activator.js
     * asynchronously (lazily).
     *
     * TODO check private and other apis too.
     */
    PluginContext.prototype._loadActivator = function _loadActivator (callback) {
        this.debug('_loadActivator(callback)');
        var exports = ExportsRegistry
            .getExportsByPlugin(this.getPlugin());
        var Activator = exports.Activator;
        var activator = new Activator();
        callback(activator);
    };

    return PluginContext;
}(Base));

var ServiceResolver = (function (Base$$1) {
    function ServiceResolver(resolver) {
        Base$$1.call(this);
        this.define('resolver', resolver);
    }

    if ( Base$$1 ) ServiceResolver.__proto__ = Base$$1;
    ServiceResolver.prototype = Object.create( Base$$1 && Base$$1.prototype );
    ServiceResolver.prototype.constructor = ServiceResolver;

    /**
     * @return {Promise}
     */
    ServiceResolver.prototype.resolve = function resolve () {
        this._resolveContributableServices();
        return this._resolveContributingServices();
    };

    /**
     * This method does not need to return a Promise,
     * because there is no async action during it's process.
     * RESOLUTION_FAILURE_CASE: CANNOT_REGISTER_SUPER_SERVICE
     */
    ServiceResolver.prototype._resolveContributableServices = function _resolveContributableServices () {
        var this$1 = this;

        var report = this.resolver.report;
        var plugin = this.resolver.plugin;
        var manifest = plugin.getManifest();
        manifest.getContributableServiceDescriptors()
            .forEach(function (descriptor) {
                try {
                    this$1._registerSuperService(descriptor);
                } catch (e) {
                    report.addFailure(e);
                }
            });
    };

    /**
     * @return {Promise}
     */
    ServiceResolver.prototype._resolveContributingServices = function _resolveContributingServices () {
        var this$1 = this;

        var promises = [];
        var plugin = this.resolver.plugin;
        var manifest = plugin.getManifest();
        manifest.getContributingServiceDescriptors()
            .forEach(function (descriptor) {
                promises.push(this$1._publishService(descriptor));
            });
        return Promise.all(promises);
    };

    /**
     * @return {Promise}
     * By default, This method passes PluginContext
     * to the published Service. But users who don't want pass it,
     * may use PluginContext.publishService() explicitly.
     */
    ServiceResolver.prototype._publishService = function _publishService (descriptor) {
        var this$1 = this;

        var report = this.resolver.report;
        var contributor = this.resolver.plugin;
        var context = contributor.getContext();
        return new Promise(function (resolve) {
            try {
                this$1._requireServiceClass(descriptor, function (ServiceClass) {
                    try {
                        contributor.getContext().publishService(
                            descriptor.id,
                            new ServiceClass(context),
                            {
                                priority: descriptor.priority,
                                vendor: descriptor.vendor
                            }
                        );
                        resolve(null);
                    } catch (e) {
                        report.addFailure(e);
                        resolve(null);
                    }
                });
            } catch (e) {
                report.addFailure(e);
                resolve(null);
            }
        });
    };

    /**
     * TODO Async code for AMD.
     * TODO Consider, we can make _exports lazily.
     */
    ServiceResolver.prototype._requireServiceClass = function _requireServiceClass (descriptor, callback) {
        var contributor = this.resolver.plugin;
        var _exports = ExportsRegistry
            .getExportsByPlugin(contributor);
        var provider = descriptor.provider;
        var version = descriptor.version;
        var id = descriptor.id;
        var index = descriptor.index;
        var ServiceClass = _exports.contributes
            .services[provider][version][id][index];
        callback(ServiceClass);
    };

    ServiceResolver.prototype._registerSuperService = function _registerSuperService (descriptor) {
        var plugin = this.resolver.plugin;
        var SuperService = this._getSuperService(descriptor.spec);
        plugin.getContext().publishService(
            descriptor.id,
            new SuperService(),
            {
                priority: -1,
                vendor: '',
                type: 'super'
            }
        );
    };

    ServiceResolver.prototype._getSuperService = function _getSuperService (spec) {
        var SuperService = function () {};
        var proto = SuperService.prototype;
        Reflect.ownKeys(spec).forEach(function (key) {
            if (spec[key] === 'function') {
                Reflect.defineProperty(proto, key, {
                    value: function value() {}
                });
            }
        });
        return SuperService;
    };

    return ServiceResolver;
}(Base));

var ExtensionResolver = (function (Base$$1) {
    function ExtensionResolver(resolver) {
        Base$$1.call(this);
        this.define('resolver', resolver);
        this.define('_extReg', resolver.plugin
            .getContext().getExtensionRegistry());
    }

    if ( Base$$1 ) ExtensionResolver.__proto__ = Base$$1;
    ExtensionResolver.prototype = Object.create( Base$$1 && Base$$1.prototype );
    ExtensionResolver.prototype.constructor = ExtensionResolver;

    /**
     * @return {Promise}
     */
    ExtensionResolver.prototype.resolve = function resolve () {
        //TODO this._resolveContributableExtensions();
        return this._resolveContributingExtensions();
    };

    ExtensionResolver.prototype._resolveContributableExtensions = function _resolveContributableExtensions () {
        var extReg = this._extReg;
        var report = this.resolver.report;
        var plugin = this.resolver.plugin;
        var manifest = plugin.getManifest();
        manifest.getContributableExtensionDescriptors()
            .forEach(function (descriptor) {
                try {
                    extReg.registerContributableExtension(descriptor);
                } catch (e) {
                    report.addFailure(e);
                }
            });
    };

    /**
     * @return {Promise}
     */
    ExtensionResolver.prototype._resolveContributingExtensions = function _resolveContributingExtensions () {
        var this$1 = this;

        var promises = [];
        var plugin = this.resolver.plugin;
        var manifest = plugin.getManifest();
        manifest.getContributingExtensionDescriptors()
            .forEach(function (descriptor) {
                promises.push(this$1._addExtension(descriptor));
            });
        return Promise.all(promises);
    };

    /**
     * @return {Promise}
     */
    ExtensionResolver.prototype._addExtension = function _addExtension (descriptor) {
        var this$1 = this;

        var extensionRegistry = this._extReg;
        var plugin = this.resolver.plugin;
        var report = this.resolver.report;
        return new Promise(function (resolve) {
            try {
                this$1._requireExtensionModule(descriptor, function (module) {
                    try {
                        extensionRegistry.addExtension(
                            plugin.getContext(),
                            descriptor.id,
                            module,
                            {
                                priority: descriptor.priority,
                                vendor: descriptor.vendor
                            }
                        );
                        resolve(null);
                    } catch (e) {
                        report.addFailure(e);
                        resolve(null);
                    }
                });
            } catch (e) {
                report.addFailure(e);
                resolve(null);
            }
        });
    };

    /**
     * TODO Async code for AMD.
     * TODO Consider, we can make _exports lazily.
     */
    ExtensionResolver.prototype._requireExtensionModule = function _requireExtensionModule (descriptor, callback) {
        var provider = descriptor.provider;
        var version = descriptor.version;
        var id = descriptor.id;
        var index = descriptor.index;
        var contributor = this.resolver.plugin;
        var _exports = ExportsRegistry
            .getExportsByPlugin(contributor);
        var extensionModule = _exports.contributes
            .extensions[provider][version][id][index];
        callback(extensionModule);
    };

    return ExtensionResolver;
}(Base));

var ResolutionReport = (function (Base$$1) {
    function ResolutionReport(plugin) {
        Base$$1.call(this);
        this.define('_plugin', plugin);
        this.define('_failures', []);
        this.define('_warnings', []);
    }

    if ( Base$$1 ) ResolutionReport.__proto__ = Base$$1;
    ResolutionReport.prototype = Object.create( Base$$1 && Base$$1.prototype );
    ResolutionReport.prototype.constructor = ResolutionReport;

    ResolutionReport.prototype.addFailure = function addFailure (error) {
        this._failures.push(error);
    };

    ResolutionReport.prototype.addWarning = function addWarning (warning) {
        this._warnings.push(warning);
    };

    ResolutionReport.prototype.getFailures = function getFailures () {
        return this._failures;
    };

    ResolutionReport.prototype.getWarnings = function getWarnings () {
        return this._warnings;
    };

    ResolutionReport.prototype.hasNoFailure = function hasNoFailure () {
        return this._failures.length === 0;
    };

    ResolutionReport.prototype.showFailures = function showFailures () {
        var this$1 = this;

        this._failures.forEach(function (err) {
            Notice.error(this$1._plugin, err);
        });
    };

    ResolutionReport.prototype.showWarnings = function showWarnings () {
        var this$1 = this;

        this._warnings.forEach(function (err) {
            Notice.warn(this$1._plugin, err);
        });
    };

    return ResolutionReport;
}(Base));

var ContributionResolver = (function (Base$$1) {
    function ContributionResolver(plugin) {
        Base$$1.call(this);
        this.define('plugin', plugin);
        this.define('report', new ResolutionReport(plugin));
    }

    if ( Base$$1 ) ContributionResolver.__proto__ = Base$$1;
    ContributionResolver.prototype = Object.create( Base$$1 && Base$$1.prototype );
    ContributionResolver.prototype.constructor = ContributionResolver;

    /**
     * @return {Promise}
     */
    ContributionResolver.prototype.resolve = function resolve () {
        var this$1 = this;

        Notice.log(((this.plugin.getId()) + " registering contributions ..."));
        var wirings = [];
        wirings.push(this.wireActivator());
        wirings.push(this.wireServices());
        wirings.push(this.wireExtensions());
        return Promise.all(wirings).then(function () {
            return this$1.report;
        });
    };

    /**
     * @return {Promise}
     */
    ContributionResolver.prototype.wireActivator = function wireActivator () {
        var this$1 = this;

        return new Promise(function (resolve/*, reject*/) {
            try {
                var manifest = this$1.plugin.getManifest();
                if (manifest.activator) {
                    var exports = ExportsRegistry
                        .getExportsByPlugin(this$1.plugin);
                    if (typeof exports.Activator !== 'function') {
                        throw new Error(
                            'Activator should be a constructor.');
                    }
                    resolve(null);
                }
                resolve(null);
            } catch (e) {
                this$1.report.addWarning(e);
                resolve(null);
            }
        });
    };

    /**
     * @return {Promise}
     */
    ContributionResolver.prototype.wireServices = function wireServices () {
        var serviceResolver = new ServiceResolver(this);
        return serviceResolver.resolve();
    };

    /**
     * @return {Promise}
     */
    ContributionResolver.prototype.wireExtensions = function wireExtensions () {
        var extensionResolver = new ExtensionResolver(this);
        return extensionResolver.resolve();
    };

    ContributionResolver.prototype.toString = function toString () {
        return '<ContributionResolver>(' + this.plugin.getId() + ')';
    };

    return ContributionResolver;
}(Base));

var DependencyResolver = (function (Base$$1) {
    function DependencyResolver(plugin) {
        Base$$1.call(this);
        this.define('plugin', plugin);
        this.define('report', new ResolutionReport(plugin));
    }

    if ( Base$$1 ) DependencyResolver.__proto__ = Base$$1;
    DependencyResolver.prototype = Object.create( Base$$1 && Base$$1.prototype );
    DependencyResolver.prototype.constructor = DependencyResolver;

    DependencyResolver.prototype.resolve = function resolve () {
        var this$1 = this;

        return new Promise(function (resolve) {
            //TODO resolve dependencies
            resolve(this$1.report);
        });
    };

    return DependencyResolver;
}(Base));

/**
 * Represents an installed orbital package.
 */
var Plugin = (function (Base$$1) {
    function Plugin(rawManifest, systemContainer) {
        Base$$1.call(this);
        this.define('__id__', rawManifest.name + '@' + rawManifest.version);
        this.debug('new Plugin(rawManifest, systemContainer)');
        this.define('_syscon', systemContainer);
        this.define('_state', Plugin.State.UNINSTALLED, {
            writable: true
        });
        this.define('depStateChangeHandler',
            this.handleDepStateChange.bind(this));
        this.define('reqStateChangeHandler',
            this.handleReqStateChange.bind(this));
        this.define('_contributorsLastState', {}, {
            writable: true
        });
        this.init(rawManifest);
    }

    if ( Base$$1 ) Plugin.__proto__ = Base$$1;
    Plugin.prototype = Object.create( Base$$1 && Base$$1.prototype );
    Plugin.prototype.constructor = Plugin;

    Plugin.prototype.init = function init (rawManifest) {
        this.debug('init(rawManifest)');
        var State = Plugin.State;
        this.define('_manifest', new Manifest(rawManifest), {
            writable: true
        });
        if (this._state >= State.RESOLVED) {
            this.setState(State.INSTALLED);
        }
        this.define('_stopPromise', Promise.resolve(this), {
            writable: true
        });
    };

    Plugin.prototype.checkValid = function checkValid () {
        if (this.isInStates([Plugin.State.UNINSTALLED])) {
            throw new PluginError(PluginError.INVALIDSTATE);
        }
    };

    /**
     * Returns Promise for plugin stopping.
     * @returns {Promise} 
     */
    Plugin.prototype.ensureStopped = function ensureStopped () {
        return this._stopPromise;
    };

    /**
     * Loops for each contributors for this plugin.
     * @param {function} callback 
     */
    Plugin.prototype.forEachContributors = function forEachContributors (callback) {
        var registry = this.getContext().getPluginRegistry();
        registry.getPluginsRequires(this).forEach(callback);
    };

    /**
     * Returns this plugin's {@link PluginContext}. The returned
     * {@link PluginContext} can be used by the caller to act
     * on behalf of this plugin.
     *
     * If this plugin is not in the {@link #STARTING}, {@link #ACTIVE}, or
     * {@link #STOPPING} states, then this method will return null.
     *
     * @returns {PluginContext}
     */
    Plugin.prototype.getContext = function getContext () {
        if (!this._ctx) {
            this.define('_ctx',
                new PluginContext(this, this.getSystemContainer())
            );
        }
        return this._ctx;
    };

    /**
     * Returns the array of plugins which this plugin requires.
     * @returns {Array.<Plugin>}
     */
    Plugin.prototype.getDependencies = function getDependencies () {
        var this$1 = this;

        var result = [];
        var context = this.getContext();
        var dependencies = this.getManifest().dependencies;
        Reflect.ownKeys(dependencies)
            .forEach(function (name) {
                var version = dependencies[name];
                var depPlugin = context
                    .getPluginByNameAndVersion(name, version);
                if (!depPlugin) {
                    Notice.warn(this$1,
                        (name + "@" + version + " dependency plugin does not exist."));
                }
                result.push(depPlugin);
            });
        return result;
    };

    /**
     * Returns the package id. The format is of [packageName]@[packageVersion]
     * @returns {string}
     */
    Plugin.prototype.getId = function getId () {
        return this.__id__;
    };

    /**
     * Returns the <Manifest> object of this plugin.
     * @returns {Manifest}
     */
    Plugin.prototype.getManifest = function getManifest () {
        return this._manifest;
    };

    /**
     * Returns the package name.
     * @returns {string}
     */
    Plugin.prototype.getName = function getName () {
        return this._manifest.name;
    };

    /**
     * Returns the state of this plugin.
     * <table>
        <tr><th>State</th><th>Value</th></tr>
        <tr><td>UNINSTALLED</td><td>1</td></tr>
        <tr><td>INSTALLED</td><td>1 << 1</td></tr>
        <tr><td>RESOLVED</td><td>1 << 2</td></tr>
        <tr><td>STARTING</td><td>1 << 3</td></tr>
        <tr><td>ACTIVE</td><td>1 << 4</td></tr>
        <tr><td>STOPPING</td><td>1 << 5</td></tr>
     * </table>
     * @returns {number}
     */
    Plugin.prototype.getState = function getState () {
        return this._state;
    };

    /**
     * Returns the <SystemContainer> which holds
        {@link PluginRegistry}, {@link ExtensionRegistry}, {@link ServiceRegistry}
     * @returns {SystemContainer}
     */
    Plugin.prototype.getSystemContainer = function getSystemContainer () {
        return this._syscon;
    };

    /**
     * Returns the package version.
     * @returns {string}
     */
    Plugin.prototype.getVersion = function getVersion () {
        return this._manifest.version;
    };

    /*
     * Listens to plugins that I(this plugin) depends on.
     * 1) If I was starting and all plugins (that I depends on)
     *    are ACTIVE state, start me.
     */
    Plugin.prototype.handleDepStateChange = function handleDepStateChange (who, state) {
        var ref = Plugin.State;
        var ACTIVE = ref.ACTIVE;
        var STARTING = ref.STARTING;
        var STOPPING = ref.STOPPING;
        this.debug('handleDepStateChange(who:' + who.getId()
            + ', state:' + state
            + ', this is STARTING ? ' + this.isInStates([STARTING]));
        if (state === ACTIVE) {
            if (this.isInStates([STARTING]) && this.isAllContributablesResolved()) {
                Notice.log(this.getId(), 'all dependencies resolved');
                this.start();
            }
        } else if (state === STOPPING) {
            this.stop();
        }
    };

    /*
     * Listens to plugins that require this plugin.
     * 1) If I was stopping and all plugins (that require me)
     *    are RESOLVED state, stop me.
     */
    Plugin.prototype.handleReqStateChange = function handleReqStateChange (who, state, prevState) {
        var ref = Plugin.State;
        var RESOLVED = ref.RESOLVED;
        var STOPPING = ref.STOPPING;
        this.debug('handleReqStateChange(who:' + who.getId()
            + ', state:' + state
            + ', this is STOPPING ? ' + this.isInStates([STOPPING]));
        if (prevState === STOPPING && state === RESOLVED) {
            if (this.isInStates([STOPPING]) && this.isAllContributorsStopped()) {
                Notice.log(this.getId(), 'all contributing plugins stopped');
                this.stop();
            }
        }
    };

    /**
     * Returns true if all the contributors for this plugin has been stopped.
     * @returns {boolean} 
     */
    Plugin.prototype.isAllContributorsStopped = function isAllContributorsStopped () {
        var this$1 = this;

        var stopped = true;
        var ref = Plugin.State;
        var RESOLVED = ref.RESOLVED;
        this.forEachContributors(function (plugin) {
            if (!plugin.isInStates([RESOLVED])) {
                this$1.debug(plugin + ' is not stopped');
                stopped = false;
            }
        });
        return stopped;
    };

    /**
     * Returns true if all the contributables for this plugin has been resolved.
     * @returns {boolean} 
     */
    Plugin.prototype.isAllContributablesResolved = function isAllContributablesResolved () {
        var this$1 = this;

        var resolved = true;
        var State = Plugin.State;
        var registry = this.getContext().getPluginRegistry();
        this.getManifest().getDependencyList().forEach(function (id) {
            var plugin = registry.getPluginById(id);
            this$1.debug(id + ' is active ?', plugin.isInStates([State.ACTIVE]));
            if (plugin) {
                if (!plugin.isInStates([State.ACTIVE])) {
                    resolved = false;
                }
            } else {
                resolved = false;
            }
        });
        return resolved;
    };

    /**
     * Returns true if this plugin is in state of the given bit-wise states.
     * @param {number} states
     * @returns {boolean}
     */
    Plugin.prototype.isInStates = function isInStates (states) {
        if (!Array.isArray(states)) {
            return false;
        } else {
            return states.indexOf(this.getState()) > -1;
        }
    };

    Plugin.prototype.lockStateChange = function lockStateChange () {
        //TODO
    };

    Plugin.prototype.recoverContributorsLastState = function recoverContributorsLastState (options) {
        this.debug('recoverContributorsLastState(options)', options);
        this.debug('_contributorsLastState', this._contributorsLastState);
        var ref = Plugin.State;
        var ACTIVE = ref.ACTIVE;
        var registry = this.getContext().getPluginRegistry();
        var contributorsLastState = this._contributorsLastState;
        Reflect.ownKeys(contributorsLastState).forEach(function (id) {
            if (contributorsLastState[id] === ACTIVE) {
                var plugin = registry.getPluginById(id);
                if (plugin) {
                    plugin.start(options);
                }
            }
        });
    };

    Plugin.prototype.saveContributorsLastState = function saveContributorsLastState () {
        var this$1 = this;

        this.debug('saveContributorsLastState()');
        var state = {};
        this.forEachContributors(function (plugin) {
            this$1.debug(plugin + ' saved state : ' + plugin.getState());
            state[plugin.getId()] = plugin.getState();
        });
        this._contributorsLastState = state;
    };

    Plugin.prototype.setState = function setState (state) {
        Notice.log(this.getId(), getStateName(state));
        var oldState = this._state;
        this._state = state;
        this.emit('stateChange', this, state, oldState);
    };

    Plugin.prototype.isStoppedOnBoot = function isStoppedOnBoot (options) {
        var manifest = this.getManifest();
        var packState = OrbitalPackage.FLAGS;
        if (options.boot && manifest.hasState(packState.STOPPED)) {
            Notice.warn(this, 'starting aborted on boot. '
                + "The manifest state is 'stopped'. "
                + 'But you can start it manually.');
            return true;
        }
        return false;
    };

    /**
     * Starts this plugin.
     * Starting will be deferred until all dependencies are active.
     * @param {Object} options
     * @property {string} contributors
     *  'all' : start all plugins which contributes to this plugin.<br>
     *  'active' : start contributing plugins which was active
     *             when this plugin stopped.
     * @property {boolean} boot true if boot mode.
     */
    Plugin.prototype.start = function start (options) {
        var this$1 = this;
        if ( options === void 0 ) options = {};

        Notice.log(this.getId(),
            ("start(" + (Reflect.ownKeys(options).length
                ? JSON.stringify(options) : '') + ")"));
        var manifest = this.getManifest();
        var packState = OrbitalPackage.FLAGS;
        if (manifest.state >= packState.INACTIVE) {
            Notice.warn(this, 'starting aborted. ' + manifest.errorReason);
            return;
        }
        var ref = Plugin.State;
        var INSTALLED = ref.INSTALLED;
        var RESOLVED = ref.RESOLVED;
        var STARTING = ref.STARTING;
        var ACTIVE = ref.ACTIVE;
        var dependencyResolver = new DependencyResolver(this);
        if (this.isInStates([ACTIVE])) {
            return;
        }
        if (this.getManifest().hasPolicy('lazy')) {
            //TODO lazy
            //Consider doing all (lazy, eager) process
            //with resolver.resolve()
            return;
        }
        stateChangeListener.add.call(this);
        if (this.isInStates([RESOLVED, STARTING])) {
            privates.doStart.call(this, options);
        }
        //TODO lockStateChange
        this.checkValid();
        //TODO Fragment
        //TODO Level
        if (this.isInStates([INSTALLED])) {
            //lazy resolve
            //TODO Consider extract method
            dependencyResolver.resolve()
                .then(function (report) {
                    if (report.hasNoFailure()) {
                        report.showWarnings();
                        this$1.checkValid();
                        this$1.setState(RESOLVED);
                        if (this$1.isStoppedOnBoot(options)) {
                            return;
                        }
                        privates.doStart.call(this$1, options);
                    } else {
                        Notice.warn(this$1, PluginError.RESOLVE_FAILED);
                        report.showFailures();
                        //TODO RollBack
                    }
                });
        }
    };

    Plugin.prototype.startAllContributors = function startAllContributors (options) {
        this.forEachContributors(function (plugin) {
            if (plugin) {
                plugin.start(options);
            }
        });
    };

    Plugin.prototype.startContributors = function startContributors (options) {
        var contributors = options.contributors;
        if (contributors === 'all') {
            this.startAllContributors(options);
        } else if (contributors === 'active') {
            this.recoverContributorsLastState(options);
        }
    };

    Plugin.prototype.startWorker = function startWorker () {
        var this$1 = this;

        this.debug('startWorker()');
        if (!this.isAllContributablesResolved()) {
            Notice.log(this.getId(), 'waiting for all dependencies resolved');
            return;
        }
        var context = this.getContext();
        if (!context) {
            throw new PluginError(PluginError.NOCONTEXT);
        }
        try {
            var resolver = new ContributionResolver(this);
            resolver.resolve().then(function (report) {
                if (report.hasNoFailure()) {
                    report.showWarnings();
                    context.start();
                } else {
                    Notice.warn(this$1, PluginError.RESOLVE_FAILED);
                    report.showFailures();
                    //TODO RollBack
                }
            });
        } catch (e) {
            Notice.warn(this, e);
            context.close();
            throw e;
        }
    };

    /**
     * Stops this plugin.
     * Stopping will be deferred until all contributors are stopped.
     */
    Plugin.prototype.stop = function stop () {
        Notice.log(this.getId(), 'stop()');
        var ref = Plugin.State;
        var ACTIVE = ref.ACTIVE;
        //TODO lockStateChange
        try {
            this.checkValid();
            //TODO Fragment
            //TODO persistStopOptions(options)
            if (!this.isInStates([ACTIVE])) {
                return;
            }
            privates.doStop.call(this);
        } catch (e) {
            Notice.warn(this, e);
        } finally {
            // TODO unlockStateChange
        }
    };

    Plugin.prototype.stopWorker = function stopWorker (resolve) {
        this.debug('stopWorker(resolve)');
        if (!this.isAllContributorsStopped()) {
            Notice.log(this.getId(),
                'waiting for all contributors stopped');
            return;
        }
        var context = this.getContext();
        if (!context) {
            throw new PluginError(PluginError.NOCONTEXT);
        }
        try {
            context.stop();
        } finally {
            context.close(resolve);
            stateChangeListener.remove.call(this);
        }
    };

    Plugin.prototype.toString = function toString () {
        return '<Plugin>(' + this.getId() + ')';
    };

    Plugin.prototype.unlockStateChange = function unlockStateChange () {
        //TODO
    };

    return Plugin;
}(Base));

var stateChangeListener = {

    add: function add() {
        var this$1 = this;

        if (this._stateChangeListenerExist) {
            return;
        }
        this.debug('stateChangeListener.add()');
        this.getDependencies().forEach(function (contributable) {
            if (contributable) {
                contributable.on('stateChange', this$1.depStateChangeHandler);
            }
        });
        this.forEachContributors(function (contributor) {
            contributor.on('stateChange', this$1.reqStateChangeHandler);
        });
        this._stateChangeListenerExist = true;
    },

    remove: function remove() {
        var this$1 = this;

        this.debug('stateChangeListener.remove()');
        this.getDependencies().forEach(function (contributable) {
            contributable.off('stateChange', this$1.depStateChangeHandler);
        });
        this.forEachContributors(function (contributor) {
            contributor.off('stateChange', this$1.reqStateChangeHandler);
        });
        this._stateChangeListenerExist = false;
    }
};

var privates = {

    doStart: function doStart(options) {
        this.debug(("doStart(" + (JSON.stringify(options)) + ")"));
        //const Event = Plugin.Event;
        var ref = Plugin.State;
        var STARTING = ref.STARTING;
        var STOPPING = ref.STOPPING;
        //TODO Check lazy from options if (lazy) {...}
        if (!this.isInStates([STARTING])) {
            this.setState(STARTING);
        }
        if (options.contributors) {
            this.startContributors(options);
        }
        try {
            this.startWorker();
        } catch (e) {
            Notice.warn(this, e);
            this.setState(STOPPING);
        }
        //TODO publish event
    },

    doStop: function doStop() {
        var this$1 = this;

        this.debug('doStop()');
        var ref = Plugin.State;
        var STOPPING = ref.STOPPING;
        this.saveContributorsLastState();
        if (!this.isInStates([STOPPING])) {
            this.setState(STOPPING);
        }
        this._stopPromise = new Promise(function (resolve, reject) {
            try {
                this$1.stopWorker(resolve);
            } catch (e) {
                reject(e);
                throw e;
            }
        });
    }
};

function getStateName(bit) {
    var result = '';
    Reflect.ownKeys(Plugin.State).some(function (name) {
        result = name;
        return Plugin.State[name] === bit;
    });
    return result;
}

Plugin.State = {
    UNINSTALLED: 1,
    INSTALLED: 1 << 1,
    RESOLVED: 1 << 2,
    STARTING: 1 << 3,
    ACTIVE: 1 << 4,
    STOPPING: 1 << 5
};

Plugin.Event = {
    INSTALLED: 'INSTALLED',
    LAZY_ACTIVATION: 'LAZY_ACTIVATION',
    RESOLVED: 'RESOLVED',
    STARTED: 'STARTED',
    STARTING: 'STARTING',
    STOPPED: 'STOPPED',
    STOPPING: 'STOPPING',
    UNINSTALLED: 'UNINSTALLED',
    UNRESOLVED: 'UNRESOLVED',
    UPDATED: 'UPDATED'
};

var InstallError = (function (BaseError$$1) {
	function InstallError () {
		BaseError$$1.apply(this, arguments);
	}if ( BaseError$$1 ) InstallError.__proto__ = BaseError$$1;
	InstallError.prototype = Object.create( BaseError$$1 && BaseError$$1.prototype );
	InstallError.prototype.constructor = InstallError;

	

	return InstallError;
}(BaseError));

InstallError.ALEXIST = 'The package you are trying to install has already installed. Check node_modules directory.';

var privates$2 = {
    getPluginsByName: function getPluginsByName(map, name) {
        if (!map.has(name)) {
            map.set(name, {});
        }
        return map.get(name);
    }
};

var PluginRegistry = (function (Base$$1) {
    function PluginRegistry() {
        Base$$1.call(this);
        this.define('_pluginsByName', new Map());
    }

    if ( Base$$1 ) PluginRegistry.__proto__ = Base$$1;
    PluginRegistry.prototype = Object.create( Base$$1 && Base$$1.prototype );
    PluginRegistry.prototype.constructor = PluginRegistry;

    /**
     * @return {object}
     */
    PluginRegistry.prototype.getPluginsByName = function getPluginsByName (name) {
        return this._pluginsByName.get(name);
    };

    PluginRegistry.prototype.getPluginByNameAndVersion = function getPluginByNameAndVersion (name, version) {
        var plugins = this.getPluginsByName(name);
        if (typeof plugins === 'object') {
            return plugins[version] || null;
        }
        return null;
    };

    PluginRegistry.prototype.getPluginById = function getPluginById (id) {
        var token = id.split('@');
        var name = token[0];
        var version = token[1];
        return this.getPluginByNameAndVersion(name, version);
    };

    /**
     * TODO Temp Check logic
     */
    PluginRegistry.prototype.getPlugins = function getPlugins () {
        var plugins = [];
        this._pluginsByName.forEach(function (regByName) {
            Reflect.ownKeys(regByName).forEach(function (version) {
                plugins.push(regByName[version]);
            });
        });
        return plugins;
    };

    PluginRegistry.prototype.getPluginsRequires = function getPluginsRequires (requiredPlugin) {
        var plugins = [];
        this.getPlugins().forEach(function (plugin) {
            if (plugin.getDependencies().indexOf(requiredPlugin) > -1) {
                plugins.push(plugin);
            }
        });
        return plugins;
    };

    /**
     * @return {Plugin}
     */
    PluginRegistry.prototype.install = function install (initiator, plugin) {
        this.register(initiator, plugin);
        return plugin;
    };

    /**
     * Removes from plugin registry.
     * - remove from PluginRegistry
     * - remove from ServiceRegistry
     * - remove from ExtensionRegistry
     * - remove from ExportsRegistry
     * - remove from each plugins' manifest's dependencies
     * @param {Plugin} plugin
     * @return {Promise}
     */
    PluginRegistry.prototype.uninstall = function uninstall (plugin) {
        var this$1 = this;

        this.debug('uninstall(' + plugin.getId() + ')');
        return new Promise(function () {
            plugin.stop().then(function () {
                this$1.remove(plugin);
            });
        });
    };

    PluginRegistry.prototype.remove = function remove (plugin) {
        if (this.getPluginById(plugin.getId())) {
            var plugins = this.getPluginsByName(plugin.getName());
            Reflect.deleteProperty(plugins, plugin.getVersion());
        }
    };

    /**
     * TODO use fn.call()
     */
    PluginRegistry.prototype.register = function register (initiator, plugin) {
        var pluginName = plugin.getName();
        var pluginVersion = plugin.getVersion();
        var plugins = privates$2.getPluginsByName(
            this._pluginsByName, pluginName);
        if (Reflect.has(plugins, pluginVersion)) {
            throw new Error(((InstallError.ALEXIST) + "(" + (plugin.getId()) + ")"));
        }
        plugins[pluginVersion] = plugin;
        plugin.setState(Plugin.State.INSTALLED);
    };

    /**
     * 1) Check extension provider plugin & extension-point exists
     * 2) Check service provider & service exists
     * @return {Promise}
     */
    PluginRegistry.prototype.resolve = function resolve (plugin) {
        return new Promise(function (resolve/*, reject*/) {
            // do some resolving ...
            // if resolving is finished
            resolve(plugin);
        });
    };

    return PluginRegistry;
}(Base));

var ServiceError = (function (BaseError$$1) {
	function ServiceError () {
		BaseError$$1.apply(this, arguments);
	}if ( BaseError$$1 ) ServiceError.__proto__ = BaseError$$1;
	ServiceError.prototype = Object.create( BaseError$$1 && BaseError$$1.prototype );
	ServiceError.prototype.constructor = ServiceError;

	

	return ServiceError;
}(BaseError));

ServiceError.UNDEFINED_SERVICE = 'The service argument is undefined.';
ServiceError.OUTOFBOUND_PRIORITY = 'The priority should be a positive number.';
ServiceError.ALREADY_UNREG = 'The service has been already unregistered.';

var ServiceClosure = (function (Base$$1) {
    function ServiceClosure(serviceRegistry, user, serviceId, options) {
        Base$$1.call(this);
        this.define('_serviceRegistry', serviceRegistry);
        this.define('_user', user);
        this.define('_serviceId', serviceId);
        this.define('_options', options);
        this.define('_registration', null, {
            writable: true
        });
        this.define('_ready', null, {
            writable: true
        });
        this._bindServiceEvents();
        this._refreshService();
    }

    if ( Base$$1 ) ServiceClosure.__proto__ = Base$$1;
    ServiceClosure.prototype = Object.create( Base$$1 && Base$$1.prototype );
    ServiceClosure.prototype.constructor = ServiceClosure;

    ServiceClosure.prototype.ready = function ready (cb, always) {
        var this$1 = this;

        if (this._ready) {
            cb(this);
        } else {
            //TODO off event if disposed
            var listener = function (service) {
                if (this$1._ready) {
                    cb(service);
                    if (!always) {
                        this$1.off('refresh', listener);
                    }
                }
            };
            this.on('refresh', listener);
        }
    };

    ServiceClosure.prototype._bindServiceEvents = function _bindServiceEvents () {
        var this$1 = this;

        this._serviceRegistry.on('registered', function (/*reg*/) {
            //TODO conditional refresh
            this$1._refreshService();
        });
        this._serviceRegistry.on('unregistered', function (/*reg*/) {
            //TODO conditional refresh
            this$1._refreshService();
        });
    };

    ServiceClosure.prototype._refreshService = function _refreshService () {
        this._updateRegistration();
        this._createProxy();
        this._updateReadyState();
        this.emit('refresh', this);
    };

    /**
     * 1) Lookup recent service registrations.
     * 2) Update the registration.
     */
    ServiceClosure.prototype._updateRegistration = function _updateRegistration () {
        var currentRegistration = this._serviceRegistry
            .lookupCurrentRegistration(this._serviceId, this._options);
        if (this._registration) {
            this._registration.removeUser(this._user);
        }
        if (currentRegistration) {
            currentRegistration.addUser(this._user);
        }
        this._registration = currentRegistration;
    };

    ServiceClosure.prototype._createProxy = function _createProxy () {
        var this$1 = this;

        var registration = this._registration;
        var service = registration.getService();
        var spec = registration.getServiceSpec();
        Reflect.ownKeys(spec).forEach(function (key) {
            if (spec[key] === 'function') {
                var proxy;
                if (typeof service[key] === 'function') {
                    proxy = function () {
                        var args = [], len = arguments.length;
                        while ( len-- ) args[ len ] = arguments[ len ];

                        return service[key].apply(service, args);
                    };
                } else {
                    proxy = function () {};
                }
                this$1.define(key, proxy, {
                    writable: true
                });
            }
        });
    };

    ServiceClosure.prototype._updateReadyState = function _updateReadyState () {
        var registration = this._registration;
        if (registration && registration.priority > -1) {
            this._ready = true;
        } else {
            this._ready = false;
        }
    };

    return ServiceClosure;
}(Base));

var serviceUid = 0;

/**
 * Represents a service contribution.
 */
var ServiceRegistration = (function (Base$$1) {
    function ServiceRegistration(registry, publisher, version, serviceId, service) {
        Base$$1.call(this);
        var providerName = Manifest.getPackageName(serviceId);
        var specProvider = publisher
            .getPluginByNameAndVersion(providerName, version);
        this.define('_descriptor', specProvider.getManifest()
            .getContributableServiceDescriptor(serviceId));
        this.define('_registry', registry);
        this.define('_context', publisher);
        this.define('_service', service);
        this.define('_users', []);
        this.define('id', ++serviceUid);
        this.define('state', null, {
            writable: true
        });
        this.define('options', {}, {
            writable: true
        });
    }

    if ( Base$$1 ) ServiceRegistration.__proto__ = Base$$1;
    ServiceRegistration.prototype = Object.create( Base$$1 && Base$$1.prototype );
    ServiceRegistration.prototype.constructor = ServiceRegistration;

    ServiceRegistration.prototype.register = function register (options) {
        var registry = this._registry;
        var State = ServiceRegistration.State;
        //TODO context.checkValid();
        this.options = this._createOptions(options);
        registry.addServiceRegistration(this);
        this.state = State.REGISTERED;
        registry.emit('registered', this);
    };

    ServiceRegistration.prototype.unregister = function unregister () {
        var registry = this._registry;
        var State = ServiceRegistration.State;
        if (this.state !== State.REGISTERED) {
            throw new ServiceError(ServiceError.ALREADY_UNREG);
        }
        this.state = State.UNREGISTERING;
        registry.emit('unregistering', this);
        registry.removeServiceRegistration(this);
        this._releaseUsers();
        this.state = State.UNREGISTERED;
        registry.emit('unregistered', this);
    };

    /**
     * Adds a new user for this Service.
     * @param {PluginContext} user
     */
    ServiceRegistration.prototype.addUser = function addUser (user) {
        this._users.push(user);
    };

    /**
     * Removes a user from this service's users.
     * @param {PluginContext} user
     */
    ServiceRegistration.prototype.removeUser = function removeUser (user) {
        var users = this._users;
        var index = users.indexOf(user);
        if (index > -1) {
            users.splice(index, 1);
        }
        this.emit('userRemoved', user, this);
    };

    /**
     * Returns the PluginContexts that are using the service
     * referenced by this ServiceRegistration.
     * @return {Array.<PluginContext>}
     */
    ServiceRegistration.prototype.getUsers = function getUsers () {
        return this._users;
    };

    /**
     * Returns the PluginContext that registered the service
     * referenced by this ServiceRegistration.
     * @return {PluginContext}
     */
    ServiceRegistration.prototype.getPublisher = function getPublisher () {
        return this._context;
    };

    /**
     * Returns the ServiceClosure which wraps the service implementaion.
     * @return {ServiceClosure}
     */
    ServiceRegistration.prototype.getService = function getService () {
        return this._service;
    };

    /**
     * Returns contributable {@link ServiceDescriptor}
     * for this contribution.
     * @returns {Object}
     */
    ServiceRegistration.prototype.getServiceDescriptor = function getServiceDescriptor () {
        return this._descriptor;
    };

    /**
     * Returns contributable spec provider packages's name.
     * @returns {string}
     */
    ServiceRegistration.prototype.getSpecProviderName = function getSpecProviderName () {
        return this.getServiceDescriptor().provider;
    };

    /**
     * Returns contributable spec provider packages's version.
     * @returns {string}
     */
    ServiceRegistration.prototype.getSpecProviderVersion = function getSpecProviderVersion () {
        return this.getServiceDescriptor().version;
    };

    /**
     * Returns contributable service point id.
     * @returns {string}
     */
    ServiceRegistration.prototype.getServiceId = function getServiceId () {
        return this.getServiceDescriptor().id;
    };

    /**
     * Returns contributable spec based on the package.json.
     * @returns {string}
     */
    ServiceRegistration.prototype.getServiceSpec = function getServiceSpec () {
        return this.getServiceDescriptor().spec;
    };

    ServiceRegistration.prototype.toString = function toString () {
        return '<ServiceRegistration>('
            + this.getPublisher().getPlugin().getId() + "'s "
            + this.getServiceDescriptor().getServicePoint() + ')';
    };

    ServiceRegistration.prototype._releaseUsers = function _releaseUsers () {
        var this$1 = this;

        var users = this._users.concat();
        while (users.length) {
            var user = users.pop();
            this$1.removeUser(user);
        }
    };

    ServiceRegistration.prototype._createOptions = function _createOptions (options) {
        var props = {};
        if (!options) {
            options = {};
        }
        Reflect.ownKeys(options).forEach(function (key) {
            props[key] = options[key];
        });
        if (typeof options.priority === 'number') {
            if (options.type !== 'super' && options.priority < 0) {
                throw new ServiceError(ServiceError.OUTOFBOUND_PRIORITY);
            }
            this.define('priority', options.priority);
        } else {
            this.define('priority', 0);
        }
        return props;
    };

    return ServiceRegistration;
}(Base));

ServiceRegistration.State = {
    REGISTERED: 1,
    UNREGISTERING: 1 << 1,
    UNREGISTERED: 1 << 2
};

var lodash_orderby$1 = createCommonjsModule(function (module, exports) {
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used to compose bitmasks for comparison styles. */
var UNORDERED_COMPARE_FLAG = 1,
    PARTIAL_COMPARE_FLAG = 2;

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0,
    MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/,
    reLeadingDot = /^\./,
    rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports = 'object' == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array ? array.length : 0,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * The base implementation of `_.sortBy` which uses `comparer` to define the
 * sort order of `array` and replaces criteria objects with their corresponding
 * values.
 *
 * @private
 * @param {Array} array The array to sort.
 * @param {Function} comparer The function to define sort order.
 * @returns {Array} Returns `array`.
 */
function baseSortBy(array, comparer) {
  var length = array.length;

  array.sort(comparer);
  while (length--) {
    array[length] = array[length].value;
  }
  return array;
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap'),
    nativeCreate = getNative(Object, 'create');

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var this$1 = this;

  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this$1.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var this$1 = this;

  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this$1.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var this$1 = this;

  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this$1.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var this$1 = this;

  var index = -1,
      length = values ? values.length : 0;

  this.__data__ = new MapCache;
  while (++index < length) {
    this$1.add(values[index]);
  }
}

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  this.__data__ = new ListCache(entries);
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  return this.__data__['delete'](key);
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var cache = this.__data__;
  if (cache instanceof ListCache) {
    var pairs = cache.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      return this;
    }
    cache = this.__data__ = new MapCache(pairs);
  }
  cache.set(key, value);
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = (isArray(value) || isArguments(value))
    ? baseTimes(value.length, String)
    : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.forEach` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 */
var baseEach = createBaseEach(baseForOwn);

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return object && baseFor(object, iteratee, keys);
}

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = isKey(path, object) ? [path] : castPath(path);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

/**
 * The base implementation of `getTag`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  return objectToString.call(value);
}

/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {boolean} [bitmask] The bitmask of comparison flags.
 *  The bitmask may be composed of the following flags:
 *     1 - Unordered comparison
 *     2 - Partial comparison
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, customizer, bitmask, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack);
}

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = arrayTag,
      othTag = arrayTag;

  if (!objIsArr) {
    objTag = getTag(object);
    objTag = objTag == argsTag ? objectTag : objTag;
  }
  if (!othIsArr) {
    othTag = getTag(other);
    othTag = othTag == argsTag ? objectTag : othTag;
  }
  var objIsObj = objTag == objectTag && !isHostObject(object),
      othIsObj = othTag == objectTag && !isHostObject(other),
      isSameTag = objTag == othTag;

  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack);
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, equalFunc, customizer, bitmask, stack)
      : equalByTag(object, other, objTag, equalFunc, customizer, bitmask, stack);
  }
  if (!(bitmask & PARTIAL_COMPARE_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack);
      return equalFunc(objUnwrapped, othUnwrapped, customizer, bitmask, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack);
  return equalObjects(object, other, equalFunc, customizer, bitmask, stack);
}

/**
 * The base implementation of `_.isMatch` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */
function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if ((noCustomizer && data[2])
          ? data[1] !== object[data[0]]
          : !(data[0] in object)
        ) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new Stack;
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === undefined
            ? baseIsEqual(srcValue, objValue, customizer, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG, stack)
            : result
          )) {
        return false;
      }
    }
  }
  return true;
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[objectToString.call(value)];
}

/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */
function baseIteratee(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
  if (typeof value == 'function') {
    return value;
  }
  if (value == null) {
    return identity;
  }
  if (typeof value == 'object') {
    return isArray(value)
      ? baseMatchesProperty(value[0], value[1])
      : baseMatches(value);
  }
  return property(value);
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * The base implementation of `_.map` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function baseMap(collection, iteratee) {
  var index = -1,
      result = isArrayLike(collection) ? Array(collection.length) : [];

  baseEach(collection, function(value, key, collection) {
    result[++index] = iteratee(value, key, collection);
  });
  return result;
}

/**
 * The base implementation of `_.matches` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatches(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || baseIsMatch(object, source, matchData);
  };
}

/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatchesProperty(path, srcValue) {
  if (isKey(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey(path), srcValue);
  }
  return function(object) {
    var objValue = get(object, path);
    return (objValue === undefined && objValue === srcValue)
      ? hasIn(object, path)
      : baseIsEqual(srcValue, objValue, undefined, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG);
  };
}

/**
 * The base implementation of `_.orderBy` without param guards.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
 * @param {string[]} orders The sort orders of `iteratees`.
 * @returns {Array} Returns the new sorted array.
 */
function baseOrderBy(collection, iteratees, orders) {
  var index = -1;
  iteratees = arrayMap(iteratees.length ? iteratees : [identity], baseUnary(baseIteratee));

  var result = baseMap(collection, function(value, key, collection) {
    var criteria = arrayMap(iteratees, function(iteratee) {
      return iteratee(value);
    });
    return { 'criteria': criteria, 'index': ++index, 'value': value };
  });

  return baseSortBy(result, function(object, other) {
    return compareMultiple(object, other, orders);
  });
}

/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyDeep(path) {
  return function(object) {
    return baseGet(object, path);
  };
}

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value) {
  return isArray(value) ? value : stringToPath(value);
}

/**
 * Compares values to sort them in ascending order.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {number} Returns the sort order indicator for `value`.
 */
function compareAscending(value, other) {
  if (value !== other) {
    var valIsDefined = value !== undefined,
        valIsNull = value === null,
        valIsReflexive = value === value,
        valIsSymbol = isSymbol(value);

    var othIsDefined = other !== undefined,
        othIsNull = other === null,
        othIsReflexive = other === other,
        othIsSymbol = isSymbol(other);

    if ((!othIsNull && !othIsSymbol && !valIsSymbol && value > other) ||
        (valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol) ||
        (valIsNull && othIsDefined && othIsReflexive) ||
        (!valIsDefined && othIsReflexive) ||
        !valIsReflexive) {
      return 1;
    }
    if ((!valIsNull && !valIsSymbol && !othIsSymbol && value < other) ||
        (othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol) ||
        (othIsNull && valIsDefined && valIsReflexive) ||
        (!othIsDefined && valIsReflexive) ||
        !othIsReflexive) {
      return -1;
    }
  }
  return 0;
}

/**
 * Used by `_.orderBy` to compare multiple properties of a value to another
 * and stable sort them.
 *
 * If `orders` is unspecified, all values are sorted in ascending order. Otherwise,
 * specify an order of "desc" for descending or "asc" for ascending sort order
 * of corresponding values.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {boolean[]|string[]} orders The order to sort by for each property.
 * @returns {number} Returns the sort order indicator for `object`.
 */
function compareMultiple(object, other, orders) {
  var index = -1,
      objCriteria = object.criteria,
      othCriteria = other.criteria,
      length = objCriteria.length,
      ordersLength = orders.length;

  while (++index < length) {
    var result = compareAscending(objCriteria[index], othCriteria[index]);
    if (result) {
      if (index >= ordersLength) {
        return result;
      }
      var order = orders[index];
      return result * (order == 'desc' ? -1 : 1);
    }
  }
  // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
  // that causes it, under certain circumstances, to provide the same value for
  // `object` and `other`. See https://github.com/jashkenas/underscore/pull/1247
  // for more details.
  //
  // This also ensures a stable sort in V8 and other engines.
  // See https://bugs.chromium.org/p/v8/issues/detail?id=90 for more details.
  return object.index - other.index;
}

/**
 * Creates a `baseEach` or `baseEachRight` function.
 *
 * @private
 * @param {Function} eachFunc The function to iterate over a collection.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseEach(eachFunc, fromRight) {
  return function(collection, iteratee) {
    if (collection == null) {
      return collection;
    }
    if (!isArrayLike(collection)) {
      return eachFunc(collection, iteratee);
    }
    var length = collection.length,
        index = fromRight ? length : -1,
        iterable = Object(collection);

    while ((fromRight ? index-- : ++index < length)) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(array);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = (bitmask & UNORDERED_COMPARE_FLAG) ? new SetCache : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function(othValue, othIndex) {
            if (!seen.has(othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
              return seen.add(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, customizer, bitmask, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, equalFunc, customizer, bitmask, stack) {
  switch (tag) {
    case dataViewTag:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & PARTIAL_COMPARE_FLAG;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= UNORDERED_COMPARE_FLAG;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), equalFunc, customizer, bitmask, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, equalFunc, customizer, bitmask, stack) {
  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
      objProps = keys(object),
      objLength = objProps.length,
      othProps = keys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(object);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
function getMatchData(object) {
  var result = keys(object),
      length = result.length;

  while (length--) {
    var key = result[length],
        value = object[key];

    result[length] = [key, value, isStrictComparable(value)];
  }
  return result;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11,
// for data views in Edge < 14, and promises in Node.js.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = objectToString.call(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : undefined;

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */
function hasPath(object, path, hasFunc) {
  path = isKey(path, object) ? [path] : castPath(path);

  var result,
      index = -1,
      length = path.length;

  while (++index < length) {
    var key = toKey(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result) {
    return result;
  }
  var length = object ? object.length : 0;
  return !!length && isLength(length) && isIndex(key, length) &&
    (isArray(object) || isArguments(object));
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */
function isStrictComparable(value) {
  return value === value && !isObject(value);
}

/**
 * A specialized version of `matchesProperty` for source values suitable
 * for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function matchesStrictComparable(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue &&
      (srcValue !== undefined || (key in Object(object)));
  };
}

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = memoize(function(string) {
  string = toString(string);

  var result = [];
  if (reLeadingDot.test(string)) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, string) {
    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * This method is like `_.sortBy` except that it allows specifying the sort
 * orders of the iteratees to sort by. If `orders` is unspecified, all values
 * are sorted in ascending order. Otherwise, specify an order of "desc" for
 * descending or "asc" for ascending sort order of corresponding values.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Array[]|Function[]|Object[]|string[]} [iteratees=[_.identity]]
 *  The iteratees to sort by.
 * @param {string[]} [orders] The sort orders of `iteratees`.
 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
 * @returns {Array} Returns the new sorted array.
 * @example
 *
 * var users = [
 *   { 'user': 'fred',   'age': 48 },
 *   { 'user': 'barney', 'age': 34 },
 *   { 'user': 'fred',   'age': 40 },
 *   { 'user': 'barney', 'age': 36 }
 * ];
 *
 * // Sort by `user` in ascending order and by `age` in descending order.
 * _.orderBy(users, ['user', 'age'], ['asc', 'desc']);
 * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
 */
function orderBy(collection, iteratees, orders, guard) {
  if (collection == null) {
    return [];
  }
  if (!isArray(iteratees)) {
    iteratees = iteratees == null ? [] : [iteratees];
  }
  orders = guard ? undefined : orders;
  if (!isArray(orders)) {
    orders = orders == null ? [] : [orders];
  }
  return baseOrderBy(collection, iteratees, orders);
}

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result);
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache);
  return memoized;
}

// Assign cache to `_.memoize`.
memoize.Cache = MapCache;

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */
function hasIn(object, path) {
  return object != null && hasPath(object, path, baseHasIn);
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */
function property(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}

module.exports = orderBy;
});

var ServiceRegistry = (function (Base$$1) {
    function ServiceRegistry() {
        Base$$1.call(this);
        this.define('_servicesByName', new Map());
    }

    if ( Base$$1 ) ServiceRegistry.__proto__ = Base$$1;
    ServiceRegistry.prototype = Object.create( Base$$1 && Base$$1.prototype );
    ServiceRegistry.prototype.constructor = ServiceRegistry;

    ServiceRegistry.prototype.register = function register (publisher, serviceId, service, options) {
        if (!service) {
            throw new ServiceError(ServiceError.UNDEFINED_SERVICE);
        }
        //TODO Check Permission
        var providerName = Manifest.getPackageName(serviceId);
        var publisherPlugin = publisher.getPlugin();
        var publisherName = publisherPlugin.getName();
        var publisherVersion = publisherPlugin.getVersion();
        var version;
        if (publisherName === providerName) {
            version = publisherVersion;
        } else {
            version = options.type === 'super' ?
                publisherVersion :
                publisher.getDependencyVersion(providerName);
        }
        var registration = new ServiceRegistration(
            this, publisher, version, serviceId, service);
        registration.register(options);
        return registration;
    };

    /**
     * Called when the PluginContext is closing to
     * unget all services currently used by the plugin.
     *
     * @param {PluginContext} context
     *    The PluginContext of the closing plugin.
     */
    ServiceRegistry.prototype.releaseServicesInUse = function releaseServicesInUse (context) {
        this._getRegistrationsByUser(context)
            .forEach(function (registration) {
                registration.removeUser(context);
            });
    };

    /**
     * Unregisters a service with the given ServiceRegistration.
     * which is registered by this PluginContext's Plugin.
     * A service can only be unregistered by the
     * service provider (an implementer or a spec-consumer).
     * This method is automatically called
     * When the plugin is about to stop.
     *
     * @param {ServiceRegistration} registration
     */
    ServiceRegistry.prototype.unregister = function unregister (registration) {
        registration.unregister();
    };

    /**
	 * Called when the Context is closing to unregister
     * all services currently registered by the plugin.
	 *
	 * @param {PluginContext} context
     *    The PluginContext of the closing plugin.
	 */
    ServiceRegistry.prototype.unregisterServices = function unregisterServices (context) {
        this._getRegistrationsByPublisher(context)
            .forEach(function (registration) {
                registration.unregister();
            });
    };

    /**
     * <Map>_servicesByName
     * -packageName1
     *   -serviceId1
     *     -<ServiceRegistration>#1
     *     -<ServiceRegistration>#2
     *     -...
     *   -serviceId2
     *   -...
     * -packageName2
     * -...
     */
    ServiceRegistry.prototype.addServiceRegistration = function addServiceRegistration (registration) {
        var serviceId = registration.getServiceId();
        var registrations = this
            ._getRegistrationsByServiceId(serviceId);
        registrations.push(registration);
        this._setRegistrationsByServiceId(
            serviceId,
            this._sortRegistrations(registrations)
        );
    };

    /**
     * Removes ServiceRegistration from registry.
     * @param {ServiceRegistration} registration
     */
    ServiceRegistry.prototype.removeServiceRegistration = function removeServiceRegistration (registration) {
        this._forEachRegistrations(function (reg, serviceId, regsByServiceId) {
            if (registration === reg) {
                var regs = regsByServiceId[serviceId];
                var index = regs.indexOf(reg);
                if (index > -1) {
                    regs.splice(index, 1);
                    Notice.log((registration + " removed from ServiceRegistry"));
                }
            }
        });
    };

    /**
     * This method returns Service instance which contains
     * an actual service implementation.
     * the implementation inside of the Service instance
     * can be changed by ServiceRegistry's
     * register, unregister event.
     *
     * @param {PluginContext} user
     * @param {string} serviceId
     * @param {Object} options
     * @property {string} version
     * @property {string} vendor
     * @property {Object} orderBy
     * @return {ServiceClosure}
     */
    ServiceRegistry.prototype.getService = function getService (user, serviceId, options) {
        //TODO checkPermission();
        return new ServiceClosure(
            this, user, serviceId, options);
    };

    ServiceRegistry.prototype.lookupCurrentRegistration = function lookupCurrentRegistration (serviceId, options) {
        var registrations = this
            .lookupCurrentRegistrations(serviceId, options);
        return registrations[0];
    };

    ServiceRegistry.prototype.lookupCurrentRegistrations = function lookupCurrentRegistrations (serviceId, options) {
        var registrations = this
            ._getRegistrationsByServiceId(serviceId);
        var results = registrations.concat();
        if (options) {
            if (options['version']) {
                var version = options['version'];
                results = results.filter(function (registration) {
                    return registration.getSpecProviderVersion() === version;
                });
            }
            if (options['vendor']) {
                var vendor = options['vendor'];
                results = results.filter(function (registration) {
                    return registration.options.vendor === vendor;
                });
            }
            if (typeof options['orderBy'] === 'object') {
                var orders = ['asc', 'desc'];
                var orderBy = options['orderBy'];
                if (orders.indexOf(orderBy.id) > -1) {
                    results = lodash_orderby$1(results, ['id'], [orderBy.id]);
                }
                if (orders.indexOf(orderBy.priority) > -1) {
                    results = lodash_orderby$1(results, ['priority'], [orderBy.priority]);
                }
            }
        }
        return results;
    };

    ServiceRegistry.prototype._forEachRegistrations = function _forEachRegistrations (cb) {
        this._servicesByName.forEach(function (regsByServiceId) {
            Reflect.ownKeys(regsByServiceId).forEach(function (serviceId) {
                var regs = regsByServiceId[serviceId];
                regs.forEach(function (reg) {
                    cb(reg, serviceId, regsByServiceId);
                });
            });
        });
    };

    ServiceRegistry.prototype._getServicesBySpecProviderName = function _getServicesBySpecProviderName (providerName) {
        var servicesMap = this._servicesByName;
        if (!servicesMap.has(providerName)) {
            servicesMap.set(providerName, {});
        }
        return servicesMap.get(providerName);
    };

    /**
     * @return {Array.<ServiceRegistration>}
     */
    ServiceRegistry.prototype._getRegistrationsByServiceId = function _getRegistrationsByServiceId (serviceId) {
        var providerName = Manifest.getPackageName(serviceId);
        var servicesByProviderName = this
            ._getServicesBySpecProviderName(providerName);
        if (!Reflect.has(servicesByProviderName, serviceId)) {
            servicesByProviderName[serviceId] = [];
        }
        return servicesByProviderName[serviceId];
    };

    /**
     * @return {Array.<ServiceRegistration>}
     */
    ServiceRegistry.prototype._getRegistrationsByPublisher = function _getRegistrationsByPublisher (context) {
        var results = [];
        this._forEachRegistrations(function (reg) {
            if (reg.getPublisher() === context) {
                results.push(reg);
            }
        });
        return results;
    };

    /**
     * Returns array of Registrations
     * which the given context uses of.
     * @return {Array.<ServiceRegistration>}
     */
    ServiceRegistry.prototype._getRegistrationsByUser = function _getRegistrationsByUser (context) {
        var results = [];
        this._forEachRegistrations(function (reg) {
            if (reg.getUsers().indexOf(context) > -1) {
                results.push(reg);
            }
        });
        return results;
    };

    ServiceRegistry.prototype._setRegistrationsByServiceId = function _setRegistrationsByServiceId (serviceId, registrations) {
        var providerName = Manifest.getPackageName(serviceId);
        var servicesByProviderName = this
            ._getServicesBySpecProviderName(providerName);
        servicesByProviderName[serviceId] = registrations;
    };

    ServiceRegistry.prototype._sortRegistrations = function _sortRegistrations (registrations) {
        return lodash_orderby$1(
            registrations, ['priority', 'id'], ['desc', 'asc']);
    };

    return ServiceRegistry;
}(Base));

var ExtensionError = (function (BaseError$$1) {
	function ExtensionError () {
		BaseError$$1.apply(this, arguments);
	}if ( BaseError$$1 ) ExtensionError.__proto__ = BaseError$$1;
	ExtensionError.prototype = Object.create( BaseError$$1 && BaseError$$1.prototype );
	ExtensionError.prototype.constructor = ExtensionError;

	

	return ExtensionError;
}(BaseError));

ExtensionError.ABNORMAL_MODULE = 'Please check #{0}/package.json\'s contributes/extensions/#{1}/realize field. The value must be an Object.';
ExtensionError.ALREADY_UNREG = 'The extension has been already unregistered.';
ExtensionError.OUTOFBOUND_PRIORITY = 'The priority should be a positive number. See #{0}/package.json\'s contributes/extensions/#{1} field.';

var extensionUid = 0;

/**
 * Represents an extension contribution.
 */
var ExtensionRegistration = (function (Base$$1) {
    function ExtensionRegistration(registry, contributor, extensionId, module) {
        Base$$1.call(this);
        var providerName = Manifest.getPackageName(extensionId);
        var version = contributor.getDependencyVersion(providerName);
        var specProvider = contributor
            .getPluginByNameAndVersion(providerName, version);
        this.define('_descriptor', specProvider.getManifest()
            .getContributableExtensionDescriptor(extensionId));
        this.define('_registry', registry);
        this.define('_context', contributor);
        this.define('_module', module);
        this.define('id', ++extensionUid);
        this.define('state', null, {
            writable: true
        });
    }

    if ( Base$$1 ) ExtensionRegistration.__proto__ = Base$$1;
    ExtensionRegistration.prototype = Object.create( Base$$1 && Base$$1.prototype );
    ExtensionRegistration.prototype.constructor = ExtensionRegistration;

    ExtensionRegistration.prototype.register = function register (options) {
        var registry = this._registry;
        var State = ExtensionRegistration.State;
        //TODO context.checkValid();
        this.options = this._createOptions(options);
        registry.addExtensionRegistration(this);
        this.state = State.REGISTERED;
        registry.emit('registered', this);
    };

    ExtensionRegistration.prototype.unregister = function unregister () {
        var registry = this._registry;
        var State = ExtensionRegistration.State;
        if (this.state !== State.REGISTERED) {
            throw new ExtensionError(ExtensionError.ALREADY_UNREG);
        }
        this.state = State.UNREGISTERING;
        registry.emit('unregistering', this);
        registry.removeExtensionRegistration(this);
        this.state = State.UNREGISTERED;
        registry.emit('unregistered', this);
    };

    ExtensionRegistration.prototype._createOptions = function _createOptions (options) {
        var props = {};
        if (!options) {
            return props;
        }
        Reflect.ownKeys(options).forEach(function (key) {
            props[key] = options[key];
        });
        if (typeof options.priority === 'number') {
            if (options.priority < 0) {
                var pluginName = this.getContributor().getPluginName();
                var extId = this.getExtensionId();
                throw new ExtensionError(
                    ExtensionError.OUTOFBOUND_PRIORITY, pluginName, extId);
            }
            this.define('priority', options.priority);
        } else {
            this.define('priority', 0);
        }
        return props;
    };

    /**
     * Returns contributor plugin's {@link PluginContext}
     * for this extension contribution.
     * @returns {PluginContext}
     */
    ExtensionRegistration.prototype.getContributor = function getContributor () {
        return this._context;
    };

    /**
     * Returns extension contribution module object
     * which implements contributable spec.
     * @returns {Object}
     */
    ExtensionRegistration.prototype.getModule = function getModule () {
        return this._module;
    };

    /**
     * Returns contributable {@link ExtensionDescriptor}
     * for this contribution.
     * @returns {Object}
     */
    ExtensionRegistration.prototype.getExtensionDescriptor = function getExtensionDescriptor () {
        return this._descriptor;
    };

    /**
     * Returns contributable spec provider packages's name.
     * @returns {string}
     */
    ExtensionRegistration.prototype.getSpecProviderName = function getSpecProviderName () {
        return this.getExtensionDescriptor().provider;
    };

    /**
     * Returns contributable spec provider packages's version.
     * @returns {string}
     */
    ExtensionRegistration.prototype.getSpecProviderVersion = function getSpecProviderVersion () {
        return this.getExtensionDescriptor().version;
    };

    /**
     * Returns contributable extension point id.
     * @returns {string}
     */
    ExtensionRegistration.prototype.getExtensionId = function getExtensionId () {
        return this.getExtensionDescriptor().id;
    };

    /**
     * Returns contributable spec based on the package.json.
     * @returns {string}
     */
    ExtensionRegistration.prototype.getExtensionSpec = function getExtensionSpec () {
        return this.getExtensionDescriptor().spec;
    };

    ExtensionRegistration.prototype.toString = function toString () {
        return '<ExtensionRegistration>('
            + this.getContributor().getPlugin().getId() + "'s "
            + this.getExtensionDescriptor().getExtensionPoint() + ')';
    };

    return ExtensionRegistration;
}(Base));

ExtensionRegistration.State = {
    REGISTERED: 1,
    UNREGISTERING: 1 << 1,
    UNREGISTERED: 1 << 2
};

var ExtensionRegistry = (function (Base$$1) {
    function ExtensionRegistry() {
        Base$$1.call(this);
        this.define('_extensionsByName', new Map());
        this.define('_contributableExtensions', new Map());
    }

    if ( Base$$1 ) ExtensionRegistry.__proto__ = Base$$1;
    ExtensionRegistry.prototype = Object.create( Base$$1 && Base$$1.prototype );
    ExtensionRegistry.prototype.constructor = ExtensionRegistry;

    /**
     * @return {Array.<ExtensionRegistration>}
     * TODO Consider if this is safe or not.
     * TODO Consider more capsulized return.
     */
    ExtensionRegistry.prototype.getExtensionRegistrations = function getExtensionRegistrations (extensionId) {
        return this._getRegistrationsByExtensionId(extensionId);
    };

    /**
     *
     */
    ExtensionRegistry.prototype.getExtensions = function getExtensions (extensionId) {
        var registrations = this._getRegistrationsByExtensionId(extensionId);
        var modules = [];
        registrations.forEach(function (registration) {
            modules.push(registration.getModule());
        });
        return modules;
    };

    ExtensionRegistry.prototype.registerContributableExtension = function registerContributableExtension (descriptor) {
        console.info('descriptor => ', descriptor);
        //TODO Is this required?
    };

    /**
     * @param {PluginContext} contributor
     * @param {string} extensionId
     * @param {Object} module
     * @param {Object} options
     */
    ExtensionRegistry.prototype.addExtension = function addExtension (contributor, extensionId, module, options) {
        this.debug('addExtension()', contributor.getPlugin().getId(),
            extensionId, JSON.stringify(module), JSON.stringify(options));
        if (typeof module !== 'object') {
            var pluginName = contributor.getPlugin().getName();
            throw new ExtensionError(
                ExtensionError.ABNORMAL_MODULE, pluginName, extensionId);
        }
        //TODO Check Permission
        var registration = new ExtensionRegistration(
            this, contributor, extensionId, module);
        registration.register(options);
        return registration;
    };

    /**
     * @param {PluginContext} contributor
     */
    ExtensionRegistry.prototype.unregisterExtensions = function unregisterExtensions (contributor) {
        this._getRegistrationsByContributor(contributor)
            .forEach(function (registration) {
                registration.unregister();
            });
    };

    /**
     * <Map>_contributingExtensions
     * -packageName1
     *   -extensionId1
     *     -<ExtensionRegistration>#1
     *     -<ExtensionRegistration>#2
     *     -...
     *   -extensionId2
     *   -...
     * -packageName2
     * -...
     */
    ExtensionRegistry.prototype.addExtensionRegistration = function addExtensionRegistration (registration) {
        var providerName = registration.getSpecProviderName();
        var extensionId = registration.getExtensionId();
        var registrations = this
            ._getRegistrationsByExtensionId(extensionId);
        registrations.push(registration);
        this._setRegistrationsByExtensionId(
            providerName,
            extensionId,
            this._sortRegistrations(registrations)
        );
    };

    /**
     * Removes ExtensionRegistration from registry.
     * @param {ExtensionRegistration} registration
     */
    ExtensionRegistry.prototype.removeExtensionRegistration = function removeExtensionRegistration (registration) {
        var this$1 = this;

        this._forEachRegistrations(function (reg, extensionId, regsByExtensionId) {
            if (registration === reg) {
                var regs = regsByExtensionId[extensionId];
                var index = regs.indexOf(reg);
                if (index > -1) {
                    regs.splice(index, 1);
                    this$1.debug((registration + " removed"));
                }
            }
        });
    };

    ExtensionRegistry.prototype._forEachRegistrations = function _forEachRegistrations (cb) {
        this._extensionsByName.forEach(function (regsByExtensionId) {
            Reflect.ownKeys(regsByExtensionId).forEach(function (extensionId) {
                var regs = regsByExtensionId[extensionId];
                regs.forEach(function (reg) {
                    cb(reg, extensionId, regsByExtensionId);
                });
            });
        });
    };

    ExtensionRegistry.prototype._getRegistrationsByContributor = function _getRegistrationsByContributor (context) {
        var results = [];
        this._forEachRegistrations(function (reg) {
            if (reg.getContributor() === context) {
                results.push(reg);
            }
        });
        return results;
    };

    /**
     * @return {Array.<ExtensionRegistration>}
     * TODO return clone
     */
    ExtensionRegistry.prototype._getRegistrationsByExtensionId = function _getRegistrationsByExtensionId (extensionId) {
        var providerName = Manifest.getPackageName(extensionId);
        var extensionsByProviderName = this
            ._getExtensionsByProviderName(providerName);
        if (!Reflect.has(extensionsByProviderName, extensionId)) {
            extensionsByProviderName[extensionId] = [];
        }
        return extensionsByProviderName[extensionId];
    };

    ExtensionRegistry.prototype._setRegistrationsByExtensionId = function _setRegistrationsByExtensionId (providerName, extensionId, registrations) {
        var extensionsByProviderName = this
            ._getExtensionsByProviderName(providerName);
        extensionsByProviderName[extensionId] = registrations;
    };

    ExtensionRegistry.prototype._getExtensionsByProviderName = function _getExtensionsByProviderName (providerName) {
        var extensionsMap = this._extensionsByName;
        if (!extensionsMap.has(providerName)) {
            extensionsMap.set(providerName, {});
        }
        return extensionsMap.get(providerName);
    };

    ExtensionRegistry.prototype._sortRegistrations = function _sortRegistrations (registrations) {
        return lodash_orderby$1(
            registrations, ['priority', 'id'], ['desc', 'asc']);
    };

    return ExtensionRegistry;
}(Base));

var SystemContainer = (function (Base$$1) {
    function SystemContainer() {
        Base$$1.call(this);
        this.define('_pluginReg', new PluginRegistry());
        this.define('_serviceReg', new ServiceRegistry());
        this.define('_extReg', new ExtensionRegistry());
    }

    if ( Base$$1 ) SystemContainer.__proto__ = Base$$1;
    SystemContainer.prototype = Object.create( Base$$1 && Base$$1.prototype );
    SystemContainer.prototype.constructor = SystemContainer;

    SystemContainer.prototype.getPluginRegistry = function getPluginRegistry () {
        return this._pluginReg;
    };

    SystemContainer.prototype.getServiceRegistry = function getServiceRegistry () {
        return this._serviceReg;
    };

    SystemContainer.prototype.getExtensionRegistry = function getExtensionRegistry () {
        return this._extReg;
    };

    return SystemContainer;
}(Base));

var SystemPlugin = (function (Plugin$$1) {
    function SystemPlugin(rawManifest) {
        Plugin$$1.call(this, rawManifest, new SystemContainer());
    }

    if ( Plugin$$1 ) SystemPlugin.__proto__ = Plugin$$1;
    SystemPlugin.prototype = Object.create( Plugin$$1 && Plugin$$1.prototype );
    SystemPlugin.prototype.constructor = SystemPlugin;

    SystemPlugin.prototype.install = function install () {
        var this$1 = this;

        return new Promise(function (resolve/*, reject*/) {
            var container = this$1.getSystemContainer();
            var registry = container.getPluginRegistry();
            try {
                var installed = registry.install(this$1, this$1);
                resolve(installed);
            } catch (e) {
                Notice.warn(this$1, e);
                resolve(e);
            }
        });
    };

    /**
     * Start SystemPlugin.
     *
     * 1) If this is not in the {@link #STARTING} state and initialize.
     * 2) Any exceptions that occur during plugin starting must be wrapped
     *    in a {@link PluginError} and then published as a SystemPlugin event
     *    of type {@link SystemPluginEvent#ERROR}.
     * 3) This Framework's state is set to {@link #ACTIVE}.
     * 4) A framework event of type {@link SystemPluginEvent#STARTED} is fired
     */
    SystemPlugin.prototype.start = function start (options) {
        Plugin$$1.prototype.start.call(this, options);
    };

    //TODO override
    SystemPlugin.prototype.stopWorker = function stopWorker () {
        Plugin$$1.prototype.stopWorker.call(this);
        //TODO close SystemContainer
    };

    return SystemPlugin;
}(Plugin));

var depCount = {
    manifest: function manifest(manifest$1) {
        return Reflect.ownKeys(manifest$1.dependencies).length;
    },
    plugin: function plugin(plugin$1) {
        return Reflect.ownKeys(plugin$1.getManifest().dependencies).length;
    }
};

function swap(array, i, j) {
    var tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
}

function sort(array, type) {
    for (var i = 0; i < array.length - 1; i++) {
        var min = i;
        for (var j = i + 1; j < array.length; j++) {
            if (depCount[type](array[j]) < depCount[type](array[min])) {
                min = j;
            }
        }
        swap(array, min, i);
    }
}

function getSystemManifest(manifests) {
    var sysMan = null;
    var sysIndex;
    var exist = manifests.some(function (manifest, i) {
        if (manifest.name === 'orbital.js') {
            sysIndex = i;
            return true;
        }
    });
    if (exist) {
        sysMan = manifests.splice(sysIndex, 1)[0];
    }
    return sysMan;
}

var Installer = function Installer () {};

Installer.install = function install (manifests, callback) {
    //TODO make manifests tree
    var promises = [];
    var sysMan = getSystemManifest(manifests);
    var system = new SystemPlugin(sysMan);
    var context = system.getContext();
    sort(manifests, 'manifest');
    promises.push(system.install());
    manifests.forEach(function (manifest) {
        promises.push(
            context.installPlugin(manifest)
        );
    });
    Promise.all(promises).then(function (results) {
        var installedPlugins = results.filter(function (result) {
            return result instanceof Plugin;
        });
        sort(installedPlugins, 'plugin');
        callback(system, installedPlugins);
        return null;
    });
};

var Starter = function Starter () {};

Starter.startup = function startup () {
    this.loadPlugins();
};

/**
 * 1) Discover manifests
 *
 * Discovers manifests and validates.
 * If a plugin meets error, the framework will
 * warn the reason and remember it.
 * A plugin with error will be installed,
 * but will never start until the problem fixed.
 * This uses an unresolved <Promise> object.
 */
Starter.loadPlugins = function loadPlugins () {
        var this$1 = this;

    ManifestLoader.discover(this, function (manifests) {
        this$1.installPlugins(manifests);
    });
};

/**
 * 2) Install plugins
 * 3) Sort by numbers of dependencies
 *
 * Installs each plugin whether it has problems or not.
 * If some plugins meet error, the framework will
 * warn the reason and continue next plugins.
 */
Starter.installPlugins = function installPlugins (manifests) {
        var this$1 = this;

    Installer.install(manifests, function (system, installedPlugins) {
        this$1.system = system;
        this$1.startPlugins(installedPlugins);
    });
};

/**
 * 4) Start resolved plugin
 */
Starter.startPlugins = function startPlugins (resolvedPlugins) {
    resolvedPlugins.forEach(function (plugin) {
        plugin.start({boot: true});
    });
};

function orbital() {
    Starter.startup();
}

orbital.PluginActivator = PluginActivator;

return orbital;

})));
//# sourceMappingURL=orbital.core.js.map
