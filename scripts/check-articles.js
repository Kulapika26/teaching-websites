const fs = require('fs');
const axios = require('axios');

// 已知文章配置
const KNOWN_ARTICLES = [
    {
        path: '/IBDSCL',
        title: '貓咪IBD跟小細胞淋巴癌',
        category: '疾病介紹',
        tags: ['貓科疾病', 'IBD', '淋巴癌', '鑑別診斷'],
        difficulty: '進階'
    },
    {
        path: '/GBWE',
        title: '犬貓膽囊水腫',
        category: '超音波診斷',
        tags: ['膽囊疾病', '水腫', '超音波'],
        difficulty: '中級'
    },
    {
        path: '/TTWBAL',
        title: 'TTW vs. BAL',
        category: '技術教學',
        tags: ['呼吸系統', '採樣技術', 'TTW', 'BAL'],
        difficulty: '進階'
    },
    {
        path: '/cah',
        title: '犬隻銅蓄積病',
        category: '疾病介紹',
        tags: ['肝臟疾病', '銅蓄積', '犬科疾病'],
        difficulty: '中級'
    },
    {
        path: '/Feline%20Triaditis',
        title: '貓咪三胰炎',
        category: '病例分析',
        tags: ['貓科疾病', '胰臟炎', '膽管炎', '複合疾病'],
        difficulty: '進階'
    },
    {
        path: '/CITB',
        title: '犬隻感染性氣管支氣管炎(CITB)與肺炎',
        category: '疾病介紹',
        tags: ['呼吸系統', '感染性疾病', '肺炎', 'CITB'],
        difficulty: '中級'
    },
    {
        path: '/cushings',
        title: '犬隻庫欣氏症互動指南',
        category: '技術教學',
        tags: ['內分泌疾病', '庫欣氏症', '診斷指南'],
        difficulty: '進階'
    },
    {
        path: '/dogflowvsparr',
        title: '犬淋巴癌 PARR vs Flow Cytometry',
        category: '技術教學',
        tags: ['淋巴癌', '分子診斷', 'PARR', '流式細胞術'],
        difficulty: '進階'
    },
    {
        path: '/catgb',
        title: '貓科膽道疾病：貓咪的隱形殺手',
        category: '疾病介紹',
        tags: ['貓科疾病', '膽道疾病', '早期診斷'],
        difficulty: '中級'
    }
];

const BASE_URL = 'https://atinsight.vet';

// 檢查文章是否存在
async function checkArticleExists(url) {
    try {
        console.log(`檢查文章: ${url}`);
        const response = await axios.head(url, {
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });
        return response.status === 200;
    } catch (error) {
        console.log(`無法檢查文章 ${url}: ${error.message}`);
        return false;
    }
}

// 生成文章描述
function generateDescription(title) {
    return `${title}的專業分析與臨床應用指南，提供實用的診斷技巧與治療建議。`;
}

// 主要更新函數
async function updateArticles() {
    console.log('🔍 開始檢查文章更新...');
    
    try {
        // 讀取現有文章數據
        let articlesData = { articles: [] };
        
        if (fs.existsSync('articles.json')) {
            const content = fs.readFileSync('articles.json', 'utf8');
            articlesData = JSON.parse(content);
            console.log(`📚 目前文章數量: ${articlesData.articles.length}`);
        } else {
            console.log('📝 articles.json 不存在，將建立新檔案');
        }

        const existingArticles = articlesData.articles || [];
        const existingUrls = existingArticles.map(article => article.url);
        
        let hasChanges = false;
        let newArticlesCount = 0;

        // 檢查每個已知文章
        for (const articleConfig of KNOWN_ARTICLES) {
            const fullUrl = `${BASE_URL}${articleConfig.path}`;
            
            if (!existingUrls.includes(fullUrl)) {
                console.log(`🔎 檢查新文章: ${articleConfig.title}`);
                
                const exists = await checkArticleExists(fullUrl);
                
                if (exists) {
                    const newArticle = {
                        id: Date.now() + Math.random(),
                        title: articleConfig.title,
                        description: generateDescription(articleConfig.title),
                        category: articleConfig.category,
                        tags: articleConfig.tags,
                        date: new Date().toISOString().split('T')[0],
                        url: fullUrl,
                        featured: newArticlesCount < 2, // 前兩篇設為精選
                        readTime: "8分鐘",
                        difficulty: articleConfig.difficulty
                    };

                    existingArticles.push(newArticle);
                    hasChanges = true;
                    newArticlesCount++;
                    console.log(`✅ 新增文章: ${articleConfig.title}`);
                } else {
                    console.log(`❌ 文章不存在: ${articleConfig.title}`);
                }
            } else {
                console.log(`✓ 文章已存在: ${articleConfig.title}`);
            }
        }

        if (hasChanges) {
            // 按日期排序（最新的在前）
            existingArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // 更新數據
            articlesData.articles = existingArticles;
            articlesData.lastUpdated = new Date().toISOString();
            
            // 寫入文件
            fs.writeFileSync('articles.json', JSON.stringify(articlesData, null, 2));
            
            console.log(`🎉 更新完成！新增了 ${newArticlesCount} 篇文章`);
            console.log(`📊 總文章數: ${existingArticles.length}`);
            
            // 輸出摘要
            console.log('\n📋 文章列表:');
            existingArticles.forEach((article, index) => {
                console.log(`${index + 1}. ${article.title} (${article.category})`);
            });
            
        } else {
            console.log('📌 沒有發現新文章');
        }

        console.log('\n✨ 檢查完成！');
        return hasChanges;

    } catch (error) {
        console.error('❌ 更新文章時發生錯誤:', error);
        process.exit(1);
    }
}

// 執行更新
if (require.main === module) {
    updateArticles();
}

module.exports = { updateArticles };
