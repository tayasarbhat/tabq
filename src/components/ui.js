import { store } from '../state/store.js';
import { subjects, availableIcons, availableColors } from '../config/constants.js';

// Color palette for random generation
const colorPalettes = [
  { from: 'from-blue-600', to: 'to-cyan-500', text: 'text-blue-50', icon: 'bg-blue-500/30' },
  { from: 'from-purple-600', to: 'to-pink-500', text: 'text-purple-50', icon: 'bg-purple-500/30' },
  { from: 'from-emerald-600', to: 'to-teal-500', text: 'text-emerald-50', icon: 'bg-emerald-500/30' },
  { from: 'from-orange-600', to: 'to-yellow-500', text: 'text-orange-50', icon: 'bg-orange-500/30' },
  { from: 'from-red-600', to: 'to-rose-500', text: 'text-red-50', icon: 'bg-red-500/30' },
  { from: 'from-indigo-600', to: 'to-violet-500', text: 'text-indigo-50', icon: 'bg-indigo-500/30' },
  { from: 'from-fuchsia-600', to: 'to-pink-500', text: 'text-fuchsia-50', icon: 'bg-fuchsia-500/30' },
  { from: 'from-lime-600', to: 'to-green-500', text: 'text-lime-50', icon: 'bg-lime-500/30' },
];

// Function to get a random color palette
function getRandomPalette(usedPalettes = new Set()) {
  let availablePalettes = colorPalettes.filter(p => !usedPalettes.has(p));
  if (availablePalettes.length === 0) {
    availablePalettes = colorPalettes;
    usedPalettes.clear();
  }
  const palette = availablePalettes[Math.floor(Math.random() * availablePalettes.length)];
  usedPalettes.add(palette);
  return palette;
}

// Add clock update function
function updateClock() {
  const clockElement = document.getElementById('digital-clock');
  if (clockElement) {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    clockElement.textContent = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }
}

export async function renderNameInput() {
  const container = document.getElementById('quiz-container');
  container.innerHTML = `
    <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 text-center max-w-md mx-auto">
      <div class="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
        <i data-lucide="user-circle" class="w-12 h-12 text-white"></i>
      </div>
      <h2 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
        Welcome to the Quiz
      </h2>
      <p class="text-gray-600 mb-8 text-lg">Enter your name to begin</p>
      <form id="name-form" class="max-w-sm mx-auto">
        <input
          type="text"
          id="name-input"
          placeholder="Enter your name"
          class="w-full px-6 py-4 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 outline-none mb-6 text-lg"
          required
        >
        <button
          type="submit"
          class="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 text-lg font-medium"
        >
          Start Quiz
        </button>
      </form>
    </div>
  `;

  lucide.createIcons();
}

export function renderSkeletonLoading() {
  const container = document.getElementById('quiz-container');
  container.innerHTML = `
    <div class="max-w-7xl mx-auto animate-pulse">
      <!-- Header Section Skeleton -->
      <div class="flex flex-col gap-6 mb-12">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-gray-200 rounded-full"></div>
          <div>
            <div class="h-8 w-64 bg-gray-200 rounded-lg mb-2"></div>
            <div class="h-4 w-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <div class="flex flex-wrap gap-4">
          <div class="h-10 w-24 bg-gray-200 rounded-xl"></div>
          <div class="h-10 w-24 bg-gray-200 rounded-xl"></div>
        </div>
      </div>

      <!-- Subjects Grid Skeleton -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${[1, 2, 3, 4, 5, 6].map(() => `
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 h-[180px] relative overflow-hidden">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div class="flex-1">
                <div class="h-5 w-24 bg-gray-200 rounded-lg mb-2"></div>
                <div class="h-3 w-16 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
            <div class="h-1.5 w-full bg-gray-200 rounded-full mb-4"></div>
            <div class="absolute bottom-6 right-6">
              <div class="h-8 w-24 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export async function renderSubjectSelection() {
  renderSkeletonLoading();
  await store.loadSubjects();
  
  // Track used color palettes to avoid duplicates
  const usedPalettes = new Set();
  
  const container = document.getElementById('quiz-container');
  container.innerHTML = `
    <div class="max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="flex flex-col gap-6 mb-12">
        <!-- User Info -->
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <i data-lucide="brain" class="w-8 h-8 text-white"></i>
          </div>
          <div>
            <h2 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600">Welcome back, ${store.state.playerName}!</h2>
            <p class="text-gray-600">Choose a subject to start your quiz journey</p>
          </div>
        </div>

        <!-- Actions Bar -->
        <div class="flex flex-wrap items-center gap-4 bg-white/80 backdrop-blur-lg p-4 rounded-xl shadow-sm">
          <!-- Digital Clock -->
          <div class="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 rounded-xl border border-indigo-100">
            <div id="digital-clock" class="font-mono text-xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600">
              12:00 AM
            </div>
          </div>

          ${store.state.playerName === 'admin@quiz' ? `
            <button
              onclick="app.showCreateSubject()"
              class="flex items-center px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
            >
              <i data-lucide="plus" class="w-5 h-5 mr-2"></i>
              Create Subject
            </button>
          ` : ''}

          <button
            onclick="app.confirmLogout()"
            class="flex items-center px-4 py-3 bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl border border-gray-200 transition-all duration-200 ml-auto"
          >
            <i data-lucide="log-out" class="w-5 h-5 mr-2"></i>
            <span class="whitespace-nowrap">Logout</span>
          </button>
        </div>
      </div>

      <!-- Subjects Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        ${subjects.map((subject, index) => {
          const palette = getRandomPalette(usedPalettes);
          return `
            <div class="group" data-aos="fade-up" data-aos-delay="${index * 100}">
              <button
                onclick="app.selectSubject('${subject.id}')"
                class="w-full h-full rounded-2xl p-6 transition-all duration-500
                       hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-[1.02]
                       relative overflow-hidden
                       bg-gradient-to-r ${palette.from} ${palette.to}"
              >
                <!-- Glass overlay -->
                <div class="absolute inset-0 bg-white/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <!-- Animated background shapes -->
                <div class="absolute -right-12 -top-12 w-24 h-24 bg-white/10 rounded-full blur-xl transform group-hover:scale-150 transition-transform duration-700"></div>
                <div class="absolute -left-12 -bottom-12 w-24 h-24 bg-white/10 rounded-full blur-xl transform group-hover:scale-150 transition-transform duration-700"></div>
                
                <!-- Content -->
                <div class="relative z-10">
                  <div class="flex items-center gap-4 mb-6">
                    <div class="flex-shrink-0 w-14 h-14 rounded-xl ${palette.icon}
                               flex items-center justify-center transform group-hover:scale-110 transition-all duration-500
                               group-hover:rotate-6">
                      <i data-lucide="${subject.icon}" class="w-7 h-7 ${palette.text} transform group-hover:-rotate-6 transition-transform duration-500"></i>
                    </div>
                    <div class="flex-1">
                      <h3 class="text-xl font-bold ${palette.text} mb-1 transform group-hover:translate-x-2 transition-transform duration-500">${subject.name}</h3>
                      <div class="flex items-center text-sm ${palette.text}/80">
                        <i data-lucide="clock" class="w-4 h-4 mr-1"></i>
                        <span>${subject.timeInMinutes*2} mins</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Progress Bar -->
                  <div class="h-2 w-full bg-black/20 rounded-full overflow-hidden mb-6">
                    <div class="h-full bg-white/30 w-0 group-hover:w-full transition-all duration-1000 ease-out"></div>
                  </div>
                  
                  <!-- Footer -->
                  <div class="flex items-center justify-between ${palette.text}/90">
                    <div class="flex items-center text-sm">
                      <i data-lucide="help-circle" class="w-4 h-4 mr-1"></i>
                      <span>${subject.questions} questions</span>
                    </div>
                    <div class="flex items-center font-medium">
                      <span class="mr-2 transform group-hover:translate-x-1 transition-transform duration-500">Start</span>
                      <i data-lucide="arrow-right" class="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-500"></i>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  lucide.createIcons();
  AOS.init();
  
  // Start clock updates
  updateClock();
  setInterval(updateClock, 1000);
}

export function renderLogoutConfirmation() {
  const container = document.getElementById('quiz-container');
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 animate-slide-up">
      <div class="flex items-center gap-4 mb-6">
        <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <i data-lucide="log-out" class="w-6 h-6 text-red-600"></i>
        </div>
        <h3 class="text-2xl font-bold text-gray-800">Confirm Logout</h3>
      </div>
      <p class="text-gray-600 mb-8">
        Are you sure you want to logout? This will clear all your quiz progress and saved data.
      </p>
      <div class="flex justify-end gap-4">
        <button
          onclick="app.cancelLogout()"
          class="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200"
        >
          Cancel
        </button>
        <button
          onclick="app.logout()"
          class="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  `;
  container.appendChild(modal);
  lucide.createIcons();
}

export function renderCreateSubjectForm() {
  const container = document.getElementById('quiz-container');
  container.innerHTML = `
    <div class="max-w-2xl mx-auto">
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl font-bold text-gray-800">Create New Subject</h2>
          <button
            onclick="app.goHome()"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>

        <form id="create-subject-form" class="space-y-6">
          <!-- Subject Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Subject Name
            </label>
            <input
              type="text"
              name="name"
              required
              class="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200"
              placeholder="Enter subject name"
            >
          </div>

          <!-- Icon Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Choose an Icon
            </label>
            <div class="grid grid-cols-6 gap-4 p-4 bg-gray-50 rounded-xl">
              ${availableIcons.map(icon => `
                <button
                  type="button"
                  onclick="app.selectIcon('${icon}')"
                  class="icon-button w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white transition-all duration-200"
                  data-icon="${icon}"
                >
                  <i data-lucide="${icon}" class="w-6 h-6"></i>
                </button>
              `).join('')}
            </div>
            <input type="hidden" name="icon" required>
          </div>

          <!-- Color Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Choose a Color Theme
            </label>
            <div class="grid grid-cols-2 gap-4">
              ${availableColors.map(color => `
                <button
                  type="button"
                  onclick="app.selectColor('${color.value}')"
                  class="color-button h-12 rounded-xl bg-gradient-to-r ${color.value} opacity-75 hover:opacity-100 transition-all duration-200 flex items-center justify-center text-white font-medium"
                  data-color="${color.value}"
                >
                  ${color.name}
                </button>
              `).join('')}
            </div>
            <input type="hidden" name="color" required>
          </div>

          <!-- Questions and Time -->
          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                name="questions"
                required
                min="5"
                max="50"
                class="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200"
                placeholder="10"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Time (minutes)
              </label>
              <input
                type="number"
                name="timeInMinutes"
                required
                min="1"
                max="60"
                class="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200"
                placeholder="5"
              >
            </div>
          </div>

          <button
            type="submit"
            class="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <i data-lucide="plus-circle" class="w-5 h-5"></i>
            Create Subject
          </button>
        </form>
      </div>
    </div>
  `;

  lucide.createIcons();

  const form = document.getElementById('create-subject-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const newSubject = {
      id: formData.get('name').replace(/\s+/g, ''),
      name: formData.get('name'),
      icon: formData.get('icon'),
      color: formData.get('color'),
      questions: parseInt(formData.get('questions')),
      timeInMinutes: parseInt(formData.get('timeInMinutes'))
    };
    app.createSubject(newSubject);
  });
}