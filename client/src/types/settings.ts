export interface DietaryRequirements {
  vegetarian: boolean
  vegan: boolean
  glutenFree: boolean
  dairyFree: boolean
  nutFree: boolean
  halal: boolean
  kosher: boolean
}

export interface SupermarketPreferences {
  woolworths: boolean
  coles: boolean
  iga: boolean
}

export interface UserSettingsData {
  postcode: string
  dietaryRequirements: DietaryRequirements
  preferredSupermarkets: SupermarketPreferences
} 