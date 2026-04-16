import { Injectable } from '@nestjs/common';
@Injectable()
export class DietaryService {
  async getRestrictions(cid: string) { return { restrictions: ['gluten_free', 'dairy_free'] }; }
  async updateRestrictions(cid: string, restrictions: string[]) { return { restrictions }; }
  async getAvoidList(cid: string) { return { avoidList: [] }; }
  async updateAvoidList(cid: string, avoidList: string[]) { return { avoidList }; }
}
