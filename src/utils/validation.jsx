export const validatePassword = (password) => {
  if (!/[!@#$%^&*]/.test(password)) {
    return 'Password mein kam se kam 1 special character hona chahiye (!@#$%^&*)';
  }
  return '';
};