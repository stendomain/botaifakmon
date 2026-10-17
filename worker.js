export default {
  async fetch(r, env) {
    const q = new URL(r.url).searchParams.get("q") || "halo";
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + env.GROQ_API_KEY, "content-type": "application/json" },
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
    let t = (d.choices?.[0]?.message?.content || "Error").replace(/\s+/g, " ").trim();
    return new Response(t.slice(0, 180));
  },
};
