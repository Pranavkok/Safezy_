export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserIdFromAuth } from '@/actions/user';
import { generateChecklistPdfBase64 } from '@/lib/generateChecklistPdf';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const userId = await getUserIdFromAuth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const submissionId = Number(params.id);
    if (isNaN(submissionId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('ehs_checklist_users')
      .select(`
        id,
        date,
        site_name,
        inspected_by,
        progress,
        header_values,
        ehs_checklist_topics(topic_name),
        ehs_checklist_done_questions(
          is_completed,
          remarks,
          ehs_checklist_questions(question, weightage)
        )
      `)
      .eq('id', submissionId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const d = data as any;
    const topicName: string = d.ehs_checklist_topics?.topic_name ?? 'Checklist';
    const progress: { date: string; progress: number }[] = d.progress ?? [];
    const latestScore = progress.length ? progress[progress.length - 1].progress : undefined;

    const answers = (d.ehs_checklist_done_questions ?? []).map((dq: any) => ({
      question: dq.ehs_checklist_questions?.question ?? '',
      weightage: dq.ehs_checklist_questions?.weightage ?? 0,
      answer: dq.is_completed ?? 'N/A',
      remark: dq.remarks ?? ''
    }));

    const pdfBase64 = await generateChecklistPdfBase64({
      topicName,
      siteName: d.site_name ?? '',
      inspectedBy: d.inspected_by ?? '',
      date: d.date ?? '',
      headerValues: d.header_values ?? [],
      answers,
      totalScore: latestScore
    });

    const buffer = Buffer.from(pdfBase64, 'base64');
    const safeName = topicName.replace(/[^a-zA-Z0-9_-]/g, '_');

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="EHS_Checklist_${safeName}.pdf"`,
        'Content-Length': buffer.length.toString()
      }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('PDF generation error:', msg, err);
    return NextResponse.json({ error: 'Failed to generate PDF', detail: msg }, { status: 500 });
  }
}
