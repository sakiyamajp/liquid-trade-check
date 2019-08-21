'use strict';

var _express = require('./express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

global.L = function () {
	let params = timeFormat(new Date().getTime());
	params = [params];
	for (let d of arguments) {
		params.push(d);
	}
	console.log.apply(null, params);
};
var server = (0, _express2.default)();
server.listen(80);