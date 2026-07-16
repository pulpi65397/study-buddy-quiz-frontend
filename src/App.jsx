import { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5123'
const QUESTION_TYPES = [
  { value: 'MultipleChoice', label: 'Jednokrotny wybór' },
  { value: 'TrueFalse', label: 'Prawda/Fałsz' },
  { value: 'Open', label: 'Otwarte' },
  { value: 'FillBlank', label: 'Uzupełnianie luk' },
]

function App() {
  const [sourceMode, setSourceMode] = useState('text')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState(null)
  const [questionCount, setQuestionCount] = useState(5)
  const [selectedTypes, setSelectedTypes] = useState(['MultipleChoice', 'TrueFalse'])
  const [generatedQuiz, setGeneratedQuiz] = useState(null)
  const [history, setHistory] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const selectedTypeSummary = useMemo(() => {
    return selectedTypes.length > 0 ? selectedTypes.join(', ') : 'Brak typów'
  }, [selectedTypes])

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/quizzes/history`)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || 'Nie udało się pobrać historii.')
      }
      setHistory(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleType = (value) => {
    setSelectedTypes((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    )
  }

  const handleGenerate = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setSuccess('')

    try {
      let response

      if (sourceMode === 'text') {
        response = await fetch(`${API_URL}/api/quizzes/generate-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            questionCount,
            questionTypes: selectedTypes,
          }),
        })
      } else if (sourceMode === 'url') {
        response = await fetch(`${API_URL}/api/quizzes/generate-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            questionCount,
            questionTypes: selectedTypes,
          }),
        })
      } else {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('questionCount', String(questionCount))
        formData.append('questionTypes', selectedTypes.join(','))

        response = await fetch(`${API_URL}/api/quizzes/generate-file`, {
          method: 'POST',
          body: formData,
        })
      }

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || 'Nie udało się wygenerować quizu.')
      }

      setGeneratedQuiz(data)
      setSuccess('Quiz został wygenerowany. Przejrzyj pytania i zatwierdź/odrzuć je przed zapisem.')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const approveQuestion = async (questionId, approved) => {
    if (!generatedQuiz) {
      return
    }

    const question = generatedQuiz.questions.find((item) => item.id === questionId)
    if (!question) {
      return
    }

    setGeneratedQuiz((current) => ({
      ...current,
      questions: current.questions.map((item) =>
        item.id === questionId ? { ...item, isApproved: approved } : item,
      ),
    }))

    setSuccess(approved ? 'Pytanie zatwierdzone.' : 'Pytanie odrzucone.')
  }

  const saveQuiz = async () => {
    if (!generatedQuiz) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/quizzes/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedQuiz.title || 'Nowy quiz',
          sourceType: generatedQuiz.sourceType,
          sourceText: content || null,
          sourceUrl: url || null,
          questions: generatedQuiz.questions,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || 'Nie udało się zapisać quizu.')
      }

      setSuccess(`Quiz zapisany w bazie danych. ID: ${data.quizId}`)
      fetchHistory()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-4 py-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-950/20">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Study Buddy Quiz MVP</p>
          <h1 className="mt-3 text-4xl font-bold">Generuj quiz z tekstu, linku lub pliku</h1>
          <p className="mt-3 text-slate-300">
            Wersja MVP obejmuje: tworzenie quizu z treści, uploadu pliku, adresu URL, wybór typów
            pytań, zatwierdzanie/odrzucanie pytań i zapis do bazy.
          </p>

          <form onSubmit={handleGenerate} className="mt-6 space-y-5">
            <div className="flex flex-wrap gap-3">
              {['text', 'url', 'file'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSourceMode(mode)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    sourceMode === mode
                      ? 'bg-cyan-400 text-slate-950'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {mode === 'text' ? 'Tekst' : mode === 'url' ? 'Link' : 'Plik'}
                </button>
              ))}
            </div>

            {sourceMode === 'text' && (
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Wprowadź tekst</span>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={8}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-50 outline-none focus:border-cyan-400"
                  placeholder="Wklej treść do wygenerowania quizu..."
                />
              </label>
            )}

            {sourceMode === 'url' && (
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Adres URL</span>
                <input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-50 outline-none focus:border-cyan-400"
                  placeholder="https://example.com/artykul"
                />
              </label>
            )}

            {sourceMode === 'file' && (
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Wybierz plik PDF/DOCX/TXT</span>
                <input
                  type="file"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-50 outline-none focus:border-cyan-400"
                />
              </label>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Liczba pytań</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={questionCount}
                  onChange={(event) => setQuestionCount(Number(event.target.value))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-50 outline-none focus:border-cyan-400"
                />
              </label>

              <div>
                <span className="mb-2 block text-sm text-slate-300">Typy pytań</span>
                <div className="flex flex-wrap gap-2">
                  {QUESTION_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => toggleType(type.value)}
                      className={`rounded-full px-3 py-2 text-xs font-semibold ${
                        selectedTypes.includes(type.value)
                          ? 'bg-emerald-400 text-slate-950'
                          : 'bg-slate-800 text-slate-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-400">Wybrane: {selectedTypeSummary}</p>
              </div>
            </div>

            {error && <p className="rounded-2xl border border-rose-700 bg-rose-950/40 p-3 text-sm text-rose-300">{error}</p>}
            {success && <p className="rounded-2xl border border-emerald-700 bg-emerald-950/40 p-3 text-sm text-emerald-300">{success}</p>}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={busy}
                className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-50"
              >
                {busy ? 'Generowanie...' : 'Generuj quiz'}
              </button>

              <button
                type="button"
                onClick={saveQuiz}
                disabled={!generatedQuiz}
                className="rounded-2xl border border-emerald-400 px-5 py-3 font-semibold text-emerald-300 hover:bg-emerald-400/10 disabled:opacity-50"
              >
                Zapisz quiz
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="text-xl font-semibold">Wygenerowane pytania</h2>
            {generatedQuiz ? (
              <div className="mt-4 space-y-4">
                {generatedQuiz.questions.map((question, index) => (
                  <article key={question.id} className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Pytanie {index + 1}</p>
                        <h3 className="mt-2 text-base font-semibold">{question.text}</h3>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs ${question.isApproved ? 'bg-emerald-400/20 text-emerald-300' : 'bg-amber-400/20 text-amber-300'}`}>
                        {question.isApproved ? 'Zatwierdzone' : 'Do rozpatrzenia'}
                      </span>
                    </div>

                    {question.options?.length > 0 && (
                      <ul className="mt-3 list-disc pl-5 text-sm text-slate-300">
                        {question.options.map((option) => (
                          <li key={option}>{option}</li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => approveQuestion(question.id, true)}
                        className="rounded-full bg-emerald-400 px-3 py-2 text-xs font-semibold text-slate-950"
                      >
                        Zatwierdź
                      </button>
                      <button
                        type="button"
                        onClick={() => approveQuestion(question.id, false)}
                        className="rounded-full bg-rose-400 px-3 py-2 text-xs font-semibold text-slate-950"
                      >
                        Odrzuć
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">Wygenerowane pytania pojawią się tutaj po utworzeniu quizu.</p>
            )}
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="text-xl font-semibold">Historia zapisanych quizów</h2>
            <div className="mt-4 space-y-3">
              {history.length === 0 ? (
                <p className="text-sm text-slate-400">Brak zapisanych quizów.</p>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-700 bg-slate-950 p-3">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-slate-400">
                      {item.sourceType} • {new Date(item.createdAt).toLocaleString()} • {item.questionsCount} pytań
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
