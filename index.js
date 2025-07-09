const express = require('express');
const cors = require('cors');
const axios = require('axios');
const compression = require('compression');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 生成随机Bearer Token
const bearerToken = crypto.randomBytes(32).toString('hex');
console.log(`Bearer Token for API authentication: ${bearerToken}`);

// 中间件
app.use(cors()); // 启用CORS
app.use(compression()); // 启用Gzip压缩
app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${bearerToken}`) {
        console.log(`[${new Date().toISOString()}] 认证失败: ${req.ip}`);
        return res.status(401).json({ error: '未授权访问' });
    }
    next();
});

// 获取客户端真实IP
function getClientIP(req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

// 主路由
app.get('/weather', async (req, res) => {
    const queryIP = req.query.ip;
    const clientIP = queryIP || getClientIP(req);
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${queryIP ? '查询IP' : '客户端IP'} ${clientIP} 请求天气信息`);

    try {
        // 步骤1: IP定位
        const ipLocationResponse = await axios.get(`http://ip-api.com/json/${clientIP}?lang=zh-CN`);
        const locationData = ipLocationResponse.data;

        if (locationData.status !== 'success') {
            console.log(`[${timestamp}] IP定位失败: ${locationData.message}`);
            return res.status(400).json({ error: 'IP定位失败', message: locationData.message });
        }

        console.log(`[${timestamp}] IP定位成功: ${locationData.city}, ${locationData.regionName}`);

        // 步骤2: 获取天气信息
        const weatherApiUrl = process.env.QWEATHER_API_URL;
        const weatherResponse = await axios.get(weatherApiUrl, {
            params: {
                location: `${locationData.lon},${locationData.lat}`
            },
            headers: {
                'X-QW-Api-Key': process.env.QWEATHER_TOKEN
            }
        });

        const weatherData = weatherResponse.data;

        if (weatherData.code !== '200') {
            console.log(`[${timestamp}] 天气信息获取失败: code ${weatherData.code}`);
            return res.status(400).json({ error: '天气信息获取失败', code: weatherData.code });
        }

        console.log(`[${timestamp}] 天气信息获取成功`);

        // 组合返回数据
        const responseData = {
            location: {
                city: locationData.city,
                region: locationData.regionName,
                country: locationData.country,
                lat: locationData.lat,
                lon: locationData.lon
            },
            weather: weatherData.now
        };

        console.log(`[${timestamp}] 成功返回天气信息`);
        res.json(responseData);

    } catch (error) {
        console.error(`[${timestamp}] 服务器错误:`, error.message);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`天气API服务器运行在 http://localhost:${port}`);
});
