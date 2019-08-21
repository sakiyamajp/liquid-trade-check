'use strict'
import express from './express';
global.L = function(){
	let params = timeFormat(new Date().getTime());
	params = [ params ];
	for(let d of arguments){
		params.push(d);
	}
	console.log.apply(null,params);
};
var server = express();
server.listen(80);
