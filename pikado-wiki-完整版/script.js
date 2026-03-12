// 搜索功能
function search() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim().toLowerCase();
    
    if (!query) {
        alert('请输入搜索内容');
        return;
    }
    
    // 搜索所有分类的数据
    const allData = {
        'furniture': getAllPosts('furniture'),
        'food': getAllPosts('food'),
        'fish': getAllPosts('fish'),
        'house': getAllPosts('house'),
        'event': getAllPosts('event'),
        'crop': getAllPosts('crop'),
        'animal': getAllPosts('animal'),
        'pet': getAllPosts('pet'),
        'forest': getAllPosts('forest'),
        'npc': getAllPosts('npc')
    };
    
    let results = [];
    
    // 在所有分类中搜索
    Object.keys(allData).forEach(category => {
        const posts = allData[category];
        posts.forEach(post => {
            if (post.title.toLowerCase().includes(query) || 
                post.content.toLowerCase().includes(query)) {
                results.push({
                    ...post,
                    category: category
                });
            }
        });
    });
    
    showSearchResults(results, query);
}

// 获取指定分类的所有帖子
function getAllPosts(category) {
    const saved = localStorage.getItem(`wiki_posts_${category}`);
    return saved ? JSON.parse(saved) : [];
}

// 显示搜索结果
function showSearchResults(results, query) {
    if (results.length === 0) {
        alert(`没有找到包含"${query}"的内容`);
        return;
    }
    
    // 创建搜索结果页面
    const resultHtml = `
        <div class="search-results-overlay" onclick="closeSearchResults()">
            <div class="search-results-modal" onclick="event.stopPropagation()">
                <div class="search-header">
                    <h3>搜索结果 (${results.length}条)</h3>
                    <button onclick="closeSearchResults()">&times;</button>
                </div>
                <div class="search-results-list">
                    ${results.map(result => `
                        <div class="search-result-item" onclick="goToCategory('${result.category}')">
                            <div class="result-category">${getCategoryName(result.category)}</div>
                            <div class="result-title">${result.title}</div>
                            <div class="result-content">${result.content.substring(0, 100)}...</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', resultHtml);
}

// 关闭搜索结果
function closeSearchResults() {
    const overlay = document.querySelector('.search-results-overlay');
    if (overlay) overlay.remove();
}

// 跳转到分类页面
function goToCategory(category) {
    window.open(`pages/wiki-template.html?type=${category}`, '_blank');
    closeSearchResults();
}

// 获取分类中文名
function getCategoryName(category) {
    const names = {
        'furniture': '家具大全',
        'food': '食物大全',
        'fish': '鱼类大全',
        'house': '房型大全',
        'event': '活动大全',
        'crop': '农作物大全',
        'animal': '动物大全',
        'pet': '宠物大全',
        'forest': '森林大全',
        'npc': 'NPC大全'
    };
    return names[category] || category;
}

// 清除缓存功能
function clearCache() {
    localStorage.clear();
    location.reload();
}

// 通用拖拽功能
function setupDrag(element, storageKey) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    element.appendChild(input);
    
    // 对于卡片，只在图片区域添加点击事件
    const targetElement = element.classList.contains('content-card') ? 
        element.querySelector('.card-image-container') : element;
    
    targetElement.addEventListener('click', (e) => {
        // 如果点击的是链接或链接内的元素，不阻止默认行为
        if (e.target.tagName === 'A' || e.target.closest('a')) {
            return;
        }
        if (!e.target.closest('.search-box') && !e.target.closest('.card-content')) {
            e.preventDefault();
            input.click();
        }
    });
    
    input.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const imageData = event.target.result;
                if (element.id === 'heroSection') {
                    element.style.backgroundImage = `linear-gradient(rgba(102, 126, 234, 0.6), rgba(118, 75, 162, 0.6)), url('${imageData}')`;
                } else if (element.classList.contains('content-card')) {
                    const imageContainer = element.querySelector('.card-image-container');
                    imageContainer.style.backgroundImage = `url('${imageData}')`;
                    const img = imageContainer.querySelector('img');
                    if (img) img.style.display = 'none';
                } else {
                    element.style.backgroundImage = `url('${imageData}')`;
                }
                element.style.backgroundSize = 'cover';
                element.style.backgroundPosition = 'center';
                localStorage.setItem(storageKey, imageData);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        targetElement.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });
    
    targetElement.addEventListener('drop', (e) => {
        if (e.dataTransfer.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const imageData = event.target.result;
                if (element.id === 'heroSection') {
                    element.style.backgroundImage = `linear-gradient(rgba(102, 126, 234, 0.6), rgba(118, 75, 162, 0.6)), url('${imageData}')`;
                } else if (element.classList.contains('content-card')) {
                    const imageContainer = element.querySelector('.card-image-container');
                    imageContainer.style.backgroundImage = `url('${imageData}')`;
                    const img = imageContainer.querySelector('img');
                    if (img) img.style.display = 'none';
                } else {
                    element.style.backgroundImage = `url('${imageData}')`;
                }
                element.style.backgroundSize = 'cover';
                element.style.backgroundPosition = 'center';
                localStorage.setItem(storageKey, imageData);
            };
            reader.readAsDataURL(e.dataTransfer.files[0]);
        }
    });
}

function loadBackgrounds() {
    const hero = document.getElementById('heroSection');
    const saved = localStorage.getItem('hero');
    if (saved) {
        hero.style.backgroundImage = `linear-gradient(rgba(102, 126, 234, 0.6), rgba(118, 75, 162, 0.6)), url('${saved}')`;
        hero.style.backgroundSize = 'cover';
        hero.style.backgroundPosition = 'center';
    }
    
    document.querySelectorAll('.content-card').forEach((card, i) => {
        const saved = localStorage.getItem(`card-${i}`);
        console.log(`加载 card-${i}:`, saved ? '有背景' : '无背景');
        if (saved) {
            const imageContainer = card.querySelector('.card-image-container');
            imageContainer.style.backgroundImage = `url('${saved}')`;
            imageContainer.style.backgroundSize = 'cover';
            imageContainer.style.backgroundPosition = 'center';
            const img = imageContainer.querySelector('img');
            if (img) img.style.display = 'none';
        }
    });
    
    document.querySelectorAll('.sidebar-section').forEach((section, i) => {
        const saved = localStorage.getItem(`sidebar-${i}`);
        console.log(`加载 sidebar-${i}:`, saved ? '有背景' : '无背景');
        if (saved) {
            section.style.backgroundImage = `url('${saved}')`;
            section.style.backgroundSize = 'cover';
            section.style.backgroundPosition = 'center';
            const img = section.querySelector('img');
            if (img) {
                img.style.display = 'none';
                console.log(`隐藏了 sidebar-${i} 的图片`);
            }
        }
    });
}

// 回车键搜索
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    
    // 设置拖拽功能
    setupDrag(document.getElementById('heroSection'), 'hero');
    
    document.querySelectorAll('.content-card').forEach((card, i) => {
        setupDrag(card, `card-${i}`);
    });
    
    document.querySelectorAll('.sidebar-section').forEach((section, i) => {
        // 跳过包含链接的区域（更新公告和园游会）
        if (!section.querySelector('a')) {
            setupDrag(section, `sidebar-${i}`);
        }
    });
    
    loadBackgrounds();
    
    // 初始化新功能
    initTheme();
    loadHotRanking();
    loadStats();
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            search();
        }
    });
    
    // 深色模式切换
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // 数据导出
    document.getElementById('exportData').addEventListener('click', exportAllData);
    
    // 平滑滚动导航
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // 如果是外部链接或页面链接，不阻止默认行为
            if (href.includes('.html') || href.startsWith('http')) {
                return;
            }
            
            // 只对锚点链接进行平滑滚动
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href;
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});

// NPC数据示例
const npcs = [
    {
        id: 1,
        name: "小美",
        location: "商店街",
        role: "商店店主",
        description: "友善的商店店主，出售各种物品"
    },
    {
        id: 2,
        name: "老爷爷",
        location: "村庄入口",
        role: "任务发布者",
        description: "智慧的老人，经常发布有趣的任务"
    }
];

// 农作物数据示例
const crops = [
    {
        id: 1,
        name: "草莓",
        season: "春季",
        growTime: "4天",
        description: "香甜的红色草莓，可以做蛋糕"
    },
    {
        id: 2,
        name: "玉米",
        season: "夏季",
        growTime: "14天",
        description: "金黄的玉米，营养丰富"
    }
];

// 动物数据示例
const animals = [
    {
        id: 1,
        name: "奶牛",
        type: "家畜",
        product: "牛奶",
        description: "可爱的奶牛，每天产奶"
    },
    {
        id: 2,
        name: "小鸡",
        type: "家禽",
        product: "鸡蛋",
        description: "活泼的小鸡，定期产蛋"
    }
];

// 宠物数据示例
const pets = [
    {
        id: 1,
        name: "小狗",
        type: "伴侣动物",
        skill: "寻找物品",
        description: "忠诚的小狗，能帮你找到隐藏物品"
    },
    {
        id: 2,
        name: "小猫",
        type: "伴侣动物",
        skill: "驱除害虫",
        description: "灵活的小猫，保护作物不受害虫侵害"
    }
];

// 森林数据示例
const forests = [
    {
        id: 1,
        name: "神秘森林",
        area: "北部山区",
        resources: ["木材", "草药", "蘑菇"],
        description: "充满神秘色彩的森林，蕴藏着珍贵资源"
    },
    {
        id: 2,
        name: "竹林小径",
        area: "东部平原",
        resources: ["竹子", "竹笋"],
        description: "宁静的竹林，适合采集竹材"
    }
];

// 鱼类数据示例
const fish = [
    {
        id: 1,
        name: "小丑鱼",
        location: "湖泊",
        rarity: "普通",
        description: "常见的小鱼，适合新手钓鱼"
    },
    {
        id: 2,
        name: "彩虹鱼",
        location: "河流",
        rarity: "稀有",
        description: "美丽的彩虹色鱼类"
    }
];

// 房型数据示例
const houses = [
    {
        id: 1,
        name: "温馨小屋",
        style: "田园风",
        rooms: 3,
        description: "温馨的小房子，适合新手居住"
    },
    {
        id: 2,
        name: "豪华别墅",
        style: "现代风",
        rooms: 8,
        description: "豪华的大别墅，空间宽敞"
    }
];

// 活动数据示例
const events = [
    {
        id: 1,
        name: "春节庆典",
        type: "节日活动",
        duration: "2026.2.1 - 2026.2.15",
        description: "春节特别活动，丰富奖励等你来拿"
    },
    {
        id: 2,
        name: "时装周",
        type: "购物活动",
        duration: "每周五更新",
        description: "最新时装限时优惠"
    }
];

// 衣服数据示例
const clothes = [
    {
        id: 1,
        name: "可爱连衣裙",
        type: "连衣裙",
        description: "粉色的可爱连衣裙",
        image: "images/dress1.jpg"
    },
    {
        id: 2,
        name: "休闲T恤",
        type: "上衣",
        description: "舒适的休闲T恤",
        image: "images/tshirt1.jpg"
    }
];

// 家具数据示例
const furniture = [
    {
        id: 1,
        name: "可爱小床",
        category: "卧室",
        rarity: "普通",
        description: "舒适的小床，适合休息"
    },
    {
        id: 2,
        name: "彩虹沙发",
        category: "客厅",
        rarity: "稀有",
        description: "美丽的彩虹色沙发"
    }
];

// 食物数据示例
const food = [
    {
        id: 1,
        name: "草莓蛋糕",
        category: "甜品",
        ingredients: ["草莓", "面粉", "鸡蛋"],
        description: "香甜美味的草莓蛋糕"
    },
    {
        id: 2,
        name: "巧克力饼干",
        category: "饼干",
        ingredients: ["巧克力", "面粉", "黄油"],
        description: "香脆可口的巧克力饼干"
    }
];

// 动态加载内容的函数
// 动态加载内容的函数
function loadNPCs() {
    // 未来实现NPC页面的动态加载
}

function loadCrops() {
    // 未来实现农作物页面的动态加载
}

function loadAnimals() {
    // 未来实现动物页面的动态加载
}

function loadPets() {
    // 未来实现宠物页面的动态加载
}

function loadForests() {
    // 未来实现森林页面的动态加载
}

function loadFish() {
    // 未来实现鱼类页面的动态加载
}

function loadHouses() {
    // 未来实现房型页面的动态加载
}

function loadEvents() {
    // 未来实现活动页面的动态加载
}

function loadClothes() {
    // 未来实现衣服页面的动态加载
}

function loadFurniture() {
    // 未来实现家具页面的动态加载
}

function loadFood() {
    // 未来实现食物页面的动态加载
}

// 热门排行榜功能
function loadHotRanking() {
    const hotRanking = document.getElementById('hotRanking');
    if (!hotRanking) return;
    
    // 获取所有分类的数据
    const allPosts = [];
    const categories = ['furniture', 'food', 'fish', 'house', 'event', 'crop', 'animal', 'pet', 'forest', 'npc'];
    
    categories.forEach(category => {
        const posts = getAllPosts(category);
        posts.forEach(post => {
            allPosts.push({
                ...post,
                category: category,
                score: (post.likes || 0) - (post.dislikes || 0)
            });
        });
    });
    
    // 按评分排序，取前5名
    const topPosts = allPosts.sort((a, b) => b.score - a.score).slice(0, 5);
    
    if (topPosts.length === 0) {
        hotRanking.innerHTML = '<div class="no-data">暂无数据</div>';
        return;
    }
    
    hotRanking.innerHTML = topPosts.map((post, index) => `
        <div class="hot-item" onclick="goToCategory('${post.category}')">
            <span class="rank">${index + 1}</span>
            <div class="hot-content">
                <div class="hot-title">${post.title}</div>
                <div class="hot-meta">${getCategoryName(post.category)} · 👍${post.likes || 0}</div>
            </div>
        </div>
    `).join('');
}

// 统计信息功能
function loadStats() {
    const statsPanel = document.getElementById('statsPanel');
    if (!statsPanel) return;
    
    const categories = ['furniture', 'food', 'fish', 'house', 'event', 'crop', 'animal', 'pet', 'forest', 'npc'];
    let totalPosts = 0;
    let totalLikes = 0;
    let mostPopularCategory = '';
    let maxCategoryPosts = 0;
    
    categories.forEach(category => {
        const posts = getAllPosts(category);
        const categoryPosts = posts.length;
        totalPosts += categoryPosts;
        
        posts.forEach(post => {
            totalLikes += (post.likes || 0);
        });
        
        if (categoryPosts > maxCategoryPosts) {
            maxCategoryPosts = categoryPosts;
            mostPopularCategory = category;
        }
    });
    
    statsPanel.innerHTML = `
        <div class="stat-item">
            <div class="stat-number">${totalPosts}</div>
            <div class="stat-label">总内容数</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${totalLikes}</div>
            <div class="stat-label">总点赞数</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">最热门分类</div>
            <div class="stat-category">${mostPopularCategory ? getCategoryName(mostPopularCategory) : '暂无'}</div>
        </div>
    `;
}

// 深色模式功能
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
    const button = document.getElementById('themeToggle');
    button.textContent = theme === 'light' ? '🌙' : '☀️';
}

// 数据导出功能
function exportAllData() {
    const categories = ['furniture', 'food', 'fish', 'house', 'event', 'crop', 'animal', 'pet', 'forest', 'npc'];
    const allData = {};
    
    categories.forEach(category => {
        allData[category] = getAllPosts(category);
    });
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `皮卡堂维基数据_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    alert('数据导出成功！');
}