/**
 * 三江源动物性格测试 - JavaScript 逻辑 (大五人格 OCEAN -> 16种动物映射)
 */

// ========================================
// 触摸优化 - 触觉反馈 - 性能优化
// ========================================

function triggerHapticFeedback(type = 'light') {
    if (!navigator.vibrate) return;

    const patterns = {
        light: 10,
        medium: 20,
        heavy: 30,
        success: [10, 30, 10],
        error: [50, 30, 50]
    };

    const pattern = patterns[type] || patterns.light;
    navigator.vibrate(pattern);
}

function setTouchState(element, isTouching) {
    if (!element) return;

    if (isTouching) {
        element.classList.add('touching');
    } else {
        element.classList.remove('touching');
    }
}

// 性能优化：使用事件委托替代多个单独监听器
function addTouchListeners(selector) {
    document.querySelectorAll(selector).forEach(element => {
        element.addEventListener('touchstart', (e) => {
            setTouchState(e.currentTarget, true);
            triggerHapticFeedback('light');
        }, { passive: true });

        element.addEventListener('touchend', (e) => {
            setTouchState(e.currentTarget, false);
        }, { passive: true });

        element.addEventListener('touchcancel', (e) => {
            setTouchState(e.currentTarget, false);
        }, { passive: true });

        element.addEventListener('mousedown', (e) => {
            setTouchState(e.currentTarget, true);
        });

        element.addEventListener('mouseup', (e) => {
            setTouchState(e.currentTarget, false);
        });

        element.addEventListener('mouseleave', (e) => {
            setTouchState(e.currentTarget, false);
        });
    });
}

// 性能优化：事件委托用于选项点击
function setupOptionDelegation() {
    optionsContainer.addEventListener('click', (e) => {
        const optionEl = e.target.closest('.option');
        if (optionEl && optionsContainer.contains(optionEl)) {
            const index = parseInt(optionEl.dataset.index);
            if (!isNaN(index)) {
                selectOption(index);
            }
        }
    });

    optionsContainer.addEventListener('touchstart', (e) => {
        const optionEl = e.target.closest('.option');
        if (optionEl && optionsContainer.contains(optionEl)) {
            setTouchState(optionEl, true);
            triggerHapticFeedback('light');
        }
    }, { passive: true });

    optionsContainer.addEventListener('touchend', (e) => {
        const optionEl = e.target.closest('.option');
        if (optionEl && optionsContainer.contains(optionEl)) {
            setTouchState(optionEl, false);
        }
    }, { passive: true });

    optionsContainer.addEventListener('touchcancel', (e) => {
        const optionEl = e.target.closest('.option');
        if (optionEl && optionsContainer.contains(optionEl)) {
            setTouchState(optionEl, false);
        }
    }, { passive: true });
}

// ========================================
// 全局变量
// ========================================

let currentQuestion = 0;
let answers = []; // 存储每道题的选项索引
let results = {}; // OCEAN得分

// DOM 元素缓存
let optionsContainer, progressBar, progressText, prevBtn, nextBtn, questionText, questionCard;

// ========================================
// 初始化
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    optionsContainer = document.getElementById('options');
    progressBar = document.getElementById('progress');
    progressText = document.getElementById('progressText');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    questionText = document.getElementById('questionText');
    questionCard = document.getElementById('questionCard');

    showPage('home');

    setupLazyLoading();
    setupOptionDelegation();

    addTouchListeners('.btn-primary');
    addTouchListeners('.btn-secondary');

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
});

// ========================================
// 页面导航
// ========================================

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function startTest() {
    currentQuestion = 0;
    answers = new Array(questions.length).fill(-1);
    results = {};
    showPage('test');
    renderQuestion();
    triggerHapticFeedback('success');
}

function restartTest() {
    startTest();
}

// ========================================
// 题目渲染
// ========================================

function renderQuestion() {
    const q = questions[currentQuestion];

    requestAnimationFrame(() => {
        questionText.textContent = q.text;

        const fragment = document.createDocumentFragment();

        q.options.forEach((option, index) => {
            const optionEl = document.createElement('div');
            optionEl.className = 'option';
            if (answers[currentQuestion] === index) {
                optionEl.classList.add('selected');
            }
            optionEl.dataset.index = index;

            optionEl.innerHTML = `
                <span class="option-text">${option.text}</span>
            `;

            fragment.appendChild(optionEl);
        });

        optionsContainer.innerHTML = '';
        optionsContainer.appendChild(fragment);

        const progressPercent = ((currentQuestion + 1) / questions.length) * 100;
        progressBar.style.width = `${progressPercent}%`;
        progressText.textContent = `第 ${currentQuestion + 1} 题 / 共 ${questions.length} 题`;

        prevBtn.disabled = currentQuestion === 0;
        nextBtn.disabled = answers[currentQuestion] === -1;

        if (currentQuestion === questions.length - 1 && answers[currentQuestion] !== -1) {
            nextBtn.textContent = '查看结果 →';
        } else {
            nextBtn.textContent = '下一题 →';
        }

        questionCard.classList.remove('fade-in');
        void questionCard.offsetWidth; // 触发重排
        questionCard.classList.add('fade-in');
    });
}

// ========================================
// 选项选择与导航
// ========================================

function selectOption(index) {
    answers[currentQuestion] = index;

    optionsContainer.querySelectorAll('.option').forEach((opt, i) => {
        opt.classList.toggle('selected', i === index);
    });

    nextBtn.disabled = false;

    if (currentQuestion === questions.length - 1) {
        nextBtn.textContent = '查看结果 →';
    }

    triggerHapticFeedback('light');
}

function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        renderQuestion();
    } else if (currentQuestion === questions.length - 1 && answers[currentQuestion] !== -1) {
        calculateResults();
        showResult();
    }
}

function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        renderQuestion();
    }
}

// ========================================
// 结果计算函数 (大五人格 -> 16动物)
// ========================================

function calculateResults() {
    // 初始得分为0
    const scores = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    
    // 可能的最小最大得分，用于归一化雷达图
    const minMax = {
        O: { min: 0, max: 0 },
        C: { min: 0, max: 0 },
        E: { min: 0, max: 0 },
        A: { min: 0, max: 0 },
        N: { min: 0, max: 0 }
    };

    // 计算实际得分和理论极值
    for (let i = 0; i < answers.length; i++) {
        const q = questions[i];
        const selectedScores = q.options[answers[i]].scores;
        
        let localMin = {O: Infinity, C: Infinity, E: Infinity, A: Infinity, N: Infinity};
        let localMax = {O: -Infinity, C: -Infinity, E: -Infinity, A: -Infinity, N: -Infinity};

        q.options.forEach(opt => {
            const dims = ['O', 'C', 'E', 'A', 'N'];
            dims.forEach(dim => {
                const val = opt.scores[dim] || 0;
                if(val < localMin[dim]) localMin[dim] = val;
                if(val > localMax[dim]) localMax[dim] = val;
            });
        });

        for(const dim in scores) {
            scores[dim] += selectedScores[dim] || 0;
            minMax[dim].min += localMin[dim];
            minMax[dim].max += localMax[dim];
        }
    }

    // 映射到 MBTI 字母以复用16种动物
    // E > 0 => E, 否则 I
    // O > 0 => N (直觉), 否则 S (感觉)
    // A > 0 => F (情感), 否则 T (思考)
    // C > 0 => J (判断), 否则 P (感知)
    
    const mbtiType = [
        scores.E >= 0 ? 'E' : 'I',
        scores.O >= 0 ? 'N' : 'S',
        scores.A >= 0 ? 'F' : 'T',
        scores.C >= 0 ? 'J' : 'P'
    ].join('');

    results = {
        scores: scores,
        minMax: minMax,
        mbti: mbtiType
    };
}

// ========================================
// 结果展示函数
// ========================================

function determineAnimal() {
    const mbti = results.mbti;

    const mbtiToAnimal = {
        'INTJ': 'snowLeopard',
        'INFP': 'tibetanAntelope',
        'ISTJ': 'yak',
        'ESFJ': 'kiang',
        'ISFP': 'whiteLippedDeer',
        'ISTP': 'muskDeer',
        'INFJ': 'blackNeckedCrane',
        'ESTJ': 'marmot',
        'ENTP': 'greyJay',
        'INTP': 'lynx',
        'ENFJ': 'blueSheep',
        'ISFJ': 'bharal',
        'ENTJ': 'goldenEagle',
        'ENFP': 'barHeadedGoose',
        'ESFP': 'plateauHare',
        'ESTP': 'tibetanFox'
    };

    const animalKey = mbtiToAnimal[mbti] || 'snowLeopard';
    return animals[animalKey];
}

function showResult() {
    showPage('result');
    const animal = determineAnimal();

    requestAnimationFrame(() => {
        const avatarEl = document.getElementById('animalAvatar');
        avatarEl.textContent = animal.emoji;
        avatarEl.className = \`animal-avatar \${animal.colorClass}\`;

        document.getElementById('animalName').textContent = animal.name;
        document.getElementById('animalTagline').textContent = animal.tagline;
        // 显示OCEAN对应出的类型组合
        document.getElementById('animalType').textContent = animal.mbti;
        
        document.getElementById('resultDescription').textContent = animal.description;
        document.getElementById('animalStrategy').textContent = animal.strategy;
        document.getElementById('animalBackground').textContent = animal.background;
        document.getElementById('matchText').textContent = \`最佳伙伴：\${animal.match}\`;
        document.getElementById('tipsText').textContent = animal.tips;

        const imgEl = document.getElementById('animalImage');
        if (imgEl && animal.image) {
            imgEl.src = animal.image;
            imgEl.alt = animal.name;
            imgEl.style.display = 'block';
        }

        const traitsContainer = document.getElementById('traits');
        const fragment = document.createDocumentFragment();

        animal.traits.forEach(trait => {
            const traitEl = document.createElement('span');
            traitEl.className = 'trait-tag';
            traitEl.textContent = trait;
            fragment.appendChild(traitEl);
        });

        // 加上一个N维度的描述
        const nTag = document.createElement('span');
        nTag.className = 'trait-tag';
        nTag.textContent = results.scores.N > 0 ? '高敏感' : '情绪稳定';
        fragment.appendChild(nTag);

        traitsContainer.innerHTML = '';
        traitsContainer.appendChild(fragment);

        document.querySelector('.radar-labels').style.display = 'block';
        drawOceanRadarChart();
    });

    triggerHapticFeedback('success');
}

// ========================================
// OCEAN 雷达图绘制 (五边形)
// ========================================

function setupCanvas(canvas) {
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth;
    const displaySize = Math.min(containerWidth, 400);
    const dpr = window.devicePixelRatio || 1;

    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;
    canvas.style.width = \`\${displaySize}px\`;
    canvas.style.height = \`\${displaySize}px\`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const centerX = displaySize / 2;
    const centerY = displaySize / 2;
    const padding = displaySize * 0.15;
    const radius = (displaySize / 2) - padding;

    return { ctx, canvas, centerX, centerY, radius, displaySize, dpr };
}

function drawOceanRadarChart() {
    const canvas = document.getElementById('radarChart');
    if (!canvas) return;

    requestAnimationFrame(() => {
        const { ctx, centerX, centerY, radius } = setupCanvas(canvas);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawOceanGrid(ctx, centerX, centerY, radius);
        const data = calculateOceanRadarData();
        drawOceanData(ctx, centerX, centerY, radius, data);
    });
}

function calculateOceanRadarData() {
    const { scores, minMax } = results;
    
    // 归一化到 0.2 ~ 1.0 (避免得分太低缩在圆心不好看)
    const normalize = (val, min, max) => {
        if (max === min) return 0.5;
        const ratio = (val - min) / (max - min);
        return 0.2 + ratio * 0.8;
    };

    return [
        normalize(scores.O, minMax.O.min, minMax.O.max),
        normalize(scores.C, minMax.C.min, minMax.C.max),
        normalize(scores.E, minMax.E.min, minMax.E.max),
        normalize(scores.A, minMax.A.min, minMax.A.max),
        normalize(scores.N, minMax.N.min, minMax.N.max)
    ];
}

function drawOceanGrid(ctx, centerX, centerY, radius) {
    const sides = 5; // OCEAN 五维度
    const angleStep = (Math.PI * 2) / sides;

    const gridLineWidth = Math.max(1, radius * 0.01);
    const axisLineWidth = Math.max(1, radius * 0.015);

    // 网格线
    ctx.beginPath();
    ctx.strokeStyle = '#e8dcc4';
    ctx.lineWidth = gridLineWidth;

    for (let i = 1; i <= 5; i++) {
        for (let j = 0; j <= sides; j++) {
            const angle = j * angleStep - Math.PI / 2;
            const r = (radius * i) / 5;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;

            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
    }
    ctx.stroke();

    // 轴线
    ctx.beginPath();
    ctx.strokeStyle = '#c4a574';
    ctx.lineWidth = axisLineWidth;

    for (let i = 0; i < sides; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 标签
    ctx.fillStyle = '#5a3e28';
    ctx.font = \`\${Math.max(12, radius * 0.08)}px sans-serif\`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const labels = ['开放性(O)', '尽责性(C)', '外向性(E)', '宜人性(A)', '神经质(N)'];
    // DOM 中的 div.radar-labels 仅仅是为了保留文字或给屏幕阅读器，我们用canvas直接画出来也可以
    // 这里把 div.radar-labels 隐藏了，所以全靠canvas画
    for (let i = 0; i < sides; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * (radius + 20);
        const y = centerY + Math.sin(angle) * (radius + 20);
        
        // 微调一些边缘文字的对齐防止被截断
        if (Math.cos(angle) > 0.1) ctx.textAlign = 'left';
        else if (Math.cos(angle) < -0.1) ctx.textAlign = 'right';
        else ctx.textAlign = 'center';

        ctx.fillText(labels[i], x, y);
    }
}

function drawOceanData(ctx, centerX, centerY, radius, data) {
    const sides = 5;
    const angleStep = (Math.PI * 2) / sides;

    const dataLineWidth = Math.max(2, radius * 0.03);
    const pointRadius = Math.max(4, radius * 0.05);

    ctx.beginPath();
    ctx.fillStyle = 'rgba(45, 90, 135, 0.3)';
    ctx.strokeStyle = 'rgba(45, 90, 135, 0.8)';
    ctx.lineWidth = dataLineWidth;

    for (let i = 0; i < sides; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const value = data[i];
        const r = radius * value;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#2d5a87';
    for (let i = 0; i < sides; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const value = data[i];
        const r = radius * value;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        ctx.beginPath();
        ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ========================================
// 分享功能
// ========================================

function shareResult() {
    const animal = determineAnimal();
    const shareText = \`我是\${animal.name}！我的大五人格倾向图腾是「\${animal.tagline}」。来测试你的高原动物原型吧！\`;
    triggerHapticFeedback('success');

    if (navigator.share) {
        navigator.share({
            title: '三江源动物性格测试',
            text: shareText,
            url: window.location.href
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(shareText + ' ' + window.location.href)
            .then(() => {
                alert('结果已复制到剪贴板！');
            })
            .catch(() => {
                alert('无法复制，请手动复制结果。');
            });
    }
}

// ========================================
// 性能优化：懒加载
// ========================================

let resizeTimeout;

function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const resultPage = document.getElementById('result');
        if (resultPage && resultPage.classList.contains('active')) {
            drawOceanRadarChart();
        }
    }, 250);
}

function setupLazyLoading() {
    const homePage = document.getElementById('home');
    if (homePage) {
        homePage.setAttribute('data-loaded', 'true');
    }

    if ('IntersectionObserver' in window) {
        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    element.setAttribute('data-loaded', 'true');
                    lazyObserver.unobserve(element);
                }
            });
        }, {
            rootMargin: '50px'
        });

        document.querySelectorAll('[data-lazy="true"]').forEach(element => {
            lazyObserver.observe(element);
        });
    } else {
        document.querySelectorAll('[data-lazy="true"]').forEach(element => {
            element.setAttribute('data-loaded', 'true');
        });
    }
}
