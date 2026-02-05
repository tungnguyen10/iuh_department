/**
 * Major Quiz Component
 * Interactive quiz để giúp user tìm ngành phù hợp
 * 
 * Features:
 * - Load questions từ JSON
 * - Dynamic rendering
 * - Scoring system dựa trên JSON config
 * - Easy to add/remove questions
 * - Configurable scoring rules
 */

/**
 * Initialize Major Quiz component
 * @param {string} containerId - ID của container element
 * @param {string} dataUrl - URL của quiz data JSON
 * @returns {object} - Quiz instance với public methods
 */
export function initMajorQuiz(containerId = 'majorQuiz', dataUrl = '/data/quiz-data.json') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Major Quiz: Container #${containerId} not found`);
        return null;
    }

    // Private state
    let quizData = null;
    let answers = {};
    let totalAnswered = 0;
    
    // Cached DOM references
    let loadingSection = null;
    let resultSection = null;
    let resultMajor = null;
    let resultDescription = null;
    let resultLink = null;

    /**
     * Load quiz data from JSON
     */
    async function loadQuizData() {
        const response = await fetch(dataUrl);
        if (!response.ok) {
            throw new Error('Failed to load quiz data');
        }
        quizData = await response.json();
    }

    /**
     * Render quiz UI
     */
    function renderQuiz() {
        if (!quizData || !container) return;

        const html = `
            <!-- Header -->
            <div class="text-center">
                <div class="inline-flex items-center gap-2 bg-primary-yellow/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                    <span class="text-2xl">⚡</span>
                    <span class="text-primary-yellow font-semibold text-sm">${quizData.badge}</span>
                </div>
                <h2 class="text-2xl md:text-3xl font-inter font-bold text-white mb-3">
                    ${quizData.title}
                </h2>
                <p class="text-white/80 text-sm md:text-base max-w-2xl mx-auto">
                    ${quizData.description}
                </p>
            </div>

            <!-- Quiz Questions -->
            <div class="space-y-6">
                ${renderQuestions()}
            </div>

            <!-- Loading Section -->
            <div id="quizLoading" class="hidden">
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
                    <div class="flex flex-col items-center gap-4">
                        <div class="relative w-16 h-16">
                            <div class="absolute inset-0 border-4 border-primary-yellow/30 rounded-full"></div>
                            <div class="absolute inset-0 border-4 border-primary-yellow border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div>
                            <h3 class="text-white font-bold text-lg mb-2">Đang phân tích kết quả...</h3>
                            <p class="text-white/70 text-sm">Vui lòng chờ trong giây lát</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Results Section (Hidden by default) -->
            <div id="quizResults" class="hidden opacity-0 transition-all duration-700 ease-out transform translate-y-4">
                <div class="bg-primary-yellow/20 backdrop-blur-sm rounded-xl p-6 border-2 border-primary-yellow">
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-lg bg-primary-yellow flex items-center justify-center shrink-0 animate-bounce-slow">
                            <span class="text-2xl">🎯</span>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-white font-bold text-lg mb-2 animate-fade-in">Chuyên ngành phù hợp với bạn:</h3>
                            <div id="resultMajor" class="text-primary-yellow font-bold text-xl mb-3 animate-slide-up"></div>
                            <p id="resultDescription" class="text-white/80 text-sm leading-relaxed mb-4 animate-fade-in-delay"></p>
                            <a href="#" id="resultLink" class="inline-flex items-center gap-2 bg-primary-yellow hover:bg-primary-yellow/90 text-primary-dark-blue font-semibold px-6 py-3 rounded-lg transition-colors duration-300 animate-fade-in-delay-2">
                                <span>Tìm hiểu chi tiết</span>
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CTA Section -->
            <div class="text-center pt-4 border-t border-white/10">
                <p class="text-white/80 text-sm md:text-base mb-5">
                    ${quizData.cta.text}
                </p>
                <a href="${quizData.cta.buttonUrl}" 
                   class="group inline-flex items-center justify-between gap-1.5 md:gap-2.5 px-4 md:px-8 py-2 md:py-2.5 rounded-full font-roboto font-medium text-sm md:text-base transition-all duration-500 ease-in-out cursor-pointer bg-primary-yellow border border-primary-yellow text-primary-white hover:text-primary-dark-blue hover:bg-secondary-yellow-light hover:border-secondary-yellow hover:shadow-md mx-auto">
                    <span class="shrink-0">${quizData.cta.buttonText}</span>
                    <svg class="w-5 h-5 md:w-6 md:h-6 shrink-0 transition-all duration-500 ease-in-out group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </a>
            </div>
        `;

        container.innerHTML = html;
        
        // Cache DOM references
        loadingSection = document.getElementById('quizLoading');
        resultSection = document.getElementById('quizResults');
        resultMajor = document.getElementById('resultMajor');
        resultDescription = document.getElementById('resultDescription');
        resultLink = document.getElementById('resultLink');
    }

    /**
     * Render questions HTML
     */
    function renderQuestions() {
        return quizData.questions.map(question => `
            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 class="text-white font-bold mb-4 flex items-center gap-2">
                    <span class="w-7 h-7 rounded-full bg-primary-yellow text-primary-dark-blue flex items-center justify-center text-sm font-bold">
                        ${question.id}
                    </span>
                    ${question.question}
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    ${renderOptions(question)}
                </div>
            </div>
        `).join('');
    }

    /**
     * Render options for a question
     */
    function renderOptions(question) {
        return question.options.map(option => `
            <label class="quiz-option cursor-pointer group">
                <input type="radio" 
                       name="question${question.id}" 
                       value="${option.value}" 
                       class="hidden peer"
                       data-scores='${JSON.stringify(option.scores)}'>
                <div class="bg-white/5 hover:bg-white/10 peer-checked:bg-primary-yellow/20 peer-checked:border-primary-yellow border-2 border-white/20 rounded-lg p-4 transition-all duration-300">
                    <div class="flex items-center gap-3">
                        <div class="w-5 h-5 rounded-full border-2 border-white/40 group-hover:border-white/60 transition-colors peer-checked:border-primary-yellow peer-checked:bg-primary-yellow">
                            <div class="w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100 m-auto mt-0.5"></div>
                        </div>
                        <span class="text-white/90 font-medium peer-checked:text-white">${option.text}</span>
                    </div>
                </div>
            </label>
        `).join('');
    }

    /**
     * Attach event listeners using delegation
     */
    function attachEventListeners() {
        // Event delegation: single listener on container
        container.addEventListener('change', (event) => {
            if (event.target.matches('input[type="radio"]')) {
                handleAnswer(event);
            }
        });
    }

    /**
     * Handle answer selection
     */
    function handleAnswer(event) {
        const questionName = event.target.name;
        const value = event.target.value;
        const scoresData = event.target.dataset.scores;
        
        // Track if this is a new answer
        if (!answers[questionName]) {
            totalAnswered++;
        }
        
        // Store answer with scores
        answers[questionName] = {
            value: value,
            scores: JSON.parse(scoresData)
        };

        // Check if all questions are answered
        if (totalAnswered === quizData.questions.length) {
            calculateAndShowResult();
        }
    }

    /**
     * Calculate scores and show result
     */
    function calculateAndShowResult() {
        // Show loading
        showLoading();
        
        // Simulate processing time (2.5 seconds)
        setTimeout(() => {
            // Initialize scores for all majors
            const scores = {};
            Object.keys(quizData.results).forEach(major => {
                scores[major] = 0;
            });

            // Calculate scores from answers
            Object.values(answers).forEach(answer => {
                if (answer.scores) {
                    Object.entries(answer.scores).forEach(([major, points]) => {
                        scores[major] = (scores[major] || 0) + points;
                    });
                }
            });

            // Find recommended major (highest score)
            const recommendedMajor = findTopMajor(scores);
            
            // Hide loading and display result
            hideLoading();
            displayResult(recommendedMajor);
        }, 3000);
    }

    /**
     * Find major with highest score
     */
    function findTopMajor(scores) {
        let maxScore = -1;
        let topMajor = null;

        for (const [major, score] of Object.entries(scores)) {
            if (score > maxScore) {
                maxScore = score;
                topMajor = major;
            }
        }

        return topMajor;
    }

    /**
     * Show loading state
     */
    function showLoading() {
        if (loadingSection) {
            loadingSection.classList.remove('hidden');
            
            // Smooth scroll to loading
            setTimeout(() => {
                loadingSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest' 
                });
            }, 100);
        }
    }

    /**
     * Hide loading state
     */
    function hideLoading() {
        if (loadingSection) {
            loadingSection.classList.add('hidden');
        }
    }

    /**
     * Display quiz result
     */
    function displayResult(majorKey) {
        const result = quizData.results[majorKey];
        if (!result || !resultSection) return;

        if (resultMajor) resultMajor.textContent = result.name;
        if (resultDescription) resultDescription.textContent = result.description;
        if (resultLink && result.url) resultLink.href = result.url;
        
        // Show with animation
        resultSection.classList.remove('hidden');
        
        // Trigger animation after a brief delay to ensure transition works
        setTimeout(() => {
            resultSection.classList.add('show');
        }, 50);
        
        // Smooth scroll to results after animation starts
        setTimeout(() => {
            resultSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }, 200);
    }

    /**
     * Show error message
     */
    function showError() {
        if (!container) return;
        
        container.innerHTML = `
            <div class="text-center text-white/80 py-8">
                <p class="mb-4">⚠️ Không thể tải dữ liệu trắc nghiệm.</p>
                <button onclick="location.reload()" class="text-primary-yellow hover:underline">
                    Thử lại
                </button>
            </div>
        `;
    }

    /**
     * Initialize quiz
     */
    async function init() {
        try {
            await loadQuizData();
            renderQuiz();
            attachEventListeners();
        } catch (error) {
            console.error('Error initializing quiz:', error);
            showError();
        }
    }

    // Start initialization
    init();

    // Return public API
    return {
        /**
         * Reset quiz to initial state
         */
        reset() {
            answers = {};
            totalAnswered = 0;
            
            // Hide loading and results using cached references
            if (loadingSection) {
                loadingSection.classList.add('hidden');
            }
            
            if (resultSection) {
                resultSection.classList.remove('show');
                resultSection.classList.add('hidden');
            }
            
            // Reset all radio buttons
            container.querySelectorAll('input[type="radio"]').forEach(radio => {
                radio.checked = false;
            });
        },

        /**
         * Get current answers
         */
        getAnswers() {
            return answers;
        },

        /**
         * Get quiz progress
         */
        getProgress() {
            return {
                answered: totalAnswered,
                total: quizData?.questions.length || 0,
                percentage: quizData ? (totalAnswered / quizData.questions.length) * 100 : 0
            };
        }
    };
}
