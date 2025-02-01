import { createRoot } from "react-dom/client";

import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import BattleCreate from "./page/BattleRoom/BattleCreatingPage.jsx";
import BattleWaiting from "./page/BattleRoom/BattleRoomPage.jsx";
import BattleMainPage from "./page/BattleRoom/BattleMainPage.jsx";
import ItemShopPage from "./page/ItemShop/ItemShopPage.jsx";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/battle-list", element: <BattleMainPage /> },
  { path: "/create-battle-room", element: <BattleCreate /> },
  { path: "/battle-room/:battleId", element: <BattleWaiting /> },
  { path: "/store", element: <ItemShopPage /> },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
