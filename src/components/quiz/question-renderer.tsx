'use client';

import { VoiceRecorder } from './voice-recorder';
import type { Question, Answer } from '@/lib/supabase/types';

interface QuestionRendererProps {
  question: Question & { answers: Answer[] };
  selectedAnswerId: string | null;
  answerText: string;
  onAnswerSelect: (answerId: string) => void;
  onTextChange: (text: string) => void;
  onVoiceUpload?: (blob: Blob) => void;
  questionIndex: number;
  totalQuestions: number;
}

export function QuestionRenderer({
  question, selectedAnswerId, answerText, onAnswerSelect, onTextChange, onVoiceUpload, questionIndex, totalQuestions
}: QuestionRendererProps) {
  const isMCQ = question.type === 'mcq';
  const isSpeaking = question.type === 'speaking';
  const sortedAnswers = [...question.answers].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Bagian {questionIndex + 1} dari {totalQuestions}
          </span>
          <p className="text-2xl font-headline font-black text-slate-800 leading-tight mt-2">{question.question_text}</p>
        </div>
      </div>

      {isMCQ ? (
        <div className="grid grid-cols-1 gap-3 mt-8">
          {sortedAnswers.map((answer, idx) => {
            const char = String.fromCharCode(65 + idx);
            const isSelected = selectedAnswerId === answer.id;
            return (
              <label
                key={answer.id}
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-lg scale-[1.01]'
                    : 'border-slate-50 hover:border-slate-200 bg-slate-50/30'
                }`}
              >
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  checked={isSelected}
                  onChange={() => onAnswerSelect(answer.id)}
                  className="hidden"
                />
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-colors ${
                    isSelected ? 'bg-primary text-white' : 'bg-white text-slate-400 border border-slate-100'
                }`}>
                    {char}
                </div>
                <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-slate-600'}`}>{answer.answer_text}</span>
              </label>
            );
          })}
        </div>
      ) : isSpeaking ? (
        <div className="mt-8">
           <VoiceRecorder onRecordingComplete={(blob) => onVoiceUpload?.(blob)} />
        </div>
      ) : (
        <textarea
          className="w-full min-h-[200px] rounded-2xl border-2 border-slate-50 bg-slate-50/30 p-6 text-base font-medium mt-8 focus:outline-none focus:border-primary/30 transition-all resize-y"
          placeholder="Tulis jawaban esai Anda di sini..."
          value={answerText}
          onChange={(e) => onTextChange(e.target.value)}
        />
      )}
    </div>
  );
}

