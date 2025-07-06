# 天气API服务

这是一个基于Node.js的天气API服务，能够根据用户的IP地址自动获取位置信息并返回相应的天气数据。

## 功能特点

- 自动IP定位
- 实时天气信息查询
- Bearer Token认证
- Gzip压缩响应
- 详细的控制台日志记录

## 安装步骤

1. 克隆项目后，安装依赖：
```bash
npm install
```

2. 配置环境变量：
   - 创建 `.env` 文件
   - 在文件中设置你的和风天气API Key：
```env
QWEATHER_TOKEN=your_api_key_here
```

3. 启动服务：
```bash
npm start
```

## API使用说明

### 获取天气信息

```
GET /weather
```

#### 请求头
```
Authorization: Bearer <token>
```
注意：Bearer Token会在服务启动时随机生成并显示在控制台中

#### 响应示例

```json
{
  "location": {
    "city": "北京",
    "region": "北京市",
    "country": "中国",
    "lat": 39.9042,
    "lon": 116.4074
  },
  "weather": {
    "temp": "25",
    "feelsLike": "26",
    "text": "晴",
    "windDir": "东南风",
    "windScale": "3",
    "humidity": "40"
  }
}
```

## 错误处理

服务会返回适当的HTTP状态码和错误信息：

- 401: 未授权访问
- 400: IP定位失败或天气信息获取失败
- 500: 服务器内部错误

## 日志记录

服务会在控制台记录以下信息：

- API请求的IP地址和时间
- IP定位的成功/失败状态
- 天气信息获取的成功/失败状态
- 最终响应状态