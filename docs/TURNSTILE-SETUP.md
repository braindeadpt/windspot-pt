# Cloudflare Turnstile Setup Guide

## Prós
- Gratuito para até 1 milhão de verificações/mês
- Invisível (não打扰用户体验)
- Proteção efectiva contra bots

## Passo 1: Criar site key em Cloudflare Dashboard

1. Vai a https://dash.cloudflare.com/turnstile
2. Clica "Add a site"
3. Preenche:
   - Site name: VenTu Chat
   - Sites to host: ventu.surf
   - Widget Type: **Non-Interactive** ou **Invisible**
4. Copia o **Site Key** e **Secret Key**

## Passo 2: Adicionar secrets no GitHub

```
Settings → Secrets → Actions
- TURNSTILE_SITE_KEY
- TURNSTILE_SECRET_KEY
```

## Passo 3: Criar Supabase Edge Function (server-side validation)

```javascript
// supabase/functions/verify-turnstile/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const TURNSILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

serve(async (req) => {
  const { token, remoteip } = await req.json()
  
  const formData = new FormData()
  formData.append('secret', Deno.env.get('TURNSOTILE_SECRET_KEY'))
  formData.append('response', token)
  formData.append('remoteip', remoteip)

  const result = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    body: formData,
  })

  const outcome = await result.json()
  
  return new Response(JSON.stringify({
    success: outcome.success,
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

## Passo 4: Atualizar SpotChat.tsx

```tsx
// Adicionar ao SpotChat.tsx
import { load } from '@cf-worker/turnstile'

const Turnstile = load('YOUR_SITE_KEY', { 
  executionEnvironment: 'auto' 
})

// No submit handler, antes de enviar mensagem:
const token = await Turnstile.execute(document.getElementById('turnstile-container'))
if (!token) {
  showError('Por favor completa a verificação')
  return
}
```

## Alternativa: Usar Rate Limiting mais agressivo

Se não quiseres adicionar Turnstile, pelo menos reforça o rate limiting:

```sql
-- Atualizar schema para rate limit mais agressivo
DROP POLICY "Allow anonymous insert with rate limit" ON messages;
CREATE POLICY "Allow anonymous insert with rate limit" ON messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(content) <= 280 
    AND length(content) > 0
    AND (
      -- Rate limit: 1 msg por 30 segundos (era 10s)
      NOT EXISTS (
        SELECT 1 FROM messages m 
        WHERE m.username = messages.username 
        AND m.created_at > NOW() - INTERVAL '30 seconds'
      )
    )
  );
```

## Recomendação

Para um projeto open-source com chat anónimo, recomendo:
1. **Fase inicial:** Manter rate limit actual (10s) + username validation
2. **Quando tiver mais tráfego:** Adicionar Turnstile com Invisible widget
3. **Monitorizar:** Watch Supabase dashboard para detectar abuso

---

## Status: Pendente implementação

Precisas de:
1. Conta Cloudflare (gratuita)
2. Criar site em Turnstile dashboard
3. Configurar Edge Function no Supabase
4. Atualizar SpotChat.tsx

**Queres que implemente esta solução?**