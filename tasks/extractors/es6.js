/*
 * grunt-xgettext
 * https://github.com/ferenc-radius/grunt-xgettext
 *
 * Copyright (c) 2013-2014 Arend van Beelen, Speakap BV
 * Copyright (c) 2015 Ferenc Radius, ServiceBook BV
 * Licensed under the MIT license.
 */

"use strict";

var grunt = require("grunt"),
    babel = require("babel"),
    fs   = require('fs'),
    tempWrite = require('temp-write'),
    javascriptExtractor = require("./javascript");

/**
 * Options set on .es6 will be directly passed on to babel
 * See options: https://babeljs.io/docs/usage/options/
 */
module.exports = function(file, options) {
    var content = babel.transformFileSync(file, options.es6);
    var code = content.code;

    var filePath = tempWrite.sync(code);

    var result = javascriptExtractor(filePath, options);
    fs.unlink(filePath);

    return result;
};