import { HelmetProvider } from "react-helmet-async"
import { ToastContainer } from "react-toastify"
import useRouter from "./Routes/RouterApp"

function App() {
  const router = useRouter()

  return (
    <HelmetProvider>
      {router}
      <ToastContainer />
    </HelmetProvider>
  )
}

export default App
