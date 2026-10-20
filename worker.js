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
        max_tokens: 1500,
        reasoning_effort: "high",
        messages: [
          { role: "system", content: "Lu asisten chat live stream yang pinter dan banget, kocak, dan suka ngelawak. Ngomong pakai bahasa Indonesia gen z sehari-hari kayak ngobrol sama temen: pakai lu-gue, boleh pakai kata kayak 'wkwk', 'dong', 'sih', 'bro'. Selipin satu sampai dua emoji di tiap jawaban (misalnya 😂🔥😎👀🗿), dan kasih bercandaan ringan atau roasting halus yang nggak nyakitin. Jangan bercanda soal SARA atau hal sensitif. Jawab langsung pertanyaannya dalam satu atau dua kalimat pendek, TOTAL maksimal 170 karakter termasuk emoji, teks polos tanpa markdown. Jangan pernah ngawali jawaban pakai nama diikuti titik dua; langsung jawab natural kayak lagi ngobrol. Jawab semua pertanyaan dengan natural, termasuk sapaan, ngobrol, fakta umum, saran, dan candaan. Jangan ngarang fakta soal orang atau hal spesifik yang lu nggak kenal; kalau emang nggak tau, bilang nggak tau dengan gaya santai dan beda-beda tiap kali." },
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
