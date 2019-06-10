require('@gensety/renderer-ejs');
require('@gensety/renderer-markdown');
require('./blog');


module.exports = {
	public: '../../public/blog',
	source: '../../blog',
	theme: {
		static: 'static',
	},
	title: '王晨旭的网站',
}


Date.prototype.format = function (format = 'YYYY-MM-DD') {
	var o = {
		"M+": this.getMonth() + 1, //month 
		"[Dd]+": this.getDate(), //day 
		"h+": this.getHours(), //hour 
		"m+": this.getMinutes(), //minute 
		"s+": this.getSeconds(), //second 
		"q+": Math.floor((this.getMonth() + 3) / 3), //quarter 
		"S": this.getMilliseconds() //millisecond 
	}
	if (/([yY]+)/.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
		}
	}
	return format;
}



const navlist = [
	{ title: '提问', url: 'https://gitee.com/wangchenxu-net/blog/issues' },
	{ title: '开发者工具', url: 'http://tools.wangchenxu.net/' },
	// { title: 'git', url: 'http://git.wangchenxu.net/' },
	// { title: '算法', url: 'http://algorithm.wangchenxu.net/' },
	// { title: 'MTJSON', url: 'http://mtjson.wangchenxu.net/' },
	// { title: 'functmpl', url: 'http://functmpl.wangchenxu.net/' },
	// { title: 'ECMAScript 教程', url: 'http://ecmascript.wangchenxu.net/' },
	// { title: '直播间', url: 'http://www.douyu.com/xulive' },
];
gensety.context.set('navlist',() => navlist);

gensety.setGenerater('404', () => ({
	path:"404.html",
	data:{
		is_error_page: true,
		title:"找不到页面",
		error_code:"404",
		error_title:"您所请求的页面无法找到",
		error_info:"",
	},
	layout: ["error_page.ejs"],
	baseLayout: 'layout.ejs',
}));
