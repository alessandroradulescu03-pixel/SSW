/* =====================================================================
   SSW — collegamento a Supabase (usato sia dal sito che da admin.html)
   Dove trovo i due valori: Supabase → Project Settings → API
     SUPABASE_URL = "Project URL"   (es. https://abcdefgh.supabase.co)
     SUPABASE_KEY = chiave pubblica: "anon public" oppure "publishable"
   Queste due sono pubbliche e possono stare qui.
   La chiave "service_role" / "secret" invece NON va MAI messa in questi file.
   Finché restano vuote il sito continua a funzionare coi capi demo.
   ===================================================================== */
window.SSW_CONFIG = {
  SUPABASE_URL: 'https://iiuqzcmwwiquyssjxrfw.supabase.co',
  SUPABASE_KEY: 'sb_publishable_ZeDV7ibewtzZ3Aed-Bpzew_2yA-TKMk'
};
