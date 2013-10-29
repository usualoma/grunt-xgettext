/*
 * grunt-gettext
 * https://github.com/arendjr/grunt-gettext
 *
 * Copyright (c) 2013 Arend van Beelen, Speakap BV
 * Licensed under the MIT license.
 */

"use strict";

module.exports = function(grunt) {

    grunt.initConfig({
        xgettext: {
            default_options: {
                options: {
                    functionName: "tr",
                    potFile: "messages.pot"
                },

                files: {
                    handlebars: ["assets/*.handlebars"],
                    javascript: ["assets/*.js"]
                }
            }
        }

    });

    grunt.loadTasks("../tasks");

    grunt.registerTask("default", ["xgettext"]);

};
