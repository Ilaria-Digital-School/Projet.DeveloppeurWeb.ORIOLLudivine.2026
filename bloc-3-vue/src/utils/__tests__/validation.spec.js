// Tests unitaires des règles de validation (lancer : npm run test:unit)
import { describe, it, expect } from 'vitest'
import { erreurObligatoire, erreurEmail, erreurLongueur, erreurConfirmation } from '../validation'

describe('erreurObligatoire', () => {
  it('refuse un champ vide ou rempli d’espaces', () => {
    expect(erreurObligatoire('')).not.toBe('')
    expect(erreurObligatoire('   ')).not.toBe('')
  })
  it('accepte un champ rempli', () => {
    expect(erreurObligatoire('Ludivine')).toBe('')
  })
})

describe('erreurEmail', () => {
  it('refuse une adresse sans extension', () => {
    expect(erreurEmail('ludi@site')).toContain('invalide')
  })
  it('refuse une adresse sans @', () => {
    expect(erreurEmail('ludi.site.fr')).toContain('invalide')
  })
  it('accepte une adresse correcte', () => {
    expect(erreurEmail('ludi@site.fr')).toBe('')
  })
})

describe('erreurLongueur', () => {
  it('refuse un mot de passe trop court et indique la longueur', () => {
    expect(erreurLongueur('abc', 8)).toContain('actuellement 3')
  })
  it('accepte 8 caractères', () => {
    expect(erreurLongueur('abcdefgh', 8)).toBe('')
  })
})

describe('erreurConfirmation', () => {
  it('refuse deux mots de passe différents', () => {
    expect(erreurConfirmation('abcdefgh', 'abcdefgi')).toContain('identiques')
  })
  it('accepte deux mots de passe identiques', () => {
    expect(erreurConfirmation('abcdefgh', 'abcdefgh')).toBe('')
  })
})