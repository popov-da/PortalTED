/**
 * ReactJS adapter
 * @module static/component-react
 * @requires react-dom
 * @requires react
 */
define(function (require, exports, module) {
    var ReactDOM = require('react-dom'),
        React = require('react');
    /**
     * A factory function.
     * @param {UISkinController} skin
     * @param {object} options
     * @param {string} options.container="div"
     * @param {string|function} options.type A tag name, a React component or a React fragment type
     * @param {object} options.props
     * @param {Cortona3DSolo} solo
     * @returns {Refs}
     */
    module.exports = function (skin, options, solo) {
        var container = skin.create(options.container || 'div');
        skin.render(container);
        return ReactDOM.render(
            React.createElement(options.type, options.props),
            container
        );
    };
});