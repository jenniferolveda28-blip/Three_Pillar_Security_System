import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { auditorName, auditorEmail, certificateId, passcode, issuedDate, tokenSerial, biometricConfidence } = body;

    if (!auditorName || !certificateId) {
      return Response.json({ error: 'auditorName and certificateId are required' }, { status: 400 });
    }

    // Get Google Drive connection
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');

    // Build certificate document content
    const issueDate = issuedDate || new Date().toISOString();
    const certContent = `THREE-PILLAR SECURITY SYSTEM
==============================
IDENTITY CERTIFICATE
==============================

Certificate ID: ${certificateId}
Issued To: ${auditorName}
Auditor Email: ${auditorEmail || 'N/A'}
Access Passcode: ${passcode || 'N/A'}

ISSUANCE DETAILS
----------------
Issue Date: ${new Date(issueDate).toLocaleString()}
Issuing Authority: Three-Pillar Security System
Jurisdiction: Texas, USA

BIOMETRIC VERIFICATION
----------------------
BioVerify Token Serial: ${tokenSerial || 'N/A'}
Biometric Confidence: ${biometricConfidence || 'N/A'}%
Verification Method: DNA Saliva + Breath Liveness Detection

SCOPE OF ACCESS
---------------
This certificate authorizes the named auditor to access the
Three-Pillar Security System audit portal for the purpose of
conducting security and compliance reviews.

This certificate is non-transferable and bound to the biometric
identity of the named auditor. Any unauthorized use constitutes
a security violation and will be logged to the immutable audit trail.

==============================
Three-Pillar Security System (c) 2024-2026
Texas, USA
`;

    // Upload to Google Drive using multipart upload
    const metadata = {
      name: `Identity_Certificate_${auditorName.replace(/\s+/g, '_')}_${certificateId}.txt`,
      mimeType: 'text/plain'
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: text/plain\r\n\r\n' +
      certContent +
      closeDelimiter;

    const uploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary="${boundary}"`
        },
        body: multipartBody
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      return Response.json({ error: `Drive upload failed: ${errText}` }, { status: 502 });
    }

    const fileData = await uploadRes.json();

    return Response.json({
      success: true,
      file_id: fileData.id,
      file_name: fileData.name,
      web_view_link: fileData.webViewLink,
      certificate_id: certificateId,
      auditor_name: auditorName,
      saved_at: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}