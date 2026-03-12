// 维基页面功能
let isAddingPost = false;
let postImages = [];
let posts = [];

document.addEventListener('DOMContentLoaded', function() {
    // 从URL参数获取页面类型
    const urlParams = new URLSearchParams(window.location.search);
    const pageType = urlParams.get('type') || 'default';
    
    // 设置页面标题
    setPageTitle(pageType);
    
    // 加载已保存的内容
    loadPosts(pageType);
    
    // 图片上传处理
    const postImageInput = document.getElementById('postImageInput');
    const postDropZone = document.getElementById('postDropZone');
    
    postImageInput.addEventListener('change', handlePostImageUpload);
    
    // 设置拖拽功能
    setupDragAndDrop(postDropZone, postImageInput);
});

// 设置页面标题
function setPageTitle(type) {
    const titles = {
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
    
    const title = titles[type] || '维基页面';
    document.getElementById('pageTitle').textContent = title + ' - 皮卡堂维基百科';
    document.getElementById('wikiTitle').textContent = title;
}

// 设置拖拽功能
function setupDragAndDrop(dropZone, fileInput) {
    // 点击事件
    dropZone.addEventListener('click', () => fileInput.click());
    
    // 防止默认拖拽行为
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    // 高亮拖拽区域
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    // 处理文件拖放
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
        handlePostImageSelection(files);
    }
}

// 切换发布新内容模式
function toggleAddPost() {
    isAddingPost = !isAddingPost;
    
    const addPostMode = document.getElementById('addPostMode');
    const addBtn = document.querySelector('.add-btn');
    
    if (isAddingPost) {
        addPostMode.style.display = 'block';
        addBtn.textContent = '❌ 取消发布';
    } else {
        addPostMode.style.display = 'none';
        addBtn.textContent = '➕ 发布新内容';
        clearPostForm();
    }
}

// 处理图片上传
function handlePostImageUpload(event) {
    const files = event.target.files;
    handlePostImageSelection(files);
}

// 处理图片选择（统一处理上传和拖拽）
function handlePostImageSelection(files) {
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageData = {
                    src: e.target.result,
                    name: file.name
                };
                postImages.push(imageData);
                displayPostImagePreview();
            };
            reader.readAsDataURL(file);
        }
    });
}

// 显示图片预览
function displayPostImagePreview() {
    const preview = document.getElementById('postImagePreview');
    preview.innerHTML = '';
    
    postImages.forEach((image, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.innerHTML = `
            <img src="${image.src}" alt="${image.name}">
            <button class="remove-btn" onclick="removePostImage(${index})">×</button>
        `;
        preview.appendChild(previewItem);
    });
}

// 移除图片
function removePostImage(index) {
    postImages.splice(index, 1);
    displayPostImagePreview();
}

// 发布新内容
function publishPost() {
    const titleInput = document.getElementById('postTitleInput');
    const contentInput = document.getElementById('postContentInput');
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!title && !content) {
        alert('请输入标题或内容');
        return;
    }
    
    // 创建新的帖子对象
    const newPost = {
        id: Date.now(),
        title: title || '无标题',
        content: content,
        images: [...postImages],
        timestamp: new Date().toLocaleString('zh-CN'),
        likes: 0,
        dislikes: 0,
        userVote: null // null, 'like', 'dislike'
    };
    
    // 添加到帖子列表
    posts.unshift(newPost);
    
    // 保存到本地存储
    const urlParams = new URLSearchParams(window.location.search);
    const pageType = urlParams.get('type') || 'default';
    localStorage.setItem(`wiki_posts_${pageType}`, JSON.stringify(posts));
    
    // 刷新显示
    displayPosts();
    
    // 清空表单并退出编辑模式
    clearPostForm();
    toggleAddPost();
    
    alert('内容发布成功！');
}

// 取消发布
function cancelAddPost() {
    clearPostForm();
    toggleAddPost();
}

// 清空发布表单
function clearPostForm() {
    document.getElementById('postTitleInput').value = '';
    document.getElementById('postContentInput').value = '';
    postImages = [];
    displayPostImagePreview();
}

// 显示所有帖子
function displayPosts() {
    const container = document.getElementById('postsContainer');
    
    if (posts.length === 0) {
        container.innerHTML = '<p class="no-posts">还没有内容，点击上方按钮发布第一条内容吧！</p>';
        return;
    }
    
    container.innerHTML = '';
    
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-item';
        
        let imagesHtml = '';
        if (post.images && post.images.length > 0) {
            imagesHtml = '<div class="post-images">';
            post.images.forEach((image, index) => {
                const safeTitle = post.title.replace(/'/g, '&apos;');
                const safeContent = post.content.replace(/'/g, '&apos;').replace(/\n/g, '\\n');
                const safeName = image.name.replace(/'/g, '&apos;');
                imagesHtml += `<img src="${image.src}" alt="${safeName}" class="post-image" onclick="openDetailModal('${safeTitle}', '${safeContent}', '${image.src}', '${safeName}')">`;
            });
            imagesHtml += '</div>';
        }
        
        postElement.innerHTML = `
            <div class="post-header">
                <h3 class="post-title">${post.title}</h3>
                <div class="post-actions">
                    <span class="post-time">${post.timestamp}</span>
                    <button class="delete-btn" onclick="deletePost(${post.id})">🗑️</button>
                </div>
            </div>
            <div class="post-body">
                <div class="post-left">
                    ${imagesHtml}
                </div>
                <div class="post-right">
                    <div class="post-content">${post.content.replace(/\n/g, '<br>')}</div>
                </div>
            </div>
            <div class="post-rating">
                <button class="like-btn ${post.userVote === 'like' ? 'active' : ''}" onclick="votePost(${post.id}, 'like')">
                    👍 ${post.likes || 0}
                </button>
                <button class="dislike-btn ${post.userVote === 'dislike' ? 'active' : ''}" onclick="votePost(${post.id}, 'dislike')">
                    👎 ${post.dislikes || 0}
                </button>
            </div>
        `;
        
        container.appendChild(postElement);
    });
}

// 删除帖子
function deletePost(postId) {
    if (confirm('确定要删除这条内容吗？')) {
        posts = posts.filter(post => post.id !== postId);
        
        // 更新本地存储
        const urlParams = new URLSearchParams(window.location.search);
        const pageType = urlParams.get('type') || 'default';
        localStorage.setItem(`wiki_posts_${pageType}`, JSON.stringify(posts));
        
        // 刷新显示
        displayPosts();
    }
}

// 加载已保存的帖子
function loadPosts(pageType) {
    const saved = localStorage.getItem(`wiki_posts_${pageType}`);
    if (saved) {
        posts = JSON.parse(saved);
        displayPosts();
    }
}

// 打开详情模态框
function openDetailModal(title, content, imageSrc, imageAlt) {
    const modal = document.getElementById('detailModal') || createDetailModal();
    const modalTitle = modal.querySelector('.modal-title');
    const modalImage = modal.querySelector('.modal-image');
    const modalDescription = modal.querySelector('.modal-description');
    
    modalTitle.textContent = title;
    modalImage.src = imageSrc;
    modalImage.alt = imageAlt;
    modalDescription.innerHTML = content.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
    modal.style.display = 'block';
}

// 创建详情模态框
function createDetailModal() {
    const modal = document.createElement('div');
    modal.id = 'detailModal';
    modal.className = 'detail-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title"></h3>
                <button class="close-modal" onclick="closeDetailModal()">&times;</button>
            </div>
            <img class="modal-image" src="" alt="">
            <div class="modal-description"></div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 点击模态框背景关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeDetailModal();
        }
    });
    
    return modal;
}

// 关闭详情模态框
function closeDetailModal() {
    const modal = document.getElementById('detailModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 点赞/点踩功能
function votePost(postId, voteType) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    // 如果用户之前没有投票
    if (!post.userVote) {
        if (voteType === 'like') {
            post.likes = (post.likes || 0) + 1;
            post.userVote = 'like';
        } else {
            post.dislikes = (post.dislikes || 0) + 1;
            post.userVote = 'dislike';
        }
    }
    // 如果用户点击相同的按钮，取消投票
    else if (post.userVote === voteType) {
        if (voteType === 'like') {
            post.likes = Math.max(0, (post.likes || 0) - 1);
        } else {
            post.dislikes = Math.max(0, (post.dislikes || 0) - 1);
        }
        post.userVote = null;
    }
    // 如果用户改变投票
    else {
        if (post.userVote === 'like') {
            post.likes = Math.max(0, (post.likes || 0) - 1);
            post.dislikes = (post.dislikes || 0) + 1;
        } else {
            post.dislikes = Math.max(0, (post.dislikes || 0) - 1);
            post.likes = (post.likes || 0) + 1;
        }
        post.userVote = voteType;
    }
    
    // 保存到本地存储
    const urlParams = new URLSearchParams(window.location.search);
    const pageType = urlParams.get('type') || 'default';
    localStorage.setItem(`wiki_posts_${pageType}`, JSON.stringify(posts));
    
    // 刷新显示
    displayPosts();
}