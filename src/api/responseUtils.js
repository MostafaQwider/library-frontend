/** Normalize paginated or plain list responses from the API */
export function listFromResponse(res) {
  const d = res?.data?.data
  if (Array.isArray(d)) return d
  if (d && Array.isArray(d.items)) return d.items
  if (d && Array.isArray(d.results)) return d.results
  return []
}
