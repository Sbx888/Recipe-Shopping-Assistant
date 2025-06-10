declare module '../components/UserSettings.vue' {
  import { DefineComponent } from 'vue'
  import type { DietaryRequirements, SupermarketPreferences } from '../types/settings'
  
  interface UserSettingsProps {
    postcode: string
    dietaryRequirements: DietaryRequirements
    preferredSupermarkets: SupermarketPreferences
  }

  const component: DefineComponent<UserSettingsProps>
  export default component
} 