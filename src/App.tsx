import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Layers, 
  CheckCircle, 
  ArrowRight, 
  RotateCcw, 
  BrainCircuit, 
  ChevronLeft, 
  ChevronRight,
  ClipboardList,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { explainTopicStream, generateFlashcards, generateQuiz } from './lib/gemini';
import { Flashcard, QuizQuestion, TabType } from './types';

export default function App() {
  const [topic, setTopic] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('explain');
  const [results, setResults] = useState<{
    explanation: string;
    flashcards: Flashcard[];
    quiz: QuizQuestion[];
  } | null>(null);

  const startCoaching = async () => {
    if (!topic.trim()) return;
    setIsProcessing(true);
    setResults(null);
    setActiveTab('explain');

    try {
      setResults({
        explanation: '',
        flashcards: [],
        quiz: []
      });

      let fullExplanation = '';
      const stream = explainTopicStream(topic);
      for await (const chunk of stream) {
        fullExplanation += chunk || '';
        setResults(prev => prev ? { ...prev, explanation: fullExplanation } : null);
      }

      const [flashcards, quiz] = await Promise.all([
        generateFlashcards(topic),
        generateQuiz(topic)
      ]);

      setResults(prev => prev ? { ...prev, flashcards, quiz } : null);
    } catch (error) {
      console.error("Coaching failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setTopic('');
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-bg text-zinc-100 flex flex-col p-6 gap-6 selection:bg-accent/30">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Socratic AI <span className="text-zinc-500 font-medium">Study Coach</span>
            </h1>
            {results && (
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                AI Active • {topic.slice(0, 30)}{topic.length > 30 ? '...' : ''}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-4 items-center">
          {results && (
            <button 
              onClick={reset}
              className="text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              New Session
            </button>
          )}
          <div className="hidden sm:flex items-center gap-2 bg-surface border border-border px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tight">Engine Stable</span>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {!results ? (
            <motion.div 
              key="input-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="max-w-2xl mx-auto h-full flex flex-col justify-center py-20"
            >
              <div className="text-center mb-8 space-y-4">
                <div className="inline-flex p-4 bg-accent/10 rounded-2xl mb-4">
                  <Sparkles className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-4xl font-bold tracking-tight">What are we studying?</h2>
                <p className="text-zinc-400">Paste your raw notes or a complex topic to begin.</p>
              </div>

              <div className="bento-card p-6 space-y-4 bg-surface/30">
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Paste study material here..."
                  className="w-full h-64 bg-bg border border-border rounded-xl p-4 text-zinc-300 resize-none focus:outline-none focus:border-accent transition-all text-lg placeholder:text-zinc-700"
                />
                <button
                  onClick={startCoaching}
                  disabled={!topic.trim() || isProcessing}
                  className="w-full py-4 bg-accent text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-accent-hover transition-all shadow-xl shadow-accent/20"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Process with AI <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full pb-8">
              {/* Left Column: Context & Stats */}
              <div className="md:col-span-4 flex flex-col gap-6">
                <div className="bento-card flex flex-col flex-grow p-5 gap-4">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Material</label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="flex-grow bg-bg/50 border border-border rounded-xl p-4 text-sm text-zinc-400 resize-none focus:outline-none focus:border-accent"
                  />
                  <button 
                    onClick={startCoaching}
                    disabled={isProcessing}
                    className="py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold border border-zinc-700 transition-colors uppercase tracking-widest"
                  >
                    Update Content
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bento-card p-4 flex flex-col justify-between h-32">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Mastery</span>
                    <span className="text-3xl font-bold text-accent">0%</span>
                  </div>
                  <div className="bento-card p-4 flex flex-col justify-between h-32">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Goal</span>
                    <span className="text-3xl font-bold text-zinc-400">100%</span>
                  </div>
                </div>
              </div>

              {/* Right Column: AI Output Tabs */}
              <div className="md:col-span-8 bento-card flex flex-col">
                <nav className="flex border-b border-border bg-surface/30">
                  {(['explain', 'flashcards', 'quiz'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${
                        activeTab === tab 
                          ? 'border-b-2 border-accent text-white' 
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>

                <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                  <AnimatePresence mode="wait">
                    {activeTab === 'explain' && (
                      <motion.div
                        key="explain"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="prose prose-invert max-w-none"
                      >
                        <div className="markdown-body">
                          <ReactMarkdown>{results.explanation || "Synthesizing information..."}</ReactMarkdown>
                        </div>
                        {isProcessing && !results.explanation && (
                          <div className="flex items-center gap-3 text-sm text-zinc-500 italic mt-8">
                            <span className="w-1 h-4 bg-accent animate-pulse"></span>
                            AI is structuring your explanation...
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === 'flashcards' && (
                      <FlashcardsTab cards={results.flashcards} isLoading={isProcessing && results.flashcards.length === 0} />
                    )}

                    {activeTab === 'quiz' && (
                      <QuizTab questions={results.quiz} isLoading={isProcessing && results.quiz.length === 0} />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-auto flex items-center justify-between text-[10px] text-zinc-600 uppercase tracking-widest font-bold pt-4 border-t border-border">
        <span>© 2024 SOCRATIC AI SYSTEMS</span>
        <div className="hidden md:flex gap-6">
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500/20" /> Latency: Optimizing</span>
          <span>Buffer: Checked</span>
        </div>
      </footer>
    </div>
  );
}

function FlashcardsTab({ cards, isLoading }: { cards: Flashcard[], isLoading: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="w-8 h-8 text-accent animate-spin" />
        <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Generating Cards...</p>
      </div>
    );
  }

  if (!cards || cards.length === 0) return null;

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-xl mx-auto h-full flex flex-col justify-center gap-8">
      <div 
        className="relative h-80 w-full cursor-pointer group" 
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ perspective: '1200px' }}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <div 
            className="absolute inset-0 bg-zinc-950 border border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest mb-4">Question {currentIndex + 1}</span>
            <h3 className="text-xl font-bold tracking-tight text-zinc-200">{currentCard.front}</h3>
            <div className="absolute bottom-6 flex items-center gap-2 text-zinc-600 text-[10px] uppercase font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              <RefreshCw className="w-3 h-3" /> Click to flip
            </div>
          </div>

          {/* Back */}
          <div 
            className="absolute inset-0 bg-accent rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl border border-white/10"
            style={{ 
              backfaceVisibility: 'hidden', 
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(135deg, var(--color-accent) 0%, #312e81 100%)'
            }}
          >
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-4">Explanation</span>
            <p className="text-lg font-medium text-white leading-relaxed">{currentCard.back}</p>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-between">
        <button 
          onClick={() => { setIsFlipped(false); setCurrentIndex(p => (p - 1 + cards.length) % cards.length); }}
          className="p-3 rounded-xl bg-surface border border-border hover:border-zinc-500 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">{currentIndex + 1} / {cards.length}</span>
        <button 
           onClick={() => { setIsFlipped(false); setCurrentIndex(p => (p + 1) % cards.length); }}
           className="p-3 rounded-xl bg-surface border border-border hover:border-zinc-500 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function QuizTab({ questions, isLoading }: { questions: QuizQuestion[], isLoading: boolean }) {
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(5).fill(null));
  const [showResults, setShowResults] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="w-8 h-8 text-accent animate-spin" />
        <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Validating Knowledge...</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) return null;

  const score = answers.reduce((acc, curr, idx) => curr === questions[idx].correctAnswer ? acc! + 1 : acc!, 0);

  return (
    <div className="max-w-2xl mx-auto space-y-12">
      {showResults && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 bg-accent/10 border border-accent/20 rounded-3xl text-center space-y-4"
        >
          <div className="text-4xl font-black text-accent">{score}/5</div>
          <h3 className="text-xl font-bold uppercase tracking-widest">
            {score === 5 ? "Perfect Score!" : score >= 3 ? "Knowledge Verified" : "Review Required"}
          </h3>
          <button 
            onClick={() => { setShowResults(false); setAnswers(new Array(5).fill(null)); }}
            className="px-6 py-2 bg-accent hover:opacity-90 rounded-lg text-xs font-bold uppercase tracking-widest"
          >
            Reset Quiz
          </button>
        </motion.div>
      )}

      <div className="space-y-6">
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="space-y-4">
            <h4 className="text-sm font-bold flex gap-3 text-zinc-400">
              <span className="text-accent font-mono">0{qIdx + 1}</span> {q.question}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map((option, oIdx) => {
                const isSelected = answers[qIdx] === oIdx;
                const isCorrect = q.correctAnswer === oIdx;
                
                let borderColor = 'border-border';
                let bgColor = 'bg-zinc-950/30';
                
                if (showResults) {
                  if (isCorrect) {
                     borderColor = 'border-green-500';
                     bgColor = 'bg-green-500/10';
                  } else if (isSelected) {
                     borderColor = 'border-red-500';
                     bgColor = 'bg-red-500/10';
                  }
                } else if (isSelected) {
                  borderColor = 'border-accent';
                  bgColor = 'bg-accent/5';
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => !showResults && setAnswers(prev => {
                      const next = [...prev];
                      next[qIdx] = oIdx;
                      return next;
                    })}
                    className={`p-4 rounded-xl text-left text-xs font-medium border transition-all ${borderColor} ${bgColor} ${!showResults && 'hover:border-zinc-500'}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!showResults && (
        <button
          onClick={() => setShowResults(true)}
          disabled={answers.some(a => a === null)}
          className="w-full py-4 bg-zinc-100 text-zinc-950 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all disabled:opacity-20"
        >
          Submit Evaluation
        </button>
      )}
    </div>
  );
}
