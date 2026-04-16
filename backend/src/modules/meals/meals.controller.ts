import { Controller, Get, Param } from '@nestjs/common';
import { MealsService } from './meals.service';
@Controller('meals')
export class MealsController {
  constructor(private svc: MealsService) {}
  @Get()       getAll()              { return this.svc.getMeals(); }
  @Get(':id')  getOne(@Param('id') id: string) { return this.svc.getMeal(id); }
}
