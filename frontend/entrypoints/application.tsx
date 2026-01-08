// app/frontend/entrypoints/application.tsx
import React from "react"
import { createRoot } from "react-dom/client"

const App = () => (
  <div>
    <h1>Race Day</h1>
  </div>
)

const container = document.getElementById("app")
if (container) {
  createRoot(container).render(<App />)
}
