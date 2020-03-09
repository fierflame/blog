
## 关于 Let's Encrypt

我们在部署 HTTPS 网站的时候需要证书，证书可以自行签发，也可以由 CA 机构签发签发，但是一般使用由个人或非可信的 CA 机构签发签发的证书默认都会被浏览器组织访问。  
大部分传统的 CA 机构签发证书是收费的，目前可以提供免费的正数主要有：
* `Symantec` - 提供单一域名的免费 DV SSL 证书，证书有效期为从签发日起开始一年
* `Let's Encrypt` - 提供多域名和通配符的免费 DV SSL 证书，证书有效期为从签发日起开始90天

Let's Encrypt 是非盈利性的组织，设计了一个 ACME 协议，通过 ACME 协议使得证书申请、证书更新、证书撤销等过程可以完全由程序自动完成。目前 ACME 协议有两个版本 v1 和 v2。其中支持通配符证书的只有 v2 版本。

## 通配符证书

从可以支持的域名的角度分类，证书可以分为以下三类：
* `单域名证书` - 支持对一个域名的保护，如`fierflame.com`、`demo.fierflame.com`等，但是不支持对其子域名的保护，如`fierflame.com`的整数，不支持对域名`demo.fierflame.com`保护
* `泛域名证书` - 支持对多个域名保护，同一个证书所保护的各个域名之间可以没有任何关联，另外，不同 CA 机构提供的`泛域名证书`可以容纳的域名数量不通。其他规则同`单域名证书`
* `通配符证书` - 支持对一个带通配符域名（该\*号同级别的全部明细域名）保护，申请证书时，如申请`*.fierflame.com`,那么该证书支持`a.fierflame.com`, `a1.fierflame.com`, `a2.fierflame.com`...以此类推，但是不支持`b.a.fierflame.com`, `b1.a.fierflame.com`...以此类推。如需支持，需另外再申请一张`*.a.fierflame.com`证书，部分 CA 机构提供的`通配符证书`还支持同时保护多个普通域名，如 `Let's Encrypt ACME v2` 证书

## 安装 certbot-auto

`certbot-auto` 本身只是一个 shell 脚本，通过此脚本，我们可以实现证书的申请等操作。关于 certbot-auto 的介绍，可以查看 https://certbot.eff.org/  

通过以下命令，可以下载`certbot-auto`脚本并为其添加执行权限：
```shell
wget https://dl.eff.org/certbot-auto
chmod a+x certbot-auto
```

下载完成后，可以将其移动到`/usr/bin`、`/usr/local/bin`等环境路径下使用，也可以直接使用。此教程按照将其移动到环境路径下编写。如果您不移动，记得在命令前加入`.\`才能使用。


第一次使用 `certbot-auto` 时，其会调用系统安装工具(如`yum`、`apt`)安装一些必要的工具，安装过程中会有相应指令的交互操作，请配合安装。在必要工具安装完成后(或长时间未用，有更新的情况下)，`certbot-auto`会下载用到的最新的模块已进行证书申请。两次下载安装，会因为用户所用网络、安装包大小等原因，需要的时间不同。



## certbot-auto 教程

`certbot-auto`命令示例：
```
certbot-auto certonly -d fierflame.com -d *.fierflame.com --manual --preferred-challenges dns --server https://acme-v02.api.letsencrypt.org/directory 
```

参数说明
* `certonly` 表示安装模式，Certbot 有安装模式和验证模式两种类型的插件。
* `-d 域名` 要使用此证书的域名，可以多个，但通配符域名最多一个
* `--manual` 表示手动安装插件，Certbot 有很多插件，不同的插件都可以申请证书，用户可以根据需要自行选择
* `--preferred-challenges 验证方式` 验证域名所有权的方式，目前有以下三种：
  1. `dns-01` - 给域名添加一个 DNS TXT 记录。对于通配符域名，只能使用 `dns-01` 方式验证
  2. `http-01` - 在域名对应的 Web 服务器下放置一个 HTTP well-known URL 资源文件
  3. `tls-sni-01` - 在域名对应的 Web 服务器下放置一个 HTTPS well-known URL 资源文件
* `--server 认证中心URL` 认证中心的URL，对于通配符域名，目前只有Let's Encrypt ACME v2 版本的认证中心支持通配符证书


``` shell
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Plugins selected: Authenticator manual, Installer None
Enter email address (used for urgent renewal and security notices) (Enter 'c' to
cancel): www@fierflame.com   # <---- 这个不一定有，如果有，则输入邮箱，然后回车

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Please read the Terms of Service at
https://letsencrypt.org/documents/LE-SA-v1.2-November-15-2017.pdf. You must
agree in order to register with the ACME server at
https://acme-v02.api.letsencrypt.org/directory
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(A)gree/(C)ancel: A        # <---- 必须是 A， 表示同意服务协议

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Would you be willing to share your email address with the Electronic Frontier
Foundation, a founding partner of the Let's Encrypt project and the non-profit
organization that develops Certbot? We'd like to send you email about our work
encrypting the web, EFF news, campaigns, and ways to support digital freedom.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(Y)es/(N)o: N             # <---- 问你要不要接收电子前沿基金的一些推送邮件，这个Y N 都可以，此项不一定会出现


Plugins selected: Authenticator manual, Installer None
Obtaining a new certificate
Performing the following challenges:
dns-01 challenge for fierflame.com
dns-01 challenge for fierflame.com   # <------ 这里显示的是认证的域名
# <!----- 如果设置了多个域名，会显示多条，特别的，对于通配符域名会显示父域名  ---------->

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NOTE: The IP of this machine will be publicly logged as having requested this
certificate. If you're running certbot in manual mode on a machine that is not
your server, please ensure you're okay with that.

Are you OK with your IP being logged?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(Y)es/(N)o: y              # <---- 问是否要绑定当前机器的IP，现在必须绑定，也就是必须是 Y

# <!----- 从这里开始需要验证域名所有权，采用的是验证 DNS TXT 记录的方式验证        ---------->
# <!----- 如果设置了多个域名，对于每一个都会对需要单独设置（通配符域名视为一个域名） ---------->
# <!----- 设置的 TXT 记录在全部被验证后才可以删除，当然你也可以不删除              ---------->
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Please deploy a DNS TXT record under the name
_acme-challenge.fierflame.com with the following value:     # <------ 需要设置 TXT 记录的命名

bY1cQdzRXC4GD-0TPYV3gSnNI2fReB4CPAJHU9QJ1QA              # <------ TXT 记录值
# 特别说明，对于同一个域名可以添加多个相同优先级的 TXT 记录

Before continuing, verify the record is deployed.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Press Enter to Continue                                  # <------ 设置完成后点击回车，必要的话，可以先按照后文提到的方法进行验证后再点击回车
# <!--- 如果还有域名没有设置，上面部分要重复操作，但是每次的域名和 TXT 记录值一般都不同 -------->
Waiting for verification...                              # <------ 进行最后的统一验证
Cleaning up challenges
# <------ 如果没有其他问题，则已经生成证书，此时 TXT 记录可以删除了                --------->

IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/fierflame.com/fullchain.pem              # <---- 证书生成的位置
   Your key file has been saved at:
   /etc/letsencrypt/live/fierflame.com/privkey.pem              # <---- 密钥生成的位置
# <------ 实际上除了生产以上两个文件外，还会生成其他的几个文件，但所给的文件的所属目录一定相同 ------->
# <------ 在这里的目录为`/etc/letsencrypt/live/fierflame.com`，后面介绍将用到此目录路径 ------->
   Your cert will expire on 2019-06-27. To obtain a new or tweaked   # <---- 有效期截止日期
   version of this certificate in the future, simply run certbot-auto
   again. To non-interactively renew *all* of your certificates, run
   "certbot-auto renew"
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le

```

## 解析测试

可以使用`dig`命令测试
具体格式为：
```
dig -t txt 域名 @DNS
```
其中：
* `-t txt` - 表示要查询 TXT 记录，可选，默认为 A 记录
* `域名` - 为要查询的域名，可以多个
* `@DNS` - 表示采用的服务，可选，采用`@8.8.8.8`可以避免缓存问题

例如执行`dig -t txt _acme-challenge.fierflame.com @8.8.8.8`得到的结果是：
```
; <<>> DiG 9.11.3-1ubuntu1.5-Ubuntu <<>> -t txt _acme-challenge.fierflame.com @8.8.8.8
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 5608
;; flags: qr rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 512
;; QUESTION SECTION:
;_acme-challenge.fierflame.com.	IN	TXT

;; ANSWER SECTION:
_acme-challenge.fierflame.com.	599 IN	TXT	"bY1cQdzRXC4GD-0TPYV3gSnNI2fReB4CPAJHU9QJ1QA"
_acme-challenge.fierflame.com.	599 IN	TXT	"a0vjK4_laS7vnGJNEglqzpbG3UagxCjAoD2hmPszNYw"

;; Query time: 95 msec
;; SERVER: 8.8.8.8#53(8.8.8.8)
;; WHEN: Fri Mar 29 10:14:19 CST 2019
;; MSG SIZE  rcvd: 171
```
我们将以`;`开头的部分和空行过滤掉，得到：
```
_acme-challenge.fierflame.com.	238 IN	TXT	"bY1cQdzRXC4GD-0TPYV3gSnNI2fReB4CPAJHU9QJ1QA"
_acme-challenge.fierflame.com.	238 IN	TXT	"a0vjK4_laS7vnGJNEglqzpbG3UagxCjAoD2hmPszNYw"
```
其中`_acme-challenge.fierflame.com.`及为我们查询的域名，最后引号内的为设置的TXT记录，如果其记录复合，则表示设置成功

## 证书的说明

上面示例中的目录路径为`/etc/letsencrypt/live/fierflame.com`
但是此目录中所包含的文件不只是以上几个文件，在此目录下执行`ls`我们可以看到，有以下几个文件：
* `privkey.pem` - 证书的私钥
* `fullchain.pem` - 大多数服务器软件中使用的证书文件
* `chain.pem` - 证书的公钥
* `cert.pem` - 第三方证明，里面含有证书的颁发机构、有效期、有效域名等，但不包含公钥
* `README` - 对以上四个文件的说明

对于这几个文件，不要删除或移动，使用时，建议直接配置为此文件或者做一软连接后使用。
