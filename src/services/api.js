import { API_URL } from '../config/constants.js';
import { subjects } from '../config/constants.js';

// Cache for questions and leaderboard data
const cache = {
  questions: new Map(),
  leaderboard: new Map(),
  subjects: null,
  timestamp: new Map(),
  CACHE_DURATION: 5 * 60 * 1000 // 5 minutes in milliseconds
};

// Preload questions for a subject
async function preloadQuestions(subject) {
  try {
    const questions = await fetchQuestionsFromAPI(subject);
    cache.questions.set(subject, questions);
    cache.timestamp.set(`questions_${subject}`, Date.now());
  } catch (error) {
    console.error('Error preloading questions:', error);
  }
}

// Convert letter answer (A, B, C, D) to index (0, 1, 2, 3)
function letterToIndex(letter) {
  if (!letter) return null;
  const normalized = letter.trim().toUpperCase();
  const mapping = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
  return mapping[normalized];
}

// Actual API call to fetch questions
async function fetchQuestionsFromAPI(subject) {
  const response = await fetch(`${API_URL}?action=getQuestions&subject=${encodeURIComponent(subject)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch questions (Status: ${response.status})`);
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to fetch questions");
  }
  
  if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
    throw new Error("No questions available for this subject");
  }
  
  return data.questions.map(row => {
    if (!Array.isArray(row) || row.length < 7) {
      throw new Error("Invalid question format received from server");
    }
    
    // Parse the answer from letter format (A, B, C, D)
    const answerIndex = letterToIndex(row[5]);
    if (answerIndex === null) {
      console.error('Invalid answer letter:', row[5]);
      throw new Error("Invalid answer format received from server. Expected A, B, C, or D");
    }
    
    return {
      question: row[0] || "Question not available",
      options: [
        row[1] || "Option not available",
        row[2] || "Option not available",
        row[3] || "Option not available",
        row[4] || "Option not available"
      ],
      answer: answerIndex,
      explanation: row[6] || 'No explanation available'
    };
  });
}

export async function fetchQuestions(subject) {
  try {
    // Check cache first
    const cachedQuestions = cache.questions.get(subject);
    const timestamp = cache.timestamp.get(`questions_${subject}`);
    
    if (cachedQuestions && timestamp && (Date.now() - timestamp < cache.CACHE_DURATION)) {
      return cachedQuestions;
    }

    const questions = await fetchQuestionsFromAPI(subject);
    
    // Update cache
    cache.questions.set(subject, questions);
    cache.timestamp.set(`questions_${subject}`, Date.now());
    
    // Preload questions for other subjects in the background
    subjects.forEach(s => {
      if (s.id !== subject) {
        preloadQuestions(s.id);
      }
    });

    return questions;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw new Error(error.message || "Failed to fetch questions");
  }
}

export async function fetchAllSubjects() {
  try {
    // Check cache first
    if (cache.subjects && cache.timestamp.get('subjects') && 
        (Date.now() - cache.timestamp.get('subjects') < cache.CACHE_DURATION)) {
      return cache.subjects;
    }

    const response = await fetch(`${API_URL}?action=getAllSubjects`);
    if (!response.ok) {
      throw new Error(`Failed to fetch subjects (Status: ${response.status})`);
    }
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to fetch subjects");
    }

    // Update cache
    cache.subjects = data.subjects;
    cache.timestamp.set('subjects', Date.now());
    
    // Preload first subject's questions
    if (data.subjects.length > 0) {
      preloadQuestions(data.subjects[0].id);
    }

    return data.subjects;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw new Error(error.message || "Failed to fetch subjects");
  }
}

export async function saveScore(playerName, subject, score) {
  try {
    if (!playerName || !subject || score === undefined) {
      throw new Error("Missing required parameters for saving score");
    }

    const formData = new URLSearchParams();
    formData.append('action', 'saveScore');
    formData.append('name', playerName.trim());
    formData.append('score', score.toString());
    formData.append('subject', subject);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    const responseText = await response.text();
    if (responseText.includes('success')) {
      // Invalidate leaderboard cache for this subject
      cache.leaderboard.delete(subject);
      return { success: true };
    }

    throw new Error('Failed to save score: ' + responseText);
  } catch (error) {
    console.error('Error saving score:', error);
    throw error;
  }
}

export async function fetchLeaderboard(subject) {
  try {
    if (!subject) {
      throw new Error("Subject is required for fetching leaderboard");
    }

    // Check cache first
    const cachedLeaderboard = cache.leaderboard.get(subject);
    const timestamp = cache.timestamp.get(`leaderboard_${subject}`);
    
    if (cachedLeaderboard && timestamp && (Date.now() - timestamp < cache.CACHE_DURATION)) {
      return cachedLeaderboard;
    }

    const params = new URLSearchParams({
      action: 'getLeaderboard',
      subject: subject
    });

    const response = await fetch(`${API_URL}?${params}`);
    const data = await response.json();
    
    if (!data.success) {
      console.log('Leaderboard fetch failed:', data.error);
      return [];
    }

    const leaderboard = data.entries
      .filter(entry => entry && entry.name && entry.score !== undefined)
      .map(entry => ({
        name: entry.name,
        score: typeof entry.score === 'string' ? parseInt(entry.score, 10) : entry.score
      }))
      .sort((a, b) => b.score - a.score);

    // Update cache
    cache.leaderboard.set(subject, leaderboard);
    cache.timestamp.set(`leaderboard_${subject}`, Date.now());

    return leaderboard;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

export async function createSubject(subjectData) {
  try {
    const formData = new URLSearchParams();
    formData.append('action', 'createSubject');
    formData.append('subject', subjectData.name);
    formData.append('questions', JSON.stringify(subjectData.questions || []));

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    const data = await response.json();
    if (data.success) {
      // Invalidate subjects cache
      cache.subjects = null;
      cache.timestamp.delete('subjects');
      return { success: true };
    }

    throw new Error(data.error || "Failed to create subject");
  } catch (error) {
    console.error('Error creating subject:', error);
    throw new Error(error.message || "Failed to create subject");
  }
}

export async function addQuestion(subject, questionData) {
  try {
    const formData = new URLSearchParams();
    formData.append('action', 'addQuestion');
    formData.append('subject', subject);
    formData.append('question', questionData.question);
    formData.append('options', JSON.stringify(questionData.options));
    formData.append('answer', questionData.answer);
    formData.append('explanation', questionData.explanation);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    const data = await response.json();
    if (data.success) {
      // Invalidate questions cache for this subject
      cache.questions.delete(subject);
      cache.timestamp.delete(`questions_${subject}`);
      return { success: true };
    }

    throw new Error(data.error || "Failed to add question");
  } catch (error) {
    console.error('Error adding question:', error);
    throw new Error(error.message || "Failed to add question");
  }
}