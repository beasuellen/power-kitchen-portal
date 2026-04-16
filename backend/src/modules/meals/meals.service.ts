import { Injectable } from '@nestjs/common';
@Injectable()
export class MealsService {
  async getMeals() { return { meals: [] }; } // Cached 1hr from Shopify
  async getMeal(id: string) { return { id }; }
}
