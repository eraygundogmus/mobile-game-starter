# 08 · Online

**When:** the offline game is fun.
**Output:** an authoritative server on Cloudflare Workers.

```text
Add online play. The server is authoritative: it runs the same engine and never trusts the client.
The client sends only inputs or intents; the server computes scores, rewards and timers.
Every write request carries an idempotency key, and a retry returns the stored response.
<choose one>
A) Verify finished runs: the client sends the input log, the server replays it and stores its own result.
B) Live matches: a Lobby Durable Object pairs players (a bot fills the seat after N seconds), a Match Durable Object
   owns the state and the timers. The client predicts its own actions and re-applies unconfirmed ones on each state.
   A dropped socket reconnects to the same match.
Phone and web players share one queue. Test the Worker and the Durable Objects with @cloudflare/vitest-plugin.
```

**Check:** server tests pass in workerd; a modified client cannot change a result.

<details><summary>Türkçe</summary>

```text
Online oyun ekle. Sunucu yetkili olsun: aynı motoru çalıştırsın, istemciye hiç güvenmesin.
İstemci yalnızca girdileri ya da niyetini göndersin; skoru, ödülü ve zamanlayıcıları sunucu hesaplasın.
Her yazma isteği bir idempotency anahtarı taşısın; tekrar deneme kayıtlı cevabı alsın.
<birini seç>
A) Biten turları doğrula: istemci girdi kaydını göndersin, sunucu tekrar oynatıp kendi sonucunu kaydetsin.
B) Canlı maç: Lobby Durable Object oyuncuları eşleştirsin (N saniye sonra bot girsin), Match Durable Object
   durumu ve zamanlayıcıları yönetsin. İstemci kendi hamlesini tahmin etsin, onaylanmamışları her durumda yeniden uygulasın.
   Bağlantı koparsa aynı maça geri dönsün.
Telefon ve web aynı sırada eşleşsin. Worker ve Durable Object'leri @cloudflare/vitest-plugin ile test et.
```
</details>
