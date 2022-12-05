import require$$1, { resolve, join, normalize, dirname } from 'path';
import require$$0$1 from 'buffer';
import require$$0$2 from 'tty';
import require$$1$1 from 'util';
import * as fs from 'fs';
import fs__default, { readdirSync, statSync } from 'fs';
import require$$4 from 'net';
import require$$7 from 'zlib';
import { once } from 'events';
import { readFile } from 'fs/promises';
import http from 'http';
import * as qs from 'querystring';
import { Headers as Headers$1, Request as Request$1, FormData, Response as Response$1, fetch as fetch$1 } from 'undici';
import { Readable } from 'stream';
import crypto from 'crypto';
import Streams from 'stream/web';
import { fileURLToPath } from 'url';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var compression$1 = {exports: {}};

var negotiator = {exports: {}};

var charset = {exports: {}};

/**
 * negotiator
 * Copyright(c) 2012 Isaac Z. Schlueter
 * Copyright(c) 2014 Federico Romero
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

charset.exports = preferredCharsets$1;
charset.exports.preferredCharsets = preferredCharsets$1;

/**
 * Module variables.
 * @private
 */

var simpleCharsetRegExp = /^\s*([^\s;]+)\s*(?:;(.*))?$/;

/**
 * Parse the Accept-Charset header.
 * @private
 */

function parseAcceptCharset(accept) {
  var accepts = accept.split(',');

  for (var i = 0, j = 0; i < accepts.length; i++) {
    var charset = parseCharset(accepts[i].trim(), i);

    if (charset) {
      accepts[j++] = charset;
    }
  }

  // trim accepts
  accepts.length = j;

  return accepts;
}

/**
 * Parse a charset from the Accept-Charset header.
 * @private
 */

function parseCharset(str, i) {
  var match = simpleCharsetRegExp.exec(str);
  if (!match) return null;

  var charset = match[1];
  var q = 1;
  if (match[2]) {
    var params = match[2].split(';');
    for (var j = 0; j < params.length; j++) {
      var p = params[j].trim().split('=');
      if (p[0] === 'q') {
        q = parseFloat(p[1]);
        break;
      }
    }
  }

  return {
    charset: charset,
    q: q,
    i: i
  };
}

/**
 * Get the priority of a charset.
 * @private
 */

function getCharsetPriority(charset, accepted, index) {
  var priority = {o: -1, q: 0, s: 0};

  for (var i = 0; i < accepted.length; i++) {
    var spec = specify$3(charset, accepted[i], index);

    if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) {
      priority = spec;
    }
  }

  return priority;
}

/**
 * Get the specificity of the charset.
 * @private
 */

function specify$3(charset, spec, index) {
  var s = 0;
  if(spec.charset.toLowerCase() === charset.toLowerCase()){
    s |= 1;
  } else if (spec.charset !== '*' ) {
    return null
  }

  return {
    i: index,
    o: spec.i,
    q: spec.q,
    s: s
  }
}

/**
 * Get the preferred charsets from an Accept-Charset header.
 * @public
 */

function preferredCharsets$1(accept, provided) {
  // RFC 2616 sec 14.2: no header = *
  var accepts = parseAcceptCharset(accept === undefined ? '*' : accept || '');

  if (!provided) {
    // sorted list of all charsets
    return accepts
      .filter(isQuality$3)
      .sort(compareSpecs$3)
      .map(getFullCharset);
  }

  var priorities = provided.map(function getPriority(type, index) {
    return getCharsetPriority(type, accepts, index);
  });

  // sorted list of accepted charsets
  return priorities.filter(isQuality$3).sort(compareSpecs$3).map(function getCharset(priority) {
    return provided[priorities.indexOf(priority)];
  });
}

/**
 * Compare two specs.
 * @private
 */

function compareSpecs$3(a, b) {
  return (b.q - a.q) || (b.s - a.s) || (a.o - b.o) || (a.i - b.i) || 0;
}

/**
 * Get full charset string.
 * @private
 */

function getFullCharset(spec) {
  return spec.charset;
}

/**
 * Check if a spec has any quality.
 * @private
 */

function isQuality$3(spec) {
  return spec.q > 0;
}

var encoding = {exports: {}};

/**
 * negotiator
 * Copyright(c) 2012 Isaac Z. Schlueter
 * Copyright(c) 2014 Federico Romero
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

encoding.exports = preferredEncodings$1;
encoding.exports.preferredEncodings = preferredEncodings$1;

/**
 * Module variables.
 * @private
 */

var simpleEncodingRegExp = /^\s*([^\s;]+)\s*(?:;(.*))?$/;

/**
 * Parse the Accept-Encoding header.
 * @private
 */

function parseAcceptEncoding(accept) {
  var accepts = accept.split(',');
  var hasIdentity = false;
  var minQuality = 1;

  for (var i = 0, j = 0; i < accepts.length; i++) {
    var encoding = parseEncoding(accepts[i].trim(), i);

    if (encoding) {
      accepts[j++] = encoding;
      hasIdentity = hasIdentity || specify$2('identity', encoding);
      minQuality = Math.min(minQuality, encoding.q || 1);
    }
  }

  if (!hasIdentity) {
    /*
     * If identity doesn't explicitly appear in the accept-encoding header,
     * it's added to the list of acceptable encoding with the lowest q
     */
    accepts[j++] = {
      encoding: 'identity',
      q: minQuality,
      i: i
    };
  }

  // trim accepts
  accepts.length = j;

  return accepts;
}

/**
 * Parse an encoding from the Accept-Encoding header.
 * @private
 */

function parseEncoding(str, i) {
  var match = simpleEncodingRegExp.exec(str);
  if (!match) return null;

  var encoding = match[1];
  var q = 1;
  if (match[2]) {
    var params = match[2].split(';');
    for (var j = 0; j < params.length; j++) {
      var p = params[j].trim().split('=');
      if (p[0] === 'q') {
        q = parseFloat(p[1]);
        break;
      }
    }
  }

  return {
    encoding: encoding,
    q: q,
    i: i
  };
}

/**
 * Get the priority of an encoding.
 * @private
 */

function getEncodingPriority(encoding, accepted, index) {
  var priority = {o: -1, q: 0, s: 0};

  for (var i = 0; i < accepted.length; i++) {
    var spec = specify$2(encoding, accepted[i], index);

    if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) {
      priority = spec;
    }
  }

  return priority;
}

/**
 * Get the specificity of the encoding.
 * @private
 */

function specify$2(encoding, spec, index) {
  var s = 0;
  if(spec.encoding.toLowerCase() === encoding.toLowerCase()){
    s |= 1;
  } else if (spec.encoding !== '*' ) {
    return null
  }

  return {
    i: index,
    o: spec.i,
    q: spec.q,
    s: s
  }
}
/**
 * Get the preferred encodings from an Accept-Encoding header.
 * @public
 */

function preferredEncodings$1(accept, provided) {
  var accepts = parseAcceptEncoding(accept || '');

  if (!provided) {
    // sorted list of all encodings
    return accepts
      .filter(isQuality$2)
      .sort(compareSpecs$2)
      .map(getFullEncoding);
  }

  var priorities = provided.map(function getPriority(type, index) {
    return getEncodingPriority(type, accepts, index);
  });

  // sorted list of accepted encodings
  return priorities.filter(isQuality$2).sort(compareSpecs$2).map(function getEncoding(priority) {
    return provided[priorities.indexOf(priority)];
  });
}

/**
 * Compare two specs.
 * @private
 */

function compareSpecs$2(a, b) {
  return (b.q - a.q) || (b.s - a.s) || (a.o - b.o) || (a.i - b.i) || 0;
}

/**
 * Get full encoding string.
 * @private
 */

function getFullEncoding(spec) {
  return spec.encoding;
}

/**
 * Check if a spec has any quality.
 * @private
 */

function isQuality$2(spec) {
  return spec.q > 0;
}

var language = {exports: {}};

/**
 * negotiator
 * Copyright(c) 2012 Isaac Z. Schlueter
 * Copyright(c) 2014 Federico Romero
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

language.exports = preferredLanguages$1;
language.exports.preferredLanguages = preferredLanguages$1;

/**
 * Module variables.
 * @private
 */

var simpleLanguageRegExp = /^\s*([^\s\-;]+)(?:-([^\s;]+))?\s*(?:;(.*))?$/;

/**
 * Parse the Accept-Language header.
 * @private
 */

function parseAcceptLanguage(accept) {
  var accepts = accept.split(',');

  for (var i = 0, j = 0; i < accepts.length; i++) {
    var language = parseLanguage(accepts[i].trim(), i);

    if (language) {
      accepts[j++] = language;
    }
  }

  // trim accepts
  accepts.length = j;

  return accepts;
}

/**
 * Parse a language from the Accept-Language header.
 * @private
 */

function parseLanguage(str, i) {
  var match = simpleLanguageRegExp.exec(str);
  if (!match) return null;

  var prefix = match[1];
  var suffix = match[2];
  var full = prefix;

  if (suffix) full += "-" + suffix;

  var q = 1;
  if (match[3]) {
    var params = match[3].split(';');
    for (var j = 0; j < params.length; j++) {
      var p = params[j].split('=');
      if (p[0] === 'q') q = parseFloat(p[1]);
    }
  }

  return {
    prefix: prefix,
    suffix: suffix,
    q: q,
    i: i,
    full: full
  };
}

/**
 * Get the priority of a language.
 * @private
 */

function getLanguagePriority(language, accepted, index) {
  var priority = {o: -1, q: 0, s: 0};

  for (var i = 0; i < accepted.length; i++) {
    var spec = specify$1(language, accepted[i], index);

    if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) {
      priority = spec;
    }
  }

  return priority;
}

/**
 * Get the specificity of the language.
 * @private
 */

function specify$1(language, spec, index) {
  var p = parseLanguage(language);
  if (!p) return null;
  var s = 0;
  if(spec.full.toLowerCase() === p.full.toLowerCase()){
    s |= 4;
  } else if (spec.prefix.toLowerCase() === p.full.toLowerCase()) {
    s |= 2;
  } else if (spec.full.toLowerCase() === p.prefix.toLowerCase()) {
    s |= 1;
  } else if (spec.full !== '*' ) {
    return null
  }

  return {
    i: index,
    o: spec.i,
    q: spec.q,
    s: s
  }
}
/**
 * Get the preferred languages from an Accept-Language header.
 * @public
 */

function preferredLanguages$1(accept, provided) {
  // RFC 2616 sec 14.4: no header = *
  var accepts = parseAcceptLanguage(accept === undefined ? '*' : accept || '');

  if (!provided) {
    // sorted list of all languages
    return accepts
      .filter(isQuality$1)
      .sort(compareSpecs$1)
      .map(getFullLanguage);
  }

  var priorities = provided.map(function getPriority(type, index) {
    return getLanguagePriority(type, accepts, index);
  });

  // sorted list of accepted languages
  return priorities.filter(isQuality$1).sort(compareSpecs$1).map(function getLanguage(priority) {
    return provided[priorities.indexOf(priority)];
  });
}

/**
 * Compare two specs.
 * @private
 */

function compareSpecs$1(a, b) {
  return (b.q - a.q) || (b.s - a.s) || (a.o - b.o) || (a.i - b.i) || 0;
}

/**
 * Get full language string.
 * @private
 */

function getFullLanguage(spec) {
  return spec.full;
}

/**
 * Check if a spec has any quality.
 * @private
 */

function isQuality$1(spec) {
  return spec.q > 0;
}

var mediaType = {exports: {}};

/**
 * negotiator
 * Copyright(c) 2012 Isaac Z. Schlueter
 * Copyright(c) 2014 Federico Romero
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

mediaType.exports = preferredMediaTypes$1;
mediaType.exports.preferredMediaTypes = preferredMediaTypes$1;

/**
 * Module variables.
 * @private
 */

var simpleMediaTypeRegExp = /^\s*([^\s\/;]+)\/([^;\s]+)\s*(?:;(.*))?$/;

/**
 * Parse the Accept header.
 * @private
 */

function parseAccept(accept) {
  var accepts = splitMediaTypes(accept);

  for (var i = 0, j = 0; i < accepts.length; i++) {
    var mediaType = parseMediaType(accepts[i].trim(), i);

    if (mediaType) {
      accepts[j++] = mediaType;
    }
  }

  // trim accepts
  accepts.length = j;

  return accepts;
}

/**
 * Parse a media type from the Accept header.
 * @private
 */

function parseMediaType(str, i) {
  var match = simpleMediaTypeRegExp.exec(str);
  if (!match) return null;

  var params = Object.create(null);
  var q = 1;
  var subtype = match[2];
  var type = match[1];

  if (match[3]) {
    var kvps = splitParameters(match[3]).map(splitKeyValuePair);

    for (var j = 0; j < kvps.length; j++) {
      var pair = kvps[j];
      var key = pair[0].toLowerCase();
      var val = pair[1];

      // get the value, unwrapping quotes
      var value = val && val[0] === '"' && val[val.length - 1] === '"'
        ? val.substr(1, val.length - 2)
        : val;

      if (key === 'q') {
        q = parseFloat(value);
        break;
      }

      // store parameter
      params[key] = value;
    }
  }

  return {
    type: type,
    subtype: subtype,
    params: params,
    q: q,
    i: i
  };
}

/**
 * Get the priority of a media type.
 * @private
 */

function getMediaTypePriority(type, accepted, index) {
  var priority = {o: -1, q: 0, s: 0};

  for (var i = 0; i < accepted.length; i++) {
    var spec = specify(type, accepted[i], index);

    if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) {
      priority = spec;
    }
  }

  return priority;
}

/**
 * Get the specificity of the media type.
 * @private
 */

function specify(type, spec, index) {
  var p = parseMediaType(type);
  var s = 0;

  if (!p) {
    return null;
  }

  if(spec.type.toLowerCase() == p.type.toLowerCase()) {
    s |= 4;
  } else if(spec.type != '*') {
    return null;
  }

  if(spec.subtype.toLowerCase() == p.subtype.toLowerCase()) {
    s |= 2;
  } else if(spec.subtype != '*') {
    return null;
  }

  var keys = Object.keys(spec.params);
  if (keys.length > 0) {
    if (keys.every(function (k) {
      return spec.params[k] == '*' || (spec.params[k] || '').toLowerCase() == (p.params[k] || '').toLowerCase();
    })) {
      s |= 1;
    } else {
      return null
    }
  }

  return {
    i: index,
    o: spec.i,
    q: spec.q,
    s: s,
  }
}

/**
 * Get the preferred media types from an Accept header.
 * @public
 */

function preferredMediaTypes$1(accept, provided) {
  // RFC 2616 sec 14.2: no header = */*
  var accepts = parseAccept(accept === undefined ? '*/*' : accept || '');

  if (!provided) {
    // sorted list of all types
    return accepts
      .filter(isQuality)
      .sort(compareSpecs)
      .map(getFullType);
  }

  var priorities = provided.map(function getPriority(type, index) {
    return getMediaTypePriority(type, accepts, index);
  });

  // sorted list of accepted types
  return priorities.filter(isQuality).sort(compareSpecs).map(function getType(priority) {
    return provided[priorities.indexOf(priority)];
  });
}

/**
 * Compare two specs.
 * @private
 */

function compareSpecs(a, b) {
  return (b.q - a.q) || (b.s - a.s) || (a.o - b.o) || (a.i - b.i) || 0;
}

/**
 * Get full type string.
 * @private
 */

function getFullType(spec) {
  return spec.type + '/' + spec.subtype;
}

/**
 * Check if a spec has any quality.
 * @private
 */

function isQuality(spec) {
  return spec.q > 0;
}

/**
 * Count the number of quotes in a string.
 * @private
 */

function quoteCount(string) {
  var count = 0;
  var index = 0;

  while ((index = string.indexOf('"', index)) !== -1) {
    count++;
    index++;
  }

  return count;
}

/**
 * Split a key value pair.
 * @private
 */

function splitKeyValuePair(str) {
  var index = str.indexOf('=');
  var key;
  var val;

  if (index === -1) {
    key = str;
  } else {
    key = str.substr(0, index);
    val = str.substr(index + 1);
  }

  return [key, val];
}

/**
 * Split an Accept header into media types.
 * @private
 */

function splitMediaTypes(accept) {
  var accepts = accept.split(',');

  for (var i = 1, j = 0; i < accepts.length; i++) {
    if (quoteCount(accepts[j]) % 2 == 0) {
      accepts[++j] = accepts[i];
    } else {
      accepts[j] += ',' + accepts[i];
    }
  }

  // trim accepts
  accepts.length = j + 1;

  return accepts;
}

/**
 * Split a string of parameters.
 * @private
 */

function splitParameters(str) {
  var parameters = str.split(';');

  for (var i = 1, j = 0; i < parameters.length; i++) {
    if (quoteCount(parameters[j]) % 2 == 0) {
      parameters[++j] = parameters[i];
    } else {
      parameters[j] += ';' + parameters[i];
    }
  }

  // trim parameters
  parameters.length = j + 1;

  for (var i = 0; i < parameters.length; i++) {
    parameters[i] = parameters[i].trim();
  }

  return parameters;
}

/*!
 * negotiator
 * Copyright(c) 2012 Federico Romero
 * Copyright(c) 2012-2014 Isaac Z. Schlueter
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

var preferredCharsets = charset.exports;
var preferredEncodings = encoding.exports;
var preferredLanguages = language.exports;
var preferredMediaTypes = mediaType.exports;

/**
 * Module exports.
 * @public
 */

negotiator.exports = Negotiator$1;
negotiator.exports.Negotiator = Negotiator$1;

/**
 * Create a Negotiator instance from a request.
 * @param {object} request
 * @public
 */

function Negotiator$1(request) {
  if (!(this instanceof Negotiator$1)) {
    return new Negotiator$1(request);
  }

  this.request = request;
}

Negotiator$1.prototype.charset = function charset(available) {
  var set = this.charsets(available);
  return set && set[0];
};

Negotiator$1.prototype.charsets = function charsets(available) {
  return preferredCharsets(this.request.headers['accept-charset'], available);
};

Negotiator$1.prototype.encoding = function encoding(available) {
  var set = this.encodings(available);
  return set && set[0];
};

Negotiator$1.prototype.encodings = function encodings(available) {
  return preferredEncodings(this.request.headers['accept-encoding'], available);
};

Negotiator$1.prototype.language = function language(available) {
  var set = this.languages(available);
  return set && set[0];
};

Negotiator$1.prototype.languages = function languages(available) {
  return preferredLanguages(this.request.headers['accept-language'], available);
};

Negotiator$1.prototype.mediaType = function mediaType(available) {
  var set = this.mediaTypes(available);
  return set && set[0];
};

Negotiator$1.prototype.mediaTypes = function mediaTypes(available) {
  return preferredMediaTypes(this.request.headers.accept, available);
};

// Backwards compatibility
Negotiator$1.prototype.preferredCharset = Negotiator$1.prototype.charset;
Negotiator$1.prototype.preferredCharsets = Negotiator$1.prototype.charsets;
Negotiator$1.prototype.preferredEncoding = Negotiator$1.prototype.encoding;
Negotiator$1.prototype.preferredEncodings = Negotiator$1.prototype.encodings;
Negotiator$1.prototype.preferredLanguage = Negotiator$1.prototype.language;
Negotiator$1.prototype.preferredLanguages = Negotiator$1.prototype.languages;
Negotiator$1.prototype.preferredMediaType = Negotiator$1.prototype.mediaType;
Negotiator$1.prototype.preferredMediaTypes = Negotiator$1.prototype.mediaTypes;

var mimeTypes = {};

var mimeDb = {exports: {}};

var require$$0 = {
	"application/1d-interleaved-parityfec": {
	source: "iana"
},
	"application/3gpdash-qoe-report+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/3gpp-ims+xml": {
	source: "iana",
	compressible: true
},
	"application/3gpphal+json": {
	source: "iana",
	compressible: true
},
	"application/3gpphalforms+json": {
	source: "iana",
	compressible: true
},
	"application/a2l": {
	source: "iana"
},
	"application/ace+cbor": {
	source: "iana"
},
	"application/activemessage": {
	source: "iana"
},
	"application/activity+json": {
	source: "iana",
	compressible: true
},
	"application/alto-costmap+json": {
	source: "iana",
	compressible: true
},
	"application/alto-costmapfilter+json": {
	source: "iana",
	compressible: true
},
	"application/alto-directory+json": {
	source: "iana",
	compressible: true
},
	"application/alto-endpointcost+json": {
	source: "iana",
	compressible: true
},
	"application/alto-endpointcostparams+json": {
	source: "iana",
	compressible: true
},
	"application/alto-endpointprop+json": {
	source: "iana",
	compressible: true
},
	"application/alto-endpointpropparams+json": {
	source: "iana",
	compressible: true
},
	"application/alto-error+json": {
	source: "iana",
	compressible: true
},
	"application/alto-networkmap+json": {
	source: "iana",
	compressible: true
},
	"application/alto-networkmapfilter+json": {
	source: "iana",
	compressible: true
},
	"application/alto-updatestreamcontrol+json": {
	source: "iana",
	compressible: true
},
	"application/alto-updatestreamparams+json": {
	source: "iana",
	compressible: true
},
	"application/aml": {
	source: "iana"
},
	"application/andrew-inset": {
	source: "iana",
	extensions: [
		"ez"
	]
},
	"application/applefile": {
	source: "iana"
},
	"application/applixware": {
	source: "apache",
	extensions: [
		"aw"
	]
},
	"application/at+jwt": {
	source: "iana"
},
	"application/atf": {
	source: "iana"
},
	"application/atfx": {
	source: "iana"
},
	"application/atom+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"atom"
	]
},
	"application/atomcat+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"atomcat"
	]
},
	"application/atomdeleted+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"atomdeleted"
	]
},
	"application/atomicmail": {
	source: "iana"
},
	"application/atomsvc+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"atomsvc"
	]
},
	"application/atsc-dwd+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"dwd"
	]
},
	"application/atsc-dynamic-event-message": {
	source: "iana"
},
	"application/atsc-held+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"held"
	]
},
	"application/atsc-rdt+json": {
	source: "iana",
	compressible: true
},
	"application/atsc-rsat+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rsat"
	]
},
	"application/atxml": {
	source: "iana"
},
	"application/auth-policy+xml": {
	source: "iana",
	compressible: true
},
	"application/bacnet-xdd+zip": {
	source: "iana",
	compressible: false
},
	"application/batch-smtp": {
	source: "iana"
},
	"application/bdoc": {
	compressible: false,
	extensions: [
		"bdoc"
	]
},
	"application/beep+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/calendar+json": {
	source: "iana",
	compressible: true
},
	"application/calendar+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xcs"
	]
},
	"application/call-completion": {
	source: "iana"
},
	"application/cals-1840": {
	source: "iana"
},
	"application/captive+json": {
	source: "iana",
	compressible: true
},
	"application/cbor": {
	source: "iana"
},
	"application/cbor-seq": {
	source: "iana"
},
	"application/cccex": {
	source: "iana"
},
	"application/ccmp+xml": {
	source: "iana",
	compressible: true
},
	"application/ccxml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"ccxml"
	]
},
	"application/cdfx+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"cdfx"
	]
},
	"application/cdmi-capability": {
	source: "iana",
	extensions: [
		"cdmia"
	]
},
	"application/cdmi-container": {
	source: "iana",
	extensions: [
		"cdmic"
	]
},
	"application/cdmi-domain": {
	source: "iana",
	extensions: [
		"cdmid"
	]
},
	"application/cdmi-object": {
	source: "iana",
	extensions: [
		"cdmio"
	]
},
	"application/cdmi-queue": {
	source: "iana",
	extensions: [
		"cdmiq"
	]
},
	"application/cdni": {
	source: "iana"
},
	"application/cea": {
	source: "iana"
},
	"application/cea-2018+xml": {
	source: "iana",
	compressible: true
},
	"application/cellml+xml": {
	source: "iana",
	compressible: true
},
	"application/cfw": {
	source: "iana"
},
	"application/city+json": {
	source: "iana",
	compressible: true
},
	"application/clr": {
	source: "iana"
},
	"application/clue+xml": {
	source: "iana",
	compressible: true
},
	"application/clue_info+xml": {
	source: "iana",
	compressible: true
},
	"application/cms": {
	source: "iana"
},
	"application/cnrp+xml": {
	source: "iana",
	compressible: true
},
	"application/coap-group+json": {
	source: "iana",
	compressible: true
},
	"application/coap-payload": {
	source: "iana"
},
	"application/commonground": {
	source: "iana"
},
	"application/conference-info+xml": {
	source: "iana",
	compressible: true
},
	"application/cose": {
	source: "iana"
},
	"application/cose-key": {
	source: "iana"
},
	"application/cose-key-set": {
	source: "iana"
},
	"application/cpl+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"cpl"
	]
},
	"application/csrattrs": {
	source: "iana"
},
	"application/csta+xml": {
	source: "iana",
	compressible: true
},
	"application/cstadata+xml": {
	source: "iana",
	compressible: true
},
	"application/csvm+json": {
	source: "iana",
	compressible: true
},
	"application/cu-seeme": {
	source: "apache",
	extensions: [
		"cu"
	]
},
	"application/cwt": {
	source: "iana"
},
	"application/cybercash": {
	source: "iana"
},
	"application/dart": {
	compressible: true
},
	"application/dash+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mpd"
	]
},
	"application/dash-patch+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mpp"
	]
},
	"application/dashdelta": {
	source: "iana"
},
	"application/davmount+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"davmount"
	]
},
	"application/dca-rft": {
	source: "iana"
},
	"application/dcd": {
	source: "iana"
},
	"application/dec-dx": {
	source: "iana"
},
	"application/dialog-info+xml": {
	source: "iana",
	compressible: true
},
	"application/dicom": {
	source: "iana"
},
	"application/dicom+json": {
	source: "iana",
	compressible: true
},
	"application/dicom+xml": {
	source: "iana",
	compressible: true
},
	"application/dii": {
	source: "iana"
},
	"application/dit": {
	source: "iana"
},
	"application/dns": {
	source: "iana"
},
	"application/dns+json": {
	source: "iana",
	compressible: true
},
	"application/dns-message": {
	source: "iana"
},
	"application/docbook+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"dbk"
	]
},
	"application/dots+cbor": {
	source: "iana"
},
	"application/dskpp+xml": {
	source: "iana",
	compressible: true
},
	"application/dssc+der": {
	source: "iana",
	extensions: [
		"dssc"
	]
},
	"application/dssc+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xdssc"
	]
},
	"application/dvcs": {
	source: "iana"
},
	"application/ecmascript": {
	source: "iana",
	compressible: true,
	extensions: [
		"es",
		"ecma"
	]
},
	"application/edi-consent": {
	source: "iana"
},
	"application/edi-x12": {
	source: "iana",
	compressible: false
},
	"application/edifact": {
	source: "iana",
	compressible: false
},
	"application/efi": {
	source: "iana"
},
	"application/elm+json": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/elm+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.cap+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/emergencycalldata.comment+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.control+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.deviceinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.ecall.msd": {
	source: "iana"
},
	"application/emergencycalldata.providerinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.serviceinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.subscriberinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.veds+xml": {
	source: "iana",
	compressible: true
},
	"application/emma+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"emma"
	]
},
	"application/emotionml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"emotionml"
	]
},
	"application/encaprtp": {
	source: "iana"
},
	"application/epp+xml": {
	source: "iana",
	compressible: true
},
	"application/epub+zip": {
	source: "iana",
	compressible: false,
	extensions: [
		"epub"
	]
},
	"application/eshop": {
	source: "iana"
},
	"application/exi": {
	source: "iana",
	extensions: [
		"exi"
	]
},
	"application/expect-ct-report+json": {
	source: "iana",
	compressible: true
},
	"application/express": {
	source: "iana",
	extensions: [
		"exp"
	]
},
	"application/fastinfoset": {
	source: "iana"
},
	"application/fastsoap": {
	source: "iana"
},
	"application/fdt+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"fdt"
	]
},
	"application/fhir+json": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/fhir+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/fido.trusted-apps+json": {
	compressible: true
},
	"application/fits": {
	source: "iana"
},
	"application/flexfec": {
	source: "iana"
},
	"application/font-sfnt": {
	source: "iana"
},
	"application/font-tdpfr": {
	source: "iana",
	extensions: [
		"pfr"
	]
},
	"application/font-woff": {
	source: "iana",
	compressible: false
},
	"application/framework-attributes+xml": {
	source: "iana",
	compressible: true
},
	"application/geo+json": {
	source: "iana",
	compressible: true,
	extensions: [
		"geojson"
	]
},
	"application/geo+json-seq": {
	source: "iana"
},
	"application/geopackage+sqlite3": {
	source: "iana"
},
	"application/geoxacml+xml": {
	source: "iana",
	compressible: true
},
	"application/gltf-buffer": {
	source: "iana"
},
	"application/gml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"gml"
	]
},
	"application/gpx+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"gpx"
	]
},
	"application/gxf": {
	source: "apache",
	extensions: [
		"gxf"
	]
},
	"application/gzip": {
	source: "iana",
	compressible: false,
	extensions: [
		"gz"
	]
},
	"application/h224": {
	source: "iana"
},
	"application/held+xml": {
	source: "iana",
	compressible: true
},
	"application/hjson": {
	extensions: [
		"hjson"
	]
},
	"application/http": {
	source: "iana"
},
	"application/hyperstudio": {
	source: "iana",
	extensions: [
		"stk"
	]
},
	"application/ibe-key-request+xml": {
	source: "iana",
	compressible: true
},
	"application/ibe-pkg-reply+xml": {
	source: "iana",
	compressible: true
},
	"application/ibe-pp-data": {
	source: "iana"
},
	"application/iges": {
	source: "iana"
},
	"application/im-iscomposing+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/index": {
	source: "iana"
},
	"application/index.cmd": {
	source: "iana"
},
	"application/index.obj": {
	source: "iana"
},
	"application/index.response": {
	source: "iana"
},
	"application/index.vnd": {
	source: "iana"
},
	"application/inkml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"ink",
		"inkml"
	]
},
	"application/iotp": {
	source: "iana"
},
	"application/ipfix": {
	source: "iana",
	extensions: [
		"ipfix"
	]
},
	"application/ipp": {
	source: "iana"
},
	"application/isup": {
	source: "iana"
},
	"application/its+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"its"
	]
},
	"application/java-archive": {
	source: "apache",
	compressible: false,
	extensions: [
		"jar",
		"war",
		"ear"
	]
},
	"application/java-serialized-object": {
	source: "apache",
	compressible: false,
	extensions: [
		"ser"
	]
},
	"application/java-vm": {
	source: "apache",
	compressible: false,
	extensions: [
		"class"
	]
},
	"application/javascript": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"js",
		"mjs"
	]
},
	"application/jf2feed+json": {
	source: "iana",
	compressible: true
},
	"application/jose": {
	source: "iana"
},
	"application/jose+json": {
	source: "iana",
	compressible: true
},
	"application/jrd+json": {
	source: "iana",
	compressible: true
},
	"application/jscalendar+json": {
	source: "iana",
	compressible: true
},
	"application/json": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"json",
		"map"
	]
},
	"application/json-patch+json": {
	source: "iana",
	compressible: true
},
	"application/json-seq": {
	source: "iana"
},
	"application/json5": {
	extensions: [
		"json5"
	]
},
	"application/jsonml+json": {
	source: "apache",
	compressible: true,
	extensions: [
		"jsonml"
	]
},
	"application/jwk+json": {
	source: "iana",
	compressible: true
},
	"application/jwk-set+json": {
	source: "iana",
	compressible: true
},
	"application/jwt": {
	source: "iana"
},
	"application/kpml-request+xml": {
	source: "iana",
	compressible: true
},
	"application/kpml-response+xml": {
	source: "iana",
	compressible: true
},
	"application/ld+json": {
	source: "iana",
	compressible: true,
	extensions: [
		"jsonld"
	]
},
	"application/lgr+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"lgr"
	]
},
	"application/link-format": {
	source: "iana"
},
	"application/load-control+xml": {
	source: "iana",
	compressible: true
},
	"application/lost+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"lostxml"
	]
},
	"application/lostsync+xml": {
	source: "iana",
	compressible: true
},
	"application/lpf+zip": {
	source: "iana",
	compressible: false
},
	"application/lxf": {
	source: "iana"
},
	"application/mac-binhex40": {
	source: "iana",
	extensions: [
		"hqx"
	]
},
	"application/mac-compactpro": {
	source: "apache",
	extensions: [
		"cpt"
	]
},
	"application/macwriteii": {
	source: "iana"
},
	"application/mads+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mads"
	]
},
	"application/manifest+json": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"webmanifest"
	]
},
	"application/marc": {
	source: "iana",
	extensions: [
		"mrc"
	]
},
	"application/marcxml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mrcx"
	]
},
	"application/mathematica": {
	source: "iana",
	extensions: [
		"ma",
		"nb",
		"mb"
	]
},
	"application/mathml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mathml"
	]
},
	"application/mathml-content+xml": {
	source: "iana",
	compressible: true
},
	"application/mathml-presentation+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-associated-procedure-description+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-deregister+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-envelope+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-msk+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-msk-response+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-protection-description+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-reception-report+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-register+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-register-response+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-schedule+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-user-service-description+xml": {
	source: "iana",
	compressible: true
},
	"application/mbox": {
	source: "iana",
	extensions: [
		"mbox"
	]
},
	"application/media-policy-dataset+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mpf"
	]
},
	"application/media_control+xml": {
	source: "iana",
	compressible: true
},
	"application/mediaservercontrol+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mscml"
	]
},
	"application/merge-patch+json": {
	source: "iana",
	compressible: true
},
	"application/metalink+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"metalink"
	]
},
	"application/metalink4+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"meta4"
	]
},
	"application/mets+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mets"
	]
},
	"application/mf4": {
	source: "iana"
},
	"application/mikey": {
	source: "iana"
},
	"application/mipc": {
	source: "iana"
},
	"application/missing-blocks+cbor-seq": {
	source: "iana"
},
	"application/mmt-aei+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"maei"
	]
},
	"application/mmt-usd+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"musd"
	]
},
	"application/mods+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mods"
	]
},
	"application/moss-keys": {
	source: "iana"
},
	"application/moss-signature": {
	source: "iana"
},
	"application/mosskey-data": {
	source: "iana"
},
	"application/mosskey-request": {
	source: "iana"
},
	"application/mp21": {
	source: "iana",
	extensions: [
		"m21",
		"mp21"
	]
},
	"application/mp4": {
	source: "iana",
	extensions: [
		"mp4s",
		"m4p"
	]
},
	"application/mpeg4-generic": {
	source: "iana"
},
	"application/mpeg4-iod": {
	source: "iana"
},
	"application/mpeg4-iod-xmt": {
	source: "iana"
},
	"application/mrb-consumer+xml": {
	source: "iana",
	compressible: true
},
	"application/mrb-publish+xml": {
	source: "iana",
	compressible: true
},
	"application/msc-ivr+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/msc-mixer+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/msword": {
	source: "iana",
	compressible: false,
	extensions: [
		"doc",
		"dot"
	]
},
	"application/mud+json": {
	source: "iana",
	compressible: true
},
	"application/multipart-core": {
	source: "iana"
},
	"application/mxf": {
	source: "iana",
	extensions: [
		"mxf"
	]
},
	"application/n-quads": {
	source: "iana",
	extensions: [
		"nq"
	]
},
	"application/n-triples": {
	source: "iana",
	extensions: [
		"nt"
	]
},
	"application/nasdata": {
	source: "iana"
},
	"application/news-checkgroups": {
	source: "iana",
	charset: "US-ASCII"
},
	"application/news-groupinfo": {
	source: "iana",
	charset: "US-ASCII"
},
	"application/news-transmission": {
	source: "iana"
},
	"application/nlsml+xml": {
	source: "iana",
	compressible: true
},
	"application/node": {
	source: "iana",
	extensions: [
		"cjs"
	]
},
	"application/nss": {
	source: "iana"
},
	"application/oauth-authz-req+jwt": {
	source: "iana"
},
	"application/oblivious-dns-message": {
	source: "iana"
},
	"application/ocsp-request": {
	source: "iana"
},
	"application/ocsp-response": {
	source: "iana"
},
	"application/octet-stream": {
	source: "iana",
	compressible: false,
	extensions: [
		"bin",
		"dms",
		"lrf",
		"mar",
		"so",
		"dist",
		"distz",
		"pkg",
		"bpk",
		"dump",
		"elc",
		"deploy",
		"exe",
		"dll",
		"deb",
		"dmg",
		"iso",
		"img",
		"msi",
		"msp",
		"msm",
		"buffer"
	]
},
	"application/oda": {
	source: "iana",
	extensions: [
		"oda"
	]
},
	"application/odm+xml": {
	source: "iana",
	compressible: true
},
	"application/odx": {
	source: "iana"
},
	"application/oebps-package+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"opf"
	]
},
	"application/ogg": {
	source: "iana",
	compressible: false,
	extensions: [
		"ogx"
	]
},
	"application/omdoc+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"omdoc"
	]
},
	"application/onenote": {
	source: "apache",
	extensions: [
		"onetoc",
		"onetoc2",
		"onetmp",
		"onepkg"
	]
},
	"application/opc-nodeset+xml": {
	source: "iana",
	compressible: true
},
	"application/oscore": {
	source: "iana"
},
	"application/oxps": {
	source: "iana",
	extensions: [
		"oxps"
	]
},
	"application/p21": {
	source: "iana"
},
	"application/p21+zip": {
	source: "iana",
	compressible: false
},
	"application/p2p-overlay+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"relo"
	]
},
	"application/parityfec": {
	source: "iana"
},
	"application/passport": {
	source: "iana"
},
	"application/patch-ops-error+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xer"
	]
},
	"application/pdf": {
	source: "iana",
	compressible: false,
	extensions: [
		"pdf"
	]
},
	"application/pdx": {
	source: "iana"
},
	"application/pem-certificate-chain": {
	source: "iana"
},
	"application/pgp-encrypted": {
	source: "iana",
	compressible: false,
	extensions: [
		"pgp"
	]
},
	"application/pgp-keys": {
	source: "iana",
	extensions: [
		"asc"
	]
},
	"application/pgp-signature": {
	source: "iana",
	extensions: [
		"asc",
		"sig"
	]
},
	"application/pics-rules": {
	source: "apache",
	extensions: [
		"prf"
	]
},
	"application/pidf+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/pidf-diff+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/pkcs10": {
	source: "iana",
	extensions: [
		"p10"
	]
},
	"application/pkcs12": {
	source: "iana"
},
	"application/pkcs7-mime": {
	source: "iana",
	extensions: [
		"p7m",
		"p7c"
	]
},
	"application/pkcs7-signature": {
	source: "iana",
	extensions: [
		"p7s"
	]
},
	"application/pkcs8": {
	source: "iana",
	extensions: [
		"p8"
	]
},
	"application/pkcs8-encrypted": {
	source: "iana"
},
	"application/pkix-attr-cert": {
	source: "iana",
	extensions: [
		"ac"
	]
},
	"application/pkix-cert": {
	source: "iana",
	extensions: [
		"cer"
	]
},
	"application/pkix-crl": {
	source: "iana",
	extensions: [
		"crl"
	]
},
	"application/pkix-pkipath": {
	source: "iana",
	extensions: [
		"pkipath"
	]
},
	"application/pkixcmp": {
	source: "iana",
	extensions: [
		"pki"
	]
},
	"application/pls+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"pls"
	]
},
	"application/poc-settings+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/postscript": {
	source: "iana",
	compressible: true,
	extensions: [
		"ai",
		"eps",
		"ps"
	]
},
	"application/ppsp-tracker+json": {
	source: "iana",
	compressible: true
},
	"application/problem+json": {
	source: "iana",
	compressible: true
},
	"application/problem+xml": {
	source: "iana",
	compressible: true
},
	"application/provenance+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"provx"
	]
},
	"application/prs.alvestrand.titrax-sheet": {
	source: "iana"
},
	"application/prs.cww": {
	source: "iana",
	extensions: [
		"cww"
	]
},
	"application/prs.cyn": {
	source: "iana",
	charset: "7-BIT"
},
	"application/prs.hpub+zip": {
	source: "iana",
	compressible: false
},
	"application/prs.nprend": {
	source: "iana"
},
	"application/prs.plucker": {
	source: "iana"
},
	"application/prs.rdf-xml-crypt": {
	source: "iana"
},
	"application/prs.xsf+xml": {
	source: "iana",
	compressible: true
},
	"application/pskc+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"pskcxml"
	]
},
	"application/pvd+json": {
	source: "iana",
	compressible: true
},
	"application/qsig": {
	source: "iana"
},
	"application/raml+yaml": {
	compressible: true,
	extensions: [
		"raml"
	]
},
	"application/raptorfec": {
	source: "iana"
},
	"application/rdap+json": {
	source: "iana",
	compressible: true
},
	"application/rdf+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rdf",
		"owl"
	]
},
	"application/reginfo+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rif"
	]
},
	"application/relax-ng-compact-syntax": {
	source: "iana",
	extensions: [
		"rnc"
	]
},
	"application/remote-printing": {
	source: "iana"
},
	"application/reputon+json": {
	source: "iana",
	compressible: true
},
	"application/resource-lists+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rl"
	]
},
	"application/resource-lists-diff+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rld"
	]
},
	"application/rfc+xml": {
	source: "iana",
	compressible: true
},
	"application/riscos": {
	source: "iana"
},
	"application/rlmi+xml": {
	source: "iana",
	compressible: true
},
	"application/rls-services+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rs"
	]
},
	"application/route-apd+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rapd"
	]
},
	"application/route-s-tsid+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"sls"
	]
},
	"application/route-usd+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rusd"
	]
},
	"application/rpki-ghostbusters": {
	source: "iana",
	extensions: [
		"gbr"
	]
},
	"application/rpki-manifest": {
	source: "iana",
	extensions: [
		"mft"
	]
},
	"application/rpki-publication": {
	source: "iana"
},
	"application/rpki-roa": {
	source: "iana",
	extensions: [
		"roa"
	]
},
	"application/rpki-updown": {
	source: "iana"
},
	"application/rsd+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"rsd"
	]
},
	"application/rss+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"rss"
	]
},
	"application/rtf": {
	source: "iana",
	compressible: true,
	extensions: [
		"rtf"
	]
},
	"application/rtploopback": {
	source: "iana"
},
	"application/rtx": {
	source: "iana"
},
	"application/samlassertion+xml": {
	source: "iana",
	compressible: true
},
	"application/samlmetadata+xml": {
	source: "iana",
	compressible: true
},
	"application/sarif+json": {
	source: "iana",
	compressible: true
},
	"application/sarif-external-properties+json": {
	source: "iana",
	compressible: true
},
	"application/sbe": {
	source: "iana"
},
	"application/sbml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"sbml"
	]
},
	"application/scaip+xml": {
	source: "iana",
	compressible: true
},
	"application/scim+json": {
	source: "iana",
	compressible: true
},
	"application/scvp-cv-request": {
	source: "iana",
	extensions: [
		"scq"
	]
},
	"application/scvp-cv-response": {
	source: "iana",
	extensions: [
		"scs"
	]
},
	"application/scvp-vp-request": {
	source: "iana",
	extensions: [
		"spq"
	]
},
	"application/scvp-vp-response": {
	source: "iana",
	extensions: [
		"spp"
	]
},
	"application/sdp": {
	source: "iana",
	extensions: [
		"sdp"
	]
},
	"application/secevent+jwt": {
	source: "iana"
},
	"application/senml+cbor": {
	source: "iana"
},
	"application/senml+json": {
	source: "iana",
	compressible: true
},
	"application/senml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"senmlx"
	]
},
	"application/senml-etch+cbor": {
	source: "iana"
},
	"application/senml-etch+json": {
	source: "iana",
	compressible: true
},
	"application/senml-exi": {
	source: "iana"
},
	"application/sensml+cbor": {
	source: "iana"
},
	"application/sensml+json": {
	source: "iana",
	compressible: true
},
	"application/sensml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"sensmlx"
	]
},
	"application/sensml-exi": {
	source: "iana"
},
	"application/sep+xml": {
	source: "iana",
	compressible: true
},
	"application/sep-exi": {
	source: "iana"
},
	"application/session-info": {
	source: "iana"
},
	"application/set-payment": {
	source: "iana"
},
	"application/set-payment-initiation": {
	source: "iana",
	extensions: [
		"setpay"
	]
},
	"application/set-registration": {
	source: "iana"
},
	"application/set-registration-initiation": {
	source: "iana",
	extensions: [
		"setreg"
	]
},
	"application/sgml": {
	source: "iana"
},
	"application/sgml-open-catalog": {
	source: "iana"
},
	"application/shf+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"shf"
	]
},
	"application/sieve": {
	source: "iana",
	extensions: [
		"siv",
		"sieve"
	]
},
	"application/simple-filter+xml": {
	source: "iana",
	compressible: true
},
	"application/simple-message-summary": {
	source: "iana"
},
	"application/simplesymbolcontainer": {
	source: "iana"
},
	"application/sipc": {
	source: "iana"
},
	"application/slate": {
	source: "iana"
},
	"application/smil": {
	source: "iana"
},
	"application/smil+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"smi",
		"smil"
	]
},
	"application/smpte336m": {
	source: "iana"
},
	"application/soap+fastinfoset": {
	source: "iana"
},
	"application/soap+xml": {
	source: "iana",
	compressible: true
},
	"application/sparql-query": {
	source: "iana",
	extensions: [
		"rq"
	]
},
	"application/sparql-results+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"srx"
	]
},
	"application/spdx+json": {
	source: "iana",
	compressible: true
},
	"application/spirits-event+xml": {
	source: "iana",
	compressible: true
},
	"application/sql": {
	source: "iana"
},
	"application/srgs": {
	source: "iana",
	extensions: [
		"gram"
	]
},
	"application/srgs+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"grxml"
	]
},
	"application/sru+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"sru"
	]
},
	"application/ssdl+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"ssdl"
	]
},
	"application/ssml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"ssml"
	]
},
	"application/stix+json": {
	source: "iana",
	compressible: true
},
	"application/swid+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"swidtag"
	]
},
	"application/tamp-apex-update": {
	source: "iana"
},
	"application/tamp-apex-update-confirm": {
	source: "iana"
},
	"application/tamp-community-update": {
	source: "iana"
},
	"application/tamp-community-update-confirm": {
	source: "iana"
},
	"application/tamp-error": {
	source: "iana"
},
	"application/tamp-sequence-adjust": {
	source: "iana"
},
	"application/tamp-sequence-adjust-confirm": {
	source: "iana"
},
	"application/tamp-status-query": {
	source: "iana"
},
	"application/tamp-status-response": {
	source: "iana"
},
	"application/tamp-update": {
	source: "iana"
},
	"application/tamp-update-confirm": {
	source: "iana"
},
	"application/tar": {
	compressible: true
},
	"application/taxii+json": {
	source: "iana",
	compressible: true
},
	"application/td+json": {
	source: "iana",
	compressible: true
},
	"application/tei+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"tei",
		"teicorpus"
	]
},
	"application/tetra_isi": {
	source: "iana"
},
	"application/thraud+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"tfi"
	]
},
	"application/timestamp-query": {
	source: "iana"
},
	"application/timestamp-reply": {
	source: "iana"
},
	"application/timestamped-data": {
	source: "iana",
	extensions: [
		"tsd"
	]
},
	"application/tlsrpt+gzip": {
	source: "iana"
},
	"application/tlsrpt+json": {
	source: "iana",
	compressible: true
},
	"application/tnauthlist": {
	source: "iana"
},
	"application/token-introspection+jwt": {
	source: "iana"
},
	"application/toml": {
	compressible: true,
	extensions: [
		"toml"
	]
},
	"application/trickle-ice-sdpfrag": {
	source: "iana"
},
	"application/trig": {
	source: "iana",
	extensions: [
		"trig"
	]
},
	"application/ttml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"ttml"
	]
},
	"application/tve-trigger": {
	source: "iana"
},
	"application/tzif": {
	source: "iana"
},
	"application/tzif-leap": {
	source: "iana"
},
	"application/ubjson": {
	compressible: false,
	extensions: [
		"ubj"
	]
},
	"application/ulpfec": {
	source: "iana"
},
	"application/urc-grpsheet+xml": {
	source: "iana",
	compressible: true
},
	"application/urc-ressheet+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rsheet"
	]
},
	"application/urc-targetdesc+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"td"
	]
},
	"application/urc-uisocketdesc+xml": {
	source: "iana",
	compressible: true
},
	"application/vcard+json": {
	source: "iana",
	compressible: true
},
	"application/vcard+xml": {
	source: "iana",
	compressible: true
},
	"application/vemmi": {
	source: "iana"
},
	"application/vividence.scriptfile": {
	source: "apache"
},
	"application/vnd.1000minds.decision-model+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"1km"
	]
},
	"application/vnd.3gpp-prose+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp-prose-pc3ch+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp-v2x-local-service-information": {
	source: "iana"
},
	"application/vnd.3gpp.5gnas": {
	source: "iana"
},
	"application/vnd.3gpp.access-transfer-events+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.bsf+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.gmop+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.gtpc": {
	source: "iana"
},
	"application/vnd.3gpp.interworking-data": {
	source: "iana"
},
	"application/vnd.3gpp.lpp": {
	source: "iana"
},
	"application/vnd.3gpp.mc-signalling-ear": {
	source: "iana"
},
	"application/vnd.3gpp.mcdata-affiliation-command+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcdata-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcdata-payload": {
	source: "iana"
},
	"application/vnd.3gpp.mcdata-service-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcdata-signalling": {
	source: "iana"
},
	"application/vnd.3gpp.mcdata-ue-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcdata-user-profile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-affiliation-command+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-floor-request+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-location-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-service-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-signed+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-ue-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-ue-init-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-user-profile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-affiliation-command+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-affiliation-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-location-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-service-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-transmission-request+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-ue-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-user-profile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mid-call+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.ngap": {
	source: "iana"
},
	"application/vnd.3gpp.pfcp": {
	source: "iana"
},
	"application/vnd.3gpp.pic-bw-large": {
	source: "iana",
	extensions: [
		"plb"
	]
},
	"application/vnd.3gpp.pic-bw-small": {
	source: "iana",
	extensions: [
		"psb"
	]
},
	"application/vnd.3gpp.pic-bw-var": {
	source: "iana",
	extensions: [
		"pvb"
	]
},
	"application/vnd.3gpp.s1ap": {
	source: "iana"
},
	"application/vnd.3gpp.sms": {
	source: "iana"
},
	"application/vnd.3gpp.sms+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.srvcc-ext+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.srvcc-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.state-and-event-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.ussd+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp2.bcmcsinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp2.sms": {
	source: "iana"
},
	"application/vnd.3gpp2.tcap": {
	source: "iana",
	extensions: [
		"tcap"
	]
},
	"application/vnd.3lightssoftware.imagescal": {
	source: "iana"
},
	"application/vnd.3m.post-it-notes": {
	source: "iana",
	extensions: [
		"pwn"
	]
},
	"application/vnd.accpac.simply.aso": {
	source: "iana",
	extensions: [
		"aso"
	]
},
	"application/vnd.accpac.simply.imp": {
	source: "iana",
	extensions: [
		"imp"
	]
},
	"application/vnd.acucobol": {
	source: "iana",
	extensions: [
		"acu"
	]
},
	"application/vnd.acucorp": {
	source: "iana",
	extensions: [
		"atc",
		"acutc"
	]
},
	"application/vnd.adobe.air-application-installer-package+zip": {
	source: "apache",
	compressible: false,
	extensions: [
		"air"
	]
},
	"application/vnd.adobe.flash.movie": {
	source: "iana"
},
	"application/vnd.adobe.formscentral.fcdt": {
	source: "iana",
	extensions: [
		"fcdt"
	]
},
	"application/vnd.adobe.fxp": {
	source: "iana",
	extensions: [
		"fxp",
		"fxpl"
	]
},
	"application/vnd.adobe.partial-upload": {
	source: "iana"
},
	"application/vnd.adobe.xdp+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xdp"
	]
},
	"application/vnd.adobe.xfdf": {
	source: "iana",
	extensions: [
		"xfdf"
	]
},
	"application/vnd.aether.imp": {
	source: "iana"
},
	"application/vnd.afpc.afplinedata": {
	source: "iana"
},
	"application/vnd.afpc.afplinedata-pagedef": {
	source: "iana"
},
	"application/vnd.afpc.cmoca-cmresource": {
	source: "iana"
},
	"application/vnd.afpc.foca-charset": {
	source: "iana"
},
	"application/vnd.afpc.foca-codedfont": {
	source: "iana"
},
	"application/vnd.afpc.foca-codepage": {
	source: "iana"
},
	"application/vnd.afpc.modca": {
	source: "iana"
},
	"application/vnd.afpc.modca-cmtable": {
	source: "iana"
},
	"application/vnd.afpc.modca-formdef": {
	source: "iana"
},
	"application/vnd.afpc.modca-mediummap": {
	source: "iana"
},
	"application/vnd.afpc.modca-objectcontainer": {
	source: "iana"
},
	"application/vnd.afpc.modca-overlay": {
	source: "iana"
},
	"application/vnd.afpc.modca-pagesegment": {
	source: "iana"
},
	"application/vnd.age": {
	source: "iana",
	extensions: [
		"age"
	]
},
	"application/vnd.ah-barcode": {
	source: "iana"
},
	"application/vnd.ahead.space": {
	source: "iana",
	extensions: [
		"ahead"
	]
},
	"application/vnd.airzip.filesecure.azf": {
	source: "iana",
	extensions: [
		"azf"
	]
},
	"application/vnd.airzip.filesecure.azs": {
	source: "iana",
	extensions: [
		"azs"
	]
},
	"application/vnd.amadeus+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.amazon.ebook": {
	source: "apache",
	extensions: [
		"azw"
	]
},
	"application/vnd.amazon.mobi8-ebook": {
	source: "iana"
},
	"application/vnd.americandynamics.acc": {
	source: "iana",
	extensions: [
		"acc"
	]
},
	"application/vnd.amiga.ami": {
	source: "iana",
	extensions: [
		"ami"
	]
},
	"application/vnd.amundsen.maze+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.android.ota": {
	source: "iana"
},
	"application/vnd.android.package-archive": {
	source: "apache",
	compressible: false,
	extensions: [
		"apk"
	]
},
	"application/vnd.anki": {
	source: "iana"
},
	"application/vnd.anser-web-certificate-issue-initiation": {
	source: "iana",
	extensions: [
		"cii"
	]
},
	"application/vnd.anser-web-funds-transfer-initiation": {
	source: "apache",
	extensions: [
		"fti"
	]
},
	"application/vnd.antix.game-component": {
	source: "iana",
	extensions: [
		"atx"
	]
},
	"application/vnd.apache.arrow.file": {
	source: "iana"
},
	"application/vnd.apache.arrow.stream": {
	source: "iana"
},
	"application/vnd.apache.thrift.binary": {
	source: "iana"
},
	"application/vnd.apache.thrift.compact": {
	source: "iana"
},
	"application/vnd.apache.thrift.json": {
	source: "iana"
},
	"application/vnd.api+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.aplextor.warrp+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.apothekende.reservation+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.apple.installer+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mpkg"
	]
},
	"application/vnd.apple.keynote": {
	source: "iana",
	extensions: [
		"key"
	]
},
	"application/vnd.apple.mpegurl": {
	source: "iana",
	extensions: [
		"m3u8"
	]
},
	"application/vnd.apple.numbers": {
	source: "iana",
	extensions: [
		"numbers"
	]
},
	"application/vnd.apple.pages": {
	source: "iana",
	extensions: [
		"pages"
	]
},
	"application/vnd.apple.pkpass": {
	compressible: false,
	extensions: [
		"pkpass"
	]
},
	"application/vnd.arastra.swi": {
	source: "iana"
},
	"application/vnd.aristanetworks.swi": {
	source: "iana",
	extensions: [
		"swi"
	]
},
	"application/vnd.artisan+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.artsquare": {
	source: "iana"
},
	"application/vnd.astraea-software.iota": {
	source: "iana",
	extensions: [
		"iota"
	]
},
	"application/vnd.audiograph": {
	source: "iana",
	extensions: [
		"aep"
	]
},
	"application/vnd.autopackage": {
	source: "iana"
},
	"application/vnd.avalon+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.avistar+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.balsamiq.bmml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"bmml"
	]
},
	"application/vnd.balsamiq.bmpr": {
	source: "iana"
},
	"application/vnd.banana-accounting": {
	source: "iana"
},
	"application/vnd.bbf.usp.error": {
	source: "iana"
},
	"application/vnd.bbf.usp.msg": {
	source: "iana"
},
	"application/vnd.bbf.usp.msg+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.bekitzur-stech+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.bint.med-content": {
	source: "iana"
},
	"application/vnd.biopax.rdf+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.blink-idb-value-wrapper": {
	source: "iana"
},
	"application/vnd.blueice.multipass": {
	source: "iana",
	extensions: [
		"mpm"
	]
},
	"application/vnd.bluetooth.ep.oob": {
	source: "iana"
},
	"application/vnd.bluetooth.le.oob": {
	source: "iana"
},
	"application/vnd.bmi": {
	source: "iana",
	extensions: [
		"bmi"
	]
},
	"application/vnd.bpf": {
	source: "iana"
},
	"application/vnd.bpf3": {
	source: "iana"
},
	"application/vnd.businessobjects": {
	source: "iana",
	extensions: [
		"rep"
	]
},
	"application/vnd.byu.uapi+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.cab-jscript": {
	source: "iana"
},
	"application/vnd.canon-cpdl": {
	source: "iana"
},
	"application/vnd.canon-lips": {
	source: "iana"
},
	"application/vnd.capasystems-pg+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.cendio.thinlinc.clientconf": {
	source: "iana"
},
	"application/vnd.century-systems.tcp_stream": {
	source: "iana"
},
	"application/vnd.chemdraw+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"cdxml"
	]
},
	"application/vnd.chess-pgn": {
	source: "iana"
},
	"application/vnd.chipnuts.karaoke-mmd": {
	source: "iana",
	extensions: [
		"mmd"
	]
},
	"application/vnd.ciedi": {
	source: "iana"
},
	"application/vnd.cinderella": {
	source: "iana",
	extensions: [
		"cdy"
	]
},
	"application/vnd.cirpack.isdn-ext": {
	source: "iana"
},
	"application/vnd.citationstyles.style+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"csl"
	]
},
	"application/vnd.claymore": {
	source: "iana",
	extensions: [
		"cla"
	]
},
	"application/vnd.cloanto.rp9": {
	source: "iana",
	extensions: [
		"rp9"
	]
},
	"application/vnd.clonk.c4group": {
	source: "iana",
	extensions: [
		"c4g",
		"c4d",
		"c4f",
		"c4p",
		"c4u"
	]
},
	"application/vnd.cluetrust.cartomobile-config": {
	source: "iana",
	extensions: [
		"c11amc"
	]
},
	"application/vnd.cluetrust.cartomobile-config-pkg": {
	source: "iana",
	extensions: [
		"c11amz"
	]
},
	"application/vnd.coffeescript": {
	source: "iana"
},
	"application/vnd.collabio.xodocuments.document": {
	source: "iana"
},
	"application/vnd.collabio.xodocuments.document-template": {
	source: "iana"
},
	"application/vnd.collabio.xodocuments.presentation": {
	source: "iana"
},
	"application/vnd.collabio.xodocuments.presentation-template": {
	source: "iana"
},
	"application/vnd.collabio.xodocuments.spreadsheet": {
	source: "iana"
},
	"application/vnd.collabio.xodocuments.spreadsheet-template": {
	source: "iana"
},
	"application/vnd.collection+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.collection.doc+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.collection.next+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.comicbook+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.comicbook-rar": {
	source: "iana"
},
	"application/vnd.commerce-battelle": {
	source: "iana"
},
	"application/vnd.commonspace": {
	source: "iana",
	extensions: [
		"csp"
	]
},
	"application/vnd.contact.cmsg": {
	source: "iana",
	extensions: [
		"cdbcmsg"
	]
},
	"application/vnd.coreos.ignition+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.cosmocaller": {
	source: "iana",
	extensions: [
		"cmc"
	]
},
	"application/vnd.crick.clicker": {
	source: "iana",
	extensions: [
		"clkx"
	]
},
	"application/vnd.crick.clicker.keyboard": {
	source: "iana",
	extensions: [
		"clkk"
	]
},
	"application/vnd.crick.clicker.palette": {
	source: "iana",
	extensions: [
		"clkp"
	]
},
	"application/vnd.crick.clicker.template": {
	source: "iana",
	extensions: [
		"clkt"
	]
},
	"application/vnd.crick.clicker.wordbank": {
	source: "iana",
	extensions: [
		"clkw"
	]
},
	"application/vnd.criticaltools.wbs+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"wbs"
	]
},
	"application/vnd.cryptii.pipe+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.crypto-shade-file": {
	source: "iana"
},
	"application/vnd.cryptomator.encrypted": {
	source: "iana"
},
	"application/vnd.cryptomator.vault": {
	source: "iana"
},
	"application/vnd.ctc-posml": {
	source: "iana",
	extensions: [
		"pml"
	]
},
	"application/vnd.ctct.ws+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.cups-pdf": {
	source: "iana"
},
	"application/vnd.cups-postscript": {
	source: "iana"
},
	"application/vnd.cups-ppd": {
	source: "iana",
	extensions: [
		"ppd"
	]
},
	"application/vnd.cups-raster": {
	source: "iana"
},
	"application/vnd.cups-raw": {
	source: "iana"
},
	"application/vnd.curl": {
	source: "iana"
},
	"application/vnd.curl.car": {
	source: "apache",
	extensions: [
		"car"
	]
},
	"application/vnd.curl.pcurl": {
	source: "apache",
	extensions: [
		"pcurl"
	]
},
	"application/vnd.cyan.dean.root+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.cybank": {
	source: "iana"
},
	"application/vnd.cyclonedx+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.cyclonedx+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.d2l.coursepackage1p0+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.d3m-dataset": {
	source: "iana"
},
	"application/vnd.d3m-problem": {
	source: "iana"
},
	"application/vnd.dart": {
	source: "iana",
	compressible: true,
	extensions: [
		"dart"
	]
},
	"application/vnd.data-vision.rdz": {
	source: "iana",
	extensions: [
		"rdz"
	]
},
	"application/vnd.datapackage+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.dataresource+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.dbf": {
	source: "iana",
	extensions: [
		"dbf"
	]
},
	"application/vnd.debian.binary-package": {
	source: "iana"
},
	"application/vnd.dece.data": {
	source: "iana",
	extensions: [
		"uvf",
		"uvvf",
		"uvd",
		"uvvd"
	]
},
	"application/vnd.dece.ttml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"uvt",
		"uvvt"
	]
},
	"application/vnd.dece.unspecified": {
	source: "iana",
	extensions: [
		"uvx",
		"uvvx"
	]
},
	"application/vnd.dece.zip": {
	source: "iana",
	extensions: [
		"uvz",
		"uvvz"
	]
},
	"application/vnd.denovo.fcselayout-link": {
	source: "iana",
	extensions: [
		"fe_launch"
	]
},
	"application/vnd.desmume.movie": {
	source: "iana"
},
	"application/vnd.dir-bi.plate-dl-nosuffix": {
	source: "iana"
},
	"application/vnd.dm.delegation+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dna": {
	source: "iana",
	extensions: [
		"dna"
	]
},
	"application/vnd.document+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.dolby.mlp": {
	source: "apache",
	extensions: [
		"mlp"
	]
},
	"application/vnd.dolby.mobile.1": {
	source: "iana"
},
	"application/vnd.dolby.mobile.2": {
	source: "iana"
},
	"application/vnd.doremir.scorecloud-binary-document": {
	source: "iana"
},
	"application/vnd.dpgraph": {
	source: "iana",
	extensions: [
		"dpg"
	]
},
	"application/vnd.dreamfactory": {
	source: "iana",
	extensions: [
		"dfac"
	]
},
	"application/vnd.drive+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ds-keypoint": {
	source: "apache",
	extensions: [
		"kpxx"
	]
},
	"application/vnd.dtg.local": {
	source: "iana"
},
	"application/vnd.dtg.local.flash": {
	source: "iana"
},
	"application/vnd.dtg.local.html": {
	source: "iana"
},
	"application/vnd.dvb.ait": {
	source: "iana",
	extensions: [
		"ait"
	]
},
	"application/vnd.dvb.dvbisl+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.dvbj": {
	source: "iana"
},
	"application/vnd.dvb.esgcontainer": {
	source: "iana"
},
	"application/vnd.dvb.ipdcdftnotifaccess": {
	source: "iana"
},
	"application/vnd.dvb.ipdcesgaccess": {
	source: "iana"
},
	"application/vnd.dvb.ipdcesgaccess2": {
	source: "iana"
},
	"application/vnd.dvb.ipdcesgpdd": {
	source: "iana"
},
	"application/vnd.dvb.ipdcroaming": {
	source: "iana"
},
	"application/vnd.dvb.iptv.alfec-base": {
	source: "iana"
},
	"application/vnd.dvb.iptv.alfec-enhancement": {
	source: "iana"
},
	"application/vnd.dvb.notif-aggregate-root+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.notif-container+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.notif-generic+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.notif-ia-msglist+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.notif-ia-registration-request+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.notif-ia-registration-response+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.notif-init+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.pfr": {
	source: "iana"
},
	"application/vnd.dvb.service": {
	source: "iana",
	extensions: [
		"svc"
	]
},
	"application/vnd.dxr": {
	source: "iana"
},
	"application/vnd.dynageo": {
	source: "iana",
	extensions: [
		"geo"
	]
},
	"application/vnd.dzr": {
	source: "iana"
},
	"application/vnd.easykaraoke.cdgdownload": {
	source: "iana"
},
	"application/vnd.ecdis-update": {
	source: "iana"
},
	"application/vnd.ecip.rlp": {
	source: "iana"
},
	"application/vnd.eclipse.ditto+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ecowin.chart": {
	source: "iana",
	extensions: [
		"mag"
	]
},
	"application/vnd.ecowin.filerequest": {
	source: "iana"
},
	"application/vnd.ecowin.fileupdate": {
	source: "iana"
},
	"application/vnd.ecowin.series": {
	source: "iana"
},
	"application/vnd.ecowin.seriesrequest": {
	source: "iana"
},
	"application/vnd.ecowin.seriesupdate": {
	source: "iana"
},
	"application/vnd.efi.img": {
	source: "iana"
},
	"application/vnd.efi.iso": {
	source: "iana"
},
	"application/vnd.emclient.accessrequest+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.enliven": {
	source: "iana",
	extensions: [
		"nml"
	]
},
	"application/vnd.enphase.envoy": {
	source: "iana"
},
	"application/vnd.eprints.data+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.epson.esf": {
	source: "iana",
	extensions: [
		"esf"
	]
},
	"application/vnd.epson.msf": {
	source: "iana",
	extensions: [
		"msf"
	]
},
	"application/vnd.epson.quickanime": {
	source: "iana",
	extensions: [
		"qam"
	]
},
	"application/vnd.epson.salt": {
	source: "iana",
	extensions: [
		"slt"
	]
},
	"application/vnd.epson.ssf": {
	source: "iana",
	extensions: [
		"ssf"
	]
},
	"application/vnd.ericsson.quickcall": {
	source: "iana"
},
	"application/vnd.espass-espass+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.eszigno3+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"es3",
		"et3"
	]
},
	"application/vnd.etsi.aoc+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.asic-e+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.etsi.asic-s+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.etsi.cug+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvcommand+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvdiscovery+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvprofile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvsad-bc+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvsad-cod+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvsad-npvr+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvservice+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvsync+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvueprofile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.mcid+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.mheg5": {
	source: "iana"
},
	"application/vnd.etsi.overload-control-policy-dataset+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.pstn+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.sci+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.simservs+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.timestamp-token": {
	source: "iana"
},
	"application/vnd.etsi.tsl+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.tsl.der": {
	source: "iana"
},
	"application/vnd.eu.kasparian.car+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.eudora.data": {
	source: "iana"
},
	"application/vnd.evolv.ecig.profile": {
	source: "iana"
},
	"application/vnd.evolv.ecig.settings": {
	source: "iana"
},
	"application/vnd.evolv.ecig.theme": {
	source: "iana"
},
	"application/vnd.exstream-empower+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.exstream-package": {
	source: "iana"
},
	"application/vnd.ezpix-album": {
	source: "iana",
	extensions: [
		"ez2"
	]
},
	"application/vnd.ezpix-package": {
	source: "iana",
	extensions: [
		"ez3"
	]
},
	"application/vnd.f-secure.mobile": {
	source: "iana"
},
	"application/vnd.familysearch.gedcom+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.fastcopy-disk-image": {
	source: "iana"
},
	"application/vnd.fdf": {
	source: "iana",
	extensions: [
		"fdf"
	]
},
	"application/vnd.fdsn.mseed": {
	source: "iana",
	extensions: [
		"mseed"
	]
},
	"application/vnd.fdsn.seed": {
	source: "iana",
	extensions: [
		"seed",
		"dataless"
	]
},
	"application/vnd.ffsns": {
	source: "iana"
},
	"application/vnd.ficlab.flb+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.filmit.zfc": {
	source: "iana"
},
	"application/vnd.fints": {
	source: "iana"
},
	"application/vnd.firemonkeys.cloudcell": {
	source: "iana"
},
	"application/vnd.flographit": {
	source: "iana",
	extensions: [
		"gph"
	]
},
	"application/vnd.fluxtime.clip": {
	source: "iana",
	extensions: [
		"ftc"
	]
},
	"application/vnd.font-fontforge-sfd": {
	source: "iana"
},
	"application/vnd.framemaker": {
	source: "iana",
	extensions: [
		"fm",
		"frame",
		"maker",
		"book"
	]
},
	"application/vnd.frogans.fnc": {
	source: "iana",
	extensions: [
		"fnc"
	]
},
	"application/vnd.frogans.ltf": {
	source: "iana",
	extensions: [
		"ltf"
	]
},
	"application/vnd.fsc.weblaunch": {
	source: "iana",
	extensions: [
		"fsc"
	]
},
	"application/vnd.fujifilm.fb.docuworks": {
	source: "iana"
},
	"application/vnd.fujifilm.fb.docuworks.binder": {
	source: "iana"
},
	"application/vnd.fujifilm.fb.docuworks.container": {
	source: "iana"
},
	"application/vnd.fujifilm.fb.jfi+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.fujitsu.oasys": {
	source: "iana",
	extensions: [
		"oas"
	]
},
	"application/vnd.fujitsu.oasys2": {
	source: "iana",
	extensions: [
		"oa2"
	]
},
	"application/vnd.fujitsu.oasys3": {
	source: "iana",
	extensions: [
		"oa3"
	]
},
	"application/vnd.fujitsu.oasysgp": {
	source: "iana",
	extensions: [
		"fg5"
	]
},
	"application/vnd.fujitsu.oasysprs": {
	source: "iana",
	extensions: [
		"bh2"
	]
},
	"application/vnd.fujixerox.art-ex": {
	source: "iana"
},
	"application/vnd.fujixerox.art4": {
	source: "iana"
},
	"application/vnd.fujixerox.ddd": {
	source: "iana",
	extensions: [
		"ddd"
	]
},
	"application/vnd.fujixerox.docuworks": {
	source: "iana",
	extensions: [
		"xdw"
	]
},
	"application/vnd.fujixerox.docuworks.binder": {
	source: "iana",
	extensions: [
		"xbd"
	]
},
	"application/vnd.fujixerox.docuworks.container": {
	source: "iana"
},
	"application/vnd.fujixerox.hbpl": {
	source: "iana"
},
	"application/vnd.fut-misnet": {
	source: "iana"
},
	"application/vnd.futoin+cbor": {
	source: "iana"
},
	"application/vnd.futoin+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.fuzzysheet": {
	source: "iana",
	extensions: [
		"fzs"
	]
},
	"application/vnd.genomatix.tuxedo": {
	source: "iana",
	extensions: [
		"txd"
	]
},
	"application/vnd.gentics.grd+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.geo+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.geocube+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.geogebra.file": {
	source: "iana",
	extensions: [
		"ggb"
	]
},
	"application/vnd.geogebra.slides": {
	source: "iana"
},
	"application/vnd.geogebra.tool": {
	source: "iana",
	extensions: [
		"ggt"
	]
},
	"application/vnd.geometry-explorer": {
	source: "iana",
	extensions: [
		"gex",
		"gre"
	]
},
	"application/vnd.geonext": {
	source: "iana",
	extensions: [
		"gxt"
	]
},
	"application/vnd.geoplan": {
	source: "iana",
	extensions: [
		"g2w"
	]
},
	"application/vnd.geospace": {
	source: "iana",
	extensions: [
		"g3w"
	]
},
	"application/vnd.gerber": {
	source: "iana"
},
	"application/vnd.globalplatform.card-content-mgt": {
	source: "iana"
},
	"application/vnd.globalplatform.card-content-mgt-response": {
	source: "iana"
},
	"application/vnd.gmx": {
	source: "iana",
	extensions: [
		"gmx"
	]
},
	"application/vnd.google-apps.document": {
	compressible: false,
	extensions: [
		"gdoc"
	]
},
	"application/vnd.google-apps.presentation": {
	compressible: false,
	extensions: [
		"gslides"
	]
},
	"application/vnd.google-apps.spreadsheet": {
	compressible: false,
	extensions: [
		"gsheet"
	]
},
	"application/vnd.google-earth.kml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"kml"
	]
},
	"application/vnd.google-earth.kmz": {
	source: "iana",
	compressible: false,
	extensions: [
		"kmz"
	]
},
	"application/vnd.gov.sk.e-form+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.gov.sk.e-form+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.gov.sk.xmldatacontainer+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.grafeq": {
	source: "iana",
	extensions: [
		"gqf",
		"gqs"
	]
},
	"application/vnd.gridmp": {
	source: "iana"
},
	"application/vnd.groove-account": {
	source: "iana",
	extensions: [
		"gac"
	]
},
	"application/vnd.groove-help": {
	source: "iana",
	extensions: [
		"ghf"
	]
},
	"application/vnd.groove-identity-message": {
	source: "iana",
	extensions: [
		"gim"
	]
},
	"application/vnd.groove-injector": {
	source: "iana",
	extensions: [
		"grv"
	]
},
	"application/vnd.groove-tool-message": {
	source: "iana",
	extensions: [
		"gtm"
	]
},
	"application/vnd.groove-tool-template": {
	source: "iana",
	extensions: [
		"tpl"
	]
},
	"application/vnd.groove-vcard": {
	source: "iana",
	extensions: [
		"vcg"
	]
},
	"application/vnd.hal+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.hal+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"hal"
	]
},
	"application/vnd.handheld-entertainment+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"zmm"
	]
},
	"application/vnd.hbci": {
	source: "iana",
	extensions: [
		"hbci"
	]
},
	"application/vnd.hc+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.hcl-bireports": {
	source: "iana"
},
	"application/vnd.hdt": {
	source: "iana"
},
	"application/vnd.heroku+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.hhe.lesson-player": {
	source: "iana",
	extensions: [
		"les"
	]
},
	"application/vnd.hl7cda+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/vnd.hl7v2+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/vnd.hp-hpgl": {
	source: "iana",
	extensions: [
		"hpgl"
	]
},
	"application/vnd.hp-hpid": {
	source: "iana",
	extensions: [
		"hpid"
	]
},
	"application/vnd.hp-hps": {
	source: "iana",
	extensions: [
		"hps"
	]
},
	"application/vnd.hp-jlyt": {
	source: "iana",
	extensions: [
		"jlt"
	]
},
	"application/vnd.hp-pcl": {
	source: "iana",
	extensions: [
		"pcl"
	]
},
	"application/vnd.hp-pclxl": {
	source: "iana",
	extensions: [
		"pclxl"
	]
},
	"application/vnd.httphone": {
	source: "iana"
},
	"application/vnd.hydrostatix.sof-data": {
	source: "iana",
	extensions: [
		"sfd-hdstx"
	]
},
	"application/vnd.hyper+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.hyper-item+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.hyperdrive+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.hzn-3d-crossword": {
	source: "iana"
},
	"application/vnd.ibm.afplinedata": {
	source: "iana"
},
	"application/vnd.ibm.electronic-media": {
	source: "iana"
},
	"application/vnd.ibm.minipay": {
	source: "iana",
	extensions: [
		"mpy"
	]
},
	"application/vnd.ibm.modcap": {
	source: "iana",
	extensions: [
		"afp",
		"listafp",
		"list3820"
	]
},
	"application/vnd.ibm.rights-management": {
	source: "iana",
	extensions: [
		"irm"
	]
},
	"application/vnd.ibm.secure-container": {
	source: "iana",
	extensions: [
		"sc"
	]
},
	"application/vnd.iccprofile": {
	source: "iana",
	extensions: [
		"icc",
		"icm"
	]
},
	"application/vnd.ieee.1905": {
	source: "iana"
},
	"application/vnd.igloader": {
	source: "iana",
	extensions: [
		"igl"
	]
},
	"application/vnd.imagemeter.folder+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.imagemeter.image+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.immervision-ivp": {
	source: "iana",
	extensions: [
		"ivp"
	]
},
	"application/vnd.immervision-ivu": {
	source: "iana",
	extensions: [
		"ivu"
	]
},
	"application/vnd.ims.imsccv1p1": {
	source: "iana"
},
	"application/vnd.ims.imsccv1p2": {
	source: "iana"
},
	"application/vnd.ims.imsccv1p3": {
	source: "iana"
},
	"application/vnd.ims.lis.v2.result+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ims.lti.v2.toolconsumerprofile+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ims.lti.v2.toolproxy+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ims.lti.v2.toolproxy.id+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ims.lti.v2.toolsettings+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ims.lti.v2.toolsettings.simple+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.informedcontrol.rms+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.informix-visionary": {
	source: "iana"
},
	"application/vnd.infotech.project": {
	source: "iana"
},
	"application/vnd.infotech.project+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.innopath.wamp.notification": {
	source: "iana"
},
	"application/vnd.insors.igm": {
	source: "iana",
	extensions: [
		"igm"
	]
},
	"application/vnd.intercon.formnet": {
	source: "iana",
	extensions: [
		"xpw",
		"xpx"
	]
},
	"application/vnd.intergeo": {
	source: "iana",
	extensions: [
		"i2g"
	]
},
	"application/vnd.intertrust.digibox": {
	source: "iana"
},
	"application/vnd.intertrust.nncp": {
	source: "iana"
},
	"application/vnd.intu.qbo": {
	source: "iana",
	extensions: [
		"qbo"
	]
},
	"application/vnd.intu.qfx": {
	source: "iana",
	extensions: [
		"qfx"
	]
},
	"application/vnd.iptc.g2.catalogitem+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.iptc.g2.conceptitem+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.iptc.g2.knowledgeitem+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.iptc.g2.newsitem+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.iptc.g2.newsmessage+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.iptc.g2.packageitem+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.iptc.g2.planningitem+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.ipunplugged.rcprofile": {
	source: "iana",
	extensions: [
		"rcprofile"
	]
},
	"application/vnd.irepository.package+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"irp"
	]
},
	"application/vnd.is-xpr": {
	source: "iana",
	extensions: [
		"xpr"
	]
},
	"application/vnd.isac.fcs": {
	source: "iana",
	extensions: [
		"fcs"
	]
},
	"application/vnd.iso11783-10+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.jam": {
	source: "iana",
	extensions: [
		"jam"
	]
},
	"application/vnd.japannet-directory-service": {
	source: "iana"
},
	"application/vnd.japannet-jpnstore-wakeup": {
	source: "iana"
},
	"application/vnd.japannet-payment-wakeup": {
	source: "iana"
},
	"application/vnd.japannet-registration": {
	source: "iana"
},
	"application/vnd.japannet-registration-wakeup": {
	source: "iana"
},
	"application/vnd.japannet-setstore-wakeup": {
	source: "iana"
},
	"application/vnd.japannet-verification": {
	source: "iana"
},
	"application/vnd.japannet-verification-wakeup": {
	source: "iana"
},
	"application/vnd.jcp.javame.midlet-rms": {
	source: "iana",
	extensions: [
		"rms"
	]
},
	"application/vnd.jisp": {
	source: "iana",
	extensions: [
		"jisp"
	]
},
	"application/vnd.joost.joda-archive": {
	source: "iana",
	extensions: [
		"joda"
	]
},
	"application/vnd.jsk.isdn-ngn": {
	source: "iana"
},
	"application/vnd.kahootz": {
	source: "iana",
	extensions: [
		"ktz",
		"ktr"
	]
},
	"application/vnd.kde.karbon": {
	source: "iana",
	extensions: [
		"karbon"
	]
},
	"application/vnd.kde.kchart": {
	source: "iana",
	extensions: [
		"chrt"
	]
},
	"application/vnd.kde.kformula": {
	source: "iana",
	extensions: [
		"kfo"
	]
},
	"application/vnd.kde.kivio": {
	source: "iana",
	extensions: [
		"flw"
	]
},
	"application/vnd.kde.kontour": {
	source: "iana",
	extensions: [
		"kon"
	]
},
	"application/vnd.kde.kpresenter": {
	source: "iana",
	extensions: [
		"kpr",
		"kpt"
	]
},
	"application/vnd.kde.kspread": {
	source: "iana",
	extensions: [
		"ksp"
	]
},
	"application/vnd.kde.kword": {
	source: "iana",
	extensions: [
		"kwd",
		"kwt"
	]
},
	"application/vnd.kenameaapp": {
	source: "iana",
	extensions: [
		"htke"
	]
},
	"application/vnd.kidspiration": {
	source: "iana",
	extensions: [
		"kia"
	]
},
	"application/vnd.kinar": {
	source: "iana",
	extensions: [
		"kne",
		"knp"
	]
},
	"application/vnd.koan": {
	source: "iana",
	extensions: [
		"skp",
		"skd",
		"skt",
		"skm"
	]
},
	"application/vnd.kodak-descriptor": {
	source: "iana",
	extensions: [
		"sse"
	]
},
	"application/vnd.las": {
	source: "iana"
},
	"application/vnd.las.las+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.las.las+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"lasxml"
	]
},
	"application/vnd.laszip": {
	source: "iana"
},
	"application/vnd.leap+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.liberty-request+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.llamagraphics.life-balance.desktop": {
	source: "iana",
	extensions: [
		"lbd"
	]
},
	"application/vnd.llamagraphics.life-balance.exchange+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"lbe"
	]
},
	"application/vnd.logipipe.circuit+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.loom": {
	source: "iana"
},
	"application/vnd.lotus-1-2-3": {
	source: "iana",
	extensions: [
		"123"
	]
},
	"application/vnd.lotus-approach": {
	source: "iana",
	extensions: [
		"apr"
	]
},
	"application/vnd.lotus-freelance": {
	source: "iana",
	extensions: [
		"pre"
	]
},
	"application/vnd.lotus-notes": {
	source: "iana",
	extensions: [
		"nsf"
	]
},
	"application/vnd.lotus-organizer": {
	source: "iana",
	extensions: [
		"org"
	]
},
	"application/vnd.lotus-screencam": {
	source: "iana",
	extensions: [
		"scm"
	]
},
	"application/vnd.lotus-wordpro": {
	source: "iana",
	extensions: [
		"lwp"
	]
},
	"application/vnd.macports.portpkg": {
	source: "iana",
	extensions: [
		"portpkg"
	]
},
	"application/vnd.mapbox-vector-tile": {
	source: "iana",
	extensions: [
		"mvt"
	]
},
	"application/vnd.marlin.drm.actiontoken+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.marlin.drm.conftoken+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.marlin.drm.license+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.marlin.drm.mdcf": {
	source: "iana"
},
	"application/vnd.mason+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.maxar.archive.3tz+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.maxmind.maxmind-db": {
	source: "iana"
},
	"application/vnd.mcd": {
	source: "iana",
	extensions: [
		"mcd"
	]
},
	"application/vnd.medcalcdata": {
	source: "iana",
	extensions: [
		"mc1"
	]
},
	"application/vnd.mediastation.cdkey": {
	source: "iana",
	extensions: [
		"cdkey"
	]
},
	"application/vnd.meridian-slingshot": {
	source: "iana"
},
	"application/vnd.mfer": {
	source: "iana",
	extensions: [
		"mwf"
	]
},
	"application/vnd.mfmp": {
	source: "iana",
	extensions: [
		"mfm"
	]
},
	"application/vnd.micro+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.micrografx.flo": {
	source: "iana",
	extensions: [
		"flo"
	]
},
	"application/vnd.micrografx.igx": {
	source: "iana",
	extensions: [
		"igx"
	]
},
	"application/vnd.microsoft.portable-executable": {
	source: "iana"
},
	"application/vnd.microsoft.windows.thumbnail-cache": {
	source: "iana"
},
	"application/vnd.miele+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.mif": {
	source: "iana",
	extensions: [
		"mif"
	]
},
	"application/vnd.minisoft-hp3000-save": {
	source: "iana"
},
	"application/vnd.mitsubishi.misty-guard.trustweb": {
	source: "iana"
},
	"application/vnd.mobius.daf": {
	source: "iana",
	extensions: [
		"daf"
	]
},
	"application/vnd.mobius.dis": {
	source: "iana",
	extensions: [
		"dis"
	]
},
	"application/vnd.mobius.mbk": {
	source: "iana",
	extensions: [
		"mbk"
	]
},
	"application/vnd.mobius.mqy": {
	source: "iana",
	extensions: [
		"mqy"
	]
},
	"application/vnd.mobius.msl": {
	source: "iana",
	extensions: [
		"msl"
	]
},
	"application/vnd.mobius.plc": {
	source: "iana",
	extensions: [
		"plc"
	]
},
	"application/vnd.mobius.txf": {
	source: "iana",
	extensions: [
		"txf"
	]
},
	"application/vnd.mophun.application": {
	source: "iana",
	extensions: [
		"mpn"
	]
},
	"application/vnd.mophun.certificate": {
	source: "iana",
	extensions: [
		"mpc"
	]
},
	"application/vnd.motorola.flexsuite": {
	source: "iana"
},
	"application/vnd.motorola.flexsuite.adsi": {
	source: "iana"
},
	"application/vnd.motorola.flexsuite.fis": {
	source: "iana"
},
	"application/vnd.motorola.flexsuite.gotap": {
	source: "iana"
},
	"application/vnd.motorola.flexsuite.kmr": {
	source: "iana"
},
	"application/vnd.motorola.flexsuite.ttc": {
	source: "iana"
},
	"application/vnd.motorola.flexsuite.wem": {
	source: "iana"
},
	"application/vnd.motorola.iprm": {
	source: "iana"
},
	"application/vnd.mozilla.xul+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xul"
	]
},
	"application/vnd.ms-3mfdocument": {
	source: "iana"
},
	"application/vnd.ms-artgalry": {
	source: "iana",
	extensions: [
		"cil"
	]
},
	"application/vnd.ms-asf": {
	source: "iana"
},
	"application/vnd.ms-cab-compressed": {
	source: "iana",
	extensions: [
		"cab"
	]
},
	"application/vnd.ms-color.iccprofile": {
	source: "apache"
},
	"application/vnd.ms-excel": {
	source: "iana",
	compressible: false,
	extensions: [
		"xls",
		"xlm",
		"xla",
		"xlc",
		"xlt",
		"xlw"
	]
},
	"application/vnd.ms-excel.addin.macroenabled.12": {
	source: "iana",
	extensions: [
		"xlam"
	]
},
	"application/vnd.ms-excel.sheet.binary.macroenabled.12": {
	source: "iana",
	extensions: [
		"xlsb"
	]
},
	"application/vnd.ms-excel.sheet.macroenabled.12": {
	source: "iana",
	extensions: [
		"xlsm"
	]
},
	"application/vnd.ms-excel.template.macroenabled.12": {
	source: "iana",
	extensions: [
		"xltm"
	]
},
	"application/vnd.ms-fontobject": {
	source: "iana",
	compressible: true,
	extensions: [
		"eot"
	]
},
	"application/vnd.ms-htmlhelp": {
	source: "iana",
	extensions: [
		"chm"
	]
},
	"application/vnd.ms-ims": {
	source: "iana",
	extensions: [
		"ims"
	]
},
	"application/vnd.ms-lrm": {
	source: "iana",
	extensions: [
		"lrm"
	]
},
	"application/vnd.ms-office.activex+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.ms-officetheme": {
	source: "iana",
	extensions: [
		"thmx"
	]
},
	"application/vnd.ms-opentype": {
	source: "apache",
	compressible: true
},
	"application/vnd.ms-outlook": {
	compressible: false,
	extensions: [
		"msg"
	]
},
	"application/vnd.ms-package.obfuscated-opentype": {
	source: "apache"
},
	"application/vnd.ms-pki.seccat": {
	source: "apache",
	extensions: [
		"cat"
	]
},
	"application/vnd.ms-pki.stl": {
	source: "apache",
	extensions: [
		"stl"
	]
},
	"application/vnd.ms-playready.initiator+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.ms-powerpoint": {
	source: "iana",
	compressible: false,
	extensions: [
		"ppt",
		"pps",
		"pot"
	]
},
	"application/vnd.ms-powerpoint.addin.macroenabled.12": {
	source: "iana",
	extensions: [
		"ppam"
	]
},
	"application/vnd.ms-powerpoint.presentation.macroenabled.12": {
	source: "iana",
	extensions: [
		"pptm"
	]
},
	"application/vnd.ms-powerpoint.slide.macroenabled.12": {
	source: "iana",
	extensions: [
		"sldm"
	]
},
	"application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
	source: "iana",
	extensions: [
		"ppsm"
	]
},
	"application/vnd.ms-powerpoint.template.macroenabled.12": {
	source: "iana",
	extensions: [
		"potm"
	]
},
	"application/vnd.ms-printdevicecapabilities+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.ms-printing.printticket+xml": {
	source: "apache",
	compressible: true
},
	"application/vnd.ms-printschematicket+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.ms-project": {
	source: "iana",
	extensions: [
		"mpp",
		"mpt"
	]
},
	"application/vnd.ms-tnef": {
	source: "iana"
},
	"application/vnd.ms-windows.devicepairing": {
	source: "iana"
},
	"application/vnd.ms-windows.nwprinting.oob": {
	source: "iana"
},
	"application/vnd.ms-windows.printerpairing": {
	source: "iana"
},
	"application/vnd.ms-windows.wsd.oob": {
	source: "iana"
},
	"application/vnd.ms-wmdrm.lic-chlg-req": {
	source: "iana"
},
	"application/vnd.ms-wmdrm.lic-resp": {
	source: "iana"
},
	"application/vnd.ms-wmdrm.meter-chlg-req": {
	source: "iana"
},
	"application/vnd.ms-wmdrm.meter-resp": {
	source: "iana"
},
	"application/vnd.ms-word.document.macroenabled.12": {
	source: "iana",
	extensions: [
		"docm"
	]
},
	"application/vnd.ms-word.template.macroenabled.12": {
	source: "iana",
	extensions: [
		"dotm"
	]
},
	"application/vnd.ms-works": {
	source: "iana",
	extensions: [
		"wps",
		"wks",
		"wcm",
		"wdb"
	]
},
	"application/vnd.ms-wpl": {
	source: "iana",
	extensions: [
		"wpl"
	]
},
	"application/vnd.ms-xpsdocument": {
	source: "iana",
	compressible: false,
	extensions: [
		"xps"
	]
},
	"application/vnd.msa-disk-image": {
	source: "iana"
},
	"application/vnd.mseq": {
	source: "iana",
	extensions: [
		"mseq"
	]
},
	"application/vnd.msign": {
	source: "iana"
},
	"application/vnd.multiad.creator": {
	source: "iana"
},
	"application/vnd.multiad.creator.cif": {
	source: "iana"
},
	"application/vnd.music-niff": {
	source: "iana"
},
	"application/vnd.musician": {
	source: "iana",
	extensions: [
		"mus"
	]
},
	"application/vnd.muvee.style": {
	source: "iana",
	extensions: [
		"msty"
	]
},
	"application/vnd.mynfc": {
	source: "iana",
	extensions: [
		"taglet"
	]
},
	"application/vnd.nacamar.ybrid+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ncd.control": {
	source: "iana"
},
	"application/vnd.ncd.reference": {
	source: "iana"
},
	"application/vnd.nearst.inv+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.nebumind.line": {
	source: "iana"
},
	"application/vnd.nervana": {
	source: "iana"
},
	"application/vnd.netfpx": {
	source: "iana"
},
	"application/vnd.neurolanguage.nlu": {
	source: "iana",
	extensions: [
		"nlu"
	]
},
	"application/vnd.nimn": {
	source: "iana"
},
	"application/vnd.nintendo.nitro.rom": {
	source: "iana"
},
	"application/vnd.nintendo.snes.rom": {
	source: "iana"
},
	"application/vnd.nitf": {
	source: "iana",
	extensions: [
		"ntf",
		"nitf"
	]
},
	"application/vnd.noblenet-directory": {
	source: "iana",
	extensions: [
		"nnd"
	]
},
	"application/vnd.noblenet-sealer": {
	source: "iana",
	extensions: [
		"nns"
	]
},
	"application/vnd.noblenet-web": {
	source: "iana",
	extensions: [
		"nnw"
	]
},
	"application/vnd.nokia.catalogs": {
	source: "iana"
},
	"application/vnd.nokia.conml+wbxml": {
	source: "iana"
},
	"application/vnd.nokia.conml+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.nokia.iptv.config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.nokia.isds-radio-presets": {
	source: "iana"
},
	"application/vnd.nokia.landmark+wbxml": {
	source: "iana"
},
	"application/vnd.nokia.landmark+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.nokia.landmarkcollection+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.nokia.n-gage.ac+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"ac"
	]
},
	"application/vnd.nokia.n-gage.data": {
	source: "iana",
	extensions: [
		"ngdat"
	]
},
	"application/vnd.nokia.n-gage.symbian.install": {
	source: "iana",
	extensions: [
		"n-gage"
	]
},
	"application/vnd.nokia.ncd": {
	source: "iana"
},
	"application/vnd.nokia.pcd+wbxml": {
	source: "iana"
},
	"application/vnd.nokia.pcd+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.nokia.radio-preset": {
	source: "iana",
	extensions: [
		"rpst"
	]
},
	"application/vnd.nokia.radio-presets": {
	source: "iana",
	extensions: [
		"rpss"
	]
},
	"application/vnd.novadigm.edm": {
	source: "iana",
	extensions: [
		"edm"
	]
},
	"application/vnd.novadigm.edx": {
	source: "iana",
	extensions: [
		"edx"
	]
},
	"application/vnd.novadigm.ext": {
	source: "iana",
	extensions: [
		"ext"
	]
},
	"application/vnd.ntt-local.content-share": {
	source: "iana"
},
	"application/vnd.ntt-local.file-transfer": {
	source: "iana"
},
	"application/vnd.ntt-local.ogw_remote-access": {
	source: "iana"
},
	"application/vnd.ntt-local.sip-ta_remote": {
	source: "iana"
},
	"application/vnd.ntt-local.sip-ta_tcp_stream": {
	source: "iana"
},
	"application/vnd.oasis.opendocument.chart": {
	source: "iana",
	extensions: [
		"odc"
	]
},
	"application/vnd.oasis.opendocument.chart-template": {
	source: "iana",
	extensions: [
		"otc"
	]
},
	"application/vnd.oasis.opendocument.database": {
	source: "iana",
	extensions: [
		"odb"
	]
},
	"application/vnd.oasis.opendocument.formula": {
	source: "iana",
	extensions: [
		"odf"
	]
},
	"application/vnd.oasis.opendocument.formula-template": {
	source: "iana",
	extensions: [
		"odft"
	]
},
	"application/vnd.oasis.opendocument.graphics": {
	source: "iana",
	compressible: false,
	extensions: [
		"odg"
	]
},
	"application/vnd.oasis.opendocument.graphics-template": {
	source: "iana",
	extensions: [
		"otg"
	]
},
	"application/vnd.oasis.opendocument.image": {
	source: "iana",
	extensions: [
		"odi"
	]
},
	"application/vnd.oasis.opendocument.image-template": {
	source: "iana",
	extensions: [
		"oti"
	]
},
	"application/vnd.oasis.opendocument.presentation": {
	source: "iana",
	compressible: false,
	extensions: [
		"odp"
	]
},
	"application/vnd.oasis.opendocument.presentation-template": {
	source: "iana",
	extensions: [
		"otp"
	]
},
	"application/vnd.oasis.opendocument.spreadsheet": {
	source: "iana",
	compressible: false,
	extensions: [
		"ods"
	]
},
	"application/vnd.oasis.opendocument.spreadsheet-template": {
	source: "iana",
	extensions: [
		"ots"
	]
},
	"application/vnd.oasis.opendocument.text": {
	source: "iana",
	compressible: false,
	extensions: [
		"odt"
	]
},
	"application/vnd.oasis.opendocument.text-master": {
	source: "iana",
	extensions: [
		"odm"
	]
},
	"application/vnd.oasis.opendocument.text-template": {
	source: "iana",
	extensions: [
		"ott"
	]
},
	"application/vnd.oasis.opendocument.text-web": {
	source: "iana",
	extensions: [
		"oth"
	]
},
	"application/vnd.obn": {
	source: "iana"
},
	"application/vnd.ocf+cbor": {
	source: "iana"
},
	"application/vnd.oci.image.manifest.v1+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.oftn.l10n+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.contentaccessdownload+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.contentaccessstreaming+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.cspg-hexbinary": {
	source: "iana"
},
	"application/vnd.oipf.dae.svg+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.dae.xhtml+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.mippvcontrolmessage+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.pae.gem": {
	source: "iana"
},
	"application/vnd.oipf.spdiscovery+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.spdlist+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.ueprofile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.userprofile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.olpc-sugar": {
	source: "iana",
	extensions: [
		"xo"
	]
},
	"application/vnd.oma-scws-config": {
	source: "iana"
},
	"application/vnd.oma-scws-http-request": {
	source: "iana"
},
	"application/vnd.oma-scws-http-response": {
	source: "iana"
},
	"application/vnd.oma.bcast.associated-procedure-parameter+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.drm-trigger+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.imd+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.ltkm": {
	source: "iana"
},
	"application/vnd.oma.bcast.notification+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.provisioningtrigger": {
	source: "iana"
},
	"application/vnd.oma.bcast.sgboot": {
	source: "iana"
},
	"application/vnd.oma.bcast.sgdd+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.sgdu": {
	source: "iana"
},
	"application/vnd.oma.bcast.simple-symbol-container": {
	source: "iana"
},
	"application/vnd.oma.bcast.smartcard-trigger+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.sprov+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.stkm": {
	source: "iana"
},
	"application/vnd.oma.cab-address-book+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.cab-feature-handler+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.cab-pcc+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.cab-subs-invite+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.cab-user-prefs+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.dcd": {
	source: "iana"
},
	"application/vnd.oma.dcdc": {
	source: "iana"
},
	"application/vnd.oma.dd2+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"dd2"
	]
},
	"application/vnd.oma.drm.risd+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.group-usage-list+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.lwm2m+cbor": {
	source: "iana"
},
	"application/vnd.oma.lwm2m+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.lwm2m+tlv": {
	source: "iana"
},
	"application/vnd.oma.pal+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.poc.detailed-progress-report+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.poc.final-report+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.poc.groups+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.poc.invocation-descriptor+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.poc.optimized-progress-report+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.push": {
	source: "iana"
},
	"application/vnd.oma.scidm.messages+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.xcap-directory+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.omads-email+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/vnd.omads-file+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/vnd.omads-folder+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/vnd.omaloc-supl-init": {
	source: "iana"
},
	"application/vnd.onepager": {
	source: "iana"
},
	"application/vnd.onepagertamp": {
	source: "iana"
},
	"application/vnd.onepagertamx": {
	source: "iana"
},
	"application/vnd.onepagertat": {
	source: "iana"
},
	"application/vnd.onepagertatp": {
	source: "iana"
},
	"application/vnd.onepagertatx": {
	source: "iana"
},
	"application/vnd.openblox.game+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"obgx"
	]
},
	"application/vnd.openblox.game-binary": {
	source: "iana"
},
	"application/vnd.openeye.oeb": {
	source: "iana"
},
	"application/vnd.openofficeorg.extension": {
	source: "apache",
	extensions: [
		"oxt"
	]
},
	"application/vnd.openstreetmap.data+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"osm"
	]
},
	"application/vnd.opentimestamps.ots": {
	source: "iana"
},
	"application/vnd.openxmlformats-officedocument.custom-properties+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawing+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.extended-properties+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.presentation": {
	source: "iana",
	compressible: false,
	extensions: [
		"pptx"
	]
},
	"application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.slide": {
	source: "iana",
	extensions: [
		"sldx"
	]
},
	"application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
	source: "iana",
	extensions: [
		"ppsx"
	]
},
	"application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.template": {
	source: "iana",
	extensions: [
		"potx"
	]
},
	"application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
	source: "iana",
	compressible: false,
	extensions: [
		"xlsx"
	]
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
	source: "iana",
	extensions: [
		"xltx"
	]
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.theme+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.themeoverride+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.vmldrawing": {
	source: "iana"
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
	source: "iana",
	compressible: false,
	extensions: [
		"docx"
	]
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
	source: "iana",
	extensions: [
		"dotx"
	]
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-package.core-properties+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-package.relationships+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oracle.resource+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.orange.indata": {
	source: "iana"
},
	"application/vnd.osa.netdeploy": {
	source: "iana"
},
	"application/vnd.osgeo.mapguide.package": {
	source: "iana",
	extensions: [
		"mgp"
	]
},
	"application/vnd.osgi.bundle": {
	source: "iana"
},
	"application/vnd.osgi.dp": {
	source: "iana",
	extensions: [
		"dp"
	]
},
	"application/vnd.osgi.subsystem": {
	source: "iana",
	extensions: [
		"esa"
	]
},
	"application/vnd.otps.ct-kip+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oxli.countgraph": {
	source: "iana"
},
	"application/vnd.pagerduty+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.palm": {
	source: "iana",
	extensions: [
		"pdb",
		"pqa",
		"oprc"
	]
},
	"application/vnd.panoply": {
	source: "iana"
},
	"application/vnd.paos.xml": {
	source: "iana"
},
	"application/vnd.patentdive": {
	source: "iana"
},
	"application/vnd.patientecommsdoc": {
	source: "iana"
},
	"application/vnd.pawaafile": {
	source: "iana",
	extensions: [
		"paw"
	]
},
	"application/vnd.pcos": {
	source: "iana"
},
	"application/vnd.pg.format": {
	source: "iana",
	extensions: [
		"str"
	]
},
	"application/vnd.pg.osasli": {
	source: "iana",
	extensions: [
		"ei6"
	]
},
	"application/vnd.piaccess.application-licence": {
	source: "iana"
},
	"application/vnd.picsel": {
	source: "iana",
	extensions: [
		"efif"
	]
},
	"application/vnd.pmi.widget": {
	source: "iana",
	extensions: [
		"wg"
	]
},
	"application/vnd.poc.group-advertisement+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.pocketlearn": {
	source: "iana",
	extensions: [
		"plf"
	]
},
	"application/vnd.powerbuilder6": {
	source: "iana",
	extensions: [
		"pbd"
	]
},
	"application/vnd.powerbuilder6-s": {
	source: "iana"
},
	"application/vnd.powerbuilder7": {
	source: "iana"
},
	"application/vnd.powerbuilder7-s": {
	source: "iana"
},
	"application/vnd.powerbuilder75": {
	source: "iana"
},
	"application/vnd.powerbuilder75-s": {
	source: "iana"
},
	"application/vnd.preminet": {
	source: "iana"
},
	"application/vnd.previewsystems.box": {
	source: "iana",
	extensions: [
		"box"
	]
},
	"application/vnd.proteus.magazine": {
	source: "iana",
	extensions: [
		"mgz"
	]
},
	"application/vnd.psfs": {
	source: "iana"
},
	"application/vnd.publishare-delta-tree": {
	source: "iana",
	extensions: [
		"qps"
	]
},
	"application/vnd.pvi.ptid1": {
	source: "iana",
	extensions: [
		"ptid"
	]
},
	"application/vnd.pwg-multiplexed": {
	source: "iana"
},
	"application/vnd.pwg-xhtml-print+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.qualcomm.brew-app-res": {
	source: "iana"
},
	"application/vnd.quarantainenet": {
	source: "iana"
},
	"application/vnd.quark.quarkxpress": {
	source: "iana",
	extensions: [
		"qxd",
		"qxt",
		"qwd",
		"qwt",
		"qxl",
		"qxb"
	]
},
	"application/vnd.quobject-quoxdocument": {
	source: "iana"
},
	"application/vnd.radisys.moml+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-audit+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-audit-conf+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-audit-conn+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-audit-dialog+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-audit-stream+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-conf+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog-base+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog-fax-detect+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog-group+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog-speech+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog-transform+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.rainstor.data": {
	source: "iana"
},
	"application/vnd.rapid": {
	source: "iana"
},
	"application/vnd.rar": {
	source: "iana",
	extensions: [
		"rar"
	]
},
	"application/vnd.realvnc.bed": {
	source: "iana",
	extensions: [
		"bed"
	]
},
	"application/vnd.recordare.musicxml": {
	source: "iana",
	extensions: [
		"mxl"
	]
},
	"application/vnd.recordare.musicxml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"musicxml"
	]
},
	"application/vnd.renlearn.rlprint": {
	source: "iana"
},
	"application/vnd.resilient.logic": {
	source: "iana"
},
	"application/vnd.restful+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.rig.cryptonote": {
	source: "iana",
	extensions: [
		"cryptonote"
	]
},
	"application/vnd.rim.cod": {
	source: "apache",
	extensions: [
		"cod"
	]
},
	"application/vnd.rn-realmedia": {
	source: "apache",
	extensions: [
		"rm"
	]
},
	"application/vnd.rn-realmedia-vbr": {
	source: "apache",
	extensions: [
		"rmvb"
	]
},
	"application/vnd.route66.link66+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"link66"
	]
},
	"application/vnd.rs-274x": {
	source: "iana"
},
	"application/vnd.ruckus.download": {
	source: "iana"
},
	"application/vnd.s3sms": {
	source: "iana"
},
	"application/vnd.sailingtracker.track": {
	source: "iana",
	extensions: [
		"st"
	]
},
	"application/vnd.sar": {
	source: "iana"
},
	"application/vnd.sbm.cid": {
	source: "iana"
},
	"application/vnd.sbm.mid2": {
	source: "iana"
},
	"application/vnd.scribus": {
	source: "iana"
},
	"application/vnd.sealed.3df": {
	source: "iana"
},
	"application/vnd.sealed.csf": {
	source: "iana"
},
	"application/vnd.sealed.doc": {
	source: "iana"
},
	"application/vnd.sealed.eml": {
	source: "iana"
},
	"application/vnd.sealed.mht": {
	source: "iana"
},
	"application/vnd.sealed.net": {
	source: "iana"
},
	"application/vnd.sealed.ppt": {
	source: "iana"
},
	"application/vnd.sealed.tiff": {
	source: "iana"
},
	"application/vnd.sealed.xls": {
	source: "iana"
},
	"application/vnd.sealedmedia.softseal.html": {
	source: "iana"
},
	"application/vnd.sealedmedia.softseal.pdf": {
	source: "iana"
},
	"application/vnd.seemail": {
	source: "iana",
	extensions: [
		"see"
	]
},
	"application/vnd.seis+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.sema": {
	source: "iana",
	extensions: [
		"sema"
	]
},
	"application/vnd.semd": {
	source: "iana",
	extensions: [
		"semd"
	]
},
	"application/vnd.semf": {
	source: "iana",
	extensions: [
		"semf"
	]
},
	"application/vnd.shade-save-file": {
	source: "iana"
},
	"application/vnd.shana.informed.formdata": {
	source: "iana",
	extensions: [
		"ifm"
	]
},
	"application/vnd.shana.informed.formtemplate": {
	source: "iana",
	extensions: [
		"itp"
	]
},
	"application/vnd.shana.informed.interchange": {
	source: "iana",
	extensions: [
		"iif"
	]
},
	"application/vnd.shana.informed.package": {
	source: "iana",
	extensions: [
		"ipk"
	]
},
	"application/vnd.shootproof+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.shopkick+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.shp": {
	source: "iana"
},
	"application/vnd.shx": {
	source: "iana"
},
	"application/vnd.sigrok.session": {
	source: "iana"
},
	"application/vnd.simtech-mindmapper": {
	source: "iana",
	extensions: [
		"twd",
		"twds"
	]
},
	"application/vnd.siren+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.smaf": {
	source: "iana",
	extensions: [
		"mmf"
	]
},
	"application/vnd.smart.notebook": {
	source: "iana"
},
	"application/vnd.smart.teacher": {
	source: "iana",
	extensions: [
		"teacher"
	]
},
	"application/vnd.snesdev-page-table": {
	source: "iana"
},
	"application/vnd.software602.filler.form+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"fo"
	]
},
	"application/vnd.software602.filler.form-xml-zip": {
	source: "iana"
},
	"application/vnd.solent.sdkm+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"sdkm",
		"sdkd"
	]
},
	"application/vnd.spotfire.dxp": {
	source: "iana",
	extensions: [
		"dxp"
	]
},
	"application/vnd.spotfire.sfs": {
	source: "iana",
	extensions: [
		"sfs"
	]
},
	"application/vnd.sqlite3": {
	source: "iana"
},
	"application/vnd.sss-cod": {
	source: "iana"
},
	"application/vnd.sss-dtf": {
	source: "iana"
},
	"application/vnd.sss-ntf": {
	source: "iana"
},
	"application/vnd.stardivision.calc": {
	source: "apache",
	extensions: [
		"sdc"
	]
},
	"application/vnd.stardivision.draw": {
	source: "apache",
	extensions: [
		"sda"
	]
},
	"application/vnd.stardivision.impress": {
	source: "apache",
	extensions: [
		"sdd"
	]
},
	"application/vnd.stardivision.math": {
	source: "apache",
	extensions: [
		"smf"
	]
},
	"application/vnd.stardivision.writer": {
	source: "apache",
	extensions: [
		"sdw",
		"vor"
	]
},
	"application/vnd.stardivision.writer-global": {
	source: "apache",
	extensions: [
		"sgl"
	]
},
	"application/vnd.stepmania.package": {
	source: "iana",
	extensions: [
		"smzip"
	]
},
	"application/vnd.stepmania.stepchart": {
	source: "iana",
	extensions: [
		"sm"
	]
},
	"application/vnd.street-stream": {
	source: "iana"
},
	"application/vnd.sun.wadl+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"wadl"
	]
},
	"application/vnd.sun.xml.calc": {
	source: "apache",
	extensions: [
		"sxc"
	]
},
	"application/vnd.sun.xml.calc.template": {
	source: "apache",
	extensions: [
		"stc"
	]
},
	"application/vnd.sun.xml.draw": {
	source: "apache",
	extensions: [
		"sxd"
	]
},
	"application/vnd.sun.xml.draw.template": {
	source: "apache",
	extensions: [
		"std"
	]
},
	"application/vnd.sun.xml.impress": {
	source: "apache",
	extensions: [
		"sxi"
	]
},
	"application/vnd.sun.xml.impress.template": {
	source: "apache",
	extensions: [
		"sti"
	]
},
	"application/vnd.sun.xml.math": {
	source: "apache",
	extensions: [
		"sxm"
	]
},
	"application/vnd.sun.xml.writer": {
	source: "apache",
	extensions: [
		"sxw"
	]
},
	"application/vnd.sun.xml.writer.global": {
	source: "apache",
	extensions: [
		"sxg"
	]
},
	"application/vnd.sun.xml.writer.template": {
	source: "apache",
	extensions: [
		"stw"
	]
},
	"application/vnd.sus-calendar": {
	source: "iana",
	extensions: [
		"sus",
		"susp"
	]
},
	"application/vnd.svd": {
	source: "iana",
	extensions: [
		"svd"
	]
},
	"application/vnd.swiftview-ics": {
	source: "iana"
},
	"application/vnd.sycle+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.syft+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.symbian.install": {
	source: "apache",
	extensions: [
		"sis",
		"sisx"
	]
},
	"application/vnd.syncml+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"xsm"
	]
},
	"application/vnd.syncml.dm+wbxml": {
	source: "iana",
	charset: "UTF-8",
	extensions: [
		"bdm"
	]
},
	"application/vnd.syncml.dm+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"xdm"
	]
},
	"application/vnd.syncml.dm.notification": {
	source: "iana"
},
	"application/vnd.syncml.dmddf+wbxml": {
	source: "iana"
},
	"application/vnd.syncml.dmddf+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"ddf"
	]
},
	"application/vnd.syncml.dmtnds+wbxml": {
	source: "iana"
},
	"application/vnd.syncml.dmtnds+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/vnd.syncml.ds.notification": {
	source: "iana"
},
	"application/vnd.tableschema+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.tao.intent-module-archive": {
	source: "iana",
	extensions: [
		"tao"
	]
},
	"application/vnd.tcpdump.pcap": {
	source: "iana",
	extensions: [
		"pcap",
		"cap",
		"dmp"
	]
},
	"application/vnd.think-cell.ppttc+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.tmd.mediaflex.api+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.tml": {
	source: "iana"
},
	"application/vnd.tmobile-livetv": {
	source: "iana",
	extensions: [
		"tmo"
	]
},
	"application/vnd.tri.onesource": {
	source: "iana"
},
	"application/vnd.trid.tpt": {
	source: "iana",
	extensions: [
		"tpt"
	]
},
	"application/vnd.triscape.mxs": {
	source: "iana",
	extensions: [
		"mxs"
	]
},
	"application/vnd.trueapp": {
	source: "iana",
	extensions: [
		"tra"
	]
},
	"application/vnd.truedoc": {
	source: "iana"
},
	"application/vnd.ubisoft.webplayer": {
	source: "iana"
},
	"application/vnd.ufdl": {
	source: "iana",
	extensions: [
		"ufd",
		"ufdl"
	]
},
	"application/vnd.uiq.theme": {
	source: "iana",
	extensions: [
		"utz"
	]
},
	"application/vnd.umajin": {
	source: "iana",
	extensions: [
		"umj"
	]
},
	"application/vnd.unity": {
	source: "iana",
	extensions: [
		"unityweb"
	]
},
	"application/vnd.uoml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"uoml"
	]
},
	"application/vnd.uplanet.alert": {
	source: "iana"
},
	"application/vnd.uplanet.alert-wbxml": {
	source: "iana"
},
	"application/vnd.uplanet.bearer-choice": {
	source: "iana"
},
	"application/vnd.uplanet.bearer-choice-wbxml": {
	source: "iana"
},
	"application/vnd.uplanet.cacheop": {
	source: "iana"
},
	"application/vnd.uplanet.cacheop-wbxml": {
	source: "iana"
},
	"application/vnd.uplanet.channel": {
	source: "iana"
},
	"application/vnd.uplanet.channel-wbxml": {
	source: "iana"
},
	"application/vnd.uplanet.list": {
	source: "iana"
},
	"application/vnd.uplanet.list-wbxml": {
	source: "iana"
},
	"application/vnd.uplanet.listcmd": {
	source: "iana"
},
	"application/vnd.uplanet.listcmd-wbxml": {
	source: "iana"
},
	"application/vnd.uplanet.signal": {
	source: "iana"
},
	"application/vnd.uri-map": {
	source: "iana"
},
	"application/vnd.valve.source.material": {
	source: "iana"
},
	"application/vnd.vcx": {
	source: "iana",
	extensions: [
		"vcx"
	]
},
	"application/vnd.vd-study": {
	source: "iana"
},
	"application/vnd.vectorworks": {
	source: "iana"
},
	"application/vnd.vel+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.verimatrix.vcas": {
	source: "iana"
},
	"application/vnd.veritone.aion+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.veryant.thin": {
	source: "iana"
},
	"application/vnd.ves.encrypted": {
	source: "iana"
},
	"application/vnd.vidsoft.vidconference": {
	source: "iana"
},
	"application/vnd.visio": {
	source: "iana",
	extensions: [
		"vsd",
		"vst",
		"vss",
		"vsw"
	]
},
	"application/vnd.visionary": {
	source: "iana",
	extensions: [
		"vis"
	]
},
	"application/vnd.vividence.scriptfile": {
	source: "iana"
},
	"application/vnd.vsf": {
	source: "iana",
	extensions: [
		"vsf"
	]
},
	"application/vnd.wap.sic": {
	source: "iana"
},
	"application/vnd.wap.slc": {
	source: "iana"
},
	"application/vnd.wap.wbxml": {
	source: "iana",
	charset: "UTF-8",
	extensions: [
		"wbxml"
	]
},
	"application/vnd.wap.wmlc": {
	source: "iana",
	extensions: [
		"wmlc"
	]
},
	"application/vnd.wap.wmlscriptc": {
	source: "iana",
	extensions: [
		"wmlsc"
	]
},
	"application/vnd.webturbo": {
	source: "iana",
	extensions: [
		"wtb"
	]
},
	"application/vnd.wfa.dpp": {
	source: "iana"
},
	"application/vnd.wfa.p2p": {
	source: "iana"
},
	"application/vnd.wfa.wsc": {
	source: "iana"
},
	"application/vnd.windows.devicepairing": {
	source: "iana"
},
	"application/vnd.wmc": {
	source: "iana"
},
	"application/vnd.wmf.bootstrap": {
	source: "iana"
},
	"application/vnd.wolfram.mathematica": {
	source: "iana"
},
	"application/vnd.wolfram.mathematica.package": {
	source: "iana"
},
	"application/vnd.wolfram.player": {
	source: "iana",
	extensions: [
		"nbp"
	]
},
	"application/vnd.wordperfect": {
	source: "iana",
	extensions: [
		"wpd"
	]
},
	"application/vnd.wqd": {
	source: "iana",
	extensions: [
		"wqd"
	]
},
	"application/vnd.wrq-hp3000-labelled": {
	source: "iana"
},
	"application/vnd.wt.stf": {
	source: "iana",
	extensions: [
		"stf"
	]
},
	"application/vnd.wv.csp+wbxml": {
	source: "iana"
},
	"application/vnd.wv.csp+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.wv.ssp+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.xacml+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.xara": {
	source: "iana",
	extensions: [
		"xar"
	]
},
	"application/vnd.xfdl": {
	source: "iana",
	extensions: [
		"xfdl"
	]
},
	"application/vnd.xfdl.webform": {
	source: "iana"
},
	"application/vnd.xmi+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.xmpie.cpkg": {
	source: "iana"
},
	"application/vnd.xmpie.dpkg": {
	source: "iana"
},
	"application/vnd.xmpie.plan": {
	source: "iana"
},
	"application/vnd.xmpie.ppkg": {
	source: "iana"
},
	"application/vnd.xmpie.xlim": {
	source: "iana"
},
	"application/vnd.yamaha.hv-dic": {
	source: "iana",
	extensions: [
		"hvd"
	]
},
	"application/vnd.yamaha.hv-script": {
	source: "iana",
	extensions: [
		"hvs"
	]
},
	"application/vnd.yamaha.hv-voice": {
	source: "iana",
	extensions: [
		"hvp"
	]
},
	"application/vnd.yamaha.openscoreformat": {
	source: "iana",
	extensions: [
		"osf"
	]
},
	"application/vnd.yamaha.openscoreformat.osfpvg+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"osfpvg"
	]
},
	"application/vnd.yamaha.remote-setup": {
	source: "iana"
},
	"application/vnd.yamaha.smaf-audio": {
	source: "iana",
	extensions: [
		"saf"
	]
},
	"application/vnd.yamaha.smaf-phrase": {
	source: "iana",
	extensions: [
		"spf"
	]
},
	"application/vnd.yamaha.through-ngn": {
	source: "iana"
},
	"application/vnd.yamaha.tunnel-udpencap": {
	source: "iana"
},
	"application/vnd.yaoweme": {
	source: "iana"
},
	"application/vnd.yellowriver-custom-menu": {
	source: "iana",
	extensions: [
		"cmp"
	]
},
	"application/vnd.youtube.yt": {
	source: "iana"
},
	"application/vnd.zul": {
	source: "iana",
	extensions: [
		"zir",
		"zirz"
	]
},
	"application/vnd.zzazz.deck+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"zaz"
	]
},
	"application/voicexml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"vxml"
	]
},
	"application/voucher-cms+json": {
	source: "iana",
	compressible: true
},
	"application/vq-rtcpxr": {
	source: "iana"
},
	"application/wasm": {
	source: "iana",
	compressible: true,
	extensions: [
		"wasm"
	]
},
	"application/watcherinfo+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"wif"
	]
},
	"application/webpush-options+json": {
	source: "iana",
	compressible: true
},
	"application/whoispp-query": {
	source: "iana"
},
	"application/whoispp-response": {
	source: "iana"
},
	"application/widget": {
	source: "iana",
	extensions: [
		"wgt"
	]
},
	"application/winhlp": {
	source: "apache",
	extensions: [
		"hlp"
	]
},
	"application/wita": {
	source: "iana"
},
	"application/wordperfect5.1": {
	source: "iana"
},
	"application/wsdl+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"wsdl"
	]
},
	"application/wspolicy+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"wspolicy"
	]
},
	"application/x-7z-compressed": {
	source: "apache",
	compressible: false,
	extensions: [
		"7z"
	]
},
	"application/x-abiword": {
	source: "apache",
	extensions: [
		"abw"
	]
},
	"application/x-ace-compressed": {
	source: "apache",
	extensions: [
		"ace"
	]
},
	"application/x-amf": {
	source: "apache"
},
	"application/x-apple-diskimage": {
	source: "apache",
	extensions: [
		"dmg"
	]
},
	"application/x-arj": {
	compressible: false,
	extensions: [
		"arj"
	]
},
	"application/x-authorware-bin": {
	source: "apache",
	extensions: [
		"aab",
		"x32",
		"u32",
		"vox"
	]
},
	"application/x-authorware-map": {
	source: "apache",
	extensions: [
		"aam"
	]
},
	"application/x-authorware-seg": {
	source: "apache",
	extensions: [
		"aas"
	]
},
	"application/x-bcpio": {
	source: "apache",
	extensions: [
		"bcpio"
	]
},
	"application/x-bdoc": {
	compressible: false,
	extensions: [
		"bdoc"
	]
},
	"application/x-bittorrent": {
	source: "apache",
	extensions: [
		"torrent"
	]
},
	"application/x-blorb": {
	source: "apache",
	extensions: [
		"blb",
		"blorb"
	]
},
	"application/x-bzip": {
	source: "apache",
	compressible: false,
	extensions: [
		"bz"
	]
},
	"application/x-bzip2": {
	source: "apache",
	compressible: false,
	extensions: [
		"bz2",
		"boz"
	]
},
	"application/x-cbr": {
	source: "apache",
	extensions: [
		"cbr",
		"cba",
		"cbt",
		"cbz",
		"cb7"
	]
},
	"application/x-cdlink": {
	source: "apache",
	extensions: [
		"vcd"
	]
},
	"application/x-cfs-compressed": {
	source: "apache",
	extensions: [
		"cfs"
	]
},
	"application/x-chat": {
	source: "apache",
	extensions: [
		"chat"
	]
},
	"application/x-chess-pgn": {
	source: "apache",
	extensions: [
		"pgn"
	]
},
	"application/x-chrome-extension": {
	extensions: [
		"crx"
	]
},
	"application/x-cocoa": {
	source: "nginx",
	extensions: [
		"cco"
	]
},
	"application/x-compress": {
	source: "apache"
},
	"application/x-conference": {
	source: "apache",
	extensions: [
		"nsc"
	]
},
	"application/x-cpio": {
	source: "apache",
	extensions: [
		"cpio"
	]
},
	"application/x-csh": {
	source: "apache",
	extensions: [
		"csh"
	]
},
	"application/x-deb": {
	compressible: false
},
	"application/x-debian-package": {
	source: "apache",
	extensions: [
		"deb",
		"udeb"
	]
},
	"application/x-dgc-compressed": {
	source: "apache",
	extensions: [
		"dgc"
	]
},
	"application/x-director": {
	source: "apache",
	extensions: [
		"dir",
		"dcr",
		"dxr",
		"cst",
		"cct",
		"cxt",
		"w3d",
		"fgd",
		"swa"
	]
},
	"application/x-doom": {
	source: "apache",
	extensions: [
		"wad"
	]
},
	"application/x-dtbncx+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"ncx"
	]
},
	"application/x-dtbook+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"dtb"
	]
},
	"application/x-dtbresource+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"res"
	]
},
	"application/x-dvi": {
	source: "apache",
	compressible: false,
	extensions: [
		"dvi"
	]
},
	"application/x-envoy": {
	source: "apache",
	extensions: [
		"evy"
	]
},
	"application/x-eva": {
	source: "apache",
	extensions: [
		"eva"
	]
},
	"application/x-font-bdf": {
	source: "apache",
	extensions: [
		"bdf"
	]
},
	"application/x-font-dos": {
	source: "apache"
},
	"application/x-font-framemaker": {
	source: "apache"
},
	"application/x-font-ghostscript": {
	source: "apache",
	extensions: [
		"gsf"
	]
},
	"application/x-font-libgrx": {
	source: "apache"
},
	"application/x-font-linux-psf": {
	source: "apache",
	extensions: [
		"psf"
	]
},
	"application/x-font-pcf": {
	source: "apache",
	extensions: [
		"pcf"
	]
},
	"application/x-font-snf": {
	source: "apache",
	extensions: [
		"snf"
	]
},
	"application/x-font-speedo": {
	source: "apache"
},
	"application/x-font-sunos-news": {
	source: "apache"
},
	"application/x-font-type1": {
	source: "apache",
	extensions: [
		"pfa",
		"pfb",
		"pfm",
		"afm"
	]
},
	"application/x-font-vfont": {
	source: "apache"
},
	"application/x-freearc": {
	source: "apache",
	extensions: [
		"arc"
	]
},
	"application/x-futuresplash": {
	source: "apache",
	extensions: [
		"spl"
	]
},
	"application/x-gca-compressed": {
	source: "apache",
	extensions: [
		"gca"
	]
},
	"application/x-glulx": {
	source: "apache",
	extensions: [
		"ulx"
	]
},
	"application/x-gnumeric": {
	source: "apache",
	extensions: [
		"gnumeric"
	]
},
	"application/x-gramps-xml": {
	source: "apache",
	extensions: [
		"gramps"
	]
},
	"application/x-gtar": {
	source: "apache",
	extensions: [
		"gtar"
	]
},
	"application/x-gzip": {
	source: "apache"
},
	"application/x-hdf": {
	source: "apache",
	extensions: [
		"hdf"
	]
},
	"application/x-httpd-php": {
	compressible: true,
	extensions: [
		"php"
	]
},
	"application/x-install-instructions": {
	source: "apache",
	extensions: [
		"install"
	]
},
	"application/x-iso9660-image": {
	source: "apache",
	extensions: [
		"iso"
	]
},
	"application/x-iwork-keynote-sffkey": {
	extensions: [
		"key"
	]
},
	"application/x-iwork-numbers-sffnumbers": {
	extensions: [
		"numbers"
	]
},
	"application/x-iwork-pages-sffpages": {
	extensions: [
		"pages"
	]
},
	"application/x-java-archive-diff": {
	source: "nginx",
	extensions: [
		"jardiff"
	]
},
	"application/x-java-jnlp-file": {
	source: "apache",
	compressible: false,
	extensions: [
		"jnlp"
	]
},
	"application/x-javascript": {
	compressible: true
},
	"application/x-keepass2": {
	extensions: [
		"kdbx"
	]
},
	"application/x-latex": {
	source: "apache",
	compressible: false,
	extensions: [
		"latex"
	]
},
	"application/x-lua-bytecode": {
	extensions: [
		"luac"
	]
},
	"application/x-lzh-compressed": {
	source: "apache",
	extensions: [
		"lzh",
		"lha"
	]
},
	"application/x-makeself": {
	source: "nginx",
	extensions: [
		"run"
	]
},
	"application/x-mie": {
	source: "apache",
	extensions: [
		"mie"
	]
},
	"application/x-mobipocket-ebook": {
	source: "apache",
	extensions: [
		"prc",
		"mobi"
	]
},
	"application/x-mpegurl": {
	compressible: false
},
	"application/x-ms-application": {
	source: "apache",
	extensions: [
		"application"
	]
},
	"application/x-ms-shortcut": {
	source: "apache",
	extensions: [
		"lnk"
	]
},
	"application/x-ms-wmd": {
	source: "apache",
	extensions: [
		"wmd"
	]
},
	"application/x-ms-wmz": {
	source: "apache",
	extensions: [
		"wmz"
	]
},
	"application/x-ms-xbap": {
	source: "apache",
	extensions: [
		"xbap"
	]
},
	"application/x-msaccess": {
	source: "apache",
	extensions: [
		"mdb"
	]
},
	"application/x-msbinder": {
	source: "apache",
	extensions: [
		"obd"
	]
},
	"application/x-mscardfile": {
	source: "apache",
	extensions: [
		"crd"
	]
},
	"application/x-msclip": {
	source: "apache",
	extensions: [
		"clp"
	]
},
	"application/x-msdos-program": {
	extensions: [
		"exe"
	]
},
	"application/x-msdownload": {
	source: "apache",
	extensions: [
		"exe",
		"dll",
		"com",
		"bat",
		"msi"
	]
},
	"application/x-msmediaview": {
	source: "apache",
	extensions: [
		"mvb",
		"m13",
		"m14"
	]
},
	"application/x-msmetafile": {
	source: "apache",
	extensions: [
		"wmf",
		"wmz",
		"emf",
		"emz"
	]
},
	"application/x-msmoney": {
	source: "apache",
	extensions: [
		"mny"
	]
},
	"application/x-mspublisher": {
	source: "apache",
	extensions: [
		"pub"
	]
},
	"application/x-msschedule": {
	source: "apache",
	extensions: [
		"scd"
	]
},
	"application/x-msterminal": {
	source: "apache",
	extensions: [
		"trm"
	]
},
	"application/x-mswrite": {
	source: "apache",
	extensions: [
		"wri"
	]
},
	"application/x-netcdf": {
	source: "apache",
	extensions: [
		"nc",
		"cdf"
	]
},
	"application/x-ns-proxy-autoconfig": {
	compressible: true,
	extensions: [
		"pac"
	]
},
	"application/x-nzb": {
	source: "apache",
	extensions: [
		"nzb"
	]
},
	"application/x-perl": {
	source: "nginx",
	extensions: [
		"pl",
		"pm"
	]
},
	"application/x-pilot": {
	source: "nginx",
	extensions: [
		"prc",
		"pdb"
	]
},
	"application/x-pkcs12": {
	source: "apache",
	compressible: false,
	extensions: [
		"p12",
		"pfx"
	]
},
	"application/x-pkcs7-certificates": {
	source: "apache",
	extensions: [
		"p7b",
		"spc"
	]
},
	"application/x-pkcs7-certreqresp": {
	source: "apache",
	extensions: [
		"p7r"
	]
},
	"application/x-pki-message": {
	source: "iana"
},
	"application/x-rar-compressed": {
	source: "apache",
	compressible: false,
	extensions: [
		"rar"
	]
},
	"application/x-redhat-package-manager": {
	source: "nginx",
	extensions: [
		"rpm"
	]
},
	"application/x-research-info-systems": {
	source: "apache",
	extensions: [
		"ris"
	]
},
	"application/x-sea": {
	source: "nginx",
	extensions: [
		"sea"
	]
},
	"application/x-sh": {
	source: "apache",
	compressible: true,
	extensions: [
		"sh"
	]
},
	"application/x-shar": {
	source: "apache",
	extensions: [
		"shar"
	]
},
	"application/x-shockwave-flash": {
	source: "apache",
	compressible: false,
	extensions: [
		"swf"
	]
},
	"application/x-silverlight-app": {
	source: "apache",
	extensions: [
		"xap"
	]
},
	"application/x-sql": {
	source: "apache",
	extensions: [
		"sql"
	]
},
	"application/x-stuffit": {
	source: "apache",
	compressible: false,
	extensions: [
		"sit"
	]
},
	"application/x-stuffitx": {
	source: "apache",
	extensions: [
		"sitx"
	]
},
	"application/x-subrip": {
	source: "apache",
	extensions: [
		"srt"
	]
},
	"application/x-sv4cpio": {
	source: "apache",
	extensions: [
		"sv4cpio"
	]
},
	"application/x-sv4crc": {
	source: "apache",
	extensions: [
		"sv4crc"
	]
},
	"application/x-t3vm-image": {
	source: "apache",
	extensions: [
		"t3"
	]
},
	"application/x-tads": {
	source: "apache",
	extensions: [
		"gam"
	]
},
	"application/x-tar": {
	source: "apache",
	compressible: true,
	extensions: [
		"tar"
	]
},
	"application/x-tcl": {
	source: "apache",
	extensions: [
		"tcl",
		"tk"
	]
},
	"application/x-tex": {
	source: "apache",
	extensions: [
		"tex"
	]
},
	"application/x-tex-tfm": {
	source: "apache",
	extensions: [
		"tfm"
	]
},
	"application/x-texinfo": {
	source: "apache",
	extensions: [
		"texinfo",
		"texi"
	]
},
	"application/x-tgif": {
	source: "apache",
	extensions: [
		"obj"
	]
},
	"application/x-ustar": {
	source: "apache",
	extensions: [
		"ustar"
	]
},
	"application/x-virtualbox-hdd": {
	compressible: true,
	extensions: [
		"hdd"
	]
},
	"application/x-virtualbox-ova": {
	compressible: true,
	extensions: [
		"ova"
	]
},
	"application/x-virtualbox-ovf": {
	compressible: true,
	extensions: [
		"ovf"
	]
},
	"application/x-virtualbox-vbox": {
	compressible: true,
	extensions: [
		"vbox"
	]
},
	"application/x-virtualbox-vbox-extpack": {
	compressible: false,
	extensions: [
		"vbox-extpack"
	]
},
	"application/x-virtualbox-vdi": {
	compressible: true,
	extensions: [
		"vdi"
	]
},
	"application/x-virtualbox-vhd": {
	compressible: true,
	extensions: [
		"vhd"
	]
},
	"application/x-virtualbox-vmdk": {
	compressible: true,
	extensions: [
		"vmdk"
	]
},
	"application/x-wais-source": {
	source: "apache",
	extensions: [
		"src"
	]
},
	"application/x-web-app-manifest+json": {
	compressible: true,
	extensions: [
		"webapp"
	]
},
	"application/x-www-form-urlencoded": {
	source: "iana",
	compressible: true
},
	"application/x-x509-ca-cert": {
	source: "iana",
	extensions: [
		"der",
		"crt",
		"pem"
	]
},
	"application/x-x509-ca-ra-cert": {
	source: "iana"
},
	"application/x-x509-next-ca-cert": {
	source: "iana"
},
	"application/x-xfig": {
	source: "apache",
	extensions: [
		"fig"
	]
},
	"application/x-xliff+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"xlf"
	]
},
	"application/x-xpinstall": {
	source: "apache",
	compressible: false,
	extensions: [
		"xpi"
	]
},
	"application/x-xz": {
	source: "apache",
	extensions: [
		"xz"
	]
},
	"application/x-zmachine": {
	source: "apache",
	extensions: [
		"z1",
		"z2",
		"z3",
		"z4",
		"z5",
		"z6",
		"z7",
		"z8"
	]
},
	"application/x400-bp": {
	source: "iana"
},
	"application/xacml+xml": {
	source: "iana",
	compressible: true
},
	"application/xaml+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"xaml"
	]
},
	"application/xcap-att+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xav"
	]
},
	"application/xcap-caps+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xca"
	]
},
	"application/xcap-diff+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xdf"
	]
},
	"application/xcap-el+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xel"
	]
},
	"application/xcap-error+xml": {
	source: "iana",
	compressible: true
},
	"application/xcap-ns+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xns"
	]
},
	"application/xcon-conference-info+xml": {
	source: "iana",
	compressible: true
},
	"application/xcon-conference-info-diff+xml": {
	source: "iana",
	compressible: true
},
	"application/xenc+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xenc"
	]
},
	"application/xhtml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xhtml",
		"xht"
	]
},
	"application/xhtml-voice+xml": {
	source: "apache",
	compressible: true
},
	"application/xliff+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xlf"
	]
},
	"application/xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xml",
		"xsl",
		"xsd",
		"rng"
	]
},
	"application/xml-dtd": {
	source: "iana",
	compressible: true,
	extensions: [
		"dtd"
	]
},
	"application/xml-external-parsed-entity": {
	source: "iana"
},
	"application/xml-patch+xml": {
	source: "iana",
	compressible: true
},
	"application/xmpp+xml": {
	source: "iana",
	compressible: true
},
	"application/xop+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xop"
	]
},
	"application/xproc+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"xpl"
	]
},
	"application/xslt+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xsl",
		"xslt"
	]
},
	"application/xspf+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"xspf"
	]
},
	"application/xv+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mxml",
		"xhvml",
		"xvml",
		"xvm"
	]
},
	"application/yang": {
	source: "iana",
	extensions: [
		"yang"
	]
},
	"application/yang-data+json": {
	source: "iana",
	compressible: true
},
	"application/yang-data+xml": {
	source: "iana",
	compressible: true
},
	"application/yang-patch+json": {
	source: "iana",
	compressible: true
},
	"application/yang-patch+xml": {
	source: "iana",
	compressible: true
},
	"application/yin+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"yin"
	]
},
	"application/zip": {
	source: "iana",
	compressible: false,
	extensions: [
		"zip"
	]
},
	"application/zlib": {
	source: "iana"
},
	"application/zstd": {
	source: "iana"
},
	"audio/1d-interleaved-parityfec": {
	source: "iana"
},
	"audio/32kadpcm": {
	source: "iana"
},
	"audio/3gpp": {
	source: "iana",
	compressible: false,
	extensions: [
		"3gpp"
	]
},
	"audio/3gpp2": {
	source: "iana"
},
	"audio/aac": {
	source: "iana"
},
	"audio/ac3": {
	source: "iana"
},
	"audio/adpcm": {
	source: "apache",
	extensions: [
		"adp"
	]
},
	"audio/amr": {
	source: "iana",
	extensions: [
		"amr"
	]
},
	"audio/amr-wb": {
	source: "iana"
},
	"audio/amr-wb+": {
	source: "iana"
},
	"audio/aptx": {
	source: "iana"
},
	"audio/asc": {
	source: "iana"
},
	"audio/atrac-advanced-lossless": {
	source: "iana"
},
	"audio/atrac-x": {
	source: "iana"
},
	"audio/atrac3": {
	source: "iana"
},
	"audio/basic": {
	source: "iana",
	compressible: false,
	extensions: [
		"au",
		"snd"
	]
},
	"audio/bv16": {
	source: "iana"
},
	"audio/bv32": {
	source: "iana"
},
	"audio/clearmode": {
	source: "iana"
},
	"audio/cn": {
	source: "iana"
},
	"audio/dat12": {
	source: "iana"
},
	"audio/dls": {
	source: "iana"
},
	"audio/dsr-es201108": {
	source: "iana"
},
	"audio/dsr-es202050": {
	source: "iana"
},
	"audio/dsr-es202211": {
	source: "iana"
},
	"audio/dsr-es202212": {
	source: "iana"
},
	"audio/dv": {
	source: "iana"
},
	"audio/dvi4": {
	source: "iana"
},
	"audio/eac3": {
	source: "iana"
},
	"audio/encaprtp": {
	source: "iana"
},
	"audio/evrc": {
	source: "iana"
},
	"audio/evrc-qcp": {
	source: "iana"
},
	"audio/evrc0": {
	source: "iana"
},
	"audio/evrc1": {
	source: "iana"
},
	"audio/evrcb": {
	source: "iana"
},
	"audio/evrcb0": {
	source: "iana"
},
	"audio/evrcb1": {
	source: "iana"
},
	"audio/evrcnw": {
	source: "iana"
},
	"audio/evrcnw0": {
	source: "iana"
},
	"audio/evrcnw1": {
	source: "iana"
},
	"audio/evrcwb": {
	source: "iana"
},
	"audio/evrcwb0": {
	source: "iana"
},
	"audio/evrcwb1": {
	source: "iana"
},
	"audio/evs": {
	source: "iana"
},
	"audio/flexfec": {
	source: "iana"
},
	"audio/fwdred": {
	source: "iana"
},
	"audio/g711-0": {
	source: "iana"
},
	"audio/g719": {
	source: "iana"
},
	"audio/g722": {
	source: "iana"
},
	"audio/g7221": {
	source: "iana"
},
	"audio/g723": {
	source: "iana"
},
	"audio/g726-16": {
	source: "iana"
},
	"audio/g726-24": {
	source: "iana"
},
	"audio/g726-32": {
	source: "iana"
},
	"audio/g726-40": {
	source: "iana"
},
	"audio/g728": {
	source: "iana"
},
	"audio/g729": {
	source: "iana"
},
	"audio/g7291": {
	source: "iana"
},
	"audio/g729d": {
	source: "iana"
},
	"audio/g729e": {
	source: "iana"
},
	"audio/gsm": {
	source: "iana"
},
	"audio/gsm-efr": {
	source: "iana"
},
	"audio/gsm-hr-08": {
	source: "iana"
},
	"audio/ilbc": {
	source: "iana"
},
	"audio/ip-mr_v2.5": {
	source: "iana"
},
	"audio/isac": {
	source: "apache"
},
	"audio/l16": {
	source: "iana"
},
	"audio/l20": {
	source: "iana"
},
	"audio/l24": {
	source: "iana",
	compressible: false
},
	"audio/l8": {
	source: "iana"
},
	"audio/lpc": {
	source: "iana"
},
	"audio/melp": {
	source: "iana"
},
	"audio/melp1200": {
	source: "iana"
},
	"audio/melp2400": {
	source: "iana"
},
	"audio/melp600": {
	source: "iana"
},
	"audio/mhas": {
	source: "iana"
},
	"audio/midi": {
	source: "apache",
	extensions: [
		"mid",
		"midi",
		"kar",
		"rmi"
	]
},
	"audio/mobile-xmf": {
	source: "iana",
	extensions: [
		"mxmf"
	]
},
	"audio/mp3": {
	compressible: false,
	extensions: [
		"mp3"
	]
},
	"audio/mp4": {
	source: "iana",
	compressible: false,
	extensions: [
		"m4a",
		"mp4a"
	]
},
	"audio/mp4a-latm": {
	source: "iana"
},
	"audio/mpa": {
	source: "iana"
},
	"audio/mpa-robust": {
	source: "iana"
},
	"audio/mpeg": {
	source: "iana",
	compressible: false,
	extensions: [
		"mpga",
		"mp2",
		"mp2a",
		"mp3",
		"m2a",
		"m3a"
	]
},
	"audio/mpeg4-generic": {
	source: "iana"
},
	"audio/musepack": {
	source: "apache"
},
	"audio/ogg": {
	source: "iana",
	compressible: false,
	extensions: [
		"oga",
		"ogg",
		"spx",
		"opus"
	]
},
	"audio/opus": {
	source: "iana"
},
	"audio/parityfec": {
	source: "iana"
},
	"audio/pcma": {
	source: "iana"
},
	"audio/pcma-wb": {
	source: "iana"
},
	"audio/pcmu": {
	source: "iana"
},
	"audio/pcmu-wb": {
	source: "iana"
},
	"audio/prs.sid": {
	source: "iana"
},
	"audio/qcelp": {
	source: "iana"
},
	"audio/raptorfec": {
	source: "iana"
},
	"audio/red": {
	source: "iana"
},
	"audio/rtp-enc-aescm128": {
	source: "iana"
},
	"audio/rtp-midi": {
	source: "iana"
},
	"audio/rtploopback": {
	source: "iana"
},
	"audio/rtx": {
	source: "iana"
},
	"audio/s3m": {
	source: "apache",
	extensions: [
		"s3m"
	]
},
	"audio/scip": {
	source: "iana"
},
	"audio/silk": {
	source: "apache",
	extensions: [
		"sil"
	]
},
	"audio/smv": {
	source: "iana"
},
	"audio/smv-qcp": {
	source: "iana"
},
	"audio/smv0": {
	source: "iana"
},
	"audio/sofa": {
	source: "iana"
},
	"audio/sp-midi": {
	source: "iana"
},
	"audio/speex": {
	source: "iana"
},
	"audio/t140c": {
	source: "iana"
},
	"audio/t38": {
	source: "iana"
},
	"audio/telephone-event": {
	source: "iana"
},
	"audio/tetra_acelp": {
	source: "iana"
},
	"audio/tetra_acelp_bb": {
	source: "iana"
},
	"audio/tone": {
	source: "iana"
},
	"audio/tsvcis": {
	source: "iana"
},
	"audio/uemclip": {
	source: "iana"
},
	"audio/ulpfec": {
	source: "iana"
},
	"audio/usac": {
	source: "iana"
},
	"audio/vdvi": {
	source: "iana"
},
	"audio/vmr-wb": {
	source: "iana"
},
	"audio/vnd.3gpp.iufp": {
	source: "iana"
},
	"audio/vnd.4sb": {
	source: "iana"
},
	"audio/vnd.audiokoz": {
	source: "iana"
},
	"audio/vnd.celp": {
	source: "iana"
},
	"audio/vnd.cisco.nse": {
	source: "iana"
},
	"audio/vnd.cmles.radio-events": {
	source: "iana"
},
	"audio/vnd.cns.anp1": {
	source: "iana"
},
	"audio/vnd.cns.inf1": {
	source: "iana"
},
	"audio/vnd.dece.audio": {
	source: "iana",
	extensions: [
		"uva",
		"uvva"
	]
},
	"audio/vnd.digital-winds": {
	source: "iana",
	extensions: [
		"eol"
	]
},
	"audio/vnd.dlna.adts": {
	source: "iana"
},
	"audio/vnd.dolby.heaac.1": {
	source: "iana"
},
	"audio/vnd.dolby.heaac.2": {
	source: "iana"
},
	"audio/vnd.dolby.mlp": {
	source: "iana"
},
	"audio/vnd.dolby.mps": {
	source: "iana"
},
	"audio/vnd.dolby.pl2": {
	source: "iana"
},
	"audio/vnd.dolby.pl2x": {
	source: "iana"
},
	"audio/vnd.dolby.pl2z": {
	source: "iana"
},
	"audio/vnd.dolby.pulse.1": {
	source: "iana"
},
	"audio/vnd.dra": {
	source: "iana",
	extensions: [
		"dra"
	]
},
	"audio/vnd.dts": {
	source: "iana",
	extensions: [
		"dts"
	]
},
	"audio/vnd.dts.hd": {
	source: "iana",
	extensions: [
		"dtshd"
	]
},
	"audio/vnd.dts.uhd": {
	source: "iana"
},
	"audio/vnd.dvb.file": {
	source: "iana"
},
	"audio/vnd.everad.plj": {
	source: "iana"
},
	"audio/vnd.hns.audio": {
	source: "iana"
},
	"audio/vnd.lucent.voice": {
	source: "iana",
	extensions: [
		"lvp"
	]
},
	"audio/vnd.ms-playready.media.pya": {
	source: "iana",
	extensions: [
		"pya"
	]
},
	"audio/vnd.nokia.mobile-xmf": {
	source: "iana"
},
	"audio/vnd.nortel.vbk": {
	source: "iana"
},
	"audio/vnd.nuera.ecelp4800": {
	source: "iana",
	extensions: [
		"ecelp4800"
	]
},
	"audio/vnd.nuera.ecelp7470": {
	source: "iana",
	extensions: [
		"ecelp7470"
	]
},
	"audio/vnd.nuera.ecelp9600": {
	source: "iana",
	extensions: [
		"ecelp9600"
	]
},
	"audio/vnd.octel.sbc": {
	source: "iana"
},
	"audio/vnd.presonus.multitrack": {
	source: "iana"
},
	"audio/vnd.qcelp": {
	source: "iana"
},
	"audio/vnd.rhetorex.32kadpcm": {
	source: "iana"
},
	"audio/vnd.rip": {
	source: "iana",
	extensions: [
		"rip"
	]
},
	"audio/vnd.rn-realaudio": {
	compressible: false
},
	"audio/vnd.sealedmedia.softseal.mpeg": {
	source: "iana"
},
	"audio/vnd.vmx.cvsd": {
	source: "iana"
},
	"audio/vnd.wave": {
	compressible: false
},
	"audio/vorbis": {
	source: "iana",
	compressible: false
},
	"audio/vorbis-config": {
	source: "iana"
},
	"audio/wav": {
	compressible: false,
	extensions: [
		"wav"
	]
},
	"audio/wave": {
	compressible: false,
	extensions: [
		"wav"
	]
},
	"audio/webm": {
	source: "apache",
	compressible: false,
	extensions: [
		"weba"
	]
},
	"audio/x-aac": {
	source: "apache",
	compressible: false,
	extensions: [
		"aac"
	]
},
	"audio/x-aiff": {
	source: "apache",
	extensions: [
		"aif",
		"aiff",
		"aifc"
	]
},
	"audio/x-caf": {
	source: "apache",
	compressible: false,
	extensions: [
		"caf"
	]
},
	"audio/x-flac": {
	source: "apache",
	extensions: [
		"flac"
	]
},
	"audio/x-m4a": {
	source: "nginx",
	extensions: [
		"m4a"
	]
},
	"audio/x-matroska": {
	source: "apache",
	extensions: [
		"mka"
	]
},
	"audio/x-mpegurl": {
	source: "apache",
	extensions: [
		"m3u"
	]
},
	"audio/x-ms-wax": {
	source: "apache",
	extensions: [
		"wax"
	]
},
	"audio/x-ms-wma": {
	source: "apache",
	extensions: [
		"wma"
	]
},
	"audio/x-pn-realaudio": {
	source: "apache",
	extensions: [
		"ram",
		"ra"
	]
},
	"audio/x-pn-realaudio-plugin": {
	source: "apache",
	extensions: [
		"rmp"
	]
},
	"audio/x-realaudio": {
	source: "nginx",
	extensions: [
		"ra"
	]
},
	"audio/x-tta": {
	source: "apache"
},
	"audio/x-wav": {
	source: "apache",
	extensions: [
		"wav"
	]
},
	"audio/xm": {
	source: "apache",
	extensions: [
		"xm"
	]
},
	"chemical/x-cdx": {
	source: "apache",
	extensions: [
		"cdx"
	]
},
	"chemical/x-cif": {
	source: "apache",
	extensions: [
		"cif"
	]
},
	"chemical/x-cmdf": {
	source: "apache",
	extensions: [
		"cmdf"
	]
},
	"chemical/x-cml": {
	source: "apache",
	extensions: [
		"cml"
	]
},
	"chemical/x-csml": {
	source: "apache",
	extensions: [
		"csml"
	]
},
	"chemical/x-pdb": {
	source: "apache"
},
	"chemical/x-xyz": {
	source: "apache",
	extensions: [
		"xyz"
	]
},
	"font/collection": {
	source: "iana",
	extensions: [
		"ttc"
	]
},
	"font/otf": {
	source: "iana",
	compressible: true,
	extensions: [
		"otf"
	]
},
	"font/sfnt": {
	source: "iana"
},
	"font/ttf": {
	source: "iana",
	compressible: true,
	extensions: [
		"ttf"
	]
},
	"font/woff": {
	source: "iana",
	extensions: [
		"woff"
	]
},
	"font/woff2": {
	source: "iana",
	extensions: [
		"woff2"
	]
},
	"image/aces": {
	source: "iana",
	extensions: [
		"exr"
	]
},
	"image/apng": {
	compressible: false,
	extensions: [
		"apng"
	]
},
	"image/avci": {
	source: "iana",
	extensions: [
		"avci"
	]
},
	"image/avcs": {
	source: "iana",
	extensions: [
		"avcs"
	]
},
	"image/avif": {
	source: "iana",
	compressible: false,
	extensions: [
		"avif"
	]
},
	"image/bmp": {
	source: "iana",
	compressible: true,
	extensions: [
		"bmp"
	]
},
	"image/cgm": {
	source: "iana",
	extensions: [
		"cgm"
	]
},
	"image/dicom-rle": {
	source: "iana",
	extensions: [
		"drle"
	]
},
	"image/emf": {
	source: "iana",
	extensions: [
		"emf"
	]
},
	"image/fits": {
	source: "iana",
	extensions: [
		"fits"
	]
},
	"image/g3fax": {
	source: "iana",
	extensions: [
		"g3"
	]
},
	"image/gif": {
	source: "iana",
	compressible: false,
	extensions: [
		"gif"
	]
},
	"image/heic": {
	source: "iana",
	extensions: [
		"heic"
	]
},
	"image/heic-sequence": {
	source: "iana",
	extensions: [
		"heics"
	]
},
	"image/heif": {
	source: "iana",
	extensions: [
		"heif"
	]
},
	"image/heif-sequence": {
	source: "iana",
	extensions: [
		"heifs"
	]
},
	"image/hej2k": {
	source: "iana",
	extensions: [
		"hej2"
	]
},
	"image/hsj2": {
	source: "iana",
	extensions: [
		"hsj2"
	]
},
	"image/ief": {
	source: "iana",
	extensions: [
		"ief"
	]
},
	"image/jls": {
	source: "iana",
	extensions: [
		"jls"
	]
},
	"image/jp2": {
	source: "iana",
	compressible: false,
	extensions: [
		"jp2",
		"jpg2"
	]
},
	"image/jpeg": {
	source: "iana",
	compressible: false,
	extensions: [
		"jpeg",
		"jpg",
		"jpe"
	]
},
	"image/jph": {
	source: "iana",
	extensions: [
		"jph"
	]
},
	"image/jphc": {
	source: "iana",
	extensions: [
		"jhc"
	]
},
	"image/jpm": {
	source: "iana",
	compressible: false,
	extensions: [
		"jpm"
	]
},
	"image/jpx": {
	source: "iana",
	compressible: false,
	extensions: [
		"jpx",
		"jpf"
	]
},
	"image/jxr": {
	source: "iana",
	extensions: [
		"jxr"
	]
},
	"image/jxra": {
	source: "iana",
	extensions: [
		"jxra"
	]
},
	"image/jxrs": {
	source: "iana",
	extensions: [
		"jxrs"
	]
},
	"image/jxs": {
	source: "iana",
	extensions: [
		"jxs"
	]
},
	"image/jxsc": {
	source: "iana",
	extensions: [
		"jxsc"
	]
},
	"image/jxsi": {
	source: "iana",
	extensions: [
		"jxsi"
	]
},
	"image/jxss": {
	source: "iana",
	extensions: [
		"jxss"
	]
},
	"image/ktx": {
	source: "iana",
	extensions: [
		"ktx"
	]
},
	"image/ktx2": {
	source: "iana",
	extensions: [
		"ktx2"
	]
},
	"image/naplps": {
	source: "iana"
},
	"image/pjpeg": {
	compressible: false
},
	"image/png": {
	source: "iana",
	compressible: false,
	extensions: [
		"png"
	]
},
	"image/prs.btif": {
	source: "iana",
	extensions: [
		"btif"
	]
},
	"image/prs.pti": {
	source: "iana",
	extensions: [
		"pti"
	]
},
	"image/pwg-raster": {
	source: "iana"
},
	"image/sgi": {
	source: "apache",
	extensions: [
		"sgi"
	]
},
	"image/svg+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"svg",
		"svgz"
	]
},
	"image/t38": {
	source: "iana",
	extensions: [
		"t38"
	]
},
	"image/tiff": {
	source: "iana",
	compressible: false,
	extensions: [
		"tif",
		"tiff"
	]
},
	"image/tiff-fx": {
	source: "iana",
	extensions: [
		"tfx"
	]
},
	"image/vnd.adobe.photoshop": {
	source: "iana",
	compressible: true,
	extensions: [
		"psd"
	]
},
	"image/vnd.airzip.accelerator.azv": {
	source: "iana",
	extensions: [
		"azv"
	]
},
	"image/vnd.cns.inf2": {
	source: "iana"
},
	"image/vnd.dece.graphic": {
	source: "iana",
	extensions: [
		"uvi",
		"uvvi",
		"uvg",
		"uvvg"
	]
},
	"image/vnd.djvu": {
	source: "iana",
	extensions: [
		"djvu",
		"djv"
	]
},
	"image/vnd.dvb.subtitle": {
	source: "iana",
	extensions: [
		"sub"
	]
},
	"image/vnd.dwg": {
	source: "iana",
	extensions: [
		"dwg"
	]
},
	"image/vnd.dxf": {
	source: "iana",
	extensions: [
		"dxf"
	]
},
	"image/vnd.fastbidsheet": {
	source: "iana",
	extensions: [
		"fbs"
	]
},
	"image/vnd.fpx": {
	source: "iana",
	extensions: [
		"fpx"
	]
},
	"image/vnd.fst": {
	source: "iana",
	extensions: [
		"fst"
	]
},
	"image/vnd.fujixerox.edmics-mmr": {
	source: "iana",
	extensions: [
		"mmr"
	]
},
	"image/vnd.fujixerox.edmics-rlc": {
	source: "iana",
	extensions: [
		"rlc"
	]
},
	"image/vnd.globalgraphics.pgb": {
	source: "iana"
},
	"image/vnd.microsoft.icon": {
	source: "iana",
	compressible: true,
	extensions: [
		"ico"
	]
},
	"image/vnd.mix": {
	source: "iana"
},
	"image/vnd.mozilla.apng": {
	source: "iana"
},
	"image/vnd.ms-dds": {
	compressible: true,
	extensions: [
		"dds"
	]
},
	"image/vnd.ms-modi": {
	source: "iana",
	extensions: [
		"mdi"
	]
},
	"image/vnd.ms-photo": {
	source: "apache",
	extensions: [
		"wdp"
	]
},
	"image/vnd.net-fpx": {
	source: "iana",
	extensions: [
		"npx"
	]
},
	"image/vnd.pco.b16": {
	source: "iana",
	extensions: [
		"b16"
	]
},
	"image/vnd.radiance": {
	source: "iana"
},
	"image/vnd.sealed.png": {
	source: "iana"
},
	"image/vnd.sealedmedia.softseal.gif": {
	source: "iana"
},
	"image/vnd.sealedmedia.softseal.jpg": {
	source: "iana"
},
	"image/vnd.svf": {
	source: "iana"
},
	"image/vnd.tencent.tap": {
	source: "iana",
	extensions: [
		"tap"
	]
},
	"image/vnd.valve.source.texture": {
	source: "iana",
	extensions: [
		"vtf"
	]
},
	"image/vnd.wap.wbmp": {
	source: "iana",
	extensions: [
		"wbmp"
	]
},
	"image/vnd.xiff": {
	source: "iana",
	extensions: [
		"xif"
	]
},
	"image/vnd.zbrush.pcx": {
	source: "iana",
	extensions: [
		"pcx"
	]
},
	"image/webp": {
	source: "apache",
	extensions: [
		"webp"
	]
},
	"image/wmf": {
	source: "iana",
	extensions: [
		"wmf"
	]
},
	"image/x-3ds": {
	source: "apache",
	extensions: [
		"3ds"
	]
},
	"image/x-cmu-raster": {
	source: "apache",
	extensions: [
		"ras"
	]
},
	"image/x-cmx": {
	source: "apache",
	extensions: [
		"cmx"
	]
},
	"image/x-freehand": {
	source: "apache",
	extensions: [
		"fh",
		"fhc",
		"fh4",
		"fh5",
		"fh7"
	]
},
	"image/x-icon": {
	source: "apache",
	compressible: true,
	extensions: [
		"ico"
	]
},
	"image/x-jng": {
	source: "nginx",
	extensions: [
		"jng"
	]
},
	"image/x-mrsid-image": {
	source: "apache",
	extensions: [
		"sid"
	]
},
	"image/x-ms-bmp": {
	source: "nginx",
	compressible: true,
	extensions: [
		"bmp"
	]
},
	"image/x-pcx": {
	source: "apache",
	extensions: [
		"pcx"
	]
},
	"image/x-pict": {
	source: "apache",
	extensions: [
		"pic",
		"pct"
	]
},
	"image/x-portable-anymap": {
	source: "apache",
	extensions: [
		"pnm"
	]
},
	"image/x-portable-bitmap": {
	source: "apache",
	extensions: [
		"pbm"
	]
},
	"image/x-portable-graymap": {
	source: "apache",
	extensions: [
		"pgm"
	]
},
	"image/x-portable-pixmap": {
	source: "apache",
	extensions: [
		"ppm"
	]
},
	"image/x-rgb": {
	source: "apache",
	extensions: [
		"rgb"
	]
},
	"image/x-tga": {
	source: "apache",
	extensions: [
		"tga"
	]
},
	"image/x-xbitmap": {
	source: "apache",
	extensions: [
		"xbm"
	]
},
	"image/x-xcf": {
	compressible: false
},
	"image/x-xpixmap": {
	source: "apache",
	extensions: [
		"xpm"
	]
},
	"image/x-xwindowdump": {
	source: "apache",
	extensions: [
		"xwd"
	]
},
	"message/cpim": {
	source: "iana"
},
	"message/delivery-status": {
	source: "iana"
},
	"message/disposition-notification": {
	source: "iana",
	extensions: [
		"disposition-notification"
	]
},
	"message/external-body": {
	source: "iana"
},
	"message/feedback-report": {
	source: "iana"
},
	"message/global": {
	source: "iana",
	extensions: [
		"u8msg"
	]
},
	"message/global-delivery-status": {
	source: "iana",
	extensions: [
		"u8dsn"
	]
},
	"message/global-disposition-notification": {
	source: "iana",
	extensions: [
		"u8mdn"
	]
},
	"message/global-headers": {
	source: "iana",
	extensions: [
		"u8hdr"
	]
},
	"message/http": {
	source: "iana",
	compressible: false
},
	"message/imdn+xml": {
	source: "iana",
	compressible: true
},
	"message/news": {
	source: "iana"
},
	"message/partial": {
	source: "iana",
	compressible: false
},
	"message/rfc822": {
	source: "iana",
	compressible: true,
	extensions: [
		"eml",
		"mime"
	]
},
	"message/s-http": {
	source: "iana"
},
	"message/sip": {
	source: "iana"
},
	"message/sipfrag": {
	source: "iana"
},
	"message/tracking-status": {
	source: "iana"
},
	"message/vnd.si.simp": {
	source: "iana"
},
	"message/vnd.wfa.wsc": {
	source: "iana",
	extensions: [
		"wsc"
	]
},
	"model/3mf": {
	source: "iana",
	extensions: [
		"3mf"
	]
},
	"model/e57": {
	source: "iana"
},
	"model/gltf+json": {
	source: "iana",
	compressible: true,
	extensions: [
		"gltf"
	]
},
	"model/gltf-binary": {
	source: "iana",
	compressible: true,
	extensions: [
		"glb"
	]
},
	"model/iges": {
	source: "iana",
	compressible: false,
	extensions: [
		"igs",
		"iges"
	]
},
	"model/mesh": {
	source: "iana",
	compressible: false,
	extensions: [
		"msh",
		"mesh",
		"silo"
	]
},
	"model/mtl": {
	source: "iana",
	extensions: [
		"mtl"
	]
},
	"model/obj": {
	source: "iana",
	extensions: [
		"obj"
	]
},
	"model/step": {
	source: "iana"
},
	"model/step+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"stpx"
	]
},
	"model/step+zip": {
	source: "iana",
	compressible: false,
	extensions: [
		"stpz"
	]
},
	"model/step-xml+zip": {
	source: "iana",
	compressible: false,
	extensions: [
		"stpxz"
	]
},
	"model/stl": {
	source: "iana",
	extensions: [
		"stl"
	]
},
	"model/vnd.collada+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"dae"
	]
},
	"model/vnd.dwf": {
	source: "iana",
	extensions: [
		"dwf"
	]
},
	"model/vnd.flatland.3dml": {
	source: "iana"
},
	"model/vnd.gdl": {
	source: "iana",
	extensions: [
		"gdl"
	]
},
	"model/vnd.gs-gdl": {
	source: "apache"
},
	"model/vnd.gs.gdl": {
	source: "iana"
},
	"model/vnd.gtw": {
	source: "iana",
	extensions: [
		"gtw"
	]
},
	"model/vnd.moml+xml": {
	source: "iana",
	compressible: true
},
	"model/vnd.mts": {
	source: "iana",
	extensions: [
		"mts"
	]
},
	"model/vnd.opengex": {
	source: "iana",
	extensions: [
		"ogex"
	]
},
	"model/vnd.parasolid.transmit.binary": {
	source: "iana",
	extensions: [
		"x_b"
	]
},
	"model/vnd.parasolid.transmit.text": {
	source: "iana",
	extensions: [
		"x_t"
	]
},
	"model/vnd.pytha.pyox": {
	source: "iana"
},
	"model/vnd.rosette.annotated-data-model": {
	source: "iana"
},
	"model/vnd.sap.vds": {
	source: "iana",
	extensions: [
		"vds"
	]
},
	"model/vnd.usdz+zip": {
	source: "iana",
	compressible: false,
	extensions: [
		"usdz"
	]
},
	"model/vnd.valve.source.compiled-map": {
	source: "iana",
	extensions: [
		"bsp"
	]
},
	"model/vnd.vtu": {
	source: "iana",
	extensions: [
		"vtu"
	]
},
	"model/vrml": {
	source: "iana",
	compressible: false,
	extensions: [
		"wrl",
		"vrml"
	]
},
	"model/x3d+binary": {
	source: "apache",
	compressible: false,
	extensions: [
		"x3db",
		"x3dbz"
	]
},
	"model/x3d+fastinfoset": {
	source: "iana",
	extensions: [
		"x3db"
	]
},
	"model/x3d+vrml": {
	source: "apache",
	compressible: false,
	extensions: [
		"x3dv",
		"x3dvz"
	]
},
	"model/x3d+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"x3d",
		"x3dz"
	]
},
	"model/x3d-vrml": {
	source: "iana",
	extensions: [
		"x3dv"
	]
},
	"multipart/alternative": {
	source: "iana",
	compressible: false
},
	"multipart/appledouble": {
	source: "iana"
},
	"multipart/byteranges": {
	source: "iana"
},
	"multipart/digest": {
	source: "iana"
},
	"multipart/encrypted": {
	source: "iana",
	compressible: false
},
	"multipart/form-data": {
	source: "iana",
	compressible: false
},
	"multipart/header-set": {
	source: "iana"
},
	"multipart/mixed": {
	source: "iana"
},
	"multipart/multilingual": {
	source: "iana"
},
	"multipart/parallel": {
	source: "iana"
},
	"multipart/related": {
	source: "iana",
	compressible: false
},
	"multipart/report": {
	source: "iana"
},
	"multipart/signed": {
	source: "iana",
	compressible: false
},
	"multipart/vnd.bint.med-plus": {
	source: "iana"
},
	"multipart/voice-message": {
	source: "iana"
},
	"multipart/x-mixed-replace": {
	source: "iana"
},
	"text/1d-interleaved-parityfec": {
	source: "iana"
},
	"text/cache-manifest": {
	source: "iana",
	compressible: true,
	extensions: [
		"appcache",
		"manifest"
	]
},
	"text/calendar": {
	source: "iana",
	extensions: [
		"ics",
		"ifb"
	]
},
	"text/calender": {
	compressible: true
},
	"text/cmd": {
	compressible: true
},
	"text/coffeescript": {
	extensions: [
		"coffee",
		"litcoffee"
	]
},
	"text/cql": {
	source: "iana"
},
	"text/cql-expression": {
	source: "iana"
},
	"text/cql-identifier": {
	source: "iana"
},
	"text/css": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"css"
	]
},
	"text/csv": {
	source: "iana",
	compressible: true,
	extensions: [
		"csv"
	]
},
	"text/csv-schema": {
	source: "iana"
},
	"text/directory": {
	source: "iana"
},
	"text/dns": {
	source: "iana"
},
	"text/ecmascript": {
	source: "iana"
},
	"text/encaprtp": {
	source: "iana"
},
	"text/enriched": {
	source: "iana"
},
	"text/fhirpath": {
	source: "iana"
},
	"text/flexfec": {
	source: "iana"
},
	"text/fwdred": {
	source: "iana"
},
	"text/gff3": {
	source: "iana"
},
	"text/grammar-ref-list": {
	source: "iana"
},
	"text/html": {
	source: "iana",
	compressible: true,
	extensions: [
		"html",
		"htm",
		"shtml"
	]
},
	"text/jade": {
	extensions: [
		"jade"
	]
},
	"text/javascript": {
	source: "iana",
	compressible: true
},
	"text/jcr-cnd": {
	source: "iana"
},
	"text/jsx": {
	compressible: true,
	extensions: [
		"jsx"
	]
},
	"text/less": {
	compressible: true,
	extensions: [
		"less"
	]
},
	"text/markdown": {
	source: "iana",
	compressible: true,
	extensions: [
		"markdown",
		"md"
	]
},
	"text/mathml": {
	source: "nginx",
	extensions: [
		"mml"
	]
},
	"text/mdx": {
	compressible: true,
	extensions: [
		"mdx"
	]
},
	"text/mizar": {
	source: "iana"
},
	"text/n3": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"n3"
	]
},
	"text/parameters": {
	source: "iana",
	charset: "UTF-8"
},
	"text/parityfec": {
	source: "iana"
},
	"text/plain": {
	source: "iana",
	compressible: true,
	extensions: [
		"txt",
		"text",
		"conf",
		"def",
		"list",
		"log",
		"in",
		"ini"
	]
},
	"text/provenance-notation": {
	source: "iana",
	charset: "UTF-8"
},
	"text/prs.fallenstein.rst": {
	source: "iana"
},
	"text/prs.lines.tag": {
	source: "iana",
	extensions: [
		"dsc"
	]
},
	"text/prs.prop.logic": {
	source: "iana"
},
	"text/raptorfec": {
	source: "iana"
},
	"text/red": {
	source: "iana"
},
	"text/rfc822-headers": {
	source: "iana"
},
	"text/richtext": {
	source: "iana",
	compressible: true,
	extensions: [
		"rtx"
	]
},
	"text/rtf": {
	source: "iana",
	compressible: true,
	extensions: [
		"rtf"
	]
},
	"text/rtp-enc-aescm128": {
	source: "iana"
},
	"text/rtploopback": {
	source: "iana"
},
	"text/rtx": {
	source: "iana"
},
	"text/sgml": {
	source: "iana",
	extensions: [
		"sgml",
		"sgm"
	]
},
	"text/shaclc": {
	source: "iana"
},
	"text/shex": {
	source: "iana",
	extensions: [
		"shex"
	]
},
	"text/slim": {
	extensions: [
		"slim",
		"slm"
	]
},
	"text/spdx": {
	source: "iana",
	extensions: [
		"spdx"
	]
},
	"text/strings": {
	source: "iana"
},
	"text/stylus": {
	extensions: [
		"stylus",
		"styl"
	]
},
	"text/t140": {
	source: "iana"
},
	"text/tab-separated-values": {
	source: "iana",
	compressible: true,
	extensions: [
		"tsv"
	]
},
	"text/troff": {
	source: "iana",
	extensions: [
		"t",
		"tr",
		"roff",
		"man",
		"me",
		"ms"
	]
},
	"text/turtle": {
	source: "iana",
	charset: "UTF-8",
	extensions: [
		"ttl"
	]
},
	"text/ulpfec": {
	source: "iana"
},
	"text/uri-list": {
	source: "iana",
	compressible: true,
	extensions: [
		"uri",
		"uris",
		"urls"
	]
},
	"text/vcard": {
	source: "iana",
	compressible: true,
	extensions: [
		"vcard"
	]
},
	"text/vnd.a": {
	source: "iana"
},
	"text/vnd.abc": {
	source: "iana"
},
	"text/vnd.ascii-art": {
	source: "iana"
},
	"text/vnd.curl": {
	source: "iana",
	extensions: [
		"curl"
	]
},
	"text/vnd.curl.dcurl": {
	source: "apache",
	extensions: [
		"dcurl"
	]
},
	"text/vnd.curl.mcurl": {
	source: "apache",
	extensions: [
		"mcurl"
	]
},
	"text/vnd.curl.scurl": {
	source: "apache",
	extensions: [
		"scurl"
	]
},
	"text/vnd.debian.copyright": {
	source: "iana",
	charset: "UTF-8"
},
	"text/vnd.dmclientscript": {
	source: "iana"
},
	"text/vnd.dvb.subtitle": {
	source: "iana",
	extensions: [
		"sub"
	]
},
	"text/vnd.esmertec.theme-descriptor": {
	source: "iana",
	charset: "UTF-8"
},
	"text/vnd.familysearch.gedcom": {
	source: "iana",
	extensions: [
		"ged"
	]
},
	"text/vnd.ficlab.flt": {
	source: "iana"
},
	"text/vnd.fly": {
	source: "iana",
	extensions: [
		"fly"
	]
},
	"text/vnd.fmi.flexstor": {
	source: "iana",
	extensions: [
		"flx"
	]
},
	"text/vnd.gml": {
	source: "iana"
},
	"text/vnd.graphviz": {
	source: "iana",
	extensions: [
		"gv"
	]
},
	"text/vnd.hans": {
	source: "iana"
},
	"text/vnd.hgl": {
	source: "iana"
},
	"text/vnd.in3d.3dml": {
	source: "iana",
	extensions: [
		"3dml"
	]
},
	"text/vnd.in3d.spot": {
	source: "iana",
	extensions: [
		"spot"
	]
},
	"text/vnd.iptc.newsml": {
	source: "iana"
},
	"text/vnd.iptc.nitf": {
	source: "iana"
},
	"text/vnd.latex-z": {
	source: "iana"
},
	"text/vnd.motorola.reflex": {
	source: "iana"
},
	"text/vnd.ms-mediapackage": {
	source: "iana"
},
	"text/vnd.net2phone.commcenter.command": {
	source: "iana"
},
	"text/vnd.radisys.msml-basic-layout": {
	source: "iana"
},
	"text/vnd.senx.warpscript": {
	source: "iana"
},
	"text/vnd.si.uricatalogue": {
	source: "iana"
},
	"text/vnd.sosi": {
	source: "iana"
},
	"text/vnd.sun.j2me.app-descriptor": {
	source: "iana",
	charset: "UTF-8",
	extensions: [
		"jad"
	]
},
	"text/vnd.trolltech.linguist": {
	source: "iana",
	charset: "UTF-8"
},
	"text/vnd.wap.si": {
	source: "iana"
},
	"text/vnd.wap.sl": {
	source: "iana"
},
	"text/vnd.wap.wml": {
	source: "iana",
	extensions: [
		"wml"
	]
},
	"text/vnd.wap.wmlscript": {
	source: "iana",
	extensions: [
		"wmls"
	]
},
	"text/vtt": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"vtt"
	]
},
	"text/x-asm": {
	source: "apache",
	extensions: [
		"s",
		"asm"
	]
},
	"text/x-c": {
	source: "apache",
	extensions: [
		"c",
		"cc",
		"cxx",
		"cpp",
		"h",
		"hh",
		"dic"
	]
},
	"text/x-component": {
	source: "nginx",
	extensions: [
		"htc"
	]
},
	"text/x-fortran": {
	source: "apache",
	extensions: [
		"f",
		"for",
		"f77",
		"f90"
	]
},
	"text/x-gwt-rpc": {
	compressible: true
},
	"text/x-handlebars-template": {
	extensions: [
		"hbs"
	]
},
	"text/x-java-source": {
	source: "apache",
	extensions: [
		"java"
	]
},
	"text/x-jquery-tmpl": {
	compressible: true
},
	"text/x-lua": {
	extensions: [
		"lua"
	]
},
	"text/x-markdown": {
	compressible: true,
	extensions: [
		"mkd"
	]
},
	"text/x-nfo": {
	source: "apache",
	extensions: [
		"nfo"
	]
},
	"text/x-opml": {
	source: "apache",
	extensions: [
		"opml"
	]
},
	"text/x-org": {
	compressible: true,
	extensions: [
		"org"
	]
},
	"text/x-pascal": {
	source: "apache",
	extensions: [
		"p",
		"pas"
	]
},
	"text/x-processing": {
	compressible: true,
	extensions: [
		"pde"
	]
},
	"text/x-sass": {
	extensions: [
		"sass"
	]
},
	"text/x-scss": {
	extensions: [
		"scss"
	]
},
	"text/x-setext": {
	source: "apache",
	extensions: [
		"etx"
	]
},
	"text/x-sfv": {
	source: "apache",
	extensions: [
		"sfv"
	]
},
	"text/x-suse-ymp": {
	compressible: true,
	extensions: [
		"ymp"
	]
},
	"text/x-uuencode": {
	source: "apache",
	extensions: [
		"uu"
	]
},
	"text/x-vcalendar": {
	source: "apache",
	extensions: [
		"vcs"
	]
},
	"text/x-vcard": {
	source: "apache",
	extensions: [
		"vcf"
	]
},
	"text/xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xml"
	]
},
	"text/xml-external-parsed-entity": {
	source: "iana"
},
	"text/yaml": {
	compressible: true,
	extensions: [
		"yaml",
		"yml"
	]
},
	"video/1d-interleaved-parityfec": {
	source: "iana"
},
	"video/3gpp": {
	source: "iana",
	extensions: [
		"3gp",
		"3gpp"
	]
},
	"video/3gpp-tt": {
	source: "iana"
},
	"video/3gpp2": {
	source: "iana",
	extensions: [
		"3g2"
	]
},
	"video/av1": {
	source: "iana"
},
	"video/bmpeg": {
	source: "iana"
},
	"video/bt656": {
	source: "iana"
},
	"video/celb": {
	source: "iana"
},
	"video/dv": {
	source: "iana"
},
	"video/encaprtp": {
	source: "iana"
},
	"video/ffv1": {
	source: "iana"
},
	"video/flexfec": {
	source: "iana"
},
	"video/h261": {
	source: "iana",
	extensions: [
		"h261"
	]
},
	"video/h263": {
	source: "iana",
	extensions: [
		"h263"
	]
},
	"video/h263-1998": {
	source: "iana"
},
	"video/h263-2000": {
	source: "iana"
},
	"video/h264": {
	source: "iana",
	extensions: [
		"h264"
	]
},
	"video/h264-rcdo": {
	source: "iana"
},
	"video/h264-svc": {
	source: "iana"
},
	"video/h265": {
	source: "iana"
},
	"video/iso.segment": {
	source: "iana",
	extensions: [
		"m4s"
	]
},
	"video/jpeg": {
	source: "iana",
	extensions: [
		"jpgv"
	]
},
	"video/jpeg2000": {
	source: "iana"
},
	"video/jpm": {
	source: "apache",
	extensions: [
		"jpm",
		"jpgm"
	]
},
	"video/jxsv": {
	source: "iana"
},
	"video/mj2": {
	source: "iana",
	extensions: [
		"mj2",
		"mjp2"
	]
},
	"video/mp1s": {
	source: "iana"
},
	"video/mp2p": {
	source: "iana"
},
	"video/mp2t": {
	source: "iana",
	extensions: [
		"ts"
	]
},
	"video/mp4": {
	source: "iana",
	compressible: false,
	extensions: [
		"mp4",
		"mp4v",
		"mpg4"
	]
},
	"video/mp4v-es": {
	source: "iana"
},
	"video/mpeg": {
	source: "iana",
	compressible: false,
	extensions: [
		"mpeg",
		"mpg",
		"mpe",
		"m1v",
		"m2v"
	]
},
	"video/mpeg4-generic": {
	source: "iana"
},
	"video/mpv": {
	source: "iana"
},
	"video/nv": {
	source: "iana"
},
	"video/ogg": {
	source: "iana",
	compressible: false,
	extensions: [
		"ogv"
	]
},
	"video/parityfec": {
	source: "iana"
},
	"video/pointer": {
	source: "iana"
},
	"video/quicktime": {
	source: "iana",
	compressible: false,
	extensions: [
		"qt",
		"mov"
	]
},
	"video/raptorfec": {
	source: "iana"
},
	"video/raw": {
	source: "iana"
},
	"video/rtp-enc-aescm128": {
	source: "iana"
},
	"video/rtploopback": {
	source: "iana"
},
	"video/rtx": {
	source: "iana"
},
	"video/scip": {
	source: "iana"
},
	"video/smpte291": {
	source: "iana"
},
	"video/smpte292m": {
	source: "iana"
},
	"video/ulpfec": {
	source: "iana"
},
	"video/vc1": {
	source: "iana"
},
	"video/vc2": {
	source: "iana"
},
	"video/vnd.cctv": {
	source: "iana"
},
	"video/vnd.dece.hd": {
	source: "iana",
	extensions: [
		"uvh",
		"uvvh"
	]
},
	"video/vnd.dece.mobile": {
	source: "iana",
	extensions: [
		"uvm",
		"uvvm"
	]
},
	"video/vnd.dece.mp4": {
	source: "iana"
},
	"video/vnd.dece.pd": {
	source: "iana",
	extensions: [
		"uvp",
		"uvvp"
	]
},
	"video/vnd.dece.sd": {
	source: "iana",
	extensions: [
		"uvs",
		"uvvs"
	]
},
	"video/vnd.dece.video": {
	source: "iana",
	extensions: [
		"uvv",
		"uvvv"
	]
},
	"video/vnd.directv.mpeg": {
	source: "iana"
},
	"video/vnd.directv.mpeg-tts": {
	source: "iana"
},
	"video/vnd.dlna.mpeg-tts": {
	source: "iana"
},
	"video/vnd.dvb.file": {
	source: "iana",
	extensions: [
		"dvb"
	]
},
	"video/vnd.fvt": {
	source: "iana",
	extensions: [
		"fvt"
	]
},
	"video/vnd.hns.video": {
	source: "iana"
},
	"video/vnd.iptvforum.1dparityfec-1010": {
	source: "iana"
},
	"video/vnd.iptvforum.1dparityfec-2005": {
	source: "iana"
},
	"video/vnd.iptvforum.2dparityfec-1010": {
	source: "iana"
},
	"video/vnd.iptvforum.2dparityfec-2005": {
	source: "iana"
},
	"video/vnd.iptvforum.ttsavc": {
	source: "iana"
},
	"video/vnd.iptvforum.ttsmpeg2": {
	source: "iana"
},
	"video/vnd.motorola.video": {
	source: "iana"
},
	"video/vnd.motorola.videop": {
	source: "iana"
},
	"video/vnd.mpegurl": {
	source: "iana",
	extensions: [
		"mxu",
		"m4u"
	]
},
	"video/vnd.ms-playready.media.pyv": {
	source: "iana",
	extensions: [
		"pyv"
	]
},
	"video/vnd.nokia.interleaved-multimedia": {
	source: "iana"
},
	"video/vnd.nokia.mp4vr": {
	source: "iana"
},
	"video/vnd.nokia.videovoip": {
	source: "iana"
},
	"video/vnd.objectvideo": {
	source: "iana"
},
	"video/vnd.radgamettools.bink": {
	source: "iana"
},
	"video/vnd.radgamettools.smacker": {
	source: "iana"
},
	"video/vnd.sealed.mpeg1": {
	source: "iana"
},
	"video/vnd.sealed.mpeg4": {
	source: "iana"
},
	"video/vnd.sealed.swf": {
	source: "iana"
},
	"video/vnd.sealedmedia.softseal.mov": {
	source: "iana"
},
	"video/vnd.uvvu.mp4": {
	source: "iana",
	extensions: [
		"uvu",
		"uvvu"
	]
},
	"video/vnd.vivo": {
	source: "iana",
	extensions: [
		"viv"
	]
},
	"video/vnd.youtube.yt": {
	source: "iana"
},
	"video/vp8": {
	source: "iana"
},
	"video/vp9": {
	source: "iana"
},
	"video/webm": {
	source: "apache",
	compressible: false,
	extensions: [
		"webm"
	]
},
	"video/x-f4v": {
	source: "apache",
	extensions: [
		"f4v"
	]
},
	"video/x-fli": {
	source: "apache",
	extensions: [
		"fli"
	]
},
	"video/x-flv": {
	source: "apache",
	compressible: false,
	extensions: [
		"flv"
	]
},
	"video/x-m4v": {
	source: "apache",
	extensions: [
		"m4v"
	]
},
	"video/x-matroska": {
	source: "apache",
	compressible: false,
	extensions: [
		"mkv",
		"mk3d",
		"mks"
	]
},
	"video/x-mng": {
	source: "apache",
	extensions: [
		"mng"
	]
},
	"video/x-ms-asf": {
	source: "apache",
	extensions: [
		"asf",
		"asx"
	]
},
	"video/x-ms-vob": {
	source: "apache",
	extensions: [
		"vob"
	]
},
	"video/x-ms-wm": {
	source: "apache",
	extensions: [
		"wm"
	]
},
	"video/x-ms-wmv": {
	source: "apache",
	compressible: false,
	extensions: [
		"wmv"
	]
},
	"video/x-ms-wmx": {
	source: "apache",
	extensions: [
		"wmx"
	]
},
	"video/x-ms-wvx": {
	source: "apache",
	extensions: [
		"wvx"
	]
},
	"video/x-msvideo": {
	source: "apache",
	extensions: [
		"avi"
	]
},
	"video/x-sgi-movie": {
	source: "apache",
	extensions: [
		"movie"
	]
},
	"video/x-smv": {
	source: "apache",
	extensions: [
		"smv"
	]
},
	"x-conference/x-cooltalk": {
	source: "apache",
	extensions: [
		"ice"
	]
},
	"x-shader/x-fragment": {
	compressible: true
},
	"x-shader/x-vertex": {
	compressible: true
}
};

/*!
 * mime-db
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015-2022 Douglas Christopher Wilson
 * MIT Licensed
 */

(function (module) {
	/**
	 * Module exports.
	 */

	module.exports = require$$0;
} (mimeDb));

/*!
 * mime-types
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

(function (exports) {

	/**
	 * Module dependencies.
	 * @private
	 */

	var db = mimeDb.exports;
	var extname = require$$1.extname;

	/**
	 * Module variables.
	 * @private
	 */

	var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
	var TEXT_TYPE_REGEXP = /^text\//i;

	/**
	 * Module exports.
	 * @public
	 */

	exports.charset = charset;
	exports.charsets = { lookup: charset };
	exports.contentType = contentType;
	exports.extension = extension;
	exports.extensions = Object.create(null);
	exports.lookup = lookup;
	exports.types = Object.create(null);

	// Populate the extensions/types maps
	populateMaps(exports.extensions, exports.types);

	/**
	 * Get the default charset for a MIME type.
	 *
	 * @param {string} type
	 * @return {boolean|string}
	 */

	function charset (type) {
	  if (!type || typeof type !== 'string') {
	    return false
	  }

	  // TODO: use media-typer
	  var match = EXTRACT_TYPE_REGEXP.exec(type);
	  var mime = match && db[match[1].toLowerCase()];

	  if (mime && mime.charset) {
	    return mime.charset
	  }

	  // default text/* to utf-8
	  if (match && TEXT_TYPE_REGEXP.test(match[1])) {
	    return 'UTF-8'
	  }

	  return false
	}

	/**
	 * Create a full Content-Type header given a MIME type or extension.
	 *
	 * @param {string} str
	 * @return {boolean|string}
	 */

	function contentType (str) {
	  // TODO: should this even be in this module?
	  if (!str || typeof str !== 'string') {
	    return false
	  }

	  var mime = str.indexOf('/') === -1
	    ? exports.lookup(str)
	    : str;

	  if (!mime) {
	    return false
	  }

	  // TODO: use content-type or other module
	  if (mime.indexOf('charset') === -1) {
	    var charset = exports.charset(mime);
	    if (charset) mime += '; charset=' + charset.toLowerCase();
	  }

	  return mime
	}

	/**
	 * Get the default extension for a MIME type.
	 *
	 * @param {string} type
	 * @return {boolean|string}
	 */

	function extension (type) {
	  if (!type || typeof type !== 'string') {
	    return false
	  }

	  // TODO: use media-typer
	  var match = EXTRACT_TYPE_REGEXP.exec(type);

	  // get extensions
	  var exts = match && exports.extensions[match[1].toLowerCase()];

	  if (!exts || !exts.length) {
	    return false
	  }

	  return exts[0]
	}

	/**
	 * Lookup the MIME type for a file path/extension.
	 *
	 * @param {string} path
	 * @return {boolean|string}
	 */

	function lookup (path) {
	  if (!path || typeof path !== 'string') {
	    return false
	  }

	  // get the extension ("ext" or ".ext" or full path)
	  var extension = extname('x.' + path)
	    .toLowerCase()
	    .substr(1);

	  if (!extension) {
	    return false
	  }

	  return exports.types[extension] || false
	}

	/**
	 * Populate the extensions and types maps.
	 * @private
	 */

	function populateMaps (extensions, types) {
	  // source preference (least -> most)
	  var preference = ['nginx', 'apache', undefined, 'iana'];

	  Object.keys(db).forEach(function forEachMimeType (type) {
	    var mime = db[type];
	    var exts = mime.extensions;

	    if (!exts || !exts.length) {
	      return
	    }

	    // mime -> extensions
	    extensions[type] = exts;

	    // extension -> mime
	    for (var i = 0; i < exts.length; i++) {
	      var extension = exts[i];

	      if (types[extension]) {
	        var from = preference.indexOf(db[types[extension]].source);
	        var to = preference.indexOf(mime.source);

	        if (types[extension] !== 'application/octet-stream' &&
	          (from > to || (from === to && types[extension].substr(0, 12) === 'application/'))) {
	          // skip the remapping
	          continue
	        }
	      }

	      // set the extension -> mime
	      types[extension] = type;
	    }
	  });
	}
} (mimeTypes));

/*!
 * accepts
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

var Negotiator = negotiator.exports;
var mime = mimeTypes;

/**
 * Module exports.
 * @public
 */

var accepts$1 = Accepts;

/**
 * Create a new Accepts object for the given req.
 *
 * @param {object} req
 * @public
 */

function Accepts (req) {
  if (!(this instanceof Accepts)) {
    return new Accepts(req)
  }

  this.headers = req.headers;
  this.negotiator = new Negotiator(req);
}

/**
 * Check if the given `type(s)` is acceptable, returning
 * the best match when true, otherwise `undefined`, in which
 * case you should respond with 406 "Not Acceptable".
 *
 * The `type` value may be a single mime type string
 * such as "application/json", the extension name
 * such as "json" or an array `["json", "html", "text/plain"]`. When a list
 * or array is given the _best_ match, if any is returned.
 *
 * Examples:
 *
 *     // Accept: text/html
 *     this.types('html');
 *     // => "html"
 *
 *     // Accept: text/*, application/json
 *     this.types('html');
 *     // => "html"
 *     this.types('text/html');
 *     // => "text/html"
 *     this.types('json', 'text');
 *     // => "json"
 *     this.types('application/json');
 *     // => "application/json"
 *
 *     // Accept: text/*, application/json
 *     this.types('image/png');
 *     this.types('png');
 *     // => undefined
 *
 *     // Accept: text/*;q=.5, application/json
 *     this.types(['html', 'json']);
 *     this.types('html', 'json');
 *     // => "json"
 *
 * @param {String|Array} types...
 * @return {String|Array|Boolean}
 * @public
 */

Accepts.prototype.type =
Accepts.prototype.types = function (types_) {
  var types = types_;

  // support flattened arguments
  if (types && !Array.isArray(types)) {
    types = new Array(arguments.length);
    for (var i = 0; i < types.length; i++) {
      types[i] = arguments[i];
    }
  }

  // no types, return all requested types
  if (!types || types.length === 0) {
    return this.negotiator.mediaTypes()
  }

  // no accept header, return first given type
  if (!this.headers.accept) {
    return types[0]
  }

  var mimes = types.map(extToMime);
  var accepts = this.negotiator.mediaTypes(mimes.filter(validMime));
  var first = accepts[0];

  return first
    ? types[mimes.indexOf(first)]
    : false
};

/**
 * Return accepted encodings or best fit based on `encodings`.
 *
 * Given `Accept-Encoding: gzip, deflate`
 * an array sorted by quality is returned:
 *
 *     ['gzip', 'deflate']
 *
 * @param {String|Array} encodings...
 * @return {String|Array}
 * @public
 */

Accepts.prototype.encoding =
Accepts.prototype.encodings = function (encodings_) {
  var encodings = encodings_;

  // support flattened arguments
  if (encodings && !Array.isArray(encodings)) {
    encodings = new Array(arguments.length);
    for (var i = 0; i < encodings.length; i++) {
      encodings[i] = arguments[i];
    }
  }

  // no encodings, return all requested encodings
  if (!encodings || encodings.length === 0) {
    return this.negotiator.encodings()
  }

  return this.negotiator.encodings(encodings)[0] || false
};

/**
 * Return accepted charsets or best fit based on `charsets`.
 *
 * Given `Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5`
 * an array sorted by quality is returned:
 *
 *     ['utf-8', 'utf-7', 'iso-8859-1']
 *
 * @param {String|Array} charsets...
 * @return {String|Array}
 * @public
 */

Accepts.prototype.charset =
Accepts.prototype.charsets = function (charsets_) {
  var charsets = charsets_;

  // support flattened arguments
  if (charsets && !Array.isArray(charsets)) {
    charsets = new Array(arguments.length);
    for (var i = 0; i < charsets.length; i++) {
      charsets[i] = arguments[i];
    }
  }

  // no charsets, return all requested charsets
  if (!charsets || charsets.length === 0) {
    return this.negotiator.charsets()
  }

  return this.negotiator.charsets(charsets)[0] || false
};

/**
 * Return accepted languages or best fit based on `langs`.
 *
 * Given `Accept-Language: en;q=0.8, es, pt`
 * an array sorted by quality is returned:
 *
 *     ['es', 'pt', 'en']
 *
 * @param {String|Array} langs...
 * @return {Array|String}
 * @public
 */

Accepts.prototype.lang =
Accepts.prototype.langs =
Accepts.prototype.language =
Accepts.prototype.languages = function (languages_) {
  var languages = languages_;

  // support flattened arguments
  if (languages && !Array.isArray(languages)) {
    languages = new Array(arguments.length);
    for (var i = 0; i < languages.length; i++) {
      languages[i] = arguments[i];
    }
  }

  // no languages, return all requested languages
  if (!languages || languages.length === 0) {
    return this.negotiator.languages()
  }

  return this.negotiator.languages(languages)[0] || false
};

/**
 * Convert extnames to mime.
 *
 * @param {String} type
 * @return {String}
 * @private
 */

function extToMime (type) {
  return type.indexOf('/') === -1
    ? mime.lookup(type)
    : type
}

/**
 * Check if mime is valid.
 *
 * @param {String} type
 * @return {String}
 * @private
 */

function validMime (type) {
  return typeof type === 'string'
}

var safeBuffer = {exports: {}};

/* eslint-disable node/no-deprecated-api */

(function (module, exports) {
	var buffer = require$$0$1;
	var Buffer = buffer.Buffer;

	// alternative to using Object.keys for old browsers
	function copyProps (src, dst) {
	  for (var key in src) {
	    dst[key] = src[key];
	  }
	}
	if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
	  module.exports = buffer;
	} else {
	  // Copy properties from require('buffer')
	  copyProps(buffer, exports);
	  exports.Buffer = SafeBuffer;
	}

	function SafeBuffer (arg, encodingOrOffset, length) {
	  return Buffer(arg, encodingOrOffset, length)
	}

	// Copy static methods from Buffer
	copyProps(Buffer, SafeBuffer);

	SafeBuffer.from = function (arg, encodingOrOffset, length) {
	  if (typeof arg === 'number') {
	    throw new TypeError('Argument must not be a number')
	  }
	  return Buffer(arg, encodingOrOffset, length)
	};

	SafeBuffer.alloc = function (size, fill, encoding) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  var buf = Buffer(size);
	  if (fill !== undefined) {
	    if (typeof encoding === 'string') {
	      buf.fill(fill, encoding);
	    } else {
	      buf.fill(fill);
	    }
	  } else {
	    buf.fill(0);
	  }
	  return buf
	};

	SafeBuffer.allocUnsafe = function (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  return Buffer(size)
	};

	SafeBuffer.allocUnsafeSlow = function (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  return buffer.SlowBuffer(size)
	};
} (safeBuffer, safeBuffer.exports));

var bytes$2 = {exports: {}};

/*!
 * bytes
 * Copyright(c) 2012-2014 TJ Holowaychuk
 * Copyright(c) 2015 Jed Watson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

bytes$2.exports = bytes$1;
bytes$2.exports.format = format;
bytes$2.exports.parse = parse$4;

/**
 * Module variables.
 * @private
 */

var formatThousandsRegExp = /\B(?=(\d{3})+(?!\d))/g;

var formatDecimalsRegExp = /(?:\.0*|(\.[^0]+)0+)$/;

var map = {
  b:  1,
  kb: 1 << 10,
  mb: 1 << 20,
  gb: 1 << 30,
  tb: ((1 << 30) * 1024)
};

var parseRegExp = /^((-|\+)?(\d+(?:\.\d+)?)) *(kb|mb|gb|tb)$/i;

/**
 * Convert the given value in bytes into a string or parse to string to an integer in bytes.
 *
 * @param {string|number} value
 * @param {{
 *  case: [string],
 *  decimalPlaces: [number]
 *  fixedDecimals: [boolean]
 *  thousandsSeparator: [string]
 *  unitSeparator: [string]
 *  }} [options] bytes options.
 *
 * @returns {string|number|null}
 */

function bytes$1(value, options) {
  if (typeof value === 'string') {
    return parse$4(value);
  }

  if (typeof value === 'number') {
    return format(value, options);
  }

  return null;
}

/**
 * Format the given value in bytes into a string.
 *
 * If the value is negative, it is kept as such. If it is a float,
 * it is rounded.
 *
 * @param {number} value
 * @param {object} [options]
 * @param {number} [options.decimalPlaces=2]
 * @param {number} [options.fixedDecimals=false]
 * @param {string} [options.thousandsSeparator=]
 * @param {string} [options.unit=]
 * @param {string} [options.unitSeparator=]
 *
 * @returns {string|null}
 * @public
 */

function format(value, options) {
  if (!Number.isFinite(value)) {
    return null;
  }

  var mag = Math.abs(value);
  var thousandsSeparator = (options && options.thousandsSeparator) || '';
  var unitSeparator = (options && options.unitSeparator) || '';
  var decimalPlaces = (options && options.decimalPlaces !== undefined) ? options.decimalPlaces : 2;
  var fixedDecimals = Boolean(options && options.fixedDecimals);
  var unit = (options && options.unit) || '';

  if (!unit || !map[unit.toLowerCase()]) {
    if (mag >= map.tb) {
      unit = 'TB';
    } else if (mag >= map.gb) {
      unit = 'GB';
    } else if (mag >= map.mb) {
      unit = 'MB';
    } else if (mag >= map.kb) {
      unit = 'KB';
    } else {
      unit = 'B';
    }
  }

  var val = value / map[unit.toLowerCase()];
  var str = val.toFixed(decimalPlaces);

  if (!fixedDecimals) {
    str = str.replace(formatDecimalsRegExp, '$1');
  }

  if (thousandsSeparator) {
    str = str.replace(formatThousandsRegExp, thousandsSeparator);
  }

  return str + unitSeparator + unit;
}

/**
 * Parse the string value into an integer in bytes.
 *
 * If no unit is given, it is assumed the value is in bytes.
 *
 * @param {number|string} val
 *
 * @returns {number|null}
 * @public
 */

function parse$4(val) {
  if (typeof val === 'number' && !isNaN(val)) {
    return val;
  }

  if (typeof val !== 'string') {
    return null;
  }

  // Test if the string passed is valid
  var results = parseRegExp.exec(val);
  var floatValue;
  var unit = 'b';

  if (!results) {
    // Nothing could be extracted from the given string
    floatValue = parseInt(val, 10);
    unit = 'b';
  } else {
    // Retrieve the value and the unit
    floatValue = parseFloat(results[1]);
    unit = results[4].toLowerCase();
  }

  return Math.floor(map[unit] * floatValue);
}

/*!
 * compressible
 * Copyright(c) 2013 Jonathan Ong
 * Copyright(c) 2014 Jeremiah Senkpiel
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

var db = mimeDb.exports;

/**
 * Module variables.
 * @private
 */

var COMPRESSIBLE_TYPE_REGEXP = /^text\/|\+(?:json|text|xml)$/i;
var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;

/**
 * Module exports.
 * @public
 */

var compressible_1 = compressible$1;

/**
 * Checks if a type is compressible.
 *
 * @param {string} type
 * @return {Boolean} compressible
 * @public
 */

function compressible$1 (type) {
  if (!type || typeof type !== 'string') {
    return false
  }

  // strip parameters
  var match = EXTRACT_TYPE_REGEXP.exec(type);
  var mime = match && match[1].toLowerCase();
  var data = db[mime];

  // return database information
  if (data && data.compressible !== undefined) {
    return data.compressible
  }

  // fallback to regexp or unknown
  return COMPRESSIBLE_TYPE_REGEXP.test(mime) || undefined
}

var src = {exports: {}};

var browser = {exports: {}};

var debug$1 = {exports: {}};

/**
 * Helpers.
 */

var ms;
var hasRequiredMs;

function requireMs () {
	if (hasRequiredMs) return ms;
	hasRequiredMs = 1;
	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

	ms = function(val, options) {
	  options = options || {};
	  var type = typeof val;
	  if (type === 'string' && val.length > 0) {
	    return parse(val);
	  } else if (type === 'number' && isNaN(val) === false) {
	    return options.long ? fmtLong(val) : fmtShort(val);
	  }
	  throw new Error(
	    'val is not a non-empty string or a valid number. val=' +
	      JSON.stringify(val)
	  );
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = String(str);
	  if (str.length > 100) {
	    return;
	  }
	  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
	    str
	  );
	  if (!match) {
	    return;
	  }
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	    default:
	      return undefined;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtShort(ms) {
	  if (ms >= d) {
	    return Math.round(ms / d) + 'd';
	  }
	  if (ms >= h) {
	    return Math.round(ms / h) + 'h';
	  }
	  if (ms >= m) {
	    return Math.round(ms / m) + 'm';
	  }
	  if (ms >= s) {
	    return Math.round(ms / s) + 's';
	  }
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtLong(ms) {
	  return plural(ms, d, 'day') ||
	    plural(ms, h, 'hour') ||
	    plural(ms, m, 'minute') ||
	    plural(ms, s, 'second') ||
	    ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, n, name) {
	  if (ms < n) {
	    return;
	  }
	  if (ms < n * 1.5) {
	    return Math.floor(ms / n) + ' ' + name;
	  }
	  return Math.ceil(ms / n) + ' ' + name + 's';
	}
	return ms;
}

var hasRequiredDebug;

function requireDebug () {
	if (hasRequiredDebug) return debug$1.exports;
	hasRequiredDebug = 1;
	(function (module, exports) {
		/**
		 * This is the common logic for both the Node.js and web browser
		 * implementations of `debug()`.
		 *
		 * Expose `debug()` as the module.
		 */

		exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
		exports.coerce = coerce;
		exports.disable = disable;
		exports.enable = enable;
		exports.enabled = enabled;
		exports.humanize = requireMs();

		/**
		 * The currently active debug mode names, and names to skip.
		 */

		exports.names = [];
		exports.skips = [];

		/**
		 * Map of special "%n" handling functions, for the debug "format" argument.
		 *
		 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
		 */

		exports.formatters = {};

		/**
		 * Previous log timestamp.
		 */

		var prevTime;

		/**
		 * Select a color.
		 * @param {String} namespace
		 * @return {Number}
		 * @api private
		 */

		function selectColor(namespace) {
		  var hash = 0, i;

		  for (i in namespace) {
		    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
		    hash |= 0; // Convert to 32bit integer
		  }

		  return exports.colors[Math.abs(hash) % exports.colors.length];
		}

		/**
		 * Create a debugger with the given `namespace`.
		 *
		 * @param {String} namespace
		 * @return {Function}
		 * @api public
		 */

		function createDebug(namespace) {

		  function debug() {
		    // disabled?
		    if (!debug.enabled) return;

		    var self = debug;

		    // set `diff` timestamp
		    var curr = +new Date();
		    var ms = curr - (prevTime || curr);
		    self.diff = ms;
		    self.prev = prevTime;
		    self.curr = curr;
		    prevTime = curr;

		    // turn the `arguments` into a proper Array
		    var args = new Array(arguments.length);
		    for (var i = 0; i < args.length; i++) {
		      args[i] = arguments[i];
		    }

		    args[0] = exports.coerce(args[0]);

		    if ('string' !== typeof args[0]) {
		      // anything else let's inspect with %O
		      args.unshift('%O');
		    }

		    // apply any `formatters` transformations
		    var index = 0;
		    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
		      // if we encounter an escaped % then don't increase the array index
		      if (match === '%%') return match;
		      index++;
		      var formatter = exports.formatters[format];
		      if ('function' === typeof formatter) {
		        var val = args[index];
		        match = formatter.call(self, val);

		        // now we need to remove `args[index]` since it's inlined in the `format`
		        args.splice(index, 1);
		        index--;
		      }
		      return match;
		    });

		    // apply env-specific formatting (colors, etc.)
		    exports.formatArgs.call(self, args);

		    var logFn = debug.log || exports.log || console.log.bind(console);
		    logFn.apply(self, args);
		  }

		  debug.namespace = namespace;
		  debug.enabled = exports.enabled(namespace);
		  debug.useColors = exports.useColors();
		  debug.color = selectColor(namespace);

		  // env-specific initialization logic for debug instances
		  if ('function' === typeof exports.init) {
		    exports.init(debug);
		  }

		  return debug;
		}

		/**
		 * Enables a debug mode by namespaces. This can include modes
		 * separated by a colon and wildcards.
		 *
		 * @param {String} namespaces
		 * @api public
		 */

		function enable(namespaces) {
		  exports.save(namespaces);

		  exports.names = [];
		  exports.skips = [];

		  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
		  var len = split.length;

		  for (var i = 0; i < len; i++) {
		    if (!split[i]) continue; // ignore empty strings
		    namespaces = split[i].replace(/\*/g, '.*?');
		    if (namespaces[0] === '-') {
		      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
		    } else {
		      exports.names.push(new RegExp('^' + namespaces + '$'));
		    }
		  }
		}

		/**
		 * Disable debug output.
		 *
		 * @api public
		 */

		function disable() {
		  exports.enable('');
		}

		/**
		 * Returns true if the given mode name is enabled, false otherwise.
		 *
		 * @param {String} name
		 * @return {Boolean}
		 * @api public
		 */

		function enabled(name) {
		  var i, len;
		  for (i = 0, len = exports.skips.length; i < len; i++) {
		    if (exports.skips[i].test(name)) {
		      return false;
		    }
		  }
		  for (i = 0, len = exports.names.length; i < len; i++) {
		    if (exports.names[i].test(name)) {
		      return true;
		    }
		  }
		  return false;
		}

		/**
		 * Coerce `val`.
		 *
		 * @param {Mixed} val
		 * @return {Mixed}
		 * @api private
		 */

		function coerce(val) {
		  if (val instanceof Error) return val.stack || val.message;
		  return val;
		}
} (debug$1, debug$1.exports));
	return debug$1.exports;
}

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

var hasRequiredBrowser;

function requireBrowser () {
	if (hasRequiredBrowser) return browser.exports;
	hasRequiredBrowser = 1;
	(function (module, exports) {
		exports = module.exports = requireDebug();
		exports.log = log;
		exports.formatArgs = formatArgs;
		exports.save = save;
		exports.load = load;
		exports.useColors = useColors;
		exports.storage = 'undefined' != typeof chrome
		               && 'undefined' != typeof chrome.storage
		                  ? chrome.storage.local
		                  : localstorage();

		/**
		 * Colors.
		 */

		exports.colors = [
		  'lightseagreen',
		  'forestgreen',
		  'goldenrod',
		  'dodgerblue',
		  'darkorchid',
		  'crimson'
		];

		/**
		 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
		 * and the Firebug extension (any Firefox version) are known
		 * to support "%c" CSS customizations.
		 *
		 * TODO: add a `localStorage` variable to explicitly enable/disable colors
		 */

		function useColors() {
		  // NB: In an Electron preload script, document will be defined but not fully
		  // initialized. Since we know we're in Chrome, we'll just detect this case
		  // explicitly
		  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
		    return true;
		  }

		  // is webkit? http://stackoverflow.com/a/16459606/376773
		  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
		  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		    // is firebug? http://stackoverflow.com/a/398120/376773
		    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		    // is firefox >= v31?
		    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
		    // double check webkit in userAgent just in case we are in a worker
		    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
		}

		/**
		 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
		 */

		exports.formatters.j = function(v) {
		  try {
		    return JSON.stringify(v);
		  } catch (err) {
		    return '[UnexpectedJSONParseError]: ' + err.message;
		  }
		};


		/**
		 * Colorize log arguments if enabled.
		 *
		 * @api public
		 */

		function formatArgs(args) {
		  var useColors = this.useColors;

		  args[0] = (useColors ? '%c' : '')
		    + this.namespace
		    + (useColors ? ' %c' : ' ')
		    + args[0]
		    + (useColors ? '%c ' : ' ')
		    + '+' + exports.humanize(this.diff);

		  if (!useColors) return;

		  var c = 'color: ' + this.color;
		  args.splice(1, 0, c, 'color: inherit');

		  // the final "%c" is somewhat tricky, because there could be other
		  // arguments passed either before or after the %c, so we need to
		  // figure out the correct index to insert the CSS into
		  var index = 0;
		  var lastC = 0;
		  args[0].replace(/%[a-zA-Z%]/g, function(match) {
		    if ('%%' === match) return;
		    index++;
		    if ('%c' === match) {
		      // we only are interested in the *last* %c
		      // (the user may have provided their own)
		      lastC = index;
		    }
		  });

		  args.splice(lastC, 0, c);
		}

		/**
		 * Invokes `console.log()` when available.
		 * No-op when `console.log` is not a "function".
		 *
		 * @api public
		 */

		function log() {
		  // this hackery is required for IE8/9, where
		  // the `console.log` function doesn't have 'apply'
		  return 'object' === typeof console
		    && console.log
		    && Function.prototype.apply.call(console.log, console, arguments);
		}

		/**
		 * Save `namespaces`.
		 *
		 * @param {String} namespaces
		 * @api private
		 */

		function save(namespaces) {
		  try {
		    if (null == namespaces) {
		      exports.storage.removeItem('debug');
		    } else {
		      exports.storage.debug = namespaces;
		    }
		  } catch(e) {}
		}

		/**
		 * Load `namespaces`.
		 *
		 * @return {String} returns the previously persisted debug modes
		 * @api private
		 */

		function load() {
		  var r;
		  try {
		    r = exports.storage.debug;
		  } catch(e) {}

		  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
		  if (!r && typeof process !== 'undefined' && 'env' in process) {
		    r = process.env.DEBUG;
		  }

		  return r;
		}

		/**
		 * Enable namespaces listed in `localStorage.debug` initially.
		 */

		exports.enable(load());

		/**
		 * Localstorage attempts to return the localstorage.
		 *
		 * This is necessary because safari throws
		 * when a user disables cookies/localstorage
		 * and you attempt to access it.
		 *
		 * @return {LocalStorage}
		 * @api private
		 */

		function localstorage() {
		  try {
		    return window.localStorage;
		  } catch (e) {}
		}
} (browser, browser.exports));
	return browser.exports;
}

var node = {exports: {}};

/**
 * Module dependencies.
 */

var hasRequiredNode;

function requireNode () {
	if (hasRequiredNode) return node.exports;
	hasRequiredNode = 1;
	(function (module, exports) {
		var tty = require$$0$2;
		var util = require$$1$1;

		/**
		 * This is the Node.js implementation of `debug()`.
		 *
		 * Expose `debug()` as the module.
		 */

		exports = module.exports = requireDebug();
		exports.init = init;
		exports.log = log;
		exports.formatArgs = formatArgs;
		exports.save = save;
		exports.load = load;
		exports.useColors = useColors;

		/**
		 * Colors.
		 */

		exports.colors = [6, 2, 3, 4, 5, 1];

		/**
		 * Build up the default `inspectOpts` object from the environment variables.
		 *
		 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
		 */

		exports.inspectOpts = Object.keys(process.env).filter(function (key) {
		  return /^debug_/i.test(key);
		}).reduce(function (obj, key) {
		  // camel-case
		  var prop = key
		    .substring(6)
		    .toLowerCase()
		    .replace(/_([a-z])/g, function (_, k) { return k.toUpperCase() });

		  // coerce string value into JS value
		  var val = process.env[key];
		  if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
		  else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
		  else if (val === 'null') val = null;
		  else val = Number(val);

		  obj[prop] = val;
		  return obj;
		}, {});

		/**
		 * The file descriptor to write the `debug()` calls to.
		 * Set the `DEBUG_FD` env variable to override with another value. i.e.:
		 *
		 *   $ DEBUG_FD=3 node script.js 3>debug.log
		 */

		var fd = parseInt(process.env.DEBUG_FD, 10) || 2;

		if (1 !== fd && 2 !== fd) {
		  util.deprecate(function(){}, 'except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)')();
		}

		var stream = 1 === fd ? process.stdout :
		             2 === fd ? process.stderr :
		             createWritableStdioStream(fd);

		/**
		 * Is stdout a TTY? Colored output is enabled when `true`.
		 */

		function useColors() {
		  return 'colors' in exports.inspectOpts
		    ? Boolean(exports.inspectOpts.colors)
		    : tty.isatty(fd);
		}

		/**
		 * Map %o to `util.inspect()`, all on a single line.
		 */

		exports.formatters.o = function(v) {
		  this.inspectOpts.colors = this.useColors;
		  return util.inspect(v, this.inspectOpts)
		    .split('\n').map(function(str) {
		      return str.trim()
		    }).join(' ');
		};

		/**
		 * Map %o to `util.inspect()`, allowing multiple lines if needed.
		 */

		exports.formatters.O = function(v) {
		  this.inspectOpts.colors = this.useColors;
		  return util.inspect(v, this.inspectOpts);
		};

		/**
		 * Adds ANSI color escape codes if enabled.
		 *
		 * @api public
		 */

		function formatArgs(args) {
		  var name = this.namespace;
		  var useColors = this.useColors;

		  if (useColors) {
		    var c = this.color;
		    var prefix = '  \u001b[3' + c + ';1m' + name + ' ' + '\u001b[0m';

		    args[0] = prefix + args[0].split('\n').join('\n' + prefix);
		    args.push('\u001b[3' + c + 'm+' + exports.humanize(this.diff) + '\u001b[0m');
		  } else {
		    args[0] = new Date().toUTCString()
		      + ' ' + name + ' ' + args[0];
		  }
		}

		/**
		 * Invokes `util.format()` with the specified arguments and writes to `stream`.
		 */

		function log() {
		  return stream.write(util.format.apply(util, arguments) + '\n');
		}

		/**
		 * Save `namespaces`.
		 *
		 * @param {String} namespaces
		 * @api private
		 */

		function save(namespaces) {
		  if (null == namespaces) {
		    // If you set a process.env field to null or undefined, it gets cast to the
		    // string 'null' or 'undefined'. Just delete instead.
		    delete process.env.DEBUG;
		  } else {
		    process.env.DEBUG = namespaces;
		  }
		}

		/**
		 * Load `namespaces`.
		 *
		 * @return {String} returns the previously persisted debug modes
		 * @api private
		 */

		function load() {
		  return process.env.DEBUG;
		}

		/**
		 * Copied from `node/src/node.js`.
		 *
		 * XXX: It's lame that node doesn't expose this API out-of-the-box. It also
		 * relies on the undocumented `tty_wrap.guessHandleType()` which is also lame.
		 */

		function createWritableStdioStream (fd) {
		  var stream;
		  var tty_wrap = process.binding('tty_wrap');

		  // Note stream._type is used for test-module-load-list.js

		  switch (tty_wrap.guessHandleType(fd)) {
		    case 'TTY':
		      stream = new tty.WriteStream(fd);
		      stream._type = 'tty';

		      // Hack to have stream not keep the event loop alive.
		      // See https://github.com/joyent/node/issues/1726
		      if (stream._handle && stream._handle.unref) {
		        stream._handle.unref();
		      }
		      break;

		    case 'FILE':
		      var fs = fs__default;
		      stream = new fs.SyncWriteStream(fd, { autoClose: false });
		      stream._type = 'fs';
		      break;

		    case 'PIPE':
		    case 'TCP':
		      var net = require$$4;
		      stream = new net.Socket({
		        fd: fd,
		        readable: false,
		        writable: true
		      });

		      // FIXME Should probably have an option in net.Socket to create a
		      // stream from an existing fd which is writable only. But for now
		      // we'll just add this hack and set the `readable` member to false.
		      // Test: ./node test/fixtures/echo.js < /etc/passwd
		      stream.readable = false;
		      stream.read = null;
		      stream._type = 'pipe';

		      // FIXME Hack to have stream not keep the event loop alive.
		      // See https://github.com/joyent/node/issues/1726
		      if (stream._handle && stream._handle.unref) {
		        stream._handle.unref();
		      }
		      break;

		    default:
		      // Probably an error on in uv_guess_handle()
		      throw new Error('Implement me. Unknown stream file type!');
		  }

		  // For supporting legacy API we put the FD here.
		  stream.fd = fd;

		  stream._isStdio = true;

		  return stream;
		}

		/**
		 * Init logic for `debug` instances.
		 *
		 * Create a new `inspectOpts` object in case `useColors` is set
		 * differently for a particular `debug` instance.
		 */

		function init (debug) {
		  debug.inspectOpts = {};

		  var keys = Object.keys(exports.inspectOpts);
		  for (var i = 0; i < keys.length; i++) {
		    debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
		  }
		}

		/**
		 * Enable namespaces listed in `process.env.DEBUG` initially.
		 */

		exports.enable(load());
} (node, node.exports));
	return node.exports;
}

/**
 * Detect Electron renderer process, which is node, but we should
 * treat as a browser.
 */

(function (module) {
	if (typeof process !== 'undefined' && process.type === 'renderer') {
	  module.exports = requireBrowser();
	} else {
	  module.exports = requireNode();
	}
} (src));

/*!
 * on-headers
 * Copyright(c) 2014 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

var onHeaders_1 = onHeaders$1;

/**
 * Create a replacement writeHead method.
 *
 * @param {function} prevWriteHead
 * @param {function} listener
 * @private
 */

function createWriteHead (prevWriteHead, listener) {
  var fired = false;

  // return function with core name and argument list
  return function writeHead (statusCode) {
    // set headers from arguments
    var args = setWriteHeadHeaders.apply(this, arguments);

    // fire listener
    if (!fired) {
      fired = true;
      listener.call(this);

      // pass-along an updated status code
      if (typeof args[0] === 'number' && this.statusCode !== args[0]) {
        args[0] = this.statusCode;
        args.length = 1;
      }
    }

    return prevWriteHead.apply(this, args)
  }
}

/**
 * Execute a listener when a response is about to write headers.
 *
 * @param {object} res
 * @return {function} listener
 * @public
 */

function onHeaders$1 (res, listener) {
  if (!res) {
    throw new TypeError('argument res is required')
  }

  if (typeof listener !== 'function') {
    throw new TypeError('argument listener must be a function')
  }

  res.writeHead = createWriteHead(res.writeHead, listener);
}

/**
 * Set headers contained in array on the response object.
 *
 * @param {object} res
 * @param {array} headers
 * @private
 */

function setHeadersFromArray (res, headers) {
  for (var i = 0; i < headers.length; i++) {
    res.setHeader(headers[i][0], headers[i][1]);
  }
}

/**
 * Set headers contained in object on the response object.
 *
 * @param {object} res
 * @param {object} headers
 * @private
 */

function setHeadersFromObject (res, headers) {
  var keys = Object.keys(headers);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (k) res.setHeader(k, headers[k]);
  }
}

/**
 * Set headers and other properties on the response object.
 *
 * @param {number} statusCode
 * @private
 */

function setWriteHeadHeaders (statusCode) {
  var length = arguments.length;
  var headerIndex = length > 1 && typeof arguments[1] === 'string'
    ? 2
    : 1;

  var headers = length >= headerIndex + 1
    ? arguments[headerIndex]
    : undefined;

  this.statusCode = statusCode;

  if (Array.isArray(headers)) {
    // handle array case
    setHeadersFromArray(this, headers);
  } else if (headers) {
    // handle object case
    setHeadersFromObject(this, headers);
  }

  // copy leading arguments
  var args = new Array(Math.min(length, headerIndex));
  for (var i = 0; i < args.length; i++) {
    args[i] = arguments[i];
  }

  return args
}

var vary$2 = {exports: {}};

/*!
 * vary
 * Copyright(c) 2014-2017 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 */

vary$2.exports = vary$1;
vary$2.exports.append = append;

/**
 * RegExp to match field-name in RFC 7230 sec 3.2
 *
 * field-name    = token
 * token         = 1*tchar
 * tchar         = "!" / "#" / "$" / "%" / "&" / "'" / "*"
 *               / "+" / "-" / "." / "^" / "_" / "`" / "|" / "~"
 *               / DIGIT / ALPHA
 *               ; any VCHAR, except delimiters
 */

var FIELD_NAME_REGEXP = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;

/**
 * Append a field to a vary header.
 *
 * @param {String} header
 * @param {String|Array} field
 * @return {String}
 * @public
 */

function append (header, field) {
  if (typeof header !== 'string') {
    throw new TypeError('header argument is required')
  }

  if (!field) {
    throw new TypeError('field argument is required')
  }

  // get fields array
  var fields = !Array.isArray(field)
    ? parse$3(String(field))
    : field;

  // assert on invalid field names
  for (var j = 0; j < fields.length; j++) {
    if (!FIELD_NAME_REGEXP.test(fields[j])) {
      throw new TypeError('field argument contains an invalid header name')
    }
  }

  // existing, unspecified vary
  if (header === '*') {
    return header
  }

  // enumerate current values
  var val = header;
  var vals = parse$3(header.toLowerCase());

  // unspecified vary
  if (fields.indexOf('*') !== -1 || vals.indexOf('*') !== -1) {
    return '*'
  }

  for (var i = 0; i < fields.length; i++) {
    var fld = fields[i].toLowerCase();

    // append value (case-preserving)
    if (vals.indexOf(fld) === -1) {
      vals.push(fld);
      val = val
        ? val + ', ' + fields[i]
        : fields[i];
    }
  }

  return val
}

/**
 * Parse a vary header into an array.
 *
 * @param {String} header
 * @return {Array}
 * @private
 */

function parse$3 (header) {
  var end = 0;
  var list = [];
  var start = 0;

  // gather tokens
  for (var i = 0, len = header.length; i < len; i++) {
    switch (header.charCodeAt(i)) {
      case 0x20: /*   */
        if (start === end) {
          start = end = i + 1;
        }
        break
      case 0x2c: /* , */
        list.push(header.substring(start, end));
        start = end = i + 1;
        break
      default:
        end = i + 1;
        break
    }
  }

  // final token
  list.push(header.substring(start, end));

  return list
}

/**
 * Mark that a request is varied on a header field.
 *
 * @param {Object} res
 * @param {String|Array} field
 * @public
 */

function vary$1 (res, field) {
  if (!res || !res.getHeader || !res.setHeader) {
    // quack quack
    throw new TypeError('res argument is required')
  }

  // get existing header
  var val = res.getHeader('Vary') || '';
  var header = Array.isArray(val)
    ? val.join(', ')
    : String(val);

  // set new header
  if ((val = append(header, field))) {
    res.setHeader('Vary', val);
  }
}

/*!
 * compression
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

var accepts = accepts$1;
var Buffer$1 = safeBuffer.exports.Buffer;
var bytes = bytes$2.exports;
var compressible = compressible_1;
var debug = src.exports('compression');
var onHeaders = onHeaders_1;
var vary = vary$2.exports;
var zlib = require$$7;

/**
 * Module exports.
 */

compression$1.exports = compression;
compression$1.exports.filter = shouldCompress;

/**
 * Module variables.
 * @private
 */

var cacheControlNoTransformRegExp = /(?:^|,)\s*?no-transform\s*?(?:,|$)/;

/**
 * Compress response data with gzip / deflate.
 *
 * @param {Object} [options]
 * @return {Function} middleware
 * @public
 */

function compression (options) {
  var opts = options || {};

  // options
  var filter = opts.filter || shouldCompress;
  var threshold = bytes.parse(opts.threshold);

  if (threshold == null) {
    threshold = 1024;
  }

  return function compression (req, res, next) {
    var ended = false;
    var length;
    var listeners = [];
    var stream;

    var _end = res.end;
    var _on = res.on;
    var _write = res.write;

    // flush
    res.flush = function flush () {
      if (stream) {
        stream.flush();
      }
    };

    // proxy

    res.write = function write (chunk, encoding) {
      if (ended) {
        return false
      }

      if (!this._header) {
        this._implicitHeader();
      }

      return stream
        ? stream.write(toBuffer(chunk, encoding))
        : _write.call(this, chunk, encoding)
    };

    res.end = function end (chunk, encoding) {
      if (ended) {
        return false
      }

      if (!this._header) {
        // estimate the length
        if (!this.getHeader('Content-Length')) {
          length = chunkLength(chunk, encoding);
        }

        this._implicitHeader();
      }

      if (!stream) {
        return _end.call(this, chunk, encoding)
      }

      // mark ended
      ended = true;

      // write Buffer for Node.js 0.8
      return chunk
        ? stream.end(toBuffer(chunk, encoding))
        : stream.end()
    };

    res.on = function on (type, listener) {
      if (!listeners || type !== 'drain') {
        return _on.call(this, type, listener)
      }

      if (stream) {
        return stream.on(type, listener)
      }

      // buffer listeners for future stream
      listeners.push([type, listener]);

      return this
    };

    function nocompress (msg) {
      debug('no compression: %s', msg);
      addListeners(res, _on, listeners);
      listeners = null;
    }

    onHeaders(res, function onResponseHeaders () {
      // determine if request is filtered
      if (!filter(req, res)) {
        nocompress('filtered');
        return
      }

      // determine if the entity should be transformed
      if (!shouldTransform(req, res)) {
        nocompress('no transform');
        return
      }

      // vary
      vary(res, 'Accept-Encoding');

      // content-length below threshold
      if (Number(res.getHeader('Content-Length')) < threshold || length < threshold) {
        nocompress('size below threshold');
        return
      }

      var encoding = res.getHeader('Content-Encoding') || 'identity';

      // already encoded
      if (encoding !== 'identity') {
        nocompress('already encoded');
        return
      }

      // head
      if (req.method === 'HEAD') {
        nocompress('HEAD request');
        return
      }

      // compression method
      var accept = accepts(req);
      var method = accept.encoding(['gzip', 'deflate', 'identity']);

      // we really don't prefer deflate
      if (method === 'deflate' && accept.encoding(['gzip'])) {
        method = accept.encoding(['gzip', 'identity']);
      }

      // negotiation failed
      if (!method || method === 'identity') {
        nocompress('not acceptable');
        return
      }

      // compression stream
      debug('%s compression', method);
      stream = method === 'gzip'
        ? zlib.createGzip(opts)
        : zlib.createDeflate(opts);

      // add buffered listeners to stream
      addListeners(stream, stream.on, listeners);

      // header fields
      res.setHeader('Content-Encoding', method);
      res.removeHeader('Content-Length');

      // compression
      stream.on('data', function onStreamData (chunk) {
        if (_write.call(res, chunk) === false) {
          stream.pause();
        }
      });

      stream.on('end', function onStreamEnd () {
        _end.call(res);
      });

      _on.call(res, 'drain', function onResponseDrain () {
        stream.resume();
      });
    });

    next();
  }
}

/**
 * Add bufferred listeners to stream
 * @private
 */

function addListeners (stream, on, listeners) {
  for (var i = 0; i < listeners.length; i++) {
    on.apply(stream, listeners[i]);
  }
}

/**
 * Get the length of a given chunk
 */

function chunkLength (chunk, encoding) {
  if (!chunk) {
    return 0
  }

  return !Buffer$1.isBuffer(chunk)
    ? Buffer$1.byteLength(chunk, encoding)
    : chunk.length
}

/**
 * Default filter function.
 * @private
 */

function shouldCompress (req, res) {
  var type = res.getHeader('Content-Type');

  if (type === undefined || !compressible(type)) {
    debug('%s not compressible', type);
    return false
  }

  return true
}

/**
 * Determine if the entity should be transformed.
 * @private
 */

function shouldTransform (req, res) {
  var cacheControl = res.getHeader('Cache-Control');

  // Don't compress for Cache-Control: no-transform
  // https://tools.ietf.org/html/rfc7234#section-5.2.2.4
  return !cacheControl ||
    !cacheControlNoTransformRegExp.test(cacheControl)
}

/**
 * Coerce arguments to Buffer
 * @private
 */

function toBuffer (chunk, encoding) {
  return !Buffer$1.isBuffer(chunk)
    ? Buffer$1.from(chunk, encoding)
    : chunk
}

function parse$2 (str, loose) {
	if (str instanceof RegExp) return { keys:false, pattern:str };
	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
	arr[0] || arr.shift();

	while (tmp = arr.shift()) {
		c = tmp[0];
		if (c === '*') {
			keys.push('wild');
			pattern += '/(.*)';
		} else if (c === ':') {
			o = tmp.indexOf('?', 1);
			ext = tmp.indexOf('.', 1);
			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
		} else {
			pattern += '/' + tmp;
		}
	}

	return {
		keys: keys,
		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
	};
}

class Trouter {
	constructor() {
		this.routes = [];

		this.all = this.add.bind(this, '');
		this.get = this.add.bind(this, 'GET');
		this.head = this.add.bind(this, 'HEAD');
		this.patch = this.add.bind(this, 'PATCH');
		this.options = this.add.bind(this, 'OPTIONS');
		this.connect = this.add.bind(this, 'CONNECT');
		this.delete = this.add.bind(this, 'DELETE');
		this.trace = this.add.bind(this, 'TRACE');
		this.post = this.add.bind(this, 'POST');
		this.put = this.add.bind(this, 'PUT');
	}

	use(route, ...fns) {
		let handlers = [].concat.apply([], fns);
		let { keys, pattern } = parse$2(route, true);
		this.routes.push({ keys, pattern, method:'', handlers });
		return this;
	}

	add(method, route, ...fns) {
		let { keys, pattern } = parse$2(route);
		let handlers = [].concat.apply([], fns);
		this.routes.push({ keys, pattern, method, handlers });
		return this;
	}

	find(method, url) {
		let isHEAD=(method === 'HEAD');
		let i=0, j=0, k, tmp, arr=this.routes;
		let matches=[], params={}, handlers=[];
		for (; i < arr.length; i++) {
			tmp = arr[i];
			if (tmp.method.length === 0 || tmp.method === method || isHEAD && tmp.method === 'GET') {
				if (tmp.keys === false) {
					matches = tmp.pattern.exec(url);
					if (matches === null) continue;
					if (matches.groups !== void 0) for (k in matches.groups) params[k]=matches.groups[k];
					tmp.handlers.length > 1 ? (handlers=handlers.concat(tmp.handlers)) : handlers.push(tmp.handlers[0]);
				} else if (tmp.keys.length > 0) {
					matches = tmp.pattern.exec(url);
					if (matches === null) continue;
					for (j=0; j < tmp.keys.length;) params[tmp.keys[j]]=matches[++j];
					tmp.handlers.length > 1 ? (handlers=handlers.concat(tmp.handlers)) : handlers.push(tmp.handlers[0]);
				} else if (tmp.pattern.test(url)) {
					tmp.handlers.length > 1 ? (handlers=handlers.concat(tmp.handlers)) : handlers.push(tmp.handlers[0]);
				}
			} // else not a match
		}

		return { params, handlers };
	}
}

/**
 * @typedef ParsedURL
 * @type {import('.').ParsedURL}
 */

/**
 * @typedef Request
 * @property {string} url
 * @property {ParsedURL} _parsedUrl
 */

/**
 * @param {Request} req
 * @returns {ParsedURL|void}
 */
function parse$1(req) {
	let raw = req.url;
	if (raw == null) return;

	let prev = req._parsedUrl;
	if (prev && prev.raw === raw) return prev;

	let pathname=raw, search='', query;

	if (raw.length > 1) {
		let idx = raw.indexOf('?', 1);

		if (idx !== -1) {
			search = raw.substring(idx);
			pathname = raw.substring(0, idx);
			if (search.length > 1) {
				query = qs.parse(search.substring(1));
			}
		}
	}

	return req._parsedUrl = { pathname, search, query, raw };
}

function onError(err, req, res) {
	let code = typeof err.status === 'number' && err.status;
	code = res.statusCode = (code && code >= 100 ? code : 500);
	if (typeof err === 'string' || Buffer.isBuffer(err)) res.end(err);
	else res.end(err.message || http.STATUS_CODES[code]);
}

const mount = fn => fn instanceof Polka ? fn.attach : fn;

class Polka extends Trouter {
	constructor(opts={}) {
		super();
		this.parse = parse$1;
		this.server = opts.server;
		this.handler = this.handler.bind(this);
		this.onError = opts.onError || onError; // catch-all handler
		this.onNoMatch = opts.onNoMatch || this.onError.bind(null, { status: 404 });
		this.attach = (req, res) => setImmediate(this.handler, req, res);
	}

	use(base, ...fns) {
		if (base === '/') {
			super.use(base, fns.map(mount));
		} else if (typeof base === 'function' || base instanceof Polka) {
			super.use('/', [base, ...fns].map(mount));
		} else {
			super.use(base,
				(req, _, next) => {
					if (typeof base === 'string') {
						let len = base.length;
						base.startsWith('/') || len++;
						req.url = req.url.substring(len) || '/';
						req.path = req.path.substring(len) || '/';
					} else {
						req.url = req.url.replace(base, '') || '/';
						req.path = req.path.replace(base, '') || '/';
					}
					if (req.url.charAt(0) !== '/') {
						req.url = '/' + req.url;
					}
					next();
				},
				fns.map(mount),
				(req, _, next) => {
					req.path = req._parsedUrl.pathname;
					req.url = req.path + req._parsedUrl.search;
					next();
				}
			);
		}
		return this; // chainable
	}

	listen() {
		(this.server = this.server || http.createServer()).on('request', this.attach);
		this.server.listen.apply(this.server, arguments);
		return this;
	}

	handler(req, res, next) {
		let info = this.parse(req), path = info.pathname;
		let obj = this.find(req.method, req.path=path);

		req.url = path + info.search;
		req.originalUrl = req.originalUrl || req.url;
		req.query = info.query || {};
		req.search = info.search;
		req.params = obj.params;

		if (path.length > 1 && path.indexOf('%', 1) !== -1) {
			for (let k in req.params) {
				try { req.params[k] = decodeURIComponent(req.params[k]); }
				catch (e) { /* malform uri segment */ }
			}
		}

		let i=0, arr=obj.handlers.concat(this.onNoMatch), len=arr.length;
		let loop = async () => res.finished || (i < len) && arr[i++](req, res, next);
		(next = next || (err => err ? this.onError(err, req, res, next) : loop().catch(next)))(); // init
	}
}

function polka (opts) {
	return new Polka(opts);
}

function totalist(dir, callback, pre='') {
	dir = resolve('.', dir);
	let arr = readdirSync(dir);
	let i=0, abs, stats;
	for (; i < arr.length; i++) {
		abs = join(dir, arr[i]);
		stats = statSync(abs);
		stats.isDirectory()
			? totalist(abs, callback, join(pre, arr[i]))
			: callback(join(pre, arr[i]), abs, stats);
	}
}

const mimes = {
  "ez": "application/andrew-inset",
  "aw": "application/applixware",
  "atom": "application/atom+xml",
  "atomcat": "application/atomcat+xml",
  "atomdeleted": "application/atomdeleted+xml",
  "atomsvc": "application/atomsvc+xml",
  "dwd": "application/atsc-dwd+xml",
  "held": "application/atsc-held+xml",
  "rsat": "application/atsc-rsat+xml",
  "bdoc": "application/bdoc",
  "xcs": "application/calendar+xml",
  "ccxml": "application/ccxml+xml",
  "cdfx": "application/cdfx+xml",
  "cdmia": "application/cdmi-capability",
  "cdmic": "application/cdmi-container",
  "cdmid": "application/cdmi-domain",
  "cdmio": "application/cdmi-object",
  "cdmiq": "application/cdmi-queue",
  "cu": "application/cu-seeme",
  "mpd": "application/dash+xml",
  "davmount": "application/davmount+xml",
  "dbk": "application/docbook+xml",
  "dssc": "application/dssc+der",
  "xdssc": "application/dssc+xml",
  "es": "application/ecmascript",
  "ecma": "application/ecmascript",
  "emma": "application/emma+xml",
  "emotionml": "application/emotionml+xml",
  "epub": "application/epub+zip",
  "exi": "application/exi",
  "fdt": "application/fdt+xml",
  "pfr": "application/font-tdpfr",
  "geojson": "application/geo+json",
  "gml": "application/gml+xml",
  "gpx": "application/gpx+xml",
  "gxf": "application/gxf",
  "gz": "application/gzip",
  "hjson": "application/hjson",
  "stk": "application/hyperstudio",
  "ink": "application/inkml+xml",
  "inkml": "application/inkml+xml",
  "ipfix": "application/ipfix",
  "its": "application/its+xml",
  "jar": "application/java-archive",
  "war": "application/java-archive",
  "ear": "application/java-archive",
  "ser": "application/java-serialized-object",
  "class": "application/java-vm",
  "js": "application/javascript",
  "mjs": "application/javascript",
  "json": "application/json",
  "map": "application/json",
  "json5": "application/json5",
  "jsonml": "application/jsonml+json",
  "jsonld": "application/ld+json",
  "lgr": "application/lgr+xml",
  "lostxml": "application/lost+xml",
  "hqx": "application/mac-binhex40",
  "cpt": "application/mac-compactpro",
  "mads": "application/mads+xml",
  "webmanifest": "application/manifest+json",
  "mrc": "application/marc",
  "mrcx": "application/marcxml+xml",
  "ma": "application/mathematica",
  "nb": "application/mathematica",
  "mb": "application/mathematica",
  "mathml": "application/mathml+xml",
  "mbox": "application/mbox",
  "mscml": "application/mediaservercontrol+xml",
  "metalink": "application/metalink+xml",
  "meta4": "application/metalink4+xml",
  "mets": "application/mets+xml",
  "maei": "application/mmt-aei+xml",
  "musd": "application/mmt-usd+xml",
  "mods": "application/mods+xml",
  "m21": "application/mp21",
  "mp21": "application/mp21",
  "mp4s": "application/mp4",
  "m4p": "application/mp4",
  "doc": "application/msword",
  "dot": "application/msword",
  "mxf": "application/mxf",
  "nq": "application/n-quads",
  "nt": "application/n-triples",
  "cjs": "application/node",
  "bin": "application/octet-stream",
  "dms": "application/octet-stream",
  "lrf": "application/octet-stream",
  "mar": "application/octet-stream",
  "so": "application/octet-stream",
  "dist": "application/octet-stream",
  "distz": "application/octet-stream",
  "pkg": "application/octet-stream",
  "bpk": "application/octet-stream",
  "dump": "application/octet-stream",
  "elc": "application/octet-stream",
  "deploy": "application/octet-stream",
  "exe": "application/octet-stream",
  "dll": "application/octet-stream",
  "deb": "application/octet-stream",
  "dmg": "application/octet-stream",
  "iso": "application/octet-stream",
  "img": "application/octet-stream",
  "msi": "application/octet-stream",
  "msp": "application/octet-stream",
  "msm": "application/octet-stream",
  "buffer": "application/octet-stream",
  "oda": "application/oda",
  "opf": "application/oebps-package+xml",
  "ogx": "application/ogg",
  "omdoc": "application/omdoc+xml",
  "onetoc": "application/onenote",
  "onetoc2": "application/onenote",
  "onetmp": "application/onenote",
  "onepkg": "application/onenote",
  "oxps": "application/oxps",
  "relo": "application/p2p-overlay+xml",
  "xer": "application/patch-ops-error+xml",
  "pdf": "application/pdf",
  "pgp": "application/pgp-encrypted",
  "asc": "application/pgp-signature",
  "sig": "application/pgp-signature",
  "prf": "application/pics-rules",
  "p10": "application/pkcs10",
  "p7m": "application/pkcs7-mime",
  "p7c": "application/pkcs7-mime",
  "p7s": "application/pkcs7-signature",
  "p8": "application/pkcs8",
  "ac": "application/pkix-attr-cert",
  "cer": "application/pkix-cert",
  "crl": "application/pkix-crl",
  "pkipath": "application/pkix-pkipath",
  "pki": "application/pkixcmp",
  "pls": "application/pls+xml",
  "ai": "application/postscript",
  "eps": "application/postscript",
  "ps": "application/postscript",
  "provx": "application/provenance+xml",
  "cww": "application/prs.cww",
  "pskcxml": "application/pskc+xml",
  "raml": "application/raml+yaml",
  "rdf": "application/rdf+xml",
  "owl": "application/rdf+xml",
  "rif": "application/reginfo+xml",
  "rnc": "application/relax-ng-compact-syntax",
  "rl": "application/resource-lists+xml",
  "rld": "application/resource-lists-diff+xml",
  "rs": "application/rls-services+xml",
  "rapd": "application/route-apd+xml",
  "sls": "application/route-s-tsid+xml",
  "rusd": "application/route-usd+xml",
  "gbr": "application/rpki-ghostbusters",
  "mft": "application/rpki-manifest",
  "roa": "application/rpki-roa",
  "rsd": "application/rsd+xml",
  "rss": "application/rss+xml",
  "rtf": "application/rtf",
  "sbml": "application/sbml+xml",
  "scq": "application/scvp-cv-request",
  "scs": "application/scvp-cv-response",
  "spq": "application/scvp-vp-request",
  "spp": "application/scvp-vp-response",
  "sdp": "application/sdp",
  "senmlx": "application/senml+xml",
  "sensmlx": "application/sensml+xml",
  "setpay": "application/set-payment-initiation",
  "setreg": "application/set-registration-initiation",
  "shf": "application/shf+xml",
  "siv": "application/sieve",
  "sieve": "application/sieve",
  "smi": "application/smil+xml",
  "smil": "application/smil+xml",
  "rq": "application/sparql-query",
  "srx": "application/sparql-results+xml",
  "gram": "application/srgs",
  "grxml": "application/srgs+xml",
  "sru": "application/sru+xml",
  "ssdl": "application/ssdl+xml",
  "ssml": "application/ssml+xml",
  "swidtag": "application/swid+xml",
  "tei": "application/tei+xml",
  "teicorpus": "application/tei+xml",
  "tfi": "application/thraud+xml",
  "tsd": "application/timestamped-data",
  "toml": "application/toml",
  "trig": "application/trig",
  "ttml": "application/ttml+xml",
  "ubj": "application/ubjson",
  "rsheet": "application/urc-ressheet+xml",
  "td": "application/urc-targetdesc+xml",
  "vxml": "application/voicexml+xml",
  "wasm": "application/wasm",
  "wgt": "application/widget",
  "hlp": "application/winhlp",
  "wsdl": "application/wsdl+xml",
  "wspolicy": "application/wspolicy+xml",
  "xaml": "application/xaml+xml",
  "xav": "application/xcap-att+xml",
  "xca": "application/xcap-caps+xml",
  "xdf": "application/xcap-diff+xml",
  "xel": "application/xcap-el+xml",
  "xns": "application/xcap-ns+xml",
  "xenc": "application/xenc+xml",
  "xhtml": "application/xhtml+xml",
  "xht": "application/xhtml+xml",
  "xlf": "application/xliff+xml",
  "xml": "application/xml",
  "xsl": "application/xml",
  "xsd": "application/xml",
  "rng": "application/xml",
  "dtd": "application/xml-dtd",
  "xop": "application/xop+xml",
  "xpl": "application/xproc+xml",
  "xslt": "application/xml",
  "xspf": "application/xspf+xml",
  "mxml": "application/xv+xml",
  "xhvml": "application/xv+xml",
  "xvml": "application/xv+xml",
  "xvm": "application/xv+xml",
  "yang": "application/yang",
  "yin": "application/yin+xml",
  "zip": "application/zip",
  "3gpp": "video/3gpp",
  "adp": "audio/adpcm",
  "amr": "audio/amr",
  "au": "audio/basic",
  "snd": "audio/basic",
  "mid": "audio/midi",
  "midi": "audio/midi",
  "kar": "audio/midi",
  "rmi": "audio/midi",
  "mxmf": "audio/mobile-xmf",
  "mp3": "audio/mpeg",
  "m4a": "audio/mp4",
  "mp4a": "audio/mp4",
  "mpga": "audio/mpeg",
  "mp2": "audio/mpeg",
  "mp2a": "audio/mpeg",
  "m2a": "audio/mpeg",
  "m3a": "audio/mpeg",
  "oga": "audio/ogg",
  "ogg": "audio/ogg",
  "spx": "audio/ogg",
  "opus": "audio/ogg",
  "s3m": "audio/s3m",
  "sil": "audio/silk",
  "wav": "audio/wav",
  "weba": "audio/webm",
  "xm": "audio/xm",
  "ttc": "font/collection",
  "otf": "font/otf",
  "ttf": "font/ttf",
  "woff": "font/woff",
  "woff2": "font/woff2",
  "exr": "image/aces",
  "apng": "image/apng",
  "avif": "image/avif",
  "bmp": "image/bmp",
  "cgm": "image/cgm",
  "drle": "image/dicom-rle",
  "emf": "image/emf",
  "fits": "image/fits",
  "g3": "image/g3fax",
  "gif": "image/gif",
  "heic": "image/heic",
  "heics": "image/heic-sequence",
  "heif": "image/heif",
  "heifs": "image/heif-sequence",
  "hej2": "image/hej2k",
  "hsj2": "image/hsj2",
  "ief": "image/ief",
  "jls": "image/jls",
  "jp2": "image/jp2",
  "jpg2": "image/jp2",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "jpe": "image/jpeg",
  "jph": "image/jph",
  "jhc": "image/jphc",
  "jpm": "image/jpm",
  "jpx": "image/jpx",
  "jpf": "image/jpx",
  "jxr": "image/jxr",
  "jxra": "image/jxra",
  "jxrs": "image/jxrs",
  "jxs": "image/jxs",
  "jxsc": "image/jxsc",
  "jxsi": "image/jxsi",
  "jxss": "image/jxss",
  "ktx": "image/ktx",
  "ktx2": "image/ktx2",
  "png": "image/png",
  "btif": "image/prs.btif",
  "pti": "image/prs.pti",
  "sgi": "image/sgi",
  "svg": "image/svg+xml",
  "svgz": "image/svg+xml",
  "t38": "image/t38",
  "tif": "image/tiff",
  "tiff": "image/tiff",
  "tfx": "image/tiff-fx",
  "webp": "image/webp",
  "wmf": "image/wmf",
  "disposition-notification": "message/disposition-notification",
  "u8msg": "message/global",
  "u8dsn": "message/global-delivery-status",
  "u8mdn": "message/global-disposition-notification",
  "u8hdr": "message/global-headers",
  "eml": "message/rfc822",
  "mime": "message/rfc822",
  "3mf": "model/3mf",
  "gltf": "model/gltf+json",
  "glb": "model/gltf-binary",
  "igs": "model/iges",
  "iges": "model/iges",
  "msh": "model/mesh",
  "mesh": "model/mesh",
  "silo": "model/mesh",
  "mtl": "model/mtl",
  "obj": "model/obj",
  "stpz": "model/step+zip",
  "stpxz": "model/step-xml+zip",
  "stl": "model/stl",
  "wrl": "model/vrml",
  "vrml": "model/vrml",
  "x3db": "model/x3d+fastinfoset",
  "x3dbz": "model/x3d+binary",
  "x3dv": "model/x3d-vrml",
  "x3dvz": "model/x3d+vrml",
  "x3d": "model/x3d+xml",
  "x3dz": "model/x3d+xml",
  "appcache": "text/cache-manifest",
  "manifest": "text/cache-manifest",
  "ics": "text/calendar",
  "ifb": "text/calendar",
  "coffee": "text/coffeescript",
  "litcoffee": "text/coffeescript",
  "css": "text/css",
  "csv": "text/csv",
  "html": "text/html",
  "htm": "text/html",
  "shtml": "text/html",
  "jade": "text/jade",
  "jsx": "text/jsx",
  "less": "text/less",
  "markdown": "text/markdown",
  "md": "text/markdown",
  "mml": "text/mathml",
  "mdx": "text/mdx",
  "n3": "text/n3",
  "txt": "text/plain",
  "text": "text/plain",
  "conf": "text/plain",
  "def": "text/plain",
  "list": "text/plain",
  "log": "text/plain",
  "in": "text/plain",
  "ini": "text/plain",
  "dsc": "text/prs.lines.tag",
  "rtx": "text/richtext",
  "sgml": "text/sgml",
  "sgm": "text/sgml",
  "shex": "text/shex",
  "slim": "text/slim",
  "slm": "text/slim",
  "spdx": "text/spdx",
  "stylus": "text/stylus",
  "styl": "text/stylus",
  "tsv": "text/tab-separated-values",
  "t": "text/troff",
  "tr": "text/troff",
  "roff": "text/troff",
  "man": "text/troff",
  "me": "text/troff",
  "ms": "text/troff",
  "ttl": "text/turtle",
  "uri": "text/uri-list",
  "uris": "text/uri-list",
  "urls": "text/uri-list",
  "vcard": "text/vcard",
  "vtt": "text/vtt",
  "yaml": "text/yaml",
  "yml": "text/yaml",
  "3gp": "video/3gpp",
  "3g2": "video/3gpp2",
  "h261": "video/h261",
  "h263": "video/h263",
  "h264": "video/h264",
  "m4s": "video/iso.segment",
  "jpgv": "video/jpeg",
  "jpgm": "image/jpm",
  "mj2": "video/mj2",
  "mjp2": "video/mj2",
  "ts": "video/mp2t",
  "mp4": "video/mp4",
  "mp4v": "video/mp4",
  "mpg4": "video/mp4",
  "mpeg": "video/mpeg",
  "mpg": "video/mpeg",
  "mpe": "video/mpeg",
  "m1v": "video/mpeg",
  "m2v": "video/mpeg",
  "ogv": "video/ogg",
  "qt": "video/quicktime",
  "mov": "video/quicktime",
  "webm": "video/webm"
};

function lookup(extn) {
	let tmp = ('' + extn).trim().toLowerCase();
	let idx = tmp.lastIndexOf('.');
	return mimes[!~idx ? tmp : tmp.substring(++idx)];
}

const noop = () => {};

function isMatch(uri, arr) {
	for (let i=0; i < arr.length; i++) {
		if (arr[i].test(uri)) return true;
	}
}

function toAssume(uri, extns) {
	let i=0, x, len=uri.length - 1;
	if (uri.charCodeAt(len) === 47) {
		uri = uri.substring(0, len);
	}

	let arr=[], tmp=`${uri}/index`;
	for (; i < extns.length; i++) {
		x = extns[i] ? `.${extns[i]}` : '';
		if (uri) arr.push(uri + x);
		arr.push(tmp + x);
	}

	return arr;
}

function viaCache(cache, uri, extns) {
	let i=0, data, arr=toAssume(uri, extns);
	for (; i < arr.length; i++) {
		if (data = cache[arr[i]]) return data;
	}
}

function viaLocal(dir, isEtag, uri, extns) {
	let i=0, arr=toAssume(uri, extns);
	let abs, stats, name, headers;
	for (; i < arr.length; i++) {
		abs = normalize(join(dir, name=arr[i]));
		if (abs.startsWith(dir) && fs.existsSync(abs)) {
			stats = fs.statSync(abs);
			if (stats.isDirectory()) continue;
			headers = toHeaders(name, stats, isEtag);
			headers['Cache-Control'] = isEtag ? 'no-cache' : 'no-store';
			return { abs, stats, headers };
		}
	}
}

function is404(req, res) {
	return (res.statusCode=404,res.end());
}

function send(req, res, file, stats, headers) {
	let code=200, tmp, opts={};
	headers = { ...headers };

	for (let key in headers) {
		tmp = res.getHeader(key);
		if (tmp) headers[key] = tmp;
	}

	if (tmp = res.getHeader('content-type')) {
		headers['Content-Type'] = tmp;
	}

	if (req.headers.range) {
		code = 206;
		let [x, y] = req.headers.range.replace('bytes=', '').split('-');
		let end = opts.end = parseInt(y, 10) || stats.size - 1;
		let start = opts.start = parseInt(x, 10) || 0;

		if (start >= stats.size || end >= stats.size) {
			res.setHeader('Content-Range', `bytes */${stats.size}`);
			res.statusCode = 416;
			return res.end();
		}

		headers['Content-Range'] = `bytes ${start}-${end}/${stats.size}`;
		headers['Content-Length'] = (end - start + 1);
		headers['Accept-Ranges'] = 'bytes';
	}

	res.writeHead(code, headers);
	fs.createReadStream(file, opts).pipe(res);
}

const ENCODING = {
	'.br': 'br',
	'.gz': 'gzip',
};

function toHeaders(name, stats, isEtag) {
	let enc = ENCODING[name.slice(-3)];

	let ctype = lookup(name.slice(0, enc && -3)) || '';
	if (ctype === 'text/html') ctype += ';charset=utf-8';

	let headers = {
		'Content-Length': stats.size,
		'Content-Type': ctype,
		'Last-Modified': stats.mtime.toUTCString(),
	};

	if (enc) headers['Content-Encoding'] = enc;
	if (isEtag) headers['ETag'] = `W/"${stats.size}-${stats.mtime.getTime()}"`;

	return headers;
}

function sirv (dir, opts={}) {
	dir = resolve(dir || '.');

	let isNotFound = opts.onNoMatch || is404;
	let setHeaders = opts.setHeaders || noop;

	let extensions = opts.extensions || ['html', 'htm'];
	let gzips = opts.gzip && extensions.map(x => `${x}.gz`).concat('gz');
	let brots = opts.brotli && extensions.map(x => `${x}.br`).concat('br');

	const FILES = {};

	let fallback = '/';
	let isEtag = !!opts.etag;
	let isSPA = !!opts.single;
	if (typeof opts.single === 'string') {
		let idx = opts.single.lastIndexOf('.');
		fallback += !!~idx ? opts.single.substring(0, idx) : opts.single;
	}

	let ignores = [];
	if (opts.ignores !== false) {
		ignores.push(/[/]([A-Za-z\s\d~$._-]+\.\w+){1,}$/); // any extn
		if (opts.dotfiles) ignores.push(/\/\.\w/);
		else ignores.push(/\/\.well-known/);
		[].concat(opts.ignores || []).forEach(x => {
			ignores.push(new RegExp(x, 'i'));
		});
	}

	let cc = opts.maxAge != null && `public,max-age=${opts.maxAge}`;
	if (cc && opts.immutable) cc += ',immutable';
	else if (cc && opts.maxAge === 0) cc += ',must-revalidate';

	if (!opts.dev) {
		totalist(dir, (name, abs, stats) => {
			if (/\.well-known[\\+\/]/.test(name)) ; // keep
			else if (!opts.dotfiles && /(^\.|[\\+|\/+]\.)/.test(name)) return;

			let headers = toHeaders(name, stats, isEtag);
			if (cc) headers['Cache-Control'] = cc;

			FILES['/' + name.normalize().replace(/\\+/g, '/')] = { abs, stats, headers };
		});
	}

	let lookup = opts.dev ? viaLocal.bind(0, dir, isEtag) : viaCache.bind(0, FILES);

	return function (req, res, next) {
		let extns = [''];
		let pathname = parse$1(req).pathname;
		let val = req.headers['accept-encoding'] || '';
		if (gzips && val.includes('gzip')) extns.unshift(...gzips);
		if (brots && /(br|brotli)/i.test(val)) extns.unshift(...brots);
		extns.push(...extensions); // [...br, ...gz, orig, ...exts]

		if (pathname.indexOf('%') !== -1) {
			try { pathname = decodeURIComponent(pathname); }
			catch (err) { /* malform uri */ }
		}

		let data = lookup(pathname, extns) || isSPA && !isMatch(pathname, ignores) && lookup(fallback, extns);
		if (!data) return next ? next() : isNotFound(req, res);

		if (isEtag && req.headers['if-none-match'] === data.headers['ETag']) {
			res.writeHead(304);
			return res.end();
		}

		if (gzips || brots) {
			res.setHeader('Vary', 'Accept-Encoding');
		}

		setHeaders(res, pathname, data.stats);
		send(req, res, data.abs, data.stats, data.headers);
	};
}

var multipart = {};

/**
 * Multipart Parser (Finite State Machine)
 * usage:
 * const multipart = require('./multipart.js');
 * const body = multipart.DemoData(); 							   // raw body
 * const body = Buffer.from(event['body-json'].toString(),'base64'); // AWS case
 * const boundary = multipart.getBoundary(event.params.header['content-type']);
 * const parts = multipart.Parse(body,boundary);
 * each part is:
 * { filename: 'A.txt', type: 'text/plain', data: <Buffer 41 41 41 41 42 42 42 42> }
 *  or { name: 'key', data: <Buffer 41 41 41 41 42 42 42 42> }
 */
Object.defineProperty(multipart, "__esModule", { value: true });
multipart.DemoData = multipart.getBoundary = multipart.parse = void 0;
function parse(multipartBodyBuffer, boundary) {
    var lastline = '';
    var header = '';
    var info = '';
    var state = 0;
    var buffer = [];
    var allParts = [];
    for (var i = 0; i < multipartBodyBuffer.length; i++) {
        var oneByte = multipartBodyBuffer[i];
        var prevByte = i > 0 ? multipartBodyBuffer[i - 1] : null;
        var newLineDetected = oneByte === 0x0a && prevByte === 0x0d ? true : false;
        var newLineChar = oneByte === 0x0a || oneByte === 0x0d ? true : false;
        if (!newLineChar)
            lastline += String.fromCharCode(oneByte);
        if (0 === state && newLineDetected) {
            if ('--' + boundary === lastline) {
                state = 1;
            }
            lastline = '';
        }
        else if (1 === state && newLineDetected) {
            header = lastline;
            state = 2;
            if (header.indexOf('filename') === -1) {
                state = 3;
            }
            lastline = '';
        }
        else if (2 === state && newLineDetected) {
            info = lastline;
            state = 3;
            lastline = '';
        }
        else if (3 === state && newLineDetected) {
            state = 4;
            buffer = [];
            lastline = '';
        }
        else if (4 === state) {
            if (lastline.length > boundary.length + 4)
                lastline = ''; // mem save
            if ('--' + boundary === lastline) {
                var j = buffer.length - lastline.length;
                var part = buffer.slice(0, j - 1);
                var p = { header: header, info: info, part: part };
                allParts.push(process$1(p));
                buffer = [];
                lastline = '';
                state = 5;
                header = '';
                info = '';
            }
            else {
                buffer.push(oneByte);
            }
            if (newLineDetected)
                lastline = '';
        }
        else if (5 === state) {
            if (newLineDetected)
                state = 1;
        }
    }
    return allParts;
}
multipart.parse = parse;
//  read the boundary from the content-type header sent by the http client
//  this value may be similar to:
//  'multipart/form-data; boundary=----WebKitFormBoundaryvm5A9tzU1ONaGP5B',
function getBoundary(header) {
    var items = header.split(';');
    if (items) {
        for (var i = 0; i < items.length; i++) {
            var item = new String(items[i]).trim();
            if (item.indexOf('boundary') >= 0) {
                var k = item.split('=');
                return new String(k[1]).trim().replace(/^["']|["']$/g, "");
            }
        }
    }
    return '';
}
multipart.getBoundary = getBoundary;
function DemoData() {
    var body = 'trash1\r\n';
    body += '------WebKitFormBoundaryvef1fLxmoUdYZWXp\r\n';
    body +=
        'Content-Disposition: form-data; name="uploads[]"; filename="A.txt"\r\n';
    body += 'Content-Type: text/plain\r\n';
    body += '\r\n';
    body += '@11X';
    body += '111Y\r\n';
    body += '111Z\rCCCC\nCCCC\r\nCCCCC@\r\n\r\n';
    body += '------WebKitFormBoundaryvef1fLxmoUdYZWXp\r\n';
    body +=
        'Content-Disposition: form-data; name="uploads[]"; filename="B.txt"\r\n';
    body += 'Content-Type: text/plain\r\n';
    body += '\r\n';
    body += '@22X';
    body += '222Y\r\n';
    body += '222Z\r222W\n2220\r\n666@\r\n';
    body += '------WebKitFormBoundaryvef1fLxmoUdYZWXp\r\n';
    body += 'Content-Disposition: form-data; name="input1"\r\n';
    body += '\r\n';
    body += 'value1\r\n';
    body += '------WebKitFormBoundaryvef1fLxmoUdYZWXp--\r\n';
    return {
        body: Buffer.from(body),
        boundary: '----WebKitFormBoundaryvef1fLxmoUdYZWXp'
    };
}
multipart.DemoData = DemoData;
function process$1(part) {
    // will transform this object:
    // { header: 'Content-Disposition: form-data; name="uploads[]"; filename="A.txt"',
    // info: 'Content-Type: text/plain',
    // part: 'AAAABBBB' }
    // into this one:
    // { filename: 'A.txt', type: 'text/plain', data: <Buffer 41 41 41 41 42 42 42 42> }
    var obj = function (str) {
        var k = str.split('=');
        var a = k[0].trim();
        var b = JSON.parse(k[1].trim());
        var o = {};
        Object.defineProperty(o, a, {
            value: b,
            writable: true,
            enumerable: true,
            configurable: true
        });
        return o;
    };
    var header = part.header.split(';');
    var filenameData = header[2];
    var input = {};
    if (filenameData) {
        input = obj(filenameData);
        var contentType = part.info.split(':')[1].trim();
        Object.defineProperty(input, 'type', {
            value: contentType,
            writable: true,
            enumerable: true,
            configurable: true
        });
    }
    // always process the name field 
    Object.defineProperty(input, 'name', {
        value: header[1].split('=')[1].replace(/"/g, ''),
        writable: true,
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(input, 'data', {
        value: Buffer.from(part.part),
        writable: true,
        enumerable: true,
        configurable: true
    });
    return input;
}

function nodeToWeb(nodeStream) {
  var destroyed = false;
  var listeners = {};

  function start(controller) {
    listeners["data"] = onData;
    listeners["end"] = onData;
    listeners["end"] = onDestroy;
    listeners["close"] = onDestroy;
    listeners["error"] = onDestroy;
    for (var name in listeners) nodeStream.on(name, listeners[name]);

    nodeStream.pause();

    function onData(chunk) {
      if (destroyed) return;
      controller.enqueue(chunk);
      nodeStream.pause();
    }

    function onDestroy(err) {
      if (destroyed) return;
      destroyed = true;

      for (var name in listeners) nodeStream.removeListener(name, listeners[name]);

      if (err) controller.error(err);
      else controller.close();
    }
  }

  function pull() {
    if (destroyed) return;
    nodeStream.resume();
  }

  function cancel() {
    destroyed = true;

    for (var name in listeners) nodeStream.removeListener(name, listeners[name]);

    nodeStream.push(null);
    nodeStream.pause();
    if (nodeStream.destroy) nodeStream.destroy();
    else if (nodeStream.close) nodeStream.close();
  }

  return new ReadableStream({ start: start, pull: pull, cancel: cancel });
}

function createHeaders(requestHeaders) {
  let headers = new Headers$1();

  for (let [key, values] of Object.entries(requestHeaders)) {
    if (values) {
      if (Array.isArray(values)) {
        for (const value of values) {
          headers.append(key, value);
        }
      } else {
        headers.set(key, values);
      }
    }
  }

  return headers;
}

class NodeRequest extends Request$1 {
  constructor(input, init) {
    if (init && init.data && init.data.on) {
      init = {
        ...init,
        body: init.data.headers["content-type"].includes("x-www") ? init.data : nodeToWeb(init.data)
      };
    }

    super(input, init);
  }

  // async json() {
  //   return JSON.parse(await this.text());
  // }

  async buffer() {
    return Buffer.from(await super.arrayBuffer());
  }

  // async text() {
  //   return (await this.buffer()).toString();
  // }

  async formData() {
    if (this.headers.get("content-type") === "application/x-www-form-urlencoded") {
      return await super.formData();
    } else {
      const data = await this.buffer();
      const input = multipart.parse(
        data,
        this.headers.get("content-type").replace("multipart/form-data; boundary=", "")
      );
      const form = new FormData();
      input.forEach(({ name, data }) => {
        form.set(name, data);
      });
      return form;
    }
  }

  clone() {
    let el = super.clone();
    el.buffer = this.buffer.bind(el);
    el.formData = this.formData.bind(el);
    return el;
  }
}

function createRequest(req) {
  let origin = req.headers.origin || `http://${req.headers.host}`;
  let url = new URL(req.url, origin);

  let init = {
    method: req.method,
    headers: createHeaders(req.headers),
    // POST, PUT, & PATCH will be read as body by NodeRequest
    data: req.method.indexOf("P") === 0 ? req : null
  };

  return new NodeRequest(url.href, init);
}

global.onunhandledrejection = (err, promise) => {
  console.error(err);
  console.error(promise);
};

function createServer({ handler, paths, env }) {
  const comp = compression$1.exports({
    threshold: 0,
    filter: req => {
      return !req.headers["accept"]?.startsWith("text/event-stream");
    }
  });
  const assets_handler = fs__default.existsSync(paths.assets)
    ? sirv(paths.assets, {
        maxAge: 31536000,
        immutable: true
      })
    : (_req, _res, next) => next();

  const render = async (req, res) => {
    try {
      env.getStaticHTML = async assetPath => {
        let text = await readFile(join(paths.assets, assetPath + ".html"), "utf8");
        return new Response(text, {
          headers: {
            "content-type": "text/html"
          }
        });
      };

      const webRes = await handler({
        request: createRequest(req),
        env
      });

      res.statusCode = webRes.status;
      res.statusMessage = webRes.statusText;

      for (const [name, value] of webRes.headers) {
        res.setHeader(name, value);
      }

      if (webRes.body) {
        const readable = Readable.from(webRes.body);
        readable.pipe(res);
        await once(readable, "end");
      } else {
        res.end();
      }
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.statusMessage = "Internal Server Error";
      res.end();
    }
  };

  const server = polka().use("/", comp, assets_handler).use(comp, render);

  return server;
}

Object.assign(globalThis, Streams, {
  Request: Request$1,
  Response: Response$1,
  fetch: fetch$1,
  Headers: Headers$1,
  crypto: crypto.webcrypto
});

var manifest = {
	"/apps": [
	{
		type: "script",
		href: "/apps.ea66ae2c.js"
	},
	{
		type: "script",
		href: "/index.63c3418c.js"
	},
	{
		type: "style",
		href: "/index.cf2b2e96.css"
	},
	{
		type: "script",
		href: "/Tab.81eba0f1.js"
	},
	{
		type: "script",
		href: "/Games.49d8852b.js"
	}
],
	"/settings": [
	{
		type: "script",
		href: "/Tab.81eba0f1.js"
	},
	{
		type: "script",
		href: "/Games.49d8852b.js"
	},
	{
		type: "script",
		href: "/index.63c3418c.js"
	},
	{
		type: "style",
		href: "/index.cf2b2e96.css"
	}
],
	"/games": [
	{
		type: "script",
		href: "/games.d02f294c.js"
	},
	{
		type: "script",
		href: "/index.63c3418c.js"
	},
	{
		type: "style",
		href: "/index.cf2b2e96.css"
	},
	{
		type: "script",
		href: "/Games.49d8852b.js"
	},
	{
		type: "script",
		href: "/Tab.81eba0f1.js"
	}
],
	"/": [
	{
		type: "script",
		href: "/index.8dd19cf1.js"
	},
	{
		type: "script",
		href: "/index.63c3418c.js"
	},
	{
		type: "style",
		href: "/index.cf2b2e96.css"
	},
	{
		type: "script",
		href: "/Games.49d8852b.js"
	},
	{
		type: "script",
		href: "/Tab.81eba0f1.js"
	},
	{
		type: "style",
		href: "/index.7172a96a.css"
	}
],
	"/partners": [
	{
		type: "script",
		href: "/partners.6bfd05ae.js"
	},
	{
		type: "script",
		href: "/index.63c3418c.js"
	},
	{
		type: "style",
		href: "/index.cf2b2e96.css"
	},
	{
		type: "script",
		href: "/Tab.81eba0f1.js"
	},
	{
		type: "script",
		href: "/Games.49d8852b.js"
	}
],
	"/privacy": [
	{
		type: "script",
		href: "/privacy.9b977e66.js"
	},
	{
		type: "script",
		href: "/index.63c3418c.js"
	},
	{
		type: "style",
		href: "/index.cf2b2e96.css"
	},
	{
		type: "script",
		href: "/Tab.81eba0f1.js"
	},
	{
		type: "script",
		href: "/Games.49d8852b.js"
	}
],
	"/search": [
	{
		type: "script",
		href: "/search.10f948cf.js"
	},
	{
		type: "script",
		href: "/index.63c3418c.js"
	},
	{
		type: "style",
		href: "/index.cf2b2e96.css"
	},
	{
		type: "script",
		href: "/Games.49d8852b.js"
	}
],
	"/services": [
	{
		type: "script",
		href: "/services.da432004.js"
	},
	{
		type: "script",
		href: "/index.63c3418c.js"
	},
	{
		type: "style",
		href: "/index.cf2b2e96.css"
	},
	{
		type: "script",
		href: "/Tab.81eba0f1.js"
	},
	{
		type: "script",
		href: "/Games.49d8852b.js"
	}
],
	"/supporters": [
	{
		type: "script",
		href: "/supporters.6de82d06.js"
	},
	{
		type: "script",
		href: "/index.63c3418c.js"
	},
	{
		type: "style",
		href: "/index.cf2b2e96.css"
	},
	{
		type: "script",
		href: "/Tab.81eba0f1.js"
	},
	{
		type: "script",
		href: "/Games.49d8852b.js"
	}
],
	"/*404": [
	{
		type: "script",
		href: "/_...404_.0cdb4451.js"
	},
	{
		type: "script",
		href: "/index.63c3418c.js"
	},
	{
		type: "style",
		href: "/index.cf2b2e96.css"
	},
	{
		type: "script",
		href: "/Tab.81eba0f1.js"
	},
	{
		type: "script",
		href: "/Games.49d8852b.js"
	}
],
	"/changelog/": [
	{
		type: "script",
		href: "/index.b594107b.js"
	},
	{
		type: "script",
		href: "/index.63c3418c.js"
	},
	{
		type: "style",
		href: "/index.cf2b2e96.css"
	},
	{
		type: "script",
		href: "/Changes.ab956cb8.js"
	},
	{
		type: "script",
		href: "/Tab.81eba0f1.js"
	},
	{
		type: "script",
		href: "/Games.49d8852b.js"
	}
],
	"/changelog/:any": [
	{
		type: "script",
		href: "/_any_.0a9a1129.js"
	},
	{
		type: "script",
		href: "/index.63c3418c.js"
	},
	{
		type: "style",
		href: "/index.cf2b2e96.css"
	},
	{
		type: "script",
		href: "/_...404_.0cdb4451.js"
	},
	{
		type: "script",
		href: "/Tab.81eba0f1.js"
	},
	{
		type: "script",
		href: "/Games.49d8852b.js"
	},
	{
		type: "script",
		href: "/Changes.ab956cb8.js"
	}
],
	"/game/:any": [
	{
		type: "script",
		href: "/_any_.05d63eaf.js"
	},
	{
		type: "script",
		href: "/index.63c3418c.js"
	},
	{
		type: "style",
		href: "/index.cf2b2e96.css"
	},
	{
		type: "script",
		href: "/_...404_.0cdb4451.js"
	},
	{
		type: "script",
		href: "/Tab.81eba0f1.js"
	},
	{
		type: "script",
		href: "/Games.49d8852b.js"
	}
],
	"entry-client": [
],
	"index.html": [
	{
		type: "script",
		href: "/index.63c3418c.js"
	},
	{
		type: "style",
		href: "/index.cf2b2e96.css"
	}
]
};

const sharedConfig = {};

const booleans = ["allowfullscreen", "async", "autofocus", "autoplay", "checked", "controls", "default", "disabled", "formnovalidate", "hidden", "indeterminate", "ismap", "loop", "multiple", "muted", "nomodule", "novalidate", "open", "playsinline", "readonly", "required", "reversed", "seamless", "selected"];
/*#__PURE__*/new Set(["className", "value", "readOnly", "formNoValidate", "isMap", "noModule", "playsInline", ...booleans]);
function ssr(t, ...nodes) {
  if (nodes.length) {
    let result = "";
    for (let i = 0; i < nodes.length; i++) {
      result += t[i];
      const node = nodes[i];
      if (node !== undefined) result += resolveSSRNode(node);
    }
    t = result + t[nodes.length];
  }
  return {
    t
  };
}
function resolveSSRNode(node) {
  const t = typeof node;
  if (t === "string") return node;
  if (node == null || t === "boolean") return "";
  if (Array.isArray(node)) {
    let mapped = "";
    for (let i = 0, len = node.length; i < len; i++) mapped += resolveSSRNode(node[i]);
    return mapped;
  }
  if (t === "object") return node.t;
  if (t === "function") return resolveSSRNode(node());
  return String(node);
}

var fuzzysort = {exports: {}};

(function (module) {
((root, UMD) => {
	  if(module.exports) module.exports = UMD();
	  else root['fuzzysort'] = UMD();
	})(commonjsGlobal, _ => {


	  var single = (search, target) => {                                                                                                                                                                                                                        if(search=='farzher')return {target:"farzher was here (^-^*)/",score:0,_indexes:[0]}
	    if(!search || !target) return NULL

	    var preparedSearch = getPreparedSearch(search);
	    if(!isObj(target)) target = getPrepared(target);

	    var searchBitflags = preparedSearch.bitflags;
	    if((searchBitflags & target._bitflags) !== searchBitflags) return NULL

	    return algorithm(preparedSearch, target)
	  };


	  var go = (search, targets, options) => {                                                                                                                                                                                                                  if(search=='farzher')return [{target:"farzher was here (^-^*)/",score:0,_indexes:[0],obj:targets?targets[0]:NULL}]
	    if(!search) return options&&options.all ? all(search, targets, options) : noResults

	    var preparedSearch = getPreparedSearch(search);
	    var searchBitflags = preparedSearch.bitflags;
	    preparedSearch.containsSpace;

	    var threshold = options&&options.threshold || INT_MIN;
	    var limit     = options&&options['limit']  || INT_MAX; // for some reason only limit breaks when minified

	    var resultsLen = 0; var limitedCount = 0;
	    var targetsLen = targets.length;

	    // This code is copy/pasted 3 times for performance reasons [options.keys, options.key, no keys]

	    // options.key
	    if(options && options.key) {
	      var key = options.key;
	      for(var i = 0; i < targetsLen; ++i) { var obj = targets[i];
	        var target = getValue(obj, key);
	        if(!target) continue
	        if(!isObj(target)) target = getPrepared(target);

	        if((searchBitflags & target._bitflags) !== searchBitflags) continue
	        var result = algorithm(preparedSearch, target);
	        if(result === NULL) continue
	        if(result.score < threshold) continue

	        // have to clone result so duplicate targets from different obj can each reference the correct obj
	        result = {target:result.target, _targetLower:'', _targetLowerCodes:NULL, _nextBeginningIndexes:NULL, _bitflags:0, score:result.score, _indexes:result._indexes, obj:obj}; // hidden

	        if(resultsLen < limit) { q.add(result); ++resultsLen; }
	        else {
	          ++limitedCount;
	          if(result.score > q.peek().score) q.replaceTop(result);
	        }
	      }

	    // options.keys
	    } else if(options && options.keys) {
	      var scoreFn = options['scoreFn'] || defaultScoreFn;
	      var keys = options.keys;
	      var keysLen = keys.length;
	      for(var i = 0; i < targetsLen; ++i) { var obj = targets[i];
	        var objResults = new Array(keysLen);
	        for (var keyI = 0; keyI < keysLen; ++keyI) {
	          var key = keys[keyI];
	          var target = getValue(obj, key);
	          if(!target) { objResults[keyI] = NULL; continue }
	          if(!isObj(target)) target = getPrepared(target);

	          if((searchBitflags & target._bitflags) !== searchBitflags) objResults[keyI] = NULL;
	          else objResults[keyI] = algorithm(preparedSearch, target);
	        }
	        objResults.obj = obj; // before scoreFn so scoreFn can use it
	        var score = scoreFn(objResults);
	        if(score === NULL) continue
	        if(score < threshold) continue
	        objResults.score = score;
	        if(resultsLen < limit) { q.add(objResults); ++resultsLen; }
	        else {
	          ++limitedCount;
	          if(score > q.peek().score) q.replaceTop(objResults);
	        }
	      }

	    // no keys
	    } else {
	      for(var i = 0; i < targetsLen; ++i) { var target = targets[i];
	        if(!target) continue
	        if(!isObj(target)) target = getPrepared(target);

	        if((searchBitflags & target._bitflags) !== searchBitflags) continue
	        var result = algorithm(preparedSearch, target);
	        if(result === NULL) continue
	        if(result.score < threshold) continue
	        if(resultsLen < limit) { q.add(result); ++resultsLen; }
	        else {
	          ++limitedCount;
	          if(result.score > q.peek().score) q.replaceTop(result);
	        }
	      }
	    }

	    if(resultsLen === 0) return noResults
	    var results = new Array(resultsLen);
	    for(var i = resultsLen - 1; i >= 0; --i) results[i] = q.poll();
	    results.total = resultsLen + limitedCount;
	    return results
	  };


	  var highlight = (result, hOpen, hClose) => {
	    if(typeof hOpen === 'function') return highlightCallback(result, hOpen)
	    if(result === NULL) return NULL
	    if(hOpen === undefined) hOpen = '<b>';
	    if(hClose === undefined) hClose = '</b>';
	    var highlighted = '';
	    var matchesIndex = 0;
	    var opened = false;
	    var target = result.target;
	    var targetLen = target.length;
	    var indexes = result._indexes;
	    indexes = indexes.slice(0, indexes.len).sort((a,b)=>a-b);
	    for(var i = 0; i < targetLen; ++i) { var char = target[i];
	      if(indexes[matchesIndex] === i) {
	        ++matchesIndex;
	        if(!opened) { opened = true;
	          highlighted += hOpen;
	        }

	        if(matchesIndex === indexes.length) {
	          highlighted += char + hClose + target.substr(i+1);
	          break
	        }
	      } else {
	        if(opened) { opened = false;
	          highlighted += hClose;
	        }
	      }
	      highlighted += char;
	    }

	    return highlighted
	  };
	  var highlightCallback = (result, cb) => {
	    if(result === NULL) return NULL
	    var target = result.target;
	    var targetLen = target.length;
	    var indexes = result._indexes;
	    indexes = indexes.slice(0, indexes.len).sort((a,b)=>a-b);
	    var highlighted = '';
	    var matchI = 0;
	    var indexesI = 0;
	    var opened = false;
	    var result = [];
	    for(var i = 0; i < targetLen; ++i) { var char = target[i];
	      if(indexes[indexesI] === i) {
	        ++indexesI;
	        if(!opened) { opened = true;
	          result.push(highlighted); highlighted = '';
	        }

	        if(indexesI === indexes.length) {
	          highlighted += char;
	          result.push(cb(highlighted, matchI++)); highlighted = '';
	          result.push(target.substr(i+1));
	          break
	        }
	      } else {
	        if(opened) { opened = false;
	          result.push(cb(highlighted, matchI++)); highlighted = '';
	        }
	      }
	      highlighted += char;
	    }
	    return result
	  };


	  var indexes = result => result._indexes.slice(0, result._indexes.len).sort((a,b)=>a-b);


	  var prepare = (target) => {
	    if(typeof target !== 'string') target = '';
	    var info = prepareLowerInfo(target);
	    return {'target':target, _targetLower:info._lower, _targetLowerCodes:info.lowerCodes, _nextBeginningIndexes:NULL, _bitflags:info.bitflags, 'score':NULL, _indexes:[0], 'obj':NULL} // hidden
	  };


	  // Below this point is only internal code
	  // Below this point is only internal code
	  // Below this point is only internal code
	  // Below this point is only internal code


	  var prepareSearch = (search) => {
	    if(typeof search !== 'string') search = '';
	    search = search.trim();
	    var info = prepareLowerInfo(search);

	    var spaceSearches = [];
	    if(info.containsSpace) {
	      var searches = search.split(/\s+/);
	      searches = [...new Set(searches)]; // distinct
	      for(var i=0; i<searches.length; i++) {
	        if(searches[i] === '') continue
	        var _info = prepareLowerInfo(searches[i]);
	        spaceSearches.push({lowerCodes:_info.lowerCodes, _lower:searches[i].toLowerCase(), containsSpace:false});
	      }
	    }

	    return {lowerCodes: info.lowerCodes, bitflags: info.bitflags, containsSpace: info.containsSpace, _lower: info._lower, spaceSearches: spaceSearches}
	  };



	  var getPrepared = (target) => {
	    if(target.length > 999) return prepare(target) // don't cache huge targets
	    var targetPrepared = preparedCache.get(target);
	    if(targetPrepared !== undefined) return targetPrepared
	    targetPrepared = prepare(target);
	    preparedCache.set(target, targetPrepared);
	    return targetPrepared
	  };
	  var getPreparedSearch = (search) => {
	    if(search.length > 999) return prepareSearch(search) // don't cache huge searches
	    var searchPrepared = preparedSearchCache.get(search);
	    if(searchPrepared !== undefined) return searchPrepared
	    searchPrepared = prepareSearch(search);
	    preparedSearchCache.set(search, searchPrepared);
	    return searchPrepared
	  };


	  var all = (search, targets, options) => {
	    var results = []; results.total = targets.length;

	    var limit = options && options.limit || INT_MAX;

	    if(options && options.key) {
	      for(var i=0;i<targets.length;i++) { var obj = targets[i];
	        var target = getValue(obj, options.key);
	        if(!target) continue
	        if(!isObj(target)) target = getPrepared(target);
	        target.score = INT_MIN;
	        target._indexes.len = 0;
	        var result = target;
	        result = {target:result.target, _targetLower:'', _targetLowerCodes:NULL, _nextBeginningIndexes:NULL, _bitflags:0, score:target.score, _indexes:NULL, obj:obj}; // hidden
	        results.push(result); if(results.length >= limit) return results
	      }
	    } else if(options && options.keys) {
	      for(var i=0;i<targets.length;i++) { var obj = targets[i];
	        var objResults = new Array(options.keys.length);
	        for (var keyI = options.keys.length - 1; keyI >= 0; --keyI) {
	          var target = getValue(obj, options.keys[keyI]);
	          if(!target) { objResults[keyI] = NULL; continue }
	          if(!isObj(target)) target = getPrepared(target);
	          target.score = INT_MIN;
	          target._indexes.len = 0;
	          objResults[keyI] = target;
	        }
	        objResults.obj = obj;
	        objResults.score = INT_MIN;
	        results.push(objResults); if(results.length >= limit) return results
	      }
	    } else {
	      for(var i=0;i<targets.length;i++) { var target = targets[i];
	        if(!target) continue
	        if(!isObj(target)) target = getPrepared(target);
	        target.score = INT_MIN;
	        target._indexes.len = 0;
	        results.push(target); if(results.length >= limit) return results
	      }
	    }

	    return results
	  };


	  var algorithm = (preparedSearch, prepared) => {
	    if(preparedSearch.containsSpace) return algorithmSpaces(preparedSearch, prepared)

	    var searchLower = preparedSearch._lower;
	    var searchLowerCodes = preparedSearch.lowerCodes;
	    var searchLowerCode = searchLowerCodes[0];
	    var targetLowerCodes = prepared._targetLowerCodes;
	    var searchLen = searchLowerCodes.length;
	    var targetLen = targetLowerCodes.length;
	    var searchI = 0; // where we at
	    var targetI = 0; // where you at
	    var matchesSimpleLen = 0;

	    // very basic fuzzy match; to remove non-matching targets ASAP!
	    // walk through target. find sequential matches.
	    // if all chars aren't found then exit
	    for(;;) {
	      var isMatch = searchLowerCode === targetLowerCodes[targetI];
	      if(isMatch) {
	        matchesSimple[matchesSimpleLen++] = targetI;
	        ++searchI; if(searchI === searchLen) break
	        searchLowerCode = searchLowerCodes[searchI];
	      }
	      ++targetI; if(targetI >= targetLen) return NULL // Failed to find searchI
	    }

	    var searchI = 0;
	    var successStrict = false;
	    var matchesStrictLen = 0;

	    var nextBeginningIndexes = prepared._nextBeginningIndexes;
	    if(nextBeginningIndexes === NULL) nextBeginningIndexes = prepared._nextBeginningIndexes = prepareNextBeginningIndexes(prepared.target);
	    targetI = matchesSimple[0]===0 ? 0 : nextBeginningIndexes[matchesSimple[0]-1];

	    // Our target string successfully matched all characters in sequence!
	    // Let's try a more advanced and strict test to improve the score
	    // only count it as a match if it's consecutive or a beginning character!
	    var backtrackCount = 0;
	    if(targetI !== targetLen) for(;;) {
	      if(targetI >= targetLen) {
	        // We failed to find a good spot for this search char, go back to the previous search char and force it forward
	        if(searchI <= 0) break // We failed to push chars forward for a better match

	        ++backtrackCount; if(backtrackCount > 200) break // exponential backtracking is taking too long, just give up and return a bad match

	        --searchI;
	        var lastMatch = matchesStrict[--matchesStrictLen];
	        targetI = nextBeginningIndexes[lastMatch];

	      } else {
	        var isMatch = searchLowerCodes[searchI] === targetLowerCodes[targetI];
	        if(isMatch) {
	          matchesStrict[matchesStrictLen++] = targetI;
	          ++searchI; if(searchI === searchLen) { successStrict = true; break }
	          ++targetI;
	        } else {
	          targetI = nextBeginningIndexes[targetI];
	        }
	      }
	    }

	    // check if it's a substring match
	    var substringIndex = prepared._targetLower.indexOf(searchLower, matchesSimple[0]); // perf: this is slow
	    var isSubstring = ~substringIndex;
	    if(isSubstring && !successStrict) { // rewrite the indexes from basic to the substring
	      for(var i=0; i<matchesSimpleLen; ++i) matchesSimple[i] = substringIndex+i;
	    }
	    var isSubstringBeginning = false;
	    if(isSubstring) {
	      isSubstringBeginning = prepared._nextBeginningIndexes[substringIndex-1] === substringIndex;
	    }

	    { // tally up the score & keep track of matches for highlighting later
	      if(successStrict) { var matchesBest = matchesStrict; var matchesBestLen = matchesStrictLen; }
	      else { var matchesBest = matchesSimple; var matchesBestLen = matchesSimpleLen; }

	      var score = 0;

	      var extraMatchGroupCount = 0;
	      for(var i = 1; i < searchLen; ++i) {
	        if(matchesBest[i] - matchesBest[i-1] !== 1) {score -= matchesBest[i]; ++extraMatchGroupCount;}
	      }
	      var unmatchedDistance = matchesBest[searchLen-1] - matchesBest[0] - (searchLen-1);

	      score -= (12+unmatchedDistance) * extraMatchGroupCount; // penality for more groups

	      if(matchesBest[0] !== 0) score -= matchesBest[0]*10; // penality for not starting near the beginning

	      if(!successStrict) {
	        score *= 1000;
	      } else {
	        // successStrict on a target with too many beginning indexes loses points for being a bad target
	        var uniqueBeginningIndexes = 1;
	        for(var i = nextBeginningIndexes[0]; i < targetLen; i=nextBeginningIndexes[i]) ++uniqueBeginningIndexes;

	        if(uniqueBeginningIndexes > 24) score *= (uniqueBeginningIndexes-24)*10; // quite arbitrary numbers here ...
	      }

	      if(isSubstring)          score /= 10; // bonus for being a full substring
	      if(isSubstringBeginning) score /= 10; // bonus for substring starting on a beginningIndex

	      score -= targetLen - searchLen; // penality for longer targets
	      prepared.score = score;

	      for(var i = 0; i < matchesBestLen; ++i) prepared._indexes[i] = matchesBest[i];
	      prepared._indexes.len = matchesBestLen;

	      return prepared
	    }
	  };
	  var algorithmSpaces = (preparedSearch, target) => {
	    var seen_indexes = new Set();
	    var score = 0;
	    var result = NULL;

	    var first_seen_index_last_search = 0;
	    var searches = preparedSearch.spaceSearches;
	    for(var i=0; i<searches.length; ++i) {
	      var search = searches[i];

	      result = algorithm(search, target);
	      if(result === NULL) return NULL

	      score += result.score;

	      // dock points based on order otherwise "c man" returns Manifest.cpp instead of CheatManager.h
	      if(result._indexes[0] < first_seen_index_last_search) {
	        score -= first_seen_index_last_search - result._indexes[0];
	      }
	      first_seen_index_last_search = result._indexes[0];

	      for(var j=0; j<result._indexes.len; ++j) seen_indexes.add(result._indexes[j]);
	    }

	    result.score = score;

	    var i = 0;
	    for (let index of seen_indexes) result._indexes[i++] = index;
	    result._indexes.len = i;

	    return result
	  };


	  var prepareLowerInfo = (str) => {
	    var strLen = str.length;
	    var lower = str.toLowerCase();
	    var lowerCodes = []; // new Array(strLen)    sparse array is too slow
	    var bitflags = 0;
	    var containsSpace = false; // space isn't stored in bitflags because of how searching with a space works

	    for(var i = 0; i < strLen; ++i) {
	      var lowerCode = lowerCodes[i] = lower.charCodeAt(i);

	      if(lowerCode === 32) {
	        containsSpace = true;
	        continue // it's important that we don't set any bitflags for space
	      }

	      var bit = lowerCode>=97&&lowerCode<=122 ? lowerCode-97 // alphabet
	              : lowerCode>=48&&lowerCode<=57  ? 26           // numbers
	                                                             // 3 bits available
	              : lowerCode<=127                ? 30           // other ascii
	              :                                 31;           // other utf8
	      bitflags |= 1<<bit;
	    }

	    return {lowerCodes:lowerCodes, bitflags:bitflags, containsSpace:containsSpace, _lower:lower}
	  };
	  var prepareBeginningIndexes = (target) => {
	    var targetLen = target.length;
	    var beginningIndexes = []; var beginningIndexesLen = 0;
	    var wasUpper = false;
	    var wasAlphanum = false;
	    for(var i = 0; i < targetLen; ++i) {
	      var targetCode = target.charCodeAt(i);
	      var isUpper = targetCode>=65&&targetCode<=90;
	      var isAlphanum = isUpper || targetCode>=97&&targetCode<=122 || targetCode>=48&&targetCode<=57;
	      var isBeginning = isUpper && !wasUpper || !wasAlphanum || !isAlphanum;
	      wasUpper = isUpper;
	      wasAlphanum = isAlphanum;
	      if(isBeginning) beginningIndexes[beginningIndexesLen++] = i;
	    }
	    return beginningIndexes
	  };
	  var prepareNextBeginningIndexes = (target) => {
	    var targetLen = target.length;
	    var beginningIndexes = prepareBeginningIndexes(target);
	    var nextBeginningIndexes = []; // new Array(targetLen)     sparse array is too slow
	    var lastIsBeginning = beginningIndexes[0];
	    var lastIsBeginningI = 0;
	    for(var i = 0; i < targetLen; ++i) {
	      if(lastIsBeginning > i) {
	        nextBeginningIndexes[i] = lastIsBeginning;
	      } else {
	        lastIsBeginning = beginningIndexes[++lastIsBeginningI];
	        nextBeginningIndexes[i] = lastIsBeginning===undefined ? targetLen : lastIsBeginning;
	      }
	    }
	    return nextBeginningIndexes
	  };


	  var cleanup = () => { preparedCache.clear(); preparedSearchCache.clear(); matchesSimple = []; matchesStrict = []; };

	  var preparedCache       = new Map();
	  var preparedSearchCache = new Map();
	  var matchesSimple = []; var matchesStrict = [];


	  // for use with keys. just returns the maximum score
	  var defaultScoreFn = (a) => {
	    var max = INT_MIN;
	    var len = a.length;
	    for (var i = 0; i < len; ++i) {
	      var result = a[i]; if(result === NULL) continue
	      var score = result.score;
	      if(score > max) max = score;
	    }
	    if(max === INT_MIN) return NULL
	    return max
	  };

	  // prop = 'key'              2.5ms optimized for this case, seems to be about as fast as direct obj[prop]
	  // prop = 'key1.key2'        10ms
	  // prop = ['key1', 'key2']   27ms
	  var getValue = (obj, prop) => {
	    var tmp = obj[prop]; if(tmp !== undefined) return tmp
	    var segs = prop;
	    if(!Array.isArray(prop)) segs = prop.split('.');
	    var len = segs.length;
	    var i = -1;
	    while (obj && (++i < len)) obj = obj[segs[i]];
	    return obj
	  };

	  var isObj = (x) => { return typeof x === 'object' }; // faster as a function
	  // var INT_MAX = 9007199254740991; var INT_MIN = -INT_MAX
	  var INT_MAX = Infinity; var INT_MIN = -INT_MAX;
	  var noResults = []; noResults.total = 0;
	  var NULL = null;


	  // Hacked version of https://github.com/lemire/FastPriorityQueue.js
	  var fastpriorityqueue=r=>{var e=[],o=0,a={},v=r=>{for(var a=0,v=e[a],c=1;c<o;){var s=c+1;a=c,s<o&&e[s].score<e[c].score&&(a=s),e[a-1>>1]=e[a],c=1+(a<<1);}for(var f=a-1>>1;a>0&&v.score<e[f].score;f=(a=f)-1>>1)e[a]=e[f];e[a]=v;};return a.add=(r=>{var a=o;e[o++]=r;for(var v=a-1>>1;a>0&&r.score<e[v].score;v=(a=v)-1>>1)e[a]=e[v];e[a]=r;}),a.poll=(r=>{if(0!==o){var a=e[0];return e[0]=e[--o],v(),a}}),a.peek=(r=>{if(0!==o)return e[0]}),a.replaceTop=(r=>{e[0]=r,v();}),a};
	  var q = fastpriorityqueue(); // reuse this


	  // fuzzysort is written this way for minification. all names are mangeled unless quoted
	  return {'single':single, 'go':go, 'highlight':highlight, 'prepare':prepare, 'indexes':indexes, 'cleanup':cleanup}
	}); // UMD

	// TODO: (feature) frecency
	// TODO: (perf) use different sorting algo depending on the # of results?
	// TODO: (perf) preparedCache is a memory leak
	// TODO: (like sublime) backslash === forwardslash
	// TODO: (perf) prepareSearch seems slow
} (fuzzysort));

const FETCH_EVENT = "$FETCH";

function getRouteMatches(routes, path, method) {
  const segments = path.split("/").filter(Boolean);
  routeLoop:
    for (const route of routes) {
      const matchSegments = route.matchSegments;
      if (segments.length < matchSegments.length || !route.wildcard && segments.length > matchSegments.length) {
        continue;
      }
      for (let index = 0; index < matchSegments.length; index++) {
        const match = matchSegments[index];
        if (!match) {
          continue;
        }
        if (segments[index] !== match) {
          continue routeLoop;
        }
      }
      const handler = route[method];
      if (handler === "skip" || handler === void 0) {
        return;
      }
      const params = {};
      for (const { type, name, index } of route.params) {
        if (type === ":") {
          params[name] = segments[index];
        } else {
          params[name] = segments.slice(index).join("/");
        }
      }
      return { handler, params };
    }
}

let apiRoutes$1;
const registerApiRoutes = (routes) => {
  apiRoutes$1 = routes;
};
async function internalFetch(route, init) {
  if (route.startsWith("http")) {
    return await fetch(route, init);
  }
  let url = new URL(route, "http://internal");
  const request = new Request(url.href, init);
  const handler = getRouteMatches(apiRoutes$1, url.pathname, request.method.toLowerCase());
  let apiEvent = Object.freeze({
    request,
    params: handler.params,
    env: {},
    $type: FETCH_EVENT,
    fetch: internalFetch
  });
  const response = await handler.handler(apiEvent);
  return response;
}

const XSolidStartLocationHeader = "x-solidstart-location";
const LocationHeader = "Location";
const ContentTypeHeader = "content-type";
const XSolidStartResponseTypeHeader = "x-solidstart-response-type";
const XSolidStartContentTypeHeader = "x-solidstart-content-type";
const XSolidStartOrigin = "x-solidstart-origin";
const JSONResponseType = "application/json";
const redirectStatusCodes = /* @__PURE__ */ new Set([204, 301, 302, 303, 307, 308]);
function isRedirectResponse(response) {
  return response && response instanceof Response && redirectStatusCodes.has(response.status);
}
class ResponseError extends Error {
  status;
  headers;
  name = "ResponseError";
  ok;
  statusText;
  redirected;
  url;
  constructor(response) {
    let message = JSON.stringify({
      $type: "response",
      status: response.status,
      message: response.statusText,
      headers: [...response.headers.entries()]
    });
    super(message);
    this.status = response.status;
    this.headers = new Map([...response.headers.entries()]);
    this.url = response.url;
    this.ok = response.ok;
    this.statusText = response.statusText;
    this.redirected = response.redirected;
    this.bodyUsed = false;
    this.type = response.type;
    this.response = () => response;
  }
  response;
  type;
  clone() {
    return this.response();
  }
  get body() {
    return this.response().body;
  }
  bodyUsed;
  async arrayBuffer() {
    return await this.response().arrayBuffer();
  }
  async blob() {
    return await this.response().blob();
  }
  async formData() {
    return await this.response().formData();
  }
  async text() {
    return await this.response().text();
  }
  async json() {
    return await this.response().json();
  }
}

function renderAsync(fn, options) {
  return () => async (event) => {
    {
      return await event.env.getStaticHTML("/index");
    }
  };
}

class ServerError extends Error {
  constructor(message, {
    stack
  } = {}) {
    super(message);
    this.name = "ServerError";

    if (stack) {
      this.stack = stack;
    }
  }

}
class FormError extends ServerError {
  constructor(message, {
    fieldErrors = {},
    form,
    fields,
    stack
  } = {}) {
    super(message, {
      stack
    });
    this.formError = message;
    this.name = "FormError";
    this.fields = fields || Object.fromEntries(typeof form !== "undefined" ? form.entries() : []) || {};
    this.fieldErrors = fieldErrors;
  }

}

const games = [
	{
		title: "Achilles",
		description: "Hack and slash your way through 15 stages of greek warriors.",
		tags: "",
		route: "achilles",
		source: "/swf/Achilles.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Age of War",
		description: "Take control of 16 different units and 15 different turrets to defend your base and destroy your enemy. In this game, you start at the cavern men's age, then evolve! There is a total of 5 ages, each with its units and turrets. I hope you have fun with this game! Sooo many hours of hard work.",
		tags: "",
		route: "age-of-war",
		source: "/swf/Age-of-War.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Avalanche",
		description: "Avalanche is a fun little game where try to avoid falling objects as you jump higher and higher! Are you a towelette, or maybe a marshmallow? Whatever the case, there are huge, square bolts to dodge. Can you avoid this avalanche?",
		tags: "",
		route: "avalanche",
		source: "/swf/Avalanche.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Avatar Arena",
		description: "Your objective in this great fighting flash game is to create your own character, challenge the worlds best benders and defeat them",
		tags: "",
		route: "avatar-arena",
		source: "/swf/AvatarArena.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Achievement Unlocked",
		description: "Who needs gameplay when you have ACHIEVEMENTS? Don't worry about beating levels, finding ways t' kill enemies, or beating the final boss… there are none. Focus solely on your ultimate destiny… doing random tasks that have nothing to do with anything. Metagame yourself with ease! Self-satisfaction never felt so… artificial!",
		tags: "",
		route: "achievement-unlocked",
		source: "/swf/achievement-unlocked.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Alien Hominid",
		description: "Your aircraft has crash landed on planet Earth, and the FBI is out to get you! Time to take them out!",
		tags: "",
		route: "alien-hominid",
		source: "/swf/alien-hominid.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Amberial",
		description: "Many puzzling levels of bouncing a ball around and trying to touch the end orb to progress.",
		tags: "",
		route: "amberial",
		source: "/swf/amberial.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Animal Hunter",
		description: "Hunt animals in the forest to score points. Collect the power, speed, and time icons to help you. Have Fun!",
		tags: "",
		route: "animal-hunter",
		source: "/swf/animal_hunter.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Ant Buster",
		description: "Tower defense game with ants.",
		tags: "",
		route: "ant-buster",
		source: "/swf/antbuster.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Apple Shooter",
		description: "Apple Shooter Archery Game. Shoot the apple off your friends head using a bow and arrow. But be careful to not shoot his head off!",
		tags: "",
		route: "apple-shooter",
		source: "/swf/apple-shooter-2021.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Arkanoid",
		description: "Arkanoid is a game similar to break out where you move the paddle to hit the ball.",
		tags: "",
		route: "arkanoid",
		source: "/swf/arkanoid.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Asteroids",
		description: "Control the spaceship to destroy asteroids and flying saucers in this classic arcade multidirectional shooter video game by Atari®. Be careful not to collide with the asteroids that are all around you, and avoid counter-fire from the saucers.",
		tags: "",
		route: "asteroids",
		source: "/swf/asteroids.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Axis Football League",
		description: "The first, great online football game. Choose from 14 teams and lead your team to victory.",
		tags: "",
		route: "axis-football-league",
		source: "/swf/axisfootballleague.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "2048",
		description: "Swipe to move the tiles, when two tiles with the same number touch, they merge into one. When a 2048 tile is created, the player wins.",
		tags: "",
		route: "2048",
		source: "/src/2048/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Agario Minigame",
		description: "Agario is a fun addicting MMO game in which you have to eat or be eaten while you strive to dominate the World of colorful cells. The game has just 2 simple rules to follow: 1) you only can consume targets that are smaller than you and you should match their color to evolve yourself, 2) you must give larger objects a wide berth or you will die. Start moving through the grid and try to catch all the tiny blurs of color. Eat and grow, split and multiply and rule the world.",
		tags: "",
		route: "agario-minigame",
		source: "/src/agario-minigame/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Astray",
		description: "Astray is a first-person horror/puzzle game set in an abandoned museum based on unusual cultures, legends, and supernatural themes; but something more sinister lurks beneath the surface..",
		tags: "",
		route: "astray",
		source: "/src/astray/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Break Lock",
		description: "A hybrid of Mastermind and the Android pattern lock. A game you will love to hate. Empty circle means correct location but wrong order. Full circle means correct location in correct order. You are aiming for four full circles.",
		tags: "",
		route: "break-lock",
		source: "/src/breaklock/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Chroma",
		description: "Mix colors with precision to match the target color. Not for the feint of heart. Or the color blind.",
		tags: "",
		route: "chroma",
		source: "/src/chroma/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Cookie Clicker",
		description: "Cookie Clicker is an incremental game created by French programmer Julien Orteil Thiennot in 2013. The user initially clicks on a big cookie on the screen, earning a single cookie per click.",
		tags: "",
		route: "cookie-clicker",
		source: "/src/cookie/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Cube Field",
		description: "Cubefield is a simple but addictive game, there are only two controls – left and right. Use the arrow keys on your keyboard to guide your ship through an endless field of ominous looking coloured cubes – if you hit one, it's game over.",
		tags: "",
		route: "cube-field",
		source: "/src/cubefield/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Dinosaur",
		description: "The Dinosaur Game is a browser game developed by Google and built into the Google Chrome web browser. The player guides a pixelated Tyrannosaurus rex across a side-scrolling landscape, avoiding obstacles to achieve a higher score.",
		tags: "",
		route: "dinosaur",
		source: "/src/dinosaur/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Doodle Jump",
		description: "How high can you go? A fun and simple game about an alien with a jetpack trying to jump as high as possible",
		tags: "",
		route: "doodle-jump",
		source: "/src/doodle-jump/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Drift (Broken Unity)",
		description: "",
		tags: "",
		route: "drift",
		source: "/src/drift/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: false
	},
	{
		title: "Duck Life 1 (HTML)",
		description: "A volcano eruption revealed an ancient cave with treasures inside. Explore the cave as a young energetic duck.  Gather coins and avoid danger as you fly through the cave. Customize your duck when you can afford it.",
		tags: "",
		route: "ducklife-1-html",
		source: "/src/ducklife/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Duck Life 2 (HTML) (Broken Unity)",
		description: "Duck Life 2 is a fun game for kids of all ages! Train the duck to be a champion racer so that it can win back the farm. Run, swim, and fly to become the leader of the flock!",
		tags: "",
		route: "duck-life-2-html",
		source: "/src/ducklife2/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: false
	},
	{
		title: "Duck Life 3 (HTML)",
		description: "Duck Life 3 is here. In this new Duck Life Game you will have to help your Duck evolve to give him the best Duck Life possible. In the beginning you'll need to pick which type of Duck you want. The choices are Athletic Type, Swimming Type, Flying Type, or Strength Type. You will have to play around with them to see which type is your favorite. Below you'll find some pictures from DuckLife 3. You can see the different type of ducks to choose from and the first stage of evolution. DuckLife 3 is the newest Game in the DuckLife series.",
		tags: "",
		route: "duck-life-3-html",
		source: "/src/ducklife3/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Duck Life 4 (HTML)",
		description: "Duck Life 4 is a fun game for kids of all ages! Train the duck to be a champion racer so that it can win back the farm. Run, swim, and fly to become the leader of the flock!",
		tags: "",
		route: "duck-life-4-html",
		source: "/src/ducklife4/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Fireboy and Watergirl Forest Temple",
		description: "Help Fireboy and Watergirl through the forest temple tunnels and reach the exit doors in this fun arcade platformer!",
		tags: "",
		route: "fireboy-and-watergirl-forest-temple",
		source: "/src/fireboy-and-watergirl-forest-temple/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Flappy 2048",
		description: "Jump through the tiles and get to 2048!",
		tags: "",
		route: "flappy-2048",
		source: "/src/flappy-2048/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Flappy Bird (404 Not Found)",
		description: "Flappy Bird is a mobile game developed by Vietnamese video game artist and programmer Dong Nguyen, under his game development company .Gears. The game is a side-scroller where the player controls a bird, attempting to fly between columns of green pipes without hitting them.",
		tags: "",
		route: "flappy-bird",
		source: "/src/flappybird/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: false
	},
	{
		title: "Friendly Fire",
		description: "“Friendly Fire” is a 2d platform adventure game with handcrafted pixel art, an original soundtrack and lots of love put into the creation of the characters and dialogues.",
		tags: "",
		route: "friendly-fire",
		source: "/src/friendlyfire/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Geometry Dash",
		description: "Geometry Dash is developed by Sweden-based developer Robert Topala. The game has 21 levels currently with different types of difficulty. Players can enjoy 3 levels of the game: Stereo Madness, Back on track, and Polargeist. Each one has its own difficulty and a list of best scores.",
		tags: "",
		route: "geometry-dash",
		source: "/src/geometry/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Gopher Kart",
		description: "Created by Jamilet Zelaya with very little help from Erick Zelaya.",
		tags: "",
		route: "gopher-kart",
		source: "/src/gopher-kart/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Hexgl",
		description: "HexGL is a futuristic, fast-paced racing game built by Thibaut Despoulain using HTML5, Javascript and WebGL and a tribute to the original Wipeout and F-Zero series.",
		tags: "",
		route: "hexgl",
		source: "/src/hexgl/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Hextris",
		description: "An addictive puzzle game inspired by Tetris.",
		tags: "",
		route: "hextris",
		source: "/src/hextris/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Madalin Cars Multiplayer",
		description: "Madalin Cars Multiplayer is an epic online car driving game in the hugely popular Madalin Cars series. Choose from a range of different sports cars and customize them to your liking. You can change the color and drive settings of your car to give yourself a truly personalized ride! Once you have chosen your vehicle, you can join the online game and enter the immense desert landscape!",
		tags: "",
		route: "madalin-cars-multiplayer",
		source: "/src/madalin-cars-multiplayer/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Minecraft",
		description: "Minecraft is a video game in which players create and break apart various kinds of blocks in three-dimensional worlds. The game's two main modes are Survival and Creative. In Survival, players must find their own building supplies and food. They also interact with blocklike mobs, or moving creatures.",
		tags: "",
		route: "mc-classic",
		source: "/src/mc-classic/index.html",
		gameType: "html",
		width: "1080px",
		height: "720px",
		listed: true
	},
	{
		title: "Microsoft Flight Simulator",
		description: "Microsoft Flight Simulator is a series of amateur flight simulator programs for Microsoft Windows operating systems, and earlier for MS-DOS and Classic Mac OS. It is one of the longest-running, best-known, and most comprehensive home flight simulator programs on the market.",
		tags: "",
		route: "microsoft-flight-simulator",
		source: "/src/microsoft-flight-simulator/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Muffin Knight (Requires Chrome Experimental Features)",
		description: "Muffin Knight is an arena based action-packed platformer with stunning visuals and a myriad of fairytale characters, each with their own unique abilities, which gain strength as you advance. This is the story of a little boy, on his journey to return the old fairy's magical muffins.",
		tags: "",
		route: "muffin-knight",
		source: "/src/muffin-knight/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: false
	},
	{
		title: "Pacman (HTML)",
		description: "Pac-Man is a Japanese video game franchise published, developed and owned by Bandai Namco Entertainment. Entries have been developed by a wide array of other video game companies, including Midway Games, Atari and Mass Media, Inc..",
		tags: "",
		route: "pacman-html",
		source: "/src/pacman/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Radius Raid",
		description: "Radius Raid is a space themed shoot 'em up where you must blast away unrelenting enemies before they destroy you. The game features 13 enemy types, 5 powerups, parallax backgrounds, retro sound effects, and locally stored stats.",
		tags: "",
		route: "radius-raid",
		source: "/src/radius-raid/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Retro Bowl",
		description: "Retro Bowl is an American football video game developed by New Star Games for the iOS and Android operating systems. A browser version is also available on some websites. The game was released in January 2020 and due to its exposure on the website TikTok it massively increased in popularity in late 2021.",
		tags: "",
		route: "retro-bowl",
		source: "/src/retro-bowl/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Ritz",
		description: "Your cool ass boy Ritz the rat has just been RATTED out by the anti-rat crew. His cheese gone...His hunger rising....help this rat get his fukken cheese back in the lair of illusions.",
		tags: "",
		route: "ritz",
		source: "/src/ritz/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Run 3 (HTML) (Unknown Error)",
		description: "Run 3 is an exciting running game where you run, jump through an endless tunnel in space. Pass all challenges of hundred levels without falling into space.",
		tags: "",
		route: "run-3-html",
		source: "/src/run3/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: false
	},
	{
		title: "Slope",
		description: "Slope game is a fantastic speed run game where you can drive a ball rolling on tons of slopes and obstacles. See how far you can go in this endless course.",
		tags: "",
		route: "slope",
		source: "/src/slope/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Super Mario 64",
		description: "Super Mario 64 is a 1996 platform game for the Nintendo 64, developed by Nintendo EAD and published by Nintendo. The first Super Mario game to feature 3D gameplay, it features freedom of movement within a large open world based on polygons, combined with traditional Mario gameplay, visual style, and characters.",
		tags: "",
		route: "sm64",
		source: "/src/sm64/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Space Invaders",
		description: "Space Invaders is a Japanese shooting video game released in 1978 by Taito. It was developed by Tomohiro Nishikado, who was inspired by other media: Breakout, The War of the Worlds, and Star Wars.",
		tags: "",
		route: "space-invaders",
		source: "/src/spaceinvaders/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Tank Trouble",
		description: "Tank Trouble is an online tank game where you drive in a maze and shoot missiles at your enemies. Tank Trouble pits you against clever army generals in mazelike battlefields. In Solo mode, you will face Laika, a master of war. You can also challenge a friend or two in multiplayer warfare.",
		tags: "",
		route: "tank-trouble",
		source: "/src/tanktrouble/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: false
	},
	{
		title: "Vex 3",
		description: "Vex 3 is a fascinating game. Your task is to Take Vex through the levels by running, jumping, sliding and swimming while avoiding dangerous obstacles.",
		tags: "",
		route: "vex-3",
		source: "/src/vex3/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Vex 4",
		description: "VEX 4 takes Vex to the next level! This fast paced stickman game puts your skills to the test. Run, jump, slide, swim and avoid obstacles, VEX 4 has it all.",
		tags: "",
		route: "vex-4",
		source: "/src/vex4/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Vex 5",
		description: "Surely you are very familiar to the Vex game series. Now, you can meet cute Stickman again in Vex 5. Vex 5 is the 5th platform game in the Vex series. Each level is a labyrinth of deadly devices and traps. You have to make your way from one platform to the other and avoid deadly obstacles such as buzzsaws, spikes, crumbling blocks, and more! To win this game, you must overcome dangerous spikes, saw blades, and a variety of other challenges. If you've played the previous games in the series, you'll be familiar with what to expect in this thrilling new installment. The goal is to finish each level by reaching the endpoint. In this game, levels are referred to as acts, and there are numerous acts to finish.",
		tags: "",
		route: "vex-5",
		source: "/src/vex5/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Rolling Sky",
		description: "Rolling Sky is the best musical skill game of all time. You are a ball rolling over a track with tons of hazards to make you fall. You have to be super fast, precise and accurate to dodge all the barriers, holes and laser beams that are shot in your direction. Use the music to keep your rhythm while swinging from left to right to get the power-ups you need to finish the levels. This is seriously the most challenging game you can find online.",
		tags: "",
		route: "rolling-sky",
		source: "/src/webgl-rollingsky/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "13 Days in Hell",
		description: "13 Days in Hell is an arcade shooter that gives you control over the chosen one, with the sole purpose of surviving an onslaught of souls in hell for 13 full days. You have to shoot and kill the souls coming at you with their axes, or they may chop you up.",
		tags: "",
		route: "13-days-in-hell",
		source: "/swf/13-days-in-hell.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "360 Snake",
		description: "The famous and beloved 360 Snake unblocked. Control the snake with a computer mouse, and collect white balls that will allow the snake to grow to incredible sizes. But it all depends on your skill in controlling. You can not stop for a second or make a mistake, otherwise, you have to start the game again. Just avoid barriers, and make sure that the snake does not stumble on its own tail. The old game in the new format will give you a lot of fun.",
		tags: "",
		route: "360-snake",
		source: "/swf/360-snake.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "3D Car Driver",
		description: ".",
		tags: "",
		route: "3d-car-driver",
		source: "/swf/3D-Car-Driver.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "3 Foot Ninja",
		description: "Show off your awesome ninja skills by helping the 3 Foot Ninja defeat his enemies, whilst collecting the ancient Lost Scrolls of the Elders to unlock the secrets of the Elder Masters.",
		tags: "",
		route: "3-foot-ninja",
		source: "/swf/3_foot_ninja.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "50 states",
		description: "Do you know your 50 states? Play this fun US states game to find out - just click the blank map to answer the questions!",
		tags: "",
		route: "50-states",
		source: "/swf/50states.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "3 on 3 Hockey",
		description: "3-on-3 Hockey is a fast-paced and exciting hockey experience for all ages.",
		tags: "",
		route: "3-on-3-hockey",
		source: "/swf/3_on_3_hockey.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "8 Ball Pool",
		description: "Eight-ball is a pool billiards played on a billiard table with six pockets, cue sticks, and sixteen billiard balls: a cue ball and fifteen object balls. The object balls include seven solid-colored balls numbered 1 through 7, seven striped balls numbered 9 through 15, and the black 8 ball.",
		tags: "",
		route: "8-ball-pool",
		source: "/swf/8BallPool.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Bloons",
		description: "Bloons Tower Defense is a series of tower defense games under the Bloons series created and produced by Ninja Kiwi. The game was initially developed as a browser game, built upon the Adobe Flash platform and released in mid 2007.",
		tags: "",
		route: "bloons",
		source: "/swf/Bloons.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Falldown",
		description: "A Simple Game. You are trying to run away from the obstacles when you falling down.",
		tags: "",
		route: "falldown",
		source: "/swf/Falldown.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Henry Stick Breaking Into The Bank",
		description: "Henry Stickmin attempts to break into a bank, built in the middle of a desert. He stands next to a wall and wonders how to break inside.",
		tags: "",
		route: "henry-stick-breaking-the-bank",
		source: "/swf/HenryStick_BreakingTheBank.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Henry Stick Escaping The Prison",
		description: "Escaping the Prison is the second game in the Henry Stickmin series. It is the sequel to Breaking the Bank, and the prequel to Stealing the Diamond, and is named as Episode 1 of the Henry Stickmin story. It is one of the most popular of the series, with over 3 million plays on Newgrounds. It contains a total of 36 choices to make, which is 6 times the amount as the previous game.",
		tags: "",
		route: "henry-stick-escaping-the-prison",
		source: "/swf/HenryStick_EscapingThePrison.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Henry Stick Infiltrating The Airship",
		description: "Infiltrating the Airship is the fourth game in the Henry Stickmin series. It is the sequel to Stealing the Diamond, and takes place before Fleeing the Complex, and is named as Episode 4 of the Henry Stickmin story. The game has four different endings and one fake ending.",
		tags: "",
		route: "henry-stick-infiltrating-the-airship",
		source: "/swf/HenryStick_InfiltratingTheAirship.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Henry Stick Stealing the Diamond",
		description: "Stealing the Diamond is the third game in the Henry Stickmin series. It takes place after Escaping the Prison and before Infiltrating The Airship, and is considered Episode 2 of the Henry Stickmin Collection.",
		tags: "",
		route: "henry-stick-stealing-diamond",
		source: "/swf/HenryStick_StealingDiamond.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "The Impossible Quiz",
		description: "The Impossible Quiz...It's not impossible! One of the most aggravating games ever created! This game has simple graphics, suitable for all ages, especially children and families. You can experience this game on your browser because it is a flash game.",
		tags: "",
		route: "the-impossible-quiz",
		source: "/swf/TheImpossibleQuiz.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Worlds Hardest Game",
		description: "The World's Hardest Game speaks for itself, when we say it is the hardest game we aren't kidding! If you have played World's Hardest Game before, you know how difficult the game can be. You will need to be quick and decisive with your movements, and have a strategy going into each level. Lucky for you, we have some helpful tips and tricks that will help you whether you are experienced or a complete beginner.",
		tags: "",
		route: "worlds-hardest-game",
		source: "/swf/WorldsHardestGame.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Acid Bunny 2",
		description: "Acid Bunny is back! This time all the action takes place on the beach, the ocean and in the jungle as well as another Down Below level.",
		tags: "",
		route: "acid-bunny-2",
		source: "/swf/acid-bunny-2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Acid Bunny",
		description: "Ooh no! Acid Bunny had a flashback and accidentally killed one of his friends. Help him patch up the friendship finding all body parts, a needle, and lots of thread. Along the way wipe out acid spying opponents using carrots and other aids.",
		tags: "",
		route: "acid-bunny",
		source: "/swf/acid-bunny.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Ball Breaker",
		description: "Showcase your Arkanoid skills in Brick Breaker! Move the paddle left and right to keep the ball in play. You must react quickly to hit the ball as it bounces on every wall. The goal is to clear every brick!",
		tags: "",
		route: "ball-breaker",
		source: "/swf/ball-breaker.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Bejeweled",
		description: "Bejeweled is a series of tile-matching puzzle video games created by PopCap Games. Bejeweled was released initially for browsers in 2001",
		tags: "",
		route: "Bejeweled",
		source: "/swf/bejeweled-unblocked.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Bike Mania",
		description: "Ride your bike through the bumpy and challenging tracks. Do not hit the ground and show your skill! Release Date. April 2007 (Flash). January 2020 (HTML5).",
		tags: "",
		route: "bike-mania",
		source: "/swf/bikemania.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: false
	},
	{
		title: "Bike Mania 2",
		description: "Second Bike Mania is a great online game. You will again have to show how you can deal with difficult terrain. Just play online, no download.",
		tags: "",
		route: "bike-mania-2",
		source: "/swf/bikemania2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Binding of Isaac",
		description: "The Binding of Isaac is a roguelike video game designed by independent developers Edmund McMillen and Florian Himsl. It was released in 2011 for Microsoft Windows, then ported to OS X, and Linux. The game's title and plot are inspired by the Biblical story of the Binding of Isaac.",
		tags: "",
		route: "binding-of-isaac",
		source: "/swf/binding-of-isaac.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Blast O' Matic",
		description: "You have to set many parameters which affect the way the cannon fires. Do your best and the result will be worth it.",
		tags: "",
		route: "blast-o-matic",
		source: "/swf/blastomatic.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Blobink 2",
		description: "Someone has stolen all the colours. Give everything it's own colour back and beat the big boss.",
		tags: "",
		route: "blobink-2",
		source: "/swf/blobink2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Bloons Tower Defense 2",
		description: "Bloons Tower Defense 2 is a popular tower defense game originally released in Flash by Ninja Kiwi. Strategically place your defenses, upgrade your units, and stop all balloons from passing through.",
		tags: "",
		route: "bloons-tower-defense-2",
		source: "/swf/bloons_tower_defense_2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Bubble Trouble",
		description: "Clear all the bubbles and get yourself out of trouble! Destroy the bouncing bubbles by splitting them again and again with a line from your harpoon gun, but don't let them touch you! Collect items dropped to gain advantages and score bonus points by eliminating all the bubbles before time runs out. Are you up the challenge?",
		tags: "",
		route: "bubble-trouble",
		source: "/swf/bubbletrouble.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Duck Life 1 (Flash)",
		description: "Duck Life is the first game in the Duck Life series. A tornado has struck your farm and destroyed everything. All that remains is a single duck egg. Train this duckling to peak athletic form so you can earn money to rebuild the farm.",
		tags: "",
		route: "duck-life-1-flash",
		source: "/swf/ducklife1.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Duck Life 2 (Flash)",
		description: "Duck Life 2 is a duck racing game with various training levels to improve your athletic abilities. When you've trained enough, you enter a duck ‘quadrathlon'' that puts your running, climbing, swimming, and flying skills to the test. Just another day in the life of a duck!",
		tags: "",
		route: "duck-life-2-flash",
		source: "/swf/ducklife2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Duck Life 3 (Flash)",
		description: "Duck Life 3 is a duck racing game featuring genetically modified ducks that evolve as you progress. Choose from one of four duck breeds and evolve as you complete each league. Like the previous game, training is essential to level up and improve your abilities.",
		tags: "",
		route: "duck-life-3-flash",
		source: "/swf/ducklife3-evolution.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Duck Life 4 (Flash)",
		description: "Duck Life 4 is a duck racing game set after the ban on genetically modified ducks. A year has passed since the ban on genetically modified ducks and now it's up to you to defeat the world champion. Train your duck team to compete in six new locations around the world.",
		tags: "",
		route: "duck-life-4-flash",
		source: "/swf/ducklife4.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Falldown 2",
		description: "Play Fall Down 2 flash game. Fall Down 2 is a Skill game to play free online. Controls: Use your mouse to play As a comment we let you know that Fall Down 2 game is one of the best skill games and a lot of fun is waiting for you playing Fall Down 2 online game, the game that many players have chosen it as their favorite, make your comparision and we hope you enjoy it. Remember that we offer you the best, funniest and the biggest collection of games in the world to play online.",
		tags: "",
		route: "falldown-2",
		source: "/swf/falldown2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Fancy Pants Adventure",
		description: "Fancy Pants Adventures is a series of free side-scrolling Flash games created by American developer Brad Borne. Four worlds have been released so far. World 1 was released on March 14, 2006 and World 2 was released on January 9, 2008.",
		tags: "",
		route: "fancy-pants-adventure",
		source: "/swf/fancypantsadventure.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Fancy Pants Adventure 2",
		description: "The Fancy Pants Adventures: World 2 is an epic adventure platformer created by Brad Borne. In the first chapter of this legendary series, you will embark on a perilous journey to find your kidnapped sister. Run through dense forests, underwater caverns, and pirate ships while you stomp, kick and slash your enemies with 40 melee weapons. Explore the enchanting maps to find secrets, hidden levels, achievements, costumes, and much more! It's hard not to be amazed by the stunning hand-drawn artwork, satisfying animations, and the good sense of humor in Fancy Pants Adventures. Go ahead, put on your fancy pants and get to work!",
		tags: "",
		route: "fancy-pants-adventure-2",
		source: "/swf/fancypantsworld2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Gun Mayhem 2",
		description: "More explosive arena style action! Battle against the AI or with friends in this cartoony platform shooter. Up to 4 players can play at once!",
		tags: "",
		route: "gun-mayhem-2",
		source: "/swf/gun-mayhem-2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Gun Mayhem",
		description: "More explosive arena style action! Battle against the AI or with friends in this cartoony platform shooter. Up to 4 players can play at once!",
		tags: "",
		route: "gun-mayhem",
		source: "/swf/gun-mayhem.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "The Impossible Quiz 2",
		description: "The Impossible Quiz 2 is the second installment of the hardest trivia quiz on the word wide web. Questions even got more tricky than in the first quiz, which makes this game officially the hardest one available. The creator Splapp-me-do has done everything to make sure you won't succeed in completing this quiz.",
		tags: "",
		route: "impossible-quiz-2",
		source: "/swf/impossiblequiz2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Learn to Fly 1",
		description: "Launch the penguin as far as you can, can you get all the upgrades? If you like this game, make sure to also play Learn to Fly Idle and Learn to Fly 3, the most recent editions!",
		tags: "",
		route: "learn-to-fly-1",
		source: "/swf/learntofly1.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Learn to Fly 2",
		description: "You're a penguin, you learned how to fly... but then icebergs stopped you and crushed your dreams. Now you're back for revenge!",
		tags: "",
		route: "learn-to-fly-2",
		source: "/swf/learntofly2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Madness Project Nexus (Redirect)",
		description: "Project Nexus is a third-person Run n' Gun / Beat'Em Up filled with arcade-style action and button-mashing brutality. Gun your way through droves of bad guys in the Story Campaign, or build your perfect killing machine in the neverending onslaught of Arena Mode.",
		tags: "",
		route: "madness-project-nexus",
		source: "/swf/madness-project-nexus.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: false
	},
	{
		title: "Motherload",
		description: "Use your digger to excavate as much ore as possible. Use the money you earn to upgrade your digger and move deeper and deeper underground, to unearth the mysteries from below.",
		tags: "",
		route: "motherload",
		source: "/swf/motherload.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "PacMan",
		description: "Pac-Man is a Japanese video game franchise published, developed and owned by Bandai Namco Entertainment. Entries have been developed by a wide array of other video game companies, including Midway Games, Atari and Mass Media, Inc..",
		tags: "",
		route: "pacman",
		source: "/swf/pacman.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Snake",
		description: "Snake is a video game genre where the player maneuvers a growing line that becomes a primary obstacle to itself. The concept originated in the 1976 two-player arcade game Blockade from Gremlin Industries, and the ease of implementation has led to hundreds of versions for many platforms.",
		tags: "",
		route: "snake",
		source: "/swf/snake.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Super Mario Flash",
		description: "Super Mario Flash 1 is waiting for your action! Explore all levels. This is the most beautiful and most complete Super Mario clone all Mario games we have on our site. You have the choice of Mario or Luigi and can explore all parts of the world thereafter. This game also has a 'Level Editor', wilt thou not always make your own Mario World before? Here you have chance! If you have done a world you can share it with other people. Luigi or his brother to go with the arrow keys and shoot with the spacebar.",
		tags: "",
		route: "super-mario-flash",
		source: "/swf/super-mario-flash.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Super Mario Flash 2",
		description: "The graphics have been improved in this sequel. Choose between Mario or Luigi, complete all the stages and head to the castle to save Princess Peach. Beware of your poweful enemies!",
		tags: "",
		route: "super-mario-flash-2",
		source: "/swf/supermarioflash2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Tetris",
		description: "Tetris is a puzzle video game created by Soviet software engineer Alexey Pajitnov in 1984. It has been published by several companies for multiple platforms, most prominently during a dispute over the appropriation of the rights in the late 1980s.",
		tags: "",
		route: "tetris",
		source: "/swf/tetris.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "The Last Stand Union City",
		description: "Union City, also known as The Dead Zone, is a fictional metropolitan city featured in The Last Stand 2, The Last Stand: Union City, and The Last Stand: Dead Zone. It is also briefly mentioned in The Last Stand. Pre-outbreak, it had a population of 350,148, [n 1] the largest in the state.",
		tags: "",
		route: "the-last-stand-union-city",
		source: "/swf/the-last-stand-union-city.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Worlds Hardest Game 2",
		description: "World's Hardest Game 2 is the second episode of the self-proclaimed world's hardest game series! Hone your reflexes and accuracy as you try to move your little block to the end of each stage without touching the obstacles. Doing so will bring you back to the start so you can try again. The difficulty goes up after every stage, so keep your focus and see how far you can get in the World's Hardest Game 2.",
		tags: "",
		route: "worlds-hardest-game-2",
		source: "/swf/worldshardestgame2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Zombocalypse 2 (Pending Ruffle Issue)",
		description: "Zombocalypse 2 is the most recent edition of the popular zombie shooting game with a lot of interesting game modes and features. The mission of the player is to kill crowds of zombies and survive in this hell. At the beginning of the game, player finds himself in the center of the street and the waves of zombies are slowly coming to eat your brain. You have to fight for your life and unlock different achievements. During the game you will discover different power-ups and new weapons to increase your chances to survive in this hell. There are also some features that will help you to succeed in Zombocalypse 2. For example, if you comlete the combo kill of 25,50 or 100 zombies, you can all air strike to destroy hundreds of zombies at a time. You can also activate the special power-ups that fall from sky.",
		tags: "",
		route: "zombocalypse-2",
		source: "/swf/zombocalypse-2.1.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: false
	},
	{
		title: "Zombocalypse",
		description: "Zombocalypse is an awesome zombie blasting 2D game in which fight waves and waves of undead. You might have known this game for a long time and we saved it from perdition along with a flash player. Thanks to this extension, you can continue to play it as long as you like.",
		tags: "",
		route: "zombocalypse",
		source: "/swf/zombocalypse.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Canyon Defense",
		description: "Canyon Defense is an epic tower defense game in which you must attempt to defend your own base in the middle of a desert canyon. You must line the walls of the canyon with defensive towers in order to repel the invading troops.",
		tags: "",
		route: "canyon-defense",
		source: "/swf/Canyon Defense.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: false
	},
	{
		title: "Copter",
		description: "Copter game is a flash game for one player where you fly a helicopter through a maze of obstacles. This version is the most popular of helicopter game, being very easy to operate and required almost no skills at all. ... Copter game is played using just one button, the left button of your mouse.",
		tags: "",
		route: "copter",
		source: "/swf/Copter.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Desktop Tower Defence",
		description: "Desktop Tower Defense is a Flash-based tower defense browser game created by Paul Preece in March 2007. The game had been played over 15.7 million times as of July 2007, and was one of Webware 100's top ten entertainment web applications of 2007",
		tags: "",
		route: "desktop-tower-defence",
		source: "/swf/DesktopTowerDefence.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: false
	},
	{
		title: "Donkey Kong",
		description: "Donkey Kong is a video game series created by Shigeru Miyamoto. It follows the adventures of an ape named Donkey Kong and his clan of other apes and monkeys. The franchise primarily consists of platform games, originally single-screen action puzzle games and later side-scrolling platformers.",
		tags: "",
		route: "donkey-kong",
		source: "/swf/DonkeyKong.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Draw Play",
		description: "A draw play, or simply draw for short, is a type of American football play. The draw is a running play disguised as a passing play. It is the opposite of a play-action pass, which is a passing play disguised as a running play. The play is often used in long yardage situations.",
		tags: "",
		route: "draw-play",
		source: "/swf/DrawPlay.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Draw Play 2",
		description: "Draw-Play 2 is the sequel to the hugely popular and fun Draw-Play. In this follow-up, the gameplay remains the same - you must help your character through a series of levels by drawing them a path to walk on! In this title, even more, challenges and levels await and you must once again test your drawing skills and logic.",
		tags: "",
		route: "draw-play-2",
		source: "/swf/DrawPlay2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "The Beard",
		description: "This game is all about Tom Fulp's commitment to not shave his face until his next console game, Castle Crashers, is completed. It's a ridiculously over-the-top arcade boss battle that is well worth your time. We hope you enjoy it and discover the secret character!",
		tags: "",
		route: "the-beard",
		source: "/swf/castlecrashingthebeard.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Choose Your Weapon 2",
		description: "Swing and jump in this platformer as you pick the right weapon to kill the enemies on each level.",
		tags: "",
		route: "choose-your-weapon-2",
		source: "/swf/chooseyourweapon2_LB.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Clear Vision",
		description: "Clear Vision is a free sniper game. Between assassination jobs, learn the dark truth about this stick dude's past. It's not pretty. But he does have a nice apartment! This is a stick sniper masterpiece where you take on the role of an assassin who has lead a hard life full of cold blood and hot women. It's a dark world when you're an assassin for hire and even though he may be the best there is at what he does, that doesn't mean what he does is very nice! Use basic sniper mechanics to delve into the questionable past of this hitman as you rack up a kill count and blast your way through his story. This is a story based stick sniper shooter which brings the duo-tone world of hyper-violent stick games to life through its deep characterization, and complex storytelling. You'll be introduced to characters you might not like but you will definitely understand. You will be forced to question your own morals and ethics as you stare down the barrel of a gun and into the yawning chasm of imperfect humans. Stick games are a staple of the casual gaming industry. They have been around longer than any of us and will probably be around a lot longer than any of us. Clear Vision is a step above the rest. It is truly one of the greatest stick sniper games available.",
		tags: "",
		route: "clear-vision",
		source: "/swf/clear-vision.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Clear Vision Elite",
		description: "Clear Vision Elite is a free stick-sniper game. Clear Vision is back! This time with a kitchen, a computer, an office, and all sorts of things that aren't sniping --which is the point of the game. But, don't be confused, this is a sniper game. You'll have to click through lists, and go through different rooms and get all wrapped up in a plot line but at the end of all that after you bought your ammo and checked a name off a list and cleaned your kitchen or whatever: You will finally get to do some sniping! And it is worth it. The physics, the puzzles, the stick men, the aiming. It all comes together with your choice of guns and ammo to create a truly immersive sniper experience. Is it revenge, are you trying to save the world? Are you doing it just for the money? Only those who read through the multiple screens at the beginning of the game will know for sure. This is an exciting sniper adventure where you take on the underground gangs of the world and dish out justice from behind the business end of a smoking gun. Ready, aim, fun!",
		tags: "",
		route: "clear-vision-elite",
		source: "/swf/clearvisionelite.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Crazy Taxi",
		description: "Petrol heads unite in this crash and burn style of driving game. Crazy Taxi Game is an online crazy driving complete with the crazy cabbie, the colored cars, the long desert highways, and the freaky car jumping. If you love the car chases in Taxi 2, play taxi driver man and recreate the riveting speed runs as you rush to beat the time. Hurry up and pump in the adrenaline to switch to the open lanes at the perfect time before they cut you off. Pound those keyboard arrow keys to accelerate forward and pass the cars blocking you ahead and keeping you from crossing the crucial time lines. Your quick thinking will be the deciding factor to garner the top spots in the scoring list. Each checkpoint you make adds up an additional time which means more asphalt to run. Failing to reach a checkpoint when the time runs out will mean that your mission is over. That s why failure is not an option for the speed freaks. There s not much need to decelerate, instead you must accelerate all you can! What are you waiting for? Pay the fare, and do the run of your life with Crazy Taxi Game.",
		tags: "",
		route: "crazy-taxi",
		source: "/swf/crazy-taxi.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Cursor 10",
		description: "Use your 10 cursors to reach the 16th floor. As your previous lives are replayed, try to cooperate with yourself to reach the goal.",
		tags: "",
		route: "cursor-10",
		source: "/swf/cursor10.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Cut The Rope (File not found)",
		description: "Cut the Rope is a Russian series of physics-based puzzle video games developed by the Russian entertainment company ZeptoLab for several platforms and devices.",
		tags: "",
		route: "cut-the-rope",
		source: "/swf/cut-the-rope.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: false
	},
	{
		title: "Dad N' Me",
		description: "Dad n' Me is a brawler/ fighting game created by Tom Fulp and Dan Paladin, creators of Alien Hominid,in 2005. It is seen by many as the game which popularized flash games, as for its time it was unique as it was very advanced in a genre that was seen by some as primitive.",
		tags: "",
		route: "dad-n-me",
		source: "/swf/dadnme.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Dance of the Robots",
		description: "Dodge the bombs that keep on dropping. Careful more and more drop as it gets crazier.",
		tags: "",
		route: "dance-of-the-robots",
		source: "/swf/danceoftherobots.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Defend Your Castle (File not found)",
		description: "Defend Your Castle is a series of video games developed by XGen Studios. The original version of Defend Your Castle is a Macromedia Flash-based browser game. It requires the player to kill all enemy units before they destroy the player's castle.",
		tags: "",
		route: "defend-your-castle",
		source: "/swf/defend-your-castle.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: false
	},
	{
		title: "Dental Adventure",
		description: "Always wanted to be a dentist? Well, even if you have not, you'll have lots of fun drilling teeth, filling cavities, and using your dental skills to solve lots of dental dilemmas. Hit the road with Glenn Martin, DDS and family and travel cross-country to 8 destinations, meeting new people and their mouths",
		tags: "",
		route: "dental-adventure",
		source: "/swf/dental-adventure.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Duck Hunt",
		description: "Duck Hunt is a fantastic arcade game that takes inspiration from the original classic available on Nintendo game systems. You must shoot the moving ducks down with your mouse and see how many points you can score.",
		tags: "",
		route: "duck-hunt",
		source: "/swf/duck-hunt.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "DX Hockey",
		description: "What about a relaxed game of table hockey? DX Hockey is an air hockey game with different style, more bonus features and nice graphics. In this mouse driven air hockey game you have to beat your computer opponent, also collect those extra items! Use the mouse to move the puck in your area and try to accumulate seven points to proceed to the next level. Get all bonus items to have an advantage. Collect passwords and use them to continue to different game levels. There is total of 8 levels in this cool air hockey game called DX Hockey. Can you finish them all?",
		tags: "",
		route: "dx-hockey",
		source: "/swf/dxhockey.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Bloxors",
		description: "Get the block to fall into the square hole to progress to the next level…",
		tags: "",
		route: "bloxors",
		source: "/swf/Bloxors.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Bullet Bill 2",
		description: "Take a turn with the bullets of Super Mario Brothers. These bullets take flight and it's your job to see them safely to the end. Can you kill the goombas on the way?",
		tags: "",
		route: "bullet-bill-2",
		source: "/swf/Bullet Bill 2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Bullet Bill 3",
		description: "Smash your way through 54 exciting levels, or make your own with new level creation tools!",
		tags: "",
		route: "bullet-bill-3",
		source: "/swf/Bullet Bill 3.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Bomb a Bomb",
		description: "Bomb It 4 is the fourth version of this fantastic Bomberman style game in which you must test out your bomb dropping skills on a myriad of different levels. The gameplay remains the same as the previous versions - you control a single character and you must move around each level and deploy bombs to try and destroy your enemies without being killed yourself.",
		tags: "",
		route: "bomb-a-bomb",
		source: "/swf/bombabomb.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Bow Man",
		description: "Bowman is an archery game where you and an opponent take shots at each other. You win when you've hit the opponent fatally. It can take a few arrows. Bowman can be played against the computer or via local multiplayer.",
		tags: "",
		route: "bow-man",
		source: "/swf/bowman.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Bow Man 2",
		description: "Become a master of archery in Bowman 2! You need to define the shooting angle and aim carefully. Your mission is to eliminate the opponent by successfully hitting them. Have fun!",
		tags: "",
		route: "bow-man-2",
		source: "/swf/bowman2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Bowmaster",
		description: "A brand new version of the world-famous multiplayer game with bowmen — a hotsy-totsy aim and shoot game Bowmasters has in store for you: • 60+ INSANE CHARACTERS from all dimensions absolutely for free! • 60+ DIFFERENT WEAPONS for total mayhem, awesome fatalities with rag-doll physics!",
		tags: "",
		route: "bowmaster",
		source: "/swf/bowmaster.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Bowmaster Prelude",
		description: "Bowmaster Prelude is one of the original browser games and was released over 10 years ago! ... You control a brave Bowmaster and you must manually fire arrows at the incoming knights and warriors. Take into consideration the angle and power of your bow shots and also the movement of the enemies.",
		tags: "",
		route: "bowmaster-prelude",
		source: "/swf/bowmasterprelude.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Bubble Shooter",
		description: "Bubble Shooter is a clone of the Puzzle Bobble arcade game that was released by Taito in 1994. The Bubble Shooter game and IP are owned by Ilyon Dynamics, after they were acquired from Absolutist who released the original game in 2002. The game was ported to iOS in 2010, and was ported to Android in 2012.",
		tags: "",
		route: "bubble-shooter",
		source: "/swf/bubble shooter.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Bubble Tanks 2",
		description: "Similar to BT1, you must travel through giant bubbles, destroying enemy tanks and taking their bubbles to fuel your growth. As you grow, you constantly evolve and get ever better weapons. Ultimately, you'll have to face the ultimate adversary and defeat it to win the game.",
		tags: "",
		route: "bubble-tanks-2",
		source: "/swf/bubble_tanks_2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Bullet Bill",
		description: "Use the arrow keys to move this bullet around the Mushroom Kingdom. Dodge the obstacles and get the highest score!",
		tags: "",
		route: "bullet-bill",
		source: "/swf/bullet-bill.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Burger Tycoon",
		description: "Welcome back on the land where you always get to have the best time of your life, dearest friends, because on our site games-kids.com you will find nothing but the best and most exciting games, and we truly hope that you're willing to join us today within these great adventures as well as you did in all of them. Today's following game is called Burger Tycoon, and it's quite a thinking and management type of game, in which you'll have to run a very successful, yet hard business. We say that it's hard to keep a burger tycoon running, because you need to take care of so many things, such as your own crops you will use for the cows, the factory itself, the board of directors and other departments, and your restaurant of course. We know that you kids are going to do a wonderful job today, in Burger Tycoon, and we wish you guys good luck and we hope you'll have a blast!",
		tags: "",
		route: "burger-tycoon",
		source: "/swf/burgertycoon.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Bot Arena 3 (File not found)",
		description: "Build a team of bots by following the instructions in the game. Each bot is composed of a chassis, plating, and weapon. After purchasing the items; first mount the plating to the chassis. Second mount the weapon to the plating. You can purchase more than one bot. Once you have built your team, click start battle to choose your tournament. Better chassis, plating, and weapon upgrades will be available as you advance through the tournament. During battle you can click and drag your bot to the desired location.",
		tags: "",
		route: "bot-arena-3",
		source: "/swf/bot-arena-3.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: false
	},
	{
		title: "Boxhead 2",
		description: "Boxhead 2 is ta free online combat games. Lock and load your favorite item, take on the whole world in slo mode or tag in a friend to blast away at the competition back to back like in your favorite action movie. The choice is yours! ... You'll be going toe to toe with other players from around the world.",
		tags: "",
		route: "boxhead-2",
		source: "/swf/dagobah_boxhead_2play.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Electric Man",
		description: "Electric Man is an awesome stickman fighter Flash game in which you must fight against a range of opponents using a variety of different punch and kick combos. Before you enter the game, you can choose the name and color of your stickman, and also the difficulty level (easy, normal or pro). Once you have chosen your character you can then complete a tutorial that shows you the basic game mechanics and move sets.",
		tags: "",
		route: "electric-man",
		source: "/swf/ElectricMan.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Excite Bike",
		description: "Excitebike is a motocross racing video game developed and published by Nintendo. In Japan, it was released for the Famicom in 1984 and then ported to arcades as Vs. Excitebike for the Nintendo Vs. System later the same year.",
		tags: "",
		route: "excite-bike",
		source: "/swf/ExciteBike.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Feudalism 2",
		description: "Feudalism 2 is a free fighter game. As they say, the world isn't going to conquer itself. In Feudalism 2, that's your job. In this strategy game with a helping of RPG fixings, select a character, bolster your army with a little gold, and then start conquering. ... Prove just how effective a little bit of feudalism can be.",
		tags: "",
		route: "feudalism-2",
		source: "/swf/Feudalism2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Flood Runner 3",
		description: "Introducing the third instalment of Flood Runner! The aim is still to run and jump from one platform to the next to escape the wave that's hot on your heels. Flood Runner 3 has improved graphics and the game itself is a little less tricky than the previous episodes. If you fall into the water or lava, perform a QTE to survive and rejoin the race.",
		tags: "",
		route: "flood-runner-3",
		source: "/swf/Flood_Runner3.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Flood Runner 4",
		description: "Flood Runner 4 is an endless runner game. Run from flood and giant monsters. Avoid challenging obstacles and try to survive as long as possible. Have Fun!",
		tags: "",
		route: "flood-runner-4",
		source: "/swf/Flood_Runner_4.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Flood Runner 2",
		description: "A huge wave is chasing you fast. Your goal is to beat the incoming flood by running fast and using the springs for big bounces and jump on the ramps for a boost. The surfboard will only save your life once. Run for your life and don't let the tsunami get you.",
		tags: "",
		route: "flood-runner-2",
		source: "/swf/The_Flood_Runner_2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Earthbound",
		description: "EarthBound, released in Japan as Mother 2: Gīgu no Gyakushū, is a role-playing video game developed by Ape Inc. and HAL Laboratory and published by Nintendo for the Super Nintendo Entertainment System. The second entry in the Mother series, it was first released in Japan in August 1994, and in North America in June 1995. As Ness and his party of four, Paula, Jeff and Poo, the player travels the world to collect melodies from eight Sanctuaries in order to defeat the universal cosmic destroyer Giygas.",
		tags: "",
		route: "earthbound",
		source: "/emulator/snes/earthbound.smc",
		gameType: "snes",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Effing Worms",
		description: "Effing Worms is a free stick game. Don't you wish you were a giant worm? Dig fast tunnels, and surprise hippies, cops, cows and pedestrians from below! Feed the beast, baby!",
		tags: "",
		route: "effing-worms",
		source: "/swf/effingworms.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Fat Ninja",
		description: "Who says a Fat Ninja can't be just as good as a skinny ninja? Well, many people are saying that, but you are here to play the role of one in a brand new action-adventure fighting game with ninjas offered to you free of charge on our website, where despite being overweight, you and your avatar will give it your best to kick ass and defeat all the enemies, just like any shinobi would honor their mission by doing!",
		tags: "",
		route: "fat-ninja",
		source: "/swf/fat-ninja.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Feudalism",
		description: "Feudalism is an open world battle game in which you need to manage your soldiers and expand your power.",
		tags: "",
		route: "feudalism",
		source: "/swf/feudalism.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Flashcraft",
		description: "If you are looking for exciting adventures and a lot of fun, then this game is for you! Flash Craft was created by a team of professionals, so that you fully enjoy the easy controls, impeccable interface and an exciting game. There are Survival and Creative modes, day and night, weather changes and seasons.",
		tags: "",
		route: "flashcraft",
		source: "/swf/flashcraft.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Free Rider 2",
		description: "Free Rider 2 is the second episode of Free Rider, a bike riding game with a DIY track-drawing feature.",
		tags: "",
		route: "free-rider-2",
		source: "/swf/freerider2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Frogger",
		description: "Frogger is a 1981 arcade action game developed by Konami and manufactured by Sega. In North America, it was released by Sega/Gremlin. The object of the game is to direct frogs to their homes one by one by crossing a busy road and navigating a river full of hazards.",
		tags: "",
		route: "frogger",
		source: "/swf/frogger.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Grow RPG",
		description: "Grow RPG is a cool turn based RPG game in which you must build up your kingdom and fight against the evil demon who is trying to destroy your world. Each turn you must place an object in your world such as a tree, a house, some stone, a chest or water for example.",
		tags: "",
		route: "grow-rpg",
		source: "/swf/growrpg.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Gods Playing Field",
		description: "God's Playing Field is a free strategy game. You decide who lives and dies. If you've ever wanted a chance to play God, this is it.",
		tags: "",
		route: "gods-playing-field",
		source: "/swf/Gods Playing Field.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Grid Lock",
		description: "Locked up blocks on the grid. Is there anything more we can explain to you?",
		tags: "",
		route: "grid-lock",
		source: "/swf/Gridlock.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Hobo",
		description: "Hobo is the first instalment of this fun fighting game. You take control of a hobo and must fight your way through the streets! Don't let anyone boss you around or mistreat you - if they try to then use your super strength to punch and kick them into oblivion! Your hobo has a range of different fighting moves so try to use them all to defeat your enemies.",
		tags: "",
		route: "hobo",
		source: "/swf/Hobo.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Indestructo Tank",
		description: "As the pilot of an indestructable tank, you have certain responsibilities - Kicking Butt! Use the enemies weapons against them as you catapult yourself through the air and destroy the enemy air force!",
		tags: "",
		route: "indestructo-tank",
		source: "/swf/IndestructoTank.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Line Rider 2",
		description: "Line Rider is an internet game, with versions available for Microsoft Silverlight, Javascript, Windows, and Flash. It was originally created in September 2006 by Boštjan Čadež, a Slovenian student. Soon after its initial appearance on DeviantArt, Line Rider became an internet phenomenon.",
		tags: "",
		route: "line-rider-2",
		source: "/swf/Line Rider 2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Mario Revived",
		description: "Super Mario Revived is a upcoming exploration and 3-D platformer created by Nintendo for the Nintendo Spectrum, the Nintendo Switch, and the 3DS (in a non-HD style). It is a nostalgia game, with old enemies and obstacles and new features mixed in along with it.. It is said to be the longest platformer in history of Mario.",
		tags: "",
		route: "mario-revived",
		source: "/swf/Mariorevived.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Max Dirt Bike 1",
		description: "Max Dirt Bike is the ultimate balance game. All you're going to need to remember if you wanna succeed in the fast-paced, highly competitive world of internet dirt biking is this: rev, charge, balance & brake. There isn't a hill you can't climb, a slope you can't overcome or a valley you won't dominate if you master the art of revving up, balancing on the brink, charging the hills and braking when the situation requires it. Max Dirt Bike is a smart physics action game that puts your dexterity and puzzle muscles to the test. If you want to end each level by fading into the darkness and disappearing to thee great leaderboard in the sky, then this is the. game you've been waiting for. The first, best, and most played dirt bike game with such a cool background!",
		tags: "",
		route: "max-dirt-bike-1",
		source: "/swf/MaxDirtBike1.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Monopoly",
		description: "Monopoly is a real-estate board game for two to eight players. The player's goal is to remain financially solvent while forcing opponents into bankruptcy by buying and developing pieces of property. Bankruptcy results in elimination from the game. The last player remaining on the board is the winner.",
		tags: "",
		route: "monopoly",
		source: "/swf/Monopoly.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "N",
		description: "In N, the player controls a ninja who navigates tile-based levels while simultaneously avoiding hazards, collecting gold, and eventually opening an exit door which completes the level.",
		tags: "",
		route: "n",
		source: "/swf/N.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Parachute",
		description: "Parachute is a video game released in 1983 by Homevision for the Atari 2600. The game puts the player in the role of parachutist who is falling gently from the sky. In order to land safely, the player must evade aeroplanes, helicopters, birds and hot-air balloons.",
		tags: "",
		route: "parachute",
		source: "/swf/Parachute.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Portal",
		description: "Portal: The Flash Version includes over 40 challenging, portals thinking levels, which features almost every feature the real game does, in 2d - energy balls, cubes, turrets and even the famous crusher from the trailer. The game also includes a console to mess around with after finishing the game, or just being frustrated by thinking with portals!",
		tags: "",
		route: "portal",
		source: "/swf/Portal.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Prince of War",
		description: "Prince of War is an action packed war game where you are tasked to defeat the orcs to keep your supply line running. Defeat all of the orcs they throw at you to improve your forces' morale. Your kingdom is yours to save!",
		tags: "",
		route: "prince-of-war",
		source: "/swf/PrinceofWar.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Prince of War 2",
		description: "23 years after Prince of War, the sequel starts in the midst of civil unrest in the nation of Veidar. The duchy of Valis is rising against the kingdom with Duke Dunkeld leading the enemy armies. However, behind the enemy lines lurks something dark and evil...",
		tags: "",
		route: "prince-of-war-2",
		source: "/swf/PrinceofWar2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Raft Wars",
		description: "Raft Wars is a fun, level-based shooting game created by Martijn Kunst, where you and your brother Simon will need to defend your treasure from enemies of all kinds!",
		tags: "",
		route: "raft-wars",
		source: "/swf/RaftWars.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Shock 1",
		description: "",
		tags: "",
		route: "shock-1",
		source: "/swf/SHOCK1.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Staggy the Boy Scout Slayer 2",
		description: "The boy scouts must die. This knight knows the scouts evil ways, and you must help cut away the freckled masses.",
		tags: "",
		route: "staggy-the-boy-scout-slayer-2",
		source: "/swf/Staggy The Boy Scout Slayer II.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Stick War",
		description: "Stick War is a classic strategy war game featuring stick figures. This original title was released in 2009 in Flash, and is now available to play in your web browser through Ruffle. Wage war through several nations and bring peace to the continent through a fun, action-packed campaign!",
		tags: "",
		route: "stick-war",
		source: "/swf/Stick War.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Storm the House 2",
		description: "Storm The House 2 is a sequel to Storm the House. Enjoy!",
		tags: "",
		route: "storm-the-house-2",
		source: "/swf/StormtheHouse2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Tactical Assassin",
		description: "Tactical Assassin is a mission based sniping game that puts your cunning and accuracy to the test. Every level, you are given different targets to assassinate to clear your mission. You will need to make your clients happy so make sure to time and sequence your shots perfectly. Become the best sniper with Tactical Assassin!",
		tags: "",
		route: "tactical-assassin",
		source: "/swf/TacticalAssassin.swff",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Tactical Assassin 2",
		description: "Tactical Assassin 2 is a game in which you play as a sniper in the shadows. You'll be given different targets to eliminate, and you'll all do them while hidden away from the enemy. You're also not just some sniper, you have your own morals and codes, and that includes a very important rule - killing innocent people is not an option.",
		tags: "",
		route: "tactical-assassin-2",
		source: "/swf/TacticalAssassin2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "The Unfair Platformer",
		description: "The Unfair Platformer is a funny and unique platformer game with a lot of traps in it. Stay careful and aware or you'll die.",
		tags: "",
		route: "the-unfair-platformer",
		source: "/swf/The Unfair Platformer.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Toss the Turtle",
		description: "Use cannons, bombs, and jetpacks to shoot your turtle as far as possible! Collect cash to upgrade your equipment.",
		tags: "",
		route: "toss-the-turtle.swf",
		source: "/swf/Toss The Turtle.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Zelda",
		description: "The Legend of Zelda is a high fantasy action-adventure video game franchise created by Japanese game designers Shigeru Miyamoto and Takashi Tezuka. It is primarily developed and published by Nintendo, although some portable installments and re-releases have been outsourced to Capcom, Vanpool, and Grezzo.",
		tags: "",
		route: "zelda",
		source: "/swf/Zelda.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Zoeken",
		description: "",
		tags: "",
		route: "zoeken",
		source: "/swf/Zoeken.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Armor RPG Experiment",
		description: "Power up your attack, magic, and defense, and clash against your evil opponent to win experience and items.",
		tags: "",
		route: "armor-rpg-experiment",
		source: "/swf/armorrpg_mod.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Galaga",
		description: "Galaga is a 1981 fixed shooter arcade video game developed and published by Namco. In North America, it was released by Midway Manufacturing. It is the sequel to Galaxian, Namco's first major video game hit in arcades.",
		tags: "",
		route: "galaga",
		source: "/swf/galaga.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Geo Land RPG",
		description: "A fun RPG game with travel between 2 dimensions in order to save the world from an unknown enemy.",
		tags: "",
		route: "geo-land-rpg",
		source: "/swf/geolandrpg.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Grid 16",
		description: "Tons of small games, each getting harder and harder as time speeds up. Survive as long as you can in the grid.",
		tags: "",
		route: "grid-16",
		source: "/swf/grid16.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Grow Island",
		description: "Grow Island is an episode of Grow series in which you need to place the correct items in order to develop your island fully.",
		tags: "",
		route: "grow-island",
		source: "/swf/growisland.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Gun Blood",
		description: "This town isn't big enough for the two of us, so draw! If you have ever wanted to be a part of a western duel, then look no further than Gunblood! Choose from one of ten wild west characters and attempt to outshoot your opponents! Nine rounds of intense, reaction based duels await you in this visceral game! After every successful duel, you are met with another, more challenging opponent and your odds of survival greatly decrease! Can you win every duel and prove that you are the best shot in town?",
		tags: "",
		route: "gun-blood",
		source: "/swf/gunblood.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Hell Cops",
		description: "You're a cop on a mission to kill. Run over everyone and everything to get to the end of each level. If you crash, you fail. If you don't kill right, you fail.",
		tags: "",
		route: "hell-cops",
		source: "/swf/hell-cops.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Hexxagon",
		description: "Play Hexxagon online for free! A highly addictive, radioactive and hexagonal board game based on Ataxx.",
		tags: "",
		route: "hexxagon",
		source: "/swf/hexxagon.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Hobo 4: Total War",
		description: "This time our beloved Hobo takes on the whole army. He is a wanted menace and everyone wants him dead. Prepare for total war, Hobo style!",
		tags: "",
		route: "hobo-4-total-war",
		source: "/swf/hobo-4-total-war-749179f9.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Hobo 5: Space Brawls",
		description: "Hobo 5 is a game where you play as a hobo who tries to escape from the alien's abduction. Fight with the aliens by kicking and punching them!",
		tags: "",
		route: "hobo-5-space-brawls",
		source: "/swf/hobo-5-space-brawls--11410f2f2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Hobo 6: Hell",
		description: "Hobo 6 is subtitled Hell, and that is what you can expect in this game. Hobo has left earth for hell and is now facing demons and Satan himself. Arrow keys to move, A to punch and pick up objects, S for kicks and other things. Have fun!",
		tags: "",
		route: "hobo-6-hell",
		source: "/swf/hobo-6-hell-136403467.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Hobo 7: Heaven",
		description: "No lazy hobos allowed in Heaven! Hobo must kick and punch his way in, pulling off combos with the keyboard for disgusting special moves.",
		tags: "",
		route: "hobo-7-heaven",
		source: "/swf/hobo-7-heaven-14404_6.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Hobo 3: Wanted",
		description: "Hobo 3 continues with the story line where Hobo is a wanted fugitive after escaping from prison, and the government wants him dead or alive.",
		tags: "",
		route: "hobo-3-wanted",
		source: "/swf/hobo3-wanted-5673395b.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Hobo Prison Brawl",
		description: "Hobo Prison Brawl is an action game that lets you play as a hobo prison inmate who has had enough of the place, and is now ready to beat the living daylights out of everyone so he can escape! Beat up other prisoners and prison guards as you try to leave, while also learning new combos to give them everyone even more pain and punishment.",
		tags: "",
		route: "hobo-prison-brawl",
		source: "/swf/hoboprisonbrawl.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Hot Corn",
		description: "",
		tags: "",
		route: "hot-corn",
		source: "/swf/hotcorn.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Impossible Quiz Book",
		description: "The Impossible Quiz Book is a quiz-centered game that gives you a ton of questions to answer. There's a little twist though, not everything is as simple as they seem. Some of the questions will need some out-of-context answers, and you'll need to think through them. You'll be using all the information shown on-screen (not just the multiple choices they give you), which means you might need to check the interface for buttons you can press, or a keyboard key you might need to hit to get to the next question.",
		tags: "",
		route: "impossible-quiz-book",
		source: "/swf/impossiblequizbook.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Indestructo Tank 2",
		description: "Indestructo Tank is back for even more blasts, ready for some more Indestructo-Fun? Take on the Role of IndestructoTank pilot Dirk Danger and play through all new game modes!",
		tags: "",
		route: "indestructo-tank-2",
		source: "/swf/indestructotank2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Interactive Buddy 2",
		description: "The sequel to Interactive Buddy! Interact with the buddy using many new items and weapons!",
		tags: "",
		route: "interactive-buddy-2",
		source: "/swf/interactivebuddy2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Internet RPG",
		description: "",
		tags: "",
		route: "internet-rpg",
		source: "/swf/internet-rpg.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Jump",
		description: "",
		tags: "",
		route: "jump",
		source: "/swf/jump.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Kung Fu Remix 2",
		description: "Kung Fu Remix classic game. A remake of the NES classic.",
		tags: "",
		route: "kung-fu-remix-2",
		source: "/swf/kungfuremix2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Line Game Orange",
		description: "In this game, you have to guide this orange line. It needs to reach its destination which is a green spot. There are many obstacles on the way. Make sure that you help it from the start to the end. This orange line is very sensitive so you have to take care of it. It is time to have some fun!",
		tags: "",
		route: "line-game-orange",
		source: "/swf/linegameorange.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Mario Combat",
		description: "Your Super Mario! What does that mean? It means you gotta go kick Bowsers butt! And that's exactly what your going to do!",
		tags: "",
		route: "mario-combat",
		source: "/swf/mariocombat.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Mini Putt",
		description: "Place the golf balls and hit them skillfully in various tricky golf courses.",
		tags: "",
		route: "mini-putt",
		source: "/swf/miniputt.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Only Level",
		description: "This Is The Only Level is a simple fun game where you must find a way to go to the finish point with a different twist in each level.",
		tags: "",
		route: "only-level",
		source: "/swf/onlylevel.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "PacXon",
		description: "Pacxon is an addicting arcade game, based on the classic Pacman game, Pac xon will keep you challenged for hours.",
		tags: "",
		route: "pacxon",
		source: "/swf/pacxon.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Pandemic 1",
		description: "Evolve, Infect, Kill! Pandemic is a game where you get to evolve you own biological virus and wipe out mankind!",
		tags: "",
		route: "pandemic-1",
		source: "/swf/pandemic-1.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Pandemic 2",
		description: "Pandemic 2 is a free game about the spread of a dangerous pandemic in the modern age. This is a strategy game about the danger and threat of an aggressive virus as it slowly spreads its way across the globe. By playing as the virus instead of as medics, researchers, or other members of the medical and scientific communities you will see the mechanisms by which a virus may spread. This is a casual game with simple mechanics that allow for deep meaningful choices on behalf of the player. As the game continues your objective will be to spread your virus as far, as wide, and as fat as you possibly can. As your virus evolves you'll gain experience points. With these experience points, you will be able to purchases upgrades. You can choose from a lit of different symptoms which all have their own ways of helping the virus spread. This is a casual time-management game so you'll have to upgrade and then wait and see if your disease is progressing before your time limit. As time passes, you'll gain evolution points which is what you can use to purchase upgrades.",
		tags: "",
		route: "pandemic-2",
		source: "/swf/pandemic2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Parking Mania",
		description: "Use the arrow keys to steer and drive the car forward and backward. The goal is to park the car in the parking space. Just don't crash into anything!",
		tags: "",
		route: "parking-mania",
		source: "/swf/parkingmania.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Powerpuff Girls Zombgone",
		description: "Help remove barriers standing in the way of these girls.",
		tags: "",
		route: "powerpuff-girls-zombgone",
		source: "/swf/powerpuff_girls_zombgone.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Raft Wars 2",
		description: "Raft Wars 2 is an action-packed shooting game created by Martijn Kunst as the sequel to the hit game Raft Wars. Simon and his brother return from a well-deserved holiday only to find a water park on top of where they've hidden their buried treasure.",
		tags: "",
		route: "raft-wars-2",
		source: "/swf/raft-wars-2_mochi_secure.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Real Estate Tycoon",
		description: "Real Estate Tycoon is playable online as an HTML5 game.",
		tags: "",
		route: "real-estate-tycoon",
		source: "/swf/real-estate-tycoon-1350817f.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Red Shift",
		description: "Level up your ship and take on the enemy!",
		tags: "",
		route: "red-shift",
		source: "/swf/redshift.swf ",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Robot Unicorn Attack",
		description: "",
		tags: "",
		route: "robot-unicorn-attack",
		source: "/swf/robotunicornattack.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Sift Heads 1",
		description: "",
		tags: "",
		route: "sift-heads-1",
		source: "/swf/sift-heads-1.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Sift Heads 2",
		description: "",
		tags: "",
		route: "sift-heads-2",
		source: "/swf/sift-heads-2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Sift Heads 3",
		description: "",
		tags: "",
		route: "sift-heads-3",
		source: "/swf/sift-heads-3.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Sift Heads 4",
		description: "",
		tags: "",
		route: "sift-heads-4",
		source: "/swf/sift-heads-4.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Sift Heads 5",
		description: "",
		tags: "",
		route: "sift-heads-5",
		source: "/swf/sift-heads-5.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Sift Heads World",
		description: "",
		tags: "",
		route: "sift-heads-world",
		source: "/swf/sift_heads_world.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Sim Web 2.0 Company",
		description: "",
		tags: "",
		route: "sim-web-2-0-company",
		source: "/swf/simweb2.0company.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Skull Kid",
		description: "",
		tags: "",
		route: "skull-kid",
		source: "/swf/skull_kid.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Sky Wire",
		description: "",
		tags: "",
		route: "sky-wire",
		source: "/swf/skywire.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Spank the Monkey",
		description: "",
		tags: "",
		route: "spank-the-monkey",
		source: "/swf/spankthemonkey.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Spider Man",
		description: "",
		tags: "",
		route: "spider-man",
		source: "/swf/spider-man.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Sprinter",
		description: "",
		tags: "",
		route: "sprinter",
		source: "/swf/sprinter",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Stick RPG",
		description: "",
		tags: "",
		route: "stick-rpg",
		source: "/swf/stickrpg.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Submachine 1",
		description: "",
		tags: "",
		route: "submachine-1",
		source: "/swf/submachine_1.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Submachine 2",
		description: "",
		tags: "",
		route: "submachine-2",
		source: "/swf/submachine_2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Submachine 3",
		description: "",
		tags: "",
		route: "submachine-3",
		source: "/swf/submachine_3.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Super Smash Flash",
		description: "",
		tags: "",
		route: "super-smash-flash",
		source: "/swf/super_smash_flash.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Super Mario 63",
		description: "",
		tags: "",
		route: "super-mario-63",
		source: "/swf/supermario63.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Treasure Seas ",
		description: "",
		tags: "",
		route: "treasure-seas",
		source: "/swf/treasureseas.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Tron",
		description: "",
		tags: "",
		route: "tron",
		source: "/swf/tron.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Tsunami Fighter",
		description: "",
		tags: "",
		route: "tsunami-fighter",
		source: "/swf/tsunamifighter.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Use Boxmen",
		description: "",
		tags: "",
		route: "use-boxmen",
		source: "/swf/use-boxmen.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Warfare 1944",
		description: "",
		tags: "",
		route: "warfare-1944",
		source: "/swf/",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Kitten Cannon",
		description: "",
		tags: "",
		route: "kitten-cannon",
		source: "/swf/yetiGamesKitten Cannon.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Moto X3M",
		description: "",
		tags: "",
		route: "moto-x3m",
		source: "/src/moto-x3m/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Moto X3M Winter",
		description: "",
		tags: "",
		route: "moto-x3m-winter",
		source: "/src/moto-x3m-winter/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Moto X3M Spooky Land",
		description: "",
		tags: "",
		route: "moto-x3m-spooky-land",
		source: "/src/moto-x3m-spooky-land/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Moto X3M Pool Party",
		description: "",
		tags: "",
		route: "moto-x3m-pool-party",
		source: "/src/moto-x3m-pool-party/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Friday Night Funkin: Week 6",
		description: "",
		tags: "",
		route: "friday-night-funkin-week-6",
		source: "/src/friday-night-funkin--week-6/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Friday Night Funkin: Vs Ex",
		description: "",
		tags: "",
		route: "friday-night-funkin-vs-ex",
		source: "/src/friday-night-funkin--vs-ex/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Hill Racing",
		description: "",
		tags: "",
		route: "hill-racing",
		source: "/src/hill-racing/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Running Bot Xmas Gifts",
		description: "",
		tags: "",
		route: "running-bot-xmas-gifts",
		source: "/src/running-bot-xmas-gifts/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Russian Taz Magmes",
		description: "",
		tags: "",
		route: "russian-taz-magmes",
		source: "/src/russian-taz-magmes/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Slope 2",
		description: "",
		tags: "",
		route: "slope-2",
		source: "/src/slope-2/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Game Inside a Game",
		description: "",
		tags: "",
		route: "game-inside-a-game",
		source: "/src/game-inside-a-game/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Zombotron",
		description: "",
		tags: "",
		route: "zombotron",
		source: "/src/zombotron/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Zombotron 2",
		description: "",
		tags: "",
		route: "zombotron-2",
		source: "/src/zombotron-2/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Zombotron 2 Time Machine",
		description: "",
		tags: "",
		route: "zombotron-2-time-machine",
		source: "/src/zombotron-2-time-machine/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Donut Boy",
		description: "",
		tags: "",
		route: "donut-boy",
		source: "/src/donut-boy/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Henry Stick Fleeing The Complex",
		description: "",
		tags: "",
		route: "henry-stick-fleeing-the-complex",
		source: "/swf/HenryStick_FleeingTheComplex.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "A Dance of Fire and Ice",
		description: "A Dance of Fire and Ice is a strict rhythm game. Keep your focus as you guide two orbiting planets along a winding path without breaking their perfect equilibrium. Press on every beat of the music to move in a line. Every pattern has its own rhythm to it. It can get difficult. This game is purely based on rhythm, so use your ears more than your sight.",
		tags: "",
		route: "a-dance-of-fire-and-ice",
		source: "/src/a-dance-of-fire-and-ice/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Superhot",
		description: "No regenerating health bars. No conveniently placed ammo drops. It's just you, outnumbered and outgunned, grabbing weapons off fallen enemies to shoot, slice, and maneuver through a hurricane of slow-motion bullets.",
		tags: "",
		route: "superhot",
		source: "/src/superhot/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Wordle",
		description: "Wordle is a web-based word game developed by Welsh-born software engineer Josh Wardle. Players have six attempts to guess a five-letter word; feedback is given for each guess, in the form of colored tiles, indicating when letters match or occupy the correct position. This tweak has no limit to how many games you can play!",
		tags: "",
		route: "wordle",
		source: "/src/wordle/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Getaway Shootout",
		description: "Race on top of a moving train in Getaway Shootout and be the first to grab 3 getaways. Compete against computer AI or with a friend in 2 player mode to prove who is the best. There are many weapons and power-ups you can collect throughout the map use it wisely to to gain an upper hand over your opponents.",
		tags: "",
		route: "getaway-shootout",
		source: "/src/getaway-shootout/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Google Solitaire",
		description: "Patience, card solitaire or just solitaire, is a genre of card games that can be played by a single player. Patience games can also be played in a head-to-head fashion with the winner selected by a scoring scheme.",
		tags: "",
		route: "google-solitaire",
		source: "/src/google-solitaire/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Rooftop Snipers",
		description: "Rooftop Snipers is a chaotic two button local multiplayer game. Challenge your friends side by side or play the computer. Shoot your opponent off the map to win.",
		tags: "",
		route: "rooftop-snipers",
		source: "/src/rooftop-snipers/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Tube Jumpers",
		description: "Tube Jumpers is local multiplayer game with your friends packed with action. The last one to stay on the tubes wins. Watch out for miscellaneous objects while watching your back from other players.",
		tags: "",
		route: "tube-jumpers",
		source: "/src/tube-jumpers/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Super Mario Bros",
		description: "Mario Bros. is a 1983 platform game developed and published for arcades by Nintendo. It was designed by Shigeru Miyamoto and Gunpei Yokoi, Nintendo's chief engineer. Italian plumber Mario and his twin brother Luigi exterminate creatures emerging from the sewers by knocking them upside-down and kicking them away.",
		tags: "",
		route: "super-mario-bros",
		source: "/emulator/nes/smb.nes",
		gameType: "nes",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "A Dark Room",
		description: "A Dark Room is a minimalist text-based adventure RPG game right in your browser! How far will you go, player?",
		tags: "",
		route: "a-dark-room",
		source: "/src/a-dark-room/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Align 4",
		description: "Align 4 is a two-player connection board game just like Connect 4, in which the players choose a color and then take turns dropping colored discs into a seven-column, six-row vertically suspended grid. The pieces fall straight down, occupying the lowest available space within the column. The objective of the game is to be the first to form a horizontal, vertical, or diagonal line of four of one's own discs. The first player can always win by playing the right moves.",
		tags: "",
		route: "align-4",
		source: "/src/align-4/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Colorun",
		description: "COLORON is a fun and well-designed platformer. The goal is to match the color of the tower to the bouncing ball. Keep it going for as long as you can, just don't get mad.",
		tags: "",
		route: "colorun",
		source: "/src/colorun/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Drift Hunters",
		description: "Drift Hunters is an awesome 3D car driving game in which you score points by drifting various cars. These points earn you money, that you can spend to upgrade your current car or buy a new one. The game stands out because of its realistic drifting physics and its various driving environments.",
		tags: "",
		route: "drift-hunters",
		source: "/src/drift-hunters/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Economical",
		description: "2D puzzle action game where saving coins is important! Aiming for a goal using items. Make a way with blocks. Break a block with a hammer. But you need coins.",
		tags: "",
		route: "economical",
		source: "/src/economical/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Economical 2",
		description: "Version 2 of the 2D puzzle action game where saving coins is important! Aiming for a goal using items. Make a way with blocks. Break a block with a hammer. But you need coins.",
		tags: "",
		route: "economical-2",
		source: "/src/economical2/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Geometry Dash Remastered",
		description: "Welcome all to Geometry Dash Remastered, and, well, you already know the game. But this is more, this is 5 new levels you can't find anywhere else, this is ... REMASTERED (I'm totally serious).",
		tags: "",
		route: "geometry-dash-remastered",
		source: "/src/geometry-dash-remastered/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Google Snake",
		description: "How long can you last before your tail becomes your dinner? Take the challenge and eat all those apples! Be careful not to hit the wall!",
		tags: "",
		route: "google-snake",
		source: "/src/google-snake",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Hacker Typer",
		description: "",
		tags: "Created in 2011, Hacker Typer arose from a simple desire to look like the stereotypical hacker in movies and pop culture. Since that time, it has brought smiles to millions of people across the globe. Plus, many of you have temporarily transformed into hackers yourselves, all from a few clicks on the keyboard (and some programming magic behind the scenes!).",
		route: "hacker-typer",
		source: "/src/hacker-typer/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Madalin Stunt Cars 2",
		description: "Welcome to the expansive open world of Madalin Stunt Cars 2. Pick your car and drift, drag and race your way through three massive fully explorable maps. Jump behind the wheel of the hottest supercars on the planet, race through cities and execute trick stunts with the sensational Madalin Stunt Cars 2. Pick a Huracan, LaFerrari, Pagani or Veneno and tear up the streets. Compete in multiplayer arenas with other MSC2 gamers.",
		tags: "",
		route: "madalin-stunt-cars-2",
		source: "/src/madalin-stunt-cars-2/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Tactical Assassin 3",
		description: "Tactical Assassin 3 is a sniper game that lets you play as a war sniper, which means you have a hand in the win or loss of your fight. You're given all the tools you'll need to take out the most valuable targets in the field, so make sure to take a deep breath before pulling that trigger.",
		tags: "",
		route: "tactical-assassin-3",
		source: "/swf/tactical-assassin-3.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Ultimate Flash Sonic",
		description: "Ultimate Flash Sonic is a sonic fangame made in Adobe Flash. It was created by Dennis-Gid and it was uploaded to Newgrounds on Febuary 21, 2004.",
		tags: "",
		route: "ultimate-flash-sonic",
		source: "/swf/ultimate-flash-sonic.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Sniper Assassin 4",
		description: "This is a job that requires finesse and nerves of steel. Lives are at stake here, people! Just don't kill the innocent",
		tags: "",
		route: "sniper-assassin-4",
		source: "/swf/sniper-assassin-4.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Tunnel Rush",
		description: "Tunnel Rush Unblocked is the ultimate 3D single-player experience. Blaze your way through caves and tunnels. Each Tunnel Rush level drops you into a whirling kaleidoscope of hazards and 3D tunnels. Play Tunnel Rush to dodge barriers using just your wits and your keyboard. In the game, the ball will keep rolling forward, there will be unknown obstacles in front of us, we need to control the ball to get the tunnel! Just dodge the obstacles by dodging the diamonds in the middle. Now let's take the challenge together! Wanna test your reaction speed? Play Tunnel Rush online now and push your skills to the limit. There's only one way to show those barriers who's boss, so play Tunnel Rush on Poki to show off those ultra-sharp reactions.",
		tags: "",
		route: "tunnel-rush",
		source: "/src/tunnelrush/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Basket Random",
		description: "The random series continues with Basket Random! Basketball is here with its most funny and random way. In Basket Random game, try to score a basket by using only one key with different variations from each other! Changing fields, changing players and changing balls do not surprise you! You can be the best of them all. You can play Basket Random game either against CPU or against a friend in 2 player gaming mode! The one who reaches 5 score first, wins the game. Have Fun!",
		tags: "",
		route: "basket-random",
		source: "/src/basket-random/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Mario Kart 64",
		description: "Mario Kart 64 is a 1996 kart racing video game developed and published by Nintendo for the Nintendo 64. The game is the second entry in the Mario Kart series and is the successor to Super Mario Kart for the Super Nintendo Entertainment System.",
		tags: "",
		route: "mario-cart-64",
		source: "/emulator/n64/mariokart64.z64",
		gameType: "n64",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Pokemon Blue",
		description: "Pokémon Red and Pokémon Blue introduce legions of gamers to the world of Kanto, where the likes of Charmander, Pikachu, and Mewtwo were first discovered. Through exciting exploration, battles, and trades, Trainers are able to access 150 Pokémon. You begin your journey in Pallet Town as a young boy.",
		tags: "",
		route: "pokemon-blue",
		source: "/emulator/gb/pokemon-blue.gb",
		gameType: "gb",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Pokemon Crystal",
		description: "Originally released for the Game Boy™ Color system in 2000, the Pokémon™ Crystal game added several new features to the Pokémon franchise. For the first time, players could choose a female or male character, Pokémon battles featured animation, and more. And now, this Virtual Console release invites you to explore the Johto region again—or for the first time.",
		tags: "",
		route: "pokemon-crystal",
		source: "/emulator/gb/pokemon-crystal.gbc",
		gameType: "gb",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Pokemon Gold",
		description: "Enter a whole new world, with new Pokémon to capture, train and battle! Meet Professor Elm and get the all-new Poké Gear, including map, radio, cell phone and clock. Set the clock then watch as day turns to night and events take place in real time— and be sure to keep an eye out for Pokémon that come out only at night!",
		tags: "",
		route: "pokemon-gold",
		source: "/emulator/gb/pokemon-gold.gbc",
		gameType: "gb",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Pokemon Red",
		description: "Pokémon Red and Pokémon Blue introduce legions of gamers to the world of Kanto, where the likes of Charmander, Pikachu, and Mewtwo were first discovered. Through exciting exploration, battles, and trades, Trainers are able to access 150 Pokémon. You begin your journey in Pallet Town as a young boy.",
		tags: "",
		route: "pokemon-red",
		source: "/emulator/gb/pokemon-red.gb",
		gameType: "gb",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Pokemon Silver",
		description: "Enter a whole new world, with new Pokémon to capture, train and battle! Meet Professor Elm and get the all-new Poké Gear, including map, radio, cell phone and clock. Set the clock then watch as day turns to night and events take place in real time— and be sure to keep an eye out for Pokémon that come out only at night!",
		tags: "",
		route: "pokemon-silver",
		source: "/emulator/gb/pokemon-silver.gbc",
		gameType: "gb",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Pokemon Emerald",
		description: "Pokémon Emerald Version takes Trainers back to the land of Hoenn for an expanded adventure, this time against both Team Magma and Team Aqua! Pokémon Emerald also features an even more exciting storyline featuring the Legendary Rayquaza.",
		tags: "",
		route: "pokemon-emerald",
		source: "/emulator/gba/pokemon-emerald.gba",
		gameType: "gba",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Pokemon Fire Red",
		description: "Pokémon FireRed Version and Pokémon LeafGreen Version are 2004 remakes of the 1996 Game Boy role-playing video games Pokémon Red and Blue.",
		tags: "",
		route: "pokemon-fire-red",
		source: "/emulator/gba/pokemon-firered.gba",
		gameType: "gba",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Pokemon Leaf Green",
		description: "Pokémon FireRed Version and Pokémon LeafGreen Version are 2004 remakes of the 1996 Game Boy role-playing video games Pokémon Red and Blue.",
		tags: "",
		route: "pokemon-leaf-green",
		source: "/emulator/gba/pokemon-leafgreen.gba",
		gameType: "gba",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Pokemon Ruby",
		description: "Immerse yourself in the beautiful region of Hoenn, a place of masterful heroes and mysterious teams, of friendship and battles. As the new kid in town, you set off your journey as a Pokémon Trainer. Who knows what wonders and dangers await you? Now it's time to grab your gear and head out on your own...",
		tags: "",
		route: "pokemon-ruby",
		source: "/emulator/gba/pokemon-ruby.gba",
		gameType: "gba",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Pokemon Sapphire",
		description: "Immerse yourself in the beautiful region of Hoenn, a place of masterful heroes and mysterious teams, of friendship and battles. As the new kid in town, you set off your journey as a Pokémon Trainer. Who knows what wonders and dangers await you? Now it's time to grab your gear and head out on your own...",
		tags: "",
		route: "pokemon-sapphire",
		source: "/emulator/gba/pokemon-sapphire.gba",
		gameType: "gba",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Basketball Stars",
		description: "Basketball Stars is a 2-player basketball game created by Madpuffers. You can play solo or with a friend as a variety of legendary basketball players. Shoot basketball with the likes of LeBron James, James Harden, and Stephen Curry in Basketball Stars!",
		tags: "",
		route: "basketball-stars",
		source: "/src/basketball-stars/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Minesweeper",
		description: "Minesweeper is a single-player puzzle video game. The objective of the game is to clear a rectangular board containing hidden 'mines' or bombs without detonating any of them, with help from clues about the number of neighboring mines in each field.",
		tags: "",
		route: "minesweeper",
		source: "/src/minesweeper/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Sans Fight",
		description: "Undertale Sans Fight Clone; 'do you wanna have a bad time? 'cause if you visit this page... you are REALLY not going to like what happens next.'",
		tags: "",
		route: "sans-fight",
		source: "/src/sans-fight/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "There is no Game",
		description: "There is no game. There is nothing to do. Do not click or tap anywhere. Really. DO NOT CLICK OR TAP ANYWHERE. Do not laugh as there is nothing to laugh about.",
		tags: "",
		route: "there-is-no-game",
		source: "/src/there-is-no-game/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Unfair Dyne",
		description: "Break the word in half and add 'UN' to each part. Undyne fight, but harder.",
		tags: "",
		route: "unfair-dyne",
		source: "/src/unfair-dyne/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Volley Gosh",
		description: "Volley Gosh is a bright and happy ball game where you must try keep your 'volley gosh ball' in the air for as long as possible. Watch out for the increasing challenge and surprises that abound on the joyful beach while you get your next high score!",
		tags: "",
		route: "volley-gosh",
		source: "/src/volleygosh/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "NBA Jam",
		description: "NBA Jam is a classic arcade basketball game developed and published back in 1993 and is the first entry to the NBA Jam series. The game features 2 on 2 basketball match off and is one of the first sports games to feature real and digitized NBA-licensed teams and players!",
		tags: "",
		route: "nb-jam",
		source: "/emulator/snes/nbajam.sfc",
		gameType: "snes",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "NBA Jam Tournament Edition",
		description: "NBA Jam Tournament Edition is the second game in the basketball arcade series created by Midway. The game features two-on-two fast paced matches with real life NBA players from the 1993-1994 seasons. The game has over 120 NBA athletes plus more than 40 hidden characters to unlock.",
		tags: "",
		route: "nba-jam-tournament-edition",
		source: "/emulator/snes/nbajamtournamentedition.smc",
		gameType: "snes",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "NBA Jam 2K20",
		description: "NBA Jam 2K20: Tournament Edition is a ROM hack of the game NBA Jam: Tournament Edition for the Super Nintendo Entertainment System (SNES). This hack did not change the core aspects, as well as most game mechanics, of the game, and instead worked on updating its player and team roster to match the 2019-2020 NBA season.",
		tags: "",
		route: "nba-jam-2k20",
		source: "/emulator/snes/nbajam2k20.smc",
		gameType: "snes",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Donkey Kong Country",
		description: "Donkey Kong Country is a side-scrolling platform game in which the player must complete 40 levels to recover the Kongs' banana hoard, which has been stolen by the crocodilian Kremlings.",
		tags: "",
		route: "donkey-kong-country",
		source: "/emulator/snes/dkc.sfc",
		gameType: "snes",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Super Mario Allstars + Super Mario World",
		description: "Super Mario All-Stars + Super Mario World is a compilation title for the Super Nintendo Entertainment System. It includes all the games from Super Mario All-Stars, as well as Super Mario World. It was released in December 1994 in North America, 1995 in Europe, and was never released in Japan.",
		tags: "",
		route: "super-mario-allstars--super-mario-world",
		source: "/emulator/snes/smasmw.smc",
		gameType: "snes",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Street Fighter 2",
		description: "Street Fighter II: The World Warrior is a competitive fighting game originally released for the arcades in 1991. It is the second entry in the Street Fighter series and the arcade sequel to the original Street Fighter released in 1987. It was Capcom's fourteenth title that ran on the CP System arcade hardware. Street Fighter II improved upon the many concepts introduced in the first game, including the use of command-based special moves and a six-button configuration, while offering players a selection of multiple playable characters, each with their own unique fighting style.",
		tags: "",
		route: "street-fighter-2",
		source: "/emulator/snes/sf2.sfc",
		gameType: "snes",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Sonic 1",
		description: "Sonic the Hedgehog is a Japanese video game series and media franchise created and owned by Sega. The franchise follows Sonic, an anthropomorphic blue hedgehog who battles the evil Doctor Eggman, a mad scientist.",
		tags: "",
		route: "sonic-1",
		source: "/emulator/segaMD/sonic1.smd",
		gameType: "segaMD",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Sonic 2",
		description: "Sonic the Hedgehog 2 is a 1992 platform game developed and published by Sega for the Sega Genesis. It follows Sonic as he attempts to stop Doctor Robotnik from stealing the Chaos Emeralds to power his space station, the Death Egg.",
		tags: "",
		route: "sonic-2",
		source: "/emulator/segaMD/sonic2.smd",
		gameType: "segaMD",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Sonic 3 & Knuckles",
		description: "Dr. Eggman's (AKA Dr. Robotnik's) Death Egg was once again blasted by Sonic, crash-landing on the peak of a volcano on the Floating Island. Dr. Eggman is still at large, and Sonic can't allow him to get his hands on the Master Emerald and repair the Death Egg.",
		tags: "",
		route: "sonic-3--knuckles",
		source: "/emulator/segaMD/sonic3knuckles.smd",
		gameType: "segaMD",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Meat Boy",
		description: "This is NOT Super Meat Boy! Its simply the flash prototype that Super Meat Boy was based off of. SMB, will play very differently and is 100% new.. what im saying is if you even slightly enjoy the prototype, you will LOVE SMB! For more info on Super Meat Boy check out supermeatboy.com",
		tags: "",
		route: "meat-boy",
		source: "/swf/meat-boy.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Shift",
		description: "Is the floor the roof? Is the roof the floor? And whats with that in game timer? Find the answers to all the above questions and more in this original puzzle platformer!",
		tags: "",
		route: "shift",
		source: "/swf/shift.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Shift 2",
		description: "The sequel to The Shift! Is the floor the roof? Is the roof the floor? And whats with that in game timer? Find the answers to all the above questions and more in this original puzzle platformer, part 2!",
		tags: "",
		route: "shift-2",
		source: "/swf/shift-2.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Unfair Mario",
		description: "It is Super Mario, again. Our beloved little fellow is inviting you to travel alongside him throughout the Unfair Mario game. You will find yourself in the classic arcade game, but this time, with a little twist. Some traps will be trickier, and some obstacles harder to overcome. But you will survive it, will you not?",
		tags: "",
		route: "unfair-mario",
		source: "/swf/unfairmario.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Soccer Random",
		description: "Soccer Random is one of the most fun sports games. The game's objective is to score a goal using only one key with different variations!",
		tags: "",
		route: "soccer-random",
		source: "/src/soccer-random/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Volley Random",
		description: "The fun random game series continues with Volley Random. There is a Volleyball experience unlike any before. With fun ragdoll physics and a variety of variations, each match will be different. The playing court, ball and players may change. The important thing is to be able to get score under all conditions. ",
		tags: "",
		route: "volley-random",
		source: "/src/volley-random/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Boxing Random",
		description: "The new version of the random game series that you love to play continues with Boxing Random. Again, changing conditions occur in every round. Sometimes the boxing field changes and sometimes the boxers. Adapt to every random feature and hit accurately. When you get the rocket punch, balance and send it to the opponent's head. This way you can knock out the opponent without getting close! The one who reaches 5 score first, wins the game!",
		tags: "",
		route: "boxing-random",
		source: "/src/boxing-random/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Madness Accelerant",
		description: "Madness Accelerant is a fast-paced action game to beat the enemies and escape the beast monster. This game is a playable remake of Krinkel's Madness Consternation.",
		tags: "",
		route: "madness-accelerant",
		source: "/swf/madness-accelerant.swf",
		gameType: "flash",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Mind Games for 2 Player",
		description: "We collected some brain and board games that you can play as two player in a single game. We are presenting you eight brain / table game which are played by everyone fondly. You can play Chess, Tic Tac Toe, Checkers, Ludo, Connect 4, Snake and Ladders, Mancala and Math games in game box for free! If you cannot decide on which game you want to play, you can give a chance to spin the “Spin” to let it pick a game for you.",
		tags: "",
		route: "mind-games-for-2-player",
		source: "/src/mind-games-for-2-player/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Uno",
		description: "The classic popular game UNO can be played online in the browser. You can play the game locally or online multiplayer. You can enter the lobbies in the online section. Face up to 3 CPU-controlled opponents. Match cards by color or number, play action cards to mix the game up and be the first to get rid of all cards. Also, do not forget to press the 1 button when you have only one card left!",
		tags: "",
		route: "uno",
		source: "/src/uno/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Flakboy",
		description: "Wanna try out some awesome new weapons? Of course you do. Get blastin'!",
		tags: "",
		route: "flakboy",
		source: "/src/flakboy/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Krunker.io",
		description: "Krunker.io is a free Multiplayer Online Game. No Download needed",
		tags: "",
		route: "krunker-io",
		source: "https://krunker.io/",
		gameType: "proxy",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Shell Shockers",
		description: "Alt URL: geometry.best. Shell Shockers, the world's most advanced egg-based multiplayer shooter! It's like your favorite battlefield game but... with eggs.",
		tags: "",
		route: "shell-shockers",
		source: "https://shellshock.io/",
		gameType: "proxy",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "1v1.lol",
		description: "Discover 1v1, the online building simulator & third person shooting game. Battle royale, build fight, box fight, zone wars and more game modes to enjoy!",
		tags: "",
		route: "1v1-lol",
		source: "https://1v1.lol/",
		gameType: "proxy",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Dogeminer",
		description: "Dogeminer is an adventure, a journey, a mission, a rivalry and so much more. The best thing? It's playable right here for free! Hit START now to begin your adventure!",
		tags: "",
		route: "dogeminer",
		source: "https://dogeminer2.com/",
		gameType: "proxy",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Territorial.io",
		description: "Territorial.io - The Art of Conquest",
		tags: "",
		route: "territorial-io",
		source: "https://territorial.io/",
		gameType: "proxy",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "MooMoo.io",
		description: "MooMoo.io is a brand new Survival IO Game. Build and Survive with your friends",
		tags: "",
		route: "moomoo-io",
		source: "https://moomoo.io/",
		gameType: "proxy",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Voxiom.io",
		description: "Play the best browser multiplayer voxel first person shooter inspired by minecraft, fortnite, counter-strike, and call of duty!",
		tags: "",
		route: "voxiom-io",
		source: "https://voxiom.io/",
		gameType: "proxy",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Deeeep.io",
		description: "Deeeep.io is a multiplayer online browser game that takes place in the depths of the ocean. Eat food and other players, hide in underwater terrain and evolve your animals to earn points and reach the top of the food chain.",
		tags: "",
		route: "deeeep-io",
		source: "https://deeeep.io/",
		gameType: "proxy",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Agma.io",
		description: "Play Agma - An MMO game combining strategy to survive and eat other players in order to become the largest and strongest player, with a ton of new features such as powerups and shop. Chat and play against friends, find your team and destroy lobbies with your clan. Freeze and teleport other players to make them weak. Fight, and survive as many battles as you can in order to sustain your rank. Gain exp and level up. Mobile friendly",
		tags: "",
		route: "agma-io",
		source: "https://agma.io/",
		gameType: "proxy",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Warbrokers.io",
		description: "War Brokers is a browser-based first-person shooter with a wide variety of game modes, weaponry, maps, and skins. War Brokers is available to play for free online at Warbrokers.io and can also be purchased on Steam too. Currently, the game has four game modes: Battle Royale, Classic (8v8), 4v4 (Speed), and Survival.",
		tags: "",
		route: "warbrokers-io",
		source: "https://warbrokers.io/",
		gameType: "proxy",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Gun Knight",
		description: "A roguelike heavily inspired by Gungeon and Binding of Isaac, you play a Knight whose quest is to venture into a nearby dungeon.",
		tags: "",
		route: "gun-knight",
		source: "/src/gun-knight/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	},
	{
		title: "Ludo Online",
		description: "Ludo King is an Indian free-to-play mobile game application developed by Indian studio Gametion Technologies Pvt Ltd, based in Mumbai, India. Gametion is owned by Vikash Jaiswal. It is developed on the Unity game engine and is available on Android, iOS, Kindle, Windows Phone and Microsoft Windows platforms.",
		tags: "",
		route: "ludo-online",
		source: "/src/ludo-online/index.html",
		gameType: "html",
		width: "1000px",
		height: "625px",
		listed: true
	}
];

const data$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: games
}, Symbol.toStringTag, { value: 'Module' }));

const allGames = JSON.parse(JSON.stringify(data$1)).default;
const listedGames = allGames.filter((game) => game.listed);
const unlistedGames = allGames.filter((game) => !game.listed);
allGames.length;
listedGames.length;
unlistedGames.length;

const changes = {
	"2.2.0": {
	date: "Oct 1, 2022",
	description: "",
	additions: [
	],
	fixes: [
		"Fix proxied games and apps not loading if Bare server is blocked"
	],
	updates: [
		"Major server infastructure updates"
	],
	deductions: [
	]
},
	"2.1.0": {
	date: "August 27, 2022",
	description: "",
	additions: [
		"Favorite button",
		"Favorite section on the home page",
		"Featured games section on the home page",
		"Game Search"
	],
	fixes: [
		"Fix issue on some proxies."
	],
	updates: [
	],
	deductions: [
	]
},
	"2.0.3": {
	date: "July 21, 2022",
	description: "",
	additions: [
		"Added versioning for 2.0.1, 2.0.2, and 2.0.3"
	],
	fixes: [
	],
	updates: [
	],
	deductions: [
	]
},
	"2.0.2": {
	date: "July 21, 2022",
	description: "",
	additions: [
	],
	fixes: [
		"Fix banner on README.md"
	],
	updates: [
	],
	deductions: [
	]
},
	"2.0.1": {
	date: "July 21, 2022",
	description: "",
	additions: [
	],
	fixes: [
		"Fix issue with 404 page causing some games to not load."
	],
	updates: [
	],
	deductions: [
	]
},
	"2.0.0": {
	date: "June 20, 2022",
	description: "As of version 2.0.0 the site is made using SolidJS and TailwindCSS.",
	additions: [
		"Version Tracking",
		"Services Page",
		"Service - Radon DNS",
		"Service - Link Bot Bot",
		"Bare Server"
	],
	fixes: [
		"App 'Failed to Fetch' Error"
	],
	updates: [
		"User Interface",
		"Route Changes"
	],
	deductions: [
	]
},
	"1.6.1": {
	date: "May 22, 2022",
	description: "",
	additions: [
		"Support Page",
		"Partner - Delta Network",
		"Partner - Math Study"
	],
	fixes: [
	],
	updates: [
	],
	deductions: [
	]
},
	"1.6.0": {
	date: "May 11, 2022",
	description: "Version 1.6 comes with new settings for tab cloaking and better reliability. New config options were also added for email game requests/bug reports.",
	additions: [
		"About Blank URL Cloaking",
		"Data URL Cloaking",
		"Blob URL Cloaking",
		"Tab Cloaking Options",
		"Mailjet Server"
	],
	fixes: [
	],
	updates: [
	],
	deductions: [
	]
},
	"1.5.2": {
	date: "May 7, 2022",
	description: "",
	additions: [
		"Game Descriptions"
	],
	fixes: [
	],
	updates: [
	],
	deductions: [
	]
},
	"1.5.1": {
	date: "May 2, 2022",
	description: "",
	additions: [
		"Multi Domain SSH"
	],
	fixes: [
	],
	updates: [
		"README.md"
	],
	deductions: [
	]
},
	"1.5.0": {
	date: "April 17, 2022",
	description: "",
	additions: [
		"Ultraviolet Proxy",
		"Fullscreen Button",
		"Apps Page",
		"Game - Krunker.io",
		"Game - Agma.io",
		"Game - Shell Shockers",
		"Game - Roblox",
		"Game - 1v1.lol",
		"Game - DogeMiner",
		"Game - Territorial.io",
		"Game - MooMoo.io",
		"Game - Voxiom.io",
		"App - Google",
		"App - Geforce Now",
		"App - Discord",
		"App - Youtube"
	],
	fixes: [
	],
	updates: [
		"Games Page",
		"Footer",
		"Ruffle",
		"Emulator.js"
	],
	deductions: [
	]
}
};

const data = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: changes
}, Symbol.toStringTag, { value: 'Module' }));

JSON.parse(JSON.stringify(data)).default;

const api = [
  {
    get: "skip",
    path: "/apps"
  },
  {
    get: "skip",
    path: "/games"
  },
  {
    get: "skip",
    path: "/"
  },
  {
    get: "skip",
    path: "/partners"
  },
  {
    get: "skip",
    path: "/privacy"
  },
  {
    get: "skip",
    path: "/search"
  },
  {
    get: "skip",
    path: "/services"
  },
  {
    get: "skip",
    path: "/settings"
  },
  {
    get: "skip",
    path: "/supporters"
  },
  {
    get: "skip",
    path: "/*404"
  },
  {
    get: "skip",
    path: "/changelog/"
  },
  {
    get: "skip",
    path: "/changelog/:any"
  },
  {
    get: "skip",
    path: "/game/:any"
  }
];
function routeToMatchRoute(route) {
  const segments = route.path.split("/").filter(Boolean);
  const params = [];
  const matchSegments = [];
  let score = route.path.endsWith("/") ? 4 : 0;
  let wildcard = false;
  for (const [index, segment] of segments.entries()) {
    if (segment[0] === ":") {
      const name = segment.slice(1);
      score += 3;
      params.push({
        type: ":",
        name,
        index
      });
      matchSegments.push(null);
    } else if (segment[0] === "*") {
      params.push({
        type: "*",
        name: segment.slice(1),
        index
      });
      wildcard = true;
    } else {
      score += 4;
      matchSegments.push(segment);
    }
  }
  return {
    ...route,
    score,
    params,
    matchSegments,
    wildcard
  };
}
const allRoutes = api.map(routeToMatchRoute).sort((a, b) => b.score - a.score);
registerApiRoutes(allRoutes);
function getApiHandler(url, method) {
  return getRouteMatches(allRoutes, url.pathname, method.toLowerCase());
}

const apiRoutes = ({ forward }) => {
  return async (event) => {
    let apiHandler = getApiHandler(new URL(event.request.url), event.request.method);
    if (apiHandler) {
      let apiEvent = Object.freeze({
        request: event.request,
        params: apiHandler.params,
        env: event.env,
        $type: FETCH_EVENT,
        fetch: internalFetch
      });
      try {
        return await apiHandler.handler(apiEvent);
      } catch (error) {
        if (error instanceof Response) {
          return error;
        }
        return new Response(JSON.stringify(error), {
          status: 500
        });
      }
    }
    return await forward(event);
  };
};

const server$ = (fn) => {
  throw new Error("Should be compiled away");
};
async function parseRequest(event) {
  let request = event.request;
  let contentType = request.headers.get(ContentTypeHeader);
  let name = new URL(request.url).pathname, args = [];
  if (contentType) {
    if (contentType === JSONResponseType) {
      let text = await request.text();
      try {
        args = JSON.parse(text, (key, value) => {
          if (!value) {
            return value;
          }
          if (value.$type === "fetch_event") {
            return event;
          }
          if (value.$type === "headers") {
            let headers = new Headers();
            request.headers.forEach((value2, key2) => headers.set(key2, value2));
            value.values.forEach(([key2, value2]) => headers.set(key2, value2));
            return headers;
          }
          if (value.$type === "request") {
            return new Request(value.url, {
              method: value.method,
              headers: value.headers
            });
          }
          return value;
        });
      } catch (e) {
        throw new Error(`Error parsing request body: ${text}`);
      }
    } else if (contentType.includes("form")) {
      let formData = await request.clone().formData();
      args = [formData, event];
    }
  }
  return [name, args];
}
function respondWith(request, data, responseType) {
  if (data instanceof ResponseError) {
    data = data.clone();
  }
  if (data instanceof Response) {
    if (isRedirectResponse(data) && request.headers.get(XSolidStartOrigin) === "client") {
      let headers = new Headers(data.headers);
      headers.set(XSolidStartOrigin, "server");
      headers.set(XSolidStartLocationHeader, data.headers.get(LocationHeader));
      headers.set(XSolidStartResponseTypeHeader, responseType);
      headers.set(XSolidStartContentTypeHeader, "response");
      return new Response(null, {
        status: 204,
        statusText: "Redirected",
        headers
      });
    } else if (data.status === 101) {
      return data;
    } else {
      let headers = new Headers(data.headers);
      headers.set(XSolidStartOrigin, "server");
      headers.set(XSolidStartResponseTypeHeader, responseType);
      headers.set(XSolidStartContentTypeHeader, "response");
      return new Response(data.body, {
        status: data.status,
        statusText: data.statusText,
        headers
      });
    }
  } else if (data instanceof FormError) {
    return new Response(
      JSON.stringify({
        error: {
          message: data.message,
          stack: "",
          formError: data.formError,
          fields: data.fields,
          fieldErrors: data.fieldErrors
        }
      }),
      {
        status: 400,
        headers: {
          [XSolidStartResponseTypeHeader]: responseType,
          [XSolidStartContentTypeHeader]: "form-error"
        }
      }
    );
  } else if (data instanceof ServerError) {
    return new Response(
      JSON.stringify({
        error: {
          message: data.message,
          stack: ""
        }
      }),
      {
        status: 400,
        headers: {
          [XSolidStartResponseTypeHeader]: responseType,
          [XSolidStartContentTypeHeader]: "server-error"
        }
      }
    );
  } else if (data instanceof Error) {
    console.error(data);
    return new Response(
      JSON.stringify({
        error: {
          message: "Internal Server Error",
          stack: "",
          status: data.status
        }
      }),
      {
        status: data.status || 500,
        headers: {
          [XSolidStartResponseTypeHeader]: responseType,
          [XSolidStartContentTypeHeader]: "error"
        }
      }
    );
  } else if (typeof data === "object" || typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        [ContentTypeHeader]: "application/json",
        [XSolidStartResponseTypeHeader]: responseType,
        [XSolidStartContentTypeHeader]: "json"
      }
    });
  }
  return new Response("null", {
    status: 200,
    headers: {
      [ContentTypeHeader]: "application/json",
      [XSolidStartContentTypeHeader]: "json",
      [XSolidStartResponseTypeHeader]: responseType
    }
  });
}
async function handleServerRequest(event) {
  const url = new URL(event.request.url);
  if (server$.hasHandler(url.pathname)) {
    try {
      let [name, args] = await parseRequest(event);
      let handler = server$.getHandler(name);
      if (!handler) {
        throw {
          status: 404,
          message: "Handler Not Found for " + name
        };
      }
      const data = await handler.call(event, ...Array.isArray(args) ? args : [args]);
      return respondWith(event.request, data, "return");
    } catch (error) {
      return respondWith(event.request, error, "throw");
    }
  }
  return null;
}
const handlers = /* @__PURE__ */ new Map();
server$.createHandler = (_fn, hash) => {
  let fn = function(...args) {
    let ctx;
    if (typeof this === "object") {
      ctx = this;
    } else if (sharedConfig.context && sharedConfig.context.requestContext) {
      ctx = sharedConfig.context.requestContext;
    } else {
      ctx = {
        request: new URL(hash, "http://localhost:3000").href,
        responseHeaders: new Headers()
      };
    }
    const execute = async () => {
      try {
        let e = await _fn.call(ctx, ...args);
        return e;
      } catch (e) {
        if (/[A-Za-z]+ is not defined/.test(e.message)) {
          const error = new Error(
            e.message + "\n You probably are using a variable defined in a closure in your server function."
          );
          error.stack = e.stack;
          throw error;
        }
        throw e;
      }
    };
    return execute();
  };
  fn.url = hash;
  fn.action = function(...args) {
    return fn.call(this, ...args);
  };
  return fn;
};
server$.registerHandler = function(route, handler) {
  handlers.set(route, handler);
};
server$.getHandler = function(route) {
  return handlers.get(route);
};
server$.hasHandler = function(route) {
  return handlers.has(route);
};
server$.fetch = internalFetch;

const inlineServerFunctions = ({ forward }) => {
  return async (event) => {
    const url = new URL(event.request.url);
    if (server$.hasHandler(url.pathname)) {
      let contentType = event.request.headers.get(ContentTypeHeader);
      let origin = event.request.headers.get(XSolidStartOrigin);
      let formRequestBody;
      if (contentType != null && contentType.includes("form") && !(origin != null && origin.includes("client"))) {
        let [read1, read2] = event.request.body.tee();
        formRequestBody = new Request(event.request.url, {
          body: read2,
          headers: event.request.headers,
          method: event.request.method
        });
        event.request = new Request(event.request.url, {
          body: read1,
          headers: event.request.headers,
          method: event.request.method
        });
      }
      let serverFunctionEvent = Object.freeze({
        request: event.request,
        fetch: internalFetch,
        $type: FETCH_EVENT,
        env: event.env
      });
      const serverResponse = await handleServerRequest(serverFunctionEvent);
      let responseContentType = serverResponse.headers.get(XSolidStartContentTypeHeader);
      if (formRequestBody && responseContentType !== null && responseContentType.includes("error")) {
        const formData = await formRequestBody.formData();
        let entries = [...formData.entries()];
        return new Response(null, {
          status: 302,
          headers: {
            Location: new URL(event.request.headers.get("referer")).pathname + "?form=" + encodeURIComponent(
              JSON.stringify({
                url: url.pathname,
                entries,
                ...await serverResponse.json()
              })
            )
          }
        });
      }
      return serverResponse;
    }
    const response = await forward(event);
    return response;
  };
};

const rootData = Object.values(/* #__PURE__ */ Object.assign({}))[0];
rootData ? rootData.default : undefined;
/** Function responsible for listening for streamed [operations]{@link Operation}. */

/** This composes an array of Exchanges into a single ExchangeIO function */
const composeMiddleware = exchanges => ({
  forward
}) => exchanges.reduceRight((forward, exchange) => exchange({
  forward
}), forward);
function createHandler(...exchanges) {
  const exchange = composeMiddleware([apiRoutes, inlineServerFunctions, ...exchanges]);
  return async event => {
    return await exchange({
      forward: async op => {
        return new Response(null, {
          status: 404
        });
      }
    })(event);
  };
}
ssr("<!DOCTYPE html>");

const entryServer = createHandler(renderAsync());

const { PORT = 3000 } = process.env;

const __dirname = dirname(fileURLToPath(import.meta.url));
const paths = {
  assets: join(__dirname, "/public")
};

const server = createServer({
  paths,
  handler: entryServer,
  env: { manifest },
});

server.listen(PORT, err => {
  if (err) {
    console.log("error", err);
  } else {
    console.log(`Listening on port ${PORT}`);
  }
});
