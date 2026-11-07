// Test du composant d'inscription : la validation bloque bien l'envoi
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RegisterView from '../RegisterView.vue'
import api from '../../services/api'

// On remplace l'API et le routeur par des « faux » (mocks) :
// le test ne dépend ni du serveur Flask ni de la navigation.
vi.mock('../../services/api', () => ({ default: { post: vi.fn() } }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))

const options = { global: { stubs: { RouterLink: true } } }

describe('RegisterView', () => {
  it("n'envoie rien à l'API si le formulaire est vide", async () => {
    const wrapper = mount(RegisterView, options)
    await wrapper.find('form').trigger('submit')

    expect(api.post).not.toHaveBeenCalled()
    expect(wrapper.findAll('.message-erreur').filter((p) => p.text() !== '')).toHaveLength(4)
  })

  it("envoie les données à l'API quand tout est valide", async () => {
    const wrapper = mount(RegisterView, options)
    await wrapper.find('#nom').setValue('Ludivine')
    await wrapper.find('#email').setValue('ludi@site.fr')
    await wrapper.find('#password').setValue('abcdefgh')
    await wrapper.find('#confirmation').setValue('abcdefgh')
    await wrapper.find('form').trigger('submit')

    expect(api.post).toHaveBeenCalledWith('/inscription', {
      nom: 'Ludivine',
      email: 'ludi@site.fr',
      mot_passe: 'abcdefgh',
    })
  })
})