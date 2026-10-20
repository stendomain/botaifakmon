export default {
  async fetch(r, env) {
    const u = new URL(r.url);
    const q = u.searchParams.get("q") || "halo";
    const cari = u.searchParams.get("s") === "1";
    if (!env.GROQ_API_KEY) return new Response("Tidak ketemu. Nama yang ada: " + JSON.stringify(Object.keys(env)));
    const key = env.GROQ_API_KEY.trim();

    if (u.searchParams.get("list")) {
      const m = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: "Bearer " + key },
      });
      const j = await m.json();
      if (!m.ok) return new Response("Groq " + m.status + ": " + (j.error?.message || "unknown").slice(0, 150));
      return new Response(j.data.map((x) => x.id).join("\n"));
    }

    const model = u.searchParams.get("m") || "openai/gpt-oss-120b";
    const body = {
      model,
      max_tokens: cari ? 1500 : 400,
      reasoning_effort: cari ? "medium" : "low",
      messages: [
        { role: "system", content: "Lu asisten chat live stream yang santai banget, kocak, dan suka ngelawak. Ngomong pakai bahasa Indonesia gaul sehari-hari kayak ngobrol sama temen: pakai lu-gue, boleh pakai kata kayak 'wkwk', 'dong', 'sih', 'bro'. Selipin satu sampai dua emoji di tiap jawaban (misalnya 😂🔥😎👀🗿), dan kasih bercandaan ringan atau roasting halus yang nggak nyakitin. Jangan bercanda soal SARA atau hal sensitif. Jawab langsung pertanyaannya dalam satu atau dua kalimat pendek, TOTAL maksimal 170 karakter termasuk emoji, teks polos tanpa markdown, tanpa link dan tanpa nomor rujukan. Jangan pernah ngawali jawaban pakai nama diikuti titik dua; langsung jawab natural kayak lagi ngobrol. Jawab semua pertanyaan dengan natural. Jangan ngarang fakta; kalau emang nggak tau, bilang nggak tau dengan gaya santai dan beda-beda tiap kali." },
        { role: "user", content: q },
      ],
    };
    if (cari) body.tools = [{ type: "browser_search" }];

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await res.json();
    if (!res.ok) return new Response("Groq " + res.status + " (" + model + "): " + (d.error?.message || "unknown").slice(0, 120));
    let t = (d.choices?.[0]?.message?.content || "")
      .replace(/【[^】]*】/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!t) t = "Lagi makan dl bentar nih bro, coba tanya lagi ntar ye😹";
    if (t.length > 180) {
      t = t.slice(0, 180);
      t = t.slice(0, t.lastIndexOf(" ")) + "...";
    }
    return new Response(t);
  },
};
