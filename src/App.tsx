import { FirstPage } from "./components/FirstPage";
// import invoke from tauri
import { invoke } from "@tauri-apps/api/core";

function App() {
  const handleAction = async () => {
    try {
      const certificate = await invoke("get_public_certificate");
      console.log(certificate);

    } catch (error) {
      console.error("Error invoking get_public_certificate:", error);
    }
  };

  return (
    <>
      <FirstPage />
      <button onClick={handleAction}>Get Public Certificate</button>
    </>
  );
}

export default App;
