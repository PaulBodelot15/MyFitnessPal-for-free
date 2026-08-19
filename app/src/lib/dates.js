// Convertit une Date en "YYYY-MM-DD" en heure locale (pas UTC, pour éviter
// qu'un utilisateur dans un fuseau décalé voie sa journée changer de date).
export function dateToISO(d) {
  const offset = d.getTimezoneOffset()
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10)
}
