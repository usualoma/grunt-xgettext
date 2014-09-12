/*
 * grunt-gettext
 * https://github.com/arendjr/grunt-gettext
 *
 * Copyright (c) 2013 Arend van Beelen, Speakap BV
 * Licensed under the MIT license.
 */

"use strict";

module.exports = function(grunt) {

    var _ = grunt.util._;

    function escapeString(string) {

        return '"' + string.replace(/"/g, '\\"') + '"';
    }

    /**
     * Get all messages of a content
     * @param  {String} content     content on which extract gettext calls
     * @param  {Regex} regex        first level regex
     * @param  {Regex} subRE        second level regex
     * @param  {Regex} quoteRegex   regex for quotes
     * @param  {String} quote       quote: " or '
     * @param  {Object} options     task options
     * @return {Object}             messages in a JS pot alike
     *                                       {
     *                                           singularKey: {
     *                                               singular: singularKey,
     *                                               plural: pluralKey,     // present only if plural
     *                                               message: ""
     *
     *                                           },
     *                                           ...
     *                                       }
     */
    function getMessages(content, regex, subRE, quoteRegex, quote, options) {
        var messages = {}, result;

        while ((result = regex.exec(content)) !== null) {
            var strings = result[1],
                singularKey = void 0;

            while ((result = subRE.exec(strings)) !== null) {
                var string = options.processMessage(result[1].replace(quoteRegex, quote));

                // if singular form already defined add message as plural
                if (typeof singularKey !== 'undefined') {
                    messages[singularKey].plural = string;
                // if not defined init message object
                } else {
                    singularKey = string;
                    messages[singularKey] = {
                        singular: string,
                        message: ""
                    };
                }
            }
        }

        return messages;
    }

    var extractors = {
        handlebars: function(file, options) {
            var contents = grunt.file.read(file).replace("\n", " "),
                fn = _.flatten([ options.functionName ]),
                messages = {};

            var extractStrings = function(quote, fn) {
                var regex = new RegExp("\\{\\{\\s*" + fn + "\\s+((?:" +
                    quote + "(?:[^" + quote + "\\\\]|\\\\.)+" + quote +
                    "\\s*)+)[^}]*\\s*\\}\\}", "g");
                var subRE = new RegExp(quote + "((?:[^" + quote + "\\\\]|\\\\.)+)" + quote, "g");
                var quoteRegex = new RegExp("\\\\" + quote, "g");

                _.extend(messages, getMessages(contents, regex, subRE, quoteRegex, quote, options));
            };

            _.each(fn, function(func) {
                extractStrings("'", func);
                extractStrings('"', func);
            });

            return messages;
        },

        javascript: function(file, options) {
            var contents = grunt.file.read(file).replace("\n", " ")
                .replace(/"\s*\+\s*"/g, "")
                .replace(/'\s*\+\s*'/g, "");

            var fn = _.flatten([ options.functionName ]),
                messages = {};

            var extractStrings = function(quote, fn) {
                var regex = new RegExp("(?:[^\\w]|^)" + fn + "\\s*\\(\\s*((?:" +
                    quote + "(?:[^" + quote + "\\\\]|\\\\.)+" + quote +
                    "\\s*[,)]\\s*)+)", "g");
                var subRE = new RegExp(quote + "((?:[^" + quote + "\\\\]|\\\\.)+)" + quote, "g");
                var quoteRegex = new RegExp("\\\\" + quote, "g");

                _.extend(messages, getMessages(contents, regex, subRE, quoteRegex, quote, options));
            };

            _.each(fn, function(func) {
                extractStrings("'", func);
                extractStrings('"', func);
            });

            return messages;
        },

        html: function(file, options) {
            var contents = grunt.file.read(file).replace("\n", " "),
                fn = _.flatten([ options.functionName ]),
                messages = {};

            var extractStrings = function(quote, fn) {
                var regex = new RegExp("" + fn + "\\(((?:" +
                    quote + "(?:[^" + quote + "\\\\]|\\\\.)+" + quote +
                    "\\s*)+)\\)", "g");
                var subRE = new RegExp(quote + "((?:[^" + quote + "\\\\]|\\\\.)+)" + quote, "g");
                var quoteRegex = new RegExp("\\\\" + quote, "g");

                _.extend(messages, getMessages(contents, regex, subRE, quoteRegex, quote, options));
            };

            _.each(fn, function(func) {
                extractStrings("'", func);
                extractStrings('"', func);
            });

            return messages;
        }
    };

    grunt.registerMultiTask("xgettext", "Extracts translatable messages", function() {

        var options = this.options({
            functionName: "tr",
            potFile: "messages.pot",
            processMessage: _.identity
        });

        var translations = {};

        this.files.forEach(function(f) {

            if (!extractors.hasOwnProperty(f.dest)) {
                console.log("No gettext extractor for type: " + f.dest);
                return;
            }

            var messages = {};
            f.src.forEach(function(file) {
                _.extend(messages, extractors[f.dest](file, options));
            });

            _.extend(translations, messages);

            var count = Object.keys(messages).length;
            grunt.log.writeln("Extracted " + count + " messages from " + f.dest + " files.");
        });

        var contents = "# Generated by grunt-xgettext on " + (new Date()).toString() + "\n\n";

        contents += _.map(translations, function(definition) {
            var buffer = "msgid " + escapeString(definition.singular) + "\n";
            if (definition.plural) {
                buffer += "msgid_plural " + escapeString(definition.plural) + "\n";
                buffer += "msgstr[0] " + escapeString(definition.message) + "\n";
            } else {
                buffer += "msgstr " + escapeString(definition.message) + "\n";
            }
            return buffer;
        }).join("\n");

        grunt.file.write(options.potFile, contents);

        var count = Object.keys(translations).length;
        grunt.log.writeln(count + " messages successfully extracted, " +
            options.potFile + " written.");

    });

};
