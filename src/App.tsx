import { FirstPage } from './components/FirstPage';
import SignPopup from './components/SignPopup';
import CertPopup from './components/CertPopup';

function App() {
  if (window.location.href.includes('popup.html')) {
    return <SignPopup />;
  }

  if (window.location.href.includes('cert_pin.html')) {
    return <CertPopup />;
  }

  return (
    <>
      <FirstPage />
    </>
  );
}

export default App;
