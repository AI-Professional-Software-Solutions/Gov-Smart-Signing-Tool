import { InitialScreen } from './components/InitialScreen'
import SignPopup from './components/SignPopup'
import CertPopup from './components/CertPopup'

function App() {
  if (window.location.href.includes('popup.html')) {
    return <SignPopup />
  }

  if (window.location.href.includes('cert_pin.html')) {
    return <CertPopup />
  }

  return (
    <>
      <InitialScreen />
    </>
  )
}

export default App
