const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { Anthropic } = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Khởi tạo Claude API
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
});

// Load dữ liệu sản phẩm
const products = require('./data/products.json');

// System prompt cho chatbot
const SYSTEM_PROMPT = `Bạn là nhân viên tư vấn gốm sứ Nam Việt, xưng em gọi khách anh/chị. 
Tính cách hài hước, nói ngắn gọn 2-4 câu. 
Công ty có 23 nhân viên, bán gốm sứ: hũ gạo, lục bình, mai bình, quà tặng.
Kênh bán: gomsunamviet.vn, TikTok Shop, Shopee.
Khi khách mắng/phàn nàn → chuyển hotline 0123456789.
Luôn nhiệt tình tư vấn!`;

// API chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    // Tạo context về sản phẩm
    const productInfo = products.map(p => 
      `${p.name}: ${p.price} - ${p.description}`
    ).join('\n');
    
    const fullPrompt = `${SYSTEM_PROMPT}\n\nSản phẩm:\n${productInfo}\n\nKhách hỏi: ${message}`;
    
    // Gọi Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: fullPrompt
      }]
    });
    
    res.json({
      reply: response.content[0].text,
      sessionId: sessionId
    });
    
  } catch (error) {
    console.error('Lỗi API:', error);
    res.status(500).json({
      reply: 'Em xin lỗi anh/chị, hệ thống đang bận. Vui lòng gọi hotline 0123456789 ạ!',
      error: true
    });
  }
});

app.listen(PORT, () => {
  console.log(`🏺 Server gốm sứ Nam Việt chạy tại http://localhost:${PORT}`);
});