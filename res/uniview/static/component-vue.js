/**
 * Vue.js adapter
 * @module static/component-vue
 * @requires vue
 */
define(function (require, exports, module) {
    var Vue = require('vue');
    /**
     * A factory function.
     * @param {UISkinController} skin
     * @param {object} options A new Vue instance options
     * @param {string} options.template A string template to be used as the markup for the Vue instance
     * @param {Cortona3DSolo} solo
     * @returns {Vue}
     */
    module.exports = function (skin, options, solo) {
        return new Vue(solo.expand(options.template ? {
            el: skin.render(skin.html(options.template)[0])
        } : {}, options));
    };
});