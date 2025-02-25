import { store } from './state/store.js';
import { fetchQuestions, saveScore, fetchLeaderboard, createSubject } from './services/api.js';
import { renderNameInput, renderSubjectSelection, renderLogoutConfirmation, renderCreateSubjectForm, renderSkeletonLoading } from './components/ui.js';
import { subjects } from './config/constants.js';

class QuizApp {
  constructor() {
    this.init();
    // Add event listener for page refresh/load
    window.addEventListener('load', this.handlePageLoad.bind(this));
  }

  async init() {
    store.loadPlayerName();
    if (store.state.playerName) {
      await store.loadSubjects();
      renderSubjectSelection();
    } else {
      renderNameInput();
      this.setupNameFormListener();
    }
  }

  async handlePageLoad() {
    if (store.state.playerName && !store.state.quizStarted) {
      // Only reload subjects if we're on the home page (not in a quiz)
      renderSubjectSelection();
    }
  }

  setupNameFormListener() {
    const form = document.getElementById('name-form');
    if (form) {
      form.removeEventListener('submit', this.handleNameSubmit);
      form.addEventListener('submit', this.handleNameSubmit.bind(this));
    }
  }

  async handleNameSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('name-input').value.trim();
    if (name) {
      store.state.playerName = name;
      store.savePlayerName();
      
      // Show skeleton loading
      renderSkeletonLoading();
      
      // Simulate loading time and load subjects
      setTimeout(async () => {
        await store.loadSubjects();
        renderSubjectSelection();
      }, 1500); // Show skeleton for 1.5 seconds
    }
  }

  async selectSubject(subjectId) {
    try {
      store.state.selectedSubject = subjectId;
      store.loadState(subjectId);

      if (store.state.quizCompleted) {
        store.clearState(subjectId);
        store.state.selectedSubject = subjectId;
        await this.startNewQuiz(subjectId);
      } else if (store.state.quizStarted) {
        this.startTimer();
        this.renderQuestion();
      } else {
        await this.startNewQuiz(subjectId);
      }
    } catch (error) {
      console.error('Error selecting subject:', error);
      alert('Failed to start quiz. Please try again.');
      renderSubjectSelection();
    }
  }

  async startNewQuiz(subjectId) {
    try {
      store.state.selectedSubject = subjectId;
      store.state.isLoading = true;
      store.saveState(subjectId);
      this.renderLoader();

      const questions = await fetchQuestions(subjectId);
      store.state.questions = questions;
      store.state.answers = new Array(questions.length).fill(null);
      store.state.timeLeft = questions.length * 60;
      store.state.isLoading = false;
      store.saveState(subjectId);
      this.startQuiz();
    } catch (error) {
      store.state.isLoading = false;
      alert(error.message || 'Failed to load questions. Please try again.');
      renderSubjectSelection();
    }
  }

  startQuiz() {
    store.state.quizStarted = true;
    store.saveState(store.state.selectedSubject);
    this.startTimer();
    this.renderQuestion();
  }

  startTimer() {
    if (store.state.timer) clearInterval(store.state.timer);
    store.state.timer = setInterval(() => {
      store.state.timeLeft--;
      this.updateTimer();
      store.saveState(store.state.selectedSubject);
      if (store.state.timeLeft <= 0) {
        this.completeQuiz();
      }
    }, 1000);
  }

  updateTimer() {
    const timerElement = document.getElementById('timer');
    if (timerElement) {
      const minutes = Math.floor(store.state.timeLeft / 60);
      const seconds = store.state.timeLeft % 60;
      timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  async createSubject(newSubject) {
    try {
      // Check if subject name already exists
      if (subjects.some(s => s.name === newSubject.name)) {
        alert(`A subject with the name "${newSubject.name}" already exists`);
        return;
      }

      // Create the subject in the backend
      await createSubject(newSubject);

      // Add to local subjects array
      subjects.push(newSubject);

      // Save custom subjects to localStorage
      localStorage.setItem('customSubjects', JSON.stringify(subjects));

      // Return to subject selection
      this.goHome();
    } catch (error) {
      alert(error.message || 'Failed to create subject');
    }
  }

  renderLoader() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-900/90 to-purple-900/90 backdrop-blur-lg">
        <div class="text-center">
          <div class="relative w-48 h-48 mx-auto mb-8">
            <div class="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-[spin_3s_linear_infinite]"></div>
            <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-[spin_2s_linear_infinite]"></div>
            <div class="absolute inset-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 animate-pulse flex items-center justify-center">
              <span class="text-4xl font-bold text-white">1</span>
            </div>
          </div>
          <div class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Loading Questions...
          </div>
          <div class="mt-4 w-64 h-2 mx-auto bg-gray-700/30 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-loading"></div>
          </div>
        </div>
      </div>
    `;
  }

  renderQuestion() {
    const question = store.state.questions[store.state.currentQuestion];
    const container = document.getElementById('quiz-container');

    container.innerHTML = `
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
        <!-- Top Bar -->
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div class="flex items-center gap-4 w-full sm:w-auto justify-between">
            <button
              onclick="app.goHome()"
              class="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              title="Go to Home"
            >
              <i data-lucide="home" class="w-6 h-6 text-gray-600"></i>
            </button>
            
            <div class="relative inline-flex items-center justify-center">
              <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-lg"></div>
              <svg width="60" height="60" class="transform -rotate-90">
                <circle
                  cx="30"
                  cy="30"
                  r="28"
                  fill="none"
                  stroke="rgba(229, 231, 235, 0.5)"
                  stroke-width="4"
                ></circle>
                <circle
                  cx="30"
                  cy="30"
                  r="28"
                  fill="none"
                  stroke="url(#gradient)"
                  stroke-width="4"
                  stroke-dasharray="${2 * Math.PI * 28}"
                  stroke-dashoffset="${2 * Math.PI * 28 * (1 - (store.state.currentQuestion + 1) / store.state.questions.length)}"
                  stroke-linecap="round"
                  class="transition-all duration-500 ease-out"
                ></circle>
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#6366F1"></stop>
                    <stop offset="100%" stop-color="#A855F7"></stop>
                  </linearGradient>
                </defs>
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ${store.state.currentQuestion + 1}/${store.state.questions.length}
                </span>
              </div>
            </div>
          </div>

          <div class="relative flex items-center gap-3 bg-black/5 backdrop-blur-xl px-6 py-3 rounded-xl border border-white/20">
            <i data-lucide="clock" class="w-5 h-5 text-indigo-600"></i>
            <span id="timer" class="font-mono text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ${Math.floor(store.state.timeLeft / 60)}:${(store.state.timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
        
        <!-- Question -->
        <div class="relative mt-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6 p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
            ${question.question}
          </h2>
        </div>
        
        <!-- Options -->
        <div class="space-y-4 mb-8">
          ${question.options.map((option, index) => `
            <button
              onclick="app.selectAnswer(${index})"
              class="group w-full p-5 text-left rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${
                store.state.answers[store.state.currentQuestion] === index
                ? 'border-transparent bg-gradient-to-r from-indigo-500 to-purple-500 text-white transform scale-102'
                : 'border-gray-100 hover:border-transparent hover:shadow-lg hover:scale-101'
              }"
            >
              ${store.state.answers[store.state.currentQuestion] !== index ? `
                <div class="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              ` : ''}
              <div class="flex items-center">
                <span class="inline-block w-10 h-10 rounded-full flex items-center justify-center text-base
                  ${store.state.answers[store.state.currentQuestion] === index
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-700 group-hover:bg-white/80'
                  }"
                >
                  ${String.fromCharCode(65 + index)}
                </span>
                <span class="ml-4 text-base ${
                  store.state.answers[store.state.currentQuestion] === index ? 'text-white' : 'text-gray-700'
                }">
                  ${option}
                </span>
              </div>
            </button>
          `).join('')}
        </div>
        
        <!-- Navigation Buttons -->
        <div class="flex justify-between items-center">
          ${store.state.currentQuestion > 0 ? `
            <button
              onclick="app.previousQuestion()"
              class="flex items-center px-6 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
            >
              <i data-lucide="arrow-left" class="w-5 h-5 mr-2"></i>
              Previous
            </button>
          ` : '<div></div>'}
          
          <button
            onclick="app.nextQuestion()"
            class="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
          >
            ${store.state.currentQuestion === store.state.questions.length - 1 ? 'Finish' : 'Next'}
            ${store.state.currentQuestion < store.state.questions.length - 1 ? `
              <i data-lucide="arrow-right" class="w-5 h-5 ml-2"></i>
            ` : ''}
          </button>
        </div>
      </div>
    `;

    lucide.createIcons();
  }

  selectAnswer(index) {
    store.state.answers[store.state.currentQuestion] = index;
    store.saveState(store.state.selectedSubject);
    this.renderQuestion();
  }

  previousQuestion() {
    if (store.state.currentQuestion > 0) {
      store.state.currentQuestion--;
      store.saveState(store.state.selectedSubject);
      this.renderQuestion();
    }
  }

  nextQuestion() {
    if (store.state.currentQuestion < store.state.questions.length - 1) {
      store.state.currentQuestion++;
      store.saveState(store.state.selectedSubject);
      this.renderQuestion();
    } else {
      this.completeQuiz();
    }
  }

  async completeQuiz() {
    try {
      clearInterval(store.state.timer);
      store.state.quizCompleted = true;
      this.renderLoader2();
      const score = this.calculateScore();

      store.clearState(store.state.selectedSubject);

      await saveScore(
        store.state.playerName, 
        store.state.selectedSubject,
        score
      );
      await this.renderResults();
    } catch (error) {
      console.error('Error completing quiz:', error);
      alert(error.message || 'Failed to save score. Please try again.');
      renderSubjectSelection();
    }
  }

  calculateScore() {
    return store.state.answers.reduce((score, answer, index) => {
      return score + (answer === store.state.questions[index].answer ? 1 : 0);
    }, 0);
  }

  renderLoader2() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-900/90 to-purple-900/90 backdrop-blur-lg">
        <div class="text-center">
          <div class="relative w-48 h-48 mx-auto mb-8">
            <div class="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-[spin_3s_linear_infinite]"></div>
            <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-[spin_2s_linear_infinite]"></div>
            <div class="absolute inset-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 animate-pulse flex items-center justify-center">
              <span class="text-4xl font-bold text-white">1</span>
            </div>
          </div>
          <div class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Submitting Answers...
          </div>
          <div class="mt-4 w-64 h-2 mx-auto bg-gray-700/30 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-loading"></div>
          </div>
        </div>
      </div>
    `;
  }

  async renderResults() {
    try {
      const score = this.calculateScore();
      const percentage = Math.round((score / store.state.questions.length) * 100);

      const sortedScores = await fetchLeaderboard(store.state.selectedSubject);
      const userRank = sortedScores.findIndex(entry => entry.name === store.state.playerName) + 1;

      const container = document.getElementById('quiz-container');
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <!-- Score Card -->
          <div class="glassmorphism rounded-3xl p-8 shadow-xl" data-aos="fade-right">
            <div class="text-center">
              <div class="relative w-40 h-40 mx-auto mb-8">
                <div class="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 blur-lg opacity-50"></div>
                <div class="relative w-full h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <span class="text-5xl font-bold text-white">${percentage}%</span>
                </div>
              </div>
              <h2 class="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                ${store.state.playerName}
              </h2>
              <p class="text-xl text-gray-600 mb-8">
                Rank #${userRank} • ${score}/${store.state.questions.length} correct
              </p>
              <div class="flex gap-4 justify-center">
                <button
                  onclick="app.showReview()"
                  class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
                >
                  <i data-lucide="book-open" class="w-5 h-5"></i>
                  Review Answers
                </button>
                <button
                  onclick="app.restartQuiz()"
                  class="px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                >
                  <i data-lucide="refresh-ccw" class="w-5 h-5"></i>
                  Try Again
                </button>
              </div>
            </div>
          </div>

          <!-- Leaderboard -->
          <div class="glassmorphism rounded-3xl p-8 shadow-xl" data-aos="fade-left">
            <h3 class="text-2xl font-bold mb-6 text-gray-800">Top Performers</h3>
            <div class="space-y-4">
              ${sortedScores.slice(0, 5).map((entry, index) => `
                <div class="flex items-center p-4 rounded-xl ${
                  entry.name === store.state.playerName 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                    : 'bg-white/50'
                }">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center ${
                    entry.name === store.state.playerName ? 'bg-white/20' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                  } mr-4">
                    <span class="${entry.name === store.state.playerName ? 'text-white' : 'text-white'}">${index + 1}</span>
                  </div>
                  <span class="flex-1 font-medium">${entry.name}</span>
                  <span class="font-bold">${entry.score}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      lucide.createIcons();
      AOS.init();

    } catch (error) {
      console.error('Error rendering results:', error);
      alert(error.message || 'Failed to load results. Please try again.');
      renderSubjectSelection();
    }
  }

  showReview() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = `
      <div class="max-w-4xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-3xl font-bold text-gray-800">Review Answers</h2>
          <button
            onclick="app.renderResults()"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>
        
        <div class="space-y-6">
          ${store.state.questions.map((question, index) => `
            <div class="review-card glassmorphism rounded-2xl p-6" data-aos="fade-up" data-aos-delay="${index * 100}">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  ${index + 1}
                </div>
                <h3 class="text-xl font-semibold text-gray-800">${question.question}</h3>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                ${question.options.map((option, optIndex) => `
                  <div class="flex items-center p-4 rounded-xl ${
                    optIndex === question.answer 
                      ? 'bg-green-100 border-2 border-green-500' 
                      : optIndex === store.state.answers[index]
                      ? 'bg-red-100 border-2 border-red-500'
                      : 'bg-white/50'
                  }">
                    <span class="w-8 h-8 rounded-full flex items-center justify-center ${
                      optIndex === question.answer 
                        ? 'bg-green-500 text-white'
                        : optIndex === store.state.answers[index]
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200'
                    } mr-3">
                      ${String.fromCharCode(65 + optIndex)}
                    </span>
                    <span>${option}</span>
                  </div>
                `).join('')}
              </div>
              
              <div class="mt-4 p-4 bg-gray-50 rounded-xl">
                <div class="flex items-center gap-2 text-gray-600 mb-2">
                  <i data-lucide="info" class="w-5 h-5"></i>
                  <span class="font-medium">Explanation</span>
                </div>
                <p class="text-gray-700">${question.explanation || 'No explanation available.'}</p>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="fixed bottom-8 right-8">
          <button
            onclick="app.renderResults()"
            class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Back to Results
          </button>
        </div>
      </div>
    `;

    lucide.createIcons();
    AOS.init();
  }

  goHome() {
    if (store.state.timer) clearInterval(store.state.timer);
    renderSubjectSelection();
  }

  restartQuiz() {
    if (store.state.timer) clearInterval(store.state.timer);
    store.clearState(store.state.selectedSubject);
    store.resetState(store.state.selectedSubject);
    this.startNewQuiz(store.state.selectedSubject);
  }

  confirmLogout() {
    renderLogoutConfirmation();
  }

  cancelLogout() {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
      modal.remove();
    }
  }

  logout() {
    store.clearAllData();
    this.cancelLogout();
    renderNameInput();
  }

  showCreateSubject() {
    renderCreateSubjectForm();
  }

  selectIcon(icon) {
    const buttons = document.querySelectorAll('.icon-button');
    buttons.forEach(btn => {
      btn.classList.remove('bg-white', 'shadow-md');
      if (btn.dataset.icon === icon) {
        btn.classList.add('bg-white', 'shadow-md');
      }
    });
    document.querySelector('input[name="icon"]').value = icon;
  }

  selectColor(color) {
    const buttons = document.querySelectorAll('.color-button');
    buttons.forEach(btn => {
      btn.classList.remove('ring-4', 'ring-indigo-200');
      if (btn.dataset.color === color) {
        btn.classList.add('ring-4', 'ring-indigo-200');
      }
    });
    document.querySelector('input[name="color"]').value = color;
  }
}

// Initialize the app and make it globally available
window.app = new QuizApp();