export default {
  async fetch(r, env) {
    const q = new URL(r.url).searchParams.get("q") || "halo";
    if (!env.GROQ_API_KEY) return new Response("Secret GROQ_API_KEY tidak ditemukan");
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + env.GROQ_API_KEY.trim(), "content-type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 80,
        messages: [
          { role: "system", content: "Jawab satu kalimat, maksimal 150 karakter, bahasa Indonesia gaul, teks polos." },
          { role: "user", content: q },
        ],
      }),
    });
    const d = await res.json();
    if (!res.ok) return new Response("Groq " + res.status + ": " + (d.error?.message || "unknown").slice(0, 150));
    let t = (d.choices?.[0]?.message?.content || "Kosong").replace(/\s+/g, " ").trim();
    return new Response(t.slice(0, 180));
  },
};
