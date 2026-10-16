# Pilot channel for provider-verified petition signatures

This is a **static**, privacy-aware pilot. It does not access the Floot database or store personally identifiable information.

- `public/index.html` lets a visitor choose four actual openPetition campaigns and sequentially access official signer forms.
- The visitor must consent before the external form loads.
- The message is optional and only copied to clipboard; it is not secretly transmitted.
- An official provider widget is loaded only when `public/provider-widgets.json` names the exact authorizedOrigin and a reviewed widget ID with `active:true`.
- Otherwise the visitor can open the original petition directly, where the provider accepts and validates signatures.
- A success in this pilot **is not counted** until openPetition accepts it. This microsite never reports any external signature as received.
- Forms are sandboxed without `allow-same-origin` to minimize access to UnGesto state; verify in a real browser that the third-party provider supports embedding this way.
- Intended to be hosted on a static platform with its own official widget IDs. Widget IDs previously issued for `ungesto-solidario.floot.app` are **not** reused on another domain.

The Render domain listed in `provider-widgets.json` is a placeholder until deployment returns its actual, verified public hostname. It does not authorize loading anything on its own.

Run `node --test tests/*.test.mjs` for integration contracts. No automated mass signatures or subscription-list enrollment.
