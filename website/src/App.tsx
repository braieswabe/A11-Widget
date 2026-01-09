import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import GettingStarted from './pages/GettingStarted'
import Tutorials from './pages/Tutorials'
import Examples from './pages/Examples'
import Download from './pages/Download'
import Docs from './pages/Docs'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/getting-started" element={<GettingStarted />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/examples" element={<Examples />} />
          <Route path="/download" element={<Download />} />
          <Route path="/docs" element={<Docs />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App

