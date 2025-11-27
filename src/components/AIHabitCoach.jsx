import { useState } from 'react';
import { Wand2, Sparkles, X, Plus, Loader2, Brain } from 'lucide-react';
// New SDK service (primary)
import { generateHabitSuggestionsNew } from '../services/geminiNew';
// Legacy fallback service (optional)
import { generateHabitSuggestions } from '../services/gemini';

function AIHabitCoach({ onAddHabit, userId, existingHabits = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [persona, setPersona] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateSuggestions = async () => {
    if (!persona.trim()) {
      setError('Please describe who you want to be');
      return;
    }

    setLoading(true);
    setError('');
    setSuggestions([]);

    try {
      // Try new SDK first, fallback to legacy service if it fails
      let generatedHabits;
      try {
        generatedHabits = await generateHabitSuggestionsNew(persona, existingHabits);
      } catch (newErr) {
        console.warn('New SDK failed, falling back to legacy service:', newErr.message);
        generatedHabits = await generateHabitSuggestions(persona, existingHabits);
      }

      setSuggestions(generatedHabits);
      setLoading(false);
    } catch (err) {
      console.error('Error generating suggestions:', err);
      setError(err.message || 'Failed to generate suggestions. Please try again.');
      setLoading(false);
    }
  };

  const handleAddHabit = async (habit) => {
    try {
      await onAddHabit(habit.title, habit.goal);
      // Remove the added habit from suggestions
      setSuggestions(suggestions.filter(h => h.title !== habit.title));
    } catch (err) {
      console.error('Error adding habit:', err);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setPersona('');
    setSuggestions([]);
    setError('');
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20 dark:shadow-purple-500/30 text-sm sm:text-base"
      >
        <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>AI Coach</span>
        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/80 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">AI Habit Coach</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400">Powered by Google Gemini AI</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Input Section */}
              <div className="space-y-3">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-zinc-300">
                  Who do you want to be?
                </label>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                  <input
                    type="text"
                    value={persona}
                    onChange={(e) => setPersona(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !loading && generateSuggestions()}
                    placeholder="e.g., A writer, Fit and healthy, Stoic, Entrepreneur..."
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    disabled={loading}
                  />
                  <button
                    onClick={generateSuggestions}
                    disabled={loading || !persona.trim()}
                    className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg text-sm sm:text-base whitespace-nowrap"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span>Thinking...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                </div>
                {error && (
                  <p className="text-xs sm:text-sm text-red-500 dark:text-red-400">{error}</p>
                )}
              </div>

              {/* Example Personas */}
              {!suggestions.length && !loading && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 dark:text-zinc-500 uppercase font-medium">Try these:</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {['A writer', 'Fit and healthy', 'Stoic', 'Entrepreneur', 'Student', 'Developer', 'Creative artist'].map((example) => (
                      <button
                        key={example}
                        onClick={() => setPersona(example)}
                        className="px-2.5 sm:px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 text-xs sm:text-sm rounded-lg border border-gray-300 dark:border-zinc-700 transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-zinc-300">
                      AI-Generated Habits for "{persona}"
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-zinc-500">
                      {suggestions.length} suggestions
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {suggestions.map((habit, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-zinc-800/50 dark:to-zinc-800/30 border border-purple-200 dark:border-zinc-700 rounded-lg hover:border-purple-300 dark:hover:border-zinc-600 transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium truncate">{habit.title}</p>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400">
                            Goal: {habit.goal} days per month
                          </p>
                        </div>
                        <button
                          onClick={() => handleAddHabit(habit)}
                          className="flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-all shadow-sm whitespace-nowrap"
                        >
                          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Add</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={generateSuggestions}
                    disabled={loading}
                    className="w-full py-2.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 rounded-lg text-xs sm:text-sm font-medium transition-all border border-gray-300 dark:border-zinc-700 disabled:opacity-50"
                  >
                    🔄 Generate New Suggestions
                  </button>
                </div>
              )}

              {/* Info Footer */}
              <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-zinc-800">
                <div className="flex items-center justify-center space-x-2">
                  <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                  <p className="text-[10px] sm:text-xs text-gray-600 dark:text-zinc-500 text-center">
                    Powered by Google Gemini AI - Real personalized suggestions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AIHabitCoach;
