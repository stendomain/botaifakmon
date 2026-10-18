export default {
  async fetch(r, env) {
    const u = new URL(r.url);
    const q = u.searchParams.get("q") || "halo";
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
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        max_tokens: 300,
        reasoning_effort: "low",
        messages: [
          { role: "system", content: "Lu asisten chat live stream yang santai banget. Ngomong pakai bahasa Indonesia gaul sehari-hari kayak ngobrol sama temen: pakai lu-gue, boleh pakai kata kayak 'wkwk', 'dong', 'sih', 'bro'. Jawab satu kalimat aja, maksimal 150 karakter, teks polos tanpa markdown. Kalau nggak yakin atau nggak kenal orang atau hal yang ditanya, jawab 'gue kurang tau soal itu', jangan ngarang." },
          { role: "user", content: q },
        ],
      }),
    });
    const d = await res.json();
    if (!res.ok) return new Response("Groq " + res.status + " (" + model + "): " + (d.error?.message || "unknown").slice(0, 120));
    let t = (d.choices?.[0]?.message?.content || "Kosong").replace(/\s+/g, " ").trim();
    if (t.length > 180) {
      t = t.slice(0, 180);
      t = t.slice(0, t.lastIndexOf(" ")) + "...";
    }
    return new Response(t);
  },
};
