// src/lib/utils.js

// Format date to a readable string
export function formatDate(dateString) {
    if (!dateString) return '';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  // Format date and time to a readable string
  export function formatDateTime(dateString) {
    if (!dateString) return '';
    
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  }
  
  // Truncate text to a specified length
  export function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
  
  // Get status color class based on application status
  export function getStatusColor(status) {
    switch (status) {
      case 'received':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'hired':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  
  // Get status icon based on application status
  export function getStatusIcon(status) {
    switch (status) {
      case 'received':
        return '📥';
      case 'reviewed':
        return '👁️';
      case 'shortlisted':
        return '⭐';
      case 'rejected':
        return '❌';
      case 'hired':
        return '✅';
      default:
        return '❓';
    }
  }
  
  // Generate a random color for charts
  export function generateRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }
  
  // Calculate percentage
  export function calculatePercentage(value, total) {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  }
  
  // Format file size to human readable format
  export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // Validate email format
  export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  // Debounce function to limit how often a function can be called
  export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Capitalize first letter of a string
  export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  // Convert status to more readable format
  export function formatStatus(status) {
    if (!status) return '';
    return status.split('_').map(word => capitalizeFirstLetter(word)).join(' ');
  }
  
  // Generate a unique ID
  export function generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
  
  // Format phone number
  export function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return '';
    
    // Remove all non-digit characters
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    
    // Check if the input is of correct length
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    
    return phoneNumber;
  }
  
  // Check if a value is empty (null, undefined, empty string, empty array, empty object)
  export function isEmpty(value) {
    if (value == null) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }
  
  // Deep clone an object
  export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
      const clonedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  }
  
  // Get file extension from filename
  export function getFileExtension(filename) {
    if (!filename) return '';
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
  }
  
  // Check if file is a valid resume type
  export function isValidResumeType(filename) {
    if (!filename) return false;
    const extension = getFileExtension(filename).toLowerCase();
    const validTypes = ['pdf', 'doc', 'docx'];
    return validTypes.includes(extension);
  }
  
  // Format score with color coding
  export function getScoreColor(score) {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }
  
  // Format similarity score with color coding
  export function getSimilarityColor(score) {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  }
  
  // Convert score to rating (1-5 stars)
  export function scoreToRating(score) {
    if (score >= 90) return 5;
    if (score >= 70) return 4;
    if (score >= 50) return 3;
    if (score >= 30) return 2;
    return 1;
  }
  
  // Generate star rating display
  export function renderStarRating(score) {
    const rating = scoreToRating(score);
    let stars = '';
    
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars += '★';
      } else {
        stars += '☆';
      }
    }
    
    return stars;
  }
  
  // Format number with commas
  export function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  
  // Calculate time difference in human readable format
  export function timeAgo(date) {
    if (!date) return '';
    
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return Math.floor(seconds) + " seconds ago";
  }