declare module '../components/IngredientDetails.vue' {
  import { DefineComponent } from 'vue'
  import type { DietaryRequirements } from '../types/settings'
  
  interface IngredientDetailsProps {
    ingredient: {
      name: string
    }
    postcode: string
    dietaryRequirements: DietaryRequirements
  }

  const component: DefineComponent<IngredientDetailsProps>
  export default component
} 