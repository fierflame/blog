
## 说明

获取资源，是利用Web最重要的功能之一，但随着现代也有越来越多的应用改用Web设计，而这些应用中，是有不少原本可以处理其他协议的（例如邮箱应用可以处理`mailto:`协议），如果通过处理其他协议，需要手动复制粘贴或者需要先手动转成`http(s):`协议，显然是不方便的。为了解决这个问题，HTML5引入了“Web-based Protocol Handlers”，以便于直接点击其他协议的链接就可以直接用Web应用打开并处理。

## 语法

Web-based Protocol Handlers 只提供了一个方法。

### 注册

使用`registerProtocolHandler`方法用来注册处理程序，此方法扩展了`navigator`对象，具体语法如下：

```ECMAScript
navigator.registerProtocolHandler(protocol, url, title);
```

当一个浏览器执行这段代码时,它应该向用户显示一个请求,让用户许可为处理这个协议而注册一个web应用程序的请求。

#### 参数

`protocol`: 站点希望处理的协议，指定为字符串。例如，您可以注册处理SMS文本消息链接，通过注册来处理“短信”方案。



> _**注意**_ 协议必须属于白名单内的协议，或者以`web+`开头的协议。
>
> | 协议白名单 | - | - | - | - |
> |:---:|:---:|:---:|:---:|:---:|
> | bitcoin | geo | im | irc | ircs |
> | magnet | mailto | mms | news | nntp |
> | sip | sms | smsto | ssh | tel |
> | urn | webcal | wtai | xmpp |  |

`url`: 处理程序的URL，作为字符串。此字符串应包含“％s”作为占位符，将替换为要处理的文档的转义URL。此URL可能是真实的URL，也可能是电话号码，电子邮件地址等。

> _**注意**_ url参数必须为代码执行页面的同源url, 可以使相对url, 也可以是绝对url。

`title`: 在界面展示给的用户的协议处理程序标题。

#### 可能的错误

`SecurityError`: 用户代理阻止了协议处理程序的注册。如果指定了无效协议（例如“http”），则可能会发生这种情况，出于明显的安全原因无法注册。

`SyntaxError`: 指定的协议处理程序URL中缺少“％s”字符串。

### 激活

当协议被注册后，只要用户点击使用对应协议的链接，浏览器将跳转到对应的web应用程序注册时提供的URL。

例如点击一下链接，就会打开用于处理`mailto:`协议的Web应用，除非此协议未被注册，则会打开操作系统的处理应用。

```HTML
<a href="mailto:webmaster@example.com">Web Master</a>
```

### 处理

当用户要打开对应协议时，浏览器会自动跳转到对应的URL，例如`mailto:`注册到`https://www.example.com/?url=%s`，则点击上面的链接就会打开`https://www.example.com/?url=mailto%3Awebmaster%40example.com`，然后就可以直接使用服务器或者JavaScript处理。
