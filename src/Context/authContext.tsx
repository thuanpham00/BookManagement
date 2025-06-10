import { createContext, useState } from "react"
import { getFlagFromLS } from "src/Helpers/auth"

type Props = {
  children: React.ReactNode
}

type TypeInitialState = {
  isAuthenticated: boolean
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
}

// giá trị khởi tạo cho state global
const initialStateContext: TypeInitialState = {
  isAuthenticated: Boolean(getFlagFromLS()),
  setIsAuthenticated: () => null
}

export const AppContext = createContext<TypeInitialState>(initialStateContext)

export default function AppClientProvider({ children }: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialStateContext.isAuthenticated)

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
