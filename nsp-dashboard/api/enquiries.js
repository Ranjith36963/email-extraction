export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const sheetId = process.env.GOOGLE_SHEET_ID;
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!sheetId || !apiKey) return res.status(500).json({ error: "Missing env vars" });

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Enquiries!A:S?key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err?.error?.message || "Sheets API error" });
    }
    const data = await response.json();
    const rows = data.values || [];
    if (rows.length < 2) return res.status(200).json({ enquiries: [] });

    const headers = rows[0];
    const enquiries = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const entry = {};
      headers.forEach((h, j) => { entry[h] = row[j] || ""; });

      let parsed = null;
      if (entry.full_json) {
        try { parsed = JSON.parse(entry.full_json); } catch {}
      }

      enquiries.push({
        id: `row-${i}`,
        processed_at: entry.processed_at || "",
        customer: parsed?.customer || { name: entry.customer_name, company: entry.customer_company, email: entry.customer_email, phone: entry.customer_phone, role: entry.customer_role },
        enquiry: parsed?.enquiry || { industry: entry.industry, items: [], services_needed: entry.services ? entry.services.split(", ") : [], deadline: entry.deadline || null, urgency: entry.urgency || "low", attachments_mentioned: entry.attachments === "true" },
        items_detail: entry.items_detail || "",
        summary: parsed?.summary || entry.summary || "",
        suggested_followup: parsed?.suggested_followup || entry.followup || "",
        confidence_score: parsed?.confidence_score || parseInt(entry.confidence) || 0,
        missing_info: parsed?.missing_info || (entry.missing_info ? entry.missing_info.split(", ") : []),
        attachment_analysis: entry.attachment_analysis || null,
      });
    }
    enquiries.reverse();
    return res.status(200).json({ enquiries });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
