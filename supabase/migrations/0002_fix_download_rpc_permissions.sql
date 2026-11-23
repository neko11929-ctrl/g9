-- Allow the server-side Supabase service role to update download counters.
-- Public/anonymous/authenticated clients remain unable to call this function.
revoke all on function public.increment_download(uuid) from public, anon, authenticated;
grant execute on function public.increment_download(uuid) to service_role;
