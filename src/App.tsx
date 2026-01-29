// ============================================================================
// ### IMPORTS ###
// ============================================================================
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// ============================================================================
// ### COMPONENTS ###
// ============================================================================
import { AppShell } from './components/layout/AppShell'

// ============================================================================
// ### PAGES ###
// ============================================================================
import { GeneratorPage } from './pages/GeneratorPage'
import { RulesPage } from './pages/RulesPage'
import { TagsPage } from './pages/TagsPage'
import { ProjectsPage } from './pages/ProjectsPage'

// ============================================================================
// ### CUSTOM ###
// ============================================================================
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<GeneratorPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
