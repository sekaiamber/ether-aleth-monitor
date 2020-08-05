# 以太坊监控服务

本项目调用`blocknative`进行监控，包装以后进行webhook转发。

## 前提

在`blocknative`注册账户，并添加本项目产生的webhook到`blocknative`中。

## 配置

```
PORT=服务端口
DB_HOST=数据库地址
DB_NAME=数据库名
DB_USER=数据库用户名
DB_PASS=数据库密码
JWT_SECRET=忽略
JWT_ADMIN_SECRET=忽略
PAY_TOKEN=忽略
DOMAIN=忽略
BN_KEY=Blocknative的key
BN_URL=Blocknative监听地址，https://api.blocknative.com/address
BN_NETWORK=监听的以太坊网络
WEBHOOK=获得回调后，调用的webhook
```

## API

### 监听一个地址

`POST` `/api/v1/alert/new.json`

Request:
```json
{
  "address": "0xB6Cb15EF5B6f35a08Fb7374664fB43989d0d5aEf",
  "type": "tx"
}
```

Response: 200
```json
{
  "success": true,
  "data": {
    "address": "0xb6cb15ef5b6f35a08fb7374664fb43989d0d5aef",
    "type": "tx",
    "monitored": false
  }
}
```

### 获得回调的webhook

本服务回调的webhook正确返回如下：

```json
{
  "success": true
}
```

回调数据如下：

ETH转账：

pending
```json
{
  "address":"0xb6cb15ef5b6f35a08fb7374664fb43989d0d5aef",
  "system":"ethereum",
  "network":"goerli",
  "status":"pending",
  "hash":"0xee3233a363820d79e6dcfde06995606f1fbaf811950053f719933176f7fd1e6d",
  "from":"0xf50733d9809a268c717b3a782a2437cfea1006b9",
  "to":"0xb6cb15ef5b6f35a08fb7374664fb43989d0d5aef",
  "asset":"ETH",
  "value":"12400000000000000",
  "decimals":18,
  "direction":"incoming",
  "blockNumber":null
}
```

confirmed
```json
{
  "address":"0xb6cb15ef5b6f35a08fb7374664fb43989d0d5aef",
  "system":"ethereum",
  "network":"goerli",
  "status":"confirmed",
  "hash":"0xee3233a363820d79e6dcfde06995606f1fbaf811950053f719933176f7fd1e6d",
  "from":"0xf50733d9809a268c717b3a782a2437cfea1006b9",
  "to":"0xb6cb15ef5b6f35a08fb7374664fb43989d0d5aef",
  "asset":"ETH",
  "value":"12400000000000000",
  "decimals":18,
  "direction":"incoming",
  "blockNumber":3166195
}
```

ERC20转账：

pending
```json
{
  "address":"0xb6cb15ef5b6f35a08fb7374664fb43989d0d5aef",
  "system":"ethereum",
  "network":"goerli",
  "status":"pending",
  "hash":"0x85c0e95afb535a20603bb8e30bce952ce60475d09e6d18ccdb650523f0b8e60c",
  "from":"0xf50733d9809a268c717b3a782a2437cfea1006b9",
  "to":"0xb6cb15ef5b6f35a08fb7374664fb43989d0d5aef",
  "asset":"RICH",
  "value":"12345000000000000000000",
  "decimals":18,
  "direction":"incoming",
  "blockNumber":null,
  "contractAddress":"0x1B605E62C7d6AE9216CBf189A7588fBB9ADD4C2f",
  "contractType":"erc20"
}
```

confirmed
```json
{
  "address":"0xb6cb15ef5b6f35a08fb7374664fb43989d0d5aef",
  "system":"ethereum",
  "network":"goerli",
  "status":"confirmed",
  "hash":"0x85c0e95afb535a20603bb8e30bce952ce60475d09e6d18ccdb650523f0b8e60c",
  "from":"0xf50733d9809a268c717b3a782a2437cfea1006b9",
  "to":"0xb6cb15ef5b6f35a08fb7374664fb43989d0d5aef",
  "asset":"RICH",
  "value":"12345000000000000000000",
  "decimals":18,
  "direction":"incoming",
  "blockNumber":3166589,
  "contractAddress":"0x1B605E62C7d6AE9216CBf189A7588fBB9ADD4C2f",
  "contractType":"erc20"
}
```

其中：

* 转账数量是`value / 10^decimals`。
* erc20代币要准确对应`contractAddress`来确保没有同样Symbol的代币混进来。
* `direction`参数表示对于`address`是转入还是转出，分别为`incoming`和`outgoing`，所以可以通过`outgoing`做警告。
