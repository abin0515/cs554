
const checkName = (name) => {
  if (!name || typeof name !== 'string') {
    throw new Error('Name must be provided and be a string.');
  }
  const trimmed = name.trim();
  if (trimmed.length < 5 || trimmed.length > 25) {
    throw new Error('Name must be between 5 and 25 characters long.');
  }
 
  const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
  if (!nameRegex.test(trimmed)) {
    throw new Error('Name contains invalid characters.');
  }
  return trimmed;
};

const checkUsername = (username) => {
  if (!username || typeof username !== 'string') {
    throw new Error('Username must be provided and be a string.');
  }
  const trimmed = username.trim();
  if (trimmed.length < 5) {
    throw new Error('Username must be at least 5 characters long.');
  }
  
  const usernameRegex = /^[A-Za-z0-9]+$/;
  if (!usernameRegex.test(trimmed)) {
    throw new Error('Username can only contain letters or digits (no spaces/special chars).');
  }

  if (/^\d+$/.test(trimmed)) {
    throw new Error('Username cannot be only digits; must contain at least one letter.');
  }
  return trimmed;
};

const checkPassword = (password) => {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be provided and be a string.');
  }
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  if (!/[a-z]/.test(password)) throw new Error('Password must contain at least one lowercase letter.');
  if (!/[A-Z]/.test(password)) throw new Error('Password must contain at least one uppercase letter.');
  if (!/[0-9]/.test(password)) throw new Error('Password must contain at least one digit.');
  if (!/[^a-zA-Z0-9]/.test(password)) throw new Error('Password must contain at least one special character.');
  if (/\s/.test(password)) throw new Error('Password must not contain spaces.');

  return password;
};


const checkPostText = (postText) => {
  if (!postText || typeof postText !== 'string') {
    throw new Error('Post text must be provided and be a string.');
  }
  const trimmed = postText.trim();
  if (trimmed.length < 30) {
    throw new Error('Post text must be at least 30 characters long.');
  }
  if (trimmed.length > 255) {
    throw new Error('Post text cannot exceed 255 characters.');
  }
  return trimmed;
};


const validMoods = [
  'Happy', 'Sad', 'Angry', 'Excited', 'Surprised', 'Loved', 'Blessed', 'Greatful',
  'Blissful', 'Silly', 'Chill', 'Motivated', 'Emotional', 'Annoyed', 'Lucky', 'Determined',
  'Bored', 'Hungry', 'Disappointed', 'Worried', 'Embarrassed', 'Playful', 'Anxious',
  'Joyful', 'Proud', 'Lazy', 'Sleepy', 'Uneasy', 'Scared'
];

const checkPostMood = (mood) => {
  if (!mood || typeof mood !== 'string') {
    throw new Error('Mood must be provided and be a string.');
  }

  const formatted = mood.trim().toLowerCase();
  const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1);

  if (!validMoods.includes(capitalized)) {
    throw new Error('Invalid mood provided.');
  }
  return capitalized;
};


const checkReply = (replyText) => {
  if (!replyText || typeof replyText !== 'string') {
    throw new Error('Reply text must be provided and be a string.');
  }
  const trimmed = replyText.trim();
  if (trimmed.length < 15) {
    throw new Error('Reply text must be at least 15 characters long.');
  }
  if (trimmed.length > 255) {
    throw new Error('Reply text cannot exceed 255 characters.');
  }
  return trimmed;
};


const formatDateTime = () => {
  const now = new Date();
  let month = now.getMonth() + 1; 
  let day = now.getDate();
  let year = now.getFullYear();
  let hour = now.getHours();
  let minutes = now.getMinutes();

  // AM / PM
  const ampm = hour >= 12 ? 'PM' : 'AM';

  hour = hour % 12;
  hour = hour === 0 ? 12 : hour;

  month = month < 10 ? `0${month}` : month;
  day = day < 10 ? `0${day}` : day;
  let minStr = minutes < 10 ? `0${minutes}` : minutes;

  return `${month}/${day}/${year} ${hour}:${minStr}${ampm}`;
};

export default {
  checkName,
  checkUsername,
  checkPassword,
  checkPostText,
  checkPostMood,
  checkReply,
  formatDateTime
};
