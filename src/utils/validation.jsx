export const validatePassword = (password) => {
  if (!/[!@#$%^&*]/.test(password)) {
    return 'Password must be one special character';
  }
  return '';
};