import { subjects } from '../config/constants.js';
import { fetchAllSubjects } from '../services/api.js';

class Store {
  constructor() {
    this.state = {
      playerName: '',
      selectedSubject: '',
      currentQuestion: 0,
      questions: [],
      answers: [],
      quizStarted: false,
      quizCompleted: false,
      timeLeft: 0,
      timer: null,
      isLoading: false
    };
  }

  async loadSubjects() {
    try {
      const fetchedSubjects = await fetchAllSubjects();
      subjects.length = 0; // Clear the array
      subjects.push(...fetchedSubjects);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  }

  saveState(subjectId) {
    const stateToSave = {
      selectedSubject: this.state.selectedSubject,
      currentQuestion: this.state.currentQuestion,
      answers: this.state.answers,
      quizStarted: this.state.quizStarted,
      quizCompleted: this.state.quizCompleted,
      timeLeft: this.state.timeLeft,
      questions: this.state.questions,
    };
    localStorage.setItem(`quizAppState_${subjectId}`, JSON.stringify(stateToSave));
  }

  loadState(subjectId) {
    const savedState = localStorage.getItem(`quizAppState_${subjectId}`);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      this.state = { ...this.state, ...parsedState };
    } else {
      this.resetState(subjectId);
    }
  }

  clearState(subjectId) {
    localStorage.removeItem(`quizAppState_${subjectId}`);
  }

  savePlayerName() {
    localStorage.setItem('quizAppPlayerName', this.state.playerName);
  }

  loadPlayerName() {
    const savedName = localStorage.getItem('quizAppPlayerName');
    if (savedName) {
      this.state.playerName = savedName;
    }
  }

  resetState(subjectId) {
    this.state.selectedSubject = subjectId;
    this.state.currentQuestion = 0;
    this.state.questions = [];
    this.state.answers = [];
    this.state.quizStarted = false;
    this.state.quizCompleted = false;
    this.state.timeLeft = 0;
    this.state.timer = null;
    this.state.isLoading = false;
  }

  clearAllData() {
    // Only clear player name and quiz states
    localStorage.removeItem('quizAppPlayerName');
    // Reset current state
    this.state = {
      playerName: '',
      selectedSubject: '',
      currentQuestion: 0,
      questions: [],
      answers: [],
      quizStarted: false,
      quizCompleted: false,
      timeLeft: 0,
      timer: null,
      isLoading: false
    };
  }
}

export const store = new Store();