import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import BattleCreate from './components/BattleRoom/BattleCreating.jsx'
import BattleWaiting from './components/BattleRoom/BattleWaiting.jsx'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path:'create-battle-room', element: <BattleCreate /> },
  { path: '/battle-room/:battleId', element: <BattleWaiting /> },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
  </StrictMode>,
)
