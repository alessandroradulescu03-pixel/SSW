-- =====================================================================
--  SSW Motorsport — database Supabase (articoli, stock, ordini)
--  Come si usa: Supabase → SQL Editor → New query → incolla TUTTO → Run.
--  Si può rilanciare più volte senza fare danni.
--  Dopo: vedi il PASSO 2 in fondo per dare l'accesso admin.
-- =====================================================================

-- ---------- chi è admin ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- articoli ----------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  color       text not null default '',
  price       numeric(10,2) not null check (price >= 0),
  description text not null default '',
  composition text not null default '',
  fit         text not null default '',        -- testo della tendina "Vestibilità"
  tag         text not null default '',
  images      text[] not null default '{}',     -- la prima è la copertina
  position    int  not null default 0,          -- ordine in vetrina (dal più basso)
  active      boolean not null default true,    -- false = nascosto dal sito
  created_at  timestamptz not null default now()
);

-- per i database creati prima che esistesse la vestibilità
alter table public.products add column if not exists fit text not null default '';

-- ---------- taglie e quantità ----------
create table if not exists public.variants (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size       text not null,
  stock      int  not null default 0 check (stock >= 0),
  sort       int  not null default 0,
  unique (product_id, size)
);

-- ---------- ordini ----------
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  number            bigint generated always as identity (start with 1001),
  created_at        timestamptz not null default now(),
  status            text not null default 'nuovo'
                    check (status in ('nuovo','in_preparazione','spedito','consegnato','annullato')),
  paypal_order_id   text not null unique,
  paypal_capture_id text,
  customer_name     text not null default '',
  customer_email    text not null default '',
  ship_to           jsonb not null default '{}',
  subtotal          numeric(10,2) not null default 0,
  shipping          numeric(10,2) not null default 0,
  total             numeric(10,2) not null default 0,   -- calcolato dal database coi prezzi veri
  paid_total        numeric(10,2),                      -- quanto dice di aver pagato il sito
  stock_issue       boolean not null default false,     -- true = venduto più di quanto c'era
  tracking          text not null default '',
  notes             text not null default ''
);

create table if not exists public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.variants(id) on delete set null,
  name       text not null,
  color      text not null default '',
  size       text not null default '',
  unit_price numeric(10,2) not null default 0,
  qty        int not null check (qty > 0)
);
create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists orders_created_idx on public.orders(created_at desc);

-- ---------- sicurezza (RLS) ----------
alter table public.products    enable row level security;
alter table public.variants    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "admins: vedo me stesso" on public.admins;
create policy "admins: vedo me stesso" on public.admins
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "articoli: lettura pubblica" on public.products;
create policy "articoli: lettura pubblica" on public.products
  for select to anon, authenticated using (active or public.is_admin());
drop policy if exists "articoli: admin" on public.products;
create policy "articoli: admin" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "taglie: lettura pubblica" on public.variants;
create policy "taglie: lettura pubblica" on public.variants
  for select to anon, authenticated using (true);
drop policy if exists "taglie: admin" on public.variants;
create policy "taglie: admin" on public.variants
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- gli ordini li vede e li modifica solo l'admin (il sito li crea con place_order)
drop policy if exists "ordini: admin" on public.orders;
create policy "ordini: admin" on public.orders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "righe ordine: admin" on public.order_items;
create policy "righe ordine: admin" on public.order_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.products, public.variants to anon, authenticated;
grant insert, update, delete on public.products, public.variants to authenticated;
grant select on public.admins to authenticated;
grant select, update, delete on public.orders, public.order_items to authenticated;

-- ---------- il sito registra l'ordine dopo il pagamento PayPal ----------
-- Prezzi e nomi vengono presi dal database, non dal browser.
-- Lo stock scala qui dentro, una riga alla volta e bloccata: due acquisti
-- nello stesso istante non possono prendere lo stesso pezzo.
create or replace function public.place_order(
  p_paypal_order_id text,
  p_capture_id      text,
  p_customer        jsonb,
  p_items           jsonb,
  p_paid            numeric
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_id    uuid;
  v_num   bigint;
  v_item  jsonb;
  v_var   record;
  v_vid   uuid;
  v_qty   int;
  v_sub   numeric := 0;
  v_ship  numeric;
  v_issue boolean := false;
  c_uuid  constant text := '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
begin
  if p_paypal_order_id is null or length(p_paypal_order_id) not between 8 and 64 then
    raise exception 'ordine PayPal non valido';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) not between 1 and 30 then
    raise exception 'carrello non valido';
  end if;
  p_customer := coalesce(p_customer, '{}'::jsonb);

  insert into orders (paypal_order_id, paypal_capture_id, customer_name, customer_email, ship_to, paid_total)
  values (
    p_paypal_order_id,
    left(coalesce(p_capture_id, ''), 64),
    left(coalesce(p_customer->>'name', ''), 120),
    left(coalesce(p_customer->>'email', ''), 160),
    case when jsonb_typeof(p_customer->'address') = 'object' and length((p_customer->'address')::text) < 1500
         then p_customer->'address' else '{}'::jsonb end,
    p_paid
  )
  on conflict (paypal_order_id) do nothing
  returning id, number into v_id, v_num;

  -- stesso ordine PayPal già registrato (doppio click, pagina ricaricata): non scalo due volte
  if v_id is null then
    select number into v_num from orders where paypal_order_id = p_paypal_order_id;
    return jsonb_build_object('number', v_num, 'duplicate', true);
  end if;

  for v_item in
    select value from jsonb_array_elements(p_items) order by value->>'variant_id'
  loop
    v_qty := 1;
    if (v_item->>'qty') ~ '^[0-9]{1,3}$' then
      v_qty := least(greatest((v_item->>'qty')::int, 1), 20);
    end if;

    v_vid := null;
    if (v_item->>'variant_id') ~ c_uuid then v_vid := (v_item->>'variant_id')::uuid; end if;

    select v.id as vid, v.size, v.stock, p.id as pid, p.name, p.color, p.price
      into v_var
      from variants v join products p on p.id = v.product_id
     where v.id = v_vid
       for update of v;

    if found then
      if v_var.stock < v_qty then v_issue := true; end if;
      update variants set stock = greatest(stock - v_qty, 0) where id = v_var.vid;
      insert into order_items (order_id, product_id, variant_id, name, color, size, unit_price, qty)
      values (v_id, v_var.pid, v_var.vid, v_var.name, v_var.color, v_var.size, v_var.price, v_qty);
      v_sub := v_sub + v_var.price * v_qty;
    else
      -- articolo sparito nel frattempo: il cliente ha pagato, quindi l'ordine lo salvo lo stesso e lo segnalo
      v_issue := true;
      insert into order_items (order_id, name, color, size, unit_price, qty)
      values (v_id,
              left(coalesce(nullif(v_item->>'name', ''), 'Articolo non più in catalogo'), 120),
              left(coalesce(v_item->>'color', ''), 80),
              left(coalesce(v_item->>'size', ''), 20),
              0, v_qty);
    end if;
  end loop;

  -- stessa regola del sito: spedizione gratis da 120 €, altrimenti 7 €
  v_ship := case when v_sub >= 120 then 0 else 7 end;

  update orders
     set subtotal = v_sub, shipping = v_ship, total = v_sub + v_ship, stock_issue = v_issue
   where id = v_id;

  return jsonb_build_object('number', v_num);
end;
$$;

revoke all on function public.place_order(text, text, jsonb, jsonb, numeric) from public;
grant execute on function public.place_order(text, text, jsonb, jsonb, numeric) to anon, authenticated;

-- ---------- l'admin cambia lo stato di un ordine ----------
-- Annullando un ordine i capi tornano disponibili; riaprendolo vengono riscalati.
create or replace function public.set_order_status(p_id uuid, p_status text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_old text;
begin
  if not public.is_admin() then raise exception 'non autorizzato'; end if;
  if p_status not in ('nuovo','in_preparazione','spedito','consegnato','annullato') then
    raise exception 'stato non valido';
  end if;

  select status into v_old from orders where id = p_id for update;
  if not found then raise exception 'ordine non trovato'; end if;
  if v_old = p_status then return; end if;

  if p_status = 'annullato' then
    update variants v set stock = v.stock + i.qty
      from (select variant_id, sum(qty)::int as qty from order_items
             where order_id = p_id and variant_id is not null group by variant_id) i
     where v.id = i.variant_id;
  elsif v_old = 'annullato' then
    update variants v set stock = greatest(v.stock - i.qty, 0)
      from (select variant_id, sum(qty)::int as qty from order_items
             where order_id = p_id and variant_id is not null group by variant_id) i
     where v.id = i.variant_id;
  end if;

  update orders set status = p_status where id = p_id;
end;
$$;

revoke all on function public.set_order_status(uuid, text) from public;
grant execute on function public.set_order_status(uuid, text) to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- foto degli articoli ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('prodotti', 'prodotti', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "foto prodotti: admin carica" on storage.objects;
create policy "foto prodotti: admin carica" on storage.objects
  for insert to authenticated with check (bucket_id = 'prodotti' and public.is_admin());
drop policy if exists "foto prodotti: admin modifica" on storage.objects;
create policy "foto prodotti: admin modifica" on storage.objects
  for update to authenticated using (bucket_id = 'prodotti' and public.is_admin());
drop policy if exists "foto prodotti: admin elimina" on storage.objects;
create policy "foto prodotti: admin elimina" on storage.objects
  for delete to authenticated using (bucket_id = 'prodotti' and public.is_admin());
drop policy if exists "foto prodotti: admin elenca" on storage.objects;
create policy "foto prodotti: admin elenca" on storage.objects
  for select to authenticated using (bucket_id = 'prodotti' and public.is_admin());

-- =====================================================================
--  PASSO 2 — dare l'accesso admin (da fare DOPO aver creato gli utenti)
--  1. Supabase → Authentication → Users → Add user (email + password),
--     uno per te e uno per Andrea. Spunta "Auto Confirm User".
--  2. Togli i due trattini qui sotto, metti le email vere e lancia solo
--     queste righe:
--
-- insert into public.admins (user_id)
-- select id from auth.users where email in ('TUA_EMAIL', 'EMAIL_DI_ANDREA')
-- on conflict do nothing;
-- =====================================================================
