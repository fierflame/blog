const pathFn = require('path');

let blogs = [];
let indexs = {};
let blogPath = '';
if (typeof blogPath !== 'string') {
	blogPath = '';
} else if (blogPath && blogPath[blogPath.length -1 ] !== '/') {
	blogPath += '/';
}

function parseFilename(path) {
	path = path.substring(0, path.length - pathFn.extname(path).length);

	let ret = /(\d{4})\-(\d{2})\-(\d{2})-([^/]*)$/.exec(path);
	if (ret) {
		let [, year, month, day, title] = ret;
		return {year, month, day, title};
	}
	ret = /([^/]*)$/.exec(path);
	if (ret) {
		let [, title] = ret;
		return {title};
	}
}
const preservedKeys = {
	title: true,
	year: true,
	month: true,
	day: true,
	i_month: true,
	i_day: true
};


function getIndex(index) {
	const layout = ['blog.ejs', 'post.ejs', 'page.ejs', 'index.ejs'];
	const baseLayout = 'layout.ejs';
	const blogs = index.blogs;
	const total = blogs.length;
	index.total = total;
	index.archive = true;
	index.dates = [];
	const pageList = [];
	index.pageList = pageList;
	const path = index.path.replace(/\/+$/,'');
	for (let i = 0; i * 30 < total; i++) {
		const page = Object.assign({}, index);
		page.category = index;
		page.blogs = blogs.slice(i * 30, 30);
		page.path = path + `/index${i === 0 ? '' : '_' + i}`;
		page.url = page.path + '.html';
		page.pagination = i;
		pageList.push(page)
	}
	pageList.forEach((page, i) => {
		page.prev = pageList[i - 1];
		page.next = pageList[i + 1];
	});
	if (!pageList.length) {
		const page = {...index, category: index, path: path + `/index.html`, pagination: 0};
		pageList.push(page);
	}
	return pageList.map((page, i) => ({ path: page.url, data: page, layout, baseLayout }));
}



async function processor(file, {config}, { isTheme }) {
	const path = file.params.path || file.path;
	if (path[0] == "." || path[0] == "_" || /\/[\._]/.test(path) || !/\//.test(path)) { return false; }
	if (!/\.md$/i.test(path)) {
		// TODO: 复制文件
		return ;
	}

	const dirname = file.dir;
	const stats = file.stat();

	const data = await file.parse();
	const info = parseFilename(path);
	data.source = file.path;
	data.slug = info && info.title;
	data.dirname = dirname;

	if (/\/index\.md$/i.test(path)) {
		data.blogs = [];
		data.children = [];
		data.path = blogPath + dirname;
		data.url = data.path;
		data.dirname = dirname;
		indexs[dirname] = data;
		return ;
	}

	
	if (info) { for (let key in info) { if (!preservedKeys[key]) data[key] = info[key]; } }
	// 创建时间
	if (data.date) {
		data.date = new Date(data.date);
	} else if (info && info.year && info.month && info.day) {
		data.date = new Date(
			parseInt(info.year),
			parseInt(info.month, 10) - 1,
			parseInt(info.day, 10)
		);
	} else {
		data.date = (await stats).birthtime;
	}
	// 更新时间
	data.updated = new Date(data.updated ? data.updated : (await stats).mtime);

	// 分类
	if (data.category && !data.categories) { data.categories = data.category; delete data.category; }
	if (!Array.isArray(data.categories)) { data.categories = data.categories ? [data.categories] : []; }
	// 标签
	if (data.tag && !data.tags) { data.tags = data.tag; delete data.tag; }
	if (!Array.isArray(data.tags)) { data.tags = data.tags ? [data.tags] : []; }
	// 图片
	if (data.photo && !data.photos) { data.photos = data.photo; delete data.photo; }
	if (!Array.isArray(data.photos)) { data.photos = data.photos ? [data.photos] : []; }

	if (data.link && !data.title) {
		data.title = data.link.replace(/^https?:\/\/|\/$/g, '');
	}

	if (data.permalink) {
		data.slug = data.permalink;
		delete data.permalink;
	}
	let date = data.date;
	let permalink = config && config.blog && config.blog.permalink;
	permalink = permalink || config && config.permalink;
	permalink = ':year-:month-:day-:title';
	data.path = blogPath + dirname + '/' + permalink
			.replace(":year", date.getFullYear())
			.replace(":month", String(date.getMonth() + 1).padStart(2, '0'))
			.replace(":day", String(date.getDate()).padStart(2, '0'))
			.replace(":i_month", date.getMonth() + 1)
			.replace(":i_day", date.getDate())
			.replace(":title", info.title)

	data.url = data.path + '.html';
	data.content = await file.render();
	blogs.push(data);
}

function generator() {
	blogs = blogs.sort(({date:a},{date:b}) => b - a);
	blogs.forEach(blog => {
		const dirname = blog.dirname.split('/');
		for (;dirname.length; dirname.pop()) {
			const path = dirname.join('/');
			if (indexs[path]) {
				indexs[path].blogs.push(blog);
				if (!blog.category) { blog.category = indexs[path]; }
			}
		}
		// TODO: 未分类
	});
	for (let dir in indexs) {
		const index = indexs[dir];
		let dirname = index.dirname.split('/');
		for (;dirname.length; dirname.pop()) {
			const path = dirname.join('/');
			if (indexs[path]) {
				indexs[path].children.push(index);
				index.parent = indexs[path];
				break;
			}
		}
	}


	const length = blogs.length;
	const result = [];
	blogs.forEach((blog, i) => {
		const path = blog.path + '.html';
		if (i) blog.prev = blogs[i - 1];
		if (i < length - 1) blog.next = blogs[i + 1];

		result.push({ path, data: blog, layout: ['blog.ejs', 'post.ejs', 'page.ejs', 'index.ejs'], baseLayout: 'layout.ejs',});
	});
	result.push(...blogs.map(blog => ({ path: blog.path + '.md', data: blog.$content})));

	const children = [];
	for (const index of Object.values(indexs)) {
		if (!index.parent) { children.push(index); }
		result.push(...getIndex(index));
	}
	result.push(...getIndex({blogs, children, path: blogPath, dirname : ''}));

	result.push({ path: "/map.json", data: {root: '', map: blogs.map(({title, explain, path}) => ({ title, explain, path }))} })
	return result;
}


gensety.setGenerater('blog', generator);
gensety.addProcessor('/:path+', processor);
gensety.context.set('blogIndexs',() => indexs);