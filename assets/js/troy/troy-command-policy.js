/* Komut paneli animasyonlardan bagimsiz calisir:
   - Troy bosta: panel acilir, Troy konusur, secilen komut onay animasyonuyla gider.
   - Troy mesgul (durt/kirbac/bazuka/dagilmis): panel yine acilir, komut
     beklemeden dogrudan gider. Hicbir durumda tik yutulmaz. */
export function commandInteractionMode({ busy }) {
  return busy ? "navigate-only" : "animated";
}
