function loadJs(url,fn) {
	var script = document.createElement("script");
	script.setAttribute("type", "text/javascript");
	script.setAttribute("charset", "UTF-8");
	script.setAttribute("src", url);
	if(typeof fn === "function") {
		if(window.attachEvent) {
			script.onreadystatechange = function() {
				var e = script.readyState;
				if(e === "loaded"||e === "complete"){
					script.onreadystatechange = null;
					fn();
				}
			}
		} else {
			script.onload = function() {
				script.onload = null;
				fn();
			}
		}
	}
	(document.getElementsByTagName("head")[0]||document.head||document.documentElement).appendChild(script);
	return script;
}


var mapSource = ["/blog/index.json", "/ecmascript/index.json", ];
var initSearch = (function(){
	function createItem(title, url) {
		var li = document.createElement("li");
		li.appendChild(document.createTextNode(title));
		li.onclick = function() {
			window.open(url);
		}
		return li;
	}
	function updateShow(map, pa, str) {
		var regexp = new RegExp(str.replace(/./g, function(c) {
			if ('()[]{}<>~`!:;,|-+?*.^$\\/'.indexOf(c) != -1) {
				c = '\\' + c;
			}
			return ".*" + c;
		}),'i');
		pa.innerHTML = "";
		for (var url in map) {
			var title = map[url];
			if (regexp.test(title)) {
				pa.appendChild(createItem(title, url));
			}
		}
	}
	function createSearchBtn(title, url, input) {
		var btn = document.createElement("span");
		btn.appendChild(document.createTextNode(title));
		btn.onclick = function() {
			var value = input.value;
			if (/^\s*$/.test(value)) {
				return ;
			}
			window.open(url.replace("%s", encodeURIComponent(value)));
		}
		return btn;
	}
	let updateShowList = [];
	function createSearch(div) {
		if (!div) {
			div = document.createSearch("div");
		}
		var map = this.map;
		base = div.className.replace("search-area","").replace(/\s+/g," ");
		div.className = base + " search-area";
		var list = document.createElement("div");
		var input = document.createElement("input");
		var ul = document.createElement("ul");
		var btns = document.createElement("div");

		div.appendChild(list);
		div.appendChild(input);
		list.appendChild(ul);
		list.appendChild(btns);

		input.placeholder = "快速查找"
		updateShowList.push([ul, input]);
		updateShow(map, ul, input.value);
		input.oninput = function() {
			updateShow(map, ul, input.value);
		}
		input.onfocus = function() {
			div.className = base + " search-area focus";
		}
		input.onblur = function() {
			div.className = base + " search-area";
		}

		var search = this.search;
		for (var s in search) {
			btns.appendChild(createSearchBtn("用" + s + "搜索", search[s], input));
		}
		return this.ret;
	}

	function addItem(items, root) {
		var map = this.map;
		if (!root) {
			root = "";
		}
		for (let url in items) {
			map[root + url] = items[url];
		}
		for (var i = 0; i < updateShowList.length; i++) {
			updateShow(map, updateShowList[i][0], updateShowList[i][1].value);
		}
		return this.ret;
	}

	return function initSearch(search) {
		var that = {
			map: {},
			search: search || {},
		}
		that.ret = createSearch.bind(that);
		that.ret.add = addItem.bind(that);
		return that.ret;

	}
})();


function openBookSidebar() {
	var bookSidebar = document.getElementById("book-sidebar");
	var className = bookSidebar.className.split(/ +/);
	for (var i = className.length - 1; i >= 0; i--) {
		if (className[i] === "open") {
			return ;
		}
	}
	bookSidebar.className = bookSidebar.className + " open";
}
function createClipboard(div) {
	var data = div.dataset.clipboardData;
	var dataType = div.dataset.clipboardType;
	if (!data) {
		switch(dataType) {
			case "url": data = location.href;break;
		}
	}
	var buttonText = div.dataset.clipboardButton || "复制";
	var tip = div.dataset.clipboardTip;
	if (tip) {
		var tipDiv = document.createElement("div");
		tipDiv.appendChild(document.createTextNode(tip));
		tipDiv.className = "btnclr";
		div.appendChild(tipDiv);
	}

	var input = document.createElement("input");
	input.value = data;

	input.setAttribute("readonly", "readonly");
	var button = document.createElement("div");
	button.appendChild(document.createTextNode(buttonText));
	button.className = "btnclr";
	button.onclick = function (argument) {
		input.select();
		document.execCommand("Copy");
	}
	div.appendChild(input);
	div.appendChild(button);
}

function renderLanguageHighlight(el, lang) {
	try {
		var value = el.textContent;
		var inPre = el.parentNode && el.parentNode.tagName === "PRE";
		if (lang === "math" || lang === "tex" || lang === "latex" || lang === "katex") {
			el.className += " tex";
		} else if (lang === "seq" || lang === "sequence") {
			el.className += " sequence";
		} else if (lang === "flowchart" || lang === "flow") {
			el.className += " flowchart";
		}
		if (window.katex && (lang === "math" || lang === "tex" || lang === "latex" || lang === "katex")) {
			if (inPre) {
				value = "\\displaystyle " + value
			}
			katex.render(value, el);
		} else if (window.Diagram && (lang === "seq" || lang === "sequence")) {
			var diagram = Diagram.parse(value);
			el.textContent = "";
			diagram.drawSVG(el, {theme: 'simple'});
		} else if (window.flowchart && (lang === "flowchart" || lang === "flow")) {
			var diagram = flowchart.parse(value);
			el.textContent = "";
			diagram.drawSVG(el);
		} else if (inPre) {
			el.innerHTML = "<ol><li>" + el.innerHTML.replace(/^\n*([\s\S]*?)\n*$/,"$1").replace(/(\n)/g,"\n</li><li>") + "</li></ol>";
			hljs.highlightBlock(el, [lang])
		}
	} catch(e){console.log(e)};
}



var createArticleNav = (function(){
	function getNavList(nav) {
		var li = document.createElement("li");
		if (nav.title && nav.id) {
			var a = document.createElement("a");
			a.appendChild(document.createTextNode(nav.title));
			a.title = nav.title;
			a.href = "#" + nav.id;
			li.appendChild(a);
			if (!(nav.list && nav.list.length)) {
				return li;
			}
		}
		var ul = document.createElement("ul");
		for (var i = 0; i < nav.list.length; i++) {
			var item = getNavList(nav.list[i]);
			if (item) {
				ul.appendChild(item);
			}
		}
		if (ul.children.length) {
			li.appendChild(ul);
		}
		if (li.children.length) {
			return li;
		}
	}

	return function createArticleNav(article, level) {
		var list = [[]];
		tags = ["h1", "h2"];
		for (var i = 2; i <= level; i++) {
			tags.push("h" + i);
		}
		article.querySelectorAll(tags.join(",")).forEach(function(node){
			var level = +node.tagName[1];
			if (list.length > level) {
				list.length = level;
			}
			thatList = list[list.length - 1];
			while(list.length < level) {
				var that = {
					list: [],
				}
				thatList.push(that);
				thatList = that.list;
				list.push(thatList);
			}
			var that = {
				list: [],
				title: node.textContent,
				node: node,
			}
			node.id = that.id = that.title.replace(/\s+/,"-");
			thatList.push(that);
			list.push(that.list);
		});
		var ul = document.createElement("ul");
		list = list[0];
		while(list.length <= 1) {
			var nav = list[0];
			if (nav) {
				if (nav.title && nav.id) {
					var li = document.createElement("li");
					var a = document.createElement("a");
					a.appendChild(document.createTextNode(nav.title));
					a.title = nav.title;
					a.href = "#" + nav.id;
					li.appendChild(a);
					ul.appendChild(li);
				}
				list = nav.list || [];
			}
		}
		if (list.length) {
			for (var i = 0; i < list.length; i++) {
				var li = getNavList(list[i]);
				if (li) {
					ul.appendChild(li);
				}
			}
		}

		if (ul.children.length) {
			return ul;
		}
	};
})();
window.addEventListener("load", function(){

	var article = document.querySelector("article");
	if (!(article && article.hasAttribute("need-article-nav"))) {
		return;
	}
	var nav = createArticleNav(article);
	if (nav) {
		var div = document.createElement("div");
		div.appendChild(document.createTextNode("目录"));
		div.appendChild(nav);
		div.className = "style-context-box blog-toc";
		article.parentNode.insertBefore(div, article);
	}
});

window.addEventListener("load", function(){
	var clipboarddatas = document.querySelectorAll("*[data-clipboard-data]");
	for (var i = 0; i < clipboarddatas.length; i++) {
		 createClipboard(clipboarddatas[i]);
	}
});
window.addEventListener("load", function(){
	document.querySelectorAll("code").forEach(function(el) {
		renderLanguageHighlight(el, el.className);
	});
});


window.addEventListener("load", function(){
	document.querySelectorAll("[data-page-card]").forEach(function(card) {
		var title = card.dataset.title || document.title;
		var url = card.dataset.url || location.href;
		var qrcodeDiv = document.createElement("div");
		var titleDiv = document.createElement("div");
		var urlDiv = document.createElement("div");
		new QRCode(qrcodeDiv, {
			text: url,
			width: 128,
			height: 128,
			correctLevel : QRCode.CorrectLevel.H
		});
		titleDiv.appendChild(document.createTextNode(title));
		urlDiv.appendChild(document.createTextNode(url));
		qrcodeDiv.title = "";
		qrcodeDiv.className = "qrcode"
		titleDiv.className = "title"
		urlDiv.className = "url"
		card.appendChild(qrcodeDiv);
		card.appendChild(urlDiv);
		card.appendChild(titleDiv);
		card.className = "only-print";
	});
});


window.addEventListener("load", function(){
	var search = initSearch({
		"搜狗": "https://www.sogou.com/web?query=site%3Awangchenxu.net+%s",
	});
	var inited = false;
	var searchArea = document.querySelectorAll(".search-area");
	if (!searchArea.length) { return; }

	function dataed(data) {
		search.add(data.map, data.root);
		if (inited) {
			return ;
		}
		inited = true;
		document.querySelectorAll(".search-area").forEach(search);
	}
	mapSource.forEach(function(url){
		fetch(url).then(x=>x.json()).then(dataed)
	})
	
});


window.addEventListener("load", function(){
var appid = 'cysoEHtC7'; 
var conf = 'prod_11a2b98740a76cafbd415d7613b99380'; 
var width = window.innerWidth || document.documentElement.clientWidth;

var url, id = '';
if (width < 840) {
	url = 'https://changyan.sohu.com/upload/mobile/wap-js/changyan_mobile.js?client_id=' + appid + '&conf=' + conf;
	id = "changyan_mobile_js";
} else {
	url = 'https://changyan.sohu.com/upload/changyan.js';
}
// TODO 天机到 more-list
/**
	<div class="not-print" id="cyHotnews" role="cylabs" data-use="hotnews"></div>
	<div class="not-print" id="cyReping" role="cylabs" data-use="reping"></div>
	<div class="not-print" id="cyHotusers" role="cylabs" data-use="hotusers"></div>
 */
/*
loadJs(url, function(){
	if (window.changyan) { window.changyan.api.config({appid:appid, conf:conf}); }
	loadJs('https://changyan.itc.cn/js/lib/jquery.js', function(){
		loadJs('https://changyan.sohu.com/js/changyan.labs.https.js?appid=' + appid);
	});
}).id = id;
*/
});
