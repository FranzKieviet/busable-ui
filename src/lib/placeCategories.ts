import type { SvgIconComponent } from "@mui/icons-material"
import RestaurantIcon from "@mui/icons-material/Restaurant"
import LocalCafeIcon from "@mui/icons-material/LocalCafe"
import LocalBarIcon from "@mui/icons-material/LocalBar"
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy"
import MuseumIcon from "@mui/icons-material/Museum"
import ParkIcon from "@mui/icons-material/Park"
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag"
import SchoolIcon from "@mui/icons-material/School"

export type PlaceCategoryId =
  | 'restaurants'
  | 'cafes'
  | 'nightlife'
  | 'entertainment'
  | 'culture'
  | 'outdoors'
  | 'shopping'
  | 'services'

export type PlaceCategory = {
  id: PlaceCategoryId
  label: string
  color: string
  Icon: SvgIconComponent
}

// The 8 major categories, in the order they're shown in the filter
export const PLACE_CATEGORIES: PlaceCategory[] = [
  { id: 'restaurants', label: 'Restaurants', color: '#e8590c', Icon: RestaurantIcon },
  { id: 'cafes', label: 'Cafés & Sweets', color: '#a0522d', Icon: LocalCafeIcon },
  { id: 'nightlife', label: 'Bars & Nightlife', color: '#7b2cbf', Icon: LocalBarIcon },
  { id: 'entertainment', label: 'Entertainment', color: '#d6336c', Icon: TheaterComedyIcon },
  { id: 'culture', label: 'Arts & Culture', color: '#1971c2', Icon: MuseumIcon },
  { id: 'outdoors', label: 'Parks & Recreation', color: '#2f9e44', Icon: ParkIcon },
  { id: 'shopping', label: 'Shopping', color: '#0c8599', Icon: ShoppingBagIcon },
  { id: 'services', label: 'Education & Services', color: '#495057', Icon: SchoolIcon },
]

export const PLACE_CATEGORY_BY_ID = Object.fromEntries(PLACE_CATEGORIES.map((c) => [c.id, c])) as Record<PlaceCategoryId, PlaceCategory>

// Upstream place categories that need an explicit group (checked before the suffix rules below)
const EXPLICIT: Record<string, PlaceCategoryId> = {
  // cafés & sweets
  coffee_shop: 'cafes', cafe: 'cafes', tea_room: 'cafes', bubble_tea_shop: 'cafes', dessert_shop: 'cafes',
  ice_cream_shop: 'cafes', gelato_shop: 'cafes', frozen_yogurt_shop: 'cafes', smoothie_juice_bar: 'cafes',
  // food that isn't named *_restaurant
  sandwich_shop: 'restaurants', bagel_shop: 'restaurants', delicatessen: 'restaurants', diner: 'restaurants',
  bistro: 'restaurants', cafeteria: 'restaurants', salad_bar: 'restaurants', tapas_bar: 'restaurants',
  // nightlife
  bar: 'nightlife', cocktail_bar: 'nightlife', pub: 'nightlife', brewery: 'nightlife', beer_bar: 'nightlife',
  beer_garden: 'nightlife', gastropub: 'nightlife',
  // entertainment
  music_venue: 'entertainment', theatre_venue: 'entertainment', performing_arts_venue: 'entertainment',
  arts_and_entertainment: 'entertainment', movie_theater: 'entertainment', escape_room: 'entertainment',
  stadium_arena: 'entertainment',
  // arts & culture
  museum: 'culture', art_museum: 'culture', art_gallery: 'culture', historic_site: 'culture', cultural_center: 'culture',
  // parks & recreation
  park: 'outdoors', hiking_trail: 'outdoors', public_plaza: 'outdoors', swimming_pool: 'outdoors',
  sport_or_fitness_facility: 'outdoors',
  // shopping (most shops are caught by the *_store / *_shop rule)
  bookstore: 'shopping',
  // education & services
  college_university: 'services', campus_building: 'services', library: 'services', community_center: 'services',
  post_office: 'services',
}

// Map an upstream category (e.g. "thai_restaurant") to one of the 8 major categories.
// Anything unrecognised falls into Education & Services so it's never silently hidden.
export function categorizePlace(category: string | null | undefined): PlaceCategoryId {
  const c = (category ?? '').toLowerCase()
  if (EXPLICIT[c]) return EXPLICIT[c]
  if (c.endsWith('_restaurant')) return 'restaurants'
  if (c.endsWith('_bar') || c.endsWith('_pub')) return 'nightlife'
  if (c.endsWith('_store') || c.endsWith('_shop') || c.endsWith('_market')) return 'shopping'
  if (c.endsWith('_museum') || c.endsWith('_gallery')) return 'culture'
  if (c.endsWith('_park') || c.endsWith('_trail')) return 'outdoors'
  return 'services'
}
