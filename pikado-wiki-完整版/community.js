// 社区功能JavaScript

let posts = [];
let selectedImages = [];
let likedPosts = new Set(); // 记录用户已点赞的帖子

document.addEventListener('DOMContentLoaded', function() {
    const newPostForm = document.getElementById('newPostForm');
    const postImageInput = document.getElementById('postImage');
    const dropZone = document.getElementById('dropZone');
    const backToTopBtn = document.getElementById('backToTop');
    
    // 处理表单提交
    newPostForm.addEventListener('submit', function(e) {
        e.preventDefault();
        createNewPost();
    });
    
    // 处理图片选择
    postImageInput.addEventListener('change', function(e) {
        handleImageSelection(e.target.files);
    });
    
    // 拖拽功能
    setupDragAndDrop(dropZone, postImageInput);
    
    // 初始化点赞和评论功能
    initializePostActions();
    
    // 回到顶部按钮功能
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
});

// 设置拖拽功能
function setupDragAndDrop(dropZone, fileInput) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    dropZone.addEventListener('drop', handleDrop, false);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight(e) {
        dropZone.classList.add('drag-over');
    }
    
    function unhighlight(e) {
        dropZone.classList.remove('drag-over');
    }
    
    function handleDrop(e) {
        const files = e.dataTransfer.files;
        handleImageSelection(files);
    }
}

// 创建新动态
function createNewPost() {
    const postText = document.getElementById('postText').value.trim();
    const playerName = document.getElementById('playerName').value.trim() || '匿名玩家';
    
    if (!postText && selectedImages.length === 0) {
        alert('请输入文字或选择图片');
        return;
    }
    
    const newPost = {
        id: Date.now(),
        playerName: playerName,
        content: postText,
        images: [...selectedImages],
        timestamp: new Date(),
        likes: 0,
        comments: 0
    };
    
    posts.unshift(newPost);
    renderPost(newPost);
    
    // 清空表单
    document.getElementById('postText').value = '';
    document.getElementById('playerName').value = '';
    document.getElementById('postImage').value = '';
    selectedImages = [];
    clearImagePreview();
    
    alert('动态发布成功！');
}

// 处理图片选择
function handleImageSelection(files) {
    selectedImages = [];
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                selectedImages.push(e.target.result);
                showImagePreview();
            };
            reader.readAsDataURL(file);
        }
    });
}

// 显示图片预览
function showImagePreview() {
    const formGroup = document.querySelector('.form-group:has(input[type="file"])');
    
    let previewContainer = document.querySelector('.image-preview');
    if (!previewContainer) {
        previewContainer = document.createElement('div');
        previewContainer.className = 'image-preview';
        formGroup.appendChild(previewContainer);
    }
    
    previewContainer.innerHTML = '';
    
    selectedImages.forEach((imageSrc, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        
        previewItem.innerHTML = `
            <img src="${imageSrc}" alt="预览图片">
            <button type="button" class="remove-image" onclick="removeImage(${index})">×</button>
        `;
        
        previewContainer.appendChild(previewItem);
    });
}

// 移除图片
function removeImage(index) {
    selectedImages.splice(index, 1);
    showImagePreview();
}

// 清空图片预览
function clearImagePreview() {
    const previewContainer = document.querySelector('.image-preview');
    if (previewContainer) {
        previewContainer.remove();
    }
}

// 渲染新动态
function renderPost(post) {
    const postsList = document.getElementById('postsList');
    const postElement = document.createElement('div');
    postElement.className = 'post-item';
    postElement.dataset.postId = post.id;
    
    const timeAgo = getTimeAgo(post.timestamp);
    const imagesHtml = post.images.length > 0 ? 
        `<div class="post-images">
            ${post.images.map(img => `<img src="${img}" alt="用户上传图片">`).join('')}
        </div>` : '';
    
    postElement.innerHTML = `
        <div class="post-header">
            <div class="player-info">
                <div class="avatar">${getRandomEmoji()}</div>
                <div class="player-details">
                    <h4>${post.playerName}</h4>
                    <span class="post-time">${timeAgo}</span>
                </div>
            </div>
        </div>
        <div class="post-content">
            <p>${post.content}</p>
            ${imagesHtml}
        </div>
        <div class="post-actions">
            <button class="like-btn" onclick="likePost(${post.id})">❤️ ${post.likes}</button>
            <button class="comment-btn" onclick="commentPost(${post.id})">💬 ${post.comments}</button>
            <button class="share-btn" onclick="sharePost(${post.id})">🔗 分享</button>
        </div>
    `;
    
    postsList.insertBefore(postElement, postsList.firstChild);
}

// 获取随机表情符号作为头像
function getRandomEmoji() {
    const emojis = ['🎮', '🌟', '🎨', '🎭', '🎪', '🎯', '🎲', '🎸', '🎺', '🎻'];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

// 计算时间差
function getTimeAgo(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    
    const days = Math.floor(hours / 24);
    return `${days}天前`;
}

// 点赞功能（每人每帖只能点赞一次）
function likePost(postId) {
    if (likedPosts.has(postId)) {
        alert('你已经为这个帖子点过赞了！');
        return;
    }
    
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.likes++;
        likedPosts.add(postId);
        updatePostActions(postId, post);
        
        const postElement = document.querySelector(`[data-post-id="${postId}"]`);
        const likeBtn = postElement.querySelector('.like-btn');
        likeBtn.style.background = '#ffe6e6';
        likeBtn.style.color = '#ff4757';
    }
}

// 评论功能
function commentPost(postId) {
    const comment = prompt('写下你的评论：');
    if (comment && comment.trim()) {
        const post = posts.find(p => p.id === postId);
        if (post) {
            post.comments++;
            updatePostActions(postId, post);
            alert('评论发布成功！');
        }
    }
}

// 分享功能
function sharePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        const shareText = `来看看${post.playerName}在皮卡堂的精彩分享：${post.content}`;
        
        if (navigator.share) {
            navigator.share({
                title: '皮卡堂社区分享',
                text: shareText
            });
        } else {
            // 复制到剪贴板
            navigator.clipboard.writeText(shareText).then(() => {
                alert('分享内容已复制到剪贴板！');
            });
        }
    }
}

// 更新动态操作按钮
function updatePostActions(postId, post) {
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (postElement) {
        const likeBtn = postElement.querySelector('.like-btn');
        const commentBtn = postElement.querySelector('.comment-btn');
        
        likeBtn.textContent = `❤️ ${post.likes}`;
        commentBtn.textContent = `💬 ${post.comments}`;
    }
}

// 初始化现有动态的交互功能
function initializePostActions() {
    const existingPosts = document.querySelectorAll('.post-item');
    existingPosts.forEach((postElement, index) => {
        const mockPost = {
            id: `existing-${index}`,
            likes: Math.floor(Math.random() * 20),
            comments: Math.floor(Math.random() * 10)
        };
        
        posts.push(mockPost);
        postElement.dataset.postId = mockPost.id;
        
        // 更新按钮文本
        const likeBtn = postElement.querySelector('.like-btn');
        const commentBtn = postElement.querySelector('.comment-btn');
        
        if (likeBtn) likeBtn.setAttribute('onclick', `likePost('${mockPost.id}')`);
        if (commentBtn) commentBtn.setAttribute('onclick', `commentPost('${mockPost.id}')`);
    });
}

// 回到顶部功能
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}