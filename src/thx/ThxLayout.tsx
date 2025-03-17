import { useTimeout } from '../hooks/useTimeout';
import { thxSt } from './style.css';

export const ThxSpinner = () => {
  useTimeout(() => {
    window.location.replace(
      'alfabank://multistep-route?fromModule=FORM&stepNumber=0&alias=invest-long-term-savings-open-alias&prefilledDataID=1001&version=2',
    );
  }, 3500);
  return (
    <>
      <div className={thxSt.container} style={{ height: '100vh' }}>
        <div className={thxSt.loader} />
      </div>
    </>
  );
};
