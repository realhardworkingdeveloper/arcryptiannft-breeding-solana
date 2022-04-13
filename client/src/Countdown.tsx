import { useEffect, useState } from 'react';
import { BreedingStatus, getTimeLeft } from './utils';

import './countdown.css';

export const Countdown = ({
  remain,
  setBreedingStatus
} : {
  remain: number;
  setBreedingStatus: (val: BreedingStatus) => void;
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(remain);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(remain));

  useEffect(() => {
    const timer = setTimeout(() => {
      if(timeRemaining > 1) {
        let update = timeRemaining - 1;
        setTimeLeft(getTimeLeft(update));
        setTimeRemaining(update);
      } else {
        setBreedingStatus({
          status: 'READYTOMINT'
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeRemaining]);

  useEffect(() => {
    setTimeRemaining(remain);
  }, [remain]);

  return (
    <>
      <h2>Ready to Breed In</h2>
      <div className="countdown">
        
        <div className="countdown-item">
          <span className="value">{String(timeLeft.days).padStart(2, '0')}</span>
          <span className="label">Days</span>
        </div>

        <div className="countdown-item">
          <span className="value">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="label">Hours</span>
        </div>

        <div className="countdown-item">
          <span className="value">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="label">Mins</span>
        </div>

        <div className="countdown-item">
          <span className="value">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="label">Secs</span>
        </div>
      </div>
    </>
  );
};
