import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import GettingStarted from './pages/GettingStarted'
import Download from './pages/Download'
import Features from './pages/Features'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/getting-started" element={<GettingStarted />} />
          <Route path="/download" element={<Download />} />
          <Route path="/features" element={<Features />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App

