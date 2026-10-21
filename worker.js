const SISTEM = "Lu asisten chat live stream yang santai banget, kocak, dan suka ngelawak. Ngomong pakai bahasa Indonesia gaul sehari-hari kayak ngobrol sama temen: pakai lu-gue, boleh pakai kata kayak 'wkwk', 'dong', 'sih', 'bro'. Selipin satu sampai dua emoji di tiap jawaban (misalnya 😭🔥😎👀🗿), dan kasih bercandaan ringan atau roasting yang nggak nyakitin. Jangan bercanda soal SARA atau hal sensitif. Kalau pertanyaannya soal orang, tim, berita, kejadian, skor, harga, atau apa pun yang bisa berubah, cari di web SEKALI aja secara singkat, lalu jawab berdasarkan hasilnya, jangan nebak dari ingatan dan jangan buka banyak halaman. Jawab langsung pertanyaannya dalam satu atau dua kalimat pendek, TOTAL maksimal 180 karakter termasuk emoji, teks polos tanpa markdown, tanpa link dan tanpa nomor rujukan. Jangan pernah ngawali jawaban pakai nama diikuti titik dua; langsung jawab natural kayak lagi ngobrol. Jangan ngarang fakta; kalau hasil pencarian nggak jelas atau nggak ketemu, bilang nggak yakin dengan gaya santai.";

async function tanya(key, model, q, cari, maxTokens) {
  const body = {
    model,
    max_tokens: maxTokens,
    reasoning_effort: "low",
    messages: [
      { role: "system", content: SISTEM },
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
  return { ok: res.ok, status: res.status, d };
}

function bersih(d) {
  return (d.choices?.[0]?.message?.content || "")
    .replace(/【[^】]*】/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default {
  async fetch(r, env) {
    const u = new URL(r.url);
    const q = u.searchParams.get("q") || "halo";
    const cari = u.searchParams.get("s") !== "0";
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

    const utama = u.searchParams.get("m") || "openai/gpt-oss-120b";
    const urutan = [utama, "openai/gpt-oss-20b"].filter((x, i, a) => a.indexOf(x) === i);

    let h, pakai;
    for (const model of urutan) {
      pakai = model;
      h = await tanya(key, model, q, cari, cari ? 1000 : 400);
      if (h.status !== 429) break;
    }

    if (h.status === 429) return new Response("Jatah lu lagi abis bro ajg nanya mulu, ntar aja apa, gawe bat ini gua💩");
    if (!h.ok) return new Response("Groq " + h.status + " (" + pakai + "): " + (h.d.error?.message || "unknown").slice(0, 120));

    let t = bersih(h.d);

    if (!t && cari) {
      h = await tanya(key, pakai, q, true, 1500);
      if (h.ok) t = bersih(h.d);
    }

    if (!t) t = "Lagi makan nih coy gosa ganggu dl, ntar deh gw jawab klo mood";
    if (t.length > 180) {
      t = t.slice(0, 180);
      t = t.slice(0, t.lastIndexOf(" ")) + "...";
    }
    return new Response(t);
  },
};
