import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
    if (!accessToken) return Response.json({ error: 'Google Drive not connected' }, { status: 400 });

    // Fetch all audit feedback
    const feedback = await base44.asServiceRole.entities.AuditFeedback.list('-created_date', 500);

    const now = new Date().toISOString();
    let content = `# Auditor Notes — Three-Pillar Security System\n\n`;
    content += `**Last Synced:** ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}\n`;
    content += `**Total Observations:** ${feedback.length}\n\n---\n\n`;

    feedback.forEach((f, i) => {
      content += `## Observation #${i + 1}\n\n`;
      content += `- **Auditor:** ${f.auditor_email || 'Unknown'}\n`;
      content += `- **Date:** ${f.session_date ? new Date(f.session_date).toLocaleString() : 'N/A'}\n`;
      content += `- **Category:** ${f.category || 'general'}\n`;
      content += `- **Severity:** ${f.severity || 'info'}\n`;
      content += `- **Status:** ${f.status || 'submitted'}\n\n`;
      content += `**Observation:**\n${f.observation || 'N/A'}\n\n`;
      if (f.admin_response) content += `**Admin Response:**\n${f.admin_response}\n\n`;
      content += `---\n\n`;
    });

    const fileName = 'Auditor Notes — Three-Pillar Security System.md';

    // Search for existing file
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`name='${fileName}'`)}&fields=files(id,name,modifiedTime)`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const searchData = await searchRes.json();
    const existingFile = searchData.files && searchData.files[0];

    const metadata = {
      name: fileName,
      mimeType: 'text/markdown',
    };

    let fileId;
    if (existingFile) {
      // Update existing file
      const boundary = 'b44drive_' + Math.random().toString(36).substring(2);
      const updateRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: [
          `--${boundary}`,
          'Content-Type: application/json; charset=UTF-8',
          '',
          JSON.stringify(metadata),
          `--${boundary}`,
          'Content-Type: text/markdown',
          '',
          content,
          `--${boundary}--`,
        ].join('\r\n'),
      });
      fileId = existingFile.id;
    } else {
      // Create new file
      const boundary = 'b44drive_' + Math.random().toString(36).substring(2);
      const createRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: [
          `--${boundary}`,
          'Content-Type: application/json; charset=UTF-8',
          '',
          JSON.stringify(metadata),
          `--${boundary}`,
          'Content-Type: text/markdown',
          '',
          content,
          `--${boundary}--`,
        ].join('\r\n'),
      });
      const createData = await createRes.json();
      fileId = createData.id;
    }

    return Response.json({
      success: true,
      file_id: fileId,
      file_name: fileName,
      action: existingFile ? 'updated' : 'created',
      total_observations: feedback.length,
      synced_at: now,
    });
  } catch (error) {
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});