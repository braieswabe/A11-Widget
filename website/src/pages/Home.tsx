import { useState } from 'react'
import './Pages.css'

export default function Home() {
  const [notes, setNotes] = useState<string[]>([
    'The appointment reminder was updated at 9:15 AM.',
    'A new billing question was assigned to the support queue.'
  ])

  const addDemoNote = () => {
    setNotes((current) => [
      `Dynamic note ${current.length + 1}: this text was added after the page loaded and should still be detected by the widget.`,
      ...current
    ])
  }

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Accessibility Widget Demo</h1>
          <p>
            Use the widget on this page to test text size, spacing, contrast, translation,
            reading tools, support reporting, and personalized tool ordering.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Sample Service Dashboard</h2>
          <p className="text-center">
            This page is intentionally filled with common website content so the widget can
            manipulate real headings, paragraphs, links, buttons, forms, tables, and dynamic text.
          </p>

          <div className="features-grid" style={{ marginTop: '2rem' }}>
            <article className="feature-item" title="Example summary card">
              <div className="feature-icon" aria-label="Calendar icon">📅</div>
              <h3>Today&apos;s Schedule</h3>
              <p>
                Three customer calls, two document reviews, and one training session are planned
                for this afternoon.
              </p>
              <button className="btn btn-secondary" type="button">Review schedule</button>
            </article>

            <article className="feature-item" title="Example alert card">
              <div className="feature-icon" aria-label="Warning icon">⚠️</div>
              <h3>Pending Follow-ups</h3>
              <p>
                Some requests need a response within the next business day. Try high contrast
                or larger text to inspect this content.
              </p>
              <button className="btn btn-primary" type="button">Open queue</button>
            </article>

            <article className="feature-item" title="Example translation card">
              <div className="feature-icon" aria-label="Language icon">🌐</div>
              <h3>Translation Sample</h3>
              <p>
                Translate this paragraph and the form below into your preferred language from
                the widget&apos;s Advanced Tools tab.
              </p>
              <button className="btn btn-secondary" type="button" onClick={addDemoNote}>
                Add dynamic text
              </button>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container container-narrow">
          <h2 className="section-title">Sample Intake Form</h2>
          <form className="card" aria-label="Demo intake form">
            <label htmlFor="demo-name">Full name</label>
            <input id="demo-name" type="text" placeholder="Enter your full name" title="Full name field" />

            <label htmlFor="demo-topic" style={{ marginTop: '1rem', display: 'block' }}>Request topic</label>
            <select id="demo-topic" defaultValue="billing">
              <option value="billing">Billing question</option>
              <option value="technical">Technical support</option>
              <option value="accessibility">Accessibility request</option>
            </select>

            <label htmlFor="demo-message" style={{ marginTop: '1rem', display: 'block' }}>Message</label>
            <textarea id="demo-message" rows={4} placeholder="Describe what you need help with" />

            <button className="btn btn-primary" type="button" style={{ marginTop: '1rem' }}>
              Submit sample request
            </button>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Sample Records</h2>
          <div className="card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>Client</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>Next action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.75rem' }}>North Clinic</td>
                  <td style={{ padding: '0.75rem' }}>Waiting for review</td>
                  <td style={{ padding: '0.75rem' }}>Confirm appointment details</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem' }}>Central Services</td>
                  <td style={{ padding: '0.75rem' }}>In progress</td>
                  <td style={{ padding: '0.75rem' }}>Send translated instructions</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem' }}>Community Desk</td>
                  <td style={{ padding: '0.75rem' }}>Completed</td>
                  <td style={{ padding: '0.75rem' }}>Archive support notes</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card" style={{ marginTop: '2rem' }}>
            <h3>Dynamic Activity Notes</h3>
            <ul>
              {notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
