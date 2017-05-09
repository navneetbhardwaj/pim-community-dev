webpackJsonp([4,8],{

/***/ 106:
/* unknown exports provided */
/* all exports used */
/*!***********************************************************************************!*\
  !*** ./src/Pim/Bundle/EnrichBundle/Resources/public/js/fetcher/locale-fetcher.js ***!
  \***********************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
        __webpack_require__(/*! jquery */ 1),
        __webpack_require__(/*! underscore */ 0),
        __webpack_require__(/*! pim/base-fetcher */ 90),
        __webpack_require__(/*! routing */ 10)

    ], __WEBPACK_AMD_DEFINE_RESULT__ = function (
        $,
        _,
        BaseFetcher,
        Routing
    ) {
        return BaseFetcher.extend({
            entityActivatedListPromise: null,
            /**
             * @param {Object} options
             */
            initialize: function (options) {
                this.options = options || {};
            },

            /**
             * Fetch an element based on its identifier
             *
             * @param {string} identifier
             *
             * @return {Promise}
             */
            fetchActivated: function () {
                if (!this.entityActivatedListPromise) {
                    if (!_.has(this.options.urls, 'list')) {
                        return $.Deferred().reject().promise();
                    }

                    this.entityActivatedListPromise = $.getJSON(
                        Routing.generate(this.options.urls.list),
                        {activated: true}
                    ).then(_.identity).promise();
                }

                return this.entityActivatedListPromise;
            },

            /**
             * {inheritdoc}
             */
            clear: function () {
                this.entityActivatedListPromise = null;

                BaseFetcher.prototype.clear.apply(this, arguments);
            }
        });
    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),

/***/ 90:
/* unknown exports provided */
/* all exports used */
/*!*********************************************************************************!*\
  !*** ./src/Pim/Bundle/EnrichBundle/Resources/public/js/fetcher/base-fetcher.js ***!
  \*********************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* global console */


!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(/*! jquery */ 1), __webpack_require__(/*! underscore */ 0), __webpack_require__(/*! backbone */ 2), __webpack_require__(/*! routing */ 10)], __WEBPACK_AMD_DEFINE_RESULT__ = function ($, _, Backbone, Routing) {
    return Backbone.Model.extend({
        entityListPromise: null,
        entityPromises: {},

        /**
         * @param {Object} options
         */
        initialize: function (options) {
            this.entityListPromise = null;
            this.entityPromises    = {};
            this.options           = options || {};
        },

        /**
         * Fetch all elements of the collection
         *
         * @return {Promise}
         */
        fetchAll: function () {
            if (!this.entityListPromise) {
                if (!_.has(this.options.urls, 'list')) {
                    return $.Deferred().reject().promise();
                }

                this.entityListPromise = $.getJSON(
                    Routing.generate(this.options.urls.list)
                ).then(_.identity).promise();
            }

            return this.entityListPromise;
        },

        /**
         * Search elements of the collection
         *
         * @return {Promise}
         */
        search: function (searchOptions) {
            if (!_.has(this.options.urls, 'list')) {
                return $.Deferred().reject().promise();
            }

            return this.getJSON(this.options.urls.list, searchOptions).then(_.identity).promise();
        },

        /**
         * Fetch an element based on its identifier
         *
         * @param {string} identifier
         * @param {Object} options
         *
         * @return {Promise}
         */
        fetch: function (identifier, options) {
            options = options || {};

            if (!(identifier in this.entityPromises) || false === options.cached) {
                var deferred = $.Deferred();

                if (this.options.urls.get) {
                    $.getJSON(
                        Routing.generate(this.options.urls.get, _.extend({identifier: identifier}, options))
                    ).then(_.identity).done(function (entity) {
                        deferred.resolve(entity);
                    }).fail(function () {
                        console.error('Error during fetching: ', arguments);

                        return deferred.reject();
                    });
                } else {
                    this.fetchAll().done(function (entities) {
                        var entity = _.findWhere(entities, {code: identifier});
                        if (entity) {
                            deferred.resolve(entity);
                        } else {
                            deferred.reject();
                        }
                    });
                }

                this.entityPromises[identifier] = deferred.promise();
            }

            return this.entityPromises[identifier];
        },

        /**
         * Fetch all entities for the given identifiers
         *
         * @param {Array} identifiers
         *
         * @return {Promise}
         */
        fetchByIdentifiers: function (identifiers) {
            if (0 === identifiers.length) {
                return $.Deferred().resolve([]).promise();
            }

            var uncachedIdentifiers = _.difference(identifiers, _.keys(this.entityPromises));
            if (0 === uncachedIdentifiers.length) {
                return this.getObjects(_.pick(this.entityPromises, identifiers));
            }

            return $.when(
                    this.getJSON(this.options.urls.list, { identifiers: uncachedIdentifiers.join(',') })
                        .then(_.identity),
                    this.getIdentifierField()
                ).then(function (entities, identifierCode) {
                    _.each(entities, function (entity) {
                        this.entityPromises[entity[identifierCode]] = $.Deferred().resolve(entity).promise();
                    }.bind(this));

                    return this.getObjects(_.pick(this.entityPromises, identifiers));
                }.bind(this));
        },

        /**
         * Get the list of elements in JSON format.
         *
         * @param {string} url
         * @param {Object} parameters
         *
         * @returns {Promise}
         */
        getJSON: function (url, parameters) {
            return $.getJSON(Routing.generate(url, parameters));
        },

        /**
         * Get the identifier attribute of the collection
         *
         * @return {Promise}
         */
        getIdentifierField: function () {
            return $.Deferred().resolve('code');
        },

        /**
         * Clear cache of the fetcher
         *
         * @param {string|null} identifier
         */
        clear: function (identifier) {
            if (identifier) {
                delete this.entityPromises[identifier];
            } else {
                this.entityListPromise = null;
                this.entityPromises    = {};
            }
        },

        /**
         * Wait for promises to resolve and return the promises results wrapped in a Promise
         *
         * @param {Array|Object} promises
         *
         * @return {Promise}
         */
        getObjects: function (promises) {
            return $.when.apply($, _.toArray(promises)).then(function () {
                return 0 !== arguments.length ? _.toArray(arguments) : [];
            });
        }
    });
}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ })

});