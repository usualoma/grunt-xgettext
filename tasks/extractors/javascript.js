/*
 * grunt-xgettext
 * https://github.com/arendjr/grunt-xgettext
 *
 * Copyright (c) 2013-2014 Arend van Beelen, Speakap BV
 * Licensed under the MIT license.
 */

"use strict";

var esprima = require("esprima");
var grunt = require("grunt");
var _ = require("lodash");

module.exports = function(file, options) {

    var messages = {};

    var fn = _.flatten([ options.functionName ]);

    function flattenIdentifier(identifier) {
        if (identifier.type === "Identifier") {
            return identifier.name;
        } else if (identifier.type === "MemberExpression" && identifier.computed === false &&
                   identifier.object.type === "Identifier") {
            return identifier.object.name + "." + identifier.property.name;
        } else if (identifier.type === "MemberExpression" && identifier.computed === false &&
                   identifier.object.type === "MemberExpression") {
            return flattenIdentifier(identifier.object) + "." + identifier.property.name;
        } else {
            grunt.log.debug("Found unhandled identifier: " + JSON.stringify(identifier));
            return "";
        }
    }

    function flattenString(string) {
        if (string.type === "Literal" && _.isString(string.value)) {
            return string.value;
        } else if (string.type === "BinaryExpression" && string.operator === "+") {
            return flattenString(string.left) + flattenString(string.right);
        } else {
            grunt.log.debug("Found unhandled string: " + JSON.stringify(string));
            return "";
        }
    }

    function parseInvocation(syntax) {
        if (syntax.arguments.length > 0) {
            var singular = flattenString(syntax.arguments[0]);
            var plural, options = {};

            if (syntax.arguments.length > 1) {
                var second = syntax.arguments[1];
                if (second.type === "ObjectExpression") {
                    options = parseOptions(second);
                } else {
                    plural = flattenString(second);
                    if (syntax.arguments.length > 2) {
                        options = parseOptions(syntax.arguments[2]);
                    }
                }
            }

            var message = {
                singular: singular,
                message: ""
            };
            if (plural) {
                message.plural = plural;
            }
            if (options.comment) {
                message.comment = options.comment;
            }
            if (options.context) {
                message.context = options.context;
            }

            var key = (message.context ? message.context + ":" : "") + singular;
            if (messages[key]) {
                if (messages[key].comment) {
                    if (message.comment) {
                        messages[key].comment += "\n" + message.comment;
                    }
                } else {
                    messages[key].comment = message.comment;
                }
            } else {
                messages[key] = message;
            }
        } else {
            grunt.log.debug("No arguments to translation method");
        }
    }

    function parseOptions(syntax) {
        var options = {};
        if (syntax.type === "ObjectExpression") {
            _.each(syntax.properties, function(propertySyntax) {
                var key = (propertySyntax.key.type === "Literal" ? propertySyntax.key.value
                                                                 : propertySyntax.key.name),
                    value = flattenString(propertySyntax.value);
                if (key && value) {
                    options[key] = value;
                }
            });
        }
        return options;
    }

    function scan(syntax) {
        grunt.log.debug("Scanning node: " + syntax.type);

        switch (syntax.type) {
        case "AssignmentExpression":
            scan(syntax.right);
            break;
        case "BinaryExpression":
            scan(syntax.left);
            scan(syntax.right);
            break;
        case "CallExpression":
            var callee = syntax.callee;
            if (_.contains(fn, flattenIdentifier(callee))) {
                parseInvocation(syntax);
            } else {
                _.each(syntax.arguments, function(argumentSyntax) {
                    scan(argumentSyntax);
                });
            }
            break;
        case "ConditionalExpression":
            scan(syntax.alternate);
            scan(syntax.consequent);
            break;
        case "ExpressionStatement":
            scan(syntax.expression);
            break;
        case "IfStatement":
            scan(syntax.consequent);
            if (syntax.alternate) {
                scan(syntax.alternate);
            }
            break;
        case "LogicalExpression":
            scan(syntax.left);
            scan(syntax.right);
            break;
        case "NewExpression":
            _.each(syntax.arguments, function(argumentSyntax) {
                scan(argumentSyntax);
            });
            break;
        case "ObjectExpression":
            _.each(syntax.properties, function(propertySyntax) {
                scan(propertySyntax);
            });
            break;
        case "Property":
            scan(syntax.value);
            break;
        case "TryStatement":
            scan(syntax.block);
            if (syntax.handler) {
                scan(syntax.handler);
            }
            _.each(syntax.guardedHandlers, function(guardedHandlerSyntax) {
                scan(guardedHandlerSyntax);
            });
            if (syntax.finalizer) {
                scan(syntax.finalizer);
            }
            break;
        case "SequenceExpression":
            _.each(syntax.expressions, function(expressionSyntax) {
                scan(expressionSyntax);
            });
            break;
        case "SwitchCase":
            if (syntax.test) {
                scan(syntax.test);
            }
            _.each(syntax.consequent, function(consequentSyntax) {
                scan(consequentSyntax);
            });
            break;
        case "SwitchStatement":
            _.each(syntax.cases, function(caseSyntax) {
                scan(caseSyntax);
            });
            break;
        case "VariableDeclaration":
            _.each(syntax.declarations, function(declarationSyntax) {
                scan(declarationSyntax);
            });
            break;
        case "VariableDeclarator":
            if (syntax.init) {
                scan(syntax.init);
            }
            break;
        default:
            if (syntax.argument) {
                scan(syntax.argument);
            }
            if (syntax.body) {
                if (_.isArray(syntax.body)) {
                    _.each(syntax.body, function(bodySyntax) {
                        scan(bodySyntax);
                    });
                } else {
                    scan(syntax.body);
                }
            }
        }
    }

    var contents = grunt.file.read(file);
    scan(esprima.parse(contents));

    return messages;
};
