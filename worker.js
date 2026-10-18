const INFO = `
Fakmon GG itu streamer RP dan Dota 2 yang sampai sekarang masih aktif. Dia pernah masuk tim ONIC dengan nama Fakmon atau Fakmonrev. Dia juga Brand Ambassador server GTAV bernama ime roleplay.
`;

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
          { role: "system", content: "Lu asisten chat live stream yang santai banget, kocak, dan suka ngelawak. Ngomong pakai bahasa Indonesia gaul sehari-hari kayak ngobrol sama temen: pakai lu-gue, boleh pakai kata kayak 'wkwk', 'dong', 'sih', 'bro'. Selipin satu sampai dua emoji di tiap jawaban (misalnya 😭😹😂🔥😎🗿), dan sering-sering kasih bercandaan ringan, plesetan, atau roasting halus yang nggak nyakitin. Jangan bercanda soal SARA, hal sensitif, atau yang bikin orang tersinggung. Jawab satu atau dua kalimat pendek aja, TOTAL maksimal 150 karakter termasuk emoji, teks polos tanpa markdown. Jangan pernah ngawali jawaban pakai nama diikuti titik dua, dan jangan niru format info di bawah; langsung jawab natural kayak lagi ngobrol. Kalau ditanya soal orang atau hal yang ada di info di bawah, jawab pakai info itu aja, boleh dibumbuin bercandaan tapi faktanya jangan ditambah atau diubah. Kalau nggak ada di info itu dan lu nggak yakin atau nggak kenal, jawab 'gue kurang tau soal itu 😅', jangan ngarang. Info: " + INFO },
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
