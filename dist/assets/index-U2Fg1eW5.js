(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&a(l)}).observe(document,{childList:!0,subtree:!0});function r(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(o){if(o.ep)return;o.ep=!0;const i=r(o);fetch(o.href,i)}})();const u=[],w=["book","landmark","globe","newspaper","brain","graduation-cap","school","library","microscope","flask","atom","dna","calculator","pen-tool","edit","compass","map","flag"],y=[{name:"Blue to Cyan",value:"from-blue-500 to-cyan-500"},{name:"Green to Emerald",value:"from-green-500 to-emerald-500"},{name:"Purple to Pink",value:"from-purple-500 to-pink-500"},{name:"Indigo to Purple",value:"from-indigo-500 to-purple-500"},{name:"Red to Orange",value:"from-red-500 to-orange-500"},{name:"Yellow to Orange",value:"from-yellow-500 to-orange-500"},{name:"Teal to Green",value:"from-teal-500 to-green-500"},{name:"Rose to Pink",value:"from-rose-500 to-pink-500"}],m="https://script.google.com/macros/s/AKfycby37LvOaSPXCMSVNurGlYQa-paXCeHDeOZVjHNGsDxcHDaSbiJmyW4jBPR9r5FNn_1HoA/exec",n={questions:new Map,leaderboard:new Map,subjects:null,timestamp:new Map,CACHE_DURATION:5*60*1e3};async function b(s){try{const e=await h(s);n.questions.set(s,e),n.timestamp.set(`questions_${s}`,Date.now())}catch(e){console.error("Error preloading questions:",e)}}function S(s){if(!s)return null;const e=s.trim().toUpperCase();return{A:0,B:1,C:2,D:3}[e]}async function h(s){const e=await fetch(`${m}?action=getQuestions&subject=${encodeURIComponent(s)}`);if(!e.ok)throw new Error(`Failed to fetch questions (Status: ${e.status})`);const r=await e.json();if(!r.success)throw new Error(r.error||"Failed to fetch questions");if(!r.questions||!Array.isArray(r.questions)||r.questions.length===0)throw new Error("No questions available for this subject");return r.questions.map(a=>{if(!Array.isArray(a)||a.length<7)throw new Error("Invalid question format received from server");const o=S(a[5]);if(o===null)throw console.error("Invalid answer letter:",a[5]),new Error("Invalid answer format received from server. Expected A, B, C, or D");return{question:a[0]||"Question not available",options:[a[1]||"Option not available",a[2]||"Option not available",a[3]||"Option not available",a[4]||"Option not available"],answer:o,explanation:a[6]||"No explanation available"}})}async function q(s){try{const e=n.questions.get(s),r=n.timestamp.get(`questions_${s}`);if(e&&r&&Date.now()-r<n.CACHE_DURATION)return e;const a=await h(s);return n.questions.set(s,a),n.timestamp.set(`questions_${s}`,Date.now()),u.forEach(o=>{o.id!==s&&b(o.id)}),a}catch(e){throw console.error("Error fetching questions:",e),new Error(e.message||"Failed to fetch questions")}}async function j(){try{if(n.subjects&&n.timestamp.get("subjects")&&Date.now()-n.timestamp.get("subjects")<n.CACHE_DURATION)return n.subjects;const s=await fetch(`${m}?action=getAllSubjects`);if(!s.ok)throw new Error(`Failed to fetch subjects (Status: ${s.status})`);const e=await s.json();if(!e.success)throw new Error(e.error||"Failed to fetch subjects");return n.subjects=e.subjects,n.timestamp.set("subjects",Date.now()),e.subjects.length>0&&b(e.subjects[0].id),e.subjects}catch(s){throw console.error("Error fetching subjects:",s),new Error(s.message||"Failed to fetch subjects")}}async function $(s,e,r){try{if(!s||!e||r===void 0)throw new Error("Missing required parameters for saving score");const a=new URLSearchParams;a.append("action","saveScore"),a.append("name",s.trim()),a.append("score",r.toString()),a.append("subject",e);const i=await(await fetch(m,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:a.toString()})).text();if(i.includes("success"))return n.leaderboard.delete(e),{success:!0};throw new Error("Failed to save score: "+i)}catch(a){throw console.error("Error saving score:",a),a}}async function L(s){try{if(!s)throw new Error("Subject is required for fetching leaderboard");const e=n.leaderboard.get(s),r=n.timestamp.get(`leaderboard_${s}`);if(e&&r&&Date.now()-r<n.CACHE_DURATION)return e;const a=new URLSearchParams({action:"getLeaderboard",subject:s}),i=await(await fetch(`${m}?${a}`)).json();if(!i.success)return console.log("Leaderboard fetch failed:",i.error),[];const l=i.entries.filter(d=>d&&d.name&&d.score!==void 0).map(d=>({name:d.name,score:typeof d.score=="string"?parseInt(d.score,10):d.score})).sort((d,x)=>x.score-d.score);return n.leaderboard.set(s,l),n.timestamp.set(`leaderboard_${s}`,Date.now()),l}catch(e){return console.error("Error fetching leaderboard:",e),[]}}async function k(s){try{const e=new URLSearchParams;e.append("action","createSubject"),e.append("subject",s.name),e.append("questions",JSON.stringify(s.questions||[]));const a=await(await fetch(m,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:e.toString()})).json();if(a.success)return n.subjects=null,n.timestamp.delete("subjects"),{success:!0};throw new Error(a.error||"Failed to create subject")}catch(e){throw console.error("Error creating subject:",e),new Error(e.message||"Failed to create subject")}}class E{constructor(){this.state={playerName:"",selectedSubject:"",currentQuestion:0,questions:[],answers:[],quizStarted:!1,quizCompleted:!1,timeLeft:0,timer:null,isLoading:!1}}async loadSubjects(){try{const e=await j();u.length=0,u.push(...e)}catch(e){console.error("Error loading subjects:",e)}}saveState(e){const r={selectedSubject:this.state.selectedSubject,currentQuestion:this.state.currentQuestion,answers:this.state.answers,quizStarted:this.state.quizStarted,quizCompleted:this.state.quizCompleted,timeLeft:this.state.timeLeft,questions:this.state.questions};localStorage.setItem(`quizAppState_${e}`,JSON.stringify(r))}loadState(e){const r=localStorage.getItem(`quizAppState_${e}`);if(r){const a=JSON.parse(r);this.state={...this.state,...a}}else this.resetState(e)}clearState(e){localStorage.removeItem(`quizAppState_${e}`)}savePlayerName(){localStorage.setItem("quizAppPlayerName",this.state.playerName)}loadPlayerName(){const e=localStorage.getItem("quizAppPlayerName");e&&(this.state.playerName=e)}resetState(e){this.state.selectedSubject=e,this.state.currentQuestion=0,this.state.questions=[],this.state.answers=[],this.state.quizStarted=!1,this.state.quizCompleted=!1,this.state.timeLeft=0,this.state.timer=null,this.state.isLoading=!1}clearAllData(){localStorage.removeItem("quizAppPlayerName"),this.state={playerName:"",selectedSubject:"",currentQuestion:0,questions:[],answers:[],quizStarted:!1,quizCompleted:!1,timeLeft:0,timer:null,isLoading:!1}}}const t=new E,p=[{from:"from-blue-600",to:"to-cyan-500",text:"text-blue-50",icon:"bg-blue-500/30"},{from:"from-purple-600",to:"to-pink-500",text:"text-purple-50",icon:"bg-purple-500/30"},{from:"from-emerald-600",to:"to-teal-500",text:"text-emerald-50",icon:"bg-emerald-500/30"},{from:"from-orange-600",to:"to-yellow-500",text:"text-orange-50",icon:"bg-orange-500/30"},{from:"from-red-600",to:"to-rose-500",text:"text-red-50",icon:"bg-red-500/30"},{from:"from-indigo-600",to:"to-violet-500",text:"text-indigo-50",icon:"bg-indigo-500/30"},{from:"from-fuchsia-600",to:"to-pink-500",text:"text-fuchsia-50",icon:"bg-fuchsia-500/30"},{from:"from-lime-600",to:"to-green-500",text:"text-lime-50",icon:"bg-lime-500/30"}];function N(s=new Set){let e=p.filter(a=>!s.has(a));e.length===0&&(e=p,s.clear());const r=e[Math.floor(Math.random()*e.length)];return s.add(r),r}function g(){const s=document.getElementById("digital-clock");if(s){const e=new Date;let r=e.getHours();const a=e.getMinutes(),o=r>=12?"PM":"AM";r=r%12,r=r||12,s.textContent=`${r}:${a.toString().padStart(2,"0")} ${o}`}}async function f(){const s=document.getElementById("quiz-container");s.innerHTML=`
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
  `,lucide.createIcons()}function v(){const s=document.getElementById("quiz-container");s.innerHTML=`
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
        ${[1,2,3,4,5,6].map(()=>`
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
        `).join("")}
      </div>
    </div>
  `}async function c(){v(),await t.loadSubjects();const s=new Set,e=document.getElementById("quiz-container");e.innerHTML=`
    <div class="max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="flex flex-col gap-6 mb-12">
        <!-- User Info -->
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <i data-lucide="brain" class="w-8 h-8 text-white"></i>
          </div>
          <div>
            <h2 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600">Welcome back, ${t.state.playerName}!</h2>
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

          ${t.state.playerName==="admin@quiz"?`
            <button
              onclick="app.showCreateSubject()"
              class="flex items-center px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
            >
              <i data-lucide="plus" class="w-5 h-5 mr-2"></i>
              Create Subject
            </button>
          `:""}

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
        ${u.map((r,a)=>{const o=N(s);return`
            <div class="group" data-aos="fade-up" data-aos-delay="${a*100}">
              <button
                onclick="app.selectSubject('${r.id}')"
                class="w-full h-full rounded-2xl p-6 transition-all duration-500
                       hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-[1.02]
                       relative overflow-hidden
                       bg-gradient-to-r ${o.from} ${o.to}"
              >
                <!-- Glass overlay -->
                <div class="absolute inset-0 bg-white/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <!-- Animated background shapes -->
                <div class="absolute -right-12 -top-12 w-24 h-24 bg-white/10 rounded-full blur-xl transform group-hover:scale-150 transition-transform duration-700"></div>
                <div class="absolute -left-12 -bottom-12 w-24 h-24 bg-white/10 rounded-full blur-xl transform group-hover:scale-150 transition-transform duration-700"></div>
                
                <!-- Content -->
                <div class="relative z-10">
                  <div class="flex items-center gap-4 mb-6">
                    <div class="flex-shrink-0 w-14 h-14 rounded-xl ${o.icon}
                               flex items-center justify-center transform group-hover:scale-110 transition-all duration-500
                               group-hover:rotate-6">
                      <i data-lucide="${r.icon}" class="w-7 h-7 ${o.text} transform group-hover:-rotate-6 transition-transform duration-500"></i>
                    </div>
                    <div class="flex-1">
                      <h3 class="text-xl font-bold ${o.text} mb-1 transform group-hover:translate-x-2 transition-transform duration-500">${r.name}</h3>
                      <div class="flex items-center text-sm ${o.text}/80">
                        <i data-lucide="clock" class="w-4 h-4 mr-1"></i>
                        <span>${r.timeInMinutes*2} mins</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Progress Bar -->
                  <div class="h-2 w-full bg-black/20 rounded-full overflow-hidden mb-6">
                    <div class="h-full bg-white/30 w-0 group-hover:w-full transition-all duration-1000 ease-out"></div>
                  </div>
                  
                  <!-- Footer -->
                  <div class="flex items-center justify-between ${o.text}/90">
                    <div class="flex items-center text-sm">
                      <i data-lucide="help-circle" class="w-4 h-4 mr-1"></i>
                      <span>${r.questions} questions</span>
                    </div>
                    <div class="flex items-center font-medium">
                      <span class="mr-2 transform group-hover:translate-x-1 transition-transform duration-500">Start</span>
                      <i data-lucide="arrow-right" class="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-500"></i>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          `}).join("")}
      </div>
    </div>
  `,lucide.createIcons(),AOS.init(),g(),setInterval(g,1e3)}function z(){const s=document.getElementById("quiz-container"),e=document.createElement("div");e.className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm",e.innerHTML=`
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
  `,s.appendChild(e),lucide.createIcons()}function Q(){const s=document.getElementById("quiz-container");s.innerHTML=`
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
              ${w.map(r=>`
                <button
                  type="button"
                  onclick="app.selectIcon('${r}')"
                  class="icon-button w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white transition-all duration-200"
                  data-icon="${r}"
                >
                  <i data-lucide="${r}" class="w-6 h-6"></i>
                </button>
              `).join("")}
            </div>
            <input type="hidden" name="icon" required>
          </div>

          <!-- Color Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Choose a Color Theme
            </label>
            <div class="grid grid-cols-2 gap-4">
              ${y.map(r=>`
                <button
                  type="button"
                  onclick="app.selectColor('${r.value}')"
                  class="color-button h-12 rounded-xl bg-gradient-to-r ${r.value} opacity-75 hover:opacity-100 transition-all duration-200 flex items-center justify-center text-white font-medium"
                  data-color="${r.value}"
                >
                  ${r.name}
                </button>
              `).join("")}
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
  `,lucide.createIcons();const e=document.getElementById("create-subject-form");e.addEventListener("submit",r=>{r.preventDefault();const a=new FormData(e),o={id:a.get("name").replace(/\s+/g,""),name:a.get("name"),icon:a.get("icon"),color:a.get("color"),questions:parseInt(a.get("questions")),timeInMinutes:parseInt(a.get("timeInMinutes"))};app.createSubject(o)})}class I{constructor(){this.init(),window.addEventListener("load",this.handlePageLoad.bind(this))}async init(){t.loadPlayerName(),t.state.playerName?(await t.loadSubjects(),c()):(f(),this.setupNameFormListener())}async handlePageLoad(){t.state.playerName&&!t.state.quizStarted&&c()}setupNameFormListener(){const e=document.getElementById("name-form");e&&(e.removeEventListener("submit",this.handleNameSubmit),e.addEventListener("submit",this.handleNameSubmit.bind(this)))}async handleNameSubmit(e){e.preventDefault();const r=document.getElementById("name-input").value.trim();r&&(t.state.playerName=r,t.savePlayerName(),v(),setTimeout(async()=>{await t.loadSubjects(),c()},1500))}async selectSubject(e){try{t.state.selectedSubject=e,t.loadState(e),t.state.quizCompleted?(t.clearState(e),t.state.selectedSubject=e,await this.startNewQuiz(e)):t.state.quizStarted?(this.startTimer(),this.renderQuestion()):await this.startNewQuiz(e)}catch(r){console.error("Error selecting subject:",r),alert("Failed to start quiz. Please try again."),c()}}async startNewQuiz(e){try{t.state.selectedSubject=e,t.state.isLoading=!0,t.saveState(e),this.renderLoader();const r=await q(e);t.state.questions=r,t.state.answers=new Array(r.length).fill(null),t.state.timeLeft=r.length*60,t.state.isLoading=!1,t.saveState(e),this.startQuiz()}catch(r){t.state.isLoading=!1,alert(r.message||"Failed to load questions. Please try again."),c()}}startQuiz(){t.state.quizStarted=!0,t.saveState(t.state.selectedSubject),this.startTimer(),this.renderQuestion()}startTimer(){t.state.timer&&clearInterval(t.state.timer),t.state.timer=setInterval(()=>{t.state.timeLeft--,this.updateTimer(),t.saveState(t.state.selectedSubject),t.state.timeLeft<=0&&this.completeQuiz()},1e3)}updateTimer(){const e=document.getElementById("timer");if(e){const r=Math.floor(t.state.timeLeft/60),a=t.state.timeLeft%60;e.textContent=`${r}:${a.toString().padStart(2,"0")}`}}async createSubject(e){try{if(u.some(r=>r.name===e.name)){alert(`A subject with the name "${e.name}" already exists`);return}await k(e),u.push(e),localStorage.setItem("customSubjects",JSON.stringify(u)),this.goHome()}catch(r){alert(r.message||"Failed to create subject")}}renderLoader(){const e=document.getElementById("quiz-container");e.innerHTML=`
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
    `}renderQuestion(){const e=t.state.questions[t.state.currentQuestion],r=document.getElementById("quiz-container");r.innerHTML=`
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
                  stroke-dasharray="${2*Math.PI*28}"
                  stroke-dashoffset="${2*Math.PI*28*(1-(t.state.currentQuestion+1)/t.state.questions.length)}"
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
                  ${t.state.currentQuestion+1}/${t.state.questions.length}
                </span>
              </div>
            </div>
          </div>

          <div class="relative flex items-center gap-3 bg-black/5 backdrop-blur-xl px-6 py-3 rounded-xl border border-white/20">
            <i data-lucide="clock" class="w-5 h-5 text-indigo-600"></i>
            <span id="timer" class="font-mono text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ${Math.floor(t.state.timeLeft/60)}:${(t.state.timeLeft%60).toString().padStart(2,"0")}
            </span>
          </div>
        </div>
        
        <!-- Question -->
        <div class="relative mt-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6 p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
            ${e.question}
          </h2>
        </div>
        
        <!-- Options -->
        <div class="space-y-4 mb-8">
          ${e.options.map((a,o)=>`
            <button
              onclick="app.selectAnswer(${o})"
              class="group w-full p-5 text-left rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${t.state.answers[t.state.currentQuestion]===o?"border-transparent bg-gradient-to-r from-indigo-500 to-purple-500 text-white transform scale-102":"border-gray-100 hover:border-transparent hover:shadow-lg hover:scale-101"}"
            >
              ${t.state.answers[t.state.currentQuestion]!==o?`
                <div class="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              `:""}
              <div class="flex items-center">
                <span class="inline-block w-10 h-10 rounded-full flex items-center justify-center text-base
                  ${t.state.answers[t.state.currentQuestion]===o?"bg-white/20 text-white":"bg-gray-100 text-gray-700 group-hover:bg-white/80"}"
                >
                  ${String.fromCharCode(65+o)}
                </span>
                <span class="ml-4 text-base ${t.state.answers[t.state.currentQuestion]===o?"text-white":"text-gray-700"}">
                  ${a}
                </span>
              </div>
            </button>
          `).join("")}
        </div>
        
        <!-- Navigation Buttons -->
        <div class="flex justify-between items-center">
          ${t.state.currentQuestion>0?`
            <button
              onclick="app.previousQuestion()"
              class="flex items-center px-6 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
            >
              <i data-lucide="arrow-left" class="w-5 h-5 mr-2"></i>
              Previous
            </button>
          `:"<div></div>"}
          
          <button
            onclick="app.nextQuestion()"
            class="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
          >
            ${t.state.currentQuestion===t.state.questions.length-1?"Finish":"Next"}
            ${t.state.currentQuestion<t.state.questions.length-1?`
              <i data-lucide="arrow-right" class="w-5 h-5 ml-2"></i>
            `:""}
          </button>
        </div>
      </div>
    `,lucide.createIcons()}selectAnswer(e){t.state.answers[t.state.currentQuestion]=e,t.saveState(t.state.selectedSubject),this.renderQuestion()}previousQuestion(){t.state.currentQuestion>0&&(t.state.currentQuestion--,t.saveState(t.state.selectedSubject),this.renderQuestion())}nextQuestion(){t.state.currentQuestion<t.state.questions.length-1?(t.state.currentQuestion++,t.saveState(t.state.selectedSubject),this.renderQuestion()):this.completeQuiz()}async completeQuiz(){try{clearInterval(t.state.timer),t.state.quizCompleted=!0,this.renderLoader2();const e=this.calculateScore();t.clearState(t.state.selectedSubject),await $(t.state.playerName,t.state.selectedSubject,e),await this.renderResults()}catch(e){console.error("Error completing quiz:",e),alert(e.message||"Failed to save score. Please try again."),c()}}calculateScore(){return t.state.answers.reduce((e,r,a)=>e+(r===t.state.questions[a].answer?1:0),0)}renderLoader2(){const e=document.getElementById("quiz-container");e.innerHTML=`
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
    `}async renderResults(){try{const e=this.calculateScore(),r=Math.round(e/t.state.questions.length*100),a=await L(t.state.selectedSubject),o=a.findIndex(l=>l.name===t.state.playerName)+1,i=document.getElementById("quiz-container");i.innerHTML=`
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <!-- Score Card -->
          <div class="glassmorphism rounded-3xl p-8 shadow-xl" data-aos="fade-right">
            <div class="text-center">
              <div class="relative w-40 h-40 mx-auto mb-8">
                <div class="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 blur-lg opacity-50"></div>
                <div class="relative w-full h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <span class="text-5xl font-bold text-white">${r}%</span>
                </div>
              </div>
              <h2 class="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                ${t.state.playerName}
              </h2>
              <p class="text-xl text-gray-600 mb-8">
                Rank #${o} • ${e}/${t.state.questions.length} correct
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
              ${a.slice(0,5).map((l,d)=>`
                <div class="flex items-center p-4 rounded-xl ${l.name===t.state.playerName?"bg-gradient-to-r from-indigo-500 to-purple-500 text-white":"bg-white/50"}">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center ${l.name===t.state.playerName?"bg-white/20":"bg-gradient-to-r from-indigo-500 to-purple-500"} mr-4">
                    <span class="${l.name===t.state.playerName,"text-white"}">${d+1}</span>
                  </div>
                  <span class="flex-1 font-medium">${l.name}</span>
                  <span class="font-bold">${l.score}</span>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      `,lucide.createIcons(),AOS.init()}catch(e){console.error("Error rendering results:",e),alert(e.message||"Failed to load results. Please try again."),c()}}showReview(){const e=document.getElementById("quiz-container");e.innerHTML=`
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
          ${t.state.questions.map((r,a)=>`
            <div class="review-card glassmorphism rounded-2xl p-6" data-aos="fade-up" data-aos-delay="${a*100}">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  ${a+1}
                </div>
                <h3 class="text-xl font-semibold text-gray-800">${r.question}</h3>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                ${r.options.map((o,i)=>`
                  <div class="flex items-center p-4 rounded-xl ${i===r.answer?"bg-green-100 border-2 border-green-500":i===t.state.answers[a]?"bg-red-100 border-2 border-red-500":"bg-white/50"}">
                    <span class="w-8 h-8 rounded-full flex items-center justify-center ${i===r.answer?"bg-green-500 text-white":i===t.state.answers[a]?"bg-red-500 text-white":"bg-gray-200"} mr-3">
                      ${String.fromCharCode(65+i)}
                    </span>
                    <span>${o}</span>
                  </div>
                `).join("")}
              </div>
              
              <div class="mt-4 p-4 bg-gray-50 rounded-xl">
                <div class="flex items-center gap-2 text-gray-600 mb-2">
                  <i data-lucide="info" class="w-5 h-5"></i>
                  <span class="font-medium">Explanation</span>
                </div>
                <p class="text-gray-700">${r.explanation||"No explanation available."}</p>
              </div>
            </div>
          `).join("")}
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
    `,lucide.createIcons(),AOS.init()}goHome(){t.state.timer&&clearInterval(t.state.timer),c()}restartQuiz(){t.state.timer&&clearInterval(t.state.timer),t.clearState(t.state.selectedSubject),t.resetState(t.state.selectedSubject),this.startNewQuiz(t.state.selectedSubject)}confirmLogout(){z()}cancelLogout(){const e=document.querySelector(".fixed.inset-0");e&&e.remove()}logout(){t.clearAllData(),this.cancelLogout(),f()}showCreateSubject(){Q()}selectIcon(e){document.querySelectorAll(".icon-button").forEach(a=>{a.classList.remove("bg-white","shadow-md"),a.dataset.icon===e&&a.classList.add("bg-white","shadow-md")}),document.querySelector('input[name="icon"]').value=e}selectColor(e){document.querySelectorAll(".color-button").forEach(a=>{a.classList.remove("ring-4","ring-indigo-200"),a.dataset.color===e&&a.classList.add("ring-4","ring-indigo-200")}),document.querySelector('input[name="color"]').value=e}}window.app=new I;
