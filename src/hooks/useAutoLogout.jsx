
import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useAutoLogout = (timeoutMinutes = 15, warningMinutes = 2) => {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(warningMinutes * 60);
  const logoutTimer = useRef(null);
  const warningTimer = useRef(null);
  const countdownInterval = useRef(null);

  const logout = useCallback(() => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userInfo');
    navigate('/login', { state: { message: 'Inactivity ke karan logout ho gaye.' } });
  }, [navigate]);

  const resetTimer = useCallback(() => {
    clearTimeout(logoutTimer.current);
    clearTimeout(warningTimer.current);
    clearInterval(countdownInterval.current);
    setShowWarning(false);
    setCountdown(warningMinutes * 60);
  
    warningTimer.current = setTimeout(() => {
      setShowWarning(true);
      let secs = warningMinutes * 60;
      countdownInterval.current = setInterval(() => {
        secs -= 1;
        setCountdown(secs);
        if (secs <= 0) clearInterval(countdownInterval.current);
      }, 1000);
    }, (timeoutMinutes - warningMinutes) * 60 * 1000);

    logoutTimer.current = setTimeout(logout, timeoutMinutes * 60 * 1000);
  }, [logout, timeoutMinutes, warningMinutes]);

  
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    resetTimer();
    events.forEach(e => window.addEventListener(e, resetTimer));
    return () => {
      clearTimeout(logoutTimer.current);
      clearTimeout(warningTimer.current);
      clearInterval(countdownInterval.current);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [resetTimer]);

  return { showWarning, countdown, resetTimer };
};

export default useAutoLogout;