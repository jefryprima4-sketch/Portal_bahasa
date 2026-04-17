import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { quiz_id, answers, tab_switch_count } = body as {
      quiz_id: string;
      answers: { question_id: string; answer_id: string | null; answer_text: string | null }[];
      tab_switch_count?: number;
    };

    if (!quiz_id || !answers?.length) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate quiz exists
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id, title, duration, passing_grade')
      .eq('id', quiz_id)
      .single();

    if (quizError || !quiz) {
      return new Response(JSON.stringify({ error: 'Quiz not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check timer still valid (if duration exceeds elapsed, reject)
    const elapsed = body.elapsed_seconds as number | undefined;
    if (elapsed !== undefined && elapsed >= quiz.duration * 60) {
      // Allow submit even if time expired (auto-submit case)
      console.log('Submitting after time expired, allowing...');
    }

    // Create submission
    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .insert({
        quiz_id,
        student_id: user.id,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        tab_switch_count: tab_switch_count || 0,
      })
      .select()
      .single();

    if (subError) {
      return new Response(
        JSON.stringify({ error: 'Submission already exists or error creating submission', details: subError.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch correct answers for all questions
    const questionIds = answers.map((a) => a.question_id);
    const { data: correctAnswers, error: answersFetchError } = await supabase
      .from('answers')
      .select('id, question_id, is_correct')
      .in('question_id', questionIds);

    if (answersFetchError) {
      console.error('Failed to fetch answers:', answersFetchError);
      return new Response(JSON.stringify({ error: 'Grading failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build answer grading map
    const correctAnswerMap = new Map<string, string>();
    for (const ans of correctAnswers || []) {
      if (ans.is_correct) {
        correctAnswerMap.set(ans.question_id, ans.id);
      }
    }

    // Grade answers and save
    let correctCount = 0;
    let totalMCQQuestions = 0;
    const answersToInsert = [];

    for (const userAnswer of answers) {
      const submissionAnswer: Record<string, unknown> = {
        submission_id: submission.id,
        question_id: userAnswer.question_id,
      };

      if (userAnswer.answer_id) {
        totalMCQQuestions++;
        submissionAnswer.answer_id = userAnswer.answer_id;
        if (correctAnswerMap.get(userAnswer.question_id) === userAnswer.answer_id) {
          correctCount++;
        }
      } else if (userAnswer.answer_text) {
        submissionAnswer.answer_text = userAnswer.answer_text;
      }

      answersToInsert.push(submissionAnswer);
    }

    if (answersToInsert.length > 0) {
      const { error: insertAnswersError } = await supabase
        .from('submission_answers')
        .insert(answersToInsert);

      if (insertAnswersError) {
        console.error('Failed to insert answers:', insertAnswersError);
      }
    }

    const score = totalMCQQuestions > 0 ? Math.round((correctCount / totalMCQQuestions) * 10000) / 100 : 0;

    // Update submission with score
    await supabase
      .from('submissions')
      .update({ score })
      .eq('id', submission.id);

    return new Response(
      JSON.stringify({
        success: true,
        score,
        correct: correctCount,
        total_questions: totalMCQQuestions,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Submit quiz error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
