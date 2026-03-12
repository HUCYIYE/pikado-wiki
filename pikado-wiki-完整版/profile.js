// 个人中心功能
let userProfile = {
    name: '皮卡堂玩家',
    bio: '这个人很懒，什么都没有留下...',
    avatar: '🎮',
    joinDate: new Date().toISOString().split('T')[0]
};

const avatarEmojis = ['🎮', '🌟', '🎨', '🎭', '🎪', '🎯', '🎲', '🎸', '🎺', '🎻', '🦄', '🌈', '⭐', '💎', '🔥'];

document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    loadUserStats();
    loadMyPosts();
    loadLikedPosts();
    initTheme();
    
    // 头像上传事件
    document.getElementById('avatarInput').addEventListener('change', handleAvatarUpload);
});

// 加载用户资料
function loadUserProfile() {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
        userProfile = JSON.parse(saved);
    }
    
    document.getElementById('userName').textContent = userProfile.name;
    document.getElementById('userBio').textContent = userProfile.bio;
    
    // 显示头像
    const avatarElement = document.getElementById('userAvatar');
    if (userProfile.avatar && userProfile.avatar.startsWith('data:image')) {
        // 自定义上传的图片
        avatarElement.innerHTML = `<img src="${userProfile.avatar}" alt="用户头像">`;
        avatarElement.style.background = 'none';
    } else {
        // 默认表情符号
        avatarElement.textContent = userProfile.avatar || '🎮';
        avatarElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
}

// 加载用户统计
function loadUserStats() {
    const categories = ['furniture', 'food', 'fish', 'house', 'event', 'crop', 'animal', 'pet', 'forest', 'npc'];
    let totalPosts = 0;
    let totalLikes = 0;
    
    categories.forEach(category => {
        const posts = getAllPosts(category);
        totalPosts += posts.length;
        posts.forEach(post => {
            totalLikes += (post.likes || 0);
        });
    });
    
    const joinDate = new Date(userProfile.joinDate);
    const today = new Date();
    const joinDays = Math.ceil((today - joinDate) / (1000 * 60 * 60 * 24));
    
    document.getElementById('totalPosts').textContent = totalPosts;
    document.getElementById('totalLikes').textContent = totalLikes;
    document.getElementById('joinDays').textContent = joinDays;
}

// 获取所有帖子
function getAllPosts(category) {
    const saved = localStorage.getItem(`wiki_posts_${category}`);
    return saved ? JSON.parse(saved) : [];
}

// 加载我的发布
function loadMyPosts() {
    const categories = ['furniture', 'food', 'fish', 'house', 'event', 'crop', 'animal', 'pet', 'forest', 'npc'];
    const myPosts = [];
    
    categories.forEach(category => {
        const posts = getAllPosts(category);
        posts.forEach(post => {
            myPosts.push({
                ...post,
                category: category
            });
        });
    });
    
    const myPostsList = document.getElementById('myPostsList');
    
    if (myPosts.length === 0) {
        myPostsList.innerHTML = '<div class="no-content">还没有发布任何内容</div>';
        return;
    }
    
    myPostsList.innerHTML = myPosts.map(post => `
        <div class="post-item">
            <div class="post-title">${post.title}</div>
            <div class="post-meta">${getCategoryName(post.category)} · ${post.timestamp} · 👍${post.likes || 0}</div>
            <div class="post-content">${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}</div>
        </div>
    `).join('');
}

// 加载点赞记录
function loadLikedPosts() {
    const likedPostsList = document.getElementById('likedPostsList');
    likedPostsList.innerHTML = '<div class="no-content">还没有点赞任何内容</div>';
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

// 标签页切换
function showTab(tabName) {
    // 隐藏所有标签页
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 移除所有按钮的active状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示选中的标签页
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
}

// 上传头像
function uploadAvatar() {
    document.getElementById('avatarInput').click();
}

// 处理头像上传
function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        // 检查文件大小（限制为2MB）
        if (file.size > 2 * 1024 * 1024) {
            alert('图片大小不能超过2MB！');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            userProfile.avatar = e.target.result;
            
            // 更新显示
            const avatarElement = document.getElementById('userAvatar');
            avatarElement.innerHTML = `<img src="${userProfile.avatar}" alt="用户头像">`;
            avatarElement.style.background = 'none';
            
            // 保存到本地存储
            saveUserProfile();
            alert('头像上传成功！');
        };
        reader.readAsDataURL(file);
    } else {
        alert('请选择有效的图片文件！');
    }
}

// 编辑资料
function editProfile() {
    document.getElementById('editUserName').value = userProfile.name;
    document.getElementById('editUserBio').value = userProfile.bio;
    document.getElementById('editModal').style.display = 'block';
}

// 关闭编辑模态框
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// 保存资料
function saveProfile() {
    const newName = document.getElementById('editUserName').value.trim();
    const newBio = document.getElementById('editUserBio').value.trim();
    
    if (newName) {
        userProfile.name = newName;
        userProfile.bio = newBio || '这个人很懒，什么都没有留下...';
        
        document.getElementById('userName').textContent = userProfile.name;
        document.getElementById('userBio').textContent = userProfile.bio;
        
        saveUserProfile();
        closeEditModal();
        alert('资料保存成功！');
    } else {
        alert('请输入昵称');
    }
}

// 保存用户资料到本地存储
function saveUserProfile() {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

// 初始化主题
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
}

// 切换主题
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
}

// 更新主题按钮
function updateThemeButton(theme) {
    const button = document.getElementById('themeToggle');
    button.textContent = theme === 'light' ? '🌙 深色模式' : '☀️ 浅色模式';
}

// 导出我的数据
function exportMyData() {
    const categories = ['furniture', 'food', 'fish', 'house', 'event', 'crop', 'animal', 'pet', 'forest', 'npc'];
    const myData = {
        profile: userProfile,
        posts: {}
    };
    
    categories.forEach(category => {
        myData.posts[category] = getAllPosts(category);
    });
    
    const dataStr = JSON.stringify(myData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `我的皮卡堂数据_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    alert('数据导出成功！');
}

// 清除所有数据
function clearMyData() {
    if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
        if (confirm('再次确认：这将删除您的所有发布内容和个人资料！')) {
            // 清除所有分类的帖子
            const categories = ['furniture', 'food', 'fish', 'house', 'event', 'crop', 'animal', 'pet', 'forest', 'npc'];
            categories.forEach(category => {
                localStorage.removeItem(`wiki_posts_${category}`);
            });
            
            // 清除用户资料
            localStorage.removeItem('userProfile');
            
            // 重置为默认值
            userProfile = {
                name: '皮卡堂玩家',
                bio: '这个人很懒，什么都没有留下...',
                avatar: '🎮',
                joinDate: new Date().toISOString().split('T')[0]
            };
            
            // 刷新页面
            location.reload();
        }
    }
}

// 导入数据
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // 导入用户资料
                    if (data.profile) {
                        userProfile = data.profile;
                        localStorage.setItem('userProfile', JSON.stringify(userProfile));
                    }
                    
                    // 导入帖子数据
                    if (data.posts) {
                        Object.keys(data.posts).forEach(category => {
                            localStorage.setItem(`wiki_posts_${category}`, JSON.stringify(data.posts[category]));
                        });
                    }
                    
                    alert('数据导入成功！页面将刷新。');
                    location.reload();
                } catch (error) {
                    alert('文件格式错误，请选择正确的数据文件！');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// 生成分享码
function generateShareCode() {
    const categories = ['furniture', 'food', 'fish', 'house', 'event', 'crop', 'animal', 'pet', 'forest', 'npc'];
    const shareData = {
        profile: userProfile,
        posts: {}
    };
    
    categories.forEach(category => {
        shareData.posts[category] = getAllPosts(category);
    });
    
    const dataStr = JSON.stringify(shareData);
    const encoded = btoa(encodeURIComponent(dataStr));
    
    // 创建分享码显示窗口
    const shareCode = encoded.substring(0, 100) + '...';
    const fullCode = encoded;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>分享码已生成</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <p>复制下面的分享码发送给朋友：</p>
                <textarea readonly style="width:100%;height:100px;font-family:monospace;font-size:12px;">${fullCode}</textarea>
                <br><br>
                <button onclick="navigator.clipboard.writeText('${fullCode}').then(()=>alert('分享码已复制到剪贴板！'))" class="setting-btn">📋 复制分享码</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// 使用分享码加载数据
function loadFromShareCode() {
    const shareCode = prompt('请输入朋友分享的分享码：');
    if (shareCode && shareCode.trim()) {
        try {
            const decoded = decodeURIComponent(atob(shareCode.trim()));
            const data = JSON.parse(decoded);
            
            if (confirm('这将替换您当前的所有数据，确定要继续吗？')) {
                // 导入用户资料
                if (data.profile) {
                    userProfile = data.profile;
                    localStorage.setItem('userProfile', JSON.stringify(userProfile));
                }
                
                // 导入帖子数据
                if (data.posts) {
                    Object.keys(data.posts).forEach(category => {
                        localStorage.setItem(`wiki_posts_${category}`, JSON.stringify(data.posts[category]));
                    });
                }
                
                alert('朋友的数据加载成功！页面将刷新。');
                location.reload();
            }
        } catch (error) {
            alert('分享码格式错误，请检查后重试！');
        }
    }
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeEditModal();
    }
}